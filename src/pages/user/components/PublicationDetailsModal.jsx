import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import InteractionBar from '../../../components/InteractionBar';
import CommentSection from '../../../components/CommentSection';
import ShareModal from '../../../components/ShareModal';

/**
 * Modal pour afficher les détails d'une publication
 */
export default function PublicationDetailsModal({ isOpen = true, onClose, publication, type, onEdit, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Style pour la scrollbar personnalisée
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      
      @media (prefers-color-scheme: dark) {
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  if (!publication) return null;

  // Obtenir les détails formatés selon le type de publication
  const getFormattedDetails = () => {
    const formattedDate = publication.created_at 
      ? format(new Date(publication.created_at), 'dd MMMM yyyy', { locale: fr })
      : 'Date inconnue';
      
    switch (type) {
      case 'advertisement':
        return {
          title: 'Publicité',
          subtitle: publication.titre,
          description: publication.description,
          date: formattedDate,
          details: {
            title: 'Informations sur la publicité',
            fields: [
              { label: 'Catégorie', value: publication.categorie === 'produit' ? 'Produit' : 'Service' },
              { label: 'Contacts', value: publication.contacts || 'Non spécifié' },
              { label: 'Email', value: publication.email || 'Non spécifié' },
              { label: 'Adresse', value: publication.adresse || 'Non spécifié' },
              { label: 'Besoin de livreurs', value: publication.besoin_livreurs ? 'Oui' : 'Non' },
              { label: 'Conditions de livraison', value: publication.conditions_livraison || 'Non spécifiées' },
              { label: 'Point de vente', value: publication.point_vente || 'Non spécifié' },
              publication.prix_unitaire_vente ? { label: 'Prix unitaire de vente', value: `${publication.prix_unitaire_vente} ${publication.devise}` } : { label: 'Prix unitaire de vente', value: 'Non défini' },
              publication.commission_livraison ? { label: 'Commission de livraison', value: `${publication.commission_livraison} ` } : { label: 'Commission de livraison', value: 'Non défini' },
              publication.prix_unitaire_livraison ? { label: 'Prix unitaire de livraison', value: `${publication.prix_unitaire_livraison} ${publication.devise}` } : { label: 'Prix unitaire de livraison', value: 'Non défini' },
              publication.lien ? { label: 'Lien externe', value: <a href={publication.lien} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Voir le lien</a> } : { label: 'Lien externe', value: 'Aucun lien' },
              { label: 'Durée d\'affichage', value: publication.duree_affichage + ' jours' || 'Non spécifiée' },
              { label: 'Statut', value: getStatusText(publication.statut) },
              { label: 'État', value: getEtatText(publication.etat || 'disponible') }
            ]
          }
        };
      case 'jobOffer':
        return {
          title: 'Offre d\'emploi',
          subtitle: publication.titre,
          description: publication.description,
          date: formattedDate,
          details: {
            title: 'Informations sur l\'offre d\'emploi',
            fields: [
              { label: 'Référence', value: publication.reference || 'Non spécifiée' },
              { label: 'Titre', value: publication.titre || 'Non spécifié' },
              { label: 'Entreprise', value: publication.entreprise || 'Non spécifiée' },
              { label: 'Compétences requises', value: 
                publication.competences_requises ? 
                <div className="mt-4">
                  <ul className="list-disc pl-6 space-y-2">
                    {publication.competences_requises.split(',').map((competence, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{competence.trim()}</li>
                    ))}
                  </ul>
                </div> : 'Non spécifiées'
              },
              { label: 'Devise', value: publication.devise || 'Non spécifiée' },
              { label: 'Avantages', value: publication.avantages || 'Non spécifiés' },
              { label: 'Date limite', value: publication.date_limite ? format(new Date(publication.date_limite), 'dd MMMM yyyy', { locale: fr }) : 'Non spécifiée' },
              { label: 'Email de contact', value: publication.email_contact || 'Non spécifié' },
              { label: 'Contacts', value: publication.contacts || 'Non spécifiés' },
              { label: 'Fichier de l\'offre', value: publication.offer_file ? 
                <a href={publication.offer_file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Télécharger le fichier</a> : 
                'Aucun fichier'
              },
              { label: 'Lien externe', value: publication.lien ? 
                <a href={publication.lien} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Voir le lien</a> : 
                'Aucun lien'
              },
              { label: 'Type de contrat', value: publication.type_contrat },
              { label: 'Lieu', value: publication.lieu },
              { label: 'Salaire', value: publication.salaire ? `${publication.salaire} ${publication.devise}` : 'Non spécifié' },
              { label: 'Expérience requise', value: publication.experience_requise },
              { label: 'Niveau d\'études', value: publication.niveau_etudes },
              { label: 'Statut', value: getStatusText(publication.statut) },
              { label: 'État', value: getEtatText(publication.etat || 'disponible') }
            ]
          }
        };
      case 'businessOpportunity':
        return {
          title: 'Opportunité d\'affaires',
          subtitle: publication.titre,
          description: publication.description,
          date: formattedDate,
          details: {
            title: 'Informations sur l\'opportunité',
            fields: [
              { label: 'Secteur', value: publication.secteur },
              { label: 'Localisation', value: publication.localisation },
              { label: 'Investissement requis', value: publication.investissement_requis ? `${publication.investissement_requis} ${publication.devise}` : 'Non spécifié' },
              { label: 'Bénéfices attendus', value: publication.benefices_attendus || 'Non spécifiés' },
              { label: 'Devise', value: publication.devise || 'Non spécifiée' },
              { label: 'Durée de retour sur investissement', value: publication.duree_retour_investissement || 'Non spécifiée' },
              { label: 'Contacts', value: publication.contacts || 'Non spécifiés' },
              { label: 'Email', value: publication.email || 'Non spécifié' },
              { label: 'Conditions de participation', value: publication.conditions_participation || 'Non spécifiées' },
              { label: 'Date limite', value: publication.date_limite ? format(new Date(publication.date_limite), 'dd MMMM yyyy', { locale: fr }) : 'Non spécifiée' },
              { label: 'Statut', value: getStatusText(publication.statut) },
              { label: 'État', value: getEtatText(publication.etat || 'disponible') }
            ]
          }
        };
      default:
        return {
          title: 'Publication',
          subtitle: '',
          description: '',
          date: formattedDate,
          details: {
            title: 'Détails',
            fields: []
          }
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'approuvé':
        return 'Approuvé';
      case 'rejeté':
        return 'Rejeté';
      case 'expiré':
        return 'Expiré';
      default:
        return 'Inconnu';
    }
  };
  
  const getEtatText = (etat) => {
    switch (etat) {
      case 'disponible':
        return 'Disponible';
      case 'terminé':
        return 'Terminé';
      default:
        return 'Disponible';
    }
  };

  const details = getFormattedDetails();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-12 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    {details.title}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-250px)]">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{details.subtitle}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Publié le {details.date}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-200">{details.description || 'Aucune description disponible'}</p>
                  </div>
                  
                  {publication.image_url && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Image</h4>
                      <div className="mt-1">
                        <img 
                          src={publication.image_url} 
                          alt={details.subtitle} 
                          className="max-w-full h-auto rounded-lg max-h-60 object-contain" 
                        />
                      </div>
                    </div>
                  )}
                  
                  {publication.video_url && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vidéo</h4>
                      <div className="mt-1">
                        <video 
                          src={publication.video_url} 
                          controls 
                          className="max-w-full h-auto rounded-lg max-h-60" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{details.details.title} - Détails</h4>
                    <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700 border-t border-b border-gray-200 dark:border-gray-700">
                      {details.details.fields.map((field, index) => (
                        <div key={index} className="py-3 flex justify-between text-sm gap-4">
                          <dt className="text-gray-500 dark:text-gray-400">{field.label}</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barre d'interactions */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <InteractionBar 
              publicationType={type}
              publicationId={publication.id}
              onCommentClick={() => setShowComments(!showComments)}
              onShareClick={() => setShowShareModal(true)}
              className="justify-center"
            />
          </div>
          
          {/* Section des commentaires */}
          {showComments && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <CommentSection 
                publicationType={type}
                publicationId={publication.id}
              />
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              >
                Supprimer
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
      
      {showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          publicationType={type}
          publicationId={publication.id}
          publicationTitle={details.subtitle}
        />
      )}
    </div>
  );
}