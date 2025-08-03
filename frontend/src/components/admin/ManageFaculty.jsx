  import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    appPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch faculty data
  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllFaculty();
      setFaculty(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError('Failed to load faculty data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validate form
    if (!formData.name || !formData.email || (!editMode && !formData.password)) {
      setFormError('All fields are required');
      return;
    }

    try {
      if (editMode) {
        await apiService.admin.updateFaculty(editId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password && { password: formData.password })
        });
        setFormSuccess('Faculty member updated successfully');
        setEditMode(false);
        setEditId(null);
      } else {
        await apiService.admin.createFaculty({
          ...formData,
          role: 'faculty'
        });
        setFormSuccess('Faculty member created successfully');
      }
      
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        appPassword: ''
      });
      fetchFaculty(); // Refresh faculty list
    } catch (err) {
      console.error(editMode ? 'Error updating faculty:' : 'Error creating faculty:', err);
      setFormError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} faculty member`);
    }
  };
  
  // Handle edit button click
  const handleEdit = (member) => {
    setEditMode(true);
    setEditId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      password: '', // Password field is not needed for edit
      phone: member.phone || '',
      appPassword: '' // Reset appPassword on edit
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle faculty deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await apiService.admin.deleteFaculty(id);
        setFormSuccess('Faculty member deleted successfully');
        fetchFaculty(); // Refresh faculty list
      } catch (err) {
        console.error('Error deleting faculty:', err);
        setFormError(err.response?.data?.message || 'Failed to delete faculty member');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Faculty</h1>

      {/* Add Faculty Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">{editMode ? 'Edit Faculty' : 'Add New Faculty'}</h2>
        
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
            
            {!editMode && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editMode}
                />
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appPassword">
                App Password
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                id="appPassword"
                type="password"
                name="appPassword"
                placeholder="App Password"
                value={formData.appPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center mt-8">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 shadow-md"
              type="submit"
            >
              {editMode ? 'Update Faculty' : 'Add Faculty'}
            </button>
            {editMode && (
              <button
                className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 shadow-md"
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    appPassword: ''
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Faculty List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-semibold p-6 border-b border-gray-200 bg-gray-50 text-gray-700">Faculty List</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : faculty.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No faculty members found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faculty.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{member.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium mr-4 transition duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
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

export default ManageFaculty;