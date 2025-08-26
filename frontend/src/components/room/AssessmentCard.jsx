import { useState } from "react";
import { Edit, Trash2, Calendar, FileText, X, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const AssessmentCard = ({ assessment, onUpdate, onDelete, isStudent = false, roomId }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [editFormData, setEditFormData] = useState({
    title: assessment.title,
    description: assessment.description,
    topics: assessment.topics.join(', '),
    date: new Date(assessment.date).toISOString().slice(0, 16)
  });

  // Check if description is required based on assessment type
  const isDescriptionRequired = assessment.assessmentType === 'final_exam' || assessment.assessmentType === 'mid_term_exam';

  const getTypeLabel = (type) => {
    switch (type) {
      case 'final_exam': return 'Final Exam';
      case 'mid_term_exam': return 'Mid-term Exam';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Assignment';
      case 'project': return 'Project';
      default: return type;
    }
  };

  const getCardColor = (type) => {
    switch (type) {
      case 'final_exam':
      case 'mid_term_exam':
        return 'bg-base-100 border-l-4 border-l-primary';
      case 'quiz':
        return 'bg-base-100 border-l-4 border-l-secondary';
      case 'assignment':
        return 'bg-base-100 border-l-4 border-l-accent';
      case 'project':
        return 'bg-base-100 border-l-4 border-l-info';
      default:
        return 'bg-base-100';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setEditFormData({
      title: assessment.title,
      description: assessment.description,
      topics: assessment.topics.join(', '),
      date: new Date(assessment.date).toISOString().slice(0, 16)
    });
    setEditErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setEditErrors({});

    // Validate form
    const newErrors = {};
    if (!editFormData.title.trim()) {
      newErrors.title = "Title is required";
    }
    // Description is required only for final_exam and mid_term_exam
    if (isDescriptionRequired && !editFormData.description.trim()) {
      newErrors.description = "Description is required for exams";
    }
    if (!editFormData.date) {
      newErrors.date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const topicsArray = editFormData.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      const response = await api.put(`/assessments/${assessment._id}`, {
        ...editFormData,
        topics: topicsArray
      });

      onUpdate(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating assessment:", error);
      const errorMessage = error.response?.data?.message || "Failed to update assessment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;

    setLoading(true);
    try {
      await api.delete(`/assessments/${assessment._id}`);
      onDelete(assessment._id);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete assessment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <>
             <div className={`card ${getCardColor(assessment.assessmentType)} shadow-md hover:shadow-lg transition-all duration-300`}>
         <div className="card-body p-4">
           <div className="flex items-start justify-between">
             <div className="flex-1">
              
              {(assessment.assessmentType === 'assignment' || assessment.assessmentType === 'project') ? (
                <Link 
                  to={isStudent ? `/student/room/${roomId}/assessment/${assessment._id}` : `/teacher/room/${roomId}/assessment/${assessment._id}`}
                  className="font-semibold text-base-content mb-2 hover:text-primary cursor-pointer flex items-center gap-1"
                >
                  {assessment.title}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : (
                <h3 className="font-semibold text-base-content mb-2">{assessment.title}</h3>
              )}
              
              <p className="text-base-content/70 text-sm mb-3 whitespace-pre-wrap">
                {assessment.description}
              </p>

              {assessment.topics && assessment.topics.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-base-content/80 mb-1">Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {assessment.topics.map((topic, index) => (
                      <span key={index} className="badge badge-outline badge-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(assessment.date)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-4">
              {!isStudent && (
                <>
                  <button
                    onClick={handleEdit}
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
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Assessment</h3>
              <button
                onClick={handleEditCancel}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter assessment title..."
                  className={`input input-bordered ${editErrors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                  value={editFormData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
                {editErrors.title && (
                  <label className="label">
                    <span className="label-text-alt text-red-500">{editErrors.title}</span>
                  </label>
                )}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Description {isDescriptionRequired ? '*' : '(Optional)'}
                  </span>
                </label>
                <textarea
                  placeholder={isDescriptionRequired ? "Describe this assessment..." : "Describe this assessment (optional)..."}
                  className={`textarea textarea-bordered h-24 ${editErrors.description ? 'border-red-300 focus:border-red-500' : ''}`}
                  value={editFormData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {editErrors.description && (
                  <label className="label">
                    <span className="label-text-alt text-red-500">{editErrors.description}</span>
                  </label>
                )}
              </div>

              {/* Topics */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Topics (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter topics separated by commas..."
                  className="input input-bordered"
                  value={editFormData.topics}
                  onChange={(e) => handleInputChange('topics', e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt">e.g., Topic 1, Topic 2, Topic 3</span>
                </label>
              </div>

              {/* Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date *</span>
                </label>
                <input
                  type="datetime-local"
                  className={`input input-bordered ${editErrors.date ? 'border-red-300 focus:border-red-500' : ''}`}
                  value={editFormData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
                {editErrors.date && (
                  <label className="label">
                    <span className="label-text-alt text-red-500">{editErrors.date}</span>
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="btn btn-ghost flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentCard;
