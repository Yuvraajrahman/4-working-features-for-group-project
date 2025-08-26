import { useState, useEffect } from "react";
import { Calendar, BookOpen, FileText, CheckCircle, Clock, GraduationCap } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CourseTimeline = ({ roomId, room, demoAssessments = null, isStudent = false }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0); // Track current progress position

  // Load saved progress from localStorage on component mount
  useEffect(() => {
    if (roomId) {
      const savedProgress = localStorage.getItem(`timeline-progress-${roomId}`);
      if (savedProgress !== null) {
        setCurrentProgress(parseInt(savedProgress));
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (demoAssessments) {
      setAssessments(demoAssessments);
      setLoading(false);
    } else {
      fetchAssessments();
    }
  }, [roomId, demoAssessments]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAssessmentIcon = (type) => {
    switch (type) {
      case 'final_exam':
        return <GraduationCap className="h-5 w-5" />;
      case 'mid_term_exam':
        return <FileText className="h-5 w-5" />;
      case 'quiz':
        return <CheckCircle className="h-5 w-5" />;
      case 'assignment':
        return <BookOpen className="h-5 w-5" />;
      case 'project':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getAssessmentColor = (type) => {
    switch (type) {
      case 'final_exam':
        return 'text-error';
      case 'mid_term_exam':
        return 'text-warning';
      case 'quiz':
        return 'text-success';
      case 'assignment':
        return 'text-info';
      case 'project':
        return 'text-secondary';
      default:
        return 'text-primary';
    }
  };

  const getAssessmentLabel = (type) => {
    switch (type) {
      case 'final_exam':
        return 'Final Exam';
      case 'mid_term_exam':
        return 'Mid-term Exam';
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return 'Assignment';
      case 'project':
        return 'Project';
      default:
        return type;
    }
  };

     const generateTimelineEvents = () => {
     const events = [];
     
     // Add course start event
     if (room && room.createdAt) {
       events.push({
         id: 'course-start',
         date: room.createdAt,
         title: 'Course Started',
         description: `${room.room_name} course begins`,
         type: 'course_start',
         isLeft: true
       });
     }

     // Add all assessments
     assessments.forEach((assessment, index) => {
       events.push({
         id: assessment._id,
         date: assessment.date,
         title: assessment.title,
         description: assessment.description || `${getAssessmentLabel(assessment.assessmentType)} scheduled`,
         type: assessment.assessmentType,
         isLeft: (events.length) % 2 === 0 // Alternate sides based on current events length
       });
     });

     // Add course end event (one day after final exam if exists)
     const finalExam = assessments.find(a => a.assessmentType === 'final_exam');
     if (finalExam) {
       const courseEndDate = new Date(finalExam.date);
       courseEndDate.setDate(courseEndDate.getDate() + 1);
       
       events.push({
         id: 'course-end',
         date: courseEndDate,
         title: 'Course End',
         description: 'Course completion',
         type: 'course_end',
         isLeft: events.length % 2 === 0
       });
     }

     // Sort by date and then set alternating pattern
     const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
     
     // Set alternating pattern based on chronological order
     sortedEvents.forEach((event, index) => {
       event.isLeft = index % 2 === 0; // Even indices (0, 2, 4...) go left, odd indices (1, 3, 5...) go right
     });
     
     return sortedEvents;
   };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  const timelineEvents = generateTimelineEvents();

  // Handle icon click to move progress
  const handleIconClick = (index) => {
    // Students cannot interact with the timeline
    if (isStudent) return;
    
    let newProgress;
    if (currentProgress === index) {
      // If clicking the same icon, move back to previous
      newProgress = Math.max(0, index - 1);
    } else {
      // Move to clicked position
      newProgress = index;
    }
    
    setCurrentProgress(newProgress);
    
    // Save progress to localStorage
    if (roomId) {
      localStorage.setItem(`timeline-progress-${roomId}`, newProgress.toString());
    }
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body text-center py-8">
          <Calendar className="h-12 w-12 text-base-content/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Timeline Events</h3>
          <p className="text-base-content/70">Add assessments to see the course timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Course Timeline</h2>
          </div>
          {timelineEvents.length > 0 && (
            <div className="text-sm text-base-content/70">
              Progress: {currentProgress + 1} / {timelineEvents.length}
            </div>
          )}
        </div>
        
                         <div className="relative">
          {/* Central timeline line with progress */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-base-300 transform -translate-x-1/2"></div>
          {/* Progress bar overlay */}
          <div 
            className="absolute left-1/2 top-0 w-0.5 bg-primary transform -translate-x-1/2 transition-all duration-500 ease-in-out"
            style={{ 
              height: timelineEvents.length > 0 ? `${((currentProgress + 1) / timelineEvents.length) * 100}%` : '0%'
            }}
          ></div>
           
                       <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Progress indicator for this event */}
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentProgress ? 'bg-primary scale-125' : 'bg-base-300'
                    }`}
                    style={{ top: '50%', marginTop: '-4px' }}
                  ></div>
                                                     {/* Event content */}
                  {event.isLeft ? (
                    <div className="flex items-center">
                      {/* Left side content */}
                      <div className="w-1/2 pr-4">
                        <div className="bg-base-200 border-l-4 border-l-primary p-3 rounded-r-lg max-w-xs">
                          <div className="font-bold text-primary text-sm">{event.title}</div>
                          <div className="text-xs opacity-70 line-clamp-2">{event.description}</div>
                          <div className="text-xs opacity-50 mt-1">{formatDate(event.date)}</div>
                        </div>
                      </div>
                      
                      {/* Center icon */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div 
                          className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
                            index <= currentProgress ? 'bg-primary text-primary-content' : 'bg-base-100'
                          } ${!isStudent ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                          onClick={() => handleIconClick(index)}
                        >
                          {event.type === 'course_start' ? (
                            <CheckCircle className={`h-5 w-5 ${index <= currentProgress ? 'text-primary-content' : 'text-success'}`} />
                          ) : event.type === 'course_end' ? (
                            <GraduationCap className={`h-5 w-5 ${index <= currentProgress ? 'text-primary-content' : 'text-error'}`} />
                          ) : (
                            <div className={index <= currentProgress ? 'text-primary-content' : getAssessmentColor(event.type)}>
                              {getAssessmentIcon(event.type)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {/* Center icon */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div 
                          className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
                            index <= currentProgress ? 'bg-primary text-primary-content' : 'bg-base-100'
                          } ${!isStudent ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                          onClick={() => handleIconClick(index)}
                        >
                          {event.type === 'course_start' ? (
                            <CheckCircle className={`h-5 w-5 ${index <= currentProgress ? 'text-primary-content' : 'text-success'}`} />
                          ) : event.type === 'course_end' ? (
                            <GraduationCap className={`h-5 w-5 ${index <= currentProgress ? 'text-primary-content' : 'text-error'}`} />
                          ) : (
                            <div className={index <= currentProgress ? 'text-primary-content' : getAssessmentColor(event.type)}>
                              {getAssessmentIcon(event.type)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Right side content */}
                      <div className="w-1/2 pl-4 ml-auto">
                        <div className="bg-base-200 border-r-4 border-r-secondary p-3 rounded-l-lg max-w-xs ml-auto">
                          <div className="font-bold text-secondary text-sm">{event.title}</div>
                          <div className="text-xs opacity-70 line-clamp-2">{event.description}</div>
                          <div className="text-xs opacity-50 mt-1">{formatDate(event.date)}</div>
                        </div>
                      </div>
                    </div>
                  )}
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default CourseTimeline;
