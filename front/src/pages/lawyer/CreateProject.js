import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Corrected import
import { useAuth } from '../../contexts/AuthContext';

// Renamed component
const LawyerCreateProject = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(''); // e.g., 'divorce', 'contrat', 'litige', etc.
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Define project types - can be customized for lawyers later
  const projectTypes = [
    'Droit de la famille',
    'Droit du travail',
    'Droit immobilier',
    'Droit des sociétés',
    'Contentieux commercial',
    'Propriété intellectuelle',
    'Droit pénal',
    'Droit administratif',
    'Autre',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !type) {
      setError('Le nom du dossier et le type sont requis.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Create the project (uses logged-in lawyer's ID via api)
      const projectResponse = await api.post('/projects', { // Use 'api'
        title,
        type,
        description,
      });

      if (!projectResponse.data.success) {
        throw new Error(projectResponse.data.message || 'Erreur lors de la création du dossier.');
      }
      const projectId = projectResponse.data.projectId;

      // 2. Create the initial chat for the project (backend handles association)
      // The backend /projects endpoint already creates the chat, so this might be redundant
      // Let's rely on the backend logic from projectController.js which creates the chat
      // If the backend didn't create the chat automatically, we would need this:
      /*
      const chatResponse = await axiosInstance.post('/chats', {
        projectId: projectId,
        title: `Dossier: ${title}`, // Initial chat title
      });

      if (!chatResponse.data.id) {
         throw new Error(chatResponse.data.message || 'Erreur lors de la création du chat initial.');
      }
      */

      // 3. Navigate to the new lawyer project chat page
      navigate(`/lawyer/dossier/${projectId}`);

    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la création du dossier.');
      setLoading(false); // Keep the form visible on error
    }
    // No need to setLoading(false) here if navigation occurs on success
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow border border-gray-200">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau dossier</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Nom du dossier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Ex: Affaire Durand c/ Société XYZ"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type de dossier / Domaine juridique <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="" disabled>-- Sélectionnez un type --</option>
            {projectTypes.map((ptype) => (
              <option key={ptype} value={ptype}>{ptype}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description brève (facultatif)
          </label>
          <textarea
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Ajoutez des notes initiales, références client, etc."
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer le dossier'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Export the renamed component
export default LawyerCreateProject;