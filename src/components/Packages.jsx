import { useState, useEffect } from 'react';
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

        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {packs.map((pack) => (
            <motion.div
              key={pack.id}
              variants={itemVariants}
              className={`rounded-lg shadow-lg overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
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
                      <CheckIcon className={`h-6 w-6 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                      <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {avantage}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-8 w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  onClick={() => {
                    if (!user) {
                      navigate('/register');
                    } else {
                      if (user.is_admin) {
                        navigate('/admin/dashboard');
                      } else {
                        navigate('/user/packs');
                      }
                    }
                  }}
                >
                  Souscrire Maintenant
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}