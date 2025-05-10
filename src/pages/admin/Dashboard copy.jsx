import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  UsersIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Notification from '../../components/Notification';

const stats = [
  {
    name: 'Utilisateurs totaux',
    value: '2,451',
    icon: UsersIcon,
    change: '+12%',
    changeType: 'positive',
  },
  {
    name: 'Transactions du mois',
    value: '€45,241',
    icon: CurrencyEuroIcon,
    change: '+23.1%',
    changeType: 'positive',
  },
  {
    name: 'Nouveaux parrainages',
    value: '156',
    icon: UserGroupIcon,
    change: '+8.2%',
    changeType: 'positive',
  },
  {
    name: 'Taux de conversion',
    value: '24.5%',
    icon: ArrowTrendingUpIcon,
    change: '+2.3%',
    changeType: 'positive',
  },
];

const recentTransactions = [
  {
    id: 1,
    user: 'Jean Dupont',
    amount: '€1,200',
    status: 'completed',
    date: '2024-02-19',
  },
  {
    id: 2,
    user: 'Marie Martin',
    amount: '€850',
    status: 'pending',
    date: '2024-02-19',
  },
  {
    id: 3,
    user: 'Pierre Durand',
    amount: '€2,000',
    status: 'completed',
    date: '2024-02-18',
  },
  {
    id: 4,
    user: 'Sophie Bernard',
    amount: '€1,500',
    status: 'failed',
    date: '2024-02-18',
  },
];

