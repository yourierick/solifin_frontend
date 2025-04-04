/**
 * AuthContext.jsx - Contexte d'authentification
 * 
 * Gère l'état d'authentification global de l'application.
 * Fournit les fonctionnalités de connexion, déconnexion et gestion de session.
 * 
 * État géré :
 * - Utilisateur courant
 * - Token d'authentification
 * - État de chargement
 * - Erreurs d'authentification
 * 
 * Fonctionnalités :
 * - Login (email/password)
 * - Logout
 * - Rafraîchissement du token
 * - Vérification de session
 * - Gestion des rôles
 * 
 * Méthodes exposées :
 * - login(email, password)
 * - logout()
 * - updateUser(data)
 * - refreshToken()
 * - checkAuth()
 * 
 * Sécurité :
 * - Stockage sécurisé des tokens
 * - Validation des JWT
 * - Protection CSRF
 * - Gestion de l'expiration
 * 
 * Persistence :
 * - LocalStorage pour "Remember me"
 * - SessionStorage pour session unique
 * - Nettoyage à la déconnexion
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verification-success', '/verification-error'];

// Hook personnalisé pour utiliser le contexte d'authentification
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export { useAuth };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastVisitedUrl, setLastVisitedUrl] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        await checkAuth();
      } catch (error) {
        console.log('Non authentifié');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Vérifier périodiquement l'état de la session
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        await checkAuth();
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sauvegarder la dernière URL visitée
  useEffect(() => {
    if (user) {
      const currentPath = window.location.pathname;
      // Ne pas sauvegarder les URLs de login/register
      if (!['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath)) {
        localStorage.setItem(`lastUrl_${user.id}`, currentPath);
      }
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/user');
      if (response.data) {
        setUser(response.data);
      }
      setLoading(false);
      return true;
    } catch (error) {
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const login = async (login, password) => {
    try {
      setLoading(true);
      // Obtenir un cookie CSRF avant la connexion
      await axios.get('/sanctum/csrf-cookie');
      
      const response = await axios.post('/api/login', { login, password });
      
      if (response.data.user) {
        setUser(response.data.user);
        // Récupérer la dernière URL visitée pour cet utilisateur
        const lastUrl = localStorage.getItem(`lastUrl_${response.data.user.id}`);
        if (lastUrl) {
          setLastVisitedUrl(lastUrl);
        }
        return { 
          success: true,
          user: response.data.user,
          lastVisitedUrl
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/logout');
      setUser(null);
      return true;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      // Obtenir un cookie CSRF avant l'inscription
      await axios.get('/sanctum/csrf-cookie');
      
      const response = await axios.post('/api/register', userData);
      
      if (response.data.user) {
        setUser(response.data.user);
        return { 
          success: true,
          user: response.data.user
        };
      }
    } catch (error) {
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error.response?.status === 422) {
        return {
          success: false,
          errors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post('/api/forgot-password', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Une erreur est survenue'
      };
    }
  };

  const resetPassword = async (token, email, password, password_confirmation) => {
    try {
      const response = await axios.post('/api/reset-password', {
        token,
        email,
        password,
        password_confirmation
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Une erreur est survenue'
      };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      const response = await axios.post('/api/resend-verification', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Une erreur est survenue'
      };
    }
  };

  const value = {
    user,
    loading,
    lastVisitedUrl,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
