import React, { useState, useEffect } from 'react';

const ApiSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    provider: 'openrouter',
    apiKey: '',
    endpointUrl: '',
    modelName: '',
    temperature: 0.7,
    maxTokens: 1000
  });
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchSettings = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockSettings = {
          id: 1,
          provider: 'openrouter',
          apiKey: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          endpointUrl: 'https://openrouter.ai/api/v1/chat/completions',
          modelName: 'anthropic/claude-3-opus',
          temperature: 0.7,
          maxTokens: 1000,
          lastUpdated: '2025-03-15T10:30:00Z'
        };
        
        setSettings(mockSettings);
        setForm({
          provider: mockSettings.provider,
          apiKey: mockSettings.apiKey,
          endpointUrl: mockSettings.endpointUrl,
          modelName: mockSettings.modelName,
          temperature: mockSettings.temperature,
          maxTokens: mockSettings.maxTokens
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching API settings:', error);
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleProviderChange = (e) => {
    const provider = e.target.value;
    
    // Update default endpoint URL based on provider
    let endpointUrl = form.endpointUrl;
    
    if (provider === 'openrouter') {
      endpointUrl = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (provider === 'openai') {
      endpointUrl = 'https://api.openai.com/v1/chat/completions';
    }
    
    setForm(prev => ({ 
      ...prev, 
      provider,
      endpointUrl
    }));
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update settings
      setSettings({
        ...settings,
        ...form,
        lastUpdated: new Date().toISOString()
      });
      
      // Show success message
      alert('Paramètres API sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving API settings:', error);
      alert('Erreur lors de la sauvegarde des paramètres API');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful test
      setTestResult({
        success: true,
        message: 'Connexion réussie à l\'API',
        details: {
          model: form.modelName,
          responseTime: '0.8s',
          tokenLimit: 200000
        }
      });
    } catch (error) {
      console.error('Error testing API connection:', error);
      
      // Mock failed test
      setTestResult({
        success: false,
        message: 'Échec de la connexion à l\'API',
        details: {
          error: 'Invalid API key or endpoint URL'
        }
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getProviderOptions = () => {
    return [
      { value: 'openrouter', label: 'OpenRouter' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'custom', label: 'Autre (personnalisé)' }
    ];
  };
  
  const getModelOptions = () => {
    if (form.provider === 'openrouter') {
      return [
        { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
        { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
        { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
        { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'openai/gpt-4', label: 'GPT-4' },
        { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'google/gemini-pro', label: 'Gemini Pro' },
        { value: 'meta-llama/llama-3-70b-instruct', label: 'Llama 3 70B' }
      ];
    } else if (form.provider === 'openai') {
      return [
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ];
    } else {
      return [];
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
      <h1 className="text-2xl font-bold">Paramètres de l'API IA</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Configuration actuelle</h2>
          <p className="text-gray-600">
            Dernière mise à jour : {formatDate(settings.lastUpdated)}
          </p>
        </div>
        
        <form className="space-y-6">
          {/* Provider selection */}
          <div className="form-group">
            <label htmlFor="provider" className="form-label">Fournisseur d'API</label>
            <select
              id="provider"
              name="provider"
              value={form.provider}
              onChange={handleProviderChange}
              className="form-input"
            >
              {getProviderOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Sélectionnez le fournisseur d'API pour l'intelligence artificielle.
            </p>
          </div>
          
          {/* API Key */}
          <div className="form-group">
            <label htmlFor="apiKey" className="form-label">Clé API</label>
            <div className="flex">
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={form.apiKey}
                onChange={handleInputChange}
                className="form-input flex-grow"
                placeholder={`Entrez votre clé API ${form.provider === 'openrouter' ? 'OpenRouter' : form.provider === 'openai' ? 'OpenAI' : ''}`}
              />
              <button
                type="button"
                className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => alert('Clé API copiée')}
              >
                Copier
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {form.provider === 'openrouter' 
                ? 'Obtenez votre clé API sur openrouter.ai' 
                : form.provider === 'openai'
                ? 'Obtenez votre clé API sur platform.openai.com'
                : 'Entrez la clé API fournie par votre fournisseur'}
            </p>
          </div>
          
          {/* Endpoint URL */}
          <div className="form-group">
            <label htmlFor="endpointUrl" className="form-label">URL de l'endpoint</label>
            <input
              type="text"
              id="endpointUrl"
              name="endpointUrl"
              value={form.endpointUrl}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://api.example.com/v1/chat/completions"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL de l'endpoint pour les requêtes API.
            </p>
          </div>
          
          {/* Model selection */}
          <div className="form-group">
            <label htmlFor="modelName" className="form-label">Modèle</label>
            {(form.provider === 'openrouter' || form.provider === 'openai') ? (
              <select
                id="modelName"
                name="modelName"
                value={form.modelName}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Sélectionnez un modèle</option>
                {getModelOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="modelName"
                name="modelName"
                value={form.modelName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nom du modèle"
              />
            )}
            <p className="text-sm text-gray-500 mt-1">
              Modèle d'IA à utiliser pour les requêtes.
            </p>
          </div>
          
          {/* Advanced settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Paramètres avancés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="temperature" className="form-label">Température</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="temperature"
                    name="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={form.temperature}
                    onChange={handleNumberChange}
                    className="form-range flex-grow mr-2"
                  />
                  <span className="w-12 text-center">{form.temperature}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Contrôle la créativité des réponses (0 = déterministe, 1 = créatif).
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="maxTokens" className="form-label">Limite de tokens</label>
                <input
                  type="number"
                  id="maxTokens"
                  name="maxTokens"
                  value={form.maxTokens}
                  onChange={handleNumberChange}
                  className="form-input"
                  min="1"
                  max="100000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nombre maximum de tokens pour les réponses.
                </p>
              </div>
            </div>
          </div>
          
          {/* Test connection */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Tester la connexion</h3>
            
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleTestConnection}
                className="btn-outline"
                disabled={testLoading}
              >
                {testLoading ? 'Test en cours...' : 'Tester la connexion'}
              </button>
              
              {testResult && (
                <div className={`ml-4 p-2 rounded ${testResult.success ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Détails du test</h4>
                {testResult.success ? (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Modèle :</span> {testResult.details.model}</p>
                    <p><span className="font-medium">Temps de réponse :</span> {testResult.details.responseTime}</p>
                    <p><span className="font-medium">Limite de tokens :</span> {testResult.details.tokenLimit}</p>
                  </div>
                ) : (
                  <div className="text-sm text-danger-800">
                    <p><span className="font-medium">Erreur :</span> {testResult.details.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Usage information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Informations d'utilisation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Requêtes ce mois-ci</p>
            <p className="text-2xl font-bold">1,245</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Tokens utilisés</p>
            <p className="text-2xl font-bold">356,789</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Coût estimé</p>
            <p className="text-2xl font-bold">42,50 €</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
