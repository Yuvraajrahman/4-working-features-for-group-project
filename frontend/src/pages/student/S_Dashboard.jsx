import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { BookOpen, Users, Calendar } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
const S_Dashboard = () => {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user?.id) return;
      
      try {
        const res = await api.get(`/students/${user.id}/rooms`);
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
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name || 'Student'}
          </h1>
          <p className="text-gray-600">Here are your enrolled courses</p>
        </div>

        {loading && (
          <div className="text-center text-sky-600 py-10">Loading your enrolled courses...</div>
        )}

        {!isRateLimited && (
          <>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Link
                    key={room._id}
                    to={`/student/room/${room._id}/forum`}
                    className="bg-white hover:bg-sky-50 hover:shadow-lg transition-all duration-200 rounded-lg border border-gray-200 hover:border-sky-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-sky-700">{room.room_name}</h3>
                        <BookOpen className="h-5 w-5 text-sky-500 group-hover:text-sky-600" />
                      </div>
                      <p className="text-gray-600 line-clamp-3 mb-4">{room.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(room.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Enrolled</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No enrolled courses yet
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't been enrolled in any courses yet. Contact your instructor to get started.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default S_Dashboard;
