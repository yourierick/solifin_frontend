import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import Notification from '../../components/Notification';
import WithdrawalForm from '../../components/WithdrawalForm';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  WalletIcon,
  CurrencyEuroIcon,
  ArrowDownTrayIcon,
  PhoneIcon,
  CreditCardIcon,
  CircleStackIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { FaFilter, FaTimes } from "react-icons/fa";

const paymentMethods = [
  {
    id: 'orange-money',
    name: 'Orange Money',
    icon: PhoneIcon,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'airtel-money',
    name: 'Airtel Money',
    icon: PhoneIcon,
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'm-pesa',
    name: 'M-Pesa',
    icon: PhoneIcon,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'visa',
    name: 'Visa',
    icon: CreditCardIcon,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: CreditCardIcon,
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: CurrencyEuroIcon,
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    icon: CircleStackIcon,
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'credit-card',
    name: 'Carte de crédit',
    icon: CreditCardIcon,
    color: 'from-gray-600 to-gray-700',
  },
];

const getStatusColor = (status, isDarkMode) => {
  switch (status) {
    case 'active':
      return isDarkMode
        ? 'bg-green-900 text-green-300'
        : 'bg-green-100 text-green-800';
    case 'pending':
      return isDarkMode
        ? 'bg-yellow-900 text-yellow-300'
        : 'bg-yellow-100 text-yellow-800';
    case 'inactive':
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
    case 'active':
      return 'Actif';
    case 'pending':
      return 'En attente';
    case 'inactive':
      return 'Inactif';
    default:
      return status;
  }
};

export default function Wallets() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [adminWallet, setAdminWallet] = useState(null);
  const [systemWallet, setSystemWallet] = useState(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedWalletForWithdrawal, setSelectedWalletForWithdrawal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, dateFilter]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/wallets/data');
      if (response.data.success) {
        setAdminWallet(response.data.adminWallet);
        setSystemWallet(response.data.systemWallet);
        setTransactions(response.data.transactions);
        console.log(response.data);
      }
    } catch (error) {
      Notification.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWalletData();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Réinitialiser la pagination lors du changement de filtre
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1); // Réinitialiser la pagination lors du changement de filtre
  };

  const handleDateFilter = (field) => (e) => {
    setDateFilter(prev => ({ ...prev, [field]: e.target.value }));
    setCurrentPage(1); // Réinitialiser la pagination lors du changement de filtre
  };

  const getTransactionStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'pending':
        return isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handleWithdrawalClick = (walletId, type) => {
    setSelectedWalletForWithdrawal({ id: walletId, type });
    setShowWithdrawalForm(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = JSON.stringify(transaction.metadata)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    const matchesDate = (!dateFilter.startDate || new Date(transaction.created_at) >= new Date(dateFilter.startDate)) &&
      (!dateFilter.endDate || new Date(transaction.created_at) <= new Date(dateFilter.endDate));
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestion des portefeuilles
        </h1>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-md ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Portefeuilles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portefeuille Admin */}
        {adminWallet && (
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <WalletIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Portefeuille Personnel
                  </h3>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {adminWallet.balance}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total gagné: {adminWallet.total_earned}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total retiré: {adminWallet.total_withdrawn}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleWithdrawalClick(adminWallet.id, 'admin')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Faire un retrait
              </button>
            </div>
          </div>
        )}

        {/* Portefeuille Système */}
        {systemWallet && (
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <WalletIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Portefeuille Système
                  </h3>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {systemWallet.balance}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total entrant: {systemWallet.total_in}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total sortant: {systemWallet.total_out}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleWithdrawalClick(systemWallet.id, 'system')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Faire un retrait
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'outils avec filtres */}
      <div className={`p-4 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche existante */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Rechercher dans les détails..."
                />
              </div>
            </div>

            {/* Bouton de rafraîchissement et toggle filtres */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-md ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  showFilters ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                title={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
              >
                {showFilters ? <FaTimes className="w-5 h-5" /> : <FaFilter className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="w-full">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className={`w-full px-3 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Complété</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échoué</option>
                </select>
              </div>

              <div className="w-full">
                <select
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  className={`w-full px-3 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">Tous les types</option>
                  <option value="sales">Vente</option>
                  <option value="withdrawal">Retrait</option>
                  <option value="paiement">Paiement</option>
                </select>
              </div>

              <div className="w-full grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={handleDateFilter('startDate')}
                  className={`w-full px-3 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={handleDateFilter('endDate')}
                  className={`w-full px-3 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historique des transactions */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Historique des transactions
            </h2>
          </div>

          <div className="overflow-x-auto">
            {currentTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
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
                      Détails
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
                  {currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        transaction.type === 'sales' 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {transaction.type === 'sales' ? '+' : '-'}{transaction.amount}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {transaction.type}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {transaction.metadata ? (
                          <div className="max-w-xs overflow-hidden">
                            {transaction.metadata.source && (
                              <div>{transaction.metadata.source}</div>
                            )}
                            {transaction.metadata.pack_name && (
                              <div>{transaction.metadata.pack_name}</div>
                            )}
                            {!transaction.metadata.source && !transaction.metadata.pack_name && (
                              <span className="text-gray-400">Détails non disponibles</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Aucun détail</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getTransactionStatusColor(transaction.status)
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {transaction.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={`text-center py-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {transactions.length === 0 ? (
                  "Aucune transaction n'a été trouvée"
                ) : (
                  "Aucune transaction ne correspond aux filtres sélectionnés"
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && filteredTransactions.length > 0 && (
            <div className="flex justify-center gap-2 p-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                }`}
              >
                Précédent
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === index + 1
                      ? `${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                      : `${isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                }`}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de retrait */}
      {showWithdrawalForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            minHeight: '100vh',
            height: '100%'
          }}
        >
          <div className="max-w-md w-full relative z-[51]">
            <WithdrawalForm
              walletId={selectedWalletForWithdrawal?.id}
              walletType={selectedWalletForWithdrawal?.type}
              onClose={() => setShowWithdrawalForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}