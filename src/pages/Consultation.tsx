import React, { useState } from 'react';
import { Phone, Mic, MicOff } from 'lucide-react';

const Consultation = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const startCall = () => {
    setIsCallActive(true);
    // Add OpenAI voice call integration logic here
  };

  const endCall = () => {
    setIsCallActive(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Consultation</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {!isCallActive ? (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Start AI Consultation</h2>
              <p className="text-gray-600">Our AI doctor is ready to assist you</p>
            </div>
            <button
              onClick={startCall}
              className="bg-green-500 text-white px-6 py-3 rounded-full flex items-center justify-center space-x-2 mx-auto hover:bg-green-600 transition-colors"
            >
              <Phone size={20} />
              <span>Start Call</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} className="text-blue-600" />
              </div>
              <p className="text-lg font-semibold">AI Doctor</p>
              <p className="text-sm text-gray-600">Call in progress...</p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={endCall}
                className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-red-600 transition-colors"
              >
                <Phone size={20} />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;