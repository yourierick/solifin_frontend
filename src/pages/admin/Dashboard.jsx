import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  UsersIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Notification from '../../components/Notification';

const stats = [
  {
    name: 'Utilisateurs totaux',
    value: '2,451',
    icon: UsersIcon,
    change: '+12%',
    changeType: 'positive',
  },
  {
    name: 'Transactions du mois',
    value: '€45,241',
    icon: CurrencyEuroIcon,
    change: '+23.1%',
    changeType: 'positive',
  },
  {
    name: 'Nouveaux parrainages',
    value: '156',
    icon: UserGroupIcon,
    change: '+8.2%',
    changeType: 'positive',
  },
  {
    name: 'Taux de conversion',
    value: '24.5%',
    icon: ArrowTrendingUpIcon,
    change: '+2.3%',
    changeType: 'positive',
  },
];

const recentTransactions = [
  {
    id: 1,
    user: 'Jean Dupont',
    amount: '€1,200',
    status: 'completed',
    date: '2024-02-19',
  },
  {
    id: 2,
    user: 'Marie Martin',
    amount: '€850',
    status: 'pending',
    date: '2024-02-19',
  },
  {
    id: 3,
    user: 'Pierre Durand',
    amount: '€2,000',
    status: 'completed',
    date: '2024-02-18',
  },
  {
    id: 4,
    user: 'Sophie Bernard',
    amount: '€1,500',
    status: 'failed',
    date: '2024-02-18',
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
    case 'failed':
      return isDarkMode
        ? 'bg-red-900 text-red-300'
        : 'bg-red-100 text-red-800';
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
    case 'failed':
      return 'Échoué';
    default:
      return status;
  }
};

export default function Dashboard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div>
        <h1 className={`text-2xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Tableau de bord
        </h1>
        <p className={`mt-2 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-700'
        }`}>
          Vue d'ensemble des statistiques et activités récentes
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`overflow-hidden rounded-lg px-4 py-5 shadow sm:p-6 ${
              isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-6 w-6 ${
                  isDarkMode ? 'text-primary-400' : 'text-primary-600'
                }`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium text-gray-500 truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className={`text-2xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive'
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transactions récentes */}
      <div className={`shadow rounded-lg ${
        isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
      }`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium leading-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Transactions récentes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Utilisateur
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Montant
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Statut
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className={
                  isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                }>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {transaction.user}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status, isDarkMode)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {transaction.date}
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