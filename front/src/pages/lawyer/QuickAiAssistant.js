import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Use same context
import api from '../../utils/api'; // Corrected import
import ReactMarkdown from 'react-markdown';

// Renamed component
const LawyerQuickAiAssistant = () => {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // State management (remains the same)
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversationTitle, setConversationTitle] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [chatError, setChatError] = useState(null);

  // Suggested messages (Can be adapted for lawyers later if needed)
  const defaultSuggestions = [
    "Quelles sont les dernières jurisprudences sur le droit du travail ?",
    "Comment rédiger une clause de non-concurrence efficace ?",
    "Quels sont les points clés à vérifier dans un bail commercial ?",
    "Expliquez la procédure d'appel en matière civile.",
    "Quelles sont les obligations déontologiques d'un avocat ?"
  ];
  const [suggestedMessages, setSuggestedMessages] = useState(defaultSuggestions);

  // Editing state (remains the same)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    } else {
      setMessages([]);
      setSuggestedMessages(defaultSuggestions);
    }
  }, [selectedConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch all conversations (Uses generic endpoint)
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      // Use api
      const response = await api.get('/conversations'); // Use 'api'
      const fetchedConversations = response.data || [];
      setConversations(fetchedConversations);

      if (fetchedConversations.length > 0) {
        const firstConv = fetchedConversations[0];
        setSelectedConversationId(firstConv.id);
        setConversationTitle(firstConv.title);

        if (firstConv.lastSuggestedQuestions && firstConv.lastSuggestedQuestions.length > 0) {
          setSuggestedMessages(firstConv.lastSuggestedQuestions);
        } else {
          setSuggestedMessages(defaultSuggestions);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.message || 'Impossible de charger les conversations.');
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages for a conversation (Uses generic endpoint)
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;

    setLoadingMessages(true);
    setChatError(null);
    setError(null);

    try {
      // Use api
      const response = await api.get(`/conversations/${conversationId}`); // Use 'api'
      const conversationData = response.data;

      if (!conversationData) {
        throw new Error('Conversation data not found');
      }

      setMessages(conversationData.messages || []);

      if (conversationData.lastSuggestedQuestions && conversationData.lastSuggestedQuestions.length > 0) {
        setSuggestedMessages(conversationData.lastSuggestedQuestions);
      } else if (conversationData.messages && conversationData.messages.length > 0) {
        generateFallbackSuggestions(); // Keep fallback logic
      } else {
        setSuggestedMessages(defaultSuggestions);
      }
    } catch (err) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, err);
      setChatError(err.response?.data?.message || 'Impossible de charger les messages.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Create a new conversation (Uses generic endpoint)
  const handleCreateConversation = async (e) => {
    e.preventDefault();

    if (!newConversationTitle.trim()) {
      setError('Veuillez entrer un titre pour la conversation.');
      return;
    }

    try {
      // Use api
      const response = await api.post('/conversations', { // Use 'api'
        title: newConversationTitle
      });

      const newConversation = response.data;
      setConversations([newConversation, ...conversations]);
      setSelectedConversationId(newConversation.id);
      setConversationTitle(newConversation.title);
      setMessages([]);
      setNewConversationTitle('');
      setIsCreatingConversation(false);
      setError(null);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.response?.data?.message || 'Impossible de créer la conversation.');
    }
  };

  // Send a message (Uses generic /ai/ask endpoint)
  const handleSendMessage = async (e, suggestedMessage = null) => {
    if (e) e.preventDefault();
    if (!selectedConversationId) return;

    const userMessageContent = suggestedMessage || input;
    if (!userMessageContent.trim()) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const payload = {
        question: userMessageContent,
        conversationId: selectedConversationId // Send conversationId for context
      };

      // Use api
      const response = await api.post('/ai/ask', payload); // Use 'api'
      const aiResponseData = response.data;

      const aiMessage = {
        id: aiResponseData.messageId || `ai-${Date.now()}`,
        sender: 'ai',
        content: aiResponseData.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.id !== userMessage.id);
        // Ensure user message is added back correctly before AI message
        const finalUserMessage = { ...userMessage, id: userMessage.id.startsWith('temp-') ? `user-${Date.now()}` : userMessage.id }; // Give it a more permanent ID if needed
        return [...newMessages, finalUserMessage, aiMessage];
      });


      if (aiResponseData.suggestedQuestions && aiResponseData.suggestedQuestions.length > 0) {
        setSuggestedMessages(aiResponseData.suggestedQuestions);
      } else {
        generateFallbackSuggestions();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg = err.response?.data?.message || "Erreur lors de l'envoi du message.";
      setError(errorMsg);

      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        content: `Désolé, une erreur s'est produite: ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev.filter(msg => msg.id !== userMessage.id), userMessage, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate fallback suggestions (Adapted slightly for lawyer context)
  const generateFallbackSuggestions = () => {
    const legalTopics = [
      "Quelles sont les implications fiscales de cette situation ?",
      "Quels sont les délais de prescription applicables ?",
      "Quels documents sont nécessaires pour cette procédure ?",
      "Quels sont les arguments juridiques clés à développer ?",
      "Y a-t-il des précédents jurisprudentiels pertinents ?",
      "Quelles sont les stratégies de négociation possibles ?",
      "Comment contester cette pièce adverse ?",
      "Quels sont les recours possibles en appel ?",
      "Quelles sont les prochaines étapes procédurales ?",
      "Pouvez-vous me fournir un modèle de conclusion ?"
    ];

    const shuffled = [...legalTopics].sort(() => 0.5 - Math.random());
    setSuggestedMessages(shuffled.slice(0, 5));
  };

  // Format time (remains the same)
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date (remains the same)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Select a conversation (remains the same)
  const handleSelectConversation = (conversation) => {
    if (conversation.id === selectedConversationId) return;

    setSelectedConversationId(conversation.id);
    setConversationTitle(conversation.title);
    setError(null);
  };

  // JSX Structure (remains largely the same, minor text changes if needed)
  return (
    <div className="flex h-full bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 h-full bg-white border-r flex flex-col shadow-md flex-shrink-0">
        <div className="p-5 border-b bg-gradient-to-r from-primary-600 to-primary-700">
          <h2 className="text-xl font-bold text-white mb-4">Conversations IA</h2>
          <button
            onClick={() => setIsCreatingConversation(true)}
            className="w-full bg-white hover:bg-gray-100 text-primary-700 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nouvelle conversation
          </button>
        </div>

        {isCreatingConversation && (
          <div className="p-4 border-b bg-gray-50">
            <form onSubmit={handleCreateConversation} className="space-y-2">
              <input
                type="text"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                placeholder="Titre de la conversation"
                className="form-input w-full px-3 py-2 border rounded"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingConversation(false);
                    setNewConversationTitle('');
                  }}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm"
                  disabled={!newConversationTitle.trim()}
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex-grow overflow-y-auto">
          {loadingConversations ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Aucune conversation</p>
              <p className="text-sm mt-2">Créez une nouvelle conversation pour commencer.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map(conversation => (
                <li
                  key={conversation.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedConversationId === conversation.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-900 truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(conversation.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white h-full border-l overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-primary-600 to-primary-700 shadow-md z-10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h1 className="text-xl font-bold text-white">
                {loadingConversations ? 'Chargement...' : conversationTitle || 'Assistant IA Avocat'}
              </h1>
            </div>
          </div>
          {error && !messages.find(m => m.isError) && (
            <div className="mt-2 text-sm bg-red-100 text-red-800 p-2 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {loadingConversations ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Chargement des conversations...</p>
              </div>
            ) : loadingMessages ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Chargement des messages...</p>
              </div>
            ) : !selectedConversationId ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-lg">Sélectionnez ou créez une conversation.</span>
              </div>
            ) : chatError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <span>{chatError}</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-lg mb-2">Posez une question pour commencer...</span>
                 <p className="text-sm text-center max-w-md">
                  Utilisez cet assistant pour la recherche juridique, l'aide à la rédaction, ou toute autre question.
                </p>
              </div>
            ) : (
              <>
                {messages.map(message => {
                  const isUserMessage = message.sender === 'user';

                  return (
                    <div
                      key={message.id}
                      className={`group relative flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUserMessage && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                          isUserMessage
                            ? 'bg-primary-500 text-white'
                            : message.isError
                            ? 'bg-red-100 text-red-800'
                            : message.isSystem // Assuming you might add system messages
                            ? 'bg-blue-50 text-blue-800 border border-blue-100'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <ReactMarkdown
                          className={`prose prose-sm max-w-none ${
                            isUserMessage ? 'prose-invert' : ''
                          } break-words`}
                        >
                          {message.content}
                        </ReactMarkdown>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {formatTime(message.updatedAt || message.timestamp)}
                          {message.updatedAt && message.updatedAt !== message.timestamp &&
                            <span className="italic text-xs opacity-70 ml-1">(modifié)</span>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                    <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
        </div>

          {/* Suggested Messages */}
          {messages.length > 0 && !isTyping && suggestedMessages.length > 0 && (
            <div className="flex-shrink-0 p-4 border-t">
              <p className="text-sm font-medium text-gray-600 mb-2">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestedMessages.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleSendMessage(e, suggestion)}
                    className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 border-t p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question ici..."
                className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isTyping || loadingConversations || loadingMessages || !selectedConversationId}
              />
              <button
                type="submit"
                className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isTyping || !input.trim() || loadingConversations || loadingMessages || !selectedConversationId}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
      </div>
    </div>
  );
};

// Export the renamed component
export default LawyerQuickAiAssistant;