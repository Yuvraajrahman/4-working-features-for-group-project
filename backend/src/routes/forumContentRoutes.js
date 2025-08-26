import express from "express";
import {
  createForumContent,
  deleteForumContent,
  getForumContentByRoom,
  updateForumContent,
  togglePinForumContent,
} from "../controllers/forumContentController.js";

const router = express.Router();

// Get all forum content for a specific room
router.get("/room/:roomId", getForumContentByRoom);

// Create a new forum content item for a room
router.post("/room/:roomId", createForumContent);

// Update a forum content item
router.put("/:id", updateForumContent);

// Delete a forum content item
router.delete("/:id", deleteForumContent);

// Toggle pin status of a forum content item
router.patch("/:id/pin", togglePinForumContent);

export default router;
