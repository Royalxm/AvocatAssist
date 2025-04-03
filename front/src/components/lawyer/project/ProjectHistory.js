import React, { useState, useEffect } from 'react';
// Removed useParams as projectId will be passed as prop

// Helper function to format date/time
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// Accept projectId and isSummary props
function ProjectHistory({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchHistory = async () => {
      if (!projectId) return; // Don't fetch if no projectId
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to fetch history for projectId
        // If isSummary is true, the API could potentially fetch only the latest item
        // const response = await api.get(`/api/lawyer-projects/${projectId}/history?limit=${isSummary ? 1 : 10}`);
        // setHistory(response.data || []);
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        const mockHistory = [
          { id: 1, timestamp: '2025-04-03T10:00:00Z', user: 'Avocat Principal', action: 'Création du dossier.' },
          { id: 2, timestamp: '2025-04-03T11:30:00Z', user: 'Avocat Principal', action: 'Ajout du document "Contrat Initial.pdf".' },
          { id: 3, timestamp: '2025-04-03T15:45:00Z', user: 'Collaborateur 1', action: 'Ajout de la note "Appeler le client demain".' },
          { id: 4, timestamp: '2025-04-04T09:15:00Z', user: 'Avocat Principal', action: 'Tâche "Préparer les conclusions" marquée comme terminée.' },
          { id: 5, timestamp: '2025-04-04T14:00:00Z', user: 'Avocat Principal', action: 'Modification du statut du dossier: "En attente client".' },
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort descending
        setHistory(mockHistory);

      } catch (err) {
          console.error("Error fetching history:", err);
          setError("Erreur chargement historique.");
      } finally {
          setLoading(false);
      }
    }; // End of fetchHistory async function

    fetchHistory(); // Call the async function
  }, [projectId]);

  // --- Render Summary View ---
  if (isSummary) {
    const latestEvent = history[0]; // Assumes history is sorted descending by date
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Dernière Activité</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
        ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
        ) : latestEvent ? (
            <div>
                <p className="text-sm text-gray-800 truncate">{latestEvent.action}</p>
                <p className="text-xs text-gray-500">
                    {formatDateTime(latestEvent.timestamp)}
                </p>
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic">Aucune activité.</p>
        )}
        {/* Optionally add a link to the full view */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Historique / Timeline</h2>
      
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Chargement de l'historique...</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2"> {/* Limit height */}
          {history.length > 0 ? (
            history.map((event) => (
              <li key={event.id} className="border-l-4 border-primary-300 pl-3 py-1.5 bg-gray-50 rounded-r-md"> {/* Slightly lighter border */}
                <p className="text-sm font-medium text-gray-800">{event.action}</p>
                <p className="text-xs text-gray-500">
                  Par {event.user} - {formatDateTime(event.timestamp)}
                </p>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Aucun historique.</p>
          )}
        </ul>
      )}
      {/* TODO: Implement more sophisticated timeline view if needed */}
    </div>
  );
}

export default ProjectHistory;