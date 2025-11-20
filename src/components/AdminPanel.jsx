import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { uploadAudioFile, uploadLyricsFile, deleteAudioFile } from '../services/cloudinary'
import {
  Plus,
  Trash2,
  Upload,
  Music,
  FileText,
  Save,
  X,
  ListMusic,
  Loader
} from 'lucide-react'

export default function AdminPanel() {
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para crear playlist
  const [showPlaylistForm, setShowPlaylistForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')

  // Estados para crear canción
  const [showSongForm, setShowSongForm] = useState(false)
  const [newSongTitle, setNewSongTitle] = useState('')
  const [newSongArtist, setNewSongArtist] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [lyricsText, setLyricsText] = useState('')
  const [uploading, setUploading] = useState(false)

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
      alert('Error al cargar las playlists')
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

  const createPlaylist = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([
          {
            name: newPlaylistName,
            description: newPlaylistDesc,
          },
        ])
        .select()

      if (error) throw error

      setPlaylists([data[0], ...playlists])
      setNewPlaylistName('')
      setNewPlaylistDesc('')
      setShowPlaylistForm(false)
      alert('Lista de reproducción creada exitosamente')
    } catch (error) {
      console.error('Error creando playlist:', error)
      alert('Error al crear la playlist')
    } finally {
      setLoading(false)
    }
  }

  const deletePlaylist = async (playlistId) => {
    if (!confirm('¿Estás seguro de eliminar esta lista y todas sus canciones?')) return

    try {
      // Primero eliminar todas las canciones
      const { data: songsToDelete } = await supabase
        .from('songs')
        .select('audio_url')
        .eq('playlist_id', playlistId)

      // Eliminar archivos de audio
      for (const song of songsToDelete || []) {
        try {
          await deleteAudioFile(song.audio_url)
        } catch (err) {
          console.error('Error eliminando archivo:', err)
        }
      }

      // Eliminar canciones de la base de datos
      await supabase.from('songs').delete().eq('playlist_id', playlistId)

      // Eliminar playlist
      const { error } = await supabase.from('playlists').delete().eq('id', playlistId)

      if (error) throw error

      setPlaylists(playlists.filter((p) => p.id !== playlistId))
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null)
        setSongs([])
      }
      alert('Lista eliminada exitosamente')
    } catch (error) {
      console.error('Error eliminando playlist:', error)
      alert('Error al eliminar la playlist')
    }
  }

  const createSong = async (e) => {
    e.preventDefault()
    if (!selectedPlaylist) {
      alert('Selecciona una playlist primero')
      return
    }
    if (!audioFile) {
      alert('Debes seleccionar un archivo de audio')
      return
    }

    setUploading(true)

    try {
      // Obtener duración del archivo de audio
      const duration = await new Promise((resolve) => {
        const audio = new Audio()
        audio.addEventListener('loadedmetadata', () => {
          resolve(Math.floor(audio.duration))
        })
        audio.src = URL.createObjectURL(audioFile)
      })

      // Subir archivo de audio
      const audioUrl = await uploadAudioFile(audioFile, selectedPlaylist.id)

      // Crear entrada en la base de datos
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert([
          {
            title: newSongTitle,
            artist: newSongArtist || null,
            audio_url: audioUrl,
            playlist_id: selectedPlaylist.id,
            order_index: songs.length,
            duration: duration,
          },
        ])
        .select()

      if (songError) throw songError

      const newSong = songData[0]

      // Si hay letras, subirlas
      if (lyricsText.trim()) {
        const lyricsUrl = await uploadLyricsFile(lyricsText, newSong.id)

        // Actualizar canción con URL de letras
        await supabase
          .from('songs')
          .update({ lyrics_url: lyricsUrl })
          .eq('id', newSong.id)

        newSong.lyrics_url = lyricsUrl
      }

      setSongs([...songs, newSong])
      setNewSongTitle('')
      setNewSongArtist('')
      setAudioFile(null)
      setLyricsText('')
      setShowSongForm(false)
      alert('Canción agregada exitosamente')
    } catch (error) {
      console.error('Error creando canción:', error)
      alert('Error al agregar la canción: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteSong = async (song) => {
    if (!confirm(`¿Eliminar "${song.title}"?`)) return

    try {
      // Eliminar archivo de audio
      await deleteAudioFile(song.audio_url)

      // Eliminar de la base de datos
      const { error } = await supabase.from('songs').delete().eq('id', song.id)

      if (error) throw error

      setSongs(songs.filter((s) => s.id !== song.id))
      alert('Canción eliminada')
    } catch (error) {
      console.error('Error eliminando canción:', error)
      alert('Error al eliminar la canción')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Music className="w-8 h-8" />
          Panel de Administración
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playlists */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ListMusic className="w-5 h-5" />
              Listas de Reproducción
            </h2>
            <button
              onClick={() => setShowPlaylistForm(!showPlaylistForm)}
              className="btn-primary flex items-center gap-2"
            >
              {showPlaylistForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showPlaylistForm ? 'Cancelar' : 'Nueva'}
            </button>
          </div>

          {showPlaylistForm && (
            <form onSubmit={createPlaylist} className="mb-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Nombre de la lista"
                className="input w-full"
                required
              />
              <textarea
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Descripción (opcional)"
                className="input w-full resize-none"
                rows="2"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creando...' : 'Crear Lista'}
              </button>
            </form>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedPlaylist?.id === playlist.id
                    ? 'bg-primary-900/30 ring-2 ring-primary-500'
                    : 'bg-gray-700/30 hover:bg-gray-700/50'
                }`}
                onClick={() => {
                  setSelectedPlaylist(playlist)
                  fetchSongs(playlist.id)
                  setShowSongForm(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {playlist.description || 'Sin descripción'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePlaylist(playlist.id)
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {playlists.length === 0 && (
              <p className="text-gray-500 text-center py-8">No hay listas creadas</p>
            )}
          </div>
        </div>

        {/* Canciones */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Music className="w-5 h-5" />
              Canciones
              {selectedPlaylist && (
                <span className="text-sm text-gray-400">({selectedPlaylist.name})</span>
              )}
            </h2>
            <button
              onClick={() => setShowSongForm(!showSongForm)}
              disabled={!selectedPlaylist}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showSongForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showSongForm ? 'Cancelar' : 'Agregar'}
            </button>
          </div>

          {!selectedPlaylist ? (
            <p className="text-gray-500 text-center py-8">Selecciona una lista primero</p>
          ) : (
            <>
              {showSongForm && (
                <form onSubmit={createSong} className="mb-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
                  <input
                    type="text"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    placeholder="Título de la canción"
                    className="input w-full"
                    required
                  />
                  <input
                    type="text"
                    value={newSongArtist}
                    onChange={(e) => setNewSongArtist(e.target.value)}
                    placeholder="Artista (opcional)"
                    className="input w-full"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Archivo de Audio *
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files[0])}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Letras (opcional)
                    </label>
                    <textarea
                      value={lyricsText}
                      onChange={(e) => setLyricsText(e.target.value)}
                      placeholder="Pega aquí las letras de tu canción&#10;&#10;Puedes pegarlas como texto normal o en formato LRC&#10;[00:12.00]Primera línea&#10;[00:17.50]Segunda línea"
                      className="input w-full resize-none font-mono text-sm"
                      rows="6"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Pega el texto de Suno directamente, o usa formato LRC [mm:ss.xx] para sincronización automática
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Agregar Canción
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                {songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-gray-400 font-mono">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{song.title}</h4>
                          <p className="text-sm text-gray-400 truncate">
                            {song.artist || 'Sin artista'}
                          </p>
                        </div>
                        {song.lyrics_url && (
                          <FileText className="w-4 h-4 text-primary-400" title="Tiene letras" />
                        )}
                      </div>
                      <button
                        onClick={() => deleteSong(song)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {songs.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No hay canciones en esta lista</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card bg-blue-900/20 border-blue-500/50">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Guía para Letras
        </h3>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-200 mb-1">📝 Texto Normal (más fácil)</p>
            <p className="text-xs text-gray-300 mb-2">
              Copia y pega las letras de Suno directamente. Se mostrarán con scroll manual.
            </p>
            <pre className="bg-gray-900/50 p-3 rounded text-xs overflow-x-auto">
              {`Primera línea de la canción
Segunda línea
Tercera línea...`}
            </pre>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-200 mb-1">⏱️ Formato LRC (sincronizado como Spotify)</p>
            <p className="text-xs text-gray-300 mb-2">
              Agrega timestamps para que las letras se sincronicen automáticamente.
            </p>
            <pre className="bg-gray-900/50 p-3 rounded text-xs overflow-x-auto">
              {`[00:12.00]Primera línea
[00:17.50]Segunda línea
[00:23.00]Tercera línea...`}
            </pre>
            <p className="text-xs text-gray-400 mt-1">
              Formato: [mm:ss.xx]Texto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
