import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: ''
  });
  const [formMessage, setFormMessage] = useState({ type: '', message: '' });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllStudents();
      setStudents(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', message: '' });

    if (!formData.name || !formData.email || !formData.rollNumber) {
      setFormMessage({ type: 'error', message: 'All fields are required' });
      return;
    }

    try {
      if (editMode) {
        await apiService.admin.updateStudent(editId, formData);
        setFormMessage({ type: 'success', message: 'Student updated successfully' });
        setEditMode(false);
        setEditId(null);
      } else {
        await apiService.admin.createStudent(formData);
        setFormMessage({ type: 'success', message: 'Student created successfully' });
      }

      setFormData({ name: '', email: '', rollNumber: '', phone: '' });
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      setFormMessage({ type: 'error', message: 'Failed to save student' });
    }
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setEditId(student._id);
    setFormData({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      phone: student.phone || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiService.admin.deleteStudent(id);
        setFormMessage({ type: 'success', message: 'Student deleted successfully' });
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
        setFormMessage({ type: 'error', message: 'Failed to delete student' });
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Students</h1>

      {/* Add Student Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">{editMode ? 'Edit Student' : 'Add New Student'}</h2>

        {formMessage.message && (
          <div
            className={`p-4 mb-6 border-l-4 ${formMessage.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'}`}
            role="alert"
          >
            <p>{formMessage.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="name"
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="email"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rollNumber">
                Roll Number
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="rollNumber"
                type="text"
                name="rollNumber"
                placeholder="Roll Number"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                disabled={editMode} // Disable roll number editing to prevent conflicts
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="phone"
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center mt-8">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 shadow-md"
              type="submit"
            >
              {editMode ? 'Update Student' : 'Add Student'}
            </button>
            {editMode && (
              <button
                className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 shadow-md"
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setFormData({ name: '', email: '', rollNumber: '', phone: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-semibold p-6 border-b border-gray-200 bg-gray-50 text-gray-700">Students List</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No students found</div>
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium mr-4 transition duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="text-red-600 hover:text-red-900 font-medium transition duration-150"
                      >
                        Delete
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

export default ManageStudents;