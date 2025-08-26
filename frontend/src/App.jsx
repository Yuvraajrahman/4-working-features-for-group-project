// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Home
import Home from "./pages/Home.jsx";

// Auth
import AuthLogin from "./pages/auth/Login.jsx";
import AuthSignup from "./pages/auth/Signup.jsx";

// Institution
import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import I_Dashboard from "./pages/institution/I_Dashboard.jsx";
import InstitutionRooms from "./pages/institution/InstitutionRooms.jsx";
import AddRoom from "./pages/institution/AddRoom.jsx";
import AddInstructor from "./pages/institution/AddInstructor.jsx";
import StudentList from "./pages/institution/StudentList.jsx";
import InstructorList from "./pages/institution/InstructorList.jsx";
import InstitutionSettings from "./pages/institution/InstitutionSettings.jsx";
import AddStudent from "./pages/institution/AddStudent";
import EditRoom from "./pages/institution/EditRoom.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Teacher
import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";
import T_AssignmentDetail from "./pages/teacher/T_AssignmentDetail.jsx";

import S_Dashboard from "./pages/student/S_Dashboard.jsx";
import S_Room from "./pages/student/S_Room.jsx";
import S_Profile from "./pages/student/S_Profile.jsx";
import S_AssignmentDetail from "./pages/student/S_AssignmentDetail.jsx";

// Yuvraj Announcements
import Yuvraj_Announcements from "./pages/yuvraj_Announcements.jsx";
import Yuvraj_AnnouncementDetail from "./pages/yuvraj_AnnouncementDetail.jsx";
import Yuvraj_AnnouncementEditor from "./pages/yuvraj_AnnouncementEditor.jsx";
import Yuvraj_Resources from "./pages/yuvraj_Resources.jsx";
import Yuvraj_Helpdesk from "./pages/yuvraj_Helpdesk.jsx";
import Yuvraj_Polls from "./pages/yuvraj_Polls.jsx";
import TimelineDemo from "./components/room/TimelineDemo.jsx";

export default function App() {
  return (
    <div data-theme="nord">
      <Routes>
        {/* 1. Home page */}
        <Route path="/" element={<Home />} />

        {/* 2. Auth (login/signup) */}
        <Route path="/auth/login" element={<AuthLogin />} />
        <Route path="/auth/signup" element={<AuthSignup />} />

        {/* 3. Legacy redirect for old login path */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />

        {/* Yuvraj Announcements - Role-based access (MUST come before dynamic institution routes) */}
        <Route path="/yuvraj/announcements" element={<Yuvraj_Announcements />} />
        <Route path="/yuvraj/announcements/:id" element={<Yuvraj_AnnouncementDetail />} />
        <Route path="/yuvraj/institution/announcements/new" element={
          <ProtectedRoute requiredRole="institution">
            <Yuvraj_AnnouncementEditor />
          </ProtectedRoute>
        } />
        <Route path="/yuvraj/institution/announcements/edit/:id" element={
          <ProtectedRoute requiredRole="institution">
            <Yuvraj_AnnouncementEditor />
          </ProtectedRoute>
        } />

        {/* Yuvraj Resources, Helpdesk, Polls */}
        <Route path="/yuvraj/resources" element={<Yuvraj_Resources />} />
        <Route path="/yuvraj/helpdesk" element={<Yuvraj_Helpdesk />} />
        <Route path="/yuvraj/polls" element={<Yuvraj_Polls />} />

        {/* 4. Admin - REMOVED - replaced with institution role */}
        {/* <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          }
        /> */}

        {/* 5. Dynamic Institution Routes */}
        <Route path="/:idOrName" element={
          <ProtectedRoute requiredRole="institution">
            <InstitutionLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route index element={<I_Dashboard />} />
          <Route path="dashboard" element={<I_Dashboard />} />

          {/* Rooms */}
          <Route path="rooms" element={<InstitutionRooms />} />
          <Route path="rooms/:roomId/edit" element={<EditRoom />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="add-instructor" element={<AddInstructor />} />

          {/* People */}
          <Route path="students" element={<StudentList />} />
          <Route path="instructors" element={<InstructorList />} />
          <Route path="add-student" element={<AddStudent />} />

          {/* Settings */}
          <Route path="settings" element={<InstitutionSettings />} />
        </Route>

        {/* 6. Teacher */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/create/room" element={
          <ProtectedRoute requiredRole="instructor">
            <T_CreateRoom />
          </ProtectedRoute>
        } />
        <Route path="/teacher/room/:id/forum" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Room />
          </ProtectedRoute>
        } />
        <Route path="/teacher/room/:id/materials" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Room />
          </ProtectedRoute>
        } />
        <Route path="/teacher/room/:id/assessment" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Room />
          </ProtectedRoute>
        } />
        <Route path="/teacher/room/:id/assessment/:assessmentId" element={
          <ProtectedRoute requiredRole="instructor">
            <T_AssignmentDetail />
          </ProtectedRoute>
        } />
        <Route path="/teacher/room/:id/edit" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Room />
          </ProtectedRoute>
        } />
        <Route path="/teacher/room/:id" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Room />
          </ProtectedRoute>
        } />
        <Route path="/teacher/edit/room/:id" element={
          <ProtectedRoute requiredRole="instructor">
            <T_Room />
          </ProtectedRoute>
        } />

        {/* Student routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <S_Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute requiredRole="student">
            <S_Profile />
          </ProtectedRoute>
        } />
        <Route path="/student/room/:id/forum" element={
          <ProtectedRoute requiredRole="student">
            <S_Room />
          </ProtectedRoute>
        } />
        <Route path="/student/room/:id/materials" element={
          <ProtectedRoute requiredRole="student">
            <S_Room />
          </ProtectedRoute>
        } />
        <Route path="/student/room/:id/assessment" element={
          <ProtectedRoute requiredRole="student">
            <S_Room />
          </ProtectedRoute>
        } />
        <Route path="/student/room/:id/assessment/:assessmentId" element={
          <ProtectedRoute requiredRole="student">
            <S_AssignmentDetail />
          </ProtectedRoute>
        } />
        {/* Redirect old URL to new forum URL for backward compatibility */}
        <Route path="/student/room/:id" element={
          <ProtectedRoute requiredRole="student">
            <S_Room />
          </ProtectedRoute>
        } />

        {/* Yuvraj Polls and Q&A - REMOVED - only institution can create announcements */}
        {/* <Route path="/yuvraj/polls/new" element={
          <ProtectedRoute requiredRole="instructor">
            <div className="min-h-screen bg-gray-50 p-6">
              <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Create New Poll</h1>
                <p className="text-gray-600">This feature is coming soon!</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/yuvraj/qna/new" element={
          <ProtectedRoute requiredRole="instructor">
            <div className="min-h-screen bg-gray-50 p-6">
              <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Create Q&A Form</h1>
                <p className="text-gray-600">This feature is coming soon!</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } /> */}
        
        {/* Demo route for timeline testing */}
        <Route path="/demo/timeline" element={<TimelineDemo />} />

        {/* 8. Catch-all 404 */}
        <Route
          path="*"
          element={<p>Page not found: {window.location.pathname}</p>}
        />
      </Routes>
    </div>
  );
}