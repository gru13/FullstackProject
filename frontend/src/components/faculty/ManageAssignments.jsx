import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';

const ManageAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    courseId: '',
    totalMarks: 100,
    topic: '',
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0
  });
  const [topics, setTopics] = useState([]);
  const [availableCounts, setAvailableCounts] = useState({ easy: 0, medium: 0, hard: 0 });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);

  // Fetch assignments, courses, and questions
  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, coursesRes, questionsRes] = await Promise.all([
        apiService.faculty.getAssignments(),
        apiService.faculty.getCourses(),
        apiService.faculty.getQuestions()
      ]);
      setAssignments(assignmentsRes.data);
      setCourses(coursesRes.data);
      setAllQuestions(questionsRes.data);

      const uniqueTopics = Array.from(new Set(questionsRes.data.map(q => q.topic).filter(Boolean)));
      setTopics(uniqueTopics);
      
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

  // Update available question counts when topic changes
  useEffect(() => {
    if (formData.topic) {
      const topicQuestions = allQuestions.filter(q => q.topic === formData.topic);
      const counts = {
        easy: topicQuestions.filter(q => q.difficulty.toLowerCase() === 'easy').length,
        medium: topicQuestions.filter(q => q.difficulty.toLowerCase() === 'medium').length,
        hard: topicQuestions.filter(q => q.difficulty.toLowerCase() === 'hard').length,
      };
      setAvailableCounts(counts);
    } else {
      setAvailableCounts({ easy: 0, medium: 0, hard: 0 });
    }
  }, [formData.topic, allQuestions]);


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.endsWith('Count') ? parseInt(value, 10) : value
    });
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

    // Validate question counts
    if (formData.easyCount < 0 || formData.mediumCount < 0 || formData.hardCount < 0) {
      setFormError('Question counts must be non-negative');
      return;
    }
    if (!formData.topic) {
      setFormError('Topic is required');
      return;
    }
    if (formData.easyCount + formData.mediumCount + formData.hardCount === 0) {
      setFormError('Specify at least one question');
      return;
    }
    if (
      formData.easyCount > availableCounts.easy ||
      formData.mediumCount > availableCounts.medium ||
      formData.hardCount > availableCounts.hard
    ) {
      setFormError('Cannot request more questions than available for the selected topic and difficulty.');
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
        topic: '',
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0
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


  // Populate form for editing
  const handleEdit = (assignment) => {
    setEditMode(true);
    setCurrentAssignmentId(assignment._id);
    setFormData({
      name: assignment.name,
      description: assignment.description,
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : '',
      courseId: assignment.courseId._id || assignment.courseId,
      topic: assignment.topic,
      easyCount: assignment.easyCount,
      mediumCount: assignment.mediumCount,
      hardCount: assignment.hardCount,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update assignment
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!currentAssignmentId) return;

    if (
      formData.easyCount > availableCounts.easy ||
      formData.mediumCount > availableCounts.medium ||
      formData.hardCount > availableCounts.hard
    ) {
      setFormError('Cannot request more questions than available for the selected topic and difficulty.');
      return;
    }
    
    try {
      await apiService.faculty.updateAssignment(currentAssignmentId, formData);
      setFormSuccess('Assignment updated successfully');
      setEditMode(false);
      setCurrentAssignmentId(null);
      setFormData({
        name: '',
        description: '',
        dueDate: '',
        courseId: '',
        topic: '',
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
      });
      fetchData();
    } catch (err) {
      console.error('Error updating assignment:', err);
      setFormError(err.response?.data?.message || 'Failed to update assignment');
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
        <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Assignment' : 'Create New Assignment'}</h2>
        
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="topic">
              Topic
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
            >
              <option value="">Select a topic</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
              type="text"
              name="topic"
              placeholder="Or type a new topic"
              value={formData.topic}
              onChange={handleChange}
            />
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
            
            {/* Total Marks field removed. It will be calculated automatically based on selected questions. */}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of Questions by Difficulty
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="easyCount">
                  Easy ({availableCounts.easy} available)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="easyCount"
                  type="number"
                  name="easyCount"
                  min="0"
                  max={availableCounts.easy}
                  value={formData.easyCount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="mediumCount">
                  Medium ({availableCounts.medium} available)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="mediumCount"
                  type="number"
                  name="mediumCount"
                  min="0"
                  max={availableCounts.medium}
                  value={formData.mediumCount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="hardCount">
                  Hard ({availableCounts.hard} available)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="hardCount"
                  type="number"
                  name="hardCount"
                  min="0"
                  max={availableCounts.hard}
                  value={formData.hardCount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Total: {formData.easyCount + formData.mediumCount + formData.hardCount} questions
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              onClick={editMode ? handleUpdate : handleSubmit}
            >
              {editMode ? 'Update Assignment' : 'Create Assignment'}
            </button>
            {editMode && (
              <button
                type="button"
                className="ml-4 bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => {
                  setEditMode(false);
                  setCurrentAssignmentId(null);
                  setFormData({
                    name: '',
                    description: '',
                    dueDate: '',
                    courseId: '',
                    topic: '',
                    easyCount: 0,
                    mediumCount: 0,
                    hardCount: 0,
                  });
                }}
              >
                Cancel
              </button>
            )}
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
                  {/* Total Marks column removed as requested */}
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
                      {/* Total Marks cell removed as requested */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/faculty/assignments/${assignment._id}`)}
                          className='text-indigo-600 hover:text-indigo-900 mr-4 '
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className='text-yellow-600 hover:text-yellow-900 mr-4'
                        >
                          Edit
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