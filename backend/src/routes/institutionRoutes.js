// backend/src/routes/institutionRoutes.js

import { Router } from "express";
// Auth
import {
  registerInstitution,
  loginInstitution
} from "../controllers/institution/authController.js";

// Dashboard
import {
  getInstitutionDashboard
} from "../controllers/institution/dashboardController.js";

// People management
import {
  getInstitutionInstructors,
  getInstitutionStudents,
  addInstructorToInstitution,
  addStudent,
  removeStudent,
  removeInstructor
} from "../controllers/institution/peopleController.js";



// Settings
import {
  updateInstitutionSettings
} from "../controllers/institution/settingsController.js";
import Institution from "../models/institution.js";

const router = Router();

// List all institutions (for signup selection)
router.get("/", async (req, res) => {
  try {
    const list = await Institution.find({}, "name slug");
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Failed to list institutions" });
  }
});

// Register and login
router.post("/register", registerInstitution);
router.post("/login",    loginInstitution);

// Convenience demo login endpoint for clarity
router.post("/demo-login", loginInstitution);

// List instructors for an institution
router.get("/:idOrName/instructors", getInstitutionInstructors);

// List students for an institution
router.get("/:idOrName/students", getInstitutionStudents);

// Add an instructor to an institution
router.post("/:idOrName/add-instructor", addInstructorToInstitution);

// Fetch dashboard data
router.get("/:idOrName/dashboard", getInstitutionDashboard);

// Update institution settings
router.put("/:idOrName/settings", updateInstitutionSettings);

router.post("/:idOrName/add-student", addStudent);
router.post("/:idOrName/remove-student", removeStudent);
router.post("/:idOrName/remove-instructor", removeInstructor);



export default router;