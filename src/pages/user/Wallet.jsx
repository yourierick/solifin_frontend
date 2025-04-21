import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import axios from 'axios';
import Notification from '../../components/Notification';
import WithdrawalForm from '../../components/WithdrawalForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createPortal } from 'react-dom';
import {
  PhoneIcon,
  CreditCardIcon,
  CircleStackIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  WalletIcon,
  CurrencyEuroIcon,
  ArrowDownTrayIcon
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

const formatDate = (dateString) => {
  if (!dateString) return 'Non disponible';
  
  try {
    // Si la date est déjà au format français avec heure (JJ/MM/AAAA HH:MM:SS)
    if (typeof dateString === 'string' && dateString.includes('/')) {
      // Extraire seulement la partie date (JJ/MM/AAAA)
      const dateParts = dateString.split(' ');
      if (dateParts.length > 0) {
        return dateParts[0]; // Retourne seulement la partie date
      }
      return dateString;
    }
    
    // Essayer de créer une date valide
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.error('Date invalide:', dateString);
      return 'Format de date invalide';
    }
    
    // Formater la date en français sans l'heure
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Erreur de formatage de date:', error, dateString);
    return 'Erreur de date';
  }
};

export default function Wallets() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [transactions, setTransactions] = useState([]);
  const [userWallet, setuserWallet] = useState(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedWalletForWithdrawal, setSelectedWalletForWithdrawal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [withdrawalToCancel, setWithdrawalToCancel] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, dateFilter]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/userwallet/data');
      if (response.data.success) {
        setuserWallet(response.data.userWallet);
        setTransactions(response.data.transactions);
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
    setSearchQuery(e.target.value);
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
      case 'approved':
        return isDarkMode 
          ? 'bg-green-900/50 text-green-300' 
          : 'bg-green-100 text-green-800';
      case 'pending':
        return isDarkMode 
          ? 'bg-yellow-900/50 text-yellow-300' 
          : 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return isDarkMode 
          ? 'bg-red-900/50 text-red-300' 
          : 'bg-red-100 text-red-800';
      case 'cancelled':
        return isDarkMode 
          ? 'bg-gray-900/50 text-gray-300' 
          : 'bg-gray-100 text-gray-800';
      default:
        return isDarkMode 
          ? 'bg-gray-900/50 text-gray-300' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const handleWithdrawalClick = (walletId, type) => {
    setSelectedWalletForWithdrawal({ id: walletId, type });
    setShowWithdrawalForm(true);
  };

  const handleCancelClick = (withdrawalId) => {
    if (!withdrawalId) {
      toast.error("Impossible d'annuler cette demande : identifiant manquant");
      return;
    }
    setWithdrawalToCancel(withdrawalId);
    setShowCancelModal(true);
  };

  const handleCancelWithdrawal = async () => {
    if (!withdrawalToCancel) {
      toast.error("Impossible d'annuler cette demande : identifiant manquant");
      setShowCancelModal(false);
      return;
    }

    try {
      const response = await axios.post(`/api/withdrawal/request/${withdrawalToCancel}/cancel`);
      if (response.data.success) {
        // Rafraîchir les transactions
        fetchWalletData();
        toast.success('Votre demande de retrait a été annulée avec succès');
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.status === 404 ? "Cette demande de retrait n'existe plus ou a déjà été annulée" : "Une erreur est survenue lors de l'annulation de votre demande");
      toast.error(errorMessage);
    } finally {
      setShowCancelModal(false);
      setWithdrawalToCancel(null);
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = JSON.stringify(transaction.metadata)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    // Amélioration du filtrage par date
    let matchesDate = true;
    
    if (dateFilter.startDate || dateFilter.endDate) {
      try {
        // Convertir la date de transaction en objet Date
        let transactionDate;
        
        if (typeof transaction.created_at === 'string') {
          // Si la date est au format "JJ/MM/AAAA HH:MM:SS" (format français)
          if (transaction.created_at.includes('/')) {
            const parts = transaction.created_at.split('/');
            if (parts.length === 3) {
              // Format JJ/MM/AAAA
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1; // Les mois commencent à 0 en JavaScript
              
              // Extraire l'année et l'heure si présente
              let year, time;
              if (parts[2].includes(' ')) {
                [year, time] = parts[2].split(' ');
                year = parseInt(year, 10);
              } else {
                year = parseInt(parts[2], 10);
              }
              
              transactionDate = new Date(year, month, day);
            } else {
              transactionDate = new Date(transaction.created_at);
            }
          } else {
            // Format standard ISO
            transactionDate = new Date(transaction.created_at);
          }
        } else {
          transactionDate = new Date(transaction.created_at);
        }
        
        // Convertir les dates de filtre en objets Date
        // Pour la date de début, on définit l'heure à 00:00:00
        let startDate = null;
        if (dateFilter.startDate) {
          startDate = new Date(dateFilter.startDate);
          startDate.setHours(0, 0, 0, 0);
        }
        
        // Pour la date de fin, on définit l'heure à 23:59:59
        let endDate = null;
        if (dateFilter.endDate) {
          endDate = new Date(dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
        }
        
        // Vérifier si la date de transaction est dans la plage
        matchesDate = (!startDate || transactionDate >= startDate) &&
                      (!endDate || transactionDate <= endDate);
                      
        console.log('Transaction date:', transactionDate);
        console.log('Start date:', startDate);
        console.log('End date:', endDate);
        console.log('Matches date:', matchesDate);
        
      } catch (error) {
        console.error('Erreur lors du filtrage par date:', error);
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Vérifier si au moins une transaction a un bouton d'annulation
  const hasActionableTransactions = transactions.some(
    transaction => transaction.type === 'withdrawal' && 
                  transaction.status === 'pending' &&
                  transaction.metadata?.withdrawal_request_id
  );

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
          Mon portefeuille
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
      <div className="">
        {/* Portefeuille utilisateur */}
        {userWallet && (
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
                    {userWallet.balance} $
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total gagné: {userWallet.total_earned} $
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total retiré: {userWallet.total_withdrawn} $
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleWithdrawalClick(userWallet.id, 'admin')}
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
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearch}
                className={`w-full px-3 py-2 rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Bouton de rafraîchissement */}
            <div className="flex items-center">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-md ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des transactions */}
      <div className={`mt-10 rounded-lg shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Historique de vos transactions
            </h2>
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
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Refusé</option>
                  <option value="cancelled">Annulé</option>
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
                  <option value="transfer">Achat</option>
                  <option value="withdrawal">Retrait</option>
                  <option value="commission">Commissions</option>
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

          <div className="overflow-x-auto">
            {currentTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Montant
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Statut
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Détails
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Date
                    </th>
                    {hasActionableTransactions && (
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer transition-colors duration-150`}
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {transaction.type === "withdrawal" ? "Retrait" : transaction.type === "transfer" ? "Achat" : "Commission"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        transaction.type === 'withdrawal' || transaction.type === 'transfer' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'transfer' ? '-' : '+'}
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getTransactionStatusColor(transaction.status)
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        <div className="flex flex-col">
                          {transaction.type === "commission" || transaction.type === "transfer" ? (
                            <div>
                              {transaction.metadata.source && (
                                <div>Source: {transaction.metadata.source}</div>
                              )}
                              {transaction.metadata.pack_name && (
                                <div>{transaction.metadata.pack_name}</div>
                              )}
                              {transaction.metadata.duration && (
                                <div>{transaction.metadata.duration} mois</div>
                              )}
                              {transaction.metadata.payment_method && (
                                <div>Méthode: {transaction.metadata.payment_method}</div>
                              )}
                            </div>
                          ) : (
                            <>
                              {transaction.metadata.withdrawal_request_id && (
                                <div>ID de la demande: {transaction.metadata.withdrawal_request_id}</div>
                              )}
                              {transaction.metadata.payment_method && (
                                <div>Méthode: {transaction.metadata.payment_method}</div>
                              )}
                              {transaction.metadata.payment_details && (
                                <div className="mt-1">
                                {transaction.metadata.payment_details.phone_number ? (
                                  <div>Numéro: {transaction.metadata.payment_details.phone_number}</div>
                                ) : (
                                  <div className="space-y-1">
                                    <div>Carte: ****{transaction.metadata.payment_details.number.slice(-4)}</div>
                                    <div>Propriétaire: {transaction.metadata.payment_details.holder_name}</div>
                                    <div>Date d'expiration: {transaction.metadata.payment_details.expiry}</div>
                                  </div>
                                )}
                              </div>
                              )}
                            </>
                          )}

                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {formatDate(transaction.created_at)}
                      </td>
                      {hasActionableTransactions && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.type === 'withdrawal' && 
                           transaction.status === 'pending' && 
                           transaction.metadata?.withdrawal_request_id && (
                            <button
                              onClick={() => handleCancelClick(transaction.metadata.withdrawal_request_id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Annuler
                            </button>
                          )}
                        </td>
                      )}
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

      {/* Modal de confirmation d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`relative p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Confirmer l'annulation
            </h3>
            <p className={`mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Êtes-vous sûr de vouloir annuler cette demande de retrait ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleCancelWithdrawal}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de transaction */}
      {showTransactionDetails && selectedTransaction && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]" 
             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}>
          <div className={`relative p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Détails de la transaction
              </h3>
              <button
                onClick={() => setShowTransactionDetails(false)}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} overflow-y-auto max-h-[60vh]`}>
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID de transaction</p>
                  <p className="font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type de transaction</p>
                  <p className="font-medium capitalize">{selectedTransaction.type === "withdrawal" ? "retrait": selectedTransaction.type === "transfer" ? "virement" : "commission"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Montant de la transaction</p>
                  <p className={`font-medium ${
                    selectedTransaction.type === 'withdrawal' || selectedTransaction.type === 'transfer' 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    {selectedTransaction.type === 'withdrawal' || selectedTransaction.type === 'transfer' ? '-' : '+'}
                    {selectedTransaction.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut de la transaction</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getTransactionStatusColor(selectedTransaction.status)
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de la transaction</p>
                  <p className="font-medium">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                  <p className="font-medium">
                    {formatDate(selectedTransaction.updated_at)}
                  </p>
                </div>
              </div>

              {/* Métadonnées */}
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div>
                  <h4 className={`text-lg font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Informations supplémentaires
                  </h4>
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {Object.entries(selectedTransaction.metadata).map(([key, value]) => {
                      // Traduire les clés en français
                      const frenchLabels = {
                        'withdrawal_request_id': 'Identifiant de la demande de retrait',
                        'payment_method': 'Méthode de paiement',
                        'montant_a_retirer': 'Montant à retirer',
                        'fee_percentage': 'Pourcentage de frais',
                        'frais_de_retrait': 'Frais de retrait',
                        'frais_de_commission': 'Frais de commission',
                        'montant_total_a_payer': 'Montant total à payer',
                        'devise': 'Dévise choisie pour le retrait',
                        'payment_details': 'Détails du paiement',
                        'status': 'Statut',
                        'source': 'Source',
                        'type': 'Type',
                        'amount': 'Montant',
                        'currency': 'Devise',
                        'description': 'Description',
                        'reference': 'Référence'
                      };
                      
                      const label = frenchLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      
                      // Formater la valeur selon son type
                      let formattedValue = value;
                      
                      // Traduction des statuts
                      if (key === 'status' || key.endsWith('_status')) {
                        if (value === 'pending') formattedValue = 'En attente';
                        else if (value === 'approved') formattedValue = 'Approuvé';
                        else if (value === 'rejected') formattedValue = 'Rejeté';
                        else if (value === 'cancelled' || value === 'canceled') formattedValue = 'Annulé';
                        else if (value === 'completed') formattedValue = 'Complété';
                        else if (value === 'failed') formattedValue = 'Échoué';
                      }
                      
                      // Ajout de symboles pour les valeurs monétaires
                      if (
                        key === 'amount' || 
                        key === 'montant_a_retirer' || 
                        key === 'frais_de_retrait' || 
                        key === 'frais_de_commission' || 
                        key === 'montant_total_a_payer' ||
                        key.includes('montant') ||
                        key.includes('amount')
                      ) {
                        formattedValue = `${value} $`;
                      }
                      
                      // Ajout de symboles pour les pourcentages
                      if (
                        key === 'fee_percentage' || 
                        key.includes('percentage') || 
                        key.includes('pourcentage')
                      ) {
                        formattedValue = `${value} %`;
                      }
                      
                      return (
                        <div key={key} className="mb-2">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                            {label}
                          </p>
                          <p className="font-medium break-words">
                            {typeof formattedValue === 'object' 
                              ? JSON.stringify(formattedValue, null, 2) 
                              : String(formattedValue)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowTransactionDetails(false)}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
} 