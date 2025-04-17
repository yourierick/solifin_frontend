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

const paymentMethods = [
  {
    id: 'wallet',
    name: 'Mon Wallet',
    icon: 'wallet',
    category: 'direct'
  },
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

export default function RenewPackForm({ open, onClose, pack, onRenew }) {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [formFields, setFormFields] = useState({});
  const [months, setMonths] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMobileOption, setSelectedMobileOption] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionFees, setTransactionFees] = useState(0);
  const [feePercentage, setFeePercentage] = useState(3.5);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [formIsValid, setFormIsValid] = useState(false);

  useEffect(() => {
    if (pack) {
      setTotalAmount(pack.price * months);
      setConvertedAmount(pack.price * months);
    }
  }, [pack, months]);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

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
      // Pour wallet, on utilise USD directement
      setConvertedAmount(totalAmount);
      calculateLocalFees(totalAmount, paymentMethod, 'USD');
    }
  }, [selectedCurrency, totalAmount, paymentMethod]);

  useEffect(() => {
    validateForm();
  }, [paymentMethod, formFields, selectedMobileOption, months, totalAmount]);

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

  useEffect(() => {
    if (open) {
      fetchWalletBalance();
    }
  }, [open]);

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

  const calculateLocalFees = (amount, method, currency) => {
    // Taux de frais par défaut
    let rate = 0.035; // 3.5%
    
    // Ajuster le taux selon la méthode de paiement
    if (method === 'wallet') {
      rate = 0.02; // 2% pour le wallet
    } else if (method === 'credit-card') {
      rate = 0.04; // 4% pour les cartes
    } else if (method === 'mobile-money') {
      rate = 0.035; // 3.5% pour mobile money
    }
    
    const fees = amount * rate;
    setTransactionFees(parseFloat(fees.toFixed(2)));
    setFeePercentage(rate * 100);
  };

  const fetchTransactionFees = async (amount, method, currency) => {
    try {
      const response = await axios.post('/api/transaction-fees/calculate-pack-renewal', {
        amount: amount,
        payment_method: method,
        currency: currency,
        pack_id: pack?.id
      });
      
      if (response.data.status === 'success') {
        setTransactionFees(response.data.data.fee);
        setFeePercentage(response.data.data.fee_percentage);
      } else {
        console.error('Erreur lors de la récupération des frais:', response.data.message);
        // Fallback sur le calcul local
        calculateLocalFees(amount, method, currency);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des frais:', error);
      // Fallback sur le calcul local
      calculateLocalFees(amount, method, currency);
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
        
        // Récupérer les frais de transaction pour le montant converti
        calculateLocalFees(convertedAmt, paymentMethod, selectedCurrency);
      } else {
        console.error('Erreur lors de la conversion:', response.data.message);
        // En cas d'erreur, on utilise le montant original
        setConvertedAmount(totalAmount);
        calculateLocalFees(totalAmount, paymentMethod, 'USD');
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la conversion:', error);
      console.error('Détails de l\'erreur:', error.response?.data || 'Pas de détails disponibles');
      setConvertedAmount(totalAmount);
      calculateLocalFees(totalAmount, paymentMethod, 'USD');
      setLoading(false);
    }
  };

  // Vérifier si le formulaire est valide
  const validateForm = () => {
    // Vérifier si tous les champs requis sont remplis
    let isValid = true;

    // Vérifier les champs selon la méthode de paiement
    if (paymentMethod === 'wallet') {
      // Pour le wallet, vérifier si le solde est suffisant
      isValid = isValid && totalAmount <= walletBalance;
    } else if (paymentMethod === 'credit-card') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (paymentMethod === 'wallet' && totalAmount > walletBalance) {
      setError('Solde insuffisant dans votre wallet');
      setLoading(false);
      return;
    }

    // Vérifier que tous les champs requis sont remplis
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (selectedMethod?.fields) {
      const missingFields = selectedMethod.fields
        .filter(field => field.required && !formFields[field.name])
        .map(field => field.label);

      if (missingFields.length > 0) {
        setError(`Veuillez remplir les champs suivants : ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
    }

    try {
      // Appel à la fonction de renouvellement fournie par le parent
      if (onRenew) {
        await onRenew({
          duration_months: months,
          payment_method: paymentMethod,
          payment_details: formFields,
          amount: paymentMethod === 'wallet' ? totalAmount : convertedAmount,
          currency: paymentMethod === 'wallet' ? 'USD' : selectedCurrency,
          fees: transactionFees
        });
      }
      
      Notification.success('Renouvellement effectué avec succès');
      setLoading(false);
      onClose();
    } catch (error) {
      Notification.error(error.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
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
                    {paymentMethod === 'wallet' ? totalAmount : convertedAmount} {paymentMethod === 'wallet' ? CURRENCIES.USD.symbol : CURRENCIES[selectedCurrency].symbol}
                  </Typography>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                    Frais ({feePercentage.toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    {transactionFees} {paymentMethod === 'wallet' ? CURRENCIES.USD.symbol : CURRENCIES[selectedCurrency].symbol}
                  </Typography>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Typography variant="subtitle1" className="font-bold">
                    Total
                  </Typography>
                  <Typography variant="subtitle1" color="primary" className="font-bold">
                    {(paymentMethod === 'wallet' ? totalAmount : convertedAmount) + transactionFees} {paymentMethod === 'wallet' ? CURRENCIES.USD.symbol : CURRENCIES[selectedCurrency].symbol}
                  </Typography>
                </div>
              </div>
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
                        {method.id === 'wallet' && (
                          <Typography variant="caption" color="textSecondary">
                            Solde disponible: {walletBalance} USD
                          </Typography>
                        )}
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
              {paymentMethod === 'wallet' ? 'Paiement direct depuis votre wallet' : 'Procédez au paiement sécurisé'}
            </Typography>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formIsValid}
              className={`${loading || !formIsValid ? '' : 'pulse'}`}
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
                paymentMethod === 'wallet' ? 'Renouveler maintenant' : 'Procéder au renouvellement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
