import { useAuth } from '../context/AuthContext'
import { Shield, LogIn } from 'lucide-react'

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth()

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
          <p className="text-gray-400">Necesitas iniciar sesión para acceder al panel de administración.</p>
        </div>
      </div>
    )
  }

  // Verificar si el usuario es administrador
  if (user.email !== adminEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2 text-red-400">Acceso Denegado</h2>
          <p className="text-gray-400 mb-4">
            No tienes permisos para acceder al panel de administración.
          </p>
          <p className="text-sm text-gray-500">
            Solo el administrador del sitio puede acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  // Usuario es admin, mostrar contenido
  return children
}
