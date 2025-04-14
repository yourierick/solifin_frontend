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
  NewspaperIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  LinkIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  TagIcon,
  StarIcon,
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
      await onComment(post.id, comment, post.type);
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
      case 'offres-emploi':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case 'opportunites-affaires':
        return <LightBulbIcon className="h-5 w-5 text-yellow-500" />;
      case 'publicites':
        return <NewspaperIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  // Afficher les informations spécifiques selon le type de post
  const renderTypeSpecificInfo = () => {
    if (post.type === 'offres-emploi') {
      return (
        <div className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* En-tête de l'offre avec titre principal */}
          <div className="border-b pb-3 mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {post.titre || post.title}
            </h2>
            <div className="flex items-center mt-1">
              <BuildingOfficeIcon className="h-4 w-4 mr-1 text-primary-500" />
              <span className="text-sm font-medium">{post.company_name || 'Entreprise non précisée'}</span>
              {post.location && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <MapPinIcon className="h-4 w-4 mr-1 text-primary-500" />
                  <span className="text-sm">{post.location}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Tableau d'informations principales */}
          <div className={`w-full mb-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-md overflow-hidden`}>
            <table className="w-full text-sm">
              <tbody>
                {/* Référence */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Numéro de référence</th>
                  <td className="px-4 py-2">{post.reference || 'Non précisé'}</td>
                </tr>
                
                {/* Site */}
                <tr>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Site</th>
                  <td className="px-4 py-2">{post.lien || 'Non précisé'}</td>
                </tr>
                
                {/* Département */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Département</th>
                  <td className="px-4 py-2">{post.company_name || 'Non précisé'}</td>
                </tr>
                
                {/* Type de contrat */}
                {post.type_contrat && (
                  <tr>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Type de contrat</th>
                    <td className="px-4 py-2">{post.type_contrat}</td>
                  </tr>
                )}
                
                {/* Date limite */}
                {post.date_limite && (
                  <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Date limite</th>
                    <td className="px-4 py-2">{new Date(post.date_limite).toLocaleDateString('fr-FR')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Vue d'ensemble du poste */}
          {post.description && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>VUE D'ENSEMBLE DU POSTE</h3>
              <p className="text-sm whitespace-pre-line">{post.description}</p>
            </div>
          )}
          
          {/* Compétences requises */}
          {post.competences_requises && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>COMPÉTENCES CLÉS</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {post.competences_requises.split(',').map((competence, index) => (
                  <li key={index}>{competence.trim()}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Expérience et études */}
          {(post.experience_requise || post.niveau_etudes) && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>QUALIFICATIONS</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {post.experience_requise && (
                  <li><span className="font-medium">Expérience:</span> {post.experience_requise}</li>
                )}
                {post.niveau_etudes && (
                  <li><span className="font-medium">Formation:</span> {post.niveau_etudes}</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Avantages */}
          {post.avantages && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>AVANTAGES</h3>
              <p className="text-sm whitespace-pre-line">{post.avantages}</p>
            </div>
          )}
          
          {/* Rémunération */}
          {(post.salaire || post.devise) && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>RÉMUNÉRATION</h3>
              <p className="text-sm">
                {post.salaire ? post.salaire : 'Non précisé'}
                {post.devise ? ` ${post.devise}` : ''}
              </p>
            </div>
          )}
          
          {/* Informations de contact */}
          <div className="mt-6 pt-4 border-t">
            <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>CONTACT</h3>
            <div className="flex flex-col space-y-2 text-sm">
              {post.email_contact && (
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <a 
                    href={`mailto:${post.email_contact}`} 
                    className="text-primary-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.email_contact}
                  </a>
                </div>
              )}
              
              {post.contacts && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>{post.contacts}</span>
                </div>
              )}
              
              {post.external_link && (
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <a 
                    href={post.external_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    En savoir plus
                  </a>
                </div>
              )}
              
              {post.offer_file_url && (
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <a 
                    href={post.offer_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                    download
                  >
                    Télécharger l'offre complète
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (post.type === 'opportunites_affaires') {
      return (
        <div className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* En-tête de l'offre avec titre principal */}
          <div className="border-b pb-3 mb-4">
            <div className="flex items-center mt-1">
              <BuildingOfficeIcon className="h-4 w-4 mr-1 text-primary-500" />
              {post.location && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <MapPinIcon className="h-4 w-4 mr-1 text-primary-500" />
                  <span className="text-sm">{post.location}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Tableau d'informations principales */}
          <div className={`w-full mb-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-md overflow-hidden`}>
            <table className="w-full text-sm">
              <tbody>
                {/* Secteur */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Secteur</th>
                  <td className="px-4 py-2">{post.secteur || 'Non précisé'}</td>
                </tr>
                
                {/* Site */}
                <tr>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Site</th>
                  <td className="px-4 py-2">{post.lien || 'Non précisé'}</td>
                </tr>
                
                {/* Localisation */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Localisation</th>
                  <td className="px-4 py-2">{post.localisation || 'Non précisé'}</td>
                </tr>
                
                {/* Contacts */}
                {post.contacts && (
                  <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Contacts</th>
                    <td className="px-4 py-2">{post.contacts}</td>
                  </tr>
                )}
                
                {/* Date limite */}
                {post.date_limite && (
                  <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Date limite</th>
                    <td className="px-4 py-2">{new Date(post.date_limite).toLocaleDateString('fr-FR')}</td>
                  </tr>
                )}

                {/* Investissement requis */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Investissement requis</th>
                  <td className="px-4 py-2">{post.investissement_requis ? `${post.investissement_requis} ${post.devise}` : 'Non défini'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Vue d'ensemble du poste */}
          {post.description && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>VUE D'ENSEMBLE DU POSTE</h3>
              <p className="text-sm whitespace-pre-line">{post.description}</p>
            </div>
          )}
          
          {/* Benefices attendus */}
          {post.benefices_attendus && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Bénéfices attendus</h3>
              <p className="text-sm whitespace-pre-line">{post.benefices_attendus}</p>
            </div>
          )}
          
          {/* Investissement requis */}
          {post.conditions_participation && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Conditions de participation</h3>
              <p className="text-sm whitespace-pre-line">{post.conditions_participation}</p>
            </div>
          )}
          
          {/* Informations de contact */}
          <div className="mt-6 pt-4 border-t">
            <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>CONTACT</h3>
            <div className="flex flex-col space-y-2 text-sm">
              {post.email && (
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <a 
                    href={`mailto:${post.email}`} 
                    className="text-primary-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.email}
                  </a>
                </div>
              )}
              
              {post.contacts && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>{post.contacts}</span>
                </div>
              )}
              
              {post.external_link && (
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <a 
                    href={post.external_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    En savoir plus
                  </a>
                </div>
              )}

{post.opportunity_file_url && (
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <a 
                    href={post.opportunity_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                    download
                  >
                    Télécharger l'appel à candidature
                  </a>
                </div>
              )}
            </div>
          </div>
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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
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
                  {/* Section gauche: images/vidéo/fichier */}
                  <div className="w-1/2 relative flex items-center justify-center bg-black">
                    {post.type === 'offres-emploi' && post.offer_file_url ? (
                      <div className={`flex flex-col items-center justify-center w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                        <div className="flex flex-col items-center p-8 max-w-md">
                          {/* Icône PDF */}
                          <div className="relative mb-4">
                            <svg className="w-32 h-32 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                              <path fill="currentColor" d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                              <path fill="currentColor" d="M80 224c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16V224zm96 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16V224zm96 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16V224z"/>
                            </svg>
                            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                              PDF
                            </div>
                          </div>
                          
                          {/* Titre du fichier */}
                          <h3 className={`text-lg font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {post.titre || post.title || 'Offre d\'emploi'}
                          </h3>
                          
                          {/* Référence */}
                          <p className={`text-sm mb-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {post.reference ? `Réf: ${post.reference}` : ''}
                            {post.company_name ? (post.reference ? ' | ' : '') + post.company_name : ''}
                          </p>
                          
                          {/* Bouton de téléchargement */}
                          <a
                            href={post.offer_file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white font-medium transition-colors duration-200 mt-2`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            Télécharger l'offre
                          </a>
                        </div>
                      </div>
                    ) : post.image_url ? (
                      <>
                        <img
                          src={post.image_url}
                          alt={`Image ${currentImageIndex + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
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
                            {post.type === 'offres-emploi' 
                              ? 'Offre d\'emploi' 
                              : post.type === 'opportunites_affaires' 
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
                      {post.user?.picture ? (
                        <img
                          src={post.user.picture}
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
                              {comment.user?.picture ? (
                                <img
                                  src={comment.user.picture}
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
                                      onClick={() => onDeleteComment(comment.id, post.id, post.type)}
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
      </Dialog>
    </Transition>
  );
}
