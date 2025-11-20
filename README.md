# Music Player - Reproductor de Música Web

Reproductor de música completo con React, Tailwind CSS y Supabase. Perfecto para subir tus canciones creadas en Suno y organizar tus listas de reproducción.

## Características

- **Reproductor completo**: Play, pausa, siguiente, anterior, barra de progreso
- **Modos de reproducción**: Normal, aleatorio, repetir todo, repetir una
- **Listas de reproducción**: Crea y organiza múltiples playlists
- **Letras sincronizadas**: Formato LRC con sincronización en tiempo real
- **Panel de administración**: Gestiona tus listas y sube canciones
- **Autenticación**: Sistema de login/registro seguro con Supabase
- **Responsive**: Funciona perfectamente en móviles, tablets y desktop
- **Almacenamiento gratuito**: 2GB gratis con Supabase Storage

## Requisitos Previos

- Node.js (versión 18 o superior)
- Una cuenta en [Supabase](https://supabase.com) (gratuita)
- Git

## Instalación

### 1. Instalar Node.js

Si no tienes Node.js instalado:

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

**Windows:**
Descarga el instalador desde [nodejs.org](https://nodejs.org)

### 2. Clonar/Descargar el Proyecto

Si usas Git:
```bash
cd music-player
```

### 3. Instalar Dependencias

```bash
npm install
```

## Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la inicialización (2-3 minutos)

### 2. Obtener Credenciales

1. En el panel de Supabase, ve a **Settings** > **API**
2. Copia:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon` `public` key (VITE_SUPABASE_ANON_KEY)

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` y pega tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Crear Tablas en la Base de Datos

En Supabase, ve a **SQL Editor** y ejecuta este script:

```sql
-- Tabla de playlists
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla de canciones
CREATE TABLE songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  lyrics_url TEXT,
  duration INTEGER,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_songs_playlist_id ON songs(playlist_id);

-- Row Level Security (RLS)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios pueden ver todas las playlists y canciones
CREATE POLICY "Playlists públicas" ON playlists FOR SELECT USING (true);
CREATE POLICY "Canciones públicas" ON songs FOR SELECT USING (true);

-- Políticas: Solo usuarios autenticados pueden crear/editar/eliminar
CREATE POLICY "Usuarios autenticados pueden crear playlists"
  ON playlists FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar playlists"
  ON playlists FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar playlists"
  ON playlists FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear canciones"
  ON songs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar canciones"
  ON songs FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar canciones"
  ON songs FOR DELETE
  USING (auth.role() = 'authenticated');
```

### 5. Configurar Storage (Almacenamiento)

En Supabase, ve a **Storage** y crea dos buckets:

#### Bucket 1: `audio-files`
1. Click en **New bucket**
2. Nombre: `audio-files`
3. **Public bucket**: Activado ✅
4. Click en **Create bucket**

#### Bucket 2: `lyrics`
1. Click en **New bucket**
2. Nombre: `lyrics`
3. **Public bucket**: Activado ✅
4. Click en **Create bucket**

### 6. Configurar Autenticación

En Supabase, ve a **Authentication** > **Providers**:
1. Asegúrate de que **Email** esté habilitado
2. En **Email Auth** > desactiva "Confirm email" si quieres registro instantáneo (opcional)

## Ejecutar el Proyecto Localmente

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## Uso

### Registrarse/Iniciar Sesión

1. Abre la aplicación
2. Crea una cuenta con email y contraseña
3. Inicia sesión

### Crear Listas de Reproducción y Subir Canciones

1. Ve a la sección **Admin** (icono de configuración)
2. Click en **Nueva** para crear una playlist
3. Selecciona la playlist
4. Click en **Agregar** para subir canciones
5. Completa los datos:
   - Título de la canción
   - Artista (opcional)
   - Archivo de audio (MP3, WAV, etc.)
   - Letras en formato LRC (opcional)

### Formato LRC para Letras

Las letras deben seguir el formato LRC:

```
[00:12.00]Primera línea de la canción
[00:17.50]Segunda línea
[00:23.00]Tercera línea
```

Formato: `[mm:ss.xx]Texto de la letra`

Puedes usar herramientas online como [lrcgenerator.com](https://lrcgenerator.com) para crear archivos LRC fácilmente.

### Reproducir Música

1. Ve a **Inicio**
2. Selecciona una playlist
3. Click en cualquier canción para reproducir
4. Usa los controles del reproductor:
   - Play/Pausa
   - Siguiente/Anterior
   - Aleatorio
   - Repetir (todo/una)
   - Volumen

## Despliegue en Vercel

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

### 2. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Click en **Add New Project**
3. Importa tu repositorio de GitHub
4. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu anon key de Supabase
5. Click en **Deploy**

¡Listo! Tu aplicación estará en línea en unos minutos.

### Actualizar la Aplicación

Cada vez que hagas cambios y los subas a GitHub:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel automáticamente desplegará la nueva versión.

## Estructura del Proyecto

```
music-player/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Auth.jsx       # Login/Registro
│   │   ├── Player.jsx     # Reproductor de audio
│   │   ├── LyricsViewer.jsx   # Visualizador de letras
│   │   ├── PlaylistList.jsx   # Lista de playlists
│   │   ├── AdminPanel.jsx     # Panel de administración
│   │   └── Layout.jsx         # Layout principal
│   ├── pages/             # Páginas
│   │   ├── Home.jsx       # Página principal
│   │   └── Admin.jsx      # Página de administración
│   ├── context/           # Contextos de React
│   │   ├── AuthContext.jsx    # Autenticación
│   │   └── PlayerContext.jsx  # Estado del reproductor
│   ├── services/          # Servicios externos
│   │   └── supabase.js    # Configuración de Supabase
│   ├── App.jsx           # Componente raíz
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── public/               # Archivos estáticos
├── .env                  # Variables de entorno (no subir a Git)
├── .env.example         # Ejemplo de variables de entorno
├── package.json         # Dependencias
├── tailwind.config.js   # Configuración de Tailwind
├── vite.config.js       # Configuración de Vite
└── README.md           # Este archivo
```

## Tecnologías Utilizadas

- **React 18**: Librería de UI
- **Vite**: Build tool ultra-rápido
- **Tailwind CSS**: Framework de CSS utility-first
- **Supabase**: Backend (Base de datos, Auth, Storage)
- **React Router**: Navegación
- **Lucide React**: Iconos
- **HTML5 Audio API**: Reproducción de audio

## Solución de Problemas

### Error al cargar canciones

- Verifica que los buckets en Supabase estén configurados como públicos
- Revisa las políticas RLS en las tablas

### Error de autenticación

- Verifica que las variables de entorno en `.env` sean correctas
- Asegúrate de que la autenticación por email esté habilitada en Supabase

### Las letras no se sincronizan

- Verifica que el formato LRC sea correcto
- Los timestamps deben estar en orden cronológico

## Límites del Plan Gratuito de Supabase

- **Base de datos**: 500 MB
- **Storage**: 2 GB
- **Usuarios**: Ilimitados
- **Transferencia**: 5 GB/mes

Suficiente para aproximadamente 500-1000 canciones en MP3 (dependiendo de la calidad).

## Licencia

Este proyecto es de código abierto. Úsalo y modifícalo libremente.

## Soporte

Si tienes problemas o preguntas, abre un issue en el repositorio de GitHub.

---

Hecho con ❤️ para los amantes de la música
