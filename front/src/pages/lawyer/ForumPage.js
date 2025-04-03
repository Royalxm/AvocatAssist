import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api'; // Corrected import
import { FaComments, FaPlus, FaSync } from 'react-icons/fa'; // Using react-icons

const ForumPage = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1 });
    // TODO: Add state for creating new topic (modal?)

    const fetchTopics = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/forum/topics', { // Use 'api'
                params: {
                    page: page,
                    limit: pagination.limit,
                    sortBy: 'lastActivityAt', // Default sort by recent activity
                    order: 'DESC'
                }
            });
            setTopics(response.data.topics || []);
            setPagination(response.data.pagination || { page: 1, limit: 15, totalPages: 1 });
        } catch (err) {
            console.error("Error fetching forum topics:", err);
            setError(err.response?.data?.message || 'Failed to load forum topics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics(pagination.page);
    }, [pagination.page]);

    const handleRefresh = () => {
        fetchTopics(1); // Fetch first page on refresh
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <FaComments className="mr-3 text-primary-600" /> Forum des Avocats
                </h1>
                <div>
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full mr-2 transition-colors"
                        title="Rafraîchir"
                        disabled={loading}
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        // onClick={() => /* Open create topic modal */}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <FaPlus className="mr-2 -ml-1 h-5 w-5" />
                        Nouveau Sujet
                    </button>
                     {/* TODO: Implement Create Topic Modal/Form */}
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {loading && topics.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">Chargement des sujets...</li>
                    ) : !loading && topics.length === 0 ? (
                         <li className="p-6 text-center text-gray-500">
                            <FaComments className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="font-medium">Aucun sujet trouvé.</p>
                            <p className="text-sm">Soyez le premier à lancer une discussion !</p>
                        </li>
                    ) : (
                        topics.map((topic) => (
                            <li key={topic.id} className="hover:bg-gray-50 transition-colors">
                                <Link to={`/lawyer/forum/topics/${topic.id}`} className="block px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-md font-semibold text-primary-700 truncate">{topic.title}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {topic.postCount || 0} réponse(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex items-center text-sm text-gray-500">
                                            <p className="flex items-center mr-4">
                                                <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                {topic.lawyerName}
                                            </p>
                                            {topic.category && (
                                                <p className="flex items-center mt-2 sm:mt-0 mr-4">
                                                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 4.293a1 1 0 011.414 1.414l-13 13A1 1 0 014 19H1a1 1 0 01-1-1V6a1 1 0 01.293-.707l3-3a1 1 0 011.414 0L10 7.586l7.293-7.293z"></path></svg>
                                                    {topic.category}
                                                </p>
                                            )}
                                            <p className="flex items-center mt-2 sm:mt-0">
                                                <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                                Créé le: {formatDate(topic.createdAt)}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                            <p>
                                                Dernière activité: <time dateTime={topic.lastActivityAt}>{formatDate(topic.lastActivityAt)}</time>
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                 <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => fetchTopics(pagination.page - 1)}
                            disabled={pagination.page === 1 || loading}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Précédent
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            Page {pagination.page} sur {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchTopics(pagination.page + 1)}
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

export default ForumPage;