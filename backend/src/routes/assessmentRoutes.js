import express from "express";
import {
  createAssessment,
  deleteAssessment,
  getAssessmentsByRoom,
  getAssessmentById,
  updateAssessment,
} from "../controllers/assessmentController.js";

const router = express.Router();

// Get all assessments for a specific room
router.get("/room/:roomId", getAssessmentsByRoom);

// Create a new assessment for a room
router.post("/room/:roomId", createAssessment);

// Update an assessment
router.put("/:id", updateAssessment);

// Get an assessment by ID
router.get("/:id", getAssessmentById);

// Delete an assessment
router.delete("/:id", deleteAssessment);

export default router;
