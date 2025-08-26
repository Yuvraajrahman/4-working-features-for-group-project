import express from "express";
import { YuvrajHelpdeskRequest, YuvrajConsultationSlot } from "../models/yuvraj_Helpdesk.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

// Consultation slots (managed by instructors)
router.get("/consultation-slots", async (req, res) => {
  const slots = await YuvrajConsultationSlot.find().sort({ weekday: 1, startMinutes: 1 });
  res.json(slots);
});

router.post("/consultation-slots", yuvrajAdminOnly, async (req, res) => {
  const created = await YuvrajConsultationSlot.create(req.body);
  res.status(201).json(created);
});

// Helpdesk requests
router.get("/requests", async (req, res) => {
  const list = await YuvrajHelpdeskRequest.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post("/requests", async (req, res) => {
  const created = await YuvrajHelpdeskRequest.create(req.body);
  res.status(201).json(created);
});

router.put("/requests/:id/status", async (req, res) => {
  const updated = await YuvrajHelpdeskRequest.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, $push: { timeline: req.body.timelineEntry || {} } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

export default router;


