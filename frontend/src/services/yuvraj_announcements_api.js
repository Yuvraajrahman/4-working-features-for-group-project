const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListAnnouncements(limit = 7) {
  const r = await fetch(`${API}/api/yuvraj/announcements?limit=${limit}`);
  if (!r.ok) throw new Error("Failed to list announcements");
  const data = await r.json();
  return data.map((d) => ({ ...d, id: d.id || d._id }));
}

export async function yuvrajGetAnnouncementById(id) {
  const r = await fetch(`${API}/api/yuvraj/announcements/${id}`);
  if (!r.ok) throw new Error("Failed to get announcement");
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function yuvrajCreateAnnouncement(body) {
  const r = await fetch(`${API}/api/yuvraj/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create announcement");
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function yuvrajUpdateAnnouncement(id, body) {
  const r = await fetch(`${API}/api/yuvraj/announcements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to update announcement");
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function yuvrajDeleteAnnouncement(id) {
  const r = await fetch(`${API}/api/yuvraj/announcements/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
    },
  });
  if (!r.ok) throw new Error("Failed to delete announcement");
  return true;
}


