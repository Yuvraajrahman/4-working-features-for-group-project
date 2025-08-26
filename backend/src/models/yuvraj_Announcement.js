import mongoose from "mongoose";

const yuvrajAnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    author: { type: String, default: "Admin" },
    pinned: { type: Boolean, default: false },
    announcementType: { type: String, default: "general", enum: ["general", "event", "academic", "urgent", "payment", "registration"] },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
    institutionSlug: { type: String, required: true },
  },
  { timestamps: true }
);

yuvrajAnnouncementSchema.index({ institutionSlug: 1, pinned: -1, createdAt: -1 });

const YuvrajAnnouncement = mongoose.model(
  "YuvrajAnnouncement",
  yuvrajAnnouncementSchema
);

export default YuvrajAnnouncement;


