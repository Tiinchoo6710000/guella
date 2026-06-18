import axios from 'axios';

// Define la URL base de tu API.
// En desarrollo local, import.meta.env.VITE_API_URL será undefined o la que definas en .env.development.
// En Vercel, usará la variable de entorno VITE_API_URL que configures.
// Si no está definida, puedes poner un fallback para desarrollo local si lo necesitas,
// pero lo ideal es que siempre esté definida en el entorno.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;