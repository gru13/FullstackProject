import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const StudentAssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

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

  // Handle PDF preview
  const handlePreviewPdf = async () => {
    try {
      await apiService.student.previewAssignmentPdf(id);
      setShowPdfPreview(true);
    } catch (err) {
      console.error('Error previewing PDF:', err);
      setError('Failed to preview PDF. Please try again.');
    }
  };

  // Navigate to submission page
  const handleSubmit = () => {
    navigate(`/student/assignments/${id}/submit`);
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

  return (
    <div>
      <div className="mb-6">
        <Link to="/student/assignments" className="text-blue-500 hover:text-blue-700">
          &larr; Back to Assignments
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Assignment Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{assignment.name}</h1>
              {course && (
                <Link to={`/student/courses/${course._id}`} className="text-blue-500 hover:text-blue-700">
                  {course.courseName}
                </Link>
              )}
            </div>
            <div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${isSubmitted ? 'bg-green-100 text-green-800' : isPastDue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isSubmitted ? 'Submitted' : isPastDue ? 'Past Due' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Assignment Details</h2>
              
              {assignment.description && (
                <div className="mb-4">
                  <p className="text-gray-700">{assignment.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(assignment.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="font-medium">{assignment.questionCount || 'N/A'}</p>
                </div>
                {assignment.totalMarks && (
                  <div>
                    <p className="text-sm text-gray-500">Total Marks</p>
                    <p className="font-medium">{assignment.totalMarks}</p>
                  </div>
                )}
                {isSubmitted && assignment.submittedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Submitted On</p>
                    <p className="font-medium">{formatDate(assignment.submittedAt)}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handlePreviewPdf}
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Preview Assignment PDF
                </button>
                
                {!isSubmitted && !isPastDue && (
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Submit Assignment
                  </button>
                )}
                
                {isSubmitted && (
                  <button
                    onClick={() => navigate(`/student/assignments/${id}/submission`)}
                    className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    View My Submission
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          {showPdfPreview && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">PDF Preview</h2>
              <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe 
                  src={`/api/assignments/${id}/preview`} 
                  title="Assignment PDF Preview"
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentDetails;