import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

const AiAssistant = () => {
  const { projectId, chatId } = useParams();
  const isProjectMode = !!projectId;
  const currentId = projectId || chatId;
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

    if (projectId) {
      fetchOrCreateProjectChat();
    }
  }, [projectId]);
  
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
      <div className="flex-grow flex flex-col bg-white h-full border-r">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-white shadow-sm z-10 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">
              {isLoadingProjectChat ? 'Chargement...' : projectTitle || `Projet ${projectId}`}
            </h1>
          </div>
          {error && !messages.find(m => m.isError) && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-grow flex flex-col overflow-hidden">
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
                disabled={isTyping || isLoadingProjectChat || loadingMessages || !projectChatId}
              />
              <button
                type="submit"
                className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={!input.trim() || isTyping || isLoadingProjectChat || loadingMessages || !projectChatId}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Documents) */}
      {isProjectMode && (
        <div className="w-80 flex-shrink-0 border-l bg-gray-50 flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Documents du Projet</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {loadingDocuments ? (
              <div className="text-center text-gray-500">Chargement des documents...</div>
            ) : documents.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">Aucun document dans ce projet.</div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="bg-white p-3 rounded shadow-sm border flex items-start space-x-3">
                  <span className="text-xl mt-1">{getFileIcon(doc.fileType)}</span>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-medium truncate" title={doc.fileName}>{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                    <p className="text-xs text-gray-400">Ajouté le: {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {/* Add download/view buttons if needed */}
                </div>
              ))
            )}
          </div>
          <div className="flex-shrink-0 p-4 border-t bg-gray-100">
            <form onSubmit={handleUploadDocument}>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="file-upload">
                Ajouter un document
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Fichier sélectionné: {selectedFile.name}
                </div>
              )}
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="mt-3 w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isUploading ? `Upload en cours... ${uploadProgress}%` : 'Uploader le document'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
