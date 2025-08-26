// backend/src/controllers/institution/CreateRoomController.js

import mongoose from "mongoose";
import Institution from "../../models/institution.js";
import Room        from "../../models/Room.js";
import Instructor  from "../../models/instructor.js";
import { getDemoStore } from "../../demo/store.js";

/**
 * Inline helper to find an institution by ID, slug or case-insensitive name
 */
async function findInstitution(idOrName) {
  if (mongoose.Types.ObjectId.isValid(idOrName)) {
    return Institution.findById(idOrName);
  }
  return Institution.findOne({
    $or: [
      { slug: idOrName },
      { name: new RegExp(`^${idOrName}$`, "i") }
    ]
  });
}

/**
 * POST /api/institutions/:idOrName/add-room
 */
export async function createRoom(req, res) {
  try {
    const { idOrName } = req.params;
    const {
      room_name,
      description,
      maxCapacity,
      instructors = []
    } = req.body;

    // validate required fields
    if (!room_name) {
      return res.status(400).json({ message: "room_name is required" });
    }
    if (description == null) {
      return res.status(400).json({ message: "description is required" });
    }

    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const newRoom = {
        _id: `room-${Date.now()}`,
        room_name,
        description,
        maxCapacity,
        instructors: Array.isArray(instructors) ? instructors : [],
        institution: demo.institution._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demo.rooms.unshift(newRoom);
      return res.status(201).json(newRoom);
    }

    // lookup institution
    const inst = await findInstitution(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // create new room
    const room = await Room.create({
      room_name,
      description,
      maxCapacity,
      instructors: Array.isArray(instructors) ? instructors : [],
      institution: inst._id
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error("Error in createRoom:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: err.errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /api/institutions/:idOrName/rooms
 */
export async function listRooms(req, res) {
  try {
    const { idOrName } = req.params;
    const inst = await findInstitution(idOrName);

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const rooms = await Room.find({ institution: inst._id }).lean();
    console.log("=== LIST ROOMS DEBUG ===");
    console.log("Institution ID:", inst._id);
    console.log("Found rooms count:", rooms.length);
    rooms.forEach((room, index) => {
      console.log(`Room ${index}:`, {
        id: room._id,
        name: room.room_name,
        idType: typeof room._id,
        idLength: room._id?.toString().length
      });
    });
    return res.json(rooms);
  } catch (err) {
    console.error("Error in listRooms:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /api/institutions/:idOrName/instructors
 */
export async function getInstitutionInstructors(req, res) {
  try {
    const { idOrName } = req.params;
    const inst = await findInstitution(idOrName);

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // assumes Instructor schema has 'institutions: [ObjectId]'
    const instructors = await Instructor
      .find({ institutions: inst._id })
      .lean();

    return res.json(instructors);
  } catch (err) {
    console.error("Error in getInstitutionInstructors:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}