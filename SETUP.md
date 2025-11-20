# Guía de Configuración Paso a Paso

Esta guía te llevará paso a paso a través de la configuración completa del proyecto.

## Paso 1: Instalar Node.js

### ¿Qué es Node.js?
Node.js es el entorno que permite ejecutar JavaScript fuera del navegador. Lo necesitas para este proyecto.

### Instalación

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
1. Ve a [nodejs.org](https://nodejs.org)
2. Descarga la versión LTS
3. Ejecuta el instalador
4. Reinicia tu computadora

### Verificar instalación
```bash
node --version  # Debería mostrar v20.x.x o similar
npm --version   # Debería mostrar 10.x.x o similar
```

## Paso 2: Instalar Dependencias del Proyecto

En la carpeta `music-player`, ejecuta:

```bash
npm install
```

Este comando instalará todas las librerías necesarias. Puede tardar 1-2 minutos.

## Paso 3: Crear Cuenta en Supabase

### ¿Qué es Supabase?
Supabase es una plataforma gratuita que te da:
- Base de datos (para guardar playlists y canciones)
- Autenticación (login/registro de usuarios)
- Storage (almacenamiento de archivos de audio)

### Pasos:

1. Ve a [supabase.com](https://supabase.com)
2. Click en **Start your project**
3. Regístrate con GitHub, Google, o Email
4. Click en **New Project**
5. Completa:
   - **Name**: music-player (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige el más cercano a ti
6. Click en **Create new project**
7. **Espera 2-3 minutos** mientras Supabase configura tu proyecto

## Paso 4: Obtener las Credenciales de Supabase

1. Una vez creado el proyecto, ve a **Settings** (⚙️ abajo a la izquierda)
2. Click en **API**
3. En la sección **Project API keys**, verás:

```
Project URL: https://xxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cC...
```

**NO CIERRES ESTA PESTAÑA**, la necesitarás en el siguiente paso.

## Paso 5: Configurar Variables de Entorno

1. En la carpeta del proyecto, busca el archivo `.env.example`
2. Haz una copia y renómbrala a `.env`:

```bash
cp .env.example .env
```

3. Abre `.env` con un editor de texto
4. Pega tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cC...
```

5. Guarda el archivo

## Paso 6: Crear las Tablas en la Base de Datos

1. En Supabase, ve a **SQL Editor** (</> a la izquierda)
2. Click en **New query**
3. Copia y pega todo el siguiente código:

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

-- Índices para mejor rendimiento
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_songs_playlist_id ON songs(playlist_id);

-- Activar seguridad a nivel de fila
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver playlists y canciones
CREATE POLICY "Playlists públicas" ON playlists FOR SELECT USING (true);
CREATE POLICY "Canciones públicas" ON songs FOR SELECT USING (true);

-- Solo usuarios autenticados pueden crear/editar/eliminar
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

4. Click en **Run** (o presiona Ctrl+Enter)
5. Deberías ver: **Success. No rows returned**

## Paso 7: Configurar Storage (Almacenamiento)

### Crear bucket para archivos de audio:

1. En Supabase, ve a **Storage** (📦 a la izquierda)
2. Click en **New bucket**
3. Completa:
   - **Name**: `audio-files`
   - **Public bucket**: ✅ Activado (muy importante)
4. Click en **Create bucket**

### Crear bucket para letras:

1. Click en **New bucket** nuevamente
2. Completa:
   - **Name**: `lyrics`
   - **Public bucket**: ✅ Activado (muy importante)
3. Click en **Create bucket**

Deberías ver dos buckets creados.

## Paso 8: Configurar Autenticación

1. En Supabase, ve a **Authentication** (👤 a la izquierda)
2. Click en **Providers**
3. Asegúrate de que **Email** esté **Enabled** (habilitado)

**Opcional (para desarrollo más rápido):**
1. Click en **Email**
2. Desactiva **Confirm email** (para que no tengas que confirmar emails en desarrollo)
3. Click en **Save**

## Paso 9: Probar la Aplicación Localmente

En la terminal, dentro de la carpeta del proyecto:

```bash
npm run dev
```

Deberías ver algo como:

```
VITE v5.1.0  ready in 300 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Abre tu navegador en `http://localhost:3000`

## Paso 10: Crear tu Primera Cuenta

1. En la aplicación, verás la pantalla de login
2. Click en **Registrarse**
3. Ingresa tu email y contraseña
4. Click en **Crear Cuenta**
5. Inicia sesión con tus credenciales

## Paso 11: Crear tu Primera Playlist y Subir una Canción

### Crear Playlist:
1. Click en **Admin** (icono de configuración arriba a la derecha)
2. En la sección "Listas de Reproducción", click en **Nueva**
3. Ingresa:
   - **Nombre**: "Mi Primera Playlist"
   - **Descripción**: "Canciones de prueba"
4. Click en **Crear Lista**

### Subir Canción:
1. Click en la playlist que acabas de crear
2. En la sección "Canciones", click en **Agregar**
3. Completa:
   - **Título**: Nombre de tu canción
   - **Artista**: Tu nombre o el que prefieras
   - **Archivo de Audio**: Selecciona un MP3 desde tu computadora
   - **Letras** (opcional): Puedes dejarlo vacío por ahora
4. Click en **Agregar Canción**
5. Espera a que se suba (puede tardar según el tamaño del archivo)

### Reproducir:
1. Ve a **Inicio**
2. Click en tu playlist
3. Click en la canción para reproducir
4. ¡Disfruta! 🎵

## Paso 12: Desplegar en Vercel (Opcional)

### Subir a GitHub:

1. Crea un repositorio en [github.com](https://github.com)
2. En tu terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### Desplegar:

1. Ve a [vercel.com](https://vercel.com)
2. Crea cuenta (usa GitHub para facilidad)
3. Click en **Add New Project**
4. Importa tu repositorio
5. En **Environment Variables**, agrega:
   - Nombre: `VITE_SUPABASE_URL`, Valor: tu URL de Supabase
   - Nombre: `VITE_SUPABASE_ANON_KEY`, Valor: tu anon key de Supabase
6. Click en **Deploy**
7. Espera 1-2 minutos
8. ¡Tu app estará en línea!

## Formato LRC para Letras

Si quieres agregar letras sincronizadas:

### Formato:
```
[00:12.00]Primera línea de la letra
[00:17.50]Segunda línea
[00:23.00]Tercera línea
```

- `[mm:ss.xx]` = minutos:segundos.centésimas
- Cada línea debe empezar con un timestamp

### Herramientas Online:
- [lrcgenerator.com](https://lrcgenerator.com) - Genera LRC mientras escuchas la canción
- [lrclib.net](https://lrclib.net) - Base de datos de letras en formato LRC

## Solución de Problemas Comunes

### "Cannot find module..."
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Supabase client is not defined"
- Verifica que el archivo `.env` exista y tenga las credenciales correctas
- Reinicia el servidor (`npm run dev`)

### "Error uploading file"
- Asegúrate de que los buckets en Storage sean **públicos**
- Verifica que los nombres sean exactamente `audio-files` y `lyrics`

### Las canciones no se reproducen
- Verifica que el bucket `audio-files` sea público
- Intenta con otro formato de audio (MP3 es el más compatible)

## Siguientes Pasos

- Sube más canciones desde Suno
- Crea múltiples playlists temáticas
- Agrega letras en formato LRC a tus canciones favoritas
- Personaliza los colores en `tailwind.config.js`
- Comparte tu URL de Vercel con amigos

---

¡Disfruta de tu reproductor de música! 🎵
