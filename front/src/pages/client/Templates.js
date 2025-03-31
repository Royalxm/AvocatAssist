import React, { useState, useEffect } from 'react';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchTemplates = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockTemplates = [
          {
            id: 1,
            title: 'Lettre de démission sans préavis',
            description: 'Modèle de lettre pour démissionner sans effectuer de préavis, dans les cas autorisés par la loi.',
            category: 'Travail',
            fields: [
              { name: 'employerName', label: 'Nom de l\'employeur', type: 'text', required: true },
              { name: 'employerAddress', label: 'Adresse de l\'employeur', type: 'textarea', required: true },
              { name: 'position', label: 'Poste occupé', type: 'text', required: true },
              { name: 'reason', label: 'Motif de démission sans préavis', type: 'select', required: true, options: [
                'Faute grave de l\'employeur',
                'Raisons de santé',
                'Embauche en CDI après CDD',
                'Autre'
              ] },
              { name: 'otherReason', label: 'Précisez le motif', type: 'textarea', required: false, conditionalOn: { field: 'reason', value: 'Autre' } }
            ],
            template: `
{employerName}
{employerAddress}

[Votre nom]
[Votre adresse]
[Votre email]
[Votre téléphone]

[Lieu], le [Date]

Objet : Démission sans préavis

Madame, Monsieur,

Par la présente, je vous informe de ma décision de démissionner de mon poste de {position} que j'occupe au sein de votre entreprise depuis le [date d'embauche].

Conformément aux dispositions légales, je suis dispensé(e) d'effectuer un préavis pour le motif suivant : {reason}{otherReason ? " - " + otherReason : ""}.

Je vous remercie de bien vouloir accuser réception de cette lettre et de me faire parvenir mon certificat de travail, mon reçu pour solde de tout compte ainsi que mon attestation Pôle Emploi.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre signature]
[Votre nom]
`
          },
          {
            id: 2,
            title: 'Lettre de réclamation',
            description: 'Modèle de lettre pour formuler une réclamation auprès d\'un professionnel ou d\'une entreprise.',
            category: 'Consommation',
            fields: [
              { name: 'companyName', label: 'Nom de l\'entreprise', type: 'text', required: true },
              { name: 'companyAddress', label: 'Adresse de l\'entreprise', type: 'textarea', required: true },
              { name: 'productService', label: 'Produit ou service concerné', type: 'text', required: true },
              { name: 'purchaseDate', label: 'Date d\'achat ou de commande', type: 'date', required: true },
              { name: 'issueDescription', label: 'Description du problème', type: 'textarea', required: true },
              { name: 'requestType', label: 'Type de demande', type: 'select', required: true, options: [
                'Remboursement',
                'Échange',
                'Réparation',
                'Dédommagement',
                'Autre'
              ] },
              { name: 'otherRequest', label: 'Précisez votre demande', type: 'textarea', required: false, conditionalOn: { field: 'requestType', value: 'Autre' } }
            ],
            template: `
{companyName}
{companyAddress}

[Votre nom]
[Votre adresse]
[Votre email]
[Votre téléphone]

[Lieu], le [Date]

Objet : Réclamation concernant {productService}

Madame, Monsieur,

J'ai acheté/commandé {productService} auprès de votre entreprise en date du {purchaseDate}.

Malheureusement, j'ai rencontré le problème suivant :
{issueDescription}

Conformément aux dispositions du Code de la consommation, je vous demande de procéder à {requestType === 'Autre' ? otherRequest : requestType.toLowerCase()} dans les plus brefs délais.

Sans réponse satisfaisante de votre part sous 15 jours, je me verrai contraint(e) de saisir les services compétents (association de consommateurs, médiateur, tribunal).

Je vous remercie par avance de l'attention que vous porterez à ma demande et vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre signature]
[Votre nom]
`
          },
          {
            id: 3,
            title: 'Mise en demeure pour troubles de voisinage',
            description: 'Modèle de lettre pour mettre en demeure un voisin de cesser des troubles de voisinage.',
            category: 'Immobilier',
            fields: [
              { name: 'neighborName', label: 'Nom du voisin', type: 'text', required: true },
              { name: 'neighborAddress', label: 'Adresse du voisin', type: 'textarea', required: true },
              { name: 'troubleType', label: 'Type de trouble', type: 'select', required: true, options: [
                'Bruit',
                'Odeurs',
                'Dégradations',
                'Empiètement',
                'Autre'
              ] },
              { name: 'otherTroubleType', label: 'Précisez le type de trouble', type: 'textarea', required: false, conditionalOn: { field: 'troubleType', value: 'Autre' } },
              { name: 'troubleDescription', label: 'Description détaillée des troubles', type: 'textarea', required: true },
              { name: 'troubleDates', label: 'Dates et heures des troubles', type: 'textarea', required: true },
              { name: 'previousAttempts', label: 'Démarches déjà entreprises', type: 'textarea', required: false }
            ],
            template: `
{neighborName}
{neighborAddress}

[Votre nom]
[Votre adresse]
[Votre email]
[Votre téléphone]

[Lieu], le [Date]

Objet : Mise en demeure - Troubles de voisinage ({troubleType === 'Autre' ? otherTroubleType : troubleType})

Lettre recommandée avec accusé de réception

Madame, Monsieur,

Je me permets de vous adresser ce courrier suite aux troubles de voisinage que vous occasionnez et qui perturbent gravement ma tranquillité.

En effet, {troubleDescription}

Ces troubles sont survenus aux dates et heures suivantes : {troubleDates}

{previousAttempts ? "Malgré mes précédentes tentatives de résolution amiable (" + previousAttempts + "), ces nuisances persistent." : ""}

Je vous rappelle que ces agissements constituent un trouble anormal de voisinage au sens de la jurisprudence de la Cour de cassation et sont susceptibles d'engager votre responsabilité civile sur le fondement de l'article 1240 du Code civil.

Par conséquent, je vous mets en demeure de faire cesser ces troubles dans un délai de 15 jours à compter de la réception de ce courrier.

À défaut, je me verrai contraint(e) de saisir le conciliateur de justice ou le tribunal judiciaire compétent afin d'obtenir la cessation de ces troubles ainsi que des dommages et intérêts.

Dans l'espoir que nous pourrons régler ce différend à l'amiable, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre signature]
[Votre nom]
`
          },
          {
            id: 4,
            title: 'Contestation de facture',
            description: 'Modèle de lettre pour contester une facture que vous estimez incorrecte ou injustifiée.',
            category: 'Consommation',
            fields: [
              { name: 'companyName', label: 'Nom de l\'entreprise', type: 'text', required: true },
              { name: 'companyAddress', label: 'Adresse de l\'entreprise', type: 'textarea', required: true },
              { name: 'invoiceNumber', label: 'Numéro de facture', type: 'text', required: true },
              { name: 'invoiceDate', label: 'Date de la facture', type: 'date', required: true },
              { name: 'invoiceAmount', label: 'Montant de la facture', type: 'text', required: true },
              { name: 'contestReason', label: 'Motif de la contestation', type: 'select', required: true, options: [
                'Erreur de facturation',
                'Service non fourni',
                'Produit non livré',
                'Tarif non conforme',
                'Autre'
              ] },
              { name: 'otherContestReason', label: 'Précisez le motif', type: 'textarea', required: false, conditionalOn: { field: 'contestReason', value: 'Autre' } },
              { name: 'contestDetails', label: 'Détails de la contestation', type: 'textarea', required: true }
            ],
            template: `
{companyName}
{companyAddress}

[Votre nom]
[Votre adresse]
[Votre email]
[Votre téléphone]

[Lieu], le [Date]

Objet : Contestation de facture n° {invoiceNumber}

Madame, Monsieur,

Je conteste par la présente la facture n° {invoiceNumber} datée du {invoiceDate} d'un montant de {invoiceAmount} euros que vous m'avez adressée.

Motif de la contestation : {contestReason === 'Autre' ? otherContestReason : contestReason}

{contestDetails}

Conformément à l'article L.121-91 du Code de la consommation, je vous demande de procéder à la rectification de cette facture dans les meilleurs délais.

Dans l'attente de votre réponse, je suspends le paiement de la somme contestée.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre signature]
[Votre nom]
`
          }
        ];
        
        setTemplates(mockTemplates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  useEffect(() => {
    // Reset form data when template changes
    if (selectedTemplate) {
      const initialFormData = {};
      selectedTemplate.fields.forEach(field => {
        initialFormData[field.name] = '';
      });
      setFormData(initialFormData);
      setPreviewMode(false);
      setGeneratedDocument('');
    }
  }, [selectedTemplate]);
  
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };
  
  const handleBackToList = () => {
    setSelectedTemplate(null);
    setFormData({});
    setPreviewMode(false);
    setGeneratedDocument('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateDocument = (e) => {
    e.preventDefault();
    
    // Generate document from template
    let document = selectedTemplate.template;
    
    // Replace placeholders with form data
    Object.keys(formData).forEach(key => {
      const placeholder = `{${key}}`;
      document = document.replace(new RegExp(placeholder, 'g'), formData[key] || '');
    });
    
    setGeneratedDocument(document);
    setPreviewMode(true);
  };
  
  const handleDownload = () => {
    // Create a blob with the document content
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.title}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const categories = ['all', ...new Set(templates.map(template => template.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modèles de documents</h1>
      
      {!selectedTemplate ? (
        <>
          {/* Search and filters */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Rechercher un modèle..."
                  className="form-input w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap ${
                      categoryFilter === category
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {category === 'all' ? 'Toutes catégories' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {template.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-2">{template.title}</h2>
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="btn-primary w-full"
                    >
                      Utiliser ce modèle
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Aucun modèle ne correspond à votre recherche.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedTemplate.title}</h2>
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>
              
              <button
                onClick={handleBackToList}
                className="btn-outline"
              >
                Retour à la liste
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {!previewMode ? (
              <form onSubmit={handleGenerateDocument} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTemplate.fields.map((field) => {
                    // Check if conditional field should be displayed
                    if (field.conditionalOn) {
                      const { field: condField, value: condValue } = field.conditionalOn;
                      if (formData[condField] !== condValue) {
                        return null;
                      }
                    }
                    
                    return (
                      <div key={field.name} className="form-group">
                        <label htmlFor={field.name} className="form-label">
                          {field.label}
                          {field.required && <span className="text-danger-500 ml-1">*</span>}
                        </label>
                        
                        {field.type === 'text' && (
                          <input
                            type="text"
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            required={field.required}
                          />
                        )}
                        
                        {field.type === 'textarea' && (
                          <textarea
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            className="form-input h-32"
                            required={field.required}
                          ></textarea>
                        )}
                        
                        {field.type === 'date' && (
                          <input
                            type="date"
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            required={field.required}
                          />
                        )}
                        
                        {field.type === 'select' && (
                          <select
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            required={field.required}
                          >
                            <option value="">Sélectionnez une option</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Générer le document
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Aperçu du document</h3>
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {generatedDocument}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="btn-outline"
                  >
                    Modifier les informations
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="btn-primary"
                  >
                    Télécharger le document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
