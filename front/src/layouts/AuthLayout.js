import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  
  // If user is authenticated, redirect to appropriate dashboard
  if (!loading && isAuthenticated()) {
    if (currentUser.role === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (currentUser.role === 'lawyer') {
      return <Navigate to="/lawyer/dashboard" replace />;
    } else if (['support', 'manager'].includes(currentUser.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img
            className="h-12 w-auto"
            src="/logo.svg"
            alt="AvocatAssist"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          AvocatAssist
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Plateforme SaaS juridique pour les particuliers et les professionnels du droit
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Retour à l'accueil
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            &copy; 2025 AvocatAssist. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
