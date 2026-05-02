import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') + '/api'
  : 'https://clara-dementia-assistant-1.onrender.com/api'

console.log('[Clara] API base URL:', BASE_URL)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clara_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('[Clara] Request:', config.method?.toUpperCase(), config.baseURL + config.url)
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Clara] API Error:', error.message, error.response?.status, error.response?.data)

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
  return (
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    fallback
  )
}

export default api
