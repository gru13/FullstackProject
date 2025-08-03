import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const StudentCourses = () => {
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
        
        // Fetch assignments to count per course
        const assignmentsResponse = await apiService.student.getAssignments();
        setAssignments(assignmentsResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Count assignments for a course
  const countAssignments = (courseId) => {
    return assignments.filter(a => a.courseId === courseId).length;
  };

  // Count upcoming assignments for a course
  const countUpcomingAssignments = (courseId) => {
    const now = new Date();
    return assignments.filter(a => 
      a.courseId === courseId && 
      new Date(a.dueDate) > now && 
      !a.submitted
    ).length;
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
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const assignmentCount = countAssignments(course._id);
            const upcomingCount = countUpcomingAssignments(course._id);
            
            return (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{course.courseName}</h2>
                  
                  {course.faculty && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Faculty:</span> {course.faculty.name || 'Unknown'}
                    </p>
                  )}
                  
                  <div className="flex space-x-4 mb-4">
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium">
                      {assignmentCount} Assignment{assignmentCount !== 1 ? 's' : ''}
                    </div>
                    {upcomingCount > 0 && (
                      <div className="bg-yellow-50 px-3 py-1 rounded-full text-yellow-700 text-sm font-medium">
                        {upcomingCount} Upcoming
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/student/courses/${course._id}`}
                    className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;