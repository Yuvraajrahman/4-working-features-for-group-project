// src/controllers/auth.js

import bcrypt from "bcryptjs";
import Instructor from "../models/instructor.js";
import Room from "../models/Room.js";
import { getDemoStore } from "../demo/store.js";

// Register instructor
export async function registerInstructor(req, res) {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if we're in demo mode (no database)
    if (global.__ATSEN_DEMO_NO_DB__) {
      return res.status(503).json({ 
        message: "Registration is currently unavailable. Please use demo credentials: instructor1@gmail.com / instructor1" 
      });
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create instructor record with empty institutions array (can be assigned later)
    const instr = await Instructor.create({
      name,
      email,
      password: hashed,
      institutions: [] // Initialize with empty array
    });

    // Return minimal payload
    res
      .status(201)
      .json({ token: "demo-token", instructor: { id: instr._id, name: instr.name } });
  } catch (err) {
    console.error("Instructor register error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

// Login instructor
export async function loginInstructor(req, res) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // First check if it's a demo user
    if (email === "instructor1@gmail.com" && password === "instructor1") {
      if (global.__ATSEN_DEMO_NO_DB__) {
        const demo = getDemoStore();
        const instr = demo.instructors[0]; // Use demo instructor
        return res.json({ token: "demo-token", instructor: { id: instr._id, name: instr.name } });
      }

      // Find or create demo instructor in database
      let instr = await Instructor.findOne({ email: "instructor1@gmail.com" });
      if (!instr) {
        const hashed = await bcrypt.hash("instructor1", 4);
        instr = await Instructor.create({
          name: "Demo Instructor",
          email: "instructor1@gmail.com",
          password: hashed,
          institutions: []
        });
      }

      return res.json({ token: "demo-token", instructor: { id: instr._id, name: instr.name } });
    }

    // If not demo user, check database for registered users
    if (global.__ATSEN_DEMO_NO_DB__) {
      return res.status(401).json({ message: "Database not available. Please use demo credentials." });
    }

    const instr = await Instructor.findOne({ email: email.toLowerCase().trim() });
    if (!instr) {
      return res.status(401).json({ message: "Instructor not found. Please sign up first." });
    }

    const isValidPassword = await bcrypt.compare(password, instr.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // No approval check needed - signup is automatic

    // Populate institution data for frontend use
    const instructorWithInstitutions = await Instructor.findById(instr._id).populate('institutions', 'name slug');
    const primaryInstitution = instructorWithInstitutions.institutions[0]; // Use first institution

    return res.json({ 
      token: "demo-token", 
      instructor: { 
        id: instr._id, 
        name: instr.name, 
        email: instr.email,
        institutionSlug: primaryInstitution?.slug,
        institutionName: primaryInstitution?.name
      } 
    });

  } catch (err) {
    console.error("Instructor login error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

// Get rooms assigned to an instructor
export async function getInstructorRooms(req, res) {
  try {
    const { instructorId } = req.params;
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const rooms = demo.rooms
        .filter(r => r.instructors.includes(instructorId))
        .map(r => ({
          ...r,
          students: demo.students.filter(s => r.students.includes(s._id)),
          instructors: demo.instructors.filter(i => r.instructors.includes(i._id)),
        }));
      return res.json(rooms);
    }

    const rooms = await Room.find({ instructors: instructorId })
      .populate('students', 'name email')
      .populate('instructors', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(rooms);
  } catch (err) {
    console.error("Get instructor rooms error:", err);
    res.status(500).json({ message: "Server error." });
  }
}