// Servicio para subir archivos a Cloudinary

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadAudioFile = async (file, playlistId) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `music-player/${playlistId}`)
  formData.append('resource_type', 'video') // Cloudinary usa 'video' para audio

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Error al subir el archivo')
  }

  const data = await response.json()
  return data.secure_url
}

export const uploadLyricsFile = async (lyrics, songId) => {
  // Crear un archivo blob con las letras
  const blob = new Blob([lyrics], { type: 'text/plain' })
  const file = new File([blob], `${songId}.lrc`, { type: 'text/plain' })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'music-player/lyrics')
  formData.append('resource_type', 'raw') // Para archivos de texto

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Error al subir las letras')
  }

  const data = await response.json()
  return data.secure_url
}

export const deleteAudioFile = async (url) => {
  // Nota: Para eliminar archivos en Cloudinary necesitas el API Secret
  // que no debe estar en el frontend. Por ahora solo dejamos los archivos
  // huérfanos. Puedes limpiarlos manualmente desde el dashboard de Cloudinary
  // o implementar un backend que maneje las eliminaciones.
  console.log('Archivo marcado para eliminación:', url)
  // No hacemos nada por ahora (solo en desarrollo)
}
