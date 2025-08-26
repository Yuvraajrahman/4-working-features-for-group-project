import mongoose from "mongoose";
const { Schema } = mongoose;

const materialSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    section: { 
      type: String, 
      required: true, 
      enum: ['course_materials', 'reference_books', 'articles_research'] 
    },
    fileType: { 
      type: String, 
      required: true,
      enum: ['link', 'text']
    },
    fileUrl: { type: String, required: false, default: "" },
    fileName: { type: String, required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "instructors",
      required: false,
      default: undefined
    },
    isExpanded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);
export default Material;
