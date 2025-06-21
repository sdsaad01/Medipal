import React from 'react';
import { User, FileText, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <div className="pb-20">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <User className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">John Doe</h2>
            <p className="text-gray-600">john@example.com</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <FileText className="text-gray-600" size={24} />
            <div>
              <h3 className="font-semibold text-gray-800">My Prescriptions</h3>
              <p className="text-sm text-gray-600">View all your prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <Clock className="text-gray-600" size={24} />
            <div>
              <h3 className="font-semibold text-gray-800">Consultation History</h3>
              <p className="text-sm text-gray-600">View past consultations</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;