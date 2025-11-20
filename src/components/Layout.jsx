import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Music, Settings, LogOut, Home as HomeIcon } from 'lucide-react'
import Player from './Player'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  const isAdmin = user?.email === adminEmail

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">Music Player</h1>
            </div>

            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isActive('/')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>

              {/* Solo mostrar Admin si el usuario es administrador */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isActive('/admin')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 py-6 h-full pb-32">
          {children}
        </div>
      </main>

      {/* Player fijo en la parte inferior */}
      <Player />
    </div>
  )
}
