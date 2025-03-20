import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/useToast';
import Notification from '../../components/Notification';

export default function Packs() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isCommissionModalVisible, setIsCommissionModalVisible] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [commissionRates, setCommissionRates] = useState({1: 0, 2: 0, 3: 0, 4: 0});

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/packs');
      setPacks(response.data.packs || []);
    } catch (err) {
      Notification.error('Erreur lors du chargement des packs');
      setPacks([]);
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (packId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return;
    
    try {
      const response = await axios.delete(`/api/admin/packs/${packId}`);
      if (response.data.success) {
        showToast(response.data.message, 'success');
        fetchPacks();
      }
    } catch (err) {
      Notification.error('Erreur lors de la suppression du pack');
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

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
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
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                  {packs.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {pack.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {pack.price} $
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                        <ul className="list-disc list-inside">
                          {pack.avantages.map((avantage, index) => (
                            <li key={index}>{avantage}</li>
                          ))}
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-4">
                        <button
                          onClick={() => showCommissionModal(pack.id)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                        >
                          Commission
                        </button>

                        <Link
                          to={`/admin/packs/edit/${pack.id}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(pack.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
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
          className="fixed inset-0 z-50 bg-gray-700 bg-opacity-75 flex items-center justify-center"
          onClick={() => setIsCommissionModalVisible(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Modifier les taux de commission</h3>
              <button
                onClick={() => setIsCommissionModalVisible(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <hr />
            <div className="space-y-4 mt-4">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className="flex items-center space-x-4">
                  <span className="w-48">
                    {level === 1 && "Première génération"}
                    {level === 2 && "Deuxième génération"}
                    {level === 3 && "Troisième génération"}
                    {level === 4 && "Quatrième génération"}
                  </span>
                  <form 
                    className="flex items-center space-x-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const rate = parseFloat(e.target.rate.value);
                      handleCommissionSubmit(level, rate);
                    }}
                  >
                    <input
                      type="number"
                      name="rate"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={commissionRates[level]}
                      className="block w-24 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-gray-500">%</span>
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Enregistrer
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
