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
            fileName: 'Code civil.pdf', 
            fileType: 'application/pdf', 
            uploadedAt: '2025-03-20T14:30:00Z'
          },
          { 
            id: 2, 
            fileName: 'Code du travail.pdf', 
            fileType: 'application/pdf', 
            uploadedAt: '2025-03-18T10:15:00Z'
          },
          { 
            id: 3, 
            fileName: 'Jurisprudence récente.docx', 
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            uploadedAt: '2025-03-15T09:45:00Z'
          }
        ];
        
        // Mock initial message
        const initialMessages = [
          {
            id: 1,
            sender: 'ai',
            content: 'Bonjour ! Je suis votre assistant juridique IA. Comment puis-je vous aider dans vos recherches juridiques aujourd\'hui ?',
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
      
      if (input.toLowerCase().includes('code civil') || (selectedDocument && selectedDocument.fileName.includes('Code civil'))) {
        aiResponse = "Le Code civil français est organisé en 5 livres :\n\n1. Livre Ier : Des personnes (art. 7 à 515)\n2. Livre II : Des biens et des différentes modifications de la propriété (art. 516 à 710)\n3. Livre III : Des différentes manières dont on acquiert la propriété (art. 711 à 2278)\n4. Livre IV : Des sûretés (art. 2284 à 2488)\n5. Livre V : Dispositions applicables à Mayotte (art. 2489 à 2534)\n\nQuelle partie du Code civil vous intéresse particulièrement ?";
      } else if (input.toLowerCase().includes('licenciement') || input.toLowerCase().includes('code du travail')) {
        aiResponse = "Concernant le licenciement en droit français, voici les principaux points à retenir :\n\n1. Le licenciement doit être justifié par une cause réelle et sérieuse (art. L1232-1 du Code du travail)\n2. Procédure à respecter : convocation à un entretien préalable, entretien, notification du licenciement\n3. Préavis variable selon l'ancienneté (sauf faute grave ou lourde)\n4. Indemnités légales de licenciement pour les salariés ayant au moins 8 mois d'ancienneté\n\nLa jurisprudence récente de la Cour de cassation tend à renforcer le contrôle du motif économique et à sanctionner les vices de procédure. Souhaitez-vous des informations plus précises sur un aspect particulier ?";
      } else if (input.toLowerCase().includes('bail') || input.toLowerCase().includes('loyer')) {
        aiResponse = "En matière de bail d'habitation, la loi du 6 juillet 1989 est le texte de référence. Points essentiels :\n\n1. Durée minimale : 3 ans pour un bailleur personne physique, 6 ans pour une personne morale\n2. Dépôt de garantie limité à 1 mois de loyer hors charges\n3. Préavis du locataire : 1 mois en zone tendue, 3 mois ailleurs (avec exceptions)\n4. Encadrement des loyers dans certaines zones\n\nLa jurisprudence récente de la Cour de cassation (arrêt du 7 février 2024) a précisé les conditions de validité de la clause résolutoire. Avez-vous une question spécifique sur ce sujet ?";
      } else {
        aiResponse = "Votre question touche à un domaine juridique intéressant. Pour vous apporter une réponse précise et adaptée à votre contexte professionnel, j'aurais besoin de quelques précisions :\n\n1. Dans quel cadre juridique exact s'inscrit votre recherche ?\n2. Y a-t-il des textes de loi ou de la jurisprudence spécifique que vous souhaitez analyser ?\n3. S'agit-il d'une question liée à un dossier client en particulier ?\n\nCes informations me permettront de vous fournir une analyse juridique plus pertinente et applicable à votre situation.";
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
          <h2 className="text-lg font-semibold mb-4">Ressources juridiques</h2>
          
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
            <h3 className="text-sm font-medium mb-2">Suggestions de recherche</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setInput("Quelles sont les dernières évolutions jurisprudentielles en matière de licenciement économique ?")}
                className="w-full text-left p-2 text-sm text-primary-600 hover:bg-gray-50 rounded"
              >
                Jurisprudence récente sur le licenciement économique
              </button>
              <button 
                onClick={() => setInput("Pouvez-vous m'expliquer les obligations du bailleur concernant les réparations locatives ?")}
                className="w-full text-left p-2 text-sm text-primary-600 hover:bg-gray-50 rounded"
              >
                Obligations du bailleur - réparations
              </button>
              <button 
                onClick={() => setInput("Quelles sont les conditions de validité d'une clause de non-concurrence ?")}
                className="w-full text-left p-2 text-sm text-primary-600 hover:bg-gray-50 rounded"
              >
                Clause de non-concurrence
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Conseils</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Posez des questions précises pour obtenir des réponses plus pertinentes.</li>
              <li>• Joignez des documents pour une analyse contextuelle.</li>
              <li>• Utilisez l'IA pour préparer vos recherches juridiques et gagner du temps.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
