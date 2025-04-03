import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api'; // Corrected import
import ReactMarkdown from 'react-markdown'; // For displaying description/summary

const LawyerLegalRequestDetail = () => {
  const { id } = useParams(); // Get request ID from URL
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proposal form state
  const [proposedRate, setProposedRate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [proposalComment, setProposalComment] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState(null);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      setError(null);
      try {
          const response = await api.get(`/legal-requests/${id}`); // Use 'api'
        setRequest(response.data); // Assuming response.data contains the request object
      } catch (err) {
        console.error('Error fetching legal request details:', err);
        setError(err.response?.data?.message || 'Impossible de charger les détails de la demande.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!proposedRate || !estimatedDuration) {
      setProposalError('Le tarif proposé et la durée estimée sont requis.');
      return;
    }
    setSubmittingProposal(true);
    setProposalError(null);
    setProposalSuccess(false);

    try {
      // Assuming an endpoint like POST /proposals exists
      const response = await api.post('/proposals', { // Use 'api'
        requestId: id,
        rate: parseFloat(proposedRate), // Ensure rate is a number
        estimatedDuration: estimatedDuration,
        comment: proposalComment,
      });

      if (response.data.success) {
        setProposalSuccess(true);
        // Optionally refetch request details to update proposal count or status
        // fetchRequestDetails();
      } else {
        throw new Error(response.data.message || 'Failed to submit proposal.');
      }

    } catch (err) {
      console.error('Error submitting proposal:', err);
      setProposalError(err.response?.data?.message || 'Une erreur est survenue lors de la soumission de la proposition.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement des détails...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;
  }

  if (!request) {
    return <div className="p-4 text-center">Demande non trouvée.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Back Link */}
      <Link to="/lawyer/legal-requests" className="text-sm text-primary-600 hover:underline flex items-center gap-1 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour à la liste des demandes
      </Link>

      {/* Request Details Card */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">{request.title || `Demande #${request.id}`}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1" title={`Client: ${request.client?.name} (${request.client?.email})`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             {request.client?.name || 'Client inconnu'}
          </span>
           <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatDate(request.createdAt)}
          </span>
           <span className="text-gray-300">•</span>
           <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{request.status}</span>
           <span className="text-gray-300">•</span>
           <span>{request.proposalsCount || 0} proposition(s)</span>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">Description de la demande</h3>
        <div className="prose prose-sm max-w-none text-gray-700 mb-4">
           <ReactMarkdown>{request.description || "Aucune description fournie."}</ReactMarkdown>
        </div>

        {request.summaryAI && (
          <>
            <h3 className="text-lg font-semibold mt-4 mb-2">Résumé IA</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900">
              <ReactMarkdown>{request.summaryAI}</ReactMarkdown>
            </div>
          </>
        )}
      </div>

      {/* Proposal Submission Form */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Faire une proposition</h2>

        {proposalSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Succès!</strong>
            <span className="block sm:inline"> Votre proposition a été soumise.</span>
          </div>
        ) : (
          <form onSubmit={handleProposalSubmit} className="space-y-4">
            {proposalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {proposalError}
              </div>
            )}
            <div>
              <label htmlFor="proposedRate" className="block text-sm font-medium text-gray-700">
                Tarif proposé (€/heure ou forfaitaire) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="proposedRate"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Ex: 150 ou 2000"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700">
                Durée estimée (ex: 5 heures, 2 jours, 1 mois) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="estimatedDuration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Ex: 10 heures"
              />
            </div>
            <div>
              <label htmlFor="proposalComment" className="block text-sm font-medium text-gray-700">
                Commentaire (facultatif)
              </label>
              <textarea
                id="proposalComment"
                rows="3"
                value={proposalComment}
                onChange={(e) => setProposalComment(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Ajoutez des détails ou conditions spécifiques à votre proposition."
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                disabled={submittingProposal}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {submittingProposal ? 'Soumission en cours...' : 'Soumettre la proposition'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LawyerLegalRequestDetail;