import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const notifications = [
  // Exemple de notifications (vide pour l'instant)
];

export default function NotificationsDropdown() {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${
          isDarkMode
            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } ring-1 ring-black ring-opacity-5 z-50`}
          >
            <div className="p-4">
              <h3 className={`text-lg font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Notifications
              </h3>
              {notifications.length === 0 ? (
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Aucune nouvelle notification
                </p>
              ) : (
                <div className="mt-2 space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Contenu de la notification */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 