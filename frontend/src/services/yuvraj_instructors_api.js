const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListInstructors() {
  const r = await fetch(`${API}/api/instructors`);
  if (!r.ok) throw new Error("Failed to list instructors");
  return r.json();
}


