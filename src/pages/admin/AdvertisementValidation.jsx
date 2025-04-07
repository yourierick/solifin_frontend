import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  EyeIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon 
} from '@heroicons/react/24/outline';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AdvertisementValidation() {
  const [pendingItems, setPendingItems] = useState({
    advertisements: [],
    jobOffers: [],
    businessOpportunities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setIsLoading(true);
      const [advertisementsRes, jobOffersRes, businessOpportunitiesRes] = await Promise.all([
        axios.get('/api/admin/advertisements/pending'),
        axios.get('/api/admin/job-offers/pending'),
        axios.get('/api/admin/business-opportunities/pending')
      ]);

      setPendingItems({
        advertisements: advertisementsRes.data,
        jobOffers: jobOffersRes.data,
        businessOpportunities: businessOpportunitiesRes.data
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPreviewModal = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
    setIsPreviewModalOpen(false);
  };

  const openRejectModal = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
    setRejectionReason('');
    setIsRejectModalOpen(false);
  };

  const handleApprove = async (id, type) => {
    try {
      let endpoint = '';
      let stateKey = '';
      
      switch (type) {
        case 'advertisement':
          endpoint = `/api/admin/advertisements/${id}/approve`;
          stateKey = 'advertisements';
          break;
        case 'jobOffer':
          endpoint = `/api/admin/job-offers/${id}/approve`;
          stateKey = 'jobOffers';
          break;
        case 'businessOpportunity':
          endpoint = `/api/admin/business-opportunities/${id}/approve`;
          stateKey = 'businessOpportunities';
          break;
        default:
          return;
      }

      await axios.post(endpoint);
      
      // Mettre à jour la liste des items en attente
      setPendingItems(prev => ({
        ...prev,
        [stateKey]: prev[stateKey].filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
    }
  };
  
  const handleChangeEtat = async (id, type, newEtat) => {
    try {
      let endpoint = '';
      let stateKey = '';
      
      switch (type) {
        case 'advertisement':
          endpoint = `/api/admin/advertisements/${id}/etat`;
          stateKey = 'advertisements';
          break;
        case 'jobOffer':
          endpoint = `/api/admin/job-offers/${id}/etat`;
          stateKey = 'jobOffers';
          break;
        case 'businessOpportunity':
          endpoint = `/api/admin/business-opportunities/${id}/etat`;
          stateKey = 'businessOpportunities';
          break;
        default:
          return;
      }

      await axios.patch(endpoint, { etat: newEtat });
      
      // Mettre à jour la liste des items en attente
      setPendingItems(prev => ({
        ...prev,
        [stateKey]: prev[stateKey].map(item => 
          item.id === id ? { ...item, etat: newEtat } : item
        )
      }));
    } catch (error) {
      console.error("Erreur lors du changement d'état:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !selectedItemType) return;
    
    try {
      let endpoint = '';
      let stateKey = '';
      
      switch (selectedItemType) {
        case 'advertisement':
          endpoint = `/api/admin/advertisements/${selectedItem.id}/reject`;
          stateKey = 'advertisements';
          break;
        case 'jobOffer':
          endpoint = `/api/admin/job-offers/${selectedItem.id}/reject`;
          stateKey = 'jobOffers';
          break;
        case 'businessOpportunity':
          endpoint = `/api/admin/business-opportunities/${selectedItem.id}/reject`;
          stateKey = 'businessOpportunities';
          break;
        default:
          return;
      }

      await axios.post(endpoint, { reason: rejectionReason });
      
      // Mettre à jour la liste des items en attente
      setPendingItems(prev => ({
        ...prev,
        [stateKey]: prev[stateKey].filter(item => item.id !== selectedItem.id)
      }));
      
      closeRejectModal();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
    }
  };

  const renderItemList = (items, type) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>Aucun élément en attente de validation</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{item.titre}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {item.user?.nom} {item.user?.prenom} • {new Date(item.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${item.etat === 'disponible' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.etat === 'disponible' ? 'Disponible' : 'Terminé'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openPreviewModal(item, type)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                </button>
                <button
                  onClick={() => handleApprove(item.id, type)}
                  className="p-2 rounded-full hover:bg-green-100"
                >
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </button>
                <button
                  onClick={() => openRejectModal(item, type)}
                  className="p-2 rounded-full hover:bg-red-100"
                >
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                </button>
                <button
                  onClick={() => handleChangeEtat(item.id, type, item.etat === 'disponible' ? 'terminé' : 'disponible')}
                  className="p-2 rounded-full hover:bg-blue-100"
                >
                  <TagIcon className="h-5 w-5 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPreviewModal = () => {
    if (!selectedItem) return null;

    let details = [];

    // Configuration des détails selon le type
    if (selectedItemType === 'advertisement') {
      details = [
        { label: 'Catégorie', value: selectedItem.categorie === 'produit' ? 'Produit' : 'Service' },
        { label: 'Contacts', value: selectedItem.contacts },
        { label: 'Email', value: selectedItem.email },
        { label: 'Adresse', value: selectedItem.adresse },
        { label: 'Besoin de livreurs', value: selectedItem.besoin_livreurs },
        { label: 'Point de vente', value: selectedItem.point_vente },
        { label: 'Quantité disponible', value: selectedItem.quantite_disponible },
        { label: 'Prix unitaire', value: `${selectedItem.prix_unitaire_vente} ${selectedItem.devise}` },
      ];

      if (selectedItem.besoin_livreurs === 'OUI') {
        details.push(
          { label: 'Prix à la livraison', value: `${selectedItem.prix_unitaire_livraison} ${selectedItem.devise}` },
          { label: 'Conditions de livraison', value: selectedItem.conditions_livraison }
        );
      }
    } else if (selectedItemType === 'jobOffer') {
      details = [
        { label: 'Entreprise', value: selectedItem.entreprise },
        { label: 'Lieu', value: selectedItem.lieu },
        { label: 'Type de contrat', value: selectedItem.type_contrat },
        { label: 'Compétences requises', value: selectedItem.competences_requises },
        { label: 'Expérience requise', value: selectedItem.experience_requise },
        { label: 'Niveau d\'études', value: selectedItem.niveau_etudes },
        { label: 'Salaire', value: selectedItem.salaire ? `${selectedItem.salaire} ${selectedItem.devise}` : 'Non spécifié' },
        { label: 'Avantages', value: selectedItem.avantages },
        { label: 'Date limite', value: selectedItem.date_limite ? new Date(selectedItem.date_limite).toLocaleDateString() : 'Non spécifié' },
        { label: 'Email de contact', value: selectedItem.email_contact },
      ];
    } else if (selectedItemType === 'businessOpportunity') {
      details = [
        { label: 'Secteur', value: selectedItem.secteur },
        { label: 'Bénéfices attendus', value: selectedItem.benefices_attendus },
        { label: 'Investissement requis', value: selectedItem.investissement_requis ? `${selectedItem.investissement_requis} ${selectedItem.devise}` : 'Non spécifié' },
        { label: 'Durée de retour sur investissement', value: selectedItem.duree_retour_investissement },
        { label: 'Localisation', value: selectedItem.localisation },
        { label: 'Contacts', value: selectedItem.contacts },
        { label: 'Email', value: selectedItem.email },
        { label: 'Conditions de participation', value: selectedItem.conditions_participation },
        { label: 'Date limite', value: selectedItem.date_limite ? new Date(selectedItem.date_limite).toLocaleDateString() : 'Non spécifié' },
      ];
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Aperçu - {selectedItem.titre}
            </h3>
            <button
              onClick={closePreviewModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-xl mb-2">{selectedItem.titre}</h4>
              <p className="text-gray-700">{selectedItem.description}</p>
            </div>
            
            {selectedItem.image && (
              <div className="mt-4">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.titre} 
                  className="max-h-64 rounded-lg mx-auto object-contain"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {details.map((detail, index) => (
                <div key={index} className="border-b pb-2">
                  <span className="text-sm text-gray-500">{detail.label}</span>
                  <p className="font-medium">{detail.value || 'Non spécifié'}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  closePreviewModal();
                  openRejectModal(selectedItem, selectedItemType);
                }}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors flex items-center"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Rejeter
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedItem.id, selectedItemType);
                  closePreviewModal();
                }}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Approuver
              </button>
              <button
                onClick={() => {
                  handleChangeEtat(selectedItem.id, selectedItemType, selectedItem.etat === 'disponible' ? 'terminé' : 'disponible');
                  closePreviewModal();
                }}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors flex items-center"
              >
                <TagIcon className="h-5 w-5 mr-2" />
                Marquer comme {selectedItem.etat === 'disponible' ? 'terminé' : 'disponible'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRejectModal = () => {
    if (!selectedItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Raison du rejet
            </h3>
            <button
              onClick={closeRejectModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Veuillez fournir une raison pour le rejet de cette publication. Cela aidera l'utilisateur à comprendre pourquoi sa publication n'a pas été approuvée.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-32"
              placeholder="Raison du rejet..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 ${
                  !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Rejeter la publication
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validation des publications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les publications en attente de validation.
          </p>
        </div>
        <button
          onClick={fetchPendingItems}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Actualiser
        </button>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-t-lg bg-primary-50 p-1">
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white shadow text-primary-700'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
            )}>
              Publicités 
              {pendingItems.advertisements.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  {pendingItems.advertisements.length}
                </span>
              )}
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white shadow text-primary-700'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
            )}>
              Offres d'emploi
              {pendingItems.jobOffers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  {pendingItems.jobOffers.length}
                </span>
              )}
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white shadow text-primary-700'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
            )}>
              Opportunités d'affaires
              {pendingItems.businessOpportunities.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  {pendingItems.businessOpportunities.length}
                </span>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="p-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : renderItemList(pendingItems.advertisements, 'advertisement')}
            </Tab.Panel>
            <Tab.Panel className="p-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : renderItemList(pendingItems.jobOffers, 'jobOffer')}
            </Tab.Panel>
            <Tab.Panel className="p-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : renderItemList(pendingItems.businessOpportunities, 'businessOpportunity')}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Modals */}
      {isPreviewModalOpen && renderPreviewModal()}
      {isRejectModalOpen && renderRejectModal()}
    </div>
  );
}
