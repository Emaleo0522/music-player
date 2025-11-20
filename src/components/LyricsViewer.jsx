import { useEffect, useState, useRef } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { FileText } from 'lucide-react'

// Parser para formato LRC (Letras con timestamps)
// Formato: [mm:ss.xx]Texto de la letra
const parseLRC = (lrcText) => {
  if (!lrcText) return { type: 'none', lines: [] }

  const lines = lrcText.split('\n')
  const lrcLines = []
  const plainLines = []

  lines.forEach((line) => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const text = match[4].trim()

      const time = minutes * 60 + seconds + milliseconds / 1000

      lrcLines.push({ time, text })
    } else if (line.trim()) {
      plainLines.push(line.trim())
    }
  })

  // Si encontramos líneas con timestamps, usar modo LRC
  if (lrcLines.length > 0) {
    return { type: 'lrc', lines: lrcLines.sort((a, b) => a.time - b.time) }
  }

  // Si no, usar modo texto plano
  if (plainLines.length > 0) {
    return { type: 'plain', lines: plainLines }
  }

  return { type: 'none', lines: [] }
}

export default function LyricsViewer({ lyricsUrl }) {
  const [lyricsData, setLyricsData] = useState({ type: 'none', lines: [] })
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentTime } = usePlayer()
  const lyricsContainerRef = useRef(null)
  const currentLineRef = useRef(null)

  // Cargar letras desde la URL
  useEffect(() => {
    if (!lyricsUrl) {
      setLyricsData({ type: 'none', lines: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(lyricsUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.text()
      })
      .then((text) => {
        console.log('Letras cargadas:', text.substring(0, 100))
        const parsedLyrics = parseLRC(text)
        if (parsedLyrics.lines.length === 0) {
          setError('El archivo de letras está vacío')
        }
        setLyricsData(parsedLyrics)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando letras:', err)
        setError(err.message)
        setLyricsData({ type: 'none', lines: [] })
        setLoading(false)
      })
  }, [lyricsUrl])

  // Actualizar línea actual según el tiempo de reproducción (solo para LRC)
  useEffect(() => {
    if (lyricsData.type !== 'lrc' || lyricsData.lines.length === 0) return

    let index = -1
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (currentTime >= lyricsData.lines[i].time) {
        index = i
      } else {
        break
      }
    }

    setCurrentLineIndex(index)
  }, [currentTime, lyricsData])

  // Auto-scroll a la línea actual (solo para LRC)
  useEffect(() => {
    if (lyricsData.type !== 'lrc') return
    if (currentLineRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current
      const currentLine = currentLineRef.current

      const containerHeight = container.clientHeight
      const lineTop = currentLine.offsetTop
      const lineHeight = currentLine.clientHeight

      const scrollTo = lineTop - containerHeight / 2 + lineHeight / 2

      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth',
      })
    }
  }, [currentLineIndex, lyricsData.type])

  if (!lyricsUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <p>No hay letras disponibles</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <FileText className="w-16 h-16 mb-4 opacity-50 text-red-400" />
        <p className="text-red-400">Error al cargar letras</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    )
  }

  if (loading || lyricsData.lines.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4" />
        <p>Cargando letras...</p>
      </div>
    )
  }

  // Renderizado para letras en texto plano (sin sincronización)
  if (lyricsData.type === 'plain') {
    return (
      <div
        ref={lyricsContainerRef}
        className="w-full h-full overflow-y-auto scrollbar-thin px-4 py-8"
        style={{ maxHeight: '100%' }}
      >
        <div className="max-w-2xl mx-auto space-y-3">
          {lyricsData.lines.map((line, index) => (
            <p
              key={index}
              className="text-center text-lg md:text-xl text-gray-300 leading-relaxed"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    )
  }

  // Renderizado para letras LRC (con sincronización)
  return (
    <div
      ref={lyricsContainerRef}
      className="w-full h-full overflow-y-auto scrollbar-thin px-4 py-8"
      style={{ maxHeight: '100%' }}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {lyricsData.lines.map((line, index) => (
          <p
            key={index}
            ref={index === currentLineIndex ? currentLineRef : null}
            className={`text-center transition-all duration-300 ${
              index === currentLineIndex
                ? 'text-2xl md:text-3xl font-bold text-white scale-110'
                : index === currentLineIndex - 1 || index === currentLineIndex + 1
                ? 'text-lg md:text-xl text-gray-400'
                : 'text-base md:text-lg text-gray-600'
            }`}
          >
            {line.text || '♪'}
          </p>
        ))}
      </div>
    </div>
  )
}
