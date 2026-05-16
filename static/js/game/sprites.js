/* ============================================================
   sprites.js v2 — Pixel art actualizado del minijuego.
   ──────────────────────────────────────────────────────────
   FANY:    pelinegra, piel clara, ropa AMARILLA
   SILVANA: cabello café, piel morenita, ropa AZUL
   BUS ADO: más grande, rojo, diseño mejorado

   Para modificar personajes:
     - Edita la PALETTE (letra → color CSS)
     - Edita los grids de caracteres (cada char = 1 "píxel")
   ============================================================ */

const PALETTE = {
  ' ': null,        // transparente
  /* Pieles */
  'S': '#fcd5b5',   // piel clara (Fany)
  's': '#c8825f',   // piel morena cálida (Silvana)
  'P': '#f5c4a0',   // piel media (sombra Fany)
  /* Cabellos */
  'K': '#1a0800',   // negro/muy oscuro (cabello Fany)
  'k': '#2d1400',   // café muy oscuro
  'H': '#7a4a22',   // café (cabello Silvana)
  'h': '#5a3318',   // café oscuro
  /* Ojos y boca */
  'e': '#1a0800',   // ojos
  'r': '#e05070',   // boca/labios
  /* Ropa Fany — AMARILLO */
  'Y': '#f5c200',   // amarillo principal
  'y': '#d4a800',   // amarillo oscuro (sombra)
  /* Ropa Silvana — AZUL */
  'B': '#4a7fc4',   // azul principal
  'b': '#2d5a99',   // azul oscuro (sombra)
  /* Pantalones y zapatos */
  'J': '#2c3e6b',   // jeans/pantalón oscuro
  'j': '#1a2540',   // más oscuro
  'G': '#888',      // gris zapatos
  'g': '#555',      // gris oscuro
  /* Bus ADO */
  'R': '#dd1111',   // rojo brillante (cuerpo)
  'r2':'#aa0000',   // rojo oscuro (sombra)
  'W': '#ffffff',   // blanco
  'w': '#f0f0f0',   // blanco hueso
  'N': '#111111',   // negro (ruedas, contornos)
  'A': '#cccccc',   // plateado (detalles)
  'T': '#aaddff',   // azul cielo (ventanas)
  /* Obstáculos */
  'O': '#ff7700',   // naranja cono
  'o': '#cc5500',   // naranja oscuro cono
  'C': '#555',      // gris bache
  'c': '#333',      // gris oscuro bache
  /* Efectos */
  'Q': '#ff4488',   // rosa/corazón
};

/* ── Función de dibujo ───────────────────────────────────── */
function drawSprite(ctx, grid, x, y, scale, flipX = false) {
  if (!grid || !grid.length) return;
  const rows = grid.length;
  const cols = grid[0].length;
  ctx.save();
  if (flipX) {
    ctx.translate(x + cols * scale, y);
    ctx.scale(-1, 1);
    x = 0; y = 0;
  }
  for (let r = 0; r < rows; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === ' ') continue;
      const color = PALETTE[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        (flipX ? 0 : x) + c * scale,
        (flipX ? 0 : y) + r * scale,
        scale, scale
      );
    }
  }
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   FANY — pelinegra, piel clara, camisa AMARILLA, jeans
   (12 × 18, escala 3 → 36×54 px)
   ══════════════════════════════════════════════════════════ */
const FANY_STAND = [
  "   KKKKKK   ",
  "  KkKKKKkK  ",
  "  KSSSSSSK  ",
  "  KSeeSSSK  ",
  "  KSSrSSSK  ",
  "   KKSSSK   ",
  "   YYYYYY   ",
  "  YYYYYYY   ",
  "  YY Y YY   ",
  "   JJJJJ    ",
  "   JJ JJ    ",
  "   JJ JJ    ",
  "   JJ JJ    ",
  "  GJJ GJJ   ",
  "  GGG GGG   ",
  "            ",
  "            ",
  "            ",
];

