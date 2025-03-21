import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Notification from './Notification';
import axios from 'axios';
import { 
  PhoneIcon, 
  CreditCardIcon,
  BanknotesIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

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
    name: 'Cartes',
    icon: CreditCardIcon,
    options: [
      { id: 'visa', name: 'Visa' },
      { id: 'mastercard', name: 'Mastercard' },
      { id: 'credit-card', name: 'Carte de crédit' }
    ]
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
    cardHolderName: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const isFormValid = () => {
    if (!selectedMethod || !selectedOption) return false;
    
    if (selectedMethod === 'mobileMoney') {
      if (!otpSent) return false;
      return formData.phoneNumber && formData.amount && otp;
    }
    
    if (selectedMethod === 'cards') {
      return formData.cardHolderName && 
             formData.cardNumber && 
             formData.expiryDate && 
             formData.cvv && 
             formData.amount;
    }
    
    return false;
  };

  const handleSendOtp = async () => {
    try {
      setResendLoading(true);
      const response = await axios.post('/api/withdrawal/send-otp', {
        phone_number: formData.phoneNumber
      });

      if (response.data.success) {
        setOtpSent(true);
        Notification.success(response.data.message);
      }
    } catch (error) {
      Notification.error('Erreur lors de l\'envoi du code OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (selectedMethod === 'mobileMoney') {
        if (!otpSent) {
          await handleSendOtp();
          return;
        }

        response = await axios.post('/api/withdrawal/request', {
          wallet_id: walletId,
          wallet_type: walletType,
          payment_method: selectedOption,
          amount: formData.amount,
          phone_number: formData.phoneNumber,
          otp: otp
        });
      } else {
        response = await axios.post('/api/withdrawal/request', {
          wallet_id: walletId,
          wallet_type: walletType,
          payment_method: selectedOption,
          amount: formData.amount,
          card_details: {
            number: formData.cardNumber,
            expiry: formData.expiryDate,
            cvv: formData.cvv,
            holder_name: formData.cardHolderName
          }
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

  const renderFields = () => {
    if (!selectedOption) return null;

    if (selectedMethod === 'mobileMoney') {
      return (
        <div className="space-y-3">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Numéro de téléphone
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`mt-1 block w-full rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
                placeholder="+123 456789"
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!formData.phoneNumber || resendLoading}
                className={`mt-1 px-3 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {resendLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  'Envoyer OTP'
                )}
              </button>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Montant
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
          </div>
          {otpSent && (
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Code OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`mt-1 block w-full rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Entrez le code reçu"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendLoading}
                  className={`mt-1 px-3 py-2 rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <ArrowPathIcon className={`h-5 w-5 ${resendLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'cards') {
      return (
        <div className="space-y-3">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Nom du titulaire
            </label>
            <input
              type="text"
              value={formData.cardHolderName}
              onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Numéro de carte
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Date d'expiration
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className={`mt-1 block w-full rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                className={`mt-1 block w-full rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
                placeholder="123"
                required
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Montant
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`relative w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden max-h-[80vh] flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <BanknotesIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
            <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Faire un retrait
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-75 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form id="withdrawalForm" onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex-1">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Méthode de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(paymentMethods).map(([key, method]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(key);
                    setSelectedOption('');
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedMethod === key
                      ? isDarkMode
                        ? 'bg-gray-700 border-primary-500'
                        : 'bg-primary-50 border-primary-500'
                      : isDarkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <method.icon className={`h-5 w-5 ${
                    selectedMethod === key
                      ? 'text-primary-500'
                      : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedMethod === key
                      ? 'text-primary-500'
                      : isDarkMode
                        ? 'text-gray-300'
                        : 'text-gray-700'
                  }`}>
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedMethod && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {paymentMethods[selectedMethod].name}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods[selectedMethod].options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedOption === option.id
                        ? isDarkMode
                          ? 'bg-gray-700 border-primary-500'
                          : 'bg-primary-50 border-primary-500'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
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

          {renderFields()}
        </form>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              form="withdrawalForm"
              disabled={loading || !isFormValid()}
              className={`px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'cursor-wait' : ''
              }`}
            >
              {loading ? 'Traitement...' : 'Soumettre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}