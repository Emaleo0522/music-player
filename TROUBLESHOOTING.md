# Guía de Solución de Problemas

Esta guía te ayudará a resolver los problemas más comunes que puedas encontrar.

## Problemas de Instalación

### Error: "npm: command not found"

**Causa**: Node.js no está instalado o no está en el PATH.

**Solución**:
```bash
# Verificar si Node está instalado
node --version

# Si no está instalado, instálalo:
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS:
brew install node

# Windows: Descargar desde nodejs.org
```

### Error: "Cannot find module 'vite'"

**Causa**: Las dependencias no se instalaron correctamente.

**Solución**:
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error: "EACCES: permission denied"

**Causa**: Permisos insuficientes.

**Solución**:
```bash
# NO uses sudo npm install
# En su lugar, configura npm para tu usuario:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Ahora instala de nuevo:
npm install
```

## Problemas con Supabase

### Error: "Invalid API key"

**Causa**: Las credenciales en `.env` son incorrectas.

**Solución**:
1. Ve a Supabase → Settings → API
2. Copia las credenciales exactas
3. Verifica que el archivo se llame `.env` (no `.env.txt` o `.env.example`)
4. Reinicia el servidor: `npm run dev`

**Verifica**:
```bash
# Ver contenido del .env
cat .env

# Debe mostrar:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Error: "relation 'playlists' does not exist"

**Causa**: Las tablas no se crearon en Supabase.

**Solución**:
1. Ve a Supabase → SQL Editor
2. Ejecuta el script SQL completo del README.md
3. Verifica en **Database** → **Tables** que existan `playlists` y `songs`

### Error: "Row Level Security: new row violates policy"

**Causa**: Las políticas RLS están bloqueando la operación.

**Solución**:
```sql
-- En Supabase SQL Editor, verifica las políticas:
SELECT * FROM pg_policies WHERE tablename IN ('playlists', 'songs');

-- Si faltan, ejecuta de nuevo las políticas del README
```

### Error al subir archivos: "403 Forbidden"

**Causa**: El bucket no es público o no existe.

**Solución**:
1. Ve a Storage en Supabase
2. Click en el bucket `audio-files`
3. Asegúrate de que **Public** esté activado
4. Si no existe, créalo con "Public bucket" activado

## Problemas de Reproducción

### Las canciones no se reproducen

**Diagnóstico**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Reproduce una canción
4. Busca el archivo de audio

**Soluciones**:

**Si aparece 403/404**:
- Verifica que el bucket `audio-files` sea público
- Revisa que la URL en la base de datos sea correcta

**Si aparece "CORS error"**:
```sql
-- En Supabase, ve a Storage → audio-files → Configuration
-- Asegúrate de que CORS esté habilitado
```

**Si el audio no carga**:
- Verifica el formato del archivo (MP3 es más compatible)
- Intenta con un archivo más pequeño
- Revisa la consola por errores de CORS

### El audio se corta o tiene lag

**Causas**:
- Conexión lenta
- Archivo muy grande
- Formato no optimizado

**Soluciones**:
1. **Comprimir audio**:
   ```bash
   # Usa FFmpeg para comprimir (instalarlo primero)
   ffmpeg -i cancion.mp3 -b:a 128k cancion-comprimida.mp3
   ```

2. **Convertir a MP3** si está en otro formato:
   ```bash
   ffmpeg -i cancion.wav -codec:a libmp3lame -b:a 192k cancion.mp3
   ```

3. **Usar CDN** (avanzado):
   - Considera usar Cloudflare como proxy

### Las letras no se sincronizan

**Verifica el formato LRC**:
```bash
# Formato correcto:
[00:12.00]Línea de letra

