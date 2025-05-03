import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Tab, Menu, Transition } from '@headlessui/react';
import {
  NewspaperIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  ShareIcon,
  UsersIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  LinkIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import PostCard from './components/PostCard';
import PostDetailModal from './components/PostDetailModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Page() {
  const { id } = useParams(); // Récupérer l'ID de la page depuis l'URL
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostType, setSelectedPostType] = useState(null);
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'recent', 'expired'
  const [openShareMenuId, setOpenShareMenuId] = useState(null); // Pour gérer les menus de partage
  const [expandedComments, setExpandedComments] = useState({}); // Pour suivre les commentaires affichés par publication
  
  // Références pour les sections de la page
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  // Charger les données de la page
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/pages/${id}`);
        console.log(response);
        if (response.data.success) {
          setPageData(response.data.page);
          setIsSubscribed(response.data.isSubscribed);
        } else {
          setError('Impossible de charger les données de la page');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la page:', err);
        setError('Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPageData();
    }
  }, [id, user]);
    // Gérer l'abonnement à la page
    const handleSubscribe = async () => {
      if (!user) {
        toast.error('Vous devez être connecté pour vous abonner à cette page');
        return;
      }
  
      try {
        const response = await axios.post(`/api/pages/${id}/subscribe`);
        if (response.data.success) {
          
          setIsSubscribed(true);
          // Mettre à jour le nombre d'abonnés
          setPageData(prev => ({
            ...prev,
            nombre_abonnes: prev.nombre_abonnes + 1
          }));
          toast.success(response.data.message || 'Vous êtes maintenant abonné à cette page');
        }
      } catch (err) {
        console.error('Erreur lors de l\'abonnement:', err);
        toast.error(err.response?.data?.message || 'Erreur lors de l\'abonnement');
      }
    };
  
    // Gérer le désabonnement de la page
    const handleUnsubscribe = async () => {
      try {
        const response = await axios.post(`/api/pages/${id}/unsubscribe`);
        if (response.data.success) {
          setIsSubscribed(false);
          // Mettre à jour le nombre d'abonnés
          setPageData(prev => ({
            ...prev,
            nombre_abonnes: Math.max(0, prev.nombre_abonnes - 1)
          }));
          toast.success(response.data.message || 'Vous êtes maintenant désabonné de cette page');
        }
      } catch (err) {
        console.error('Erreur lors du désabonnement:', err);
        toast.error(err.response?.data?.message || 'Erreur lors du désabonnement');
      }
    };
  
    // Gérer l'action "J'aime"
    const handleLike = async (postId, postType) => {
      if (!user) {
        toast.error('Vous devez être connecté pour aimer une publication');
        return;
      }

      try {
        let endpoint;
        switch (postType) {
          case 'publicites':
            endpoint = `/api/publicites/${postId}/like`;
            break;
          case 'offres-emploi':
            endpoint = `/api/offres-emploi/${postId}/like`;
            break;
          case 'opportunites-affaires':
            endpoint = `/api/opportunites-affaires/${postId}/like`;
            break;
          default:
            return;
        }

        const response = await axios.post(endpoint);
        
        if (response.data.success) {
          // Mettre à jour l'état local pour refléter le changement de like
          const liked = response.data.liked;
          
          // Trouver la publication dans l'état local
          let updatedPageData = { ...pageData };
          let publication;
          
          if (postType === 'publicites') {
            const index = updatedPageData.publicites.findIndex(p => p.id === postId);
            if (index !== -1) {
              updatedPageData.publicites[index].liked_by_current_user = liked;
              updatedPageData.publicites[index].likes_count = liked 
                ? (updatedPageData.publicites[index].likes_count || 0) + 1 
                : Math.max(0, (updatedPageData.publicites[index].likes_count || 1) - 1);
              publication = updatedPageData.publicites[index];
            }
          } else if (postType === 'offres-emploi') {
            const index = updatedPageData.offresEmploi.findIndex(p => p.id === postId);
            if (index !== -1) {
              updatedPageData.offresEmploi[index].liked_by_current_user = liked;
              updatedPageData.offresEmploi[index].likes_count = liked 
                ? (updatedPageData.offresEmploi[index].likes_count || 0) + 1 
                : Math.max(0, (updatedPageData.offresEmploi[index].likes_count || 1) - 1);
              publication = updatedPageData.offresEmploi[index];
            }
          } else if (postType === 'opportunites-affaires') {
            const index = updatedPageData.opportunitesAffaires.findIndex(p => p.id === postId);
            if (index !== -1) {
              updatedPageData.opportunitesAffaires[index].liked_by_current_user = liked;
              updatedPageData.opportunitesAffaires[index].likes_count = liked 
                ? (updatedPageData.opportunitesAffaires[index].likes_count || 0) + 1 
                : Math.max(0, (updatedPageData.opportunitesAffaires[index].likes_count || 1) - 1);
              publication = updatedPageData.opportunitesAffaires[index];
            }
          }
          
          // Mettre à jour le nombre total de likes de la page
          updatedPageData.nombre_likes = liked
            ? (updatedPageData.nombre_likes || 0) + 1
            : Math.max(0, (updatedPageData.nombre_likes || 1) - 1);
          
          // Mettre à jour l'état global de la page
          setPageData(updatedPageData);
          
          // Mettre à jour également le post sélectionné si c'est le même
          if (selectedPost && selectedPost.id === postId && selectedPost.type === postType) {
            setSelectedPost({
              ...selectedPost,
              liked_by_current_user: liked,
              likes_count: liked 
                ? (selectedPost.likes_count || 0) + 1 
                : Math.max(0, (selectedPost.likes_count || 1) - 1)
            });
          }
          
          // Afficher un message toast approprié
          if (liked) {
            toast.success(`Vous avez aimé cette ${postType === 'publicites' ? 'publication' : postType === 'offres-emploi' ? 'offre d\'emploi' : 'opportunité d\'affaires'}`);
          } else {
            toast.info(`Vous n'aimez plus cette ${postType === 'publicites' ? 'publication' : postType === 'offres-emploi' ? 'offre d\'emploi' : 'opportunité d\'affaires'}`);
          }
        }
      } catch (err) {
        console.error('Erreur lors du like:', err);
        toast.error(err.response?.data?.message || 'Erreur lors de l\'action "J\'aime"');
      }
    };
  
    // Mettre à jour les likes d'un post dans le state local
    const updatePostLikes = (postId, postType) => {
      if (!pageData) return;
      
      let key;
      switch (postType) {
        case 'publicites':
          key = 'publicites';
          break;
        case 'offres-emploi':
          key = 'offresEmploi';
          break;
        case 'opportunites-affaires':
          key = 'opportunitesAffaires';
          break;
        default:
          return;
      }
      
      if (!pageData[key]) return;
      
      const updatedPosts = pageData[key].map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked_by_current_user: true,
            likes_count: (post.likes_count || 0) + 1
          };
        }
        return post;
      });
      
      setPageData(prev => ({
        ...prev,
        [key]: updatedPosts
      }));
      
      return updatedPosts;
    };
      // Ouvrir le modal de détail d'un post
      const openPostDetail = async (postId, type) => {
        if (!postId) return;
        
        try {
          // Utiliser directement les données déjà disponibles sans faire de requête supplémentaire
          let publication;
          
          if (type === 'publicites') {
            publication = pageData.publicites.find(pub => pub.id === postId);
          } else if (type === 'offres-emploi') {
            publication = pageData.offresEmploi.find(offre => offre.id === postId);
          } else if (type === 'opportunites-affaires') {
            publication = pageData.opportunitesAffaires.find(opp => opp.id === postId);
          }
          
          if (publication) {
            // S'assurer que la publication a la structure attendue par PostDetailModal
            setSelectedPost({
              ...publication,
              type: type,
              page: {
                user: pageData.user,
                id: pageData.id,
                nom: pageData.nom
              }
            });
            setIsPostDetailModalOpen(true);
          } else {
            // Si la publication n'est pas dans les données déjà chargées, faire une requête
            const endpoint = type === 'publicites' 
              ? `/api/publicites/${postId}` 
              : type === 'offres-emploi' 
                ? `/api/offres-emploi/${postId}` 
                : `/api/opportunites-affaires/${postId}`;
                
            const response = await axios.get(endpoint);
            
            if (response.data.success) {
              setSelectedPost({
                ...response.data.publication,
                type: type,
                page: {
                  user: pageData.user,
                  id: pageData.id,
                  nom: pageData.nom
                }
              });
              setIsPostDetailModalOpen(true);
            } else {
              toast.error('Impossible de charger les détails de la publication');
            }
          }
        } catch (err) {
          console.error('Erreur lors de l\'ouverture du détail:', err);
          toast.error('Erreur lors de l\'ouverture du détail de la publication');
        }
      };
    
      // Ajouter un commentaire à une publication
      const handleAddComment = async (postId, content, postType) => {
        if (!user) {
          toast.error('Vous devez être connecté pour commenter');
          return;
        }
    
        try {
          let endpoint;
          switch (postType) {
            case 'publicites':
              endpoint = `/api/publicites/${postId}/comment`;
              break;
            case 'offres-emploi':
              endpoint = `/api/offres-emploi/${postId}/comment`;
              break;
            case 'opportunites-affaires':
              endpoint = `/api/opportunites-affaires/${postId}/comment`;
              break;
            default:
              return;
          }
    
          const response = await axios.post(endpoint, { content });
          
          if (response.data.success) {
            // Si le post est actuellement ouvert dans le modal, mettre à jour également
            if (selectedPost && selectedPost.id === postId && selectedPost.type === postType) {
              const updatedComments = [...(selectedPost.comments || []), response.data.comment];
              setSelectedPost(prev => ({
                ...prev,
                comments: updatedComments,
                comments_count: updatedComments.length
              }));
            }
            
            toast.success('Commentaire ajouté avec succès');
          }
        } catch (err) {
          console.error('Erreur lors de l\'ajout du commentaire:', err);
          toast.error('Erreur lors de l\'ajout du commentaire');
        }
      };
    
      // Filtrer les publications en fonction de la recherche et des filtres
      const getFilteredPublications = (postType) => {
        if (!pageData) return [];
        
        let publications;
        switch (postType) {
          case 'publicites':
            publications = pageData.publicites || [];
            break;
          case 'offres-emploi':
            publications = pageData.offresEmploi || [];
            break;
          case 'opportunites-affaires':
            publications = pageData.opportunitesAffaires || [];
            break;
          default:
            return [];
        }
        
        // Filtrer par recherche
        let filtered = publications;
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(pub => {
            const titre = pub.titre?.toLowerCase() || '';
            const description = pub.description?.toLowerCase() || '';
            return titre.includes(query) || description.includes(query);
          });
        }
        
        // Filtrer par statut (pour les offres d'emploi)
        if (postType === 'offres-emploi' && filter !== 'all') {
          const now = new Date();
          
          switch (filter) {
            case 'active':
              filtered = filtered.filter(pub => pub.etat === 'disponible');
              break;
            case 'recent':
              // Moins de 3 jours
              filtered = filtered.filter(pub => {
                const pubDate = new Date(pub.created_at);
                const diffTime = Math.abs(now - pubDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 3;
              });
              break;
            case 'expired':
              filtered = filtered.filter(pub => {
                if (pub.date_limite) {
                  const limitDate = new Date(pub.date_limite);
                  return limitDate < now;
                }
                return false;
              });
              break;
          }
        }
        
        return filtered;
      };
        // Fonction pour formater le temps écoulé (à l'instant, il y a 5 min, etc.)
        const formatTimeAgo = (dateString) => {
          if (!dateString) return '';
          
          const date = new Date(dateString);
          const now = new Date();
          const diffMs = now - date;
          const diffSec = Math.floor(diffMs / 1000);
          const diffMin = Math.floor(diffSec / 60);
          const diffHour = Math.floor(diffMin / 60);
          const diffDay = Math.floor(diffHour / 24);
          
          if (diffSec < 60) return "À l'instant";
          if (diffMin < 60) return `Il y a ${diffMin} min`;
          if (diffHour < 24) return `Il y a ${diffHour} h`;
          if (diffDay < 7) return `Il y a ${diffDay} j`;
          
          return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
          });
        };
      
        // Formater la date pour l'affichage
        const formatDate = (dateString) => {
          if (!dateString) return 'Non disponible';
          try {
            if (typeof dateString === 'string' && dateString.includes('/')) {
              const dateParts = dateString.split(' ');
              if (dateParts.length > 0) {
                return dateParts[0];
              }
              return dateString;
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
              console.error('Date invalide:', dateString);
              return 'Format de date invalide';
            }
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
      
        // Gérer l'ajout d'un commentaire
        const handleComment = async (postId, commentContent, postType) => {
          if (!user) {
            toast.error('Vous devez être connecté pour commenter');
            return;
          }

          try {
            let endpoint;
            let type = postType === 'publicites' ? 'publicite' : 
                       postType === 'offres-emploi' ? 'offre_emploi' : 
                       'opportunite_affaire';

            switch (type) {
              case 'publicite':
                endpoint = `/api/publicites/${postId}/comment`;
                break;
              case 'offre_emploi':
                endpoint = `/api/offres-emploi/${postId}/comment`;
                break;
              case 'opportunite_affaire':
                endpoint = `/api/opportunites-affaires/${postId}/comment`;
                break;
              default:
                throw new Error('Type de publication non reconnu');
            }

            const response = await axios.post(endpoint, { content: commentContent });
            
            if (response.data.success) {
              // Mettre à jour les commentaires dans l'état local
              if (selectedPost && selectedPost.id === postId) {
                const updatedPost = { ...selectedPost };
                
                if (!updatedPost.comments) {
                  updatedPost.comments = [];
                }
                
                updatedPost.comments.push(response.data.comment);
                updatedPost.comments_count = (updatedPost.comments_count || 0) + 1;
                
                setSelectedPost(updatedPost);
              }
              
              toast.success('Commentaire ajouté avec succès');
              return response.data.comment;
            }
          } catch (err) {
            console.error('Erreur lors de l\'ajout du commentaire:', err);
            toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
            throw err;
          }
        };

        // Gérer le like d'un commentaire
        const handleCommentLike = async (commentId, postId, postType) => {
          if (!user) {
            toast.error('Vous devez être connecté pour aimer un commentaire');
            return;
          }

          try {
            let endpoint;
            let type = postType === 'publicites' ? 'publicite' : 
                       postType === 'offres-emploi' ? 'offre_emploi' : 
                       'opportunite_affaire';

            switch (type) {
              case 'publicite':
                endpoint = `/api/comments/${commentId}/like`;
                break;
              case 'offre_emploi':
                endpoint = `/api/comments/${commentId}/like`;
                break;
              case 'opportunite_affaire':
                endpoint = `/api/comments/${commentId}/like`;
                break;
              default:
                throw new Error('Type de publication non reconnu');
            }

            const response = await axios.post(endpoint);
            
            if (response.data.success) {
              // Mettre à jour les likes de commentaires dans l'état local
              if (selectedPost && selectedPost.id === postId && selectedPost.comments) {
                const updatedPost = { ...selectedPost };
                const commentIndex = updatedPost.comments.findIndex(c => c.id === commentId);
                
                if (commentIndex !== -1) {
                  const liked = response.data.liked;
                  updatedPost.comments[commentIndex].liked_by_current_user = liked;
                  updatedPost.comments[commentIndex].likes_count = liked 
                    ? (updatedPost.comments[commentIndex].likes_count || 0) + 1
                    : Math.max(0, (updatedPost.comments[commentIndex].likes_count || 1) - 1);
                  
                  // Afficher un message toast approprié
                  if (liked) {
                    toast.success('Vous avez aimé ce commentaire');
                  } else {
                    toast.info('Vous n\'aimez plus ce commentaire');
                  }
                }
                
                setSelectedPost(updatedPost);
              }
              
              return response.data;
            }
          } catch (err) {
            console.error('Erreur lors du like du commentaire:', err);
            toast.error(err.response?.data?.message || 'Erreur lors du like du commentaire');
            throw err;
          }
        };

        // Gérer la suppression d'un commentaire
        const handleDeleteComment = async (commentId, postId, postType) => {
          try {
            const endpoint = `/api/comments/${commentId}`;
            const response = await axios.delete(endpoint);
            
            if (response.data.success) {
              // Mettre à jour les commentaires dans l'état local
              if (selectedPost && selectedPost.id === postId && selectedPost.comments) {
                const updatedPost = { ...selectedPost };
                updatedPost.comments = updatedPost.comments.filter(c => c.id !== commentId);
                updatedPost.comments_count = Math.max(0, (updatedPost.comments_count || 1) - 1);
                
                setSelectedPost(updatedPost);
              }
              
              toast.success('Commentaire supprimé avec succès');
              return true;
            }
          } catch (err) {
            console.error('Erreur lors de la suppression du commentaire:', err);
            toast.error(err.response?.data?.message || 'Erreur lors de la suppression du commentaire');
            throw err;
          }
        };
      
        // Rendu d'une publication
        const renderPublication = (publication, postType) => {
          const isPublicite = postType === 'publicites';
          const isOffreEmploi = postType === 'offres-emploi';
          const isOpportuniteAffaire = postType === 'opportunites-affaires';
          
          // Vérifier si les commentaires sont développés pour cette publication
          const isCommentsExpanded = expandedComments[`${postType}-${publication.id}`] || false;
          const hasComments = publication.comments && publication.comments.length > 0;
          
          return (
            <div 
              key={`${postType}-${publication.id}`}
              className={`mb-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}
            >
              {/* En-tête de la publication avec photo de profil et nom */}
              <div className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <img 
                    src={pageData.user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(pageData.user?.name || 'Utilisateur')}&background=374151&color=FFFFFF&size=128`} 
                    alt={pageData.user?.name || 'Utilisateur'} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-base">{pageData.user?.name || 'Utilisateur'}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        {formatDate(publication.created_at)}
                        <span className="mx-1">•</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-1">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z" clipRule="evenodd" />
                        </svg>
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Corps de la publication */}
              <div className="px-4 pb-3">
                {/* Titre et description */}
                {publication.titre && (
                  <h4 className="text-lg font-semibold mb-2">{publication.titre}</h4>
                )}
                {publication.description && (
                  <p className="mb-4 text-sm">{publication.description}</p>
                )}
                
                {/* Informations spécifiques selon le type */}
                {isOffreEmploi && (
                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>{publication.entreprise || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>{publication.lieu || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>{publication.salaire ? `${publication.salaire} ${publication.devise}` : 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>{publication.secteur || 'Non spécifié'}</span>
                    </div>
                  </div>
                )}
                
                {isOpportuniteAffaire && (
                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>{publication.investissement_requis ? `${publication.investissement_requis} ${publication.devise}` : 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>{publication.secteur || 'Non spécifié'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Images de la publication - Style Facebook avec image pleine largeur */}
              {publication.images && publication.images.length > 0 && (
                <div className={`mb-3 ${publication.images.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}`}>
                  {publication.images.map((img, index) => (
                    <div key={index} className="overflow-hidden">
                      <img 
                        src={typeof img === 'string' ? img : img.url} 
                        alt={`Image ${index + 1} de ${publication.titre || 'la publication'}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Lien externe si disponible */}
              {publication.lien && (
                <div className="px-4 mb-3">
                  <a 
                    href={publication.lien} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
                  >
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    En savoir plus
                  </a>
                </div>
              )}
              
              {/* Compteurs de likes et commentaires */}
              <div className="px-4 py-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-1 mr-1">
                    <HeartIconSolid className="h-3 w-3 text-white" />
                  </div>
                  <span>{publication.likes_count || 0}</span>
                </div>
                <div className="flex space-x-3">
                  <span>{publication.comments_count || 0} commentaires</span>
                  <span>{publication.shares_count || 0} partages</span>
                </div>
              </div>
              
              {/* Boutons d'action (J'aime, Commenter, Partager) */}
              <div className="px-2 py-1 flex justify-between">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(publication.id, postType);
                  }}
                  className={`flex items-center justify-center flex-1 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${publication.liked_by_current_user ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <HeartIcon className={`h-5 w-5 mr-2 ${publication.liked_by_current_user ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">J'aime</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedComments(prev => ({
                      ...prev,
                      [`${postType}-${publication.id}`]: !isCommentsExpanded
                    }));
                  }}
                  className="flex items-center justify-center flex-1 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">
                    {isCommentsExpanded ? 'Masquer les commentaires' : `Commentaires (${publication.comments_count || publication.comments?.length || 0})`}
                  </span>
                  {hasComments && (
                    isCommentsExpanded 
                      ? <ChevronUpIcon className="h-4 w-4 ml-1" /> 
                      : <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </button>
                
                <div className="relative flex-1">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(publication.id, publication.type, 'facebook');
                      }}
                      className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      title="Partager sur Facebook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(publication.id, postType, 'twitter');
                      }}
                      className="p-1.5 rounded-full text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      title="Partager sur Twitter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(publication.id, postType, 'linkedin');
                      }}
                      className="p-1.5 rounded-full text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      title="Partager sur LinkedIn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(publication.id, postType, 'whatsapp');
                      }}
                      className="p-1.5 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30"
                      title="Partager sur WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(publication.id, postType, 'copy');
                      }}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Copier le lien"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Aperçu des commentaires récents - Style Facebook */}
              {hasComments && isCommentsExpanded && (
                <div className="px-4 pt-2 pb-4">
                  {publication.comments.map(comment => (
                    <div key={comment.id} className="mb-3 last:mb-0">
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                          {console.log(comment.user?.picture_profile)}
                          <img 
                            src={comment.user?.picture_profile || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'Utilisateur')}&background=374151&color=FFFFFF&size=128`} 
                            alt={comment.user?.name || 'Utilisateur'} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className={`inline-block px-3 py-2 rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="font-semibold text-sm">{comment.user?.name || 'Utilisateur'}</p>
                            <p className="text-sm">{comment.contenu || comment.content}</p>
                          </div>
                          <div className="flex items-center mt-1 ml-2 text-xs text-gray-500">
                            <button className="font-medium hover:underline">J'aime</button>
                            <span className="mx-1">·</span>
                            <button className="font-medium hover:underline">Répondre</button>
                            <span className="mx-1">·</span>
                            <span>{formatTimeAgo(comment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Zone de commentaire rapide */}
                  <div className="flex items-center mt-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <img 
                        src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Vous')}&background=374151&color=FFFFFF&size=128`} 
                        alt={user?.name || 'Vous'} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div 
                      onClick={() => openPostDetail(publication.id, postType)}
                      className={`flex-1 px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600`}
                    >
                      <span className="text-sm">Écrire un commentaire...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        };
      
        // Gérer le partage d'un post
        const handleShare = async (postId, type, platform = 'copy') => {
          if (!postId) return;
          
          try {
            const response = await axios.post(`/api/${type}/${postId}/share`, { platform });
            
            // Trouver la publication dans l'état local
          let updatedPageData = { ...pageData };
          let publication;
          
          if (type === 'publicites') {
            const index = updatedPageData.publicites.findIndex(p => p.id === postId);
            if (index !== -1) {
              updatedPageData.publicites[index].shares_count = (updatedPageData.publicites[index].shares_count || 0) + 1;
              publication = updatedPageData.publicites[index];
            }
          } else if (type === 'offres-emploi') {
            const index = updatedPageData.offresEmploi.findIndex(p => p.id === postId);
            if (index !== -1) {
              updatedPageData.offresEmploi[index].shares_count = (updatedPageData.offresEmploi[index].shares_count || 0) + 1;
              publication = updatedPageData.offresEmploi[index];
            }
          } else if (type === 'opportunites-affaires') {
            if (index !== -1) {
              updatedPageData.opportunitesAffaires[index].shares_count = (updatedPageData.opportunitesAffaires[index].likes_count || 0) + 1;
              publication = updatedPageData.opportunitesAffaires[index];
            }
          }
          
          // Mettre à jour l'état global de la page
          setPageData(updatedPageData);
          
          // Mettre à jour également le post sélectionné si c'est le même
          if (selectedPost && selectedPost.id === postId && selectedPost.type === type) {
            setSelectedPost({
              ...selectedPost,
              shares_count: (selectedPost.shares_count || 0) + 1 
            });
          }
          // Construire l'URL du post
          let url = '';
          if (type === 'publicites') {
            url = `${window.location.origin}/pages/${id}/publication/${postId}`;
          } else if (type === 'offre-emploi') {
            url = `${window.location.origin}/pages/${id}/offre-emploi/${postId}`;
          } else if (type === 'opportunite-affaire') {
            url = `${window.location.origin}/pages/${id}/opportunite-affaire/${postId}`;
          }

          console.log(url);
          
          // Texte de partage
          const text = 'Découvrez cette publication intéressante sur SOLIFIN!';
          
          // Gérer le partage selon la plateforme
          let shareUrl = '';
          
          switch (platform) {
            case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
              window.open(shareUrl, '_blank');
              toast.success('Partagé sur Facebook');
              break;
            case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
              window.open(shareUrl, '_blank');
              toast.success('Partagé sur Twitter');
              break;
            case 'linkedin':
              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
              window.open(shareUrl, '_blank');
              toast.success('Partagé sur LinkedIn');
              break;
            case 'whatsapp':
              shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
              window.open(shareUrl, '_blank');
              toast.success('Partagé sur WhatsApp');
              break;
            case 'copy':

            default:
              navigator.clipboard.writeText(url)
                .then(() => toast.success('Lien copié dans le presse-papier'))
                .catch(err => {
                  console.error('Erreur lors de la copie:', err);
                  toast.error('Impossible de copier le lien');
                });
            }
            
            // Mettre à jour le compteur de partages (si une API est disponible)
            try {
              const response = await axios.post(`/api/${type}/${postId}/share`, { platform });
              // Mettre à jour le compteur si nécessaire
            } catch (err) {
              console.error('Erreur lors de la mise à jour du compteur de partages:', err);
            }
          } catch (err) {
            console.error('Erreur lors du partage:', err);
            toast.error('Une erreur est survenue lors du partage');
          }
        };

        if (loading) {
          return (
            <div className="min-h-screen flex items-start pt-24 justify-center bg-white dark:bg-[rgba(17,24,39,0.95)]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          );
        }
      
        if (error || !pageData) {
          return (
            <div className="flex flex-col justify-center items-center min-h-screen">
              <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Erreur de chargement
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {error || "Impossible de charger les données de la page"}
              </p>
              <Link
                to="/feed"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour au fil d'actualité
              </Link>
            </div>
          );
        }
      
        return (
          <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* En-tête de la page avec photo de couverture */}
            <div 
              ref={headerRef}
              className="relative w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden"
              style={{
                backgroundImage: pageData.photo_de_couverture 
                  ? `url(${pageData.photo_de_couverture})` 
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Overlay sombre sur la photo de couverture */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Contenu du header */}
              <div className="container mx-auto px-4 h-full flex flex-col justify-end relative z-10">
                <div className="flex items-end mb-4">
                  {/* Nom et statistiques alignés en bas */}
                  <div className="text-white mb-2 ml-32 sm:ml-40">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {pageData.user?.name || 'Utilisateur'}
                    </h1>
                    <div className="flex items-center mt-1 text-sm md:text-base">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      <span>{pageData.nombre_abonnes || 0} abonnés</span>
                      <HeartIcon className="h-4 w-4 mr-1" />
                      <span>{pageData.nombre_likes || 0} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Barre d'actions avec photo de profil */}
            <div className={`container mx-auto px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm rounded-b-lg relative`}>
              {/* Photo de profil positionnée à cheval entre la couverture et la barre d'actions */}
              <div className="absolute -top-16 left-4 sm:left-6">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                    <img 
                      src={pageData.user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(pageData.user?.name || 'Utilisateur')}&background=374151&color=FFFFFF&size=128`} 
                      alt={`${pageData.user?.name || 'Utilisateur'}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Barre d'actions avec espace pour la photo de profil */}
              <div className="flex flex-wrap justify-end items-center py-3 pl-32 sm:pl-40">
                <div className="flex flex-wrap items-center gap-2">
                  {user && user.id !== pageData.user_id && (
                    <>
                      {isSubscribed ? (
                        <button
                          onClick={handleUnsubscribe}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1.5" />
                          Se désabonner
                        </button>
                      ) : (
                        <button
                          onClick={handleSubscribe}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <UsersIcon className="h-4 w-4 mr-1.5" />
                          S'abonner
                        </button>
                      )}
                      
                      {/* Bouton WhatsApp */}
                      {pageData.user?.phone && (
                        <a
                          href={`https://wa.me/${pageData.user.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S17.385 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                      
                      {/* Bouton Email */}
                      {pageData.user?.email && (
                        <a
                          href={`mailto:${pageData.user.email}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                          <span className="hidden sm:inline">Email</span>
                        </a>
                      )}
                    </>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Membre depuis {formatDate(pageData.user?.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contenu principal avec onglets */}
            <div className="container mx-auto px-4 py-6">
              <div ref={contentRef} className={`rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex p-1 space-x-1 bg-blue-900/10 rounded-t-lg">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm font-medium leading-5 text-blue-700',
                          'focus:outline-none focus:ring-0',
                          selected
                            ? 'bg-white dark:bg-gray-700 shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-blue-700 dark:hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <NewspaperIcon className="h-5 w-5 mr-2" />
                        Publications
                      </div>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm font-medium leading-5 text-blue-700',
                          'focus:outline-none focus:ring-0',
                          selected
                            ? 'bg-white dark:bg-gray-700 shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-blue-700 dark:hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <BriefcaseIcon className="h-5 w-5 mr-2" />
                        Offres d'emploi
                      </div>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm font-medium leading-5 text-blue-700',
                          'focus:outline-none focus:ring-0',
                          selected
                            ? 'bg-white dark:bg-gray-700 shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-blue-700 dark:hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <LightBulbIcon className="h-5 w-5 mr-2" />
                        Opportunités d'affaires
                      </div>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm font-medium leading-5 text-blue-700',
                          'focus:outline-none focus:ring-0',
                          selected
                            ? 'bg-white dark:bg-gray-700 shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-blue-700 dark:hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <InformationCircleIcon className="h-5 w-5 mr-2" />
                        À propos
                      </div>
                    </Tab>
                  </Tab.List>
            
                  {/* Barre de recherche et filtres */}
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-grow relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className={`block w-full pl-10 pr-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <div className="relative inline-block text-left">
                          <select
                            className={`block w-full pl-3 pr-10 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                          >
                            <option value="all">Tous</option>
                            <option value="active">Actifs</option>
                            <option value="recent">Récents</option>
                            <option value="expired">Expirés</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                                    <Tab.Panels>
                                      {/* Onglet Publications */}
                                      <Tab.Panel className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                        <div className="space-y-4">
                                          {getFilteredPublications('publicites').length > 0 ? (
                                            getFilteredPublications('publicites').map((publication) => (
                                              renderPublication(publication, 'publicites')
                                            ))
                                          ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                              <NewspaperIcon className="h-12 w-12 text-gray-400 mb-4" />
                                              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Aucune publication
                                              </h3>
                                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Cet utilisateur n'a pas encore publié de contenu ou aucun contenu ne correspond à votre recherche.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </Tab.Panel>
                        
                                      {/* Onglet Offres d'emploi */}
                                      <Tab.Panel className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                        <div className="space-y-4">
                                          {getFilteredPublications('offres-emploi').length > 0 ? (
                                            getFilteredPublications('offres-emploi').map((offre) => (
                                              renderPublication(offre, 'offres-emploi')
                                            ))
                                          ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                              <BriefcaseIcon className="h-12 w-12 text-gray-400 mb-4" />
                                              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Aucune offre d'emploi
                                              </h3>
                                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Cet utilisateur n'a pas encore publié d'offres d'emploi ou aucune offre ne correspond à votre recherche.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </Tab.Panel>
                        
                                      {/* Onglet Opportunités d'affaires */}
                                      <Tab.Panel className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                        <div className="space-y-4">
                                          {getFilteredPublications('opportunites-affaires').length > 0 ? (
                                            getFilteredPublications('opportunites-affaires').map((opportunite) => (
                                              renderPublication(opportunite, 'opportunites-affaires')
                                            ))
                                          ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                              <LightBulbIcon className="h-12 w-12 text-gray-400 mb-4" />
                                              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Aucune opportunité d'affaires
                                              </h3>
                                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Cet utilisateur n'a pas encore publié d'opportunités d'affaires ou aucune opportunité ne correspond à votre recherche.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </Tab.Panel>

              {/* Onglet À propos */}
              <Tab.Panel className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                <div className="max-w-3xl mx-auto">
                  <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    À propos de {pageData.user?.name || 'l\'utilisateur'}
                  </h2>
                  
                  {pageData.user?.bio ? (
                    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {pageData.user.bio}
                      </p>
                    </div>
                  ) : (
                    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aucune biographie disponible.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Informations personnelles
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <UsersIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Nom
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {pageData.user?.name || 'Non disponible'}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Pays
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {pageData.user?.pays || 'Non disponible'}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Province
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {pageData.user?.province || 'Non disponible'}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Ville
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {pageData.user?.ville || 'Non disponible'}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Adresse
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {pageData.user?.address || 'Non disponible'}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Contact
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <PhoneIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Téléphone
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {pageData.user?.phone || 'Non disponible'}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              WhatsApp
                            </p>
                            {pageData.user?.phone ? (
                              <a 
                                href={`https://wa.me/${pageData.user.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
                              >
                                {pageData.user.phone}
                              </a>
                            ) : (
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Non disponible
                              </p>
                            )}
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <EnvelopeIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Email
                            </p>
                            {pageData.user?.email ? (
                              <a 
                                href={`mailto:${pageData.user.email}`}
                                className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                              >
                                {pageData.user.email}
                              </a>
                            ) : (
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Non disponible
                              </p>
                            )}
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`flex-shrink-0 h-5 w-5 text-indigo-500`}>
                            <UsersIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Membre depuis
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {formatDate(pageData.user?.created_at)}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Modal de détail de publication */}
      {isPostDetailModalOpen && selectedPost && (
        <PostDetailModal
          isOpen={isPostDetailModalOpen}
          onClose={() => setIsPostDetailModalOpen(false)}
          post={selectedPost}
          onLike={handleLike}
          onComment={handleComment}
          onCommentLike={handleCommentLike}
          onDeleteComment={handleDeleteComment}
          onShare={handleShare}
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Configuration des notifications toast */}
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