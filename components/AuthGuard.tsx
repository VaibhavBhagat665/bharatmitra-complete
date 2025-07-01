import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { AshokaChakraIcon } from './icons/AshokaChakraIcon';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-bharat-blue-50">
            <AshokaChakraIcon className="h-24 w-24 text-bharat-blue-800 animate-spin mb-4" />
            <p className="text-xl text-bharat-blue-900 font-semibold">Loading Your Profile...</p>
            <p className="text-sm text-bharat-blue-600 mt-2">Please wait while we authenticate you...</p>
        </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
