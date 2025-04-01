import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const CreateLegalRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    documents: []
  });
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Fetch user's projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      
      try {
        const response = await axios.get('/projects');
        setProjects(response.data.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Impossible de charger vos projets. Veuillez réessayer plus tard.');
      } finally {
        setLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ 
        ...prev, 
        documents: [...prev.documents, ...newFiles]
      }));
    }
  };
  
  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };
  
  const handleGenerateSummary = async () => {
    if (!formData.description) {
      setError('Veuillez fournir une description pour générer un résumé.');
      return;
    }
    
    setIsGeneratingSummary(true);
    setError(null);
    
    try {
      const response = await axios.post('/ai/legal-request-summary', {
        description: formData.description
      });
      
      setAiSummary(response.data.summary);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.response?.data?.message || 'Erreur lors de la génération du résumé. Veuillez réessayer.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First create the legal request
      const requestData = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId || null,
        summaryAI: aiSummary || null
      };
      
      const response = await axios.post('/legal-requests', requestData);
      const legalRequestId = response.data.requestId;
      
      // If there are documents, upload them one by one
      if (formData.documents.length > 0) {
        setUploadProgress(0);
        
        const totalFiles = formData.documents.length;
        let filesUploaded = 0;
        
        const uploadInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              return prev;
            }
            return Math.min(95, prev + 1);
          });
        }, 200);
        
        // Upload each file
        for (const document of formData.documents) {
          const formDataObj = new FormData();
          formDataObj.append('file', document);
          formDataObj.append('legalRequestId', legalRequestId);
          
          try {
            await axios.post('/legal-request-documents/upload', formDataObj, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            filesUploaded++;
            setUploadProgress(Math.floor((filesUploaded / totalFiles) * 100));
          } catch (uploadErr) {
            console.error('Error uploading file:', uploadErr);
            // Continue with other files even if one fails
          }
        }
        
        clearInterval(uploadInterval);
        setUploadProgress(100);
      }
      
      // Navigate to the newly created legal request
      navigate(`/client/legal-requests/${legalRequestId}`);
    } catch (err) {
      console.error('Error creating legal request:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la demande juridique. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3">
              <Link
                to="/client/legal-requests"
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Nouvelle demande juridique</h1>
                <p className="text-white/80 mt-1">Créez une nouvelle demande d'assistance juridique</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-6 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Informations de la demande</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Litige avec mon propriétaire"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Décrivez votre problème juridique en détail..."
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Soyez aussi précis que possible pour obtenir les meilleures réponses.
                </p>
              </div>
              
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Projet associé (optionnel)
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Aucun projet associé</option>
                  {loadingProjects ? (
                    <option disabled>Chargement des projets...</option>
                  ) : (
                    projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title || `Projet #${project.id}`}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Associer cette demande à un projet existant permet de mieux contextualiser votre besoin.
                </p>
              </div>
              
              <div>
                <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-1">
                  Document(s) associé(s) (optionnel)
                </label>
                <input
                  type="file"
                  id="documents"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  multiple
                />
                
                {/* Liste des fichiers sélectionnés */}
                {formData.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Fichiers sélectionnés:</p>
                    <ul className="space-y-2">
                      {formData.documents.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700">{file.name} ({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="mt-1 text-sm text-gray-500">
                  Vous pouvez joindre des documents pertinents à votre demande (contrats, lettres, etc.)
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={!formData.description || isGeneratingSummary}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
                        <span>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Générer un résumé IA</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/client/legal-requests')}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Annuler
                      </div>
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.title || !formData.description}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                            <span>Création en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Créer la demande</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              {isSubmitting && formData.documents.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    <p className="text-sm font-medium text-blue-700">
                      Chargement des documents en cours... ({formData.documents.length} fichier{formData.documents.length > 1 ? 's' : ''})
                    </p>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress >= 20 && (
                        <span className="text-xs font-medium text-white">{uploadProgress}%</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Veuillez patienter pendant le téléchargement des documents...</p>
                </div>
              )}
              
              {aiSummary && (
                <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100 shadow-sm">
                  <div className="flex items-center gap-3 text-primary-700 mb-3">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Résumé généré par l'IA</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
                    <p className="text-xs text-primary-600 mt-3 italic">Ce résumé sera inclus dans votre demande juridique et pourra être consulté par les avocats.</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLegalRequest;
