import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch student's courses
        const coursesResponse = await apiService.student.getCourses();
        setCourses(coursesResponse.data);
        
        // Fetch student's assignments
        const assignmentsResponse = await apiService.student.getAssignments();
        setAssignments(assignmentsResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Filter for upcoming assignments (due in the future)
  const upcomingAssignments = assignments.filter(assignment => 
    new Date(assignment.dueDate) > new Date()
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Filter for past assignments (due date has passed)
  const pastAssignments = assignments.filter(assignment => 
    new Date(assignment.dueDate) <= new Date()
  ).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-500 font-medium">Enrolled Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-500 font-medium">Assignments</p>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-500 font-medium">Upcoming Due</p>
              <p className="text-2xl font-bold">{upcomingAssignments.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-500 font-medium">Completed</p>
              <p className="text-2xl font-bold">{pastAssignments.filter(a => a.submitted).length}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link to="/student/courses" className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
              View All Courses
            </Link>
            <Link to="/student/assignments" className="block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center">
              View All Assignments
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Upcoming Assignments</h2>
        {upcomingAssignments.length === 0 ? (
          <p className="text-gray-500">No upcoming assignments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAssignments.slice(0, 5).map((assignment) => {
                  const course = courses.find(c => c._id === assignment.courseId);
                  return (
                    <tr key={assignment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{course ? course.courseName : 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/student/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-900">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {upcomingAssignments.length > 5 && (
              <div className="mt-4 text-center">
                <Link to="/student/assignments" className="text-blue-600 hover:text-blue-900">
                  View all {upcomingAssignments.length} upcoming assignments
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">You are not enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                <p className="text-sm text-gray-500 mt-1">Assignments: {assignments.filter(a => a.courseId === course._id).length}</p>
                <Link to={`/student/courses/${course._id}`} className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-900">
                  View Course
                </Link>
              </div>
            ))}
          </div>
        )}
        {courses.length > 6 && (
          <div className="mt-4 text-center">
            <Link to="/student/courses" className="text-blue-600 hover:text-blue-900">
              View all {courses.length} courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;