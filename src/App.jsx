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

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
// import WithdrawalRequests from './pages/admin/WithdrawalRequests';
import AdvertisementValidation from './pages/admin/AdvertisementValidation';
import JobOfferValidation from './pages/admin/JobOfferValidation';
import OpportunityValidation from './pages/admin/OpportunityValidation';
import ToastContainer from './components/Toast';
import EditPack from './pages/admin/EditPack';
import MyPacks from './pages/user/MyPacks';
import MesPacks from './pages/admin/MyPacks';
import Profile from './pages/Profile';
import DashboardLayout from './layouts/DashboardLayout';
import PurchasePack from './pages/PurchasePack';
import VerificationSuccess from './pages/VerificationSuccess';
import VerificationError from './pages/VerificationError';
import BuyPack from './pages/user/Packs';

function App() {
  const { user } = useAuth();

  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Login />
          )
        } />
        <Route path="/register" element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Register />
          )
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/email/verify/:id/:hash" element={<EmailVerification />} />
        
        {/* Ajouter la route pour l'achat de pack après inscription */}
        <Route 
          path="/purchase-pack/:sponsor_code" 
          element={
            <PurchasePack />
          } 
        />
  
        <Route path="/admin/*"
          element={
            <RequireAuth role="admin">
              <AdminDashboardLayout />
            </RequireAuth>
          }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="wallets" element={<Wallets />} />
          {/* <Route path="withdrawal-requests" element={<WithdrawalRequests />} /> */}
          <Route path="packs" element={<Packs />} />
          <Route path="mespacks" element={<MesPacks />} />
          <Route path="packs/add" element={<AddPack />} />
          <Route path="packs/edit/:id" element={<EditPack />} />
          <Route path="commissions" element={<div>Gestion des commissions (à venir)</div>} />
          <Route path="validations">
            <Route path="ads" element={<AdvertisementValidation />} />
            <Route path="opportunities" element={<OpportunityValidation />} />
            <Route path="jobs" element={<JobOfferValidation />} />
          </Route>
          <Route path="settings" element={<div>Paramètres (à venir)</div>} />
        </Route>
        {/* Routes protégées - Utilisateur */}
        
        <Route 
          path="/dashboard/*"
          element={
            <RequireAuth role="user">
              <UserDashboardLayout />
            </RequireAuth>
          }>
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="transactions" element={<div>Mes transactions (à venir)</div>} />
        <Route path="stats" element={<div>Mes statistiques (à venir)</div>} />
        <Route path="opportunities">
          <Route path="create" element={<div>Ajouter une opportunité (à venir)</div>} />
          <Route path="list" element={<div>Mes opportunités (à venir)</div>} />
        </Route>
        <Route path="ads">
          <Route path="create" element={<div>Créer une publicité (à venir)</div>} />
          <Route path="list" element={<div>Mes publicités (à venir)</div>} />
        </Route>
        <Route path="jobs">
          <Route path="create" element={<div>Publier une offre d'emploi (à venir)</div>} />
          <Route path="list" element={<div>Mes offres d'emploi (à venir)</div>} />
        </Route>
        <Route path="packs" element={<MyPacks />} />
        <Route path="buypacks" element={<BuyPack />} />
      </Route>

        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/verification-success" element={<VerificationSuccess />} />
        <Route path="/verification-error" element={<VerificationError />} />
      </Routes>
    </div>
  );
}

export default App;