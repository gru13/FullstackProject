import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const Profile = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appPasswordData, setAppPasswordData] = useState({
    currentAppPassword: '',
    newAppPassword: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiService.auth.getCurrentUser();
        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setFormError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validate form
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setFormError('All fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFormError('New password and confirm password do not match');
      return;
    }

    try {
      await apiService.auth.changePassword(formData);
      setFormSuccess('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setFormError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAppPasswordChange = (e) => {
    const { name, value } = e.target;
    setAppPasswordData({
      ...appPasswordData,
      [name]: value
    });
  };

  const handleAppPasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!appPasswordData.currentAppPassword || !appPasswordData.newAppPassword) {
      setFormError('All fields are required for app password update');
      return;
    }

    try {
      await apiService.auth.changeAppPassword(appPasswordData);
      setFormSuccess('App password updated successfully');
      setAppPasswordData({
        currentAppPassword: '',
        newAppPassword: ''
      });
    } catch (err) {
      console.error('Error updating app password:', err);
      setFormError(err.response?.data?.message || 'Failed to update app password. Please ensure the current app password is correct and try again.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Faculty Profile</h1>

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

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : userProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-gray-900 font-medium">{userProfile.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900 font-medium">{userProfile.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="text-gray-900 font-medium">{userProfile.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Role</p>
              <p className="text-gray-900 font-medium capitalize">{userProfile.role}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Unable to load profile information</p>
        )}
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="currentPassword"
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newPassword"
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* App Password Change Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Change App Password</h2>
        <form onSubmit={handleAppPasswordSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentAppPassword">
              Current App Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="currentAppPassword"
              type="password"
              name="currentAppPassword"
              placeholder="Current App Password"
              value={appPasswordData.currentAppPassword}
              onChange={handleAppPasswordChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newAppPassword">
              New App Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newAppPassword"
              type="password"
              name="newAppPassword"
              placeholder="New App Password"
              value={appPasswordData.newAppPassword}
              onChange={handleAppPasswordChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Update App Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;