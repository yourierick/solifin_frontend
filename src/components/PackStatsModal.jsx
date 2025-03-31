import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
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
  TextField,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from '../utils/axios';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PackStatsModal = ({ open, onClose, packId }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterGeneration, setFilterGeneration] = useState('all');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Définir les styles réutilisables
  const cardStyle = {
    bgcolor: isDarkMode ? 'rgba(131, 136, 141, 0.8)' : 'background.paper',
    backgroundImage: 'none',
    boxShadow: 'none'
  };

  const tableStyle = {
    bgcolor: isDarkMode ? 'rgba(73, 82, 95, 0.8)' : 'background.paper',
    backgroundImage: 'none',
    boxShadow: 'none',
    '& .MuiTableCell-root': {
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    }
  };

  useEffect(() => {
    if (open && packId) {
      fetchStats();
    }
  }, [open, packId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/packs/${packId}/detailed-stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      setError('Erreur lors de la récupération des statistiques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Configuration des graphiques
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
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    }
  };

  // Composant pour les statistiques générales
  const GeneralStats = () => {
    // Trouver le mois avec le plus de gains
    const bestMonth = Object.entries(stats?.progression?.monthly_commissions || {})
      .reduce((best, [month, amount]) => {
        const currentAmount = parseFloat(amount);
        return currentAmount > (best.amount || 0) 
          ? { month, amount: currentAmount } 
          : best;
      }, { month: '', amount: 0 });

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nombre total de filleuls
              </Typography>
              <Typography variant="h4">
                {stats?.general_stats.total_referrals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filleuls par génération
              </Typography>
              <Grid container spacing={2}>
                {stats?.general_stats.referrals_by_generation.map((count, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Typography variant="subtitle1">
                      {index + 1}ère génération
                    </Typography>
                    <Typography variant="h5">{count}</Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meilleure génération
              </Typography>
              <Typography variant="h5" color="primary">
                {stats?.general_stats.best_generation}ère génération
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Génération la plus rentable
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meilleur mois
              </Typography>
              <Typography variant="h5" color="primary">
                {bestMonth.amount.toFixed(2)} $
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {bestMonth.month}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statut des filleuls
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Actifs</Typography>
                  <Typography variant="h5">
                    {stats?.general_stats.active_referrals}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Inactifs</Typography>
                  <Typography variant="h5">
                    {stats?.general_stats.inactive_referrals}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Composant pour la progression et performances
  const ProgressionStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Évolution des inscriptions
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: Object.keys(stats?.progression.monthly_signups || {}),
                  datasets: [
                    {
                      label: 'Nouveaux filleuls',
                      data: Object.values(stats?.progression.monthly_signups || {}),
                      borderColor: theme.palette.primary.main,
                      tension: 0.4
                    }
                  ]
                }}
                options={chartOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Évolution des gains
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: Object.keys(stats?.progression.monthly_commissions || {}),
                  datasets: [
                    {
                      label: 'Commissions ($)',
                      data: Object.values(stats?.progression.monthly_commissions || {}),
                      borderColor: theme.palette.success.main,
                      tension: 0.4
                    }
                  ]
                }}
                options={chartOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {stats?.progression.top_referral && (
        <Grid item xs={12}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Filleul
              </Typography>
              <Typography variant="subtitle1">
                {stats.progression.top_referral.name}
              </Typography>
              <Typography variant="body1">
                A recruté {stats.progression.top_referral.recruit_count} personnes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  // Composant pour les activités des filleuls
  const ReferralActivities = () => (
    <TableContainer component={Paper} sx={tableStyle}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Nom du pack</TableCell>
            <TableCell>Date d'achat</TableCell>
            <TableCell>Date d'expiration</TableCell>
            <TableCell>Durée de validité (mois)</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats?.latest_referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell>{referral.name}</TableCell>
              <TableCell>{referral.pack_name}</TableCell>
              <TableCell>{referral.purchase_date}</TableCell>
              <TableCell>{referral.expiry_date}</TableCell>
              <TableCell>{referral.validity_months.toFixed(0)}</TableCell>
              <TableCell>
                <Chip
                  label={referral.status === 'active' ? 'Actif' : 'Inactif'}
                  color={referral.status === 'active' ? 'success' : 'default'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Composant pour les graphiques et visualisations
  const Visualizations = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inscriptions par mois
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: Object.keys(stats?.progression.monthly_signups || {}),
                  datasets: [
                    {
                      label: 'Inscriptions',
                      data: Object.values(stats?.progression.monthly_signups || {}),
                      backgroundColor: theme.palette.primary.main
                    }
                  ]
                }}
                options={chartOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tendance des gains (6 derniers mois)
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: Object.keys(stats?.progression.monthly_commissions || {}),
                  datasets: [
                    {
                      label: 'Gains ($)',
                      data: Object.values(stats?.progression.monthly_commissions || {}),
                      borderColor: theme.palette.success.main,
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={chartOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Composant pour les informations financières
  const FinancialInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total des commissions
            </Typography>
            <Typography variant="h4">
              {stats?.financial_info.total_commission.toFixed(2)} $
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Derniers paiements reçus
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Génération</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.financial_info.latest_payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.amount} $</TableCell>
                      <TableCell>{payment.source}</TableCell>
                      <TableCell>{payment.level}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Composant pour les filtres et la recherche
  const FiltersAndSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterGeneration, setFilterGeneration] = useState('all');
    
    const filteredReferrals = stats?.all_referrals.filter(referral => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = referral.name.toLowerCase().includes(searchLower) ||
                          referral.pack_name.toLowerCase().includes(searchLower);
      
      const matchesGeneration = filterGeneration === 'all' || 
                               referral.generation === parseInt(filterGeneration);
      
      const matchesMonth = filterMonth === 'all' || 
                          (referral.purchase_date && referral.purchase_date.includes(filterMonth));
      
      return matchesSearch && matchesGeneration && matchesMonth;
    });

    // Générer les options pour le filtre par mois
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      };
    });

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher par nom ou pack"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Filtrer par mois"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <MenuItem value="all">Tous les mois</MenuItem>
                {monthOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Filtrer par génération"
                value={filterGeneration}
                onChange={(e) => setFilterGeneration(e.target.value)}
              >
                <MenuItem value="all">Toutes les générations</MenuItem>
                {[1, 2, 3, 4].map((gen) => (
                  <MenuItem key={gen} value={gen}>
                    {gen}ère génération
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper} sx={tableStyle}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Nom du pack</TableCell>
                <TableCell>Date d'achat</TableCell>
                <TableCell>Date d'expiration</TableCell>
                <TableCell>Durée de validité (mois)</TableCell>
                <TableCell>Génération</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReferrals?.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>{referral.name}</TableCell>
                  <TableCell>{referral.pack_name}</TableCell>
                  <TableCell>{referral.purchase_date}</TableCell>
                  <TableCell>{referral.expiry_date}</TableCell>
                  <TableCell>{referral.validity_months.toFixed(0)}</TableCell>
                  <TableCell>{referral.generation}</TableCell>
                  <TableCell>
                    <Chip
                      label={referral.status === 'active' ? 'Actif' : 'Inactif'}
                      color={referral.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isFullScreen ? false : "lg"}
      fullWidth
      fullScreen={isFullScreen}
      PaperProps={{
        sx: {
          minHeight: isFullScreen ? '100vh' : '80vh',
          maxHeight: isFullScreen ? '100vh' : '80vh',
          bgcolor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
        color: isDarkMode ? 'grey.100' : 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>Statistiques et Performances</div>
        <IconButton
          onClick={() => setIsFullScreen(!isFullScreen)}
          sx={{ ml: 1 }}
        >
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        bgcolor: 'transparent',
        color: isDarkMode ? 'grey.100' : 'text.primary',
        p: 0,
        '& .MuiCard-root': {
          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        '& .MuiTableContainer-root': {
          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        '& .MuiTableCell-root': {
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          color: isDarkMode ? 'grey.300' : 'inherit'
        },
        '& .MuiTextField-root .MuiOutlinedInput-root': {
          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 1)'
          }
        }
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Chargement...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                '& .MuiTab-root': {
                  color: isDarkMode ? 'grey.400' : 'text.secondary',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 3,
                  '&.Mui-selected': {
                    color: isDarkMode ? 'primary.light' : 'primary.main'
                  }
                }
              }}
            >
              <Tab label="Statistiques générales" />
              <Tab label="Progression et performances" />
              <Tab label="Activités des filleuls" />
              <Tab label="Graphiques et visualisations" />
              <Tab label="Informations financières" />
              <Tab label="Filtres et recherche" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {currentTab === 0 && <GeneralStats />}
              {currentTab === 1 && <ProgressionStats />}
              {currentTab === 2 && <ReferralActivities />}
              {currentTab === 3 && <Visualizations />}
              {currentTab === 4 && <FinancialInfo />}
              {currentTab === 5 && <FiltersAndSearch />}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
        borderTop: 1,
        borderColor: 'divider',
        p: 2
      }}>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackStatsModal;
