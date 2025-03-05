import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import axios from 'axios';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    picture: null,
    password: '',
    password_confirmation: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile');
      setUser(response.data.data);
      setFormData({
        name: response.data.data.name,
        email: response.data.data.email,
        phone: response.data.data.phone || '',
        address: response.data.data.address || '',
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
      setFormData(prev => ({
        ...prev,
        picture: file
      }));
      
      // Créer une URL pour la prévisualisation
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post('/profile', data, {
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
      showToast('Erreur lors de la mise à jour du profil', 'error');
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
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Mon Profil
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  {previewUrl || user.profile_picture_url ? (
                    <img
                      src={previewUrl || user.profile_picture_url}
                      alt="Preview"
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-32 w-32 text-gray-300" />
                  )}
                  <input
                    type="file"
                    name="picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                {user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt={user.name}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-32 w-32 text-gray-300" />
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Nom
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Téléphone
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.phone || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Adresse
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.address || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 