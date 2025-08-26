import Submission from "../models/Submission.js";
import Assessment from "../models/Assessment.js";
import Student from "../models/student.js";
import Room from "../models/Room.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/submissions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadMiddleware = upload.single('file');

// Get all submissions for an assessment (teacher view)
export const getAssessmentSubmissions = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const submissions = await Submission.find({ assessment: assessmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    // Filter out submissions with null student references
    const validSubmissions = submissions.filter(submission => submission.student);

    res.json(validSubmissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current student info based on token
export const getCurrentStudent = async (req, res) => {
  console.log('getCurrentStudent called');
  console.log('Headers:', req.headers.authorization);
  
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Token extracted:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('No token, returning 401');
      return res.status(401).json({ message: "No token provided" });
    }
    
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (!decoded || !decoded.id) {
      console.log('Invalid token structure');
      return res.status(401).json({ message: "Invalid token" });
    }
    
    const student = await Student.findById(decoded.id).select('name email');
    console.log('Student found:', student);
    
    if (!student) {
      console.log('Student not found in database');
      return res.status(404).json({ message: "Student not found" });
    }
    
    console.log('Returning student data');
    res.json({ id: student._id, name: student.name, email: student.email });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get my submission for an assessment (student view)
export const getMySubmission = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    const submission = await Submission.findOne({ 
      assessment: assessmentId, 
      student: decoded.id 
    });

    if (!submission) {
      return res.status(404).json({ message: "No submission found" });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Submit work for an assessment
export const createSubmission = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { comments } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ 
      assessment: assessmentId, 
      student: decoded.id 
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: "Already submitted" });
    }

    const submission = new Submission({
      assessment: assessmentId,
      student: decoded.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      comments: comments || "",
      submittedAt: new Date()
    });

    const savedSubmission = await submission.save();
    res.status(201).json(savedSubmission);
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete all submissions
export const deleteAllSubmissions = async (req, res) => {
  try {
    await Submission.deleteMany({});
    res.json({ message: "All submissions deleted successfully" });
  } catch (error) {
    console.error("Error deleting submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Download submission file
export const downloadSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    console.log('Download request for submission ID:', submissionId);
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      console.log('Submission not found:', submissionId);
      return res.status(404).json({ message: "Submission not found" });
    }

    console.log('Found submission:', submission.fileName, 'at path:', submission.filePath);
    const filePath = submission.filePath;
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist at path:', filePath);
      return res.status(404).json({ message: "File not found" });
    }

    console.log('Sending file download for:', submission.fileName);
    res.download(filePath, submission.fileName);
  } catch (error) {
    console.error("Error downloading submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};