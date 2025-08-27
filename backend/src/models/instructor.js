import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    instructorId: {
      type: String,
      unique: true,
      sparse: true // Allow multiple null values, but unique non-null values
    },
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    // Array of institution references
    institutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution"
      }
    ],

    // Array of room references
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Instructor", instructorSchema);