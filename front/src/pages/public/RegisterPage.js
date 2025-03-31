import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Vous devez accepter les conditions d\'utilisation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Remove confirmPassword and agreeTerms from data sent to API
      const { confirmPassword, agreeTerms, ...userData } = formData;
      
      await register(userData);
      // Redirect will happen automatically via AuthLayout
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific API errors
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('email')) {
          setErrors({
            ...errors,
            email: 'Cet email est déjà utilisé'
          });
        } else {
          setErrors({
            ...errors,
            form: error.response.data.message
          });
        }
      } else {
        setErrors({
          ...errors,
          form: 'Une erreur est survenue lors de l\'inscription'
        });
      }
    }
  };
  
  return (
    <div>
      <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Créez votre compte
      </h2>
      
      {errors.form && (
        <div className="mt-4 rounded-md bg-danger-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">{errors.form}</h3>
            </div>
          </div>
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
            Nom complet
          </label>
          <div className="mt-2">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.name ? 'ring-danger-600' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-danger-600">{errors.name}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Adresse email
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.email ? 'ring-danger-600' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-danger-600">{errors.email}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
            Mot de passe
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.password ? 'ring-danger-600' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-danger-600">{errors.password}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
            Confirmer le mot de passe
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.confirmPassword ? 'ring-danger-600' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-danger-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
            Je m'inscris en tant que
          </label>
          <div className="mt-2">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            >
              <option value="client">Client</option>
              <option value="lawyer">Avocat</option>
            </select>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {formData.role === 'lawyer' 
              ? 'En tant qu\'avocat, vous pourrez recevoir des demandes juridiques et proposer vos services.' 
              : 'En tant que client, vous pourrez poser des questions juridiques et recevoir des propositions d\'avocats.'}
          </p>
        </div>
        
        <div className="flex items-center">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 ${
              errors.agreeTerms ? 'border-danger-600' : ''
            }`}
          />
          <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
            J'accepte les{' '}
            <Link to="/terms" className="font-semibold text-primary-600 hover:text-primary-500">
              conditions d'utilisation
            </Link>{' '}
            et la{' '}
            <Link to="/privacy" className="font-semibold text-primary-600 hover:text-primary-500">
              politique de confidentialité
            </Link>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="mt-2 text-sm text-danger-600">{errors.agreeTerms}</p>
        )}
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-gray-500">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
          Connectez-vous
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
