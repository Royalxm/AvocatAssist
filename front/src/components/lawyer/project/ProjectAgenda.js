import React, { useState, useEffect } from 'react';
// Removed useParams as projectId will be passed as prop

// Helper function to format date/time
const formatDateTime = (isoString, includeTime = true) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
  const formattedTime = includeTime ? ` à ${date.toLocaleTimeString('fr-FR', timeOptions)}` : '';
  return `${formattedDate}${formattedTime}`;
};

// Accept projectId and isSummary props
function ProjectAgenda({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchAgenda = async () => {
      if (!projectId) return; // Don't fetch if no projectId
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to fetch agenda events for projectId
        // If isSummary, API could fetch only the next upcoming event
        // const response = await api.get(`/api/lawyer-projects/${projectId}/agenda?limit=${isSummary ? 1 : 10}&upcoming=true`);
        // setEvents(response.data || []);
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 250));
        const mockEvents = [
          { id: 1, type: 'deadline', title: 'Échéance dépôt conclusions', dateTime: '2025-04-15T17:00:00Z', description: 'Dépôt au greffe avant 17h.' },
          { id: 2, type: 'meeting', title: 'Rendez-vous client', dateTime: '2025-04-18T10:30:00Z', description: 'Discussion stratégie.' },
          { id: 3, type: 'hearing', title: 'Audience Tribunal XYZ', dateTime: '2025-04-25T09:00:00Z', description: 'Salle 3B.' },
          { id: 4, type: 'reminder', title: 'Rappel: Relancer partie adverse', dateTime: '2025-04-20T00:00:00Z', description: 'Relance téléphonique ou email.' }, // Date only reminder
        ].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)); // Sort ascending
        setEvents(mockEvents);

      } catch (err) {
          console.error("Error fetching agenda:", err);
          setError("Erreur chargement agenda.");
      } finally {
          setLoading(false);
      }
    }; // End of fetchAgenda async function

    fetchAgenda(); // Call the async function
  }, [projectId]);

  const handleAddEvent = () => {
      alert('Fonctionnalité "Ajouter Événement/Rappel" à implémenter.');
      // TODO: Implement logic to add event (modal or form)
  };

  // Helper to get an icon based on event type
  const getEventIcon = (type) => {
      switch (type) {
          case 'deadline': return '📅'; // Calendar
          case 'meeting': return '👥'; // People
          case 'hearing': return '⚖️'; // Scales
          case 'reminder': return '🔔'; // Bell
          default: return '📌'; // Pin
      }
  };

  // --- Render Summary View ---
  if (isSummary) {
    // Find the next upcoming event (assuming events are sorted ascending)
    const now = new Date();
    const nextEvent = events.find(event => new Date(event.dateTime) >= now);
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Prochain Événement</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
        ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
        ) : nextEvent ? (
            <div className="flex items-start">
                <span className="text-lg mr-2 pt-0.5">{getEventIcon(nextEvent.type)}</span>
                <div>
                    <p className="text-sm font-medium text-gray-800 truncate">{nextEvent.title}</p>
                    <p className="text-xs text-primary-700 font-semibold">
                        {formatDateTime(nextEvent.dateTime, nextEvent.type !== 'reminder')}
                    </p>
                </div>
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic">Aucun événement à venir.</p>
        )}
        {/* Optionally add a link to the full view */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
       <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Agenda & Rappels</h2>
            <button
                onClick={handleAddEvent}
                className="text-sm px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
            >
                Ajouter
            </button>
       </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      {/* TODO: Integrate with a full calendar view component if needed */}

      {loading ? (
        <p className="text-sm text-gray-500">Chargement de l'agenda...</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2"> {/* Limit height */}
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id} className="flex items-start p-2 bg-gray-50 rounded-md border-l-4 border-primary-300"> {/* Smaller padding */}
                <span className="text-lg mr-2 pt-0.5">{getEventIcon(event.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-primary-700 font-semibold">
                    {formatDateTime(event.dateTime, event.type !== 'reminder')}
                  </p>
                  {event.description && <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>}
                </div>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Aucun événement.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default ProjectAgenda;