import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    openRequests: 0,
    activeProposals: 0,
    acceptedProposals: 0,
    earnings: 0
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
          openRequests: 12,
          activeProposals: 5,
          acceptedProposals: 3,
          earnings: 1250
        });
        
        setRecentActivity([
          { id: 1, type: 'proposal', title: 'Proposition acceptée pour "Contestation de licenciement"', date: '2025-03-20' },
          { id: 2, type: 'request', title: 'Nouvelle demande : "Litige avec propriétaire"', date: '2025-03-18' },
          { id: 3, type: 'payment', title: 'Paiement reçu : 450€', date: '2025-03-15' }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
          <h3 className="text-gray-500 text-sm font-medium">Demandes ouvertes</h3>
          <p className="text-2xl font-bold">{stats.openRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Propositions actives</h3>
          <p className="text-2xl font-bold">{stats.activeProposals}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Propositions acceptées</h3>
          <p className="text-2xl font-bold">{stats.acceptedProposals}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Revenus du mois</h3>
          <p className="text-2xl font-bold">{stats.earnings}€</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-500">
                    {activity.type === 'proposal' && 'Proposition'}
                    {activity.type === 'request' && 'Demande juridique'}
                    {activity.type === 'payment' && 'Paiement'}
                  </p>
                </div>
                <p className="text-sm text-gray-500">{activity.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucune activité récente</p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">Voir les demandes</button>
          <button className="btn-primary">Gérer les propositions</button>
          <button className="btn-primary">Consulter l'IA</button>
        </div>
      </div>
      
      {/* Specialties */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Mes spécialités</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">Droit du travail</span>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">Droit immobilier</span>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">Droit de la consommation</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
