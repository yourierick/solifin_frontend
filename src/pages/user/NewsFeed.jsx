import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Tab } from '@headlessui/react';
import {
  NewspaperIcon,
  BriefcaseIcon,
  LightBulbIcon,
  PlusIcon,
  ChevronDownIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  ArrowPathIcon,
  UsersIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import PostCard from './components/PostCard';
import PostDetailModal from './components/PostDetailModal';
import LoadingSpinner from '../../components/LoadingSpinner';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NewsFeed() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(0);

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilter, setJobFilter] = useState('all'); // 'all', 'active', 'recent', 'expired'
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const observer = useRef();
  const limit = 5; // Nombre de posts à charger à chaque fois

  const tabTypes = ['publicites', 'offres-emploi', 'opportunites-affaires'];

  // Fonction pour charger les posts sans boucle infinie
  const fetchPosts = useCallback(async (reset = false, retryCount = 0) => {
    try {
      if (!hasMore && !reset) return;

      // Seulement afficher le loading au premier essai
      if (retryCount === 0) {
        setLoading(true);
        setError(null);
      }

      // Configuration pour la requête
      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          type: tabTypes[activeTab],
          last_id: reset ? 0 : lastId,
          limit: limit
        },
        // Réduire le timeout pour éviter de surcharger le serveur
        timeout: 5000
      };

      const response = await axios.get('/api/feed', config);

      const newPosts = response.data.posts || [];
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }

      if (newPosts.length > 0) {
        setLastId(newPosts[newPosts.length - 1].id);
      }
      
      setHasMore(response.data.has_more);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des publications:', err);
      
      // Vérifier si l'erreur est liée aux ressources insuffisantes
      const isResourceError = err.message && (
        err.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
        err.message.includes('ERR_NETWORK')
      );
      
      // Mécanisme de retry limité (maximum 2 tentatives et pas de retry pour les erreurs de ressources)
      if (retryCount < 2 && !isResourceError) {
        console.log(`Tentative de rechargement ${retryCount + 1}/2...`);
        // Utiliser un délai plus long entre les tentatives
        setTimeout(() => {
          fetchPosts(reset, retryCount + 1);
        }, 2000 * (retryCount + 1));
        return;
      }

      // Message d'erreur plus détaillé
      if (err.response) {
        // Erreur de réponse du serveur (ex: 500)
        setError(`Erreur serveur (${err.response.status}). Veuillez réessayer plus tard.`);
      } else if (isResourceError) {
        // Erreur spécifique aux ressources insuffisantes
        setError('Le serveur est actuellement surchargé. Veuillez réessayer dans quelques instants.');
      } else if (err.request) {
        // Pas de réponse reçue du serveur
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        // Erreur lors de la configuration de la requête
        setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
      setLoading(false);
    }
  }, [activeTab, hasMore, lastId, tabTypes]);

  // Chargement des pages abonnées et recommandées
  const [subscribedPages, setSubscribedPages] = useState([]);
  const [recommendedPages, setRecommendedPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  
  // Charger les pages abonnées
  const fetchSubscribedPages = useCallback(async () => {
    try {
      const response = await axios.get('/api/pages/subscribed');
      setSubscribedPages(response.data.pages || []);
    } catch (err) {
      console.error('Erreur lors du chargement des pages abonnées:', err);
    }
  }, []);
  
  // Charger les pages recommandées
  const fetchRecommendedPages = useCallback(async () => {
    try {
      const response = await axios.get('/api/pages/recommended');
      
      // Filtrer les pages recommandées pour exclure la page de l'utilisateur actuel
      const filteredPages = (response.data.pages || []).filter(page => {
        // Vérifier si la page appartient à l'utilisateur actuel
        return page.user_id !== user?.id;
      });
      
      setRecommendedPages(filteredPages);
    } catch (err) {
      console.error('Erreur lors du chargement des pages recommandées:', err);
    }
  }, [user?.id]);
  
  // S'abonner à une page
  const handleSubscribe = useCallback(async (pageId) => {
    try {
      await axios.post(`/api/pages/${pageId}/subscribe`);
      // Rafraîchir les listes de pages
      fetchSubscribedPages();
      fetchRecommendedPages();
      // Mettre à jour l'attribut is_subscribed dans les posts
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.page_id === pageId 
            ? { ...post, is_subscribed: true } 
            : post
        )
      );
    } catch (err) {
      console.error('Erreur lors de l\'abonnement à la page:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Se désabonner d'une page
  const handleUnsubscribe = useCallback(async (pageId) => {
    try {
      await axios.delete(`/api/pages/${pageId}/unsubscribe`);
      // Rafraîchir les listes de pages
      fetchSubscribedPages();
      fetchRecommendedPages();
      // Mettre à jour l'attribut is_subscribed dans les posts
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.page_id === pageId 
            ? { ...post, is_subscribed: false } 
            : post
        )
      );
    } catch (err) {
      console.error('Erreur lors du désabonnement de la page:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialiser le chargement des posts et des pages
  useEffect(() => {
    // Utiliser une variable pour suivre si le composant est monté
    let isMounted = true;
    
    const initFetch = async () => {
      if (isMounted) {
        setLoadingPages(true);
        setPosts([]);
        setLastId(0);
        setHasMore(true);
        
        // Ajouter un petit délai pour éviter les appels simultanés
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isMounted) {
          // Charger les posts et les pages en parallèle
          await Promise.all([
            fetchPosts(true),
            fetchSubscribedPages(),
            fetchRecommendedPages()
          ]);
          
          setLoadingPages(false);
        }
      }
    };
    
    initFetch();
    
    // Nettoyage lors du démontage
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Ne dépendre que de activeTab pour éviter les boucles infinies

  // Configuration de l'intersection observer pour le défilement infini
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchPosts]);

  // Gérer l'action "J'aime"
  const handleLike = async (postId, type) => {
    try {
      // Configuration pour la requête
      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 8000 // Timeout raisonnable pour cette action simple
      };
      
      const response = await axios.post(`/api/${type}/${postId}/like`, {}, config);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: response.data.liked, 
                likes_count: response.data.likes_count 
              } 
            : post
        )
      );

      // Mettre à jour le post sélectionné si nécessaire
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          is_liked: response.data.liked,
          likes_count: response.data.likes_count
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'action "J\'aime":', err);
      
      // Gérer l'erreur silencieusement sans alerter l'utilisateur
      // pour une expérience utilisateur plus fluide
      if (err.response && err.response.status === 401) {
        // L'utilisateur n'est pas authentifié
        alert('Veuillez vous connecter pour aimer cette publication.');
      } else if (err.response && err.response.status === 429) {
        // Trop de requêtes
        console.warn('Trop de requêtes. Veuillez patienter avant de réessayer.');
      }
      // Pour les autres erreurs, on ne montre pas d'alerte pour ne pas perturber l'expérience utilisateur
    }
  };

  // Gérer l'ajout d'un commentaire
  const handleAddComment = async (postId, content, type) => {
    try {
      const response = await axios.post(`/api/${type}/${postId}/comment`, { content });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments_count: response.data.comments_count,
                comments: [response.data.comment, ...post.comments].slice(0, 3) // Garder les 3 commentaires les plus récents
              } 
            : post
        )
      );

      // Mettre à jour le post sélectionné si nécessaire
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          comments_count: response.data.comments_count,
          comments: [response.data.comment, ...selectedPost.comments]
        });
      }

      return response.data.comment;
    } catch (err) {
      console.error('Erreur lors de l\'ajout d\'un commentaire:', err);
      throw err;
    }
  };

  // Gérer la suppression d'un commentaire
  const handleDeleteComment = async (commentId, postId, type) => {
    try {
      const response = await axios.delete(`/api/${type}/comments/${commentId}`);
      
      setPosts(prevPosts => 
        prevPosts.map(post =>   
          post.id === postId 
            ? { 
                ...post, 
                comments_count: response.data.comments_count,
                comments: post.comments.filter(comment => comment.id !== commentId)
              } 
            : post
        )
      );

      // Mettre à jour le post sélectionné si nécessaire
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          comments_count: response.data.comments_count,
          comments: selectedPost.comments.filter(comment => comment.id !== commentId)
        });
      }
    } catch (err) {
      console.error('Erreur lors de la suppression d\'un commentaire:', err);
    }
  };

  // Gérer l'action "J'aime" sur un commentaire
  const handleCommentLike = async (commentId, postId) => {
    try {
      const response = await axios.post(`/api/comments/${commentId}/like`);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: post.comments.map(comment => 
                  comment.id === commentId 
                    ? { 
                        ...comment, 
                        is_liked: response.data.liked, 
                        likes_count: response.data.likes_count 
                      } 
                    : comment
                )
              } 
            : post
        )
      );

      // Mettre à jour le post sélectionné si nécessaire
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          comments: selectedPost.comments.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  is_liked: response.data.liked, 
                  likes_count: response.data.likes_count 
                } 
              : comment
          )
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'action "J\'aime" sur un commentaire:', err);
    }
  };

  // Gérer le partage d'un post
  const handleShare = async (type, postId, platform) => {
    try {
      const response = await axios.post(`/api/${type}/${postId}/share`, { platform });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                shares_count: response.data.shares_count 
              } 
            : post
        )
      );

      // Mettre à jour le post sélectionné si nécessaire
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          shares_count: response.data.shares_count
        });
      }

      // Ouvrir le lien de partage approprié
      let shareUrl = '';
      const postUrl = `${window.location.origin}/dashboard/news-feed/post/${postId}`;
      const text = 'Découvrez cette publication intéressante sur SOLIFIN!';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
          break;
        default:
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  };

  // Ouvrir le modal de détail d'un post
  const openPostDetail = async (postId, type) => {
    try {
      // Afficher un indicateur de chargement
      setLoading(true);
      
      // Configuration pour la requête
      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Augmenter le timeout pour éviter les erreurs de réseau
      };
      
      const response = await axios.get(`/api/${type}/${postId}/details`, config);
      setSelectedPost(response.data.post);
      setIsPostDetailModalOpen(true);
    } catch (err) {
      console.error('Erreur lors du chargement des détails de la publication:', err);
      
      // Message d'erreur plus détaillé
      let errorMessage = 'Impossible de charger les détails de la publication.';
      
      if (err.response) {
        errorMessage = `Erreur serveur (${err.response.status}). Veuillez réessayer plus tard.`;
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full lg:max-w-6xl mx-auto flex-grow transition-all duration-300">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Fil d'actualités
        </h1>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Découvrez les dernières actualités, offres d'emploi et opportunités d'affaires
        </p>
      </div>

      {/* Onglets de navigation */}
      <Tab.Group onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 dark:bg-gray-800 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'flex items-center justify-center',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-white'
              )
            }
          >
            <NewspaperIcon className="h-5 w-5 mr-2" />
            Publicités
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'flex items-center justify-center',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-white'
              )
            }
          >
            <BriefcaseIcon className="h-5 w-5 mr-2" />
            Offres d'emploi
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'flex items-center justify-center',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-white'
              )
            }
          >
            <LightBulbIcon className="h-5 w-5 mr-2" />
            Opportunités
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'flex items-center justify-center',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-white'
              )
            }
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Pages
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          {/* Premier onglet: Fil d'actualité */}
          <Tab.Panel className={classNames('rounded-xl p-3', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2')}>
            {/* Liste des publications */}
      <div className="space-y-6">
        {error && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
            {error}
          </div>
        )}

        {posts.length === 0 && !loading ? (
          <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'}`}>
            <p className="text-lg font-medium">Aucune publication disponible</p>
            <p className="mt-2">Soyez le premier à partager quelque chose !</p>
            <button
              onClick={() => navigate('/dashboard/my-page')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer une publication
            </button>
          </div>
        ) : (
          posts.map((post, index) => {
            // Si c'est le dernier élément, ajouter la ref pour l'infinite scroll
            if (index === posts.length - 1) {
              return (
                <div key={post.id} ref={lastPostElementRef}>
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleAddComment}
                    onCommentLike={handleCommentLike}
                    onDeleteComment={handleDeleteComment}
                    onShare={handleShare}
                    onViewDetails={() => openPostDetail(post.id, post.type)}
                    isDarkMode={isDarkMode}
                  />
                </div>
              );
            } else {
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleAddComment}
                  onCommentLike={handleCommentLike}
                  onDeleteComment={handleDeleteComment}
                  onShare={handleShare}
                  onViewDetails={() => openPostDetail(post.id, post.type)}
                  isDarkMode={isDarkMode}
                />
              );
            }
          })
        )}

        {loading && (
          <div className="flex justify-center p-4">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
          </Tab.Panel>
          
          {/* Deuxième onglet: Offres d'emploi */}
          <Tab.Panel className={classNames('rounded-xl p-3', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2')}>
            {/* Barre de recherche et filtres */}
            <div className={`mb-6 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Offres d'emploi</h2>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Les offres d'emploi publiées sont certifiées. Aucun frais n'est exigé pour le dépôt des candidatures.
                </p>
                <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-50 text-yellow-800'}`}>
                  <p className="text-sm font-medium">AVIS AUX CANDIDATS</p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">NE PAS ENVOYER DE L'ARGENT</span> sous quelque forme que ce soit (cash, virement, transfert Western Union, mobile money,...). Merci de signaler immédiatement toute demande suspecte.
                  </p>
                </div>
              </div>
              
              {/* Barre de recherche */}
              <div className="p-4">
                <div className={`flex items-center rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2 border-none ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Fonction, référence ou organisme"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className={`px-4 py-2 ${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white font-medium rounded-r-lg focus:outline-none`}
                  >
                    RECHERCHER
                  </button>
                </div>
              </div>
              
              {/* Filtres */}
              <div className={`flex flex-wrap gap-2 p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setJobFilter('all')}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${jobFilter === 'all' ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800') : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                >
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Toutes
                </button>
                <button
                  onClick={() => setJobFilter('disponible')}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${jobFilter === 'active' ? (isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800') : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Disponible
                </button>
                <button
                  onClick={() => setJobFilter('recent')}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${jobFilter === 'recent' ? (isDarkMode ? 'bg-orange-800 text-orange-100' : 'bg-orange-100 text-orange-800') : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                >
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Moins de 3 jours
                </button>
                <button
                  onClick={() => setJobFilter('expired')}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${jobFilter === 'expired' ? (isDarkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800') : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Expirée
                </button>
              </div>
              
              {/* Tri */}
              <div className={`flex justify-end p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="relative">
                  <select 
                    className={`block appearance-none w-full px-4 py-2 pr-8 rounded border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    defaultValue="recent"
                  >
                    <option value="recent">Trier par offres récentes</option>
                    <option value="oldest">Trier par offres anciennes</option>
                    <option value="company">Trier par organisme</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tableau des offres */}
            <div className={`overflow-hidden rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* En-tête du tableau */}
              <div className={`grid grid-cols-12 gap-4 p-4 font-medium ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} border-b`}>
                <div className="col-span-6 sm:col-span-5">Fonction</div>
                <div className="col-span-3 sm:col-span-3 hidden sm:block">Organisme</div>
                <div className="col-span-3 sm:col-span-2 hidden sm:block">Lieu</div>
                <div className="col-span-6 sm:col-span-2 text-right">Insérée</div>
              </div>
              
              {/* Corps du tableau */}
              {loading ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div>
                  {posts
                    .filter(post => post.type === 'offres-emploi')
                    .filter(post => {
                      if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        return (
                          post.title?.toLowerCase().includes(query) ||
                          post.company_name?.toLowerCase().includes(query) ||
                          post.location?.toLowerCase().includes(query) ||
                          post.reference?.toLowerCase().includes(query)
                        );
                      }
                      return true;
                    })
                    .filter(post => {
                      if (jobFilter === 'all') return true;
                      if (jobFilter === 'disponible') return post.etat === 'disponible';
                      if (jobFilter === 'recent') {
                        const threeDaysAgo = new Date();
                        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                        return new Date(post.created_at) >= threeDaysAgo;
                      }
                      if (jobFilter === 'expired') return post.statut === 'expiré';
                      return true;
                    })
                    .map((post) => (
                      <div 
                        key={post.id} 
                        className={`grid grid-cols-12 gap-4 p-4 cursor-pointer hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        onClick={() => openPostDetail(post.id, post.type)}
                      >
                        <div className="col-span-6 sm:col-span-5">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${post.status === 'disponible' ? 'bg-green-500' : post.status === 'expired' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                            <div className="ml-2">
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{post.title}</div>
                              <div className="text-sm text-gray-500">{post.reference || 'Réf. non précisée'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 sm:col-span-3 hidden sm:block">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{post.company_name || 'Non précisé'}</div>
                        </div>
                        <div className="col-span-3 sm:col-span-2 hidden sm:block">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{post.location || 'Non précisé'}</div>
                        </div>
                        <div className="col-span-6 sm:col-span-2 text-right">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(post.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          
                          {/* Actions sociales (j'aime, commentaires, partages) */}
                          <div className={`flex items-center justify-end mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <button
                              className="flex items-center mr-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(post.id, post.type);
                              }}
                            >
                              {post.is_liked ? (
                                <HeartIconSolid className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <HeartIcon className="h-4 w-4 mr-1" />
                              )}
                              <span>{post.likes_count || 0}</span>
                            </button>
                            
                            <button
                              className="flex items-center mr-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPostDetail(post.id, post.type);
                              }}
                            >
                              <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                              <span>{post.comments_count || 0}</span>
                            </button>
                            
                            <button
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(post.id, post.type);
                              }}
                            >
                              <ShareIcon className="h-4 w-4 mr-1" />
                              <span>{post.shares_count || 0}</span>
                            </button>
                          </div>
                          
                          {/* Boutons d'action (Détails, Télécharger, WhatsApp, lien externe) */}
                          <div className="flex justify-end mt-2 space-x-2">
                            {/* Bouton Détails */}
                            <button
                              className={`p-1 rounded-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                              title="Voir les détails"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPostDetail(post.id, post.type);
                              }}
                            >
                              <InformationCircleIcon className="w-4 h-4" />
                            </button>
                            
                            {/* Bouton Télécharger */}
                            {post.offer_file_url && (
                              <a
                                href={post.offer_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1 rounded-full ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
                                title="Télécharger l'offre"
                                onClick={(e) => e.stopPropagation()}
                                download
                              >
                                <DocumentArrowDownIcon className="w-4 h-4" />
                              </a>
                            )}
                            
                            {/* Bouton WhatsApp */}
                            {post.user?.phone && (
                              <a
                                href={`https://wa.me/${post.user.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-full bg-green-600 text-white hover:bg-green-700"
                                title="Contacter via WhatsApp"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              </a>
                            )}
                            
                            {/* Bouton Lien externe */}
                            {post.external_link && (
                              <a
                                href={post.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1 rounded-full ${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white`}
                                title="En savoir plus"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </Tab.Panel>
          
          {/* Troisième onglet: Opportunités d'affaires */}
          <Tab.Panel className={classNames('rounded-xl p-3', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2')}>
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center p-4">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                posts
                  .filter(post => post.type === 'opportunites-affaires')
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleAddComment}
                      onCommentLike={handleCommentLike}
                      onDeleteComment={handleDeleteComment}
                      onShare={handleShare}
                      onViewDetails={() => openPostDetail(post.id, post.type)}
                      isDarkMode={isDarkMode}
                    />
                  ))
              )}
            </div>
          </Tab.Panel>
          
          {/* Quatrième onglet: Pages */}
          <Tab.Panel className={classNames('rounded-xl p-3', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2')}>
            <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pages que vous suivez
                </h2>
                {loadingPages ? (
                  <div className="flex justify-center p-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : subscribedPages.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {subscribedPages.map(page => (
                      <div key={page.id} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <div className="flex items-center space-x-3">
                          {page.user?.profile_picture ? (
                            <img
                              src={page.user.profile_picture}
                              alt={page.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                                {page.user?.name?.charAt(0) || 'P'}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {page.name || 'Page'}
                            </h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {page.nombre_abonnes} abonnés
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnsubscribe(page.id)}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 hover:bg-primary-200"
                        >
                          Se désabonner
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Vous ne suivez aucune page pour le moment.
                  </p>
                )}
              </div>
              
              <div className="mt-6">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pages recommandées
                </h2>
                {loadingPages ? (
                  <div className="flex justify-center p-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : recommendedPages.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {recommendedPages.map(page => (
                      <div key={page.id} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <div className="flex items-center space-x-3">
                          {page.user?.profile_picture ? (
                            <img
                              src={page.user.profile_picture}
                              alt={page.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                                {page.user?.name?.charAt(0) || 'P'}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {page.name || 'Page'}
                            </h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {page.nombre_abonnes} abonnés
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSubscribe(page.id)}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-primary-600 text-white hover:bg-primary-700"
                        >
                          S'abonner
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Aucune page recommandée pour le moment.
                  </p>
                )}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Modal pour afficher les détails d'une publication */}
      {selectedPost && (
        <PostDetailModal
          isOpen={isPostDetailModalOpen}
          onClose={() => setIsPostDetailModalOpen(false)}
          post={selectedPost}
          onLike={handleLike}
          onComment={handleAddComment}
          onCommentLike={handleCommentLike}
          onDeleteComment={handleDeleteComment}
          onShare={handleShare}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
