import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function Ads() {
  const { isDarkMode } = useTheme();
  
  const ads = [
    {
      id: 1,
      title: "Offre Spéciale",
      description: "Profitez de notre offre de lancement exclusive",
      image: "/img/ads/ad1.jpg",
      cta: "En profiter",
      link: "#"
    },
    {
      id: 2,
      title: "Parrainage Premium",
      description: "Doublez vos gains avec notre programme premium",
      image: "/img/ads/ad2.jpg",
      cta: "Découvrir",
      link: "#"
    },
    {
      id: 3,
      title: "Événement VIP",
      description: "Participez à nos sessions exclusives",
      image: "/img/ads/ad3.jpg",
      cta: "S'inscrire",
      link: "#"
    }
  ];

  return (
    <section id="ads" className={`py-16 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`heading-secondary mb-4 ${isDarkMode ? 'text-white' : ''}`}>
            Offres <span className="text-primary-600">Spéciales</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Découvrez nos meilleures opportunités et offres exclusives pour maximiser votre potentiel
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ads.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 shadow-gray-900/50' 
                  : 'bg-white shadow-lg'
              }`}
            >
              <div className="relative h-48">
                <div className={`absolute inset-0 ${
                  isDarkMode ? 'bg-primary-900/30' : 'bg-primary-600/20'
                }`} />
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {ad.title}
                </h3>
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {ad.description}
                </p>
                <a
                  href={ad.link}
                  className="inline-block px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors duration-300"
                >
                  {ad.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}