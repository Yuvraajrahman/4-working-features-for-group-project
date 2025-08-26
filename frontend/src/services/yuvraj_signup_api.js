const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajCreateSignupRequest(body) {
  const r = await fetch(`${API}/api/yuvraj/signup/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create signup request");
  return r.json();
}

export async function yuvrajListSignupRequests(institutionSlug) {
  const r = await fetch(`${API}/api/yuvraj/signup/requests/${institutionSlug}`);
  if (!r.ok) throw new Error("Failed to list signup requests");
  return r.json();
}

export async function yuvrajUpdateSignupStatus(id, status, note) {
  const r = await fetch(`${API}/api/yuvraj/signup/requests/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
    body: JSON.stringify({ status, note }),
  });
  if (!r.ok) throw new Error("Failed to update signup status");
  return r.json();
}


