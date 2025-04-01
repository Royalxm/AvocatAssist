import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa'; // Assuming react-icons is installed

const ProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/projects', { // Corrected endpoint
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data.projects || []); // Expect data in response.data.projects
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
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchProjects(); // Refresh list
            } catch (err) {
                console.error("Error deleting project:", err);
                alert('Failed to delete project.');
            }
        }
    };

    // Helper to get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'ouvert': // Assuming 'active' or 'ouvert' means active
                return 'bg-green-100 text-green-800';
            case 'inactive':
            case 'fermé': // Assuming 'inactive' or 'fermé' means inactive
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-4 text-center">Chargement des dossiers...</div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Mes Dossiers</h1>
            {projects.length === 0 ? (
                <div className="text-center py-10 px-6 bg-white rounded-lg shadow border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun dossier</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau dossier.</p>
                    {/* Optional: Add create button link here if needed */}
                    {/* <div className="mt-6">
                        <Link to="/client/projects/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Créer un dossier
                        </Link>
                    </div> */}
                </div>

            ) : (
                <ul className="space-y-4">
                    {projects.map((project) => (
                        <li key={project.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-grow mb-3 sm:mb-0">
                                    {/* Link to the project chat/details page */}
                                    <Link to={`/client/dossier/${project.id}`} className="text-lg font-semibold text-primary-700 hover:text-primary-800 hover:underline mb-1 block">
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
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)} {/* Capitalize status */}
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

export default ProjectsList;