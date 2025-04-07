import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Modal pour afficher les détails d'une publication
 */
export default function PublicationDetailsModal({ isOpen = true, onClose, publication, type, onEdit, onDelete }) {
  // Style pour la scrollbar personnalisée
  React.useEffect(() => {
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

    const statusMap = {
      'en_attente': { text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      'approuvé': { text: 'Approuvé', className: 'bg-green-100 text-green-800' },
      'rejeté': { text: 'Rejeté', className: 'bg-red-100 text-red-800' },
      'expiré': { text: 'Expiré', className: 'bg-gray-100 text-gray-800' }
    };

    const etatMap = {
      'disponible': { text: 'Disponible', className: 'bg-blue-100 text-blue-800' },
      'terminé': { text: 'Terminé', className: 'bg-gray-100 text-gray-500' }
    };

    const statusInfo = statusMap[publication.statut] || { text: 'Inconnu', className: 'bg-gray-100 text-gray-800' };
    const etatInfo = etatMap[publication.etat] || { text: 'Disponible', className: 'bg-blue-100 text-blue-800' };

    let typeSpecificDetails = {};
    let icon = null;

    switch (type) {
      case 'advertisement':
        typeSpecificDetails = {
          title: 'Publicité',
          fields: [
            { label: 'Identifiant', value: publication.id },
            { label: 'Catégorie', value: publication.categorie === 'produit' ? 'Produit' : 'Service' },
            { label: 'Prix', value: `${publication.prix_unitaire_vente} ${publication.devise}` },
            { label: 'Quantité disponible', value: publication.quantite_disponible || 'Non spécifié' },
            { label: 'Lieu', value: publication.localisation || 'Non spécifié' },
            { label: 'Date de création', value: formattedDate },
            { label: 'Date de mise à jour', value: publication.updated_at ? format(new Date(publication.updated_at), 'dd MMMM yyyy', { locale: fr }) : 'Non disponible' },
            { label: 'Etat', value: etatInfo.text },
            { label: 'Statut', value: statusInfo.text }
          ]
        };
        icon = (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
            </svg>
          </div>
        );
        break;
      case 'jobOffer':
        typeSpecificDetails = {
          title: 'Offre d\'emploi',
          fields: [
            { label: 'Identifiant', value: publication.id },
            { label: 'Type de contrat', value: publication.type_contrat },
            { label: 'Salaire', value: publication.salaire ? `${publication.salaire} ${publication.devise}` : 'Non spécifié' },
            { label: 'Lieu', value: publication.localisation || 'Non spécifié' },
            { label: 'Expérience requise', value: publication.experience_requise || 'Non spécifié' },
            { label: 'Niveau d\'étude', value: publication.niveau_etude || 'Non spécifié' },
            { label: 'Entreprise', value: publication.entreprise || 'Non spécifié' },
            { label: 'Date de création', value: formattedDate },
            { label: 'Date de mise à jour', value: publication.updated_at ? format(new Date(publication.updated_at), 'dd MMMM yyyy', { locale: fr }) : 'Non disponible' },
            { label: 'Date limite de candidature', value: publication.date_limite_candidature ? format(new Date(publication.date_limite_candidature), 'dd MMMM yyyy', { locale: fr }) : 'Non spécifié' },
            { label: 'Etat', value: etatInfo.text },
            { label: 'Statut', value: statusInfo.text }
          ]
        };
        icon = (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
        );
        break;
      case 'businessOpportunity':
        typeSpecificDetails = {
          title: 'Opportunité d\'affaires',
          fields: [
            { label: 'Identifiant', value: publication.id },
            { label: 'Secteur', value: publication.secteur },
            { label: 'Investissement requis', value: publication.investissement_requis ? `${publication.investissement_requis} ${publication.devise}` : 'Non spécifié' },
            { label: 'Lieu', value: publication.localisation || 'Non spécifié' },
            { label: 'Rentabilité estimée', value: publication.rentabilite_estimee || 'Non spécifié' },
            { label: 'Type de partenariat', value: publication.type_partenariat || 'Non spécifié' },
            { label: 'Date de création', value: formattedDate },
            { label: 'Date de mise à jour', value: publication.updated_at ? format(new Date(publication.updated_at), 'dd MMMM yyyy', { locale: fr }) : 'Non disponible' },
            { label: 'Date limite', value: publication.date_limite ? format(new Date(publication.date_limite), 'dd MMMM yyyy', { locale: fr }) : 'Non spécifié' },
            { label: 'Etat', value: etatInfo.text },
            { label: 'Statut', value: statusInfo.text }
          ]
        };
        icon = (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
            </svg>
          </div>
        );
        break;
      default:
        typeSpecificDetails = {
          title: 'Publication',
          fields: []
        };
    }

    return {
      title: publication.titre,
      description: publication.description,
      details: typeSpecificDetails,
      date: formattedDate,
      status: statusInfo,
      etat: etatInfo,
      icon
    };
  };

  const details = getFormattedDetails();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75 dark:opacity-80"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="sm:flex sm:items-start sticky top-0 bg-white dark:bg-gray-800 pt-2 pb-3 z-10">
              {details.icon}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {details.title}
                </h3>
                <div className="mt-2 flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${details.status.className}`}>
                    {details.status.text}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${details.etat.className}`}>
                    {details.etat.text}
                  </span>
                </div>
              </div>
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
                    alt={details.title} 
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
                  <div key={index} className="py-3 flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">{field.label}</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

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
    </div>
  );
}
