// Yuvraj default seed data for offline/local fallback
export async function yuvrajSeedData() {
  return [
    {
      id: "a_midterm",
      title: "Mid-Term Exam schedule for Summer 2025",
      content:
        "Exam schedules of programs will be provided by the respective department. For any assistance, contact the Department Coordination Officer (DCO).",
      createdAt: new Date().toISOString(),
      author: "Institution Admin",
      pinned: true,
      announcementType: "academic",
    },
    {
      id: "a_wishlist",
      title: 'UG "Wishlist" Event Schedule, Fall 2025',
      content:
        'The Fall 2025 advising preparatory phase will begin with the upcoming "Wishlist" event to help plan course offerings for the term. All undergraduate programs will participate, except PHR.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      author: "Registrar",
      pinned: false,
      announcementType: "event",
    },
    {
      id: "a_convocation",
      title: "Convocation registration closes soon",
      content:
        "Final-year students must complete their convocation registration by the end of this week. Late registrations will not be accepted.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      author: "Admin",
      pinned: false,
      announcementType: "urgent",
    },
  ];
}


