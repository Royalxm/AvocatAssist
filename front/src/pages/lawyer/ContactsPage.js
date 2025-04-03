import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa'; // Using react-icons

// Placeholder for a potential Contact Form Modal/Component
// const ContactForm = ({ contact, onSave, onCancel }) => { ... };

const ContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // State for managing add/edit modal/form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null); // null for add, contact object for edit

    useEffect(() => {
        fetchContacts(pagination.page, searchTerm);
    }, [pagination.page, searchTerm]); // Refetch when page or search term changes

    const fetchContacts = async (page = 1, currentSearchTerm = searchTerm) => {
        setLoading(true);
        setError(null);
        setIsSearching(!!currentSearchTerm); // Set searching state based on term presence

        try {
            const response = await api.get('/contacts', { // Use 'api'
                params: {
                    page: page,
                    limit: pagination.limit,
                    searchTerm: currentSearchTerm || undefined // Send searchTerm only if it exists
                }
            });
            setContacts(response.data.contacts || []);
            setPagination(response.data.pagination || { page: 1, limit: 20, totalPages: 1 });
        } catch (err) {
            console.error("Error fetching contacts:", err);
            setError(err.response?.data?.message || 'Failed to load contacts.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on new search
        fetchContacts(1, searchTerm);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
        fetchContacts(1, ''); // Fetch all contacts
    };

    const handleAddContact = () => {
        setEditingContact(null); // Indicate adding a new contact
        setIsModalOpen(true);
        // TODO: Implement modal display logic
        alert("Fonctionnalité 'Ajouter Contact' à implémenter (Modal/Formulaire)");
    };

    const handleEditContact = (contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
         // TODO: Implement modal display logic
        alert(`Fonctionnalité 'Modifier Contact' à implémenter pour: ${contact.name}`);
    };

    const handleDeleteContact = async (contactId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
            try {
                await api.delete(`/contacts/${contactId}`); // Use 'api'
                // Refetch contacts on the current page after deletion
                fetchContacts(pagination.page, searchTerm);
            } catch (err) {
                console.error("Error deleting contact:", err);
                setError(err.response?.data?.message || 'Failed to delete contact.');
                alert('Échec de la suppression du contact.'); // Show user feedback
            }
        }
    };

    // Handle saving from the modal/form (placeholder)
    const handleSaveContact = async (contactData) => {
         console.log("Saving contact:", contactData);
         // TODO: Implement API call (POST for new, PUT for edit)
         // After successful save:
         setIsModalOpen(false);
         setEditingContact(null);
         fetchContacts(editingContact ? pagination.page : 1, searchTerm); // Refetch current page on edit, first page on add
    };


    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Carnet d'adresses</h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                     {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex-grow sm:flex-grow-0 flex">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Rechercher (nom, email...)"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm w-full"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                    title="Effacer la recherche"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 text-sm"
                            disabled={loading}
                        >
                            {isSearching ? 'Recherche...' : 'Chercher'}
                        </button>
                    </form>
                    <button
                        onClick={handleAddContact}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
                    >
                        <FaUserPlus className="mr-2 -ml-1 h-5 w-5" />
                        Ajouter
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            {/* Contacts Table/List */}
            <div className="bg-white shadow overflow-x-auto rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Société</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client?</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chargement des contacts...</td></tr>
                        ) : contacts.length === 0 ? (
                            <tr><td colSpan="6" className="p-4 text-center text-gray-500">Aucun contact trouvé.</td></tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.company || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contact.isClient ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Oui</span>
                                        ) : (
                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Non</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEditContact(contact)} className="text-primary-600 hover:text-primary-900" title="Modifier">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-900" title="Supprimer">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

             {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                 <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => fetchContacts(pagination.page - 1, searchTerm)}
                            disabled={pagination.page === 1 || loading}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Précédent
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            Page {pagination.page} sur {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchContacts(pagination.page + 1, searchTerm)}
                            disabled={pagination.page === pagination.totalPages || loading}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Suivant
                        </button>
                    </nav>
                </div>
            )}

            {/* TODO: Add Modal for ContactForm */}
            {/* {isModalOpen && <ContactForm contact={editingContact} onSave={handleSaveContact} onCancel={() => setIsModalOpen(false)} />} */}

        </div>
    );
};

export default ContactsPage;