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

  return (
    <div className="bg-gray-50 min-h-screen" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        {/* Header Section - Dashboard Style */}
        <div className="mb-8" style={{ marginLeft: "100px" }}>
          <div className="flex items-center gap-4 mb-6">
            <HamburgerMenu />
            <img src="/Atsenlogo.png" alt="ATSEN" className="h-16 w-auto drop-shadow flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800">Announcement Details</h1>
              <p className="text-gray-600 mt-2">View and manage announcement information</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg border border-gray-200">
          <YuvrajAnnouncementCard title={title} announcementType={data?.announcementType}>
            <p className="whitespace-pre-wrap leading-relaxed opacity-90">{content}</p>
            {data && (
              <div className="mt-4 text-sm opacity-70">
                {new Date(data.createdAt).toLocaleString()} • {data.author}
              </div>
            )}
          </YuvrajAnnouncementCard>

          {isInstitution && data && (
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_AnnouncementDetail;


