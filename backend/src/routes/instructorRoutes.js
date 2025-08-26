// backend/src/routes/instructorRoutes.js
import { Router } from "express";
import {
  registerInstructor,
  loginInstructor,
  getInstructorRooms
} from "../controllers/instructorController.js";

import Instructor from "../models/instructor.js";  // ← import model

const router = Router();

router.post("/register", registerInstructor);
router.post("/login", loginInstructor);

// Demo alias
router.post("/demo-login", loginInstructor);


router.get("/", async (req, res) => {
  try {
    const instructors = await Instructor.find({}, "name email"); // optional projection
    res.json(instructors);
  } catch (err) {
    console.error("Failed to fetch instructors:", err);
    res.status(500).json({ message: "Could not fetch instructors." });
  }
});

router.get("/:instructorId/rooms", getInstructorRooms);

export default router;