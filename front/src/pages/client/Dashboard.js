import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth(); // Get currentUser from context
  // Updated stats structure
  const [stats, setStats] = useState({
    projects: 0,
    legalRequests: 0,
    proposals: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]); // State for recent projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch stats and projects in parallel
        // Fetch stats, projects, and user data in parallel
        // Fetch stats and projects in parallel
        const [statsResponse, projectsResponse] = await Promise.all([
          axios.get('/users/stats'),
          axios.get('/projects?limit=5')
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        } else {
           throw new Error(statsResponse.data.message || 'Failed to fetch stats');
        }

        if (projectsResponse.data.success) {
          setRecentProjects(projectsResponse.data.projects);
        } else {
           throw new Error(projectsResponse.data.message || 'Failed to fetch projects');
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) { // Only fetch if user is logged in
        fetchData();
    } else {
        setLoading(false); // Stop loading if no user
    }
  }, [currentUser]); // Re-fetch if currentUser changes (no longer need setCurrentUser)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8"> {/* Increased padding and spacing */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"> {/* Adjusted flex for responsiveness */}
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1> {/* Larger title */}
        <p className="text-md text-gray-700">Bienvenue, <span className="font-semibold">{currentUser?.name}</span></p> {/* Adjusted welcome text */}
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Increased gap */}
        {/* Stats Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100"> {/* Increased padding, rounded-xl, shadow-md */}
          <h3 className="text-gray-600 text-base font-semibold mb-1">Dossiers Créés</h3> {/* Adjusted text style */}
          <p className="text-3xl font-bold text-gray-800">{stats.projects}</p> {/* Larger number */}
        </div>
        {/* Stats Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-gray-600 text-base font-semibold mb-1">Demandes Juridiques</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.legalRequests}</p>
        </div>
        {/* Stats Card 3 */}
         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-gray-600 text-base font-semibold mb-1">Crédits Restants</h3>
          {/* Assuming creditBalance is available in currentUser */}
          <p className="text-3xl font-bold text-gray-800">{currentUser?.creditBalance ?? 'N/A'}</p>
        </div>
        {/* Stats Card 4 */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-gray-600 text-base font-semibold mb-1">Propositions Reçues</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.proposals}</p>
        </div>
      </div>
      {/* Quick Actions Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100"> {/* Consistent card style */}
        <h2 className="text-xl font-bold text-gray-800 mb-5">Actions Rapides</h2> {/* Bolder title, more margin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"> {/* Adjusted grid for responsiveness */}
          {/* Buttons in requested order: Créer dossier, IA rapide, Voir propositions */}
          <Link to="/client/projects/new" className="btn-primary text-center">
            Créer un dossier
          </Link>
          <Link to="/client/ai-assistant" className="btn-primary text-center">
             Consulter l'IA rapide
          </Link>
          <Link to="/client/proposals" className="btn-primary text-center">
            Voir les propositions
          </Link>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100"> {/* Consistent card style */}
        <h2 className="text-xl font-bold text-gray-800 mb-5">Dossiers Récents</h2> {/* Bolder title, more margin */}
        {recentProjects.length > 0 ? (
          <div className="space-y-3"> {/* Slightly reduced spacing between items */}
            {recentProjects.map(project => (
              <Link
                to={`/client/dossier/${project.id}`}
                key={project.id}
                className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-100 hover:shadow-sm transition-all duration-200" // Added padding, border, hover effect
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"> {/* Responsive layout */}
                  <div>
                    <p className="text-lg font-semibold text-primary-700">{project.title}</p> {/* Larger, colored title */}
                    <p className="text-sm text-gray-600 mt-1"> {/* Adjusted text color */}
                      Type: <span className="font-medium">{project.type || 'Non spécifié'}</span> | Statut: <span className="font-medium">{project.status}</span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 sm:mt-0"> {/* Adjusted text color */}
                    Créé le: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">Aucun dossier récent</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
