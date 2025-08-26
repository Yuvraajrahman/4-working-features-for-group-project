import express from "express";
import YuvrajAnnouncement from "../models/yuvraj_Announcement.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 7, 50);
  const { institutionSlug } = req.query;
  
  let query = {};
  if (institutionSlug) {
    query.institutionSlug = institutionSlug;
  }
  
  const items = await YuvrajAnnouncement.find(query)
    .sort({ pinned: -1, createdAt: -1 })
    .limit(limit);
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const item = await YuvrajAnnouncement.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
});

router.post("/", yuvrajAdminOnly, async (req, res) => {
  const created = await YuvrajAnnouncement.create(req.body);
  res.status(201).json(created);
});

router.put("/:id", yuvrajAdminOnly, async (req, res) => {
  const updated = await YuvrajAnnouncement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

router.delete("/:id", yuvrajAdminOnly, async (req, res) => {
  await YuvrajAnnouncement.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;


