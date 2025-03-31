import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';
  
  // Set up axios interceptor for token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Set up axios response interceptor for error handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Handle 401 Unauthorized errors
          if (error.response.status === 401) {
            logout();
            toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          }
          
          // Handle other errors
          const errorMessage = error.response.data.message || 'Une erreur est survenue';
          setError(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          setError('Impossible de communiquer avec le serveur');
        } else {
          // Something happened in setting up the request
          setError('Une erreur est survenue lors de la requête');
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if token is valid and load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Check if token is expired
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token is expired
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Token is valid, get user data
        const response = await axios.get('/auth/me');
        setCurrentUser(response.data.user);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      }

      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      
      toast.success('Inscription réussie !');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', { email, password });
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      
      toast.success('Connexion réussie !');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email ou mot de passe incorrect';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    toast.info('Vous êtes déconnecté');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/users/${currentUser.id}`, userData);
      setCurrentUser(response.data.user);
      toast.success('Profil mis à jour avec succès');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/forgot-password', { email });
      toast.success('Si votre email est enregistré, vous recevrez un lien de réinitialisation');
      return response.data;
    } catch (err) {
      // Don't show error to prevent email enumeration
      toast.success('Si votre email est enregistré, vous recevrez un lien de réinitialisation');
      return { message: 'Email sent if registered' };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/reset-password', {
        token,
        newPassword
      });
      toast.success('Mot de passe réinitialisé avec succès');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!currentUser;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Check if user is admin (support or manager)
  const isAdmin = () => {
    if (!currentUser) return false;
    return ['support', 'manager'].includes(currentUser.role);
  };

  // Check if user is manager
  const isManager = () => {
    if (!currentUser) return false;
    return currentUser.role === 'manager';
  };

  // Check if user is lawyer
  const isLawyer = () => {
    if (!currentUser) return false;
    return currentUser.role === 'lawyer';
  };

  // Check if user is client
  const isClient = () => {
    if (!currentUser) return false;
    return currentUser.role === 'client';
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    hasRole,
    isAdmin,
    isManager,
    isLawyer,
    isClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
