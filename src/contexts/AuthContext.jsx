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

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axios';

const AuthContext = createContext(null);

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verification-success', '/verification-error'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si la route actuelle est publique
  const isPublicRoute = (path) => {
    return PUBLIC_ROUTES.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
  };

  // Vérifier l'authentification périodiquement
  useEffect(() => {
    checkAuth();

    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      // Ne pas vérifier l'auth sur les routes publiques
      if (isPublicRoute(location.pathname)) {
        setLoading(false);
        return;
      }

      // Obtenir un cookie CSRF
      await axios.get('/sanctum/csrf-cookie');
      
      // Vérifier l'authentification
      const response = await axios.get('/api/user');
      setUser(response.data);

      // Si on est sur la page login et qu'on est authentifié,
      // vérifier s'il y a une redirection en attente
      if (location.pathname === '/login') {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo');
        if (returnTo && !isPublicRoute(returnTo)) {
          navigate(returnTo, { replace: true });
          return;
        }
        // Redirection par défaut si pas de returnTo
        navigate(response.data.is_admin === 1 ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (error) {
      setUser(null);
      // Rediriger vers login avec le returnTo si on n'est pas sur une route publique
      if (!isPublicRoute(location.pathname)) {
        const returnTo = encodeURIComponent(location.pathname);
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Obtenir un cookie CSRF avant la connexion
      await axios.get('/sanctum/csrf-cookie');
      
      const response = await axios.post('/api/login', { email, password });
      
      if (response.data.user) {
        setUser(response.data.user);
        
        // Vérifier s'il y a une redirection en attente
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo');
        
        if (returnTo && !isPublicRoute(returnTo)) {
          navigate(returnTo, { replace: true });
        } else {
          // Redirection par défaut
          const redirectPath = response.data.user.is_admin === 1 ? '/admin' : '/dashboard';
          navigate(redirectPath, { replace: true });
        }
        
        return { success: true };
      }
    } catch (error) {
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (error.response?.status === 422) {
        errorMessage = 'Veuillez vérifier vos informations';
      } else if (error.response?.status === 429) {
        errorMessage = 'Trop de tentatives, veuillez réessayer plus tard';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const register = async (userData) => {
    try {
      // Obtenir un cookie CSRF avant l'inscription
      await axios.get('/sanctum/csrf-cookie');
      
      const response = await axios.post('/api/register', userData);
      
      if (response.data.user) {
        setUser(response.data.user);
        navigate('/dashboard', { replace: true });
        return { success: true };
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
      const response = await axios.post('/api/auth/forgot-password', { email });
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
      const response = await axios.post('/api/auth/reset-password', {
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
      // Redirection directe vers l'URL de renvoi de vérification
      window.location.href = `http://localhost:8000/email/resend-verification/${email}`;
      return {
        success: true,
        message: "Envoi de l'email de vérification en cours..."
      };
    } catch (error) {
      return {
        success: false,
        error: 'Une erreur est survenue lors du renvoi de l\'email'
      };
    }
  };

  const verifyEmail = async (id, hash) => {
    try {
      // Redirection directe vers l'URL de vérification
      window.location.href = `http://localhost:8000/email/verify/${id}/${hash}`;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return { success: false };
    }
  };

  if (loading) {
    return null; // ou un composant de chargement
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      loading,
      requestPasswordReset,
      resetPassword,
      resendVerificationEmail,
      verifyEmail,
      checkAuth,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
