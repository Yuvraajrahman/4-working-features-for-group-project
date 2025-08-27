const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListConsultationSlots() {
  const r = await fetch(`${API}/api/yuvraj/helpdesk/consultation-slots`);
  if (!r.ok) throw new Error("Failed to list consultation slots");
  return r.json();
}

export async function yuvrajCreateHelpdeskRequest(body) {
  const r = await fetch(`${API}/api/yuvraj/helpdesk/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create helpdesk request");
  return r.json();
}

export async function yuvrajListHelpdeskRequests(institutionSlug = null) {
  const url = new URL(`${API}/api/yuvraj/helpdesk/requests`);
  if (institutionSlug) {
    url.searchParams.set('institutionSlug', institutionSlug);
  }
  
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to list helpdesk requests");
  return r.json();
}

export async function yuvrajUpdateHelpdeskStatus(id, status, timelineEntry) {
  const r = await fetch(`${API}/api/yuvraj/helpdesk/requests/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, timelineEntry }),
  });
  if (!r.ok) throw new Error("Failed to update helpdesk status");
  return r.json();
}


