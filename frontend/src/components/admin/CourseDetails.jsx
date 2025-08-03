import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseRes = await apiService.admin.getCourse(id);
        setCourse(courseRes.data);
        
        // Set selected faculty if exists
        if (courseRes.data.teacherId) {
          setSelectedFaculty(courseRes.data.teacherId);
        }
        
        // Set enrolled students
        if (courseRes.data.students && courseRes.data.students.length > 0) {
          setEnrolledStudents(courseRes.data.students);
          setSelectedStudents(courseRes.data.students.map(student => student._id));
        }
        
        // Fetch all faculty and students for dropdowns
        const [facultyRes, studentsRes] = await Promise.all([
          apiService.admin.getAllFaculty(),
          apiService.admin.getAllStudents()
        ]);
        
        setFaculty(facultyRes.data);
        setStudents(studentsRes.data);
        
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

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    
    if (!selectedFaculty) {
      setError('Please select a faculty member');
      return;
    }
    
    try {
      await apiService.admin.assignFacultyToCourse(id, selectedFaculty);
      setSuccess('Faculty assigned successfully');
      
      // Refresh course data
      const courseRes = await apiService.admin.getCourse(id);
      setCourse(courseRes.data);
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err) {
      console.error('Error assigning faculty:', err);
      setError('Failed to assign faculty. Please try again.');
    }
  };

  const handleStudentSelectionChange = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleAssignStudents = async (e) => {
    e.preventDefault();
    
    try {
      await apiService.admin.assignStudentToCourse(id, selectedStudents);
      setSuccess('Students assigned successfully');
      
      // Refresh course data
      const courseRes = await apiService.admin.getCourse(id);
      setCourse(courseRes.data);
      setEnrolledStudents(courseRes.data.students || []);
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err) {
      console.error('Error assigning students:', err);
      setError('Failed to assign students. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">Course not found</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{course.courseName}</h1>
        <button 
          onClick={() => navigate('/admin/courses')} 
          className="bg-gray-500 hover:bg-gray-600  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
        >
          Back to Courses
        </button>
      </div>
      
      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <p>{success}</p>
        </div>
      )}

      {/* Assign Faculty Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Assign Faculty</h2>
        
        <form onSubmit={handleAssignFaculty} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="faculty">
              Select Faculty
            </label>
            <div className="flex space-x-4">
              <select
                className="shadow-sm appearance-none border border-gray-300 rounded-md flex-grow py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="faculty"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="">Select a faculty member</option>
                {faculty.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
              >
                Assign
              </button>
            </div>
          </div>
        </form>
        
        {course.teacherId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800">Currently Assigned:</h3>
            <p className="text-blue-700">
              {faculty.find(f => f._id === course.teacherId._id)?.name || 'Unknown'}
              ({faculty.find(f => f._id === course.teacherId._id)?.email || 'Unknown'})
            </p>
          </div>
        )}
      </div>

      {/* Assign Students Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Students</h2>
        
        <form onSubmit={handleAssignStudents} className="space-y-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Select Students
              </label>
              <div className="text-sm text-gray-500">
                {selectedStudents.length} students selected
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-md max-h-96 overflow-y-auto p-2">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No students available</p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student._id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`student-${student._id}`}
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentSelectionChange(student._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`student-${student._id}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer flex-grow">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-gray-500 text-xs">{student.rollNumber} | {student.email}</div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
            >
              Save Student Assignments
            </button>
          </div>
        </form>
      </div>

      {/* Enrolled Students List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-200 bg-gray-50 text-gray-700">Enrolled Students</h2>
        
        {enrolledStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No students enrolled in this course</div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrolledStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
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

export default CourseDetails;