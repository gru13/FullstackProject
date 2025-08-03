import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await apiService.faculty.getCourses();
        setCourses(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get upcoming assignments for a course
  const getUpcomingAssignments = async (courseId) => {
    try {
      const response = await apiService.faculty.getUpcomingAssignments(courseId);
      return response.data.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        return dueDate > now;
      });
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
      return [];
    }
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Courses</h1>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No courses assigned to you yet. Please contact an administrator to be assigned to courses.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => {
            const upcomingAssignments = getUpcomingAssignments(course._id);
            return (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{course.courseName}</h2>
                      <p className="text-gray-600 mb-4">
                        <span className="font-semibold">Students:</span> {course.students?.length || 0}
                      </p>
                    </div>
                    <Link
                      to={`/faculty/courses/${course._id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      View Details
                    </Link>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/faculty/questions?courseId=${course._id}`}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
                      >
                        Manage Questions
                      </Link>
                      <Link
                        to={`/faculty/assignments/new?courseId=${course._id}`}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
                      >
                        Create Assignment
                      </Link>
                    </div>
                  </div>
                  
                  {upcomingAssignments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Upcoming Assignments</h3>
                      <ul className="divide-y divide-gray-200">
                        {upcomingAssignments.map(assignment => (
                          <li key={assignment._id} className="py-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{assignment.name}</span>
                              <span className="text-gray-500">Due: {formatDate(assignment.dueDate)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;