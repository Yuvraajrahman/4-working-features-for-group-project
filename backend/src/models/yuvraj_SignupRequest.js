import mongoose from "mongoose";

const YuvrajSignupRequestSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["student", "instructor"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    institutionSlug: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    note: { type: String },
  },
  { timestamps: true }
);

const YuvrajSignupRequest =
  mongoose.models.YuvrajSignupRequest ||
  mongoose.model("YuvrajSignupRequest", YuvrajSignupRequestSchema);

export default YuvrajSignupRequest;


