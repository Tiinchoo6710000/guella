import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'guella_auth'

function cargarDesdeStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { usuario: null, token: null }
    return JSON.parse(raw)
  } catch {
    return { usuario: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [estado, setEstado] = useState(cargarDesdeStorage)

  const login = useCallback((token, usuario) => {
    const nuevo = { token, usuario }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo))
    setEstado(nuevo)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEstado({ usuario: null, token: null })
  }, [])

  const actualizarUsuario = useCallback((datos) => {
    setEstado(prev => {
      const nuevo = { ...prev, usuario: { ...prev.usuario, ...datos } }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo))
      return nuevo
    })
  }, [])

  const value = {
    token: estado.token,
    usuario: estado.usuario,
    estaAutenticado: !!estado.token,
    esAdmin: estado.usuario?.rol === 'admin',
    esProductor: estado.usuario?.rol === 'productor',
    debecambiarPassword: estado.usuario?.debe_cambiar_password === true,
    login,
    logout,
    actualizarUsuario,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
