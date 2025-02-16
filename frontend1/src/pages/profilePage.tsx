import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FiCamera } from "react-icons/fi";
import Navbar from "@/components/ui/Navbar";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      await updateProfile({
        profile_pic: base64,
      });
    };
  };

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
        <Card className="w-[600px] p-10 shadow-lg rounded-2xl bg-white">
          <CardContent className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-3xl font-semibold text-gray-800">Profile</h2>
              <p className="text-sm text-gray-600">Your Profile Information</p>
            </div>

            <div className="relative">
              <Avatar className="w-36 h-36">
                <AvatarImage
                  src={
                    image ||
                    authUser?.profile_pic ||
                    "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
                  }
                  alt="Profile"
                />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-pic"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200"
              >
                <FiCamera size={26} color="#4B5563" />
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUpdatingProfile}
                className="hidden"
                id="profile-pic"
              />
            </div>

            <div className="w-full">
              <Label>Name</Label>
              <Input
                value={authUser?.name || "John Doe"}
                readOnly
                className="cursor-not-allowed"
              />
            </div>
            <div className="w-full">
              <Label>Email</Label>
              <Input
                value={authUser?.email || "johndoe@gmail.com"}
                readOnly
                className="cursor-not-allowed"
              />
            </div>
            <div className="w-full flex-col">
              <h1 className="text-xl font-medium text-gray-800 pb-4">
                Additional Information
              </h1>
              <div className="w-full flex justify-between border-b pb-2">
                <span className="text-gray-700 font-medium">Member Since</span>
                <span className="text-gray-900 ml-4">12 Jan 2022</span>
              </div>
              <div className="w-full flex justify-between mt-2">
                <span className="text-gray-700 font-medium">
                  Account Status
                </span>
                <span className="text-green-500 font-semibold ml-4">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
