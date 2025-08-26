const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function yuvrajListCourses() {
  const r = await fetch(`${API}/api/yuvraj/resources/courses`);
  if (!r.ok) throw new Error("Failed to list courses");
  return r.json();
}

export async function yuvrajListCourseItems(courseId) {
  const r = await fetch(`${API}/api/yuvraj/resources/courses/${courseId}/items`);
  if (!r.ok) throw new Error("Failed to list course items");
  return r.json();
}


