// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import HamburgerMenu from "../components/HamburgerMenu.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInstitution, isInstructor, isStudent } = useAuth();

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleSignup = () => {
    navigate("/auth/signup");
  };

  const handleDashboard = () => {
    if (isInstitution) {
      navigate(`/${user.slug || 'demo-institution'}/dashboard`);
    } else if (isInstructor) {
      navigate("/teacher/dashboard");
    } else if (isStudent) {
      navigate("/student/dashboard");
    }
  };

  const handleAnnouncements = () => {
    navigate("/yuvraj/announcements");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu for Home page */}
      <div className="fixed top-4 left-4 z-50">
        <HamburgerMenu />
      </div>
      
      <Navbar />
      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex-1 pr-8">
          <h1 className="text-4xl font-medium text-gray-800 mb-4">
            Welcome to <span className="text-sky-500">Atsen,</span>
          </h1>
          <p className="text-lg text-gray-600">
            The comprehensive learning management system.
          </p>
          
          {/* Show role-specific welcome message */}
          {isAuthenticated && (
            <div className="mt-4 p-4 bg-sky-50 rounded-lg border border-sky-200">
              <p className="text-sky-800 font-medium">
                Welcome back, {user?.name}! You're logged in as a {user?.role}.
              </p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100 min-w-80">
            {isAuthenticated ? (
              // Show dashboard options for logged-in users
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">What would you like to do today?</p>
              </div>
            ) : (
              // Show login/signup for guests
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Get Started</h2>
                <p className="text-gray-600">Join thousands of learners worldwide</p>
              </div>
            )}
            
            <div className="space-y-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                  
                  <button
                    onClick={handleAnnouncements}
                    className="w-full bg-white hover:bg-gray-50 text-sky-500 py-3 px-4 rounded-lg font-medium border-2 border-sky-500 transition-colors duration-200"
                  >
                    View Announcements
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Login
                  </button>
                  
                  <button
                    onClick={handleSignup}
                    className="w-full bg-white hover:bg-gray-50 text-sky-500 py-3 px-4 rounded-lg font-medium border-2 border-sky-500 transition-colors duration-200"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
            
            {!isAuthenticated && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
