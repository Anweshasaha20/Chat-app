import { useState, useEffect, useRef } from "react";
//@ts-ignore
import { useChatStore } from "@/store/useChatStore";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Send, Image as ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ChatContainer() {
  const {
    selectedUser,
    message,
    sendMessage,
    closeChat,
    isMessageLoading,
    getMessage,
    isSendingLoading,
  } = useChatStore();

  // console.log("message", message);
  // console.log("user", selectedUser);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messageEndRef.current && message) {
      messageEndRef.current.scrollIntoView();
    }
  }, [message]);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessage(selectedUser._id);
  }, [selectedUser?._id, getMessage]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({ message: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      await getMessage(selectedUser?._id);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (isMessageLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-white shadow-lg rounded-lg max-h-[calc(100vh-120px)] ">
      {/*   need to give a max height or else the scrolling will not work
     <div className="flex-1 flex flex-col overflow-auto max-h-[calc(100vh-120px)]"> */}
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-200 border-b">
        <span className="ml-3 text-lg font-semibold text-gray-800">
          {selectedUser?.name || "Chat"}
        </span>
        <button
          onClick={closeChat}
          className="p-2 text-gray-600 hover:text-gray-800 transition"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-120px)]">
        {message?.map((msg: any, index: number) => (
          <div
            key={index}
            className={`flex ${
              msg.receiverId === selectedUser?._id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`flex flex-col p-2 rounded-lg max-w-[75%]  ${
                msg.receiverId === selectedUser?._id
                  ? "bg-black text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {/* Render Image If Exists */}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Sent image"
                  className="mt-1 w-full max-w-[300px] h-auto rounded-lg object-cover mx-auto"
                />
              )}
              {/* Render Text Message */}
              {msg.message && (
                <p className="pb-2 pt-2 break-words">{msg.message}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Input Box - Always Visible */}
      <div className="p-4 border-t bg-white sticky bottom-0 w-full ">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-400"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-center border rounded-lg p-2 bg-white ">
          {/* Image Upload Button */}
          <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ImageIcon className="h-6 w-6 text-gray-600" />
          </label>

          {/* Message Input */}
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isSendingLoading}
            className="ml-2 p-2 bg-black text-white rounded-full hover:bg-gray-900 transition"
          >
            <Send className="h-5 w-5 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
