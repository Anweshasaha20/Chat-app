import { useState, useEffect, useRef } from "react";
//@ts-ignore
import { useChatStore } from "@/store/useChatStore";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Send, Image as ImageIcon, X, Phone, Video } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import instance from "@/lib/axios";

export default function ChatContainer() {
  const {
    selectedUser,
    message,
    sendMessage,
    closeChat,
    isMessageLoading,
    getMessage,
    isSendingLoading,
    realTimeMessageOn,
    realTimeMessageOff,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProfilePhotoOpen, setIsProfilePhotoOpen] = useState(false);

  useEffect(() => {
    if (messageEndRef.current && message) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  // Fetch messages when a user is selected
  useEffect(() => {
    getMessage(selectedUser?._id);
    realTimeMessageOn();
    return () => realTimeMessageOff();
  }, [selectedUser?._id, getMessage, realTimeMessageOn, realTimeMessageOff]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({ message: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
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

 const navigate = useNavigate();
 const socket = useAuthStore.getState().socket;
  const handleVoiceCall = () => {
    toast("Voice calling feature coming soon");
  };

 const handleVideoCall = async () => {
  if (!selectedUser?._id || !authUser?.userId || !socket) return;

  try {
    const res = await instance.post("/calls/create", {
      participants: [authUser.userId, selectedUser._id],
    });

    const { roomId } = res.data;

    socket.emit("call:invite", {
      to: selectedUser._id,
      from: authUser.userId,
      roomId,
    });

    navigate(`/call/${roomId}`);
  } catch (error) {
    console.error("Error starting call:", error);
    toast.error("Could not start video call");
  }
};

  const isSelectedUserOnline =
    !!selectedUser?._id && Array.isArray(onlineUsers)
      ? onlineUsers.includes(selectedUser._id)
      : false;

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageDate = (timestamp: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (isMessageLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-white shadow-lg rounded-lg max-h-[calc(100vh-120px)] ">
      {/*   need to give a max height or else the scrolling will not work
     <div className="flex-1 flex flex-col overflow-auto max-h-[calc(100vh-120px)]"> */}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-gray-200 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          {selectedUser?.profile_pic ? (
            <button
              type="button"
              onClick={() => setIsProfilePhotoOpen(true)}
              className="rounded-full shrink-0"
            >
              <img
                src={selectedUser.profile_pic}
                alt={selectedUser?.name || "User"}
                className="h-11 w-11 rounded-full object-cover border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition"
              />
            </button>
          ) : (
            <div className="h-11 w-11 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold shrink-0">
              {selectedUser?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              {selectedUser?.name || "Chat"}
            </p>
            <p
              className={`text-xs ${
                isSelectedUserOnline ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              {isSelectedUserOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleVoiceCall}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            aria-label="Voice call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleVideoCall}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            aria-label="Video call"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            onClick={closeChat}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            aria-label="Close chat"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-5 space-y-2 max-h-[calc(100vh-120px)] bg-slate-50 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.18)_1px,transparent_0)] bg-[size:18px_18px]">
        {message?.map((msg: any, index: number) => {
          const isMine = msg.senderId === authUser?.userId;
          const previousMsg = index > 0 ? message[index - 1] : null;
          const showDateSeparator =
            !previousMsg ||
            formatMessageDate(previousMsg?.createdAt) !==
              formatMessageDate(msg?.createdAt);

          return (
            <div key={index}>
              {showDateSeparator && msg?.createdAt && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] font-medium text-gray-600 bg-white/90 border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                    {formatMessageDate(msg.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col gap-1.5 px-3 py-2.5 max-w-[78%] shadow-sm ${
                    isMine
                      ? "bg-gray-900 text-white rounded-2xl rounded-br-md"
                      : "bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Sent image"
                      className="w-full max-w-[280px] h-auto rounded-xl object-cover"
                    />
                  )}

                  {msg.message && (
                    <p className="leading-relaxed text-[15px] break-words whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  )}

                  {msg.createdAt && (
                    <span
                      className={`text-[11px] self-end ${
                        isMine ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Input Box - Always Visible */}
      <div className="px-3 py-3 border-t border-gray-200 bg-white sticky bottom-0 w-full md:px-4">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-1">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
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

        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-2 py-1.5 shadow-sm">
          <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ImageIcon className="h-5 w-5 text-gray-600" />
          </label>

          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-transparent px-1 py-2 outline-none text-[15px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSendingLoading) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={isSendingLoading}
            className="p-2.5 bg-gray-900 text-white rounded-full hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4 rotate-45" />
          </button>
        </div>
      </div>

      {isProfilePhotoOpen && selectedUser?.profile_pic && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setIsProfilePhotoOpen(false)}
        >
          <div
            className="relative bg-white rounded-xl p-3 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsProfilePhotoOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedUser.profile_pic}
              alt={selectedUser?.name || "Profile"}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <p className="text-center mt-2 font-medium text-gray-700">
              {selectedUser?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
