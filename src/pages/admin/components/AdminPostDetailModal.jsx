import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  LightBulbIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  NewspaperIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  LinkIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AdminPostDetailModal({
  isOpen,
  onClose,
  post,
  postType,
  onApprove,
  onReject,
  onPending,
}) {
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  // Réinitialiser le formulaire de rejet quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setRejectionReason('');
      setShowRejectionForm(false);
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

  // Gestion du rejet
  const handleRejectClick = () => {
    setShowRejectionForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectionForm(false);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;

    try {
      setIsSubmitting(true);
      await onReject(post.id, rejectionReason);
      onClose();
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
    } finally {
      setIsSubmitting(false);
      setShowRejectionForm(false);
    }
  };

  // Afficher l'icône appropriée selon le type de post
  const renderTypeIcon = () => {
    switch (postType) {
      case 'jobOffer':
      case 'offres-emploi':
      case 'offres_emploi':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case 'businessOpportunity':
      case 'opportunites-affaires':
      case 'opportunites_affaires':
        return <LightBulbIcon className="h-5 w-5 text-yellow-500" />;
      case 'advertisement':
      case 'publicites':
        return <NewspaperIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  // Afficher les informations spécifiques selon le type de post
  const renderTypeSpecificInfo = () => {
    if (postType === 'jobOffer' || postType === 'offres-emploi' || postType === 'offres_emploi') {
      return (
        <div className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* En-tête de l'offre avec titre principal */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-3 mb-4`}>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {post.titre || post.title}
            </h2>
            <div className="flex items-center mt-1">
              <BuildingOfficeIcon className="h-4 w-4 mr-1 text-primary-500" />
              <span className="text-sm font-medium">{post.company_name || post.entreprise || 'Entreprise non précisée'}</span>
              {(post.location || post.lieu) && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <MapPinIcon className="h-4 w-4 mr-1 text-primary-500" />
                  <span className="text-sm">{post.location || post.lieu}</span>
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
                  <td className="px-4 py-2"><a href={post.lien} target='_blank'>suivre le lien</a></td>
                </tr>

                {/* Département */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Département</th>
                  <td className="px-4 py-2">{post.company_name || post.entreprise || 'Non précisé'}</td>
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
                  <span>{post.email_contact}</span>
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
                  <span>{post.external_link}</span>
                </div>
              )}

              {post.offer_file_url && (
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>Fichier de l'offre disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (postType === 'businessOpportunity' || postType === 'opportunites-affaires' || postType === 'opportunites_affaires') {
      return (
        <div className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* En-tête de l'opportunité avec titre principal */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-3 mb-4`}>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {post.titre || post.title}
            </h2>
            <div className="flex items-center mt-1">
              {(post.location || post.localisation) && (
                <>
                  <MapPinIcon className="h-4 w-4 mr-1 text-primary-500" />
                  <span className="text-sm">{post.location || post.localisation}</span>
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
                  <td className="px-4 py-2"><a href={post.lien} target='_blank'>suivre le lien</a></td>
                </tr>

                {/* Localisation */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Localisation</th>
                  <td className="px-4 py-2">{post.localisation || 'Non précisé'}</td>
                </tr>

                {/* Contacts */}
                {post.contacts && (
                  <tr>
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
                {post.investissement_requis && (
                  <tr>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Investissement requis</th>
                    <td className="px-4 py-2">{post.investissement_requis} {post.devise}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Description */}
          {post.description && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>DESCRIPTION</h3>
              <p className="text-sm whitespace-pre-line">{post.description}</p>
            </div>
          )}

          {/* Benefices attendus */}
          {post.benefices_attendus && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>BÉNÉFICES ATTENDUS</h3>
              <p className="text-sm whitespace-pre-line">{post.benefices_attendus}</p>
            </div>
          )}

          {/* Conditions de participation */}
          {post.conditions_participation && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>CONDITIONS DE PARTICIPATION</h3>
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
                  <span>{post.email}</span>
                </div>
              )}

              {post.contacts && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>{post.contacts}</span>
                </div>
              )}

              {post.lien && (
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span><a href={post.lien} target='_blank'>suivre le lien</a></span>
                </div>
              )}

              {post.opportunity_file_url && (
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>Fichier de l'opportunité disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (postType === 'advertisement' || postType === 'publicites') {
      return (
        <div className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* En-tête de la publicité avec titre principal */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-3 mb-4`}>
            <div className="flex items-center mt-1">
              <TagIcon className="h-4 w-4 mr-1 text-primary-500" />
              <span className="text-sm font-medium">
                {post.categorie === 'produit' ? 'Produit' : 'Service'}
              </span>
            </div>
          </div>

          {/* Tableau d'informations principales */}
          <div className={`w-full mb-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-md overflow-hidden`}>
            <table className="w-full text-sm">
              <tbody>
                {/* Prix */}
                <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Prix</th>
                  <td className="px-4 py-2">
                    {post.prix_unitaire_vente ? `${post.prix_unitaire_vente} ${post.devise || ''}` : 'Non précisé'}
                  </td>
                </tr>

                {/* Quantité disponible */}
                {post.quantite_disponible && (
                  <tr>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Quantité disponible</th>
                    <td className="px-4 py-2">{post.quantite_disponible}</td>
                  </tr>
                )}

                {/* Point de vente */}
                {post.point_vente && (
                  <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Point de vente</th>
                    <td className="px-4 py-2">{post.point_vente}</td>
                  </tr>
                )}

                {/* Besoin de livreurs */}
                {post.besoin_livreurs && (
                  <tr>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Besoin de livreurs</th>
                    <td className="px-4 py-2">{post.besoin_livreurs}</td>
                  </tr>
                )}

                {/* Prix de livraison */}
                {post.besoin_livreurs === 'OUI' && post.prix_unitaire_livraison && (
                  <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-2 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-1/3`}>Prix de livraison</th>
                    <td className="px-4 py-2">{post.prix_unitaire_livraison} {post.devise || ''}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Description */}
          {post.description && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>DESCRIPTION</h3>
              <p className="text-sm whitespace-pre-line">{post.description}</p>
            </div>
          )}

          {/* Conditions de livraison */}
          {post.besoin_livreurs === 'OUI' && post.conditions_livraison && (
            <div className="mb-4">
              <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>CONDITIONS DE LIVRAISON</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {Array.isArray(post.conditions_livraison) ? (
                  post.conditions_livraison.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))
                ) : (
                  <li>{post.conditions_livraison}</li>
                )}
              </ul>
            </div>
          )}

          {/* Informations de contact */}
          <div className="mt-6 pt-4 border-t">
            <h3 className={`text-sm uppercase tracking-wider font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>CONTACT</h3>
            <div className="flex flex-col space-y-2 text-sm">
              {post.email && (
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>{post.email}</span>
                </div>
              )}

              {post.contacts && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>{post.contacts}</span>
                </div>
              )}

              {post.adresse && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>{post.adresse}</span>
                </div>
              )}

              {post.lien && (
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span><a href={post.lien} target='_blank'>suivre le lien</a></span>
                </div>
              )}
            </div>
          </div>
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
                    {(postType === 'jobOffer' || postType === 'offres-emploi' || postType === 'offres_emploi') && post.offer_file_url ? (
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
                    ) : (postType === 'businessOpportunity' || postType === 'opportunites-affaires' || postType === 'opportunites_affaires') && post.opportunity_file_url ? (
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
                            {post.titre || post.title || 'Opportunité d\'affaire'}
                          </h3>

                          {/* Secteur */}
                          <p className={`text-sm mb-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {post.secteur ? `Secteur: ${post.secteur}` : ''}
                          </p>

                          {/* Bouton de téléchargement */}
                          <a
                            href={post.opportunity_file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white font-medium transition-colors duration-200 mt-2`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            Télécharger le document
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
                            {postType === 'jobOffer' || postType === 'offres-emploi' || postType === 'offres_emploi'
                              ? 'Offre d\'emploi' 
                              : postType === 'businessOpportunity' || postType === 'opportunites-affaires' || postType === 'opportunites_affaires'
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

                  {/* Section droite: détails et actions d'administration */}
                  <div className={`w-1/2 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* En-tête */}
                    <div className="p-4 border-b flex items-center space-x-3">
                      {post.user?.picture_url ? (
                        <img
                          src={post.user.picture_url}
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
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {post.user?.name || 'Utilisateur'}
                          </h3>
                          {renderTypeIcon()}
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(post.created_at)}
                        </p>
                      </div>
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

                      {/* Statut actuel */}
                      <div className={`mt-4 pt-3 flex justify-between text-sm ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'} border-t`}>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.statut === 'en_attente' 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
                              : post.statut === 'approuvé' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : post.statut === 'rejeté'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {post.statut === 'en_attente' 
                              ? 'En attente' 
                              : post.statut === 'approuvé' 
                                ? 'Approuvé'
                                : post.statut === 'rejeté'
                                  ? 'Rejeté'
                                  : post.statut}
                          </span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.etat === 'disponible' 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {post.etat === 'disponible' ? 'Disponible' : 'Terminé'}
                          </span>
                        </div>
                      </div>

                      {/* Actions d'administration */}
                      {!showRejectionForm ? (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => onApprove(post.id)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors"
                          >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Approuver
                          </button>
                          <button
                            onClick={handleRejectClick}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                          >
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Raison du rejet
                          </h3>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-32"
                            placeholder="Veuillez indiquer la raison du rejet..."
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleCancelReject}
                              className="px-4 py-2 border rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleConfirmReject}
                              disabled={!rejectionReason.trim() || isSubmitting}
                              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                                !rejectionReason.trim() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isSubmitting ? 'Envoi en cours...' : 'Confirmer le rejet'}
                            </button>
                          </div>
                        </div>
                      )}
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