const getStatusColor = (status, isDarkMode) => {
  switch (status) {
    case 'completed':
      return isDarkMode
        ? 'bg-green-900 text-green-300'
        : 'bg-green-100 text-green-800';
    case 'pending':
      return isDarkMode
        ? 'bg-yellow-900 text-yellow-300'
        : 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return isDarkMode
        ? 'bg-red-900 text-red-300'
        : 'bg-red-100 text-red-800';
    default:
      return isDarkMode
        ? 'bg-gray-700 text-gray-300'
        : 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Complété';
    case 'pending':
      return 'En attente';
    case 'failed':
      return 'Échoué';
    default:
      return status;
  }
};

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState('month'); // day, week, month, year

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/dashboard/data?period=${period}`);
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du tableau de bord:', error);
      Notification.error('Erreur lors de la récupération des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonctions utilitaires
  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusTextUtil = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'processing': 'En cours',
      'completed': 'Terminé',
      'failed': 'Échoué',
      'cancelled': 'Annulé',
      'approved': 'Approuvé',
      'rejected': 'Rejeté'
    };
    return statusMap[status] || status;
  };

  const getStatusColorUtil = (status, isDark = false) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Sélecteur de période */} 
      <div className="flex justify-end mb-6">
        <div className={`inline-flex rounded-md shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            type="button"
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${period === 'day' 
              ? isDarkMode 
                ? 'bg-primary-600 text-white' 
                : 'bg-primary-500 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Jour
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 text-sm font-medium ${period === 'week' 
              ? isDarkMode 
                ? 'bg-primary-600 text-white' 
                : 'bg-primary-500 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Semaine
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 text-sm font-medium ${period === 'month' 
              ? isDarkMode 
                ? 'bg-primary-600 text-white' 
                : 'bg-primary-500 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Mois
          </button>
          <button
            type="button"
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${period === 'year' 
              ? isDarkMode 
                ? 'bg-primary-600 text-white' 
                : 'bg-primary-500 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Année
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Afficher des placeholders pendant le chargement
          [...Array(4)].map((_, index) => (
            <div 
              key={index}
              className={`overflow-hidden rounded-lg px-4 py-5 shadow sm:p-6 animate-pulse ${
                isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : dashboardData ? (
          // Afficher les données réelles
          [
            {
              name: 'Utilisateurs totaux',
              value: formatNumber(dashboardData.cards.total_users),
              icon: UsersIcon,
              color: 'text-blue-500'
            },
            {
              name: 'Demandes de retrait',
              value: formatNumber(dashboardData.cards.total_withdrawals),
              icon: CurrencyDollarIcon,
              color: 'text-green-500'
            },
            {
              name: 'Inscrits aujourd\'hui',
              value: formatNumber(dashboardData.cards.today_users),
              icon: UserPlusIcon,
              color: 'text-purple-500'
            },
            {
              name: 'Commissions échouées',
              value: formatNumber(dashboardData.cards.failed_commissions),
              icon: ExclamationCircleIcon,
              color: 'text-red-500'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`overflow-hidden rounded-lg px-4 py-5 shadow sm:p-6 ${
                isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium text-gray-500 truncate ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // Message d'erreur si les données ne sont pas disponibles
          <div className="col-span-4 text-center py-8">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Impossible de charger les données. Veuillez réessayer plus tard.
            </p>
            <button
              onClick={fetchDashboardData}
              className={`mt-4 px-4 py-2 text-sm font-medium rounded-md ${
                isDarkMode 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* Vue d'ensemble du réseau */}
      {dashboardData && (
        <div className={`shadow rounded-lg ${
          isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
        }`}>
          <div className={`px-4 py-5 sm:px-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium leading-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Vue d'ensemble du réseau
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`text-base font-medium mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Membres actifs et inactifs</h4>
              <div className="flex space-x-4">
                <div className={`flex-1 p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Actifs</p>
                  <p className={`text-2xl font-semibold ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>{formatNumber(dashboardData.network_overview.active_users)}</p>
                </div>
                <div className={`flex-1 p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Inactifs</p>
                  <p className={`text-2xl font-semibold ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>{formatNumber(dashboardData.network_overview.inactive_users)}</p>
                </div>
              </div>
              <div className={`mt-4 p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Nouveaux membres ({dashboardData.network_overview.period})</p>
                <p className={`text-2xl font-semibold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{formatNumber(dashboardData.network_overview.new_users)}</p>
              </div>
            </div>
            <div>
              <h4 className={`text-base font-medium mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Top parrains</h4>
              <div className={`rounded-lg overflow-hidden ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                  {dashboardData.network_overview.top_referrers.slice(0, 5).map((referrer, index) => (
                    <li key={index} className="px-4 py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                          isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                        }`}>{index + 1}</span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {referrer.name} ({referrer.account_id})
                        </span>
                      </div>
                      <span className={`font-semibold ${
                        isDarkMode ? 'text-primary-400' : 'text-primary-600'
                      }`}>{referrer.referral_count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gestion des membres */}
      {dashboardData && (
        <div className={`shadow rounded-lg ${
          isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
        }`}>
          <div className={`px-4 py-5 sm:px-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium leading-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Gestion des membres
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`text-base font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Nouveaux membres</h4>
              <div className="flex items-end space-x-2">
                <p className={`text-2xl font-semibold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{formatNumber(dashboardData.member_management.new_members)}</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>cette période</p>
              </div>
              <div className="mt-2">
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Total: {formatNumber(dashboardData.member_management.total_members)}</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`text-base font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Membres actifs</h4>
              <div className="flex items-end space-x-2">
                <p className={`text-2xl font-semibold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>{formatNumber(dashboardData.member_management.active_members)}</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{dashboardData.member_management.active_percentage}%</p>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" style={{ width: `${dashboardData.member_management.active_percentage}%` }}></div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`text-base font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Comment ils ont connu SOLIFIN</h4>
              <div className="space-y-2">
                {dashboardData.member_management.acquisition_sources.map((source, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{source.source}</span>
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-primary-400' : 'text-primary-600'
                    }`}>{source.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Système de parrainage */}
      {dashboardData && (
        <div className={`shadow rounded-lg ${
          isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
        }`}>
          <div className={`px-4 py-5 sm:px-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium leading-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Système de parrainage et attribution de bonus
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`text-base font-medium mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Performance du système de parrainage</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Total des parrainages</p>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? 'text-primary-400' : 'text-primary-600'
                    }`}>{formatNumber(dashboardData.referral_system.total_referrals)}</p>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Nouveaux parrainages ({dashboardData.referral_system.period})</p>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{formatNumber(dashboardData.referral_system.new_referrals)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Taux de conversion</p>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>{dashboardData.referral_system.conversion_rate}%</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-base font-medium mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>Bonus sur délais attribués</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Cette période</p>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>{formatNumber(dashboardData.referral_system.bonus_points_awarded)} points</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Valeur totale</p>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>{formatNumber(dashboardData.referral_system.bonus_value)} $</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className={`text-base font-medium mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Top packs par parrainage</h4>
              <div className={`rounded-lg overflow-hidden ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                  {dashboardData.referral_system.top_packs.map((pack, index) => (
                    <li key={index} className="px-4 py-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>{pack.name}</span>
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-primary-400' : 'text-primary-600'
                        }`}>{pack.referral_count} parrainages</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full" 
                          style={{ width: `${(pack.referral_count / dashboardData.referral_system.top_packs[0].referral_count) * 100}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions récentes */}
      <div className={`shadow rounded-lg ${
        isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
      }`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium leading-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Transactions récentes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Utilisateur
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Montant
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Type
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Statut
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {loading ? (
                // Afficher des placeholders pendant le chargement
                [...Array(5)].map((_, index) => (
                  <tr key={index} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : dashboardData && dashboardData.latest_transactions ? (
                dashboardData.latest_transactions.map((transaction) => (
                  <tr key={transaction.id} className={
                    isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transaction.wallet?.user?.name || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {transaction.amount} $
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorUtil(transaction.status, isDarkMode)}`}>
                        {getStatusTextUtil(transaction.status)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm">
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Aucune transaction disponible
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques par pack */}
      {dashboardData && (
        <div className={`shadow rounded-lg ${
          isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
        }`}>
          <div className={`px-4 py-5 sm:px-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium leading-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Statistiques par pack
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Pack
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Ventes
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Revenus
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Taux de conversion
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Tendance
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {loading ? (
                  // Afficher des placeholders pendant le chargement
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : dashboardData && dashboardData.pack_stats ? (
                  dashboardData.pack_stats.map((pack) => (
                    <tr key={pack.id} className={
                      isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {pack.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatNumber(pack.sales)}
                        {pack.sales_change > 0 && (
                          <span className="text-green-500 ml-2">+{pack.sales_change}%</span>
                        )}
                        {pack.sales_change < 0 && (
                          <span className="text-red-500 ml-2">{pack.sales_change}%</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatNumber(pack.revenue)} $
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {pack.conversion_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pack.trend === 'up' && (
                          <span className="text-green-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                            </svg>
                            En hausse
                          </span>
                        )}
                        {pack.trend === 'down' && (
                          <span className="text-red-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586 20.293 5.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L12 8.414l-3.293 3.293A1 1 0 018 12H5.414L12 13z" clipRule="evenodd" />
                            </svg>
                            En baisse
                          </span>
                        )}
                        {pack.trend === 'stable' && (
                          <span className="text-yellow-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z" clipRule="evenodd" />
                            </svg>
                            Stable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm">
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Aucune statistique disponible
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}