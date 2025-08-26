import express from "express";
import {
  loginAdmin,
  getPendingInstitutions,
  approveInstitution
} from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/admin/login
router.post("/login", loginAdmin);

// Protected routes (verifyToken is a no-op in demo mode)
router.get(
  "/institutions/pending",
  verifyToken,
  getPendingInstitutions
);

router.post(
  "/institutions/:id/approve",
  verifyToken,
  approveInstitution
);

export default router;