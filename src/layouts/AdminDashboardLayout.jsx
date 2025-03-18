/**
 * AdminDashboardLayout.jsx - Layout principal du tableau de bord administrateur
 * 
 * Ce composant définit la structure de base de l'interface administrateur.
 * Il fournit une mise en page cohérente pour toutes les pages d'administration.
 * 
 * Structure :
 * - Barre de navigation latérale (sidebar)
 * - En-tête avec informations utilisateur
 * - Zone de contenu principal
 * - Pied de page
 * 
 * Fonctionnalités :
 * - Navigation responsive
 * - Menu rétractable
 * - Gestion des droits d'accès
 * - Déconnexion
 * - Thème clair/sombre
 * 
 * Éléments de navigation :
 * - Dashboard
 * - Gestion des utilisateurs
 * - Gestion des packs
 * - Validation des contenus
 * - Gestion des retraits
 * - Configuration
 * 
 * Contextes utilisés :
 * - AuthContext : Gestion de l'authentification
 * - ThemeContext : Gestion du thème
 * - ToastContext : Notifications
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyEuroIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  CubeIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  MegaphoneIcon,
  WalletIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import NotificationsDropdown from '../components/NotificationsDropdown';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
  { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
  { name: 'Demandes de retrait', href: '/admin/withdrawal-requests', icon: BanknotesIcon },
  { name: 'Portefeuilles', href: '/admin/wallets', icon: WalletIcon },
  { name: 'Packs', href: '/admin/packs', icon: CubeIcon },
  { name: 'Commissions', href: '/admin/commissions', icon: CurrencyEuroIcon },
  { name: 'Mes packs', href: '/admin/mespacks', icon: CubeIcon },
  { 
    name: 'Validations', 
    href: '/admin/validations',
    icon: ClipboardDocumentCheckIcon,
    children: [
      { name: 'Publicités', href: '/admin/validations/ads' },
      { name: 'Opportunités', href: '/admin/validations/opportunities' },
      { name: 'Offres d\'emploi', href: '/admin/validations/jobs' },
    ]
  },
  { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const { isDarkMode, isSidebarCollapsed, toggleSidebar, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      try {
        const parsedUser = typeof user === 'string' ? JSON.parse(user) : user;
        setUserData(parsedUser);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        setUserData(null);
      }
    }
  }, [user]);

  const handleSubmenuClick = (itemName) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  const handleLogout = () => {
    logout();
  };

  const renderNavLink = (item, isMobile = false) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenu === item.name;

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => handleSubmenuClick(item.name)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-x-3">
              <item.icon className="h-5 w-5" />
              {(!isSidebarCollapsed || isMobile) && <span>{item.name}</span>}
            </div>
            <ChevronRightIcon className={`h-4 w-4 transition-transform ${isSubmenuOpen ? 'rotate-90' : ''}`} />
          </button>
          
          {isSubmenuOpen && (!isSidebarCollapsed || isMobile) && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === child.href
                      ? isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-primary-50 text-primary-600'
                      : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? isDarkMode
              ? 'bg-gray-700 text-white'
              : 'bg-primary-50 text-primary-600'
            : isDarkMode
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <item.icon className={`h-5 w-5 ${isActive && !isDarkMode ? 'text-primary-600' : ''}`} />
        {(!isSidebarCollapsed || isMobile) && <span className="ml-3">{item.name}</span>}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar mobile */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 z-50 flex w-72 flex-col ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } lg:hidden`}
      >
        <div className={`flex h-16 shrink-0 items-center justify-between px-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              SOLIFIN
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => renderNavLink(item, true))}
        </nav>
        <div className={`mt-auto border-t p-4 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg ${
              isDarkMode
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.div>

      {/* Sidebar desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${
        isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
      } transition-all duration-300`}>
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 pb-4 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              {!isSidebarCollapsed && (
                <span className={`font-semibold text-lg ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  SOLIFIN
                </span>
              )}
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      {renderNavLink(item)}
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-x-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                  {!isSidebarCollapsed && <span>Déconnexion</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} transition-all duration-300`}>
        <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`${
              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
            } lg:hidden`}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Bouton pour rétracter/déployer la sidebar (desktop) */}
          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center justify-center h-8 w-8 rounded-full ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>

          <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Bouton retour accueil */}
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <HomeIcon className="h-5 w-5" />
                <span className="hidden sm:block">Accueil</span>
              </Link>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              {/* Bouton déconnexion */}
              <button
                onClick={logout}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Déconnexion"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>

              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Bonjour { userData?.name } !
              </span>
            </div>
          </div>
        </div>

        <main className={`py-10 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}