import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const SubmitAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch assignment details
        const assignmentResponse = await apiService.student.getAssignmentById(id);
        setAssignment(assignmentResponse.data);
        
        // Fetch course details
        if (assignmentResponse.data.courseId) {
          const courseResponse = await apiService.student.getCourseById(assignmentResponse.data.courseId);
          setCourse(courseResponse.data);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching assignment details:', err);
        setError('Failed to load assignment details. Please try again.');
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

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('comments', comments);
      
      await apiService.student.submitAssignment(id, formData);
      
      // Navigate back to assignment details
      navigate(`/student/assignments/${id}`);
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (!assignment) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">Assignment not found or you don't have access to this assignment.</span>
      </div>
    );
  }

  const isPastDue = new Date(assignment.dueDate) < new Date();
  const isSubmitted = assignment.submitted;

  // Redirect if already submitted or past due
  if (isSubmitted) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">You have already submitted this assignment.</span>
        <div className="mt-2">
          <Link to={`/student/assignments/${id}`} className="text-blue-500 hover:text-blue-700">
            Return to assignment details
          </Link>
        </div>
      </div>
    );
  }

  if (isPastDue) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">This assignment is past due and can no longer be submitted.</span>
        <div className="mt-2">
          <Link to={`/student/assignments/${id}`} className="text-blue-500 hover:text-blue-700">
            Return to assignment details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/student/assignments/${id}`} className="text-blue-500 hover:text-blue-700">
          &larr; Back to Assignment
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Assignment Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-2">Submit Assignment: {assignment.name}</h1>
          {course && (
            <p className="text-gray-600">
              Course: {course.courseName} | Due: {formatDate(assignment.dueDate)}
            </p>
          )}
        </div>

        {/* Submission Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                Upload Your Solution (PDF, DOC, DOCX, or ZIP)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.zip"
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size: 10MB
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comments">
                Comments (Optional)
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="comments"
                rows="4"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about your submission here..."
              ></textarea>
            </div>

            <div className="flex items-center justify-between">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Assignment'
                )}
              </button>
              <Link
                to={`/student/assignments/${id}`}
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssignment;