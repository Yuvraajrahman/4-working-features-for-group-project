// backend/src/controllers/institution/settingsController.js

import Institution from "../../models/institution.js";
import { findInstitutionByIdOrName } from "./utils.js";

// Update institution settings
export const updateInstitutionSettings = async (req, res) => {
  try {
    const { idOrName } = req.params;
    if (!idOrName) {
      return res.status(400).json({ message: "idOrName parameter is required" });
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const { name, email, phone, address, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (description !== undefined) updates.description = description;

    const updated = await Institution.findByIdAndUpdate(
      institution._id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    return res.json(updated);
  } catch (err) {
    console.error("Update settings error:", err);
    return res.status(500).json({ message: "Failed to update institution settings" });
  }
};