// Yuvraj-local announcements service (frontend-only)
// Stores announcements in localStorage for now. Replace with real API later.

const STORAGE_KEY = "yuvraj_announcements_v1";
const ROLE_KEY = "yuvraj_role";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStore(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function yuvrajGetRole() {
  return localStorage.getItem(ROLE_KEY) || "student"; // student | instructor | admin
}

export function yuvrajSetRole(role) {
  localStorage.setItem(ROLE_KEY, role);
}

export async function yuvrajSeedIfEmpty() {
  const existing = readStore();
  if (existing.length > 0) return existing;

  // Lazy import sample data used elsewhere in the project
  try {
    const { fetchAnnouncements } = await import("./announcements.js");
    const sample = await fetchAnnouncements();
    const normalized = sample.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      author: a.author || "System",
      createdAt: a.createdAt || new Date().toISOString(),
      pinned: Boolean(a.pinned),
    }));
    writeStore(normalized);
    return normalized;
  } catch {
    const fallback = [
      {
        id: "y1",
        title: "Welcome to the platform",
        content: "No backend yet. This is sample data stored locally.",
        author: "Institution Admin",
        createdAt: new Date().toISOString(),
        pinned: true,
      },
    ];
    writeStore(fallback);
    return fallback;
  }
}

export async function yuvrajListAnnouncements(limit = 7) {
  const list = readStore();
  // Pinned first, then newest first
  const sorted = [...list].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return sorted.slice(0, limit);
}

export async function yuvrajGetAnnouncementById(id) {
  const list = readStore();
  return list.find((a) => a.id === id) || null;
}

export async function yuvrajCreateAnnouncement({ title, content, author, pinned }) {
  const list = readStore();
  const newItem = {
    id: `y_${Date.now()}`,
    title: title?.trim() || "Untitled Announcement",
    content: content?.trim() || "",
    author: author?.trim() || "Admin",
    createdAt: new Date().toISOString(),
    pinned: Boolean(pinned),
  };
  writeStore([newItem, ...list]);
  return newItem;
}

export async function yuvrajUpdateAnnouncement(id, partial) {
  const list = readStore();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const updated = { ...list[index], ...partial };
  list[index] = updated;
  writeStore(list);
  return updated;
}

export async function yuvrajEnsureSeededAndList(limit = 7) {
  await yuvrajSeedIfEmpty();
  return yuvrajListAnnouncements(limit);
}


