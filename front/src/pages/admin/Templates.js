import React, { useState, useEffect } from 'react';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    template: '',
    fields: []
  });
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: '',
    conditionalOn: null
  });
  
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
              { id: 1, name: 'employerName', label: 'Nom de l\'employeur', type: 'text', required: true },
              { id: 2, name: 'employerAddress', label: 'Adresse de l\'employeur', type: 'textarea', required: true },
              { id: 3, name: 'position', label: 'Poste occupé', type: 'text', required: true },
              { id: 4, name: 'reason', label: 'Motif de démission sans préavis', type: 'select', required: true, options: [
                'Faute grave de l\'employeur',
                'Raisons de santé',
                'Embauche en CDI après CDD',
                'Autre'
              ] },
              { id: 5, name: 'otherReason', label: 'Précisez le motif', type: 'textarea', required: false, conditionalOn: { field: 'reason', value: 'Autre' } }
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
              { id: 1, name: 'companyName', label: 'Nom de l\'entreprise', type: 'text', required: true },
              { id: 2, name: 'companyAddress', label: 'Adresse de l\'entreprise', type: 'textarea', required: true },
              { id: 3, name: 'productService', label: 'Produit ou service concerné', type: 'text', required: true },
              { id: 4, name: 'purchaseDate', label: 'Date d\'achat ou de commande', type: 'date', required: true },
              { id: 5, name: 'issueDescription', label: 'Description du problème', type: 'textarea', required: true },
              { id: 6, name: 'requestType', label: 'Type de demande', type: 'select', required: true, options: [
                'Remboursement',
                'Échange',
                'Réparation',
                'Dédommagement',
                'Autre'
              ] },
              { id: 7, name: 'otherRequest', label: 'Précisez votre demande', type: 'textarea', required: false, conditionalOn: { field: 'requestType', value: 'Autre' } }
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
              { id: 1, name: 'neighborName', label: 'Nom du voisin', type: 'text', required: true },
              { id: 2, name: 'neighborAddress', label: 'Adresse du voisin', type: 'textarea', required: true },
              { id: 3, name: 'troubleType', label: 'Type de trouble', type: 'select', required: true, options: [
                'Bruit',
                'Odeurs',
                'Dégradations',
                'Empiètement',
                'Autre'
              ] },
              { id: 4, name: 'otherTroubleType', label: 'Précisez le type de trouble', type: 'textarea', required: false, conditionalOn: { field: 'troubleType', value: 'Autre' } },
              { id: 5, name: 'troubleDescription', label: 'Description détaillée des troubles', type: 'textarea', required: true },
              { id: 6, name: 'troubleDates', label: 'Dates et heures des troubles', type: 'textarea', required: true },
              { id: 7, name: 'previousAttempts', label: 'Démarches déjà entreprises', type: 'textarea', required: false }
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
    // Update edit form when selected template changes
    if (selectedTemplate) {
      setEditForm({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        template: selectedTemplate.template,
        fields: [...selectedTemplate.fields]
      });
    }
  }, [selectedTemplate]);
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedFields = [...editForm.fields];
    
    if (type === 'checkbox') {
      updatedFields[index] = { ...updatedFields[index], [name]: checked };
    } else {
      updatedFields[index] = { ...updatedFields[index], [name]: value };
    }
    
    setEditForm(prev => ({ ...prev, fields: updatedFields }));
  };
  
  const handleOptionsChange = (index, e) => {
    const { value } = e.target;
    const updatedFields = [...editForm.fields];
    
    // Split by new line and filter out empty lines
    const options = value.split('\n').filter(option => option.trim() !== '');
    
    updatedFields[index] = { ...updatedFields[index], options };
    
    setEditForm(prev => ({ ...prev, fields: updatedFields }));
  };
  
  const handleConditionalChange = (index, fieldName, value) => {
    const updatedFields = [...editForm.fields];
    
    if (!fieldName) {
      updatedFields[index] = { ...updatedFields[index], conditionalOn: null };
    } else {
      updatedFields[index] = { 
        ...updatedFields[index], 
        conditionalOn: { field: fieldName, value } 
      };
    }
    
    setEditForm(prev => ({ ...prev, fields: updatedFields }));
  };
  
  const handleAddField = () => {
    if (!newField.name || !newField.label) return;
    
    const fieldId = Math.max(0, ...editForm.fields.map(f => f.id)) + 1;
    
    const field = {
      id: fieldId,
      name: newField.name,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      options: newField.type === 'select' ? newField.options.split('\n').filter(option => option.trim() !== '') : undefined,
      conditionalOn: newField.conditionalOn
    };
    
    setEditForm(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }));
    
    // Reset new field form
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: '',
      conditionalOn: null
    });
  };
  
  const handleRemoveField = (index) => {
    const updatedFields = [...editForm.fields];
    updatedFields.splice(index, 1);
    
    setEditForm(prev => ({ ...prev, fields: updatedFields }));
  };
  
  const handleSaveTemplate = () => {
    // In a real app, this would call the API to update the template
    // For now, we'll just update the local state
    
    if (selectedTemplate) {
      // Update existing template
      const updatedTemplates = templates.map(template => 
        template.id === selectedTemplate.id 
          ? { ...template, ...editForm } 
          : template
      );
      
      setTemplates(updatedTemplates);
    } else {
      // Create new template
      const newTemplate = {
        id: Math.max(0, ...templates.map(t => t.id)) + 1,
        ...editForm
      };
      
      setTemplates([...templates, newTemplate]);
    }
    
    setShowEditModal(false);
    setSelectedTemplate(null);
  };
  
  const handleDeleteTemplate = () => {
    // In a real app, this would call the API to delete the template
    // For now, we'll just update the local state
    
    const updatedTemplates = templates.filter(template => template.id !== selectedTemplate.id);
    
    setTemplates(updatedTemplates);
    setShowEditModal(false);
    setSelectedTemplate(null);
  };
  
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      template: '',
      fields: []
    });
    setShowEditModal(true);
  };
  
  const getFieldTypeOptions = () => {
    return [
      { value: 'text', label: 'Texte court' },
      { value: 'textarea', label: 'Texte long' },
      { value: 'select', label: 'Liste déroulante' },
      { value: 'date', label: 'Date' },
      { value: 'number', label: 'Nombre' },
      { value: 'checkbox', label: 'Case à cocher' }
    ];
  };
  
  const getConditionalFieldOptions = (currentIndex) => {
    // Only select fields can be used as conditional fields
    return editForm.fields
      .filter((field, index) => index !== currentIndex && field.type === 'select')
      .map(field => ({
        value: field.name,
        label: field.label,
        options: field.options
      }));
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modèles de documents</h1>
        <button 
          onClick={handleCreateTemplate}
          className="btn-primary"
        >
          Créer un modèle
        </button>
      </div>
      
      {/* Templates list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
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
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {template.fields.length} champ(s)
                </span>
                
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="btn-outline btn-sm"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Edit template modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedTemplate ? 'Modifier le modèle' : 'Créer un modèle'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label">Titre</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={editForm.title}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">Catégorie</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={editForm.category}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    className="form-input h-20"
                    required
                  ></textarea>
                </div>
                
                {/* Template content */}
                <div className="form-group">
                  <label htmlFor="template" className="form-label">Contenu du modèle</label>
                  <textarea
                    id="template"
                    name="template"
                    value={editForm.template}
                    onChange={handleInputChange}
                    className="form-input h-64 font-mono"
                    required
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    Utilisez {'{fieldName}'} pour insérer des champs dynamiques.
                  </p>
                </div>
                
                {/* Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Champs du formulaire</h3>
                  
                  {editForm.fields.length > 0 ? (
                    <div className="space-y-6">
                      {editForm.fields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-md font-medium">{field.label}</h4>
                            <button
                              onClick={() => handleRemoveField(index)}
                              className="text-danger-600 hover:text-danger-800"
                            >
                              Supprimer
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                              <label className="form-label">Nom technique</label>
                              <input
                                type="text"
                                name="name"
                                value={field.name}
                                onChange={(e) => handleFieldChange(index, e)}
                                className="form-input"
                              />
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label">Libellé</label>
                              <input
                                type="text"
                                name="label"
                                value={field.label}
                                onChange={(e) => handleFieldChange(index, e)}
                                className="form-input"
                              />
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label">Type</label>
                              <select
                                name="type"
                                value={field.type}
                                onChange={(e) => handleFieldChange(index, e)}
                                className="form-input"
                              >
                                {getFieldTypeOptions().map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label">Obligatoire</label>
                              <div className="mt-2">
                                <input
                                  type="checkbox"
                                  name="required"
                                  checked={field.required}
                                  onChange={(e) => handleFieldChange(index, e)}
                                  className="form-checkbox"
                                />
                              </div>
                            </div>
                            
                            {field.type === 'select' && (
                              <div className="form-group md:col-span-2">
                                <label className="form-label">Options (une par ligne)</label>
                                <textarea
                                  value={field.options ? field.options.join('\n') : ''}
                                  onChange={(e) => handleOptionsChange(index, e)}
                                  className="form-input h-24"
                                ></textarea>
                              </div>
                            )}
                            
                            <div className="form-group md:col-span-2">
                              <label className="form-label">Condition d'affichage</label>
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={field.conditionalOn ? field.conditionalOn.field : ''}
                                  onChange={(e) => {
                                    const fieldName = e.target.value;
                                    const value = fieldName ? (
                                      getConditionalFieldOptions().find(f => f.value === fieldName)?.options[0] || ''
                                    ) : '';
                                    handleConditionalChange(index, fieldName, value);
                                  }}
                                  className="form-input"
                                >
                                  <option value="">Aucune condition</option>
                                  {getConditionalFieldOptions(index).map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                
                                {field.conditionalOn && (
                                  <select
                                    value={field.conditionalOn.value}
                                    onChange={(e) => handleConditionalChange(
                                      index, 
                                      field.conditionalOn.field, 
                                      e.target.value
                                    )}
                                    className="form-input"
                                  >
                                    {getConditionalFieldOptions()
                                      .find(f => f.value === field.conditionalOn.field)
                                      ?.options.map(option => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                  </select>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Ce champ ne sera affiché que si la condition est remplie.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucun champ défini. Ajoutez des champs ci-dessous.</p>
                  )}
                  
                  {/* Add new field */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium mb-4">Ajouter un champ</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">Nom technique</label>
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                          className="form-input"
                          placeholder="Ex: firstName"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Libellé</label>
                        <input
                          type="text"
                          value={newField.label}
                          onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                          className="form-input"
                          placeholder="Ex: Prénom"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                          className="form-input"
                        >
                          {getFieldTypeOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Obligatoire</label>
                        <div className="mt-2">
                          <input
                            type="checkbox"
                            checked={newField.required}
                            onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                            className="form-checkbox"
                          />
                        </div>
                      </div>
                      
                      {newField.type === 'select' && (
                        <div className="form-group md:col-span-2">
                          <label className="form-label">Options (une par ligne)</label>
                          <textarea
                            value={newField.options}
                            onChange={(e) => setNewField(prev => ({ ...prev, options: e.target.value }))}
                            className="form-input h-24"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          ></textarea>
                        </div>
                      )}
                      
                      <div className="form-group md:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddField}
                          className="btn-primary"
                          disabled={!newField.name || !newField.label}
                        >
                          Ajouter le champ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t">
                  {selectedTemplate && (
                    <button
                      onClick={handleDeleteTemplate}
                      className="btn-danger"
                    >
                      Supprimer le modèle
                    </button>
                  )}
                  
                  <div className="space-x-3">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedTemplate(null);
                      }}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    
                    <button
                      onClick={handleSaveTemplate}
                      className="btn-primary"
                    >
                      {selectedTemplate ? 'Enregistrer' : 'Créer'}
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

export default Templates;
