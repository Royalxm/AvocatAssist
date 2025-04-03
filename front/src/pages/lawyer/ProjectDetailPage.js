import React, { useState, useEffect } from 'react';
// Import necessary hooks and components from react-router-dom
import { useParams, Link, Outlet, useLocation, Navigate } from 'react-router-dom'; 
import api from '../../utils/api'; 
import Loading from '../../components/common/Loading'; 

// Section components are now rendered via Outlet, no need to import them here

function ProjectDetailPage() {
  const { projectId } = useParams();
  const location = useLocation(); // Needed for active tab state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/lawyer-projects/${projectId}`);
        if (response.data) {
            setProject(response.data);
            setError(null);
        } else {
            throw new Error('Project data not found in response');
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.response?.data?.message || 'Failed to load project details.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center text-gray-500">Dossier non trouvé.</div>;
  }

  // Define tabs, including the new "Résumé" tab
  const tabs = [
    { name: 'Résumé', path: '' }, // Path is empty for the index route
    { name: 'Tâches', path: 'tasks' },
    { name: 'Historique', path: 'history' },
    { name: 'Documents', path: 'documents' },
    { name: 'Notes', path: 'notes' },
    { name: 'IA', path: 'ai' },
    { name: 'Finances', path: 'finance' },
    { name: 'Agenda', path: 'agenda' },
  ];

  // Determine active tab based on URL
  const activeTabPath = location.pathname;
  // Determine the active tab based on the last segment of the path
  // Handle the index route ('') specifically for the "Résumé" tab
  const pathSegments = location.pathname.split('/').filter(Boolean); // Get non-empty segments
  const currentPathSegment = pathSegments[pathSegments.length - 1]; // Get the last segment
  const isBaseProjectPath = pathSegments[pathSegments.length - 2] === 'projects'; // Check if it's /projects/:id
  
  let activeTab = ''; // Default to Résumé tab path
  if (!isBaseProjectPath && tabs.some(tab => tab.path === currentPathSegment)) {
      activeTab = currentPathSegment; // Set to the matching segment if found
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen"> {/* Main container */}
      
      {/* Header Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 truncate">
          {project.title}
        </h1>
        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
          <span>Statut: <span className="font-medium">{project.status || 'N/A'}</span></span>
          <span className="hidden sm:inline">|</span>
          <span>Type: <span className="font-medium">{project.type || 'N/A'}</span></span>
          {project.clientFirstName && project.clientLastName && (
              <span className="border-l border-gray-300 pl-4">
                  Client: <span className="font-medium">{project.clientFirstName} {project.clientLastName}</span>
              </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path} // Relative path for nested routes
              className={`
                ${activeTab === tab.path
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
              `}
              aria-current={activeTab === tab.path ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content Area - Renders the matched nested route component via Outlet */}
      <div className="bg-white shadow rounded-lg p-4 min-h-[300px]">
        {/* Outlet renders ProjectSummaryDashboard (index) or full components (tasks, history, etc.) */}
        <Outlet />
      </div>

    </div> // End Main container
  );
}

export default ProjectDetailPage;