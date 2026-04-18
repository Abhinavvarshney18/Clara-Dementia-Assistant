import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('clara_token');
      localStorage.removeItem('clara_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;