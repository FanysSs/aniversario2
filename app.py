"""
Romantic Scrapbook v2.1 — Actualización con SQLite notas, JSON datos.
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

# ─ SQLite ──────────────────────────────────────────────────────────────────
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
        db.commit()

# ─ JSON helpers ────────────────────────────────────────────────────────────
def load_json(path, fallback=None):
    try:
        with open(os.path.join(os.path.dirname(__file__), "data", path), encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback if fallback is not None else []

def _read_caption(directory, filename):
    base_name = filename.rsplit(".", 1)[0]
    txt_path  = os.path.join(directory, base_name + ".txt")
    if os.path.isfile(txt_path):
        with open(txt_path, encoding="utf-8") as f:
            return f.read().strip()
    return ""

def get_gallery_items():
    items = []
    img_dir = os.path.join(app.static_folder, "images")
    vid_dir = os.path.join(app.static_folder, "videos")
    if os.path.isdir(img_dir):
        for fname in sorted(os.listdir(img_dir)):
            ext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
            if ext in {"jpg","jpeg","png","gif","webp"}:
                items.append({"tipo":"imagen","src":f"/static/images/{fname}","caption":_read_caption(img_dir,fname)})
    if os.path.isdir(vid_dir):
        for fname in sorted(os.listdir(vid_dir)):
            ext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
            if ext in {"mp4","webm","ogg"} and fname not in {"fondo.mp4","unlock.mp4"}:
                items.append({"tipo":"video","src":f"/static/videos/{fname}","caption":_read_caption(vid_dir,fname)})
    if not items:
        for i in range(1,7):
            items.append({"tipo":"placeholder","src":"","caption":f"Recuerdo {i}"})
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

# ─ RUTAS ───────────────────────────────────────────────────────────────────
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
    msgs = ["Casi… intenta otra vez 💙","Mmm, no es esa 💭","Tan cerca y tan lejos… 🌷","Esa no es, pero la sabes 💌"]
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

@app.route("/notas", methods=["GET","POST"])
@requiere_desbloqueo
def notas():
    db = get_db()
    if request.method == "POST":
        autor   = (request.form.get("autor") or "").strip()[:60]
        mensaje = (request.form.get("mensaje") or "").strip()[:600]
        if autor and mensaje:
            ahora = datetime.now().strftime("%d/%m/%Y a las %H:%M")
            db.execute("INSERT INTO notas (autor,mensaje,creado_en) VALUES (?,?,?)", (autor,mensaje,ahora))
            db.commit()
        return redirect(url_for("notas"))
    notas_list = db.execute("SELECT * FROM notas ORDER BY id DESC").fetchall()
    return render_template("notas.html", notas=notas_list)

@app.route("/notas/borrar/<int:nota_id>", methods=["POST"])
@requiere_desbloqueo
def borrar_nota(nota_id):
    db = get_db()
    db.execute("DELETE FROM notas WHERE id=?", (nota_id,))
    db.commit()
    return redirect(url_for("notas"))

@app.route("/galeria/descripcion", methods=["POST"])
@requiere_desbloqueo
def editar_descripcion():
    src     = request.form.get("src", "").strip()
    caption = (request.form.get("caption") or "").strip()[:120]

    if not src.startswith("/static/images/") and not src.startswith("/static/videos/"):
        return redirect(url_for("galeria"))

    ruta_relativa = src.replace("/static/", "", 1)
    ruta_absoluta = os.path.join(app.static_folder, ruta_relativa)

    if not os.path.isfile(ruta_absoluta):
        return redirect(url_for("galeria"))

    txt_path = ruta_absoluta.rsplit(".", 1)[0] + ".txt"

    if caption:
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(caption)
    else:
        if os.path.isfile(txt_path):
            os.remove(txt_path)

    return redirect(url_for("galeria"))

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

    from werkzeug.utils import secure_filename
    import time
    nombre = f"{int(time.time())}_{secure_filename(archivo.filename)}"

    carpeta = os.path.join(app.static_folder, "videos" if ext in {"mp4","webm"} else "images")
    os.makedirs(carpeta, exist_ok=True)
    archivo.save(os.path.join(carpeta, nombre))

    if caption:
        txt_nombre = nombre.rsplit(".", 1)[0] + ".txt"
        with open(os.path.join(carpeta, txt_nombre), "w", encoding="utf-8") as f:
            f.write(caption)

    return redirect(url_for("galeria"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("unlock"))

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

init_db()