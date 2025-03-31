import React, { useState, useEffect } from 'react';
import {
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
  Chip,
  CircularProgress,
  Alert
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
import axios from '../../utils/axios';
import { Star, StarBorder } from '@mui/icons-material';

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

export default function Stats() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stats/global');
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
              <Typography variant="h6" style={{ fontWeight: 'bold' }} gutterBottom>
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
              <Typography variant="p" style={{ fontWeight: 'bold' }} gutterBottom>
                Filleuls par génération (tous packs confondus)
              </Typography>
              <Grid container spacing={2}>
                {stats?.general_stats.referrals_by_generation.map((count, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Typography variant="subtitle1" style={{ fontStyle: 'italic', fontSize : "10pt" }}>
                      {index + 1}e génération
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
              <Typography variant="p" style={{ fontWeight: 'bold' }} gutterBottom>
                Meilleure génération
              </Typography>
              <Typography variant="h6" color="primary">
                {stats?.general_stats.best_generation}e génération
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
              <Typography variant="p" style={{ fontWeight: 'bold' }} gutterBottom>
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
              <Typography variant="p" style={{ fontWeight: 'bold' }} gutterBottom>
                Statut des filleuls
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h6" style={{ fontSize: '10pt', fontStyle: 'italic' }}>Actifs</Typography>
                  <Typography variant="p" style={{ fontSize: '14pt' }}>
                    {stats?.general_stats.active_referrals}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" style={{ fontSize: '11pt', fontStyle: 'italic' }}>Inactifs</Typography>
                  <Typography variant="p" style={{ fontSize: '14pt' }}>
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
  const ProgressionStats = () => {
    const renderStars = (performance) => {
      if (!performance) return null;
      
      const stars = [];
      for (let i = 0; i < 5; i++) {
        stars.push(
          <Box
            component="span"
            key={i}
            sx={{ 
              display: 'inline-flex',
              color: performance.color === 'error' ? '#f44336' :
                     performance.color === 'warning' ? '#ff9800' :
                     performance.color === 'primary' ? '#2196f3' :
                     '#4caf50' // success
            }}
          >
            {i < (performance.stars || 0) ? <Star /> : <StarBorder />}
          </Box>
        );
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {stars}
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({performance.monthly_count || 0} membres en {performance.month || '-'})
          </Typography>
        </Box>
      );
    };

    if (!stats?.packs_performance?.length) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="body1">
                  Aucune donnée de performance disponible
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des inscriptions (tous packs)
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
                Évolution des gains totaux
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
        <Grid item xs={12}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance par pack
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pack</TableCell>
                      <TableCell>Nombre de filleuls</TableCell>
                      <TableCell>Commissions générées</TableCell>
                      <TableCell>Performance mensuelle</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.packs_performance?.map((pack) => (
                      <TableRow key={pack?.id || 'unknown'}>
                        <TableCell>{pack?.name || '-'}</TableCell>
                        <TableCell>{pack?.total_referrals || 0}</TableCell>
                        <TableCell>{Number(pack?.total_commissions || 0).toFixed(2)} $</TableCell>
                        <TableCell>{renderStars(pack?.performance)}</TableCell>
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
  };

  // Composant pour les activités des filleuls
  const ReferralActivities = () => (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dernières activités des filleuls
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Pack</TableCell>
                <TableCell>Date d'achat</TableCell>
                <TableCell>Date d'expiration</TableCell>
                <TableCell>Génération</TableCell>
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
                  <TableCell>{referral.generation}e</TableCell>
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
      </CardContent>
    </Card>
  );

  // Composant pour les graphiques et visualisations
  const Visualizations = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution des filleuls par pack
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: stats?.visualizations.referrals_by_pack.map(p => p.pack_name),
                  datasets: [
                    {
                      label: 'Nombre de filleuls',
                      data: stats?.visualizations.referrals_by_pack.map(p => p.count),
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
              Répartition des gains par pack
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: stats?.visualizations.commissions_by_pack.map(p => p.pack_name),
                  datasets: [
                    {
                      label: 'Commissions ($)',
                      data: stats?.visualizations.commissions_by_pack.map(p => p.amount),
                      backgroundColor: theme.palette.success.main
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
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Derniers paiements reçus
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Génération</TableCell>
                    <TableCell align="right">Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.financial_info.latest_payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.source}</TableCell>
                      <TableCell>{payment.level}e génération</TableCell>
                      <TableCell align="right">{Number(payment.amount).toFixed(2)} $</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Résumé financier
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {Number(stats?.financial_info.total_commission).toFixed(2)} $
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Total des commissions
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const cardStyle = {
    bgcolor: isDarkMode ? 'rgba(32, 63, 99, 0.2)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Statistiques Globales
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            bgcolor: isDarkMode ? 'rgba(32, 63, 99, 0.2)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: 1,
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
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {currentTab === 0 && <GeneralStats />}
        {currentTab === 1 && <ProgressionStats />}
        {currentTab === 2 && <ReferralActivities />}
        {currentTab === 3 && <Visualizations />}
        {currentTab === 4 && <FinancialInfo />}
      </Box>
    </Box>
  );
} 