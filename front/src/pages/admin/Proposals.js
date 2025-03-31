import React, { useState, useEffect } from 'react';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchProposals = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockProposals = [
          {
            id: 1,
            requestId: 1,
            requestTitle: 'Litige avec mon propriétaire',
            lawyerId: 201,
            lawyerName: 'Sophie Lefebvre',
            lawyerSpecialties: 'Droit du travail, Droit immobilier',
            clientId: 101,
            clientName: 'Jean Dupont',
            proposalText: 'Je vous propose de vous accompagner dans ce litige locatif. Je commencerai par rédiger une mise en demeure à votre propriétaire et vous accompagnerai dans les démarches juridiques nécessaires pour faire valoir vos droits.',
            price: 350,
            estimatedDuration: '3-4 semaines',
            status: 'en attente',
            submittedAt: '2025-03-20T16:15:00Z'
          },
          {
            id: 2,
            requestId: 1,
            requestTitle: 'Litige avec mon propriétaire',
            lawyerId: 202,
            lawyerName: 'Thomas Dubois',
            lawyerSpecialties: 'Droit de la famille, Droit des affaires',
            clientId: 101,
            clientName: 'Jean Dupont',
            proposalText: 'Suite à l\'étude de votre dossier, je vous propose mes services pour résoudre ce litige. Je rédigerai une mise en demeure et vous accompagnerai dans toutes les démarches nécessaires.',
            price: 400,
            estimatedDuration: '2-3 semaines',
            status: 'en attente',
            submittedAt: '2025-03-21T09:30:00Z'
          },
          {
            id: 3,
            requestId: 2,
            requestTitle: 'Contestation de licenciement',
            lawyerId: 201,
            lawyerName: 'Sophie Lefebvre',
            lawyerSpecialties: 'Droit du travail, Droit immobilier',
            clientId: 102,
            clientName: 'Marie Martin',
            proposalText: 'Je vous propose de vous accompagner dans la contestation de votre licenciement. Nous commencerons par analyser en détail les motifs invoqués et la procédure suivie, puis nous préparerons un dossier solide pour contester cette décision.',
            price: 600,
            estimatedDuration: '1-2 mois',
            status: 'acceptée',
            submittedAt: '2025-03-16T09:45:00Z',
            acceptedAt: '2025-03-17T14:20:00Z',
            transaction: {
              id: 1,
              amount: 600,
              commission: 60,
              status: 'complétée',
              timestamp: '2025-03-17T14:25:00Z'
            }
          },
          {
            id: 4,
            requestId: 3,
            requestTitle: 'Problème de voisinage',
            lawyerId: 203,
            lawyerName: 'Philippe Moreau',
            lawyerSpecialties: 'Droit pénal, Droit de la consommation',
            clientId: 103,
            clientName: 'Sophie Lefebvre',
            proposalText: 'Je vous propose de vous accompagner dans ce litige de voisinage. Je commencerai par rédiger une mise en demeure formelle à l\'attention de votre voisin, puis nous évaluerons les suites à donner en fonction de sa réponse.',
            price: 300,
            estimatedDuration: '2-3 semaines',
            status: 'en attente',
            submittedAt: '2025-03-06T14:30:00Z'
          },
          {
            id: 5,
            requestId: 5,
            requestTitle: 'Divorce à l\'amiable',
            lawyerId: 202,
            lawyerName: 'Thomas Dubois',
            lawyerSpecialties: 'Droit de la famille, Droit des affaires',
            clientId: 105,
            clientName: 'Isabelle Petit',
            proposalText: 'Je vous propose de vous accompagner dans votre procédure de divorce à l\'amiable. Je m\'occuperai de la rédaction de la convention de divorce et vous accompagnerai tout au long de la procédure.',
            price: 800,
            estimatedDuration: '2-3 mois',
            status: 'refusée',
            submittedAt: '2025-02-25T11:15:00Z',
            refusedAt: '2025-02-26T16:40:00Z',
            refusalReason: 'Tarif trop élevé'
          }
        ];
        
        setProposals(mockProposals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setLoading(false);
      }
    };
    
    fetchProposals();
  }, []);
  
  const handleProposalSelect = (proposal) => {
    setSelectedProposal(proposal);
    setShowDetailModal(true);
  };
  
  const handleStatusChange = (proposalId, newStatus, reason = '') => {
    // In a real app, this would call the API to update the status
    // For now, we'll just update the local state
    
    const updatedProposals = proposals.map(proposal => {
      if (proposal.id === proposalId) {
        const updatedProposal = { ...proposal, status: newStatus };
        
        if (newStatus === 'acceptée') {
          updatedProposal.acceptedAt = new Date().toISOString();
          // In a real app, we would also create a transaction
          updatedProposal.transaction = {
            id: Math.floor(Math.random() * 1000),
            amount: proposal.price,
            commission: proposal.price * 0.1, // 10% commission
            status: 'en attente',
            timestamp: new Date().toISOString()
          };
        } else if (newStatus === 'refusée') {
          updatedProposal.refusedAt = new Date().toISOString();
          updatedProposal.refusalReason = reason;
        }
        
        return updatedProposal;
      }
      return proposal;
    });
    
    setProposals(updatedProposals);
    
    if (selectedProposal && selectedProposal.id === proposalId) {
      const updatedProposal = updatedProposals.find(p => p.id === proposalId);
      setSelectedProposal(updatedProposal);
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
  
  const getTransactionStatusBadge = (status) => {
    switch (status) {
      case 'en attente':
        return <span className="badge badge-warning">En attente</span>;
      case 'complétée':
        return <span className="badge badge-success">Complétée</span>;
      case 'annulée':
        return <span className="badge badge-danger">Annulée</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const filteredProposals = proposals.filter(proposal => {
    // Filter by status
    if (filter !== 'all' && proposal.status !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        proposal.requestTitle.toLowerCase().includes(searchLower) ||
        proposal.lawyerName.toLowerCase().includes(searchLower) ||
        proposal.clientName.toLowerCase().includes(searchLower) ||
        proposal.proposalText.toLowerCase().includes(searchLower)
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
        <h1 className="text-2xl font-bold">Propositions</h1>
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
          onClick={() => setFilter('en attente')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'en attente'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          En attente
        </button>
        <button
          onClick={() => setFilter('acceptée')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'acceptée'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Acceptées
        </button>
        <button
          onClick={() => setFilter('refusée')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'refusée'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Refusées
        </button>
      </div>
      
      {/* Proposals list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demande
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avocat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{proposal.requestTitle}</div>
                    <div className="text-sm text-gray-500">ID: {proposal.requestId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{proposal.lawyerName}</div>
                    <div className="text-sm text-gray-500">ID: {proposal.lawyerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{proposal.clientName}</div>
                    <div className="text-sm text-gray-500">ID: {proposal.clientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(proposal.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(proposal.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(proposal.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleProposalSelect(proposal)}
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
        
        {filteredProposals.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucune proposition trouvée.'
              : `Aucune proposition avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
      
      {/* Proposal detail modal */}
      {showDetailModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Détails de la proposition</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedProposal(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Proposal details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Demande juridique</h3>
                    <p className="mt-1 text-gray-900">{selectedProposal.requestTitle} (ID: {selectedProposal.requestId})</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de soumission</h3>
                    <p className="mt-1 text-gray-900">{formatDate(selectedProposal.submittedAt)} à {formatTime(selectedProposal.submittedAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Avocat</h3>
                    <p className="mt-1 text-gray-900">{selectedProposal.lawyerName} (ID: {selectedProposal.lawyerId})</p>
                    {selectedProposal.lawyerSpecialties && (
                      <p className="text-sm text-gray-500">Spécialités: {selectedProposal.lawyerSpecialties}</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Client</h3>
                    <p className="mt-1 text-gray-900">{selectedProposal.clientName} (ID: {selectedProposal.clientId})</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prix</h3>
                    <p className="mt-1 text-gray-900">{formatPrice(selectedProposal.price)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Durée estimée</h3>
                    <p className="mt-1 text-gray-900">{selectedProposal.estimatedDuration}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <div className="mt-1">{getStatusBadge(selectedProposal.status)}</div>
                    
                    {selectedProposal.status === 'acceptée' && selectedProposal.acceptedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Acceptée le {formatDate(selectedProposal.acceptedAt)} à {formatTime(selectedProposal.acceptedAt)}
                      </p>
                    )}
                    
                    {selectedProposal.status === 'refusée' && selectedProposal.refusedAt && (
                      <div className="text-sm text-gray-500 mt-1">
                        <p>Refusée le {formatDate(selectedProposal.refusedAt)} à {formatTime(selectedProposal.refusedAt)}</p>
                        {selectedProposal.refusalReason && (
                          <p className="mt-1">Motif: {selectedProposal.refusalReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Proposition</h3>
                  <p className="mt-1 text-gray-900">{selectedProposal.proposalText}</p>
                </div>
                
                {/* Transaction details */}
                {selectedProposal.transaction && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Détails de la transaction</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">ID de transaction</h4>
                          <p className="mt-1 text-gray-900">{selectedProposal.transaction.id}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Date</h4>
                          <p className="mt-1 text-gray-900">
                            {formatDate(selectedProposal.transaction.timestamp)} à {formatTime(selectedProposal.transaction.timestamp)}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Montant</h4>
                          <p className="mt-1 text-gray-900">{formatPrice(selectedProposal.transaction.amount)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Commission</h4>
                          <p className="mt-1 text-gray-900">{formatPrice(selectedProposal.transaction.commission)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                          <div className="mt-1">{getTransactionStatusBadge(selectedProposal.transaction.status)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status change */}
                {selectedProposal.status === 'en attente' && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Modifier le statut</h3>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleStatusChange(selectedProposal.id, 'acceptée')}
                        className="btn-success"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Motif du refus:');
                          if (reason !== null) {
                            handleStatusChange(selectedProposal.id, 'refusée', reason);
                          }
                        }}
                        className="btn-danger"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedProposal(null);
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

export default Proposals;
