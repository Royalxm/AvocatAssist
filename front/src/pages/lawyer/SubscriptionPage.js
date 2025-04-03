import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const SubscriptionPage = () => {
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingSubscription, setLoadingSubscription] = useState(true);
    const [error, setError] = useState(null);
    const [subscribingPlanId, setSubscribingPlanId] = useState(null); // Track which plan is being subscribed to

    // Fetch available plans
    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const response = await api.get('/subscriptions/plans'); // Use 'api'
            setPlans(response.data.plans || []);
        } catch (err) {
            console.error("Error fetching subscription plans:", err);
            setError(err.response?.data?.message || 'Failed to load subscription plans.');
        } finally {
            setLoadingPlans(false);
        }
    };

    // Fetch lawyer's current subscription
    const fetchCurrentSubscription = async () => {
        setLoadingSubscription(true);
        try {
            const response = await api.get('/subscriptions/user/lawyer'); // Use 'api'
            setCurrentSubscription(response.data.subscription); // Can be null if not subscribed
        } catch (err) {
            // It's okay if the user isn't subscribed yet (404 or specific error), don't show as page error
            if (err.response && err.response.status !== 404) {
                 console.error("Error fetching current subscription:", err);
                 setError(err.response?.data?.message || 'Failed to load current subscription.');
            } else {
                 console.log("No active lawyer subscription found.");
                 setCurrentSubscription(null); // Ensure it's null if not found
            }
        } finally {
            setLoadingSubscription(false);
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchCurrentSubscription();
    }, []);

    const handleSubscribe = async (planId) => {
        setSubscribingPlanId(planId);
        setError(null);
        try {
            await api.post('/subscriptions/subscribe/lawyer', { planId }); // Use 'api'
            // Refetch current subscription to update the UI
            fetchCurrentSubscription();
            alert('Subscription updated successfully!'); // Simple feedback
        } catch (err) {
            console.error("Error subscribing to plan:", err);
            setError(err.response?.data?.message || 'Failed to subscribe to the plan.');
            alert(`Error: ${err.response?.data?.message || 'Failed to subscribe.'}`); // Show error to user
        } finally {
            setSubscribingPlanId(null);
        }
    };

    const isLoading = loadingPlans || loadingSubscription;

    // Safely parse features JSON string
    const parseFeatures = (featuresString) => {
        try {
            const features = JSON.parse(featuresString);
            return Array.isArray(features) ? features : [];
        } catch (e) {
            console.error("Error parsing plan features:", e);
            return []; // Return empty array on error
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Gestion de l'Abonnement</h1>

            {error && (
                <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            {isLoading ? (
                <div className="text-center p-10">Chargement des plans...</div>
            ) : plans.length === 0 ? (
                 <div className="text-center p-10 bg-white rounded-lg shadow">Aucun plan d'abonnement disponible pour le moment.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = currentSubscription?.plan?.id === plan.id;
                        const isSubscribing = subscribingPlanId === plan.id;
                        const features = parseFeatures(plan.features);

                        return (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-lg shadow-lg border-2 transition-all duration-300 ${
                                    isCurrent ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:shadow-xl'
                                } flex flex-col`}
                            >
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h2>
                                    <p className="text-3xl font-bold text-gray-800 mb-4">
                                        {plan.price > 0 ? `${plan.price.toFixed(2)} €` : 'Gratuit'}
                                        {plan.price > 0 && <span className="text-sm font-normal text-gray-500"> / mois</span>}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Limite de jetons IA: {plan.tokenLimit === -1 ? 'Illimité' : plan.tokenLimit}
                                    </p>
                                </div>
                                <div className="px-6 pb-6 flex-grow">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Fonctionnalités incluses :</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        {features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <FaCheckCircle className="flex-shrink-0 h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-b-lg mt-auto">
                                    {isCurrent ? (
                                        <div className="flex items-center justify-center text-green-600 font-semibold">
                                            <FaCheckCircle className="mr-2" /> Plan Actuel
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={isSubscribing}
                                            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                        >
                                            {isSubscribing ? 'Souscription...' : 'Choisir ce plan'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Display current subscription details if available */}
            {!loadingSubscription && currentSubscription && (
                 <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                     <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                        <FaInfoCircle className="mr-2"/> Votre Abonnement Actuel
                     </h3>
                     <p><strong>Plan:</strong> {currentSubscription.plan.name}</p>
                     <p><strong>Solde de jetons IA restants:</strong> {currentSubscription.tokenBalance === -1 ? 'Illimité' : currentSubscription.tokenBalance}</p>
                     {/* Add more details like expiry date if available */}
                 </div>
            )}
        </div>
    );
};

export default SubscriptionPage;