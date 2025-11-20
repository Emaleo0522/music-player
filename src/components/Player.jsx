import { usePlayer } from '../context/PlayerContext'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react'

export default function Player() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffled,
    repeatMode,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer()

  if (!currentSong) {
    return null
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const progressBarWidth = progressBar.offsetWidth
    const clickPercentage = clickPosition / progressBarWidth
    const newTime = clickPercentage * duration
    seekTo(newTime)
  }

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  const toggleMute = () => {
    setVolume(volume === 0 ? 1 : 0)
  }

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 p-4 z-50">
      <div className="max-w-screen-2xl mx-auto">
        {/* Barra de progreso */}
        <div className="mb-4">
          <div
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full relative group-hover:h-2 transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Información de la canción */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold">
                {currentSong.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">{currentSong.title}</h3>
              <p className="text-gray-400 text-sm truncate">{currentSong.artist || 'Artista Desconocido'}</p>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${
                isShuffled
                  ? 'text-primary-400 bg-primary-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Aleatorio"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={handlePrevious}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Anterior"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 bg-white text-black hover:bg-gray-100 rounded-full transition-colors"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Siguiente"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-lg transition-colors ${
                repeatMode !== 'off'
                  ? 'text-primary-400 bg-primary-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={`Repetir: ${repeatMode === 'off' ? 'Desactivado' : repeatMode === 'all' ? 'Todos' : 'Una'}`}
            >
              <RepeatIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Control de volumen */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
