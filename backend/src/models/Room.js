import mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    room_name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "institutions",
      required: false
    },
    maxCapacity: {
      type: Number,
      default: 30,
      min: 1
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student"
      }
    ],
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Instructor"
      }
    ],

    createTime: {
      type: Date,
      required: true,
      default: Date.now 

    }
  },
  {
    timestamps: true
  }
);

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
export default Room;