import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { usePlayer } from '../context/PlayerContext'
import { Music, Play, ListMusic, Clock } from 'lucide-react'

export default function PlaylistList() {
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  const { playSong, currentSong } = usePlayer()

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlaylists(data || [])
    } catch (error) {
      console.error('Error cargando playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSongs = async (playlistId) => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setSongs(data || [])
    } catch (error) {
      console.error('Error cargando canciones:', error)
    }
  }

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist)
    fetchSongs(playlist.id)
  }

  const handleSongClick = (song, index) => {
    playSong(song, songs)
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <ListMusic className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg mb-2">No hay listas de reproducción</p>
        <p className="text-sm">Ve al panel de administración para crear una</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Lista de playlists */}
      <div className="lg:col-span-1 space-y-4 overflow-y-auto scrollbar-thin">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ListMusic className="w-6 h-6" />
          Mis Listas
        </h2>

        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => handlePlaylistClick(playlist)}
            className={`card cursor-pointer transition-all hover:scale-105 ${
              selectedPlaylist?.id === playlist.id
                ? 'ring-2 ring-primary-500 bg-primary-900/20'
                : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{playlist.name}</h3>
                <p className="text-gray-400 text-sm truncate">
                  {playlist.description || 'Sin descripción'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de canciones */}
      <div className="lg:col-span-2">
        {selectedPlaylist ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedPlaylist.name}</h2>
                <p className="text-gray-400">{songs.length} canciones</p>
              </div>
              <button
                onClick={handlePlayAll}
                className="btn-primary flex items-center gap-2"
                disabled={songs.length === 0}
              >
                <Play className="w-5 h-5" />
                Reproducir Todo
              </button>
            </div>

            <div className="space-y-2">
              {songs.length === 0 ? (
                <div className="card text-center text-gray-500 py-8">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Esta lista está vacía</p>
                </div>
              ) : (
                songs.map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => handleSongClick(song, index)}
                    className={`card cursor-pointer transition-all hover:bg-gray-700/50 ${
                      currentSong?.id === song.id ? 'bg-primary-900/20 ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center text-gray-400 font-mono">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {song.title}
                          {currentSong?.id === song.id && (
                            <span className="ml-2 inline-block">
                              <Music className="w-4 h-4 inline text-primary-500 animate-pulse-slow" />
                            </span>
                          )}
                        </h4>
                        <p className="text-gray-400 text-sm truncate">
                          {song.artist || 'Artista Desconocido'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(song.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <ListMusic className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecciona una lista de reproducción</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
