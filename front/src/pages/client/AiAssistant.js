import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

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
        } else {
          const createResponse = await axios.post('/chats', {
            projectId: projectId,
            title: `Conversation Projet ${projectId}`
          });
          const newChat = createResponse.data;
          if (newChat && newChat.id) {
            setProjectChatId(newChat.id);
            setProjectTitle(newChat.title);
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
  
  // Fetch messages
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
        setMessages(response.data.messages || []);
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
            {projectChatId && !isTyping && suggestedMessages.length > 0 && (
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
                  placeholder={projectChatId ? "Posez votre question ici..." : "Chargement de la conversation..."}
                  className="form-input flex-grow rounded-full px-4 py-2 border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  disabled={!projectChatId || isTyping || loadingMessages}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 flex items-center justify-center"
                  disabled={!input.trim() || isTyping || !projectChatId || loadingMessages}
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

      {/* Documents Sidebar */}
      {isProjectMode && (
        <div className="w-80 h-full bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <span className="mr-2">📁</span>
              Documents du dossier
            </h2>
          </div>

          {/* Upload form */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-2">Ajouter un document</h3>
            <form onSubmit={handleUploadDocument} className="space-y-2">
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  id="document"
                  onChange={handleFileChange}
                  className="form-input text-sm"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  disabled={isUploading}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm py-1 px-3 rounded"
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
              
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}% téléchargé</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Formats acceptés: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG
              </p>
            </form>
          </div>
          
          {/* Documents list */}
          <div className="flex-grow overflow-y-auto">
            {loadingDocuments ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Aucun document dans ce dossier</p>
                <p className="text-sm mt-2">Ajoutez des documents pour enrichir le contexte de vos conversations avec l'IA</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {documents.map(doc => (
                  <li key={doc.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getFileIcon(doc.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
