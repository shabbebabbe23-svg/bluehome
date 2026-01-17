import React from 'react';
import { Link } from 'react-router-dom';

const MailConfirmation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Email Confirmed!</h1>
        <p className="mb-6 text-gray-700">
          Your email has been successfully confirmed. You can now log in to your account.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default MailConfirmation;
