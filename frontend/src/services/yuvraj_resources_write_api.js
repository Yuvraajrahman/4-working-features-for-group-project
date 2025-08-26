const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajCreateCourse(body) {
  const r = await fetch(`${API}/api/yuvraj/resources/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create course");
  return r.json();
}

export async function yuvrajCreateCourseItem(courseId, body) {
  const r = await fetch(`${API}/api/yuvraj/resources/courses/${courseId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create course item");
  return r.json();
}

export async function yuvrajDeleteCourseItem(courseId, itemId) {
  const r = await fetch(`${API}/api/yuvraj/resources/courses/${courseId}/items/${itemId}`, {
    method: "DELETE",
    headers: { "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
  });
  if (!r.ok) throw new Error("Failed to delete item");
  return true;
}

export async function yuvrajDeleteCourse(courseId) {
  const r = await fetch(`${API}/api/yuvraj/resources/courses/${courseId}`, {
    method: "DELETE",
    headers: { "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
  });
  if (!r.ok) throw new Error("Failed to delete course");
  return true;
}

export async function yuvrajUpdateCourseItem(courseId, itemId, body) {
  const r = await fetch(`${API}/api/yuvraj/resources/courses/${courseId}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to update item");
  return r.json();
}


