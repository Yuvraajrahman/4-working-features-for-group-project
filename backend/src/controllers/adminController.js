import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Institution from "../models/institution.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";
import YuvrajAnnouncement from "../models/yuvraj_Announcement.js";
import YuvrajPoll from "../models/yuvraj_Poll.js";
import { YuvrajHelpdeskRequest } from "../models/yuvraj_Helpdesk.js";

// Create the default admin user if it doesn't exist
export async function ensureAdminExists() {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await Admin.create({
        name: "System Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
      });
      console.log("Default admin user created: admin@gmail.com / admin");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
}

// Login admin
export async function loginAdmin(req, res) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found." });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password." });
    }

    return res.json({
      token: "admin-token",
      admin: { 
        id: admin._id, 
        name: admin.name, 
        email: admin.email,
        role: 'admin'
      }
    });

  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get all institutions with stats
export async function getAllInstitutions(req, res) {
  try {
    const institutions = await Institution.find({}).select('-password').sort({ createdAt: -1 });
    
    // Get stats for each institution
    const institutionsWithStats = await Promise.all(
      institutions.map(async (inst) => {
        const studentCount = await Student.countDocuments({ institutions: inst._id });
        const instructorCount = await Instructor.countDocuments({ institutions: inst._id });
        const announcementCount = await YuvrajAnnouncement.countDocuments({ institutionSlug: inst.slug });
        const pollCount = await YuvrajPoll.countDocuments({ institutionSlug: inst.slug });
        
        return {
          ...inst.toObject(),
          stats: {
            students: studentCount,
            instructors: instructorCount,
            announcements: announcementCount,
            polls: pollCount
          }
        };
      })
    );

    return res.json(institutionsWithStats);
  } catch (err) {
    console.error("Get institutions error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Delete institution and all associated data
export async function deleteInstitution(req, res) {
  try {
    const { institutionId } = req.params;
    
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // Delete all associated data
    await Student.deleteMany({ institutions: institutionId });
    await Instructor.deleteMany({ institutions: institutionId });
    await YuvrajAnnouncement.deleteMany({ institutionSlug: institution.slug });
    await YuvrajPoll.deleteMany({ institutionSlug: institution.slug });
    await YuvrajHelpdeskRequest.deleteMany({ institutionSlug: institution.slug });
    
    // Delete the institution itself
    await Institution.findByIdAndDelete(institutionId);

    return res.json({ message: "Institution and all associated data deleted successfully." });
  } catch (err) {
    console.error("Delete institution error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get all announcements across all institutions
export async function getAllAnnouncements(req, res) {
  try {
    const announcements = await YuvrajAnnouncement.find({})
      .populate('institutionId', 'name slug')
      .sort({ createdAt: -1 });
    
    return res.json(announcements);
  } catch (err) {
    console.error("Get announcements error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Delete announcement
export async function deleteAnnouncement(req, res) {
  try {
    const { announcementId } = req.params;
    
    await YuvrajAnnouncement.findByIdAndDelete(announcementId);
    return res.json({ message: "Announcement deleted successfully." });
  } catch (err) {
    console.error("Delete announcement error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get all polls/surveys across all institutions
export async function getAllPolls(req, res) {
  try {
    const polls = await YuvrajPoll.find({})
      .sort({ createdAt: -1 });
    
    return res.json(polls);
  } catch (err) {
    console.error("Get polls error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Delete poll/survey
export async function deletePoll(req, res) {
  try {
    const { pollId } = req.params;
    
    await YuvrajPoll.findByIdAndDelete(pollId);
    return res.json({ message: "Poll deleted successfully." });
  } catch (err) {
    console.error("Delete poll error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get all students across all institutions
export async function getAllStudents(req, res) {
  try {
    const students = await Student.find({})
      .populate('institutions', 'name slug')
      .populate('room', 'room_name')
      .select('-password')
      .sort({ createdAt: -1 });
    
    return res.json(students);
  } catch (err) {
    console.error("Get students error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get all instructors across all institutions  
export async function getAllInstructors(req, res) {
  try {
    const instructors = await Instructor.find({})
      .populate('institutions', 'name slug')
      .populate('rooms', 'room_name')
      .select('-password')
      .sort({ createdAt: -1 });
    
    return res.json(instructors);
  } catch (err) {
    console.error("Get instructors error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Delete student
export async function deleteStudent(req, res) {
  try {
    const { studentId } = req.params;
    
    await Student.findByIdAndDelete(studentId);
    return res.json({ message: "Student deleted successfully." });
  } catch (err) {
    console.error("Delete student error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Delete instructor
export async function deleteInstructor(req, res) {
  try {
    const { instructorId } = req.params;
    
    await Instructor.findByIdAndDelete(instructorId);
    return res.json({ message: "Instructor deleted successfully." });
  } catch (err) {
    console.error("Delete instructor error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get all helpdesk requests
export async function getAllHelpdeskRequests(req, res) {
  try {
    const requests = await YuvrajHelpdeskRequest.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    return res.json(requests);
  } catch (err) {
    console.error("Get helpdesk requests error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Delete helpdesk request
export async function deleteHelpdeskRequest(req, res) {
  try {
    const { requestId } = req.params;
    
    await YuvrajHelpdeskRequest.findByIdAndDelete(requestId);
    return res.json({ message: "Helpdesk request deleted successfully." });
  } catch (err) {
    console.error("Delete helpdesk request error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Get dashboard stats
export async function getDashboardStats(req, res) {
  try {
    const stats = {
      totalInstitutions: await Institution.countDocuments({}),
      totalStudents: await Student.countDocuments({}),
      totalInstructors: await Instructor.countDocuments({}),
      totalAnnouncements: await YuvrajAnnouncement.countDocuments({}),
      totalPolls: await YuvrajPoll.countDocuments({}),
      totalHelpdeskRequests: await YuvrajHelpdeskRequest.countDocuments({})
    };
    
    return res.json(stats);
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}