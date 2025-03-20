import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Intercepteur pour les requêtes
instance.interceptors.request.use(async (config) => {
    // Si c'est une requête POST, PUT, PATCH ou DELETE
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
        try {
            // Récupérer le token CSRF
            await axios.get('/sanctum/csrf-cookie', {
                withCredentials: true,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du token CSRF:', error);
        }
    }
    return config;
});

// Intercepteur pour les réponses
instance.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // En cas d'erreur 401, on ne fait rien ici car la redirection est gérée dans AuthContext
            return Promise.reject(error);
        }
        if (error.response?.status === 419) {
            // Token CSRF expiré, on essaie de le rafraîchir
            try {
                await axios.get('/sanctum/csrf-cookie', {
                    withCredentials: true,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                // Réessayer la requête originale
                return instance(error.config);
            } catch (refreshError) {
                console.error('Erreur lors du rafraîchissement du token CSRF:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
