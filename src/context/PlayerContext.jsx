import { createContext, useContext, useState, useRef, useEffect } from 'react'

const PlayerContext = createContext({})

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer debe ser usado dentro de un PlayerProvider')
  }
  return context
}

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off') // 'off', 'all', 'one'
  const [originalPlaylist, setOriginalPlaylist] = useState([])

  const audioRef = useRef(new Audio())

  useEffect(() => {
    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      handleNext()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playlist, currentSong, repeatMode])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  const playSong = (song, playlistSongs = null) => {
    if (playlistSongs) {
      setPlaylist(playlistSongs)
      if (!isShuffled) {
        setOriginalPlaylist(playlistSongs)
      }
    }

    setCurrentSong(song)
    audioRef.current.src = song.audio_url
    audioRef.current.play()
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (!playlist.length || !currentSong) return

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id)

    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      return
    }

    let nextIndex = currentIndex + 1

    if (nextIndex >= playlist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0
      } else {
        setIsPlaying(false)
        return
      }
    }

    playSong(playlist[nextIndex])
  }

  const handlePrevious = () => {
    if (!playlist.length || !currentSong) return

    // Si han pasado más de 3 segundos, reiniciar la canción actual
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id)
    let prevIndex = currentIndex - 1

    if (prevIndex < 0) {
      prevIndex = playlist.length - 1
    }

    playSong(playlist[prevIndex])
  }

  const seekTo = (time) => {
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const toggleShuffle = () => {
    if (!isShuffled) {
      // Activar shuffle
      setOriginalPlaylist([...playlist])
      const shuffled = [...playlist].sort(() => Math.random() - 0.5)
      setPlaylist(shuffled)
    } else {
      // Desactivar shuffle
      setPlaylist([...originalPlaylist])
    }
    setIsShuffled(!isShuffled)
  }

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }

  const value = {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffled,
    repeatMode,
    playSong,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    audioRef,
  }

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  )
}
