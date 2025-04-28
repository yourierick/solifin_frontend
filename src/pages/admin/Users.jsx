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
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  LockReset as LockResetIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import ReferralStats from '../../components/ReferralStats';
import ReferralList from '../../components/ReferralList';
import { useToast } from '../../contexts/ToastContext';
import Notification from '../../components/Notification';
import { useTheme } from '../../contexts/ThemeContext';

// Style personnalisé pour l'overlay des modals avec effet de flou
const backdropStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
};

const Users = () => {
  //console.log('Rendering Users component'); // Debug log
  const { isDarkMode } = useTheme();
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
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: null,
    userName: '',
    newPassword: '',
    adminPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const { toast } = useToast();

  // États pour la réinitialisation de mot de passe

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

  const handleOpenResetPassword = (user) => {
    setResetPasswordData({
      userId: user.id,
      userName: user.name,
      newPassword: '',
      adminPassword: '',
    });
    setResetPasswordDialog(true);
  };

  const handleCloseResetPassword = () => {
    setResetPasswordDialog(false);
    setResetPasswordData({
      userId: null,
      userName: '',
      newPassword: '',
      adminPassword: '',
    });
    setShowNewPassword(false);
    setShowAdminPassword(false);
  };

  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPasswordSubmit = async () => {
    try {
      setResetPasswordLoading(true);
      
      // Validation basique
      if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 8) {
        toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
        setResetPasswordLoading(false);
        return;
      }
      
      if (!resetPasswordData.adminPassword) {
        toast.error('Veuillez entrer votre mot de passe administrateur');
        setResetPasswordLoading(false);
        return;
      }
      
      const response = await axios.post(`/api/admin/users/${resetPasswordData.userId}/reset-password`, {
        new_password: resetPasswordData.newPassword,
        admin_password: resetPasswordData.adminPassword
      });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Mot de passe réinitialisé avec succès');
        handleCloseResetPassword();
      } else {
        throw new Error(response.data.message || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (err) {
      console.error('Error in handleResetPasswordSubmit:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setResetPasswordLoading(false);
    }
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
                            <Tooltip title="Voir les détails de l'utilisateur" arrow>
                              <IconButton
                                onClick={() => handleViewDetails(user)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                                size="small"
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Réinitialiser le mot de passe" arrow>
                              <IconButton
                                onClick={() => handleOpenResetPassword(user)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                size="small"
                              >
                                <LockResetIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={user.status === 'active' ? "Désactiver l'utilisateur" : "Activer l'utilisateur"} arrow>
                              <IconButton
                                onClick={() => toggleUserStatus(user.id)}
                                className={`${
                                  user.status === 'active'
                                    ? 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                                    : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                                }`}
                                size="small"
                              >
                                {user.status === 'active' ? 
                                  <ToggleOnIcon fontSize="small" /> : 
                                  <ToggleOffIcon fontSize="small" />
                                }
                              </IconButton>
                            </Tooltip>
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
        open={resetPasswordDialog}
        onClose={handleCloseResetPassword}
        maxWidth="sm"
        fullWidth
        BackdropProps={{
          style: backdropStyle
        }}
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? 'rgb(31, 41, 55)' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          },
        }}
      >
        <DialogTitle>
          <div className="flex items-center">
            <LockIcon className="mr-2" style={{ color: isDarkMode ? '#fff' : '#000' }} />
            <span style={{ color: isDarkMode ? '#fff' : '#000' }}>Réinitialiser le mot de passe</span>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="mt-2 mb-4">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Vous êtes sur le point de réinitialiser le mot de passe de l'utilisateur : 
              <span className="font-bold ml-1">{resetPasswordData.userName}</span>
            </p>
            <p className="text-sm text-red-400 mt-1">
              Cette action est irréversible et le nouveau mot de passe prendra effet immédiatement.
            </p>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="relative">
              <TextField
                label="Nouveau mot de passe"
                variant="outlined"
                type={showNewPassword ? 'text' : 'password'}
                value={resetPasswordData.newPassword}
                onChange={handleResetPasswordChange}
                name="newPassword"
                fullWidth
                helperText="Minimum 8 caractères"
                InputLabelProps={{ style: { color: isDarkMode ? '#9ca3af' : undefined } }}
                InputProps={{ style: { color: isDarkMode ? '#fff' : undefined } }}
                FormHelperTextProps={{ style: { color: isDarkMode ? '#9ca3af' : undefined } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: isDarkMode ? '#4b5563' : undefined,
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? '#6b7280' : undefined,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkMode ? '#3b82f6' : undefined,
                    },
                  },
                }}
              />
              <IconButton
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '10px',
                  color: isDarkMode ? '#9ca3af' : undefined
                }}
              >
                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </div>
            
            <div className="relative mt-4">
              <TextField
                label="Votre mot de passe administrateur"
                variant="outlined"
                type={showAdminPassword ? 'text' : 'password'}
                value={resetPasswordData.adminPassword}
                onChange={handleResetPasswordChange}
                name="adminPassword"
                fullWidth
                helperText="Requis pour confirmer l'action"
                InputLabelProps={{ style: { color: isDarkMode ? '#9ca3af' : undefined } }}
                InputProps={{ style: { color: isDarkMode ? '#fff' : undefined } }}
                FormHelperTextProps={{ style: { color: isDarkMode ? '#9ca3af' : undefined } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: isDarkMode ? '#4b5563' : undefined,
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? '#6b7280' : undefined,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkMode ? '#3b82f6' : undefined,
                    },
                  },
                }}
              />
              <IconButton
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '10px',
                  color: isDarkMode ? '#9ca3af' : undefined
                }}
              >
                {showAdminPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </div>
          </div>
        </DialogContent>
        <DialogActions style={{ backgroundColor: isDarkMode ? 'rgb(31, 41, 55)' : '#fff' }}>
          <Button 
            onClick={handleCloseResetPassword} 
            style={{ color: isDarkMode ? '#9ca3af' : undefined }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleResetPasswordSubmit} 
            variant="contained"
            disabled={resetPasswordLoading}
            style={{ 
              backgroundColor: !resetPasswordLoading ? (isDarkMode ? '#3b82f6' : undefined) : undefined,
              color: isDarkMode ? '#fff' : undefined
            }}
          >
            {resetPasswordLoading ? 'En cours...' : 'Réinitialiser le mot de passe'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        BackdropProps={{
          style: backdropStyle
        }}
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
