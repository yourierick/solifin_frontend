import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import PurchasePackForm from '../../components/PurchasePackForm';
import axios from '../../utils/axios';
import { CheckIcon } from '@heroicons/react/24/outline';

const Packs = () => {
  const { toast } = useToast();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);
  const { isDarkMode } = useTheme();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Container 
      sx={{ 
        mt: 4
      }}
    >
      <Typography variant="h4" gutterBottom>
        Acheter un pack de parrainage
      </Typography>

      <Grid container spacing={3}>
        {packs.map(pack => (
          <Grid item xs={12} sm={6} md={4} key={pack.id}>
            <Card
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: isDarkMode ? 'rgba(21, 30, 48, 0.8)' : 'background.paper',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: 'none',
              }}           
            >
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {pack.name}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {pack.price}€/mois
                </Typography>
                <ul className="mt-6 space-y-4">
                  {pack.avantages && pack.avantages.map((avantage, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className={`h-6 w-6 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                      <Typography variant="body2" className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} gutterBottom>
                        {avantage}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handlePurchaseClick(pack)}
                >
                  Acheter
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PurchasePackForm
        open={purchaseDialogOpen}
        onClose={handlePurchaseClose}
        pack={selectedPack}
      />
    </Container>
  );
};

export default Packs;
