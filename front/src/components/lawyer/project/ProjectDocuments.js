import React, { useState, useEffect } from 'react';
// Removed useParams as projectId will be passed as prop

// Helper function to format file size (optional)
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Accept projectId and isSummary props
function ProjectDocuments({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId) return; // Don't fetch if no projectId
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to fetch documents for projectId
        // If isSummary is true, API could just return the count
        // const response = await api.get(`/api/lawyer-projects/${projectId}/documents?summary=${isSummary}`);
        // setDocuments(response.data || []);
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 400));
        const mockDocuments = [
          { id: 1, name: 'Contrat Initial.pdf', size: 123456, uploadDate: '2025-04-03T11:30:00Z', tags: ['Contrat', 'Important'] },
          { id: 2, name: 'Pièces Client - Lot 1.zip', size: 5678901, uploadDate: '2025-04-04T10:00:00Z', tags: ['Pièces Client'] },
          { id: 3, name: 'Conclusions Adversaire.docx', size: 98765, uploadDate: '2025-04-05T16:20:00Z', tags: ['Conclusions', 'Adversaire'] },
          { id: 4, name: 'Note Interne Stratégie.md', size: 2048, uploadDate: '2025-04-06T09:05:00Z', tags: ['Interne', 'Stratégie'] },
        ];
        setDocuments(mockDocuments);

      } catch (err) {
          console.error("Error fetching documents:", err);
          setError("Erreur chargement documents.");
      } finally {
          setLoading(false);
      }
    }; // End of fetchDocuments async function

    fetchDocuments(); // Call the async function
  }, [projectId]);

  const handleUploadClick = () => {
    // TODO: Implement file upload logic (e.g., open file input)
    alert('Fonctionnalité d\'upload à implémenter.');
  };

  // --- Render Summary View ---
  if (isSummary) {
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Documents</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
        ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
        ) : (
            <p className="text-sm text-gray-600">
                {documents.length} document(s)
            </p>
        )}
        {/* Optionally add a link to the full view */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" // Slightly smaller button
        >
          Ajouter
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      {/* TODO: Add filtering/sorting options here */}
      {/* TODO: Add smart document template selection/generation here (Feature 5) */}

      {loading ? (
        <p className="text-sm text-gray-500">Chargement des documents...</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-2"> {/* Limit height */}
          {documents.length > 0 ? (
            documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm" // Smaller padding
              >
                <div className="flex-1 min-w-0 mr-2"> {/* Allow truncate */}
                  <p className="font-medium text-primary-700 truncate hover:underline cursor-pointer">
                    {/* TODO: Link to view/download */}
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.uploadDate).toLocaleDateString()} | {formatFileSize(doc.size)}
                  </p>
                  {/* TODO: Implement Tag display and editing (Feature 9) */}
                  {/* <div className="mt-1 flex flex-wrap gap-1">
                    {doc.tags.map(tag => (
                      <span key={tag} className="inline-block bg-gray-200 rounded-full px-1.5 py-0.5 text-xs font-semibold text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div> */}
                </div>
                <div className="flex-shrink-0 space-x-1"> {/* Smaller spacing */}
                  {/* TODO: Add View/Download/Edit/Delete actions */}
                   <button className="text-xs text-gray-500 hover:text-primary-600 p-1 rounded hover:bg-gray-100">Voir</button>
                   <button className="text-xs text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">Suppr.</button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Aucun document.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default ProjectDocuments;