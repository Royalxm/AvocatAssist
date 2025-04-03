import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
import { FaNewspaper, FaExternalLinkAlt } from 'react-icons/fa';

const LegalNewsPage = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });

    useEffect(() => {
        fetchNews(pagination.page);
    }, [pagination.page]);

    const fetchNews = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/legal-news', { // Use 'api'
                params: {
                    page: page,
                    limit: pagination.limit
                }
            });
            setNewsItems(response.data.items || []);
            setPagination(response.data.pagination || { page: 1, limit: 20, totalPages: 1 });
        } catch (err) {
            console.error("Error fetching legal news:", err);
            setError(err.response?.data?.message || 'Failed to load legal news.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        try {
            const date = new Date(dateString);
            // Check if date is valid before formatting
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Date invalide';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center">
                <FaNewspaper className="mr-3 text-primary-600" /> Actualités Juridiques
            </h1>

            {error && (
                <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="space-y-4">
                {loading && newsItems.length === 0 ? (
                    <div className="text-center p-10">Chargement des actualités...</div>
                ) : !loading && newsItems.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-lg shadow">Aucune actualité juridique trouvée.</div>
                ) : (
                    newsItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h2>
                            <div className="flex items-center text-xs text-gray-500 mb-2 space-x-3">
                                {item.source && <span>Source: <span className="font-medium">{item.source}</span></span>}
                                {item.source && item.pubDate && <span>|</span>}
                                {item.pubDate && <span>Publié le: {formatDate(item.pubDate)}</span>}
                            </div>
                            {item.description && (
                                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{item.description}</p>
                            )}
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 hover:underline"
                            >
                                Lire l'article complet <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                            </a>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                 <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => fetchNews(pagination.page - 1)}
                            disabled={pagination.page === 1 || loading}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Précédent
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            Page {pagination.page} sur {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchNews(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages || loading}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Suivant
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default LegalNewsPage;