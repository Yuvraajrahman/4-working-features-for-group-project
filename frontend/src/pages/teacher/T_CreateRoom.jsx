import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";

const T_CreateRoom = () => {
  const [room_name, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!room_name.trim() || !description.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/rooms", {
        room_name,
        description,
        instructorId: user?.id, // Include the instructor ID
      });

      toast.success("Room created successfully!");
      navigate("/teacher/dashboard");
    } catch (error) {
      console.log("Error creating room", error);
      if (error.response.status === 429) {
        toast.error("Slow down! You're creating rooms too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else {
        toast.error("Failed to create room");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/teacher/dashboard"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Dashboard
          </Link>
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Room</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Room Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="room Name"
                    className="input input-bordered"
                    value={room_name}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    placeholder="Add course details..."
                    className="textarea textarea-bordered h-32"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default T_CreateRoom;
