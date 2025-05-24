import React, { useState, useEffect, useRef } from "react";
import { Tab } from "@headlessui/react";
import { useTheme } from "../../contexts/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  PhotoIcon,
  VideoCameraIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Social() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // État pour l'utilisateur courant
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // États pour les statuts
  const [myStatuses, setMyStatuses] = useState([]);
  const [followedStatuses, setFollowedStatuses] = useState([]);
  const [isLoadingMyStatuses, setIsLoadingMyStatuses] = useState(true);
  const [isLoadingFollowedStatuses, setIsLoadingFollowedStatuses] =
    useState(true);

  // États pour la visualisation des statuts
  const [isViewingStatus, setIsViewingStatus] = useState(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  // États pour le signalement
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportReasons, setReportReasons] = useState([]);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [isStatusReported, setIsStatusReported] = useState(false);
  const [currentStatusGroup, setCurrentStatusGroup] = useState(null); // 'my' ou 'followed'
  const [currentPageStatuses, setCurrentPageStatuses] = useState([]);
  const [currentPageInfo, setCurrentPageInfo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const statusDuration = 5000; // 5 secondes par statut

  // États pour la création de statut
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState(""); // 'image', 'video', ou 'text'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [fileError, setFileError] = useState("");

  // États pour le modal de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [socialEventToDelete, setSocialEventToDelete] = useState(null);

  // États pour les likes
  const [likedStatuses, setLikedStatuses] = useState([]);
  const [isLiking, setIsLiking] = useState(false);

  // Récupérer les statuts sociaux
  useEffect(() => {
    fetchMyStatuses(); // Cette fonction récupère déjà l'utilisateur courant
    fetchFollowedStatuses();
    fetchReportReasons();
    fetchLikedStatuses();
  }, []);

  // Récupérer les statuts aimés par l'utilisateur
  const fetchLikedStatuses = async () => {
    try {
      const response = await axios.get("/api/social-events/liked");
      setLikedStatuses(response.data.map(status => status.id));
    } catch (error) {
      console.error("Erreur lors de la récupération des statuts aimés:", error);
    }
  };

  // Aimer ou ne plus aimer un statut
  const toggleLike = async (statusId) => {
    try {
      setIsLiking(true);
      const isLiked = likedStatuses.includes(statusId);
      
      if (isLiked) {
        // Ne plus aimer
        await axios.delete(`/api/social-events/${statusId}/like`);
        setLikedStatuses(prev => prev.filter(id => id !== statusId));
        toast.success("Vous n'aimez plus ce statut");
      } else {
        // Aimer
        await axios.post(`/api/social-events/${statusId}/like`);
        setLikedStatuses(prev => [...prev, statusId]);
        toast.success("Vous aimez ce statut");
      }
    } catch (error) {
      console.error("Erreur lors de l'action j'aime/je n'aime plus:", error);
      toast.error("Impossible de modifier votre appréciation");
    } finally {
      setIsLiking(false);
    }
  };

  // Récupérer mes statuts sociaux et les informations de l'utilisateur courant
  const fetchMyStatuses = async () => {
    try {
      setIsLoadingMyStatuses(true);
      const response = await axios.get("/api/social-events/my-page");

      // Mettre à jour les statuts et l'utilisateur courant
      setMyStatuses(response.data.statuses);
      setCurrentUser(response.data.user);
      setIsLoadingUser(false); // Marquer le chargement de l'utilisateur comme terminé
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de mes statuts sociaux:",
        error
      );
      toast.error("Impossible de charger vos statuts sociaux");
    } finally {
      setIsLoadingMyStatuses(false);
    }
  };

  // Récupérer les statuts des pages suivies
  const fetchFollowedStatuses = async () => {
    try {
      setIsLoadingFollowedStatuses(true);
      const response = await axios.get("/api/social-events/followed-pages");
      setFollowedStatuses(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statuts des pages suivies:",
        error
      );
      toast.error("Impossible de charger les statuts des pages suivies");
    } finally {
      setIsLoadingFollowedStatuses(false);
    }
  };

  // Gérer la sélection d'image
  const handleImageSelect = (e) => {
    setFileError("");
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier que c'est bien une image
    if (!file.type.startsWith("image/")) {
      setFileError("Veuillez sélectionner un fichier image valide");
      return;
    }

    setSelectedFile(file);
    setMediaType("image");

    // Créer une URL pour la prévisualisation
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  // Gérer la sélection de vidéo
  const handleVideoSelect = (e) => {
    setFileError("");
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier que c'est bien une vidéo
    if (!file.type.startsWith("video/")) {
      setFileError("Veuillez sélectionner un fichier vidéo valide");
      return;
    }

    // Vérifier la taille de la vidéo (5 Mo maximum)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      setFileError("La taille de la vidéo ne doit pas dépasser 5 Mo");
      return;
    }

    setSelectedFile(file);
    setMediaType("video");

    // Créer une URL pour la prévisualisation
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile && !description) {
      toast.error("Veuillez ajouter une image, une vidéo ou un texte");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      if (selectedFile) {
        if (mediaType === "image") {
          formData.append("image", selectedFile);
        } else if (mediaType === "video") {
          formData.append("video", selectedFile);
        }
      }

      if (description) {
        formData.append("description", description);
      }

      await axios.post("/api/social-events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        "Statut social créé avec succès et en attente de validation"
      );
      resetForm();
      fetchMyStatuses();
      setIsCreating(false);
    } catch (error) {
      console.error("Erreur lors de la création du statut social:", error);
      toast.error("Impossible de créer le statut social");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setDescription("");
    setMediaType("");
    setFileError("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Ouvrir le modal de confirmation pour la suppression
  const confirmDelete = (id) => {
    setSocialEventToDelete(id);
    setIsConfirmModalOpen(true);
  };

  // Supprimer un statut social
  const handleDelete = async () => {
    if (!socialEventToDelete) return;

    try {
      await axios.delete(`/api/social-events/${socialEventToDelete}`);
      toast.success("Statut social supprimé avec succès");
      fetchMyStatuses();
      setSocialEventToDelete(null);

      // Si on est en train de visualiser un statut et qu'il est supprimé
      if (isViewingStatus && currentStatusGroup === "my") {
        // Fermer la vue de statut si c'était le dernier statut
        if (currentPageStatuses.length <= 1) {
          setIsViewingStatus(false);
        } else {
          // Sinon, mettre à jour la liste des statuts actuels
          setCurrentPageStatuses((prev) =>
            prev.filter((status) => status.id !== socialEventToDelete)
          );
          // Ajuster l'index si nécessaire
          if (currentStatusIndex >= currentPageStatuses.length - 1) {
            setCurrentStatusIndex(Math.max(0, currentPageStatuses.length - 2));
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du statut social:", error);
      toast.error("Impossible de supprimer le statut social");
    }
  };

  // Obtenir le statut formaté
  const getStatusBadge = (status) => {
    switch (status) {
      case "en_attente":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case "approuvé":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckIcon className="w-3 h-3 mr-1" />
            Approuvé
          </span>
        );
      case "rejeté":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      case "expiré":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Expiré
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            Inconnu
          </span>
        );
    }
  };

  // Ouvrir la vue d'un statut
  const openStatusView = (statusGroup, pageId, pageInfo = null) => {
    let statuses = [];

    if (statusGroup === "my") {
      statuses = myStatuses;
      setCurrentPageInfo({
        name: "Mon statut",
        picture: null,
      });
    } else {
      // Filtrer les statuts de la page spécifique
      statuses = followedStatuses.filter((status) => status.page_id === pageId);
      setCurrentPageInfo(pageInfo);
    }

    if (statuses.length === 0) return;

    setCurrentStatusGroup(statusGroup);
    setCurrentPageStatuses(statuses);
    setCurrentStatusIndex(0);
    setIsViewingStatus(true);
    setIsPaused(false);
    setProgressBarWidth(0);
  };

  // Naviguer au statut suivant
  const goToNextStatus = () => {
    if (currentStatusIndex < currentPageStatuses.length - 1) {
      setCurrentStatusIndex(currentStatusIndex + 1);
      setProgressBarWidth(0);
    } else {
      // Fermer la vue si c'est le dernier statut
      setIsViewingStatus(false);
    }
  };

  // Naviguer au statut précédent
  const goToPreviousStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
      setProgressBarWidth(0);
    }
  };

  // Mettre en pause ou reprendre le défilement
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Fonction pour réinitialiser les états de visualisation des statuts
  const resetStatusView = () => {
    setCurrentStatusIndex(0);
    setCurrentPageStatuses([]);
    setCurrentStatusGroup("");
    setCurrentPageInfo(null);
    setIsViewingStatus(false);
    setIsPaused(false);
    setProgressBarWidth(0);
    clearInterval(statusInterval.current);
    setIsStatusReported(false);
  };

  // Fonction pour fermer la vue des statuts
  const closeStatusView = () => {
    resetStatusView();
  };

  // Fonction pour récupérer les raisons de signalement disponibles
  const fetchReportReasons = async () => {
    try {
      const response = await axios.get("/api/social-events/report-reasons");
      setReportReasons(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des raisons de signalement:",
        error
      );
    }
  };

  // Fonction pour vérifier si un statut a déjà été signalé
  const checkIfReported = async (statusId) => {
    try {
      const response = await axios.get(
        `/api/social-events/${statusId}/check-reported`
      );
      setIsStatusReported(response.data.reported);
    } catch (error) {
      console.error("Erreur lors de la vérification du signalement:", error);
    }
  };

  // Fonction pour ouvrir le modal de signalement
  const openReportModal = () => {
    setIsReportModalOpen(true);
    setReportReason("");
    setReportDescription("");
    setIsPaused(true); // Mettre en pause le défilement automatique
  };

  // Fonction pour fermer le modal de signalement
  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportReason("");
    setReportDescription("");
  };

  // Fonction pour soumettre un signalement
  const submitReport = async () => {
    if (!reportReason) {
      toast.error("Veuillez sélectionner une raison de signalement");
      return;
    }

    try {
      setIsReportSubmitting(true);
      const currentStatus = currentPageStatuses[currentStatusIndex];

      await axios.post(`/api/social-events/${currentStatus.id}/report`, {
        reason: reportReason,
        description: reportDescription,
      });

      setIsStatusReported(true);
      closeReportModal();
      toast.success("Statut signalé avec succès");
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Une erreur est survenue lors du signalement");
      }
    } finally {
      setIsReportSubmitting(false);
    }
  };

  // Rendu du formulaire de création
  const renderCreationForm = () => (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-lg font-medium ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Créer un nouveau statut
        </h2>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Prévisualisation du média */}
        {previewUrl && (
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                setMediaType("");
                setFileError("");
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
                if (videoInputRef.current) {
                  videoInputRef.current.value = "";
                }
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {mediaType === "image" ? (
              <img
                src={previewUrl}
                alt="Prévisualisation"
                className="w-full h-64 object-contain rounded-lg"
              />
            ) : mediaType === "video" ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-64 object-contain rounded-lg"
              />
            ) : null}
          </div>
        )}

        {/* Champ de texte */}
        <div className="mb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Que voulez-vous partager ?"
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            rows={4}
          />
        </div>

        {/* Message d'erreur pour les fichiers */}
        {fileError && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            {fileError}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              accept="video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current.click()}
              className={`inline-flex items-center p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title="Ajouter une image"
            >
              <PhotoIcon className="h-5 w-5 text-primary-600" />
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current.click()}
              className={`inline-flex items-center p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title="Ajouter une vidéo (max 5 Mo)"
            >
              <VideoCameraIcon className="h-5 w-5 text-primary-600" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (!selectedFile && !description)}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              isSubmitting || (!selectedFile && !description)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Publier
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Rendu de la liste des statuts
  const renderStatusList = () => {
    const isLoading = isLoadingMyStatuses || isLoadingFollowedStatuses;

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Section "Mon statut" */}
        <div className="space-y-2">
          <h3
            className={`text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Mon statut
          </h3>

          {myStatuses.length === 0 ? (
            <div
              onClick={() => setIsCreating(true)}
              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              } shadow-sm`}
            >
              <div className="relative mr-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-800 dark:border-gray-900">
                  {currentUser?.picture_url ? (
                    <img
                      src={currentUser.picture_url}
                      alt="Mon profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlusIcon className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1 shadow-sm">
                  <PlusIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Ajouter un statut
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Appuyez pour ajouter un statut
                </p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => openStatusView("my", null)}
              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              } shadow-sm`}
            >
              <div className="relative mr-3">
                {/* Cercle de segments pour indiquer le nombre de statuts */}
                <div className="w-14 h-14 relative">
                  {/* Créer des segments circulaires pour représenter chaque statut */}
                  <div className="absolute inset-0">
                    {/* Cercle complet en arrière-plan pour assurer la continuité */}
                    <div className="absolute inset-0 rounded-full border-[2px] border-gray-300 dark:border-gray-700"></div>

                    {/* Si un seul statut, afficher un cercle complet */}
                    {myStatuses.length === 1 ? (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 rounded-full border-[2px] border-green-600"></div>
                      </div>
                    ) : (
                      /* Sinon, afficher des segments */
                      <>
                        {/* Dessiner chaque segment individuellement */}
                        {Array.from({
                          length: Math.min(myStatuses.length, 8),
                        }).map((_, index) => {
                          const totalSegments = Math.min(myStatuses.length, 8);
                          const segmentAngle = 360 / totalSegments;
                          const startAngle = index * segmentAngle;
                          const endAngle = startAngle + segmentAngle - 4; // Ajouter un petit espace entre les segments

                          return (
                            <div key={index} className="absolute inset-0">
                              <svg
                                className="w-full h-full"
                                viewBox="0 0 100 100"
                              >
                                {/* Dessiner l'arc de cercle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="48"
                                  fill="none"
                                  stroke="#16a34a" /* green-600 */
                                  strokeWidth="2"
                                  strokeDasharray={`${
                                    (segmentAngle * 0.95 * Math.PI) / 2
                                  } ${2 * Math.PI}`}
                                  strokeDashoffset={`${
                                    ((-startAngle * Math.PI) / 180) * 50 + 25
                                  }`}
                                  transform="rotate(-90, 50, 50)"
                                />
                              </svg>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Photo de profil au centre */}
                  <div className="absolute inset-1 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-800 dark:border-gray-900">
                    {currentUser?.picture_url ? (
                      <img
                        src={currentUser.picture_url}
                        alt="Mon statut"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Aa
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1 shadow-sm">
                  <PlusIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Mon statut
                </p>
                <div className="flex items-center">
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDistanceToNow(new Date(myStatuses[0].created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                  <span className="mx-1">•</span>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {myStatuses.length}{" "}
                    {myStatuses.length > 1 ? "mises à jour" : "mise à jour"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section "Mises à jour récentes" */}
        {followedStatuses.length > 0 && (
          <div className="space-y-2">
            <h3
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Mises à jour récentes
            </h3>

            {/* Regrouper les statuts par page */}
            {groupStatusesByPage().map((pageGroup) => (
              <div
                key={pageGroup.pageId}
                onClick={() =>
                  openStatusView("followed", pageGroup.pageId, {
                    name: pageGroup.latestStatus.user.name,
                    picture: pageGroup.latestStatus.user.picture_url,
                  })
                }
                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                } shadow-sm`}
              >
                <div className="relative mr-3">
                  {/* Cercle de segments pour indiquer le nombre de statuts */}
                  <div className="w-14 h-14 relative">
                    {/* Créer des segments circulaires pour représenter chaque statut */}
                    <div className="absolute inset-0">
                      {/* Cercle complet en arrière-plan pour assurer la continuité */}
                      <div className="absolute inset-0 rounded-full border-[2px] border-gray-300 dark:border-gray-700"></div>

                      {/* Si un seul statut, afficher un cercle complet */}
                      {pageGroup.statuses.length === 1 ? (
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 rounded-full border-[2px] border-green-600"></div>
                        </div>
                      ) : (
                        /* Sinon, afficher des segments */
                        <>
                          {/* Dessiner chaque segment individuellement */}
                          {Array.from({
                            length: Math.min(pageGroup.statuses.length, 8),
                          }).map((_, index) => {
                            const totalSegments = Math.min(
                              pageGroup.statuses.length,
                              8
                            );
                            const segmentAngle = 360 / totalSegments;
                            const startAngle = index * segmentAngle;
                            const endAngle = startAngle + segmentAngle - 4; // Ajouter un petit espace entre les segments

                            return (
                              <div key={index} className="absolute inset-0">
                                <svg
                                  className="w-full h-full"
                                  viewBox="0 0 100 100"
                                >
                                  {/* Dessiner l'arc de cercle */}
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="48"
                                    fill="none"
                                    stroke="#16a34a" /* green-600 */
                                    strokeWidth="2"
                                    strokeDasharray={`${
                                      (segmentAngle * 0.95 * Math.PI) / 2
                                    } ${2 * Math.PI}`}
                                    strokeDashoffset={`${
                                      ((-startAngle * Math.PI) / 180) * 50 + 25
                                    }`}
                                    transform="rotate(-90, 50, 50)"
                                  />
                                </svg>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>

                    {/* Photo de profil au centre */}
                    <div className="absolute inset-1 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-800 dark:border-gray-900">
                      {pageGroup.latestStatus.user?.picture ? (
                        <img
                          src={pageGroup.latestStatus.user.picture_url}
                          alt={pageGroup.latestStatus.user?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {pageGroup.latestStatus.user?.name?.charAt(0) ||
                              "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {pageGroup.latestStatus.user?.name}
                  </p>
                  <div className="flex items-center">
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatDistanceToNow(
                        new Date(pageGroup.latestStatus.created_at),
                        {
                          addSuffix: true,
                          locale: fr,
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour regrouper les statuts par page
  const groupStatusesByPage = () => {
    const pageGroups = {};

    followedStatuses.forEach((status) => {
      if (!pageGroups[status.page_id]) {
        pageGroups[status.page_id] = {
          pageId: status.page_id,
          pageName: status.user?.name || "Utilisateur",
          pagePicture: status.user?.picture_url || null,
          statuses: [],
          latestStatus: null,
        };
      }

      pageGroups[status.page_id].statuses.push(status);

      // Mettre à jour le statut le plus récent
      if (
        !pageGroups[status.page_id].latestStatus ||
        new Date(status.created_at) >
          new Date(pageGroups[status.page_id].latestStatus.created_at)
      ) {
        pageGroups[status.page_id].latestStatus = status;
      }
    });

    // Convertir l'objet en tableau et trier par date du statut le plus récent
    return Object.values(pageGroups).sort((a, b) => {
      return (
        new Date(b.latestStatus.created_at) -
        new Date(a.latestStatus.created_at)
      );
    });
  };

  // Gérer le défilement automatique des statuts
  useEffect(() => {
    let timer;
    let progressTimer;

    if (isViewingStatus && !isPaused) {
      // Timer pour la barre de progression
      progressTimer = setInterval(() => {
        setProgressBarWidth((prev) => {
          const newWidth = prev + (100 / statusDuration) * 100;
          return newWidth > 100 ? 100 : newWidth;
        });
      }, 100);

      // Timer pour passer au statut suivant
      timer = setTimeout(() => {
        if (currentStatusIndex < currentPageStatuses.length - 1) {
          setCurrentStatusIndex(currentStatusIndex + 1);
          setProgressBarWidth(0);
        } else {
          // Fermer la vue si c'est le dernier statut
          setIsViewingStatus(false);
        }
      }, statusDuration);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [
    isViewingStatus,
    currentStatusIndex,
    isPaused,
    currentPageStatuses.length,
  ]);

  // Rendu de la vue d'un statut (style WhatsApp)
  const renderStatusView = () => {
    if (!isViewingStatus || currentPageStatuses.length === 0) return null;

    const currentStatus = currentPageStatuses[currentStatusIndex];
    if (!currentStatus) return null;

    return (
      <div
        className={`relative bg-black z-40 flex flex-col rounded-lg overflow-hidden shadow-xl ${
          isDarkMode ? "border border-gray-700" : "border border-gray-300"
        }`}
        style={{ height: "70vh" }}
        onClick={togglePause} // Mettre en pause/reprendre en cliquant sur le statut
      >
        {/* Barre de progression */}
        <div className="absolute top-0 left-0 right-0 flex px-2 pt-2 space-x-1">
          {currentPageStatuses.map((_, index) => (
            <div
              key={index}
              className="h-1 rounded-full flex-1 bg-gray-600 overflow-hidden"
            >
              {index === currentStatusIndex && (
                <div
                  className="h-full bg-white"
                  style={{ width: `${progressBarWidth}%` }}
                />
              )}
              {index < currentStatusIndex && (
                <div className="h-full bg-white w-full" />
              )}
            </div>
          ))}
        </div>

        {/* En-tête */}
        <div className="flex items-center justify-between px-4 pt-6 pb-2 z-10">
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeStatusView();
              }}
              className="text-white mr-2 hover:bg-gray-700 p-1 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden mr-2">
                {currentPageInfo?.picture ? (
                  <img
                    src={currentPageInfo.picture}
                    alt={currentPageInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-medium">
                    {currentPageInfo?.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {currentPageInfo?.name || "Mon statut"}
                </p>
                <p className="text-gray-300 text-xs">
                  {formatDistanceToNow(new Date(currentStatus.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex items-center space-x-3">
            {/* Bouton pause/lecture */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="text-white hover:bg-gray-700 p-1 rounded-full transition-colors"
            >
              {isPaused ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Bouton J'aime */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentStatus.id);
              }}
              className="text-white hover:bg-gray-700 p-1 rounded-full transition-colors"
              disabled={isLiking}
            >
              {likedStatuses.includes(currentStatus.id) ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>

            {/* Bouton de suppression (uniquement pour mes statuts) */}
            {currentStatusGroup === "my" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeStatusView();
                  confirmDelete(currentStatus.id);
                }}
                className="text-white hover:bg-gray-700 p-1 rounded-full transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}

            {/* Bouton de signalement (uniquement pour les statuts des autres) */}
            {currentStatusGroup !== "my" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openReportModal();
                }}
                className={`text-white hover:bg-gray-700 p-1 rounded-full transition-colors ${
                  isStatusReported ? "text-red-500" : ""
                }`}
                disabled={isStatusReported}
                title={
                  isStatusReported
                    ? "Vous avez déjà signalé ce statut"
                    : "Signaler ce statut"
                }
              >
                <ExclamationCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Contenu du statut */}
        <div
          className="flex-1 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation(); // Éviter de déclencher le toggle pause
            goToNextStatus();
          }}
        >
          {currentStatus.image_url ? (
            <img
              src={currentStatus.image_url}
              alt="Statut"
              className="max-h-full max-w-full object-contain"
            />
          ) : currentStatus.video_url ? (
            <video
              src={currentStatus.video_url}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="bg-primary-600 p-6 rounded-lg max-w-md">
              <p className="text-white text-xl">{currentStatus.description}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start pl-4"
          onClick={(e) => {
            e.stopPropagation();
            goToPreviousStatus();
          }}
        >
          {currentStatusIndex > 0 && (
            <button className="bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
        </div>
        <div
          className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end pr-4"
          onClick={(e) => {
            e.stopPropagation();
            goToNextStatus();
          }}
        >
          {currentStatusIndex < currentPageStatuses.length - 1 && (
            <button className="bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all">
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Description (si présente et avec image/vidéo) */}
        {currentStatus.description &&
          (currentStatus.image || currentStatus.video) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <p className="text-white">{currentStatus.description}</p>
            </div>
          )}
      </div>
    );
  };

  return (
    <>
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Statuts
        </h1>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer un statut
          </button>
        )}
      </div>

      {isCreating
        ? renderCreationForm()
        : isViewingStatus
        ? renderStatusView()
        : renderStatusList()}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirmation de suppression"
        message="Êtes-vous sûr de vouloir supprimer ce statut social ?"
        confirmButtonText="Supprimer"
        cancelButtonText="Annuler"
        isDarkMode={isDarkMode}
        type="danger"
      />

      {/* Modal de signalement */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div
                className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className={`text-lg leading-6 font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Signaler ce statut
                    </h3>
                    <div className="mt-2">
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Veuillez indiquer la raison pour laquelle vous souhaitez
                        signaler ce statut.
                      </p>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="report-reason"
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Raison du signalement *
                      </label>
                      <select
                        id="report-reason"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                          isDarkMode
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                        required
                      >
                        <option value="">Sélectionnez une raison</option>
                        {Object.entries(reportReasons).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="report-description"
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Détails (facultatif)
                      </label>
                      <textarea
                        id="report-description"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        rows="3"
                        className={`mt-1 block w-full sm:text-sm border-gray-300 rounded-md ${
                          isDarkMode
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                        placeholder="Fournissez plus de détails sur votre signalement..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${
                  isDarkMode
                    ? "bg-gray-800 border-t border-gray-700"
                    : "bg-gray-50 border-t border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={isReportSubmitting || !reportReason}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    isReportSubmitting || !reportReason
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isReportSubmitting ? "Envoi en cours..." : "Signaler"}
                </button>
                <button
                  type="button"
                  onClick={closeReportModal}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  } shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDarkMode ? "dark" : "light"}
    />
    </>
  );
}
