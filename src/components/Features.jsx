import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    name: 'Gains Exponentiels',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Communauté Solidaire',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    icon: UserGroupIcon,
  },
  {
    name: 'Croissance Rapide',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    icon: ChartBarIcon,
  },
  {
    name: 'Sécurité Garantie',
    description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Innovation Continue',
    description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    icon: RocketLaunchIcon,
  },
  {
    name: 'Portée Internationale',
    description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.',
    icon: GlobeAltIcon,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  const { isDarkMode } = useTheme();

  return (
    <section id="features" className={`section-padding ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className={`heading-secondary mb-4 ${isDarkMode ? 'text-white' : ''}`}>
            Pourquoi Choisir <span className={isDarkMode ? 'text-primary-400' : 'text-primary-600'}>SOLIFIN</span> ?
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Découvrez les avantages uniques qui font de notre système MLM la référence dans le domaine du marketing de réseau.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              variants={itemVariants}
              className={`p-6 rounded-xl transition-shadow ${
                isDarkMode 
                  ? 'bg-gray-800 shadow-lg hover:shadow-gray-700/50' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="flex items-center mb-4">
                <feature.icon className={`h-8 w-8 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                <h3 className={`ml-3 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.name}
                </h3>
              </div>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}