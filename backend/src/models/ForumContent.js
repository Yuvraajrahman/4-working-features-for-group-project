import mongoose from "mongoose";
const { Schema } = mongoose;

const forumContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    contentType: {
      type: String,
      enum: ['announcement', 'discussion'],
      default: 'announcement'
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

const ForumContent = mongoose.models.ForumContent || mongoose.model("ForumContent", forumContentSchema);
export default ForumContent;
