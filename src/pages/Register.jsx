import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { CheckIcon } from '@heroicons/react/24/outline';
import Notification from '../components/Notification';
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
    whatsapp: '',
    address: '',
    gender: '',
    country: '',
    province: '',
    city: '',
    sponsor_code: '',
    acceptTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const sortedCountries = response.data
          .map(country => ({
            code: country.cca2,
            name: country.translations.fra?.common || country.name.common
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } catch (err) {
        Notification.error('Erreur lors du chargement des pays');
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();

    // Extract referral code from URL if present
    const queryParams = new URLSearchParams(location.search);
    const referralCode = queryParams.get('referral_code');
    if (referralCode) {
      setFormData((prev) => ({ ...prev, sponsor_code: referralCode }));
    }
  }, [selectedPackId, location.search]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Le nom est obligatoire';
    if (!formData.email.trim()) errors.email = 'L\'email est obligatoire';
    if (!formData.phone.trim()) errors.phone = 'Le téléphone est obligatoire';
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Valider les données
      if (!validateForm()) {
        return;
      }

      // Stocker les données d'inscription dans le localStorage ou sessionStorage
      sessionStorage.setItem('registrationData', JSON.stringify(formData));

      // Rediriger vers la page d'achat du pack
      navigate(`/purchase-pack/${formData.sponsor_code}`, {
        state: { 
          fromRegistration: true,
          registrationData: formData // Passer aussi les données via state
        }
      });

    } catch (error) {
      Notification.error("Erreur lors de l'inscription")
    } finally {
      setLoading(false);
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
                    >
                      <MenuItem value="">Sélectionner</MenuItem>
                      <MenuItem value="homme">Masculin</MenuItem>
                      <MenuItem value="femme">Féminin</MenuItem>
                    </Select>
                    {formErrors.gender && (
                      <FormHelperText>{formErrors.gender}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl fullWidth error={!!formErrors.country}>
                    <InputLabel>Pays</InputLabel>
                    <Select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      disabled={loadingCountries}
                    >
                      <MenuItem value="">Sélectionner un pays</MenuItem>
                      {countries.map(country => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.country && (
                      <FormHelperText>{formErrors.country}</FormHelperText>
                    )}
                  </FormControl>

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

                  <TextField
                    fullWidth
                    type="tel"
                    label="Téléphone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
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
                    type="tel"
                    label="Whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    error={!!formErrors.whatsapp}
                    helperText={formErrors.whatsapp}
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