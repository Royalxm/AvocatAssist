import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    
    // In a real app, this would call the API to update the profile
    // For now, we'll just simulate success
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }, 500);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-danger-50 text-danger-800' : 'bg-success-50 text-success-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Informations personnelles</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="btn-outline"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nom</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3">Changer le mot de passe</h3>
                
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{currentUser?.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{currentUser?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium">Client</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="font-medium">Mars 2025</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Préférences de notification</h2>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              className="form-checkbox"
              defaultChecked
            />
            <label htmlFor="emailNotifications" className="ml-2">
              Notifications par email
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="proposalNotifications"
              className="form-checkbox"
              defaultChecked
            />
            <label htmlFor="proposalNotifications" className="ml-2">
              Notifications de nouvelles propositions
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="marketingEmails"
              className="form-checkbox"
            />
            <label htmlFor="marketingEmails" className="ml-2">
              Emails marketing et promotions
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
