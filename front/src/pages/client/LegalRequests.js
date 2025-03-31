import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LegalRequests = () => {
  const [legalRequests, setLegalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document: null
  });
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchLegalRequests = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockLegalRequests = [
          {
            id: 1,
            title: 'Litige avec mon propriétaire',
            description: 'Mon propriétaire refuse de faire des réparations nécessaires dans mon appartement malgré plusieurs demandes écrites.',
            summaryAI: 'Litige locatif concernant des réparations non effectuées par le propriétaire malgré des demandes formelles du locataire. Situation pouvant relever de l\'article 6 de la loi du 6 juillet 1989.',
            status: 'ouverte',
            createdAt: '2025-03-20T14:30:00Z',
            proposals: 2
          },
          {
            id: 2,
            title: 'Contestation de licenciement',
            description: 'J\'ai été licencié pour faute grave mais je conteste les motifs invoqués par mon employeur.',
            summaryAI: 'Contestation d\'un licenciement pour faute grave. Le salarié conteste la qualification des faits et la procédure pourrait relever du droit du travail, notamment des articles L1232-1 et suivants du Code du travail.',
            status: 'en cours',
            createdAt: '2025-03-15T10:15:00Z',
            proposals: 3
          },
          {
            id: 3,
            title: 'Problème de voisinage',
            description: 'Mon voisin fait régulièrement du bruit tard le soir et refuse de dialoguer.',
            summaryAI: 'Trouble anormal de voisinage lié à des nuisances sonores récurrentes. Situation relevant potentiellement de l\'article R. 1336-5 du Code de la santé publique et de la jurisprudence sur les troubles anormaux de voisinage.',
            status: 'fermée',
            createdAt: '2025-03-05T09:45:00Z',
            proposals: 1
          }
        ];
        
        setLegalRequests(mockLegalRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching legal requests:', error);
        setLoading(false);
      }
    };
    
    fetchLegalRequests();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, document: e.target.files[0] }));
    }
  };
  
  const handleGenerateSummary = async () => {
    if (!formData.description) return;
    
    setIsGeneratingSummary(true);
    
    // Simulate API call to AI service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI summary
    const mockSummary = `D'après votre description, il s'agit d'un ${formData.title.toLowerCase()} qui pourrait relever de la législation française en matière de ${
      formData.title.includes('propriétaire') ? 'droit immobilier' :
      formData.title.includes('licenciement') ? 'droit du travail' :
      formData.title.includes('voisinage') ? 'troubles de voisinage' :
      'droit civil'
    }. Un avocat spécialisé pourrait vous aider à résoudre ce problème en vous conseillant sur les démarches à suivre et en vous représentant si nécessaire.`;
    
    setAiSummary(mockSummary);
    setIsGeneratingSummary(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) return;
    
    // In a real app, this would call the API to create a new legal request
    // For now, we'll just simulate success
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add the new legal request to the list
    const newLegalRequest = {
      id: legalRequests.length + 1,
      title: formData.title,
      description: formData.description,
      summaryAI: aiSummary,
      status: 'ouverte',
      createdAt: new Date().toISOString(),
      proposals: 0
    };
    
    setLegalRequests([newLegalRequest, ...legalRequests]);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      document: null
    });
    setAiSummary('');
    setShowForm(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ouverte':
        return <span className="badge badge-primary">Ouverte</span>;
      case 'en cours':
        return <span className="badge badge-warning">En cours</span>;
      case 'fermée':
        return <span className="badge badge-success">Fermée</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const filteredRequests = legalRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
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
        <h1 className="text-2xl font-bold">Mes demandes juridiques</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Annuler' : 'Nouvelle demande'}
        </button>
      </div>
      
      {/* New request form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Nouvelle demande juridique</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Titre</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Ex: Litige avec mon propriétaire"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description détaillée</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input h-32"
                placeholder="Décrivez votre problème juridique en détail..."
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="document" className="form-label">Document(s) associé(s) (optionnel)</label>
              <input
                type="file"
                id="document"
                onChange={handleFileChange}
                className="form-input"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-gray-500 mt-1">
                Vous pouvez joindre des documents pertinents à votre demande (contrats, lettres, etc.)
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="btn-secondary"
                disabled={!formData.description || isGeneratingSummary}
              >
                {isGeneratingSummary ? 'Génération en cours...' : 'Générer un résumé IA'}
              </button>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.title || !formData.description}
              >
                Soumettre la demande
              </button>
            </div>
            
            {aiSummary && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Résumé généré par l'IA :</h3>
                <p className="text-sm text-gray-600">{aiSummary}</p>
              </div>
            )}
          </form>
        </div>
      )}
      
      {/* Filter */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('ouverte')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'ouverte'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Ouvertes
        </button>
        <button
          onClick={() => setFilter('en cours')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'en cours'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          En cours
        </button>
        <button
          onClick={() => setFilter('fermée')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            filter === 'fermée'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Fermées
        </button>
      </div>
      
      {/* Legal requests list */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(request => (
            <div key={request.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
                      <span>Créée le {formatDate(request.createdAt)}</span>
                      <span>•</span>
                      {getStatusBadge(request.status)}
                      <span>•</span>
                      <span>{request.proposals} proposition(s)</span>
                    </div>
                  </div>
                  <Link
                    to={`/client/legal-requests/${request.id}`}
                    className="btn-outline btn-sm"
                  >
                    Voir les détails
                  </Link>
                </div>
                
                <p className="text-gray-700 mb-4">{request.description}</p>
                
                {request.summaryAI && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Résumé IA :</h3>
                    <p className="text-sm text-gray-600">{request.summaryAI}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {filter === 'all'
              ? 'Aucune demande juridique trouvée. Créez votre première demande en cliquant sur "Nouvelle demande".'
              : `Aucune demande juridique avec le statut "${filter}" trouvée.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalRequests;
