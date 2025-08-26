// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";
import HamburgerMenu from "../../components/HamburgerMenu.jsx";

export default function Login() {
  const [role, setRole] = useState("institution");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If ProtectedRoute redirected us here, it will stash the original path in `location.state.from`
  const fromPath = location.state?.from;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Build the base path for API calls
    const base =
      role === "instructor"
        ? "/instructors"
        : role === "student"
        ? "/students"
        : "/institutions";

    try {
      const endpoint = `${base}/login`;
      const { data } = await api.post(endpoint, form);

      // Create user object with role and data
      const userData = {
        role,
        ...(role === "institution" ? data.institution : 
           role === "instructor" ? data.instructor : data.student)
      };

      // Use AuthContext login
      login(data.token, userData);

      // Determine default path after login
      let defaultPath;
      if (role === "institution") {
        defaultPath = `/${data.institution.slug}/dashboard`;
      } else if (role === "instructor") {
        defaultPath = "/teacher/dashboard";
      } else {
        defaultPath = "/student/dashboard";
      }

      // If someone was trying to hit a protected URL, use that; otherwise use our default
      const redirectTo = fromPath || defaultPath;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hamburger Menu for Login page */}
      <div className="fixed top-4 left-4 z-50">
        <HamburgerMenu />
      </div>
      
      <Navbar />
      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {role.charAt(0).toUpperCase() + role.slice(1)} Login
          </h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="mb-4 text-center">
          <label className="text-sm mr-2 text-gray-700">Role:</label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setForm({});
              setError("");
            }}
            className="border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="institution">Institution</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" label="Email" type="email" onChange={handleChange} />
          <Input name="password" label="Password" type="password" onChange={handleChange} />

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-md font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-sky-500 hover:text-sky-600 font-medium hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

// Extracted Input component
function Input({ name, label, type = "text", onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        onChange={onChange}
        required
        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
    </div>
  );
}
