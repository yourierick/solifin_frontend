/**
 * Login.jsx - Page de connexion
 * 
 * Page permettant aux utilisateurs de se connecter à l'application.
 * Gère l'authentification et la redirection post-connexion.
 * 
 * Fonctionnalités :
 * - Formulaire de connexion
 * - Validation des champs
 * - Gestion des erreurs
 * - Connexion avec email/mot de passe
 * - "Se souvenir de moi"
 * - Mot de passe oublié
 * 
 * Champs :
 * - Email
 * - Mot de passe
 * - Remember me (checkbox)
 * 
 * Validation :
 * - Format email valide
 * - Mot de passe requis
 * - Messages d'erreur contextuels
 * 
 * Redirection :
 * - Vers la page demandée si existante
 * - Vers le dashboard par défaut
 * - Distinction admin/utilisateur
 * 
 * Sécurité :
 * - Protection CSRF
 * - Limitation des tentatives
 * - Stockage sécurisé du token
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Notification from '../components/Notification';


export default function Login() {
  const { login, resendVerificationEmail } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    // Vérifier les paramètres d'URL
    if (searchParams.get('verified') === '1') {
      Notification.success('Email vérifié avec succès, connectez-vous à votre compte.');
    } else if (searchParams.get('already_verified') === '1') {
      Notification.info('Email déjà vérifié');
    } else if (searchParams.get('verification') === 'sent') {
      setSuccess('Un nouvel email de vérification vous a été envoyé. Veuillez vérifier votre boîte de réception.');
      Notification.success('Email de vérification envoyé');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        if (result.needsVerification) {
          setNeedsVerification(true);
        }
        setError(result.error);
        Notification.info(result.error);
      } else {
        Notification.success('Connexion réussie');
      }
    } catch (error) {
      Notification.error('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await resendVerificationEmail(formData.email);
    if (result.success) {
      Notification.success(result.message);
    } else {
      Notification.error(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-primary-50 to-white'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full space-y-8 p-8 rounded-xl ${
          isDarkMode 
            ? 'bg-gray-800 shadow-[0_0_3px_rgba(255,255,255,0.1)]' 
            : 'bg-white shadow-lg'
        }`}
      >
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Connexion à votre compte
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Ou{' '}
            <Link to="/register" className="font-medium text-primary-500 hover:text-primary-400">
              créez un nouveau compte
            </Link>
            {' '}ou{' '}
            <Link to="/" className="font-medium text-primary-500 hover:text-primary-400">
              retournez à l'accueil
            </Link>
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <p className="text-red-500">{error}</p>
            {needsVerification && (
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="mt-2 text-sm text-red-400 underline hover:text-red-300"
              >
                Renvoyer l'email de vérification
              </button>
            )}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <p className="text-green-500">{success}</p>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-none relative block w-full px-3 mb-4 py-2 border placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm pl-10 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Adresse email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm pl-10 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  ) : (
                    <EyeIcon className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className={`h-4 w-4 rounded focus:ring-primary-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-primary-500' 
                    : 'border-gray-300 text-primary-600'
                }`}
              />
              <label htmlFor="rememberMe" className={`ml-2 block text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-500 hover:text-primary-400"
              > 
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}