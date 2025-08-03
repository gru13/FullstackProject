import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';

const ManageAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    courseId: '',
    totalMarks: 100,
    difficultyDistribution: {
      easy: 30,
      medium: 40,
      hard: 30
    }
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [emailStatus, setEmailStatus] = useState({});

  // Fetch assignments and courses
  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, coursesRes] = await Promise.all([
        apiService.faculty.getAssignments(),
        apiService.faculty.getCourses()
      ]);
      setAssignments(assignmentsRes.data);
      setCourses(coursesRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('difficulty.')) {
      const difficulty = name.split('.')[1];
      setFormData({
        ...formData,
        difficultyDistribution: {
          ...formData.difficultyDistribution,
          [difficulty]: parseInt(value, 10)
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validate form
    if (!formData.name || !formData.courseId || !formData.dueDate) {
      setFormError('Name, course, and due date are required');
      return;
    }

    // Validate difficulty distribution adds up to 100%
    const { easy, medium, hard } = formData.difficultyDistribution;
    if (easy + medium + hard !== 100) {
      setFormError('Difficulty distribution must add up to 100%');
      return;
    }

    try {
      await apiService.faculty.createAssignment(formData);
      setFormSuccess('Assignment created successfully');
      setFormData({
        name: '',
        description: '',
        dueDate: '',
        courseId: '',
        totalMarks: 100,
        difficultyDistribution: {
          easy: 30,
          medium: 40,
          hard: 30
        }
      });
      fetchData(); // Refresh assignments list
    } catch (err) {
      console.error('Error creating assignment:', err);
      setFormError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  // Handle assignment deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await apiService.faculty.deleteAssignment(id);
        setFormSuccess('Assignment deleted successfully');
        fetchData(); // Refresh assignments list
      } catch (err) {
        console.error('Error deleting assignment:', err);
        setFormError(err.response?.data?.message || 'Failed to delete assignment');
      }
    }
  };

  // Handle preview PDF
  const handlePreviewPDF = async (assignmentId, studentId) => {
    try {
      const response = await apiService.faculty.previewAssignmentPDF(assignmentId, studentId);
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      // Open the PDF in a new tab
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error previewing PDF:', err);
      alert('Failed to preview PDF. Please try again.');
    }
  };

  // Handle email assignment
  const handleEmailAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to email this assignment to all students?')) {
      try {
        setEmailStatus(prev => ({ ...prev, [assignmentId]: 'sending' }));
        await apiService.faculty.emailAssignment(assignmentId);
        setEmailStatus(prev => ({ ...prev, [assignmentId]: 'success' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[assignmentId];
            return newStatus;
          });
        }, 5000); // Clear status after 5 seconds
      } catch (err) {
        console.error('Error emailing assignment:', err);
        setEmailStatus(prev => ({ ...prev, [assignmentId]: 'error' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[assignmentId];
            return newStatus;
          });
        }, 5000); // Clear status after 5 seconds
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Assignments</h1>

      {/* Alerts */}
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{formError}</span>
        </div>
      )}
      
      {formSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{formSuccess}</span>
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Assignment Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                name="name"
                placeholder="Assignment Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseId">
                Course
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              id="description"
              name="description"
              placeholder="Assignment description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                Due Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="dueDate"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalMarks">
                Total Marks
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="totalMarks"
                type="number"
                name="totalMarks"
                min="1"
                max="1000"
                value={formData.totalMarks}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Difficulty Distribution (must add up to 100%)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="difficulty.easy">
                  Easy (%)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="difficulty.easy"
                  type="number"
                  name="difficulty.easy"
                  min="0"
                  max="100"
                  value={formData.difficultyDistribution.easy}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="difficulty.medium">
                  Medium (%)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="difficulty.medium"
                  type="number"
                  name="difficulty.medium"
                  min="0"
                  max="100"
                  value={formData.difficultyDistribution.medium}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="difficulty.hard">
                  Hard (%)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="difficulty.hard"
                  type="number"
                  name="difficulty.hard"
                  min="0"
                  max="100"
                  value={formData.difficultyDistribution.hard}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Total: {formData.difficultyDistribution.easy + formData.difficultyDistribution.medium + formData.difficultyDistribution.hard}%
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Assignments List</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : assignments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No assignments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Marks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => {
                  // {console.log("assignment from manage assignments", assignment);}
                  const course = courses.find(c => c._id === assignment.courseId._id) || {};
                  return (
                    <tr key={assignment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{course.courseName || 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{assignment.totalMarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/faculty/assignments/${assignment._id}`)}
                          className='text-indigo-600 hover:text-indigo-900 mr-4 '
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePreviewPDF(assignment._id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Preview PDF
                        </button>
                        <button
                          onClick={() => handleEmailAssignment(assignment._id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          disabled={emailStatus[assignment._id] === 'sending'}
                        >
                          {emailStatus[assignment._id] === 'sending' ? 'Sending...' :
                           emailStatus[assignment._id] === 'success' ? 'Sent!' :
                           emailStatus[assignment._id] === 'error' ? 'Failed!' : 'Email'}
                        </button>
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAssignments;