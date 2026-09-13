import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PaginaLogin from '../pages/Login'
import PaginaForgotPassword from '../pages/ForgotPassword'
import PaginaResetPassword from '../pages/ResetPassword'
import PaginaCambiarPassword from '../pages/CambiarPassword'
import PaginaFactores from '../pages/Factores'
import PaginaEventos from '../pages/Eventos'
import PaginaEventoDetalle from '../pages/EventoDetalle'
import PaginaCalculo from '../pages/Calculo'
import PaginaDetalleCalculoHistorico from '../pages/DetalleCalculoHistorico'
import PaginaPublica from '../pages/Publico'
import PaginaUsuarios from '../pages/Usuarios'

/** Ruta que requiere autenticación. Si no hay sesión redirige a /login */
function RutaProtegida({ children }) {
  const { estaAutenticado, debecambiarPassword } = useAuth()
  if (!estaAutenticado) return <Navigate to="/login" replace />
  // Si el productor tiene pendiente cambio de contraseña, bloquear todo
  if (debecambiarPassword) return <Navigate to="/cambiar-password" replace />
  return children
}

/** Ruta exclusiva para admin */
function RutaSoloAdmin({ children }) {
  const { estaAutenticado, esAdmin, debecambiarPassword } = useAuth()
  if (!estaAutenticado) return <Navigate to="/login" replace />
  if (debecambiarPassword) return <Navigate to="/cambiar-password" replace />
  if (!esAdmin) return <Navigate to="/eventos" replace />
  return children
}

/** Si ya está autenticado, no muestra login */
function RutaPublicaAuth({ children }) {
  const { estaAutenticado, debecambiarPassword } = useAuth()
  if (estaAutenticado && !debecambiarPassword) return <Navigate to="/eventos" replace />
  return children
}

export default function RutasApp() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<RutaPublicaAuth><PaginaLogin /></RutaPublicaAuth>} />
      <Route path="/forgot-password" element={<RutaPublicaAuth><PaginaForgotPassword /></RutaPublicaAuth>} />
      <Route path="/reset-password" element={<PaginaResetPassword />} />
      <Route path="/public/:slug" element={<PaginaPublica />} />

      {/* Cambio obligatorio de contraseña */}
      <Route path="/cambiar-password" element={<PaginaCambiarPassword />} />

      {/* Solo admin */}
      <Route path="/usuarios" element={<RutaSoloAdmin><PaginaUsuarios /></RutaSoloAdmin>} />
      <Route path="/factores" element={<RutaSoloAdmin><PaginaFactores /></RutaSoloAdmin>} />

      {/* Admin + Productor */}
      <Route path="/eventos" element={<RutaProtegida><PaginaEventos /></RutaProtegida>} />
      <Route path="/eventos/:id" element={<RutaProtegida><PaginaEventoDetalle /></RutaProtegida>} />
      <Route path="/eventos/:id/calculo" element={<RutaProtegida><PaginaCalculo /></RutaProtegida>} />
      <Route path="/eventos/:id/calculos/:calculoId" element={<RutaProtegida><PaginaDetalleCalculoHistorico /></RutaProtegida>} />

      {/* Raíz: redirige según autenticación */}
      <Route path="/" element={<Navigate to="/eventos" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/eventos" replace />} />
    </Routes>
  )
}
