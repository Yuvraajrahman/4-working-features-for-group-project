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
    let userObj = userData;
    
    if (userData.institution) {
      role = 'institution';
      userObj = userData.institution;
    } else if (userData.instructor) {
      role = 'instructor'; 
      userObj = userData.instructor;
    } else if (userData.student) {
      role = 'student';
      userObj = userData.student;
    } else if (userData.admin) {
      role = 'admin';
      userObj = userData.admin;
    }

    // Create a unified user object
    const user = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: role,
      slug: userObj.slug || userObj.institutionSlug,
      institutionName: userObj.institutionName,
      ...userObj // Keep all original data
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
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};