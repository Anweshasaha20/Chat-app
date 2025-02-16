import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import ProfilePage from "./pages/profilePage";
//@ts-ignore
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Loader from "./components/ui/Loader";
function App() {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth && !authUser) {
    //modify
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />
        //it is seen only by logged in users
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
