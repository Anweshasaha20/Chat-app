import express from "express";
import { createCallRoom } from "../controllers/call.controller.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.post("/create", verifyJWT, createCallRoom);

export default router;