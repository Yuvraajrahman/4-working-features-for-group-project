import mongoose from "mongoose";

const YuvrajResourceItemSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "YuvrajResourceCourse", required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "youtube",
        "slides",
        "text",
        "pdf",
        "doc",
        "sheet",
        "link",
      ],
      required: true,
    },
    url: { type: String },
    content: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const YuvrajResourceCourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export const YuvrajResourceItem =
  mongoose.models.YuvrajResourceItem ||
  mongoose.model("YuvrajResourceItem", YuvrajResourceItemSchema);

const YuvrajResourceCourse =
  mongoose.models.YuvrajResourceCourse ||
  mongoose.model("YuvrajResourceCourse", YuvrajResourceCourseSchema);

export default YuvrajResourceCourse;


