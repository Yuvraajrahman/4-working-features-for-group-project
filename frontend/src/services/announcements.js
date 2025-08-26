// Temporary mock service for announcements. Replace with real API when backend is ready.
export async function fetchAnnouncements() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  return [
    {
      id: "a1",
      title: "Welcome to the Spring 2025 term",
      content: "Please review the course handbook and schedule. Orientation starts next week.",
      createdAt: new Date().toISOString(),
      author: "Institution Admin",
      pinned: true,
    },
    {
      id: "a2",
      title: "System maintenance on Friday",
      content: "The platform will be unavailable from 10:00 PM to 11:30 PM for maintenance.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      author: "IT Desk",
      pinned: false,
    },
    {
      id: "a3",
      title: "New library resources available",
      content: "Access newly added journals and e-books from the library portal.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      author: "Library",
      pinned: false,
    },
  ];
}


