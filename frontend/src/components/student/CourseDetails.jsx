import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const StudentCourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseResponse = await apiService.student.getCourseById(id);
        setCourse(courseResponse.data);
        
        // Fetch assignments for this course
        const assignmentsResponse = await apiService.student.getAssignmentsByCourse(id);
        setAssignments(assignmentsResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

  if (!course) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">Course not found or you don't have access to this course.</span>
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
      <div className="mb-6">
        <Link to="/student/courses" className="text-blue-500 hover:text-blue-700">
          &larr; Back to Courses
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{course.courseName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {course.description && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{course.description}</p>
              </div>
            )}
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Faculty</h2>
              <p className="text-gray-700">{course.faculty?.name || 'Not assigned'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Course Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-500 font-medium">Total Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-500 font-medium">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingAssignments.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-500 font-medium">Submitted</p>
                <p className="text-2xl font-bold">{assignments.filter(a => a.submitted).length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-500 font-medium">Past Due</p>
                <p className="text-2xl font-bold">
                  {pastAssignments.filter(a => !a.submitted).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Assignments</h2>
        {upcomingAssignments.length === 0 ? (
          <p className="text-gray-500">No upcoming assignments for this course.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.submitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {assignment.submitted ? 'Submitted' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/student/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      {!assignment.submitted && (
                        <Link to={`/student/assignments/${assignment._id}/submit`} className="text-green-600 hover:text-green-900">
                          Submit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Past Assignments</h2>
        {pastAssignments.length === 0 ? (
          <p className="text-gray-500">No past assignments for this course.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.submitted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {assignment.submitted ? 'Submitted' : 'Missed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/student/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetails;