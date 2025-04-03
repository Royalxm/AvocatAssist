import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api'; // Corrected import
import ReactMarkdown from 'react-markdown';
import { FaReply, FaEdit, FaTrash, FaUser } from 'react-icons/fa'; // Using react-icons
import { useAuth } from '../../contexts/AuthContext'; // To check user ID for edit/delete

const ForumTopicPage = () => {
    const { topicId } = useParams();
    const { currentUser } = useAuth(); // Get current user info
    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingTopic, setLoadingTopic] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });

    // New post state
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const [postError, setPostError] = useState(null);

    // Editing post state
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    const postsEndRef = useRef(null); // Ref to scroll to bottom

    // Fetch topic details
    useEffect(() => {
        const fetchTopic = async () => {
            setLoadingTopic(true);
            setError(null);
            try {
                const response = await api.get(`/forum/topics/${topicId}`); // Use 'api'
                setTopic(response.data.topic);
            } catch (err) {
                console.error("Error fetching forum topic:", err);
                setError(err.response?.data?.message || 'Failed to load topic details.');
            } finally {
                setLoadingTopic(false);
            }
        };
        fetchTopic();
    }, [topicId]);

    // Fetch posts for the topic
    const fetchPosts = async (page = 1) => {
        setLoadingPosts(true);
        setError(null); // Clear general error when fetching posts
        try {
            const response = await api.get(`/forum/topics/${topicId}/posts`, { // Use 'api'
                params: {
                    page: page,
                    limit: pagination.limit,
                    order: 'ASC' // Show oldest first
                }
            });
            setPosts(response.data.posts || []);
            setPagination(response.data.pagination || { page: 1, limit: 20, totalPages: 1 });
        } catch (err) {
            console.error("Error fetching forum posts:", err);
            setError(err.response?.data?.message || 'Failed to load posts for this topic.');
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        if (topicId) {
            fetchPosts(pagination.page);
        }
    }, [topicId, pagination.page]);

     // Scroll to bottom when new posts are added or page loads
    useEffect(() => {
        if (!loadingPosts) {
            postsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [posts, loadingPosts]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsSubmittingPost(true);
        setPostError(null);
        try {
            const response = await api.post(`/forum/topics/${topicId}/posts`, { // Use 'api'
                content: newPostContent
            });
            // Add the new post optimistically or refetch
            // Refetching might be simpler to get correct pagination/order
            setNewPostContent('');
            fetchPosts(pagination.totalPages); // Go to last page where new post is likely added
        } catch (err) {
            console.error("Error submitting post:", err);
            setPostError(err.response?.data?.message || 'Failed to submit post.');
        } finally {
            setIsSubmittingPost(false);
        }
    };

    // --- Edit Post Handlers ---
    const handleStartEdit = (post) => {
        setEditingPostId(post.id);
        setEditingContent(post.content);
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setEditingContent('');
    };

    const handleSaveEdit = async () => {
        if (!editingPostId || !editingContent.trim()) return;
        const originalContent = posts.find(p => p.id === editingPostId)?.content;

        // Optimistic update
        setPosts(prevPosts =>
            prevPosts.map(p =>
                p.id === editingPostId ? { ...p, content: editingContent.trim() } : p
            )
        );
        const currentEditingId = editingPostId; // Store ID before clearing state
        handleCancelEdit(); // Clear editing state

        try {
            await api.put(`/forum/posts/${currentEditingId}`, { content: editingContent.trim() }); // Use 'api'
            // Optionally refetch posts to confirm update, or rely on optimistic update
        } catch (err) {
            console.error("Error saving edited post:", err);
            setError(err.response?.data?.message || 'Failed to save edit.');
            // Revert optimistic update on error
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.id === currentEditingId ? { ...p, content: originalContent } : p
                )
            );
        }
    };

    // --- Delete Post Handler ---
    const handleDeletePost = async (postId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
            const originalPosts = [...posts];
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId)); // Optimistic delete
            try {
                await api.delete(`/forum/posts/${postId}`); // Use 'api'
                // Optionally refetch posts or adjust pagination if needed
            } catch (err) {
                console.error("Error deleting post:", err);
                setError(err.response?.data?.message || 'Failed to delete post.');
                setPosts(originalPosts); // Revert on error
            }
        }
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    };

    if (loadingTopic) {
        return <div className="p-4 text-center">Chargement du sujet...</div>;
    }

    if (error && !topic) { // Show error only if topic failed to load
        return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;
    }

    if (!topic) {
        return <div className="p-4 text-center">Sujet non trouvé.</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
             {/* Back Link & Topic Title */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                 <Link to="/lawyer/forum" className="text-sm text-primary-600 hover:underline flex items-center gap-1 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Retour au Forum
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{topic.title}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                        <FaUser className="text-gray-400" /> Par: {topic.lawyerName}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>Créé le: {formatDate(topic.createdAt)}</span>
                    {topic.category && (
                        <>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {topic.category}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Display Posts */}
            <div className="space-y-4">
                {loadingPosts && posts.length === 0 ? (
                     <div className="p-4 text-center text-gray-500">Chargement des messages...</div>
                ) : !loadingPosts && posts.length === 0 ? (
                     <div className="p-4 text-center text-gray-500">Aucun message dans ce sujet pour le moment.</div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className={`bg-white p-4 rounded-lg shadow-sm border ${editingPostId === post.id ? 'border-primary-300 ring-2 ring-primary-200' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center text-sm">
                                    <span className="font-semibold text-gray-800 mr-2">{post.lawyerName}</span>
                                    <span className="text-gray-500">{formatDate(post.createdAt)}</span>
                                </div>
                                {/* Edit/Delete Buttons */}
                                {currentUser?.id === post.lawyerId && editingPostId !== post.id && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStartEdit(post)} className="text-xs text-blue-600 hover:underline p-1" title="Modifier"><FaEdit /></button>
                                        <button onClick={() => handleDeletePost(post.id)} className="text-xs text-red-600 hover:underline p-1" title="Supprimer"><FaTrash /></button>
                                    </div>
                                )}
                            </div>

                            {editingPostId === post.id ? (
                                <div className="mt-2">
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        className="w-full p-2 border rounded text-sm"
                                        rows="4"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={handleCancelEdit} className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Annuler</button>
                                        <button onClick={handleSaveEdit} className="text-xs px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700" disabled={!editingContent.trim()}>Enregistrer</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <ReactMarkdown>{post.content}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ))
                )}
                 {/* Loading indicator when fetching more posts */}
                 {loadingPosts && posts.length > 0 && (
                     <div className="p-4 text-center text-gray-500">Chargement...</div>
                 )}
                 <div ref={postsEndRef} /> {/* Element to scroll to */}
            </div>

             {/* Pagination for Posts */}
             {pagination.totalPages > 1 && (
                 <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => fetchPosts(pagination.page - 1)}
                            disabled={pagination.page === 1 || loadingPosts}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Précédent
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            Page {pagination.page} sur {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchPosts(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages || loadingPosts}
                            className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                        >
                            Suivant
                        </button>
                    </nav>
                </div>
            )}

            {/* Reply Form */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 flex items-center"><FaReply className="mr-2 text-primary-600"/> Répondre au sujet</h3>
                <form onSubmit={handlePostSubmit}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows="5"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Écrivez votre réponse ici..."
                        required
                    />
                    {postError && <p className="text-red-500 text-xs mt-1">{postError}</p>}
                    <div className="mt-3 text-right">
                        <button
                            type="submit"
                            disabled={isSubmittingPost || !newPostContent.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {isSubmittingPost ? 'Envoi en cours...' : 'Envoyer la réponse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForumTopicPage;