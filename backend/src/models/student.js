import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true // Allow multiple null values, but unique non-null values
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please fill a valid email address"]
    },
    password: {
      type: String,
      required: true
    },
    // changed: institution is now an array so a student can belong to multiple institutions
    institutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution"
      }
    ],
    // changed: room is now an array so a student can belong to multiple rooms
    room: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);