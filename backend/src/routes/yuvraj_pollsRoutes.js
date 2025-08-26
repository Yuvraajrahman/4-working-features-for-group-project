import express from "express";
import YuvrajPoll, { YuvrajPollResponse } from "../models/yuvraj_Poll.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";
import Room from "../models/Room.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const polls = await YuvrajPoll.find().sort({ createdAt: -1 });
  res.json(polls);
});

router.post("/", yuvrajAdminOnly, async (req, res) => {
  // body: { title, description, kind, options?, targetInstructorId?, targetInstructorName?, createdFor?, targetRoomId? }
  const created = await YuvrajPoll.create(req.body);
  res.status(201).json(created);
});

router.get("/:id", async (req, res) => {
  const poll = await YuvrajPoll.findById(req.params.id);
  if (!poll) return res.status(404).json({ message: "Not found" });
  const responses = await YuvrajPollResponse.find({ pollId: poll._id });
  res.json({ poll, responses });
});

router.post("/:id/vote", async (req, res) => {
  const { studentId, studentName, optionId, textAnswer, targetInstructorId, satisfactionLevel, contentDeliveryRating, recommendations } = req.body;
  const pollId = req.params.id;
  const poll = await YuvrajPoll.findById(pollId);
  if (!poll) return res.status(404).json({ message: "Not found" });
  if (poll.createdFor === 'room' && poll.targetRoomId) {
    try {
      const room = await Room.findById(poll.targetRoomId).select('students');
      if (!room) return res.status(404).json({ message: "Room not found" });
      const isMember = (room.students || []).some((sid) => String(sid) === String(studentId));
      if (!isMember) return res.status(403).json({ message: "Not permitted to respond to this poll" });
    } catch (e) {
      return res.status(500).json({ message: "Room membership check failed" });
    }
  }
  const existing = await YuvrajPollResponse.findOne({ pollId, studentId: String(studentId) });
  if (existing) return res.status(400).json({ message: "Already submitted" });
  const created = await YuvrajPollResponse.create({ 
    pollId, 
    studentId: String(studentId), 
    studentName, 
    optionId, 
    textAnswer, 
    targetInstructorId: targetInstructorId ? String(targetInstructorId) : undefined,
    satisfactionLevel,
    contentDeliveryRating,
    recommendations
  });
  res.status(201).json(created);
});

export default router;


