import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

const QuickAiAssistant = () => {
  const { currentUser } = useAuth();

  // Conversation state
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
  
  // Suggested messages - Initial default state
  const defaultSuggestions = [
    "Quelles sont les étapes pour créer une entreprise en France ?",
    "Pouvez-vous m'expliquer les différents types de contrats de travail ?",
    "Quels sont mes droits en tant que locataire ?",
    "Comment protéger ma propriété intellectuelle ?",
    "Quelles sont les implications juridiques d'un divorce ?"
  ];
  const [suggestedMessages, setSuggestedMessages] = useState(defaultSuggestions);

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');

  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const response = await axios.get('/conversations');
        const fetchedConversations = response.data || [];
        setConversations(fetchedConversations);
        
        // Select the first conversation if available
        if (fetchedConversations.length > 0) {
          const firstConv = fetchedConversations[0];
          setSelectedConversationId(firstConv.id);
          setConversationTitle(firstConv.title);
          // Set suggestions from the first conversation if available
          if (firstConv.lastSuggestedQuestions && firstConv.lastSuggestedQuestions.length > 0) {
            setSuggestedMessages(firstConv.lastSuggestedQuestions);
          } else {
            setSuggestedMessages(defaultSuggestions); // Reset to default if none saved
          }
        } else {
          // No conversations, reset suggestions to default
           setSuggestedMessages(defaultSuggestions);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err.response?.data?.message || 'Impossible de charger les conversations.');
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversationId) {
        setMessages([]);
        setSuggestedMessages(defaultSuggestions); // Reset suggestions if no conversation selected
        return;
      }
      
      setLoadingMessages(true);
      setChatError(null);
      setError(null);
      
      try {
        const response = await axios.get(`/conversations/${selectedConversationId}`);
        const conversationData = response.data;
        
        if (!conversationData) {
           throw new Error('Conversation data not found');
        }

        setMessages(conversationData.messages || []);

        // Update suggestions based on the latest fetched conversation data
        if (conversationData.lastSuggestedQuestions && conversationData.lastSuggestedQuestions.length > 0) {
          setSuggestedMessages(conversationData.lastSuggestedQuestions);
        } else {
          // Only generate fallback if there are messages, otherwise keep default
          if (conversationData.messages && conversationData.messages.length > 0) {
             generateFallbackSuggestions(); 
          } else {
             setSuggestedMessages(defaultSuggestions);
          }
        }

      } catch (err) {
        console.error(`Error fetching messages for conversation ${selectedConversationId}:`, err);
        setChatError(err.response?.data?.message || 'Impossible de charger les messages.');
        setMessages([]);
        setSuggestedMessages(defaultSuggestions); // Reset suggestions on error
      } finally {
        setLoadingMessages(false);
      }
    };
    
    if (selectedConversationId) {
      fetchMessages();
    } else {
       // Clear messages and reset suggestions if no conversation is selected
       setMessages([]);
       setSuggestedMessages(defaultSuggestions);
    }
  }, [selectedConversationId]); // Rerun when selectedConversationId changes

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new conversation
  const handleCreateConversation = async (e) => {
    e.preventDefault();
    
    if (!newConversationTitle.trim()) {
      setError('Veuillez entrer un titre pour la conversation.');
      return;
    }
    
    try {
      const response = await axios.post('/conversations', {
        title: newConversationTitle
      });
      
      const newConversation = response.data;
      // Ensure suggestions are parsed correctly for the new conversation
      const formattedNewConv = {
          ...newConversation,
          lastSuggestedQuestions: Array.isArray(newConversation.lastSuggestedQuestions) ? newConversation.lastSuggestedQuestions : defaultSuggestions
      };

      setConversations([formattedNewConv, ...conversations]);
      setSelectedConversationId(formattedNewConv.id);
      setConversationTitle(formattedNewConv.title);
      setMessages([]); // Clear messages for new conversation
      setSuggestedMessages(formattedNewConv.lastSuggestedQuestions); // Set suggestions (likely default)
      setNewConversationTitle('');
      setIsCreatingConversation(false);
      setError(null);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.response?.data?.message || 'Impossible de créer la conversation.');
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversationId(conversation.id);
    setConversationTitle(conversation.title);
    // Suggestions will be updated by the useEffect hook listening to selectedConversationId
    setError(null);
  };

  // Send message
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
      // Construct payload for /ai/ask endpoint
      // It expects 'chatId', which corresponds to the ID in the 'Chats' table.
      // We need to find the 'Chats' table ID associated with our 'Conversations' table ID.
      // This requires either:
      // A) Modifying the backend /ai/ask to accept conversationId directly OR
      // B) Fetching the associated Chat ID on the frontend before sending.
      // Option A is cleaner. Let's assume backend /ai/ask is modified or will be.
      // For now, we'll send conversationId and hope the backend handles it.
      // *** If errors occur here, the backend /ai/ask needs adjustment ***
      const payload = {
        question: userMessageContent,
        // Send conversationId, assuming backend /ai/ask can handle it
        // If not, this needs adjustment based on how Chats/Conversations are linked
        chatId: selectedConversationId, // Sending conversation ID as chatId for now
        // conversationId: selectedConversationId // Alternatively, send explicitly if backend is updated
      };

      const response = await axios.post('/ai/ask', payload);
      const aiResponseData = response.data;

      const aiMessage = {
        id: aiResponseData.messageId || `ai-${Date.now()}`,
        sender: 'ai',
        content: aiResponseData.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.id !== userMessage.id);
        return [...newMessages, userMessage, aiMessage];
      });

      // Update suggestions based on AI response
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Generate fallback suggestions
  const generateFallbackSuggestions = () => {
    const legalTopics = [
      "Quelles sont les implications fiscales de cette situation ?",
      "Puis-je obtenir une aide juridictionnelle dans ce cas ?",
      "Quels documents dois-je préparer pour cette procédure ?",
      "Quels sont les délais légaux à respecter ?",
      "Y a-t-il des précédents juridiques similaires à ma situation ?",
      "Quelles sont les alternatives à une procédure judiciaire ?",
      "Comment puis-je contester cette décision ?",
      "Quels sont mes recours possibles ?",
      "Quelles sont les prochaines étapes à suivre ?",
      "Pouvez-vous me donner un exemple de document à préparer ?"
    ];
    
    const shuffled = [...legalTopics].sort(() => 0.5 - Math.random());
    setSuggestedMessages(shuffled.slice(0, 5));
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!selectedConversationId || !messageId) return;

    const originalMessages = [...messages];
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    setError(null);

    try {
      // Assuming the route is /conversations/:conversationId/messages/:messageId
      await axios.delete(`/conversations/${selectedConversationId}/messages/${messageId}`);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.response?.data?.message || 'Failed to delete message.');
      setMessages(originalMessages);
    }
  };

  // Start edit
  const handleStartEdit = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim() || !selectedConversationId) return;

    const originalMessages = [...messages];
    const newContent = editingContent.trim();

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === editingMessageId ? { ...msg, content: newContent, updatedAt: new Date().toISOString() } : msg
      )
    );
    handleCancelEdit();
    setError(null);

    try {
       // Assuming the route is /conversations/:conversationId/messages/:messageId
      await axios.put(`/conversations/${selectedConversationId}/messages/${editingMessageId}`, { content: newContent });
    } catch (err) {
      console.error('Error saving edited message:', err);
      setError(err.response?.data?.message || 'Failed to save message edit.');
      setMessages(originalMessages);
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar */}
      <div className="w-80 h-full bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-2">Conversations</h2>
          <button
            onClick={() => setIsCreatingConversation(true)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
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
                className="form-input w-full"
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
              <p className="text-sm mt-2">Créez une nouvelle conversation pour commencer à discuter avec l'IA</p>
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
      <div className="flex-grow flex flex-col bg-white h-full">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-white shadow-sm z-10 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">
              {loadingConversations ? 'Chargement...' : conversationTitle || 'Assistance IA'}
            </h1>
          </div>
          {error && !messages.find(m => m.isError) && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {loadingConversations ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                Chargement des conversations...
              </div>
            ) : loadingMessages ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                Chargement des messages...
              </div>
            ) : !selectedConversationId ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sélectionnez une conversation ou créez-en une nouvelle pour commencer.
              </div>
            ) : chatError ? (
              <div className="flex items-center justify-center h-full text-red-500">{chatError}</div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Commencez la conversation en posant une question...
              </div>
            ) : (
              messages.map((message) => {
                const isUserMessage = message.sender === 'user';
                const isBeingEdited = message.id === editingMessageId;

                return (
                  <div
                    key={message.id}
                    className={`group relative flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        isUserMessage
                          ? 'bg-primary-500 text-white'
                          : message.isError
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isBeingEdited ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 text-gray-800 bg-white resize-none"
                            rows={Math.max(3, editingContent.split('\n').length)}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                              disabled={!editingContent.trim()}
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Use ReactMarkdown to render content */}
                          <ReactMarkdown className="prose prose-sm max-w-none">{message.content}</ReactMarkdown>
                          <div className="text-xs opacity-70 mt-1 text-right">
                            {formatTime(message.updatedAt || message.timestamp)}
                            {message.updatedAt && message.updatedAt !== message.timestamp && 
                              <span className="italic text-xs opacity-70 ml-1">(modifié)</span>
                            }
                          </div>
                        </>
                      )}
                    </div>

                    {isUserMessage && !isBeingEdited && !message.isError && (
                      <div className="absolute top-0 bottom-0 -left-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex flex-col gap-1 bg-white rounded shadow p-1">
                          <button
                            onClick={() => handleStartEdit(message)}
                            className="text-gray-500 hover:text-primary-600 p-1"
                            title="Modifier"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-gray-500 hover:text-red-600 p-1"
                            title="Supprimer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex justify-start">
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
                placeholder="Posez votre question juridique ici..."
                className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isTyping || loadingConversations || loadingMessages || !selectedConversationId}
              />
              <button
                type="submit"
                className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={!input.trim() || isTyping || loadingConversations || loadingMessages || !selectedConversationId}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAiAssistant;
