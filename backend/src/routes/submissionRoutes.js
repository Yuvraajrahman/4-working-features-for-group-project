import express from "express";
import {
  getAssessmentSubmissions,
  getMySubmission,
  createSubmission,
  downloadSubmission,
  uploadMiddleware,
  getCurrentStudent,
  deleteAllSubmissions
} from "../controllers/submissionController.js";

const router = express.Router();

// Get all submissions for an assessment (teacher view)
router.get("/:assessmentId/submissions", getAssessmentSubmissions);

// Get current student info
router.get("/current-student", getCurrentStudent);

// Get my submission for an assessment (student view)
router.get("/:assessmentId/my-submission", getMySubmission);

// Submit work for an assessment
router.post("/:assessmentId/submit", uploadMiddleware, createSubmission);

// Delete all submissions
router.delete("/delete-all", deleteAllSubmissions);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Submission routes working" });
});

// Download submission file
router.get("/download/:submissionId", downloadSubmission);

export default router;