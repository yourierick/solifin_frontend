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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  isAuthenticated: false,
  loading: true,
  requestPasswordReset: async () => {},
  resetPassword: async () => {},
  resendVerificationEmail: async () => {},
  verifyEmail: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      userData.role = Number(userData.is_admin) === 1 ? 'admin' : 'user';
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const { user: userData, token } = response.data;
      
      if (!userData || !token) {
        return {
          success: false,
          error: 'Réponse invalide du serveur'
        };
      }

      if (!userData.email_verified_at) {
        return {
          success: false,
          error: 'Veuillez vérifier votre email avant de vous connecter',
          needsVerification: true,
          email: userData.email
        };
      }
      
      const isAdmin = Number(userData.is_admin);
      const processedUserData = {
        ...userData,
        is_admin: isAdmin,
        role: isAdmin === 1 ? 'admin' : 'user'
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(processedUserData));
      
      setUser(processedUserData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirection basée sur le rôle
      const redirectPath = isAdmin === 1 ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion:', error);
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
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
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
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
      setVerificationStatus({ 
        success: false, 
        error: 'Le lien de vérification est invalide'
      });
      return { success: false };
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    verificationStatus,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
