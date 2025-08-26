// backend/controllers/roomsController.js
import axios from "axios";
import dotenv from "dotenv";

import { json } from "express";
import Room from "../models/Room.js";
import { getDemoStore } from "../demo/store.js";

dotenv.config();

export async function getAllRooms(req, res) {
  try {
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      return res.status(200).json(demo.rooms);
    }
    const rooms = await Room.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getAllRooms controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function getRoomById(req, res) {
  try {
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const room = demo.rooms.find(r => r._id === req.params.id);
      if (!room) return res.status(404).json({ message: "Room not found!" });
      return res.status(200).json(room);
    }
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found!" });
    res.status(200).json(room);
  } catch (error) {
    console.error("Error in getRoomById controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function createRoom(req, res) {
  try {
    const { room_name, description, instructorId } = req.body;
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const newRoom = {
        _id: `room-${Date.now()}`,
        room_name,
        description,
        institution: demo.institution._id,
        maxCapacity: 30,
        students: [],
        instructors: instructorId ? [instructorId] : [demo.instructors[0]._id], // Add the creating instructor
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demo.rooms.unshift(newRoom);
      return res.status(201).json(newRoom);
    }
    const room = new Room({ 
      room_name, 
      description,
      instructors: instructorId ? [instructorId] : [] // Add instructor if provided
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Error in createRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateRoom(req, res) {
  try {
    const { room_name, description } = req.body;
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const idx = demo.rooms.findIndex(r => r._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: "Room not found" });
      demo.rooms[idx] = { ...demo.rooms[idx], room_name, description, updatedAt: new Date().toISOString() };
      return res.status(200).json(demo.rooms[idx]);
    }
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { room_name, description },
      { new: true }
    );

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error in updateRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteRoom(req, res) {
  try {
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const initial = demo.rooms.length;
      demo.rooms = demo.rooms.filter(r => r._id !== req.params.id);
      if (demo.rooms.length === initial) return res.status(404).json({ message: "Room not found" });
      return res.status(200).json({ message: "Room deleted successfully!" });
    }
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom)
      return res.status(404).json({ message: "Room not found" });
    res.status(200).json({ message: "Room deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getZoomAccessToken() {
  const tokenUrl = "https://zoom.us/oauth/token";


  const basicAuth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const { data } = await axios.post(
    `${tokenUrl}?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    null,
    { headers: { Authorization: `Basic ${basicAuth}` } }
  );

  return data.access_token; // valid ~1 hour
}

export async function createMeeting(req, res) {
  const { id: roomId } = req.params;
  try {
    if (global.__ATSEN_DEMO_NO_DB__) {
      // In demo mode, just return a fake Zoom URL
      return res.status(201).json({
        meetingId: `demo-${Date.now()}`,
        join_url: "https://zoom.us/j/00000000000?pwd=demo",
      });
    }
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // ⬇ Replace generateZoomToken() with OAuth token fetch
    const accessToken = await getZoomAccessToken();

    const { data } = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: `Room ${roomId} Live Session`,
        type: 1, // instant meeting
        settings: {
          host_video: true,
          participant_video: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(201).json({
      meetingId: data.id,
      join_url: data.join_url
    });

  } catch (err) {
    console.error("Zoom API error status:", err.response?.status);
    console.error("Zoom API error body:", err.response?.data);
    res.status(500).json({
      message: "Failed to create Zoom meeting",
      zoomError: err.response?.data || err.message
    });
  }
}


