import { useState, useEffect } from "react";
import { Calendar, FileText, Clock } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import AssessmentCard from "./AssessmentCard";

const StudentAssessment = ({ roomId, room }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [roomId]);

  const fetchAssessments = async () => {
    try {
      const response = await api.get(`/assessments/room/${roomId}`);
      setAssessments(response.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentUpdated = (updatedAssessment) => {
    setAssessments(prev => 
      prev.map(assessment => 
        assessment._id === updatedAssessment._id ? updatedAssessment : assessment
      )
    );
    toast.success("Assessment updated successfully!");
  };

  const handleAssessmentDeleted = (deletedId) => {
    setAssessments(prev => prev.filter(assessment => assessment._id !== deletedId));
    toast.success("Assessment deleted successfully!");
  };

  // Group assessments by type
  const groupedAssessments = {
    final_exam: assessments.filter(a => a.assessmentType === 'final_exam'),
    mid_term_exam: assessments.filter(a => a.assessmentType === 'mid_term_exam'),
    quiz: assessments.filter(a => a.assessmentType === 'quiz'),
    assignment: assessments.filter(a => a.assessmentType === 'assignment'),
    project: assessments.filter(a => a.assessmentType === 'project')
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'final_exam': return 'Final Exam';
      case 'mid_term_exam': return 'Mid-term Exam';
      case 'quiz': return 'Quizzes';
      case 'assignment': return 'Assignments';
      case 'project': return 'Projects';
      default: return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'final_exam':
      case 'mid_term_exam':
        return <FileText className="h-5 w-5" />;
      case 'quiz':
      case 'assignment':
      case 'project':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Assessment</h2>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No assessments yet
          </h3>
          <p className="text-base-content/50">
            Your instructor hasn't created any assessments yet. Check back later!
          </p>
        </div>
      ) : (
        <>
          {/* Permanent Assessments */}
          <div className="space-y-4">
            {/* Final Exam Section */}
            {groupedAssessments.final_exam.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Final Exam</h3>
                  </div>
                  {groupedAssessments.final_exam.map(assessment => (
                    <AssessmentCard
                      key={assessment._id}
                      assessment={assessment}
                      onUpdate={handleAssessmentUpdated}
                      onDelete={handleAssessmentDeleted}
                      isStudent={true}
                      roomId={roomId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mid-term Exam Section */}
            {groupedAssessments.mid_term_exam.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Mid-term Exam</h3>
                  </div>
                  {groupedAssessments.mid_term_exam.map(assessment => (
                    <AssessmentCard
                      key={assessment._id}
                      assessment={assessment}
                      onUpdate={handleAssessmentUpdated}
                      onDelete={handleAssessmentDeleted}
                      isStudent={true}
                      roomId={roomId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deletable Assessments */}
          <div className="space-y-4">
            {/* Quizzes Section */}
            {groupedAssessments.quiz.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-secondary" />
                    <h3 className="text-lg font-semibold">Quizzes</h3>
                  </div>
                  <div className="space-y-3">
                    {groupedAssessments.quiz.map(assessment => (
                      <AssessmentCard
                        key={assessment._id}
                        assessment={assessment}
                        onUpdate={handleAssessmentUpdated}
                        onDelete={handleAssessmentDeleted}
                        isStudent={true}
                        roomId={roomId}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Assignments Section */}
            {groupedAssessments.assignment.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold">Assignments</h3>
                  </div>
                  <div className="space-y-3">
                    {groupedAssessments.assignment.map(assessment => (
                      <AssessmentCard
                        key={assessment._id}
                        assessment={assessment}
                        onUpdate={handleAssessmentUpdated}
                        onDelete={handleAssessmentDeleted}
                        isStudent={true}
                        roomId={roomId}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            {groupedAssessments.project.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-info" />
                    <h3 className="text-lg font-semibold">Projects</h3>
                  </div>
                  <div className="space-y-3">
                    {groupedAssessments.project.map(assessment => (
                      <AssessmentCard
                        key={assessment._id}
                        assessment={assessment}
                        onUpdate={handleAssessmentUpdated}
                        onDelete={handleAssessmentDeleted}
                        isStudent={true}
                        roomId={roomId}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAssessment;
