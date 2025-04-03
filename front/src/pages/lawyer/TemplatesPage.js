import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Use the correct api instance
import { FaDownload, FaEdit, FaTrash, FaArrowLeft, FaPlus, FaSearch, FaTimes, FaFileAlt } from 'react-icons/fa';
import Modal from '../../components/Modal'; // Re-use modal component

// Component for the Template Creation/Editing Form (can be in the modal)
const TemplateForm = ({ template, onSave, onCancel }) => {
    const [name, setName] = useState(template?.name || '');
    const [description, setDescription] = useState(template?.description || '');
    const [category, setCategory] = useState(template?.category || '');
    const [content, setContent] = useState(template?.content || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !content) {
            setError('Le nom et le contenu du modèle sont requis.');
            return;
        }
        setLoading(true);
        setError('');

        const templateData = { name, description, category, content };

        try {
            let response;
            if (template?.id) { // Editing existing template
                response = await api.put(`/lawyer-templates/${template.id}`, templateData);
            } else { // Creating new template
                response = await api.post('/lawyer-templates', templateData);
            }
            onSave(response.data); // Pass back success data (might include new/updated template)
        } catch (err) {
            console.error("Error saving template:", err);
            setError(err.response?.data?.message || 'Failed to save template.');
            setLoading(false); // Keep modal open on error
        }
        // Don't set loading false on success, modal will close
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="template-name" className="form-label">Nom du modèle <span className="text-red-500">*</span></label>
                <input
                    type="text" id="template-name" value={name} onChange={(e) => setName(e.target.value)}
                    className="form-input" required maxLength={255}
                />
            </div>
            <div>
                <label htmlFor="template-description" className="form-label">Description</label>
                <input
                    type="text" id="template-description" value={description} onChange={(e) => setDescription(e.target.value)}
                    className="form-input" maxLength={255}
                />
            </div>
             <div>
                <label htmlFor="template-category" className="form-label">Catégorie</label>
                <input
                    type="text" id="template-category" value={category} onChange={(e) => setCategory(e.target.value)}
                    className="form-input" maxLength={50} placeholder="Ex: Contrat, Courrier, Conclusion"
                />
            </div>
            <div>
                <label htmlFor="template-content" className="form-label">Contenu du modèle <span className="text-red-500">*</span></label>
                <textarea
                    id="template-content" value={content} onChange={(e) => setContent(e.target.value)}
                    className="form-input font-mono text-sm h-60" required
                    placeholder="Écrivez votre modèle ici. Utilisez {variable} ou [variable] pour les champs à remplir."
                />
                 <p className="text-xs text-gray-500 mt-1">Utilisez des accolades `{'{variable}'}` ou des crochets `[variable]` pour définir les champs variables.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-outline">Annuler</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Sauvegarde...' : (template?.id ? 'Mettre à jour' : 'Créer Modèle')}
                </button>
            </div>
        </form>
    );
};


