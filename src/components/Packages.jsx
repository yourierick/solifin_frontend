import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import publicAxios from '../utils/publicAxios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// Animations
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Animations améliorées pour les titres de catégorie
const categoryTitleVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      delay: 0.1
    }
  }
};

const categoryLineVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: "100%",
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeInOut",
      delay: 0.4
    }
  }
};

// Animations pour les décorations du titre
const decorationLeftVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    }
  }
};

const decorationRightVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    }
  }
};

// Définition des couleurs par catégorie
const categoryColors = {
  // Couleurs pour le mode clair
  light: {
    default: { bg: 'bg-white', border: 'border-gray-200', highlight: 'bg-green-600', hover: 'hover:bg-green-700', icon: 'text-green-500', accent: 'text-green-600', gradientFrom: 'from-green-500', gradientTo: 'to-green-600' },
    'Débutant': { bg: 'bg-blue-100', border: 'border-blue-300', highlight: 'bg-blue-600', hover: 'hover:bg-blue-700', icon: 'text-blue-500', accent: 'text-blue-600', gradientFrom: 'from-blue-500', gradientTo: 'to-blue-600' },
    'Intermédiaire': { bg: 'bg-purple-100', border: 'border-purple-300', highlight: 'bg-purple-600', hover: 'hover:bg-purple-700', icon: 'text-purple-500', accent: 'text-purple-600', gradientFrom: 'from-purple-500', gradientTo: 'to-purple-600' },
    'Expert': { bg: 'bg-amber-100', border: 'border-amber-300', highlight: 'bg-amber-600', hover: 'hover:bg-amber-700', icon: 'text-amber-500', accent: 'text-amber-600', gradientFrom: 'from-amber-500', gradientTo: 'to-amber-600' },
    'Premium': { bg: 'bg-indigo-100', border: 'border-indigo-300', highlight: 'bg-indigo-600', hover: 'hover:bg-indigo-700', icon: 'text-indigo-500', accent: 'text-indigo-600', gradientFrom: 'from-indigo-500', gradientTo: 'to-indigo-600' },
    'VIP': { bg: 'bg-rose-100', border: 'border-rose-300', highlight: 'bg-rose-600', hover: 'hover:bg-rose-700', icon: 'text-rose-500', accent: 'text-rose-600', gradientFrom: 'from-rose-500', gradientTo: 'to-rose-600' }
  },
  // Couleurs pour le mode sombre
  dark: {
    default: { bg: '#1f2937', border: 'border-gray-700', highlight: 'bg-green-600', hover: 'hover:bg-green-700', icon: 'text-green-400', accent: 'text-green-400', gradientFrom: 'from-green-600', gradientTo: 'to-green-700' },
    'Débutant': { bg: 'bg-blue-900/40', border: 'border-blue-700', highlight: 'bg-blue-600', hover: 'hover:bg-blue-700', icon: 'text-blue-400', accent: 'text-blue-400', gradientFrom: 'from-blue-600', gradientTo: 'to-blue-700' },
    'Intermédiaire': { bg: 'bg-purple-900/40', border: 'border-purple-700', highlight: 'bg-purple-600', hover: 'hover:bg-purple-700', icon: 'text-purple-400', accent: 'text-purple-400', gradientFrom: 'from-purple-600', gradientTo: 'to-purple-700' },
    'Expert': { bg: 'bg-amber-900/40', border: 'border-amber-700', highlight: 'bg-amber-600', hover: 'hover:bg-amber-700', icon: 'text-amber-400', accent: 'text-amber-400', gradientFrom: 'from-amber-600', gradientTo: 'to-amber-700' },
    'Premium': { bg: 'bg-indigo-900/40', border: 'border-indigo-700', highlight: 'bg-indigo-600', hover: 'hover:bg-indigo-700', icon: 'text-indigo-400', accent: 'text-indigo-400', gradientFrom: 'from-indigo-600', gradientTo: 'to-indigo-700' },
    'VIP': { bg: 'bg-rose-900/40', border: 'border-rose-700', highlight: 'bg-rose-600', hover: 'hover:bg-rose-700', icon: 'text-rose-400', accent: 'text-rose-400', gradientFrom: 'from-rose-600', gradientTo: 'to-rose-700' }
  }
};

