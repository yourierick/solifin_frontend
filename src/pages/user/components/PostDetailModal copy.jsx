import React, { useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  XMarkIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../../contexts/AuthContext';

export default function PostDetailModal({
  isOpen,
  onClose,
  post,
  onLike,
  onComment,
  onCommentLike,
  onDeleteComment,
  onShare,
  isDarkMode,
}) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      setIsSubmitting(true);
      await onComment(post.id, comment);
      setComment('');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du commentaire:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mettre le focus sur le champ de commentaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Navigation dans le carrousel d'images
  const nextImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === post.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? post.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Afficher l'icône appropriée selon le type de post
  const renderTypeIcon = () => {
    switch (post.type) {
      case 'offres_emploi':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case 'opportunites_affaires':
        return <LightBulbIcon className="h-5 w-5 text-yellow-500" />;
      case 'publicites':
        return <NewspaperIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  // Afficher les informations spécifiques selon le type de post
  console.log(post);
  const renderTypeSpecificInfo = () => {
    if (post.type === 'offres_emploi') {
      return (
        <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          {post.sector && (
            <div className="flex items-center mb-1">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>Secteur: {post.sector}</span>
            </div>
          )}
        </div>
      );
    } else if (post.type === 'opportunites_affaires') {
      return (
        <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
    else if (post.type === 'publicites') {
      return (
        <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {post.sector && (
            <div className="flex items-center mb-1">
              <NewspaperIcon className="h-4 w-4 mr-1" />
              <span>Publicité</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (!post) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className={`w-full max-w-4xl transform overflow-hidden rounded-2xl shadow-xl transition-all ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex h-[80vh] max-h-[800px]">
                    {/* Section gauche: images/vidéo */}
                    <div className="w-1/2 relative flex items-center justify-center bg-black">
                      {post.images && post.images.length > 0 ? (
                        <>
                          <img
                            src={post.image_url}
                            alt={`Image ${currentImageIndex + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                          
                          {post.images.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                              >
                                <ChevronLeftIcon className="h-6 w-6" />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                              >
                                <ChevronRightIcon className="h-6 w-6" />
                              </button>
                              
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                                {post.images.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`h-2 w-2 rounded-full ${
                                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : post.video_url ? (
                        <div className="w-full h-full">
                          <iframe
                            src={post.video_url.replace('watch?v=', 'embed/')}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
                          <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {renderTypeIcon()}
                            <p className="mt-2">
                              {post.type === 'emploi' 
                                ? 'Offre d\'emploi' 
                                : post.type === 'opportunite' 
                                  ? 'Opportunité d\'affaires' 
                                  : 'Publication'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Section droite: détails et commentaires */}
                    <div className={`w-1/2 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      {/* En-tête */}
                      <div className="p-4 border-b flex items-center space-x-3">
                        {post.page.user?.profile_picture ? (
                          <img
                            src={post.page.user.profile_picture}
                            alt={post.user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                              {post.page.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {post.page.user?.name || 'Utilisateur'}
                            </h3>
                            {renderTypeIcon()}
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                        <button
                          className={`p-1 rounded-full ${
                            isDarkMode
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-500'
                          }`}
                        >
                          <EllipsisHorizontalIcon className="h-6 w-6" />
                        </button>
                      </div>
                      
                      {/* Contenu */}
                      <div className="p-4 overflow-y-auto flex-1">
                        {post.titre && (
                          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {post.titre}
                          </h2>
                        )}
                        <p className={`whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {post.description}
                        </p>
                        
                        {renderTypeSpecificInfo()}
                        
                        {/* Lien externe */}
                        {post.external_link && (
                          <a
                            href={post.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-3 block p-3 border rounded-lg ${
                              isDarkMode
                                ? 'border-gray-700 hover:bg-gray-700 text-primary-400'
                                : 'border-gray-200 hover:bg-gray-50 text-primary-600'
                            }`}
                          >
                            {post.external_link}
                          </a>
                        )}
                        
                        {/* Compteurs */}
                        <div className={`mt-4 pt-3 flex justify-between text-sm ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'} border-t`}>
                          <div>
                            {post.likes_count > 0 && (
                              <span>{post.likes_count} {post.likes_count === 1 ? 'j\'aime' : 'j\'aimes'}</span>
                            )}
                          </div>
                          <div className="flex space-x-4">
                            {post.comments_count > 0 && (
                              <span>{post.comments_count} {post.comments_count === 1 ? 'commentaire' : 'commentaires'}</span>
                            )}
                            {post.shares_count > 0 && (
                              <span>{post.shares_count} {post.shares_count === 1 ? 'partage' : 'partages'}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className={`mt-1 py-2 flex border-y ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <button
                            onClick={() => onLike(post.id)}
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
                            onClick={() => commentInputRef.current.focus()}
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
                            {isShareMenuOpen && (
                              <div
                                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 rounded-md shadow-lg z-10 ${
                                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                                } ring-1 ring-black ring-opacity-5`}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      onShare(post.id, 'facebook');
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
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Liste des commentaires */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="mt-4 space-y-3">
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
                                    <button
                                      onClick={() => onCommentLike(comment.id, post.id)}
                                      className={`font-medium ${
                                        comment.is_liked
                                          ? 'text-primary-500'
                                          : isDarkMode
                                            ? 'text-gray-400 hover:text-gray-300'
                                            : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                    >
                                      J'aime
                                    </button>
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
                          </div>
                        )}
                      </div>
                      
                      {/* Formulaire de commentaire */}
                      <div className="p-4 border-t">
                        <form onSubmit={handleSubmitComment} className="flex items-center">
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
                              disabled={!comment.trim() || isSubmitting}
                              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                                comment.trim() && !isSubmitting
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
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
