# Guía Completa para Letras en Formato LRC

## ¿Qué es el formato LRC?

LRC (LyRiCs) es un formato de archivo de texto que sincroniza las letras de las canciones con el tiempo de reproducción. Es el mismo formato que usan aplicaciones como Spotify, Apple Music, y reproductores de karaoke.

## Formato Básico

```
[mm:ss.xx]Texto de la letra
```

Donde:
- `mm` = minutos (00-99)
- `ss` = segundos (00-59)
- `xx` = centésimas de segundo (00-99)

## Ejemplo Completo

```lrc
[00:00.00]
[00:12.50]En el silencio de la noche
[00:17.00]Puedo escuchar tu voz
[00:22.30]Resonando en mi mente
[00:27.80]Como un dulce amor
[00:32.00]
[00:33.50]Y aunque estés lejos
[00:38.20]Siento que estás aquí
[00:43.50]En cada latido
[00:48.00]En cada respirar
```

## Reglas Importantes

1. **Orden Cronológico**: Los timestamps deben estar en orden ascendente
2. **Una línea por timestamp**: Cada línea de letra debe tener su propio timestamp
3. **Líneas vacías**: Usa timestamps sin texto para pausas musicales
4. **Precisión**: Más preciso = mejor sincronización (usa centésimas)

## Herramientas para Crear Letras LRC

### Online (Gratis)

