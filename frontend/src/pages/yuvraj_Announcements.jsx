import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu.jsx";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const Yuvraj_Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [viewMode, setViewMode] = useState('recent'); // 'recent' or 'all'
  const { user, isInstitution, isInstructor } = useAuth();
  
  const getInstitutionSlug = () => {
    // All user types now have institution slug
    return user?.slug || null;
  };
  const navigate = useNavigate();

  useEffect(() => {
    const institutionSlug = getInstitutionSlug();
    const limit = viewMode === 'recent' ? 7 : 20;
    yuvrajListAnnouncements(limit, institutionSlug)
      .then(setAnnouncements)
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setAnnouncements(seed);
      });
  }, [user, viewMode]);

  const visible = useMemo(() => {
    const limit = viewMode === 'recent' ? 7 : 20;
    return announcements.slice(0, limit);
  }, [announcements, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <HamburgerMenu />
          <h1 className="text-2xl font-semibold text-gray-800">Announcements</h1>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg border border-gray-200">
          {/* Header with View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'recent' 
                      ? 'bg-sky-600 text-white' 
                      : 'text-gray-600 hover:text-sky-600'
                  }`}
                  onClick={() => setViewMode('recent')}
                >
                  Recent
                </button>
                <button
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'all' 
                      ? 'bg-sky-600 text-white' 
                      : 'text-gray-600 hover:text-sky-600'
                  }`}
                  onClick={() => setViewMode('all')}
                >
                  All
                </button>
              </div>
            </div>
            {isInstitution && (
              <button
                className="btn btn-primary bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/yuvraj/institution/announcements/new")}
              >
                Create Announcement
              </button>
            )}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No announcements available</div>
              <div className="text-gray-500">Check back later for updates from your institution</div>
            </div>
          )}

          {viewMode === 'recent' ? (
            // Recent view - Full cards with scrolling
            <div
              className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
              style={{ scrollSnapType: "y proximity" }}
            >
              {visible.map((a) => (
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
          ) : (
            // All view - Compact rectangular boxes (max 20)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
              {visible.map((a) => (
                <Link
                  key={a.id}
                  to={`/yuvraj/announcements/${a.id}`}
                  className="block"
                >
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        a.announcementType === 'urgent' ? 'bg-red-100 text-red-800' :
                        a.announcementType === 'event' ? 'bg-green-100 text-green-800' :
                        a.announcementType === 'academic' ? 'bg-purple-100 text-purple-800' :
                        a.announcementType === 'payment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {(a.announcementType || 'General').charAt(0).toUpperCase() + (a.announcementType || 'general').slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        🌐 Global
                      </span>
                      {a.pinned && (
                        <span className="text-yellow-600 text-xs">📌</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 text-sm">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                      {a.content || "No content available"}
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_Announcements;


