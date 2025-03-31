import React, { useState, useEffect } from 'react';

const LegalRequests = () => {
  const [legalRequests, setLegalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchLegalRequests = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockLegalRequests = [
          {
            id: 1,
            clientId: 101,
            clientName: 'Jean Dupont',
            title: 'Litige avec mon propriétaire',
            description: 'Mon propriétaire refuse de faire des réparations nécessaires dans mon appartement malgré plusieurs demandes écrites.',
            summaryAI: 'Litige locatif concernant des réparations non effectuées par le propriétaire malgré des demandes formelles du locataire. Situation pouvant relever de l\'article 6 de la loi du 6 juillet 1989.',
            status: 'ouverte',
            createdAt: '2025-03-20T14:30:00Z',
            proposals: [
              {
                id: 1,
                lawyerId: 201,
                lawyerName: 'Sophie Lefebvre',
                proposalText: 'Je vous propose de vous accompagner dans ce litige locatif. Je commencerai par rédiger une mise en demeure à votre propriétaire et vous accompagnerai dans les démarches juridiques nécessaires pour faire valoir vos droits.',
                price: 350,
                estimatedDuration: '3-4 semaines',
                status: 'en attente',
                submittedAt: '2025-03-20T16:15:00Z'
              },
              {
                id: 2,
                lawyerId: 202,
                lawyerName: 'Thomas Dubois',
                proposalText: 'Suite à l\'étude de votre dossier, je vous propose mes services pour résoudre ce litige. Je rédigerai une mise en demeure et vous accompagnerai dans toutes les démarches nécessaires.',
                price: 400,
                estimatedDuration: '2-3 semaines',
                status: 'en attente',
                submittedAt: '2025-03-21T09:30:00Z'
              }
            ]
          },
          {
            id: 2,
            clientId: 102,
            clientName: 'Marie Martin',
            title: 'Contestation de licenciement',
            description: 'J\'ai été licencié pour faute grave mais je conteste les motifs invoqués par mon employeur.',
            summaryAI: 'Contestation d\'un licenciement pour faute grave. Le salarié conteste la qualification des faits et la procédure pourrait relever du droit du travail, notamment des articles L1232-1 et suivants du Code du travail.',
            status: 'en cours',
            createdAt: '2025-03-15T10:15:00Z',
            proposals: [
              {
                id: 3,
                lawyerId: 201,
                lawyerName: 'Sophie Lefebvre',
                proposalText: 'Je vous propose de vous accompagner dans la contestation de votre licenciement. Nous commencerons par analyser en détail les motifs invoqués et la procédure suivie, puis nous préparerons un dossier solide pour contester cette décision.',
                price: 600,
                estimatedDuration: '1-2 mois',
                status: 'acceptée',
                submittedAt: '2025-03-16T09:45:00Z'
              }
            ]
          },
          {
            id: 3,
            clientId: 103,
            clientName: 'Sophie Lefebvre',
            title: 'Problème de voisinage',
            description: 'Mon voisin fait régulièrement du bruit tard le soir et refuse de dialoguer.',
            summaryAI: 'Trouble anormal de voisinage lié à des nuisances sonores récurrentes. Situation relevant potentiellement de l\'article R. 1336-5 du Code de la santé publique et de la jurisprudence sur les troubles anormaux de voisinage.',
            status: 'ouverte',
            createdAt: '2025-03-05T09:45:00Z',
            proposals: [
              {
                id: 4,
                lawyerId: 203,
                lawyerName: 'Philippe Moreau',
                proposalText: 'Je vous propose de vous accompagner dans ce litige de voisinage. Je commencerai par rédiger une mise en demeure formelle à l\'attention de votre voisin, puis nous évaluerons les suites à donner en fonction de sa réponse.',
                price: 300,
                estimatedDuration: '2-3 semaines',
                status: 'en attente',
                submittedAt: '2025-03-06T14:30:00Z'
              }
            ]
          },
          {
            id: 4,
            clientId: 104,
            clientName: 'Pierre Dubois',
            title: 'Litige avec un e-commerce',
            description: 'J\'ai commandé un produit qui n\'a jamais été livré. Le service client ne répond pas à mes demandes de remboursement.',
            summaryAI: 'Litige de consommation concernant une non-livraison de produit commandé en ligne. Situation relevant du droit de la consommation, notamment des articles L216-1 et suivants du Code de la consommation.',
            status: 'ouverte',
            createdAt: '2025-03-01T16:20:00Z',
            proposals: []
          }
        ];
        
        setLegalRequests(mockLegalRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching legal requests:', error);
        setLoading(false);
      }
    };
    
    fetchLegalRequests();
  }, []);
  
  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };
  
  const handleStatusChange = (requestId, newStatus) => {
    // In a real app, this would call the API to update the status
    // For now, we'll just update the local state
    
    const updatedRequests = legalRequests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus } 
        : request
    );
    
    setLegalRequests(updatedRequests);
    
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
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
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ouverte':
        return <span className="badge badge-primary">Ouverte</span>;
      case 'en cours':
        return <span className="badge badge-warning">En cours</span>;
      case 'fermée':
        return <span className="badge badge-success">Fermée</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const getProposalStatusBadge = (status) => {
    switch (status) {
      case 'en attente':
        return <span className="badge badge-warning">En attente</span>;
      case 'acceptée':
        return <span className="badge badge-success">Acceptée</span>;
      case 'refusée':
        return <span className="badge badge-danger">Refusée</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const filteredRequests = legalRequests.filter(request => {
    // Filter by status
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.clientName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Demandes juridiques</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Rechercher..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('ouverte')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'ouverte'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Ouvertes
        </button>
        <button
          onClick={() => setFilter('en cours')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'en cours'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          En cours
        </button>
        <button
          onClick={() => setFilter('fermée')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'fermée'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Fermées
        </button>
      </div>
      
      {/* Legal requests list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demande
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propositions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{request.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{request.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.clientName}</div>
                    <div className="text-sm text-gray-500">ID: {request.clientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.proposals.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRequestSelect(request)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucune demande juridique trouvée.'
              : `Aucune demande juridique avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
      
      {/* Request detail modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedRequest.title}</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Request details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Client</h3>
                    <p className="mt-1">{selectedRequest.clientName} (ID: {selectedRequest.clientId})</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                    <p className="mt-1">{formatDate(selectedRequest.createdAt)} à {formatTime(selectedRequest.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Propositions</h3>
                    <p className="mt-1">{selectedRequest.proposals.length}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.description}</p>
                </div>
                
                {selectedRequest.summaryAI && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Résumé IA :</h3>
                    <p className="text-sm text-gray-600">{selectedRequest.summaryAI}</p>
                  </div>
                )}
                
                {/* Status change */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Modifier le statut</h3>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'ouverte')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        selectedRequest.status === 'ouverte'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                      disabled={selectedRequest.status === 'ouverte'}
                    >
                      Ouverte
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'en cours')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        selectedRequest.status === 'en cours'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                      disabled={selectedRequest.status === 'en cours'}
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'fermée')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        selectedRequest.status === 'fermée'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                      disabled={selectedRequest.status === 'fermée'}
                    >
                      Fermée
                    </button>
                  </div>
                </div>
                
                {/* Proposals */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Propositions ({selectedRequest.proposals.length})</h3>
                  
                  {selectedRequest.proposals.length > 0 ? (
                    <div className="space-y-4">
                      {selectedRequest.proposals.map((proposal) => (
                        <div key={proposal.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{proposal.lawyerName}</h4>
                              <p className="text-sm text-gray-500">
                                Soumise le {formatDate(proposal.submittedAt)} à {formatTime(proposal.submittedAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary-600">{formatPrice(proposal.price)}</div>
                              <p className="text-sm text-gray-500">{proposal.estimatedDuration}</p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{proposal.proposalText}</p>
                          
                          <div className="flex justify-between items-center">
                            {getProposalStatusBadge(proposal.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune proposition pour cette demande.</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedRequest(null);
                    }}
                    className="btn-outline"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalRequests;
