const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListInstitutions() {
  const r = await fetch(`${API}/api/institutions`);
  if (!r.ok) throw new Error("Failed to list institutions");
  return r.json();
}


