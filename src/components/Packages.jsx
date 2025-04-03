import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import publicAxios from '../utils/publicAxios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const categoryTitleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const categoryLineVariants = {
  hidden: { width: 0 },
  visible: {
    width: "100%",
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

// Définition des couleurs par catégorie - plus distinctes
const categoryColors = {
  // Couleurs pour le mode clair
  light: {
    default: { bg: 'bg-white', border: 'border-gray-200', highlight: 'bg-green-600', hover: 'hover:bg-green-700', icon: 'text-green-500', accent: 'text-green-600', gradientFrom: 'from-green-500', gradientTo: 'to-green-600' },
    'Débutant': { bg: 'bg-blue-100', border: 'border-blue-300', highlight: 'bg-blue-600', hover: 'hover:bg-blue-700', icon: 'text-blue-500', accent: 'text-blue-600', gradientFrom: 'from-blue-500', gradientTo: 'to-blue-600' },
    'Intermédiaire': { bg: 'bg-purple-100', border: 'border-purple-300', highlight: 'bg-purple-600', hover: 'hover:bg-purple-700', icon: 'text-purple-500', accent: 'text-purple-600', gradientFrom: 'from-purple-500', gradientTo: 'to-purple-600' },
    'Expert': { bg: 'bg-amber-100', border: 'border-amber-300', highlight: 'bg-amber-600', hover: 'hover:bg-amber-700', icon: 'text-amber-500', accent: 'text-amber-600', gradientFrom: 'from-amber-500', gradientTo: 'to-amber-600' },
    'Premium': { bg: 'bg-indigo-100', border: 'border-indigo-300', highlight: 'bg-indigo-600', hover: 'hover:bg-indigo-700', icon: 'text-indigo-500', accent: 'text-indigo-600', gradientFrom: 'from-indigo-500', gradientTo: 'to-indigo-600' },
    'VIP': { bg: 'bg-rose-100', border: 'border-rose-300', highlight: 'bg-rose-600', hover: 'hover:bg-rose-700', icon: 'text-rose-500', accent: 'text-rose-600', gradientFrom: 'from-rose-500', gradientTo: 'to-rose-600' }
  },
  // Couleurs pour le mode sombre
  dark: {
    default: { bg: 'bg-gray-800', border: 'border-gray-700', highlight: 'bg-green-600', hover: 'hover:bg-green-700', icon: 'text-green-400', accent: 'text-green-400', gradientFrom: 'from-green-600', gradientTo: 'to-green-700' },
    'Débutant': { bg: 'bg-blue-900/40', border: 'border-blue-700', highlight: 'bg-blue-600', hover: 'hover:bg-blue-700', icon: 'text-blue-400', accent: 'text-blue-400', gradientFrom: 'from-blue-600', gradientTo: 'to-blue-700' },
    'Intermédiaire': { bg: 'bg-purple-900/40', border: 'border-purple-700', highlight: 'bg-purple-600', hover: 'hover:bg-purple-700', icon: 'text-purple-400', accent: 'text-purple-400', gradientFrom: 'from-purple-600', gradientTo: 'to-purple-700' },
    'Expert': { bg: 'bg-amber-900/40', border: 'border-amber-700', highlight: 'bg-amber-600', hover: 'hover:bg-amber-700', icon: 'text-amber-400', accent: 'text-amber-400', gradientFrom: 'from-amber-600', gradientTo: 'to-amber-700' },
    'Premium': { bg: 'bg-indigo-900/40', border: 'border-indigo-700', highlight: 'bg-indigo-600', hover: 'hover:bg-indigo-700', icon: 'text-indigo-400', accent: 'text-indigo-400', gradientFrom: 'from-indigo-600', gradientTo: 'to-indigo-700' },
    'VIP': { bg: 'bg-rose-900/40', border: 'border-rose-700', highlight: 'bg-rose-600', hover: 'hover:bg-rose-700', icon: 'text-rose-400', accent: 'text-rose-400', gradientFrom: 'from-rose-600', gradientTo: 'to-rose-700' }
  }
};

export default function Packages() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await publicAxios.get('/api/packs');
        console.log('Response data:', response.data); // Pour déboguer
        if (response.data && response.data.data) {
          setPacks(response.data.data.filter(pack => pack.status));
        } else {
          console.error('Format de réponse invalide:', response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des packs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);
  
  // Organiser les packs par catégorie
  const packsByCategory = useMemo(() => {
    const grouped = {};
    packs.forEach(pack => {
      const category = pack.categorie || 'Autre';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(pack);
    });
    return grouped;
  }, [packs]);
  
  // Obtenir les couleurs en fonction du mode (clair/sombre)
  const getColorScheme = (category) => {
    const mode = isDarkMode ? 'dark' : 'light';
    return categoryColors[mode][category] || categoryColors[mode].default;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <section id="packages" className={`section-padding ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Nos packs d'investissement
          </h2>
          <p className={`mt-4 text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Choisissez le pack qui correspond à vos objectifs
          </p>
        </div>

        <div className="mt-16 space-y-12">
          {Object.entries(packsByCategory).map(([category, categoryPacks]) => (
            <div key={category} className="space-y-6">
              <motion.div 
                className="flex flex-col items-center justify-center mb-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.h3 
                  className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} inline-block px-8 ${getColorScheme(category).accent}`}
                  variants={categoryTitleVariants}
                >
                  <span style={{ textTransform: 'capitalize' }}>{category}</span>
                </motion.h3>
                <motion.div 
                  className={`h-1 mt-2 rounded-full bg-gradient-to-r ${getColorScheme(category).gradientFrom} ${getColorScheme(category).gradientTo}`}
                  variants={categoryLineVariants}
                  style={{ originX: 0.5 }}
                />
              </motion.div>
              
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {categoryPacks.map((pack) => {
                  const colorScheme = getColorScheme(category);
                  return (
                    <motion.div
                      key={pack.id}
                      variants={itemVariants}
                      className={`rounded-lg shadow-lg overflow-hidden border-2 ${colorScheme.bg} ${colorScheme.border} transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}
                    >
                      <div className="p-6">
                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {pack.name}
                        </h3>
                        <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          À partir de
                        </p>
                        <p className={`mt-2 text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {pack.price}$/mois
                        </p>
                        <ul className="mt-6 space-y-4">
                          {pack.avantages && pack.avantages.map((avantage, index) => (
                            <li key={index} className="flex items-start">
                              <CheckIcon className={`h-6 w-6 flex-shrink-0 ${getColorScheme(category).icon}`} />
                              <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {avantage}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`mt-8 w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 text-white ${colorScheme.highlight} ${colorScheme.hover}`}
                          onClick={() => {
                            if (!user) {
                              navigate('/register');
                            } else {
                              if (user.is_admin) {
                                navigate('/admin/mespacks');
                              } else {
                                navigate('/dashboard/buypacks');
                              }
                            }
                          }}
                        >
                          Souscrire Maintenant
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}