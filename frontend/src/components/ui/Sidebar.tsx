import { useEffect } from "react";
//@ts-ignore
import { useChatStore } from "@/store/useChatStore";
import { UserIcon } from "@heroicons/react/24/outline";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const { getAllUsers, user, selectedUser, setSelectedUser, isUserLoading } =
    useChatStore();

  const { onlineUsers } = useAuthStore();

  // Fetch all users from the API
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  if (isUserLoading) return <div>Loading...</div>; //TODO: display skeleton loader

  return (
    <div className="flex flex-col w-full p-4 bg-white border-r border-gray-300 h-full overflow-hidden">
      {/* Contacts Section */}
      <div className="p-4 bg-white border-gray-300">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-6 w-6 text-gray-700" />
          <span className="text-xl text-gray-700">Contacts</span>
        </div>
        {/* TODO: toggle online users */}
        <div className="flex items-center space-x-2 mt-2 pb-2">
          <input type="checkbox" className="h-4 w-4 text-blue-500" />
          <span className="text-gray-700">Show Online Only</span>
        </div>
        <hr />

        {/* Users List */}
        <div className="flex flex-col mt-4 space-y-2 overflow-y-auto">
          {Array.isArray(user) && user.length > 0 ? (
            user.map((user: any) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)} // Set selected user when clicked
                className={`flex items-center space-x-3 p-3 cursor-pointer rounded-md 
                ${
                  selectedUser?._id === user._id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="h-12 w-12">
                  {user.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt={user.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-300 rounded-full"></div> // fallback if no profile picture
                  )}
                </div>
                {/* Larger avatar */}
                <span className="text-lg text-gray-700">{user.name}</span>{" "}
                {/* Larger font */}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Loading users...</div>
          )}
        </div>
      </div>
    </div>
  );
}
