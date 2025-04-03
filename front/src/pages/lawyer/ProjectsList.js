import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { FaTrash, FaFolderOpen, FaPlus } from 'react-icons/fa'; // Added FaPlus
import { LuCalendarClock } from "react-icons/lu";
import { GoTag } from "react-icons/go";
import { GoCheckCircle } from "react-icons/go";
import Modal from '../../components/Modal'; // Import Modal component
import CreateProjectForm from '../../components/lawyer/CreateProjectForm'; // Import the new form component

// Renamed component
const LawyerProjectsList = () => {
    const [projects, setProjects] = useState([]); // Raw list from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState(''); // e.g., 'client', 'perso'
    const [filterStatus, setFilterStatus] = useState(''); // e.g., 'ouvert', 'fermé', 'urgent'
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const navigate = useNavigate(); // Hook for navigation after success

    const fetchProjects = async () => {
        setLoading(true);
        try {
            // Use the new endpoint for lawyer-specific projects
            const response = await api.get('/lawyer-projects');
            // Assuming the response data is the array of projects directly
            setProjects(response.data || []);
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
                // Use the new endpoint for lawyer-specific projects
                await api.delete(`/lawyer-projects/${projectId}`);
                fetchProjects(); // Refresh list
            } catch (err) {
                console.error("Error deleting project:", err);
                alert('Échec de la suppression du dossier.');
            }
        }
    };

    // Helper to get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'ouvert':
            case 'en cours': // Added 'en cours' as potentially green
                return 'bg-green-100 text-green-800';
            case 'fermé':
                return 'bg-red-100 text-red-800';
            case 'urgent':
                return 'bg-yellow-100 text-yellow-800';
            case 'en attente':
                 return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Filtering logic
    const filteredProjects = projects.filter(project => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            project.title?.toLowerCase().includes(searchTermLower) ||
            project.description?.toLowerCase().includes(searchTermLower);

        const matchesType = filterType === '' || project.type === filterType;

        const matchesStatus = filterStatus === '' || project.status === filterStatus;
        // TODO: Add date/client filtering if needed

        return matchesSearch && matchesType && matchesStatus;
    });

    // --- Modal Handlers ---
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleProjectCreated = (newProject) => {
        handleCloseModal(); // Close modal on success
        fetchProjects(); // Refresh the list to show the new project
        // Optionally navigate to the new project's detail page
        // navigate(`/lawyer/projects/${newProject.id}`);
    };
    // --- End Modal Handlers ---

    if (loading) return <div className="p-6 text-center text-gray-500">Chargement des dossiers...</div>;
    if (error && !isModalOpen) return <div className="m-6 p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">{error}</div>; // Hide list error if modal is open

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Mes Dossiers</h1>
                 {/* Changed Link to Button to open modal */}
                 <button
                     onClick={handleOpenModal}
                     className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
                 >
                     <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                     Créer un dossier
                 </button>
            </div>

            {/* Filter and Search Section */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Titre, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    {/* Type Filter */}
                    <div>
                        <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            id="typeFilter"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                            <option value="">Tous les types</option>
                            {/* TODO: Populate types dynamically if needed */}
                            <option value="Client">Client</option>
                            <option value="Perso">Perso</option>
                            <option value="Recherche">Recherche</option>
                            <option value="Pro Bono">Pro Bono</option>
                            {/* Add other types as necessary */}
                        </select>
                    </div>
                    {/* Status Filter */}
                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                            id="statusFilter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                            <option value="">Tous les statuts</option>
                            {/* TODO: Populate statuses dynamically if needed */}
                            <option value="Ouvert">Ouvert</option>
                            <option value="En cours">En cours</option>
                            <option value="Fermé">Fermé</option>
                            <option value="Urgent">Urgent</option>
                            <option value="En attente">En attente</option>
                            {/* Add other statuses as necessary */}
                        </select>
                    </div>
                </div>
            </div>

            {/* Project List or Empty State */}
            {filteredProjects.length === 0 ? (
                <div className="text-center py-10 px-6 bg-white rounded-lg shadow border border-gray-200">
                    <FaFolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun dossier trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">Essayez d'ajuster vos filtres ou créez un nouveau dossier.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {filteredProjects.map((project) => (
                        <li key={project.id} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                                {/* Main Content */}
                                <div className="flex-grow">
                                    <Link to={`/lawyer/projects/${project.id}`} className="text-lg font-semibold text-gray-800 hover:text-primary-700 hover:underline mb-1 block truncate">
                                        {project.title}
                                    </Link>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description || <span className="italic">Aucune description</span>}</p>
                                    {/* Badges and Date */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                        {project.type && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-800">
                                                <GoTag className="w-3 h-3 mr-1" />
                                                {project.type}
                                            </span>
                                        )}
                                        {project.status && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(project.status)}`}>
                                                <GoCheckCircle className="w-3 h-3 mr-1" />
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </span>
                                        )}
                                        <span className="text-gray-500 flex items-center">
                                             <LuCalendarClock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                             Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                                {/* Delete Button Area */}
                                <div className="flex-shrink-0 self-center sm:self-center">
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors duration-150"
                                        title="Supprimer le dossier"
                                    >
                                        <span className="sr-only">Supprimer</span>
                                        <FaTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Créer un nouveau dossier"
            >
                <CreateProjectForm
                    onSuccess={handleProjectCreated}
                    onCancel={handleCloseModal}
                />
            </Modal>

        </div>
    );
};

export default LawyerProjectsList;