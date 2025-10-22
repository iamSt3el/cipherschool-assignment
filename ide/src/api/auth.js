import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a separate axios instance for auth routes WITHOUT the 401 redirect interceptor
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Only add token to requests (no response interceptor that redirects)
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    const response = await authAxios.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await authAxios.post('/users/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await authAxios.get('/users/profile');
    return response.data;
  },
};
