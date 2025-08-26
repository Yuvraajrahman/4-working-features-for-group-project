// backend/src/routes/studentRoutes.js

import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  getAllStudents,
  getStudentRooms
} from "../controllers/studentController.js";

const router = Router();

// GET  /api/students
router.get("/", getAllStudents);

// GET /api/students/:studentId/rooms
router.get("/:studentId/rooms", getStudentRooms);

// POST /api/students/register
router.post("/register", registerStudent);

// POST /api/students/login
router.post("/login",    loginStudent);

// Demo alias
router.post("/demo-login", loginStudent);

export default router;