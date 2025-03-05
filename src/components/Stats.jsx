import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useTheme } from '../contexts/ThemeContext';

const stats = [
  {
    number: 50000,
    label: 'Membres Actifs',
    suffix: '+',
  },
  {
    number: 1000000,
    label: 'Euros Distribués',
    prefix: '€',
  },
  {
    number: 150,
    label: 'Pays Représentés',
    suffix: '+',
  },
  {
    number: 98,
    label: 'Taux de Satisfaction',
    suffix: '%',
  },
];

export default function Stats() {
  const { isDarkMode } = useTheme();

  return (
    <section className={`py-16 ${
      isDarkMode ? 'bg-primary-900/90' : 'bg-primary-600/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-primary-100' : 'text-white'
          }`}>
            SOLIFIN en Chiffres
          </h2>
          <div className={`h-1 w-20 mx-auto rounded-full ${
            isDarkMode ? 'bg-primary-400' : 'bg-white'
          }`}></div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
              }}
              className="text-center"
            >
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDarkMode ? 'text-primary-200' : 'text-white'
              }`}>
                {stat.prefix}
                <CountUp
                  end={stat.number}
                  duration={2.5}
                  separator=" "
                  enableScrollSpy
                  scrollSpyOnce
                />
                {stat.suffix}
              </div>
              <div className={isDarkMode ? 'text-primary-300' : 'text-primary-100'}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className={`text-sm ${isDarkMode ? 'text-primary-400' : 'text-primary-100'}`}>
            * Chiffres mis à jour en temps réel
          </p>
        </motion.div>
      </div>
    </section>
  );
}