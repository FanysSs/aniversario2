"""
Romantic Scrapbook v2.2 — PostgreSQL (Supabase) + Cloudinary para producción.
En local sigue usando SQLite y archivos locales, sin cambiar nada.
"""
import os, json, sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, g

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "cambia-esta-clave-secreta-2026")

FECHA_ESPECIAL = "16/03/2026"
FECHA_ISO      = "2026-03-16"
NOMBRE_ELLA    = "Silvana"
NOMBRE_EL      = "Fany"
CIUDAD_ELLA    = "Minatitlán"
CIUDAD_EL      = "Orizaba"
DB_PATH        = os.path.join(os.path.dirname(__file__), "data", "notas.db")

# ─ Detectar si estamos en producción (Render) o local ─────────────────────
DATABASE_URL  = os.environ.get("DATABASE_URL")   # existe en Render, no en local
CLOUDINARY_URL = os.environ.get("CLOUDINARY_URL") # existe en Render, no en local
IS_PROD = bool(DATABASE_URL)

# ─ Configurar Cloudinary si está disponible ────────────────────────────────
if CLOUDINARY_URL:
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(cloudinary_url=CLOUDINARY_URL)

# ══════════════════════════════════════════════════════════════════════════
# BASE DE DATOS — PostgreSQL en producción, SQLite en local
# ══════════════════════════════════════════════════════════════════════════
if IS_PROD:
    import psycopg2
    import psycopg2.extras

    def get_db():
        if "db" not in g:
            g.db = psycopg2.connect(DATABASE_URL, sslmode="require")
        return g.db

    @app.teardown_appcontext
    def close_db(exc=None):
        db = g.pop("db", None)
        if db: db.close()

    def init_db():
        with app.app_context():
            db = get_db()
            cur = db.cursor()
            # Tabla de notas románticas
            cur.execute("""
                CREATE TABLE IF NOT EXISTS notas (
                    id SERIAL PRIMARY KEY,
                    autor TEXT NOT NULL,
                    mensaje TEXT NOT NULL,
                    creado_en TEXT NOT NULL
                )
            """)
            # Tabla de descripciones de galería (reemplaza los .txt)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS descripciones (
                    src TEXT PRIMARY KEY,
                    caption TEXT NOT NULL
                )
            """)
            # Tabla de fotos/videos subidos desde la app (Cloudinary)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS galeria_cloud (
                    id SERIAL PRIMARY KEY,
                    public_id TEXT NOT NULL,
                    url TEXT NOT NULL,
                    tipo TEXT NOT NULL,
                    caption TEXT DEFAULT '',
                    creado_en TEXT NOT NULL
                )
            """)
            db.commit()

    def query(sql, params=(), fetchall=False, fetchone=False, commit=False):
        db = get_db()
        cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params)
        if commit: db.commit()
        if fetchall: return cur.fetchall()
        if fetchone: return cur.fetchone()
        return None

else:
    # ── SQLite local ────────────────────────────────────────────────────────
    def get_db():
        if "db" not in g:
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            g.db = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(exc=None):
        db = g.pop("db", None)
        if db: db.close()

    def init_db():
        with app.app_context():
            db = get_db()
            db.execute("""CREATE TABLE IF NOT EXISTS notas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                autor TEXT NOT NULL,
                mensaje TEXT NOT NULL,
                creado_en TEXT NOT NULL
            )""")
            db.execute("""CREATE TABLE IF NOT EXISTS descripciones (
                src TEXT PRIMARY KEY,
                caption TEXT NOT NULL
            )""")
            db.execute("""CREATE TABLE IF NOT EXISTS galeria_cloud (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT NOT NULL,
                url TEXT NOT NULL,
                tipo TEXT NOT NULL,
                caption TEXT DEFAULT '',
                creado_en TEXT NOT NULL
            )""")
            db.commit()

    def query(sql, params=(), fetchall=False, fetchone=False, commit=False):
        # SQLite usa ? en lugar de %s
        sql_local = sql.replace("%s", "?")
        db = get_db()
        cur = db.execute(sql_local, params)
        if commit: db.commit()
        if fetchall: return cur.fetchall()
        if fetchone: return cur.fetchone()
        return None


