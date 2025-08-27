import mongoose from "mongoose";

const YuvrajHelpdeskRequestSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    assigneeType: { type: String, enum: ["instructor", "institution"], required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId },
    // Institution filtering
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    institutionSlug: { type: String },
    category: {
      type: String,
      enum: [
        "consultation",
        "administration",
        "complaint",
        "payment",
        "technical",
        "course",
        "instructor",
        "other",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "accepted", "processing", "rejected", "resolved"], default: "pending" },
    timeline: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
        by: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const YuvrajConsultationSlotSchema = new mongoose.Schema(
  {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    weekday: { type: Number, min: 0, max: 6, required: true },
    startMinutes: { type: Number, required: true },
    endMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export const YuvrajHelpdeskRequest =
  mongoose.models.YuvrajHelpdeskRequest ||
  mongoose.model("YuvrajHelpdeskRequest", YuvrajHelpdeskRequestSchema);

export const YuvrajConsultationSlot =
  mongoose.models.YuvrajConsultationSlot ||
  mongoose.model("YuvrajConsultationSlot", YuvrajConsultationSlotSchema);