# Formato incorrecto:
[0:12]Línea        # Falta cero y centésimas
00:12.00 Línea     # Faltan corchetes
[00.12.00]Línea    # Punto en vez de dos puntos
```

**Solución**:
1. Verifica que los timestamps estén en orden ascendente
2. Asegúrate de usar el formato exacto: `[mm:ss.xx]`
3. Prueba en [lrclib.net](https://lrclib.net) para validar

### El volumen es muy bajo

**Solución**:
```bash
# Normalizar audio con FFmpeg:
ffmpeg -i entrada.mp3 -filter:a loudnorm salida.mp3
```

## Problemas de Autenticación

### "Invalid login credentials"

**Causas**:
- Contraseña incorrecta
- Usuario no existe
- Email no confirmado (si está activado)

**Solución**:
1. Ve a Supabase → Authentication → Users
2. Verifica que el usuario exista
3. Si "Confirm email" está activado y es desarrollo, desactívalo:
   - Authentication → Providers → Email → Desactiva "Confirm email"

### No puedo registrarme

**Solución**:
```bash
# Verifica en Supabase:
# 1. Authentication → Providers → Email debe estar "Enabled"
# 2. Revisa la consola del navegador por errores
# 3. Intenta con otro email
```

### Sesión expira constantemente

**Solución**:
```javascript
// En src/services/supabase.js, configura persistencia:
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

## Problemas de Deployment (Vercel)

### Error: "Environment variables not found"

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy desde Deployments → ... → Redeploy

### "404 Not Found" en rutas

**Causa**: Vercel no sabe que es una SPA.

**Solución**:
El archivo `vercel.json` ya está incluido, pero verifica que tenga:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build falla en Vercel

**Solución**:
```bash
# Prueba el build localmente primero:
npm run build

# Si falla, revisa los errores
# Usualmente son:
# - Imports faltantes
# - Variables de entorno no definidas
# - Errores de TypeScript/ESLint
```

## Problemas de Performance

### La aplicación es lenta

**Diagnóstico**:
```bash
# Abre DevTools (F12) → Lighthouse
# Ejecuta un audit
```

**Soluciones**:

1. **Optimizar imágenes** (si agregas portadas):
   ```bash
   # Comprimir con ImageMagick
   convert portada.jpg -quality 85 -resize 500x500 portada-opt.jpg
   ```

2. **Code splitting** (avanzado):
   ```javascript
   // En App.jsx, lazy load páginas:
   const Home = lazy(() => import('./pages/Home'))
   const Admin = lazy(() => import('./pages/Admin'))
   ```

3. **Optimizar queries de Supabase**:
   ```javascript
   // Usa select específico en vez de *
   .select('id, title, artist')  // Solo lo que necesitas
   .limit(20)  // Paginar resultados
   ```

### Muchas re-renderizaciones

**Solución**:
```javascript
// Usa React.memo en componentes pesados:
import { memo } from 'react'

const PlaylistList = memo(({ playlists }) => {
  // ...
})

export default PlaylistList
```

## Problemas de UI

### Estilos no se aplican

**Solución**:
```bash
# Verifica que Tailwind esté compilando
# En la consola debería ver:
# ➜ vite v5.x.x ready in xxx ms

# Si los estilos no cargan:
npm run dev -- --force

# O limpia caché:
rm -rf node_modules/.vite
npm run dev
```

### Responsive no funciona en móvil

**Diagnóstico**:
1. Abre DevTools (F12)
2. Click en el icono de móvil (Ctrl+Shift+M)
3. Prueba diferentes dispositivos

**Solución**:
- Verifica que `index.html` tenga:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ```

### Iconos no aparecen

**Causa**: Lucide React no se instaló.

**Solución**:
```bash
npm install lucide-react
```

## Problemas con Git

### "fatal: not a git repository"

**Solución**:
```bash
git init
git add .
git commit -m "Initial commit"
```

### Conflictos al hacer push

**Solución**:
```bash
# Primero pull, luego push
git pull origin main
git push origin main
```

### `.env` subido a GitHub (¡PELIGRO!)

**Solución URGENTE**:
```bash
# 1. Eliminar del historial
git rm --cached .env
git commit -m "Remove .env from tracking"
git push

# 2. Regenerar credenciales en Supabase:
# Settings → API → Reset anon key

