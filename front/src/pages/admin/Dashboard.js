import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0,
    totalClients: 0,
    totalRequests: 0,
    totalProposals: 0,
    totalTransactions: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        setStats({
          totalUsers: 156,
          totalLawyers: 42,
          totalClients: 114,
          totalRequests: 87,
          totalProposals: 203,
          totalTransactions: 65,
          revenue: 12450
        });
        
        setRecentActivity([
          { id: 1, type: 'user', action: 'Nouvel utilisateur inscrit', name: 'Marie Dupont', role: 'client', date: '2025-03-21T10:30:00Z' },
          { id: 2, type: 'request', action: 'Nouvelle demande juridique', title: 'Litige avec employeur', client: 'Jean Martin', date: '2025-03-21T09:15:00Z' },
          { id: 3, type: 'proposal', action: 'Proposition acceptée', title: 'Contestation de licenciement', lawyer: 'Sophie Lefebvre', client: 'Marie Martin', amount: 600, date: '2025-03-20T16:45:00Z' },
          { id: 4, type: 'transaction', action: 'Nouveau paiement', amount: 450, client: 'Robert Petit', lawyer: 'Thomas Dubois', date: '2025-03-20T14:20:00Z' },
          { id: 5, type: 'user', action: 'Nouvel utilisateur inscrit', name: 'Philippe Moreau', role: 'lawyer', date: '2025-03-19T11:10:00Z' }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
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
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'request':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-info-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'proposal':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'transaction':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

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
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue, {currentUser?.name}</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Utilisateurs</h3>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <div>
              <span className="text-gray-500">Avocats:</span>
              <span className="ml-1 font-medium">{stats.totalLawyers}</span>
            </div>
            <div>
              <span className="text-gray-500">Clients:</span>
              <span className="ml-1 font-medium">{stats.totalClients}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-info-100 text-info-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Demandes juridiques</h3>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 text-warning-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Propositions</h3>
              <p className="text-2xl font-bold">{stats.totalProposals}</p>
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
              <h3 className="text-gray-500 text-sm font-medium">Revenus</h3>
              <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-500">Transactions:</span>
            <span className="ml-1 font-medium">{stats.totalTransactions}</span>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Activité récente</h2>
          <Link to="/admin/activity" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            Voir tout
          </Link>
        </div>
        
        <div className="space-y-6">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex">
              {getActivityIcon(activity.type)}
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{activity.action}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(activity.date)} à {formatTime(activity.date)}
                  </p>
                </div>
                
                <div className="mt-1 text-sm text-gray-600">
                  {activity.type === 'user' && (
                    <p>
                      {activity.name} ({activity.role === 'lawyer' ? 'Avocat' : 'Client'})
                    </p>
                  )}
                  
                  {activity.type === 'request' && (
                    <p>
                      <span className="font-medium">{activity.title}</span> par {activity.client}
                    </p>
                  )}
                  
                  {activity.type === 'proposal' && (
                    <p>
                      <span className="font-medium">{activity.title}</span> - {activity.lawyer} pour {activity.client} ({formatPrice(activity.amount)})
                    </p>
                  )}
                  
                  {activity.type === 'transaction' && (
                    <p>
                      {formatPrice(activity.amount)} - {activity.client} à {activity.lawyer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users" className="btn-primary text-center">
            Gérer les utilisateurs
          </Link>
          <Link to="/admin/legal-requests" className="btn-primary text-center">
            Voir les demandes juridiques
          </Link>
          <Link to="/admin/api-settings" className="btn-primary text-center">
            Configurer l'API IA
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
