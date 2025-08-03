import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState({});

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        setLoading(true);
        // Fetch assignment details
        const assignmentRes = await apiService.faculty.getAssignment(id);
        setAssignment(assignmentRes.data);
        // Fetch course details
        if (assignmentRes.data.courseId) {
          const courseRes = await apiService.faculty.getCourse(assignmentRes.data.courseId);
          setCourse(courseRes.data);
          setStudents(courseRes.data.students || []);
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
      fetchAssignmentDetails();
    }
  }, [id]);

  // Handle preview PDF for a specific student
  const handlePreviewPDF = async (studentId) => {
    try {
      const response = await apiService.faculty.previewAssignmentPDF(id, studentId);
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

  // Handle email assignment to a specific student
  const handleEmailStudent = async (studentId, studentEmail) => {
    if (window.confirm(`Are you sure you want to email this assignment to ${studentEmail}?`)) {
      try {
        setEmailStatus(prev => ({ ...prev, [studentId]: 'sending' }));
        await apiService.faculty.emailAssignmentToStudent(id, studentId);
        setEmailStatus(prev => ({ ...prev, [studentId]: 'success' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[studentId];
            return newStatus;
          });
        }, 5000); // Clear status after 5 seconds
      } catch (err) {
        console.error('Error emailing assignment:', err);
        setEmailStatus(prev => ({ ...prev, [studentId]: 'error' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[studentId];
            return newStatus;
          });
        }, 5000); // Clear status after 5 seconds
      }
    }
  };

  // Handle email assignment to all students
  const handleEmailAll = async () => {
    if (window.confirm('Are you sure you want to email this assignment to all students?')) {
      try {
        setEmailStatus(prev => ({ ...prev, all: 'sending' }));
        await apiService.faculty.emailAssignment(id);
        setEmailStatus(prev => ({ ...prev, all: 'success' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus.all;
            return newStatus;
          });
        }, 5000); // Clear status after 5 seconds
      } catch (err) {
        console.error('Error emailing assignment to all students:', err);
        setEmailStatus(prev => ({ ...prev, all: 'error' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus.all;
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
      <div className="p-6 text-center text-gray-500">Assignment not found</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Details</h1>
        <button
          onClick={() => navigate('/faculty/assignments')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back to Assignments
        </button>
      </div>

      {/* Assignment Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{assignment.name}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Course:</span> {course?.courseName || 'Unknown Course'}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Due Date:</span> {formatDate(assignment.dueDate)}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Total Marks:</span> {assignment.totalMarks}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Difficulty Distribution:</span> 
              Easy: {assignment.difficultyDistribution?.easy || 0}%, 
              Medium: {assignment.difficultyDistribution?.medium || 0}%, 
              Hard: {assignment.difficultyDistribution?.hard || 0}%
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 mb-4">{assignment.description || 'No description provided'}</p>
            <div className="mt-4">
              <button
                onClick={handleEmailAll}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
                disabled={emailStatus.all === 'sending'}
              >
                {emailStatus.all === 'sending' ? 'Sending...' :
                 emailStatus.all === 'success' ? 'Sent!' :
                 emailStatus.all === 'error' ? 'Failed!' : 'Email All Students'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Students</h2>
        {console.log('Students:', students)}
        {console.log('Assignment:', assignment)}
        {students.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No students assigned to this course</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePreviewPDF(student._id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() => handleEmailStudent(student._id, student.email)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={emailStatus[student._id] === 'sending'}
                      >
                        {emailStatus[student._id] === 'sending' ? 'Sending...' :
                         emailStatus[student._id] === 'success' ? 'Sent!' :
                         emailStatus[student._id] === 'error' ? 'Failed!' : 'Email'}
                      </button>
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

export default AssignmentDetails;