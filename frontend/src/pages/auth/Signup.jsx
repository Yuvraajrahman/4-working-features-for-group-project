// src/pages/auth/Signup.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";
import HamburgerMenu from "../../components/HamburgerMenu.jsx";
import { yuvrajListInstitutions } from "../../services/yuvraj_institutions_api.js";
import { yuvrajCreateSignupRequest } from "../../services/yuvraj_signup_api.js";

export default function Signup() {
  const [role, setRole] = useState("institution");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [institutionSlug, setInstitutionSlug] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    yuvrajListInstitutions().then(setInstitutions).catch(() => setInstitutions([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-convert email to lowercase
    const processedValue = name === 'email' ? value.toLowerCase() : value;
    setForm({ ...form, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (role === "institution") {
        const endpoint = `/institutions/register`;
        await api.post(endpoint, form);
        setSuccess("🎉 Registration successful! Please log in with your credentials.");
        setForm({});
        setTimeout(() => navigate("/auth/login"), 1500);
      } else {
        if (!institutionSlug) {
          setError("Please select an institution to join.");
          return;
        }
        await yuvrajCreateSignupRequest({ role, name: form.name, email: form.email, institutionSlug });
        setSuccess("Account created successfully! You can now log in with your credentials.");
        setForm({});
        setTimeout(() => navigate("/auth/login"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hamburger Menu for Signup page */}
      <div className="fixed top-4 left-4 z-50">
        <HamburgerMenu />
      </div>
      
      <Navbar />
      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {role.charAt(0).toUpperCase() + role.slice(1)} Registration
          </h2>
          <p className="text-gray-600">Create your new account</p>
        </div>

        <div className="mb-4 text-center">
          <label className="text-sm mr-2 text-gray-700">Role:</label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setForm({});
              setError("");
              setSuccess("");
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

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration fields based on role */}
          {role === "institution" && (
            <>
              <Input name="name" label="Institution Name" onChange={handleChange} />
              <Input name="eiin" label="EIIN" onChange={handleChange} />
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}
          
          {role === "instructor" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select
                  className="border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full"
                  value={institutionSlug}
                  onChange={(e) => setInstitutionSlug(e.target.value)}
                  required
                >
                  <option value="">Select institution</option>
                  {institutions.map((i) => (
                    <option key={i.slug || i._id} value={i.slug || i._id}>{i.name || i.slug}</option>
                  ))}
                </select>
              </div>
              <Input name="name" label="Full Name" onChange={handleChange} />
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}
          
          {role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select
                  className="border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full"
                  value={institutionSlug}
                  onChange={(e) => setInstitutionSlug(e.target.value)}
                  required
                >
                  <option value="">Select institution</option>
                  {institutions.map((i) => (
                    <option key={i.slug || i._id} value={i.slug || i._id}>{i.name || i.slug}</option>
                  ))}
                </select>
              </div>
              <Input name="name" label="Full Name" onChange={handleChange} />
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-md font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-sky-500 hover:text-sky-600 font-medium hover:underline"
            >
              Login here
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
