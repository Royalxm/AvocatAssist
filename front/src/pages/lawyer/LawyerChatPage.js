import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Corrected import
import { useAuth } from '../../contexts/AuthContext';
// Placeholder components - these would need to be built
// import LawyerList from '../../components/lawyer/LawyerList';
// import DirectChatInterface from '../../components/lawyer/DirectChatInterface';

const LawyerChatPage = () => {
    const [selectedLawyer, setSelectedLawyer] = useState(null); // State to hold the lawyer being chatted with
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Fetch recent conversations on load
    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true);
            setError(null);
            try {
                const response = await api.get('/direct-messages/conversations'); // Use 'api'
                setConversations(response.data.conversations || []);
            } catch (err) {
                console.error("Error fetching direct message conversations:", err);
                setError(err.response?.data?.message || 'Failed to load conversations.');
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConversations();
    }, []);

    const handleSelectLawyer = (lawyer) => {
        setSelectedLawyer(lawyer);
        // TODO: Logic to load/display chat interface for this lawyer
        console.log("Selected lawyer:", lawyer);
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Sidebar: List of lawyers or recent conversations */}
            <div className="w-80 h-full bg-white border-r flex flex-col shadow-md flex-shrink-0">
                <div className="p-5 border-b bg-gradient-to-r from-primary-600 to-primary-700">
                    <h2 className="text-xl font-bold text-white">Messagerie Avocats</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {loadingConversations ? (
                        <div className="p-4 text-center text-gray-500">Chargement...</div>
                    ) : error ? (
                         <div className="p-4 text-red-500">{error}</div>
                    ) : conversations.length === 0 ? (
                         <div className="p-4 text-center text-gray-500">Aucune conversation récente.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {conversations.map(convo => (
                                <li
                                    key={convo.partnerId}
                                    className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedLawyer?.id === convo.partnerId ? 'bg-gray-100' : ''}`}
                                    onClick={() => handleSelectLawyer({ id: convo.partnerId, name: convo.partnerName })} // Pass basic partner info
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-gray-900 truncate">{convo.partnerName}</p>
                                        {convo.unreadCount > 0 && (
                                            <span className="ml-2 inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        {convo.lastMessageSenderId === currentUser?.id ? 'Vous: ' : ''}
                                        {convo.lastMessageContent}
                                    </p>
                                    <p className="text-xs text-gray-400 text-right mt-1">
                                        {new Date(convo.lastMessageTimestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                     {/* Placeholder for a full lawyer list component */}
                     {/* <LawyerList onSelectLawyer={handleSelectLawyer} /> */}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-grow flex flex-col bg-white h-full border-l overflow-hidden">
                {selectedLawyer ? (
                    // Placeholder for the actual chat interface component
                    // <DirectChatInterface lawyer={selectedLawyer} />
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <h1 className="text-xl font-semibold mb-2">Chat avec {selectedLawyer.name}</h1>
                        <p>(Interface de chat à implémenter)</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-lg">Sélectionnez une conversation pour commencer.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerChatPage;