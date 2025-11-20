import { useState } from 'react'
import PlaylistList from '../components/PlaylistList'
import LyricsViewer from '../components/LyricsViewer'
import { usePlayer } from '../context/PlayerContext'
import { Music2, FileText } from 'lucide-react'

export default function Home() {
  const [showLyrics, setShowLyrics] = useState(false)
  const { currentSong } = usePlayer()

  return (
    <div className="h-full flex flex-col">
      {/* Tabs para móvil */}
      <div className="lg:hidden flex gap-2 mb-4">
        <button
          onClick={() => setShowLyrics(false)}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            !showLyrics
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Music2 className="w-4 h-4" />
          Canciones
        </button>
        <button
          onClick={() => setShowLyrics(true)}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            showLyrics
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Letras
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden">
        {/* Vista móvil */}
        <div className="lg:hidden h-full">
          {showLyrics ? (
            <div className="h-full card flex flex-col">
              <LyricsViewer lyricsUrl={currentSong?.lyrics_url} />
            </div>
          ) : (
            <PlaylistList />
          )}
        </div>

        {/* Vista desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-full">
          <div className="col-span-2 overflow-auto">
            <PlaylistList />
          </div>
          <div className="card flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 flex-shrink-0">
              <FileText className="w-5 h-5" />
              Letras
            </h2>
            <div className="flex-1 overflow-hidden">
              <LyricsViewer lyricsUrl={currentSong?.lyrics_url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
