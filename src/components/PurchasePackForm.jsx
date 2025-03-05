import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { useToast } from '../contexts/ToastContext';
import axios from '../utils/axios';

const PurchasePackForm = ({ open, onClose, pack }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(1);

  const calculateTotalPrice = () => {
    if (!pack) return 0;
    return pack.price * duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(`/api/packs/${pack.id}/purchase`, {
        duration_months: duration
      });

      if (response.data.success) {
        toast.success('Pack acheté avec succès');
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat du pack:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'achat du pack');
    } finally {
      setLoading(false);
    }
  };

  if (!pack) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Acheter le pack {pack.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Prix mensuel : {pack.price}€
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

          <FormHelperText>
            Prix total : {calculateTotalPrice()}€
          </FormHelperText>

          <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
            {pack.description}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Acheter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PurchasePackForm;
