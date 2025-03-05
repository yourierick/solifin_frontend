import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const faqs = [
  {
    question: 'Comment fonctionne le système de parrainage ?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
  },
  {
    question: 'Quels sont les différents niveaux de commission ?',
    answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.',
  },
  {
    question: 'Comment puis-je retirer mes gains ?',
    answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
  },
  {
    question: 'Y a-t-il des frais cachés ?',
    answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus.',
  },
  {
    question: 'Quelle est la durée minimale d\'engagement ?',
    answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.',
  },
  {
    question: 'Comment puis-je contacter le support ?',
    answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { isDarkMode } = useTheme();

  return (
    <section id="faq" className={`section-padding ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className={`heading-secondary mb-4 ${isDarkMode ? 'text-white' : ''}`}>
            Questions <span className={isDarkMode ? 'text-primary-400' : 'text-primary-600'}>Fréquentes</span>
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Trouvez les réponses aux questions les plus courantes sur SOLIFIN.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg overflow-hidden ${
                isDarkMode 
                  ? 'bg-gray-800 shadow-lg' 
                  : 'bg-white shadow-md'
              }`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className={`w-full px-6 py-4 text-left flex justify-between items-center transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className={`h-5 w-5 ${
                    isDarkMode ? 'text-primary-400' : 'text-primary-600'
                  }`} />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`px-6 py-4 ${
                      isDarkMode 
                        ? 'text-gray-300 border-t border-gray-700' 
                        : 'text-gray-600 border-t border-gray-100'
                    }`}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Vous ne trouvez pas la réponse que vous cherchez ?{' '}
            <a href="#contact" className={`font-medium ${
              isDarkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
            }`}>
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}