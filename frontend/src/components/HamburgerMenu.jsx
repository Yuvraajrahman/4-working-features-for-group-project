import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, Users, BookOpen, Calendar, Video, MessageCircle, FileText, Award, Settings, HelpCircle, BarChart3, Youtube, Presentation } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isInstitution, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "institution":
        return `/${user.slug || 'demo-institution'}/dashboard`;
      case "instructor":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  const MenuItem = ({ icon: Icon, title, description, onClick, href, disabled = false }) => (
    <div 
      className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
          : 'hover:bg-sky-50 hover:border-sky-200'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${disabled ? 'bg-gray-200' : 'bg-sky-100'}`}>
          <Icon className={`h-5 w-5 ${disabled ? 'text-gray-500' : 'text-sky-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
          {disabled && (
            <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeMenu} />
      )}

      {/* Menu Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-sky-50">
          <div className="flex items-center space-x-3">
            <img src="/Atsenlogo.png" alt="ATSEN" className="h-8 w-8" />
            <span className="text-lg font-semibold text-sky-800">ATSEN Menu</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <X className="h-5 w-5 text-sky-600" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="overflow-y-auto h-full pb-20">
          {/* Quick Actions */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <MenuItem
                icon={Home}
                title="Home"
                description="Go to main page"
                onClick={() => handleNavigation("/")}
              />
              {isAuthenticated && (
                <MenuItem
                  icon={Users}
                  title="Dashboard"
                  description={`Go to ${user?.role} dashboard`}
                  onClick={() => handleNavigation(getDashboardLink())}
                />
              )}
            </div>
          </div>

          {/* Core Features */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Core Features
            </h2>
            <div className="space-y-2">
              <MenuItem
                icon={BookOpen}
                title="Rooms & Courses"
                description="Manage learning spaces and course content"
                onClick={() => handleNavigation(isInstitution ? `/${user?.slug || 'demo-institution'}/rooms` : "/teacher/dashboard")}
              />
              <MenuItem
                icon={Calendar}
                title="Study Timeline"
                description="View and manage study schedules and assessments"
                onClick={() => handleNavigation("/demo/timeline")}
              />
              <MenuItem
                icon={FileText}
                title="Assignments & Assessments"
                description="Create, submit, and grade academic work"
                onClick={() => handleNavigation(isInstructor ? "/teacher/dashboard" : "/student/dashboard")}
              />
              <MenuItem
                icon={MessageCircle}
                title="Discussion Forums"
                description="Participate in course discussions and Q&A"
                onClick={() => handleNavigation(isInstructor ? "/teacher/dashboard" : "/student/dashboard")}
              />
            </div>
          </div>

          {/* Communication & Collaboration */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Communication & Collaboration
            </h2>
            <div className="space-y-2">
              <MenuItem
                icon={Video}
                title="Video Conferencing"
                description="Join online classes and consultation sessions"
                disabled={true}
              />
              <MenuItem
                icon={MessageCircle}
                title="Chat & Messaging"
                description="One-on-one and group chat with file sharing"
                disabled={true}
              />
              <MenuItem
                icon={BarChart3}
                title="Announcements"
                description="View and manage important updates"
                onClick={() => handleNavigation("/yuvraj/announcements")}
              />
              <MenuItem
                icon={BarChart3}
                title="Polls & Surveys"
                description="Create polls, Q&A, and evaluations"
                onClick={() => handleNavigation("/yuvraj/polls")}
              />
            </div>
          </div>

          {/* Content & Resources */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Content & Resources
            </h2>
            <div className="space-y-2">
              <MenuItem
                icon={Youtube}
                title="Resources"
                description="Videos and documents by course"
                onClick={() => handleNavigation("/yuvraj/resources")}
              />
              <MenuItem
                icon={FileText}
                title="Learning Materials"
                description="Access course documents and resources"
                onClick={() => handleNavigation(isInstructor ? "/teacher/dashboard" : "/student/dashboard")}
              />
              <MenuItem
                icon={FileText}
                title="Document System"
                description="Request and download reports with tracking"
                disabled={true}
              />
            </div>
          </div>

          {/* Management & Administration */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Management & Administration
            </h2>
            <div className="space-y-2">
              {isInstitution && (
                <>
                  <MenuItem
                    icon={Users}
                    title="Manage Instructors"
                    description="Add and manage teaching staff"
                    onClick={() => handleNavigation(`/${user?.slug || 'demo-institution'}/instructors`)}
                  />
                  <MenuItem
                    icon={Users}
                    title="Manage Students"
                    description="Add and manage student enrollment"
                    onClick={() => handleNavigation(`/${user?.slug || 'demo-institution'}/students`)}
                  />
                </>
              )}
              <MenuItem
                icon={Award}
                title="Student Achievements"
                description="Track academic milestones and progress"
                disabled={true}
              />
              <MenuItem
                icon={HelpCircle}
                title="Helpdesk"
                description="Submit requests and track status"
                onClick={() => handleNavigation("/yuvraj/helpdesk")}
              />
            </div>
          </div>

          {/* User & Settings */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              User & Settings
            </h2>
            <div className="space-y-2">
              {isStudent && (
                <MenuItem
                  icon={Settings}
                  title="Student Profile"
                  description="Customize your profile and preferences"
                  onClick={() => handleNavigation("/student/profile")}
                />
              )}
              <MenuItem
                icon={Settings}
                title="Profile Customization"
                description="Personalize your account settings"
                disabled={true}
              />
              {/* Dark Mode removed per requirements */}
            </div>
          </div>

          {/* Announcements */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Announcements & Updates
            </h2>
            <div className="space-y-2">
              <MenuItem
                icon={MessageCircle}
                title="View Announcements"
                description="Stay updated with important information"
                onClick={() => handleNavigation("/yuvraj/announcements")}
              />
              {isInstitution && (
                <MenuItem
                  icon={MessageCircle}
                  title="Create Announcements"
                  description="Share important updates with your community"
                  onClick={() => handleNavigation("/yuvraj/institution/announcements/new")}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isAuthenticated ? `Logged in as ${user?.name || user?.role}` : 'Not logged in'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => {
                  closeMenu();
                  // Trigger logout
                  window.location.href = '/';
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
