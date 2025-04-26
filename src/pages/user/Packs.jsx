import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Box,
  Paper,
  Divider,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha
} from '@mui/material';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import PurchasePackForm from '../../components/PurchasePackForm';
import axios from '../../utils/axios';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Packs = () => {
  const { toast } = useToast();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);
  const { isDarkMode } = useTheme();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await axios.get('/api/packs');
      if (response.data.success) {
        setPacks(response.data.data.filter(pack => pack.status));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des packs:', error);
      toast.error('Impossible de charger les packs disponibles');
    } finally {
      setLoading(false);
    }
  };

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
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh' 
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            letterSpacing: '-0.5px',
            mb: 1
          }}
        >
          Acheter un pack de parrainage
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: '800px' }}
        >
          Choisissez le pack qui vous convient et commencez à développer votre réseau de parrainage dès aujourd'hui.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {packs.map((pack, index) => (
          <Grid item xs={12} sm={6} md={4} key={pack.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                {/* En-tête */}
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  borderBottom: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  position: 'relative'
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1
                    }}
                  >
                    {pack.name}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    {pack.price}€
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      /mois
                    </Typography>
                  </Typography>
                  
                  {pack.popular && (
                    <Chip
                      label="Populaire"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                        borderRadius: '6px'
                      }}
                    />
                  )}
                </Box>
                
                {/* Avantages */}
                <Box sx={{ p: 3, flexGrow: 1 }}>
                  <List disablePadding>
                    {pack.avantages && pack.avantages.map((avantage, idx) => (
                      <ListItem 
                        key={idx} 
                        disablePadding 
                        sx={{ 
                          py: 1,
                          px: 0
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon className="h-5 w-5" style={{ color: isDarkMode ? '#4ade80' : '#22c55e' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={avantage}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: { fontWeight: 500 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                {/* Actions */}
                <Box sx={{ 
                  p: 3, 
                  mt: 'auto',
                  borderTop: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  bgcolor: isDarkMode ? '#1f2937' : 'rgba(0, 0, 0, 0.02)'
                }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handlePurchaseClick(pack)}
                    sx={{
                      borderRadius: '8px',
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Acheter maintenant
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Modal de paiement */}
      <Dialog
        open={purchaseDialogOpen}
        onClose={handlePurchaseClose}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: isDarkMode ? '#1f2937' : 'background.paper',
            backgroundImage: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 3,
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Achat de pack
          </Typography>
          <IconButton onClick={handlePurchaseClose} size="small">
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPack && (
            <PurchasePackForm
              open={purchaseDialogOpen}
              onClose={handlePurchaseClose}
              pack={selectedPack}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Packs;
