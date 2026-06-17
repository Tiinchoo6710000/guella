import { Routes, Route, Navigate } from 'react-router-dom'
import PaginaFactores from '../pages/Factores'
import PaginaEventos from '../pages/Eventos'
import PaginaEventoDetalle from '../pages/EventoDetalle'
import PaginaCalculo from '../pages/Calculo'
import PaginaDetalleCalculoHistorico from '../pages/DetalleCalculoHistorico'
import PaginaPublica from '../pages/Publico'

export default function RutasApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/eventos" replace />} />
      <Route path="/factores" element={<PaginaFactores />} />
      <Route path="/eventos" element={<PaginaEventos />} />
      <Route path="/eventos/:id" element={<PaginaEventoDetalle />} />
      <Route path="/eventos/:id/calculo" element={<PaginaCalculo />} />
      <Route path="/eventos/:id/calculos/:calculoId" element={<PaginaDetalleCalculoHistorico />} />
      <Route path="/public/:slug" element={<PaginaPublica />} />
    </Routes>
  )
}
