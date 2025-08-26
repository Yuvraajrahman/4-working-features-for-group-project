// src/pages/teacher/T_Room.jsx

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import api from "../../lib/axios";
import {
  ArrowLeft,
  Loader,
  Trash2,
  Settings,
  MessageSquare,
  BookOpen,
  Calendar,
  Video // ← added Video icon
} from "lucide-react";
import Navbar from "../../components/Navbar";
import DiscussionForum from "../../components/room/DiscussionForum";
import Materials from "../../components/room/Materials";
import Assessment from "../../components/room/Assessment";
import CourseTimeline from "../../components/room/CourseTimeline";

const T_Room = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false); // ← added meetingLoading
  const [activeTab, setActiveTab] = useState("forum"); // Default to forum

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Determine active tab based on URL
  useEffect(() => {
    if (location.pathname.includes("/edit")) {
      setActiveTab("settings");
    } else if (location.pathname.includes("/materials")) {
      setActiveTab("materials");
    } else if (location.pathname.includes("/assessment")) {
      setActiveTab("assessment");
    } else {
      setActiveTab("forum");
    }
  }, [location.pathname]);

  // Fetch room details
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

  // Delete room handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success("Room deleted successfully");
      navigate("/teacher/dashboard");
    } catch (error) {
      console.log("Error in deleting room", error);
      toast.error("Failed to delete room");
    }
  };

  // Save room settings handler
  const handleSave = async () => {
    if (!room.room_name.trim() || !room.description.trim()) {
      toast.error("All fields are required");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/rooms/${id}`, room);
      toast.success("Room updated successfully!");
      navigate(`/teacher/dashboard`);
    } catch (error) {
      console.log("Error updating the room", error);
      toast.error("Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  // Meeting creation handler
  const handleMeeting = async () => {
    setMeetingLoading(true);
    try {
      const res = await api.post(`/rooms/${id}/meeting`);
      window.open(res.data.join_url, "_blank");
      toast.success("Meeting started!");
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Could not start meeting");
    } finally {
      setMeetingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Loader className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6 flex justify-start">
          <Link to="/teacher/dashboard" className="flex items-center text-gray-600 hover:text-sky-600 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Room Info Header with Meeting & Settings */}
              <div className="bg-white rounded-lg shadow-lg mb-6 border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-800">{room.room_name}</h1>
                      <p className="text-gray-600">{room.description}</p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {/* Meeting button first */}
                      <button
                        onClick={handleMeeting}
                        disabled={meetingLoading}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        {meetingLoading ? "Starting…" : "Meeting"}
                      </button>
                      {/* Settings button second */}
                      <Link
                        to={`/teacher/room/${id}/edit`}
                        className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center ${
                          activeTab === "settings" 
                            ? "bg-sky-500 text-white" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <Link
                  to={`/teacher/room/${id}/forum`}
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
                  to={`/teacher/room/${id}/materials`}
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
                  to={`/teacher/room/${id}/assessment`}
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
              {activeTab === "settings" && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room name
                      </label>
                      <input
                        type="text"
                        placeholder="room name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        value={room.room_name}
                        onChange={(e) =>
                          setRoom({ ...room, room_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Write your description here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 h-32 resize-none"
                        value={room.description}
                        onChange={(e) =>
                          setRoom({ ...room, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors border border-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Room
                      </button>
                      <button
                        className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                        onClick={handleSave}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "forum" && <DiscussionForum roomId={id} />}
              {activeTab === "materials" && <Materials roomId={id} />}
              {activeTab === "assessment" && (
                <Assessment roomId={id} room={room} />
              )}
            </div>

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CourseTimeline roomId={id} room={room} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T_Room;