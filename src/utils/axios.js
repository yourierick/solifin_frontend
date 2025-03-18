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

// Intercepteur pour gérer les erreurs
instance.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // En cas d'erreur 401, on ne fait rien ici car la redirection est gérée dans AuthContext
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default instance;
