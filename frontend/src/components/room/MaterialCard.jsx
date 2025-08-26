import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  File, 
  Link, 
  Trash2, 
  Edit, 
  Download,
  Calendar,
  User,
  X
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const MaterialCard = ({ material, onUpdate, onDelete, isStudent = false }) => {
  const [isExpanded, setIsExpanded] = useState(material.isExpanded || false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: material.title,
    description: material.description,
    section: material.section,
    attachmentType: material.fileType === 'link' ? 'link' : '',
    attachmentData: material.fileUrl || ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const handleToggleExpansion = async () => {
    try {
      const response = await api.patch(`/materials/${material._id}/toggle`);
      setIsExpanded(!isExpanded);
      onUpdate(response.data);
    } catch (error) {
      console.error("Error toggling material expansion:", error);
      toast.error("Failed to toggle material expansion");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/materials/${material._id}`);
      toast.success("Material deleted successfully!");
      onDelete(material._id);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setEditFormData({
      title: material.title,
      description: material.description,
      section: material.section,
      attachmentType: material.fileType === 'link' ? 'link' : '',
      attachmentData: material.fileUrl || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setEditErrors({});
    
    // Validate form
    const newErrors = {};
    
    if (!editFormData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!editFormData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (editFormData.attachmentType === "link" && !editFormData.attachmentData.trim()) {
      newErrors.attachmentData = "Please provide a link URL";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditLoading(true);
    try {
      const backendData = {
        title: editFormData.title,
        description: editFormData.description || "",
        section: editFormData.section,
        fileType: editFormData.attachmentType || "text",
        fileUrl: editFormData.attachmentData || "",
        fileName: editFormData.title
      };

      const response = await api.put(`/materials/${material._id}`, backendData);
      toast.success("Material updated successfully!");
      onUpdate(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error(`Failed to update material: ${error.response?.data?.details || error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditErrors({});
    setEditFormData({
      title: material.title,
      description: material.description,
      section: material.section,
      attachmentType: material.fileType === 'link' ? 'link' : '',
      attachmentData: material.fileUrl || ''
    });
  };

  const handleAttachmentTypeChange = (type) => {
    if (editFormData.attachmentType === type) {
      setEditFormData({ 
        ...editFormData, 
        attachmentType: "", 
        attachmentData: ""
      });
    } else {
      setEditFormData({ 
        ...editFormData, 
        attachmentType: type, 
        attachmentData: ""
      });
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'link':
        return <Link className="h-5 w-5 text-green-500" />;
      case 'text':
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <>
             <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300">
         <div className="card-body p-4">
           {/* Header */}
           <div className="flex items-center justify-between">
             <div 
               className="flex items-center gap-3 flex-1 cursor-pointer"
               onClick={handleToggleExpansion}
             >
               <div className="flex items-center justify-center w-6 h-6">
                 {isExpanded ? (
                   <ChevronDown className="h-4 w-4" />
                 ) : (
                   <ChevronRight className="h-4 w-4" />
                 )}
               </div>
               
               <div className="flex items-center gap-2">
                 {getFileIcon(material.fileType)}
                 <div>
                   <h3 className="font-semibold text-base-content">{material.title}</h3>
                 </div>
               </div>
             </div>

             <div className="flex items-center gap-2">
               {!isStudent && (
                 <div className="flex gap-1">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleEdit();
                     }}
                     className="btn btn-ghost btn-sm"
                     title="Edit"
                   >
                     <Edit className="h-4 w-4" />
                   </button>
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleDelete();
                     }}
                     className="btn btn-ghost btn-sm text-error"
                     title="Delete"
                     disabled={loading}
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                 </div>
               )}
             </div>
           </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                             <div className="border-t pt-4">
                 <div className="text-base-content/80 mb-3 whitespace-pre-wrap">
                   {material.description.split('\n').map((line, index) => {
                     // Check if line contains a URL
                     const urlRegex = /(https?:\/\/[^\s]+)/g;
                     const parts = line.split(urlRegex);
                     
                     return (
                       <div key={index} className={line === '' ? 'h-4' : ''}>
                         {parts.map((part, partIndex) => {
                           if (urlRegex.test(part)) {
                             return (
                               <a
                                 key={partIndex}
                                 href={part}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-primary hover:text-primary-focus underline"
                               >
                                 {part}
                               </a>
                             );
                           }
                           return part;
                         })}
                       </div>
                     );
                   })}
                 </div>
                
                {/* Link Preview - Only for link materials */}
                {material.fileType === 'link' && material.fileUrl && (
                  <div className="bg-base-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.fileType)}
                      <div className="flex-1">
                        <p className="font-medium">{material.title}</p>
                        <p className="text-sm text-base-content/60">
                          {formatDate(material.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(material.fileUrl, '_blank')}
                        className="btn btn-primary btn-sm"
                      >
                        <Link className="h-4 w-4 mr-1" />
                        View Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-base-content/60 mt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(material.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Teacher</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary/10 rounded-full">
                    <Edit className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary">Edit Material</h3>
                </div>
                <button
                  onClick={handleEditCancel}
                  className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                                 {/* Title Field */}
                 <div className="form-control">
                   <label className="label">
                     <span className="label-text font-medium">Title *</span>
                   </label>
                   <input
                     type="text"
                     placeholder="Enter material title..."
                     className={`input input-bordered ${editErrors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                     value={editFormData.title}
                     onChange={(e) => {
                       setEditFormData({ ...editFormData, title: e.target.value });
                       if (editErrors.title) setEditErrors({ ...editErrors, title: null });
                     }}
                     required
                   />
                   {editErrors.title && (
                     <label className="label">
                       <span className="label-text-alt text-red-500">{editErrors.title}</span>
                     </label>
                   )}
                 </div>

                                                   {/* Description Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Description *</span>
                    </label>
                    <textarea
                      placeholder="Describe this material..."
                      className={`textarea textarea-bordered h-24 ${editErrors.description ? 'border-red-300 focus:border-red-500' : ''}`}
                      value={editFormData.description}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, description: e.target.value });
                        if (editErrors.description) setEditErrors({ ...editErrors, description: null });
                      }}
                      required
                    />
                    {editErrors.description && (
                      <label className="label">
                        <span className="label-text-alt text-red-500">{editErrors.description}</span>
                      </label>
                    )}
                  </div>

                {/* Section Selection */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Section</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editFormData.section}
                    onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                  >
                    <option value="course_materials">Course Materials</option>
                    <option value="reference_books">Reference Books</option>
                    <option value="articles_research">Articles/Research Papers</option>
                  </select>
                </div>

                {/* Attach Link (Optional) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Attach Link (optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAttachmentTypeChange("link")}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      editFormData.attachmentType === "link" 
                        ? "border-secondary bg-secondary/10" 
                        : "border-base-300 hover:border-secondary/50"
                    }`}
                  >
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                      <Link className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Add a link to this material</span>
                  </button>
                </div>

                                 {/* Attachment Details - Only for Links */}
                 {editFormData.attachmentType === "link" && (
                   <div className="form-control">
                     <label className="label">
                       <span className="label-text font-medium">Link URL</span>
                     </label>
                     <input
                       type="url"
                       placeholder="Enter link URL..."
                       className={`input input-bordered ${editErrors.attachmentData ? 'border-red-300 focus:border-red-500' : ''}`}
                       value={editFormData.attachmentData}
                       onChange={(e) => {
                         setEditFormData({ ...editFormData, attachmentData: e.target.value });
                         if (editErrors.attachmentData) setEditErrors({ ...editErrors, attachmentData: null });
                       }}
                       required
                     />
                     {editErrors.attachmentData && (
                       <label className="label">
                         <span className="label-text-alt text-red-500">{editErrors.attachmentData}</span>
                       </label>
                     )}
                   </div>
                 )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="btn btn-ghost"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={editLoading}
                  >
                    {editLoading ? "Updating..." : "Update Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialCard;
