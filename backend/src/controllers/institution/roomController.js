// backend/src/controllers/institution/roomController.js

import mongoose from "mongoose";
import Room from "../../models/Room.js";
import Student from "../../models/student.js";
import Instructor from "../../models/instructor.js";
import { findInstitutionByIdOrName } from "./utils.js";
import { getDemoStore } from "../../demo/store.js";

// Get room details with populated students and instructors
export async function getRoomDetails(req, res) {
  console.log("=== GET ROOM DETAILS CALLED ===");
  console.log("Full URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("Params:", req.params);
  
  try {
    const { idOrName, roomId } = req.params;
    
    console.log("Extracted params - idOrName:", idOrName, "roomId:", roomId);

    // Validate roomId format
    if (!roomId || !mongoose.isValidObjectId(roomId)) {
      console.log("Invalid roomId format:", roomId);
      return res.status(400).json({ message: "Invalid room ID format." });
    }

    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const room = demo.rooms.find(r => r._id === roomId);
      if (!room) return res.status(404).json({ message: "Room not found." });
      const students = demo.students.filter(s => room.students.includes(s._id));
      const instructors = demo.instructors.filter(i => room.instructors.includes(i._id));
      return res.json({ ...room, students, instructors });
    }

    console.log("About to call findInstitutionByIdOrName");
    const inst = await findInstitutionByIdOrName(idOrName);
    console.log("findInstitutionByIdOrName result:", inst);
    
    if (!inst) {
      console.log("Institution not found:", idOrName);
      return res.status(404).json({ message: "Institution not found." });
    }
    
    console.log("Found institution:", inst.name);

    console.log("About to query room with ID:", roomId);
    const room = await Room.findById(roomId)
      .populate('students', 'name email')
      .populate('instructors', 'name email');
    
    console.log("Room query result:", room ? "Found room: " + room.room_name : "Not found");
    
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    console.log("Sending room data successfully");
    res.json(room);
  } catch (err) {
    console.error("Get room details error:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
}

// Remove student from room
export async function removeStudentFromRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Missing studentId." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    room.students = room.students.filter(id => id.toString() !== studentId);
    await room.save();

    res.json({ message: "Student removed from room successfully." });
  } catch (err) {
    console.error("Remove student from room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Remove instructor from room
export async function removeInstructorFromRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { instructorId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ message: "Missing instructorId." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    room.instructors = room.instructors.filter(id => id.toString() !== instructorId);
    await room.save();

    res.json({ message: "Instructor removed from room successfully." });
  } catch (err) {
    console.error("Remove instructor from room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Add student to room
export async function addStudentToRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing email." });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Check if already in room
    if (room.students.includes(student._id)) {
      return res.status(400).json({ message: "Student already in room." });
    }

    // Add to room
    room.students.push(student._id);
    await room.save();

    // Add room to student's rooms array
    if (!student.room.includes(roomId)) {
      student.room.push(roomId);
      await student.save();
    }

    res.json({ message: "Student added to room successfully." });
  } catch (err) {
    console.error("Add student to room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Add instructor to room
export async function addInstructorToRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing email." });
    }

    const instructor = await Instructor.findOne({ email });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Check if already in room
    if (room.instructors.includes(instructor._id)) {
      return res.status(400).json({ message: "Instructor already in room." });
    }

    // Add to room
    room.instructors.push(instructor._id);
    await room.save();

    // Add room to instructor's rooms array
    if (!instructor.rooms.includes(roomId)) {
      instructor.rooms.push(roomId);
      await instructor.save();
    }

    res.json({ message: "Instructor added to room successfully." });
  } catch (err) {
    console.error("Add instructor to room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}