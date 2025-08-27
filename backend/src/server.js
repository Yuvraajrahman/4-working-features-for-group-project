//backend/src/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import rateLimiter from "./middlewares/rateLimiter.js";

import adminRoutes from "./routes/adminRoutes.js";
import institutionRoutes from "./routes/institutionRoutes.js";
import institutionRoomRoutes from "./routes/institution/InstitutionRoomRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import roomsRoutes from "./routes/roomsRoutes.js";
import forumContentRoutes from "./routes/forumContentRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import yuvrajAnnouncementRoutes from "./routes/yuvraj_announcementRoutes.js";
import yuvrajResourcesRoutes from "./routes/yuvraj_resourcesRoutes.js";
import yuvrajHelpdeskRoutes from "./routes/yuvraj_helpdeskRoutes.js";
import yuvrajPollsRoutes from "./routes/yuvraj_pollsRoutes.js";
import yuvrajSignupRoutes from "./routes/yuvraj_signupRoutes.js";
import { ensureAdminExists } from "./controllers/adminController.js";

const app = express();
const PORT = 5001;

// enable CORS for all origins
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

// parse JSON bodies
app.use(express.json());

// optional rate limiting (disabled for demo)
// app.use(rateLimiter);

// simple DB‐status check
app.get("/api/db-status", (req, res) => {
  const conn = mongoose.connection;
  res.json({
    readyState: conn.readyState,
    host:       conn.host,
    name:       conn.name,
    port:       conn.port,
    isAtlas:    conn.host?.includes("mongodb.net"),
    message:    conn.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Test download route
app.get("/api/test-download", (req, res) => {
  res.json({ message: "Download route is working" });
});

// mount your routers
app.use("/api/admin", adminRoutes);

// → Institutions (plural)
app.use("/api/institutions", institutionRoutes);

// → Nested “rooms” under an institution
app.use(
  "/api/institutions/:idOrName/rooms",
  institutionRoomRoutes
);

app.use("/api/instructors", instructorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/forum-content", forumContentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/submissions", submissionRoutes);

// Direct download route
app.get("/api/download/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { default: Submission } = await import("./models/Submission.js");
    const fs = await import("fs");
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (!fs.existsSync(submission.filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(submission.filePath, submission.fileName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/api/yuvraj/announcements", yuvrajAnnouncementRoutes);
app.use("/api/yuvraj/resources", yuvrajResourcesRoutes);
app.use("/api/yuvraj/helpdesk", yuvrajHelpdeskRoutes);
app.use("/api/yuvraj/polls", yuvrajPollsRoutes);
app.use("/api/yuvraj/signup", yuvrajSignupRoutes);

// connect to DB (or demo mode), then start the server
connectDB().then(async () => {
  if (global.__ATSEN_DEMO_NO_DB__) {
    console.warn("Running in DEMO mode without database connection.");
  } else {
    // Ensure admin user exists
    await ensureAdminExists();
  }
  
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});