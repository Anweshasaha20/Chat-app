import instance from "@/lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],

  isCheckingAuth: true,
  checkAuth: async () => {
    try {
      const res = await instance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
      console.log("error in checkAuth", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await instance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed! Please try again."
      );
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await instance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed! Please try again."
      );
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await instance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error); // Debugging
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred";
      toast.error(errorMessage);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await instance.patch("/auth/update-profile", data);
      set((state) => {
        // Preserve the previous user data and update only the profile_pic
        const updatedUser = {
          ...state.authUser,
          profile_pic: res.data.profile_pic,
        };
        return { authUser: updatedUser };
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Profile update failed! Please try again."
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
