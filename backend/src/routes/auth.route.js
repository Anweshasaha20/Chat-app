import express from "express";
import {
  signUp,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logout);

router.patch("/update-profile", verifyJWT, updateProfile);

router.get("/check", verifyJWT, checkAuth);

export default router;
