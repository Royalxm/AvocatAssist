import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { toast } from 'react-toastify'; // Import toast for notifications
const LegalRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [legalRequest, setLegalRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadingDocId, setDownloadingDocId] = useState(null); // State to track download
  const { isAuthenticated } = useAuth(); // Get isAuthenticated function from context
  
  useEffect(() => {
    fetchLegalRequest();
  }, [id]);
  
  const fetchLegalRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/legal-requests/${id}`);
      setLegalRequest(response.data.request);
      
      // Fetch proposals and documents
      fetchProposals();
      fetchDocuments();
    } catch (err) {
      console.error('Error fetching legal request:', err);
      setError(err.response?.data?.message || 'Impossible de charger la demande juridique.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProposals = async () => {
    try {
      const response = await axios.get(`/legal-requests/${id}/proposals`);
      setProposals(response.data.proposals || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      // Don't set error here to avoid blocking the whole page
    }
  };
  
  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    
    try {
      const response = await axios.get(`/legal-requests/${id}/documents`);
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Don't set error here to avoid blocking the whole page
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !id) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('legalRequestId', id);
    
    try {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      const response = await axios.post('/legal-request-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      // Check if document was uploaded successfully
      if (response.data.document) {
        const newDocument = response.data.document;
        setDocuments(prev => [newDocument, ...prev]);
        
        // Show success message even if there were parsing issues
        if (response.data.message && response.data.message.includes("PDF parsing error")) {
          setError("Le document a été téléchargé avec succès, mais le texte n'a pas pu être extrait en raison d'un problème de format PDF. Le document reste accessible.");
        }
      } else {
        setError("Le document a été téléchargé mais n'a pas pu être traité correctement.");
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      
      // Handle specific PDF parsing errors
      if (err.response?.data?.message && err.response.data.message.includes("PDF")) {
        setError("Le document PDF semble être corrompu ou dans un format non pris en charge. Essayez de le convertir en un autre format ou de le régénérer.");
      } else {
        setError(err.response?.data?.message || "Erreur lors de l'upload du document.");
      }
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ouverte':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">Ouverte</span>;
      case 'en cours':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">En cours</span>;
      case 'fermée':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Fermée</span>;
      default:
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    else if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    else if (fileType.includes('image')) return '🖼️';
    else if (fileType.includes('text')) return '📃';
    else return '📁';
  };

  const handleDownload = async (docId, fileName) => {
    if (!isAuthenticated()) { // Use isAuthenticated() function for the check
      toast.error("Vous devez être connecté pour télécharger des documents.");
      return;
    }
    setDownloadingDocId(docId);
    try {
      const response = await axios.get(`/legal-request-documents/document/${docId}/download`, {
        responseType: 'blob', // Important for file download
        // No need to set Authorization header manually, interceptor does it
      });

      // Create a link element, use it to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Set the filename
      document.body.appendChild(link);
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Téléchargement de ${fileName} réussi.`);

    } catch (err) {
      console.error('Error downloading document:', err);
      const errorMessage = err.response?.data?.message || `Erreur lors du téléchargement de ${fileName}.`;
      // Attempt to read error message from blob if it exists
      if (err.response?.data instanceof Blob) {
        try {
          const errorJson = JSON.parse(await err.response.data.text());
          toast.error(errorJson.message || errorMessage);
        } catch (parseError) {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setDownloadingDocId(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Chargement de la demande...</p>
        <p className="text-gray-500 text-sm mt-2">Veuillez patienter pendant que nous récupérons les informations</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-red-800">Une erreur est survenue</h2>
        </div>
        <p className="text-red-700 mb-6 pl-14">{error}</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/client/legal-requests')}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour aux demandes
          </button>
        </div>
      </div>
    );
  }
  
  if (!legalRequest) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-amber-800">Demande non trouvée</h2>
        </div>
        <p className="text-amber-700 mb-6 pl-14">La demande juridique que vous recherchez n'existe pas ou a été supprimée.</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/client/legal-requests')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour aux demandes
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{legalRequest.title || `Demande #${legalRequest.id}`}</h1>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${
                    legalRequest.status === 'ouverte' ? 'bg-blue-100 text-blue-800' :
                    legalRequest.status === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                    legalRequest.status === 'fermée' ? 'bg-green-100 text-green-800' :
                    'bg-white text-gray-800'
                  }`}>
                    {legalRequest.status === 'ouverte' ? 'Ouverte' :
                     legalRequest.status === 'en cours' ? 'En cours' :
                     legalRequest.status === 'fermée' ? 'Fermée' :
                     legalRequest.status || 'Non défini'}
                  </span>
                </div>
                <p className="text-white/80 mt-1">Créée le {formatDate(legalRequest.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/client/legal-requests/${id}/edit`)}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </div>
            </button>
            <button
              onClick={() => navigate(`/client/ai-assistant?legalRequestId=${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              Consulter l'IA
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Request details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-line">{legalRequest.description}</p>
            </div>
          </div>
          
          {/* AI Summary */}
          {legalRequest.summaryAI && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">Résumé généré par l'IA</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700">{legalRequest.summaryAI}</p>
              </div>
            </div>
          )}
          
          {/* Proposals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Propositions d'avocats</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {proposals.length} proposition(s)
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {proposals.length > 0 ? (
                proposals.map(proposal => (
                  <div key={proposal.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                          {proposal.lawyer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{proposal.lawyer.name}</h3>
                          <p className="text-sm text-gray-500">{proposal.lawyer.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{proposal.price}€</div>
                        <div className="text-sm text-gray-500">Proposé le {formatDate(proposal.createdAt)}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{proposal.description}</p>
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                        Contacter l'avocat
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune proposition pour le moment</h3>
                  <p className="mb-4">
                    Les avocats examinent votre demande et vous feront des propositions prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Documents */}
        <div className="space-y-6">
          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            </div>
            <div className="p-6">
              {/* Upload form */}
              <form onSubmit={handleUploadDocument} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                    Ajouter un document
                  </label>
                  <input
                    type="file"
                    id="document"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                
                {selectedFile && (
                  <div className="text-sm text-gray-500 mb-4">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
                
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Chargement...' : 'Ajouter le document'}
                </button>
              </form>
              
              {/* Document list */}
              <div className="space-y-4">
                {loadingDocuments ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : documents.length > 0 ? (
                  documents.map(doc => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{doc.fileName}</h3>
                        <p className="text-sm text-gray-500">{formatFileSize(doc.fileSize)}</p>
                        <p className="text-xs text-gray-400">Ajouté le {formatDate(doc.uploadedAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                        disabled={downloadingDocId === doc.id}
                        className={`text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-wait ${downloadingDocId === doc.id ? 'animate-pulse' : ''}`}
                        title="Télécharger"
                      >
                        {downloadingDocId === doc.id ? (
                          <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Aucun document associé à cette demande</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status and actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Statut et actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Statut actuel:</span>
                {getStatusBadge(legalRequest.status)}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/client/ai-assistant?legalRequestId=${id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mb-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Consulter l'IA
                </button>
                
                <button
                  onClick={() => navigate(`/client/legal-requests/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier la demande
                </button>
                
                {legalRequest.status !== 'fermée' && (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fermer la demande
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalRequestDetail;
