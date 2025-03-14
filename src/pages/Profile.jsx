import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import axios from 'axios';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    country: '',
    province: '',
    city: '',
    picture: null,
    password: '',
    password_confirmation: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchCountries();
  }, []);

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
      showToast('Erreur lors du chargement des pays', 'error');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setUser(response.data.data);
      setFormData({
        name: response.data.data.name,
        email: response.data.data.email,
        phone: response.data.data.phone || '',
        address: response.data.data.address || '',
        gender: response.data.data.gender || '',
        country: response.data.data.country || '',
        province: response.data.data.province || '',
        city: response.data.data.city || '',
        picture: null,
        password: '',
        password_confirmation: ''
      });
      setLoading(false);
    } catch (err) {
      showToast('Erreur lors du chargement du profil', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation de la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors({
          picture: ['La taille de l\'image ne doit pas dépasser 2MB']
        });
        return;
      }

      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors({
          picture: ['Le fichier doit être une image (JPG, PNG ou GIF)']
        });
        return;
      }

      setValidationErrors(prev => ({ ...prev, picture: null }));
      setFormData(prev => ({ ...prev, picture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setValidationErrors({});
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post('/api/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showToast('Profil mis à jour avec succès', 'success');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        // Afficher le premier message d'erreur comme toast
        const firstError = Object.values(err.response.data.errors)[0][0];
        showToast(firstError, 'error');
      } else {
        showToast('Erreur lors de la mise à jour du profil', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-primary-800 to-primary-700 h-32">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative group">
              {previewUrl || user.picture ? (
                <img
                  src={previewUrl || user.profile_picture_url}
                  alt="Profile"
                  className={`h-32 w-32 rounded-full object-cover border-4 ${
                    validationErrors.picture ? 'border-red-500' : 'border-white'
                  }`}
                />
              ) : (
                <UserCircleIcon className={`h-32 w-32 text-gray-300 ${
                  validationErrors.picture ? 'text-red-500' : ''
                }`} />
              )}
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-picture"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
                  >
                    <span className="text-white text-sm">Modifier</span>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pt-20 pb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mon Profil
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.name ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.name[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.email[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.phone[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sexe
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    >
                      <option value="">Sélectionner</option>
                      <option value="homme">Masculin</option>
                      <option value="femme">Féminin</option>
                    </select>
                    {validationErrors.gender && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.gender[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pays
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={loadingCountries}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          validationErrors.country ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                      >
                        <option value="">Sélectionner un pays</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.country && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.country[0]}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Province
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.province ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    />
                    {validationErrors.province && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.province[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    />
                    {validationErrors.city && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.city[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        validationErrors.address ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                    />
                    {validationErrors.address && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.address[0]}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.password[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                  />
                  {validationErrors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.password_confirmation[0]}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations personnelles</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.phone || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexe</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">
                      {user.gender === 'homme' ? 'Masculin' : user.gender === 'femme' ? 'Féminin' : '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Localisation</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pays</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.country || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Province</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.province || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ville</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.city || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.address || '-'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
      {validationErrors.picture && (
        <p className="mt-2 text-sm text-red-500 text-center">{validationErrors.picture[0]}</p>
      )}
    </div>
  );
}