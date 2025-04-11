import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';

export default function PostCard({
  post,
  onLike,
  onComment,
  onDeleteComment,
  onShare,
  onViewDetails,
  isDarkMode,
}) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const commentInputRef = useRef(null);

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  // Gérer la soumission d'un commentaire
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await onComment(post.id, comment, post.type);
      setComment('');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du commentaire:', err);
    }
  };

  // Activer le mode commentaire
  const activateCommentMode = () => {
    setIsCommenting(true);
    setShowComments(true); // Afficher les commentaires quand l'utilisateur veut commenter
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  // Tronquer le texte s'il est trop long
  const truncateText = (text, maxLength = 300) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Afficher l'icône appropriée selon le type de post
  const renderTypeIcon = () => {
    switch (post.type) {
      case 'emploi':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case 'opportunite':
        return <LightBulbIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Afficher les informations spécifiques selon le type de post
  const renderTypeSpecificInfo = () => {
    if (post.type === 'offres-emploi') {
      return (
        <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {post.company_name && (
            <div className="flex items-center mb-1">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>{post.company_name}</span>
            </div>
          )}
          {post.location && (
            <div className="flex items-center mb-1">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{post.location}</span>
            </div>
          )}
          {post.salary_range && (
            <div className="flex items-center mb-1">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              <span>{post.salary_range}</span>
            </div>
          )}
        </div>
      );
    } else if (post.type === 'opportunites-affaires') {
      return (
        <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {post.investment_amount && (
            <div className="flex items-center mb-1">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              <span>Investissement: {post.investment_amount}</span>
            </div>
          )}
          {post.sector && (
            <div className="flex items-center mb-1">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>Secteur: {post.sector}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* En-tête du post */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {post.user?.picture ? (
            <img
              src={post.user.picture}
              alt={post.user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                {post.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center">
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {post.user?.name || 'Utilisateur'}
              </h3>
              {renderTypeIcon()}
            </div>
            <div className="flex items-center">
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(post.created_at)}
              </p>
              {post.status === 'pending' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  En attente
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
            className={`p-1 rounded-full ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
          
          {/* Menu d'options */}
          <AnimatePresence>
            {isOptionsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } ring-1 ring-black ring-opacity-5`}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      onViewDetails(post.id, post.type);
                      setIsOptionsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Voir les détails
                  </button>
                  {user?.id === post.user_id && (
                    <>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-gray-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Modifier
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-gray-600'
                            : 'text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      // Logique pour signaler
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Signaler
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Contenu du post */}
      <div className="px-4 pb-2">
        {post.title && (
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {post.title}
          </h2>
        )}
        <p className={`whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {truncateText(post.content)}
        </p>
        {post.content.length > 300 && (
          <button
            onClick={onViewDetails}
            className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}
          >
            Voir plus
          </button>
        )}
        
        {renderTypeSpecificInfo()}
        
        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mt-3 ${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
            {post.images.slice(0, 4).map((image, index) => (
              <div 
                key={index} 
                className={`relative ${
                  post.images.length === 1 ? 'w-full' : ''
                } ${
                  post.images.length > 4 && index === 3 ? 'relative' : ''
                }`}
              >
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="rounded-lg object-cover w-full h-full"
                  style={{ maxHeight: post.images.length === 1 ? '400px' : '200px' }}
                />
                {post.images.length > 4 && index === 3 && (
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
                    onClick={onViewDetails}
                  >
                    <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Vidéo */}
        {post.video_url && (
          <div className="mt-3">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={post.video_url.replace('watch?v=', 'embed/')}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg w-full h-full"
              ></iframe>
            </div>
          </div>
        )}
        
        {/* Lien externe */}
        {post.external_link && (
          <a
            href={post.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 block p-3 border rounded-lg ${
              isDarkMode
                ? 'border-gray-700 hover:bg-gray-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`text-sm font-medium ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}>
              {post.external_link}
            </div>
          </a>
        )}
      </div>
      
      {/* Compteurs */}
      <div className={`px-4 py-2 flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          {post.likes_count > 0 && (
            <span>{post.likes_count} {post.likes_count === 1 ? 'j\'aime' : 'j\'aimes'}</span>
          )}
        </div>
        <div className="flex space-x-4">
          {post.comments_count > 0 && (
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`hover:underline focus:outline-none ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}
            >
              {showComments ? 'Masquer les commentaires' : `${post.comments_count} ${post.comments_count === 1 ? 'commentaire' : 'commentaires'}`}
            </button>
          )}
          {post.shares_count > 0 && (
            <span>{post.shares_count} {post.shares_count === 1 ? 'partage' : 'partages'}</span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className={`px-4 py-2 flex border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => onLike(post.id, post.type)}
          className={`flex items-center justify-center flex-1 py-2 rounded-lg ${
            isDarkMode
              ? 'hover:bg-gray-700'
              : 'hover:bg-gray-100'
          } ${
            post.is_liked
              ? 'text-primary-500'
              : isDarkMode
                ? 'text-gray-400'
                : 'text-gray-500'
          }`}
        >
          {post.is_liked ? (
            <HeartIconSolid className="h-5 w-5 mr-2" />
          ) : (
            <HeartIcon className="h-5 w-5 mr-2" />
          )}
          <span>J'aime</span>
        </button>
        <button
          onClick={activateCommentMode}
          className={`flex items-center justify-center flex-1 py-2 rounded-lg ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
          <span>Commenter</span>
        </button>
        <div className="relative flex-1">
          <button
            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
            className={`flex items-center justify-center w-full py-2 rounded-lg ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            <span>Partager</span>
          </button>
          
          {/* Menu de partage */}
          <AnimatePresence>
            {isShareMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 rounded-md shadow-lg z-10 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } ring-1 ring-black ring-opacity-5`}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      onShare(post.type, post.id, 'facebook');
                      setIsShareMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => {
                      onShare(post.id, 'twitter');
                      setIsShareMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => {
                      onShare(post.id, 'linkedin');
                      setIsShareMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => {
                      onShare(post.id, 'whatsapp');
                      setIsShareMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Le bouton d'affichage/masquage des commentaires a été déplacé dans la section des compteurs */}
      
      {/* Section commentaires */}
      <AnimatePresence>
        {(isCommenting || (showComments && post.comments && post.comments.length > 0)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {/* Formulaire de commentaire */}
            <form onSubmit={handleSubmitComment} className="flex items-center mb-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="Photo de profil"
                  className="h-8 w-8 rounded-full object-cover mr-2"
                />
              ) : (
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Écrire un commentaire..."
                  className={`w-full py-2 px-3 pr-10 rounded-full ${
                    isDarkMode
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                    comment.trim()
                      ? isDarkMode
                        ? 'text-primary-400 hover:bg-gray-600'
                        : 'text-primary-600 hover:bg-gray-200'
                      : isDarkMode
                        ? 'text-gray-500'
                        : 'text-gray-400'
                  }`}
                >
                  <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
                </button>
              </div>
            </form>
            
            {/* Liste des commentaires */}
            {showComments && post.comments && post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex">
                    {comment.user?.profile_picture ? (
                      <img
                        src={comment.user.profile_picture}
                        alt={comment.user.name}
                        className="h-8 w-8 rounded-full object-cover mr-2 flex-shrink-0"
                      />
                    ) : (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                          {comment.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`rounded-lg px-3 py-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {comment.user?.name || 'Utilisateur'}
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {comment.content}
                        </p>
                      </div>
                      <div className="flex items-center mt-1 text-xs space-x-3">
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                          {formatDate(comment.created_at)}
                        </span>
                        {comment.likes_count > 0 && (
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {comment.likes_count} {comment.likes_count === 1 ? 'j\'aime' : 'j\'aimes'}
                          </span>
                        )}
                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => onDeleteComment(comment.id, post.id)}
                            className={`font-medium ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-red-400'
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {post.comments_count > post.comments.length && (
                  <button
                    onClick={onViewDetails}
                    className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}
                  >
                    Voir tous les {post.comments_count} commentaires
                  </button>
                )}
                
                {/* Le bouton de masquage des commentaires a été déplacé dans la section des compteurs */}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
