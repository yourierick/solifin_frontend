import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Notification from './Notification';
import axios from '../utils/axios';
import { 
  PhoneIcon, 
  CreditCardIcon,
  BanknotesIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
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
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  .dark .method-card:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .method-card.selected {
    border-color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .dark .method-card.selected {
    border-color: #60a5fa;
    background-color: rgba(96, 165, 250, 0.15);
  }
  
  /* Masquer les flèches des champs de type number */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
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
  
  .input-field {
    transition: all 0.2s ease;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
    width: 100%;
    background-color: white;
  }
  
  .dark .input-field {
    background-color: #1e283b;
    border-color: #2d3748;
    color: white;
  }
  
  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .dark .input-field:focus {
    border-color: #90caf9;
    box-shadow: 0 0 0 3px rgba(144, 202, 249, 0.1);
  }
  
  .input-label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
  }
  
  .dark .input-label {
    color: #e2e8f0;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background-color: #f3f4f6;
    color: #4b5563;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .dark .btn-secondary {
    background-color: #374151;
    color: #e5e7eb;
  }
  
  .btn-secondary:hover {
    background-color: #e5e7eb;
  }
  
  .dark .btn-secondary:hover {
    background-color: #4b5563;
  }
  
  .modal-overlay {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    inset: 0;
    z-index: 40;
  }
  
  .modal-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    max-height: 90vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .modal-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .modal-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .modal-content::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .dark .modal-content::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
  }
