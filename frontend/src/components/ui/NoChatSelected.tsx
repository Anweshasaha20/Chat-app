import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline"; // Importing a chat bubble icon from Heroicons

export default function NoChatSelected() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center overflow-hidden">
      {/* Chat Icon */}
      <ChatBubbleLeftIcon className="h-12 w-12 text-gray-500" />

      {/* No Chat Selected Text */}
      <h2 className="text-xl font-semibold text-gray-700 mt-4">
        Welcome to Chat App!
      </h2>
      <p className="text-gray-500 mt-2">
        Please select a chat from the sidebar to start the conversation.
      </p>
    </div>
  );
}
