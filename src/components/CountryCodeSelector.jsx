import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Composant de sélection d'indicatif téléphonique par pays
 * @param {function} onChange - Fonction appelée lorsque l'indicatif est modifié
 * @param {string} value - Valeur actuelle de l'indicatif (pour le mode édition)
 */
export default function CountryCodeSelector({ onChange, value }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCode, setSelectedCode] = useState(value || '+225'); // Valeur par défaut: Côte d'Ivoire

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        setLoading(true);
        // Utilisation de l'API REST Countries pour obtenir les pays et leurs indicatifs
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags,idd');
        
        // Traitement des données pour extraire les informations nécessaires
        const countriesData = response.data
          .filter(country => country.idd && country.idd.root) // Filtrer les pays sans indicatif
          .map(country => {
            // Construire l'indicatif complet (root + suffixe si disponible)
            let dialCode = country.idd.root;
            if (country.idd.suffixes && country.idd.suffixes.length === 1) {
              dialCode += country.idd.suffixes[0];
            }
            
            return {
              name: country.name.common,
              code: dialCode,
              flag: country.flags.svg || country.flags.png
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name)); // Tri par nom de pays
        
        setCountries(countriesData);
      } catch (err) {
        console.error('Erreur lors de la récupération des indicatifs téléphoniques:', err);
        setError('Impossible de charger les indicatifs téléphoniques');
        
        // Fallback: quelques indicatifs courants
        setCountries([
          { name: 'Côte d\'Ivoire', code: '+225', flag: 'https://flagcdn.com/ci.svg' },
          { name: 'France', code: '+33', flag: 'https://flagcdn.com/fr.svg' },
          { name: 'États-Unis', code: '+1', flag: 'https://flagcdn.com/us.svg' },
          { name: 'Sénégal', code: '+221', flag: 'https://flagcdn.com/sn.svg' },
          { name: 'Cameroun', code: '+237', flag: 'https://flagcdn.com/cm.svg' },
          { name: 'Mali', code: '+223', flag: 'https://flagcdn.com/ml.svg' },
          { name: 'Burkina Faso', code: '+226', flag: 'https://flagcdn.com/bf.svg' },
          { name: 'Bénin', code: '+229', flag: 'https://flagcdn.com/bj.svg' },
          { name: 'Togo', code: '+228', flag: 'https://flagcdn.com/tg.svg' },
          { name: 'Gabon', code: '+241', flag: 'https://flagcdn.com/ga.svg' },
          { name: 'Congo', code: '+242', flag: 'https://flagcdn.com/cg.svg' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryCodes();
  }, []);

  const handleChange = (e) => {
    const code = e.target.value;
    setSelectedCode(code);
    if (onChange) {
      onChange(code);
    }
  };

  // Fonction pour trouver le pays sélectionné
  const getSelectedCountry = () => {
    return countries.find(country => country.code === selectedCode) || null;
  };

  // États pour gérer l'ouverture/fermeture du dropdown et la recherche
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const selectedCountry = getSelectedCountry();
  
  // Mettre à jour les pays filtrés quand la liste des pays change
  useEffect(() => {
    setFilteredCountries(countries);
  }, [countries]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.country-selector-container')) {
        setIsOpen(false);
        // Réinitialiser la recherche quand on ferme le dropdown
        setSearchTerm('');
        setFilteredCountries(countries);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, countries]);

  if (loading) {
    return (
      <div className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && countries.length === 0) {
    return (
      <div className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white">
        <div className="flex items-center justify-between">
          <span className="text-red-500 dark:text-red-400">Erreur de chargement</span>
        </div>
      </div>
    );
  }

  return (
    <div className="country-selector-container relative">
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {selectedCountry && (
              <>
                <img 
                  src={selectedCountry.flag} 
                  alt={selectedCountry.name} 
                  className="w-5 h-3 mr-2 object-cover rounded-sm" 
                />
                <span>{selectedCountry.code}</span>
              </>
            )}
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </button>

      {/* Dropdown des pays */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Rechercher un pays..."
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
              value={searchTerm}
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                setSearchTerm(term);
                const filtered = countries.filter(country => 
                  country.name.toLowerCase().includes(term) || 
                  country.code.toLowerCase().includes(term)
                );
                setFilteredCountries(filtered);
              }}
              // Empêcher la fermeture du dropdown lors du clic sur le champ de recherche
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          {filteredCountries.length > 0 ? filteredCountries.map((country) => (
            <div
              key={`${country.code}-${country.name}`}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedCode === country.code ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-200'}`}
              onClick={() => {
                handleChange({ target: { value: country.code } });
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                <img 
                  src={country.flag} 
                  alt={country.name} 
                  className="w-5 h-3 mr-2 object-cover rounded-sm" 
                />
                <span className="font-normal truncate">{country.name}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">{country.code}</span>
              </div>
            </div>
          )) : (
            <div className="py-3 px-3 text-center text-gray-500 dark:text-gray-400">
              Aucun pays ne correspond à votre recherche
            </div>
          )}
        </div>
      )}
    </div>
  );
}
