const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListInstructors(institutionSlug = null) {
  let url = `${API}/api/instructors`;
  
  if (institutionSlug) {
    // Use institution-specific endpoint to get filtered instructors
    url = `${API}/api/institutions/${encodeURIComponent(institutionSlug)}/instructors`;
  }
  
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to list instructors");
  return r.json();
}


