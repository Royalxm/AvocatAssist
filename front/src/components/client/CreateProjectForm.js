import React, { useState } from 'react';
import api from '../../utils/api'; // Use the correct api instance
import { useAuth } from '../../contexts/AuthContext';

// Renamed and adapted for modal use
const CreateProjectForm = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(''); // e.g., 'divorce', 'contrat', 'litige', etc.
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Define project types - you might fetch these from an API later
  const projectTypes = [
    'Divorce / Séparation',
    'Droit du travail',
    'Droit immobilier',
    'Droit des sociétés',
    'Litige commercial',
    'Propriété intellectuelle',
    'Autre',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !type) {
      setError('Le titre et le type de dossier sont requis.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Create the project - backend now handles chat creation automatically
      const projectResponse = await api.post('/projects', {
        title,
        type,
        description,
      });

      if (!projectResponse.data.success) {
        throw new Error(projectResponse.data.message || 'Erreur lors de la création du dossier.');
      }
      const newProject = { // Construct a basic project object to pass back
          id: projectResponse.data.projectId,
          title,
          type,
          description,
          // Add other relevant fields if returned by API and needed
      };

      // Call the onSuccess callback passed from the parent (ProjectsList)
      if (onSuccess) {
        onSuccess(newProject); // Pass the newly created project data
      }

    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
      setLoading(false); // Keep modal open on error
    }
    // Don't set loading false on success, as the modal will close
  };

  return (
    // Removed outer div with max-width, modal handles sizing
    <form onSubmit={handleSubmit} className="space-y-4">
       <h2 className="text-xl font-semibold mb-4 text-gray-700">Nouveau Dossier</h2> {/* Added title for modal context */}

       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <div>
          <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700">
            Nom du dossier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="modal-title" // Changed id to avoid potential conflicts
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Ex: Divorce Dupont, Contrat de travail Martin"
          />
        </div>

        <div>
          <label htmlFor="modal-type" className="block text-sm font-medium text-gray-700">
            Type de problème juridique <span className="text-red-500">*</span>
          </label>
          <select
            id="modal-type" // Changed id
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
          <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700">
            Description brève (facultatif)
          </label>
          <textarea
            id="modal-description" // Changed id
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Ajoutez quelques détails sur la situation si vous le souhaitez."
          ></textarea>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4">
           <button
            type="button"
            onClick={onCancel} // Use onCancel prop
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer Dossier'}
          </button>
        </div>
    </form>
  );
};

export default CreateProjectForm;