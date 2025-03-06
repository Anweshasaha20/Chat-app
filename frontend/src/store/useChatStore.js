import instance from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  message: [],
  user: [],
  selectedUser: null,
  isMessageLoading: false,
  isUserLoading: false,
  isSendingLoading: false,

  getAllUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await instance.get("/messages/users");
      set({ user: res.data });
      // toast.success("User fetched successfully");
    } catch (error) {
      console.log("error in getAllUsers", error);
      toast.error(
        error.response?.data?.message || "User fetch failed! Please try again."
      );
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessage: async (id) => {
    set({ isMessageLoading: true });
    try {
      const res = await instance.get(`/messages/${id}`);
      // console.log("getmsg", res.data);
      set({ message: res.data });
      // toast.success("Message fetched successfully");
      // console.log(get().message);
      return res.data;
    } catch (error) {
      console.log("error in getMessage", error);
      toast.error(
        error.response?.data?.message ||
          "Message fetch failed! Please try again."
      );
    } finally {
      set({ isMessageLoading: false });
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  closeChat: () => set({ selectedUser: null }),
  sendMessage: async (data) => {
    const { selectedUser, message } = get();
    set({ isSendingLoading: true });
    try {
      const res = await instance.post(
        `/messages/send/${selectedUser._id}`,
        data
      );
      console.log(res.data);
      set({ message: [...message, res.data] });
      console.log("message", message);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Message send failed! Please try again."
      );
    } finally {
      set({ isSendingLoading: false });
      console.log(data);
    }
  },

  realTimeMessageOn: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (data) => {
      if (data.senderId !== selectedUser._id) return;
      set({ message: [...get().message, data] });
    });
  },
  realTimeMessageOff: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
