import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    courseName: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // For course creation/edit
  const [formFaculty, setFormFaculty] = useState('');


  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, facultyRes, studentsRes] = await Promise.all([
        apiService.admin.getAllCourses(),
        apiService.admin.getAllFaculty(),
        apiService.admin.getAllStudents()
      ]);

      const coursesData = coursesRes.data.map((course) => {
        const facultyMember = facultyRes.data.find(f => f._id === course.teacherId);
        const studentList = course.students.map(studentId => {
          const student = studentsRes.data.find(s => s._id === studentId);
          return student ? student.name : 'Unknown';
        });
        return {
          ...course,
          teacherName: facultyMember ? facultyMember.name : 'Not assigned',
          studentNames: studentList.length > 0 ? studentList.join(', ') : 'No students',
        };
      });

      setCourses(coursesData);
      setFaculty(facultyRes.data);
      setStudents(studentsRes.data);
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle course creation or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validate form
    if (!formData.courseName || !formFaculty) {
      setFormError('Course name and faculty are required');
      return;
    }

    try {
      const payload = {
        courseName: formData.courseName,
        teacherId: formFaculty,
        students: [], // No students assigned at creation
      };

      if (editMode) {
        await apiService.admin.updateCourse(editId, payload);
        setFormSuccess('Course updated successfully');
      } else {
        await apiService.admin.createCourse(payload);
        setFormSuccess('Course created successfully');
      }

      // Reset form
      setFormData({ courseName: '' });
      setFormFaculty('');
      setEditMode(false);
      setEditId(null);

      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error creating/updating course:', err);
      setFormError(err.response?.data?.message || 'Failed to create/update course');
    }
  };


  // Handle course deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await apiService.admin.deleteCourse(id);
        setFormSuccess('Course deleted successfully');
        fetchData(); // Refresh data
      } catch (err) {
        console.error('Error deleting course:', err);
        setFormError(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Courses</h1>

      {/* Alerts */}
      {formError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{formError}</p>
        </div>
      )}
      
      {formSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{formSuccess}</p>
        </div>
      )}

      {/* Create/Edit Course Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">{editMode ? 'Edit Course' : 'Create New Course'}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseName">
                Course Name
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="courseName"
                type="text"
                name="courseName"
                placeholder="Course Name"
                value={formData.courseName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="selectFaculty">
                Assign Faculty
              </label>
              <select
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="selectFaculty"
                name="formFaculty"
                value={formFaculty}
                onChange={(e) => setFormFaculty(e.target.value)}
              >
                <option value="">Select a faculty member</option>
                {faculty.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Removed Assign Students field as requested */}

            <div className="flex items-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 shadow-md"
                type="submit"
              >
                {editMode ? 'Update Course' : 'Create Course'}
              </button>
              {editMode && (
                <button
                  className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 shadow-md"
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setEditId(null);
                    setFormData({
                      courseName: ''
                    });
                    setFormFaculty('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ...existing code... */}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-semibold p-6 border-b border-gray-200 bg-gray-50 text-gray-700">Courses List</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : courses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No courses found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => {
                  // Find faculty name
                  const facultyMember = faculty.find(f => f._id === course.teacherId._id);
                  const facultyName = facultyMember ? facultyMember.name : 'Not assigned';
                  // Map student IDs to names
                  const studentNames = course.students && course.students.length > 0
                    ? course.students.map(studentId => {
                        const student = students.find(s => s._id === studentId._id);
                        return student ? student.name : 'Unknown';
                      }).join(', ')
                    : 'No students';
                  return (
                    <tr key={course._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{facultyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{studentNames}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Removed Edit button as requested */}
                        <a 
                          href={`/admin/courses/${course._id}`} 
                          className="text-blue-600 hover:text-blue-900 font-medium mr-4 transition duration-150"
                        >
                          View Details
                        </a>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="text-red-600 hover:text-red-900 font-medium transition duration-150"
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

export default ManageCourses;