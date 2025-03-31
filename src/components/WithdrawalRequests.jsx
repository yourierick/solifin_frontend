import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import Notification from './Notification';
import {
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function WithdrawalRequests() {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [walletSystemBalance, setWalletSystemBalance] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/withdrawal/requests');
      if (response.data.success) {
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/admin/withdrawal/requests/${requestId}`);
      if (response.data.success) {
        Notification.success('Demande supprimée avec succès');
        fetchRequests();
      }
    } catch (error) {
      Notification.error('Erreur lors de la suppression de la demande');
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAdminNote(request.admin_note || '');
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingAction(true);
      const response = await axios.post(`/api/admin/withdrawal/requests/${selectedRequest.id}/approve`, {
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

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingAction(true);
      const response = await axios.post(`/api/admin/withdrawal/requests/${selectedRequest.id}/reject`, {
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
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(request.id)}
                          className={`inline-flex items-center px-3 py-1 border text-sm leading-4 font-medium rounded-md ${
                            isDarkMode 
                              ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                              : 'border-red-300 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                        </button>
                      )}
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

      {/* Modal de détails de la demande */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-lg w-full rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } p-6 relative max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Détails de la demande
            </h2>
            
            <div className="space-y-4">
              {/* Informations utilisateur et détails de la demande */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Utilisateur:
                  </span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {selectedRequest.user_name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Balance wallet:
                  </span>
                  <span className={`${
                    parseFloat(selectedRequest.wallet_balance) < parseFloat(selectedRequest.amount) 
                      ? 'text-red-500' 
                      : isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {selectedRequest.wallet_balance} $
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Montant demandé:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedRequest.amount} $
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Statut:
                  </span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusColor(selectedRequest.status)
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date:
                  </span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {/* Méthode de paiement */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Méthode de paiement
                </h3>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Méthode:
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {selectedRequest.payment_method}
                    </span>
                  </div>
                  
                  {selectedRequest.payment_details && (
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Détails:
                      </span>
                      <pre className={`mt-1 p-2 rounded text-xs ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                      } overflow-x-auto`}>
                        {JSON.stringify(selectedRequest.payment_details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Balance du système */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Balance du système
                  </h3>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Balance disponible:
                      </span>
                      <span className={`${
                        parseFloat(walletSystemBalance) < parseFloat(selectedRequest.amount) 
                          ? 'text-red-500' 
                          : isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {walletSystemBalance} $
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Note admin */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Note admin
                </h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={selectedRequest.status !== 'pending'}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300 text-gray-900 placeholder-gray-400'
                  } ${selectedRequest.status !== 'pending' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Ajouter une note (optionnel)"
                  rows="2"
                ></textarea>
              </div>
              
              {/* Boutons d'action */}
              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={handleReject}
                    disabled={processingAction}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      isDarkMode 
                        ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                        : 'border-red-300 text-red-700 hover:bg-red-100'
                    } ${processingAction ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Rejeter
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={
                      processingAction || 
                      parseFloat(selectedRequest.wallet_balance) < parseFloat(selectedRequest.amount) ||
                      parseFloat(walletSystemBalance) < parseFloat(selectedRequest.amount)
                    }
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      isDarkMode 
                        ? 'border-green-600 text-green-400 hover:bg-green-900/20' 
                        : 'border-green-300 text-green-700 hover:bg-green-100'
                    } ${
                      processingAction || 
                      parseFloat(selectedRequest.wallet_balance) < parseFloat(selectedRequest.amount) ||
                      parseFloat(walletSystemBalance) < parseFloat(selectedRequest.amount)
                        ? 'opacity-70 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approuver
                  </button>
                </div>
              )}
              
              {/* Message d'erreur pour les balances insuffisantes */}
              {selectedRequest.status === 'pending' && (
                parseFloat(selectedRequest.wallet_balance) < parseFloat(selectedRequest.amount) || 
                parseFloat(walletSystemBalance) < parseFloat(selectedRequest.amount)
              ) && (
                <div className={`mt-2 text-xs text-red-500 text-center`}>
                  {parseFloat(selectedRequest.wallet_balance) < parseFloat(selectedRequest.amount) 
                    ? "La balance de l'utilisateur est insuffisante pour cette demande." 
                    : "La balance du système est insuffisante pour traiter cette demande."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}