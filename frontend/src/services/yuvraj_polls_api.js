const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListPolls(institutionSlug = null) {
  const url = new URL(`${API}/api/yuvraj/polls`);
  if (institutionSlug) {
    url.searchParams.set('institutionSlug', institutionSlug);
  }
  
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to list polls");
  return r.json();
}

export async function yuvrajCreatePoll(body) {
  const r = await fetch(`${API}/api/yuvraj/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create poll");
  return r.json();
}

export async function yuvrajGetPoll(id) {
  const r = await fetch(`${API}/api/yuvraj/polls/${id}`);
  if (!r.ok) throw new Error("Failed to get poll");
  return r.json();
}

export async function yuvrajVotePoll(id, body) {
  const r = await fetch(`${API}/api/yuvraj/polls/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to vote poll");
  return r.json();
}


