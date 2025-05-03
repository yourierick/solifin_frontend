import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  Chip,
  Divider,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useToast } from '../contexts/ToastContext';
import PurchasePackForm from '../components/PurchasePackForm';
import axios from '../utils/axios';

// Style pour les cartes de pack
const PackCard = styled(Card)(({ theme, featured }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'visible',
  borderRadius: '16px',
  border: featured ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: featured ? 'rgba(46, 125, 50, 0.04)' : theme.palette.background.paper,
  boxShadow: featured 
    ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
  },
}));

// Style pour les avantages
const AdvantageItem = styled('li')(({ theme }) => ({
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'flex-start',
}));

const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-12px',
  right: '24px',
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1,
}));

const FeaturedBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: '-12px',
  left: '24px',
  fontWeight: 'bold',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1,
}));

const Packs = () => {
  const { toast } = useToast();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await axios.get('/api/packs');
        if (response.data.success) {
          // Ajouter une propriété featured au pack le plus populaire
          const packsWithFeatured = response.data.data
            .filter(pack => pack.status)
            .map((pack, index) => ({
              ...pack,
              featured: index === 1 // Marquer le deuxième pack comme vedette (généralement l'offre standard)
            }));
          setPacks(packsWithFeatured);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des packs:', error);
        toast.error('Impossible de charger les packs disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const handlePurchaseClick = (pack) => {
    setSelectedPack(pack);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseClose = () => {
    setPurchaseDialogOpen(false);
    setSelectedPack(null);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Chargement des packs...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Fonction pour obtenir l'icône appropriée pour chaque avantage
  const getAdvantageIcon = (text) => {
    if (text.toLowerCase().includes('premium') || text.toLowerCase().includes('prioritaire')) {
      return <StarOutlineIcon fontSize="small" color="secondary" sx={{ mr: 1, mt: 0.5 }} />;
    } else if (text.toLowerCase().includes('boost') || text.toLowerCase().includes('rapide')) {
      return <BoltIcon fontSize="small" color="warning" sx={{ mr: 1, mt: 0.5 }} />;
    } else if (text.toLowerCase().includes('réduction') || text.toLowerCase().includes('économie')) {
      return <LocalOfferIcon fontSize="small" color="error" sx={{ mr: 1, mt: 0.5 }} />;
    } else {
      return <CheckCircleOutlineIcon fontSize="small" color="primary" sx={{ mr: 1, mt: 0.5 }} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Nos Packs Premium
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 3 }}>
          Choisissez le pack qui correspond à vos besoins et boostez votre visibilité sur SOLIFIN
        </Typography>
        <Divider sx={{ width: '100px', mx: 'auto', mb: 4, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
      </Box>

      <Grid container spacing={4} alignItems="stretch">
        {packs.map(pack => (
          <Grid item xs={12} sm={6} md={4} key={pack.id} sx={{ display: 'flex' }}>
            <PackCard featured={pack.featured} elevation={pack.featured ? 8 : 2}>
              {pack.featured && (
                <FeaturedBadge 
                  label="POPULAIRE" 
                  icon={<StarOutlineIcon fontSize="small" />} 
                />
              )}
              <PriceTag>
                {pack.price}€/mois
              </PriceTag>
              
              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                <Typography 
                  variant="h5" 
                  component="div" 
                  gutterBottom 
                  fontWeight="bold"
                  color={pack.featured ? 'primary' : 'textPrimary'}
                  sx={{ mb: 2 }}
                >
                  {pack.name}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="textSecondary" 
                  sx={{ 
                    mb: 3,
                    minHeight: isMobile ? 'auto' : '60px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {pack.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Avantages inclus:
                </Typography>
                
                {pack.avantages && (
                  <Box component="ul" sx={{ pl: 0, listStyleType: 'none' }}>
                    {pack.avantages.map((avantage, index) => (
                      <AdvantageItem key={index}>
                        {getAdvantageIcon(avantage)}
                        <Typography variant="body2">
                          {avantage}
                        </Typography>
                      </AdvantageItem>
                    ))}
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant={pack.featured ? "contained" : "outlined"}
                  color="primary"
                  size="large"
                  onClick={() => handlePurchaseClick(pack)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: pack.featured ? 4 : 0,
                    '&:hover': {
                      boxShadow: pack.featured ? 8 : 2,
                    }
                  }}
                >
                  {pack.featured ? 'Choisir ce pack' : 'Acheter'}
                </Button>
              </CardActions>
            </PackCard>
          </Grid>
        ))}
      </Grid>

      <Box mt={8} p={4} component={Paper} elevation={0} sx={{ 
        borderRadius: '16px', 
        backgroundColor: 'rgba(46, 125, 50, 0.03)',
        border: '1px solid rgba(46, 125, 50, 0.1)',
      }}>
        <Typography variant="h6" gutterBottom fontWeight="medium">
          Vous avez des questions sur nos packs ?
        </Typography>
        <Typography variant="body1" paragraph>
          Contactez notre équipe commerciale pour obtenir plus d'informations ou pour créer un pack personnalisé adapté à vos besoins spécifiques.
        </Typography>
        <Button variant="text" color="primary" endIcon={<ArrowForwardIcon />}>
          Nous contacter
        </Button>
      </Box>

      <PurchasePackForm
        open={purchaseDialogOpen}
        onClose={handlePurchaseClose}
        pack={selectedPack}
      />
    </Container>
  );
};

export default Packs;
