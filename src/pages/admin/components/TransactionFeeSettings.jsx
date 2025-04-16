import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon, 
  PlusIcon,
  CheckCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_URL } from '../../../config';

const TransactionFeeSettings = () => {
  const { isDarkMode } = useTheme();
  const [transactionFees, setTransactionFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [currentFee, setCurrentFee] = useState({
    payment_method: '',
    provider: '',
    transfer_fee_percentage: 0,
    withdrawal_fee_percentage: 0,
    purchase_fee_percentage: 0,
    min_fee_amount: 0,
    max_fee_amount: null,
    currency: 'CDF',
    is_active: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [updatingFromApi, setUpdatingFromApi] = useState(false);

  useEffect(() => {
    fetchTransactionFees();
  }, []);

  const fetchTransactionFees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/transaction-fees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setTransactionFees(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des frais de transaction:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la récupération des frais de transaction',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, fee = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && fee) {
      setCurrentFee({
        ...fee,
        max_fee_amount: fee.max_fee_amount || ''
      });
    } else {
      setCurrentFee({
        payment_method: '',
        provider: '',
        transfer_fee_percentage: 0,
        withdrawal_fee_percentage: 0,
        purchase_fee_percentage: 0,
        min_fee_amount: 0,
        max_fee_amount: '',
        currency: 'CDF',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setCurrentFee({ ...currentFee, [name]: checked });
    } else if (['transfer_fee_percentage', 'withdrawal_fee_percentage', 'purchase_fee_percentage', 'min_fee_amount', 'max_fee_amount'].includes(name)) {
      // Convertir en nombre ou laisser vide pour max_fee_amount
      const numValue = value === '' ? (name === 'max_fee_amount' ? '' : 0) : parseFloat(value);
      setCurrentFee({ ...currentFee, [name]: numValue });
    } else {
      setCurrentFee({ ...currentFee, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      // Préparer les données à envoyer
      const dataToSend = {
        ...currentFee,
        max_fee_amount: currentFee.max_fee_amount === '' ? null : currentFee.max_fee_amount
      };

      let response;
      if (dialogMode === 'add') {
        response = await axios.post(`${API_URL}/admin/transaction-fees`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        response = await axios.put(`${API_URL}/admin/transaction-fees/${currentFee.id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      if (response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: dialogMode === 'add' 
            ? 'Frais de transaction ajoutés avec succès' 
            : 'Frais de transaction mis à jour avec succès',
          severity: 'success'
        });
        fetchTransactionFees();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Erreur lors de la soumission des frais de transaction:', error);
      let errorMessage = 'Une erreur est survenue';
      
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ces frais de transaction ?')) {
      try {
        const response = await axios.delete(`${API_URL}/admin/transaction-fees/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.status === 'success') {
          setSnackbar({
            open: true,
            message: 'Frais de transaction supprimés avec succès',
            severity: 'success'
          });
          fetchTransactionFees();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression des frais de transaction:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression des frais de transaction',
          severity: 'error'
        });
      }
    }
  };

  const handleUpdateFromApi = async () => {
    setUpdatingFromApi(true);
    try {
      const response = await axios.post(`${API_URL}/admin/transaction-fees/update-from-api`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Frais de transaction mis à jour depuis l\'API avec succès',
          severity: 'success'
        });
        fetchTransactionFees();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour depuis l\'API:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour depuis l\'API',
        severity: 'error'
      });
    } finally {
      setUpdatingFromApi(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="text-gray-900 dark:text-white w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          Gestion des frais de transaction
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleOpenDialog('add')}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Ajouter
          </button>
          <button 
            onClick={handleUpdateFromApi}
            disabled={updatingFromApi}
            className="flex items-center px-4 py-2 border border-green-500 text-green-500 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            {updatingFromApi ? 'Mise à jour...' : 'Mettre à jour depuis l\'API'}
            {updatingFromApi && (
              <CircularProgress size={16} className="ml-2" />
            )}
          </button>
        </div>
      </div>

      <div className='bg-white dark:bg-[#1e283b] rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700'>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-white">
            <thead className="bg-gray-50 dark:bg-[#1e293b]/80 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Moyen de paiement</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fournisseur</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frais de transfert (%)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frais de retrait (%)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frais d'achat (%)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min. frais</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max. frais</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Devise</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2d3748] bg-white dark:bg-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-4 text-center">
                    <CircularProgress />
                  </td>
                </tr>
              ) : transactionFees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-4 text-center">
                    Aucun frais de transaction configuré
                  </td>
                </tr>
              ) : (
                transactionFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-[#2d3748]/50 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <td className="px-3 py-4 whitespace-nowrap">{getPaymentMethodLabel(fee.payment_method)}</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.provider}</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.transfer_fee_percentage}%</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.withdrawal_fee_percentage}%</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.purchase_fee_percentage}%</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.min_fee_amount}</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.max_fee_amount}</td>
                    <td className="px-3 py-4 whitespace-nowrap">{fee.currency}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      {fee.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Actif</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Inactif</span>
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex space-x-1 justify-end">
                        <button 
                          onClick={() => handleOpenDialog('edit', fee)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(fee)}
                          className={`${fee.is_active ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'} p-1`}
                        >
                          {fee.is_active ? <NoSymbolIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog pour ajouter/modifier des frais */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          className: 'bg-white dark:bg-[#1e283b] text-gray-900 dark:text-white',
          sx: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem'
          }
        }}
      >
        <DialogTitle className="border-b border-gray-200 dark:border-gray-700 text-xl font-medium text-gray-900 dark:text-white">
          {dialogMode === 'add' ? 'Ajouter des frais de transaction' : 'Modifier des frais de transaction'}
        </DialogTitle>
        <DialogContent className="pt-4 bg-white dark:bg-[#1e283b] text-gray-900 dark:text-white">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="payment_method"
                label="Moyen de paiement"
                value={currentFee.payment_method}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="provider"
                label="Fournisseur"
                value={currentFee.provider}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" className="dark:bg-[#1e283b] dark:text-white">
                <InputLabel className="dark:text-gray-300">Devise</InputLabel>
                <Select
                  name="currency"
                  value={currentFee.currency}
                  onChange={handleInputChange}
                  label="Devise"
                  className="dark:bg-[#1e283b] dark:text-white"
                  MenuProps={{
                    classes: {
                      paper: 'dark:bg-[#1e283b] dark:text-white'
                    }
                  }}
                >
                  <MenuItem value="CDF">CDF (Franc Congolais)</MenuItem>
                  <MenuItem value="XOF">XOF (Franc CFA BCEAO)</MenuItem>
                  <MenuItem value="XAF">XAF (Franc CFA BEAC)</MenuItem>
                  <MenuItem value="EUR">EUR (Euro)</MenuItem>
                  <MenuItem value="USD">USD (Dollar américain)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="transfer_fee_percentage"
                label="Frais de transfert (%)"
                value={currentFee.transfer_fee_percentage}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="withdrawal_fee_percentage"
                label="Frais de retrait (%)"
                value={currentFee.withdrawal_fee_percentage}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="purchase_fee_percentage"
                label="Frais d'achat (%)"
                value={currentFee.purchase_fee_percentage}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="min_fee_amount"
                label="Montant minimum des frais"
                value={currentFee.min_fee_amount}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 1 }}
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="max_fee_amount"
                label="Montant maximum des frais (optionnel)"
                value={currentFee.max_fee_amount}
                onChange={handleInputChange}
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 1 }}
                margin="normal"
                className="dark:bg-[#1e283b] dark:text-white"
                InputLabelProps={{ className: 'dark:text-gray-300' }}
                InputProps={{ className: 'dark:bg-[#1e283b] dark:text-white' }}
                helperText="Laissez vide pour ne pas définir de maximum"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={currentFee.is_active}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="border-t border-gray-200 dark:border-gray-700 py-3 px-4">
          <button 
            onClick={handleCloseDialog} 
            className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            {dialogMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
          </button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TransactionFeeSettings;
