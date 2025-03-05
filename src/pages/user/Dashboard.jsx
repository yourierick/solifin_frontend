import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import DashboardCarousel from '../../components/DashboardCarousel';
import {
  BanknotesIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Solde actuel',
    value: '€2,450',
    icon: BanknotesIcon,
    change: '+€350',
    changeType: 'positive',
  },
  {
    name: 'Filleuls actifs',
    value: '12',
    icon: UsersIcon,
    change: '+2',
    changeType: 'positive',
  },
  {
    name: 'Gains du mois',
    value: '€850',
    icon: ArrowTrendingUpIcon,
    change: '+15%',
    changeType: 'positive',
  },
  {
    name: 'Points bonus',
    value: '450',
    icon: GiftIcon,
    change: '+50',
    changeType: 'positive',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'transaction',
    description: 'Bonus de parrainage reçu',
    amount: '+€200',
    date: '2024-02-19',
    status: 'completed',
  },
  {
    id: 2,
    type: 'referral',
    description: 'Nouveau filleul : Marie Martin',
    amount: null,
    date: '2024-02-18',
    status: 'pending',
  },
  {
    id: 3,
    type: 'transaction',
    description: 'Commission mensuelle',
    amount: '+€150',
    date: '2024-02-17',
    status: 'completed',
  },
  {
    id: 4,
    type: 'bonus',
    description: 'Points bonus gagnés',
    amount: '+50 pts',
    date: '2024-02-16',
    status: 'completed',
  },
];

const recentAds = [
  {
    id: 1,
    title: "Promotion exceptionnelle",
    type: "Publicité",
    status: "active",
    views: 245,
    date: "2024-02-20"
  },
  {
    id: 2,
    title: "Nouvelle opportunité",
    type: "Opportunité",
    status: "pending",
    views: 120,
    date: "2024-02-19"
  },
  {
    id: 3,
    title: "Poste de développeur",
    type: "Emploi",
    status: "active",
    views: 180,
    date: "2024-02-18"
  }
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

export default function UserDashboard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div>
        <h1 className={`text-2xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Mon tableau de bord
        </h1>
        <p className={`mt-2 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-700'
        }`}>
          Bienvenue ! Voici un aperçu de votre activité
        </p>
      </div>

      {/* Carrousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardCarousel />
      </motion.div>

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
                  <dt className={`text-sm font-medium truncate ${
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

      {/* Activités récentes */}
      <div className={`shadow rounded-lg ${
        isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow-gray-200'
      }`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium leading-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Activités récentes
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
              {recentActivities.map((activity) => (
                <tr key={activity.id} className={
                  isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                }>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activity.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {activity.amount || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status, isDarkMode)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {activity.date}
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