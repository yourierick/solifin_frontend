import { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import axios from '../utils/axios';
import Notification from './Notification';
import { CURRENCIES, PAYMENT_TYPES, PAYMENT_METHODS } from '../config';

// Style CSS pour les animations et effets visuels
const customStyles = `
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

const paymentMethods = [
  {
    id: PAYMENT_TYPES.WALLET,
    name: 'Mon Wallet',
    icon: 'wallet',
    category: 'direct',
    options: PAYMENT_METHODS[PAYMENT_TYPES.WALLET]
  },
  {
    id: PAYMENT_TYPES.CREDIT_CARD,
    name: 'Carte de crédit',
    icon: 'credit-card',
    category: 'card',
    options: PAYMENT_METHODS[PAYMENT_TYPES.CREDIT_CARD],
    fields: [
      { name: 'cardNumber', label: 'Numéro de carte', type: 'text', required: true, maxLength: 19, 
        format: (value) => value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() },
      { name: 'cardHolder', label: 'Nom sur la carte', type: 'text', required: true },
      { 
        name: 'expiryDate', 
        label: 'Date d\'expiration', 
        type: 'text', 
        required: true,
        maxLength: 5,
        format: (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2')
      },
      { name: 'cvv', label: 'CVV', type: 'text', required: true, maxLength: 3 }
    ]
  },
  {
    id: PAYMENT_TYPES.MOBILE_MONEY,
    name: 'Mobile Money',
    icon: 'phone',
    category: 'mobile',
    options: PAYMENT_METHODS[PAYMENT_TYPES.MOBILE_MONEY],
    fields: [
      { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'tel', required: true }
    ]
  }
];

export default function RenewPackForm({ open, onClose, pack, onRenew }) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_TYPES.WALLET);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('');
  const [formFields, setFormFields] = useState({});
  const [months, setMonths] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionFees, setTransactionFees] = useState(0);
  const [feePercentage, setFeePercentage] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [formIsValid, setFormIsValid] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [feesError, setFeesError] = useState(false);

  useEffect(() => {
    if (pack) {
      setTotalAmount(pack.price * months);
      setConvertedAmount(pack.price * months);
    }
  }, [pack, months]);

  useEffect(() => {
    if (open) {
      fetchWalletBalance();
    }
  }, [open]);

  useEffect(() => {
    // Réinitialiser les champs du formulaire et l'option de paiement lors du changement de méthode
    setFormFields({});
    setSelectedPaymentOption('');
    setFeesError(false);
    
    // Pour le wallet, définir automatiquement l'option solifin-wallet
    if (paymentMethod === PAYMENT_TYPES.WALLET) {
      setSelectedPaymentOption('solifin-wallet');
      // Déclencher immédiatement le calcul des frais pour le wallet
      setTimeout(() => {
        calculateFees();
      }, 0);
    }
  }, [paymentMethod]);

  useEffect(() => {
    // Calculer le montant total en fonction du nombre de mois
    if (pack) {
      const newTotal = pack.price * months;
      setTotalAmount(newTotal);
      
      // Pour le wallet, recalculer les frais chaque fois que le montant change
      if (paymentMethod === PAYMENT_TYPES.WALLET && selectedPaymentOption) {
        setTimeout(() => {
          calculateFees();
        }, 0);
      }
    }
  }, [pack, months]);

  useEffect(() => {
    // Lorsque le montant total change, effectuer la conversion si nécessaire
    if (totalAmount > 0) {
      if (paymentMethod === PAYMENT_TYPES.CREDIT_CARD || paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) {
        // Pour les méthodes autres que wallet, convertir d'abord la devise
        convertCurrency();
      } else if (paymentMethod === PAYMENT_TYPES.WALLET && selectedPaymentOption) {
        // Pour wallet, utiliser USD directement et calculer les frais si une méthode est sélectionnée
        setConvertedAmount(totalAmount);
        calculateFees();
      }
    }
  }, [totalAmount, paymentMethod, selectedCurrency]);

  useEffect(() => {
    // Calculer les frais lorsque la méthode de paiement spécifique change ou après une conversion de devise
    if (selectedPaymentOption && convertedAmount > 0 && 
        (paymentMethod === PAYMENT_TYPES.CREDIT_CARD || paymentMethod === PAYMENT_TYPES.MOBILE_MONEY)) {
      calculateFees();
    }
  }, [selectedPaymentOption, convertedAmount]);

  useEffect(() => {
    validateForm();
  }, [paymentMethod, formFields, selectedPaymentOption, months, totalAmount, feesError]);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get('/api/userwallet/balance');
      if (response.data.success) {
        setWalletBalance(parseFloat(response.data.balance));
      } else {
        console.error('Erreur lors de la récupération du solde:', response.data.message);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      setWalletBalance(0);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    const field = selectedMethod?.fields?.find(f => f.name === fieldName);
    
    // Appliquer le formatage si défini
    const formattedValue = field?.format ? field.format(value) : value;
    
    setFormFields(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));
  };

  const calculateFees = async () => {
    setLoadingFees(true);
    setFeesError(false);
    
    try {
      const amount = paymentMethod === PAYMENT_TYPES.WALLET ? totalAmount : convertedAmount;
      const currency = paymentMethod === PAYMENT_TYPES.WALLET ? 'USD' : selectedCurrency;
      
      // Déterminer l'option de paiement spécifique à utiliser
      let paymentOption = '';
      
      if (paymentMethod === PAYMENT_TYPES.WALLET) {
        paymentOption = 'solifin-wallet';
      } else if (paymentMethod === PAYMENT_TYPES.CREDIT_CARD) {
        // Utiliser l'option de carte spécifique ou par défaut 'visa'
        paymentOption = selectedPaymentOption || 'visa';
      } else if (paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) {
        // Utiliser l'option mobile spécifique ou par défaut 'm-pesa'
        paymentOption = selectedPaymentOption || 'm-pesa';
      }
      
      // Vérifier que les valeurs sont valides avant de faire l'appel API
      if (!paymentOption || !amount || amount <= 0) {
        setLoadingFees(false);
        return;
      }
      
      const response = await axios.post('/api/transaction-fees/transfer', {
        amount: amount,
        payment_method: paymentOption, // Envoyer la méthode spécifique (visa, m-pesa, solifin-wallet, etc.)
        currency: currency
      });
      
      if (response.data.success) {
        setTransactionFees(response.data.fee);
        setFeePercentage(response.data.percentage);
        setFeesError(false);
      } else {
        setFeesError(true);
        setTransactionFees(0);
        setFeePercentage(0);
      }
    } catch (error) {
      console.error('Erreur lors du calcul des frais:', error);
      setFeesError(true);
      setTransactionFees(0);
      setFeePercentage(0);
    } finally {
      setLoadingFees(false);
    }
  };

  const convertCurrency = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/currency/convert', {
        amount: totalAmount,
        from: 'USD',
        to: selectedCurrency
      });
      
      if (response.data.success) {
        const convertedAmt = response.data.convertedAmount;
        setConvertedAmount(convertedAmt);
        // Le calcul des frais sera déclenché par l'effet qui surveille convertedAmount
      } else {
        console.error('Erreur lors de la conversion:', response.data.message);
        // En cas d'erreur, on utilise le montant original
        setConvertedAmount(totalAmount);
        setFeesError(true);
      }
    } catch (error) {
      console.error('Erreur lors de la conversion:', error);
      console.error('Détails de l\'erreur:', error.response?.data || 'Pas de détails disponibles');
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
    
    // Vérifier si le nombre de mois est valide
    isValid = isValid && months > 0;
    
    // Vérifier les champs selon la méthode de paiement
    if (paymentMethod === PAYMENT_TYPES.WALLET) {
      // Pour le wallet, on n'a pas besoin de vérifier les champs de formulaire supplémentaires
      // mais on doit s'assurer que le calcul des frais n'est pas en cours et qu'il n'y a pas d'erreur
      isValid = isValid && !loadingFees && !feesError;
      
      // Vérifier que le solde du wallet est suffisant
      isValid = isValid && walletBalance >= (totalAmount + (transactionFees || 0));
      
      // Pour le wallet, on vérifie que selectedPaymentOption est défini
      isValid = isValid && (selectedPaymentOption !== '' || paymentMethod === PAYMENT_TYPES.WALLET);
    } else if (paymentMethod === PAYMENT_TYPES.CREDIT_CARD) {
      // Pour la carte de crédit, vérifier tous les champs requis
      const requiredFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
      isValid = isValid && requiredFields.every(field => formFields[field] && formFields[field].trim() !== '');
      
      // Pour la carte de crédit, on n'exige pas que selectedPaymentOption soit défini
      // car il sera défini par défaut à 'visa' lors de la soumission
    } else if (paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) {
      // Pour le mobile money, vérifier le numéro de téléphone
      isValid = isValid && formFields.phoneNumber && formFields.phoneNumber.trim() !== '';
      
      // Pour le mobile money, on vérifie que selectedPaymentOption est défini
      isValid = isValid && selectedPaymentOption !== '';
    }
    
    // Vérifier que le montant est positif
    isValid = isValid && totalAmount > 0;
    
    // Vérifier qu'il n'y a pas d'erreur de calcul des frais
    isValid = isValid && !feesError;
    
    setFormIsValid(isValid);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (paymentMethod === PAYMENT_TYPES.WALLET) {
      const totalWithFees = totalAmount + (transactionFees || 0);
      if (totalWithFees > walletBalance) {
        setError('Solde insuffisant dans votre wallet');
        setLoading(false);
        return;
      }
    }

    try {
      // Déterminer la méthode spécifique de paiement
      let specificPaymentMethod = selectedPaymentOption;
      
      // Si aucune méthode spécifique n'est sélectionnée, utiliser une valeur par défaut selon le type
      if (!specificPaymentMethod) {
        if (paymentMethod === PAYMENT_TYPES.WALLET) {
          specificPaymentMethod = 'solifin-wallet';
        } else if (paymentMethod === PAYMENT_TYPES.CREDIT_CARD) {
          specificPaymentMethod = 'visa';
        } else if (paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) {
          specificPaymentMethod = 'm-pesa';
        }
      }
      
      // Préparer les données à envoyer
      const paymentData = {
        payment_method: specificPaymentMethod, // Méthode spécifique (visa, mastercard, m-pesa, etc.)
        payment_type: paymentMethod, // Type générique (wallet, credit-card, mobile-money)
        payment_details: formFields,
        duration_months: months,
        amount: paymentMethod === PAYMENT_TYPES.WALLET ? totalAmount : convertedAmount,
        currency: paymentMethod === PAYMENT_TYPES.WALLET ? 'USD' : selectedCurrency,
        fees: transactionFees || 0
      };
      
      // Appel à l'API pour renouveler le pack
      const response = await axios.post(`/api/packs/${pack.id}/renew`, paymentData);
      
      if (response.data.success) {
        Notification.success('Pack renouvelé avec succès!');
        onClose();
      } else {
        setError(response.data.message || 'Une erreur est survenue lors du renouvellement du pack');
      }
    } catch (error) {
      console.error('Erreur lors du renouvellement du pack:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors du renouvellement du pack');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (!selectedMethod?.fields) return null;

    return (
      <div className="space-y-2">
        {(paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) && (
          <div className="mb-2">
            <Typography variant="subtitle2" gutterBottom>
              Choisissez votre opérateur
            </Typography>
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

        {(paymentMethod === PAYMENT_TYPES.CREDIT_CARD) && (
          <div className="mb-2">
            <Typography variant="subtitle2" gutterBottom>
              Choisissez votre type de carte
            </Typography>
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

        {((paymentMethod !== PAYMENT_TYPES.MOBILE_MONEY && paymentMethod !== PAYMENT_TYPES.CREDIT_CARD) || selectedPaymentOption) && (
          <div className={paymentMethod === PAYMENT_TYPES.CREDIT_CARD ? 'grid grid-cols-2 gap-2' : ''}>
            {selectedMethod.fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type}
                value={formFields[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                fullWidth
                required={field.required}
                size="small"
                inputProps={{ 
                  maxLength: field.maxLength,
                  className: field.name === 'cvv' ? 'font-mono' : ''
                }}
                className={
                  field.name === 'cardNumber' || field.name === 'cardHolder' 
                    ? 'col-span-2' 
                    : ''
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isDarkMode ? 'dark' : ''}`}>
      <style>{customStyles}</style>
      <div className={`relative w-full max-w-2xl rounded-lg p-0 shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        {/* En-tête avec dégradé */}
        <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-r from-green-900 to-green-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
          <div className="flex items-center justify-between">
            <Typography variant="h5" component="h2" className="font-bold">
              Renouveler {pack?.name}
            </Typography>
            <IconButton onClick={onClose} size="small" className="text-white hover:bg-white/20 transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <Typography variant="body2" className="mt-1 opacity-80">
            Complétez les informations ci-dessous pour finaliser votre renouvellement
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
            <div className="slide-in" style={{ animationDelay: '0.2s' }}>
              <Typography variant="subtitle1" className="font-bold mb-3 text-primary-600 dark:text-primary-400">
                Méthode de paiement
              </Typography>
              
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`method-card cursor-pointer ${paymentMethod === method.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <Radio 
                        checked={paymentMethod === method.id} 
                        onChange={() => setPaymentMethod(method.id)}
                        size="small"
                      />
                      <div className="ml-2">
                        <Typography variant="subtitle2">{method.name}</Typography>
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
            <div className="mt-4 fade-in" style={{ animationDelay: '0.3s' }}>
              {renderPaymentFields()}
            </div>

            {/* Section durée et montant */}
            <div className="summary-card mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
              <Typography variant="subtitle1" className="font-bold mb-3 text-primary-600 dark:text-primary-400">
                Détails de l'abonnement
              </Typography>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" gutterBottom className="text-gray-600 dark:text-gray-300">
                    Durée de souscription
                  </Typography>
                  <TextField
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mois</InputAdornment>,
                    }}
                    fullWidth
                    inputProps={{ min: 1 }}
                    size="small"
                  />
                </div>
                
                {(paymentMethod === PAYMENT_TYPES.CREDIT_CARD || paymentMethod === PAYMENT_TYPES.MOBILE_MONEY) && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom className="text-gray-600 dark:text-gray-300">
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
                              bgcolor: isDarkMode ? '#1e283b' : 'white',
                              color: isDarkMode ? 'white' : 'inherit',
                              '& .MuiMenuItem-root:hover': {
                                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                              }
                            }
                          }
                        }
                      }}
                    >
                      {Object.keys(CURRENCIES).map((currencyCode) => (
                        <MenuItem key={currencyCode} value={currencyCode}
                        >
                          {currencyCode} ({CURRENCIES[currencyCode].symbol}) - {CURRENCIES[currencyCode].name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                )}
              </div>
              
              <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Montant de base
                  </Typography>
                  <Typography variant="body2">
                    {paymentMethod === PAYMENT_TYPES.WALLET ? totalAmount : convertedAmount} {paymentMethod === PAYMENT_TYPES.WALLET ? CURRENCIES.USD.symbol : CURRENCIES[selectedCurrency].symbol}
                  </Typography>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Frais ({(feePercentage || 0).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    {transactionFees || 0} {paymentMethod === PAYMENT_TYPES.WALLET ? CURRENCIES.USD.symbol : CURRENCIES[selectedCurrency].symbol}
                  </Typography>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Typography variant="subtitle1" className="font-bold">
                    Total
                  </Typography>
                  <div className="flex items-center">
                    {feesError ? (
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={calculateFees} 
                        className="mr-2"
                        title="Recalculer les frais"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </IconButton>
                    ) : loadingFees ? (
                      <CircularProgress size={16} className="mr-2" />
                    ) : null}
                    <Typography variant="subtitle1" color="primary" className="font-bold">
                      {((paymentMethod === PAYMENT_TYPES.WALLET ? totalAmount : convertedAmount) + (transactionFees || 0)).toFixed(2)} {paymentMethod === PAYMENT_TYPES.WALLET ? CURRENCIES.USD.symbol : CURRENCIES[selectedCurrency].symbol}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de paiement - en dehors de la zone scrollable */}
          <div className="p-6 pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <Typography variant="body2" color="textSecondary">
              {paymentMethod === PAYMENT_TYPES.WALLET ? 'Paiement direct depuis votre wallet' : 'Procédez au paiement sécurisé'}
            </Typography>
            
            {/* Alerte pour solde insuffisant */}
            {paymentMethod === PAYMENT_TYPES.WALLET && totalAmount + (transactionFees || 0) > walletBalance && (
              <Alert severity="error" className="mb-3 absolute bottom-16 left-6 right-6">
                Solde insuffisant dans votre wallet. Vous avez besoin de {(totalAmount + (transactionFees || 0)).toFixed(2)} USD mais votre solde est de {walletBalance.toFixed(2)} USD.
              </Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formIsValid || feesError || loadingFees}
              className={`${loading || !formIsValid || feesError || loadingFees ? '' : 'pulse'}`}
              sx={{ 
                minWidth: 150,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                paymentMethod === PAYMENT_TYPES.WALLET ? 'Renouveler maintenant' : 'Procéder au renouvellement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