const FANY_RUN1 = [
  "   KKKKKK   ",
  "  KkKKKKkK  ",
  "  KSSSSSSK  ",
  "  KSeeSSSK  ",
  "  KSSrSSSK  ",
  "   KKSSSK   ",
  "  yYYYYYY   ",
  "  YYYYYYY   ",
  "   YY YYy   ",
  "   JJJJJ    ",
  "    JJ JJJ  ",
  "   JJJ   J  ",
  "   J    JJ  ",
  "  GGG       ",
  "       GGG  ",
  "            ",
  "            ",
  "            ",
];

const FANY_RUN2 = [
  "   KKKKKK   ",
  "  KkKKKKkK  ",
  "  KSSSSSSK  ",
  "  KSeeSSSK  ",
  "  KSSrSSSK  ",
  "   KKSSSK   ",
  "  YYYYYYYY  ",
  "   YYYYYYY  ",
  "  yYY YY    ",
  "   JJJJJ    ",
  "  JJJ  JJ   ",
  "   J   JJJ  ",
  "       J    ",
  "  GGG  GGG  ",
  "  GGG       ",
  "            ",
  "            ",
  "            ",
];

/* ══════════════════════════════════════════════════════════
   SILVANA — cabello café, piel morenita, ropa AZUL
   (12 × 18)
   ══════════════════════════════════════════════════════════ */
const SILVANA_STAND = [
  "  HHHHHHh   ",
  " HhHHHHHhH  ",
  "  Hssssssh  ",
  "  HseessH   ",
  "  HssrsssH  ",
  "   HssssH   ",
  "   BBBBBB   ",
  "  BBBBBBB   ",
  "   BB BB    ",
  "   bBBBBb   ",
  "   bb bb    ",
  "   bb bb    ",
  "   bb bb    ",
  "  Gbb Gbb   ",
  "  GGG GGG   ",
  "            ",
  "            ",
  "            ",
];

/* ══════════════════════════════════════════════════════════
   BUS ADO — más grande (26 × 14), rojo brillante
   A escala 2 → 52×28 px en canvas
   ══════════════════════════════════════════════════════════ */
const BUS_ADO = [
  "NRRRRRRRRRRRRRRRRRRRRRRRRRN",
  "NRRTTTTTTTTTTTTTTTTTTTTTTRRN",
  "NRRTTTTTTTTTTTTTTTTTTTTTRRN",
  "NRRwwwwwwwwwwwwwwwwwwwwwwRRN",
  "NRRWWWrrrrrWWWWWWWWWWWWWWRRN",
  "NRRWWWrADOrWWWWTTTTTTTWWWRRN",
  "NRRWWWrrrrrWWWWTTTTTTTWWWRRN",
  "NRRwwwwwwwwwwwwwwwwwwwwwwRRN",
  "NRRRRRRRRRRRRRRRRRRRRRRRRRRN",
  "NRRRRRRRRRRRRRRRRRRRRRRRRRRN",
  " NNN  AAAAAAAAAAAAAAAA  NNN ",
  " NNN  AAAAAAAAAAAAAAAA  NNN ",
  "  NNNNN              NNNNN  ",
  "   NNN                NNN   ",
];

/* ══════════════════════════════════════════════════════════
   OBSTÁCULOS
   ══════════════════════════════════════════════════════════ */
const CONO = [
  "  OO  ",
  "  Oo  ",
  " OOOO ",
  " OooO ",
  " WWWW ",
  "OOOOOO",
  "OooooO",
  "OOOOOO",
];

const BACHE = [
  "   CCC   ",
  " CCCCCCC ",
  " CcccccC ",
  " CcccccC ",
  " CCCCCCC ",
  "   CCC   ",
];

const PIEDRA = [
  "  AAAA  ",
  " AAAAAA ",
  " AgggGA ",
  " AAAAAA ",
  "  AAAA  ",
];

const CORAZON = [
  " QQ QQQ ",
  "QQQQQQQQ",
  "QQQQQQQQ",
  " QQQQQQ ",
  "  QQQQ  ",
  "   QQ   ",
];

window.SPRITES = {
  PALETTE, drawSprite,
  FANY_STAND, FANY_RUN1, FANY_RUN2,
  SILVANA_STAND,
  BUS_ADO,
  CONO, BACHE, PIEDRA, CORAZON,
};
