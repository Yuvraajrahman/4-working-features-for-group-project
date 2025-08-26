// backend/src/routes/institution/InstitutionRoomRoutes.js

import express from "express";
import {
  createRoom,
  listRooms
} from "../../controllers/institution/CreateRoomController.js";

import {
  getRoomDetails,
  removeStudentFromRoom,
  removeInstructorFromRoom,
  addStudentToRoom,
  addInstructorToRoom
} from "../../controllers/institution/roomController.js";

const router = express.Router({ mergeParams: true });

// GET  /api/institutions/:idOrName/rooms
router.get("/", listRooms);

// POST /api/institutions/:idOrName/rooms
router.post("/", createRoom);
router.post("/add-room", createRoom);

// Room details and management
router.get("/:roomId", getRoomDetails);
router.post("/:roomId/add-student", addStudentToRoom);
router.post("/:roomId/add-instructor", addInstructorToRoom);
router.post("/:roomId/remove-student", removeStudentFromRoom);
router.post("/:roomId/remove-instructor", removeInstructorFromRoom);



export default router;