import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  CreditCardIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const paymentMethods = [
  {
    id: 'orange-money',
    name: 'Orange Money',
    icon: PhoneIcon,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'airtel-money',
    name: 'Airtel Money',
    icon: PhoneIcon,
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'm-pesa',
    name: 'M-Pesa',
    icon: PhoneIcon,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'visa',
    name: 'Visa',
    icon: CreditCardIcon,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: CreditCardIcon,
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: CurrencyDollarIcon,
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'credit-card',
    name: 'Carte de crédit',
    icon: CreditCardIcon,
    color: 'from-gray-600 to-gray-700',
  },
];

const recentCommissions = [
  {
    id: 1,
    description: 'Commission de parrainage - Jean Dupont',
    amount: '€50.00',
    date: '2024-02-20',
    status: 'completed',
  },
  {
    id: 2,
    description: 'Commission mensuelle',
    amount: '€150.00',
    date: '2024-02-19',
    status: 'completed',
  },
  {
    id: 3,
    description: 'Bonus performance',
    amount: '€75.00',
    date: '2024-02-18',
    status: 'pending',
  },
  {
    id: 4,
    description: 'Commission de parrainage - Marie Martin',
    amount: '€50.00',
    date: '2024-02-17',
    status: 'completed',
  },
];

const getStatusColor = (status, isDarkMode) => {
  switch (status) {
    case 'completed':
      return isDarkMode
        ? 'bg-green-900 text-green-300'
        : 'bg-green-100 text-green-800';
    case 'pending':
      return isDarkMode
        ? 'bg-yellow-900 text-yellow-300'
        : 'bg-yellow-100 text-yellow-800';
    default:
      return isDarkMode
        ? 'bg-gray-700 text-gray-300'
        : 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Complété';
    case 'pending':
      return 'En attente';
    default:
      return status;
  }
};

export default function Wallet() {
  const { isDarkMode } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedMethod || !amount) return;

    setIsLoading(true);
    // Simulation d'une requête API
    setTimeout(() => {
      setIsLoading(false);
      setSelectedMethod(null);
      setAmount('');
      // Ajouter une notification de succès ici
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className={`text-2xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Mon portefeuille
        </h1>
        <p className={`mt-2 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-700'
        }`}>
          Gérez vos gains et effectuez des retraits
        </p>
      </div>

      {/* Solde */}
      <div className={`p-6 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Solde disponible
            </p>
            <h2 className={`mt-1 text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              €2,450.00
            </h2>
          </div>
          <button
            onClick={() => window.location.reload()}
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Options de retrait */}
      <div className={`p-6 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Effectuer un retrait
        </h3>
        
        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } ${
                  selectedMethod === method.id
                    ? `border-primary-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`
                    : `border-transparent ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${method.color}`}>
                    <method.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {method.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="amount"
                className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                Montant à retirer
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    €
                  </span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`block w-full pl-7 pr-12 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!selectedMethod || !amount || isLoading}
                className={`w-full sm:w-auto px-4 py-2 rounded-md font-medium text-white ${
                  !selectedMethod || !amount || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  'Retirer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tableau des commissions récentes */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Dernières commissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Description
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Montant
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {recentCommissions.map((commission) => (
                <tr
                  key={commission.id}
                  className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {commission.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {commission.amount}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {commission.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusColor(commission.status, isDarkMode)
                    }`}>
                      {getStatusText(commission.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 