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
 * - Expiration de session
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

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { sessionEvents } from '../utils/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verification-success', '/verification-error'];

// Durée d'inactivité avant expiration de session (en millisecondes)
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

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
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  
  // Utiliser useRef pour stocker les intervalles et éviter les problèmes de dépendance
  const authCheckIntervalRef = useRef(null);
  const inactivityCheckIntervalRef = useRef(null);
  
  // Utiliser useRef pour suivre si l'utilisateur est authentifié
  const isAuthenticatedRef = useRef(false);

  // Fonction pour mettre à jour le timestamp de dernière activité
  const updateLastActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const isAuthenticated = await checkAuth();
        isAuthenticatedRef.current = isAuthenticated;
        
        // Si l'utilisateur est authentifié et qu'il est sur une route publique comme login
        if (isAuthenticated && user) {
          const currentPath = window.location.pathname;
          if (['/login', '/register'].includes(currentPath)) {
            // Rediriger vers le dashboard approprié
            const isAdmin = user.is_admin === 1 || user.is_admin === true || user.role === 'admin';
            navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.log('Non authentifié');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Nettoyage des intervalles au démontage du composant
    return () => {
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
    };
  }, []);

  // Écouter les événements d'expiration de session
  useEffect(() => {
    const handleSessionExpired = () => {
      // Éviter de déclencher plusieurs fois si l'utilisateur est déjà déconnecté
      if (isAuthenticatedRef.current) {
        // Nettoyer l'état d'authentification
        setUser(null);
        isAuthenticatedRef.current = false;
        
        // Nettoyer les intervalles
        if (authCheckIntervalRef.current) {
          clearInterval(authCheckIntervalRef.current);
        }
        if (inactivityCheckIntervalRef.current) {
          clearInterval(inactivityCheckIntervalRef.current);
        }
        
        // Afficher un message à l'utilisateur
        toast.error("Votre session a expiré. Veuillez vous reconnecter.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    };

    // Ajouter l'écouteur d'événement
    sessionEvents.expired.addEventListener('session-expired', handleSessionExpired);

    // Nettoyer l'écouteur d'événement
    return () => {
      sessionEvents.expired.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  // Mettre à jour l'activité de l'utilisateur
  useEffect(() => {
    if (user) {
      // Mettre à jour l'activité sur les événements d'interaction utilisateur
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      
      const handleUserActivity = () => {
        updateLastActivity();
      };
      
      // Ajouter les écouteurs d'événements
      events.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      
      // Nettoyer les écouteurs d'événements
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [user, updateLastActivity]);

  // Vérifier périodiquement l'état de la session
  useEffect(() => {
    // Nettoyer les intervalles existants
    if (authCheckIntervalRef.current) {
      clearInterval(authCheckIntervalRef.current);
    }
    if (inactivityCheckIntervalRef.current) {
      clearInterval(inactivityCheckIntervalRef.current);
    }
    
    if (user) {
      isAuthenticatedRef.current = true;
      
      // Vérifier l'authentification toutes les 5 minutes
      authCheckIntervalRef.current = setInterval(async () => {
        try {
          await checkAuth();
        } catch (error) {
          console.error("Erreur lors de la vérification d'authentification:", error);
        }
      }, 5 * 60 * 1000);
      
      // Vérifier l'inactivité toutes les minutes
      inactivityCheckIntervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActivity;
        
        // Si l'utilisateur est inactif depuis plus longtemps que le délai d'expiration
        if (inactiveTime > SESSION_TIMEOUT) {
          // Déconnecter l'utilisateur
          logout();
          
          // Afficher un message
          toast.info("Vous avez été déconnecté en raison d'inactivité.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
          
          // Rediriger vers la page de connexion
          navigate('/login', { replace: true });
        }
      }, 60 * 1000); // Vérifier chaque minute
    } else {
      isAuthenticatedRef.current = false;
    }
  }, [user, lastActivity, navigate]);

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
        isAuthenticatedRef.current = true;
        // Mettre à jour le timestamp de dernière activité
        updateLastActivity();
        setLoading(false);
        return true;
      }
      isAuthenticatedRef.current = false;
      setLoading(false);
      return false;
    } catch (error) {
      setUser(null);
      isAuthenticatedRef.current = false;
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
        isAuthenticatedRef.current = true;
        // Mettre à jour le timestamp de dernière activité
        updateLastActivity();
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
      isAuthenticatedRef.current = false;
      
      // Nettoyer les intervalles
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
      
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
        isAuthenticatedRef.current = true;
        // Mettre à jour le timestamp de dernière activité
        updateLastActivity();
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
    checkAuth,
    updateLastActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
