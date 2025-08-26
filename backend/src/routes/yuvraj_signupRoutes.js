import express from "express";
import YuvrajSignupRequest from "../models/yuvraj_SignupRequest.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

// Create signup request
router.post("/requests", async (req, res) => {
  const { role, name, email, institutionSlug } = req.body;
  if (!role || !name || !email || !institutionSlug) return res.status(400).json({ message: "Missing fields" });
  const created = await YuvrajSignupRequest.create({ role, name, email, institutionSlug });
  res.status(201).json(created);
});

// List requests for an institution (institution admin)
router.get("/requests/:institutionSlug", async (req, res) => {
  const list = await YuvrajSignupRequest.find({ institutionSlug: req.params.institutionSlug }).sort({ createdAt: -1 });
  res.json(list);
});

// Approve/reject
router.put("/requests/:id/status", yuvrajAdminOnly, async (req, res) => {
  const { status, note } = req.body;
  const updated = await YuvrajSignupRequest.findByIdAndUpdate(
    req.params.id,
    { status, note },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

export default router;


