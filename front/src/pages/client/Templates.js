import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Import the api instance
import { FaDownload, FaEdit, FaArrowLeft } from 'react-icons/fa'; // Import icons

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Category filter might not be directly supported by API, adjust if needed
  // const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false); // State for generation loading
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [error, setError] = useState(null); // State for errors
  
  useEffect(() => {
    // Fetch templates from API
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/ai/templates');
        // The API returns { templates: [...] } where each template has id, name, variables
        // We need to adapt this structure or fetch full details if needed
        // For now, assume the API provides enough info for listing
        setTemplates(response.data.templates || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err.response?.data?.message || 'Failed to load templates.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);
  
  useEffect(() => {
    // Reset form data when template changes
    // Reset form data when template changes
    // The API only gives variable names, not full field definitions.
    // We'll need to adjust how the form is built or fetch full template details.
    // For now, let's initialize based on variable names.
    if (selectedTemplate) {
      const initialFormData = {};
      (selectedTemplate.variables || []).forEach(variableName => {
        initialFormData[variableName] = '';
      });
      setFormData(initialFormData);
      setPreviewMode(false);
      setGeneratedDocument('');
      setError(null); // Clear previous errors
    }
  }, [selectedTemplate]);
  
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };
  
  const handleBackToList = () => {
    setSelectedTemplate(null);
    setFormData({});
    setPreviewMode(false);
    setGeneratedDocument('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateDocument = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setGenerating(true);
    setError(null);
    setGeneratedDocument('');

    try {
        const response = await api.post('/ai/generate-document', {
            templateName: selectedTemplate.id, // Use the template ID/key from the API
            variables: formData
        });
        setGeneratedDocument(response.data.document); // Assuming API returns { document: "..." }
        setPreviewMode(true);
    } catch (err) {
         console.error('Error generating document:', err);
         setError(err.response?.data?.message || 'Failed to generate document.');
    } finally {
        setGenerating(false);
    }
  };
  
  const handleDownload = () => {
    // Create a blob with the document content
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.title}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Filtering based on API data (name only for now)
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Category filtering might need adjustment based on API data or removed if not supported
    // const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch; // && matchesCategory;
  });

  // Categories might need to be fetched or derived differently if not part of template list API response
  // const categories = ['all', ...new Set(templates.map(template => template.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modèles de documents</h1>
      
      {!selectedTemplate ? (
        <>
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
             <input
                type="text"
                placeholder="Rechercher un modèle par nom..."
                className="form-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Category filter removed for now, pending API support */}
          </div>
          
          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Category display removed for now */}
                    
                    <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
                    {/* Description might not be available from list API */}
                    {/* <p className="text-gray-600 mb-4">{template.description}</p> */}
                    
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="btn-primary w-full"
                    >
                      Utiliser ce modèle
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Aucun modèle ne correspond à votre recherche.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                {/* <p className="text-gray-600">{selectedTemplate.description}</p> */}
              </div>
              
              <button
                onClick={handleBackToList}
                className="btn-outline flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Retour
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {!previewMode ? (
              <form onSubmit={handleGenerateDocument} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Generate form fields based on API 'variables' */}
                  {(selectedTemplate.variables || []).map((variableName) => {
                    // Simple input for each variable for now
                    // Could be enhanced later based on variable naming conventions (e.g., 'date' -> date input)
                    const label = variableName
                        .replace(/([A-Z])/g, ' $1') // Add space before capitals
                        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

                    return (
                      <div key={variableName} className="form-group">
                        <label htmlFor={variableName} className="form-label">
                          {label}
                          {/* Basic required assumption - enhance if needed */}
                          <span className="text-danger-500 ml-1">*</span>
                        </label>
                        <input
                          type="text" // Default to text input
                          id={variableName}
                          name={variableName}
                          value={formData[variableName] || ''}
                          onChange={handleInputChange}
                          className="form-input"
                          required={true} // Assume all are required for now
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={generating} // Disable while generating
                  >
                    {generating ? 'Génération...' : 'Générer le document'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Aperçu du document généré</h3>
                   {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                  <div className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 border rounded max-h-96 overflow-y-auto">
                    {generatedDocument || "Le document généré apparaîtra ici."}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => { setPreviewMode(false); setError(null); }} // Clear error when going back
                    className="btn-outline flex items-center"
                  >
                   <FaEdit className="mr-2" /> Modifier
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex items-center"
                    disabled={!generatedDocument || generating} // Disable if no doc or generating
                  >
                   <FaDownload className="mr-2" /> Télécharger (.txt)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
