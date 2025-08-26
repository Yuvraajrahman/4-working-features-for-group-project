import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CreateDiscussion = ({ roomId, onDiscussionCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await api.post(`/forum-content/room/${roomId}`, {
        title: formData.title,
        content: formData.content,
        tags,
        contentType: 'discussion'
      });

      toast.success("Discussion created successfully!");
      setFormData({ title: "", content: "", tags: "" });
      setIsOpen(false);
      onDiscussionCreated(response.data);
    } catch (error) {
      console.error("Error creating discussion:", error);
      console.error("Error response:", error.response?.data);
      toast.error(`Failed to create discussion: ${error.response?.data?.details || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", tags: "" });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="card bg-gradient-to-r from-secondary/5 to-accent/5 border-2 border-dashed border-secondary/30 hover:border-secondary/50 hover:from-secondary/10 hover:to-accent/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
      >
        <div className="card-body py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors duration-300">
              <Plus className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-secondary">Start a Discussion</h3>
              <p className="text-sm text-base-content/60">Share your thoughts and questions with classmates</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-secondary/5 via-base-100 to-accent/5 border-2 border-secondary/20 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary/10 rounded-full">
              <Plus className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary">Start a Discussion</h3>
          </div>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              type="text"
              placeholder="What would you like to discuss?"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Content</span>
            </label>
            <textarea
              placeholder="Share your thoughts, questions, or ideas..."
              className="textarea textarea-bordered h-32"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
              placeholder="e.g., question, homework, clarification"
              className="input input-bordered"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Start Discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussion;
