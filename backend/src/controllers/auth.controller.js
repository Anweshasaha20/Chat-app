import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const signUp = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      name,
    });
    if (user) {
      //generating jwt token
      const token = generateToken(user._id, res);
      await user.save();
      return res.status(201).json({
        message: "User created successfully",
        userId: user._id,
        Name: user.name,
        email: user.email,
        profile_pic: user.profile_pic,
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    generateToken(user._id, res);
    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      Name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    //base64 image
    const { profile_pic } = req.body;
    const userid = req.user._id;
    if (!profile_pic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    const uploadRes = await cloudinary.uploader.upload(profile_pic);
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      { profile_pic: uploadRes.secure_url },
      { new: true }
    );
    console.log(updatedUser.profile_pic);
    return res.status(200).json({
      message: "Profile updated successfully",
      profile_pic: uploadRes.secure_url,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // res.send(req.user);

    const { _id, ...rest } = req.user.toObject ? req.user.toObject() : req.user;

    res.json({ userId: _id, ...rest });
    // console.log("req.user", req.user);
  } catch (error) {
    res.status(400).json({ message: "not authorized" });
  }
};
