import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Phone, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around py-3">
        <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/consultation" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <Phone size={24} />
          <span className="text-xs mt-1">Consult</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;