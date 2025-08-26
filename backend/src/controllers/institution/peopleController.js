// backend/src/controllers/institution/peopleController.js

import mongoose from "mongoose";
import Student from "../../models/student.js";
import Instructor from "../../models/instructor.js";
import Institution from "../../models/institution.js";
import { findInstitutionByIdOrName } from "./utils.js";
import { getDemoStore } from "../../demo/store.js";

// List all instructors attached to an institution
export async function getInstitutionInstructors(req, res) {
  try {
    const { idOrName } = req.params;
    const { search = "" } = req.query;

    if (!idOrName) {
      return res
        .status(400)
        .json({ message: "idOrName parameter is required" });
    }

    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const term = search.trim().toLowerCase();
      const list = demo.instructors.filter(i =>
        !term || i.name.toLowerCase().includes(term)
      );
      return res.json(list);
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;
    const term = search.trim();

    const filter = {
      institutions: instId
    };

    if (term) {
      filter.name = { $regex: term, $options: "i" };
    }

    const list = await Instructor.find(filter).lean();
    return res.json(list);
  } catch (err) {
    console.error("Get instructors error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// List all students attached to an institution
export async function getInstitutionStudents(req, res) {
  try {
    const { idOrName } = req.params;
    const { search = "" } = req.query;

    if (!idOrName) {
      return res.status(400).json({ message: "idOrName parameter is required" });
    }

    if (global.__ATSEN_DEMO_NO_DB__) {
      const demo = getDemoStore();
      const term = search.trim().toLowerCase();
      const list = demo.students.filter(s =>
        !term || s.name.toLowerCase().includes(term)
      );
      return res.json(list);
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;
    const term = search.trim();

    const filter = {
      institutions: instId
    };

    if (term) {
      filter.name = { $regex: term, $options: "i" };
    }

    const list = await Student.find(filter, "-password").lean();
    return res.json(list);
  } catch (err) {
    console.error("Get students error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Add an instructor to an institution
export async function addInstructorToInstitution(req, res) {
  const { idOrName } = req.params;
  const { instructorId } = req.body;

  try {
    let instFilter;
    if (mongoose.isValidObjectId(idOrName)) {
      instFilter = { _id: idOrName };
    } else {
      instFilter = {
        $or: [
          { loginId: idOrName },
          { slug: idOrName }
        ]
      };
    }

    const inst = await Institution.findOne(instFilter);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const ins = await Instructor.findById(instructorId);
    if (!ins) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    const instObjectId = inst._id.toString();
    if (ins.institutions?.map(id => id.toString()).includes(instObjectId)) {
      return res.status(400).json({ message: "Instructor already linked to this institution." });
    }

    ins.institutions = ins.institutions || [];
    ins.institutions.push(inst._id);
    await ins.save();

    return res.status(200).json({ message: "Instructor added to institution." });
  } catch (err) {
    console.error("Add instructor error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Add student to institution
export async function addStudent(req, res) {
  const { idOrName } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Missing studentId." });
  }

  try {
    const inst = await findInstitutionByIdOrName(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const alreadyLinked = (student.institutions || [])
      .map(id => id.toString())
      .includes(inst._id.toString());

    if (alreadyLinked) {
      return res.status(400).json({ message: "Student already linked to this institution." });
    }

    student.institutions = student.institutions || [];
    student.institutions.push(inst._id);
    await student.save();

    res.json({ message: "Student added to institution successfully." });
  } catch (err) {
    console.error("Add student error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Remove student from institution
export async function removeStudent(req, res) {
  const { idOrName } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Missing studentId." });
  }

  try {
    const inst = await findInstitutionByIdOrName(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.institutions = (student.institutions || [])
      .filter(id => id.toString() !== inst._id.toString());
    await student.save();

    res.json({ message: "Student removed from institution successfully." });
  } catch (err) {
    console.error("Remove student error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Remove instructor from institution
export async function removeInstructor(req, res) {
  const { idOrName } = req.params;
  const { instructorId } = req.body;

  if (!instructorId) {
    return res.status(400).json({ message: "Missing instructorId." });
  }

  try {
    const inst = await findInstitutionByIdOrName(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    instructor.institutions = (instructor.institutions || [])
      .filter(id => id.toString() !== inst._id.toString());
    await instructor.save();

    res.json({ message: "Instructor removed from institution successfully." });
  } catch (err) {
    console.error("Remove instructor error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}