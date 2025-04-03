import React, { useState } from 'react';
// Removed useParams as projectId will be passed as prop

// Accept projectId and isSummary props
function ProjectAiAssistant({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [prompt, setPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [generationResult, setGenerationResult] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [suggestions, setSuggestions] = useState([
      // Mock suggestions
      "Suggestion: Planifier un rappel pour la date d'échéance X.",
      "Suggestion: Vérifier la conformité du document Y.",
  ]);

  const handleGenerate = (e) => {
      e.preventDefault();
      // TODO: Implement API call for document generation based on prompt
      setGenerationResult(`Résultat de la génération pour : "${prompt}" (à implémenter)`);
  };

  const handleSummarize = (documentId) => {
      // TODO: Implement API call for document summary
      setSummaryResult(`Résumé du document ${documentId} (à implémenter)`);
  };

  const handleSearch = (e) => {
      e.preventDefault();
      // TODO: Implement API call for contextual search
      setSearchResult(`Résultats de recherche pour : "${searchQuery}" (à implémenter)`);
  };


  // --- Render Summary View ---
  if (isSummary) {
    // TODO: Fetch summary data (e.g., number of suggestions) if needed via API
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Assistance IA</h3>
        {/* Display number of suggestions or a placeholder */}
        <p className="text-sm text-gray-600">
            {suggestions.length > 0 ? `${suggestions.length} suggestion(s)` : "Aucune suggestion."}
        </p>
        {/* Optionally add a link to the full view */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Assistance IA</h2>

      {/* Section: Suggestions de tâches */}
      <div className="mb-6 p-3 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="text-md font-semibold mb-2 text-blue-800">Suggestions</h3>
        {/* TODO: Fetch suggestions from API */}
        {suggestions.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                {suggestions.map((s, index) => <li key={index}>{s}</li>)}
            </ul>
        ) : (
            <p className="text-sm text-blue-600 italic">Aucune suggestion.</p>
        )}
      </div>

      {/* Section: Résumé automatique des documents */}
      <div className="mb-6 p-3 border border-green-200 rounded-lg bg-green-50">
        <h3 className="text-md font-semibold mb-2 text-green-800">Résumé Doc.</h3>
        {/* TODO: Add UI to select a document */}
        <p className="text-xs text-gray-600 mb-1">Sélectionnez un doc.</p>
        <button
            onClick={() => handleSummarize('ID_DOC')}
            className="text-xs px-2 py-0.5 border border-green-500 text-green-700 rounded hover:bg-green-100"
        >
            Résumer
        </button>
        {summaryResult && <p className="mt-2 text-xs text-green-700 bg-green-100 p-1 rounded">{summaryResult}</p>}
      </div>

      {/* Section: Génération de documents */}
      <div className="mb-6 p-3 border border-purple-200 rounded-lg bg-purple-50">
        <h3 className="text-md font-semibold mb-2 text-purple-800">Génération Doc.</h3>
        <form onSubmit={handleGenerate}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez le document..."
            rows="2"
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mb-1 text-xs"
          ></textarea>
          <button
            type="submit"
            className="text-xs px-2 py-0.5 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Générer
          </button>
        </form>
        {generationResult && <p className="mt-2 text-xs text-purple-700 bg-purple-100 p-1 rounded">{generationResult}</p>}
      </div>

      {/* Section: Recherche contextuelle */}
      <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
        <h3 className="text-md font-semibold mb-2 text-yellow-800">Recherche</h3>
         <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher notes/docs..."
              className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mb-1 text-xs"
            />
            <button
              type="submit"
              className="text-xs px-2 py-0.5 border border-transparent rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Rechercher
            </button>
        </form>
        {searchResult && <p className="mt-2 text-xs text-yellow-700 bg-yellow-100 p-1 rounded">{searchResult}</p>}
      </div>

    </div>
  );
}

export default ProjectAiAssistant;