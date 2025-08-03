import axios from 'axios';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service with methods for different endpoints
const apiService = {
  // Admin endpoints
  admin: {
    // Faculty management
    createFaculty: (facultyData) => apiClient.post('/admin/users', facultyData),
    getAllFaculty: () => apiClient.get('/admin/users'),
    updateFaculty: (id, facultyData) => apiClient.put(`/admin/users/${id}`, facultyData),
    deleteFaculty: (id) => apiClient.delete(`/admin/users/${id}`),
    
    // Student management
    createStudent: (studentData) => apiClient.post('/admin/students', studentData),
    getAllStudents: () => apiClient.get('/admin/students'),
    updateStudent: (id, studentData) => apiClient.put(`/admin/students/${id}`, studentData),
    deleteStudent: (id) => apiClient.delete(`/admin/students/${id}`),
    
    // Course management
    createCourse: (courseData) => apiClient.post('/admin/courses', courseData),
    getAllCourses: () => apiClient.get('/admin/courses'),
    getCourse: (id) => apiClient.get(`/admin/courses/${id}`),
    updateCourse: (id, courseData) => apiClient.put(`/admin/courses/${id}`, courseData),
    deleteCourse: (id) => apiClient.delete(`/admin/courses/${id}`),
    
    // Assignments
    assignFacultyToCourse: (courseId, teacherId) => 
      apiClient.put(`/admin/courses/${courseId}/assign-faculty`, { teacherId }),
    assignStudentToCourse: (courseId, studentIds) => 
      apiClient.put(`/admin/courses/${courseId}/assign-students`, { studentIds }),
    getAllAssignments: () => apiClient.get('/admin/assignments')
  },
  
  // Faculty endpoints
  faculty: {
    // Courses
    getCourses: () => apiClient.get('/faculty/courses'),
    getCourse: (id) => apiClient.get(`/faculty/courses/${id}`),
    
    // Questions
    createQuestion: (questionData) => apiClient.post('/faculty/questions', questionData),
    getQuestions: () => apiClient.get('/faculty/questions'),
    getQuestion: (id) => apiClient.get(`/faculty/questions/${id}`),
    updateQuestion: (id, questionData) => apiClient.put(`/faculty/questions/${id}`, questionData),
    deleteQuestion: (id) => apiClient.delete(`/faculty/questions/${id}`),
    
    // Assignments
    createAssignment: (assignmentData) => apiClient.post('/faculty/assignments', assignmentData),
    getAssignments: () => apiClient.get('/faculty/assignments'),
    getAssignment: (id) => apiClient.get(`/faculty/assignments/${id}`),
    previewAssignmentPDF: (assignmentId, studentId) => 
      apiClient.get(`/faculty/assignments/${assignmentId}/preview/${studentId}`, { responseType: 'blob' }),
    emailAssignmentToStudents: (assignmentId) => 
      apiClient.post(`/faculty/assignments/${assignmentId}/email`),
    emailAssignment: (assignmentId) => 
      apiClient.post(`/faculty/assignments/${assignmentId}/email`),
    emailAssignmentToStudent: (assignmentId, studentId) => 
      apiClient.post(`/faculty/assignments/${assignmentId}/email/${studentId}`),
    deleteAssignment: (id) => apiClient.delete(`/faculty/assignments/${id}`),
    updateAssignment: (id, assignmentData) => apiClient.put(`/faculty/assignments/${id}`, assignmentData)
  },
  
  // Student endpoints
  student: {
    // Courses
    getCourses: () => apiClient.get('/student/courses'),
    getCourseById: (courseId) => apiClient.get(`/student/courses/${courseId}`),
    
    // Assignments
    getAssignments: () => apiClient.get('/student/assignments'),
    getAssignmentsByCourse: (courseId) => apiClient.get(`/student/assignments?courseId=${courseId}`),
    getAssignmentById: (assignmentId) => apiClient.get(`/student/assignments/${assignmentId}`),
    
    // PDF preview
    previewAssignmentPdf: (assignmentId) => apiClient.get(`/student/assignments/${assignmentId}/preview`, { responseType: 'blob' }),
    
    // Submission functionality
    submitAssignment: (assignmentId, formData) => apiClient.post(`/student/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    getSubmission: (assignmentId) => apiClient.get(`/student/assignments/${assignmentId}/submission`)
  },
  
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    getCurrentUser: () => apiClient.get('/auth/me'),
    changePassword: (passwordData) => apiClient.post('/auth/change-password', passwordData),
    changeAppPassword: (appPasswordData) => apiClient.post('/auth/change-app-password', appPasswordData)
  }
};

export default apiService;