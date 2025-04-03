import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
import { Link } from 'react-router-dom';
import { FaTrash, FaFolderOpen } from 'react-icons/fa'; // Import icons

// Renamed component
const LawyerProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            // Use api (token is handled automatically)
            const response = await api.get('/projects'); // Use 'api'
            setProjects(response.data.projects || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError('Failed to load projects. Please try again later.');
            if (err.response && err.response.status === 401) {
                setError('Unauthorized. Please log in again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
            try {
                // Use api (token is handled automatically)
                await api.delete(`/projects/${projectId}`); // Use 'api'
                fetchProjects(); // Refresh list
            } catch (err) {
                console.error("Error deleting project:", err);
                alert('Échec de la suppression du dossier.');
            }
        }
    };

    // Helper to get status badge class (remains the same)
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'ouvert':
                return 'bg-green-100 text-green-800';
            case 'inactive':
            case 'fermé':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-4 text-center">Chargement des dossiers...</div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mes Dossiers</h1>
                 {/* Optional: Add Create Button Link */}
                 {/* <Link to="/lawyer/projects/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                     Créer un dossier
                 </Link> */}
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-10 px-6 bg-white rounded-lg shadow border border-gray-200">
                    <FaFolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun dossier</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau dossier.</p>
                    {/* Optional: Add create button link here */}
                </div>

            ) : (
                <ul className="space-y-4">
                    {projects.map((project) => (
                        <li key={project.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-grow mb-3 sm:mb-0">
                                    {/* Link to the lawyer's project chat page */}
                                    <Link to={`/lawyer/dossier/${project.id}`} className="text-lg font-semibold text-primary-700 hover:text-primary-800 hover:underline mb-1 block">
                                        {project.title}
                                    </Link>
                                    <p className="text-sm text-gray-600 mb-3">{project.description || <span className="italic text-gray-400">Aucune description</span>}</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                        {/* Project Type Badge */}
                                        {project.type && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 4.293a1 1 0 011.414 1.414l-13 13A1 1 0 014 19H1a1 1 0 01-1-1V6a1 1 0 01.293-.707l3-3a1 1 0 011.414 0L10 7.586l7.293-7.293z"></path></svg>
                                                {project.type}
                                            </span>
                                        )}
                                        {/* Project Status Badge */}
                                        {project.status && (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </span>
                                        )}
                                        {/* Creation Date */}
                                        <span className="text-gray-500 flex items-center">
                                             <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Créé le: {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                                {/* Delete Button */}
                                <div className="flex-shrink-0 self-center sm:self-start">
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                                        title="Supprimer le dossier"
                                    >
                                        <span className="sr-only">Supprimer</span>
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Export the renamed component
export default LawyerProjectsList;