import bcrypt from "bcryptjs";
import Student from "../models/student.js";
import Room from "../models/Room.js";
import { getDemoStore } from "../demo/store.js";

// Register student
export async function registerStudent(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if we're in demo mode (no database)
    if (global.__ATSEN_DEMO_NO_DB__) {
      return res.status(503).json({ 
        message: "Registration is currently unavailable. Please use demo credentials: student1@gmail.com / student1" 
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const stud = await Student.create({
      name,
      email,
      password: hashed,
    });

    return res
      .status(201)
      .json({ token: "demo-token", student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Login student
export async function loginStudent(req, res) {
  const { email, password } = req.body;

  try {
    // First check if it's a demo user
    if (email === "student1@gmail.com" && password === "student1") {
      if (global.__ATSEN_DEMO_NO_DB__) {
        const demo = getDemoStore();
        const stud = demo.students[0]; // Use demo student
        return res.json({ token: "demo-token", student: { id: stud._id, name: stud.name } });
      }

      // Find or create demo student in database
      let stud = await Student.findOne({ email: "student1@gmail.com" });
      if (!stud) {
        const hashed = await bcrypt.hash("student1", 4);
        stud = await Student.create({
          name: "Demo Student",
          email: "student1@gmail.com",
          password: hashed,
        });
      }

      return res.json({ token: "demo-token", student: { id: stud._id, name: stud.name } });
    }

    // If not demo user, check database for registered users
    if (global.__ATSEN_DEMO_NO_DB__) {
      return res.status(401).json({ message: "Database not available. Please use demo credentials." });
    }

    const stud = await Student.findOne({ email: email.toLowerCase().trim() });
    if (!stud) {
      return res.status(401).json({ message: "Student not found." });
    }

    const isValidPassword = await bcrypt.compare(password, stud.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Check approval status
    try {
      const { default: SignupRequest } = await import("../models/yuvraj_SignupRequest.js");
      const approved = await SignupRequest.findOne({ role: "student", email: stud.email, status: "approved" });
      if (!approved) {
        return res.status(403).json({ message: "Signup pending approval by institution" });
      }
    } catch (e) {
      console.warn("Signup approval check skipped:", e?.message);
    }

    return res.json({ token: "demo-token", student: { id: stud._id, name: stud.name } });

  } catch (err) {
    console.error("Student login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getAllStudents(req, res) {
  try {
    // exclude passwords
    const students = await Student.find({}, "-password");
    return res.status(200).json(students);
  } catch (err) {
    console.error("getAllStudents error:", err);
    return res.status(500).json({ message: err.message });
  }
}

// Get student's enrolled rooms
export async function getStudentRooms(req, res) {
  try {
    const { studentId } = req.params;
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const rooms = demo.rooms.filter(r => r.students.includes(studentId));
      return res.json(rooms);
    }
    
    const student = await Student.findById(studentId).populate({
      path: 'room',
      select: 'room_name description createdAt'
    });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    return res.json(student.room || []);
  } catch (err) {
    console.error("getStudentRooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

