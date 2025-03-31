import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

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
  
  // Suggested messages
  const [suggestedMessages, setSuggestedMessages] = useState([
    "Quelles sont les étapes pour créer une entreprise en France ?",
    "Pouvez-vous m'expliquer les différents types de contrats de travail ?",
    "Quels sont mes droits en tant que locataire ?",
    "Comment protéger ma propriété intellectuelle ?",
    "Quelles sont les implications juridiques d'un divorce ?"
  ]);

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
        setConversations(response.data || []);
        
        // Select the first conversation if available
        if (response.data && response.data.length > 0) {
          setSelectedConversationId(response.data[0].id);
          setConversationTitle(response.data[0].title);
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
        return;
      }
      
      setLoadingMessages(true);
      setChatError(null);
      setError(null);
      
      try {
        const response = await axios.get(`/conversations/${selectedConversationId}`);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error(`Error fetching messages for conversation ${selectedConversationId}:`, err);
        setChatError(err.response?.data?.message || 'Impossible de charger les messages.');
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    if (selectedConversationId) {
      fetchMessages();
    }
  }, [selectedConversationId]);

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
      setConversations([newConversation, ...conversations]);
      setSelectedConversationId(newConversation.id);
      setConversationTitle(newConversation.title);
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
      const payload = {
        question: userMessageContent,
        conversationId: selectedConversationId,
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
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
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

          {/* Input area */}
          <div className="border-t border-gray-200 bg-white">
            {selectedConversationId && !isTyping && suggestedMessages.length > 0 && (
              <div className="p-3 flex flex-wrap gap-2 justify-center">
                {suggestedMessages.map((message, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(null, message)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-full transition-colors"
                  >
                    {message}
                  </button>
                ))}
              </div>
            )}
            
            <div className="p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedConversationId ? "Posez votre question ici..." : "Sélectionnez une conversation..."}
                  className="form-input flex-grow rounded-full px-4 py-2 border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  disabled={!selectedConversationId || isTyping || loadingMessages}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 flex items-center justify-center"
                  disabled={!input.trim() || isTyping || !selectedConversationId || loadingMessages}
                  aria-label="Envoyer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAiAssistant;
