import express from "express";
import YuvrajSignupRequest from "../models/yuvraj_SignupRequest.js";
import Instructor from "../models/instructor.js";
import Student from "../models/student.js";
import Institution from "../models/institution.js";
import bcrypt from "bcryptjs";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

// Create user directly (no approval needed)
router.post("/requests", async (req, res) => {
  try {
    const { role, name, email, institutionSlug } = req.body;
    if (!role || !name || !email || !institutionSlug) return res.status(400).json({ message: "Missing fields" });
    
    // Find the institution
    const institution = await Institution.findOne({ slug: institutionSlug });
    if (!institution) {
      return res.status(400).json({ message: "Institution not found" });
    }

    // Create password (use the name as password for simplicity)
    const defaultPassword = name.toLowerCase().replace(/\s+/g, '');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    if (role === "instructor") {
      // Check if instructor already exists
      const existingInstructor = await Instructor.findOne({ email: email.toLowerCase().trim() });
      if (existingInstructor) {
        return res.status(400).json({ message: "Instructor with this email already exists" });
      }
      
      // Try creating instructor with retry for ID conflicts
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          // Generate unique instructorId with better uniqueness
          const instructorId = `INS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.floor(Math.random() * 10000)}`;
          
          const newInstructor = await Instructor.create({
            instructorId,
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            institutions: [institution._id],
            rooms: []
          });
          console.log(`✅ Created instructor directly: ${newInstructor.name} (${newInstructor.email}) with ID: ${instructorId}`);
          return res.status(201).json({ message: "Instructor account created successfully", user: newInstructor });
        } catch (createError) {
          if (createError.code === 11000 && createError.keyPattern?.instructorId) {
            attempts++;
            console.log(`⚠️  Instructor ID collision, retrying... (attempt ${attempts})`);
            continue;
          }
          throw createError; // Re-throw if it's not an instructorId collision
        }
      }
      
      return res.status(500).json({ message: "Failed to generate unique instructor ID after multiple attempts" });
      
    } else if (role === "student") {
      // Check if student already exists
      const existingStudent = await Student.findOne({ email: email.toLowerCase().trim() });
      if (existingStudent) {
        return res.status(400).json({ message: "Student with this email already exists" });
      }
      
      // Try creating student with retry for ID conflicts
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          // Generate unique studentId with better uniqueness
          const studentId = `STU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.floor(Math.random() * 10000)}`;
          
          const newStudent = await Student.create({
            studentId,
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            institutions: [institution._id],
            room: []
          });
          console.log(`✅ Created student directly: ${newStudent.name} (${newStudent.email}) with ID: ${studentId}`);
          return res.status(201).json({ message: "Student account created successfully", user: newStudent });
        } catch (createError) {
          if (createError.code === 11000 && createError.keyPattern?.studentId) {
            attempts++;
            console.log(`⚠️  Student ID collision, retrying... (attempt ${attempts})`);
            continue;
          }
          throw createError; // Re-throw if it's not a studentId collision
        }
      }
      
      return res.status(500).json({ message: "Failed to generate unique student ID after multiple attempts" });
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (error) {
    console.error("Direct signup error:", error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      if (error.keyPattern?.studentId) {
        return res.status(500).json({ message: "Database error: Student ID conflict. Please try again." });
      }
      if (error.keyPattern?.instructorId) {
        return res.status(500).json({ message: "Database error: Instructor ID conflict. Please try again." });
      }
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: "User with this email already exists." });
      }
    }
    
    res.status(500).json({ message: "Server error during signup. Please try again." });
  }
});

// List requests for an institution (institution admin)
router.get("/requests/:institutionSlug", async (req, res) => {
  const list = await YuvrajSignupRequest.find({ institutionSlug: req.params.institutionSlug }).sort({ createdAt: -1 });
  res.json(list);
});

// Approve/reject
router.put("/requests/:id/status", yuvrajAdminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    // Get the signup request first
    const request = await YuvrajSignupRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    console.log(`Processing ${status} for ${request.role}: ${request.name} (${request.email})`);

    // Update the request status
    const updated = await YuvrajSignupRequest.findByIdAndUpdate(
      req.params.id,
      { status, note },
      { new: true }
    );

    // If approved, create the actual user account
    if (status === "approved") {
      console.log(`Creating ${request.role} account for: ${request.name}`);
      
      // Find the institution by slug
      const institution = await Institution.findOne({ slug: request.institutionSlug });
      if (!institution) {
        console.error(`❌ Institution not found for slug: ${request.institutionSlug}`);
        return res.status(400).json({ message: "Institution not found" });
      }

      console.log(`Found institution: ${institution.name} (${institution._id})`);

      // Create password (use the name as password for simplicity)
      const defaultPassword = request.name.toLowerCase().replace(/\s+/g, '');
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      if (request.role === "instructor") {
        // Check if instructor already exists
        const existingInstructor = await Instructor.findOne({ email: request.email });
        if (existingInstructor) {
          console.log(`⚠️ Instructor already exists: ${request.email}`);
          // Add institution to existing instructor if not already there
          if (!existingInstructor.institutions.includes(institution._id)) {
            existingInstructor.institutions.push(institution._id);
            await existingInstructor.save();
            console.log(`✅ Added institution to existing instructor: ${request.email}`);
          }
        } else {
          try {
            const newInstructor = await Instructor.create({
              name: request.name,
              email: request.email,
              password: hashedPassword,
              institutions: [institution._id],
              phone: "",
              address: ""
            });
            console.log(`✅ Created instructor: ${newInstructor.name} (${newInstructor.email})`);
          } catch (createError) {
            if (createError.code === 11000) {
              // Duplicate key error - try to find and update existing instructor
              console.log(`⚠️ Duplicate key error for instructor ${request.email}, trying to update existing record`);
              const existingInstructor = await Instructor.findOne({ email: request.email });
              if (existingInstructor && !existingInstructor.institutions.includes(institution._id)) {
                existingInstructor.institutions.push(institution._id);
                await existingInstructor.save();
                console.log(`✅ Updated existing instructor: ${request.email}`);
              }
            } else {
              throw createError; // Re-throw if it's not a duplicate key error
            }
          }
        }
      } else if (request.role === "student") {
        // Check if student already exists
        const existingStudent = await Student.findOne({ email: request.email });
        if (existingStudent) {
          console.log(`⚠️ Student already exists: ${request.email}`);
          // Add institution to existing student if not already there
          if (!existingStudent.institutions.includes(institution._id)) {
            existingStudent.institutions.push(institution._id);
            await existingStudent.save();
            console.log(`✅ Added institution to existing student: ${request.email}`);
          }
        } else {
          try {
            const newStudent = await Student.create({
              name: request.name,
              email: request.email,
              password: hashedPassword,
              institutions: [institution._id], // Use institutions array instead of institution
              room: [],
              phone: "",
              address: ""
            });
            console.log(`✅ Created student: ${newStudent.name} (${newStudent.email})`);
          } catch (createError) {
            if (createError.code === 11000) {
              // Duplicate key error - try to find and update existing student
              console.log(`⚠️ Duplicate key error for student ${request.email}, trying to update existing record`);
              const existingStudent = await Student.findOne({ email: request.email });
              if (existingStudent && !existingStudent.institutions.includes(institution._id)) {
                existingStudent.institutions.push(institution._id);
                await existingStudent.save();
                console.log(`✅ Updated existing student: ${request.email}`);
              }
            } else {
              throw createError; // Re-throw if it's not a duplicate key error
            }
          }
        }
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ Approval error:", error);
    res.status(500).json({ 
      message: "Server error during approval", 
      error: error.message 
    });
  }
});

export default router;


