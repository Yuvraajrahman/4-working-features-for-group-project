// backend/models/Institution.js

import mongoose from "mongoose";
import slugify from "slugify";

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    eiin: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    // human-friendly URL slug
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // legacy or internal ID, if you still need it
    loginId: {
      type: String,
      required: false,
      unique: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    },

    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      }
    ]
  },
  {
    collection: "institutions",
    timestamps: true // auto-manages createdAt & updatedAt
  }
);

// Auto-generate a URL-safe slug from the institution name
institutionSchema.pre("validate", async function () {
  if (!this.isModified("name")) return;

  // base slug
  let raw = slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });

  // ensure uniqueness by appending a counter if needed
  let uniqueSlug = raw;
  let count = 0;
  while (
    await mongoose.models.Institution.exists({ slug: uniqueSlug, _id: { $ne: this._id } })
  ) {
    count += 1;
    uniqueSlug = `${raw}-${count}`;
  }

  this.slug = uniqueSlug;
});

export default mongoose.model("Institution", institutionSchema);