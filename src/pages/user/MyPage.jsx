import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon, CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { usePublicationPack } from '../../contexts/PublicationPackContext';
import Notification from '../../components/Notification';
import PublicationCard from './components/PublicationCard';
import PublicationForm from './components/PublicationForm';
import PublicationPackAlert from '../../components/PublicationPackAlert';
import PublicationDetailsModal from './components/PublicationDetailsModal';
import SearchFilterBar from './components/SearchFilterBar';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MyPage() {
  const [publications, setPublications] = useState({
    advertisements: [],
    jobOffers: [],
    businessOpportunities: []
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentFormType, setCurrentFormType] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPublication, setCurrentPublication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ id: null, type: null });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { isActive: isPackActive, packInfo, refreshPackStatus } = usePublicationPack();
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  
  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statut: 'tous', // 'tous', 'en_attente', 'approuvé', 'rejeté'
    etat: 'tous',   // 'tous', 'disponible', 'terminé'
    dateRange: 'tous' // 'tous', 'aujourd'hui', 'semaine', 'mois'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour la pagination
  const [pagination, setPagination] = useState({
    advertisements: { currentPage: 1, itemsPerPage: 3 },
    jobOffers: { currentPage: 1, itemsPerPage: 3 },
    businessOpportunities: { currentPage: 1, itemsPerPage: 3 }
  });

  useEffect(() => {
    // Vérifier le statut du pack de publication
    if (refreshPackStatus) {
      refreshPackStatus();
    }
    
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        // Fetch page statistics
        const pageResponse = await axios.get(`/api/my-page`);
        setSubscribersCount(pageResponse.data.page.nombre_abonnes);
        setLikesCount(pageResponse.data.page.nombre_likes);

        // Fetch all publication types
        setPublications({
          advertisements: pageResponse.data.page.publicites,
          jobOffers: pageResponse.data.page.offres_emploi,
          businessOpportunities: pageResponse.data.page.opportunites_affaires
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [user.id]);

  const handleFormOpen = (type) => {
    // Vérifier si le pack est actif avant d'ouvrir le formulaire
    if (!isPackActive) {
      // On ne fait rien si le pack n'est pas actif
      return;
    }
    setCurrentFormType(type);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setCurrentFormType(null);
    setIsEditMode(false);
    setCurrentPublication(null);
  };

  // Gestionnaire pour la modification d'une publication
  const handleEdit = (publication, type) => {
    setCurrentPublication(publication);
    setCurrentFormType(type);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Gestionnaire pour ouvrir le modal de confirmation de suppression
  const handleDelete = (id, type) => {
    setDeleteInfo({ id, type });
    setIsDeleteConfirmOpen(true);
  };

  // Gestionnaire pour confirmer la suppression
  const confirmDelete = async () => {
    const { id, type } = deleteInfo;
    const apiPath = getPublicationTypeApiPath(type);
    
    try {
      await axios.delete(`/api/${apiPath}/${id}`);
      
      // Mettre à jour l'état local en fonction du type de publication
      switch (type) {
        case 'advertisement':
          setPublications(prev => ({
            ...prev,
            advertisements: prev.advertisements.filter(ad => ad.id !== id)
          }));
          break;
        case 'jobOffer':
          setPublications(prev => ({
            ...prev,
            jobOffers: prev.jobOffers.filter(offer => offer.id !== id)
          }));
          break;
        case 'businessOpportunity':
          setPublications(prev => ({
            ...prev,
            businessOpportunities: prev.businessOpportunities.filter(opp => opp.id !== id)
          }));
          break;
        default:
          break;
      }
      
      // Afficher une notification de succès
      Notification.success('Publication supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Notification.error('Erreur lors de la suppression de la publication');
    } finally {
      // Fermer le modal de confirmation
      setIsDeleteConfirmOpen(false);
    }
  };

  // Gestionnaire pour le changement de statut d'une publication
  const handleStatusChange = (id, type, newStatus) => {
    updatePublicationStatus(id, type, newStatus);
  };

  // Gestionnaire pour le changement d'état d'une publication (disponible/terminé)
  const handleStateChange = (id, type, newState) => {
    const apiPath = getPublicationTypeApiPath(type);
    
    axios.patch(`/api/${apiPath}/${id}/state`, { etat: newState })
      .then(response => {
        // Mettre à jour l'état local en fonction du type de publication
        switch (type) {
          case 'advertisement':
            setPublications(prev => ({
              ...prev,
              advertisements: prev.advertisements.map(ad => 
                ad.id === id ? { ...ad, etat: newState } : ad
              )
            }));
            break;
          case 'jobOffer':
            setPublications(prev => ({
              ...prev,
              jobOffers: prev.jobOffers.map(offer => 
                offer.id === id ? { ...offer, etat: newState } : offer
              )
            }));
            break;
          case 'businessOpportunity':
            setPublications(prev => ({
              ...prev,
              businessOpportunities: prev.businessOpportunities.map(opp => 
                opp.id === id ? { ...opp, etat: newState } : opp
              )
            }));
            break;
          default:
            break;
        }
      })
      .catch(error => {
        console.error('Erreur lors du changement d\'état:', error);
      });
  };

  // Gestionnaire pour l'affichage des détails d'une publication
  const handleViewDetails = (publication, type) => {
    setCurrentPublication(publication);
    setCurrentFormType(type);
    setShowDetailsModal(true);
  };
  
  // Fermeture du modal de détails
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setCurrentPublication(null);
    setCurrentFormType(null);
  };

  // Gestionnaire pour la soumission du formulaire (création ou modification)
  const handleFormSubmit = async (data, customConfig = null) => {
    const isCreating = !isEditMode;
    const apiPath = getPublicationTypeApiPath(currentFormType);
    const url = isCreating ? `/api/${apiPath}` : `/api/${apiPath}/${currentPublication.id}`;
    
    try {
      // Utiliser la configuration personnalisée si elle est fournie, sinon utiliser la configuration par défaut
      const config = customConfig || {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      // Vérifier si l'objet data est bien un FormData
      if (!(data instanceof FormData)) {
        throw new Error('Format de données incorrect');
      }
      
      // Pour les mises à jour, utiliser POST avec _method=PUT au lieu de PUT directement
      // car PHP ne traite pas correctement les données multipart/form-data avec PUT
      if (!isCreating) {
        data.append('_method', 'PUT');
      }
      
      // Vérification pour le fichier PDF
      let hasPdfFile = false;
      
      // Créer une copie des entrées pour l'inspection
      const entries = Array.from(data.entries());
      
      // Parcourir toutes les entrées pour vérifier offer_file
      for (let pair of entries) {
        const [key, value] = pair;
        
        if (key === 'offer_file') {
          hasPdfFile = true;
        }
      }
      
      for (let pair of data.entries()) {
        // Si c'est conditions_livraison, s'assurer que c'est un tableau
        if (pair[0] === 'conditions_livraison') {
          // Convertir en tableau si ce n'est pas déjà fait
          let conditions = pair[1];
          if (typeof conditions === 'string') {
            try {
              conditions = JSON.parse(conditions);
            } catch (e) {
              conditions = [];
            }
          }
          if (!Array.isArray(conditions)) {
            conditions = [];
          }
          // Remplacer la valeur dans le FormData
          data.delete('conditions_livraison');
          data.append('conditions_livraison', JSON.stringify(conditions));
        }
      }
      
      // Toujours utiliser POST, avec _method=PUT pour les mises à jour
      const response = await axios.post(url, data, config);
      
      // Recharger toutes les données après une création ou modification
      // pour s'assurer que nous avons les données les plus à jour
      const pageResponse = await axios.get(`/api/my-page`);
      
      // Mettre à jour toutes les publications avec les données fraîches de l'API
      setPublications({
        advertisements: pageResponse.data.page.publicites || [],
        jobOffers: pageResponse.data.page.offres_emploi || [],
        businessOpportunities: pageResponse.data.page.opportunites_affaires || []
      });
      
      // Mettre à jour les statistiques de la page
      setSubscribersCount(pageResponse.data.page.nombre_abonnes);
      setLikesCount(pageResponse.data.page.nombre_likes);
      
      // Fermer le formulaire
      handleFormClose();
      
      // Retourner true pour indiquer le succès
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      // Afficher une notification d'erreur
      let errorMessage = 'Une erreur est survenue lors de la soumission';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      Notification.error(errorMessage);
      
      // Propager l'erreur au composant PublicationForm pour qu'il puisse réinitialiser isSubmitting
      throw error;
    }
  };

  // Fonction pour mettre à jour le statut d'une publication
  const updatePublicationStatus = (id, type, newStatus) => {
    const apiPath = getPublicationTypeApiPath(type);
    
    axios.patch(`/api/${apiPath}/${id}/status`, { statut: newStatus })
      .then(response => {
        // Mettre à jour l'état local en fonction du type de publication
        switch (type) {
          case 'advertisement':
            setPublications(prev => ({
              ...prev,
              advertisements: prev.advertisements.map(ad => 
                ad.id === id ? { ...ad, statut: newStatus } : ad
              )
            }));
            break;
          case 'jobOffer':
            setPublications(prev => ({
              ...prev,
              jobOffers: prev.jobOffers.map(offer => 
                offer.id === id ? { ...offer, statut: newStatus } : offer
              )
            }));
            break;
          case 'businessOpportunity':
            setPublications(prev => ({
              ...prev,
              businessOpportunities: prev.businessOpportunities.map(opp => 
                opp.id === id ? { ...opp, statut: newStatus } : opp
              )
            }));
            break;
          default:
            break;
        }
      })
      .catch(error => {
        console.error('Erreur lors du changement de statut:', error);
      });
  };

  // Fonction pour obtenir le chemin API en fonction du type de publication
  const getPublicationTypeApiPath = (type) => {
    switch (type) {
      case 'advertisement': return 'publicites';
      case 'jobOffer': return 'offres-emploi';
      case 'businessOpportunity': return 'opportunites-affaires';
      default: return '';
    }
  };

  // Fonction pour filtrer les publications en fonction des critères de recherche et de filtrage
  const getFilteredPublications = (type, paginate = false) => {
    let items = [];
    let paginationType = '';
    
    // Sélectionner les publications en fonction du type
    switch (type) {
      case 'advertisement':
        items = publications.advertisements || [];
        paginationType = 'advertisements';
        break;
      case 'jobOffer':
        items = publications.jobOffers || [];
        paginationType = 'jobOffers';
        break;
      case 'businessOpportunity':
        items = publications.businessOpportunities || [];
        paginationType = 'businessOpportunities';
        break;
      default:
        return [];
    }
    
    // S'assurer que tous les éléments sont définis et ont un ID
    items = items.filter(item => item && item.id);
    
    // Appliquer la recherche textuelle
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        (item.titre && item.titre.toLowerCase().includes(term)) || 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.contacts && item.contacts.toLowerCase().includes(term)) ||
        (item.adresse && item.adresse.toLowerCase().includes(term))
      );
    }
    
    // Appliquer les filtres
    if (filters.statut !== 'tous') {
      items = items.filter(item => item.statut === filters.statut);
    }
    
    if (filters.etat !== 'tous') {
      items = items.filter(item => item.etat === filters.etat);
    }
    
    // Filtrer par plage de dates
    if (filters.dateRange !== 'tous') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      items = items.filter(item => {
        if (!item.created_at) return false;
        
        const itemDate = new Date(item.created_at);
        
        switch (filters.dateRange) {
          case 'aujourd\'hui':
            return itemDate >= today;
          case 'semaine':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return itemDate >= weekAgo;
          case 'mois':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return itemDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    // Si la pagination est activée, retourner seulement les éléments de la page actuelle
    if (paginate && paginationType) {
      const { currentPage, itemsPerPage } = pagination[paginationType];
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return items.slice(startIndex, endIndex);
    }
    
    return items;
  };
  
  // Fonction pour obtenir le nombre total de pages pour un type de publication
  const getTotalPages = (type) => {
    const items = getFilteredPublications(type, false);
    let paginationType = '';
    
    switch (type) {
      case 'advertisement':
        paginationType = 'advertisements';
        break;
      case 'jobOffer':
        paginationType = 'jobOffers';
        break;
      case 'businessOpportunity':
        paginationType = 'businessOpportunities';
        break;
      default:
        return 1;
    }
    
    const { itemsPerPage } = pagination[paginationType];
    return Math.ceil(items.length / itemsPerPage) || 1;
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      statut: 'tous',
      etat: 'tous',
      dateRange: 'tous'
    });
    setShowFilters(false);
  };
  
  // Fonction pour mettre à jour un filtre spécifique
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Réinitialiser la pagination à la première page lorsqu'un filtre change
    setPagination(prev => ({
      advertisements: { ...prev.advertisements, currentPage: 1 },
      jobOffers: { ...prev.jobOffers, currentPage: 1 },
      businessOpportunities: { ...prev.businessOpportunities, currentPage: 1 }
    }));
  };
  
  // Fonction pour gérer le changement de page
  const handlePageChange = (type, newPage) => {
    setPagination(prev => ({
      ...prev,
      [type]: { ...prev[type], currentPage: newPage }
    }));
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-2">
      {/* Page Header - Similar to Facebook */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 rounded-t-lg relative">
          {/* Cover Photo Area */}
        </div>
        <div className="px-6 pb-4 relative">
          <div className="flex items-end -mt-12 sm:items-center sm:flex-row flex-col">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={`Photo de profil de ${user.name}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // En cas d'erreur de chargement de l'image, afficher les initiales
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.fallback-initials').style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`fallback-initials h-full w-full flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-4xl font-bold ${user?.picture ? 'hidden' : ''}`}
              >
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscribersCount} abonnés · {likesCount} mentions j'aime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert si le pack n'est pas actif */}
      {!isPackActive && <PublicationPackAlert isActive={isPackActive} packInfo={packInfo} />}
      
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-t-lg bg-primary-50 dark:bg-gray-700 p-1">
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-600 shadow text-primary-700 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-primary-600'
            )}>
              Publicités
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-600 shadow text-primary-700 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-primary-600'
            )}>
              Offres d'emploi
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-600 shadow text-primary-700 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-primary-600'
            )}>
              Opportunités d'affaires
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Advertisements Panel */}
            <Tab.Panel className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mes publicités</h2>
                <button
                  onClick={() => handleFormOpen('advertisement')}
                  className={`flex items-center gap-2 px-4 py-2 ${isPackActive ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg transition-colors`}
                  disabled={!isPackActive}
                  title={!isPackActive ? 'Veuillez activer votre pack de publication pour créer une publicité' : ''}
                >
                  <PlusIcon className="h-5 w-5" />
                  Créer une publicité
                </button>
              </div>
              
              {/* Barre de recherche et filtres */}
              <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                handleFilterChange={handleFilterChange}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                resetFilters={resetFilters}
              />
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredPublications('advertisement', false).length === 0 ? (
                      <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm || filters.statut !== 'tous' || filters.etat !== 'tous' || filters.dateRange !== 'tous' 
                          ? 'Aucune publicité ne correspond à vos critères de recherche.'
                          : 'Vous n\'avez pas encore de publicités.'}
                      </div>
                    ) : (
                      getFilteredPublications('advertisement', true).map((ad) => (
                        <PublicationCard
                          key={ad.id}
                          publication={ad}
                          type="advertisement"
                          onEdit={() => handleEdit(ad, 'advertisement')}
                          onDelete={() => handleDelete(ad.id, 'advertisement')}
                          onViewDetails={() => handleViewDetails(ad, 'advertisement')}
                          onStateChange={(newState) => handleStateChange(ad.id, 'advertisement', newState)}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* Pagination pour les publicités */}
                  {getFilteredPublications('advertisement', false).length > 0 && (
                    <Pagination
                      currentPage={pagination.advertisements.currentPage}
                      totalPages={getTotalPages('advertisement')}
                      onPageChange={(page) => handlePageChange('advertisements', page)}
                    />
                  )}
                </>
              )}
            </Tab.Panel>
            
            {/* Job Offers Panel */}
            <Tab.Panel className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mes offres d'emploi</h2>
                <button
                  onClick={() => handleFormOpen('jobOffer')}
                  className={`flex items-center gap-2 px-4 py-2 ${isPackActive ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg transition-colors`}
                  disabled={!isPackActive}
                  title={!isPackActive ? 'Veuillez activer votre pack de publication pour créer une offre d\'emploi' : ''}
                >
                  <PlusIcon className="h-5 w-5" />
                  Créer une offre d'emploi
                </button>
              </div>
              
              {/* Barre de recherche et filtres */}
              <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                handleFilterChange={handleFilterChange}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                resetFilters={resetFilters}
              />
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredPublications('jobOffer', false).length === 0 ? (
                      <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm || filters.statut !== 'tous' || filters.etat !== 'tous' || filters.dateRange !== 'tous' 
                          ? 'Aucune offre d\'emploi ne correspond à vos critères de recherche.'
                          : 'Vous n\'avez pas encore d\'offres d\'emploi.'}
                      </div>
                    ) : (
                      getFilteredPublications('jobOffer', true).map((offer) => (
                        <PublicationCard
                          key={offer.id}
                          publication={offer}
                          type="jobOffer"
                          onEdit={() => handleEdit(offer, 'jobOffer')}
                          onDelete={() => handleDelete(offer.id, 'jobOffer')}
                          onViewDetails={() => handleViewDetails(offer, 'jobOffer')}
                          onStateChange={(newState) => handleStateChange(offer.id, 'jobOffer', newState)}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* Pagination pour les offres d'emploi */}
                  {getFilteredPublications('jobOffer', false).length > 0 && (
                    <Pagination
                      currentPage={pagination.jobOffers.currentPage}
                      totalPages={getTotalPages('jobOffer')}
                      onPageChange={(page) => handlePageChange('jobOffers', page)}
                    />
                  )}
                </>
              )}
            </Tab.Panel>
            
            {/* Business Opportunities Panel */}
            <Tab.Panel className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mes opportunités d'affaires</h2>
                <button
                  onClick={() => handleFormOpen('businessOpportunity')}
                  className={`flex items-center gap-2 px-4 py-2 ${isPackActive ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg transition-colors`}
                  disabled={!isPackActive}
                  title={!isPackActive ? 'Veuillez activer votre pack de publication pour créer une opportunité d\'affaire' : ''}
                >
                  <PlusIcon className="h-5 w-5" />
                  Créer une opportunité
                </button>
              </div>
              
              {/* Barre de recherche et filtres */}
              <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                handleFilterChange={handleFilterChange}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                resetFilters={resetFilters}
              />
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredPublications('businessOpportunity', false).length === 0 ? (
                      <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm || filters.statut !== 'tous' || filters.etat !== 'tous' || filters.dateRange !== 'tous' 
                          ? 'Aucune opportunité d\'affaires ne correspond à vos critères de recherche.'
                          : 'Vous n\'avez pas encore d\'opportunités d\'affaires.'}
                      </div>
                    ) : (
                      getFilteredPublications('businessOpportunity', true).map((opportunity) => (
                        <PublicationCard
                          key={opportunity.id}
                          publication={opportunity}
                          type="businessOpportunity"
                          onEdit={() => handleEdit(opportunity, 'businessOpportunity')}
                          onDelete={() => handleDelete(opportunity.id, 'businessOpportunity')}
                          onViewDetails={() => handleViewDetails(opportunity, 'businessOpportunity')}
                          onStateChange={(newState) => handleStateChange(opportunity.id, 'businessOpportunity', newState)}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* Pagination pour les opportunités d'affaires */}
                  {getFilteredPublications('businessOpportunity', false).length > 0 && (
                    <Pagination
                      currentPage={pagination.businessOpportunities.currentPage}
                      totalPages={getTotalPages('businessOpportunity')}
                      onPageChange={(page) => handlePageChange('businessOpportunities', page)}
                    />
                  )}
                </>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Publication Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditMode ? 'Modifier' : 'Créer'} {' '}
                {currentFormType === 'advertisement' && 'une publicité'}
                {currentFormType === 'jobOffer' && "une offre d'emploi"}
                {currentFormType === 'businessOpportunity' && "une opportunité d'affaires"}
              </h3>
              <button
                onClick={handleFormClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <PublicationForm
                type={currentFormType}
                initialData={currentPublication}
                isEditMode={isEditMode}
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {/* Publication Details Modal */}
      {showDetailsModal && currentPublication && (
        <PublicationDetailsModal
          isOpen={showDetailsModal}
          publication={currentPublication}
          type={currentFormType}
          onClose={handleCloseDetailsModal}
          onEdit={() => {
            handleCloseDetailsModal();
            handleEdit(currentPublication, currentFormType);
          }}
          onDelete={() => {
            handleCloseDetailsModal();
            handleDelete(currentPublication.id, currentFormType);
          }}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirmation de suppression"
        size="md"
      >
        <div className="mt-2 mb-6">
          <div className="flex items-center justify-center mb-4 text-orange-500">
            <ExclamationTriangleIcon className="h-12 w-12" />
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette publication ?
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
            Cette action est irréversible et supprimera définitivement la publication.  
          </p>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200 transition-colors"
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
            onClick={confirmDelete}
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
