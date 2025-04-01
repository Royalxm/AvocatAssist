import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const EditLegalRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [legalRequest, setLegalRequest] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchLegalRequest();
    fetchComments();
  }, [id]);
  
  const fetchLegalRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/legal-requests/${id}`);
      const request = response.data.request;
      
      setLegalRequest(request);
      setFormData({
        description: request.description || '',
      });
    } catch (err) {
      console.error('Error fetching legal request:', err);
      setError(err.response?.data?.message || 'Impossible de charger la demande juridique.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchComments = async () => {
    try {
      const response = await axios.get(`/legal-requests/${id}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      // Don't set error here to avoid blocking the whole page
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description) {
      setError('Veuillez fournir une description pour la demande juridique.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update the legal request
      const requestData = {
        description: formData.description,
      };
      
      await axios.put(`/legal-requests/${id}`, requestData);
      
      // Navigate back to the legal request detail page
      navigate(`/client/legal-requests/${id}`);
    } catch (err) {
      console.error('Error updating legal request:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la demande juridique. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsAddingComment(true);
    
    try {
      const response = await axios.post(`/legal-requests/${id}/comments`, {
        content: newComment
      });
      
      // Add the new comment to the list
      setComments(prev => [response.data.comment, ...prev]);
      
      // Clear the comment input
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire. Veuillez réessayer.');
    } finally {
      setIsAddingComment(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/legal-requests/comments/${commentId}`);
      
      // Remove the deleted comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du commentaire. Veuillez réessayer.');
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
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Chargement de la demande...</p>
        <p className="text-gray-500 text-sm mt-2">Veuillez patienter pendant que nous récupérons les informations</p>
      </div>
    );
  }
  
  if (error && !legalRequest) {
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3">
              <Link
                to={`/client/legal-requests/${id}`}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Modifier la demande juridique</h1>
                <p className="text-white/80 mt-1">Demande #{legalRequest.id} - {legalRequest.title}</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Edit form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Modifier la description</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description détaillée <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Décrivez votre problème juridique en détail..."
                    required
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    Soyez aussi précis que possible pour obtenir les meilleures réponses.
                  </p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/client/legal-requests/${id}`)}
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
                    disabled={isSubmitting || !formData.description}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Enregistrer les modifications</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right column - Comments */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Commentaires</h2>
            </div>
            <div className="p-6">
              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Ajouter un commentaire
                  </label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={handleCommentChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Écrivez votre commentaire ici..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={!newComment.trim() || isAddingComment}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingComment ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Ajouter le commentaire</span>
                    </div>
                  )}
                </button>
              </form>
              
              {/* Comments list */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                            {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{comment.userName || 'Utilisateur'}</div>
                            <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                          </div>
                        </div>
                        {comment.userId === legalRequest.clientId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Supprimer le commentaire"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>Aucun commentaire pour le moment</p>
                    <p className="text-sm mt-1">Soyez le premier à commenter cette demande</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLegalRequest;