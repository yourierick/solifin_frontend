import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Notification from './Notification';
import axios from 'axios';
import { 
  PhoneIcon, 
  CreditCardIcon,
  BanknotesIcon,
  XMarkIcon
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/admin/wallets/withdraw', {
        wallet_id: walletId,
        wallet_type: walletType,
        payment_method: selectedOption,
        ...formData
      });

      if (response.data.success) {
        Notification.success('Demande de retrait envoyée avec succès');
        onClose();
      }
    } catch (error) {
      Notification.error('Erreur lors de la demande de retrait');
    }
  };

  const renderFields = () => {
    if (!selectedOption) return null;

    if (selectedMethod === 'mobileMoney') {
      return (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Numéro de téléphone
            </label>
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

    if (selectedMethod === 'cards') {
      return (
        <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
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
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <BanknotesIcon className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </div>
          <h2 className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Faire un retrait
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-full hover:bg-opacity-75 ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Méthode de paiement
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(paymentMethods).map(([key, method]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedMethod(key);
                  setSelectedOption('');
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
                <span className={selectedMethod === key
                  ? 'text-primary-500'
                  : isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-700'
                }>
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedMethod && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Option de paiement
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className={`block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
              required
            >
              <option value="">Sélectionner une option</option>
              {paymentMethods[selectedMethod].options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {renderFields()}

        {selectedOption && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
            >
              Confirmer le retrait
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 