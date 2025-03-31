import React, { useState, useEffect } from 'react';

const Subscriptions = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    tokenLimit: 0,
    features: ''
  });
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0
  });
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchSubscriptionData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock subscription plans
        const mockSubscriptionPlans = [
          {
            id: 1,
            name: 'Gratuit',
            price: 0,
            tokenLimit: 100,
            features: 'Accès à l\'assistant IA (limité)\nRéponse à 5 demandes juridiques par mois\nProfil de base',
            userCount: 45
          },
          {
            id: 2,
            name: 'Standard',
            price: 19.99,
            tokenLimit: 2000,
            features: 'Accès à l\'assistant IA\nRéponses illimitées aux demandes juridiques\nProfil avancé avec mise en avant\nStatistiques de performance',
            userCount: 28
          },
          {
            id: 3,
            name: 'Premium',
            price: 49.99,
            tokenLimit: -1, // Unlimited
            features: 'Tout ce qui est inclus dans le plan Standard\nJetons illimités pour l\'IA\nMise en avant prioritaire dans les recherches\nAccès à la communauté d\'avocats\nSupport dédié',
            userCount: 12
          }
        ];
        
        // Mock user subscriptions
        const mockUserSubscriptions = [
          {
            id: 1,
            userId: 101,
            userName: 'Jean Dupont',
            userRole: 'client',
            planId: 1,
            planName: 'Gratuit',
            startDate: '2025-01-15T00:00:00Z',
            endDate: '2025-04-15T00:00:00Z',
            status: 'active',
            autoRenew: false,
            tokenUsage: 45,
            tokenLimit: 100
          },
          {
            id: 2,
            userId: 102,
            userName: 'Marie Martin',
            userRole: 'client',
            planId: 2,
            planName: 'Standard',
            startDate: '2025-02-20T00:00:00Z',
            endDate: '2025-03-20T00:00:00Z',
            status: 'active',
            autoRenew: true,
            tokenUsage: 1200,
            tokenLimit: 2000
          },
          {
            id: 3,
            userId: 201,
            userName: 'Sophie Lefebvre',
            userRole: 'lawyer',
            planId: 3,
            planName: 'Premium',
            startDate: '2025-01-10T00:00:00Z',
            endDate: '2025-04-10T00:00:00Z',
            status: 'active',
            autoRenew: true,
            tokenUsage: 3500,
            tokenLimit: -1
          },
          {
            id: 4,
            userId: 202,
            userName: 'Thomas Dubois',
            userRole: 'lawyer',
            planId: 2,
            planName: 'Standard',
            startDate: '2025-02-05T00:00:00Z',
            endDate: '2025-03-05T00:00:00Z',
            status: 'expired',
            autoRenew: false,
            tokenUsage: 1800,
            tokenLimit: 2000
          },
          {
            id: 5,
            userId: 103,
            userName: 'Sophie Lefebvre',
            userRole: 'client',
            planId: 2,
            planName: 'Standard',
            startDate: '2025-03-01T00:00:00Z',
            endDate: '2025-04-01T00:00:00Z',
            status: 'active',
            autoRenew: true,
            tokenUsage: 850,
            tokenLimit: 2000
          }
        ];
        
        setSubscriptionPlans(mockSubscriptionPlans);
        setUserSubscriptions(mockUserSubscriptions);
        
        // Calculate stats
        const activeSubscriptions = mockUserSubscriptions.filter(sub => sub.status === 'active');
        const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
          const plan = mockSubscriptionPlans.find(p => p.id === sub.planId);
          return sum + (plan ? plan.price : 0);
        }, 0);
        
        setStats({
          totalSubscriptions: mockUserSubscriptions.length,
          activeSubscriptions: activeSubscriptions.length,
          monthlyRevenue
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, []);
  
  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setPlanForm({
      name: '',
      price: 0,
      tokenLimit: 0,
      features: ''
    });
    setShowPlanModal(true);
  };
  
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price,
      tokenLimit: plan.tokenLimit,
      features: plan.features
    });
    setShowPlanModal(true);
  };
  
  const handlePlanFormChange = (e) => {
    const { name, value } = e.target;
    setPlanForm(prev => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'tokenLimit' 
        ? parseFloat(value) 
        : value 
    }));
  };
  
  const handleSavePlan = () => {
    // In a real app, this would call the API to create/update the plan
    // For now, we'll just update the local state
    
    if (selectedPlan) {
      // Update existing plan
      const updatedPlans = subscriptionPlans.map(plan => 
        plan.id === selectedPlan.id 
          ? { 
              ...plan, 
              name: planForm.name,
              price: planForm.price,
              tokenLimit: planForm.tokenLimit,
              features: planForm.features
            } 
          : plan
      );
      
      setSubscriptionPlans(updatedPlans);
      
      // Update plan name in user subscriptions
      const updatedUserSubscriptions = userSubscriptions.map(sub => 
        sub.planId === selectedPlan.id 
          ? { ...sub, planName: planForm.name } 
          : sub
      );
      
      setUserSubscriptions(updatedUserSubscriptions);
    } else {
      // Create new plan
      const newPlan = {
        id: Math.max(0, ...subscriptionPlans.map(p => p.id)) + 1,
        name: planForm.name,
        price: planForm.price,
        tokenLimit: planForm.tokenLimit,
        features: planForm.features,
        userCount: 0
      };
      
      setSubscriptionPlans([...subscriptionPlans, newPlan]);
    }
    
    setShowPlanModal(false);
    setSelectedPlan(null);
  };
  
  const handleDeletePlan = () => {
    // In a real app, this would call the API to delete the plan
    // For now, we'll just update the local state
    
    // Check if plan has users
    if (selectedPlan.userCount > 0) {
      alert(`Impossible de supprimer ce plan : ${selectedPlan.userCount} utilisateur(s) y sont abonnés.`);
      return;
    }
    
    const updatedPlans = subscriptionPlans.filter(plan => plan.id !== selectedPlan.id);
    
    setSubscriptionPlans(updatedPlans);
    setShowPlanModal(false);
    setSelectedPlan(null);
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
    if (price === 0) return 'Gratuit';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Actif</span>;
      case 'expired':
        return <span className="badge badge-danger">Expiré</span>;
      case 'cancelled':
        return <span className="badge badge-warning">Annulé</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const getRoleBadge = (role) => {
    switch (role) {
      case 'client':
        return <span className="badge badge-info">Client</span>;
      case 'lawyer':
        return <span className="badge badge-primary">Avocat</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };
  
  const getTokenUsagePercentage = (usage, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(100, Math.round((usage / limit) * 100));
  };
  
  const getTokenUsageColor = (usage, limit) => {
    const percentage = getTokenUsagePercentage(usage, limit);
    
    if (percentage < 50) return 'bg-success-500';
    if (percentage < 80) return 'bg-warning-500';
    return 'bg-danger-500';
  };
  
  const filteredSubscriptions = userSubscriptions.filter(subscription => {
    // Filter by status
    if (filter !== 'all' && subscription.status !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        subscription.userName.toLowerCase().includes(searchLower) ||
        subscription.planName.toLowerCase().includes(searchLower)
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
        <h1 className="text-2xl font-bold">Abonnements</h1>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Abonnements totaux</h3>
              <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Abonnements actifs</h3>
              <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-info-100 text-info-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Revenu mensuel</h3>
              <p className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subscription Plans */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Plans d'abonnement</h2>
          <button
            onClick={handleCreatePlan}
            className="btn-primary"
          >
            Créer un plan
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limite de jetons
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateurs
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptionPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(plan.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {plan.tokenLimit === -1 ? 'Illimité' : plan.tokenLimit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {plan.userCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User Subscriptions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Abonnements des utilisateurs</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'active'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'expired'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Expirés
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscription.userName}</div>
                    <div className="text-sm text-gray-500">
                      ID: {subscription.userId} {getRoleBadge(subscription.userRole)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscription.planName}</div>
                    <div className="text-sm text-gray-500">
                      {subscription.autoRenew ? 'Renouvellement auto' : 'Sans renouvellement'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Début: {formatDate(subscription.startDate)}</div>
                    <div>Fin: {formatDate(subscription.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {subscription.tokenLimit === -1 
                        ? `${subscription.tokenUsage} jetons (illimité)`
                        : `${subscription.tokenUsage} / ${subscription.tokenLimit} jetons`}
                    </div>
                    
                    {subscription.tokenLimit !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${getTokenUsageColor(subscription.tokenUsage, subscription.tokenLimit)}`}
                          style={{ width: `${getTokenUsagePercentage(subscription.tokenUsage, subscription.tokenLimit)}%` }}
                        ></div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubscriptions.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucun abonnement trouvé.'
              : `Aucun abonnement avec le statut "${filter}" trouvé.`}
          </div>
        )}
      </div>
      
      {/* Plan modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedPlan ? 'Modifier le plan' : 'Créer un plan'}
                </h2>
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedPlan(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Nom du plan</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={planForm.name}
                    onChange={handlePlanFormChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price" className="form-label">Prix mensuel (€)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={planForm.price}
                    onChange={handlePlanFormChange}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tokenLimit" className="form-label">Limite de jetons</label>
                  <input
                    type="number"
                    id="tokenLimit"
                    name="tokenLimit"
                    value={planForm.tokenLimit}
                    onChange={handlePlanFormChange}
                    className="form-input"
                    min="-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Utilisez -1 pour un nombre illimité de jetons.
                  </p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="features" className="form-label">Fonctionnalités (une par ligne)</label>
                  <textarea
                    id="features"
                    name="features"
                    value={planForm.features}
                    onChange={handlePlanFormChange}
                    className="form-input h-32"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-between pt-4">
                  {selectedPlan && (
                    <button
                      onClick={handleDeletePlan}
                      className="btn-danger"
                      disabled={selectedPlan.userCount > 0}
                    >
                      Supprimer
                    </button>
                  )}
                  
                  <div className="space-x-3 ml-auto">
                    <button
                      onClick={() => {
                        setShowPlanModal(false);
                        setSelectedPlan(null);
                      }}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    
                    <button
                      onClick={handleSavePlan}
                      className="btn-primary"
                    >
                      {selectedPlan ? 'Enregistrer' : 'Créer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
