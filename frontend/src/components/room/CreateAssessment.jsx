import { useState } from "react";
import { Plus, Calendar, X } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CreateAssessment = ({ roomId, onAssessmentCreated, existingAssessments, defaultType, isPermanent }) => {
  const [isExpanded, setIsExpanded] = useState(isPermanent ? true : false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: defaultType === 'final_exam' ? 'Final Exam' : defaultType === 'mid_term_exam' ? 'Mid-term Exam' : "",
    description: "",
    topics: "",
    date: "",
    assessmentType: defaultType || "quiz"
  });

  // Check if description is required based on assessment type
  const isDescriptionRequired = formData.assessmentType === 'final_exam' || formData.assessmentType === 'mid_term_exam';

  const assessmentTypes = isPermanent ? [
    { value: "final_exam", label: "Final Exam" },
    { value: "mid_term_exam", label: "Mid-term Exam" }
  ] : [
    { value: "quiz", label: "Quiz" },
    { value: "assignment", label: "Assignment" },
    { value: "project", label: "Project" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    // Description is required only for final_exam and mid_term_exam
    if (isDescriptionRequired && !formData.description.trim()) {
      newErrors.description = "Description is required for exams";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const topicsArray = formData.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      const response = await api.post(`/assessments/room/${roomId}`, {
        ...formData,
        topics: topicsArray
      });

      onAssessmentCreated(response.data);
      
      // Reset form
      setFormData({
        title: defaultType === 'final_exam' ? 'Final Exam' : defaultType === 'mid_term_exam' ? 'Mid-term Exam' : "",
        description: "",
        topics: "",
        date: "",
        assessmentType: defaultType || "quiz"
      });
      
      if (!isPermanent) {
        setIsExpanded(false);
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      const errorMessage = error.response?.data?.message || "Failed to create assessment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCancel = () => {
    if (!isPermanent) {
      setIsExpanded(false);
    }
    setFormData({
      title: defaultType === 'final_exam' ? 'Final Exam' : defaultType === 'mid_term_exam' ? 'Mid-term Exam' : "",
      description: "",
      topics: "",
      date: "",
      assessmentType: defaultType || "quiz"
    });
    setErrors({});
  };

  if (!isExpanded && !isPermanent) {
    return (
      <div 
        className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="card-body text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Add Assessment</h3>
              <p className="text-sm text-blue-600">Click to add a new quiz, assignment, or project</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg border-2 border-blue-200">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800">Create New Assessment</h3>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
           {/* Assessment Type - Only show for non-permanent assessments */}
           {!isPermanent && (
             <div className="form-control">
               <label className="label">
                 <span className="label-text font-medium">Assessment Type *</span>
               </label>
               <select
                 className="select select-bordered w-full"
                 value={formData.assessmentType}
                 onChange={(e) => handleInputChange('assessmentType', e.target.value)}
               >
                 {assessmentTypes.map(type => (
                   <option key={type.value} value={type.value}>
                     {type.label}
                   </option>
                 ))}
               </select>
             </div>
           )}

          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title *</span>
            </label>
            <input
              type="text"
              placeholder="Enter assessment title..."
              className={`input input-bordered ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.title}</span>
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
              className={`textarea textarea-bordered h-24 ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.description}</span>
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
              value={formData.topics}
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
              className={`input input-bordered ${errors.date ? 'border-red-300 focus:border-red-500' : ''}`}
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
            {errors.date && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.date}</span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {isPermanent ? 'Create Exam' : 'Create Assessment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessment;