// Main Page Component
const LawyerTemplatesPage = () => {
    const [predefinedTemplates, setPredefinedTemplates] = useState([]);
    const [customTemplates, setCustomTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null); // Can be predefined or custom
    const [isCustomTemplate, setIsCustomTemplate] = useState(false); // Flag to know if selected is custom
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({});
    const [previewMode, setPreviewMode] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState('');
    const [error, setError] = useState(null);

    // State for managing add/edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null); // null for add, template object for edit

    // Fetch both predefined and custom templates
    const fetchAllTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const [predefinedRes, customRes] = await Promise.all([
                api.get('/ai/templates'), // Predefined templates
                api.get('/lawyer-templates') // Custom lawyer templates
            ]);
            setPredefinedTemplates(predefinedRes.data.templates || []);
            setCustomTemplates(customRes.data.templates || []); // Assuming API returns { templates: [...] }
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError(err.response?.data?.message || 'Failed to load templates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTemplates();
    }, []);

    // Reset form when template changes
    useEffect(() => {
        if (selectedTemplate) {
            const initialFormData = {};
            let variables = [];
            if (isCustomTemplate && selectedTemplate.content) {
                // For custom templates, fetch full details including content to extract variables
                api.get(`/lawyer-templates/${selectedTemplate.id}`)
                    .then(response => {
                        const fullTemplate = response.data.template;
                        if (fullTemplate && fullTemplate.content) {
                             // Extract variables from content (assuming a helper or regex)
                             const regex = /\{([a-zA-Z0-9_]+)\}|\[([a-zA-Z0-9_]+)\]/g;
                             let match;
                             const vars = new Set();
                             while ((match = regex.exec(fullTemplate.content)) !== null) {
                                 vars.add(match[1] || match[2]);
                             }
                             variables = Array.from(vars);
                             variables.forEach(v => initialFormData[v] = '');
                             setFormData(initialFormData);
                             // Update selected template with full details
                             setSelectedTemplate(fullTemplate);
                        } else {
                             setFormData({}); // Reset if content not found
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching full template details:", err);
                        setError("Impossible de charger les détails complets du modèle.");
                        setFormData({});
                    });

            } else if (!isCustomTemplate && selectedTemplate.variables) {
                 // For predefined, use variables provided by the list API
                 variables = selectedTemplate.variables || [];
                 variables.forEach(v => initialFormData[v] = '');
                 setFormData(initialFormData);
            } else {
                 setFormData({}); // Reset if no variables found
            }

            setPreviewMode(false);
            setGeneratedDocument('');
            setError(null);
        }
    }, [selectedTemplate, isCustomTemplate]); // Rerun when selected template or its type changes

    const handleSelectTemplate = (template, isCustom = false) => {
        setSelectedTemplate(template);
        setIsCustomTemplate(isCustom);
    };

    const handleBackToList = () => {
        setSelectedTemplate(null);
        setIsCustomTemplate(false);
        setFormData({});
        setPreviewMode(false);
        setGeneratedDocument('');
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generate document using the appropriate method
    const handleGenerateDocument = async (e) => {
        e.preventDefault();
        if (!selectedTemplate) return;

        setGenerating(true);
        setError(null);
        setGeneratedDocument('');

        try {
            let generatedDoc = '';
            if (isCustomTemplate) {
                // Simple local replacement for custom templates
                generatedDoc = selectedTemplate.content;
                Object.keys(formData).forEach(key => {
                    const placeholder = new RegExp(`[{\\[]${key}[\\}\\]]`, 'g'); // Match {key} or [key]
                    generatedDoc = generatedDoc.replace(placeholder, formData[key] || '');
                });
            } else {
                // Use API for predefined templates
                const response = await api.post('/ai/generate-document', {
                    templateName: selectedTemplate.id, // Predefined template ID/key
                    variables: formData
                });
                generatedDoc = response.data.document;
            }
            setGeneratedDocument(generatedDoc);
            setPreviewMode(true);
        } catch (err) {
             console.error('Error generating document:', err);
             setError(err.response?.data?.message || 'Failed to generate document.');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate.name}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- Custom Template Actions ---
    const handleOpenCreateModal = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (template) => {
         // Fetch full template details before editing, as list view might be partial
         api.get(`/lawyer-templates/${template.id}`)
            .then(response => {
                setEditingTemplate(response.data.template);
                setIsModalOpen(true);
            })
            .catch(err => {
                 console.error("Error fetching template for edit:", err);
                 setError(err.response?.data?.message || 'Failed to load template for editing.');
            });
    };

    const handleSaveTemplate = (result) => {
        setIsModalOpen(false);
        setEditingTemplate(null);
        fetchAllTemplates(); // Refresh both lists after save
    };

    const handleDeleteTemplate = async (templateId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle personnalisé ?')) {
            try {
                await api.delete(`/lawyer-templates/${templateId}`);
                fetchAllTemplates(); // Refresh list
            } catch (err) {
                console.error("Error deleting template:", err);
                setError(err.response?.data?.message || 'Failed to delete template.');
            }
        }
    };

    // Filtering logic
    const filterTemplates = (templateList) => {
        return templateList.filter(template =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
            // Add category filter back if needed and supported
        );
    };

    const filteredPredefined = filterTemplates(predefinedTemplates);
    const filteredCustom = filterTemplates(customTemplates);

    if (loading) {
        return <div className="p-4 text-center">Chargement des modèles...</div>;
    }

    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6">

            {!selectedTemplate ? (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Modèles de Documents</h1>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Rechercher un modèle..."
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                {searchTerm && (
                                    <button type="button" onClick={() => setSearchTerm('')} className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" title="Effacer">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                             <button
                                onClick={handleOpenCreateModal}
                                className="btn-primary whitespace-nowrap flex items-center"
                            >
                                <FaPlus className="mr-2" /> Créer Modèle
                            </button>
                        </div>
                    </div>

                    {error && <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

                    {/* Custom Templates Section */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Mes Modèles Personnalisés</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCustom.length > 0 ? (
                                filteredCustom.map((template) => (
                                    <div key={`custom-${template.id}`} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col">
                                        <div className="p-5 flex-grow">
                                            {template.category && <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mb-2">{template.category}</span>}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">{template.description || <span className="italic">Aucune description</span>}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
                                            <button onClick={() => handleSelectTemplate(template, true)} className="btn-secondary btn-sm">Utiliser</button>
                                            <div className="space-x-1">
                                                <button onClick={() => handleOpenEditModal(template)} className="text-gray-500 hover:text-blue-600 p-1" title="Modifier"><FaEdit /></button>
                                                <button onClick={() => handleDeleteTemplate(template.id)} className="text-gray-500 hover:text-red-600 p-1" title="Supprimer"><FaTrash /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500 border">
                                    {searchTerm ? 'Aucun modèle personnalisé trouvé.' : 'Vous n\'avez pas encore créé de modèle personnalisé.'}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Predefined Templates Section */}
                     <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Modèles Prédéfinis</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPredefined.length > 0 ? (
                                filteredPredefined.map((template) => (
                                     <div key={`predefined-${template.id}`} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col">
                                        <div className="p-5 flex-grow">
                                            {/* Assuming predefined templates might have category */}
                                            {/* {template.category && <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded mb-2">{template.category}</span>} */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                                            {/* Assuming predefined templates might have description */}
                                            {/* <p className="text-sm text-gray-600 line-clamp-2">{template.description || <span className="italic">Aucune description</span>}</p> */}
                                        </div>
                                        <div className="p-3 bg-gray-50 border-t">
                                            <button onClick={() => handleSelectTemplate(template, false)} className="btn-secondary btn-sm w-full">Utiliser ce modèle</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                 <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500 border">
                                    Aucun modèle prédéfini trouvé {searchTerm ? 'pour votre recherche' : ''}.
                                </div>
                            )}
                        </div>
                    </section>
                </>
            ) : (
                // Template Usage/Preview View
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                                {selectedTemplate.description && <p className="text-gray-600 text-sm">{selectedTemplate.description}</p>}
                            </div>
                            <button onClick={handleBackToList} className="btn-outline flex items-center">
                                <FaArrowLeft className="mr-2" /> Retour
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {!previewMode ? (
                            <form onSubmit={handleGenerateDocument} className="space-y-6">
                                <h3 className="text-lg font-medium mb-4">Remplir les informations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(selectedTemplate.variables || []).map((variableName) => {
                                        const label = variableName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return (
                                            <div key={variableName} className="form-group">
                                                <label htmlFor={variableName} className="form-label">{label} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text" id={variableName} name={variableName}
                                                    value={formData[variableName] || ''} onChange={handleInputChange}
                                                    className="form-input" required={true}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="btn-primary" disabled={generating}>
                                        {generating ? 'Génération...' : 'Générer le document'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-medium mb-4">Aperçu du document généré</h3>
                                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                                    <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 border rounded max-h-96 overflow-y-auto">
                                        {generatedDocument || "Le document généré apparaîtra ici."}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <button onClick={() => { setPreviewMode(false); setError(null); }} className="btn-outline flex items-center">
                                        <FaEdit className="mr-2" /> Modifier
                                    </button>
                                    <button onClick={handleDownload} className="btn-primary flex items-center" disabled={!generatedDocument || generating}>
                                        <FaDownload className="mr-2" /> Télécharger (.txt)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

             {/* Modal for Creating/Editing Custom Template */}
             <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Modifier le Modèle' : 'Créer un Modèle Personnalisé'}
            >
                <TemplateForm
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

        </div>
    );
};

export default LawyerTemplatesPage;