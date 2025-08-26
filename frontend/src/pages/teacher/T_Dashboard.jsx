import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import RoomCard from "../../components/RoomCard";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
const T_Dashboard = () => {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [user]);

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
          </>
        )}
      </div>
    </div>
  );
};
export default T_Dashboard;
