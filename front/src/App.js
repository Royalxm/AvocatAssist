import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import ChatLayout from './layouts/ChatLayout'; // Keep for now, might remove if ClientLayout handles all
import LawyerLayout from './layouts/LawyerLayout';
import ClientLayout from './layouts/ClientLayout'; // Import the new ClientLayout
import Loading from './components/common/Loading'; // Import the common Loading component
 
// Project Detail Sub-Components (Import directly for now for nested routes)
import ProjectTasks from './components/lawyer/project/ProjectTasks';
import ProjectHistory from './components/lawyer/project/ProjectHistory';
import ProjectDocuments from './components/lawyer/project/ProjectDocuments';
import ProjectNotes from './components/lawyer/project/ProjectNotes';
import ProjectAiAssistant from './components/lawyer/project/ProjectAiAssistant';
import ProjectFinance from './components/lawyer/project/ProjectFinance';
import ProjectAgenda from './components/lawyer/project/ProjectAgenda';
const ProjectSummaryDashboard = lazy(() => import('./pages/lawyer/ProjectSummaryDashboard')); // Lazy load the new summary dashboard

 // Public Pages
 import LandingPage from './pages/public/LandingPage';
 import LoginPage from './pages/public/LoginPage';
 import RegisterPage from './pages/public/RegisterPage';
 import NotFoundPage from './pages/public/NotFoundPage';
 
 // Lazy-loaded pages for better performance
// Client Pages
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));
const ClientProfile = lazy(() => import('./pages/client/Profile'));
const ClientLegalRequests = lazy(() => import('./pages/client/LegalRequests'));
const ClientLegalRequestDetail = lazy(() => import('./pages/client/LegalRequestDetail'));
const ClientCreateLegalRequest = lazy(() => import('./pages/client/CreateLegalRequest'));
const EditLegalRequest = lazy(() => import('./pages/client/EditLegalRequest'));
const ClientProposals = lazy(() => import('./pages/client/Proposals'));
const ClientTransactions = lazy(() => import('./pages/client/Transactions'));
const ClientSubscriptionPage = lazy(() => import('./pages/client/SubscriptionPage')); // Updated import path
const ClientAiAssistant = lazy(() => import('./pages/client/AiAssistant'));
const ClientTemplates = lazy(() => import('./pages/client/Templates'));
// const CreateProject = lazy(() => import('./pages/client/CreateProject')); // Remove import for dedicated page
const QuickAiAssistant = lazy(() => import('./pages/client/QuickAiAssistant')); // Import QuickAiAssistant
const ProjectChat = lazy(() => import('./pages/client/ProjectChat')); // Import ProjectChat for dossier
const ProjectsList = lazy(() => import('./pages/client/ProjectsList')); // Import ProjectsList

// Lawyer Pages
const LawyerDashboard = lazy(() => import('./pages/lawyer/Dashboard'));
const LawyerProfile = lazy(() => import('./pages/lawyer/Profile'));
const LawyerLegalRequests = lazy(() => import('./pages/lawyer/LegalRequests'));
const LawyerProposals = lazy(() => import('./pages/lawyer/Proposals'));
const LawyerTransactions = lazy(() => import('./pages/lawyer/Transactions'));
const LawyerSubscription = lazy(() => import('./pages/lawyer/Subscription'));
// const LawyerAiAssistant = lazy(() => import('./pages/lawyer/AiAssistant')); // Remove old component
const LawyerQuickAiAssistant = lazy(() => import('./pages/lawyer/QuickAiAssistant')); // Add new general chat
const LawyerProjectChat = lazy(() => import('./pages/lawyer/ProjectChat')); // Add new project chat
const LawyerProjectsList = lazy(() => import('./pages/lawyer/ProjectsList')); // Add project list
// const LawyerCreateProject = lazy(() => import('./pages/lawyer/CreateProject')); // No longer needed as a separate page
const LawyerLegalRequestDetail = lazy(() => import('./pages/lawyer/LawyerLegalRequestDetail')); // Add detail view
const ForumPage = lazy(() => import('./pages/lawyer/ForumPage')); // Add Forum list page
const ForumTopicPage = lazy(() => import('./pages/lawyer/ForumTopicPage')); // Add Forum topic page
const LawyerChatPage = lazy(() => import('./pages/lawyer/LawyerChatPage')); // Add Lawyer direct chat page
const CalendarPage = lazy(() => import('./pages/lawyer/CalendarPage')); // Add Calendar page
const ContactsPage = lazy(() => import('./pages/lawyer/ContactsPage')); // Add Contacts page
const LegalNewsPage = lazy(() => import('./pages/lawyer/LegalNewsPage')); // Add Legal News page
const LawyerTemplatesPage = lazy(() => import('./pages/lawyer/TemplatesPage')); // Add Lawyer Templates page
const LawyerProjectDetail = lazy(() => import('./pages/lawyer/ProjectDetailPage')); // Add Project Detail page
 
  // Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminLegalRequests = lazy(() => import('./pages/admin/LegalRequests'));
const AdminProposals = lazy(() => import('./pages/admin/Proposals'));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions'));
const AdminSubscriptions = lazy(() => import('./pages/admin/Subscriptions'));
const AdminApiSettings = lazy(() => import('./pages/admin/ApiSettings'));
const AdminTemplates = lazy(() => import('./pages/admin/Templates'));

