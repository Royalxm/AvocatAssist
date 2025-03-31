import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Subscription = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [billingInfo, setBillingInfo] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchSubscriptionData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockPlans = [
          {
            id: 1,
            name: 'Gratuit',
            price: 0,
            tokenLimit: 100,
            features: [
              'Accès à l\'assistant IA (limité)',
              'Upload de documents (max 5)',
              'Création de demandes juridiques (max 2)'
            ],
            recommended: false
          },
          {
            id: 2,
            name: 'Standard',
            price: 19.99,
            tokenLimit: 2000,
            features: [
              'Accès à l\'assistant IA',
              'Upload de documents illimité',
              'Création de demandes juridiques illimitées',
              'Modèles de documents juridiques'
            ],
            recommended: true
          },
          {
            id: 3,
            name: 'Premium',
            price: 49.99,
            tokenLimit: -1, // Unlimited
            features: [
              'Tout ce qui est inclus dans le plan Standard',
              'Jetons illimités pour l\'IA',
              'Mises à jour en temps réel des lois',
              'Support prioritaire',
              'Accès à des avocats spécialisés'
            ],
            recommended: false
          }
        ];
        
        // Mock current plan (Standard)
        const mockCurrentPlan = {
          id: 2,
          name: 'Standard',
          price: 19.99,
          startDate: '2025-01-15T00:00:00Z',
          endDate: '2025-04-15T00:00:00Z',
          status: 'active',
          autoRenew: true,
          tokenUsage: 850,
          tokenLimit: 2000
        };
        
        setPlans(mockPlans);
        setCurrentPlan(mockCurrentPlan);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, []);
  
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handleBillingInfoChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubscribe = async () => {
    // In a real app, this would call the API to update the subscription
    // For now, we'll just simulate success
    
    // Update current plan
    setCurrentPlan({
      id: selectedPlan.id,
      name: selectedPlan.name,
      price: selectedPlan.price,
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      status: 'active',
      autoRenew: true,
      tokenUsage: 0,
      tokenLimit: selectedPlan.tokenLimit
    });
    
    setShowConfirmModal(false);
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
  
  const getTokenUsagePercentage = () => {
    if (!currentPlan) return 0;
    if (currentPlan.tokenLimit === -1) return 0; // Unlimited
    
    return Math.min(100, Math.round((currentPlan.tokenUsage / currentPlan.tokenLimit) * 100));
  };
  
  const getTokenUsageColor = () => {
    const percentage = getTokenUsagePercentage();
    
    if (percentage < 50) return 'bg-success-500';
    if (percentage < 80) return 'bg-warning-500';
    return 'bg-danger-500';
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
      <h1 className="text-2xl font-bold">Mon abonnement</h1>
      
      {/* Current plan */}
      {currentPlan && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Plan {currentPlan.name}</h2>
              <p className="text-gray-500">
                {currentPlan.price > 0 
                  ? `${formatPrice(currentPlan.price)} / mois`
                  : 'Gratuit'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
                Actif
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Renouvellement le {formatDate(currentPlan.endDate)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Utilisation des jetons
              </span>
              <span className="text-sm text-gray-500">
                {currentPlan.tokenLimit === -1 
                  ? `${currentPlan.tokenUsage} jetons (illimité)`
                  : `${currentPlan.tokenUsage} / ${currentPlan.tokenLimit} jetons`}
              </span>
            </div>
            
            {currentPlan.tokenLimit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getTokenUsageColor()}`}
                  style={{ width: `${getTokenUsagePercentage()}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-3">
            <button className="btn-outline">
              Gérer le paiement automatique
            </button>
            <button className="btn-outline">
              Voir l'historique de facturation
            </button>
          </div>
        </div>
      )}
      
      {/* Available plans */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">Changer de plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`border rounded-lg p-6 flex flex-col ${
                plan.recommended 
                  ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50' 
                  : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="self-start px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-4">
                  Recommandé
                </div>
              )}
              
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                {plan.price > 0 && <span className="text-gray-500"> / mois</span>}
              </div>
              
              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-success-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full ${
                  currentPlan && currentPlan.id === plan.id
                    ? 'btn-success'
                    : 'btn-primary'
                }`}
                disabled={currentPlan && currentPlan.id === plan.id}
              >
                {currentPlan && currentPlan.id === plan.id
                  ? 'Plan actuel'
                  : 'Sélectionner'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Confirmation modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Changer d'abonnement</h2>
            
            <p className="mb-4">
              Vous êtes sur le point de passer au plan <strong>{selectedPlan.name}</strong> pour {formatPrice(selectedPlan.price)}/mois.
            </p>
            
            {selectedPlan.price > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Méthode de paiement</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => handlePaymentMethodChange('card')}
                      className="form-radio"
                    />
                    <label htmlFor="card" className="ml-2">
                      Carte bancaire
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => handlePaymentMethodChange('paypal')}
                      className="form-radio"
                    />
                    <label htmlFor="paypal" className="ml-2">
                      PayPal
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-3">
                    <div className="form-group">
                      <label htmlFor="cardNumber" className="form-label">Numéro de carte</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={billingInfo.cardNumber}
                        onChange={handleBillingInfoChange}
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group">
                        <label htmlFor="cardExpiry" className="form-label">Date d'expiration</label>
                        <input
                          type="text"
                          id="cardExpiry"
                          name="cardExpiry"
                          value={billingInfo.cardExpiry}
                          onChange={handleBillingInfoChange}
                          className="form-input"
                          placeholder="MM/AA"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cardCvc" className="form-label">CVC</label>
                        <input
                          type="text"
                          id="cardCvc"
                          name="cardCvc"
                          value={billingInfo.cardCvc}
                          onChange={handleBillingInfoChange}
                          className="form-input"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPlan(null);
                }}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={handleSubscribe}
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

export default Subscription;
