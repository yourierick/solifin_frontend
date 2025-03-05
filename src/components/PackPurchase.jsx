import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function PackPurchase({ pack, onSuccess, isNewUser = false }) {
  const { isDarkMode } = useTheme();
  const [sponsorCode, setSponsorCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Initialiser l'achat
      const initResponse = await axios.post('/api/pack-purchases/initiate', {
        pack_id: pack.id,
        sponsor_code: sponsorCode
      });

      if (initResponse.data.success) {
        // Procéder au paiement
        const purchaseId = initResponse.data.data.purchase_id;
        const paymentResponse = await axios.post(`/api/pack-purchases/${purchaseId}/process`, {
          payment_method: paymentMethod
        });

        if (paymentResponse.data.success) {
          onSuccess(paymentResponse.data);
        } else {
          setError(paymentResponse.data.message);
        }
      } else {
        setError(initResponse.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}
    >
      <h3 className={`text-xl font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {isNewUser ? 'Finaliser votre inscription' : `Acheter ${pack.name}`}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="sponsorCode" 
            className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Code Parrain
          </label>
          <input
            type="text"
            id="sponsorCode"
            value={sponsorCode}
            onChange={(e) => setSponsorCode(e.target.value)}
            className={`mt-1 block w-full rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
            required
          />
        </div>

        <div>
          <label 
            htmlFor="paymentMethod" 
            className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Méthode de paiement
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={`mt-1 block w-full rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
          >
            <option value="wallet">Portefeuille virtuel</option>
            <option value="card">Carte bancaire</option>
            <option value="bank_transfer">Virement bancaire</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? 'bg-gray-400'
              : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }`}
        >
          {loading ? 'Traitement en cours...' : 'Confirmer l\'achat'}
        </button>
      </form>
    </motion.div>
  );
}
