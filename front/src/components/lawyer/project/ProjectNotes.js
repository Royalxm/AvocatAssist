import React, { useState, useEffect } from 'react';
// Removed useParams as projectId will be passed as prop

// Helper function to format date/time
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// Accept projectId and isSummary props
function ProjectNotes({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  // Assume we can get the current user's name (replace with actual auth context later)
  const currentUser = "Avocat Principal"; 

  useEffect(() => {
    const fetchNotes = async () => {
      if (!projectId) return; // Don't fetch if no projectId
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to fetch notes/log for projectId
        // If isSummary, API could fetch only the latest note
        // const response = await api.get(`/api/lawyer-projects/${projectId}/notes?limit=${isSummary ? 1 : 10}`);
        // setNotes(response.data || []);
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockNotes = [
          { id: 1, timestamp: '2025-04-03T15:45:00Z', user: 'Collaborateur 1', text: 'Appeler le client demain pour confirmer les détails.' },
          { id: 2, timestamp: '2025-04-05T10:00:00Z', user: 'Avocat Principal', text: 'Reçu les pièces manquantes par email. À vérifier.' },
          { id: 3, timestamp: '2025-04-06T11:20:00Z', user: 'Avocat Principal', text: 'Stratégie discutée avec le client. Accord sur la marche à suivre.' },
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort descending
        setNotes(mockNotes);

      } catch (err) {
          console.error("Error fetching notes:", err);
          setError("Erreur chargement notes.");
      } finally {
          setLoading(false);
      }
    }; // End of fetchNotes async function

    fetchNotes(); // Call the async function
  }, [projectId]);

  const handleInputChange = (event) => {
    setNewNote(event.target.value);
  };

  const handleAddNote = (event) => {
    event.preventDefault();
    if (newNote.trim() === '') return;

    const newNoteObject = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser, // Use the assumed current user
      text: newNote,
      // projectId: projectId // Associate with the current project if sending to API
    };

    // TODO: Replace with API call to add note/log entry
    setNotes([newNoteObject, ...notes]); // Add to the beginning of the list
    setNewNote('');
  };

  // --- Render Summary View ---
  if (isSummary) {
    const latestNote = notes[0]; // Assumes notes are sorted descending
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Dernière Note / Entrée</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
        ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
        ) : latestNote ? (
            <div>
                <p className="text-sm text-gray-800 truncate">{latestNote.text}</p>
                <p className="text-xs text-gray-500">
                    Par {latestNote.user} - {formatDateTime(latestNote.timestamp)}
                </p>
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic">Aucune note.</p>
        )}
        {/* Optionally add a link to the full view */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Notes & Journal Interne</h2>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="mb-4">
        <textarea
          value={newNote}
          onChange={handleInputChange}
          placeholder="Ajouter une note..."
          rows="2" // Smaller text area
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        ></textarea>
        <button
          type="submit"
          className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" // Slightly smaller button
        >
          Ajouter
        </button>
      </form>

      {/* Notes/Log List */}
      {loading ? (
        <p className="text-sm text-gray-500">Chargement des notes...</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2"> {/* Limit height */}
          {notes.length > 0 ? (
            notes.map((note) => (
              <li key={note.id} className="p-2 bg-gray-50 rounded-md border border-gray-200 text-sm"> {/* Smaller padding */}
                <p className="text-gray-800 whitespace-pre-wrap mb-1">{note.text}</p>
                <p className="text-xs text-gray-500">
                  Par {note.user} - {formatDateTime(note.timestamp)}
                </p>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Aucune note.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default ProjectNotes;