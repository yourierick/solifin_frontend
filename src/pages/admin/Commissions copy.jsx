import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  InputAdornment,
  Pagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {
    // ... autres imports existants
    TableSortLabel,
    TablePagination,
    // ... autres imports existants
  } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import axios from '../../utils/axios';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const Commissions = () => {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCommissions, setAllCommissions] = useState([]);
  const [filteredCommissions, setFilteredCommissions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [packs, setPacks] = useState([]);
  const [commonErrors, setCommonErrors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    total: 0,
    perPage: 10
  });
  // Filtres locaux
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPack, setFilterPack] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const searchInputRef = useRef(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    fetchCommissions();
    fetchStatistics();
    fetchPacks();
    fetchCommonErrors();
  }, [pagination.page, pagination.perPage]);
  
  // Effet pour filtrer les commissions localement
  useEffect(() => {
    if (allCommissions.length > 0) {
      applyLocalFilters();
    }
  }, [allCommissions, filterStatus, filterPack, filterLevel, filterSearch]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/commissions', {
        params: {
          page: 1,
          per_page: 1000 // Récupérer un grand nombre de commissions pour filtrage local
        }
      });
      
      if (response.data.success) {
        setAllCommissions(response.data.data.data);
        setFilteredCommissions(response.data.data.data); // Initialiser avec toutes les commissions
        setPagination({
          ...pagination,
          total: response.data.data.total
        });
      }
    } catch (error) {
      setError('Erreur lors de la récupération des commissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour appliquer les filtres localement
  const applyLocalFilters = () => {
    let result = [...allCommissions];
    
    // Filtre par statut
    if (filterStatus) {
      result = result.filter(commission => commission.status === filterStatus);
    }
    
    // Filtre par pack
    if (filterPack) {
      result = result.filter(commission => 
        commission.pack_id && commission.pack_id.toString() === filterPack.toString()
      );
    }
    
    // Filtre par niveau
    if (filterLevel) {
      result = result.filter(commission => 
        commission.level && commission.level.toString() === filterLevel.toString()
      );
    }
    
    // Filtre par recherche
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      result = result.filter(commission => {
        const id = commission.id?.toString() || '';
        const sponsorName = commission.sponsor_user?.name?.toLowerCase() || '';
        const sponsorEmail = commission.sponsor_user?.email?.toLowerCase() || '';
        const sourceName = commission.source_user?.name?.toLowerCase() || '';
        const sourceEmail = commission.source_user?.email?.toLowerCase() || '';
        const packName = commission.pack?.name?.toLowerCase() || '';
        
        return id.includes(searchLower) || 
               sponsorName.includes(searchLower) || 
               sponsorEmail.includes(searchLower) || 
               sourceName.includes(searchLower) || 
               sourceEmail.includes(searchLower) || 
               packName.includes(searchLower);
      });
    }
    
    setFilteredCommissions(result);
    setPagination(prev => ({
      ...prev,
      total: result.length
    }));
  };
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilterStatus('');
    setFilterPack('');
    setFilterLevel('');
    setSearchValue('');
    setFilterSearch('');
  };
  
  // Fonction pour appliquer la recherche
  const applySearch = () => {
    setFilterSearch(searchValue);
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/admin/commissions/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques', error);
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await axios.get('/api/admin/commissions/packs');
      if (response.data.success) {
        setPacks(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des packs', error);
    }
  };

  const fetchCommonErrors = async () => {
    try {
      const response = await axios.get('/api/admin/commissions/common-errors');
      if (response.data.success) {
        setCommonErrors(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des erreurs communes', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Pas de fonctions de filtrage

  // Pas de tri

  const handlePageChange = (event, newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  const handlePerPageChange = (event) => {
    setPagination({
      ...pagination,
      page: 0,
      perPage: parseInt(event.target.value, 10)
    });
  };

  const handleViewDetails = (commission) => {
    setSelectedCommission(commission);
    setDetailsDialog(true);
  };

  const handleRetryCommission = async (id) => {
    try {
      setRetryLoading(true);
      const response = await axios.post(`/api/admin/commissions/${id}/retry`);
      
      if (response.data.success) {
        toast.success('Commission relancée avec succès');
        fetchCommissions(); // Rafraîchir les commissions
        fetchStatistics(); // Rafraîchir les statistiques
        
        if (selectedCommission && selectedCommission.id === id) {
          setSelectedCommission(response.data.data);
        }
      } else {
        toast.error(response.data.message || 'Échec de la relance');
      }
    } catch (error) {
      toast.error('Erreur lors de la relance de la commission');
      console.error(error);
    } finally {
      setRetryLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'failed':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Complétée';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return status;
    }
  };

  // Composant pour les statistiques générales
  const StatisticsTab = () => {
    if (!statistics) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#fff' : '#000'
          }
        }
      }
    };

    const statusData = {
      labels: ['Complétées', 'En attente', 'Échouées'],
      datasets: [
        {
          data: [
            statistics.commissions_by_status.completed,
            statistics.commissions_by_status.pending,
            statistics.commissions_by_status.failed
          ],
          backgroundColor: [
            'rgba(76, 175, 80, 0.7)',
            'rgba(255, 152, 0, 0.7)',
            'rgba(244, 67, 54, 0.7)'
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(244, 67, 54, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    const monthlyData = {
      labels: statistics.monthly_commissions.map(item => item.month),
      datasets: [
        {
          label: 'Montant des commissions',
          data: statistics.monthly_commissions.map(item => item.total_amount),
          backgroundColor: 'rgba(33, 150, 243, 0.5)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    };

    const packData = {
      labels: statistics.commissions_by_pack.map(item => item.name),
      datasets: [
        {
          label: 'Commissions par pack',
          data: statistics.commissions_by_pack.map(item => item.total_amount),
          backgroundColor: [
            'rgba(33, 150, 243, 0.7)',
            'rgba(156, 39, 176, 0.7)',
            'rgba(233, 30, 99, 0.7)',
            'rgba(0, 188, 212, 0.7)',
            'rgba(255, 87, 34, 0.7)'
          ],
          borderWidth: 1
        }
      ]
    };

    const levelData = {
      labels: statistics.commissions_by_level.map(item => `Niveau ${item.level}`),
      datasets: [
        {
          label: 'Commissions par niveau',
          data: statistics.commissions_by_level.map(item => item.total_amount),
          backgroundColor: [
            'rgba(33, 150, 243, 0.7)',
            'rgba(76, 175, 80, 0.7)',
            'rgba(255, 152, 0, 0.7)',
            'rgba(244, 67, 54, 0.7)'
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Cartes de statistiques */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total des commissions</Typography>
                <Typography variant="h4" color="primary">
                  {statistics.total_commissions}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Montant total: {formatAmount(statistics.total_amount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commissions complétées</Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.completed_count}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {((statistics.completed_count / statistics.total_commissions) * 100).toFixed(1)}% du total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commissions en attente</Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.pending_count}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {((statistics.pending_count / statistics.total_commissions) * 100).toFixed(1)}% du total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commissions échouées</Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.failed_count}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {((statistics.failed_count / statistics.total_commissions) * 100).toFixed(1)}% du total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Graphiques */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Répartition par statut</Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={statusData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commissions par pack</Typography>
                <Box sx={{ height: 300 }}>
                  <Pie data={packData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Évolution mensuelle</Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={monthlyData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commissions par niveau</Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={levelData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Commissions récentes */}
          <Grid item xs={12}>
            <Card sx={{ 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commissions récentes</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Parrain</TableCell>
                        <TableCell>Filleul</TableCell>
                        <TableCell>Pack</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Niveau</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.recent_commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell>{commission.id}</TableCell>
                          <TableCell>{commission.sponsor_user?.name || '-'}</TableCell>
                          <TableCell>{commission.source_user?.name || '-'}</TableCell>
                          <TableCell>{commission.pack?.name || '-'}</TableCell>
                          <TableCell>{formatAmount(commission.amount)}</TableCell>
                          <TableCell>Niveau {commission.level}</TableCell>
                          <TableCell>
                            <Chip 
                              icon={getStatusIcon(commission.status)}
                              label={getStatusLabel(commission.status)}
                              color={getStatusColor(commission.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(commission.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Erreurs communes */}
          {commonErrors.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ 
                bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Erreurs les plus fréquentes</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Message d'erreur</TableCell>
                          <TableCell>Occurrences</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commonErrors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.error_message}</TableCell>
                            <TableCell>{error.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };
    // Composant pour la liste des commissions
    const CommissionsTab = () => {
        return (
          <Box sx={{ mt: 3 }}>
            {/* Filtres locaux */}
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      inputRef={searchInputRef}
                      label="Recherche"
                      variant="outlined"
                      fullWidth
                      defaultValue=""
                      inputProps={{
                        onChange: (e) => {
                          setSearchValue(e.target.value);
                        }
                      }}
                      placeholder="ID, nom, email..."
                      size="small"
                      autoComplete="off"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          applySearch();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        applySearch();
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }}
                      sx={{ ml: 1, height: '40px', minWidth: '40px', p: 0 }}
                    >
                      <SearchIcon />
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Statut"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: isDarkMode ? '#141c2f' : 'background.paper',
                            color: isDarkMode ? 'white' : 'inherit',
                            '& .MuiMenuItem-root:hover': {
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Tous</MenuItem>
                      <MenuItem value="completed">Complétées</MenuItem>
                      <MenuItem value="pending">En attente</MenuItem>
                      <MenuItem value="failed">Échouées</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Pack</InputLabel>
                    <Select
                      value={filterPack}
                      onChange={(e) => setFilterPack(e.target.value)}
                      label="Pack"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: isDarkMode ? '#141c2f' : 'background.paper',
                            color: isDarkMode ? 'white' : 'inherit',
                            '& .MuiMenuItem-root:hover': {
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {packs.map((pack) => (
                        <MenuItem key={pack.id} value={pack.id}>{pack.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Niveau</InputLabel>
                    <Select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      label="Niveau"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: isDarkMode ? '#141c2f' : 'background.paper',
                            color: isDarkMode ? 'white' : 'inherit',
                            '& .MuiMenuItem-root:hover': {
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Tous</MenuItem>
                      <MenuItem value="1">Niveau 1</MenuItem>
                      <MenuItem value="2">Niveau 2</MenuItem>
                      <MenuItem value="3">Niveau 3</MenuItem>
                      <MenuItem value="4">Niveau 4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {/* Bouton de réinitialisation des filtres */}
              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetFilters}
                  startIcon={<RefreshIcon />}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 1.5,
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    height: '32px'
                  }}
                >
                  Réinitialiser
                </Button>
              </Grid>
            </Paper>
    
            {/* Tableau des commissions */}
            <Paper sx={{ 
              width: '100%', 
              overflow: 'hidden',
              bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableSortLabel>
                              ID
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>Parrain</TableCell>
                          <TableCell>Filleul</TableCell>
                          <TableCell>Pack</TableCell>
                          <TableCell>
                            <TableSortLabel>
                              Montant
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel>
                              Niveau
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel>
                              Statut
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel>
                              Date
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCommissions.length > 0 ? (
                          filteredCommissions.map((commission) => (
                            <TableRow key={commission.id} hover>
                              <TableCell>{commission.id}</TableCell>
                              <TableCell>
                                {commission.sponsor_user ? (
                                  <Tooltip title={commission.sponsor_user.email}>
                                    <span>{commission.sponsor_user.name}</span>
                                  </Tooltip>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {commission.source_user ? (
                                  <Tooltip title={commission.source_user.email}>
                                    <span>{commission.source_user.name}</span>
                                  </Tooltip>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{commission.pack?.name || '-'}</TableCell>
                              <TableCell>{formatAmount(commission.amount)}</TableCell>
                              <TableCell>Niveau {commission.level}</TableCell>
                              <TableCell>
                                <Chip 
                                  icon={getStatusIcon(commission.status)}
                                  label={getStatusLabel(commission.status)}
                                  color={getStatusColor(commission.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{formatDate(commission.created_at)}</TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewDetails(commission)}
                                  title="Voir les détails"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                                {commission.status === 'failed' && (
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleRetryCommission(commission.id)}
                                    disabled={retryLoading}
                                    title="Relancer la commission"
                                  >
                                    <ReplayIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              Aucune commission trouvée
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={pagination.total}
                    rowsPerPage={pagination.perPage}
                    page={pagination.page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handlePerPageChange}
                    labelRowsPerPage="Lignes par page:"
                    labelDisplayedRows={({ from, to, count }) => `${from + 1}-${Math.min(to, count)} sur ${count}`}
                  />
                </>
              )}
            </Paper>
          </Box>
        );
      };
    
      // Dialogue de détails d'une commission
      const CommissionDetailsDialog = () => {
        if (!selectedCommission) return null;
    
        return (
          <Dialog 
            open={detailsDialog} 
            onClose={() => setDetailsDialog(false)}
            maxWidth="md"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
              },
              backdropFilter: 'blur(5px)'
            }}
          >
            <DialogTitle>
              Détails de la commission #{selectedCommission.id}
              <IconButton
                aria-label="close"
                onClick={() => setDetailsDialog(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Informations générales</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">ID</TableCell>
                        <TableCell>{selectedCommission.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Montant</TableCell>
                        <TableCell>{formatAmount(selectedCommission.amount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Niveau</TableCell>
                        <TableCell>Niveau {selectedCommission.level}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Statut</TableCell>
                        <TableCell>
                          <Chip 
                            icon={getStatusIcon(selectedCommission.status)}
                            label={getStatusLabel(selectedCommission.status)}
                            color={getStatusColor(selectedCommission.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Date de création</TableCell>
                        <TableCell>{formatDate(selectedCommission.created_at)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Dernière mise à jour</TableCell>
                        <TableCell>{formatDate(selectedCommission.updated_at)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
    
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Utilisateurs</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">Parrain</TableCell>
                        <TableCell>
                          {selectedCommission.sponsor_user ? (
                            <>
                              <Typography variant="body2">{selectedCommission.sponsor_user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedCommission.sponsor_user.email}
                              </Typography>
                            </>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Filleul</TableCell>
                        <TableCell>
                          {selectedCommission.source_user ? (
                            <>
                              <Typography variant="body2">{selectedCommission.source_user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedCommission.source_user.email}
                              </Typography>
                            </>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Pack</TableCell>
                        <TableCell>
                          {selectedCommission.pack ? (
                            <>
                              <Typography variant="body2">{selectedCommission.pack.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Prix: {formatAmount(selectedCommission.pack.price)}
                              </Typography>
                            </>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
    
                {selectedCommission.status === 'failed' && selectedCommission.error_message && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">Message d'erreur:</Typography>
                      <Typography variant="body2">{selectedCommission.error_message}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedCommission.status === 'failed' && (
                <Button 
                  onClick={() => handleRetryCommission(selectedCommission.id)} 
                  color="primary"
                  disabled={retryLoading}
                  startIcon={<ReplayIcon />}
                >
                  Relancer la commission
                </Button>
              )}
              <Button onClick={() => setDetailsDialog(false)} color="inherit">
                Fermer
              </Button>
            </DialogActions>
          </Dialog>
        );
      };
    
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>Gestion des commissions</Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              aria-label="tabs de gestion des commissions"
            >
              <Tab label="Statistiques" />
              <Tab label="Liste des commissions" />
            </Tabs>
          </Box>
    
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
    
          {currentTab === 0 && <StatisticsTab />}
          {currentTab === 1 && <CommissionsTab />}
          <CommissionDetailsDialog />
        </Box>
      );
    };
    
    export default Commissions;