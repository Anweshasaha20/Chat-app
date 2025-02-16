import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Settings, User, LogOut } from "lucide-react";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";
export default function Navbar() {
  const { logout } = useAuthStore();

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Left: Chat Button */}
      <Button variant="ghost" asChild>
        <Link to="/" className="flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold">ChatApp</span>
        </Link>
      </Button>

      {/* Right: Navigation Buttons */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/settings" className="flex items-center gap-1">
            <Settings className="w-5 h-5" /> <span>Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/profile" className="flex items-center gap-1">
            <User className="w-5 h-5" /> <span>Profile</span>
          </Link>
        </Button>
        <Button variant="secondary" onClick={logout}>
          <LogOut className="w-5 h-5" /> <span>Logout</span>
        </Button>
      </div>
    </nav>
  );
}
