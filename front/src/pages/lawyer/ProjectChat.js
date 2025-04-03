import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api'; // Corrected import
import ReactMarkdown from 'react-markdown';

// Renamed component
const LawyerProjectChat = () => {
  const { projectId } = useParams(); // Use projectId from URL
  const { currentUser } = useAuth();

  // Document state
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Chat state
  const [projectChatId, setProjectChatId] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [isLoadingProjectChat, setIsLoadingProjectChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [chatError, setChatError] = useState(null);

  // Suggested messages (Adapted for lawyer)
  const defaultSuggestions = [
    "Analyser les points forts et faibles de ce dossier.",
    "Quelles sont les prochaines étapes procédurales ?",
    "Rédiger un projet de conclusions basé sur les documents.",
    "Identifier les jurisprudences pertinentes pour ce cas.",
    "Quels arguments pourrions-nous opposer ?"
  ];
  const [suggestedMessages, setSuggestedMessages] = useState(defaultSuggestions);

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const messagesEndRef = useRef(null);

  // Fetch chat for project (Uses generic endpoint)
  useEffect(() => {
    const fetchOrCreateProjectChat = async () => {
      if (!projectId) {
        setChatError("ID du dossier (projet) manquant dans l'URL.");
        setIsLoadingProjectChat(false);
        return;
      }

      setIsLoadingProjectChat(true);
      setChatError(null);
      setMessages([]);
      setProjectChatId(null);

      try {
        // Use api
        const response = await api.get(`/chats?projectId=${projectId}`);
        const existingChats = response.data;

        if (existingChats && existingChats.length > 0) {
          setProjectChatId(existingChats[0].id);
          setProjectTitle(existingChats[0].title || `Dossier ${projectId}`);
          if (existingChats[0].lastSuggestedQuestions && existingChats[0].lastSuggestedQuestions.length > 0) {
            setSuggestedMessages(existingChats[0].lastSuggestedQuestions);
          } else {
            setSuggestedMessages(defaultSuggestions);
          }
        } else {
          // Use api
          const createResponse = await api.post('/chats', {
            projectId: projectId,
            title: `Conversation Dossier ${projectId}` // Title for lawyer
          });
          const newChat = createResponse.data;
          if (newChat && newChat.id) {
            setProjectChatId(newChat.id);
            setProjectTitle(newChat.title);
            setSuggestedMessages(defaultSuggestions);
          } else {
            throw new Error('Failed to create chat for the project.');
          }
        }
      } catch (err) {
        console.error('Error fetching or creating project chat:', err);
        setChatError(err.response?.data?.message || 'Impossible de charger ou créer la conversation pour ce dossier.');
      } finally {
        setIsLoadingProjectChat(false);
      }
    };

    fetchOrCreateProjectChat();
  }, [projectId]);

  // Fetch messages (Uses generic endpoint)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!projectChatId) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      setChatError(null);
      setError(null);
      try {
        // Use api
        const response = await api.get(`/chats/${projectChatId}`);
        const chatData = response.data;
        setMessages(chatData.messages || []);

        if (chatData.lastSuggestedQuestions && chatData.lastSuggestedQuestions.length > 0) {
          setSuggestedMessages(chatData.lastSuggestedQuestions);
        } else {
          if (chatData.messages && chatData.messages.length > 0) {
             generateFallbackSuggestions();
          } else {
             setSuggestedMessages(defaultSuggestions);
          }
        }

      } catch (err) {
        console.error(`Error fetching messages for chat ${projectChatId}:`, err);
        setChatError(err.response?.data?.message || `Failed to load messages for conversation.`);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    if (projectChatId) {
      fetchMessages();
    }
  }, [projectChatId]);

  // Fetch documents (Uses generic endpoint)
  useEffect(() => {
    const fetchProjectDocuments = async () => {
      if (!projectId) return;
      setLoadingDocuments(true);
      try {
        // Use api
        const response = await api.get(`/documents?projectId=${projectId}`);
        setDocuments(response.data.documents || []);
      } catch (err) {
        console.error('Error fetching project documents:', err);
        setError(err.response?.data?.message || "Erreur lors de la récupération des documents.");
      } finally {
        setLoadingDocuments(false);
      }
    };
    fetchProjectDocuments();
  }, [projectId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message (Uses generic /ai/ask endpoint)
  const handleSendMessage = async (e, suggestedMessage = null) => {
    if (e) e.preventDefault();
    if (!projectChatId) return;

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
        chatId: projectChatId, // Send chatId for project context
      };

      // Use api
      const response = await api.post('/ai/ask', payload);
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
          const finalUserMessage = { ...userMessage, id: userMessage.id.startsWith('temp-') ? `user-${Date.now()}` : userMessage.id };
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate fallback suggestions (Adapted for lawyer)
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

  // Handle file change
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload document (Uses generic endpoint)
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile || !projectId) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('projectId', projectId);

    try {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Use api
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (response.data.success) {
        const newDocument = response.data.document;
        setDocuments(prev => [newDocument, ...prev]);

        const systemMessage = {
          id: `system-${Date.now()}`,
          sender: 'ai', // System message displayed as AI
          content: `Document "${newDocument.fileName}" ajouté au dossier. L'IA peut maintenant l'utiliser comme contexte.`,
          timestamp: new Date().toISOString(),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.response?.data?.message || "Erreur lors de l'upload du document.");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (!fileType) return '📁';
    if (fileType.includes('pdf')) return '📄';
    else if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    else if (fileType.includes('image')) return '🖼️';
    else if (fileType.includes('text')) return '📃';
    else return '📁';
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Delete message (Uses generic endpoint)
  const handleDeleteMessage = async (messageId) => {
    if (!projectChatId || !messageId) return;
    const originalMessages = [...messages];
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    setError(null);
    try {
      // Use api
      await api.delete(`/chats/${projectChatId}/messages/${messageId}`);
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

  // Save edit (Uses generic endpoint)
  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim() || !projectChatId) return;
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
      // Use api
      await api.put(`/chats/${projectChatId}/messages/${editingMessageId}`, { content: newContent });
    } catch (err) {
      console.error('Error saving edited message:', err);
      setError(err.response?.data?.message || 'Failed to save message edit.');
      setMessages(originalMessages);
    }
  };

  // JSX Structure (remains largely the same, minor text changes)
  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white border-r overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-primary-600 to-primary-700 shadow-md z-10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-xl font-bold text-white">
                {isLoadingProjectChat ? 'Chargement...' : projectTitle || `Dossier ${projectId}`}
              </h1>
            </div>
            {/* Removed client-specific button, can add lawyer actions later */}
            {/* <button
              onClick={() => window.location.href = `/client/legal-requests/create?projectId=${projectId}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-100 text-primary-700 rounded-lg text-sm transition-colors shadow-sm font-medium"
            > ... </button> */}
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

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {isLoadingProjectChat ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                Chargement de la conversation du dossier...
              </div>
            ) : loadingMessages ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                Chargement des messages...
              </div>
            ) : !projectChatId && !chatError ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Impossible de charger la conversation pour ce dossier.
              </div>
            ) : chatError ? (
              <div className="flex items-center justify-center h-full text-red-500">{chatError}</div>
            ) : messages.length === 0 && !isTyping ? ( // Added !isTyping condition
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-lg mb-2">Commencez la conversation sur ce dossier...</span>
                 <p className="text-sm text-center max-w-md">
                  Posez des questions à l'IA sur ce dossier, en utilisant les documents ajoutés comme contexte.
                </p>
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
                     {!isUserMessage && !message.isSystem && ( // Icon for AI messages only
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
                          : message.isSystem // Style for system messages
                          ? 'bg-blue-50 text-blue-800 border border-blue-100 w-full text-center italic'
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
                          <ReactMarkdown
                             className={`prose prose-sm max-w-none ${
                                isUserMessage ? 'prose-invert' : ''
                              } break-words`}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {!message.isSystem && ( // Hide timestamp for system messages
                            <div className="text-xs opacity-70 mt-1 text-right">
                              {formatTime(message.updatedAt || message.timestamp)}
                              {message.updatedAt && message.updatedAt !== message.timestamp &&
                                <span className="italic text-xs opacity-70 ml-1">(modifié)</span>
                              }
                            </div>
                          )}
                        </>
                      )}
                    </div>
                     {/* Edit/Delete buttons for user messages */}
                     {isUserMessage && !isBeingEdited && (
                        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1">
                          <button onClick={() => handleStartEdit(message)} className="text-gray-400 hover:text-gray-600 p-0.5 bg-white rounded shadow">✏️</button>
                          <button onClick={() => handleDeleteMessage(message.id)} className="text-gray-400 hover:text-red-500 p-0.5 bg-white rounded shadow">🗑️</button>
                        </div>
                      )}
                  </div>
                );
              })
            )}
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
              placeholder="Posez une question sur ce dossier..."
              className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isTyping || isLoadingProjectChat || loadingMessages || !projectChatId}
            />
            <button
              type="submit"
              className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isTyping || !input.trim() || isLoadingProjectChat || loadingMessages || !projectChatId}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Documents Sidebar */}
      <div className="w-96 h-full bg-gray-50 border-l flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Documents du Dossier</h2>
        </div>

        {/* Upload Form */}
        <div className="p-4 border-b">
          <form onSubmit={handleUploadDocument}>
            <label className="block mb-2 text-sm font-medium text-gray-700">Ajouter un document</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
              disabled={isUploading}
            />
            {selectedFile && !isUploading && (
              <button
                type="submit"
                className="mt-2 w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              >
                Uploader "{selectedFile.name}"
              </button>
            )}
            {isUploading && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </form>
        </div>

        {/* Document List */}
        <div className="flex-grow overflow-y-auto p-4">
          {loadingDocuments ? (
            <div className="text-center text-gray-500">Chargement des documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-gray-500">Aucun document dans ce dossier.</div>
          ) : (
            <ul className="space-y-2">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center p-2 bg-white rounded shadow-sm border border-gray-200">
                  <span className="text-xl mr-2">{getFileIcon(doc.fileType)}</span>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate" title={doc.fileName}>{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                  </div>
                  {/* Add download/delete buttons if needed */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the renamed component
export default LawyerProjectChat;