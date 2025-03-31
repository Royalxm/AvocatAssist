import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import ChatLayout from './layouts/ChatLayout'; // Import the new ChatLayout

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Lazy-loaded pages for better performance
// Client Pages
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));
const ClientProfile = lazy(() => import('./pages/client/Profile'));
const ClientDocuments = lazy(() => import('./pages/client/Documents'));
const ClientLegalRequests = lazy(() => import('./pages/client/LegalRequests'));
const ClientProposals = lazy(() => import('./pages/client/Proposals'));
const ClientTransactions = lazy(() => import('./pages/client/Transactions'));
const ClientSubscription = lazy(() => import('./pages/client/Subscription'));
const ClientAiAssistant = lazy(() => import('./pages/client/AiAssistant'));
const ClientTemplates = lazy(() => import('./pages/client/Templates'));
const CreateProject = lazy(() => import('./pages/client/CreateProject')); // Import CreateProject
const QuickAiAssistant = lazy(() => import('./pages/client/QuickAiAssistant')); // Import QuickAiAssistant

// Lawyer Pages
const LawyerDashboard = lazy(() => import('./pages/lawyer/Dashboard'));
const LawyerProfile = lazy(() => import('./pages/lawyer/Profile'));
const LawyerLegalRequests = lazy(() => import('./pages/lawyer/LegalRequests'));
const LawyerProposals = lazy(() => import('./pages/lawyer/Proposals'));
const LawyerTransactions = lazy(() => import('./pages/lawyer/Transactions'));
const LawyerSubscription = lazy(() => import('./pages/lawyer/Subscription'));
const LawyerAiAssistant = lazy(() => import('./pages/lawyer/AiAssistant'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminLegalRequests = lazy(() => import('./pages/admin/LegalRequests'));
const AdminProposals = lazy(() => import('./pages/admin/Proposals'));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions'));
const AdminSubscriptions = lazy(() => import('./pages/admin/Subscriptions'));
const AdminApiSettings = lazy(() => import('./pages/admin/ApiSettings'));
const AdminTemplates = lazy(() => import('./pages/admin/Templates'));

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (currentUser.role === 'lawyer') {
      return <Navigate to="/lawyer/dashboard" replace />;
    } else if (['support', 'manager'].includes(currentUser.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

function App() {
  const { isAuthenticated, currentUser, loading } = useAuth();
  
  // Determine default redirect based on authentication status and user role
  const getDefaultRedirect = () => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    
    switch (currentUser.role) {
      case 'client':
        return <Navigate to="/client/dashboard" replace />;
      case 'lawyer':
        return <Navigate to="/lawyer/dashboard" replace />;
      case 'support':
      case 'manager':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        
        {/* Client routes */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['client']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="documents" element={<ClientDocuments />} />
          <Route path="legal-requests" element={<ClientLegalRequests />} />
          <Route path="proposals" element={<ClientProposals />} />
          <Route path="transactions" element={<ClientTransactions />} />
          <Route path="subscription" element={<ClientSubscription />} />
          <Route path="ai-assistant" element={<QuickAiAssistant />} />
        </Route>
        
        {/* Chat routes with ChatLayout */}
        <Route path="/client/chats" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ChatLayout />
          </ProtectedRoute>
        }>
          <Route path=":chatId" element={<ClientAiAssistant />} /> {/* Route for specific chat */}
        </Route>
        
        {/* Project-based chat routes with ChatLayout */}
        <Route path="/client/dossier" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ChatLayout />
          </ProtectedRoute>
        }>
          <Route path=":projectId" element={<ClientAiAssistant />} /> {/* Route for project-based chat */}
        </Route>
        
        {/* Additional client routes */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['client']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="templates" element={<ClientTemplates />} />
          <Route path="projects/new" element={<CreateProject />} /> {/* Add route for creating projects */}
        </Route>
        
        {/* Lawyer routes */}
        <Route path="/lawyer" element={
          <ProtectedRoute allowedRoles={['lawyer']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<LawyerDashboard />} />
          <Route path="profile" element={<LawyerProfile />} />
          <Route path="legal-requests" element={<LawyerLegalRequests />} />
          <Route path="proposals" element={<LawyerProposals />} />
          <Route path="transactions" element={<LawyerTransactions />} />
          <Route path="subscription" element={<LawyerSubscription />} />
          <Route path="ai-assistant" element={<LawyerAiAssistant />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['support', 'manager']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="legal-requests" element={<AdminLegalRequests />} />
          <Route path="proposals" element={<AdminProposals />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="api-settings" element={<AdminApiSettings />} />
          <Route path="templates" element={<AdminTemplates />} />
        </Route>
        
        {/* Default redirect based on auth status and role */}
        <Route path="/dashboard" element={getDefaultRedirect()} />
      </Routes>
    </Suspense>
  );
}

export default App;
