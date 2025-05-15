import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";
import axios from "../utils/axios";
import { useToast } from "../contexts/ToastContext";
import Notification from "./Notification";
import { CURRENCIES, PAYMENT_TYPES, PAYMENT_METHODS } from "../config";

// Style CSS pour la barre de défilement personnalisée et les animations
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  
  .slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  .method-card {
    transition: all 0.3s ease;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 12px;
  }
  
  .method-card:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  .method-card.selected {
    border-color: #1976d2;
    background-color: rgba(25, 118, 210, 0.05);
  }
  
  .dark .method-card:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .dark .method-card.selected {
    border-color: #90caf9;
    background-color: rgba(144, 202, 249, 0.1);
  }
  
  .summary-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    backdrop-filter: blur(5px);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .dark .summary-card {
    background: linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.7) 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
  
  .dark .summary-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  /* Styles pour le menu déroulant en mode sombre */
  .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation {
    background-color: #fff;
  }
  
  .dark .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation {
    background-color: #1e283b !important;
    color: white;
  }
  
  .dark .MuiMenuItem-root:hover {
    background-color: rgba(255, 255, 255, 0.08) !important;
  }
`;

// Configuration des champs de formulaire pour chaque méthode de paiement
const paymentMethodFields = {
  [PAYMENT_TYPES.WALLET]: [],
  [PAYMENT_TYPES.CREDIT_CARD]: [
    {
      name: "cardNumber",
      label: "Numéro de carte",
      type: "text",
      required: true,
      maxLength: 19,
      format: (value) =>
        value
          .replace(/\s/g, "")
          .replace(/(\d{4})/g, "$1 ")
          .trim(),
    },
    {
      name: "cardHolder",
      label: "Nom sur la carte",
      type: "text",
      required: true,
    },
    {
      name: "expiryDate",
      label: "Date d'expiration",
      type: "text",
      required: true,
      maxLength: 5,
      format: (value) =>
        value.replace(/\D/g, "").replace(/(\d{2})(\d{0,2})/, "$1/$2"),
    },
    { name: "cvv", label: "CVV", type: "text", required: true, maxLength: 3 },
  ],
  [PAYMENT_TYPES.MOBILE_MONEY]: [
    {
      name: "phoneNumber",
      label: "Numéro de téléphone",
      type: "tel",
      required: true,
    },
  ],
  [PAYMENT_TYPES.BANK_TRANSFER]: [
    {
      name: "accountName",
      label: "Nom du compte",
      type: "text",
      required: true,
    },
    {
      name: "accountNumber",
      label: "Numéro de compte",
      type: "text",
      required: true,
    },
  ],
  [PAYMENT_TYPES.MONEY_TRANSFER]: [
    {
      name: "senderName",
      label: "Nom de l'expéditeur",
      type: "text",
      required: true,
    },
    {
      name: "referenceNumber",
      label: "Numéro de référence",
      type: "text",
      required: true,
    },
  ],
  [PAYMENT_TYPES.CASH]: [
    {
      name: "paymentLocation",
      label: "Lieu de paiement",
      type: "text",
      required: true,
    },
  ],
};

// Transformation des méthodes de paiement pour l'interface utilisateur
const paymentMethods = [
  {
    id: PAYMENT_TYPES.WALLET,
    name: "Mon Wallet",
    icon: "wallet",
    category: "direct",
    options: PAYMENT_METHODS[PAYMENT_TYPES.WALLET],
  },
  {
    id: PAYMENT_TYPES.CREDIT_CARD,
    name: "Carte de crédit",
    icon: "credit-card",
    category: "card",
    options: PAYMENT_METHODS[PAYMENT_TYPES.CREDIT_CARD],
    fields: paymentMethodFields[PAYMENT_TYPES.CREDIT_CARD],
  },
  {
    id: PAYMENT_TYPES.MOBILE_MONEY,
    name: "Mobile Money",
    icon: "phone",
    category: "mobile",
    options: PAYMENT_METHODS[PAYMENT_TYPES.MOBILE_MONEY],
    fields: paymentMethodFields[PAYMENT_TYPES.MOBILE_MONEY],
  },
];

export default function PurchasePackForm({ open, onClose, pack }) {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_TYPES.WALLET);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");
  const [formFields, setFormFields] = useState({});
  const [months, setMonths] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [transactionFees, setTransactionFees] = useState(0);
  const [feePercentage, setFeePercentage] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [formIsValid, setFormIsValid] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [feesError, setFeesError] = useState(false);

  // Initialiser le nombre de mois en fonction du type d'abonnement lorsque le pack change
  useEffect(() => {
    if (pack) {
      const step = getSubscriptionStep(pack.abonnement);
      setMonths(step);
    }
  }, [pack]);

  useEffect(() => {
    if (pack) {
      setTotalAmount(pack.price * months);
      setConvertedAmount(pack.price * months);
    }
  }, [pack, months]);

  useEffect(() => {
    fetchWalletBalance();
    fetchTransferFees();
  }, []);

  useEffect(() => {
    // Réinitialiser les champs du formulaire et l'option de paiement lors du changement de méthode
    setFormFields({});
    setSelectedPaymentOption("");
    setFeesError(false);

    // Pour le wallet, définir automatiquement l'option solifin-wallet et mettre les frais à 0
    if (paymentMethod === PAYMENT_TYPES.WALLET) {
      setSelectedPaymentOption("solifin-wallet");
      setTransactionFees(0);
    } else if (feePercentage > 0 && totalAmount > 0) {
      // Pour les autres méthodes, calculer les frais en fonction du pourcentage global
      const fees = (totalAmount * feePercentage) / 100;
      setTransactionFees(fees);
    }

    validateForm();
  }, [paymentMethod, feePercentage, totalAmount]);

  useEffect(() => {
    // Calculer le montant total en fonction du nombre de mois
    if (pack) {
      const newTotal = pack.price * months;
      setTotalAmount(newTotal);

      // Mettre à jour les frais en fonction du type de paiement
      if (paymentMethod === PAYMENT_TYPES.WALLET) {
        // Pas de frais pour le wallet
        setTransactionFees(0);
      } else if (feePercentage > 0) {
        // Calculer les frais en fonction du pourcentage global
        const fees = (newTotal * feePercentage) / 100;
        setTransactionFees(fees);
      }
    }
  }, [pack, months, paymentMethod, feePercentage]);

  useEffect(() => {
    // Lorsque le montant total change, effectuer la conversion si nécessaire
    if (totalAmount > 0) {
      if (
        paymentMethod === PAYMENT_TYPES.CREDIT_CARD ||
        paymentMethod === PAYMENT_TYPES.MOBILE_MONEY
      ) {
        // Pour les méthodes autres que wallet, convertir d'abord la devise
        convertCurrency();
      } else if (paymentMethod === PAYMENT_TYPES.WALLET) {
        // Pour wallet, utiliser USD directement et pas de frais
        setConvertedAmount(totalAmount);
        setTransactionFees(0);
      }
    }
  }, [totalAmount, paymentMethod, selectedCurrency]);

  useEffect(() => {
    // Mettre à jour les frais lorsque la méthode de paiement spécifique change ou après une conversion de devise
    if (selectedPaymentOption && convertedAmount > 0) {
      if (paymentMethod === PAYMENT_TYPES.WALLET) {
        setTransactionFees(0);
      } else if (feePercentage > 0) {
        // Calculer les frais en fonction du pourcentage global
        const fees = (convertedAmount * feePercentage) / 100;
        setTransactionFees(fees);
      }
      validateForm();
    }
  }, [selectedPaymentOption, convertedAmount, paymentMethod, feePercentage]);

  useEffect(() => {
    validateForm();
  }, [
    paymentMethod,
    formFields,
    selectedPaymentOption,
    months,
    totalAmount,
    referralCode,
    feesError,
  ]);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get("/api/userwallet/balance");
      if (response.data.success) {
        setWalletBalance(parseFloat(response.data.balance));
      } else {
        console.error(
          "Erreur lors de la récupération du solde:",
          response.data.message
        );
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error);
      setWalletBalance(0);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWalletBalance();
    }
  }, [open]);

  const handleFieldChange = (fieldName, value) => {
    const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);
    const field = selectedMethod?.fields?.find((f) => f.name === fieldName);

    // Appliquer le formatage si défini
    const formattedValue = field?.format ? field.format(value) : value;

    setFormFields((prev) => ({
      ...prev,
      [fieldName]: formattedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (paymentMethod === PAYMENT_TYPES.WALLET && totalAmount > walletBalance) {
      setError("Solde insuffisant dans votre wallet");
      setLoading(false);
      return;
    }

    // Vérifier si tous les champs requis sont remplis
    if (!formIsValid) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API
      const paymentData = {
        ...formFields,
        payment_method: selectedPaymentOption, // Utiliser l'option spécifique (visa, m-pesa, solifin-wallet, etc.)
        payment_type: paymentMethod, // Utiliser le type général (credit-card, mobile-money, wallet, etc.)
        months,
        referralCode,
        currency:
          paymentMethod === PAYMENT_TYPES.WALLET ? "USD" : selectedCurrency,
        amount:
          paymentMethod === PAYMENT_TYPES.WALLET
            ? totalAmount
            : convertedAmount,
        fees: transactionFees,
        packId: pack?.id,
      };

      // Appel API pour effectuer le paiement
      const response = await axios.post(
        "/api/packs/purchase_a_new_pack",
        paymentData
      );

      if (response.data.success) {
        Notification.success("Paiement effectué avec succès");
        onClose(true);
      } else {
        setError(
          response.data.message || "Une erreur est survenue lors du paiement"
        );
      }
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors du paiement"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);

    if (!selectedMethod) {
      return null;
    }

    return (
      <div className="space-y-2">
        {/* Afficher les options spécifiques pour chaque type de paiement */}
        {paymentMethod !== PAYMENT_TYPES.WALLET &&
          selectedMethod.options &&
          selectedMethod.options.length > 0 && (
            <div className="mb-2">
              <Typography variant="subtitle2" gutterBottom>
                {paymentMethod === PAYMENT_TYPES.CREDIT_CARD
                  ? "Choisissez votre type de carte"
                  : "Choisissez votre opérateur"}
              </Typography>
              <Box sx={{ color: "text.secondary", mb: 1 }}>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ color: "orange" }}
                >
                  Veuillez sélectionner une méthode de paiement spécifique pour
                  continuer
                </Typography>
              </Box>
              <RadioGroup
                row
                value={selectedPaymentOption}
                onChange={(e) => setSelectedPaymentOption(e.target.value)}
                className="gap-4"
              >
                {selectedMethod.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio size="small" />}
                    label={option.name}
                  />
                ))}
              </RadioGroup>
            </div>
          )}

        {/* Afficher les champs de formulaire si une option est sélectionnée ou si c'est le wallet */}
        {(paymentMethod === PAYMENT_TYPES.WALLET || selectedPaymentOption) &&
          selectedMethod.fields && (
            <div
              className={
                paymentMethod === PAYMENT_TYPES.CREDIT_CARD
                  ? "grid grid-cols-2 gap-2"
                  : ""
              }
            >
              {selectedMethod.fields.map((field) => (
                <TextField
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  value={formFields[field.name] || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  required={field.required}
                  fullWidth
                  size="small"
                  margin="dense"
                  inputProps={{
                    maxLength: field.maxLength,
                  }}
                />
              ))}
            </div>
          )}
      </div>
    );
  };

  // Fonction pour déterminer le pas en fonction du type d'abonnement
  const getSubscriptionStep = (subscriptionType) => {
    switch (subscriptionType?.toLowerCase()) {
      case "monthly":
      case "mensuel":
        return 1; // Pas de 1 mois pour abonnement mensuel
      case "quarterly":
      case "trimestriel":
        return 3; // Pas de 3 mois pour abonnement trimestriel
      case "biannual":
      case "semestriel":
        return 6; // Pas de 6 mois pour abonnement semestriel
      case "annual":
      case "yearly":
      case "annuel":
        return 12; // Pas de 12 mois pour abonnement annuel
      default:
        return 1; // Par défaut, pas de 1 mois
    }
  };

  // Récupérer les frais de transfert globaux au chargement du modal
  const fetchTransferFees = async () => {
    setLoadingFees(true);
    setFeesError(false);

    try {
      // Appel à l'API qui retourne le pourcentage global des frais
      const response = await axios.post("/api/transaction-fees/transfer", {
        amount: 100, // Montant de référence pour calculer le pourcentage
      });

      if (response.data.success) {
        // Stocker le pourcentage plutôt que le montant des frais
        setFeePercentage(response.data.percentage);

        // Calculer les frais initiaux si nécessaire
        if (paymentMethod !== PAYMENT_TYPES.WALLET && totalAmount > 0) {
          const fees = (totalAmount * response.data.percentage) / 100;
          setTransactionFees(fees);
        } else {
          setTransactionFees(0);
        }

        setFeesError(false);
      } else {
        setFeesError(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des frais:", error);
      setFeesError(true);
    } finally {
      setLoadingFees(false);
    }
  };

  const convertCurrency = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/currency/convert", {
        amount: totalAmount,
        from: "USD",
        to: selectedCurrency,
      });

      if (response.data.success) {
        const convertedAmt = response.data.convertedAmount;
        setConvertedAmount(convertedAmt);

        // Calculer les frais directement ici plutôt que de déclencher un autre appel API
        if (paymentMethod !== PAYMENT_TYPES.WALLET && feePercentage > 0) {
          const fees = (convertedAmt * feePercentage) / 100;
          setTransactionFees(fees);
        }
      } else {
        console.error("Erreur lors de la conversion:", response.data.message);
        // En cas d'erreur, on utilise le montant original
        setConvertedAmount(totalAmount);
        setFeesError(true);
      }
    } catch (error) {
      console.error("Erreur lors de la conversion:", error);
      console.error(
        "Détails de l'erreur:",
        error.response?.data || "Pas de détails disponibles"
      );
      setConvertedAmount(totalAmount);
      setFeesError(true);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si le formulaire est valide
  const validateForm = () => {
    // Vérifier si tous les champs requis sont remplis
    let isValid = true;

    // Vérifier si une méthode de paiement spécifique est sélectionnée
    isValid = isValid && selectedPaymentOption !== "";

    // Vérifier si le nombre de mois est valide
    isValid = isValid && months > 0;

    // Vérifier si le code de parrainage est rempli
    isValid = isValid && referralCode && referralCode.trim() !== "";

    // Vérifier les champs selon la méthode de paiement
    if (paymentMethod === PAYMENT_TYPES.WALLET) {
      // Pour le wallet, on n'a pas besoin de vérifier les champs de formulaire supplémentaires
      // mais on doit s'assurer que le calcul des frais n'est pas en cours et qu'il n'y a pas d'erreur
      isValid = isValid && !loadingFees && !feesError;
    } else if (paymentMethod === PAYMENT_TYPES.CREDIT_CARD) {
      // Pour la carte de crédit, vérifier tous les champs requis
      const requiredFields = ["cardNumber", "cardHolder", "expiryDate", "cvv"];
      isValid =
        isValid &&
        requiredFields.every(
          (field) => formFields[field] && formFields[field].trim() !== ""
        );
    } else if (paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) {
      // Pour le mobile money, vérifier le numéro de téléphone
      isValid =
        isValid &&
        formFields.phoneNumber &&
        formFields.phoneNumber.trim() !== "";
    }

    // Vérifier que le montant est positif
    isValid = isValid && totalAmount > 0;

    // Vérifier qu'il n'y a pas d'erreur de calcul des frais
    isValid = isValid && !feesError;

    setFormIsValid(isValid);
    return isValid;
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <style>{customStyles}</style>
      <div
        className={`relative w-full max-w-2xl rounded-lg p-0 shadow-xl overflow-hidden ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white"
        }`}
      >
        {/* En-tête avec dégradé */}
        <div
          className={`p-6 ${
            isDarkMode
              ? "bg-gradient-to-r from-green-900 to-green-900"
              : "bg-gradient-to-r from-green-500 to-green-600"
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <Typography variant="h5" component="h2" className="font-bold">
              Acheter {pack?.name}
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              className="text-white hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <Typography variant="body2" className="mt-1 opacity-80">
            Complétez les informations ci-dessous pour finaliser votre achat
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className="mx-6 mt-4 mb-0">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto p-6 pt-4 custom-scrollbar">
            {/* Section méthode de paiement */}
            <div className="slide-in" style={{ animationDelay: "0.2s" }}>
              <Typography
                variant="subtitle1"
                className="font-bold mb-3 text-primary-600 dark:text-primary-400"
              >
                Méthode de paiement
              </Typography>

              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`method-card cursor-pointer ${
                      paymentMethod === method.id ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <Radio
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        size="small"
                      />
                      <div className="ml-2">
                        <Typography variant="subtitle2">
                          {method.name}
                        </Typography>
                        {method.id === PAYMENT_TYPES.WALLET && (
                          <Typography variant="caption" color="textSecondary">
                            Solde disponible: {walletBalance} USD
                          </Typography>
                        )}
                        {method.id === PAYMENT_TYPES.CREDIT_CARD && (
                          <Typography variant="caption" color="textSecondary">
                            Visa, Mastercard, American Express
                          </Typography>
                        )}
                        {method.id === PAYMENT_TYPES.MOBILE_MONEY && (
                          <Typography variant="caption" color="textSecondary">
                            Orange Money, Airtel Money, M-Pesa
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Champs de paiement */}
            <div className="mt-4 fade-in" style={{ animationDelay: "0.3s" }}>
              {renderPaymentFields()}
            </div>

            {/* Code de parrainage */}
            <div className="mt-6 slide-in" style={{ animationDelay: "0.4s" }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                className="text-gray-600 dark:text-gray-300"
              >
                Code de parrainage <span className="text-red-500">*</span>
              </Typography>
              <TextField
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                fullWidth
                size="small"
                placeholder="Entrez le code"
                required
                error={!referralCode && formFields.cardNumber}
                helperText={
                  !referralCode && formFields.cardNumber
                    ? "Le code de parrainage est obligatoire"
                    : ""
                }
              />
            </div>

            {/* Section durée et montant */}
            <div
              className="summary-card mt-6 mb-6 fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Typography
                variant="subtitle1"
                className="font-bold mb-3 text-primary-600 dark:text-primary-400"
              >
                Détails de l'abonnement
              </Typography>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Durée de souscription
                  </Typography>
                  <TextField
                    type="number"
                    value={months}
                    onChange={(e) => {
                      // Déterminer le pas en fonction du type d'abonnement
                      const step = getSubscriptionStep(pack.abonnement);
                      // S'assurer que la valeur est un multiple du pas
                      const newValue = parseInt(e.target.value) || step;
                      const adjustedValue = Math.max(
                        step,
                        Math.round(newValue / step) * step
                      );
                      setMonths(adjustedValue);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mois</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      min: getSubscriptionStep(pack.abonnement),
                      step: getSubscriptionStep(pack.abonnement),
                    }}
                    fullWidth
                    size="small"
                  />
                </div>

                {(paymentMethod === PAYMENT_TYPES.CREDIT_CARD ||
                  paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) && (
                  <div>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Devise
                    </Typography>
                    <TextField
                      select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      fullWidth
                      size="small"
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              bgcolor: isDarkMode ? "#1e283b" : "white",
                              color: isDarkMode ? "white" : "inherit",
                              "& .MuiMenuItem-root:hover": {
                                bgcolor: isDarkMode
                                  ? "rgba(255, 255, 255, 0.08)"
                                  : "rgba(0, 0, 0, 0.04)",
                              },
                            },
                          },
                        },
                      }}
                    >
                      {Object.keys(CURRENCIES).map((currencyCode) => (
                        <MenuItem key={currencyCode} value={currencyCode}>
                          {currencyCode} ({CURRENCIES[currencyCode].symbol}) -{" "}
                          {CURRENCIES[currencyCode].name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                )}
              </div>

              <div
                className={`mt-4 p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Montant de base
                  </Typography>
                  <Typography variant="body2">
                    {paymentMethod === PAYMENT_TYPES.WALLET
                      ? (totalAmount || 0).toFixed(2)
                      : (convertedAmount || 0).toFixed(2)}{" "}
                    {paymentMethod === PAYMENT_TYPES.WALLET
                      ? CURRENCIES.USD.symbol
                      : CURRENCIES[selectedCurrency].symbol}
                  </Typography>
                </div>

                {/* N'afficher la ligne des frais que si une méthode de paiement spécifique est sélectionnée */}
                {selectedPaymentOption && (
                  <div className="flex justify-between items-center mt-2">
                    <Typography
                      variant="subtitle2"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Frais{" "}
                      {feePercentage !== null
                        ? `(${feePercentage.toFixed(1)}%)`
                        : ""}
                    </Typography>
                    <Typography variant="body2">
                      {transactionFees !== null
                        ? transactionFees.toFixed(2)
                        : "0.00"}{" "}
                      {paymentMethod === PAYMENT_TYPES.WALLET
                        ? CURRENCIES.USD.symbol
                        : CURRENCIES[selectedCurrency].symbol}
                    </Typography>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Typography variant="subtitle1" className="font-bold">
                    Total
                  </Typography>
                  <div className="flex items-center">
                    {feesError ? (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={fetchTransferFees}
                        className="mr-2"
                        title="Recalculer les frais"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </IconButton>
                    ) : loadingFees ? (
                      <CircularProgress size={16} className="mr-2" />
                    ) : null}
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      className="font-bold"
                    >
                      {(
                        (paymentMethod === PAYMENT_TYPES.WALLET
                          ? totalAmount || 0
                          : convertedAmount || 0) + (transactionFees || 0)
                      ).toFixed(2)}{" "}
                      {paymentMethod === PAYMENT_TYPES.WALLET
                        ? CURRENCIES.USD.symbol
                        : CURRENCIES[selectedCurrency].symbol}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de paiement - en dehors de la zone scrollable */}
          <div className="p-6 pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <Typography variant="body2" color="textSecondary">
              {paymentMethod === PAYMENT_TYPES.WALLET
                ? "Paiement direct depuis votre wallet"
                : "Procédez au paiement sécurisé"}
            </Typography>

            {/* Alerte pour solde insuffisant */}
            {paymentMethod === PAYMENT_TYPES.WALLET &&
              totalAmount + (transactionFees || 0) > walletBalance && (
                <Alert
                  severity="error"
                  className="mb-3 absolute bottom-16 left-6 right-6"
                >
                  Solde insuffisant dans votre wallet. Vous avez besoin de{" "}
                  {(totalAmount + (transactionFees || 0)).toFixed(2)} USD mais
                  votre solde est de {walletBalance.toFixed(2)} USD.
                </Alert>
              )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                !formIsValid ||
                loading ||
                loadingFees ||
                feesError ||
                (paymentMethod === PAYMENT_TYPES.WALLET &&
                  totalAmount + (transactionFees || 0) > walletBalance)
              }
              className="px-6 py-2"
              startIcon={
                feesError ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : null
              }
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : paymentMethod === PAYMENT_TYPES.WALLET ? (
                "Payer maintenant"
              ) : (
                "Procéder au paiement"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