export default function Packages() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await publicAxios.get('/api/packs');
        console.log('Response data:', response.data); // Pour déboguer
        if (response.data && response.data.data) {
          setPacks(response.data.data.filter(pack => pack.status));
        } else {
          console.error('Format de réponse invalide:', response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des packs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  // Grouper les packs par catégorie
  const packsByCategory = useMemo(() => {
    const grouped = {};
    packs.forEach(pack => {
      const category = pack.categorie || 'Autre';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(pack);
    });
    return grouped;
  }, [packs]);

  // Obtenir les couleurs en fonction du mode (clair/sombre)
  const getColorScheme = (category) => {
    const mode = isDarkMode ? 'dark' : 'light';
    return categoryColors[mode][category] || categoryColors[mode].default;
  };

  const handleSubscribeClick = (pack) => {
    if (!user) {
      navigate('/register');
    } else {
      if (user.is_admin) {
        navigate('/admin/mespacks');
      } else {
        navigate('/dashboard/buypacks');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ 
        mt: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        minHeight: '50vh', 
        alignItems: 'center',
        bgcolor: isDarkMode ? '#1f2937' : 'background.default'
      }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      mb: 8,
      bgcolor: isDarkMode ? '#1f2937' : 'background.default',
      borderRadius: 2,
      py: 4
    }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ color: isDarkMode ? 'white' : 'text.primary' }}>
          Nos Packs
        </Typography>
        <Typography variant="subtitle1" color={isDarkMode ? 'text.secondary' : 'text.secondary'} sx={{ maxWidth: '800px', mx: 'auto' }}>
          Choisissez le pack qui correspond le mieux à vos besoins et commencez votre aventure dès aujourd'hui.
        </Typography>
      </Box>

      {Object.entries(packsByCategory).map(([category, categoryPacks]) => (
        <Box key={category} mb={8}>
          <Box 
            textAlign="center" 
            mb={6}
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            sx={{ position: 'relative' }}
          >
            {/* Décoration gauche */}
            <Box 
              component={motion.div}
              variants={decorationLeftVariants}
              sx={{ 
                position: 'absolute', 
                left: { xs: '10%', md: '25%' }, 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              <Box sx={{ 
                width: '40px', 
                height: '2px', 
                background: `linear-gradient(to right, transparent, ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'})`,
                display: 'inline-block',
                mr: 1
              }} />
              <Box component="span" sx={{ 
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                verticalAlign: 'middle'
              }} />
            </Box>
            
            {/* Titre */}
            <Typography 
              variant="h4" 
              component={motion.div}
              variants={categoryTitleVariants}
              sx={{ 
                textTransform: 'capitalize',
                color: isDarkMode ? 'white' : 'text.primary',
                position: 'relative',
                display: 'inline-block',
                mb: 1,
                px: 4,
                fontWeight: 'bold',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '4px',
                  bgcolor: 'primary.main',
                  borderRadius: '2px'
                }
              }}
            >
              {category}
            </Typography>
            
            {/* Décoration droite */}
            <Box 
              component={motion.div}
              variants={decorationRightVariants}
              sx={{ 
                position: 'absolute', 
                right: { xs: '10%', md: '25%' }, 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              <Box component="span" sx={{ 
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                verticalAlign: 'middle'
              }} />
              <Box sx={{ 
                width: '40px', 
                height: '2px', 
                background: `linear-gradient(to left, transparent, ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'})`,
                display: 'inline-block',
                ml: 1
              }} />
            </Box>
            
            {/* Ligne sous le titre */}
            <Box 
              component={motion.div}
              variants={categoryLineVariants}
              sx={{ 
                height: '2px', 
                width: { xs: '60%', sm: '40%', md: '30%' },
                maxWidth: '200px',
                background: `linear-gradient(to right, transparent, ${isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}, transparent)`,
                mx: 'auto',
                mt: 4,
                borderRadius: '1px'
              }}
            />
          </Box>

          <Grid 
            container 
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categoryPacks.map((pack) => (
              <Grid item xs={12} sm={6} md={4} key={pack.id}>
                <Card 
                  component={motion.div}
                  variants={itemVariants}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    },
                    bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
                    color: isDarkMode ? 'text.primary' : 'inherit',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ color: isDarkMode ? 'white' : 'text.primary' }}>
                      {pack.name}
                    </Typography>
                    <Typography variant="subtitle1" color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} gutterBottom>
                      À partir de
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {pack.price}€/mois
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />
                    <Typography variant="body2" color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} paragraph>
                      {pack.description}
                    </Typography>
                    
                    {pack.avantages && pack.avantages.length > 0 && (
                      <List disablePadding>
                        {pack.avantages.map((avantage, index) => (
                          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon sx={{ minWidth: '32px' }}>
                              <CheckIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={avantage} primaryTypographyProps={{ variant: 'body2' }} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleSubscribeClick(pack)}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 'medium'
                      }}
                    >
                      Souscrire Maintenant
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
}