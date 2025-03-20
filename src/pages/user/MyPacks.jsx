import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../../utils/axios';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowDownTrayIcon, ChartBarIcon, UsersIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import Notification from '../../components/Notification';
import Tree from 'react-d3-tree';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import PackStatsModal from '../../components/PackStatsModal';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';

const CustomNode = ({ nodeDatum, isDarkMode, toggleNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = {
    background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    shadow: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)',
    generation: isDarkMode ? [
      '#3B82F6',  // Vous
      '#10B981',  // Gen 1
      '#F59E0B',  // Gen 2
      '#EC4899',  // Gen 3
      '#8B5CF6'   // Gen 4
    ] : [
      '#3B82F6',  // Vous
      '#10B981',  // Gen 1
      '#F59E0B',  // Gen 2
      '#EC4899',  // Gen 3
      '#8B5CF6'   // Gen 4
    ],
    tooltip: {
      background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      text: isDarkMode ? '#FFFFFF' : '#000000',
      textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      status: {
        active: isDarkMode ? '#6EE7B7' : '#059669',
        inactive: isDarkMode ? '#FCA5A5' : '#DC2626'
      }
    }
  };

  const nodeSize = 15;

  return (
    <g 
      onClick={toggleNode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Cercle principal */}
      <circle 
        r={nodeSize} 
        fill={colors.generation[nodeDatum.attributes.generation]}
        style={{
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* Tooltip avec animation */}
      <foreignObject
        x={-100}
        y={-(nodeSize + 80)}
        width={200}
        height={100}
        style={{
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      >
        <div
          style={{
            background: colors.tooltip.background,
            border: `1px solid ${colors.tooltip.border}`,
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(8px)',
            fontSize: '12px',
            color: colors.tooltip.text,
            width: 'max-content',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            visibility: isHovered ? 'visible' : 'hidden',
            position: 'absolute',
            left: '50%',
            transform: `translate(-50%, ${isHovered ? '0' : '10px'}) scale(${isHovered ? '1' : '0.95'})`,
            zIndex: 9999
          }}
        >
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '4px',
            fontSize: '14px',
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.05s'
          }}>
            {nodeDatum.name}
          </div>
          <div style={{ 
            color: colors.tooltip.textSecondary,
            marginBottom: '4px',
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
          }}>
            Commission: {nodeDatum.attributes.commission}
          </div>
          <div style={{ 
            color: nodeDatum.attributes.status === 'active' 
              ? colors.tooltip.status.active 
              : colors.tooltip.status.inactive,
            fontWeight: '500',
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.15s'
          }}>
            {nodeDatum.attributes.status === 'active' ? 'Actif' : 'Inactif'}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

const MyPacks = () => {
  const [userPacks, setUserPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewDialog, setRenewDialog] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [duration, setDuration] = useState(1);
  const [renewing, setRenewing] = useState(false);
  const { isDarkMode } = useTheme();
  const [statsDialog, setStatsDialog] = useState(false);
  const [referralsDialog, setReferralsDialog] = useState(false);
  const [currentPackStats, setCurrentPackStats] = useState(null);
  const [currentPackReferrals, setCurrentPackReferrals] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const treeRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchUserPacks();
  }, []);

  const fetchUserPacks = async () => {
    try {
      const response = await axios.get('/api/user/packs');
      if (response.data.success) {
        setUserPacks(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des packs:', error);
      Notification.error(error?.response?.data?.message || 'Impossible de charger vos packs');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewClick = (pack) => {
    setSelectedPack(pack);
    setDuration(1);
    setRenewDialog(true);
  };

  const handleRenewClose = () => {
    setRenewDialog(false);
    setSelectedPack(null);
    setDuration(1);
  };

  const calculateTotalPrice = () => {
    if (!selectedPack?.pack) return 0;
    return selectedPack.pack.price * duration;
  };

  const handleRenew = async () => {
    try {
      setRenewing(true);
      const response = await axios.post(`/api/packs/${selectedPack.pack_id}/renew`, {
        duration_months: duration
      });

      if (response.data.success) {
        Notification.success('Pack renouvelé avec succès');
        fetchUserPacks();
        handleRenewClose();
      }
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error);
      Notification.error(error.response?.data?.message || 'Erreur lors du renouvellement du pack');
    } finally {
      setRenewing(false);
    }
  };

  const handleDownload = async (packId) => {
    try {
      const response = await axios.get(`/api/packs/${packId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pack-${packId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Notification.error('Erreur lors du téléchargement du pack');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'expired':
        return 'Expiré';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  const handleStatsClick = (packId) => {
    setSelectedPackId(packId);
    setStatsDialog(true);
  };

  const handleReferralsClick = async (packId) => {
    try {
      const response = await axios.get(`/api/packs/${packId}/referrals`);
      
      // Vérification des données
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((generation, index) => {
        });
      }
      
      setCurrentPackReferrals(response.data.data);
      setCurrentTab(0);
      setSearchTerm('');
      setReferralsDialog(true);
    } catch (error) {
      console.error('Erreur complète:', error);
      Notification.error('Erreur lors du chargement des filleuls');
    }
  };

  const filteredReferrals = React.useMemo(() => {
    if (!currentPackReferrals) return [];
    
    const currentGeneration = currentPackReferrals[currentTab] || [];

    return currentGeneration.map(referral => {
      
      return {
        id: referral.id,
        name: referral.name,
        purchase_date: referral.purchase_date,
        pack_name: referral.pack_name,
        pack_price: referral.pack_price + " $",
        expiry_date: referral.expiry_date,
        referral_code: referral.referral_code,
        pack_status: referral.pack_status || 'inactive',
        total_commission: parseFloat(referral.total_commission || 0) + " $",
        sponsor_name: referral.sponsor_name
      };
    });
  }, [currentPackReferrals, currentTab]);

  const getColumnsForGeneration = (generation) => {
    const baseColumns = [
      { field: 'name', headerName: 'Nom', flex: 1, minWidth: 150 },
      {
        field: 'purchase_date',
        headerName: 'Date d\'achat',
        flex: 1,
        minWidth: 120,
      },
      { field: 'pack_name', headerName: 'Pack acheté', flex: 1, minWidth: 150 },
      {
        field: 'pack_price',
        headerName: 'Prix du pack',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'expiry_date',
        headerName: 'Date d\'expiration',
        flex: 1,
        minWidth: 120,
      },
      { field: 'referral_code', headerName: 'Code parrain', flex: 1, minWidth: 120 },
      {
        field: 'pack_status',
        headerName: 'Statut',
        flex: 1,
        minWidth: 100,
        renderCell: ({ value }) => (
          <Chip
            label={value === 'active' ? 'Actif' : 'Inactif'}
            color={value === 'active' ? 'success' : 'default'}
            size="small"
          />
        )
      },
      {
        field: 'total_commission',
        headerName: 'Commission totale',
        flex: 1,
        minWidth: 130,
      }
    ];

    if (generation >= 1) {
      baseColumns.splice(1, 0, {
        field: 'sponsor_name',
        headerName: 'Parrain',
        flex: 1,
        minWidth: 150
      });
    }

    return baseColumns;
  };

  // Calculer les statistiques de la génération actuelle
  const currentGenerationStats = React.useMemo(() => {
    if (!currentPackReferrals || !currentPackReferrals[currentTab]) return null;

    const referrals = currentPackReferrals[currentTab];
    return {
      total: referrals.length,
      totalCommission: referrals.reduce((sum, ref) => sum + parseFloat(ref.total_commission || 0), 0).toFixed(2)
    };
  }, [currentPackReferrals, currentTab]);

  const transformDataToTree = (referrals) => {
    const rootNode = {
      name: 'Vous',
      attributes: {
        commission: '0$',
        status: 'active',
        generation: 0
      },
      children: []
    };

    // Première génération
    if (referrals[0]) {
      rootNode.children = referrals[0].map(ref => ({
        name: ref.name,
        attributes: {
          commission: `${parseFloat(ref.total_commission || 0).toFixed(2)}$`,
          status: ref.pack_status,
          generation: 1,
          userId: ref.id
        },
        children: []
      }));

      // Générations 2 à 4
      for (let gen = 2; gen <= 4; gen++) {
        if (referrals[gen - 1]) {
          const currentGenRefs = referrals[gen - 1];
          
          // Fonction récursive pour trouver le nœud parent
          const findParentNode = (nodes, sponsorId) => {
            for (let node of nodes) {
              if (node.attributes.userId === sponsorId) {
                return node;
              }
              if (node.children) {
                const found = findParentNode(node.children, sponsorId);
                if (found) return found;
              }
            }
            return null;
          };

          // Ajouter chaque filleul à son parent
          currentGenRefs.forEach(ref => {
            const parentNode = findParentNode(rootNode.children, ref.sponsor_id);
            if (parentNode) {
              if (!parentNode.children) parentNode.children = [];
              parentNode.children.push({
                name: ref.name,
                attributes: {
                  commission: `${parseFloat(ref.total_commission || 0).toFixed(2)}$`,
                  status: ref.pack_status,
                  generation: gen,
                  userId: ref.id,
                  sponsorId: ref.sponsor_id,
                  sponsorName: ref.sponsor_name
                },
                children: []
              });
            }
          });
        }
      }
    }

    return rootNode;
  };

  // Fonction d'export Excel
  const exportToExcel = (data, fileName) => {
    // Préparer les données avec le bon format de date
    const formattedData = data.map(row => ({
      Nom: row.name,
      ...(row.sponsor_name && { Parrain: row.sponsor_name }),
      "Date d'achat": new Date(row.purchase_date).toLocaleDateString('fr-FR'),
      "Pack acheté": row.pack_name,
      "Prix du pack": `${row.pack_price}$`,
      "Date d'expiration": row.expiry_date ? new Date(row.expiry_date).toLocaleDateString('fr-FR') : 'N/A',
      "Code parrain": row.referral_code,
      Statut: row.pack_status === 'active' ? 'Actif' : 'Inactif',
      "Commission totale": `${parseFloat(row.total_commission || 0).toFixed(2)}$`
    }));

    // Créer le workbook et la feuille de calcul
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Ajouter la date d'exportation et la commission totale générée en haut
    const totalCommission = data.reduce((sum, ref) => sum + parseFloat(ref.total_commission || 0), 0);
    XLSX.utils.sheet_add_aoa(worksheet, [
      [`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`],
      [`Commission totale générée: ${totalCommission.toFixed(2)}$`]
    ], { origin: -1 });

    // Définir la largeur des colonnes
    const colWidths = [
      { wch: 20 }, // Nom
      { wch: 20 }, // Parrain (si présent)
      { wch: 15 }, // Date d'achat
      { wch: 20 }, // Pack acheté
      { wch: 15 }, // Prix du pack
      { wch: 15 }, // Date d'expiration
      { wch: 15 }, // Code parrain
      { wch: 10 }, // Statut
      { wch: 15 }, // Commission
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Filleuls");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, `${fileName}.xlsx`);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ color: isDarkMode ? 'grey.100' : 'text.primary' }}
        >
        Mes Packs
      </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/dashboard/buypacks"
          startIcon={<PlusIcon className="h-5 w-5" />}
          sx={{
            bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
            '&:hover': {
              bgcolor: isDarkMode ? 'primary.main' : 'primary.dark'
            }
          }}
        >
          Acheter un nouveau pack
        </Button>
      </Box>

      {userPacks.length === 0 ? (
        <Card 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'background.paper',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: 'none',
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ color: isDarkMode ? 'grey.300' : 'text.primary' }}
          >
            Vous n'avez pas encore de pack
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href="/#packages"
            sx={{ mt: 2 }}
          >
            Découvrir nos packs
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {userPacks.map((userPack) => (
            <Grid item xs={12} md={6} key={userPack.id}>
              <Card
                sx={{
                  bgcolor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'background.paper',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: 'none'
                }}
              >
              
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="h5"
                      sx={{ color: isDarkMode ? 'grey.100' : 'text.primary' }}
                    >
                      {userPack.pack.name}
                    </Typography>
                    <Chip
                      label={getStatusLabel(userPack.status)}
                      color={getStatusColor(userPack.status)}
                      sx={{
                        bgcolor: isDarkMode && userPack.status === 'inactive' ? 'grey.800' : undefined,
                        color: isDarkMode && userPack.status === 'inactive' ? 'grey.400' : undefined
                      }}
                    />
                  </Box>

                  <Typography 
                    variant="h6" 
                    color="primary" 
                    gutterBottom
                    sx={{ color: isDarkMode ? 'primary.light' : 'primary.main' }}
                  >
                    {userPack.pack.price}$/mois
                  </Typography>

                  <Typography 
                    variant="body2" 
                    sx={{ color: isDarkMode ? 'grey.400' : 'text.secondary' }} 
                    paragraph
                  >
                    {userPack.pack.description}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ color: isDarkMode ? 'grey.300' : 'text.primary' }}
                  >
                    Code de parrainage: <strong>{userPack.referral_code}</strong>
                  </Typography>

                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ color: isDarkMode ? 'grey.300' : 'text.primary', display: 'flex', alignItems: 'center' }}
                  >
                    Lien de parrainage: 
                    <Box 
                      component="span" 
                      sx={{ 
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        fontFamily: 'monospace', 
                        fontSize: '0.875rem', 
                        marginRight: '8px', 
                        cursor: 'text' 
                      }}
                    >
                      {userPack.link_referral}
                    </Box>
                    <Tooltip title={copySuccess ? 'Copié !' : 'Copier'} placement="top" arrow>
                      <ContentCopyIcon 
                        onClick={() => handleCopy(userPack.link_referral)}
                        sx={{ 
                          ml: 1, 
                          cursor: 'pointer', 
                          color: isDarkMode ? 'grey.500' : 'grey.700',
                          '&:hover': {
                            color: isDarkMode ? 'grey.300' : 'grey.900',
                          }
                        }}
                      />
                    </Tooltip>
                  </Typography>

                  {userPack.sponsor_info && (
                    <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'grey.50' }}>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: isDarkMode ? 'grey.300' : 'text.primary',
                          fontWeight: 500,
                          mb: 1
                        }}
                      >
                        Informations du parrain
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: isDarkMode ? 'grey.400' : 'text.secondary' }}
                      >
                        Nom: <strong style={{ color: isDarkMode ? 'grey.300' : 'text.primary' }}>{userPack.sponsor_info.name}</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: isDarkMode ? 'grey.400' : 'text.secondary' }}
                      >
                        Email: <strong style={{ color: isDarkMode ? 'grey.300' : 'text.primary' }}>{userPack.sponsor_info.email}</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: isDarkMode ? 'grey.400' : 'text.secondary' }}
                      >
                        Téléphone: <strong style={{ color: isDarkMode ? 'grey.300' : 'text.primary' }}>{userPack.sponsor_info.phone}</strong>
                      </Typography>
                    </Box>
                  )}

                  {userPack.expiry_date && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: userPack.status === 'expired' 
                          ? 'error.main'
                          : isDarkMode ? 'grey.400' : 'text.secondary'
                      }}
                    >
                      {userPack.status === 'expired' ? 'Expiré le: ' : 'Expire le: '}
                      {new Date(userPack.expiry_date).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ flexWrap: 'wrap', gap: 1, px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
                      onClick={() => handleDownload(userPack.pack.id)}
                      sx={{
                        color: isDarkMode ? 'grey.300' : 'primary.main',
                        borderColor: isDarkMode ? 'grey.700' : 'primary.main',
                        '&:hover': {
                          borderColor: isDarkMode ? 'grey.500' : 'primary.dark',
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : undefined
                        }
                      }}
                    >
                      Télécharger
                    </Button>

                    <Tooltip 
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Statistiques et performances
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: 'grey.200' }}>
                            Consultez vos statistiques et performances
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                      enterDelay={200}
                      leaveDelay={150}
                      sx={{
                        '& .MuiTooltip-tooltip': {
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.700',
                          color: 'common.white',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          maxWidth: '250px'
                        },
                        '& .MuiTooltip-arrow': {
                          color: isDarkMode ? 'grey.800' : 'grey.700'
                        }
                      }}
                    >
                      <IconButton
                        onClick={() => handleStatsClick(userPack.pack.id)}
                        sx={{
                          color: isDarkMode ? 'grey.300' : 'primary.main',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                            transform: 'scale(1.1)',
                            color: 'primary.main'
                          }
                        }}
                      >
                        <ChartBarIcon className="h-6 w-6" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip 
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Arbre des filleuls
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: 'grey.200' }}>
                            Visualisez votre réseau de parrainage
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                      enterDelay={200}
                      leaveDelay={150}
                      sx={{
                        '& .MuiTooltip-tooltip': {
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.700',
                          color: 'common.white',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          maxWidth: '250px'
                        },
                        '& .MuiTooltip-arrow': {
                          color: isDarkMode ? 'grey.800' : 'grey.700'
                        }
                      }}
                    >
                      <IconButton
                        onClick={() => handleReferralsClick(userPack.pack.id)}
                        sx={{
                          color: isDarkMode ? 'grey.300' : 'primary.main',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                            transform: 'scale(1.1)',
                            color: 'primary.main'
                          }
                        }}
                      >
                        <UsersIcon className="h-6 w-6" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {!userPack.is_admin_pack && (
                    <Button
                      variant="contained"
                      onClick={() => handleRenewClick(userPack)}
                      disabled={userPack.status === 'active'}
                      sx={{
                        bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
                        '&:hover': {
                          bgcolor: isDarkMode ? 'primary.main' : 'primary.dark'
                        },
                        '&.Mui-disabled': {
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : undefined,
                          color: isDarkMode ? 'grey.500' : undefined
                        }
                      }}
                    >
                      {userPack.status === 'active' ? 'Pack actif' : 'Renouveler'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={renewDialog} onClose={handleRenewClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Renouveler {selectedPack?.pack?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Prix mensuel : {selectedPack?.pack?.price}$
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="Durée (mois)"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            margin="normal"
            required
          />

          <Typography variant="h6" sx={{ mt: 2 }}>
            Prix total : {calculateTotalPrice()}$
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenewClose}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleRenew}
            disabled={renewing}
          >
            {renewing ? <CircularProgress size={24} /> : 'Renouveler'}
          </Button>
        </DialogActions>
      </Dialog>

      <PackStatsModal
        open={statsDialog}
        onClose={() => {
          setStatsDialog(false);
          setSelectedPackId(null);
        }}
        packId={selectedPackId}
      />

      <Dialog 
        open={referralsDialog} 
        onClose={() => setReferralsDialog(false)}
        maxWidth="lg" 
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
          <div>Arbre des filleuls</div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
              size="small"
            >
              Vue tableau
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('tree')}
              size="small"
            >
              Vue arbre
            </Button>
            <IconButton
              onClick={() => setIsFullScreen(!isFullScreen)}
              sx={{ ml: 1 }}
            >
              {isFullScreen ? (
                <FullscreenExit sx={{ fontSize: 24 }} />
              ) : (
                <Fullscreen sx={{ fontSize: 24 }} />
              )}
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          bgcolor: 'transparent',
          color: isDarkMode ? 'grey.100' : 'text.primary',
          p: 0
        }}>
          {currentPackReferrals && (
            <Box sx={{ width: '100%', height: '100%' }}>
              <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                  '& .MuiTab-root': {
                    color: isDarkMode ? 'grey.400' : 'text.secondary',
                    '&.Mui-selected': {
                      color: isDarkMode ? 'primary.light' : 'primary.main'
                    }
                  }
                }}
              >
                {Array.from({ length: 4 }, (_, index) => (
                  <Tab 
                    key={index} 
                    label={`${['Première', 'Deuxième', 'Troisième', 'Quatrième'][index]} génération`}
                    sx={{
                      fontWeight: 500,
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 3
                    }}
                  />
                ))}
              </Tabs>

              <Box sx={{ p: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <TextField
                    size="small"
                    placeholder="Rechercher un filleul..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ 
                      width: 250,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 1)'
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MagnifyingGlassIcon className="h-5 w-5" style={{ color: isDarkMode ? 'grey' : 'inherit' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box 
                  sx={{ 
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Filleuls dans cette génération
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {currentPackReferrals[currentTab]?.length || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Commission totale générée
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {(currentPackReferrals[currentTab] || [])
                          .reduce((sum, ref) => sum + parseFloat(ref.total_commission || 0), 0)
                          .toFixed(2)}$
                      </Typography>
                    </Box>
                  </Box>
                  {viewMode === 'table' && (
                    <Button
                      variant="outlined"
                      onClick={() => exportToExcel(filteredReferrals, `filleuls-generation-${currentTab + 1}-${new Date().toISOString().split('T')[0]}`)}
                      startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
                      sx={{
                        color: isDarkMode ? 'grey.300' : 'primary.main',
                        borderColor: isDarkMode ? 'grey.700' : 'primary.main',
                        '&:hover': {
                          borderColor: isDarkMode ? 'grey.500' : 'primary.dark',
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : undefined
                        }
                      }}
                    >
                      Exporter en Excel
                    </Button>
                  )}
                </Box>

                {viewMode === 'table' ? (
                  <DataGrid
                    getRowId={(row) => row.id}
                    rows={filteredReferrals}
                    columns={getColumnsForGeneration(currentTab)}
                    autoHeight
                    disableColumnMenu
                    disableSelectionOnClick
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        pageSize: 10,
                      },
                    }}
                    sx={{
                      border: 'none',
                      bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)',
                      '& .MuiDataGrid-cell': {
                        color: isDarkMode ? 'grey.300' : 'inherit',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'grey.200'
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'grey.200'
                      },
                      '& .MuiDataGrid-row': {
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }
                    }}
                  />
                ) : (
                  <Box sx={{ 
                    height: 500, 
                    position: 'relative',
                    bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <Tree
                      ref={treeRef}
                      data={transformDataToTree(currentPackReferrals || [])}
                      orientation="vertical"
                      renderCustomNodeElement={(props) => (
                        <CustomNode {...props} isDarkMode={isDarkMode} />
                      )}
                      pathFunc="step"
                      separation={{ siblings: 1, nonSiblings: 1.2 }}
                      translate={{ x: 400, y: 50 }}
                      nodeSize={{ x: 120, y: 60 }}
                      initialZoom={0.8}
                      scaleExtent={{ min: 0.1, max: 3 }}
                      zoomable
                      draggable
                    />
                  </Box>
                )}
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
          <Button onClick={() => setReferralsDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyPacks;
