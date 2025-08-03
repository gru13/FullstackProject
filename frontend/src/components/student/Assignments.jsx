import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch student's assignments
        const assignmentsResponse = await apiService.student.getAssignments();
        setAssignments(assignmentsResponse.data);
        
        // Fetch courses for reference
        const coursesResponse = await apiService.student.getCourses();
        setCourses(coursesResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again.');
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

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.courseName : 'Unknown Course';
  };

  // Filter assignments based on selected filter
  const filteredAssignments = () => {
    const now = new Date();
    
    switch(filter) {
      case 'upcoming':
        return assignments.filter(a => new Date(a.dueDate) > now)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'past':
        return assignments.filter(a => new Date(a.dueDate) <= now)
          .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      case 'submitted':
        return assignments.filter(a => a.submitted)
          .sort((a, b) => new Date(b.submittedAt || b.dueDate) - new Date(a.submittedAt || a.dueDate));
      case 'pending':
        return assignments.filter(a => !a.submitted && new Date(a.dueDate) > now)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      default: // 'all'
        return [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
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
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
      
      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('upcoming')} 
          className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('submitted')} 
          className={`px-4 py-2 rounded-md ${filter === 'submitted' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Submitted
        </button>
        <button 
          onClick={() => setFilter('past')} 
          className={`px-4 py-2 rounded-md ${filter === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Past
        </button>
      </div>

      {/* Assignments Table */}
      {filteredAssignments().length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No assignments found for the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments().map((assignment) => {
                  const isPastDue = new Date(assignment.dueDate) < new Date();
                  const isSubmitted = assignment.submitted;
                  
                  let statusClass = 'bg-yellow-100 text-yellow-800'; // Pending
                  if (isSubmitted) {
                    statusClass = 'bg-green-100 text-green-800'; // Submitted
                  } else if (isPastDue) {
                    statusClass = 'bg-red-100 text-red-800'; // Late/Missed
                  }
                  
                  return (
                    <tr key={assignment._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.name}</div>
                        {assignment.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getCourseName(assignment.courseId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {isSubmitted ? 'Submitted' : isPastDue ? 'Late' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/student/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </Link>
                        {!isSubmitted && (
                          <Link to={`/student/assignments/${assignment._id}/submit`} className="text-green-600 hover:text-green-900">
                            Submit
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;