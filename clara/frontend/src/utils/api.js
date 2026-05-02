import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clara_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
});

export default api;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('clara_token')
      localStorage.removeItem('clara_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.error || error.response?.data?.message || error.message || fallback
}

export default api
