import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import RoomCard from "../../components/RoomCard";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { yuvrajListHelpdeskRequests } from "../../services/yuvraj_helpdesk_api";
import { yuvrajListAnnouncements } from "../../services/yuvraj_announcements_api";
const T_Dashboard = () => {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [helpdeskRequests, setHelpdeskRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user?.id) return;
      
      try {
        const res = await api.get(`/instructors/${user.id}/rooms`);
        console.log(res.data);
        setRooms(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching rooms");
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load rooms");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    loadInstructorContent();
  }, [user]);

  const loadInstructorContent = async () => {
    try {
      // Load helpdesk requests assigned to this instructor
      const requests = await yuvrajListHelpdeskRequests(user?.slug);
      const instructorRequests = requests.filter(req => 
        req.assigneeType === 'instructor' && 
        (!req.assigneeId || req.assigneeId === user?.id)
      );
      setHelpdeskRequests(instructorRequests.slice(0, 5)); // Show latest 5
      
      // Load announcements from the instructor's institution
      const announcements = await yuvrajListAnnouncements(10, user?.slug);
      setAnnouncements(announcements.slice(0, 5)); // Show latest 5
    } catch (error) {
      console.error('Error loading instructor content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name || 'Instructor'}
          </h1>
          <p className="text-gray-600">Manage your courses and students</p>
        </div>

        {loading && (
          <div className="text-center text-sky-600 py-10">Loading courses...</div>
        )}

        {!isRateLimited && (
          <>
            {rooms.length > 0 ? (
              // Normal grid with rooms + create card
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room._id} room={room} setRooms={setRooms} />
                ))}
                <Link
                  to={"/teacher/create/room"}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-sky-400 rounded-lg p-6 hover:bg-sky-50 transition bg-white"
                >
                  <Plus className="w-16 h-16 text-sky-500" />
                  <span className="mt-4 text-sky-600 font-medium text-lg">
                    Create a Course
                  </span>
                </Link>
              </div>
            ) : (
              // Centered create card when no rooms exist
              <div className="flex justify-center mt-20">
                <Link
                  to={"/teacher/create/room"}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-sky-400 rounded-lg p-12 hover:bg-sky-50 transition w-80 h-64 bg-white"
                >
                  <Plus className="w-20 h-20 text-sky-500" />
                  <span className="mt-4 text-sky-600 font-medium text-xl">
                    Create a Course
                  </span>
                </Link>
              </div>
            )}

            {/* Helpdesk and Announcements Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              {/* Helpdesk Requests Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Helpdesk Requests ({helpdeskRequests.length})</h2>
                  <Link to="/yuvraj/helpdesk" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                
                {helpdeskRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No helpdesk requests assigned to you</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {helpdeskRequests.map((req) => (
                      <div key={req._id} className="p-3 rounded border border-gray-100 hover:bg-gray-50">
                        <div className="font-medium text-gray-800 text-sm">{req.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {req.category} • {req.status || 'Pending'} • {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Institution Announcements Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Institution Announcements ({announcements.length})</h2>
                  <Link to="/yuvraj/announcements" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No announcements from your institution</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann._id} className="p-3 rounded border border-gray-100 hover:bg-gray-50">
                        <div className="font-medium text-gray-800 text-sm">{ann.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ann.announcementType || 'General'} • {new Date(ann.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default T_Dashboard;
