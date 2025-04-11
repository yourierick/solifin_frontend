import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Tab } from '@headlessui/react';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  NewspaperIcon,
  BriefcaseIcon,
  LightBulbIcon,
  PlusIcon,
  UsersIcon
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
  const handleDeleteComment = async (commentId, postId) => {
    try {
      const response = await axios.delete(`/api/comments/${commentId}`);
      
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
            Fil d'actualité
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
            Opportunités d'affaires
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
                  onViewDetails={() => openPostDetail(post.id)}
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
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center p-4">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                posts
                  .filter(post => post.type === 'offre_emploi')
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleAddComment}
                      onCommentLike={handleCommentLike}
                      onDeleteComment={handleDeleteComment}
                      onShare={handleShare}
                      onViewDetails={() => openPostDetail(post.id)}
                      isDarkMode={isDarkMode}
                    />
                  ))
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
                  .filter(post => post.type === 'opportunite_affaire')
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleAddComment}
                      onCommentLike={handleCommentLike}
                      onDeleteComment={handleDeleteComment}
                      onShare={handleShare}
                      onViewDetails={() => openPostDetail(post.id)}
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
