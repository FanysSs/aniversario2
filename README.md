# 💙 Romantic Scrapbook v2 — Sitio multipágina

Un álbum romántico hecho con Flask, con 9 páginas independientes, galería
de fotos+videos en carrusel, mini-juego pixel-art y mucho amor. 🌸

---

## 📁 Estructura del proyecto

```
scrapbook-v2/
├── app.py                  ← Servidor Flask (rutas, lógica)
├── requirements.txt
├── Procfile                ← Deploy en Render/Railway
├── runtime.txt
├── .gitignore
│
├── templates/
│   ├── base.html           ← Layout común (nav, partículas, música)
│   ├── unlock.html         ← / Pantalla de desbloqueo
│   ├── home.html           ← /home Menú principal
│   ├── contador.html       ← /contador
│   ├── galeria.html        ← /galeria
│   ├── carta.html          ← /carta
│   ├── playlist.html       ← /playlist
│   ├── razones.html        ← /razones
│   ├── mapa.html           ← /mapa
│   └── juego.html          ← /juego
│
└── static/
    ├── css/style.css       ← TODO el diseño
    ├── js/
    │   ├── unlock.js       ← Validación fecha
    │   ├── transitions.js  ← Fade entre páginas
    │   ├── nav.js          ← Menú móvil
    │   ├── music.js        ← Reproductor flotante
    │   ├── particles.js    ← Partículas de fondo
    │   ├── hearts.js       ← Corazones al hacer click
    │   ├── counter.js      ← Contador de tiempo
    │   ├── letter.js       ← Abrir/cerrar sobre
    │   ├── reasons.js      ← ← EDITA AQUÍ las 100 razones
    │   ├── map.js          ← Mapa Leaflet
    │   ├── gallery.js      ← Carrusel de galería
    │   └── game/
    │       ├── sprites.js  ← ← EDITA AQUÍ los personajes
    │       └── game.js     ← Motor del minijuego
    ├── images/             ← Pon aquí tus fotos
    ├── videos/             ← Pon aquí tus videos
    └── sounds/             ← (opcional) musica.mp3
```

---

## ▶️ Correrlo localmente

```bash
# 1. Crea entorno virtual
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 2. Instala dependencias
pip install -r requirements.txt

# 3. Corre el servidor
python app.py

# Abre http://127.0.0.1:5000
# Contraseña: 16/03/2026
```

---

## ✏️ Cómo personalizar

### 🗓️ Cambiar la contraseña
En `app.py`:
```python
FECHA_ESPECIAL = "16/03/2026"   # ← cambia esto
FECHA_ISO      = "2026-03-16"   # ← misma fecha en ISO (AAAA-MM-DD)
```

### 🖼️ Agregar fotos a la galería
1. Copia tu archivo a `static/images/` (JPG, PNG, GIF, WEBP)
2. ¡Listo! La app las detecta automáticamente.
3. Para agregar una descripción, crea `static/images/nombre.txt`
   con el mismo nombre base que la foto.

### 🎬 Agregar videos a la galería
1. Copia tu video a `static/videos/` (MP4, WEBM)
   (excepto `fondo.mp4` que es para el hero del home)
2. La app los detecta automáticamente y muestra un botón ▶ en la tarjeta.
3. Para descripción, crea `static/videos/nombre.txt`.

### 🎥 Video de fondo del home
Coloca tu video como `static/videos/fondo.mp4`
- Recomendado: MP4, sin audio, 10-30 seg, máx 15 MB

### 💌 Editar la carta
En `templates/carta.html`, edita los `<p>` dentro de `<article class="letter">`.
Hay un comentario `✏️ EDITA ESTE TEXTO` que señala exactamente dónde.

### 🎵 Agregar canciones a la playlist
En `app.py`, edita la lista `CANCIONES`:
```python
CANCIONES = [
    {"titulo": "Mi canción favorita", "artista": "Artista", "emoji": "💙",
     "url": "https://open.spotify.com/..."},
    ...
]
```

