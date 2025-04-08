import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircleIcon, InformationCircleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { usePublicationPack } from '../../../contexts/PublicationPackContext';
import PublicationPackAlert from '../../../components/PublicationPackAlert';
import Notification from '../../../components/Notification';
import CountryCodeSelector from '../../../components/CountryCodeSelector';

/**
 * Composant formulaire pour créer différents types de publications
 * (publicités, offres d'emploi, opportunités d'affaires)
 */
export default function PublicationForm({ type, onSubmit, onCancel, initialData, isEditMode = false }) {
  // Extraire l'indicatif téléphonique et le numéro si disponible en mode édition
  let initialPhoneCode = '+225'; // Valeur par défaut: Côte d'Ivoire
  let initialPhoneNumber = '';
  
  if (isEditMode && initialData && initialData.contacts) {
    // Essayer d'extraire l'indicatif du numéro de téléphone
    const phoneMatch = initialData.contacts.match(/^(\+\d+)\s*(.*)$/);
    if (phoneMatch) {
      initialPhoneCode = phoneMatch[1];
      initialPhoneNumber = phoneMatch[2];
    } else {
      initialPhoneNumber = initialData.contacts;
    }
  }
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: isEditMode && initialData ? {
      titre: initialData.titre,
      description: initialData.description,
      // D'autres champs génériques qui peuvent être présents
      phoneNumber: initialPhoneNumber, // Nouveau champ pour le numéro sans l'indicatif
      email: initialData.email,
      adresse: initialData.adresse,
      lien: initialData.lien,
      devise: initialData.devise || 'FC'
    } : {}
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [imageError, setImageError] = useState('');
  const [videoError, setVideoError] = useState('');
  const [conditionsLivraison, setConditionsLivraison] = useState([]);
  const [phoneCode, setPhoneCode] = useState(initialPhoneCode);

  const { user } = useAuth();
  const { isActive: isPackActive, packInfo } = usePublicationPack();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const watchCategorie = watch('categorie');
  const watchBesoinLivreurs = watch('besoin_livreurs');

  const formFields = {
    advertisement: [
      { name: 'categorie', label: 'Catégorie', type: 'select', required: true, options: [
        { value: 'produit', label: 'Produit' },
        { value: 'service', label: 'Service' }
      ]},
      { name: 'titre', label: 'Titre', type: 'text', required: true, placeholder: 'Titre de votre publicité' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Description détaillée de votre publicité' },
      { name: 'image', label: 'Image (max: 2Mo)', type: 'file', accept: 'image/*' },
      { name: 'video', label: 'Vidéo (max: 10Mo)', type: 'file', accept: 'video/*' },
      { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'phone', required: true, placeholder: 'Numéro sans indicatif et sans 0 initial (ex: 123456789)' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'Email de contact' },
      { name: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Adresse physique' },
      { name: 'besoin_livreurs', label: 'Besoin de livreurs', type: 'select', options: [
        { value: 'OUI', label: 'Oui' },
        { value: 'NON', label: 'Non' }
      ]},
      { name: 'conditions_livraison', label: 'Conditions de livraison', type: 'custom', 
        show: (values) => values.besoin_livreurs === 'OUI'
      },
      { name: 'point_vente', label: 'Point de vente', type: 'text', placeholder: 'Emplacement du point de vente' },
      { name: 'quantite_disponible', label: 'Quantité disponible', type: 'number',
        show: (values) => values.categorie === 'produit'
      },
      { name: 'prix_unitaire_vente', label: 'Prix unitaire de vente sur place', type: 'number', required: true },
      { name: 'devise', label: 'Devise', type: 'select', required: true, options: [
        { value: 'XOF', label: 'XOF (FCFA)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'YEN', label: 'YEN (¥)' },
        { value: 'YUAN', label: 'YUAN (¥)' },
        { value: 'CDF', label: 'CDF (FC)' },
        { value: 'SAR', label: 'SAR (﷼)' }
      ]},
      { name: 'commission_livraison', label: 'Commission de livraison', type: 'select', 
        options: [
          { value: 'OUI', label: 'Oui' },
          { value: 'NON', label: 'Non' }
        ],
        show: (values) => values.besoin_livreurs === 'OUI'
      },
      { name: 'prix_unitaire_livraison', label: 'Prix unitaire de vente à la livraison', type: 'number',
        show: (values) => values.besoin_livreurs === 'OUI'
      },
      { name: 'lien', label: 'Lien', type: 'url', placeholder: 'Lien externe (site web, boutique en ligne, etc.)' }
    ],
    
    jobOffer: [
      { name: 'titre', label: 'Titre du poste', type: 'text', required: true, placeholder: 'Ex: Développeur Web Senior' },
      { name: 'entreprise', label: 'Entreprise', type: 'text', required: true, placeholder: 'Nom de l\'entreprise' },
      { name: 'lieu', label: 'Lieu', type: 'text', required: true, placeholder: 'Ex: Abidjan, Côte d\'Ivoire' },
      { name: 'type_contrat', label: 'Type de contrat', type: 'select', required: true, options: [
        { value: 'CDI', label: 'CDI' },
        { value: 'CDD', label: 'CDD' },
        { value: 'Stage', label: 'Stage' },
        { value: 'Freelance', label: 'Freelance' },
        { value: 'Temps partiel', label: 'Temps partiel' }
      ]},
      { name: 'description', label: 'Description du poste', type: 'textarea', required: true, placeholder: 'Description détaillée du poste' },
      { name: 'competences_requises', label: 'Compétences requises', type: 'textarea', required: true, placeholder: 'Liste des compétences requises, séparées par des virgules' },
      { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'phone', required: true, placeholder: 'Numéro sans indicatif et sans 0 initial (ex: 123456789)' },
      { name: 'experience_requise', label: 'Expérience requise', type: 'select', required: true, options: [
        { value: 'Débutant', label: 'Débutant (0-1 an)' },
        { value: 'Intermédiaire', label: 'Intermédiaire (1-3 ans)' },
        { value: 'Confirmé', label: 'Confirmé (3-5 ans)' },
        { value: 'Expert', label: 'Expert (5+ ans)' }
      ]},
      { name: 'niveau_etudes', label: 'Niveau d\'études', type: 'select', options: [
        { value: 'Bac', label: 'Bac' },
        { value: 'Bac+2', label: 'Bac+2' },
        { value: 'Bac+3/Licence', label: 'Bac+3/Licence' },
        { value: 'Bac+5/Master', label: 'Bac+5/Master' },
        { value: 'Doctorat', label: 'Doctorat' }
      ]},
      { name: 'salaire', label: 'Salaire', type: 'text', placeholder: 'Ex: 500000 - 700000' },
      { name: 'devise', label: 'Devise', type: 'select', options: [
        { value: 'XOF', label: 'XOF (FCFA)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'USD', label: 'USD ($)' }
      ]},
      { name: 'avantages', label: 'Avantages', type: 'textarea', placeholder: 'Ex: Assurance maladie, tickets restaurant, etc.' },
      { name: 'date_limite', label: 'Date limite de candidature', type: 'date' },
      { name: 'email_contact', label: 'Email de contact', type: 'email', required: true, placeholder: 'Email pour recevoir les candidatures' },
      { name: 'lien', label: 'Lien', type: 'url', placeholder: 'Lien externe (site web, page de recrutement, etc.)' }
    ],
    
    businessOpportunity: [
      { name: 'titre', label: 'Titre de l\'opportunité', type: 'text', required: true, placeholder: 'Titre de votre opportunité d\'affaires' },
      { name: 'secteur', label: 'Secteur d\'activité', type: 'text', required: true, placeholder: 'Ex: Immobilier, E-commerce, Agriculture' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Description détaillée de l\'opportunité d\'affaires' },
      { name: 'benefices_attendus', label: 'Bénéfices attendus', type: 'textarea', required: true, placeholder: 'Détaillez les bénéfices potentiels de cette opportunité' },
      { name: 'investissement_requis', label: 'Investissement requis', type: 'number', placeholder: 'Montant de l\'investissement nécessaire' },
      { name: 'devise', label: 'Devise', type: 'select', options: [
        { value: 'XOF', label: 'XOF (FCFA)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'USD', label: 'USD ($)' }
      ]},
      { name: 'duree_retour_investissement', label: 'Durée estimée de retour sur investissement', type: 'select', options: [
        { value: 'Moins de 6 mois', label: 'Moins de 6 mois' },
        { value: '6 mois à 1 an', label: '6 mois à 1 an' },
        { value: '1 à 2 ans', label: '1 à 2 ans' },
        { value: '2 à 5 ans', label: '2 à 5 ans' },
        { value: 'Plus de 5 ans', label: 'Plus de 5 ans' }
      ]},
      { name: 'image', label: 'Image (max: 2Mo)', type: 'file', accept: 'image/*' },
      { name: 'localisation', label: 'Localisation', type: 'text', placeholder: 'Emplacement géographique de l\'opportunité' },
      { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'phone', required: true, placeholder: 'Numéro sans indicatif et sans 0 initial (ex: 123456789)' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'Email de contact' },
      { name: 'conditions_participation', label: 'Conditions de participation', type: 'textarea', placeholder: 'Détaillez les conditions requises pour participer' },
      { name: 'date_limite', label: 'Date limite', type: 'date', placeholder: 'Date limite pour postuler/investir' }
    ]
  };
  
  // Mettre à jour le champ caché des conditions de livraison lorsqu'elles changent
  useEffect(() => {
    if (type === 'advertisement') {
      // S'assurer que conditionsLivraison est toujours un tableau
      const conditions = Array.isArray(conditionsLivraison) ? conditionsLivraison : [];
      setValue('conditions_livraison', conditions);
    }
  }, [conditionsLivraison, setValue, type]);

  // Précharger les données de la publication en mode édition
  useEffect(() => {
    if (isEditMode && initialData) {
      // Définir les valeurs spécifiques au type de publication
      if (type === 'advertisement') {
        setValue('categorie', initialData.categorie);
        setValue('besoin_livreurs', initialData.besoin_livreurs || 'NON');
        // Gérer les conditions de livraison comme un tableau
        // Traitement des conditions de livraison
        let conditions = [];
        if (initialData.conditions_livraison) {
          if (Array.isArray(initialData.conditions_livraison)) {
            conditions = initialData.conditions_livraison;
          } else if (typeof initialData.conditions_livraison === 'string') {
            try {
              const parsed = JSON.parse(initialData.conditions_livraison);
              conditions = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              conditions = initialData.conditions_livraison.length > 0 ? [initialData.conditions_livraison] : [];
            }
          }
        }
        setConditionsLivraison(conditions);
        setValue('conditions_livraison', conditions);
        setValue('point_vente', initialData.point_vente);
        setValue('quantite_disponible', initialData.quantite_disponible);
        setValue('prix_unitaire_vente', initialData.prix_unitaire_vente);
        setValue('commission_livraison', initialData.commission_livraison || 'NON');
        setValue('prix_unitaire_livraison', initialData.prix_unitaire_livraison);
      } else if (type === 'jobOffer') {
        setValue('entreprise', initialData.entreprise);
        setValue('lieu', initialData.lieu);
        setValue('type_contrat', initialData.type_contrat);
        setValue('competences_requises', initialData.competences_requises);
        setValue('experience_requise', initialData.experience_requise);
        setValue('niveau_etudes', initialData.niveau_etudes);
        setValue('salaire', initialData.salaire);
        setValue('avantages', initialData.avantages);
        // Formater la date au format YYYY-MM-DD pour le champ input type="date"
        if (initialData.date_limite) {
          const date = new Date(initialData.date_limite);
          const formattedDate = date.toISOString().split('T')[0];
          setValue('date_limite', formattedDate);
        }
        setValue('email_contact', initialData.email_contact);
      } else if (type === 'businessOpportunity') {
        setValue('secteur', initialData.secteur);
        setValue('benefices_attendus', initialData.benefices_attendus);
        setValue('investissement_requis', initialData.investissement_requis);
        setValue('duree_retour_investissement', initialData.duree_retour_investissement);
        setValue('localisation', initialData.localisation);
        setValue('conditions_participation', initialData.conditions_participation);
        // Formater la date au format YYYY-MM-DD pour le champ input type="date"
        if (initialData.date_limite) {
          const date = new Date(initialData.date_limite);
          const formattedDate = date.toISOString().split('T')[0];
          setValue('date_limite', formattedDate);
        }
      }
    }
  }, [isEditMode, initialData, type, setValue]);

  // Vérifier les tailles maximales pour les fichiers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2 Mo
        setImageError('L\'image doit faire moins de 2Mo');
        return;
      }
      
      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        setImageError('Le fichier sélectionné n\'est pas une image valide');
        return;
      }
      
      setSelectedImage(file);
      setImageError('');
    } else {
      setSelectedImage(null);
    }
  };
  
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10 Mo
        setVideoError('La vidéo doit faire moins de 10Mo');
        return;
      }
      
      // Vérifier que c'est bien une vidéo
      if (!file.type.startsWith('video/')) {
        setVideoError('Le fichier sélectionné n\'est pas une vidéo valide');
        return;
      }
      
      setSelectedVideo(file);
      setVideoError('');
    } else {
      setSelectedVideo(null);
    }
  };

  // Gestion de la soumission du formulaire
  const onFormSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // Créer un objet FormData pour gérer les fichiers
      const data = new FormData();
      
      // Ajouter chaque champ du formulaire au FormData
      Object.keys(formData).forEach(key => {
        // Ne pas ajouter les champs de fichiers, ils seront gérés séparément
        if (key !== 'image' && key !== 'video') {
          // Traitement spécial pour conditions_livraison
          if (key === 'conditions_livraison') {
            // S'assurer que c'est un tableau avant de l'envoyer
            const conditions = Array.isArray(formData[key]) ? formData[key] : [];
            data.append(key, JSON.stringify(conditions));
          } else {
            data.append(key, formData[key]);
          }
        }
      });
      
      // Ajouter l'image si elle existe
      if (selectedImage) {
        data.append('image', selectedImage);
      }
      
      // Ajouter la vidéo si elle existe
      if (selectedVideo) {
        data.append('video', selectedVideo);
      }
      
      // Appeler la fonction onSubmit passée par le parent
      await onSubmit(data);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      alert("Erreur lors de la soumission: " + (error.response?.data?.message || error.message || "Veuillez réessayer"));
      // Réinitialiser l'état de soumission pour permettre une nouvelle tentative
      setIsSubmitting(false);
    }
  };

  const onSubmitHandler = async (data) => {
    // Vérifier si le pack est actif avant de soumettre (sauf en mode édition)
    if (!isPackActive && !isEditMode) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer un FormData pour gérer les fichiers
      const formData = new FormData();
      
      // Concaténer l'indicatif téléphonique avec le numéro de téléphone
      const fullPhoneNumber = data.phoneNumber ? `${phoneCode} ${data.phoneNumber.trim()}` : '';
      
      // Ajouter les champs du formulaire
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && key !== 'image' && key !== 'video' && key !== 'phoneNumber') {
          // Traitement spécial pour conditions_livraison
          if (key === 'conditions_livraison') {
            // S'assurer que c'est un tableau avant l'envoi
            const conditions = Array.isArray(data[key]) ? data[key] : [];
            // Important: stringifier le tableau pour l'envoi
            formData.append(key, JSON.stringify(conditions));
            console.log('conditions_livraison ajoutées au FormData:', conditions);
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      // Ajouter le numéro de téléphone complet
      formData.append('contacts', fullPhoneNumber);
      
      // Ajouter les fichiers uniquement s'ils sont sélectionnés
      // Ne pas ajouter les champs du tout si aucun fichier n'est sélectionné
      if (selectedImage && selectedImage instanceof File) {
        formData.append('image', selectedImage);
      }
      
      if (selectedVideo && selectedVideo instanceof File) {
        formData.append('video', selectedVideo);
      }
      
      // En mode édition, conserver le statut existant si disponible
      if (isEditMode && initialData) {
        formData.append('id', initialData.id);
        // Le statut sera géré côté serveur en mode édition
      } else {
        // Ajouter le statut initial (en attente de validation) pour les nouvelles publications
        formData.append('statut', 'en_attente');
        formData.append('etat', 'disponible');
      }
      
      try {
        // Appeler la fonction onSubmit passée en prop et capturer le résultat
        const submitResult = await onSubmit(formData);
        
        // Vérifier si la soumission a échoué (si la fonction onSubmit retourne false)
        if (submitResult === false) {
          throw new Error("La soumission a échoué");
        }
        
        // Notification de succès si tout s'est bien passé
        Notification.success(isEditMode ? 'Publication modifiée avec succès' : 'Publication soumise avec succès');
      } finally {
        // Réinitialiser l'état de soumission dans tous les cas (succès ou échec)
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      
      // Message d'erreur détaillé
      let errorMessage = 'Une erreur est survenue lors de la soumission du formulaire';
      
      // Extraire le message d'erreur de la réponse API si disponible
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Extraire la première erreur de validation
          const firstError = Object.values(error.response.data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Afficher la notification d'erreur avec le message approprié
      Notification.error(errorMessage);
      
      // Réinitialiser l'état de soumission pour permettre une nouvelle tentative
      setIsSubmitting(false);
    }
  };

  const getFields = () => {
    if (!type) return [];
    
    return formFields[type].filter(field => {
      if (field.show) {
        const values = {};
        if (type === 'advertisement') {
          values.categorie = watchCategorie;
          values.besoin_livreurs = watchBesoinLivreurs;
        }
        return field.show(values);
      }
      return true;
    });
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {!isPackActive && <PublicationPackAlert isActive={isPackActive} packInfo={packInfo} />}
      {isEditMode && (
        <div className="mb-4 bg-blue-50 text-blue-800 p-3 rounded-md border border-blue-200">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            <span>Vous êtes en train de modifier une publication en attente d'approbation.</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Votre publication sera soumise à validation par l'équipe d'administration avant d'être visible publiquement.
                </p>
              </div>
            </div>
          </div>

          {getFields().map((field) => (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'select' && (
                <select
                  id={field.name}
                  {...register(field.name, { required: field.required && `${field.label} est requis` })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  {field.options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              )}
              
              {field.type === 'textarea' && (
                <textarea
                  id={field.name}
                  {...register(field.name, { required: field.required && `${field.label} est requis` })}
                  rows={4}
                  placeholder={field.placeholder || ''}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              )}
              
              {field.type === 'phone' && (
                <>
                  <div className="flex space-x-2">
                    <div className="w-2/5">
                      <CountryCodeSelector 
                        onChange={setPhoneCode} 
                        value={phoneCode} 
                      />
                    </div>
                    <div className="w-3/5">
                      <input
                        type="tel"
                        id={field.name}
                        {...register(field.name, { 
                          required: field.required && `${field.label} est requis`,
                          pattern: {
                            value: /^[1-9][0-9\s]*$/,
                            message: "Veuillez saisir uniquement des chiffres sans 0 au début"
                          }
                        })}
                        placeholder={field.placeholder || ''}
                        className={`block w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                      />
                    </div>
                  </div>
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.name].message}</p>
                  )}
                </>
              )}
              
              {field.type === 'file' && field.name === 'image' && (
                <div>
                  <input
                    id={field.name}
                    type="file"
                    accept={field.accept}
                    onChange={handleImageChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                  {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
                </div>
              )}
              
              {field.type === 'file' && field.name === 'video' && (
                <div>
                  <input
                    id={field.name}
                    type="file"
                    accept={field.accept}
                    onChange={handleVideoChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                  {videoError && <p className="mt-1 text-sm text-red-600">{videoError}</p>}
                </div>
              )}
              
              {field.type === 'custom' && field.name === 'conditions_livraison' && (
                <div className="mt-1">
                  {/* Liste des champs de conditions existants */}
                  {conditionsLivraison.map((condition, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        value={condition}
                        onChange={(e) => {
                          const newConditions = [...conditionsLivraison];
                          newConditions[index] = e.target.value;
                          setConditionsLivraison(newConditions);
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => {
                          const newConditions = [...conditionsLivraison];
                          newConditions.splice(index, 1);
                          setConditionsLivraison(newConditions);
                        }}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Bouton pour ajouter un nouveau champ */}
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                      setConditionsLivraison([...conditionsLivraison, '']);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter une condition de livraison
                  </button>
                  
                  {/* Champ caché pour stocker la valeur dans le formulaire */}
                  <input
                    type="hidden"
                    id={field.name}
                    {...register(field.name)}
                    style={{ display: 'none' }}
                  />
                  {/* Mettre à jour la valeur du champ caché lorsque les conditions changent */}
                </div>
              )}
              
              {!['select', 'textarea', 'file', 'custom', 'phone'].includes(field.type) && field.name !== 'conditions_livraison' && (
                <input
                  id={field.name}
                  type={field.type}
                  {...register(field.name, { required: field.required && `${field.label} est requis` })}
                  placeholder={field.placeholder || ''}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              )}
              
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm py-2 px-4 bg-gray-500 hover:bg-gray-600 rounded-md"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || imageError || videoError}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              (isSubmitting || imageError || videoError) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center">
                {isEditMode ? "Modifier" : "Soumettre"}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
