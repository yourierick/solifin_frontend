import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import axios from '../utils/axios';
import { useToast } from '../contexts/ToastContext';
import Notification from './Notification';

// Liste des méthodes de paiement disponibles pour l'inscription
const paymentMethods = [
  {
    id: 'credit-card',
    name: 'Carte de crédit',
    icon: 'credit-card',
    category: 'card',
    fields: [
      { name: 'cardNumber', label: 'Numéro de carte', type: 'text', required: true, maxLength: 19, 
        format: (value) => value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() },
      { name: 'cardHolder', label: 'Nom sur la carte', type: 'text', required: true },
      { 
        name: 'expiryDate', 
        label: 'Date d\'expiration', 
        type: 'text', 
        required: true,
        maxLength: 5,
        format: (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2')
      },
      { name: 'cvv', label: 'CVV', type: 'text', required: true, maxLength: 3 }
    ]
  },
  {
    id: 'mobile-money',
    name: 'Mobile Money',
    icon: 'phone',
    category: 'mobile',
    options: [
      { id: 'orange-money', name: 'Orange Money' },
      { id: 'airtel-money', name: 'Airtel Money' },
      { id: 'm-pesa', name: 'M-Pesa' }
    ],
    fields: [
      { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'tel', required: true }
    ]
  }
];

export default function RegistrationPaymentForm({ open, onClose, pack, onSubmit, loading = false }) {
  const { isDarkMode } = useTheme();
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [formFields, setFormFields] = useState({});
  const [months, setMonths] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMobileOption, setSelectedMobileOption] = useState('');

  useEffect(() => {
    if (pack) {
      setTotalAmount(pack.price * months);
    }
  }, [pack, months]);

  useEffect(() => {
    // Réinitialiser les champs du formulaire et l'option mobile lors du changement de méthode
    setFormFields({});
    setSelectedMobileOption('');
  }, [paymentMethod]);

  const handleFieldChange = (fieldName, value) => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    const field = selectedMethod?.fields?.find(f => f.name === fieldName);
    
    // Appliquer le formatage si défini
    const formattedValue = field?.format ? field.format(value) : value;
    
    setFormFields(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Vérifier que tous les champs requis sont remplis
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (selectedMethod?.fields) {
      const missingFields = selectedMethod.fields
        .filter(field => field.required && !formFields[field.name])
        .map(field => field.label);

      if (missingFields.length > 0) {
        setError(`Veuillez remplir les champs suivants : ${missingFields.join(', ')}`);
        return;
      }
    }

    // Vérifier que l'option mobile est sélectionnée si nécessaire
    if (paymentMethod === 'mobile-money' && !selectedMobileOption) {
      setError('Veuillez sélectionner un opérateur mobile');
      return;
    }

    // Préparer les données de paiement en fonction de la méthode sélectionnée
    let paymentDetails = {};
    
    // Ne conserver que les champs pertinents pour la méthode de paiement sélectionnée
    if (paymentMethod === 'credit-card') {
      // Pour carte de crédit, inclure seulement les champs de carte
      const { cardNumber, cardHolder, expiryDate, cvv } = formFields;
      paymentDetails = { cardNumber, cardHolder, expiryDate, cvv };
    } else if (paymentMethod === 'mobile-money') {
      // Pour mobile money, inclure le numéro de téléphone et l'opérateur
      const { phoneNumber } = formFields;
      paymentDetails = { phoneNumber, operator: selectedMobileOption };
    }
    
    const paymentData = {
      pack_id: pack.id,
      payment_method: paymentMethod,
      duration_months: months,
      amount: totalAmount,
      payment_details: paymentDetails,
      mobile_option: selectedMobileOption
    };

    // Utiliser la fonction onSubmit fournie par le parent
    if (onSubmit) {
      await onSubmit(paymentData);
    }
  };

  const renderPaymentFields = () => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (!selectedMethod?.fields) return null;

    return (
      <div className="space-y-2">
        {paymentMethod === 'mobile-money' && (
          <div className="mb-2">
            <Typography variant="subtitle2" gutterBottom>
              Choisissez votre opérateur
            </Typography>
            <RadioGroup
              row
              value={selectedMobileOption}
              onChange={(e) => setSelectedMobileOption(e.target.value)}
              className="gap-4"
            >
              {selectedMethod.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio size="small" />}
                  label={option.name}
                />
              ))}
            </RadioGroup>
          </div>
        )}

        {(paymentMethod !== 'mobile-money' || selectedMobileOption) && (
          <div className={paymentMethod === 'credit-card' ? 'grid grid-cols-2 gap-2' : ''}>
            {selectedMethod.fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type}
                value={formFields[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                fullWidth
                required={field.required}
                size="small"
                inputProps={{ 
                  maxLength: field.maxLength,
                  className: field.name === 'cvv' ? 'font-mono' : ''
                }}
                className={
                  field.name === 'cardNumber' || field.name === 'cardHolder' 
                    ? 'col-span-2' 
                    : ''
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className={`rounded-lg shadow-xl overflow-hidden ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`} style={{  margin: 'auto' }}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h6" component="h2">
            Finaliser votre inscription
          </Typography>
          <IconButton onClick={onClose} size="small">
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </div>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Colonne de gauche */}
            <div className="space-y-3">
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Durée de souscription
                </Typography>
                <TextField
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mois</InputAdornment>,
                  }}
                  fullWidth
                  inputProps={{ min: 1 }}
                  size="small"
                />
              </div>

              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Montant total
                </Typography>
                <Typography variant="h6" color="primary" className="font-bold">
                  {totalAmount} $
                </Typography>
                {pack?.sponsorName && (
                  <Typography variant="body2" sx={{ color: 'yellow', mt: 1 }} gutterBottom>
                    Pour ce pack vous serez sous le parrainage de : {pack.sponsorName}
                  </Typography>
                )}
              </div>
            </div>

            {/* Colonne de droite */}
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Méthode de paiement
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="space-y-1"
              >
                {paymentMethods.map((method) => (
                  <FormControlLabel
                    key={method.id}
                    value={method.id}
                    control={<Radio size="small" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                        {method.name}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Champs de paiement */}
          <div className="mt-3">
            {renderPaymentFields()}
          </div>

          {/* Bouton de paiement */}
          <div className="mt-4 flex items-center justify-between">
            <Typography variant="body2" color="textSecondary">
              Procédez au paiement sécurisé
            </Typography>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Payer et créer mon compte'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