# 3. Actualizar .env local con nuevas credenciales
```

## Problemas de Base de Datos

### "Too many connections"

**Causa**: Has alcanzado el límite de conexiones simultáneas.

**Solución**:
```javascript
// Usa connection pooling (Supabase lo maneja automáticamente)
// Si persiste, considera upgrading o usar menos pestañas abiertas
```

### Datos no se actualizan en tiempo real

**Solución**:
```javascript
// Implementa realtime subscriptions:
const channel = supabase
  .channel('playlists-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'playlists' },
    (payload) => {
      console.log('Change received!', payload)
      fetchPlaylists() // Recargar datos
    }
  )
  .subscribe()

// No olvides cleanup:
return () => supabase.removeChannel(channel)
```

## Optimización de Storage

### Alcanzaste el límite de 2GB

**Opciones**:

1. **Comprimir audio**:
   ```bash
   # MP3 a 128kbps (buena calidad, menor tamaño)
   ffmpeg -i entrada.mp3 -b:a 128k salida.mp3

   # Variable bitrate (calidad adaptativa)
   ffmpeg -i entrada.mp3 -q:a 2 salida.mp3
   ```

2. **Eliminar canciones no usadas**:
   - Panel de Admin → Eliminar canciones viejas

3. **Upgrade a plan Pro de Supabase** ($25/mes):
   - 100GB de storage
   - Sin límites de ancho de banda

4. **Usar otro storage gratuito**:
   - Cloudinary (25GB gratis)
   - Backblaze B2 (10GB gratis)

### Subidas fallan por tamaño

**Solución**:
```javascript
// En AdminPanel.jsx, agrega validación:
const createSong = async (e) => {
  e.preventDefault()

  // Verificar tamaño (max 50MB)
  if (audioFile.size > 50 * 1024 * 1024) {
    alert('El archivo es muy grande (máximo 50MB)')
    return
  }

  // ... resto del código
}
```

## Debugging Avanzado

### Habilitar logs de Supabase

```javascript
// En src/services/supabase.js:
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true  // Logs de autenticación
  }
})

// También en consola del navegador:
localStorage.setItem('supabase.auth.debug', 'true')
```

### Ver queries de base de datos

1. Ve a Supabase → Database → Logs
2. Filtra por "postgres"
3. Ve todas las queries ejecutadas

### Monitorear rendimiento

```javascript
// En componentes pesados:
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`)
}

<Profiler id="PlayerList" onRender={onRenderCallback}>
  <PlaylistList />
</Profiler>
```

## Herramientas Útiles

### Para desarrollo:
- **React DevTools**: Extensión de Chrome/Firefox
- **Redux DevTools**: Si agregas Redux
- **Postman**: Probar APIs de Supabase
- **TablePlus**: Cliente de base de datos GUI

### Para debugging:
- **Chrome DevTools**: F12 → Console, Network, Performance
- **Lighthouse**: Auditoría de performance
- **WebPageTest**: Test de velocidad avanzado

### Para audio:
- **FFmpeg**: Manipular archivos de audio
- **Audacity**: Editor de audio gratuito
- **MediaInfo**: Ver metadatos de archivos

## Contacto y Ayuda

Si ninguna solución funcionó:

1. **Revisa GitHub Issues** del proyecto
2. **Busca en Stack Overflow** con palabras clave específicas
3. **Pregunta en Reddit**: r/reactjs, r/webdev
4. **Discord de Supabase**: [discord.supabase.com](https://discord.supabase.com)
5. **Documentación oficial**:
   - [React](https://react.dev)
   - [Supabase](https://supabase.com/docs)
   - [Tailwind](https://tailwindcss.com/docs)

## Checklist de Depuración

Antes de pedir ayuda, verifica:

- [ ] Leíste el mensaje de error completo
- [ ] Buscaste el error en Google
- [ ] Revisaste la consola del navegador (F12)
- [ ] Verificaste las variables de entorno
- [ ] Reiniciaste el servidor de desarrollo
- [ ] Limpiaste caché y node_modules
- [ ] Probaste en modo incógnito
- [ ] Verificaste la configuración de Supabase
- [ ] Revisaste los logs de Supabase
- [ ] El problema se reproduce consistentemente

---

¡La mayoría de problemas tienen solución! No te rindas 💪
