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
import { useToast } from '../contexts/ToastContext';
import Notification from './Notification';
import { CURRENCIES } from '../config';

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

// Liste des méthodes de paiement disponibles pour l'inscription
const paymentMethods = [
  {
    id: 'credit-card',
    name: 'Carte de crédit',
    icon: 'credit-card',
    category: 'card',
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
    id: 'mobile-money',
    name: 'Mobile Money',
    icon: 'phone',
    category: 'mobile',
    options: [
      { id: 'orange-money', name: 'Orange Money' },
      { id: 'airtel-money', name: 'Airtel Money' },
      { id: 'm-pesa', name: 'M-Pesa' }
    ],
    fields: [
      { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'tel', required: true }
    ]
  }
];

export default function RegistrationPaymentForm({ open, onClose, pack, onSubmit, loading = false }) {
  const { isDarkMode } = useTheme();
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [formFields, setFormFields] = useState({});
  const [months, setMonths] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMobileOption, setSelectedMobileOption] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionFees, setTransactionFees] = useState(0);
  const [feePercentage, setFeePercentage] = useState(3.5);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [formIsValid, setFormIsValid] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (pack && !totalAmount) {
      setTotalAmount(pack.price * months);
      setConvertedAmount(pack.price * months);
      fetchTransactionFees(pack.price * months, paymentMethod, selectedCurrency);
    }
  }, [pack, months]);

  useEffect(() => {
    if (pack && totalAmount > 0 && !localLoading) {
      fetchTransactionFees(totalAmount, paymentMethod, selectedCurrency);
    }
  }, [paymentMethod, selectedCurrency]);

  useEffect(() => {
    // Réinitialiser les champs du formulaire et l'option mobile lors du changement de méthode
    setFormFields({});
    setSelectedMobileOption('');
  }, [paymentMethod]);

  useEffect(() => {
    // Seulement pour les méthodes de paiement credit-card et mobile-money
    if ((paymentMethod === 'credit-card' || paymentMethod === 'mobile-money') && totalAmount > 0) {
      convertCurrency();
    } else {
      // Pour les autres méthodes, on utilise USD directement
      setConvertedAmount(totalAmount);
      fetchTransactionFees(totalAmount, paymentMethod, 'USD');
    }
  }, [selectedCurrency, totalAmount, paymentMethod]);

  useEffect(() => {
    validateForm();
  }, [paymentMethod, formFields, selectedMobileOption, months, totalAmount]);

  // Récupérer les frais de transaction depuis l'API
  const fetchTransactionFees = async (amount, method, currency) => {
    try {
      const response = await axios.post('/api/transaction-fees/calculate', {
        payment_method: method,
        amount: amount,
        currency: currency
      });
      
      if (response.data.status === 'success') {
        const feeData = response.data.data;
        setTransactionFees(parseFloat(feeData.fee.toFixed(2)));
        setFeePercentage((feeData.fee / amount) * 100);
      } else {
        // Fallback au calcul local si l'API échoue
        calculateLocalFees(amount, method, currency);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des frais de transaction:', error);
      // Fallback au calcul local si l'API échoue
      calculateLocalFees(amount, method, currency);
    }
  };

  // Calcul local des frais comme solution de secours
  const calculateLocalFees = (amount, method, currency) => {
    let rate = 0.035; // Default 3.5%
    if (method === 'credit-card') {
      rate = 0.04; // 4% for credit cards
    }
    
    const fees = amount * rate;
    setTransactionFees(parseFloat(fees.toFixed(2)));
    setFeePercentage(rate * 100);
  };

  const convertCurrency = async () => {
    try {
      setLocalLoading(true);
      
      const response = await axios.post('/api/currency/convert', {
        amount: totalAmount,
        from: 'USD',
        to: selectedCurrency
      });
      
      if (response.data.success) {
        const convertedAmt = response.data.convertedAmount;
        setConvertedAmount(convertedAmt);
        
        // Calculer les frais pour le montant converti
        fetchTransactionFees(convertedAmt, paymentMethod, selectedCurrency);
      } else {
        console.error('Erreur lors de la conversion:', response.data.message);
        // En cas d'erreur, on utilise le montant original
        setConvertedAmount(totalAmount);
        fetchTransactionFees(totalAmount, paymentMethod, 'USD');
      }
      setLocalLoading(false);
    } catch (error) {
      console.error('Erreur lors de la conversion:', error);
      setConvertedAmount(totalAmount);
      fetchTransactionFees(totalAmount, paymentMethod, 'USD');
      setLocalLoading(false);
    }
  };

  // Vérifier si le formulaire est valide
  const validateForm = () => {
    // Vérifier si tous les champs requis sont remplis
    let isValid = true;

    // Vérifier les champs selon la méthode de paiement
    if (paymentMethod === 'credit-card') {
      // Pour la carte de crédit, vérifier tous les champs requis
      const requiredFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
      isValid = isValid && requiredFields.every(field => formFields[field] && formFields[field].trim() !== '');
    } else if (paymentMethod === 'mobile-money') {
      // Pour le mobile money, vérifier l'option sélectionnée et le numéro de téléphone
      isValid = isValid && selectedMobileOption !== '' && formFields.phoneNumber && formFields.phoneNumber.trim() !== '';
    }

    // Vérifier que le montant est positif
    isValid = isValid && totalAmount > 0;

    setFormIsValid(isValid);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    
    // Vérifier que tous les champs requis sont remplis
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (selectedMethod?.fields) {
      const missingFields = selectedMethod.fields
        .filter(field => field.required && !formFields[field.name])
        .map(field => field.label);

      if (missingFields.length > 0) {
        setError(`Veuillez remplir les champs suivants : ${missingFields.join(', ')}`);
        setLocalLoading(false);
        return;
      }
    }

    // Vérifier que l'option mobile est sélectionnée si nécessaire
    if (paymentMethod === 'mobile-money' && !selectedMobileOption) {
      setError('Veuillez sélectionner un opérateur mobile');
      setLocalLoading(false);
      return;
    }

    // Préparer les données de paiement en fonction de la méthode sélectionnée
    let paymentDetails = {};
    
    // Ne conserver que les champs pertinents pour la méthode de paiement sélectionnée
    if (paymentMethod === 'credit-card') {
      // Pour carte de crédit, inclure seulement les champs de carte
      const { cardNumber, cardHolder, expiryDate, cvv } = formFields;
      paymentDetails = { cardNumber, cardHolder, expiryDate, cvv };
    } else if (paymentMethod === 'mobile-money') {
      // Pour mobile money, inclure le numéro de téléphone et l'opérateur
      const { phoneNumber } = formFields;
      paymentDetails = { phoneNumber, operator: selectedMobileOption };
    }
    
    // S'assurer que les montants sont bien définis
    const finalAmount = paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' 
      ? convertedAmount 
      : totalAmount;
      
    if (!finalAmount || finalAmount <= 0) {
      setError('Le montant du paiement est invalide');
      setLocalLoading(false);
      return;
    }
    
    const paymentData = {
      pack_id: pack.id,
      payment_method: paymentMethod,
      duration_months: months,
      amount: finalAmount,
      currency: paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' ? selectedCurrency : 'USD',
      fees: transactionFees,
      payment_details: paymentDetails,
      mobile_option: selectedMobileOption
    };

    // Utiliser la fonction onSubmit fournie par le parent
    try {
      if (onSubmit) {
        await onSubmit(paymentData);
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const renderPaymentFields = () => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (!selectedMethod?.fields) return null;

    return (
      <div className="space-y-2">
        {paymentMethod === 'mobile-money' && (
          <div className="mb-2">
            <Typography variant="subtitle2" gutterBottom>
              Choisissez votre opérateur
            </Typography>
            <RadioGroup
              row
              value={selectedMobileOption}
              onChange={(e) => setSelectedMobileOption(e.target.value)}
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

        {(paymentMethod !== 'mobile-money' || selectedMobileOption) && (
          <div className={paymentMethod === 'credit-card' ? 'grid grid-cols-2 gap-2' : ''}>
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
        <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
          <div className="flex items-center justify-between">
            <Typography variant="h5" component="h2" className="font-bold">
              Finaliser votre inscription
            </Typography>
            <IconButton onClick={onClose} size="small" className="text-white hover:bg-white/20 transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <Typography variant="body2" className="mt-1 opacity-80">
            Complétez les informations ci-dessous pour créer votre compte
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className="mx-6 mt-4 mb-0">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto p-6 pt-4 custom-scrollbar">
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
                
                {(paymentMethod === 'credit-card' || paymentMethod === 'mobile-money') && (
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
                    {paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' ? convertedAmount : totalAmount} {paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' ? CURRENCIES[selectedCurrency].symbol : CURRENCIES.USD.symbol}
                  </Typography>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Frais ({feePercentage.toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    {transactionFees} {paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' ? CURRENCIES[selectedCurrency].symbol : CURRENCIES.USD.symbol}
                  </Typography>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Typography variant="subtitle1" className="font-bold">
                    Total
                  </Typography>
                  <Typography variant="subtitle1" color="primary" className="font-bold">
                    {(paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' ? convertedAmount : totalAmount) + transactionFees} {paymentMethod === 'credit-card' || paymentMethod === 'mobile-money' ? CURRENCIES[selectedCurrency].symbol : CURRENCIES.USD.symbol}
                  </Typography>
                </div>
              </div>
              
              {pack?.sponsorName && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-yellow-800 dark:text-yellow-200">
                  <Typography variant="body2">
                    Pour ce pack vous serez sous le parrainage de : <span className="font-semibold">{pack.sponsorName}</span>
                  </Typography>
                </div>
              )}
            </div>
            
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
                        {method.id === 'credit-card' && (
                          <Typography variant="caption" color="textSecondary">
                            Visa, Mastercard, American Express
                          </Typography>
                        )}
                        {method.id === 'mobile-money' && (
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
          </div>

          {/* Bouton de paiement - en dehors de la zone scrollable */}
          <div className="p-6 pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <Typography variant="body2" color="textSecondary">
              Procédez au paiement sécurisé
            </Typography>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || localLoading || !formIsValid}
              className={`${loading || localLoading || !formIsValid ? '' : 'pulse'}`}
              sx={{ 
                minWidth: 150,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading || localLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Payer et créer mon compte'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
