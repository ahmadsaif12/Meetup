import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createMeeting,
  getMeetings,
  getUserSessions,
  getSessionDetails,
  getMeetingStats,
} from "../controllers/meetingController.js";

const router = Router();

// Meeting CRUD
router.post("/", protect, createMeeting);
router.get("/stats", protect, getMeetingStats);
router.get("/user/sessions", protect, getUserSessions);
router.get("/session/:meetingId", protect, getSessionDetails);
router.get("/:meetingId", protect, getMeetings);

export default router;
