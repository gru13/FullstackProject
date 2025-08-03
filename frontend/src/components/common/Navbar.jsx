import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isFaculty = authService.isFaculty();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {/* Removed Assignment Generator text */}
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center">
              {isAdmin && (
                <div className="hidden md:flex space-x-4 mr-4">
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Dashboard
                  </Link>
                  <Link to="/admin/faculty" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Faculty
                  </Link>
                  <Link to="/admin/students" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Students
                  </Link>
                  <Link to="/admin/courses" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Courses
                  </Link>
                </div>
              )}
              
              {isFaculty && (
                <div className="hidden md:flex space-x-4 mr-4">
                  <Link to="/faculty" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Dashboard
                  </Link>
                  <Link to="/faculty/courses" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Courses
                  </Link>
                  <Link to="/faculty/questions" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Questions
                  </Link>
                  <Link to="/faculty/assignments" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Assignments
                  </Link>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;