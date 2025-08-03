import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const SubmissionView = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch assignment details
        const assignmentResponse = await apiService.student.getAssignmentById(id);
        setAssignment(assignmentResponse.data);
        
        // Fetch submission details
        const submissionResponse = await apiService.student.getSubmission(id);
        setSubmission(submissionResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching submission details:', err);
        setError('Failed to load submission details. Please try again.');
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
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

  if (!assignment || !submission) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">Submission not found or you don't have access to this submission.</span>
        <div className="mt-2">
          <Link to="/student/assignments" className="text-blue-500 hover:text-blue-700">
            Return to assignments
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
        {/* Submission Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-2">Submission: {assignment.name}</h1>
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-gray-600">Submitted:</span> 
              <span className="font-medium ml-1">{formatDate(submission.submittedAt)}</span>
            </div>
            <div>
              <span className="text-gray-600">Due Date:</span> 
              <span className="font-medium ml-1">{formatDate(assignment.dueDate)}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span> 
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-1">
                Submitted
              </span>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Submission Details</h2>
              
              {submission.fileUrl && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Submitted File</h3>
                  <a 
                    href={submission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Submission
                  </a>
                </div>
              )}
              
              {submission.comments && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Your Comments</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 whitespace-pre-line">{submission.comments}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {submission.grade !== undefined ? (
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Grading</h2>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Your Grade:</span>
                      <span className="text-2xl font-bold">{submission.grade} / {assignment.totalMarks || 100}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(submission.grade / (assignment.totalMarks || 100)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {submission.feedback && (
                    <div>
                      <h3 className="text-md font-medium mb-2">Instructor Feedback</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-700 whitespace-pre-line">{submission.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-2">Grading Status</h2>
                  <p className="text-yellow-700">
                    Your submission has not been graded yet. Check back later for feedback and grades.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionView;