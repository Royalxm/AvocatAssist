import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LegalRequests = () => {
  const navigate = useNavigate();
  const [legalRequests, setLegalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchLegalRequests();
  }, [filter, pagination.page]);
  
  const fetchLegalRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/legal-requests/client', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filter !== 'all' ? filter : undefined
        }
      });
      
      setLegalRequests(response.data.requests || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } catch (err) {
      console.error('Error fetching legal requests:', err);
      setError(err.response?.data?.message || 'Impossible de charger les demandes juridiques.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ouverte':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Ouverte</span>;
      case 'en cours':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">En cours</span>;
      case 'fermée':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Fermée</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && legalRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-3xl font-bold">Mes demandes juridiques</h1>
            <p className="mt-2 opacity-90">Gérez vos demandes d'assistance juridique</p>
          </div>
          <button
            onClick={() => navigate('/client/legal-requests/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 rounded-lg transition-colors shadow-sm hover:bg-gray-100 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nouvelle demande
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Erreur:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}
      
      {/* Filter */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrer par statut
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Toutes les demandes
          </button>
          <button
            onClick={() => setFilter('ouverte')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'ouverte'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Ouvertes
          </button>
          <button
            onClick={() => setFilter('en cours')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'en cours'
                ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            En cours
          </button>
          <button
            onClick={() => setFilter('fermée')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'fermée'
                ? 'bg-green-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Fermées
          </button>
        </div>
      </div>
      
      {/* Legal requests list */}
      <div className="space-y-4">
        {loading && legalRequests.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {!loading && legalRequests.length > 0 ? (
          legalRequests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-primary-600 transition-colors">
                      <Link to={`/client/legal-requests/${request.id}`}>
                        {request.title || `Demande #${request.id}`}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(request.createdAt)}
                      </span>
                      <span className="text-gray-300">•</span>
                      {getStatusBadge(request.status)}
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {request.proposalsCount || 0} proposition{(request.proposalsCount !== 1) ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/client/legal-requests/${request.id}`}
                    className="px-4 py-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium shadow-sm"
                  >
                    Voir les détails
                  </Link>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{request.description}</p>
                
                {request.summaryAI && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Résumé IA
                    </div>
                    <p className="text-sm text-indigo-900 line-clamp-3">{request.summaryAI}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande juridique trouvée</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? 'Vous n\'avez pas encore créé de demande juridique.'
                : `Aucune demande juridique avec le statut "${filter}" n'a été trouvée.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/client/legal-requests/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Créer ma première demande
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </button>
            
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    pagination.page === page
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Suivant
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default LegalRequests;
