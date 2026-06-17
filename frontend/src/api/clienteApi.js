import axios from 'axios';

// La URL base de tu backend.
// En desarrollo, usará 'http://localhost:8000' (o el puerto de tu FastAPI).
// En producción (Vercel), usará la variable de entorno REACT_APP_BACKEND_URL que configuraremos.
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default clienteApi;