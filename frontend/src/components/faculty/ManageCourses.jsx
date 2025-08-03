import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingAssignmentsMap, setUpcomingAssignmentsMap] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
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

  useEffect(() => {
    const fetchUpcomingForCourses = async () => {
      const map = {};
      for (let course of courses) {
        try {
          const res = await apiService.faculty.getUpcomingAssignments(course._id);
          map[course._id] = res.data.filter((a) => new Date(a.dueDate) > new Date());
        } catch {
          map[course._id] = [];
        }
      }
      setUpcomingAssignmentsMap(map);
    };

    if (courses.length > 0) fetchUpcomingForCourses();
  }, [courses]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Courses</h1>

      {courses.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-500 shadow">
          You are not assigned to any courses yet. Contact an administrator.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white shadow rounded-2xl p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{course.courseName}</h2>
                  <p className="text-gray-500 text-sm">
                    Students Enrolled: <span className="font-medium">{course.students?.length || 0}</span>
                  </p>
                </div>
                {console.log("course from coursepage", course)}
                <Link
                  to={`/faculty/courses/${course._id}`}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                >
                  View
                </Link>
              </div>

              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Quick Actions</h3>
                <Link
                  to={`/faculty/assignments/new?courseId=${course._id}`}
                  className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md"
                >
                  + Create Assignment
                </Link>
              </div>

              {upcomingAssignmentsMap[course._id]?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Assignments</h3>
                  <ul className="text-sm divide-y divide-gray-200">
                    {upcomingAssignmentsMap[course._id].map((assignment) => (
                      <li key={assignment._id} className="py-2 flex justify-between">
                        <span className="text-gray-800 font-medium">{assignment.name}</span>
                        <span className="text-gray-500">Due: {formatDate(assignment.dueDate)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;