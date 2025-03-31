import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  
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
            lawyerId: 101,
            lawyerName: 'Me Dupont',
            lawyerSpecialties: 'Droit immobilier, Droit des baux',
            proposalText: 'Je vous propose de vous accompagner dans ce litige locatif. Je commencerai par envoyer une mise en demeure à votre propriétaire, puis nous évaluerons les suites à donner en fonction de sa réponse.',
            price: 350,
            estimatedDuration: '2-3 semaines',
            status: 'en attente',
            submittedAt: '2025-03-21T10:30:00Z'
          },
          {
            id: 2,
            requestId: 1,
            requestTitle: 'Litige avec mon propriétaire',
            lawyerId: 102,
            lawyerName: 'Me Martin',
            lawyerSpecialties: 'Droit immobilier, Droit de la consommation',
            proposalText: 'Après analyse de votre situation, je vous propose de vous représenter dans ce litige. Je rédigerai une lettre de mise en demeure et vous accompagnerai dans les démarches juridiques nécessaires pour faire valoir vos droits.',
            price: 400,
            estimatedDuration: '3-4 semaines',
            status: 'en attente',
            submittedAt: '2025-03-22T14:15:00Z'
          },
          {
            id: 3,
            requestId: 2,
            requestTitle: 'Contestation de licenciement',
            lawyerId: 103,
            lawyerName: 'Me Dubois',
            lawyerSpecialties: 'Droit du travail, Droit social',
            proposalText: 'Je vous propose de vous accompagner dans la contestation de votre licenciement. Nous commencerons par analyser en détail les motifs invoqués et la procédure suivie, puis nous préparerons un dossier solide pour contester cette décision.',
            price: 600,
            estimatedDuration: '1-2 mois',
            status: 'acceptée',
            submittedAt: '2025-03-16T09:45:00Z'
          },
          {
            id: 4,
            requestId: 2,
            requestTitle: 'Contestation de licenciement',
            lawyerId: 104,
            lawyerName: 'Me Lefebvre',
            lawyerSpecialties: 'Droit du travail, Contentieux',
            proposalText: 'Suite à l\'étude de votre dossier, je vous propose mes services pour contester ce licenciement pour faute grave. Je vous représenterai devant le Conseil de Prud\'hommes et vous accompagnerai tout au long de la procédure.',
            price: 750,
            estimatedDuration: '2-3 mois',
            status: 'refusée',
            submittedAt: '2025-03-17T11:20:00Z'
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
  
  const handleAcceptProposal = async (id) => {
    // In a real app, this would call the API to accept the proposal
    // For now, we'll just simulate success
    
    // Update proposal status
    setProposals(proposals.map(proposal => {
      if (proposal.id === id) {
        return { ...proposal, status: 'acceptée' };
      }
      // Mark other proposals for the same request as refused
      if (proposal.requestId === selectedProposal.requestId && proposal.id !== id) {
        return { ...proposal, status: 'refusée' };
      }
      return proposal;
    }));
    
    setShowAcceptModal(false);
    setSelectedProposal(null);
  };
  
  const handleRejectProposal = async (id) => {
    // In a real app, this would call the API to reject the proposal
    // For now, we'll just simulate success
    
    // Update proposal status
    setProposals(proposals.map(proposal => 
      proposal.id === id ? { ...proposal, status: 'refusée' } : proposal
    ));
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
        <h1 className="text-2xl font-bold">Propositions reçues</h1>
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
                  to={`/client/legal-requests/${group.requestId}`}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Voir la demande
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {group.proposals.map(proposal => (
                  <div key={proposal.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Proposition de {proposal.lawyerName}</h3>
                          <p className="text-sm text-gray-500">
                            Spécialités : {proposal.lawyerSpecialties}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(proposal.status)}
                          <p className="text-sm text-gray-500 mt-1">
                            Reçue le {formatDate(proposal.submittedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="prose max-w-none mb-4">
                        <p>{proposal.proposalText}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Tarif proposé</p>
                          <p className="text-xl font-bold text-primary-600">{formatPrice(proposal.price)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Durée estimée</p>
                          <p className="text-xl font-bold">{proposal.estimatedDuration}</p>
                        </div>
                      </div>
                      
                      {proposal.status === 'en attente' && (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setSelectedProposal(proposal);
                              setShowAcceptModal(true);
                            }}
                            className="btn-primary"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleRejectProposal(proposal.id)}
                            className="btn-outline"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      
                      {proposal.status === 'acceptée' && (
                        <div className="mt-4 p-4 bg-success-50 text-success-800 rounded-md">
                          <p className="font-medium">Vous avez accepté cette proposition.</p>
                          <p className="text-sm mt-1">
                            Un contrat a été établi entre vous et {proposal.lawyerName}. 
                            Vous pouvez suivre l'avancement de votre dossier dans la section "Mes projets".
                          </p>
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
              ? 'Aucune proposition reçue pour le moment.'
              : `Aucune proposition avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
      
      {/* Accept proposal modal */}
      {showAcceptModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Confirmer l'acceptation</h2>
            <p className="mb-4">
              Vous êtes sur le point d'accepter la proposition de {selectedProposal.lawyerName} pour un montant de {formatPrice(selectedProposal.price)}.
            </p>
            <p className="mb-6 text-sm text-gray-500">
              En acceptant cette proposition, vous refuserez automatiquement les autres propositions pour cette demande et un contrat sera établi entre vous et l'avocat.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedProposal(null);
                }}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAcceptProposal(selectedProposal.id)}
                className="btn-primary"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proposals;
