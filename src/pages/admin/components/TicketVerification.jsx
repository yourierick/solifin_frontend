import React, { useState } from "react";
import axios from "axios";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  QrCodeIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  GiftIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Notification from "../../../components/Notification";

/**
 * Composant pour la vérification des tickets gagnants
 * Permet de vérifier la validité d'un ticket et de le marquer comme consommé
 */
const TicketVerification = () => {
  const { isDarkMode } = useTheme();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Couleurs pour le thème
  const themeColors = {
    bg: isDarkMode ? "bg-[#1f2937]" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    hover: isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
    card: isDarkMode ? "bg-gray-800" : "bg-gray-50",
    input: isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900",
    button: "bg-primary-600 hover:bg-primary-700 text-white",
    buttonSecondary: isDarkMode
      ? "bg-gray-700 hover:bg-gray-600 text-white"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  // Rechercher un ticket par son code de vérification
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Veuillez saisir le code de vérification du ticket");
      return;
    }

    setLoading(true);
    setError(null);
    setTicket(null);
    setVerificationSuccess(false);
    setVerificationError(null);

    try {
      // Appel à l'API pour rechercher le ticket par son code de vérification
      const response = await axios.get(`/api/admin/tickets/${code}`);
      if (response.data.success) {
        setTicket(response.data.data);
      } else {
        setError(response.data.message || "Ticket non trouvé");
      }
    } catch (err) {
      console.error("Erreur lors de la recherche du ticket:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la recherche du ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  // Consommer directement le ticket sans demander à nouveau le code de vérification
  const handleConsumeTicket = async () => {
    if (!ticket || !ticket.id) {
      return;
    }

    setLoading(true);
    setVerificationError(null);
    setVerificationSuccess(false);

    try {
      // Appel à l'API pour consommer directement le ticket
      const response = await axios.post(
        `/api/admin/tickets/${ticket.id}/consommer`
      );

      if (response.data.success) {
        setVerificationSuccess(true);
        setTicket({
          ...ticket,
          consomme: true,
          date_consommation: new Date().toISOString(),
        });
        Notification.success(
          "Ticket validé avec succès ! Le cadeau peut être remis."
        );
      } else {
        setVerificationError(
          response.data.message || "Erreur lors de la consommation du ticket"
        );
      }
    } catch (err) {
      console.error("Erreur lors de la consommation du ticket:", err);
      setVerificationError(
        err.response?.data?.message ||
          "Erreur lors de la consommation du ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", {
      locale: fr,
    });
  };

  // Vérifier si un ticket est expiré
  const isExpired = (ticket) => {
    if (!ticket || !ticket.date_expiration) return false;
    return new Date(ticket.date_expiration) < new Date();
  };

  return (
    <div
      className={`${themeColors.bg} ${themeColors.text} p-6 rounded-lg shadow-md`}
    >
      <h2 className="text-2xl font-semibold flex items-center mb-6">
        <TicketIcon className="h-6 w-6 mr-2 text-primary-600" />
        Vérification des tickets gagnants
      </h2>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez le code de vérification du ticket"
              className={`w-full px-4 py-2 border ${themeColors.border} rounded-md ${themeColors.input}`}
            />
          </div>
          <button
            type="submit"
            className={`${themeColors.button} px-4 py-2 rounded-md flex items-center`}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <QrCodeIcon className="h-5 w-5 mr-2" />
            )}
            Vérifier
          </button>
        </form>
        {error && (
          <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
      </div>

      {ticket && (
        <div className={`${themeColors.card} p-6 rounded-lg mb-6`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Détails du ticket</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                ticket.consomme
                  ? "bg-green-100 text-green-800"
                  : isExpired(ticket)
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {ticket.consomme
                ? "Consommé"
                : isExpired(ticket)
                ? "Expiré"
                : "Valide"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Cadeau
              </h4>
              <div className="flex items-center">
                <GiftIcon className="h-5 w-5 mr-2 text-primary-600" />
                <span className="font-medium">
                  {ticket.cadeau?.nom || "N/A"}
                </span>
              </div>
              {ticket.cadeau?.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {ticket.cadeau.description}
                </p>
              )}
              {ticket.cadeau?.image_url && (
                <div className="mt-2">
                  <img
                    src={ticket.cadeau.image_url}
                    alt={ticket.cadeau.nom}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="mb-3">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Utilisateur
                </h4>
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
                  <span className="font-medium">
                    {ticket.user?.name || "N/A"}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Date d'expiration
                </h4>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                  <span className="font-medium">
                    {formatDate(ticket.date_expiration)}
                  </span>
                </div>
              </div>

              {ticket.consomme && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Date de consommation
                  </h4>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                    <span className="font-medium">
                      {formatDate(ticket.date_consommation)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!ticket.consomme && !isExpired(ticket) && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-lg font-medium mb-3">Valider le ticket</h4>
              <div className="flex justify-center">
                <button
                  onClick={handleConsumeTicket}
                  className={`${themeColors.button} px-6 py-3 rounded-md flex items-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  )}
                  Marquer comme consommé et remettre le cadeau
                </button>
              </div>
              {verificationError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                  {verificationError}
                </div>
              )}
              {verificationSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Ticket validé avec succès ! Le cadeau peut être remis.
                </div>
              )}
            </div>
          )}

          {ticket.consomme && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Ce ticket a déjà été consommé le{" "}
              {formatDate(ticket.date_consommation)}.
            </div>
          )}

          {!ticket.consomme && isExpired(ticket) && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              Ce ticket est expiré depuis le{" "}
              {formatDate(ticket.date_expiration)}.
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-md">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium">Comment ça marche ?</h4>
            <ol className="mt-2 ml-5 list-decimal">
              <li className="mb-1">
                Demandez à l'utilisateur son code de vérification personnel
                (reçu par notification).
              </li>
              <li className="mb-1">
                Entrez le code de vérification dans le champ ci-dessus et
                cliquez sur "Vérifier".
              </li>
              <li className="mb-1">
                Vérifiez les détails du ticket (cadeau, utilisateur, date
                d'expiration).
              </li>
              <li className="mb-1">
                Si le ticket est valide, cliquez sur le bouton "Marquer comme
                consommé et remettre le cadeau".
              </li>
              <li>
                Une fois le ticket validé, remettez le cadeau à l'utilisateur.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketVerification;