### 💯 Editar las 100 razones
En `static/js/reasons.js`, edita el arreglo `razones`. Cada elemento es una razón.
Mantén exactamente 100 para que el grid se vea parejo.

### 🗺️ Cambiar las ciudades del mapa
En `static/js/map.js`:
```js
const orizaba    = [18.8511, -97.0992];   // latitud, longitud
const minatitlan = [17.9892, -94.5511];
```
Busca coordenadas en maps.google.com → click derecho → "¿Qué hay aquí?"

### 🎮 Modificar los personajes del juego
En `static/js/game/sprites.js`:

- **PALETTE**: diccionario de letra → color CSS.
  Puedes cambiar `'S': '#fcd5b5'` (piel de Fany) por el tono que quieras.

- **FANY_STAND / FANY_RUN1 / FANY_RUN2**: arreglo de strings donde cada carácter
  es un "píxel". Edita letra por letra para cambiar el personaje.
  Ejemplo: cambia `'K'` (negro) por `'H'` (café) para cambiar el color del cabello.

- **SILVANA_STAND**: igual para Silvana.

Letras de la paleta más útiles:
```
K = negro/oscuro    S = piel clara (Fany)
s = piel morena     H = cabello café (Silvana)
B = camisa azul     D = ropa rosa (Silvana)
J = jeans           G = gris (zapatos)
```

### 🎨 Cambiar colores del sitio
En `static/css/style.css`, dentro de `:root {`:
```css
--blue-mid:  #b8d4e8;   /* azul suave */
--peach:     #f4c8b5;   /* durazno */
--cream:     #fbf6ee;   /* fondo papel */
```

### 🎵 Música de fondo
Coloca un archivo de audio como `static/sounds/musica.mp3`
El botón flotante 🎵 aparecerá automáticamente.
Si no existe el archivo, el botón se oculta.

---

## 🚀 Deploy gratis en Render (recomendado)

### Paso 1 — Sube el código a GitHub
```bash
git init
git add .
git commit -m "Scrapbook v2 💙"
git branch -M main
# Crea un repo en github.com y ejecuta:
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### Paso 2 — Crear servicio en Render
1. Ve a **render.com** → crear cuenta gratuita
2. **New +** → **Web Service**
3. Conecta tu cuenta de GitHub y elige el repo
4. Render detecta automáticamente el `Procfile`:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Plan:** Free ✓
5. En **Environment** → **Add Variable**:
   - `SECRET_KEY` = cualquier texto largo y secreto
6. Click **Create Web Service** → espera 2-3 min
7. 🎉 Tu sitio estará en `https://tu-app.onrender.com`

> ⚠️ El plan free de Render "duerme" tras 15 min sin visitas.
> La primera carga puede tardar ~30 seg. Puedes usar un servicio como
> UptimeRobot para hacer ping cada 10 min y mantenerlo despierto.

### Alternativa — Railway.app
1. railway.app → New Project → Deploy from GitHub
2. Selecciona el repo → Railway detecta Python automáticamente
3. Settings → Networking → Generate Domain

### Alternativa — PythonAnywhere (sin tarjeta de crédito)
1. pythonanywhere.com → cuenta gratis
2. Files → sube el zip del proyecto
3. Web → Add web app → Flask → Python 3.10
4. Apunta el WSGI a tu `app.py`

---

## 💡 Consejos finales

- **Fotos**: imágenes cuadradas ~800×800px se ven perfectas en las polaroids
- **Videos en galería**: máx 50MB, formato MP4
- **Video hero**: sin audio, corto (10-30s), máx 15MB
- **Música**: MP3 pequeño (1-3MB) con volumen balanceado
- **El juego**: funciona en móvil con los botones ↑↓ táctiles

---

Hecho con todo el cariño del mundo. 💙
