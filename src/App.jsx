/**
 * App.jsx - Composant racine de l'application
 * 
 * Ce composant est le point d'entrée principal de l'application. Il est responsable de :
 * - La configuration des providers globaux (Auth, Theme, Toast)
 * - La mise en place du routage de l'application
 * - La gestion des layouts principaux
 * - L'initialisation des configurations globales
 * 
 * Structure :
 * - Providers : Contextes globaux pour l'authentification, le thème et les notifications
 * - Router : Configuration des routes publiques et protégées
 * - Layouts : Structures de mise en page pour différentes sections (admin, user, public)
 * 
 * Fonctionnalités :
 * - Gestion de l'état de connexion
 * - Redirection intelligente basée sur les rôles
 * - Persistance du thème
 * - Système de notifications toast
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import UserDashboardLayout from './layouts/UserDashboardLayout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Homepage from './pages/Homepage';
import { useAuth } from './contexts/AuthContext';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import Wallet from './pages/user/Wallet';
import Wallets from './pages/admin/Wallets';
import AddPack from './pages/admin/AddPack';
import Packs from './pages/admin/Packs';
import Users from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import MyPage from './pages/user/MyPage';
import NewsFeed from './pages/user/NewsFeed';
// import WithdrawalRequests from './pages/admin/WithdrawalRequests';
import AdvertisementValidation from './pages/admin/AdvertisementValidation';
import ToastContainer from './components/Toast';
import EditPack from './pages/admin/EditPack';
import MyPacks from './pages/user/MyPacks';
import MesPacks from './pages/admin/MyPacks';
import Profile from './pages/Profile';
import AdminProfile from './pages/admin/AdminProfile';
import DashboardLayout from './layouts/DashboardLayout';
import { PublicationPackProvider } from './contexts/PublicationPackContext';
import PurchasePack from './pages/PurchasePack';
import VerificationSuccess from './pages/VerificationSuccess';
import VerificationError from './pages/VerificationError';
import BuyPack from './pages/user/Packs';
import Stats from './pages/user/Stats';
import WithdrawalRequests from './components/WithdrawalRequests';

function App() {
  return (
    <PublicationPackProvider>
        <div>
          <ToastContainer />
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={
              <PublicRoute>
                <Homepage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password/:token" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/email/verify/:id/:hash" element={
              <PublicRoute>
                <EmailVerification />
              </PublicRoute>
            } />
            <Route path="/verification-success" element={
              <PublicRoute>
                <VerificationSuccess />
              </PublicRoute>
            } />
            <Route path="/verification-error" element={
              <PublicRoute>
                <VerificationError />
              </PublicRoute>
            } />
            <Route path="/purchase-pack/:sponsor_code" element={
              <PublicRoute>
                <PurchasePack />
              </PublicRoute>
            } />
            
            {/* Routes protégées */}
            <Route path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminDashboardLayout />
                </PrivateRoute>
              }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="withdrawal-requests" element={<WithdrawalRequests />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="profile" element={<AdminProfile />} />
              {/* <Route path="withdrawal-requests" element={<WithdrawalRequests />} /> */}
              <Route path="packs" element={<Packs />} />
              <Route path="mespacks" element={<MesPacks />} />
              <Route path="packs/add" element={<AddPack />} />
              <Route path="packs/edit/:id" element={<EditPack />} />
              <Route path="settings" element={<div>Paramètres (à venir)</div>} />
            </Route>
        
            <Route path="/dashboard/*"
              element={
                <PrivateRoute>
                  <UserDashboardLayout />
                </PrivateRoute>
              }>
              <Route index element={<UserDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="transactions" element={<div>Mes transactions (à venir)</div>} />
              <Route path="stats" element={<Stats />} />
              <Route path="my-page" element={<MyPage />} />
              <Route path="news-feed" element={<NewsFeed />} />
              <Route path="packs" element={<MyPacks />} />
              <Route path="buypacks" element={<BuyPack />} />
            </Route>

            {/* Redirection pour les routes inconnues */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </PublicationPackProvider>
  );
}

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { user, loading, lastVisitedUrl } = useAuth();
  
  // Attendre que la vérification de l'authentification soit terminée
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[rgba(17,24,39,0.95)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Si l'utilisateur est connecté et n'est pas sur la page d'accueil
  if (user && window.location.pathname !== '/') {
    // Vérifier si l'utilisateur est admin de plusieurs façons possibles
    const isAdmin = user.is_admin === 1 || user.is_admin === true || user.role === 'admin';
    
    // Si une dernière URL visitée existe et que c'est une route valide, y rediriger
    if (lastVisitedUrl) {
      // Vérifier que l'URL est valide (commence par /admin ou /dashboard selon le rôle)
      if ((isAdmin && lastVisitedUrl.startsWith('/admin')) || 
          (!isAdmin && lastVisitedUrl.startsWith('/dashboard'))) {
        return <Navigate to={lastVisitedUrl} replace />;
      }
    }
    
    // Sinon, rediriger vers le dashboard par défaut selon le rôle
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

// Composant pour les routes protégées
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Afficher le loader pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[rgba(17,24,39,0.95)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Rediriger vers login uniquement si on n'est pas en train de charger et qu'il n'y a pas d'utilisateur
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default App;