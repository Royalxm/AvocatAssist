import React, { useState, useEffect } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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
            requestTitle: 'Contestation de licenciement',
            clientName: 'Marie Martin',
            amount: 600,
            commission: 60,
            total: 540, // Amount - commission
            status: 'completed',
            timestamp: '2025-03-16T10:30:00Z',
            invoiceNumber: 'INV-2025-001'
          },
          {
            id: 2,
            proposalId: 5,
            requestTitle: 'Rédaction de contrat commercial',
            clientName: 'Robert Petit',
            amount: 450,
            commission: 45,
            total: 405,
            status: 'completed',
            timestamp: '2025-03-10T14:15:00Z',
            invoiceNumber: 'INV-2025-002'
          },
          {
            id: 3,
            proposalId: null,
            requestTitle: null,
            clientName: null,
            amount: 19.99,
            commission: 0,
            total: 19.99,
            status: 'completed',
            timestamp: '2025-02-15T09:45:00Z',
            invoiceNumber: 'INV-2025-003',
            description: 'Abonnement mensuel - Plan Standard'
          },
          {
            id: 4,
            proposalId: null,
            requestTitle: null,
            clientName: null,
            amount: 19.99,
            commission: 0,
            total: 19.99,
            status: 'completed',
            timestamp: '2025-01-15T09:45:00Z',
            invoiceNumber: 'INV-2025-004',
            description: 'Abonnement mensuel - Plan Standard'
          }
        ];
        
        setTransactions(mockTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
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
  
  const getTransactionTypeLabel = (transaction) => {
    if (transaction.proposalId) {
      return 'Paiement client';
    } else if (transaction.description?.includes('Abonnement')) {
      return 'Abonnement';
    } else {
      return 'Autre';
    }
  };
  
  const getTransactionTypeClass = (transaction) => {
    if (transaction.proposalId) {
      return 'bg-primary-100 text-primary-800';
    } else if (transaction.description?.includes('Abonnement')) {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filterTransactionsByDate = (transaction) => {
    const now = new Date();
    const transactionDate = new Date(transaction.timestamp);
    
    switch (dateRange) {
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactionDate >= startOfMonth;
      case '3months':
        const startOf3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return transactionDate >= startOf3Months;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return transactionDate >= startOfYear;
      default:
        return true;
    }
  };
  
  const filterTransactionsByType = (transaction) => {
    switch (filter) {
      case 'payment':
        return transaction.proposalId !== null;
      case 'subscription':
        return transaction.description?.includes('Abonnement');
      default:
        return true;
    }
  };
  
  const filterTransactionsBySearch = (transaction) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (transaction.requestTitle && transaction.requestTitle.toLowerCase().includes(searchLower)) ||
      (transaction.clientName && transaction.clientName.toLowerCase().includes(searchLower)) ||
      (transaction.description && transaction.description.toLowerCase().includes(searchLower)) ||
      transaction.invoiceNumber.toLowerCase().includes(searchLower)
    );
  };
  
  const filteredTransactions = transactions
    .filter(filterTransactionsByDate)
    .filter(filterTransactionsByType)
    .filter(filterTransactionsBySearch);
  
  // Calculate total amount
  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);

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
        <h1 className="text-2xl font-bold">Mes transactions</h1>
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
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-700">Type de transaction</h2>
            <div className="flex flex-wrap gap-2">
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
                onClick={() => setFilter('payment')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'payment'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Paiements clients
              </button>
              <button
                onClick={() => setFilter('subscription')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'subscription'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Abonnements
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-700">Période</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateRange('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  dateRange === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  dateRange === 'month'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Ce mois
              </button>
              <button
                onClick={() => setDateRange('3months')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  dateRange === '3months'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                3 derniers mois
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  dateRange === 'year'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Cette année
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Résumé</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Nombre de transactions</p>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Revenus totaux</p>
            <p className="text-2xl font-bold text-primary-600">{formatPrice(totalAmount)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Dernière transaction</p>
            <p className="text-2xl font-bold">
              {filteredTransactions.length > 0 
                ? formatDate(filteredTransactions[0].timestamp)
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Transactions list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold">Transactions ({filteredTransactions.length})</h2>
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatDate(transaction.timestamp)}</div>
                      <div className="text-sm text-gray-500">{formatTime(transaction.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeClass(transaction)}`}>
                        {getTransactionTypeLabel(transaction)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.requestTitle || transaction.description}
                      </div>
                      {transaction.clientName && (
                        <div className="text-sm text-gray-500">
                          Client: {transaction.clientName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(transaction.total)}</div>
                      {transaction.commission > 0 && (
                        <div className="text-xs text-gray-500">
                          commission: {formatPrice(transaction.commission)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-primary-600 hover:text-primary-900">
                        {transaction.invoiceNumber}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Aucune transaction trouvée pour les filtres sélectionnés.
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
