import { useState } from "react";
import CourseTimeline from "./CourseTimeline";

const TimelineDemo = () => {
  const [demoRoom] = useState({
    _id: "demo-room-1",
    room_name: "Introduction to Computer Science",
    description: "A comprehensive course covering programming fundamentals",
    createdAt: "2024-01-15T00:00:00.000Z"
  });

  const [demoAssessments] = useState([
    {
      _id: "assessment-1",
      title: "Programming Basics Quiz",
      description: "Test your understanding of basic programming concepts",
      date: "2024-01-20T10:00:00.000Z",
      assessmentType: "quiz"
    },
    {
      _id: "assessment-2",
      title: "Variables and Data Types Assignment",
      description: "Practice working with different data types",
      date: "2024-01-25T23:59:00.000Z",
      assessmentType: "assignment"
    },
    {
      _id: "assessment-3",
      title: "Control Structures Project",
      description: "Build a simple calculator using loops and conditionals",
      date: "2024-02-05T23:59:00.000Z",
      assessmentType: "project"
    },
    {
      _id: "assessment-4",
      title: "Mid-term Exam",
      description: "Comprehensive exam covering first half of the course",
      date: "2024-02-15T14:00:00.000Z",
      assessmentType: "mid_term_exam"
    },
    {
      _id: "assessment-5",
      title: "Final Exam",
      description: "Final comprehensive examination",
      date: "2024-03-15T14:00:00.000Z",
      assessmentType: "final_exam"
    }
  ]);

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Course Timeline Demo</h1>
        <CourseTimeline roomId={demoRoom._id} room={demoRoom} demoAssessments={demoAssessments} />
      </div>
    </div>
  );
};

export default TimelineDemo;
