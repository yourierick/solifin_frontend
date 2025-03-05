import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

export default function EditPack() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [avantages, setAvantages] = useState(['']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: true,
  });
  const [formations, setFormations] = useState(null);
  const [currentFormations, setCurrentFormations] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPack();
  }, [id]);

  const fetchPack = async () => {
    try {
      const response = await axios.get(`/admin/packs/${id}`);
      const pack = response.data.data;
      
      setFormData({
        name: pack.name,
        description: pack.description,
        price: pack.price,
        status: pack.status,
      });
      
      // Gérer les avantages
      const packAvantages = typeof pack.avantages === 'string'
        ? JSON.parse(pack.avantages)
        : Array.isArray(pack.avantages)
          ? pack.avantages
          : [];
      
      setAvantages(packAvantages);
      
      // Stocker le nom du fichier des formations actuel
      if (pack.formations) {
        setCurrentFormations(pack.formations.split('/').pop());
      }
    } catch (err) {
      showToast('Erreur lors du chargement du pack', 'error');
      navigate('/admin/packs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/octet-stream'
      ];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['zip', 'rar', '7z'];
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        showToast('Veuillez sélectionner un fichier compressé (ZIP, RAR, ou 7Z)', 'error');
        return;
      }
      setFormations(file);
      showToast('Fichier ajouté avec succès', 'success');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/octet-stream'
      ];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['zip', 'rar', '7z'];
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        showToast('Veuillez sélectionner un fichier compressé (ZIP, RAR, ou 7Z)', 'error');
        return;
      }
      setFormations(file);
      showToast('Fichier ajouté avec succès', 'success');
    }
  };

  const handleAvantageChange = (index, value) => {
    const newAvantages = [...avantages];
    newAvantages[index] = value;
    setAvantages(newAvantages);
  };

  const addAvantage = () => {
    setAvantages([...avantages, '']);
  };

  const removeAvantage = (index) => {
    const newAvantages = avantages.filter((_, i) => i !== index);
    setAvantages(newAvantages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Valider les données avant l'envoi
      if (!formData.name.trim()) {
        showToast('Le nom du pack est requis', 'error');
        return;
      }
      if (!formData.description.trim()) {
        showToast('La description du pack est requise', 'error');
        return;
      }
      if (!formData.price || formData.price <= 0) {
        showToast('Le prix doit être supérieur à 0', 'error');
        return;
      }
      
      // Filtrer les avantages vides
      const filteredAvantages = avantages.filter(avantage => avantage.trim() !== '');
      if (filteredAvantages.length === 0) {
        showToast('Au moins un avantage est requis', 'error');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('status', formData.status ? '1' : '0');
      formDataToSend.append('_method', 'PUT'); // Pour la méthode PUT
      
      if (formations) {
        formDataToSend.append('formations', formations);
      }
      
      formDataToSend.append('avantages', JSON.stringify(filteredAvantages));

      const response = await axios.post(`/admin/packs/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showToast(response.data.message || 'Pack mis à jour avec succès', 'success');
        navigate('/admin/packs');
      }
    } catch (err) {
      console.error('Erreur:', err);
      
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        showToast(firstError, 'error');
      } else {
        showToast(
          err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du pack',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="mx-auto">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate('/admin/packs')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour aux packs
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Modifier le pack
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Modifiez les informations du pack ci-dessous
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du pack
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Ex: Pack Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Description détaillée du pack..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix ($)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 pl-7 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avantages
                </label>
                <div className="space-y-2">
                  {avantages.map((avantage, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={avantage}
                        onChange={(e) => handleAvantageChange(index, e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Avantage..."
                      />
                      <button
                        type="button"
                        onClick={() => removeAvantage(index)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAvantage}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Ajouter un avantage
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Formations (ZIP, RAR, ou 7Z)
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <div className="flex flex-col items-center">
                      {currentFormations && !formations && (
                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                          Fichier actuel : {currentFormations}
                        </div>
                      )}
                      <div className="flex text-sm text-gray-600 dark:text-gray-300">
                        <label
                          htmlFor="formations"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Téléverser un fichier</span>
                          <input
                            id="formations"
                            name="formations"
                            type="file"
                            accept=".zip,.rar,.7z"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ZIP, RAR ou 7Z jusqu'à 10MB
                      </p>
                      {formations && (
                        <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{formations.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormations(null);
                              showToast('Fichier supprimé', 'info');
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    Pack actif
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/packs')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
