import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon, CheckCircleIcon, XCircleIcon, PencilIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { usePublicationPack } from '../../contexts/PublicationPackContext';
import Notification from '../../components/Notification';
import PublicationForm from './components/PublicationForm';
import PublicationCard from './components/PublicationCard';
import PublicationPackAlert from '../../components/PublicationPackAlert';
import PublicationDetailsModal from './components/PublicationDetailsModal';
import SearchFilterBar from './components/SearchFilterBar';

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

  // Gestionnaire pour la suppression d'une publication
  const handleDelete = (id, type) => {
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?');
    if (!confirmDelete) return;

    const apiPath = getPublicationTypeApiPath(type);
    
    axios.delete(`/api/${apiPath}/${id}`)
      .then(response => {
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
      })
      .catch(error => {
        console.error('Erreur lors de la suppression:', error);
      });
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
  const handleFormSubmit = (data) => {
    const isCreating = !isEditMode;
    const apiPath = getPublicationTypeApiPath(currentFormType);
    const method = isCreating ? 'post' : 'put';
    const url = isCreating ? `/api/${apiPath}` : `/api/${apiPath}/${currentPublication.id}`;
    
    axios[method](url, data)
      .then(response => {
        const newItem = response.data.data;
        
        // Mettre à jour l'état local en fonction du type de publication
        switch (currentFormType) {
          case 'advertisement':
            if (isCreating) {
              setPublications(prev => ({
                ...prev,
                advertisements: [...prev.advertisements, newItem]
              }));
            } else {
              setPublications(prev => ({
                ...prev,
                advertisements: prev.advertisements.map(ad => 
                  ad.id === newItem.id ? newItem : ad
                )
              }));
            }
            break;
          case 'jobOffer':
            if (isCreating) {
              setPublications(prev => ({
                ...prev,
                jobOffers: [...prev.jobOffers, newItem]
              }));
            } else {
              setPublications(prev => ({
                ...prev,
                jobOffers: prev.jobOffers.map(offer => 
                  offer.id === newItem.id ? newItem : offer
                )
              }));
            }
            break;
          case 'businessOpportunity':
            if (isCreating) {
              setPublications(prev => ({
                ...prev,
                businessOpportunities: [...prev.businessOpportunities, newItem]
              }));
            } else {
              setPublications(prev => ({
                ...prev,
                businessOpportunities: prev.businessOpportunities.map(opp => 
                  opp.id === newItem.id ? newItem : opp
                )
              }));
            }
            break;
          default:
            break;
        }
        
        // Fermer le formulaire
        handleFormClose();
      })
      .catch(error => {
        console.error('Erreur lors de la soumission:', error);
      });
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
  const getFilteredPublications = (type) => {
    let items = [];
    
    // Sélectionner les publications en fonction du type
    switch (type) {
      case 'advertisement':
        items = publications.advertisements || [];
        break;
      case 'jobOffer':
        items = publications.jobOffers || [];
        break;
      case 'businessOpportunity':
        items = publications.businessOpportunities || [];
        break;
      default:
        return [];
    }
    
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
    
    return items;
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
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header - Similar to Facebook */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 rounded-t-lg relative">
          {/* Cover Photo Area */}
        </div>
        <div className="px-6 pb-4 relative">
          <div className="flex items-end -mt-12 sm:items-center sm:flex-row flex-col">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {/* Profile Photo Area */}
              <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-700 text-4xl font-bold">
                {user?.nom?.charAt(0) || user?.prenom?.charAt(0) || "U"}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user?.nom} {user?.prenom}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredPublications('advertisement').length === 0 ? (
                    <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filters.statut !== 'tous' || filters.etat !== 'tous' || filters.dateRange !== 'tous' 
                        ? 'Aucune publicité ne correspond à vos critères de recherche.'
                        : 'Vous n\'avez pas encore de publicités.'}
                    </div>
                  ) : (
                    getFilteredPublications('advertisement').map((ad) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredPublications('jobOffer').length === 0 ? (
                    <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filters.statut !== 'tous' || filters.etat !== 'tous' || filters.dateRange !== 'tous' 
                        ? 'Aucune offre d\'emploi ne correspond à vos critères de recherche.'
                        : 'Vous n\'avez pas encore d\'offres d\'emploi.'}
                    </div>
                  ) : (
                    getFilteredPublications('jobOffer').map((offer) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredPublications('businessOpportunity').length === 0 ? (
                    <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filters.statut !== 'tous' || filters.etat !== 'tous' || filters.dateRange !== 'tous' 
                        ? 'Aucune opportunité d\'affaires ne correspond à vos critères de recherche.'
                        : 'Vous n\'avez pas encore d\'opportunités d\'affaires.'}
                    </div>
                  ) : (
                    getFilteredPublications('businessOpportunity').map((opportunity) => (
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
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Publication Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </div>
  );
}
