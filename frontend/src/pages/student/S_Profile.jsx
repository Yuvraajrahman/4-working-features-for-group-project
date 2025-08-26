import { useState, useEffect } from "react";
import { Link } from "react-router";
import { User, Mail, Calendar, BookOpen, ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar";

const S_Profile = () => {
  const [profile, setProfile] = useState({
    name: "Student Name",
    email: "student@example.com",
    enrollmentDate: "2024-01-01",
    enrolledCourses: 3
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to Dashboard Button */}
          <div className="mb-6">
            <Link to="/student/dashboard" className="flex items-center text-gray-600 hover:text-sky-600 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg mb-6 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-sky-500 text-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold">{profile.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                  <p className="text-gray-600">Student</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="font-medium text-gray-800">Name</p>
                      <p className="text-gray-600">{profile.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="font-medium text-gray-800">Enrollment Date</p>
                      <p className="text-gray-600">{profile.enrollmentDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="font-medium">Enrolled Courses</p>
                      <p className="text-base-content/70">{profile.enrolledCourses} courses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-primary-content">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Student Status</p>
                      <p className="text-base-content/70">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/student/dashboard" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View My Courses
                </Link>
                <button className="border border-sky-500 text-sky-600 hover:bg-sky-50 px-4 py-2 rounded-lg flex items-center transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Profile;
