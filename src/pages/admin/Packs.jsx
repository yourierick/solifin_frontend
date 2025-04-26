import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, ArrowPathIcon, FunnelIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon, CurrencyDollarIcon, GiftIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import Notification from '../../components/Notification';
import { Tooltip } from 'react-tooltip';

export default function Packs() {
  const [packs, setPacks] = useState([]);
  const [filteredPacks, setFilteredPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isCommissionModalVisible, setIsCommissionModalVisible] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [commissionRates, setCommissionRates] = useState({1: 0, 2: 0, 3: 0, 4: 0});
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState(null);
  const [packToDeleteName, setPackToDeleteName] = useState('');
  const [isBonusModalVisible, setIsBonusModalVisible] = useState(false);
  const [selectedPackIdForBonus, setSelectedPackIdForBonus] = useState(null);
  const [selectedPackNameForBonus, setSelectedPackNameForBonus] = useState('');
  const [bonusRates, setBonusRates] = useState([]);
  const [newBonusRate, setNewBonusRate] = useState({
    frequence: 'weekly',
    nombre_filleuls: 5,
    taux_bonus: 50
  });
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    duree: '',
    image: null,
    frequence: 'weekly',
    nombre_filleuls: '',
    points_attribues: '',
    valeur_point: '',
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [packs, filters]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/packs');
      setPacks(response.data.packs || []);
      setFilteredPacks(response.data.packs || []);
    } catch (err) {
      Notification.error('Erreur lors du chargement des packs');
      setPacks([]);
      setFilteredPacks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...packs];
    
    if (filters.category) {
      result = result.filter(pack => pack.categorie.toLowerCase().includes(filters.category.toLowerCase()));
    }
    
    if (filters.status !== '') {
      const statusValue = filters.status === 'active';
      result = result.filter(pack => pack.status === statusValue);
    }
    
    if (filters.search) {
      result = result.filter(pack => 
        pack.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        pack.avantages.some(avantage => avantage.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    
    setFilteredPacks(result);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      status: '',
      search: ''
    });
  };

  const togglePackStatus = async (packId) => {
    try {
      const response = await axios.patch(`/api/admin/packs/${packId}/toggle-status`);
      if (response.data.success) {
        Notification.success(response.data.message);
        fetchPacks();
      }
    } catch (err) {
      Notification.error('Erreur lors de la mise à jour du statut');
    }
  };

  const showDeleteModal = (packId, packName) => {
    setPackToDelete(packId);
    setPackToDeleteName(packName);
    setIsDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setPackToDelete(null);
    setPackToDeleteName('');
  };

  const showBonusModal = async (packId, packName) => {
    setSelectedPackIdForBonus(packId);
    setSelectedPackNameForBonus(packName);
    
    try {
      const response = await axios.get(`/api/admin/packs/${packId}/bonus-rates`);
      if (response.data.success) {
        setBonusRates(response.data.bonusRates || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des taux de bonus:', error);
      setBonusRates([]);
    }
    
    setIsBonusModalVisible(true);
  };

  const hideBonusModal = () => {
    setIsBonusModalVisible(false);
    setSelectedPackIdForBonus(null);
    setSelectedPackNameForBonus('');
    setBonusRates([]);
    setNewBonusRate({
      frequence: 'weekly',
      nombre_filleuls: 5,
      taux_bonus: 50
    });
  };

  const handleNewBonusRateChange = (e) => {
    const { name, value } = e.target;
    setNewBonusRate(prev => ({
      ...prev,
      [name]: name === 'nombre_filleuls' || name === 'taux_bonus' ? Number(value) : value
    }));
  };

  const addBonusRate = async () => {
    try {
      const response = await axios.post(`/api/admin/packs/${selectedPackIdForBonus}/bonus-rates`, newBonusRate);
      if (response.data.success) {
        showToast(response.data.message, 'success');
        setBonusRates(prev => [...prev, response.data.bonusRate]);
        setNewBonusRate({
          frequence: 'weekly',
          nombre_filleuls: 5,
          taux_bonus: 50
        });
      }
    } catch (err) {
      Notification.error('Erreur lors de l\'ajout du taux de bonus');
    }
  };

  const updateBonusRate = async (id, data) => {
    try {
      const response = await axios.put(`/api/admin/bonus-rates/${id}`, data);
      if (response.data.success) {
        showToast(response.data.message, 'success');
        setBonusRates(prev => prev.map(rate => rate.id === id ? response.data.bonusRate : rate));
      }
    } catch (err) {
      Notification.error('Erreur lors de la mise à jour du taux de bonus');
    }
  };

  const deleteBonusRate = async (id) => {
    try {
      const response = await axios.delete(`/api/admin/bonus-rates/${id}`);
      if (response.data.success) {
        Notification.success('Taux de bonus supprimé avec succès');
        
        // Mettre à jour la liste des bonus immédiatement
        const updatedBonusResponse = await axios.get(`/api/admin/packs/${selectedPackIdForBonus}/bonus-rates`);
        if (updatedBonusResponse.data.success) {
          setBonusRates(updatedBonusResponse.data.bonusRates || []);
        }
      }
    } catch (error) {
      Notification.error('Erreur lors de la suppression du taux de bonus');
    }
  };

  const handleDelete = async () => {
    if (!packToDelete) return;
    
    try {
      const response = await axios.delete(`/api/admin/packs/${packToDelete}`);
      if (response.data.success) {
        showToast(response.data.message, 'success');
        fetchPacks();
        hideDeleteModal();
      }
    } catch (err) {
      Notification.error('Erreur lors de la suppression du pack');
      hideDeleteModal();
    }
  };

  const showCommissionModal = (packId) => {
    setSelectedPackId(packId);
    axios.get(`/api/admin/packs/${packId}/commission-rates`)
      .then(response => {
        setCommissionRates(response.data.rates);
        setIsCommissionModalVisible(true);
      })
      .catch(error => {
        showToast('Erreur lors du chargement des taux de commission', 'error');
      });
  };

  const handleCommissionSubmit = async (level, rate) => {
    try {
      await axios.post(`/api/admin/packs/${selectedPackId}/commission-rate`, {
        level,
        commission_rate: rate
      });
      
      setCommissionRates(prev => ({
        ...prev,
        [level]: rate
      }));
      
      Notification.success('Taux de commission mis à jour avec succès', 'success');
    } catch (error) {
      Notification.error('Erreur lors de la mise à jour du taux de commission', 'error');
    }
  };

  const FormulaireAjoutBonus = ({ packId, onBonusAdded }) => {
    const [formBonus, setFormBonus] = useState({
      frequence: 'weekly',
      nombre_filleuls: '',
      points_attribues: '',
      valeur_point: '',
    });

    const handleBonusChange = (e) => {
      const { name, value } = e.target;
      setFormBonus({ ...formBonus, [name]: value });
    };

    const handleBonusSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`/api/admin/packs/${packId}/bonus-rates`, formBonus);
        if (response.data.success) {
          Notification.success('Taux de bonus ajouté avec succès');
          
          // Mettre à jour la liste des bonus immédiatement
          const updatedBonusResponse = await axios.get(`/api/admin/packs/${packId}/bonus-rates`);
          if (updatedBonusResponse.data.success) {
            setBonusRates(updatedBonusResponse.data.bonusRates || []);
          }
          
          setFormBonus({
            frequence: 'weekly',
            nombre_filleuls: '',
            points_attribues: '',
            valeur_point: '',
          });
          onBonusAdded();
        }
      } catch (error) {
        Notification.error('Erreur lors de l\'ajout du bonus');
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Configurer le bonus sur délais</h3>
        <form onSubmit={handleBonusSubmit}>
          <div className="mb-4">
            <label htmlFor="frequence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fréquence
            </label>
            <select
              id="frequence"
              name="frequence"
              value={formBonus.frequence}
              onChange={handleBonusChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="daily">Journalier</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="nombre_filleuls" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de filleuls pour 1 point
            </label>
            <input
              type="number"
              id="nombre_filleuls"
              name="nombre_filleuls"
              value={formBonus.nombre_filleuls}
              onChange={handleBonusChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min="1"
              required
              placeholder="Ex: 7 (1 point tous les 7 filleuls)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Si un utilisateur parraine 14 filleuls, il recevra 2 points. S'il en parraine 21, il recevra 3 points, etc.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="points_attribues" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points attribués par palier
            </label>
            <input
              type="number"
              id="points_attribues"
              name="points_attribues"
              value={formBonus.points_attribues}
              onChange={handleBonusChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min="1"
              required
              placeholder="Ex: 1 (1 point par palier atteint)"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="valeur_point" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valeur d'un point en devise ($)
            </label>
            <input
              type="number"
              id="valeur_point"
              name="valeur_point"
              value={formBonus.valeur_point}
              onChange={handleBonusChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min="0.01"
              step="0.01"
              required
              placeholder="Ex: 10.00 (10$ par point)"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Ajouter
          </button>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestion des packs
        </h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
          <button
            onClick={fetchPacks}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <Link
            to="/admin/packs/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter un pack
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recherche</label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Rechercher par nom ou avantage"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
              <input
                type="text"
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Filtrer par catégorie"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      N°
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Catégorie
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Nom
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Prix
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Avantages
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredPacks.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {filteredPacks.indexOf(pack) + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {pack.categorie}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {pack.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {pack.price} $
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        <ul className="list-disc list-inside">
                          {pack.avantages.map((avantage, index) => {
                            const shortAvantage = avantage.length > 10 ? avantage.substring(0, 10) + '...' : avantage;
                            const tooltipId = `tooltip-avantage-${pack.id}-${index}`;
                            return (
                              <li 
                                key={index} 
                                data-tooltip-id={tooltipId} 
                                data-tooltip-content={avantage}
                                className="cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                              >
                                {shortAvantage}
                                <Tooltip 
                                  id={tooltipId} 
                                  className="max-w-xs z-50 bg-gray-900 dark:bg-gray-700 text-white p-2 rounded shadow-lg text-sm"
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => togglePackStatus(pack.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pack.status
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {pack.status ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            data-tooltip-id={`tooltip-commission-${pack.id}`}
                            data-tooltip-content="Gérer les commissions"
                            onClick={() => showCommissionModal(pack.id)}
                            className="p-1.5 rounded-full text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <CurrencyDollarIcon className="h-5 w-5" />
                            <Tooltip id={`tooltip-commission-${pack.id}`} className="z-50" />
                          </button>

                          <Link
                            data-tooltip-id={`tooltip-edit-${pack.id}`}
                            data-tooltip-content="Modifier ce pack"
                            to={`/admin/packs/edit/${pack.id}`}
                            className="p-1.5 rounded-full text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <PencilIcon className="h-5 w-5" />
                            <Tooltip id={`tooltip-edit-${pack.id}`} className="z-50" />
                          </Link>
                          
                          <button
                            data-tooltip-id={`tooltip-bonus-${pack.id}`}
                            data-tooltip-content="Configurer les bonus sur délais"
                            onClick={() => showBonusModal(pack.id, pack.name)}
                            className="p-1.5 rounded-full text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <GiftIcon className="h-5 w-5" />
                            <Tooltip id={`tooltip-bonus-${pack.id}`} className="z-50" />
                          </button>

                          <button
                            data-tooltip-id={`tooltip-delete-${pack.id}`}
                            data-tooltip-content="Supprimer ce pack"
                            onClick={() => showDeleteModal(pack.id, pack.name)}
                            className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <TrashIcon className="h-5 w-5" />
                            <Tooltip id={`tooltip-delete-${pack.id}`} className="z-50" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isCommissionModalVisible && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsCommissionModalVisible(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Modifier les taux de commission</h3>
              <button
                onClick={() => setIsCommissionModalVisible(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Définissez les taux de commission pour chaque niveau de parrainage. Ces taux seront appliqués sur les achats effectués par les filleuls.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150">
                      <span className="font-medium text-gray-700 dark:text-gray-200 w-48">
                        {level === 1 && "Première génération"}
                        {level === 2 && "Deuxième génération"}
                        {level === 3 && "Troisième génération"}
                        {level === 4 && "Quatrième génération"}
                      </span>
                      <form 
                        className="flex items-center space-x-2 flex-1 justify-end"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const rate = parseFloat(e.target.rate.value);
                          handleCommissionSubmit(level, rate);
                        }}
                      >
                        <div className="relative">
                          <input
                            type="number"
                            name="rate"
                            step="0.01"
                            min="0"
                            max="100"
                            defaultValue={commissionRates[level]}
                            className="block w-24 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">%</span>
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                        >
                          Enregistrer
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Information</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        Les taux de commission sont appliqués sur les achats effectués par vos filleuls. Par exemple, si vous définissez un taux de <strong>10%</strong> pour la première génération, les parrains recevront 10% du montant des achats effectués par leurs filleuls directs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {isDeleteModalVisible && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center"
          onClick={hideDeleteModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Supprimer le pack
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer le pack <span className="font-semibold">{packToDeleteName}</span> ? Cette action est irréversible et supprimera définitivement ce pack et toutes les données associées.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleDelete}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={hideDeleteModal}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuration des bonus */}
      {isBonusModalVisible && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center"
          onClick={hideBonusModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Configurer les bonus sur délais pour <span className="font-semibold">{selectedPackNameForBonus}</span>
              </h3>
              <button
                onClick={hideBonusModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Définissez des bonus pour les utilisateurs qui parrainent un certain nombre de filleuls dans une période donnée.
              </p>

              {/* Liste des bonus existants */}
              {bonusRates.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">Bonus sur délais configurés</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Fréquence</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Nombre de filleuls</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Point par palier</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Valeur par point</th>
                          <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {bonusRates.map((rate) => (
                          <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                              {rate.frequence === 'daily' && 'Journalier'}
                              {rate.frequence === 'weekly' && 'Hebdomadaire'}
                              {rate.frequence === 'monthly' && 'Mensuel'}
                              {rate.frequence === 'yearly' && 'Annuel'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                              {rate.nombre_filleuls} filleuls
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                              {rate.points_attribues} points
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                              {rate.valeur_point} $
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => deleteBonusRate(rate.id)}
                                  className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mb-6 text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Aucun taux de bonus configuré pour ce pack</p>
                </div>
              )}

              {/* Formulaire d'ajout de taux de bonus */}
              <FormulaireAjoutBonus packId={selectedPackIdForBonus} onBonusAdded={() => setBonusRates(prev => [...prev])} />

              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Exemple</h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Si vous configurez un palier de <strong>1</strong> pour <strong>7 filleuls</strong> pour un bonus <strong>hebdomadaire</strong>, alors un utilisateur qui parraine 7 filleuls en une semaine recevra un bonus de 1 point pour ce pack.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
