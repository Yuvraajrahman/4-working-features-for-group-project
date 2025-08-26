import express from "express";
import {
  createMaterial,
  deleteMaterial,
  getMaterialsByRoom,
  updateMaterial,
  toggleMaterialExpansion,
} from "../controllers/materialController.js";

const router = express.Router();

router.get("/room/:roomId", getMaterialsByRoom);
router.post("/room/:roomId", createMaterial);
router.put("/:id", updateMaterial);
router.delete("/:id", deleteMaterial);
router.patch("/:id/toggle", toggleMaterialExpansion);

export default router;
