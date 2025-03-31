import React, { useState, useEffect } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalCommission: 0
  });
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchTransactions = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockTransactions = [
          {
            id: 1,
            proposalId: 3,
            requestId: 2,
            requestTitle: 'Contestation de licenciement',
            lawyerId: 201,
            lawyerName: 'Sophie Lefebvre',
            clientId: 102,
            clientName: 'Marie Martin',
            amount: 600,
            commission: 60,
            status: 'complétée',
            timestamp: '2025-03-17T14:25:00Z',
            paymentMethod: 'Carte bancaire',
            paymentDetails: {
              cardType: 'Visa',
              last4: '4242'
            }
          },
          {
            id: 2,
            proposalId: 6,
            requestId: 4,
            requestTitle: 'Rédaction d\'un contrat commercial',
            lawyerId: 202,
            lawyerName: 'Thomas Dubois',
            clientId: 106,
            clientName: 'Robert Petit',
            amount: 450,
            commission: 45,
            status: 'complétée',
            timestamp: '2025-03-20T14:20:00Z',
            paymentMethod: 'Carte bancaire',
            paymentDetails: {
              cardType: 'Mastercard',
              last4: '5678'
            }
          },
          {
            id: 3,
            proposalId: 7,
            requestId: 6,
            requestTitle: 'Création d\'une SAS',
            lawyerId: 203,
            lawyerName: 'Philippe Moreau',
            clientId: 107,
            clientName: 'Laurent Bernard',
            amount: 1200,
            commission: 120,
            status: 'en attente',
            timestamp: '2025-03-21T09:15:00Z',
            paymentMethod: 'Virement bancaire',
            paymentDetails: {
              bankName: 'BNP Paribas',
              reference: 'REF-78945612'
            }
          },
          {
            id: 4,
            proposalId: 8,
            requestId: 7,
            requestTitle: 'Litige avec un fournisseur',
            lawyerId: 201,
            lawyerName: 'Sophie Lefebvre',
            clientId: 108,
            clientName: 'Michel Durand',
            amount: 800,
            commission: 80,
            status: 'annulée',
            timestamp: '2025-03-10T11:30:00Z',
            cancelledAt: '2025-03-11T16:45:00Z',
            cancellationReason: 'Erreur de paiement',
            paymentMethod: 'Carte bancaire',
            paymentDetails: {
              cardType: 'Visa',
              last4: '1234'
            }
          },
          {
            id: 5,
            proposalId: 9,
            requestId: 8,
            requestTitle: 'Consultation droit des successions',
            lawyerId: 202,
            lawyerName: 'Thomas Dubois',
            clientId: 109,
            clientName: 'Françoise Martin',
            amount: 300,
            commission: 30,
            status: 'remboursée',
            timestamp: '2025-03-05T14:20:00Z',
            refundedAt: '2025-03-07T10:15:00Z',
            refundReason: 'Service non fourni',
            paymentMethod: 'PayPal',
            paymentDetails: {
              email: 'f.martin@example.com'
            }
          }
        ];
        
        setTransactions(mockTransactions);
        
        // Calculate stats
        const totalAmount = mockTransactions.reduce((sum, transaction) => 
          transaction.status !== 'annulée' && transaction.status !== 'remboursée' 
            ? sum + transaction.amount 
            : sum, 
          0
        );
        
        const totalCommission = mockTransactions.reduce((sum, transaction) => 
          transaction.status !== 'annulée' && transaction.status !== 'remboursée' 
            ? sum + transaction.commission 
            : sum, 
          0
        );
        
        setStats({
          totalTransactions: mockTransactions.length,
          totalAmount,
          totalCommission
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };
  
  const handleStatusChange = (transactionId, newStatus, reason = '') => {
    // In a real app, this would call the API to update the status
    // For now, we'll just update the local state
    
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.id === transactionId) {
        const updatedTransaction = { ...transaction, status: newStatus };
        
        if (newStatus === 'annulée') {
          updatedTransaction.cancelledAt = new Date().toISOString();
          updatedTransaction.cancellationReason = reason;
        } else if (newStatus === 'remboursée') {
          updatedTransaction.refundedAt = new Date().toISOString();
          updatedTransaction.refundReason = reason;
        }
        
        return updatedTransaction;
      }
      return transaction;
    });
    
    setTransactions(updatedTransactions);
    
    if (selectedTransaction && selectedTransaction.id === transactionId) {
      const updatedTransaction = updatedTransactions.find(t => t.id === transactionId);
      setSelectedTransaction(updatedTransaction);
    }
    
    // Recalculate stats
    const totalAmount = updatedTransactions.reduce((sum, transaction) => 
      transaction.status !== 'annulée' && transaction.status !== 'remboursée' 
        ? sum + transaction.amount 
        : sum, 
      0
    );
    
    const totalCommission = updatedTransactions.reduce((sum, transaction) => 
      transaction.status !== 'annulée' && transaction.status !== 'remboursée' 
        ? sum + transaction.commission 
        : sum, 
      0
    );
    
    setStats({
      totalTransactions: updatedTransactions.length,
      totalAmount,
      totalCommission
    });
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
      case 'complétée':
        return <span className="badge badge-success">Complétée</span>;
      case 'annulée':
        return <span className="badge badge-danger">Annulée</span>;
      case 'remboursée':
        return <span className="badge badge-info">Remboursée</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by status
    if (filter !== 'all' && transaction.status !== filter) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.start && new Date(transaction.timestamp) < new Date(dateRange.start)) {
      return false;
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of the day
      if (new Date(transaction.timestamp) > endDate) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.requestTitle.toLowerCase().includes(searchLower) ||
        transaction.lawyerName.toLowerCase().includes(searchLower) ||
        transaction.clientName.toLowerCase().includes(searchLower) ||
        transaction.id.toString().includes(searchLower)
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
        <h1 className="text-2xl font-bold">Transactions</h1>
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
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Transactions</h3>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Montant total</h3>
              <p className="text-2xl font-bold">{formatPrice(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-info-100 text-info-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Commissions</h3>
              <p className="text-2xl font-bold">{formatPrice(stats.totalCommission)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('en attente')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'en attente'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('complétée')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'complétée'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Complétées
            </button>
            <button
              onClick={() => setFilter('annulée')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'annulée'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Annulées
            </button>
            <button
              onClick={() => setFilter('remboursée')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'remboursée'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Remboursées
            </button>
          </div>
          
          <div className="flex space-x-2">
            <div>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                className="form-input"
                placeholder="Date de début"
              />
            </div>
            <div>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                className="form-input"
                placeholder="Date de fin"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
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
                  Montant
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
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{transaction.requestTitle}</div>
                    <div className="text-sm text-gray-500">ID: {transaction.requestId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.lawyerName}</div>
                    <div className="text-sm text-gray-500">ID: {transaction.lawyerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.clientName}</div>
                    <div className="text-sm text-gray-500">ID: {transaction.clientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(transaction.amount)}</div>
                    <div className="text-sm text-gray-500">Commission: {formatPrice(transaction.commission)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleTransactionSelect(transaction)}
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
        
        {filteredTransactions.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucune transaction trouvée.'
              : `Aucune transaction avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
      
      {/* Transaction detail modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Détails de la transaction #{selectedTransaction.id}</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Transaction details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Demande juridique</h3>
                    <p className="mt-1 text-gray-900">{selectedTransaction.requestTitle} (ID: {selectedTransaction.requestId})</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de transaction</h3>
                    <p className="mt-1 text-gray-900">{formatDate(selectedTransaction.timestamp)} à {formatTime(selectedTransaction.timestamp)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Avocat</h3>
                    <p className="mt-1 text-gray-900">{selectedTransaction.lawyerName} (ID: {selectedTransaction.lawyerId})</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Client</h3>
                    <p className="mt-1 text-gray-900">{selectedTransaction.clientName} (ID: {selectedTransaction.clientId})</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Montant</h3>
                    <p className="mt-1 text-gray-900">{formatPrice(selectedTransaction.amount)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Commission</h3>
                    <p className="mt-1 text-gray-900">{formatPrice(selectedTransaction.commission)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                    
                    {selectedTransaction.status === 'annulée' && selectedTransaction.cancelledAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Annulée le {formatDate(selectedTransaction.cancelledAt)} à {formatTime(selectedTransaction.cancelledAt)}
                      </p>
                    )}
                    
                    {selectedTransaction.status === 'remboursée' && selectedTransaction.refundedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Remboursée le {formatDate(selectedTransaction.refundedAt)} à {formatTime(selectedTransaction.refundedAt)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Méthode de paiement</h3>
                    <p className="mt-1 text-gray-900">{selectedTransaction.paymentMethod}</p>
                    
                    {selectedTransaction.paymentDetails && (
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedTransaction.paymentDetails.cardType && (
                          <p>{selectedTransaction.paymentDetails.cardType} **** {selectedTransaction.paymentDetails.last4}</p>
                        )}
                        
                        {selectedTransaction.paymentDetails.email && (
                          <p>Email: {selectedTransaction.paymentDetails.email}</p>
                        )}
                        
                        {selectedTransaction.paymentDetails.bankName && (
                          <p>{selectedTransaction.paymentDetails.bankName} (Réf: {selectedTransaction.paymentDetails.reference})</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Reason for cancellation or refund */}
                {selectedTransaction.cancellationReason && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Motif d'annulation</h3>
                    <p className="mt-1 text-gray-900">{selectedTransaction.cancellationReason}</p>
                  </div>
                )}
                
                {selectedTransaction.refundReason && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Motif de remboursement</h3>
                    <p className="mt-1 text-gray-900">{selectedTransaction.refundReason}</p>
                  </div>
                )}
                
                {/* Status change */}
                {selectedTransaction.status === 'en attente' && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Modifier le statut</h3>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleStatusChange(selectedTransaction.id, 'complétée')}
                        className="btn-success"
                      >
                        Marquer comme complétée
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Motif de l\'annulation:');
                          if (reason !== null) {
                            handleStatusChange(selectedTransaction.id, 'annulée', reason);
                          }
                        }}
                        className="btn-danger"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedTransaction.status === 'complétée' && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Modifier le statut</h3>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          const reason = prompt('Motif du remboursement:');
                          if (reason !== null) {
                            handleStatusChange(selectedTransaction.id, 'remboursée', reason);
                          }
                        }}
                        className="btn-warning"
                      >
                        Rembourser
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedTransaction(null);
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

export default Transactions;
