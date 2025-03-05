import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';

const testimonials = [
  {
    id: 1,
    name: 'Marie Dubois',
    role: 'Membre depuis 2023',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Jean Martin',
    role: 'Membre Elite',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sophie Laurent',
    role: 'Membre Pro',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!autoplay) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoplay]);

  return (
    <section id="testimonials" className={`section-padding ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className={`heading-secondary mb-4 ${isDarkMode ? 'text-white' : ''}`}>
            Ce que disent nos <span className={isDarkMode ? 'text-primary-400' : 'text-primary-600'}>Membres</span>
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Découvrez les témoignages de nos membres qui ont transformé leur vie grâce à SOLIFIN.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-4">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl p-8 md:p-12 ${
                  isDarkMode 
                    ? 'bg-gray-800 shadow-lg hover:shadow-gray-700/50' 
                    : 'bg-white shadow-lg hover:shadow-xl'
                }`}
                onMouseEnter={() => setAutoplay(false)}
                onMouseLeave={() => setAutoplay(true)}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="flex-shrink-0">
                    <img
                      src={testimonials[current].image}
                      alt={testimonials[current].name}
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-primary-500"
                    />
                  </div>
                  <div>
                    <div className="flex mb-4">
                      {[...Array(testimonials[current].rating)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-6 w-6 text-yellow-400"
                        />
                      ))}
                    </div>
                    <blockquote className={`text-xl italic mb-6 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      "{testimonials[current].content}"
                    </blockquote>
                    <div>
                      <div className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {testimonials[current].name}
                      </div>
                      <div className={isDarkMode ? 'text-primary-400' : 'text-primary-600'}>
                        {testimonials[current].role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrent(index);
                  setAutoplay(false);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === current
                    ? isDarkMode 
                      ? 'bg-primary-400' 
                      : 'bg-primary-600'
                    : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Voir le témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}