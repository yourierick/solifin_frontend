import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowPathIcon, UserIcon, UsersIcon, CurrencyEuroIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

export default function UserDetails() {
  const { isDarkMode } = useTheme();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/admin/users/${id}`);
      setUser(response.data.user);
      
    } catch (err) {
      setError('Erreur lors du chargement des détails de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-3 py-1 text-sm font-medium rounded-full';
    switch (status) {
      case 'active':
        return `${baseClasses} ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`;
      case 'inactive':
        return `${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
      case 'suspended':
        return `${baseClasses} ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`;
      default:
        return `${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <ArrowPathIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} animate-spin`} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`bg-red-50 p-4 rounded-md ${isDarkMode ? 'bg-red-900' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { 
      name: 'Filleuls directs', 
      value: user?.stats?.total_referrals || 0,
      icon: UsersIcon,
      color: isDarkMode ? 'text-white' : 'text-blue-600'
    },
    { 
      name: 'Réseau total', 
      value: user?.stats?.total_network || 0,
      icon: UserIcon,
      color: isDarkMode ? 'text-white' : 'text-purple-600'
    },
    { 
      name: 'Total gagné', 
      value: `${user?.stats?.total_earned || 0}€`,
      icon: CurrencyEuroIcon,
      color: isDarkMode ? 'text-green-400' : 'text-green-600'
    },
    { 
      name: 'Solde actuel', 
      value: `${user?.stats?.current_balance || 0}€`,
      icon: WalletIcon,
      color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
    },
  ];

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <div className="mb-8">
          <Link 
            to="/admin/users" 
            className={`flex items-center ${
              isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour à la liste
          </Link>
        </div>

        {/* En-tête utilisateur */}
        <div className={`mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.name}
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user.email}
                </p>
              </div>
              <span className={getStatusBadgeClass(user.status)}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden rounded-lg shadow p-6`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`truncate text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {stat.name}
                      </dt>
                      <dd className={`mt-2 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="mt-12">
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="-mb-px flex space-x-8">
              {['Vue d\'ensemble', 'Réseau', 'Transactions'].map((tab) => {
                const isSelected = 
                  (tab === 'Vue d\'ensemble' && activeTab === 'overview') ||
                  (tab === 'Réseau' && activeTab === 'network') ||
                  (tab === 'Transactions' && activeTab === 'transactions');
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(
                      tab === 'Vue d\'ensemble' 
                        ? 'overview' 
                        : tab === 'Réseau' 
                          ? 'network' 
                          : 'transactions'
                    )}
                    className={`
                      border-b-2 py-4 px-1 text-sm font-medium
                      ${isSelected
                        ? `${isDarkMode ? 'border-primary-400 text-primary-400' : 'border-primary-500 text-primary-600'}`
                        : `${isDarkMode 
                            ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`
                      }
                    `}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
              <div className="px-6 py-5">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Informations personnelles
                </h3>
                <div className={`mt-5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <dl className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Code parrain
                      </dt>
                      <dd className={`mt-1 text-sm sm:col-span-2 sm:mt-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.referral_code}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Parrain
                      </dt>
                      <dd className={`mt-1 text-sm sm:col-span-2 sm:mt-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.sponsor ? user.sponsor.name : 'Aucun'}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Téléphone
                      </dt>
                      <dd className={`mt-1 text-sm sm:col-span-2 sm:mt-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.phone || '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Adresse
                      </dt>
                      <dd className={`mt-1 text-sm sm:col-span-2 sm:mt-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.address || '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
              <div className="px-6 py-5">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Réseau de parrainage
                </h3>
                {user.referrals && user.referrals.length > 0 ? (
                  <div className="mt-6">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Nom
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Email
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Date d'inscription
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'} divide-y`}>
                        {user.referrals.map((referral) => (
                          <tr key={referral.id}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {referral.name}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {referral.email}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {new Date(referral.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadgeClass(referral.status)}>
                                {referral.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Aucun filleul dans le réseau
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
              <div className="px-6 py-5">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Historique des transactions
                </h3>
                {user.wallet?.transactions?.length > 0 ? (
                  <div className="mt-6">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Date
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Description
                          </th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'} divide-y`}>
                        {user.wallet.transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </td>
                            <td className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {transaction.description}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                              transaction.type === 'credit'
                                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                                : isDarkMode ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Aucune transaction
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
