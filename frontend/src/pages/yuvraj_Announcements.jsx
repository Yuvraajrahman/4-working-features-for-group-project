import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu.jsx";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const Yuvraj_Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const { user, isInstitution, isInstructor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    yuvrajListAnnouncements(7)
      .then(setAnnouncements)
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setAnnouncements(seed);
      });
  }, []);

  const visible = useMemo(() => announcements.slice(0, 7), [announcements]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <HamburgerMenu />
          <img src="/Atsenlogo.png" alt="ATSEN" className="h-12 w-auto drop-shadow" />
          <h1 className="text-2xl font-semibold text-gray-800">Announcements</h1>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg border border-gray-200">
          <div
            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
            style={{ scrollSnapType: "y proximity" }}
          >
            {visible.length === 0 && (
              <YuvrajAnnouncementCard title="No announcements yet">
                <p className="opacity-80">Announcements will appear here.</p>
              </YuvrajAnnouncementCard>
            )}

            {visible.slice(0, 7).map((a) => (
              <div
                key={a.id}
                className="scroll-snap-start transform transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <Link to={`/yuvraj/announcements/${a.id}`}>
                  <YuvrajAnnouncementCard title={a.title} announcementType={a.announcementType}>
                    <p className="line-clamp-3 opacity-80">{a.content}</p>
                    <div className="mt-3 text-sm opacity-70">
                      {new Date(a.createdAt).toLocaleString()} • {a.author}
                    </div>
                  </YuvrajAnnouncementCard>
                </Link>
              </div>
            ))}
          </div>

          {isInstitution && (
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/yuvraj/institution/announcements/new")}
              >
                Create Announcement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_Announcements;


