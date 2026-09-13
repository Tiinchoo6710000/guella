import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_RENDER || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Interceptor: inyecta el token Bearer en cada request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('guella_auth')
    if (raw) {
      const { token } = JSON.parse(raw)
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
  } catch {
    // Silencioso si localStorage no tiene datos válidos
  }
  return config
})

// Interceptor: si recibe 401, limpiar sesión y redirigir a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('guella_auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api