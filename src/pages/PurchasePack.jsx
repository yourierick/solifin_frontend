import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import Notification from '../components/Notification';
import axios from '../utils/axios';

const PurchasePack = () => {
  const { sponsor_code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [pack, setPack] = useState(null);
  const [sponsor, setSponsor] = useState(null);
  const [duration, setDuration] = useState(1);
  const [registrationData, setRegistrationData] = useState(null);

  // Récupérer les données d'inscription
  const registrationDataFromLocation = location.state?.registrationData || 
                          JSON.parse(sessionStorage.getItem('registrationData'));

  useEffect(() => {
    // Vérifier si on vient du formulaire d'inscription
    const fromRegistration = location.state?.fromRegistration;
    if (!fromRegistration) {
      Notification.warning('Accès non autorisé');
      navigate('/register');
      return;
    }

    // Charger les détails du pack
    const fetchPack = async () => {
      try {
        const response = await axios.get(`/api/purchases/${sponsor_code}`);
        if (response.data.success) {
          setPack(response.data.data.pack);
          setSponsor(response.data.data.sponsor);
          console.log(response.data.data.sponsor.name);
        } else {
          throw new Error('Pack non trouvé');
        }
      } catch (error) {
        Notification.error('Erreur lors du chargement du pack');
        navigate('/register');
      } finally {
        setLoading(false);
      }
    };

    fetchPack();
  }, [sponsor_code, navigate, location.state]);

  const calculateTotalPrice = () => {
    if (!pack) return 0;
    return pack.price * duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setPurchasing(true);

      // Créer une copie des données et ajouter duration_months
      const registrationDataWithDuration = {
        ...registrationDataFromLocation,
        duration_months: duration
      };

      // 1. Créer le compte utilisateur
      const registerResponse = await axios.post(`/api/register/${pack.id}`, registrationDataWithDuration);
      
      if (!registerResponse.data.success) {
        throw new Error('Erreur lors de la création du compte');
      }

      // Succès
      sessionStorage.removeItem('registrationData');
      Notification.success('Compte créé et pack acheté avec succès !');
      navigate('/login');

    } catch (error) {
      Notification.error(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Envoyer les données d'inscription au serveur
      const response = await axios.post('/api/register', registrationDataFromLocation);

      if (response.data.success) {
        // Nettoyer les données temporaires
        sessionStorage.removeItem('registrationData');
        
        // Rediriger vers la vérification email ou le dashboard
        navigate('/email/verify');
      }
    } catch (error) {
      Notification.error('Erreur lors de la finalisation de l\'inscription');
    }
  };

  // Vérifier si on vient bien de l'inscription
  useEffect(() => {
    if (!location.state?.fromRegistration && !sessionStorage.getItem('registrationData')) {
      navigate('/register');
    }
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!pack) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Pack non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card
        sx={{ 
          border: 'none',
          borderRadius: 2,
          boxShadow: 'none'
        }}  
      >
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'whitesmoke', textAlign: 'center' }}>
            Finaliser votre inscription
          </Typography>
          <hr />

          <Box sx={{ my: 4, p: 3, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Pack selon le code renseigné : {pack.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Prix mensuel : {pack.price} $
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '8px' }}>
              {pack.description}
            </Typography>
            <Typography variant="body2" sx={{ color: 'yellow' }} gutterBottom>
              Pour ce pack vous serez sous le parrainage de : {sponsor.name}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
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

            <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
              Prix total : {calculateTotalPrice()} $
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={purchasing}
            >
              {purchasing ? <CircularProgress size={24} /> : 'Payer et créer mon compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PurchasePack;
