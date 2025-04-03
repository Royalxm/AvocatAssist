import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Assuming axios is installed and configured

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [error, setError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // For payment simulation
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        // Use the public endpoint to get all plans (remove leading /api)
        const response = await axios.get('/subscriptions/plans');
        if (response.data.success) {
          setPlans(response.data.plans);
        } else {
          setError('Erreur lors de la récupération des plans.');
        }
      } catch (err) {
        console.error("Fetch plans error:", err);
        setError('Erreur serveur lors de la récupération des plans.');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Define fetchSubscription using useCallback
  const fetchSubscription = useCallback(async () => {
    setLoadingSubscription(true);
    setError(''); // Clear previous errors
    try {
      // Use the client-specific endpoint (remove leading /api)
      const response = await axios.get('/subscriptions/user/client');
      if (response.data.success) {
        setCurrentSubscription(response.data.subscription); // Will be null if no active sub
      } else {
        // Handle cases where user might not be authorized (though route guard should handle this)
         setError('Erreur lors de la récupération de votre abonnement.');
      }
    } catch (err) {
       console.error("Fetch subscription error:", err);
       // Don't set error if it's just a 404 (no subscription found) or 403 (handled by route guard)
       if (err.response && err.response.status !== 404 && err.response.status !== 403) {
          setError('Erreur serveur lors de la récupération de votre abonnement.');
       } else if (!err.response) {
          setError('Erreur réseau ou serveur indisponible.');
       }
    } finally {
      setLoadingSubscription(false);
    }
  }, []); // Empty dependency array as it doesn't depend on props or state outside its scope

  // Define fetchHistory using useCallback
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get('/subscriptions/user/client/history');
      if (response.data.success) {
        setSubscriptionHistory(response.data.history);
      } else {
        setError('Erreur lors de la récupération de l\'historique.');
      }
    } catch (err) {
      console.error("Fetch history error:", err);
      setError('Erreur serveur lors de la récupération de l\'historique.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Fetch current user subscription and history on component mount
  useEffect(() => {
    fetchSubscription();
    fetchHistory();
  }, [fetchSubscription, fetchHistory]); // Add dependencies

  // --- Action Handlers ---

  const handleSubscribe = async (planId, duration = 'monthly') => {
    setError('');
    setSelectedPlan({ planId, duration }); // Store selected plan for payment step
    console.log(`Initiating subscription for plan ${planId}, duration: ${duration}`);

    try {
      // Remove leading /api
      const response = await axios.post('/subscriptions/subscribe/client', { planId });
      if (response.data.success) {
        console.log('Subscription initiated:', response.data);
        // Now show payment simulation UI
        // We'll use the subscriptionId from the response for the payment step
        setSelectedPlan(prev => ({ ...prev, subscriptionId: response.data.subscriptionId }));
        // Trigger payment simulation modal/view here
        alert(`Simulation de paiement pour le plan ${planId} (${duration}). Cliquez sur OK pour "payer".`);
        handlePaymentConfirm(response.data.subscriptionId, duration); // Directly call confirm for simulation
      } else {
        setError(response.data.message || 'Erreur lors de l\'initiation de l\'abonnement.');
        setSelectedPlan(null);
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      setError(err.response?.data?.message || 'Erreur serveur lors de l\'initiation.');
      setSelectedPlan(null);
    }
  };

  const handlePaymentConfirm = async (subscriptionId, duration) => {
    if (!subscriptionId) {
      setError('ID d\'abonnement manquant pour la confirmation.');
      return;
    }
    setPaymentProcessing(true);
    setError('');
    console.log(`Confirming payment for subscription ${subscriptionId}`);

    try {
      // Simulate payment provider details
      const paymentDetails = {
        subscriptionId: subscriptionId,
        paymentProvider: 'simulated_paypal',
        paymentSubscriptionId: `sim_${Date.now()}`,
        duration: duration // Pass duration ('monthly' or 'yearly')
      };
      // Remove leading /api
      const response = await axios.post('/subscriptions/subscribe/client/payment', paymentDetails);

      if (response.data.success) {
        console.log('Payment confirmed, subscription active:', response.data);
        alert('Paiement réussi! Votre abonnement est actif.');
        // Refresh subscription status
        fetchSubscription(); // Re-fetch user subscription details
      } else {
        setError(response.data.message || 'Erreur lors de la confirmation du paiement.');
      }
    } catch (err) {
      console.error("Payment confirm error:", err);
      setError(err.response?.data?.message || 'Erreur serveur lors de la confirmation.');
    } finally {
      setPaymentProcessing(false);
      setSelectedPlan(null); // Clear selection after attempt
    }
  };

   const handleCancel = async () => {
    if (!currentSubscription || !window.confirm('Êtes-vous sûr de vouloir résilier votre abonnement ?')) {
      return;
    }
    setError('');
    setPaymentProcessing(true); // Use same flag for loading state

    try {
      // Remove leading /api
      const response = await axios.delete('/subscriptions/subscribe/client');
      if (response.data.success) {
        console.log('Subscription cancelled:', response.data);
        alert('Votre demande de résiliation a été enregistrée. L\'abonnement restera actif jusqu\'à sa date d\'expiration.');
        setCurrentSubscription(null); // Update UI immediately
        // Optionally re-fetch subscription to confirm it's gone or status changed
        fetchSubscription();
      } else {
        setError(response.data.message || 'Erreur lors de la résiliation.');
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setError(err.response?.data?.message || 'Erreur serveur lors de la résiliation.');
    } finally {
       setPaymentProcessing(false);
    }
  };

  // Helper to calculate yearly price
  const calculateYearlyPrice = (monthlyPrice) => {
    if (monthlyPrice <= 0) return 0;
    return (monthlyPrice * 12 * 0.9).toFixed(2); // 10% discount
  };

  // --- Render Logic ---
  if (loadingPlans || loadingSubscription || loadingHistory) {
    return <div className="container mx-auto p-4">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestion de l'Abonnement</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {/* Current Subscription Section */}
      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Votre Abonnement Actuel</h2>
        {currentSubscription ? (
          <div>
            <p className="mb-1"><strong className="font-medium text-gray-600">Plan:</strong> {currentSubscription.planName}</p>
            <p className="mb-1"><strong className="font-medium text-gray-600">Statut:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentSubscription.status === 'active' ? 'bg-green-100 text-green-800' : (currentSubscription.status === 'pending_cancellation' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>{currentSubscription.status === 'pending_cancellation' ? 'Annulation en attente' : currentSubscription.status}</span></p>
            {currentSubscription.startDate && <p className="mb-1"><strong className="font-medium text-gray-600">Début:</strong> {new Date(currentSubscription.startDate).toLocaleDateString()}</p>}
            {currentSubscription.endDate && <p className="mb-1"><strong className="font-medium text-gray-600">Fin:</strong> {new Date(currentSubscription.endDate).toLocaleDateString()}</p>}
            {/* Add more details if needed, e.g., features */}
            <button
              onClick={handleCancel}
              // Disable if not active or already pending cancellation
              disabled={paymentProcessing || !['active'].includes(currentSubscription.status)}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${!['active'].includes(currentSubscription.status) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'} disabled:opacity-70`}
            >
              {currentSubscription.status === 'pending_cancellation' ? 'Annulation Programmée' : (paymentProcessing ? 'Résiliation...' : 'Résilier l\'abonnement')}
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Vous n'avez pas d'abonnement actif.</p>
        )}
      </div>

      {/* Subscription History Section */}
      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Historique des Abonnements</h2>
        {subscriptionHistory.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Fin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Payé</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptionHistory.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.planName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.status === 'pending_cancellation' ? 'Annulation en attente' : sub.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.status === 'active' || sub.status === 'expired' || sub.status === 'cancelled' ? `${sub.planPrice?.toFixed(2)} €` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Aucun historique d'abonnement trouvé.</p>
        )}
      </div>

      {/* Available Plans Section */}
      {/* Available Plans Section - Always show */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{currentSubscription ? 'Changer de Plan' : 'Choisir un Plan'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              // Determine plan status relative to current subscription
              const isCurrentPlan = currentSubscription?.planId === plan.id && currentSubscription?.status === 'active';
              // Ensure currentSubscription and its planPrice exist before comparing
              const currentPlanPrice = currentSubscription?.planPrice ?? -Infinity; // Treat no sub as lowest price
              const canUpgrade = currentSubscription?.status === 'active' && plan.price > currentPlanPrice;
              // Cannot interact if it's the current plan OR if it's a downgrade/same price (and not free)
              const cannotInteract = isCurrentPlan || (currentSubscription?.status === 'active' && !canUpgrade && plan.price > 0);

              return (
              <div key={plan.id} className={`bg-white border border-gray-200 p-6 rounded-lg shadow-md flex flex-col justify-between ${isCurrentPlan ? 'ring-2 ring-indigo-500' : ''} ${cannotInteract && !isCurrentPlan ? 'opacity-60' : ''}`}>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-800">{plan.name} {isCurrentPlan && <span className="text-sm font-normal text-indigo-600">(Plan Actuel)</span>}</h3>
                  <p className="text-gray-700 mb-1"><strong>Prix Mensuel:</strong> {plan.price > 0 ? `${plan.price.toFixed(2)} €` : 'Gratuit'}</p>
                  {plan.price > 0 && (
                     <p className="text-gray-700 mb-3"><strong>Prix Annuel:</strong> {calculateYearlyPrice(plan.price)} € <span className="text-green-600 font-semibold">(-10%)</span></p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">Limite de jetons: {plan.tokenLimit === -1 ? 'Illimité' : plan.tokenLimit}</p>
                  <h4 className="font-semibold mb-1">Fonctionnalités:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                    {plan.features && JSON.parse(plan.features).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-4">
                   {/* Monthly Button */}
                   <button
                    onClick={() => handleSubscribe(plan.id, 'monthly')}
                    disabled={paymentProcessing || cannotInteract}
                    className={`w-full mb-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isCurrentPlan ? 'bg-indigo-600 cursor-default' : cannotInteract ? 'bg-gray-400 cursor-not-allowed' : (canUpgrade ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500')} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70`}
                  >
                    {isCurrentPlan ? 'Plan Actuel (Mensuel)' : (paymentProcessing && selectedPlan?.planId === plan.id && selectedPlan?.duration === 'monthly' ? 'Traitement...' : (canUpgrade ? 'Améliorer (Mensuel)' : 'Choisir (Mensuel)'))}
                  </button>
                   {/* Yearly Button - Only show for paid plans */}
                   {plan.price > 0 && (
                     <button
                       onClick={() => handleSubscribe(plan.id, 'yearly')}
                       disabled={paymentProcessing || cannotInteract}
                       className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isCurrentPlan ? 'bg-indigo-600 cursor-default' : cannotInteract ? 'bg-gray-400 cursor-not-allowed' : (canUpgrade ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500')} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70`}
                     >
                        {isCurrentPlan ? 'Plan Actuel (Annuel)' : (paymentProcessing && selectedPlan?.planId === plan.id && selectedPlan?.duration === 'yearly' ? 'Traitement...' : (canUpgrade ? 'Améliorer (Annuel -10%)' : 'Choisir (Annuel -10%)'))}
                     </button>
                   )}
                </div>
              </div>
            );
           })}
          </div>
        </div>
      {/* Removed the conditional rendering wrapper */}
    </div>
  );
};

export default SubscriptionPage;