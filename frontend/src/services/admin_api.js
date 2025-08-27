const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Dashboard stats
export async function getAdminStats() {
  const r = await fetch(`${API}/api/admin/stats`);
  if (!r.ok) throw new Error("Failed to get admin stats");
  return r.json();
}

// Institution management
export async function getAllInstitutions() {
  const r = await fetch(`${API}/api/admin/institutions`);
  if (!r.ok) throw new Error("Failed to get institutions");
  return r.json();
}

export async function deleteInstitution(institutionId) {
  const r = await fetch(`${API}/api/admin/institutions/${institutionId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Failed to delete institution");
  return r.json();
}

// Announcement management
export async function getAllAnnouncements() {
  const r = await fetch(`${API}/api/admin/announcements`);
  if (!r.ok) throw new Error("Failed to get announcements");
  return r.json();
}

export async function deleteAnnouncement(announcementId) {
  const r = await fetch(`${API}/api/admin/announcements/${announcementId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Failed to delete announcement");
  return r.json();
}

// Poll management
export async function getAllPolls() {
  const r = await fetch(`${API}/api/admin/polls`);
  if (!r.ok) throw new Error("Failed to get polls");
  return r.json();
}

export async function deletePoll(pollId) {
  const r = await fetch(`${API}/api/admin/polls/${pollId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Failed to delete poll");
  return r.json();
}

// Student management
export async function getAllStudents() {
  const r = await fetch(`${API}/api/admin/students`);
  if (!r.ok) throw new Error("Failed to get students");
  return r.json();
}

export async function deleteStudent(studentId) {
  const r = await fetch(`${API}/api/admin/students/${studentId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Failed to delete student");
  return r.json();
}

// Instructor management
export async function getAllInstructors() {
  const r = await fetch(`${API}/api/admin/instructors`);
  if (!r.ok) throw new Error("Failed to get instructors");
  return r.json();
}

export async function deleteInstructor(instructorId) {
  const r = await fetch(`${API}/api/admin/instructors/${instructorId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Failed to delete instructor");
  return r.json();
}

// Helpdesk management
export async function getAllHelpdeskRequests() {
  const r = await fetch(`${API}/api/admin/helpdesk`);
  if (!r.ok) throw new Error("Failed to get helpdesk requests");
  return r.json();
}

export async function deleteHelpdeskRequest(requestId) {
  const r = await fetch(`${API}/api/admin/helpdesk/${requestId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Failed to delete helpdesk request");
  return r.json();
}
