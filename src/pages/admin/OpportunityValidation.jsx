import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import ValidationFilters from '../../components/ValidationFilters';
import ValidationTable from '../../components/ValidationTable';

export default function BusinessOpportunityValidation() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    dateRange: 'all'
  });
  const { showToast } = useToast();

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const endpoint = filters.status === 'pending' 
        ? '/api/admin/business-opportunities/validations/pending'
        : '/api/admin/business-opportunities/validations';
      
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        let filteredValidations = response.data.data.validations;

        // Appliquer le filtre de recherche
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredValidations = filteredValidations.filter(validation => 
            validation.businessOpportunity.title.toLowerCase().includes(searchLower) ||
            validation.businessOpportunity.description.toLowerCase().includes(searchLower)
          );
        }

        // Appliquer le filtre de date
        if (filters.dateRange !== 'all') {
          const now = new Date();
          const past = new Date();
          past.setDate(past.getDate() - (filters.dateRange === 'week' ? 7 : 30));
          
          filteredValidations = filteredValidations.filter(validation => {
            const validationDate = new Date(validation.created_at);
            return validationDate >= past && validationDate <= now;
          });
        }

        setValidations(filteredValidations);
      }
    } catch (err) {
      showToast("Erreur lors du chargement des validations", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidations();
  }, [filters]);

  const handleValidate = async (id, status, feedback) => {
    try {
      const response = await axios.post(`/api/admin/business-opportunities/${id}/validate`, {
        status,
        feedback
      });

      if (response.data.success) {
        showToast(response.data.message, 'success');
        fetchValidations();
      }
    } catch (err) {
      showToast("Erreur lors de la validation de l'opportunité", 'error');
    }
  };

  const columns = [
    {
      header: 'Titre',
      accessor: 'businessOpportunity.title',
    },
    {
      header: 'Description',
      accessor: 'businessOpportunity.description',
      cell: (value) => value.length > 100 ? value.substring(0, 100) + '...' : value
    },
    {
      header: 'Secteur',
      accessor: 'businessOpportunity.sector',
    },
    {
      header: 'Investissement requis',
      accessor: 'businessOpportunity.required_investment',
      cell: (value) => `${value} €`
    },
    {
      header: 'Date de soumission',
      accessor: 'created_at',
      cell: (value) => new Date(value).toLocaleDateString('fr-FR')
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (value) => ({
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté'
      }[value])
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Validation des opportunités d'affaires
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Gérez les opportunités d'affaires soumises par les utilisateurs
          </p>
        </div>

        <ValidationFilters 
          filters={filters}
          setFilters={setFilters}
        />

        <ValidationTable
          data={validations}
          columns={columns}
          loading={loading}
          onValidate={handleValidate}
          itemType="opportunité d'affaires"
        />
      </div>
    </div>
  );
}
