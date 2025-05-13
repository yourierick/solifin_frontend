import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant principal
const Finances = () => {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // États pour les données
  const [transactions, setTransactions] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemBalance, setSystemBalance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [statsByType, setStatsByType] = useState([]);
  const [statsByPeriod, setStatsByPeriod] = useState([]);

  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // États pour les onglets
  const [activeTab, setActiveTab] = useState(0);

  // États pour le modal de détails de transaction
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    fetchTransactionTypes();
    fetchSystemBalance();
    fetchSummary();
    fetchTransactions();
    fetchStatsByType();
  }, []);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    if (!loading) {
      fetchTransactions();
      fetchStatsByType();
      fetchStatsByPeriod();
    }
  }, [filters]);

  // Fonction pour récupérer les transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      
      const response = await axios.get('/api/admin/finances', { params });
      
      if (response.data.success) {
        setTransactions(response.data.data.data);
        setError(null);
      } else {
        setError(response.data.message || 'Erreur lors du chargement des transactions');
      }
    } catch (err) {
      setError('Erreur lors du chargement des transactions: ' + (err.response?.data?.message || err.message));
      console.error('Erreur lors du chargement des transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les types de transactions
  const fetchTransactionTypes = async () => {
    try {
      const response = await axios.get('/api/admin/finances/transaction-types');
      
      if (response.data.success) {
        setTransactionTypes(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des types de transactions:', err);
    }
  };

  // Fonction pour récupérer le solde du système
  const fetchSystemBalance = async () => {
    try {
      const response = await axios.get('/api/admin/finances/system-balance');
      
      if (response.data.success) {
        setSystemBalance(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du solde du système:', err);
    }
  };

  // Fonction pour récupérer le résumé des finances
  const fetchSummary = async () => {
    try {
      const params = {};
      
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      
      const response = await axios.get('/api/admin/finances/summary', { params });
      
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du résumé des finances:', err);
    }
  };

  // Fonction pour récupérer les statistiques par type
  const fetchStatsByType = async () => {
    try {
      const params = {};
      
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      
      const response = await axios.get('/api/admin/finances/stats-by-type', { params });
      
      if (response.data.success) {
        setStatsByType(response.data.data.stats);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques par type:', err);
    }
  };

  // Fonction pour récupérer les statistiques par période
  const fetchStatsByPeriod = async () => {
    try {
      const params = {
        period: 'month'
      };
      
      if (filters.type) params.type = filters.type;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      
      const response = await axios.get('/api/admin/finances/stats-by-period', { params });
      
      if (response.data.success) {
        setStatsByPeriod(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques par période:', err);
    }
  };

  // Gestionnaire de changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Gestionnaire de changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gestionnaire de changement de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestionnaire de changement de filtre
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Fonction pour ouvrir le modal avec les détails d'une transaction
  const handleOpenTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenTransactionModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseTransactionModal = () => {
    setOpenTransactionModal(false);
    setSelectedTransaction(null);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Finances
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Consultez et analysez les transactions financières du système
      </Typography>
      
      {/* Cartes de résumé financier */}
      {systemBalance && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              boxShadow: 'none',
              border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
              borderRadius: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDarkMode ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                right: -15, 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                opacity: 0.1 
              }} />
              <CardContent sx={{ position: 'relative', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Solde actuel
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    borderRadius: '50%'
                  }}>
                    <AccountBalanceIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                </Box>
                <Typography variant="h5" component="div" sx={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700,
                  color: isDarkMode ? '#fff' : 'text.primary'
                }}>
                  {formatAmount(systemBalance.balance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              boxShadow: 'none',
              border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`,
              borderRadius: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDarkMode ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                right: -15, 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'success.main', 
                opacity: 0.1 
              }} />
              <CardContent sx={{ position: 'relative', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Total des entrées
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'success.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    borderRadius: '50%'
                  }}>
                    <AttachMoneyIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                </Box>
                <Typography variant="h5" component="div" sx={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700,
                  color: isDarkMode ? '#fff' : 'text.primary'
                }}>
                  {formatAmount(systemBalance.total_in)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              boxShadow: 'none',
              border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`,
              borderRadius: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDarkMode ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                right: -15, 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'error.main', 
                opacity: 0.1 
              }} />
              <CardContent sx={{ position: 'relative', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Total des sorties
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'error.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    borderRadius: '50%'
                  }}>
                    <MoneyOffIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                </Box>
                <Typography variant="h5" component="div" sx={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700,
                  color: isDarkMode ? '#fff' : 'text.primary'
                }}>
                  {formatAmount(systemBalance.total_out)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.05)',
              boxShadow: 'none',
              border: `1px solid ${isDarkMode ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)'}`,
              borderRadius: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDarkMode ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                right: -15, 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'info.main', 
                opacity: 0.1 
              }} />
              <CardContent sx={{ position: 'relative', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" color="info.main" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Transactions
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'info.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    borderRadius: '50%'
                  }}>
                    <TrendingUpIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                </Box>
                <Typography variant="h5" component="div" sx={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700,
                  color: isDarkMode ? '#fff' : 'text.primary'
                }}>
                  {transactions.length > 0 ? transactions.length : '---'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Filtres */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        bgcolor: isDarkMode ? '#1f2937' : '#fff',
        borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Filtres
          </Typography>
          <Box>
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              color="primary"
              size="small"
            >
              <FilterListIcon />
            </IconButton>
            <IconButton 
              onClick={resetFilters}
              color="default"
              size="small"
              sx={{ ml: 1 }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {showFilters && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 2, 
            alignItems: 'center',
            mt: 2 
          }}>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 150,
                bgcolor: isDarkMode ? '#111827' : '#fff',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  },
                },
              }}
            >
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
                sx={{ 
                  color: isDarkMode ? '#fff' : 'inherit',
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : 'inherit'
                  }
                }}
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                {transactionTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 150,
                bgcolor: isDarkMode ? '#111827' : '#fff',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  },
                },
              }}
            >
              <InputLabel id="status-filter-label">Statut</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filters.status}
                label="Statut"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ 
                  color: isDarkMode ? '#fff' : 'inherit',
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : 'inherit'
                  }
                }}
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="completed">Complété</MenuItem>
                <MenuItem value="failed">Échoué</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Date de début"
              type="date"
              size="small"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                minWidth: 150,
                bgcolor: isDarkMode ? '#111827' : '#fff',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  },
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#fff' : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#9ca3af' : 'inherit',
                },
              }}
            />
            
            <TextField
              label="Date de fin"
              type="date"
              size="small"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                minWidth: 150,
                bgcolor: isDarkMode ? '#111827' : '#fff',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  },
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#fff' : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#9ca3af' : 'inherit',
                },
              }}
            />
            
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={() => {
                fetchTransactions();
                fetchStatsByType();
                fetchStatsByPeriod();
                fetchSummary();
              }}
              sx={{ ml: 'auto' }}
            >
              Appliquer
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Onglets */}
      <Paper sx={{ 
        p: 0, 
        mb: 3, 
        bgcolor: isDarkMode ? '#1f2937' : '#fff',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: isDarkMode ? '#374151' : 'divider',
            bgcolor: isDarkMode ? '#111827' : '#f8f9fa'
          }}
        >
          <Tab label="Transactions" />
          <Tab label="Statistiques par type" />
        </Tabs>
        
        {/* Tableau des transactions */}
        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            ) : transactions.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>Aucune transaction trouvée</Alert>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        bgcolor: isDarkMode ? '#111827' : '#f8f9fa',
                        '& th': { fontWeight: 'bold' }
                      }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((transaction) => (
                          <TableRow key={transaction.id} sx={{ 
                            '&:hover': { bgcolor: isDarkMode ? '#374151' : '#f8f9fa' },
                            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                          }}>
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>
                              <Chip 
                                label={transaction.type === "sales" ? "vente" : transaction.type === "transfer" ? "transfert des fonds" : transaction.type === "withdrawal" ? "retrait des fonds" : transaction.type === "reception" ? "dépôt des fonds" : transaction.type} 
                                size="small"
                                sx={{ 
                                  bgcolor: (() => {
                                    switch(transaction.type) {
                                      case 'withdrawal': return isDarkMode ? '#4b5563' : '#e5e7eb';
                                      case 'commission de parrainage': return isDarkMode ? '#065f46' : '#d1fae5';
                                      case 'commission de retrait': return isDarkMode ? '#1e40af' : '#dbeafe';
                                      case 'frais de retrait': return isDarkMode ? '#9f1239' : '#fee2e2';
                                      case 'frais de transfert': return isDarkMode ? '#92400e' : '#fef3c7';
                                      case 'bonus': return isDarkMode ? '#4f46e5' : '#e0e7ff';
                                      case 'sales': return isDarkMode ? '#064e3b' : '#d1fae5';
                                      default: return isDarkMode ? '#1f2937' : '#f3f4f6';
                                    }
                                  })(),
                                  color: isDarkMode ? '#fff' : '#111'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              color: transaction.type === 'withdrawal' ? 'error.main' : 'success.main',
                              fontWeight: 'bold'
                            }}>
                              {formatAmount(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={transaction.status === "completed" ? "complété" : transaction.status === "pending" ? "en attente" : transaction.status === "failed" ? "échoué" : transaction.status} 
                                size="small"
                                sx={{ 
                                  bgcolor: (() => {
                                    switch(transaction.status) {
                                      case 'pending': return isDarkMode ? '#92400e' : '#fef3c7';
                                      case 'completed': return isDarkMode ? '#065f46' : '#d1fae5';
                                      case 'failed': return isDarkMode ? '#9f1239' : '#fee2e2';
                                      default: return isDarkMode ? '#1f2937' : '#f3f4f6';
                                    }
                                  })(),
                                  color: isDarkMode ? '#fff' : '#111'
                                }}
                              />
                            </TableCell>
                            <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenTransactionDetails(transaction)}
                                color="primary"
                                title="Voir les détails"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={transactions.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                  sx={{ 
                    color: isDarkMode ? '#fff' : 'inherit',
                    '& .MuiTablePagination-selectIcon': {
                      color: isDarkMode ? '#fff' : 'inherit'
                    }
                  }}
                />
              </>
            )}
          </Box>
        )}
        
        {/* Statistiques par type */}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            {statsByType.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>Aucune statistique disponible</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: isDarkMode ? '#111827' : '#f8f9fa',
                      '& th': { fontWeight: 'bold' }
                    }}>
                      <TableCell>Type</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Montant total</TableCell>
                      <TableCell>Première transaction</TableCell>
                      <TableCell>Dernière transaction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsByType.map((stat) => (
                      <TableRow key={stat.type} sx={{ 
                        '&:hover': { bgcolor: isDarkMode ? '#374151' : '#f8f9fa' },
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>
                        <TableCell>
                          <Chip 
                            label={stat.type === "sales" ? "vente" : stat.type === "transfer" ? "transfert des fonds" : stat.type === "withdrawal" ? "retrait des fonds" : stat.type === "reception" ? "dépôt des fonds" : stat.type} 
                            size="small"
                            sx={{ 
                              bgcolor: (() => {
                                switch(stat.type) {
                                  case 'withdrawal': return isDarkMode ? '#4b5563' : '#e5e7eb';
                                  case 'commission de parrainage': return isDarkMode ? '#065f46' : '#d1fae5';
                                  case 'commission de retrait': return isDarkMode ? '#1e40af' : '#dbeafe';
                                  case 'frais de retrait': return isDarkMode ? '#9f1239' : '#fee2e2';
                                  case 'frais de transfert': return isDarkMode ? '#92400e' : '#fef3c7';
                                  case 'bonus': return isDarkMode ? '#4f46e5' : '#e0e7ff';
                                  case 'sales': return isDarkMode ? '#064e3b' : '#d1fae5';
                                  default: return isDarkMode ? '#1f2937' : '#f3f4f6';
                                }
                              })(),
                              color: isDarkMode ? '#fff' : '#111'
                            }}
                          />
                        </TableCell>
                        <TableCell>{stat.count}</TableCell>
                        <TableCell sx={{ 
                          color: stat.type === 'withdrawal' ? 'error.main' : 'success.main',
                          fontWeight: 'bold'
                        }}>
                          {formatAmount(stat.total_amount)}
                        </TableCell>
                        <TableCell>{formatDate(stat.first_transaction)}</TableCell>
                        <TableCell>{formatDate(stat.last_transaction)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>
      {/* Modal de détails de transaction */}
      <Dialog
        open={openTransactionModal}
        onClose={handleCloseTransactionModal}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? '#111827' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit',
            borderRadius: 2,
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <Typography variant="h6" component="div">
            Détails de la transaction #{selectedTransaction?.id}
          </Typography>
          <IconButton onClick={handleCloseTransactionModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selectedTransaction && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.8)',
                  borderRadius: 2,
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informations générales
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Type" 
                        secondary={
                          <Chip 
                            label={selectedTransaction.type === "sales" ? "vente" : selectedTransaction.type === "commission de parrainage" ? "commission de parrainage" : selectedTransaction.type === "commission de retrait" ? "commission de retrait" : selectedTransaction.type === "frais de retrait" ? "frais de retrait" : selectedTransaction.type === "frais de transfert" ? "frais de transfert" : selectedTransaction.type === "bonus" ? "bonus" : selectedTransaction.type} 
                            size="small"
                            sx={{ 
                              mt: 0.5,
                              bgcolor: (() => {
                                switch(selectedTransaction.type) {
                                  case 'withdrawal': return isDarkMode ? '#4b5563' : '#e5e7eb';
                                  case 'commission de parrainage': return isDarkMode ? '#065f46' : '#d1fae5';
                                  case 'commission de retrait': return isDarkMode ? '#1e40af' : '#dbeafe';
                                  case 'frais de retrait': return isDarkMode ? '#9f1239' : '#fee2e2';
                                  case 'frais de transfert': return isDarkMode ? '#92400e' : '#fef3c7';
                                  case 'bonus': return isDarkMode ? '#4f46e5' : '#e0e7ff';
                                  case 'sales': return isDarkMode ? '#064e3b' : '#d1fae5';
                                  default: return isDarkMode ? '#1f2937' : '#f3f4f6';
                                }
                              })(),
                              color: isDarkMode ? '#fff' : '#111'
                            }}
                          />
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Montant" 
                        secondary={formatAmount(selectedTransaction.amount)} 
                        secondaryTypographyProps={{ 
                          sx: { 
                            fontWeight: 'bold', 
                            color: selectedTransaction.amount >= 0 ? 'success.main' : 'error.main' 
                          } 
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Statut" 
                        secondary={
                          <Chip 
                            label={selectedTransaction.status} 
                            size="small"
                            sx={{ mt: 0.5 }}
                            color={selectedTransaction.status === 'completed' ? 'success' : selectedTransaction.status === 'pending' ? 'warning' : selectedTransaction.status === 'failed' ? 'error' : 'default'}
                            icon={selectedTransaction.status === 'completed' ? <CheckCircleIcon /> : selectedTransaction.status === 'pending' ? <HourglassEmptyIcon /> : selectedTransaction.status === 'failed' ? <ErrorIcon /> : null}
                          />
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Date de création" 
                        secondary={format(new Date(selectedTransaction.created_at), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Date de mise à jour" 
                        secondary={format(new Date(selectedTransaction.updated_at), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.8)',
                  borderRadius: 2,
                  height: '100%',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Métadonnées
                  </Typography>
                  {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 ? (
                    <List dense>
                      {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                        <React.Fragment key={key}>
                          <ListItem>
                            <ListItemText 
                              primary={key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} 
                              secondary={typeof value === 'object' ? JSON.stringify(value) : String(value)} 
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune métadonnée disponible pour cette transaction
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseTransactionModal} 
            variant="outlined" 
            startIcon={<CloseIcon />}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Finances;