// backend/src/controllers/institution/authController.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import Institution from "../../models/institution.js";
import { getDemoStore } from "../../demo/store.js";

// Utility to generate an 8‐digit unique loginId
async function generateLoginId() {
  let unique = false;
  let loginId;

  while (!unique) {
    loginId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const exists = await Institution.findOne({ loginId });
    if (!exists) unique = true;
  }

  return loginId;
}

// Ensure slug exists
async function ensureSlug(inst) {
  if (!inst.slug) {
    inst.slug = slugify(inst.name, { lower: true, strict: true });
    await inst.save();
  }
  return inst.slug;
}

// Register a new institution
export async function registerInstitution(req, res) {
  const { name, eiin, email, password, phone, address, description } = req.body;
  if (!name || !eiin || !email || !password) {
    return res.status(400).json({ message: "All required fields must be provided." });
  }

  try {
    // Check if we're in demo mode (no database)
    if (global.__ATSEN_DEMO_NO_DB__) {
      return res.status(503).json({ 
        message: "Registration is currently unavailable. Please use demo credentials: inst1@gmail.com / inst1" 
      });
    }

    const existing = await Institution.findOne({ $or: [{ eiin }, { email }] });
    if (existing) {
      return res.status(409).json({
        message: "Institution with same EIIN or Email already exists."
      });
    }

    const loginId = await generateLoginId();
    const hashed = await bcrypt.hash(password, 10);

    const inst = await Institution.create({
      name,
      eiin: eiin.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone,
      address,
      description,
      loginId
    });

    const slug = await ensureSlug(inst);

    return res.status(201).json({
      token: "demo-token",
      institution: { id: inst._id, slug, name: inst.name }
    });
  } catch (err) {
    console.error("Register institution error:", err);
    return res.status(500).json({ message: err.message });
  }
}

// Login an existing institution
export async function loginInstitution(req, res) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // First check if it's a demo user
    if (email === "inst1@gmail.com" && password === "inst1") {
      if (global.__ATSEN_DEMO_NO_DB__) {
        const demo = getDemoStore();
        const inst = demo.institution;
        return res.json({
          token: "demo-token",
          institution: { id: inst._id, slug: inst.slug, name: inst.name }
        });
      }

      // Find or create demo institution in DB
      let inst = await Institution.findOne({ email: "inst1@gmail.com" });
      if (!inst) {
        const hashed = await bcrypt.hash("inst1", 4);
        inst = await Institution.create({
          name: "Demo Institution",
          eiin: "DEMO01",
          email: "inst1@gmail.com",
          password: hashed,
          phone: "",
          address: "",
          description: "",
        });
      }

      const slug = await ensureSlug(inst);
      return res.json({
        token: "demo-token",
        institution: { id: inst._id, slug, name: inst.name }
      });
    }

    // If not demo user, check database for registered users
    if (global.__ATSEN_DEMO_NO_DB__) {
      return res.status(401).json({ message: "Database not available. Please use demo credentials." });
    }

    const inst = await Institution.findOne({ email: email.toLowerCase().trim() });
    if (!inst) {
      return res.status(401).json({ message: "Institution not found." });
    }

    const isValidPassword = await bcrypt.compare(password, inst.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const slug = await ensureSlug(inst);
    return res.json({
      token: "demo-token",
      institution: { id: inst._id, slug, name: inst.name }
    });

  } catch (err) {
    console.error("Login institution error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}