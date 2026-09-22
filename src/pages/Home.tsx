import { useNavigate } from 'react-router-dom';
import { Phone, FileText, Clock } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-800">Welcome to AI Medical Consultation</h1>
      
      <div className="grid gap-4">
        <button
          onClick={() => navigate('/consultation')}
          className="p-4 bg-white rounded-lg shadow-md flex items-center space-x-4"
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <Phone className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Book Consultation</h3>
            <p className="text-sm text-gray-600">Talk to our AI medical assistant</p>
          </div>
        </button>

        <div className="p-4 bg-white rounded-lg shadow-md flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <FileText className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Prescriptions</h3>
            <p className="text-sm text-gray-600">View your prescriptions</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Clock className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">History</h3>
            <p className="text-sm text-gray-600">Past consultations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;