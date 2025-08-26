// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    // Determine user role based on the response structure
    let role = 'student'; // default
    if (userData.institution) {
      role = 'institution';
    } else if (userData.instructor) {
      role = 'instructor';
    } else if (userData.student) {
      role = 'student';
    }

    // Create a unified user object
    const user = {
      id: userData.institution?.id || userData.instructor?.id || userData.student?.id,
      name: userData.institution?.name || userData.instructor?.name || userData.student?.name,
      email: userData.institution?.email || userData.instructor?.email || userData.student?.email,
      role: role,
      slug: userData.institution?.slug,
      ...userData // Keep all original data
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isInstitution: user?.role === 'institution',
    isInstructor: user?.role === 'instructor',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};