1. **LRC Generator** - [lrcgenerator.com](https://lrcgenerator.com)
   - Sube tu MP3
   - Escribe las letras
   - Presiona una tecla en el momento exacto de cada línea
   - Descarga el archivo .lrc

2. **LRC Maker** - [lrcmaker.com](https://lrcmaker.com)
   - Similar a LRC Generator
   - Interfaz muy intuitiva
   - No requiere registro

3. **Lyrics Editor** - [lyrics-editor.com](https://lyrics-editor.com)
   - Editor más avanzado
   - Permite ajustar timestamps después

### Aplicaciones de Escritorio

1. **Aegisub** (Windows, Mac, Linux)
   - Gratis y open source
   - Originalmente para subtítulos pero funciona perfecto para LRC
   - Muy preciso

2. **LRC Editor** (Windows)
   - Especializado en LRC
   - Interfaz simple

## Método Manual (Con Reproductor)

Si prefieres hacerlo manualmente:

1. Abre tu canción en un reproductor que muestre el tiempo exacto
2. Abre un editor de texto
3. Reproduce la canción
4. Cuando empiece cada línea, pausa y anota el tiempo
5. Escribe en formato LRC:

```
[00:12.50]Línea de la letra
```

## Consejos Pro

### 1. Anticipa las Líneas
Coloca el timestamp 0.3-0.5 segundos ANTES de que se cante:

```lrc
[00:12.00]Esta línea se canta en el segundo 12.5
```

Esto hace que la letra aparezca justo antes de cantarse, mejorando la experiencia.

### 2. Usa Líneas Vacías para Instrumentales

```lrc
[00:12.00]Primera estrofa
[00:17.00]
[00:22.00]
[00:27.00]Segunda estrofa después del instrumental
```

### 3. Maneja Coros con Repetición

```lrc
[01:12.00]Hey, hey, hey
[01:15.00]Oh, oh, oh
[01:18.00]Yeah, yeah, yeah
```

### 4. Metadatos (Opcional)

Puedes agregar información adicional al inicio:

```lrc
[ar:Nombre del Artista]
[ti:Título de la Canción]
[al:Álbum]
[by:Creador de las letras LRC]
[00:00.00]
[00:12.00]Primera línea...
```

## Flujo de Trabajo Recomendado

### Para canciones de Suno:

1. **Descarga tu canción** de Suno en MP3
2. **Copia las letras** que usaste en Suno
3. **Usa LRC Generator**:
   - Sube el MP3
   - Pega las letras
   - Reproduce y presiona Enter en cada línea
   - Descarga el .lrc
4. **Copia el contenido** del archivo .lrc
5. **Pega en el campo de letras** cuando subas la canción a Music Player

## Ejemplo Real: Proceso Completo

### 1. Tienes esta canción en Suno:

```
Título: Sueños de Verano
Letras:
Bajo el sol radiante
Camino por la playa
Siento la brisa fresca
Llevándome lejos
```

### 2. Creas el LRC en lrcgenerator.com:

- Subes el MP3
- Pegas las letras
- Presionas Enter cuando empieza cada línea:
  - 0:08 → Enter
  - 0:12 → Enter
  - 0:17 → Enter
  - 0:21 → Enter

### 3. Obtienes:

```lrc
[00:08.00]Bajo el sol radiante
[00:12.00]Camino por la playa
[00:17.00]Siento la brisa fresca
[00:21.00]Llevándome lejos
```

### 4. Lo copias y pegas en Music Player:

En el panel de Admin → Agregar Canción → campo "Letras"

¡Listo! Ahora tus letras se sincronizarán automáticamente.

## Verificar que Funciona

1. Sube la canción con las letras
2. Reprodúcela en la app
3. Ve a la vista de "Letras"
4. Verifica que las líneas se resalten en el momento correcto
5. Si están adelantadas o atrasadas, ajusta los timestamps

## Formato de Tiempo Exacto

Para máxima precisión:

- **Segundo 0**: `[00:00.00]`
- **8.5 segundos**: `[00:08.50]`
- **1 minuto 12.75 segundos**: `[01:12.75]`
- **2 minutos 5.3 segundos**: `[02:05.30]`

## Errores Comunes

### ❌ Formato Incorrecto:

```lrc
[0:12]Línea           # Falta cero y centésimas
[00:12:00]Línea       # Usa : en vez de .
00:12.00 Línea        # Falta []
[00.12.00]Línea       # Usa . en vez de :
```

### ✅ Formato Correcto:

```lrc
[00:12.00]Línea
[01:05.50]Línea
[02:30.75]Línea
```

## Atajos de Teclado en Herramientas Online

**LRC Generator:**
- `Enter` - Marcar timestamp
- `Space` - Play/Pausa
- `↑↓` - Ajustar timestamp seleccionado
- `Ctrl+S` - Guardar

**LRC Maker:**
- `Enter` - Siguiente línea
- `Space` - Play/Pausa
- `Tab` - Editar timestamp
- `Ctrl+Z` - Deshacer

## Plantilla para Copiar y Pegar

```lrc
[ar:Nombre del Artista]
[ti:Título de la Canción]
[al:Nombre del Álbum]
[by:Tu Nombre]

[00:00.00]
[00:10.00]Primera línea
[00:15.00]Segunda línea
[00:20.00]Tercera línea
[00:25.00]Cuarta línea
[00:30.00]
[00:35.00]Coro
[00:40.00]
```

## Recursos Adicionales

- **Buscar letras existentes**: [lrclib.net](https://lrclib.net) - Base de datos masiva de LRC
- **Tutorial en video**: Busca "how to make lrc file" en YouTube
- **Editor de código**: VS Code con extensión "LRC Editor" para edición avanzada

## Preguntas Frecuentes

**P: ¿Puedo copiar letras LRC de otras fuentes?**
R: Sí, pero respeta los derechos de autor. Para música personal de Suno está bien.

**P: ¿Qué precisión necesito?**
R: 0.1 segundos (centésimas) es suficiente. 0.01 es excesivo.

**P: ¿Funcionan las letras sin timestamps?**
R: No se sincronizarán, pero se mostrarán estáticas. Mejor con timestamps.

**P: ¿Puedo editar las letras después de subirlas?**
R: Sí, elimina la canción y súbela de nuevo con las letras corregidas.

**P: ¿Hay límite de longitud?**
R: No, pero para canciones de 5+ minutos puede ser tedioso. Vale la pena.

---

¡Ahora estás listo para crear letras sincronizadas profesionales! 🎵
