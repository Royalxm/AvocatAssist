import React, { useState, useEffect } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    creditBalance: 0
  });
  
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate loading
    const fetchUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockUsers = [
          {
            id: 1,
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            role: 'client',
            status: 'active',
            creditBalance: 0,
            registeredAt: '2025-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Marie Martin',
            email: 'marie.martin@example.com',
            role: 'client',
            status: 'active',
            creditBalance: 50,
            registeredAt: '2025-02-20T14:15:00Z'
          },
          {
            id: 3,
            name: 'Sophie Lefebvre',
            email: 'sophie.lefebvre@example.com',
            role: 'lawyer',
            status: 'active',
            creditBalance: 150,
            registeredAt: '2025-01-10T09:45:00Z',
            specialties: 'Droit du travail, Droit immobilier',
            baseRate: 150
          },
          {
            id: 4,
            name: 'Thomas Dubois',
            email: 'thomas.dubois@example.com',
            role: 'lawyer',
            status: 'active',
            creditBalance: 200,
            registeredAt: '2025-02-05T11:20:00Z',
            specialties: 'Droit de la famille, Droit des affaires',
            baseRate: 180
          },
          {
            id: 5,
            name: 'Philippe Moreau',
            email: 'philippe.moreau@example.com',
            role: 'lawyer',
            status: 'pending',
            creditBalance: 0,
            registeredAt: '2025-03-19T11:10:00Z',
            specialties: 'Droit pénal, Droit de la consommation',
            baseRate: 160
          },
          {
            id: 6,
            name: 'Isabelle Petit',
            email: 'isabelle.petit@example.com',
            role: 'client',
            status: 'inactive',
            creditBalance: 0,
            registeredAt: '2025-01-05T16:40:00Z'
          },
          {
            id: 7,
            name: 'Pierre Lambert',
            email: 'pierre.lambert@example.com',
            role: 'support',
            status: 'active',
            creditBalance: 0,
            registeredAt: '2025-01-02T08:30:00Z'
          }
        ];
        
        setUsers(mockUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  useEffect(() => {
    // Update edit form when selected user changes
    if (selectedUser) {
      setEditForm({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status,
        creditBalance: selectedUser.creditBalance,
        specialties: selectedUser.specialties || '',
        baseRate: selectedUser.baseRate || 0
      });
    }
  }, [selectedUser]);
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveUser = () => {
    // In a real app, this would call the API to update the user
    // For now, we'll just update the local state
    
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, ...editForm } 
        : user
    );
    
    setUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUser(null);
  };
  
  const handleDeleteUser = () => {
    // In a real app, this would call the API to delete the user
    // For now, we'll just update the local state
    
    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    
    setUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUser(null);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getRoleBadge = (role) => {
    switch (role) {
      case 'client':
        return <span className="badge badge-info">Client</span>;
      case 'lawyer':
        return <span className="badge badge-primary">Avocat</span>;
      case 'support':
        return <span className="badge badge-warning">Support</span>;
      case 'manager':
        return <span className="badge badge-success">Manager</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Actif</span>;
      case 'inactive':
        return <span className="badge badge-danger">Inactif</span>;
      case 'pending':
        return <span className="badge badge-warning">En attente</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  const filteredUsers = users.filter(user => {
    // Filter by role
    if (filter !== 'all' && user.role !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

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
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <button className="btn-primary">
          Ajouter un utilisateur
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="form-input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('client')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'client'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setFilter('lawyer')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'lawyer'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Avocats
            </button>
            <button
              onClick={() => setFilter('support')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'support'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Support
            </button>
          </div>
        </div>
      </div>
      
      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solde
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                    {user.role === 'lawyer' && user.specialties && (
                      <div className="text-xs text-gray-500 mt-1">{user.specialties}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.registeredAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.creditBalance} crédits
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Aucun utilisateur trouvé pour les filtres sélectionnés.
          </div>
        )}
      </div>
      
      {/* Edit user modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Modifier l'utilisateur</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Nom</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="role" className="form-label">Rôle</label>
                    <select
                      id="role"
                      name="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="client">Client</option>
                      <option value="lawyer">Avocat</option>
                      <option value="support">Support</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">Statut</label>
                    <select
                      id="status"
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="pending">En attente</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="creditBalance" className="form-label">Solde de crédits</label>
                  <input
                    type="number"
                    id="creditBalance"
                    name="creditBalance"
                    value={editForm.creditBalance}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                  />
                </div>
                
                {editForm.role === 'lawyer' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="specialties" className="form-label">Spécialités</label>
                      <input
                        type="text"
                        id="specialties"
                        name="specialties"
                        value={editForm.specialties}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Ex: Droit du travail, Droit immobilier"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="baseRate" className="form-label">Tarif horaire de base (€)</label>
                      <input
                        type="number"
                        id="baseRate"
                        name="baseRate"
                        value={editForm.baseRate}
                        onChange={handleInputChange}
                        className="form-input"
                        min="0"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleDeleteUser}
                    className="btn-danger"
                  >
                    Supprimer l'utilisateur
                  </button>
                  
                  <div className="space-x-3">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                      }}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    
                    <button
                      onClick={handleSaveUser}
                      className="btn-primary"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
