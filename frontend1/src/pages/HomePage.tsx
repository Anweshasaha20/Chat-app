import Navbar from "../components/ui/Navbar";
//@ts-ignore
import { useChatStore } from "@/store/useChatStore";
import Sidebar from "../components/ui/Sidebar";
import ChatContainer from "../components/ui/ChatContainer";
import NoChatSelected from "../components/ui/NoChatSelected";
import { UserIcon } from "@heroicons/react/24/outline"; // Importing icons

export default function HomePage() {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col bg-gray-100 px-14 py-10">
        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 bg-white border-r overflow-hidden">
            <Sidebar />
          </div>

          {/* Chat Container */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
}
