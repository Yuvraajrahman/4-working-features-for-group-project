import mongoose from "mongoose";

const YuvrajPollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    kind: { type: String, enum: ["poll", "qna", "evaluation"], default: "poll" },
    options: [
      {
        id: { type: String },
        label: { type: String },
      },
    ],
    // For evaluation
    targetInstructorId: { type: String },
    targetInstructorName: { type: String },
    // Scoping
    createdFor: { type: String, enum: ["institution", "room", "global"], default: "institution" },
    targetRoomId: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    createdFor: { type: String, enum: ["institution", "course", "room", "global"], default: "institution" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const YuvrajPollResponseSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: "YuvrajPoll", required: true },
    studentId: { type: String, required: true },
    studentName: { type: String },
    optionId: { type: String },
    textAnswer: { type: String },
    targetInstructorId: { type: String },
    satisfactionLevel: { type: Number, min: 1, max: 10 },
    contentDeliveryRating: { type: Number, min: 1, max: 10 },
    recommendations: { type: String },
  },
  { timestamps: true }
);

export const YuvrajPollResponse =
  mongoose.models.YuvrajPollResponse ||
  mongoose.model("YuvrajPollResponse", YuvrajPollResponseSchema);

const YuvrajPoll =
  mongoose.models.YuvrajPoll ||
  mongoose.model("YuvrajPoll", YuvrajPollSchema);

export default YuvrajPoll;


