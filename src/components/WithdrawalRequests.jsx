import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import Notification from './Notification';
import FullScreenModal from './FullScreenModal';
import ConfirmationModal from './ConfirmationModal';
import {
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function WithdrawalRequests() {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [walletSystemBalance, setWalletSystemBalance] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (showModal) {
      // Empêcher le défilement du body
      document.body.style.overflow = 'hidden';
    } else {
      // Réactiver le défilement du body
      document.body.style.overflow = 'auto';
    }
    
    // Nettoyer l'effet lors du démontage du composant
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/withdrawal/requests');
      if (response.data.success) {
        console.log(response.data);
        setRequests(response.data.requests);
        setWalletSystemBalance(response.data.wallet_system_balance || 0);
      }
    } catch (error) {
      Notification.error('Erreur lors de la récupération des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!requestId) return;
    
    try {
      setProcessingAction(true);
      const response = await axios.delete(`/api/admin/withdrawal/requests/${requestId}`);
      if (response.data.success) {
        Notification.success('Demande supprimée avec succès');
        fetchRequests();
      }
    } catch (error) {
      Notification.error('Erreur lors de la suppression de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAdminNote(request.admin_note || '');
    setShowModal(true);
  };

  const handleApprove = async (requestId) => {
    if (!requestId) return;
    
    try {
      setProcessingAction(true);
      const response = await axios.post(`/api/admin/withdrawal/requests/${requestId}/approve`, {
        admin_note: adminNote
      });
      
      if (response.data.success) {
        Notification.success('Demande approuvée avec succès');
        setShowModal(false);
        fetchRequests();
      }
    } catch (error) {
      Notification.error('Erreur lors de l\'approbation de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!requestId) return;
    
    try {
      setProcessingAction(true);
      const response = await axios.post(`/api/admin/withdrawal/requests/${requestId}/reject`, {
        admin_note: adminNote
      });
      
      if (response.data.success) {
        Notification.success('Demande rejetée avec succès');
        setShowModal(false);
        fetchRequests();
      }
    } catch (error) {
      Notification.error('Erreur lors du rejet de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSaveNote = async (requestId) => {
    try {
      const response = await axios.post(`/api/admin/withdrawal/requests/${requestId}/note`, {
        admin_note: adminNote
      });
      
      if (response.data.success) {
        Notification.success('Note enregistrée avec succès');
      }
    } catch (error) {
      Notification.error('Erreur lors de l\'enregistrement de la note');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'rejected':
        return isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      case 'cancelled':
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XMarkIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const requestsArray = Array.isArray(requests) ? requests : [];
  const currentRequests = requestsArray.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requestsArray.length / requestsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (requestsArray.length === 0) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Aucune demande de retrait en cours
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Demandes de retrait
      </h1>
      
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ID
                </th>
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
                  Méthode de paiement
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
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {currentRequests.map((request) => (
                <tr
                  key={request.id}
                  className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {request.id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {request.user_name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {request.amount} $
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {request.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-1 rounded-full mr-2 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusColor(request.status)
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className={`inline-flex items-center px-3 py-1 border text-sm leading-4 font-medium rounded-md ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                      </button>
                      <button
                        onClick={() => {
                          setRequestToDelete(request);
                          setShowDeleteConfirmation(true);
                        }}
                        className={`inline-flex items-center px-3 py-1 border text-sm leading-4 font-medium rounded-md ${
                          isDarkMode 
                            ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                            : 'border-red-300 text-red-700 hover:bg-gray-100'
                        }`}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
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
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`
              }`}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}

      <FullScreenModal
        isOpen={showModal && selectedRequest !== null}
        onClose={() => setShowModal(false)}
        title="Détails de la demande"
        isDarkMode={isDarkMode}
      >
        {selectedRequest && (
          <>
            {/* Informations de base */}
            <div className={`mb-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Identifiant
                  </p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    #{selectedRequest.id}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Montant
                  </p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedRequest.amount} $
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Date
                  </p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedRequest.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Statut
                  </p>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedRequest.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedRequest.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedRequest.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRequest.status === 'pending' && (
                        <ClockIcon className="h-3 w-3 mr-1" />
                      )}
                      {selectedRequest.status === 'approved' && (
                        <CheckIcon className="h-3 w-3 mr-1" />
                      )}
                      {selectedRequest.status === 'rejected' && (
                        <XMarkIcon className="h-3 w-3 mr-1" />
                      )}
                      {selectedRequest.status === 'pending'
                        ? 'En attente'
                        : selectedRequest.status === 'approved'
                        ? 'Approuvée'
                        : selectedRequest.status === 'rejected'
                        ? 'Rejetée'
                        : selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Informations utilisateur */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Informations utilisateur
              </h3>
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Nom
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.user_name || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Email
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.user.email || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Téléphone
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.user.phone || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ID Utilisateur
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.user.account_id || 'Non spécifié'}
                    </p>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Détails de paiement */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Détails de paiement
              </h3>
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {selectedRequest.payment_details && Object.keys(selectedRequest.payment_details).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedRequest.payment_details).map(([key, value]) => {
                      // Ignorer les clés qui contiennent "url" ou "link"
                      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
                        return null;
                      }

                      // Traduire les clés techniques en libellés plus lisibles
                      const getTranslatedKey = (key) => {
                        const translations = {
                          'type': 'Type de paiement',
                          'phone_number': 'Numéro de téléphone',
                          'account_number': 'Numéro de compte',
                          'bank_name': 'Nom de la banque',
                          'bank_code': 'Code de la banque',
                          'branch_code': 'Code de l\'agence',
                          'iban': 'IBAN',
                          'swift_bic': 'Code SWIFT/BIC',
                          'account_holder': 'Titulaire du compte',
                          'email': 'Email PayPal',
                          'amount': 'Montant',
                          'fee': 'Frais',
                          'total': 'Total',
                          'commission': 'Commission',
                          'percentage': 'Pourcentage',
                          'country': 'Pays',
                          'currency': 'Devise',
                          'mobile_money_provider': 'Fournisseur Mobile Money',
                          'mobile_money_number': 'Numéro Mobile Money',
                          'card_number': 'Numéro de carte',
                          'card_holder': 'Titulaire de la carte',
                          'expiry_date': 'Date d\'expiration',
                          'cvv': 'CVV',
                          'address': 'Adresse',
                          'city': 'Ville',
                          'state': 'État/Province',
                          'postal_code': 'Code postal',
                          'country_code': 'Code pays',
                          'routing_number': 'Numéro de routage',
                          'account_type': 'Type de compte',
                          'wallet_address': 'Adresse de portefeuille',
                          'wallet_type': 'Type de portefeuille',
                          'network': 'Réseau',
                          'memo': 'Mémo',
                          'tag': 'Tag',
                          'note': 'Note',
                          'reference': 'Référence',
                          'description': 'Description',
                          'payment_method': 'Méthode de paiement',
                          'payment_type': 'Type de paiement',
                          'payment_details': 'Détails du paiement',
                          'payment_status': 'Statut du paiement',
                          'payment_date': 'Date du paiement',
                          'payment_id': 'ID du paiement',
                          'transaction_id': 'ID de transaction',
                          'transaction_date': 'Date de transaction',
                          'transaction_status': 'Statut de la transaction',
                          'transaction_type': 'Type de transaction',
                          'transaction_reference': 'Référence de transaction',
                          'transaction_description': 'Description de la transaction',
                          'transaction_note': 'Note de transaction',
                          'transaction_memo': 'Mémo de transaction',
                          'transaction_tag': 'Tag de transaction',
                          'transaction_amount': 'Montant de la transaction',
                          'transaction_fee': 'Frais de transaction',
                          'transaction_total': 'Total de la transaction',
                          'transaction_commission': 'Commission de transaction',
                          'transaction_percentage': 'Pourcentage de transaction',
                          'transaction_currency': 'Devise de la transaction',
                          'transaction_country': 'Pays de la transaction',
                          'transaction_country_code': 'Code pays de la transaction',
                          'transaction_address': 'Adresse de transaction',
                          'transaction_city': 'Ville de transaction',
                          'transaction_state': 'État/Province de transaction',
                          'transaction_postal_code': 'Code postal de transaction',
                          'transaction_routing_number': 'Numéro de routage de transaction',
                          'transaction_account_number': 'Numéro de compte de transaction',
                          'transaction_account_type': 'Type de compte de transaction',
                          'transaction_account_holder': 'Titulaire du compte de transaction',
                          'transaction_bank_name': 'Nom de la banque de transaction',
                          'transaction_bank_code': 'Code de la banque de transaction',
                          'transaction_branch_code': 'Code de l\'agence de transaction',
                          'transaction_iban': 'IBAN de transaction',
                          'transaction_swift_bic': 'Code SWIFT/BIC de transaction',
                          'transaction_wallet_address': 'Adresse de portefeuille de transaction',
                          'transaction_wallet_type': 'Type de portefeuille de transaction',
                          'transaction_network': 'Réseau de transaction',
                          
                        };
                        
                        return translations[key.toLowerCase()] || key;
                      };

                      // Formater les valeurs spéciales
                      const formatValue = (key, value) => {
                        if (key === 'phone_number' && typeof value === 'string') {
                          // Formater les numéros de téléphone
                          if (value.startsWith('+')) {
                            return value;
                          } else {
                            return `+${value}`;
                          }
                        } else if (
                          key === 'amount' || 
                          key === 'fee' || 
                          key === 'total' || 
                          key === 'commission'
                        ) {
                          // Ajouter le symbole $ pour les valeurs monétaires
                          return typeof value === 'string' ? value : value.toString();
                        } else if (key === 'percentage') {
                          // Ajouter le symbole % pour les pourcentages
                          return typeof value === 'string' ? value : value.toString();
                        }
                        
                        return typeof value === 'string' ? value : JSON.stringify(value);
                      };

                      if (typeof value === 'object' && value !== null) {
                        return (
                          <div key={key} className="border-t pt-2 first:border-t-0 first:pt-0">
                            <p className={`font-medium mb-2 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {getTranslatedKey(key)}
                            </p>
                            <div className="pl-4 space-y-2">
                              {Object.entries(value).map(([subKey, subValue]) => {
                                // Ignorer les clés qui contiennent "url" ou "link"
                                if (subKey.toLowerCase().includes('url') || subKey.toLowerCase().includes('link')) {
                                  return null;
                                }
                                
                                const formattedSubValue = formatValue(subKey, subValue);
                                
                                return (
                                  <div key={subKey} className="flex justify-between">
                                    <span className={`text-sm ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                      {getTranslatedKey(subKey)}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {subKey === 'amount' || subKey === 'fee' || subKey === 'total' || subKey === 'commission'
                                        ? `${formattedSubValue} $`
                                        : subKey === 'percentage'
                                          ? `${formattedSubValue}%`
                                          : formattedSubValue}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      const formattedValue = formatValue(key, value);
                      
                      return (
                        <div key={key} className="flex justify-between border-t pt-2 first:border-t-0 first:pt-0">
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {getTranslatedKey(key)}
                          </span>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {key === 'amount' || key === 'fee' || key === 'total' || key === 'commission'
                              ? `${formattedValue} $`
                              : key === 'percentage'
                                ? `${formattedValue}%`
                                : formattedValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Aucun détail de paiement disponible
                  </p>
                )}
              </div>
            </div>
            
            {/* Balance du système */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Balance du système
              </h3>
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Balance disponible
                  </span>
                  <span className={`font-medium ${
                    parseFloat(walletSystemBalance) < parseFloat(selectedRequest.amount) 
                      ? 'text-red-500' 
                      : isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {parseFloat(walletSystemBalance).toFixed(2)} $
                  </span>
                </div>
                {parseFloat(walletSystemBalance) < parseFloat(selectedRequest.amount) && (
                  <p className="mt-2 text-sm text-red-500">
                    La balance du système est insuffisante pour traiter cette demande.
                  </p>
                )}
              </div>
            </div>
            
            {/* Note d'administration */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Note d'administration
              </h3>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={3}
                placeholder="Ajouter une note (visible uniquement par les administrateurs)"
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={processingAction}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        isDarkMode 
                          ? 'border-green-600 text-green-400 hover:bg-green-900/20' 
                          : 'border-green-300 text-green-700 hover:bg-green-100'
                      } ${processingAction ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={processingAction}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        isDarkMode 
                          ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                          : 'border-red-300 text-red-700 hover:bg-gray-100'
                      } ${processingAction ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </FullScreenModal>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          handleDelete(requestToDelete?.id);
          setShowDeleteConfirmation(false);
        }}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer la demande #${requestToDelete?.id} ?`}
        confirmButtonText="Supprimer"
        cancelButtonText="Annuler"
        isDarkMode={isDarkMode}
        type="danger"
      />
    </div>
  );
}
