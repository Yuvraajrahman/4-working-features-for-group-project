import express from "express";
import {
  loginAdmin,
  getAllInstitutions,
  deleteInstitution,
  getAllStudents,
  deleteStudent,
  getAllInstructors,
  deleteInstructor,
  getAllAnnouncements,
  deleteAnnouncement,
  getAllPolls,
  deletePoll,
  getAllHelpdeskRequests,
  deleteHelpdeskRequest,
  getDashboardStats
} from "../controllers/adminController.js";

const router = express.Router();

// Auth routes
router.post("/login", loginAdmin);

// Dashboard stats
router.get("/stats", getDashboardStats);

// Institution management
router.get("/institutions", getAllInstitutions);
router.delete("/institutions/:institutionId", deleteInstitution);

// Student management
router.get("/students", getAllStudents);
router.delete("/students/:studentId", deleteStudent);

// Instructor management
router.get("/instructors", getAllInstructors);
router.delete("/instructors/:instructorId", deleteInstructor);

// Announcement management
router.get("/announcements", getAllAnnouncements);
router.delete("/announcements/:announcementId", deleteAnnouncement);

// Poll management
router.get("/polls", getAllPolls);
router.delete("/polls/:pollId", deletePoll);

// Helpdesk management
router.get("/helpdesk", getAllHelpdeskRequests);
router.delete("/helpdesk/:requestId", deleteHelpdeskRequest);

export default router;