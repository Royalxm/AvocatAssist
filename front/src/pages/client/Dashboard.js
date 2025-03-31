import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    documents: 0,
    legalRequests: 0,
    proposals: 0
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
          projects: 3,
          documents: 7,
          legalRequests: 2,
          proposals: 4
        });
        
        setRecentActivity([
          { id: 1, type: 'document', title: 'Contrat de bail', date: '2025-03-20' },
          { id: 2, type: 'legalRequest', title: 'Question sur litige voisinage', date: '2025-03-18' },
          { id: 3, type: 'proposal', title: 'Proposition de Me Dupont', date: '2025-03-15' }
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
          <h3 className="text-gray-500 text-sm font-medium">Projets</h3>
          <p className="text-2xl font-bold">{stats.projects}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Documents</h3>
          <p className="text-2xl font-bold">{stats.documents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Demandes juridiques</h3>
          <p className="text-2xl font-bold">{stats.legalRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Propositions</h3>
          <p className="text-2xl font-bold">{stats.proposals}</p>
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
                    {activity.type === 'document' && 'Document ajouté'}
                    {activity.type === 'legalRequest' && 'Demande juridique créée'}
                    {activity.type === 'proposal' && 'Proposition reçue'}
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
          <button className="btn-primary">Nouveau document</button>
          <button className="btn-primary">Nouvelle demande</button>
          <button className="btn-primary">Consulter l'IA</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
