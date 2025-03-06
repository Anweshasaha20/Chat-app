import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllUsers = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const allUsers = await User.find({ _id: { $ne: currentUser } }).select(
      "-password"
    );
    res.status(200).json(allUsers);
  } catch (error) {
    console.log("error in getAllUsers", error);
    res.status(400).json({ message: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: userToChat } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChat },
        { senderId: userToChat, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessage", error);
    res.status(400).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const message = req.body.message;
    const image = req.body.image;

    if (!message.trim() && !image) {
      return res.status(400).json({ message: "Message is required" });
    }
    let imageUrl;
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      image: imageUrl,
    });
    await newMessage.save();
    //todo: realtime functionality goes here =>socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log("receiverSocketId", receiverSocketId);
      console.log("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage", error);
    res.status(400).json({ message: error.message });
  }
};
