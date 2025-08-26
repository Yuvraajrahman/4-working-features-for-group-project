import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajGetAnnouncementById } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import HamburgerMenu from "../components/HamburgerMenu.jsx";

const Yuvraj_AnnouncementDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { user, isInstitution } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    yuvrajGetAnnouncementById(id)
      .then(setData)
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setData(seed.find((x) => x.id === id) || seed[0]);
      });
  }, [id]);

  const title = data?.title || (isInstitution ? "Edit title here" : "Announcement");
  const content = data?.content || (isInstitution ? "Edit content here" : "");

  // Function to render content with links and basic formatting
  const renderContent = (content) => {
    if (!content) return null;
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 border-blue-200',
      event: 'bg-green-100 text-green-800 border-green-200',
      academic: 'bg-purple-100 text-purple-800 border-purple-200',
      urgent: 'bg-red-100 text-red-800 border-red-200',
      payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      registration: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div className="mx-auto max-w-5xl">
        {/* Header Section - Dashboard Style */}
        <div className="mb-8" style={{ marginLeft: "100px" }}>
          <div className="flex items-center gap-4 mb-6">
            <HamburgerMenu />
            <img src="/Atsenlogo.png" alt="ATSEN" className="h-16 w-auto drop-shadow flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800">Announcement</h1>
              <p className="text-gray-600 mt-2">View announcement details</p>
            </div>
          </div>
        </div>

        {/* Expanded Content Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                <div className="flex items-center gap-3">
                  {data?.announcementType && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(data.announcementType)}`}>
                      {data.announcementType.charAt(0).toUpperCase() + data.announcementType.slice(1)}
                    </span>
                  )}
                  {data?.pinned && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                      📌 Pinned
                    </span>
                  )}
                </div>
              </div>
              {isInstitution && data && (
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => {
                    if (data.id) {
                      navigate(`/yuvraj/institution/announcements/edit/${data.id}`);
                    } else if (id) {
                      navigate(`/yuvraj/institution/announcements/edit/${id}`);
                    } else {
                      alert("Cannot edit: Announcement ID not found");
                    }
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-black leading-relaxed text-lg whitespace-pre-wrap">
                {renderContent(content)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="font-medium">By {data?.author || "Admin"}</span>
                <span>•</span>
                <span>{data ? new Date(data.createdAt).toLocaleString() : "Recently"}</span>
              </div>
              <Link to="/yuvraj/announcements" className="text-sky-600 hover:text-sky-700 font-medium">
                ← Back to Announcements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_AnnouncementDetail;


