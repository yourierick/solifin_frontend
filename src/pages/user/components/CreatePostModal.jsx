import React, { useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  LinkIcon,
  PaperClipIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  postType = 'actualite',
  isDarkMode,
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Champs spécifiques pour les offres d'emploi
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [sector, setSector] = useState('');
  
  // Champs spécifiques pour les opportunités d'affaires
  const [investmentAmount, setInvestmentAmount] = useState('');
  
  const fileInputRef = useRef(null);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setTitle('');
    setContent('');
    setVideoUrl('');
    setExternalLink('');
    setImages([]);
    setPreviewImages([]);
    setCompanyName('');
    setLocation('');
    setSalaryRange('');
    setSector('');
    setInvestmentAmount('');
    setError('');
  };

  // Gérer la fermeture du modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Gérer le changement d'images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Vérifier la taille des fichiers (max 5MB par fichier)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Les fichiers suivants dépassent la taille maximale de 5MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      // Vérifier le nombre total d'images (max 10)
      if (images.length + files.length > 10) {
        setError('Vous ne pouvez pas télécharger plus de 10 images.');
        return;
      }
      
      // Créer des URLs pour la prévisualisation
      const newPreviewImages = files.map(file => URL.createObjectURL(file));
      
      setImages(prevImages => [...prevImages, ...files]);
      setPreviewImages(prevPreviewImages => [...prevPreviewImages, ...newPreviewImages]);
      setError('');
    }
  };

  // Supprimer une image
  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    
    // Libérer l'URL de prévisualisation
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prevPreviewImages => prevPreviewImages.filter((_, i) => i !== index));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!content.trim()) {
      setError('Le contenu de la publication est requis.');
      return;
    }
    
    if (postType === 'emploi' && !companyName.trim()) {
      setError('Le nom de l\'entreprise est requis pour une offre d\'emploi.');
      return;
    }
    
    if (postType === 'opportunite' && !investmentAmount.trim()) {
      setError('Le montant de l\'investissement est requis pour une opportunité d\'affaires.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Préparer les données selon le type de publication
      const postData = {
        content,
        title,
        videoUrl,
        externalLink,
        images,
      };
      
      if (postType === 'emploi') {
        postData.companyName = companyName;
        postData.location = location;
        postData.salaryRange = salaryRange;
        postData.sector = sector;
      } else if (postType === 'opportunite') {
        postData.investmentAmount = investmentAmount;
        postData.sector = sector;
      }
      
      await onSubmit(postData);
      handleClose();
    } catch (err) {
      console.error('Erreur lors de la création de la publication:', err);
      setError('Une erreur est survenue lors de la création de la publication. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center border-b pb-3 mb-4"
                >
                  <h3 className={`text-lg font-medium leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Créer une publication
                    {postType === 'emploi' && ' - Offre d\'emploi'}
                    {postType === 'opportunite' && ' - Opportunité d\'affaires'}
                  </h3>
                  <button
                    type="button"
                    className={`rounded-full p-1 ${
                      isDarkMode
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {error && (
                  <div className={`p-3 mb-4 rounded-md ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4 flex items-center">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt="Photo de profil"
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name || 'Utilisateur'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Publication {postType === 'emploi' ? 'd\'offre d\'emploi' : postType === 'opportunite' ? 'd\'opportunité d\'affaires' : 'd\'actualité'}
                      </p>
                    </div>
                  </div>

                  {/* Titre (optionnel) */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Titre (optionnel)"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                          : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    />
                  </div>

                  {/* Contenu principal */}
                  <div className="mb-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`Que souhaitez-vous partager, ${user?.name?.split(' ')[0] || 'utilisateur'} ?`}
                      rows="5"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                          : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    />
                  </div>

                  {/* Champs spécifiques pour les offres d'emploi */}
                  {postType === 'emploi' && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nom de l'entreprise *
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Nom de l'entreprise"
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                              : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Lieu
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Ville, Pays"
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                              : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Fourchette de salaire
                        </label>
                        <input
                          type="text"
                          value={salaryRange}
                          onChange={(e) => setSalaryRange(e.target.value)}
                          placeholder="ex: 40 000€ - 50 000€ par an"
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                              : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Secteur d'activité
                        </label>
                        <input
                          type="text"
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          placeholder="ex: Informatique, Finance, etc."
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                              : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Champs spécifiques pour les opportunités d'affaires */}
                  {postType === 'opportunite' && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Montant de l'investissement *
                        </label>
                        <input
                          type="text"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          placeholder="ex: 10 000€ - 50 000€"
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                              : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Secteur d'activité
                        </label>
                        <input
                          type="text"
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          placeholder="ex: Immobilier, E-commerce, etc."
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                              : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Prévisualisation des images */}
                  {previewImages.length > 0 && (
                    <div className="mb-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Images ({previewImages.length}/10)
                          </h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {previewImages.map((src, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={src}
                                alt={`Prévisualisation ${index + 1}`}
                                className="h-24 w-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* URL de vidéo */}
                  {videoUrl && (
                    <div className="mb-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Vidéo
                          </h4>
                          <button
                            type="button"
                            onClick={() => setVideoUrl('')}
                            className={`p-1 rounded-full ${
                              isDarkMode
                                ? 'hover:bg-gray-600 text-gray-400'
                                : 'hover:bg-gray-200 text-gray-500'
                            }`}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="aspect-w-16 aspect-h-9">
                          <iframe
                            src={videoUrl.replace('watch?v=', 'embed/')}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg w-full h-full"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lien externe */}
                  {externalLink && (
                    <div className="mb-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Lien externe
                          </h4>
                          <button
                            type="button"
                            onClick={() => setExternalLink('')}
                            className={`p-1 rounded-full ${
                              isDarkMode
                                ? 'hover:bg-gray-600 text-gray-400'
                                : 'hover:bg-gray-200 text-gray-500'
                            }`}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <a
                          href={externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}
                        >
                          {externalLink}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Options d'ajout de média */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className={`flex items-center px-3 py-2 rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      <span>Photos</span>
                    </button>
                    
                    {!videoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Entrez l\'URL de la vidéo YouTube:');
                          if (url && url.includes('youtube.com')) {
                            setVideoUrl(url);
                          } else if (url) {
                            alert('Veuillez entrer une URL YouTube valide.');
                          }
                        }}
                        className={`flex items-center px-3 py-2 rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <VideoCameraIcon className="h-5 w-5 mr-2" />
                        <span>Vidéo</span>
                      </button>
                    )}
                    
                    {!externalLink && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Entrez l\'URL du lien externe:');
                          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                            setExternalLink(url);
                          } else if (url) {
                            alert('Veuillez entrer une URL valide commençant par http:// ou https://.');
                          }
                        }}
                        className={`flex items-center px-3 py-2 rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <LinkIcon className="h-5 w-5 mr-2" />
                        <span>Lien</span>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={`mr-3 px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !content.trim()}
                      className={`px-4 py-2 rounded-lg text-white ${
                        isSubmitting || !content.trim()
                          ? 'bg-primary-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                      } flex items-center`}
                    >
                      {isSubmitting ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        'Publier'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