# ══════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════
def load_json(path, fallback=None):
    try:
        with open(os.path.join(os.path.dirname(__file__), "data", path), encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback if fallback is not None else []

def _read_caption_local(directory, filename):
    """Lee el .txt local (solo en desarrollo)."""
    base_name = filename.rsplit(".", 1)[0]
    txt_path  = os.path.join(directory, base_name + ".txt")
    if os.path.isfile(txt_path):
        with open(txt_path, encoding="utf-8") as f:
            return f.read().strip()
    return ""

def _read_caption_db(src):
    """Lee la descripción desde la base de datos (producción)."""
    row = query("SELECT caption FROM descripciones WHERE src = %s",
                (src,), fetchone=True)
    return row["caption"] if row else ""

def get_gallery_items():
    """
    Combina archivos del repo (static/images y static/videos)
    con archivos subidos desde la app (Cloudinary en prod, local en dev).
    """
    items = []
    img_dir = os.path.join(app.static_folder, "images")
    vid_dir = os.path.join(app.static_folder, "videos")
    EXCLUIR = {"fondo.mp4", "unlock.mp4"}

    # Imágenes del repo
    if os.path.isdir(img_dir):
        for fname in sorted(os.listdir(img_dir)):
            ext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
            if ext in {"jpg", "jpeg", "png", "gif", "webp"}:
                src     = f"/static/images/{fname}"
                caption = _read_caption_db(src) if IS_PROD else _read_caption_local(img_dir, fname)
                items.append({"tipo": "imagen", "src": src, "caption": caption})

    # Videos del repo
    if os.path.isdir(vid_dir):
        for fname in sorted(os.listdir(vid_dir)):
            ext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
            if ext in {"mp4", "webm", "ogg"} and fname not in EXCLUIR:
                src     = f"/static/videos/{fname}"
                caption = _read_caption_db(src) if IS_PROD else _read_caption_local(vid_dir, fname)
                items.append({"tipo": "video", "src": src, "caption": caption})

    # Fotos/videos subidos desde la app (guardados en Cloudinary o local)
    cloud_items = query(
        "SELECT * FROM galeria_cloud ORDER BY id ASC",
        fetchall=True
    ) or []
    for row in cloud_items:
        items.append({
            "tipo":     row["tipo"],
            "src":      row["url"],
            "caption":  row["caption"] or "",
            "cloud_id": row["public_id"],
        })

    # Sin contenido → placeholders
    if not items:
        for i in range(1, 7):
            items.append({"tipo": "placeholder", "src": "", "caption": f"Recuerdo {i}"})

    return items


# ─ Protección de rutas ─────────────────────────────────────────────────────
def requiere_desbloqueo(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("unlocked"):
            return redirect(url_for("unlock"))
        return fn(*args, **kwargs)
    return wrapper

@app.context_processor
def inject_globals():
    return dict(nombre_ella=NOMBRE_ELLA, nombre_el=NOMBRE_EL,
                ciudad_ella=CIUDAD_ELLA, ciudad_el=CIUDAD_EL,
                fecha_legible=FECHA_ESPECIAL, fecha_iso=FECHA_ISO)


# ══════════════════════════════════════════════════════════════════════════
# RUTAS
# ══════════════════════════════════════════════════════════════════════════
@app.route("/")
def unlock():
    if session.get("unlocked"): return redirect(url_for("home"))
    return render_template("unlock.html")

@app.route("/verify", methods=["POST"])
def verify():
    data  = request.get_json(silent=True) or {}
    fecha = (data.get("fecha") or "").strip()
    if fecha == FECHA_ESPECIAL:
        session["unlocked"] = True
        return jsonify({"ok": True, "redirect": url_for("home")})
    msgs = ["Casi… intenta otra vez 💙", "Mmm, no es esa 💭",
            "Tan cerca y tan lejos… 🌷", "Esa no es, pero la sabes 💌"]
    return jsonify({"ok": False, "mensaje": msgs[datetime.now().second % len(msgs)]})

@app.route("/home")
@requiere_desbloqueo
def home(): return render_template("home.html")

@app.route("/galeria")
@requiere_desbloqueo
def galeria(): return render_template("galeria.html", items=get_gallery_items())

@app.route("/carta")
@requiere_desbloqueo
def carta(): return render_template("carta.html")

@app.route("/playlist")
@requiere_desbloqueo
def playlist():
    return render_template("playlist.html", canciones=load_json("playlist.json", []))

@app.route("/razones")
@requiere_desbloqueo
def razones():
    lista = load_json("razones.json", [])
    return render_template("razones.html", razones_json=json.dumps(lista, ensure_ascii=False))

@app.route("/contador")
@requiere_desbloqueo
def contador(): return render_template("contador.html")

@app.route("/mapa")
@requiere_desbloqueo
def mapa(): return render_template("mapa.html")

@app.route("/juego")
@requiere_desbloqueo
def juego(): return render_template("juego.html")

# ── Notas ──────────────────────────────────────────────────────────────────
@app.route("/notas", methods=["GET", "POST"])
@requiere_desbloqueo
def notas():
    if request.method == "POST":
        autor   = (request.form.get("autor") or "").strip()[:60]
        mensaje = (request.form.get("mensaje") or "").strip()[:600]
        if autor and mensaje:
            ahora = datetime.now().strftime("%d/%m/%Y a las %H:%M")
            query("INSERT INTO notas (autor, mensaje, creado_en) VALUES (%s, %s, %s)",
                  (autor, mensaje, ahora), commit=True)
        return redirect(url_for("notas"))

    notas_list = query("SELECT * FROM notas ORDER BY id DESC", fetchall=True) or []
    return render_template("notas.html", notas=notas_list)

@app.route("/notas/borrar/<int:nota_id>", methods=["POST"])
@requiere_desbloqueo
def borrar_nota(nota_id):
    query("DELETE FROM notas WHERE id = %s", (nota_id,), commit=True)
    return redirect(url_for("notas"))

# ── Galería: editar descripción ─────────────────────────────────────────────
@app.route("/galeria/descripcion", methods=["POST"])
@requiere_desbloqueo
def editar_descripcion():
    src     = request.form.get("src", "").strip()
    caption = (request.form.get("caption") or "").strip()[:120]

    # Validar que el src sea de una ruta permitida
    es_local = src.startswith("/static/images/") or src.startswith("/static/videos/")
    es_cloud = src.startswith("https://")
    if not es_local and not es_cloud:
        return redirect(url_for("galeria"))

    if IS_PROD:
        # Guardar en PostgreSQL
        if caption:
            query("""
                INSERT INTO descripciones (src, caption) VALUES (%s, %s)
                ON CONFLICT (src) DO UPDATE SET caption = EXCLUDED.caption
            """, (src, caption), commit=True)
        else:
            query("DELETE FROM descripciones WHERE src = %s", (src,), commit=True)
    else:
        # Guardar en .txt local (solo en desarrollo)
        if es_local:
            ruta_rel = src.replace("/static/", "", 1)
            ruta_abs = os.path.join(app.static_folder, ruta_rel)
            if os.path.isfile(ruta_abs):
                txt_path = ruta_abs.rsplit(".", 1)[0] + ".txt"
                if caption:
                    with open(txt_path, "w", encoding="utf-8") as f:
                        f.write(caption)
                elif os.path.isfile(txt_path):
                    os.remove(txt_path)

    return redirect(url_for("galeria"))

# ── Galería: subir foto/video ───────────────────────────────────────────────
@app.route("/galeria/subir", methods=["POST"])
@requiere_desbloqueo
def subir_foto():
    archivo = request.files.get("archivo")
    caption = (request.form.get("caption") or "").strip()[:120]

    if not archivo or archivo.filename == "":
        return redirect(url_for("galeria"))

    ext = archivo.filename.rsplit(".", 1)[-1].lower() if "." in archivo.filename else ""
    if ext not in {"jpg", "jpeg", "png", "gif", "webp", "mp4", "webm"}:
        return redirect(url_for("galeria"))

    es_video = ext in {"mp4", "webm"}
    ahora    = datetime.now().strftime("%d/%m/%Y a las %H:%M")

    if IS_PROD and CLOUDINARY_URL:
        # ── Producción: subir a Cloudinary ──
        import cloudinary.uploader
        resultado = cloudinary.uploader.upload(
            archivo,
            resource_type = "video" if es_video else "image",
            folder        = "aniversario",
        )
        query("""
            INSERT INTO galeria_cloud (public_id, url, tipo, caption, creado_en)
            VALUES (%s, %s, %s, %s, %s)
        """, (resultado["public_id"], resultado["secure_url"],
              "video" if es_video else "imagen", caption, ahora), commit=True)
    else:
        # ── Local: guardar en static/ ──
        from werkzeug.utils import secure_filename
        import time
        nombre  = f"{int(time.time())}_{secure_filename(archivo.filename)}"
        carpeta = os.path.join(app.static_folder, "videos" if es_video else "images")
        os.makedirs(carpeta, exist_ok=True)
        ruta = os.path.join(carpeta, nombre)
        archivo.save(ruta)
        if caption:
            with open(ruta.rsplit(".", 1)[0] + ".txt", "w", encoding="utf-8") as f:
                f.write(caption)

    return redirect(url_for("galeria"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("unlock"))


# ══════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

init_db()