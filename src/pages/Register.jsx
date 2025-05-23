import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { CheckIcon } from '@heroicons/react/24/outline';
import Notification from '../components/Notification';
import CountryCodeSelector from '../components/CountryCodeSelector';
import CountrySelector from '../components/CountrySelector';
import { countries as countriesList } from '../data/countries';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import axios from '../utils/axios';

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

export default function Register() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPackId = location.state?.selectedPackId;

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    phoneNumber: '', // Numéro sans l'indicatif
    phoneCode: '+243', // Indicatif par défaut
    whatsapp: '',
    whatsappNumber: '', // Numéro sans l'indicatif
    whatsappCode: '+243', // Indicatif par défaut
    address: '',
    gender: '',
    country: '',
    province: '',
    city: '',
    sponsor_code: '',
    invitation_code: '', // Code d'invitation
    acquisition_source: '', // Comment l'utilisateur a connu SOLIFIN
    acceptTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});

  // Fonction pour obtenir l'emoji du drapeau à partir du code pays
  const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  useEffect(() => {
    // Utiliser les données des pays depuis le fichier countries.js
    try {
      setLoadingCountries(true);
      // Transformer et trier les pays par ordre alphabétique
      const formattedCountries = countriesList.map(country => ({
        code: country.code,
        name: country.name
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setCountries(formattedCountries);
    } catch (err) {
      console.error('Erreur lors du chargement des pays', err);
      Notification.error('Erreur lors du chargement des pays');
    } finally {
      setLoadingCountries(false);
    }

    // Extract referral code from URL if present
    const queryParams = new URLSearchParams(location.search);
    const referralCode = queryParams.get('referral_code');
    if (referralCode) {
      setFormData((prev) => ({ ...prev, sponsor_code: referralCode }));
    }
    
    // Extract invitation code from URL if present
    const invitationCode = queryParams.get('invitation');
    if (invitationCode) {
      setFormData((prev) => ({ ...prev, invitation_code: invitationCode }));
      // Vérifier le code d'invitation
      checkInvitationCode(invitationCode);
    }
  }, [selectedPackId, location.search]);
  
  // Fonction pour vérifier le code d'invitation
  const checkInvitationCode = async (code) => {
    try {
      const response = await axios.post('/api/check-invitation', { invitation_code: code });
      if (response.data.success) {
        const invitationData = response.data.data;
        // Pré-remplir le code de parrainage avec celui du sponsor de l'invitation
        setFormData((prev) => ({
          ...prev,
          sponsor_code: invitationData.referral_code,
          // Pré-remplir d'autres champs si nécessaire
        }));
        Notification.success('Code d\'invitation valide');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du code d\'invitation:', error);
      if (error.response && error.response.data && error.response.data.message) {
        Notification.error(error.response.data.message);
      } else {
        Notification.error('Code d\'invitation invalide');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Le nom est obligatoire';
    if (!formData.email.trim()) errors.email = 'L\'email est obligatoire';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Le numéro de téléphone est obligatoire';
    if (formData.phoneNumber.trim() && formData.phoneNumber.startsWith('0')) {
      errors.phoneNumber = 'Le numéro ne doit pas commencer par 0';
    }
    if (formData.phoneNumber.trim() && !/^[1-9][0-9]*$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Le numéro doit contenir uniquement des chiffres et ne pas commencer par 0';
    }
    if (formData.whatsappNumber && formData.whatsappNumber.startsWith('0')) {
      errors.whatsappNumber = 'Le numéro WhatsApp ne doit pas commencer par 0';
    }
    if (formData.whatsappNumber && !/^[1-9][0-9]*$/.test(formData.whatsappNumber)) {
      errors.whatsappNumber = 'Le numéro WhatsApp doit contenir uniquement des chiffres et ne pas commencer par 0';
    }
    if (!formData.address.trim()) errors.address = 'L\'adresse est obligatoire';
    if (!formData.gender) errors.gender = 'Le sexe est obligatoire';
    if (!formData.country) errors.country = 'Le pays est obligatoire';
    if (!formData.province.trim()) errors.province = 'La province est obligatoire';
    if (!formData.city.trim()) errors.city = 'La ville est obligatoire';
    if (!formData.password) errors.password = 'Le mot de passe est obligatoire';
    if (!formData.password_confirmation) errors.password_confirmation = 'La confirmation du mot de passe est obligatoire';
    if (formData.password !== formData.password_confirmation) errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    if (!formData.sponsor_code.trim()) errors.sponsor_code = 'Le code parrain est obligatoire';
    if (!formData.acceptTerms) errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Valider les données
      if (!validateForm()) {
        return;
      }

      // Préparer les données avec les numéros de téléphone complets (indicatif + numéro)
      const dataToSubmit = {
        ...formData,
        phone: `${formData.phoneCode} ${formData.phoneNumber}`.trim(),
        whatsapp: formData.whatsappNumber ? `${formData.whatsappCode} ${formData.whatsappNumber}`.trim() : '',
      };

      // Stocker les données d'inscription dans le localStorage ou sessionStorage
      sessionStorage.setItem('registrationData', JSON.stringify(dataToSubmit));

      // Rediriger vers la page d'achat du pack
      navigate(`/purchase-pack/${formData.sponsor_code}`, {
        state: { 
          fromRegistration: true,
          registrationData: dataToSubmit // Passer les données avec les numéros de téléphone complets
        }
      });

    } catch (error) {
      Notification.error("Erreur lors de l'inscription")
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validation spécifique pour les numéros de téléphone
    if (name === 'phoneNumber' || name === 'whatsappNumber') {
      // Ne permettre que des chiffres et ne pas autoriser le 0 en début
      if (value === '') {
        // Permettre de vider le champ
        setFormData((prev) => ({
          ...prev,
          [name]: '',
        }));
      } else if (/^[1-9][0-9]*$/.test(value)) {
        // Accepter uniquement les chiffres sans 0 au début
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      // Ne rien faire si la valeur ne correspond pas aux critères (ignorer l'entrée)
    } else {
      // Pour les autres champs, comportement normal
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Réinitialiser l'erreur pour ce champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Gérer le changement d'indicatif téléphonique
  const handlePhoneCodeChange = (code) => {
    setFormData({
      ...formData,
      phoneCode: code,
    });
  };

  // Gérer le changement d'indicatif WhatsApp
  const handleWhatsappCodeChange = (code) => {
    setFormData(prev => ({
      ...prev,
      whatsappCode: code,
      whatsapp: code + prev.whatsappNumber
    }));
  };
  
  // Gérer le changement de pays avec le sélecteur de pays
  const handleCountryChange = (countryName) => {
    setFormData(prev => ({
      ...prev,
      country: countryName
    }));
    
    // Réinitialiser l'erreur de validation pour le pays
    if (formErrors.country) {
      setFormErrors(prev => ({
        ...prev,
        country: null
      }));
    }
  };

  return (
    <section className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-xl rounded-lg overflow-hidden`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="px-6 py-8 sm:p-10">
              <div className="text-center">
                <h2 className={`text-3xl font-extrabold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Créer un compte
                </h2>
                <p className={`mt-2 text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Commencez votre aventure avec nous
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <motion.div variants={itemVariants} className="space-y-4">
                  <TextField
                    fullWidth
                    label="Nom complet"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <FormControl fullWidth error={!!formErrors.gender}>
                    <InputLabel>Sexe</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: '#1f2937',
                            color: 'white',
                            '& .MuiMenuItem-root': {
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.08)',
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Sélectionner</MenuItem>
                      <MenuItem value="homme">Masculin</MenuItem>
                      <MenuItem value="femme">Féminin</MenuItem>
                    </Select>
                    {formErrors.gender && (
                      <FormHelperText>{formErrors.gender}</FormHelperText>
                    )}
                  </FormControl>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pays <span className="text-red-500">*</span>
                    </label>
                    <CountrySelector
                      value={formData.country}
                      onChange={handleCountryChange}
                      placeholder="Sélectionner un pays"
                    />
                    {formErrors.country && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
                    )}
                  </div>

                  <TextField
                    fullWidth
                    label="Province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    error={!!formErrors.province}
                    helperText={formErrors.province}
                  />

                  <TextField
                    fullWidth
                    label="Ville"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                  />

                  <TextField
                    fullWidth
                    type="email"
                    label="Adresse email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-start space-x-2">
                      <div className="w-1/3">
                        <CountryCodeSelector 
                          value={formData.phoneCode} 
                          onChange={handlePhoneCodeChange} 
                        />
                      </div>
                      <div className="flex-1">
                        <TextField
                          fullWidth
                          type="tel"
                          label="Numéro de téléphone"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                          placeholder="Ex: 1234567 (sans indicatif)"
                          error={!!formErrors.phoneNumber}
                          helperText={formErrors.phoneNumber}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '48px',
                              '&.Mui-focused fieldset': {
                                borderColor: '#2E7D32',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              transform: 'translate(14px, 13px) scale(1)',
                              '&.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#2E7D32',
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      WhatsApp <span className="text-gray-500">(optionnel)</span>
                    </label>
                    <div className="flex items-start space-x-2">
                      <div className="w-1/3">
                        <CountryCodeSelector 
                          value={formData.whatsappCode} 
                          onChange={handleWhatsappCodeChange} 
                        />
                      </div>
                      <div className="flex-1">
                        <TextField
                          fullWidth
                          type="tel"
                          label="Numéro WhatsApp"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleChange}
                          placeholder="Ex: 1234567 (sans indicatif)"
                          error={!!formErrors.whatsappNumber}
                          helperText={formErrors.whatsappNumber}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '48px',
                              '&.Mui-focused fieldset': {
                                borderColor: '#2E7D32',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              transform: 'translate(14px, 13px) scale(1)',
                              '&.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#2E7D32',
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Adresse"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Mot de passe"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmer le mot de passe"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    error={!!formErrors.password_confirmation}
                    helperText={formErrors.password_confirmation}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Code parrain"
                    name="sponsor_code"
                    value={formData.sponsor_code}
                    onChange={handleChange}
                    required
                    error={!!formErrors.sponsor_code}
                    helperText={formErrors.sponsor_code || 'Code parrain obligatoire'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    name="invitation_code"
                    label="Code d'invitation (optionnel)"
                    value={formData.invitation_code}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value) {
                        checkInvitationCode(e.target.value);
                      }
                    }}
                    error={!!formErrors.invitation_code}
                    helperText={formErrors.invitation_code}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#2E7D32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2E7D32',
                      },
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="acquisition-source-label">Comment avez-vous connu SOLIFIN ?</InputLabel>
                    <Select
                      labelId="acquisition-source-label"
                      name="acquisition_source"
                      value={formData.acquisition_source}
                      onChange={handleChange}
                      label="Comment avez-vous connu SOLIFIN ?"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#2E7D32',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2E7D32',
                        },
                      }}
                    >
                      <MenuItem value=""><em>Sélectionnez une option</em></MenuItem>
                      <MenuItem value="referral">Parrain/Marraine</MenuItem>
                      <MenuItem value="social_media">Réseaux sociaux</MenuItem>
                      <MenuItem value="search_engine">Moteur de recherche</MenuItem>
                      <MenuItem value="friend">Ami(e)</MenuItem>
                      <MenuItem value="advertisement">Publicité</MenuItem>
                      <MenuItem value="event">Événement</MenuItem>
                      <MenuItem value="other">Autre</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        required
                        sx={{
                          color: '#2E7D32',
                          '&.Mui-checked': {
                            color: '#2E7D32',
                          },
                        }}
                      />
                    }
                    label="J'accepte les conditions d'utilisation"
                  />
                  {formErrors.acceptTerms && (
                    <FormHelperText error>{formErrors.acceptTerms}</FormHelperText>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || !formData.acceptTerms}
                    sx={{
                      mt: 3,
                      bgcolor: '#2E7D32',
                      '&:hover': {
                        bgcolor: '#1B5E20',
                      },
                      '&:disabled': {
                        bgcolor: '#81C784',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Continuer vers le paiement'}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center mt-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Déjà un compte ?{' '}
                    <Link
                      to="/login"
                      className={`font-medium ${
                        isDarkMode ? 'text-primary-400' : 'text-primary-600'
                      } hover:text-primary-500`}
                    >
                      Connectez-vous
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}