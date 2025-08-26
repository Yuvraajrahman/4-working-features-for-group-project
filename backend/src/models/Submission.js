import mongoose from "mongoose";
const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    assessment: { 
      type: Schema.Types.ObjectId, 
      ref: "Assessment", 
      required: true 
    },
    student: { 
      type: Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
    fileName: { 
      type: String, 
      required: true 
    },
    filePath: { 
      type: String, 
      required: true 
    },
    comments: { 
      type: String, 
      default: "" 
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Ensure one submission per student per assessment
submissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;