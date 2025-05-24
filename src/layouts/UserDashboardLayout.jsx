/**
 * UserDashboardLayout.jsx - Layout du tableau de bord utilisateur
 *
 * Layout spécifique pour l'interface utilisateur standard.
 * Hérite du DashboardLayout avec des fonctionnalités spécifiques aux utilisateurs.
 *
 * Navigation :
 * - Tableau de bord
 * - Mes investissements
 * - Mon réseau
 * - Profil
 * - Portefeuille
 * - Support
 *
 * Widgets :
 * - Résumé du compte
 * - Notifications
 * - Activité récente
 * - Performance
 * - Statistiques
 *
 * Fonctionnalités spécifiques :
 * - Suivi des investissements
 * - Gestion du réseau
 * - Transactions
 * - Profil et paramètres
 *
 * Intégrations :
 * - Système de parrainage
 * - Notifications en temps réel
 * - Chat support
 * - Alertes personnalisées
 *
 * Sécurité :
 * - Vérification des permissions
 * - Protection des routes
 * - Validation des actions
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import GlobalStatsModal from "../components/GlobalStatsModal";
import TestimonialPromptWrapper from "../components/TestimonialPromptWrapper";
import {
  HomeIcon,
  UserIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LightBulbIcon,
  MegaphoneIcon,
  BriefcaseIcon,
  WalletIcon,
  CubeIcon,
  UserCircleIcon,
  NewspaperIcon,
  BuildingOfficeIcon,
  MapIcon,
  EnvelopeIcon,
  UserPlusIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import NotificationsDropdown from "../components/NotificationsDropdown";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: HomeIcon },
  { name: "Mon profil", href: "/dashboard/profile", icon: UserIcon },
  { name: "Portefeuille", href: "/dashboard/wallet", icon: WalletIcon },
  { name: "Mes finances", href: "/dashboard/finances", icon: BanknotesIcon },
  { name: "Mes packs", href: "/dashboard/packs", icon: CubeIcon },
  {
    name: "Mes invitations",
    href: "/dashboard/invitations",
    icon: UserPlusIcon,
  },
  { name: "Mes statistiques", href: "/dashboard/stats", icon: ChartBarIcon },
  {
    name: "Fil d'actualités",
    href: "/dashboard/news-feed",
    icon: NewspaperIcon,
  },
  { name: "Ma page", href: "/dashboard/my-page", icon: BuildingOfficeIcon },
  { name: "Social", href: "/dashboard/social", icon: ChatBubbleLeftRightIcon },
  { name: "FAQ", href: "/dashboard/faq", icon: QuestionMarkCircleIcon },
];

export default function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const [sidebarStyle, setSidebarStyle] = useState({
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  });
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipTargetRef = useRef(null);
  const { isDarkMode, toggleTheme, isSidebarCollapsed, toggleSidebar } =
    useTheme();

  // Styles CSS pour personnaliser l'ascenseur
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: ${
          isDarkMode ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.5)"
        };
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: ${
          isDarkMode ? "rgba(75, 85, 99, 0.8)" : "rgba(156, 163, 175, 0.8)"
        };
        border-radius: 10px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: ${
          isDarkMode ? "rgba(55, 65, 81, 0.9)" : "rgba(107, 114, 128, 0.9)"
        };
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, [isDarkMode]);
  const location = useLocation();
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleStatsClick = (e) => {
    e.preventDefault();
    setStatsModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Sidebar mobile */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 z-50 flex w-72 flex-col ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } lg:hidden`}
      >
        <div
          className={`flex h-16 shrink-0 items-center justify-between px-6 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            {!isSidebarCollapsed && (
              <span
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-primary-600"
                }`}
              >
                SOLIFIN
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`${
              isDarkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-600"
            }`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-primary-50 text-primary-600"
                    : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div
          className={`mt-auto border-t p-4 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-x-3 rounded-lg px-4 py-3 text-sm font-medium ${
              isDarkMode
                ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.div>

      {/* Sidebar desktop */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${
          isSidebarCollapsed ? "lg:w-24" : "lg:w-72"
        } transition-all duration-300`}
      >
        <div
          className={`flex grow flex-col gap-y-5 border-r ${
            isSidebarCollapsed ? "px-4" : "px-6"
          } pb-4 overflow-y-auto transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
          ref={sidebarRef}
          style={sidebarStyle}
          onMouseEnter={() => {
            // Vérifier si le défilement est nécessaire
            if (
              sidebarRef.current &&
              sidebarRef.current.scrollHeight > sidebarRef.current.clientHeight
            ) {
              setSidebarStyle({
                overflowY: "auto",
                scrollbarWidth: "thin",
                msOverflowStyle: "auto",
              });
            }
          }}
          onMouseLeave={() =>
            setSidebarStyle({
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            })
          }
        >
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              {!isSidebarCollapsed && (
                <span
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-primary-600"
                  }`}
                >
                  SOLIFIN
                </span>
              )}
            </Link>
          </div>
          <nav className="flex flex-1 flex-col custom-scrollbar">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name} className="relative">
                        <Link
                          to={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-primary-50 text-primary-600"
                              : isDarkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          ref={
                            showTooltip === item.name ? tooltipTargetRef : null
                          }
                          onMouseEnter={(e) => {
                            if (isSidebarCollapsed) {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setTooltipPosition({
                                top: rect.top - 10,
                                left: rect.right + 15,
                              });
                              setShowTooltip(item.name);
                            }
                          }}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          <div className="relative">
                            <item.icon
                              className={`h-5 w-5 ${
                                location.pathname === item.href && !isDarkMode
                                  ? "text-primary-600"
                                  : ""
                              }`}
                            />
                          </div>
                          {!isSidebarCollapsed && (
                            <span className="ml-3">{item.name}</span>
                          )}
                          {isSidebarCollapsed &&
                            showTooltip === item.name &&
                            createPortal(
                              <div
                                className="fixed z-[9999] px-3 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap ${
                              isDarkMode ? 'bg-gray-800 text-white border border-primary-600' : 'bg-white text-black border border-primary-600'
                            } animate-slideUpFade tooltip-content"
                                style={{
                                  top: `${tooltipPosition.top}px`,
                                  left: `${tooltipPosition.left}px`,
                                  backgroundColor: isDarkMode
                                    ? "rgb(31, 41, 55)"
                                    : "white",
                                  color: isDarkMode ? "white" : "black",
                                  opacity: 1,
                                }}
                              >
                                {item.name}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: "-4px",
                                    top: "50%",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    width: "8px",
                                    height: "8px",
                                    backgroundColor: isDarkMode
                                      ? "rgb(31, 41, 55)"
                                      : "white",
                                    borderLeft: "1px solid #16a34a",
                                    borderBottom: "1px solid #16a34a",
                                    opacity: 1,
                                  }}
                                ></div>
                              </div>,
                              document.body
                            )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-x-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  ref={showTooltip === "logout" ? tooltipTargetRef : null}
                  onMouseEnter={(e) => {
                    if (isSidebarCollapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({
                        top: rect.top - 10,
                        left: rect.right + 15,
                      });
                      setShowTooltip("logout");
                    }
                  }}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                  {!isSidebarCollapsed && <span>Déconnexion</span>}
                  {isSidebarCollapsed &&
                    showTooltip === "logout" &&
                    createPortal(
                      <div
                        className="fixed z-[9999] px-3 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? 'bg-gray-800 text-white border border-primary-600' : 'bg-white text-black border border-primary-600'
                    } animate-slideUpFade tooltip-content"
                        style={{
                          top: `${tooltipPosition.top}px`,
                          left: `${tooltipPosition.left}px`,
                          backgroundColor: isDarkMode
                            ? "rgb(31, 41, 55)"
                            : "white",
                          color: isDarkMode ? "white" : "black",
                          opacity: 1,
                        }}
                      >
                        Déconnexion
                        <div
                          style={{
                            position: "absolute",
                            left: "-4px",
                            top: "50%",
                            transform: "translateY(-50%) rotate(45deg)",
                            width: "8px",
                            height: "8px",
                            backgroundColor: isDarkMode
                              ? "rgb(31, 41, 55)"
                              : "white",
                            borderLeft: "1px solid #16a34a",
                            borderBottom: "1px solid #16a34a",
                            opacity: 1,
                          }}
                        ></div>
                      </div>,
                      document.body
                    )}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div
        className={`${
          isSidebarCollapsed ? "lg:pl-24" : "lg:pl-72"
        } transition-all duration-300`}
      >
        <div
          className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className={`${
              isDarkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-600"
            } lg:hidden`}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Bouton pour rétracter/déployer la sidebar (desktop) */}
          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center justify-center h-8 w-8 rounded-full ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
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
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Profile dropdown */}
              <div className="relative ml-3" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user?.picture ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.picture}
                      alt={`Photo de profil de ${user.name || "l'utilisateur"}`}
                    />
                  ) : (
                    <UserCircleIcon
                      className={`h-8 w-8 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-2 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3 flex flex-col items-center border-b border-gray-200 dark:border-gray-700">
                      {user?.picture ? (
                        <img
                          className="h-16 w-16 rounded-full object-cover mb-3"
                          src={user.picture}
                          alt={`Photo de profil de ${
                            user.name || "l'utilisateur"
                          }`}
                        />
                      ) : (
                        <UserCircleIcon
                          className={`h-16 w-16 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          } mb-3`}
                          aria-hidden="true"
                        />
                      )}
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center justify-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        Mon profil
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
                      >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className={`py-6 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <GlobalStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Composant d'invitation à témoigner */}
      <TestimonialPromptWrapper />
    </div>
  );
}
