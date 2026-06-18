import axios from 'axios';

// Usa la variable de entorno VITE_API_BASE_URL, o por defecto localhost para desarrollo local
const API_BASE_URL = import.meta.env.VITE_API_RENDER || 'http://localhost:8000';

const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default clienteApi;