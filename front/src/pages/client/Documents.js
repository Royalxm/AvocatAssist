import React, { useState, useEffect } from 'react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchDocuments = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockDocuments = [
          { 
            id: 1, 
            fileName: 'Contrat de bail.pdf', 
            fileType: 'application/pdf', 
            fileSize: 2500000, 
            uploadedAt: '2025-03-20T14:30:00Z',
            extractedText: 'Contrat de bail entre...'
          },
          { 
            id: 2, 
            fileName: 'Facture électricité.pdf', 
            fileType: 'application/pdf', 
            fileSize: 1200000, 
            uploadedAt: '2025-03-18T10:15:00Z',
            extractedText: 'Facture d\'électricité du mois de...'
          },
          { 
            id: 3, 
            fileName: 'Lettre de mise en demeure.docx', 
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            fileSize: 350000, 
            uploadedAt: '2025-03-15T09:45:00Z',
            extractedText: 'Lettre de mise en demeure concernant...'
          },
          { 
            id: 4, 
            fileName: 'Attestation d\'assurance.pdf', 
            fileType: 'application/pdf', 
            fileSize: 980000, 
            uploadedAt: '2025-03-10T16:20:00Z',
            extractedText: 'Attestation d\'assurance habitation...'
          },
          { 
            id: 5, 
            fileName: 'Contrat de travail.pdf', 
            fileType: 'application/pdf', 
            fileSize: 1800000, 
            uploadedAt: '2025-03-05T11:30:00Z',
            extractedText: 'Contrat de travail à durée indéterminée...'
          }
        ];
        
        setDocuments(mockDocuments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add the new document to the list
    const newDocument = {
      id: documents.length + 1,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
      uploadedAt: new Date().toISOString(),
      extractedText: 'Texte extrait du document...'
    };
    
    setDocuments([newDocument, ...documents]);
    setSelectedFile(null);
    setIsUploading(false);
    clearInterval(interval);
  };
  
  const handleDelete = (id) => {
    // In a real app, this would call the API to delete the document
    setDocuments(documents.filter(doc => doc.id !== id));
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
  
  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes documents</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Rechercher un document..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Upload section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Ajouter un document</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="document"
              onChange={handleFileChange}
              className="form-input"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              disabled={isUploading}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Téléchargement...' : 'Télécharger'}
            </button>
          </div>
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-sm text-gray-500 mt-1">{uploadProgress}% téléchargé</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Formats acceptés: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG. Taille maximale: 10MB.
          </p>
        </form>
      </div>
      
      {/* Documents list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold">Documents ({filteredDocuments.length})</h2>
        </div>
        
        {filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(doc.fileType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {doc.extractedText.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Voir
                      </button>
                      <button 
                        className="text-danger-600 hover:text-danger-900"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'Aucun document ne correspond à votre recherche.' : 'Aucun document trouvé. Ajoutez votre premier document ci-dessus.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
