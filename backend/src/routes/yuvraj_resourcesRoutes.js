import express from "express";
import YuvrajResourceCourse, { YuvrajResourceItem } from "../models/yuvraj_Resource.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

// Courses
router.get("/courses", async (req, res) => {
  const courses = await YuvrajResourceCourse.find().sort({ createdAt: -1 });
  res.json(courses);
});

router.post("/courses", yuvrajAdminOnly, async (req, res) => {
  const created = await YuvrajResourceCourse.create(req.body);
  res.status(201).json(created);
});

router.put("/courses/:courseId", yuvrajAdminOnly, async (req, res) => {
  const updated = await YuvrajResourceCourse.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

router.delete("/courses/:courseId", yuvrajAdminOnly, async (req, res) => {
  await YuvrajResourceItem.deleteMany({ courseId: req.params.courseId });
  await YuvrajResourceCourse.findByIdAndDelete(req.params.courseId);
  res.json({ ok: true });
});

// Items by course
router.get("/courses/:courseId/items", async (req, res) => {
  const items = await YuvrajResourceItem.find({ courseId: req.params.courseId }).sort({ order: 1, createdAt: -1 });
  res.json(items);
});

router.post("/courses/:courseId/items", yuvrajAdminOnly, async (req, res) => {
  const created = await YuvrajResourceItem.create({ ...req.body, courseId: req.params.courseId });
  res.status(201).json(created);
});

router.put("/courses/:courseId/items/:itemId", yuvrajAdminOnly, async (req, res) => {
  const updated = await YuvrajResourceItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

router.delete("/courses/:courseId/items/:itemId", yuvrajAdminOnly, async (req, res) => {
  await YuvrajResourceItem.findByIdAndDelete(req.params.itemId);
  res.json({ ok: true });
});

export default router;


