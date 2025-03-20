import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import axios from '../../utils/axios';
import ReferralStats from '../../components/ReferralStats';
import ReferralList from '../../components/ReferralList';
import { useToast } from '../../contexts/ToastContext';
import Notification from '../../components/Notification';

const Users = () => {
  //console.log('Rendering Users component'); // Debug log

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Changed to true initially
  const [error, setError] = useState(null);
  const [statistiques, setStatistiques] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    has_pack: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    //console.log('Fetching users...'); // Debug log
    try {
      setLoading(true);
      setError(null);
      
      //console.log('Making API request...'); // Debug log
      const response = await axios.get('/api/admin/users', {
        params: {
          ...filters,
          page: pagination.currentPage,
        },
      });
      //console.log('API Response:', response.data); // Debug log

      if (response.data.success) {
        setUsers(response.data.data.data);
        setPagination({
          currentPage: response.data.data.current_page,
          totalPages: response.data.data.last_page,
          totalItems: response.data.data.total,
        });
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des utilisateurs');
      }
    } catch (err) {
      //console.error('Error in fetchUsers:', err); // Debug log
      setError(err.message || 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //console.log('Users component mounted'); // Debug log
    fetchUsers();
  }, []);

  useEffect(() => {
    //console.log('Filters or pagination changed:', { filters, page: pagination.currentPage }); // Debug log
    fetchUsers();
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (field, value) => {
    //console.log('Filter changed:', field, value); // Debug log
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleViewDetails = async (user) => {
    //console.log('Viewing details for user:', user); // Debug log
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users/${user.id}`);
      //console.log('User details response:', response.data); // Debug log
      
      if (response.data.success) {
        setSelectedUser(response.data.data.user);
        setStatistiques(response.data.data.stats);
        setOpenDialog(true);
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des détails');
      }
    } catch (err) {
      //console.error('Error in handleViewDetails:', err);
      Notification.error('Erreur lors de la récupération des détails');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    //console.log('Closing dialog'); // Debug log
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.patch(`/api/admin/users/toggle-status/${userId}`);
      
      if (response.data.success) {
        // Rafraîchir la liste des utilisateurs
        fetchUsers();
        // Afficher un message de succès
        toast.success('Statut modifié avec succès');
      } else {
        // Gérer le cas où success est false
        toast.error(response.data.message || 'Erreur lors de la modification du statut');
      }
    } catch (err) {
      console.error('Error in toggleUserStatus:', err);
      // Afficher le message d'erreur de l'API si disponible
      toast.error(
        err.response?.data?.message || 
        'Erreur lors de la modification du statut'
      );
    }
  };

  if (loading && !users.length) {
    //console.log('Showing loading state'); // Debug log
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  //console.log('Rendering main content'); // Debug log

  return (
    <div className="max-w-7xl mx-auto py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestion des Utilisateurs
        </h1>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            fullWidth
            label="Rechercher"
            variant="outlined"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              label="Statut"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Possède un pack</InputLabel>
            <Select
              value={filters.has_pack}
              label="Possède un pack"
              onChange={(e) => handleFilterChange('has_pack', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="1">Oui</MenuItem>
              <MenuItem value="0">Non</MenuItem>
            </Select>
          </FormControl>
        </div>

        {loading && !users.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Aucun utilisateur trouvé
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Nom
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Statut
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Packs
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Filleuls
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                            {user.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {user.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                            {user.packs?.length || 0} pack(s)
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                            {user.referrals_count || 0} filleul(s)
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-4">
                            <button
                              onClick={() => handleViewDetails(user)}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            >
                              Détails
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`${
                                user.status === 'active'
                                  ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                                  : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                              }`}
                            >
                              {user.status === 'active' ? 'Désactiver' : 'Activer'}
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
        )}
      </div>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center">
            <PersonIcon className="mr-2" />
            <span>Détails de l'utilisateur</span>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">Nom: {selectedUser.name}</p>
                  <p className="text-gray-700 dark:text-gray-300">Email: {selectedUser.email}</p>
                  <p className="text-gray-700 dark:text-gray-300">Statut: {selectedUser.status}</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Date d'inscription: {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ReferralStats stats={{
                total_referrals: statistiques.length,
                referrals_by_pack: statistiques,
              }} />
              <ReferralList userId={selectedUser.id} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
