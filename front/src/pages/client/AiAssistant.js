import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AiAssistant = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Load initial messages and documents
    const fetchInitialData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock documents
        const mockDocuments = [
          { 
            id: 1, 
            fileName: 'Contrat de bail.pdf', 
            fileType: 'application/pdf', 
            uploadedAt: '2025-03-20T14:30:00Z'
          },
          { 
            id: 2, 
            fileName: 'Facture électricité.pdf', 
            fileType: 'application/pdf', 
            uploadedAt: '2025-03-18T10:15:00Z'
          },
          { 
            id: 3, 
            fileName: 'Lettre de mise en demeure.docx', 
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            uploadedAt: '2025-03-15T09:45:00Z'
          }
        ];
        
        // Mock initial message
        const initialMessages = [
          {
            id: 1,
            sender: 'ai',
            content: 'Bonjour ! Je suis votre assistant juridique IA. Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date().toISOString()
          }
        ];
        
        setDocuments(mockDocuments);
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      document: selectedDocument
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedDocument(null);
    setLoading(true);
    setIsTyping(true);
    
    // Simulate AI response
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate AI response based on user input
      let aiResponse = '';
      
      if (input.toLowerCase().includes('bail') || (selectedDocument && selectedDocument.fileName.includes('bail'))) {
        aiResponse = "D'après mon analyse, votre contrat de bail est soumis à la loi du 6 juillet 1989. Voici quelques points importants à noter :\n\n1. Le préavis de départ pour le locataire est de 1 mois en zone tendue et 3 mois ailleurs.\n2. Le dépôt de garantie ne peut excéder 1 mois de loyer hors charges.\n3. Le propriétaire doit fournir un logement décent et effectuer les réparations nécessaires.\n\nAvez-vous une question spécifique concernant votre bail ?";
      } else if (input.toLowerCase().includes('licenciement')) {
        aiResponse = "Concernant le licenciement, plusieurs éléments sont à prendre en compte :\n\n1. Un licenciement doit être justifié par une cause réelle et sérieuse.\n2. La procédure doit respecter certaines étapes : convocation à un entretien préalable, entretien, notification du licenciement.\n3. Les indemnités dépendent de votre ancienneté et du motif du licenciement.\n\nPour vous conseiller plus précisément, pourriez-vous me donner plus de détails sur votre situation ?";
      } else if (input.toLowerCase().includes('voisinage') || input.toLowerCase().includes('bruit')) {
        aiResponse = "Les troubles de voisinage sont encadrés par plusieurs textes :\n\n1. L'article R. 1336-5 du Code de la santé publique concernant les bruits de nature à porter atteinte à la tranquillité du voisinage.\n2. L'article 544 du Code civil sur le droit de propriété.\n\nJe vous conseille de :\n1. Dialoguer avec votre voisin\n2. Envoyer un courrier recommandé\n3. Faire appel à un conciliateur de justice\n4. En dernier recours, saisir le tribunal\n\nSouhaitez-vous que je vous aide à rédiger un courrier de mise en demeure ?";
      } else {
        aiResponse = "Merci pour votre question. Pour vous apporter une réponse précise, j'aurais besoin de quelques informations supplémentaires :\n\n1. Quel est le contexte juridique exact de votre situation ?\n2. Avez-vous des documents pertinents que vous pourriez partager ?\n3. Quelles démarches avez-vous déjà entreprises ?\n\nCes détails me permettront de vous fournir des conseils plus adaptés à votre situation.";
      }
      
      // Add AI response
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        sender: 'ai',
        content: "Désolé, j'ai rencontré un problème lors du traitement de votre demande. Veuillez réessayer.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };
  
  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('word')) {
      return '📝';
    } else if (fileType.includes('image')) {
      return '🖼️';
    } else {
      return '📁';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <h1 className="text-2xl font-bold mb-4">Assistant juridique IA</h1>
      
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Chat area */}
        <div className="flex-grow flex flex-col bg-white rounded-lg shadow overflow-hidden">
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3/4 rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-primary-100 text-primary-900'
                        : message.isError
                        ? 'bg-danger-100 text-danger-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.document && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 flex items-center">
                        <span className="text-xl mr-2">
                          {getFileIcon(message.document.fileType)}
                        </span>
                        <span className="text-sm text-gray-700 truncate">
                          {message.document.fileName}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="border-t p-4">
            {selectedDocument && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-2">
                    {getFileIcon(selectedDocument.fileType)}
                  </span>
                  <span className="text-sm font-medium">
                    {selectedDocument.fileName}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question juridique..."
                className="form-input flex-grow"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn-primary ml-2"
                disabled={!input.trim() || loading}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
        
        {/* Documents sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Mes documents</h2>
          
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((document) => (
                <button
                  key={document.id}
                  onClick={() => handleDocumentSelect(document)}
                  className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center"
                >
                  <span className="text-xl mr-2">
                    {getFileIcon(document.fileType)}
                  </span>
                  <span className="text-sm truncate">
                    {document.fileName}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Aucun document disponible. Ajoutez des documents dans la section "Documents".
            </p>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Conseils</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Posez des questions précises pour obtenir des réponses plus pertinentes.</li>
              <li>• Joignez des documents pour une analyse contextuelle.</li>
              <li>• L'IA peut vous aider à comprendre des concepts juridiques, mais ne remplace pas un avocat.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
