import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Corrected import
import { useAuth } from '../../contexts/AuthContext';

// Renamed component
const LawyerCreateProject = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(''); // e.g., 'divorce', 'contrat', 'litige', etc.
  const [description, setDescription] = useState('');
  const [projectScope, setProjectScope] = useState('personal'); // 'personal' or 'client'
  const [clientSelectionMode, setClientSelectionMode] = useState('new'); // 'new' or 'existing'
  const [existingClients, setExistingClients] = useState([]); // To store fetched clients
  const [selectedClientId, setSelectedClientId] = useState('');
  // State for new client details
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientCompanyName, setNewClientCompanyName] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientsLoading, setClientsLoading] = useState(false); // Loading state for clients
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

  // --- Fetch existing clients ---
  useEffect(() => {
    const fetchClients = async () => {
      if (projectScope === 'client') { // Only fetch if client scope is selected
        setClientsLoading(true);
        try {
          // TODO: Create this endpoint on the backend
          // const response = await api.get('/api/project-clients'); // Endpoint to get lawyer's clients
          // setExistingClients(response.data || []);
          
          // Mock data for now:
          await new Promise(resolve => setTimeout(resolve, 300));
          setExistingClients([
              { id: 1, firstName: 'Alice', lastName: 'Dubois', email: 'alice.d@example.com' },
              { id: 2, firstName: 'Bob', lastName: 'Martin', email: 'bob.m@example.com' },
          ]);

        } catch (err) {
          console.error("Error fetching clients:", err);
          // Handle client fetch error separately if needed
        } finally {
          setClientsLoading(false);
        }
      } else {
        setExistingClients([]); // Clear list if scope is personal
      }
    };

    fetchClients();
  }, [projectScope]); // Re-fetch if scope changes (though likely not needed)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // --- Validation ---
    setError(null); // Clear previous errors
    if (!title) {
      setError('Le nom du dossier est requis.');
      return;
    }
    if (!type) {
        setError('Le type de dossier / domaine juridique est requis.');
        return;
    }
    if (projectScope === 'client') {
        if (clientSelectionMode === 'existing' && !selectedClientId) {
            setError('Veuillez sélectionner un client existant.');
            return;
        }
        if (clientSelectionMode === 'new' && (!newClientFirstName || !newClientLastName)) {
            setError('Le prénom et le nom sont requis pour un nouveau client.');
            return;
        }
    }
    // --- End Validation ---
    setLoading(true);
    setError(null);

    try {
      // 1. Create the project (uses logged-in lawyer's ID via api)
      // Use the new endpoint for lawyer-specific projects
      // Prepare payload based on scope and client selection mode
      let payload = {
          title,
          type,
          description,
          isClientProject: projectScope === 'client',
          // Status defaults on backend
      };

      if (projectScope === 'client') {
          if (clientSelectionMode === 'existing') {
              payload.clientId = selectedClientId;
          } else { // New client details
              payload.clientFirstName = newClientFirstName;
              payload.clientLastName = newClientLastName;
              payload.clientEmail = newClientEmail || null; // Send null if empty
              payload.clientPhone = newClientPhone || null;
              payload.clientAddress = newClientAddress || null;
              payload.clientCompanyName = newClientCompanyName || null;
              payload.clientNotes = newClientNotes || null;
          }
      }

      const projectResponse = await api.post('/lawyer-projects', payload);

      // The new endpoint returns the created project object directly
      if (!projectResponse.data || !projectResponse.data.id) {
        throw new Error(projectResponse.data?.message || 'Erreur lors de la création du dossier: ID manquant dans la réponse.');
      }
      const newProject = projectResponse.data;
      const projectId = newProject.id;

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
      // Navigate to the new lawyer project DETAIL page (not chat page initially)
      navigate(`/lawyer/projects/${projectId}`);

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

        {/* Project Scope Selection */}
        <fieldset className="mt-4">
            <legend className="block text-sm font-medium text-gray-700 mb-2">Portée du dossier</legend>
            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <input id="scopePersonal" name="projectScopeOption" type="radio" checked={projectScope === 'personal'} onChange={() => setProjectScope('personal')} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                    <label htmlFor="scopePersonal" className="ml-2 block text-sm text-gray-900">Personnel / Interne</label>
                </div>
                <div className="flex items-center">
                    <input id="scopeClient" name="projectScopeOption" type="radio" checked={projectScope === 'client'} onChange={() => setProjectScope('client')} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                    <label htmlFor="scopeClient" className="ml-2 block text-sm text-gray-900">Pour un Client</label>
                </div>
            </div>
        </fieldset>

        {/* Conditional Client Section */}
        {projectScope === 'client' && (
            <div className="mt-4 border-t border-gray-200 pt-4">
                <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">Informations Client</legend>
                    <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center">
                            <input id="clientNew" name="clientSelectionOption" type="radio" checked={clientSelectionMode === 'new'} onChange={() => setClientSelectionMode('new')} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                            <label htmlFor="clientNew" className="ml-2 block text-sm text-gray-900">Nouveau Client</label>
                        </div>
                        <div className="flex items-center">
                            <input id="clientExisting" name="clientSelectionOption" type="radio" checked={clientSelectionMode === 'existing'} onChange={() => setClientSelectionMode('existing')} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" disabled={clientsLoading || existingClients.length === 0} />
                            <label htmlFor="clientExisting" className={`ml-2 block text-sm ${clientsLoading || existingClients.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>Client Existant</label>
                        </div>
                    </div>
                </fieldset>

                {/* Existing Client Dropdown */}
                {clientSelectionMode === 'existing' && (
                    <div>
                        <label htmlFor="existingClient" className="block text-sm font-medium text-gray-700">Sélectionner un client</label>
                        <select
                            id="existingClient"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            required={clientSelectionMode === 'existing'}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            disabled={clientsLoading}
                        >
                            <option value="" disabled>{clientsLoading ? 'Chargement...' : '-- Sélectionnez --'}</option>
                            {existingClients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.lastName}, {client.firstName} ({client.email || 'N/A'})
                                </option>
                            ))}
                        </select>
                        {existingClients.length === 0 && !clientsLoading && <p className="mt-1 text-xs text-gray-500">Aucun client existant trouvé.</p>}
                    </div>
                )}

                {/* New Client Form Fields */}
                {clientSelectionMode === 'new' && (
                    <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="newClientFirstName" className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                                <input type="text" id="newClientFirstName" value={newClientFirstName} onChange={(e) => setNewClientFirstName(e.target.value)} required={clientSelectionMode === 'new'} className="mt-1 block w-full input-style" placeholder="Prénom"/>
                            </div>
                            <div>
                                <label htmlFor="newClientLastName" className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                                <input type="text" id="newClientLastName" value={newClientLastName} onChange={(e) => setNewClientLastName(e.target.value)} required={clientSelectionMode === 'new'} className="mt-1 block w-full input-style" placeholder="Nom de famille"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="newClientEmail" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="newClientEmail" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className="mt-1 block w-full input-style" placeholder="adresse@email.com"/>
                        </div>
                        <div>
                            <label htmlFor="newClientPhone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input type="tel" id="newClientPhone" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="mt-1 block w-full input-style" placeholder="Numéro de téléphone"/>
                        </div>
                        {/* Add Address, Company, Notes fields similarly if needed */}
                         <div>
                            <label htmlFor="newClientAddress" className="block text-sm font-medium text-gray-700">Adresse</label>
                            <textarea id="newClientAddress" rows="2" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} className="mt-1 block w-full input-style" placeholder="Adresse postale"></textarea>
                        </div>
                         <div>
                            <label htmlFor="newClientCompanyName" className="block text-sm font-medium text-gray-700">Société</label>
                            <input type="text" id="newClientCompanyName" value={newClientCompanyName} onChange={(e) => setNewClientCompanyName(e.target.value)} className="mt-1 block w-full input-style" placeholder="Nom de la société (si applicable)"/>
                        </div>
                         <div>
                            <label htmlFor="newClientNotes" className="block text-sm font-medium text-gray-700">Notes Client</label>
                            <textarea id="newClientNotes" rows="2" value={newClientNotes} onChange={(e) => setNewClientNotes(e.target.value)} className="mt-1 block w-full input-style" placeholder="Notes diverses sur le client"></textarea>
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="mt-4"> {/* Added margin-top */}
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