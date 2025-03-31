import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LegalRequests = () => {
  const [legalRequests, setLegalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    proposalText: '',
    price: '',
    estimatedDuration: ''
  });
  
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
            proposals: 2,
            hasProposed: false
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
            proposals: 3,
            hasProposed: true
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
            proposals: 1,
            hasProposed: false
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
            proposals: 0,
            hasProposed: false
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
    setShowProposalForm(false);
    setProposalData({
      proposalText: '',
      price: '',
      estimatedDuration: ''
    });
  };
  
  const handleShowProposalForm = () => {
    setShowProposalForm(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProposalData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    
    if (!proposalData.proposalText || !proposalData.price || !proposalData.estimatedDuration) {
      return;
    }
    
    // In a real app, this would call the API to submit the proposal
    // For now, we'll just simulate success
    
    // Update the request to show that the lawyer has proposed
    setLegalRequests(legalRequests.map(request => 
      request.id === selectedRequest.id 
        ? { 
            ...request, 
            hasProposed: true,
            proposals: request.proposals + 1
          } 
        : request
    ));
    
    // Reset form and close modal
    setProposalData({
      proposalText: '',
      price: '',
      estimatedDuration: ''
    });
    setShowProposalForm(false);
    setSelectedRequest(null);
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
        return <span className="badge badge-primary">Ouverte</span>;
      case 'en cours':
        return <span className="badge badge-warning">En cours</span>;
      case 'fermée':
        return <span className="badge badge-success">Fermée</span>;
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
      </div>
      
      {/* Legal requests list */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(request => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleRequestSelect(request)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
                      <span>Client: {request.clientName}</span>
                      <span>•</span>
                      <span>Créée le {formatDate(request.createdAt)}</span>
                      <span>•</span>
                      {getStatusBadge(request.status)}
                      <span>•</span>
                      <span>{request.proposals} proposition(s)</span>
                    </div>
                  </div>
                  
                  {!request.hasProposed && request.status === 'ouverte' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestSelect(request);
                        handleShowProposalForm();
                      }}
                      className="btn-primary btn-sm"
                    >
                      Proposer
                    </button>
                  )}
                  
                  {request.hasProposed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Proposition soumise
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{request.description}</p>
                
                {request.summaryAI && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Résumé IA :</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.summaryAI}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucune demande juridique trouvée.'
              : `Aucune demande juridique avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
      
      {/* Request detail modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedRequest.title}</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!showProposalForm ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
                      <span>Client: {selectedRequest.clientName}</span>
                      <span>•</span>
                      <span>Créée le {formatDate(selectedRequest.createdAt)}</span>
                      <span>•</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-gray-700 mb-4">{selectedRequest.description}</p>
                    
                    {selectedRequest.summaryAI && (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Résumé IA :</h3>
                        <p className="text-sm text-gray-600">{selectedRequest.summaryAI}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="btn-outline"
                    >
                      Fermer
                    </button>
                    
                    {!selectedRequest.hasProposed && selectedRequest.status === 'ouverte' && (
                      <button
                        onClick={handleShowProposalForm}
                        className="btn-primary"
                      >
                        Faire une proposition
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="space-y-6">
                  <h3 className="text-lg font-medium mb-2">Nouvelle proposition</h3>
                  
                  <div className="form-group">
                    <label htmlFor="proposalText" className="form-label">Détails de votre proposition</label>
                    <textarea
                      id="proposalText"
                      name="proposalText"
                      value={proposalData.proposalText}
                      onChange={handleInputChange}
                      className="form-input h-32"
                      placeholder="Décrivez votre approche, vos services et comment vous comptez aider le client..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="price" className="form-label">Prix proposé (€)</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={proposalData.price}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Ex: 350"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="estimatedDuration" className="form-label">Durée estimée</label>
                      <input
                        type="text"
                        id="estimatedDuration"
                        name="estimatedDuration"
                        value={proposalData.estimatedDuration}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Ex: 2-3 semaines"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Soumettre la proposition
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalRequests;
