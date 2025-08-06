import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/Dashboard';
import FacultyDashboard from './components/faculty/Dashboard';
import ManageFaculty from './components/admin/ManageFaculty';
import ManageStudents from './components/admin/ManageStudents';
import ManageCourses from './components/admin/ManageCourses';
import AdminCourseDetails from './components/admin/CourseDetails';
import ManageQuestions from './components/faculty/ManageQuestions';
import ManageAssignments from './components/faculty/ManageAssignments';
import AssignmentDetails from './components/faculty/AssignmentDetails';
import FacultyCourseDetails from './components/faculty/CourseDetails';
import FacultyManageCourses from './components/faculty/ManageCourses';
import Unauthorized from './components/common/Unauthorized';
import Profile from './components/faculty/Profile';
import authService from './services/auth.service';

import { Link, useNavigate } from 'react-router-dom';


// Admin Layout Component
const AdminLayout = () => {
const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <nav className="px-3 mt-6">
          <a href="/admin" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a href="/admin/faculty" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Manage Faculty</span>
          </a>
          <a href="/admin/students" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Manage Students</span>
          </a>
          <a href="/admin/courses" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Manage Courses</span>
          </a>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button
             onClick={() => {
              authService.logout();
              navigate('/login');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium w-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

// Faculty Layout Component
const FacultyLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            Faculty Panel
          </h2> 
        </div>
        <nav className="px-3 mt-6">
          <a href="/faculty" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-cyan-400">Dashboard</span>
          </a>
          <a href="/faculty/courses/manage" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-cyan-400">My Courses</span>
          </a>
          <a href="/faculty/questions" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8m-4-8v8m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-cyan-400">Manage Questions</span>
          </a>
          <a href="/faculty/assignments" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-cyan-400">Manage Assignments</span>
          </a>
          <a href="/faculty/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 0112 15a4 4 0 016.879 2.804M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-cyan-400">My Profile</span>
          </a>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={() => {
              authService.logout();
              navigate('/login');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium w-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication from local storage
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (token && user && user.role) {
        setIsAuthenticated(true);
        setUserRole(user.role);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="faculty" element={<ManageFaculty />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="courses/:id" element={<AdminCourseDetails />} />
        </Route>
        
        {/* Faculty Routes */}
        <Route path="/faculty" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<FacultyDashboard />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="assignments" element={<ManageAssignments />} />
          <Route path="assignments/:id" element={<AssignmentDetails />} />
          <Route path="courses/manage" element={<FacultyManageCourses />} />
          <Route path="courses/:id" element={<FacultyCourseDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