`;

const paymentMethods = {
  mobileMoney: {
    name: 'Mobile Money',
    icon: PhoneIcon,
    options: [
      { id: 'orange-money', name: 'Orange Money' },
      { id: 'airtel-money', name: 'Airtel Money' },
      { id: 'm-pesa', name: 'M-Pesa' },
      { id: 'afrimoney', name: 'Afrimoney' }
    ]
  },
  cards: {
    name: 'Carte bancaire',
    icon: CreditCardIcon
  },
  bankTransfer: {
    name: 'Virement bancaire',
    icon: BanknotesIcon
  },
  moneyTransfer: {
    name: 'Transfert d\'argent',
    icon: ArrowPathIcon,
    options: [
      { id: 'western-union', name: 'Western Union' },
      { id: 'moneygram', name: 'MoneyGram' },
      { id: 'ria', name: 'Ria Money Transfer' },
      { id: 'worldremit', name: 'WorldRemit' }
    ]
  }
};

const calculateFees = async (amount, selectedMethod, walletCurrency) => {
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return { fee: 0, feePercentage: 2.5, feeBreakdown: {}, feeDetails: {} };
  }

  try {
    const response = await axios.get('/api/transaction-fees/withdrawal', {
      params: {
        amount,
        payment_method: selectedMethod === 'mobileMoney' ? 'mobile-money' : selectedMethod === 'cards' ? 'card' : selectedMethod === 'bankTransfer' ? 'bank-transfer' : 'money-transfer',
        currency: walletCurrency // Utiliser la devise du wallet pour le calcul des frais
      }
    });

    if (response.data.status === 'success') {
      return {
        fee: response.data.data.fee,
        feePercentage: response.data.data.fee_percentage || 2.5,
        feeBreakdown: response.data.data.fee_breakdown,
        feeDetails: response.data.data.fee_details
      };
    }
  } catch (error) {
    console.error('Erreur lors du calcul des frais:', error);
    // Fallback sur un calcul simple
    return {
      fee: parseFloat(amount) * 0.025,
      feePercentage: 2.5,
      feeBreakdown: {},
      feeDetails: {}
    };
  }
};

export default function WithdrawalForm({ walletId, walletType, onClose }) {
  const { isDarkMode } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    swiftCode: '',
    bankAddress: '',
    fullName: '',
    address: '',
    city: '',
    country: '',
    idNumber: '',
    idType: 'passport' // passport, id_card, driver_license
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState('USD');
  const [withdrawalFee, setWithdrawalFee] = useState(0);
  const [feePercentage, setFeePercentage] = useState(2.5);
  const [feeBreakdown, setFeeBreakdown] = useState({});
  const [feeDetails, setFeeDetails] = useState({});

  // Récupérer le solde du wallet et les devises disponibles
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await axios.get(`/api/userwallet/data?wallet_id=${walletId}&wallet_type=${walletType}`);
        if (response.data.success) {
          setWalletBalance(parseFloat(response.data.userWallet.balance) || 0);
          setWalletCurrency(response.data.userWallet.currency || 'USD');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données du portefeuille', error);
      }
    };

    fetchWalletData();
  }, [walletId, walletType]);

  // Calculer les frais de retrait lorsque le montant change
  useEffect(() => {
    const calculateFeesAsync = async () => {
      const result = await calculateFees(formData.amount, selectedMethod, walletCurrency);
      setWithdrawalFee(result.fee);
      setFeePercentage(result.feePercentage);
      setFeeBreakdown(result.feeBreakdown);
      setFeeDetails(result.feeDetails);
    };

    if (selectedMethod && formData.amount) {
      calculateFeesAsync();
    }
  }, [formData.amount, selectedMethod, walletCurrency]);

  // Vérifier la validité du formulaire
  useEffect(() => {
    setFormIsValid(isFormValid());
  }, [selectedMethod, selectedOption, formData, otp, otpSent]);

  const isFormValid = () => {
    if (!selectedMethod) return false;
    
    if (selectedMethod === 'mobileMoney') {
      if (!selectedOption || !otpSent) return false;
      return formData.phoneNumber && formData.amount && otp;
    }
    
    if (selectedMethod === 'cards') {
      if (!otpSent) return false;
      return formData.cardHolderName && 
             formData.cardNumber && 
             formData.expiryDate && 
             formData.amount &&
             otp;
    }
  
    if (selectedMethod === 'bankTransfer') {
      if (!otpSent) return false;
      return formData.amount && otp && formData.bankName && formData.accountNumber && formData.accountName && formData.swiftCode && formData.bankAddress;
    }
  
    if (selectedMethod === 'moneyTransfer') {
      if (!selectedOption || !otpSent) return false;
      return formData.amount && otp && formData.fullName && formData.address && formData.city && formData.country && formData.idNumber;
    }
  
    return false;
  };

  const handleSendOtp = async () => {
    try {
      setResendLoading(true);
      const response = await axios.post('/api/withdrawal/send-otp', {
        phone_number: selectedMethod === 'mobileMoney' ? formData.phoneNumber : null,
        payment_method: selectedMethod === 'mobileMoney' ? 'mobile-money' : selectedMethod === 'cards' ? 'card' : selectedMethod === 'bankTransfer' ? 'bank-transfer' : 'money-transfer'
      });

      if (response.data.success) {
        setOtpSent(true);
        Notification.success(response.data.message);
      }
    } catch (error) {
      Notification.error(error.response?.data?.message || 'Erreur lors de l\'envoi du code OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Vérifier si le montant est valide
    if (parseFloat(formData.amount) > walletBalance) {
      Notification.error('Le montant demandé dépasse votre solde disponible');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (selectedMethod === 'mobileMoney') {
        if (!otpSent) {
          await handleSendOtp();
          setLoading(false);
          return;
        }

        response = await axios.post('/api/withdrawal/request', {
          wallet_id: walletId,
          wallet_type: walletType,
          payment_method: selectedOption,
          amount: formData.amount,
          phone_number: formData.phoneNumber,
          otp: otp,
          wallet_currency: walletCurrency
        });
      } else if (selectedMethod === 'cards') {
        if (!otpSent) {
          await handleSendOtp();
          setLoading(false);
          return;
        }

        response = await axios.post('/api/withdrawal/request', {
          wallet_id: walletId,
          wallet_type: walletType,
          payment_method: 'card',
          amount: formData.amount,
          card_details: {
            number: formData.cardNumber,
            expiry: formData.expiryDate,
            holder_name: formData.cardHolderName,
            cvv: formData.cvv
          },
          otp: otp,
          wallet_currency: walletCurrency
        });
      } else if (selectedMethod === 'bankTransfer') {
        if (!otpSent) {
          await handleSendOtp();
          setLoading(false);
          return;
        }

        response = await axios.post('/api/withdrawal/request', {
          wallet_id: walletId,
          wallet_type: walletType,
          payment_method: 'bank-transfer',
          amount: formData.amount,
          bank_details: {
            bank_name: formData.bankName,
            account_number: formData.accountNumber,
            account_name: formData.accountName,
            swift_code: formData.swiftCode,
            bank_address: formData.bankAddress
          },
          otp: otp,
          wallet_currency: walletCurrency
        });
      } else if (selectedMethod === 'moneyTransfer') {
        if (!selectedOption || !otpSent) {
          await handleSendOtp();
          setLoading(false);
          return;
        }

        response = await axios.post('/api/withdrawal/request', {
          wallet_id: walletId,
          wallet_type: walletType,
          payment_method: selectedOption,
          amount: formData.amount,
          transfer_details: {
            full_name: formData.fullName,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            id_number: formData.idNumber,
            id_type: formData.idType
          },
          otp: otp,
          wallet_currency: walletCurrency
        });
      }

      if (response.data.success) {
        Notification.success('Demande de retrait envoyée avec succès');
        onClose();
      }
    } catch (error) {
      Notification.error(error.response?.data?.message || 'Erreur lors de la demande de retrait');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation spéciale pour le champ montant
    if (name === 'amount') {
      // Permet uniquement les nombres avec jusqu'à 2 décimales
      const regex = /^[0-9]*\.?[0-9]{0,2}$/;
      if (value === '' || regex.test(value)) {
        // Vérifier que le montant ne dépasse pas le solde
        if (value && parseFloat(value) > walletBalance) {
          Notification.warning('Le montant dépasse votre solde disponible');
        }
        
        setFormData({
          ...formData,
          [name]: value
        });
        
        // Calculer les frais si le montant est valide et supérieur à 0
        if (value && parseFloat(value) > 0) {
          calculateFees(formData.amount, selectedMethod, walletCurrency).then((result) => {
            setWithdrawalFee(result.fee);
            setFeePercentage(result.feePercentage);
            setFeeBreakdown(result.feeBreakdown);
            setFeeDetails(result.feeDetails);
          });
        }
      }
      return;
    }
    
    // Validation pour le numéro de carte
    if (name === 'cardNumber') {
      // Permettre uniquement les chiffres et formater avec des espaces tous les 4 chiffres
      const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (cleaned.length > 16) return;
      
      // Formater avec des espaces tous les 4 chiffres
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Validation pour la date d'expiration
    if (name === 'expiryDate') {
      // Format MM/YY
      const cleaned = value.replace(/[^0-9]/gi, '');
      if (cleaned.length > 4) return;
      
      let formatted = cleaned;
      if (cleaned.length > 2) {
        formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
      }
      
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Validation pour le CVV
    if (name === 'cvv') {
      const cleaned = value.replace(/[^0-9]/gi, '');
      if (cleaned.length > 3) return;
      setFormData({ ...formData, [name]: cleaned });
      return;
    }
    
    // Pour les autres champs
    setFormData({ ...formData, [name]: value });
  };

  const renderFields = () => {
    if (!selectedMethod) return null;

    if (selectedMethod === 'mobileMoney') {
      return (
        <div className="space-y-4 fade-in">
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Entrez votre numéro de téléphone"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Assurez-vous que ce numéro est enregistré pour {selectedOption ? paymentMethods.mobileMoney.options.find(o => o.id === selectedOption)?.name : 'Mobile Money'}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-2">
                {CURRENCIES[walletCurrency]?.symbol || '$'}
              </span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field flex-1"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solde disponible: {CURRENCIES[walletCurrency]?.symbol || '$'}{walletBalance.toFixed(2)} {walletCurrency}
            </p>
          </div>
          
          {/* Détails des frais */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Détails des frais
              </h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de base:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.baseFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de traitement:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.processingFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais réseau:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.networkFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1 pt-1"></div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total des frais ({feePercentage.toFixed(1)}%):</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{withdrawalFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Montant net à recevoir:</span>
                  <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(parseFloat(formData.amount) - withdrawalFee).toFixed(2)}
                  </span>
                </div>
              </div>
              {feeDetails.note && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">Note:</span> {feeDetails.note}
                </p>
              )}
            </div>
          )}
          
          {otpSent && (
            <div className="mb-4 fade-in">
              <label className="input-label dark:text-gray-200">
                Code OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Entrez le code reçu par SMS"
                className="input-field"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Code envoyé au {formData.phoneNumber}
                </p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendLoading}
                  className="text-primary-500 text-sm hover:underline focus:outline-none"
                >
                  {resendLoading ? (
                    <span className="flex items-center">
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      Envoi...
                    </span>
                  ) : (
                    'Renvoyer le code'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {!otpSent && formData.phoneNumber && formData.amount && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendLoading || !formData.phoneNumber || !formData.amount}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Envoi du code...
                  </span>
                ) : (
                  'Recevoir le code OTP'
                )}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'cards') {
      return (
        <div className="space-y-4 fade-in">
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Nom du titulaire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={handleInputChange}
              placeholder="Nom complet sur la carte"
              className="input-field"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Numéro de carte <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="XXXX XXXX XXXX XXXX"
                className="input-field pl-10"
                required
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label dark:text-gray-200">
                Date d'expiration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label dark:text-gray-200">
                CVV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-2">
                {CURRENCIES[walletCurrency]?.symbol || '$'}
              </span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field flex-1"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solde disponible: {CURRENCIES[walletCurrency]?.symbol || '$'}{walletBalance.toFixed(2)} {walletCurrency}
            </p>
          </div>
          
          {/* Détails des frais */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Détails des frais
              </h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de base:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.baseFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de traitement:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.processingFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais réseau:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.networkFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1 pt-1"></div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total des frais ({feePercentage.toFixed(1)}%):</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{withdrawalFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Montant net à recevoir:</span>
                  <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(parseFloat(formData.amount) - withdrawalFee).toFixed(2)}
                  </span>
                </div>
              </div>
              {feeDetails.note && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">Note:</span> {feeDetails.note}
                </p>
              )}
            </div>
          )}
          
          {otpSent && (
            <div className="mb-4 fade-in">
              <label className="input-label dark:text-gray-200">
                Code OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Entrez le code reçu par email"
                className="input-field"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Code envoyé à votre email
                </p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendLoading}
                  className="text-primary-500 text-sm hover:underline focus:outline-none"
                >
                  {resendLoading ? (
                    <span className="flex items-center">
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      Envoi...
                    </span>
                  ) : (
                    'Renvoyer le code'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {!otpSent && formData.cardHolderName && formData.cardNumber && formData.expiryDate && formData.cvv && formData.amount && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendLoading || !formData.cardHolderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.amount}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Envoi du code...
                  </span>
                ) : (
                  'Recevoir le code OTP'
                )}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'bankTransfer') {
      return (
        <div className="space-y-4 fade-in">
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Nom de la banque <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              placeholder="Nom de la banque"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Numéro de compte <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              placeholder="Numéro de compte"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Nom du titulaire du compte <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleInputChange}
              placeholder="Nom du titulaire du compte"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Code SWIFT <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="swiftCode"
              value={formData.swiftCode}
              onChange={handleInputChange}
              placeholder="Code SWIFT"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Adresse de la banque <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bankAddress"
              value={formData.bankAddress}
              onChange={handleInputChange}
              placeholder="Adresse de la banque"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-2">
                {CURRENCIES[walletCurrency]?.symbol || '$'}
              </span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field flex-1"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solde disponible: {CURRENCIES[walletCurrency]?.symbol || '$'}{walletBalance.toFixed(2)} {walletCurrency}
            </p>
          </div>
          
          {/* Détails des frais */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Détails des frais
              </h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de base:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.baseFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de traitement:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.processingFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais réseau:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.networkFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1 pt-1"></div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total des frais ({feePercentage.toFixed(1)}%):</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{withdrawalFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Montant net à recevoir:</span>
                  <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(parseFloat(formData.amount) - withdrawalFee).toFixed(2)}
                  </span>
                </div>
              </div>
              {feeDetails.note && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">Note:</span> {feeDetails.note}
                </p>
              )}
            </div>
          )}
          
          {otpSent && (
            <div className="mb-4 fade-in">
              <label className="input-label dark:text-gray-200">
                Code OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Entrez le code reçu par SMS"
                className="input-field"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Code envoyé au {formData.phoneNumber}
                </p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendLoading}
                  className="text-primary-500 text-sm hover:underline focus:outline-none"
                >
                  {resendLoading ? (
                    <span className="flex items-center">
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      Envoi...
                    </span>
                  ) : (
                    'Renvoyer le code'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {!otpSent && formData.bankName && formData.accountNumber && formData.accountName && formData.swiftCode && formData.bankAddress && formData.amount && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendLoading || !formData.bankName || !formData.accountNumber || !formData.accountName || !formData.swiftCode || !formData.bankAddress || !formData.amount}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Envoi du code...
                  </span>
                ) : (
                  'Recevoir le code OTP'
                )}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'moneyTransfer') {
      return (
        <div className="space-y-4 fade-in">
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nom complet"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Adresse"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Ville <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Ville"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Pays <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Pays"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Numéro d'identité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              placeholder="Numéro d'identité"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Type d'identité <span className="text-red-500">*</span>
            </label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="passport">Passeport</option>
              <option value="id_card">Carte d'identité</option>
              <option value="driver_license">Permis de conduire</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="input-label dark:text-gray-200">
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-2">
                {CURRENCIES[walletCurrency]?.symbol || '$'}
              </span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field flex-1"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solde disponible: {CURRENCIES[walletCurrency]?.symbol || '$'}{walletBalance.toFixed(2)} {walletCurrency}
            </p>
          </div>
          
          {/* Détails des frais */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Détails des frais
              </h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de base:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.baseFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais de traitement:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.processingFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Frais réseau:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(feeBreakdown.networkFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1 pt-1"></div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total des frais ({feePercentage.toFixed(1)}%):</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{withdrawalFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Montant net à recevoir:</span>
                  <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>
                    {CURRENCIES[walletCurrency]?.symbol || '$'}{(parseFloat(formData.amount) - withdrawalFee).toFixed(2)}
                  </span>
                </div>
              </div>
              {feeDetails.note && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">Note:</span> {feeDetails.note}
                </p>
              )}
            </div>
          )}
          
          {otpSent && (
            <div className="mb-4 fade-in">
              <label className="input-label dark:text-gray-200">
                Code OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Entrez le code reçu par SMS"
                className="input-field"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Code envoyé au {formData.phoneNumber}
                </p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendLoading}
                  className="text-primary-500 text-sm hover:underline focus:outline-none"
                >
                  {resendLoading ? (
                    <span className="flex items-center">
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      Envoi...
                    </span>
                  ) : (
                    'Renvoyer le code'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {!otpSent && formData.fullName && formData.address && formData.city && formData.country && formData.idNumber && formData.amount && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendLoading || !formData.fullName || !formData.address || !formData.city || !formData.country || !formData.idNumber || !formData.amount}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Envoi du code...
                  </span>
                ) : (
                  'Recevoir le code OTP'
                )}
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderPaymentMethodCards = () => {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(paymentMethods).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => {
              setSelectedMethod(method);
              setSelectedOption('');
              setOtpSent(false);
              setOtp('');
            }}
            className={`method-card flex items-center gap-3 ${
              selectedMethod === method ? 'selected' : ''
            }`}
          >
            {React.createElement(paymentMethods[method].icon, {
              className: `h-5 w-5 ${
                selectedMethod === method
                  ? 'text-primary-500'
                  : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`
            })}
            <span className={`text-sm font-medium ${
              selectedMethod === method
                ? 'text-primary-500'
                : isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-700'
            }`}>
              {paymentMethods[method].name}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <style>{customStyles}</style>
      <div className="modal-overlay">
        <div className="modal-container">
          <div className={`inline-block align-bottom rounded-lg text-left shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="modal-content">
              {/* En-tête avec dégradé */}
              <div className={`sticky top-0 z-10 px-6 py-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Retrait de fonds
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <XMarkIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} />
                  </button>
                </div>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Retirez des fonds de votre portefeuille {walletType === 'main' ? 'principal' : 'secondaire'}
                </p>
                <div className={`mt-2 p-3 rounded-md ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white bg-opacity-70'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Solde disponible:
                    </span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {CURRENCIES[walletCurrency]?.symbol || '$'}{walletBalance.toFixed(2)} {walletCurrency}
                    </span>
                  </div>
                </div>
              </div>

              <form id="withdrawalForm" onSubmit={handleSubmit} className="px-6 py-4">
                {/* Sélection de la méthode de paiement */}
                <div className="mb-6 slide-in">
                  <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Méthode de retrait
                  </h4>
                  {renderPaymentMethodCards()}
                </div>

                {/* Options de Mobile Money */}
                {selectedMethod === 'mobileMoney' && (
                  <div className="mb-6 slide-in">
                    <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sélectionnez un opérateur
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods[selectedMethod].options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedOption(option.id)}
                          className={`method-card flex items-center gap-3 ${
                            selectedOption === option.id ? 'selected' : ''
                          }`}
                        >
                          <PhoneIcon className={`h-5 w-5 ${
                            selectedOption === option.id
                              ? 'text-primary-500'
                              : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            selectedOption === option.id
                              ? 'text-primary-500'
                              : isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                          }`}>
                            {option.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options de Money Transfer */}
                {selectedMethod === 'moneyTransfer' && (
                  <div className="mb-6 slide-in">
                    <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sélectionnez un service
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods[selectedMethod].options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedOption(option.id)}
                          className={`method-card flex items-center gap-3 ${
                            selectedOption === option.id ? 'selected' : ''
                          }`}
                        >
                          <ArrowPathIcon className={`h-5 w-5 ${
                            selectedOption === option.id
                              ? 'text-primary-500'
                              : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            selectedOption === option.id
                              ? 'text-primary-500'
                              : isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                          }`}>
                            {option.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Champs du formulaire */}
                {selectedMethod && (
                  <div className="mb-6 slide-in">
                    {renderFields()}
                  </div>
                )}
                
                {/* Résumé de la transaction */}
                {selectedMethod && formData.amount && parseFloat(formData.amount) > 0 && (
                  <div className={`mt-6 p-4 rounded-lg summary-card ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Résumé de la transaction
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Montant prélevé:</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {CURRENCIES[walletCurrency]?.symbol || '$'}{parseFloat(formData.amount).toFixed(2)} {walletCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Frais ({feePercentage.toFixed(1)}%):</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {CURRENCIES[walletCurrency]?.symbol || '$'}{withdrawalFee.toFixed(2)} {walletCurrency}
                        </span>
                      </div>
                      <div className="border-t border-dashed my-2"></div>
                      <div className="flex justify-between">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Montant à recevoir:</span>
                        <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>
                          {CURRENCIES[walletCurrency]?.symbol || '$'}{(parseFloat(formData.amount) - withdrawalFee).toFixed(2)} {walletCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              <div className={`sticky bottom-0 z-10 p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    form="withdrawalForm"
                    disabled={loading || !formIsValid}
                    className={`btn-primary ${formIsValid && !loading ? 'pulse' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </span>
                    ) : (
                      'Confirmer le retrait'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}