// backend/src/controllers/institution/utils.js

import mongoose from "mongoose";
import Institution from "../../models/institution.js";
import { getDemoStore } from "../../demo/store.js";

// Helper to find institution by _id, loginId, or slug
export const findInstitutionByIdOrName = async (idOrName) => {
  try {
    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      return demo.institution;
    }
    console.log("findInstitutionByIdOrName called with:", idOrName);
    
    if (mongoose.isValidObjectId(idOrName)) {
      console.log("Searching by ObjectId");
      const byId = await Institution.findById(idOrName).lean();
      if (byId) {
        console.log("Found by ID:", byId.name);
        return byId;
      }
    }

    console.log("Searching by slug");
    const bySlug = await Institution
      .findOne({ slug: new RegExp(`^${idOrName}$`, "i") })
      .lean();
    if (bySlug) {
      console.log("Found by slug:", bySlug.name);
      return bySlug;
    }

    console.log("Searching by name");
    const byName = await Institution
      .findOne({ name: new RegExp(`^${idOrName}$`, "i") })
      .lean();
    if (byName) {
      console.log("Found by name:", byName.name);
      return byName;
    }
    
    console.log("Institution not found");
    return null;
  } catch (err) {
    console.error("Error in findInstitutionByIdOrName:", err);
    throw err;
  }
};