// Loading component is now imported from './components/common/Loading'
 
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
          <Route index element={isAuthenticated() ? getDefaultRedirect() : <LandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        
        {/* Client routes */}
        {/* Use ClientLayout for main client routes */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="legal-requests" element={<ClientLegalRequests />} />
          <Route path="legal-requests/:id" element={<ClientLegalRequestDetail />} />
          <Route path="legal-requests/create" element={<ClientCreateLegalRequest />} />
          <Route path="legal-requests/:id/edit" element={<EditLegalRequest />} />
          <Route path="proposals" element={<ClientProposals />} />
          <Route path="transactions" element={<ClientTransactions />} />
          <Route path="subscription" element={<ClientSubscriptionPage />} /> {/* Use updated component */}
          {/* Removed ai-assistant route from here */}
        </Route>
        
        {/* Chat routes with ChatLayout */}
        {/* Use ClientLayout for chat routes */}
        <Route path="/client/chats" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout /> {/* Use ClientLayout */}
          </ProtectedRoute>
        }>
          <Route path=":chatId" element={<ClientAiAssistant />} /> {/* Route for specific chat */}
        </Route>
        
        {/* Project-based chat routes with ChatLayout */}
        {/* Use ClientLayout for project chat routes */}
        <Route path="/client/dossier" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout /> {/* Use ClientLayout */}
          </ProtectedRoute>
        }>
          <Route path=":projectId" element={<ProjectChat />} /> {/* Route for project-based chat */}
        </Route>
        
        {/* AI Assistant route with ChatLayout */}
        {/* Use ClientLayout for AI assistant route */}
        <Route path="/client/ai-assistant" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout /> {/* Use ClientLayout */}
          </ProtectedRoute>
        }>
          <Route index element={<QuickAiAssistant />} /> {/* Use index route */}
        </Route>
        
        {/* Additional client routes */}
        {/* This additional client route group might be redundant now if all routes are under the first ClientLayout */}
        {/* Let's keep it for now but ensure it uses ClientLayout */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="templates" element={<ClientTemplates />} />
          {/* <Route path="projects/new" element={<CreateProject />} /> */} {/* Remove route for dedicated page */}
          <Route path="projects" element={<ProjectsList />} /> {/* Add route for listing projects */}
        </Route>
        
        {/* Lawyer routes */}
        {/* Use LawyerLayout for all lawyer routes */}
        <Route path="/lawyer" element={
          <ProtectedRoute allowedRoles={['lawyer']}>
            <LawyerLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<LawyerDashboard />} />
          <Route path="profile" element={<LawyerProfile />} />
          <Route path="legal-requests" element={<LawyerLegalRequests />} /> {/* List view */}
          <Route path="legal-requests/:id" element={<LawyerLegalRequestDetail />} /> {/* Detail view */}
          <Route path="proposals" element={<LawyerProposals />} />
          <Route path="transactions" element={<LawyerTransactions />} />
          <Route path="subscription" element={<LawyerSubscription />} />
          <Route path="projects" element={<LawyerProjectsList />} /> {/* Add route for listing projects */}
          {/* <Route path="projects/new" element={<LawyerCreateProject />} /> */} {/* Removed route, using modal now */}
          {/* Project Detail Route with Nested Routes */}
          {/* Project Detail Route with Nested Routes for Summary Tabs */}
          <Route path="projects/:projectId/*" element={<LawyerProjectDetail />}>
            {/* Index route renders the Summary Dashboard */}
            <Route index element={<ProjectSummaryDashboard />} />
            {/* Other routes render the FULL component view */}
            <Route path="tasks" element={<ProjectTasks />} />
            <Route path="history" element={<ProjectHistory />} />
            <Route path="documents" element={<ProjectDocuments />} />
            <Route path="notes" element={<ProjectNotes />} />
            <Route path="ai" element={<ProjectAiAssistant />} />
            <Route path="finance" element={<ProjectFinance />} />
            <Route path="agenda" element={<ProjectAgenda />} />
            {/* Fallback for unknown sub-paths could redirect to index */}
            <Route path="*" element={<Navigate to="" replace />} />
          </Route>
          <Route path="forum" element={<ForumPage />} /> {/* Add route for forum list */}
          <Route path="forum/topics/:topicId" element={<ForumTopicPage />} /> {/* Add route for forum topic */}
          <Route path="calendar" element={<CalendarPage />} /> {/* Add route for calendar */}
          <Route path="contacts" element={<ContactsPage />} /> {/* Add route for contacts */}
          <Route path="templates" element={<LawyerTemplatesPage />} /> {/* Add route for lawyer templates */}
          <Route path="legal-news" element={<LegalNewsPage />} /> {/* Add route for legal news */}
          {/* Note: Lawyer Chat route added below using ChatLayout */}
          {/* <Route path="ai-assistant" element={<LawyerAiAssistant />} /> */} {/* Remove old route */}
        </Route>

        {/* Lawyer AI Assistant route with LawyerLayout */}
        <Route path="/lawyer/ai-assistant" element={
          <ProtectedRoute allowedRoles={['lawyer']}>
            <LawyerLayout /> {/* Use LawyerLayout */}
          </ProtectedRoute>
        }>
          <Route index element={<LawyerQuickAiAssistant />} />
        </Route>

        {/* Lawyer Project-based chat routes with LawyerLayout */}
        <Route path="/lawyer/dossier" element={ // Project Chat
          <ProtectedRoute allowedRoles={['lawyer']}>
            <LawyerLayout /> {/* Use LawyerLayout */}
          </ProtectedRoute>
        }>
          <Route path=":projectId" element={<LawyerProjectChat />} />
        </Route>

        {/* Lawyer Direct Chat route with LawyerLayout */}
        <Route path="/lawyer/chat" element={
          <ProtectedRoute allowedRoles={['lawyer']}>
            <LawyerLayout /> {/* Use LawyerLayout */}
          </ProtectedRoute>
        }>
          {/* The LawyerChatPage component itself handles displaying the list and the selected chat */}
          <Route index element={<LawyerChatPage />} />
          {/* Optionally, add a route like /lawyer/chat/:otherUserId if needed later */}
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
