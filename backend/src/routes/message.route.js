import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import {
  getAllUsers,
  getMessage,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", verifyJWT, getAllUsers);
router.get("/:id", verifyJWT, getMessage);
router.post("/send/:id", verifyJWT, sendMessage);

export default router;
