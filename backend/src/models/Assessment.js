import mongoose from "mongoose";
const { Schema } = mongoose;

const assessmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, default: "" },
    topics: [{ type: String, trim: true }], // Array of topics
    date: { type: Date, required: true },
    assessmentType: {
      type: String,
      required: true,
      enum: ['final_exam', 'mid_term_exam', 'quiz', 'assignment', 'project']
    },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    isPermanent: { type: Boolean, default: false } // For final_exam and mid_term_exam
  },
  { timestamps: true }
);

const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);
export default Assessment;
