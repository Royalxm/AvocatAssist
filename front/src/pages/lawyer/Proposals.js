import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState(null);
  
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
            requestId: 3,
            requestTitle: 'Problème de voisinage',
            clientId: 103,
            clientName: 'Sophie Lefebvre',
            proposalText: 'Je vous propose de vous accompagner dans ce litige de voisinage. Je commencerai par rédiger une mise en demeure formelle à l\'attention de votre voisin, puis nous évaluerons les suites à donner en fonction de sa réponse.',
            price: 300,
            estimatedDuration: '2-3 semaines',
            status: 'en attente',
            submittedAt: '2025-03-21T10:30:00Z'
          },
          {
            id: 2,
            requestId: 1,
            requestTitle: 'Litige avec mon propriétaire',
            clientId: 101,
            clientName: 'Jean Dupont',
            proposalText: 'Suite à l\'étude de votre dossier, je vous propose mes services pour résoudre ce litige locatif. Je rédigerai une mise en demeure à votre propriétaire et vous accompagnerai dans les démarches juridiques nécessaires pour faire valoir vos droits.',
            price: 350,
            estimatedDuration: '3-4 semaines',
            status: 'en attente',
            submittedAt: '2025-03-19T14:15:00Z'
          },
          {
            id: 3,
            requestId: 2,
            requestTitle: 'Contestation de licenciement',
            clientId: 102,
            clientName: 'Marie Martin',
            proposalText: 'Je vous propose de vous accompagner dans la contestation de votre licenciement. Nous commencerons par analyser en détail les motifs invoqués et la procédure suivie, puis nous préparerons un dossier solide pour contester cette décision.',
            price: 600,
            estimatedDuration: '1-2 mois',
            status: 'acceptée',
            submittedAt: '2025-03-16T09:45:00Z'
          },
          {
            id: 4,
            requestId: 5,
            requestTitle: 'Divorce à l\'amiable',
            clientId: 105,
            clientName: 'Philippe Martin',
            proposalText: 'Je vous propose de vous accompagner dans votre procédure de divorce à l\'amiable. Je vous aiderai à rédiger la convention de divorce et vous représenterai lors de l\'homologation devant le juge.',
            price: 800,
            estimatedDuration: '2-3 mois',
            status: 'refusée',
            submittedAt: '2025-03-10T11:20:00Z'
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
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
  
  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });
  
  // Group proposals by request
  const groupedProposals = filteredProposals.reduce((acc, proposal) => {
    if (!acc[proposal.requestId]) {
      acc[proposal.requestId] = {
        requestId: proposal.requestId,
        requestTitle: proposal.requestTitle,
        proposals: []
      };
    }
    acc[proposal.requestId].proposals.push(proposal);
    return acc;
  }, {});

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
        <h1 className="text-2xl font-bold">Mes propositions</h1>
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
      </div>
      
      {/* Proposals list */}
      <div className="space-y-8">
        {Object.values(groupedProposals).length > 0 ? (
          Object.values(groupedProposals).map(group => (
            <div key={group.requestId} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Demande : {group.requestTitle}
                </h2>
                <Link
                  to={`/lawyer/legal-requests/${group.requestId}`}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Voir la demande
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {group.proposals.map(proposal => (
                  <div
                    key={proposal.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleProposalSelect(proposal)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Proposition pour {proposal.clientName}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>Soumise le {formatDate(proposal.submittedAt)}</span>
                            <span>•</span>
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary-600">{formatPrice(proposal.price)}</p>
                          <p className="text-sm text-gray-500">{proposal.estimatedDuration}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-3">{proposal.proposalText}</p>
                      
                      {proposal.status === 'acceptée' && (
                        <div className="mt-4 p-3 bg-success-50 text-success-800 rounded-md">
                          <p className="font-medium">Proposition acceptée par le client.</p>
                          <p className="text-sm">Vous pouvez maintenant commencer à travailler sur ce dossier.</p>
                        </div>
                      )}
                      
                      {proposal.status === 'refusée' && (
                        <div className="mt-4 p-3 bg-danger-50 text-danger-800 rounded-md">
                          <p className="font-medium">Proposition refusée par le client.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucune proposition trouvée.'
              : `Aucune proposition avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
      
      {/* Proposal detail modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Détails de la proposition</h2>
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Demande</h3>
                  <p className="text-gray-700">{selectedProposal.requestTitle}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Client</h3>
                  <p className="text-gray-700">{selectedProposal.clientName}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Statut</h3>
                  <div>{getStatusBadge(selectedProposal.status)}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Prix proposé</h3>
                    <p className="text-xl font-bold text-primary-600">{formatPrice(selectedProposal.price)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Durée estimée</h3>
                    <p className="text-gray-700">{selectedProposal.estimatedDuration}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Détails de la proposition</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.proposalText}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Date de soumission</h3>
                  <p className="text-gray-700">{formatDate(selectedProposal.submittedAt)}</p>
                </div>
                
                {selectedProposal.status === 'acceptée' && (
                  <div className="p-4 bg-success-50 text-success-800 rounded-md">
                    <p className="font-medium">Proposition acceptée par le client.</p>
                    <p className="text-sm mt-1">
                      Vous pouvez maintenant commencer à travailler sur ce dossier. 
                      Contactez le client pour planifier les prochaines étapes.
                    </p>
                  </div>
                )}
                
                {selectedProposal.status === 'refusée' && (
                  <div className="p-4 bg-danger-50 text-danger-800 rounded-md">
                    <p className="font-medium">Proposition refusée par le client.</p>
                    <p className="text-sm mt-1">
                      Le client a choisi une autre proposition ou a décidé de ne pas donner suite.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedProposal(null)}
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
