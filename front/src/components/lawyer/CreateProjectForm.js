import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
// Removed useNavigate as navigation will be handled by the parent

// Props: onSuccess (called with new project data), onCancel (called to close modal)
const CreateProjectForm = ({ onSuccess, onCancel }) => {
  // --- State copied from LawyerCreateProject page ---
  const [title, setTitle] = useState('');
  const [type, setType] = useState(''); // Domain type
  const [description, setDescription] = useState('');
  const [projectScope, setProjectScope] = useState('personal'); // 'personal' or 'client'
  const [clientSelectionMode, setClientSelectionMode] = useState('new'); // 'new' or 'existing'
  const [existingClients, setExistingClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientCompanyName, setNewClientCompanyName] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientsLoading, setClientsLoading] = useState(false);
  // Removed currentUser from useAuth as it's not directly used here, lawyerId comes from backend context

  // --- Project Types (copied) ---
  const projectTypes = [
    'Droit de la famille', 'Droit du travail', 'Droit immobilier', 'Droit des sociétés',
    'Contentieux commercial', 'Propriété intellectuelle', 'Droit pénal', 'Droit administratif',
    'Autre',
  ];

  // --- Fetch existing clients (copied, TODO: needs backend endpoint) ---
   useEffect(() => {
     const fetchClients = async () => {
       if (projectScope === 'client') {
         setClientsLoading(true);
         try {
           // Fetch clients from the backend API
           const response = await api.get('/api/project-clients');
           setExistingClients(response.data || []); // Use actual data or empty array
         } catch (err) {
           console.error("Error fetching clients:", err);
           setError("Erreur lors du chargement des clients existants."); // Inform user
         } finally {
           setClientsLoading(false);
         }
       } else {
         setExistingClients([]); 
       }
     };
     fetchClients();
   }, [projectScope]);

  // --- Handle Submit (adapted) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    setError(null);
    if (!title) return setError('Le nom du dossier est requis.');
    if (!type) return setError('Le type de dossier / domaine juridique est requis.');
    if (projectScope === 'client') {
        if (clientSelectionMode === 'existing' && !selectedClientId) return setError('Veuillez sélectionner un client existant.');
        if (clientSelectionMode === 'new' && (!newClientFirstName || !newClientLastName)) return setError('Le prénom et le nom sont requis pour un nouveau client.');
    }
    // End Validation

    setLoading(true);
    try {
      // Prepare payload
      let payload = {
          title, type, description,
          isClientProject: projectScope === 'client',
      };
      if (projectScope === 'client') {
          if (clientSelectionMode === 'existing') {
              payload.clientId = selectedClientId;
          } else {
              payload.clientFirstName = newClientFirstName;
              payload.clientLastName = newClientLastName;
              payload.clientEmail = newClientEmail || null;
              payload.clientPhone = newClientPhone || null;
              payload.clientAddress = newClientAddress || null;
              payload.clientCompanyName = newClientCompanyName || null;
              payload.clientNotes = newClientNotes || null;
          }
      }

      const projectResponse = await api.post('/lawyer-projects', payload);

      if (!projectResponse.data || !projectResponse.data.id) {
        throw new Error(projectResponse.data?.message || 'Erreur lors de la création du dossier: ID manquant.');
      }
      
      // Call the onSuccess prop passed from the parent (LawyerProjectsList)
      onSuccess(projectResponse.data); 

    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
      setLoading(false); // Keep modal open on error
    } 
    // Don't set loading false on success, modal will close
  };

  // --- Form JSX (copied and adapted) ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {/* Fields copied from LawyerCreateProject page */}
      <div>
        <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700">Nom du dossier <span className="text-red-500">*</span></label>
        <input type="text" id="modal-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 input-style" placeholder="Ex: Affaire Durand c/ Société XYZ" />
      </div>
      <div>
        <label htmlFor="modal-type" className="block text-sm font-medium text-gray-700">Type / Domaine <span className="text-red-500">*</span></label>
        <select id="modal-type" value={type} onChange={(e) => setType(e.target.value)} required className="mt-1 input-style">
          <option value="" disabled>-- Sélectionnez un type --</option>
          {projectTypes.map((ptype) => (<option key={ptype} value={ptype}>{ptype}</option>))}
        </select>
      </div>
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">Portée</legend>
        <div className="flex items-center space-x-6">
          <div className="flex items-center"><input id="modal-scopePersonal" name="projectScopeOptionModal" type="radio" checked={projectScope === 'personal'} onChange={() => setProjectScope('personal')} className="radio-style" /><label htmlFor="modal-scopePersonal" className="ml-2 label-style">Personnel</label></div>
          <div className="flex items-center"><input id="modal-scopeClient" name="projectScopeOptionModal" type="radio" checked={projectScope === 'client'} onChange={() => setProjectScope('client')} className="radio-style" /><label htmlFor="modal-scopeClient" className="ml-2 label-style">Client</label></div>
        </div>
      </fieldset>

      {projectScope === 'client' && (
        <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Client</legend>
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center"><input id="modal-clientNew" name="clientSelectionOptionModal" type="radio" checked={clientSelectionMode === 'new'} onChange={() => setClientSelectionMode('new')} className="radio-style" /><label htmlFor="modal-clientNew" className="ml-2 label-style">Nouveau</label></div>
              <div className="flex items-center"><input id="modal-clientExisting" name="clientSelectionOptionModal" type="radio" checked={clientSelectionMode === 'existing'} onChange={() => setClientSelectionMode('existing')} className="radio-style" disabled={clientsLoading || existingClients.length === 0} /><label htmlFor="modal-clientExisting" className={`ml-2 label-style ${clientsLoading || existingClients.length === 0 ? 'text-gray-400' : ''}`}>Existant</label></div>
            </div>
          </fieldset>

          {clientSelectionMode === 'existing' && (
            <div>
              <label htmlFor="modal-existingClient" className="block text-sm font-medium text-gray-700">Sélectionner</label>
              <select id="modal-existingClient" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} required={clientSelectionMode === 'existing'} className="mt-1 input-style disabled:bg-gray-100" disabled={clientsLoading}>
                <option value="" disabled>{clientsLoading ? 'Chargement...' : '-- Sélectionnez --'}</option>
                {existingClients.map(client => (<option key={client.id} value={client.id}>{client.lastName}, {client.firstName} ({client.email || 'N/A'})</option>))}
              </select>
              {existingClients.length === 0 && !clientsLoading && <p className="mt-1 text-xs text-gray-500">Aucun client existant.</p>}
            </div>
          )}

          {clientSelectionMode === 'new' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="modal-newClientFirstName" className="label-style">Prénom <span className="text-red-500">*</span></label><input type="text" id="modal-newClientFirstName" value={newClientFirstName} onChange={(e) => setNewClientFirstName(e.target.value)} required={clientSelectionMode === 'new'} className="mt-1 input-style" placeholder="Prénom"/></div>
                <div><label htmlFor="modal-newClientLastName" className="label-style">Nom <span className="text-red-500">*</span></label><input type="text" id="modal-newClientLastName" value={newClientLastName} onChange={(e) => setNewClientLastName(e.target.value)} required={clientSelectionMode === 'new'} className="mt-1 input-style" placeholder="Nom"/></div>
              </div>
              <div><label htmlFor="modal-newClientEmail" className="label-style">Email</label><input type="email" id="modal-newClientEmail" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className="mt-1 input-style" placeholder="adresse@email.com"/></div>
              <div><label htmlFor="modal-newClientPhone" className="label-style">Téléphone</label><input type="tel" id="modal-newClientPhone" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="mt-1 input-style" placeholder="Numéro"/></div>
              <div><label htmlFor="modal-newClientAddress" className="label-style">Adresse</label><textarea id="modal-newClientAddress" rows="2" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} className="mt-1 input-style" placeholder="Adresse postale"></textarea></div>
              <div><label htmlFor="modal-newClientCompanyName" className="label-style">Société</label><input type="text" id="modal-newClientCompanyName" value={newClientCompanyName} onChange={(e) => setNewClientCompanyName(e.target.value)} className="mt-1 input-style" placeholder="Nom (si applicable)"/></div>
              <div><label htmlFor="modal-newClientNotes" className="label-style">Notes Client</label><textarea id="modal-newClientNotes" rows="2" value={newClientNotes} onChange={(e) => setNewClientNotes(e.target.value)} className="mt-1 input-style" placeholder="Notes diverses"></textarea></div>
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700">Description (facultatif)</label>
        <textarea id="modal-description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 input-style" placeholder="Notes initiales..."></textarea>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Annuler
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              {loading ? 'Création...' : 'Créer le dossier'}
          </button>
      </div>
      {/* Basic input styling (replace with your actual shared styles if needed) */}
      <style jsx>{`
          .input-style {
              display: block;
              width: 100%;
              padding: 0.5rem 0.75rem;
              border: 1px solid #D1D5DB; /* gray-300 */
              border-radius: 0.375rem; /* rounded-md */
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
          }
          .input-style:focus {
              outline: none;
              border-color: #4F46E5; /* primary-500 */
              box-shadow: 0 0 0 1px #4F46E5; /* ring-primary-500 */
          }
          .label-style {
              display: block;
              font-size: 0.875rem; /* text-sm */
              font-weight: 500; /* font-medium */
              color: #374151; /* text-gray-700 */
          }
          .radio-style {
              height: 1rem; /* h-4 */
              width: 1rem; /* w-4 */
              color: #4F46E5; /* text-primary-600 */
              border-color: #D1D5DB; /* border-gray-300 */
          }
          .radio-style:focus {
               box-shadow: 0 0 0 1px #4F46E5; /* ring-primary-500 */
          }
      `}</style>
    </form>
  );
};

export default CreateProjectForm;