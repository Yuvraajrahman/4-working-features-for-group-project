import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, FileText, User, Download, Clock } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const T_AssignmentDetail = () => {
  const { id, assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('T_AssignmentDetail component loaded');
  console.log('T_AssignmentDetail params:', { id, assessmentId });
  
  // Early return for debugging
  if (!id || !assessmentId) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4 text-error">Missing required parameters</p>
          <p className="text-sm mb-4">Room ID: {id || 'missing'}, Assessment ID: {assessmentId || 'missing'}</p>
          <Link to="/teacher/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentDetails();
      fetchSubmissions();
    } else {
      setError('No assessment ID provided');
      setLoading(false);
    }
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      console.log('Fetching assessment details for ID:', assessmentId);
      const response = await api.get(`/assessments/${assessmentId}`);
      console.log('Assessment response:', response.data);
      setAssessment(response.data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError(`Failed to fetch assessment: ${error.message}`);
      toast.error("Failed to fetch assessment details");
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      console.log('Fetching submissions for assessment ID:', assessmentId);
      const response = await api.get(`/submissions/${assessmentId}/submissions`);
      console.log('Submissions response:', response.data);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(`Failed to fetch submissions: ${error.message}`);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'assignment': return 'Assignment';
      case 'project': return 'Project';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4 text-error">{error}</p>
          <Link to={`/teacher/room/${id}/assessment`} className="btn btn-primary">
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Assessment not found</p>
          <Link to={`/teacher/room/${id}/assessment`} className="btn btn-primary">
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to={`/teacher/room/${id}/assessment`}
            className="btn btn-ghost btn-sm mb-4"
          >
            ← Back to Assessments
          </Link>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="badge badge-primary">{getTypeLabel(assessment.assessmentType)}</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-3">{assessment.title}</h1>
                  <p className="text-base-content/70 mb-4 whitespace-pre-wrap">{assessment.description}</p>
                  
                  {assessment.topics && assessment.topics.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium mb-2">Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {assessment.topics.map((topic, index) => (
                          <span key={index} className="badge badge-outline">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-base-content/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(assessment.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{submissions.length} submissions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4">Student Submissions</h2>
            
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-base-content/70 mb-2">
                  No submissions yet
                </h3>
                <p className="text-base-content/50">
                  Students haven't submitted their work yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission._id} className="border border-base-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="text-sm">
                              {submission.student?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{submission.student?.name || 'Unknown Student'}</h3>
                          <p className="text-sm text-base-content/60">{submission.student?.email || 'No email'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-base-content/60">
                            <Clock className="h-4 w-4" />
                            <span>Submitted {formatDate(submission.submittedAt)}</span>
                          </div>
                        </div>
                        
                        {submission.fileName && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/download/${submission._id}`);
                                if (response.ok) {
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = submission.fileName;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                } else {
                                  alert('Download failed');
                                }
                              } catch (error) {
                                console.error('Download error:', error);
                                alert('Download failed');
                              }
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download {submission.fileName}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {submission.comments && (
                      <div className="mt-3 p-3 bg-base-200 rounded">
                        <p className="text-sm">{submission.comments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default T_AssignmentDetail;