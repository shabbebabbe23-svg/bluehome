import React from 'react';
import { CheckCircle } from 'lucide-react';

const MailConfirmation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-green-600">Registrering klar!</h1>
        <p className="mb-4 text-gray-700">
          Ditt konto har skapats och du är nu registrerad.
        </p>
        <p className="text-gray-600 text-sm">
          Du kan nu stänga denna sida.
        </p>
      </div>
    </div>
  );
};

export default MailConfirmation;
