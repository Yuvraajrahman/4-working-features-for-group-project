import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  yuvrajCreateAnnouncement,
  yuvrajGetAnnouncementById,
  yuvrajUpdateAnnouncement,
  yuvrajDeleteAnnouncement,
} from "../services/yuvraj_announcements_api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import HamburgerMenu from "../components/HamburgerMenu.jsx";
import YuvrajDoneOverlay from "../components/yuvraj_DoneOverlay.jsx";

const Field = ({ label, children }) => (
  <label className="form-control w-full">
    <div className="label">
      <span className="label-text text-gray-700 font-medium">{label}</span>
    </div>
    {children}
  </label>
);

const Yuvraj_AnnouncementEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const { user, isInstitution } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [announcementType, setAnnouncementType] = useState("general");
  const [done, setDone] = useState(false);
  const [deleteOverlay, setDeleteOverlay] = useState(false);

  useEffect(() => {
    if (!isCreate && id) {
      yuvrajGetAnnouncementById(id).then((d) => {
        if (!d) return;
        setTitle(d.title || "");
        setContent(d.content || "");
        setPinned(Boolean(d.pinned));
        setAnnouncementType(d.announcementType || "general");
      });
    }
  }, [id, isCreate]);

  if (!isInstitution) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <HamburgerMenu />
            <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          </div>
          <p>You must be an institution to edit announcements.</p>
          <Link className="text-sky-600 hover:text-sky-700 underline" to="/yuvraj/announcements">Back</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isCreate) {
        await yuvrajCreateAnnouncement({ 
          title, 
          content, 
          pinned, 
          announcementType,
          author: user?.name || "Institution" 
        });
      } else if (id) {
        await yuvrajUpdateAnnouncement(id, { 
          title, 
          content, 
          pinned, 
          announcementType 
        });
      } else {
        throw new Error("Invalid announcement ID");
      }
      setDone(true);
      setTimeout(() => navigate("/yuvraj/announcements", { replace: true }), 700);
    } catch (e) {
      console.error(e);
      alert("Failed to submit. Check backend is running.");
    }
  };

  const handleDelete = async () => {
    if (!isCreate && id && window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
      try {
        await yuvrajDeleteAnnouncement(id);
        setDeleteOverlay(true);
        setTimeout(() => navigate("/yuvraj/announcements", { replace: true }), 1200);
      } catch (e) {
        console.error(e);
        alert("Failed to delete announcement.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <YuvrajDoneOverlay show={done} text={isCreate ? "Announcement created" : "Announcement updated"} />
      <YuvrajDoneOverlay show={deleteOverlay} text="Announcement deleted" color="red" />
      <div className="mx-auto max-w-3xl">
        {/* Header Section - Dashboard Style */}
        <div className="mb-8" style={{ marginLeft: "100px" }}>
          <div className="flex items-center gap-4 mb-6">
            <HamburgerMenu />
            <img src="/Atsenlogo.png" alt="ATSEN" className="h-16 w-auto drop-shadow flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800">
                {isCreate ? "Create New Announcement" : "Edit Announcement"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isCreate ? "Share important information with your community" : "Update the announcement details"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Header">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="input input-bordered w-full bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </Field>

            <Field label="Announcement Type">
              <select
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="select select-bordered w-full bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="academic">Academic</option>
                <option value="urgent">Urgent</option>
                <option value="payment">Payment Deadline</option>
                <option value="registration">Registration Deadline</option>
              </select>
            </Field>

            <Field label="Content">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter announcement content"
                rows={10}
                className="textarea textarea-bordered w-full bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </Field>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-gray-700 font-medium">Pin to top</span>
                <input type="checkbox" className="toggle toggle-primary" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              </label>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <Link to="/yuvraj/announcements" className="btn btn-ghost text-gray-600 hover:text-gray-800">
                  Cancel
                </Link>
                {!isCreate && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-error bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                {isCreate ? "Create Announcement" : "Update Announcement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_AnnouncementEditor;


