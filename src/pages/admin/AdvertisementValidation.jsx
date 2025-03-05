import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { useToast } from '../../hooks/useToast';

export default function AdvertisementValidation() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [validationNote, setValidationNote] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState(null);
  const [validationHistory, setValidationHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    published: '',
    search: '',
    start_date: '',
    end_date: '',
    sort_field: 'created_at',
    sort_direction: 'desc'
  });
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAdvertisements();
  }, [filters]);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axios.get(`/api/admin/advertisements/pending?${params}`);
      setAdvertisements(response.data.data.advertisements);
    } catch (error) {
      showToast('Erreur lors du chargement des publicités', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadValidationHistory = async (adId) => {
    try {
      const response = await axios.get(`/api/admin/advertisements/${adId}/history`);
      setValidationHistory(response.data.data.validations);
      setShowHistoryModal(true);
    } catch (error) {
      showToast('Erreur lors du chargement de l\'historique', 'error');
    }
  };

  const handleValidationClick = (ad, action) => {
    setSelectedAd(ad);
    setValidationAction(action);
    setValidationNote('');
    setShowValidationModal(true);
  };

  const handleValidation = async () => {
    try {
      const endpoint = `/api/admin/advertisements/${selectedAd.id}/${validationAction}`;
      const response = await axios.post(endpoint, { note: validationNote });
      
      showToast(
        response.data.message,
        'success'
      );
      
      setShowValidationModal(false);
      loadAdvertisements();
    } catch (error) {
      showToast('Erreur lors de la validation', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>,
      approved: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approuvée</span>,
      rejected: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejetée</span>
    };
    return badges[status] || status;
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sort_field: field,
      sort_direction: prev.sort_field === field && prev.sort_direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (field) => {
    if (filters.sort_field !== field) return null;
    return filters.sort_direction === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4" /> : 
      <ChevronDownIcon className="w-4 h-4" />;
  };

  const renderValidationModal = () => (
    <Modal
      isOpen={showValidationModal}
      onClose={() => setShowValidationModal(false)}
      title={`${validationAction === 'approve' ? 'Approuver' : 'Rejeter'} la publicité`}
    >
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium">{selectedAd?.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{selectedAd?.description}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Note de {validationAction === 'approve' ? 'validation' : 'rejet'}
            {validationAction === 'reject' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            className="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 p-2"
            rows="4"
            value={validationNote}
            onChange={(e) => setValidationNote(e.target.value)}
            placeholder={
              validationAction === 'approve'
                ? 'Ajouter une note (optionnel)'
                : 'Veuillez expliquer la raison du rejet'
            }
            required={validationAction === 'reject'}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowValidationModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant={validationAction === 'approve' ? 'success' : 'danger'}
            onClick={handleValidation}
            disabled={validationAction === 'reject' && !validationNote.trim()}
          >
            {validationAction === 'approve' ? 'Approuver' : 'Rejeter'}
          </Button>
        </div>
      </div>
    </Modal>
  );

  const renderHistoryModal = () => (
    <Modal
      isOpen={showHistoryModal}
      onClose={() => setShowHistoryModal(false)}
      title="Historique des validations"
    >
      <div className="space-y-4">
        {validationHistory.map((validation) => (
          <div
            key={validation.id}
            className="border-l-4 border-blue-500 pl-4 py-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">
                  {validation.user.name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {' '}a {validation.action === 'submit' ? 'soumis' :
                    validation.action === 'approve' ? 'approuvé' :
                    validation.action === 'reject' ? 'rejeté' :
                    validation.action === 'publish' ? 'publié' : 'dépublié'
                  } la publicité
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(validation.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
              </span>
            </div>
            {validation.note && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Note: {validation.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );

  const renderFiltersModal = () => (
    <Modal
      isOpen={showFiltersModal}
      onClose={() => setShowFiltersModal(false)}
      title="Filtrer les publicités"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Statut
          </label>
          <select
            className="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 p-2"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvée</option>
            <option value="rejected">Rejetée</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Publication
          </label>
          <select
            className="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 p-2"
            value={filters.published}
            onChange={(e) => setFilters(prev => ({ ...prev, published: e.target.value }))}
          >
            <option value="">Tous</option>
            <option value="true">Publiée</option>
            <option value="false">Non publiée</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de début
          </label>
          <input
            type="date"
            className="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 p-2"
            value={filters.start_date}
            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            className="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 p-2"
            value={filters.end_date}
            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({
                status: '',
                published: '',
                search: '',
                start_date: '',
                end_date: '',
                sort_field: 'created_at',
                sort_direction: 'desc'
              });
              setShowFiltersModal(false);
            }}
          >
            Réinitialiser
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowFiltersModal(false)}
          >
            Appliquer
          </Button>
        </div>
      </div>
    </Modal>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestion des publicités
        </h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 pl-10 pr-4 py-2"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFiltersModal(true)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtres
          </Button>
          <Button
            variant="primary"
            onClick={loadAdvertisements}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {advertisements.length === 0 ? (
        <Alert
          type="info"
          message="Aucune publicité trouvée"
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Publicité
                      {renderSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('user.name')}
                  >
                    <div className="flex items-center">
                      Annonceur
                      {renderSortIcon('user.name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Soumis le
                      {renderSortIcon('created_at')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {advertisements.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {ad.image_path && (
                          <img
                            src={ad.image_path}
                            alt={ad.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{ad.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {ad.description.substring(0, 100)}
                            {ad.description.length > 100 && '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">{ad.user.name}</div>
                        <div className="text-gray-500 dark:text-gray-400">{ad.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(ad.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ad.validation_status)}
                      {ad.is_published && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Publiée
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadValidationHistory(ad.id)}
                        title="Voir l'historique"
                      >
                        <ClockIcon className="w-4 h-4" />
                      </Button>
                      {ad.validation_status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleValidationClick(ad, 'approve')}
                            title="Approuver"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleValidationClick(ad, 'reject')}
                            title="Rejeter"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {renderValidationModal()}
      {renderHistoryModal()}
      {renderFiltersModal()}
    </div>
  );
}
