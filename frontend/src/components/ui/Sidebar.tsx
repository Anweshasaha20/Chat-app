import { useEffect, useState } from "react";
//@ts-ignore
import { useChatStore } from "@/store/useChatStore";
import { UserIcon } from "@heroicons/react/24/outline";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const { getAllUsers, user, selectedUser, setSelectedUser, isUserLoading } =
    useChatStore();

  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Fetch all users from the API
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const filteredUsers = showOnlineOnly
    ? user.filter((u: any) => onlineUsers.includes(u._id))
    : user;

  if (isUserLoading) return <div>Loading...</div>; //TODO: display skeleton loader

  return (
    <div className="flex flex-col w-full p-4 bg-white border-r border-gray-300 h-full overflow-hidden">
      {/* Contacts Section */}
      <div className="p-4 bg-white border-gray-300">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-6 w-6 text-gray-700" />
          <span className="text-xl text-gray-700">Contacts</span>
        </div>

        {/* Toggle Online Users */}
        <div className="flex items-center space-x-2 mt-2 pb-2">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-500 cursor-pointer"
            checked={showOnlineOnly}
            onChange={() => setShowOnlineOnly(!showOnlineOnly)}
          />
          <span className="text-gray-700">Show Online Only</span>
        </div>
        <hr />

        {/* Users List */}
        <div className="flex flex-col mt-4 space-y-2 overflow-y-auto">
          {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
            filteredUsers.map((u: any) => {
              const isOnline = onlineUsers.includes(u._id); // Check if the user is online
              return (
                <div
                  key={u._id}
                  onClick={() => setSelectedUser(u)} // Set selected user when clicked
                  className={`flex items-center space-x-3 p-3 cursor-pointer rounded-md 
                  ${
                    selectedUser?._id === u._id
                      ? "bg-gray-200"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="h-12 w-12">
                    {u.profile_pic ? (
                      <img
                        src={u.profile_pic}
                        alt={u.name}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <span className="text-lg text-gray-700">{u.name}</span>
                    <div
                      className={`text-sm mt-1 ${
                        isOnline ? "text-green-500" : "text-gray-500"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500">No users available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
