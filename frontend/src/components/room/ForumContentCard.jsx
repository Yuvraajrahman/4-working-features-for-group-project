import { useState } from "react";
import { 
  Pin, 
  Edit, 
  Trash2, 
  User, 
  Calendar,
  Tag,
  X,
  Check
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const ForumContentCard = ({ announcement, onUpdate, onDelete, isStudent = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: announcement.title,
    content: announcement.content,
    tags: announcement.tags.join(", "),
    isPinned: announcement.isPinned
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!editData.title.trim() || !editData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const tags = editData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await api.put(`/forum-content/${announcement._id}`, {
        title: editData.title,
        content: editData.content,
        tags,
        isPinned: editData.isPinned,
        userRole: isStudent ? 'student' : 'teacher'
      });

      toast.success(announcement.contentType === 'discussion' ? "Discussion updated successfully!" : "Announcement updated successfully!");
      setIsEditing(false);
      onUpdate(response.data);
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error(error.response?.data?.message || "Failed to update content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const contentType = announcement.contentType === 'discussion' ? 'discussion' : 'announcement';
    if (!window.confirm(`Are you sure you want to delete this ${contentType}?`)) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/forum-content/${announcement._id}`, {
        data: { userRole: isStudent ? 'student' : 'teacher' }
      });
      toast.success(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} deleted successfully!`);
      onDelete(announcement._id);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error(error.response?.data?.message || "Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      const response = await api.patch(`/forum-content/${announcement._id}/pin`, {
        userRole: isStudent ? 'student' : 'teacher'
      });
      onUpdate(response.data);
      const contentType = announcement.contentType === 'discussion' ? 'discussion' : 'announcement';
      toast.success(response.data.isPinned ? `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} pinned!` : `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} unpinned!`);
    } catch (error) {
      console.error("Error toggling pin status:", error);
      toast.error(error.response?.data?.message || "Failed to update pin status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isEditing) {
    return (
      <div className="card bg-base-100 shadow-lg border border-primary/20">
        <div className="card-body">
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Content</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags (comma-separated)
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editData.tags}
                onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
              />
            </div>

            {/* Only show pin checkbox for teachers (non-students) */}
            {!isStudent && (
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Pin this {announcement.contentType === 'discussion' ? 'discussion' : 'announcement'}
                  </span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={editData.isPinned}
                    onChange={(e) => setEditData({ ...editData, isPinned: e.target.checked })}
                  />
                </label>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Check className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-announcement-id={announcement._id}
      className={`card bg-base-100 shadow-lg transition-all duration-300 ease-in-out ${
        announcement.isPinned 
          ? announcement.contentType === 'discussion' 
            ? 'border-l-4 border-l-secondary scale-[1.02]' 
            : 'border-l-4 border-l-warning scale-[1.02]'
          : ''
      }`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
                     <div className="flex items-center gap-2">
             <h3 className="text-lg font-semibold">{announcement.title}</h3>
             {announcement.isPinned && (
               <Pin className={`h-4 w-4 ${
                 announcement.contentType === 'discussion' ? 'text-secondary' : 'text-warning'
               }`} />
             )}
           </div>
          <div className="flex gap-1">
            {!isStudent && (
              <>
                                 <button
                   onClick={handleTogglePin}
                   className={`btn btn-ghost btn-sm transition-all duration-200 ${
                     announcement.isPinned 
                       ? announcement.contentType === 'discussion' 
                         ? 'text-secondary hover:bg-secondary/10' 
                         : 'text-warning hover:bg-warning/10'
                       : 'hover:bg-base-200'
                   }`}
                   title={announcement.isPinned ? 'Unpin' : 'Pin'}
                 >
                   <Pin className={`h-4 w-4 transition-transform duration-200 ${announcement.isPinned ? 'rotate-12' : ''}`} />
                 </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-ghost btn-sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost btn-sm text-error"
                  title="Delete"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            {/* Students can edit/delete their own discussions */}
            {isStudent && announcement.contentType === 'discussion' && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-ghost btn-sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost btn-sm text-error"
                  title="Delete"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="prose max-w-none mb-4">
          <p className="whitespace-pre-wrap">{announcement.content}</p>
        </div>

        {announcement.tags && announcement.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {announcement.tags.map((tag, index) => (
              <span
                key={index}
                className="badge badge-outline badge-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-base-content/70">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>
                {announcement.contentType === 'discussion' 
                  ? (announcement.author?.name || 'Student') 
                  : (announcement.author?.name || 'Teacher')
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(announcement.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumContentCard;
