import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { ArrowLeft, Loader, MessageSquare, BookOpen, Calendar } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import StudentDiscussionForum from "../../components/room/StudentDiscussionForum";
import StudentMaterials from "../../components/room/StudentMaterials";
import StudentAssessment from "../../components/room/StudentAssessment";
import CourseTimeline from "../../components/room/CourseTimeline";

const S_Room = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("forum"); // Default to forum

  const location = useLocation();
  const { id } = useParams();

  // Determine active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/materials')) {
      setActiveTab("materials");
    } else if (location.pathname.includes('/assessment')) {
      setActiveTab("assessment");
    } else {
      setActiveTab("forum");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data);
      } catch (error) {
        console.log("Error in fetching room details", error);
        toast.error("Failed to fetch room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard Button - Floating left */}
        <div className="mb-6 flex justify-start">
          <Link to="/student/dashboard" className="flex items-center px-4 py-2 text-gray-600 hover:text-sky-600 hover:bg-white rounded-md transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Room Info Header */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900">{room.room_name}</h1>
                      <p className="text-gray-600 mt-2">{room.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <Link
                  to={`/student/room/${id}/forum`}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === "forum" 
                      ? "bg-sky-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-white hover:text-sky-600"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion Forum
                </Link>
                <Link
                  to={`/student/room/${id}/materials`}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === "materials" 
                      ? "bg-sky-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-white hover:text-sky-600"
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Materials
                </Link>
                <Link
                  to={`/student/room/${id}/assessment`}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === "assessment" 
                      ? "bg-sky-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-white hover:text-sky-600"
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Assessment
                </Link>
              </div>

              {/* Tab Content */}
              {activeTab === "forum" && (
                <StudentDiscussionForum roomId={id} />
              )}

              {activeTab === "materials" && (
                <StudentMaterials roomId={id} />
              )}

              {activeTab === "assessment" && (
                <StudentAssessment roomId={id} room={room} />
              )}
            </div>
            
            {/* Timeline Sidebar */}
                                <div className="lg:col-span-1">
                      <div className="sticky top-6">
                        <CourseTimeline roomId={id} room={room} isStudent={true} />
                      </div>
                    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Room;
