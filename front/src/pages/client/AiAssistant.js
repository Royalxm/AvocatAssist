import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

const AiAssistant = () => {
  const { projectId, chatId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const legalRequestId = queryParams.get('legalRequestId');
  
  const isProjectMode = !!projectId;
  const isLegalRequestMode = !!legalRequestId;
  const currentId = projectId || chatId || legalRequestId;
  const { currentUser } = useAuth();
  
  // Legal request state
  const [legalRequest, setLegalRequest] = useState(null);
  const [loadingLegalRequest, setLoadingLegalRequest] = useState(false);

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

  const messagesEndRef = useRef(null);

  // Fetch legal request
  useEffect(() => {
    const fetchLegalRequest = async () => {
      if (!legalRequestId) return;
      
      setLoadingLegalRequest(true);
      setError(null);
      
      try {
        const response = await axios.get(`/legal-requests/${legalRequestId}`);
        setLegalRequest(response.data.request);
        
        // Also fetch documents related to this legal request
        try {
          const docsResponse = await axios.get(`/legal-requests/${legalRequestId}/documents`);
          setDocuments(docsResponse.data.documents || []);
        } catch (docErr) {
          console.error('Error fetching legal request documents:', docErr);
          // Don't set error here to avoid blocking the whole page
        }
        
        // Create or fetch a chat for this legal request
        await fetchOrCreateLegalRequestChat(legalRequestId, response.data.request);
        
      } catch (err) {
        console.error('Error fetching legal request:', err);
        setError(err.response?.data?.message || 'Impossible de charger la demande juridique.');
      } finally {
        setLoadingLegalRequest(false);
      }
    };
    
    if (isLegalRequestMode) {
      fetchLegalRequest();
    }
  }, [legalRequestId, isLegalRequestMode]);
  
  // Fetch or create chat for legal request
  const fetchOrCreateLegalRequestChat = async (requestId, requestData) => {
    setIsLoadingProjectChat(true);
    setChatError(null);
    setMessages([]);
    setProjectChatId(null);
    
    try {
      const response = await axios.get(`/chats?legalRequestId=${requestId}`);
      const existingChats = response.data;
      
      if (existingChats && existingChats.length > 0) {
        setProjectChatId(existingChats[0].id);
        setProjectTitle(existingChats[0].title || `Demande juridique #${requestId}`);
        
        // Set suggestions from the fetched chat data if available
        if (existingChats[0].lastSuggestedQuestions && existingChats[0].lastSuggestedQuestions.length > 0) {
          setSuggestedMessages(existingChats[0].lastSuggestedQuestions);
        } else {
          setSuggestedMessages(defaultSuggestions);
        }
      } else {
        const createResponse = await axios.post('/chats', {
          legalRequestId: requestId,
          title: requestData?.title ? `Demande: ${requestData.title}` : `Demande juridique #${requestId}`
        });
        
        const newChat = createResponse.data;
        if (newChat && newChat.id) {
          setProjectChatId(newChat.id);
          setProjectTitle(newChat.title);
          setSuggestedMessages(defaultSuggestions);
        } else {
          throw new Error('Failed to create chat for the legal request.');
        }
      }
    } catch (err) {
      console.error('Error fetching or creating legal request chat:', err);
      setChatError(err.response?.data?.message || 'Impossible de charger ou créer la conversation pour cette demande juridique.');
    } finally {
      setIsLoadingProjectChat(false);
    }
  };
  
  // Fetch chat for project
  useEffect(() => {
    const fetchOrCreateProjectChat = async () => {
      if (!projectId) {
        setChatError("ID du projet manquant dans l'URL.");
        setIsLoadingProjectChat(false);
        return;
      }

      setIsLoadingProjectChat(true);
      setChatError(null);
      setMessages([]);
      setProjectChatId(null);

      try {
        const response = await axios.get(`/chats?projectId=${projectId}`);
        const existingChats = response.data;

        if (existingChats && existingChats.length > 0) {
          setProjectChatId(existingChats[0].id);
          setProjectTitle(existingChats[0].title || `Projet ${projectId}`);
          // Set suggestions from the fetched chat data if available
          if (existingChats[0].lastSuggestedQuestions && existingChats[0].lastSuggestedQuestions.length > 0) {
            setSuggestedMessages(existingChats[0].lastSuggestedQuestions);
          } else {
            setSuggestedMessages(defaultSuggestions); // Reset to default if none saved
          }
        } else {
          const createResponse = await axios.post('/chats', {
            projectId: projectId,
            title: `Conversation Projet ${projectId}`
          });
          const newChat = createResponse.data;
          if (newChat && newChat.id) {
            setProjectChatId(newChat.id);
            setProjectTitle(newChat.title);
            setSuggestedMessages(defaultSuggestions); // Reset to default for new chat
          } else {
            throw new Error('Failed to create chat for the project.');
          }
        }
      } catch (err) {
        console.error('Error fetching or creating project chat:', err);
        setChatError(err.response?.data?.message || 'Impossible de charger ou créer la conversation pour ce projet.');
      } finally {
        setIsLoadingProjectChat(false);
      }
    };

    if (projectId && !isLegalRequestMode) {
      fetchOrCreateProjectChat();
    }
  }, [projectId, isLegalRequestMode]);

  // Fetch messages and potentially update suggestions
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
        const response = await axios.get(`/chats/${projectChatId}`);
        const chatData = response.data;
        setMessages(chatData.messages || []);

        // Update suggestions based on the latest fetched chat data
        if (chatData.lastSuggestedQuestions && chatData.lastSuggestedQuestions.length > 0) {
          setSuggestedMessages(chatData.lastSuggestedQuestions);
        } else {
          // Only generate fallback if there are messages, otherwise keep default
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

  // Fetch documents
  useEffect(() => {
    const fetchProjectDocuments = async () => {
      if (!projectId) return;

      setLoadingDocuments(true);

      try {
        const response = await axios.get(`/documents?projectId=${projectId}`);
        setDocuments(response.data.documents || []);
      } catch (err) {
        console.error('Error fetching project documents:', err);
        setError(err.response?.data?.message || "Erreur lors de la récupération des documents.");
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (isProjectMode) {
      fetchProjectDocuments();
    }
  }, [projectId, isProjectMode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
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
        chatId: projectChatId,
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

  // Handle file change
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload document
  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!selectedFile) return;
    if (!projectId && !legalRequestId) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Add the appropriate ID based on the mode
    if (isProjectMode) {
      formData.append('projectId', projectId);
    } else if (isLegalRequestMode) {
      formData.append('legalRequestId', legalRequestId);
    }

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

      const response = await axios.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (response.data.success) {
        const newDocument = response.data.document;
        setDocuments(prev => [newDocument, ...prev]);

        const systemMessage = {
          id: `system-${Date.now()}`,
          sender: 'ai',
          content: `Document "${newDocument.fileName}" ajouté au dossier. Vous pouvez maintenant me poser des questions à ce sujet.`,
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

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!projectChatId || !messageId) return;

    const originalMessages = [...messages];
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    setError(null);

    try {
      await axios.delete(`/chats/${projectChatId}/messages/${messageId}`);
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
      await axios.put(`/chats/${projectChatId}/messages/${editingMessageId}`, { content: newContent });
    } catch (err) {
      console.error('Error saving edited message:', err);
      setError(err.response?.data?.message || 'Failed to save message edit.');
      setMessages(originalMessages);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white border-r overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-primary-600 to-primary-700 shadow-md z-10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {isProjectMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              ) : isLegalRequestMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              )}
              <h1 className="text-xl font-bold text-white">
                {isLoadingProjectChat ? 'Chargement...' : 
                 isLegalRequestMode ? (legalRequest ? 
                   `${legalRequest.title || `Demande #${legalRequestId}`}` : 
                   `Demande juridique #${legalRequestId}`) : 
                 projectTitle || `Projet ${projectId}`}
              </h1>
            </div>
            {isLegalRequestMode && legalRequest && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${
                legalRequest.status === 'ouverte' ? 'bg-blue-100 text-blue-800' :
                legalRequest.status === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                legalRequest.status === 'fermée' ? 'bg-green-100 text-green-800' :
                'bg-white text-gray-800'
              }`}>
                {legalRequest.status || 'Non défini'}
              </span>
            )}
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

        {/* Messages Area - Takes remaining space and scrolls */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {isLoadingProjectChat ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                Chargement de la conversation du projet...
              </div>
            ) : loadingMessages ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                Chargement des messages...
              </div>
            ) : !projectChatId && !chatError ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Impossible de charger la conversation pour ce projet.
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
        </div> {/* End Messages Area */}

        {/* Input Wrapper - Fixed at the bottom */}
        <div className="flex-shrink-0 border-t bg-white">
          {/* Suggested Messages - Hidden */}
          {messages.length > 0 && !isTyping && suggestedMessages.length > 0 && (
            <div className="hidden flex-shrink-0 p-4 border-t"> {/* Added hidden class */}
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

          {/* Input Form Area */}
          <div className="p-4"> {/* Removed bg-white, border-t from here */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question juridique ici..."
                className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isTyping || isLoadingProjectChat || loadingMessages || !projectChatId}
              />
              <button
                type="submit"
                className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 disabled:opacity-50"
                disabled={!input.trim() || isTyping || isLoadingProjectChat || loadingMessages || !projectChatId}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>
        </div> {/* End Input Wrapper */}

      </div> {/* End Main Chat Area */}

      {/* Right Sidebar - Project Documents */}
      {isProjectMode && (
        <div className="w-80 flex-shrink-0 border-l bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b">
            <h2 className="text-lg font-semibold">Documents du Projet</h2>
          </div>

          {/* Upload Form */}
          <div className="flex-shrink-0 p-4 border-b">
            <form onSubmit={handleUploadDocument}>
              <input type="file" onChange={handleFileChange} className="mb-2 text-sm" />
              {selectedFile && (
                <div className="text-xs text-gray-500 mb-2">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
              <button type="submit" disabled={!selectedFile || isUploading} className="w-full text-sm bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 disabled:opacity-50">
                {isUploading ? 'Chargement...' : 'Ajouter le document'}
              </button>
            </form>
          </div>

          {/* Document List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {loadingDocuments ? (
              <p className="text-gray-500 text-sm">Chargement des documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun document dans ce projet.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="bg-white p-3 rounded shadow-sm border flex items-start space-x-2">
                  <span className="text-xl mt-0.5">{getFileIcon(doc.fileType)}</span>
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                    <p className="text-xs text-gray-400">Ajouté le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {/* Add download/delete buttons here if needed */}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Right Sidebar - Legal Request Details */}
      {isLegalRequestMode && (
        <div className="w-80 flex-shrink-0 border-l bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b">
            <h2 className="text-lg font-semibold">Détails de la demande</h2>
          </div>
          
          {loadingLegalRequest ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : !legalRequest ? (
            <div className="p-4 text-center text-gray-500">
              Impossible de charger les détails de la demande juridique.
            </div>
          ) : (
            <>
              {/* Legal Request Info */}
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-900 mb-2">{legalRequest.title || `Demande #${legalRequest.id}`}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    legalRequest.status === 'ouverte' ? 'bg-blue-100 text-blue-800' :
                    legalRequest.status === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                    legalRequest.status === 'fermée' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {legalRequest.status || 'Non défini'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Créée le {new Date(legalRequest.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {legalRequest.description}
                </div>
                
                <Link
                  to={`/client/legal-requests/${legalRequest.id}`}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Voir tous les détails
                </Link>
              </div>
              
              {/* AI Summary */}
              {legalRequest.summaryAI && (
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900">Résumé IA</h3>
                  </div>
                  <p className="text-sm text-gray-700">{legalRequest.summaryAI}</p>
                </div>
              )}
              
              {/* Upload Form */}
              <div className="flex-shrink-0 p-4 border-b">
                <form onSubmit={handleUploadDocument}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Ajouter un document</h3>
                  <input type="file" onChange={handleFileChange} className="mb-2 text-sm w-full" />
                  {selectedFile && (
                    <div className="text-xs text-gray-500 mb-2">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={!selectedFile || isUploading} 
                    className="w-full text-sm bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isUploading ? 'Chargement...' : 'Ajouter le document'}
                  </button>
                </form>
              </div>
              
              {/* Documents */}
              <div className="flex-shrink-0 p-4 border-b">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Documents associés</h3>
                
                <div className="space-y-3">
                  {loadingDocuments ? (
                    <p className="text-gray-500 text-sm">Chargement des documents...</p>
                  ) : documents.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun document associé à cette demande.</p>
                  ) : (
                    documents.map(doc => (
                      <div key={doc.id} className="bg-white p-2 rounded shadow-sm border flex items-start space-x-2">
                        <span className="text-lg">{getFileIcon(doc.fileType)}</span>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium truncate">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div> // End Top Level Flex Container
  );
};

export default AiAssistant;
