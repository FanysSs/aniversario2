/* ============================================================
   game.js v2 — Motor mejorado del minijuego de Fany.
   ──────────────────────────────────────────────────────────
   MEJORAS v2:
     - Velocidad base aumentada (3.8 → máx 6.5)
     - Distancia reducida a 400m (antes 600)
     - Obstáculos más dinámicos y variados
     - Bus ADO más grande y visible
     - Fany ropa amarilla, Silvana ropa azul
     - Cinemática mejorada con 8 estados
   ============================================================ */
(function () {

const canvas = document.getElementById('gameCanvas');
if (!canvas) return;
const ctx = canvas.getContext('2d');
const SP  = window.SPRITES;
const { drawSprite, FANY_STAND, FANY_RUN1, FANY_RUN2,
        SILVANA_STAND, BUS_ADO, CONO, BACHE, PIEDRA, CORAZON } = SP;

/* ── Constantes canvas ──────────────────────────────────── */
const W = 640, H = 360;
const CHAR_SCALE   = 3;       // píxeles por "píxel" de personaje
const BUS_SCALE    = 2;       // escala del bus (más grande)
const CHAR_W = 12 * CHAR_SCALE;
const CHAR_H = 15 * CHAR_SCALE;
const LANES  = [175, 225, 275];
const PLAYER_X   = 85;
const GROUND_Y   = 315;
const SKY_H      = 138;
const MAX_LIVES  = 3;
const INIT_DIST  = 400;       // metros hasta el bus (reducido para partida más corta)
const INIT_SPEED = 3.8;       // velocidad inicial (más rápido)
const MAX_SPEED  = 6.5;

/* ── Estados ─────────────────────────────────────────────── */
const ST = { START:0, PLAYING:1, GAMEOVER:2, BOARDING:3, TRAVELING:4, ARRIVING:5, REUNION:6, KISS:7, WIN:8 };
let state = ST.START;

/* ── Estado de juego ─────────────────────────────────────── */
let lane, lives, dist, score, speed, frame, invincible;
let obstacles, obTimer, obInterval;
let busX, silvanaX, fanyX, cinemaT, particles;
let bgOffset = 0;   // para parallax de edificios
let lastScore = 0;  // para efectos de puntuación

function reset() {
  state = ST.START; lane = 1; lives = MAX_LIVES; dist = INIT_DIST;
  score = 0; speed = INIT_SPEED; frame = 0; invincible = 0;
  obstacles = []; obTimer = 0; obInterval = 72;
  busX = W + 100; silvanaX = W + 50; fanyX = PLAYER_X;
  cinemaT = 0; particles = []; bgOffset = 0; lastScore = 0;
}
reset();

/* ── Input teclado ───────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (state === ST.START || state === ST.GAMEOVER) { startGame(); return; }
  if (state !== ST.PLAYING) return;
  if ((e.key==='ArrowUp'||e.key==='w'||e.key==='W') && lane>0) { lane--; e.preventDefault(); }
  if ((e.key==='ArrowDown'||e.key==='s'||e.key==='S') && lane<2) { lane++; e.preventDefault(); }
});
document.getElementById('btnUp')?.addEventListener('click',   () => { if(state===ST.START||state===ST.GAMEOVER){startGame();return;} if(lane>0) lane--; });
document.getElementById('btnDown')?.addEventListener('click', () => { if(state===ST.START||state===ST.GAMEOVER){startGame();return;} if(lane<2) lane++; });
canvas.addEventListener('click', () => { if(state===ST.START||state===ST.GAMEOVER) startGame(); });

function startGame() { reset(); state = ST.PLAYING; }

/* ── Obstáculos ──────────────────────────────────────────── */
const OB_TYPES = [
  { sprite: CONO,   sw:6, sh:8, pts:1 },
  { sprite: BACHE,  sw:9, sh:6, pts:2 },
  { sprite: PIEDRA, sw:8, sh:5, pts:1 },
];

function spawnObstacle() {
  const t = OB_TYPES[Math.floor(Math.random() * OB_TYPES.length)];
  const obLane = Math.floor(Math.random() * 3);
  // Evitar spawnear en el mismo carril 2 veces seguidas
  obstacles.push({ x: W + 10, lane: obLane, alive: true, ...t });
}

function checkCollision() {
  if (invincible > 0) return;
  for (const ob of obstacles) {
    if (!ob.alive) continue;
    if (ob.lane !== lane) continue;
    const pw = CHAR_W - 8;
    const ox = ob.x, ow = ob.sw * CHAR_SCALE;
    if (ox < PLAYER_X + pw && ox + ow > PLAYER_X + 4) {
      lives--;
      invincible = 80;
      ob.alive = false;
      burst(PLAYER_X + CHAR_W/2, LANES[lane] - CHAR_H/2, 6, '💥');
      if (lives <= 0) state = ST.GAMEOVER;
    }
  }
}

/* ── Partículas ──────────────────────────────────────────── */
function burst(x, y, n, emoji, big = false) {
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = 1.5 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - 1.5,
                     life: 45 + Math.floor(Math.random()*30), text: emoji,
                     size: big ? 22+Math.floor(Math.random()*14) : 14+Math.floor(Math.random()*8) });
  }
}
function burstCircle(x, y, n, emoji) {
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI*2/n)*i;
    particles.push({ x, y, vx: Math.cos(angle)*(2+Math.random()*4), vy: Math.sin(angle)*(2+Math.random()*4)-1,
                     life: 90+Math.floor(Math.random()*50), text: emoji, size: 18+Math.floor(Math.random()*16) });
  }
}
function tickParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
    ctx.globalAlpha = Math.min(1, p.life / 40);
    ctx.font = `${p.size}px sans-serif`;
    ctx.fillText(p.text, p.x, p.y);
  });
  ctx.globalAlpha = 1;
}

/* ── Dibujar ambiente ────────────────────────────────────── */
function sky(r,g,b, r2,g2,b2) {
  const gr = ctx.createLinearGradient(0,0,0,SKY_H);
  gr.addColorStop(0, `rgb(${r},${g},${b})`);
  gr.addColorStop(1, `rgb(${r2},${g2},${b2})`);
  ctx.fillStyle = gr; ctx.fillRect(0,0,W,SKY_H);
}

function drawBuildings(offset) {
  const BLDS = [
    {x:0,  w:65, h:95,  c:'#a89898'},
    {x:75, w:55, h:120, c:'#b8a8a0'},
    {x:145,w:80, h:85,  c:'#9898aa'},
    {x:245,w:60, h:115, c:'#a0a0b8'},
    {x:320,w:70, h:72,  c:'#b0a898'},
    {x:410,w:65, h:130, c:'#9898a8'},
    {x:490,w:55, h:95,  c:'#a8a090'},
    {x:558,w:82, h:110, c:'#b0a8a0'},
  ];
  BLDS.forEach(b => {
    const bx = ((b.x + offset) % (W + 130)) - 90;
    ctx.fillStyle = b.c; ctx.fillRect(bx, SKY_H - b.h, b.w, b.h);
    ctx.fillStyle = 'rgba(255,230,120,.45)';
    for (let wy = SKY_H - b.h + 10; wy < SKY_H - 8; wy += 20)
      for (let wx = bx + 7; wx < bx + b.w - 7; wx += 16)
        ctx.fillRect(wx, wy, 8, 11);
  });
}

function drawStreet() {
  ctx.fillStyle = '#4a4a4a'; ctx.fillRect(0, SKY_H, W, H - SKY_H);
  ctx.fillStyle = '#bbb';    ctx.fillRect(0, SKY_H, W, 10);         // banqueta
  ctx.fillStyle = '#222';    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  // Líneas de carril discontinuas
  ctx.setLineDash([30,18]); ctx.strokeStyle = '#f5d060'; ctx.lineWidth = 3;
  [SKY_H + 55, SKY_H + 105].forEach(ly => {
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
  });
  ctx.setLineDash([]);
}

/* ── HUD ─────────────────────────────────────────────────── */
function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0,0,W,30);
  // Vidas
  for (let i = 0; i < MAX_LIVES; i++) {
    ctx.font = '16px sans-serif';
    ctx.fillText(i < lives ? '💙' : '🩶', 8 + i*24, 21);
  }
  // Distancia
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffdc60';
  const dt = `META: ${Math.max(0, Math.floor(dist))}m`;
  ctx.fillText(dt, W/2 - ctx.measureText(dt).width/2, 19);
  // Puntos
  ctx.fillStyle = '#aaffaa';
  const sc = `+${score}`;
  ctx.fillText(sc, W - 10 - ctx.measureText(sc).width, 19);
}

/* ── Texto centrado ─────────────────────────────────────── */
function cText(text, y, font, color='#fff', shadow=true) {
  ctx.font = font; ctx.fillStyle = color;
  if (shadow) { ctx.shadowColor='rgba(0,0,0,.65)'; ctx.shadowBlur=10; }
  ctx.fillText(text, W/2 - ctx.measureText(text).width/2, y);
  ctx.shadowBlur = 0;
}

/* ── LOOP PRINCIPAL ──────────────────────────────────────── */
function loop() {
  requestAnimationFrame(loop);
  frame++;
  ctx.clearRect(0, 0, W, H);

  /* ── START ── */
  if (state === ST.START) {
    sky(90,150,215, 170,215,240);
    bgOffset = (bgOffset + .4) % (W + 130);
    drawBuildings(bgOffset);
    drawStreet();
    const sp = frame%20<10 ? FANY_RUN1 : FANY_RUN2;
    drawSprite(ctx, sp, PLAYER_X, LANES[1]-CHAR_H, CHAR_SCALE);
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H);
    cText('EL VIAJE DE FANY', 78, '11px "Press Start 2P"', '#ffdc60');
    cText('Esquiva obstáculos y llega al ADO', 118, '28px "Cormorant Garamond"');
    cText('para reencontrarte con Silvana 💙', 148, '28px "Cormorant Garamond"');
    cText('↑ ↓  o  W S   para cambiar carril', 200, '8px "Press Start 2P"', '#cceeff');
    cText('[ Toca o presiona cualquier tecla ]', 258, '8px "Press Start 2P"', '#ffaabb');
    return;
  }

  /* ── PLAYING ── */
  if (state === ST.PLAYING) {
    sky(90,150,215, 170,215,240);
    bgOffset += speed * .25;
    drawBuildings(bgOffset);
    drawStreet();

    // Obstáculos
    obTimer++;
    if (obTimer >= obInterval) {
      spawnObstacle(); obTimer = 0;
      // Intervalo dinámico: más corto a más velocidad
      obInterval = Math.max(35, 68 - Math.floor(score/10));
    }
    obstacles = obstacles.filter(o => o.x > -100 && o.alive);
    obstacles.forEach(ob => {
      ob.x -= speed;
      drawSprite(ctx, ob.sprite, ob.x, LANES[ob.lane] - ob.sh * CHAR_SCALE, CHAR_SCALE);
    });

    // Fany parpadeante si invencible
    if (invincible > 0) { invincible--; if (invincible%8 < 4) { drawHUD(); tickParticles(); return; } }

    const runSp = frame%18 < 9 ? FANY_RUN1 : FANY_RUN2;
    drawSprite(ctx, runSp, PLAYER_X, LANES[lane]-CHAR_H, CHAR_SCALE);

    // Actualizar distancia y velocidad
    dist  = Math.max(0, dist - speed * .045);
    score += Math.floor(speed * .012);
    speed = Math.min(MAX_SPEED, INIT_SPEED + (INIT_DIST - dist) * .006);

    // Efecto de punto
    if (score > lastScore && score % 10 === 0) {
      burst(W - 30, 40, 3, '✨');
      lastScore = score;
    }

    checkCollision();
    drawHUD();
    tickParticles();

    if (dist <= 0) { state = ST.BOARDING; cinemaT = 0; busX = W + 80; fanyX = PLAYER_X; }
    return;
  }

  /* ── GAMEOVER ── */
  if (state === ST.GAMEOVER) {
    sky(70,70,90, 110,90,90);
    drawBuildings(bgOffset);
    drawStreet();
    drawSprite(ctx, FANY_STAND, PLAYER_X, LANES[lane]-CHAR_H, CHAR_SCALE);
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,W,H);
    cText('¡AY, NO! 😥', 100, '24px "Press Start 2P"', '#ff6666');
    cText('Fany tropezó en el camino...', 145, '30px "Cormorant Garamond"');
    cText(`Llegaste ${Math.floor(INIT_DIST - dist)} metros`, 178, '26px "Cormorant Garamond"', '#ffddaa');
    cText('[ Toca para reintentar ]', 248, '8px "Press Start 2P"', '#ffaacc');
    return;
  }

  /* ── BOARDING: bus entra y Fany sube ── */
  if (state === ST.BOARDING) {
    cinemaT++;
    sky(90,150,215, 170,215,240);
    drawBuildings(bgOffset += .8);
    drawStreet();

    // Bus entra suavemente desde la derecha
    if (busX > W - 320) busX -= 4.5;
    // Fany corre hacia el bus
    const target = busX - CHAR_W - 5;
    if (fanyX < target) fanyX += 3.2;

    // Dibujar bus grande
    drawSprite(ctx, BUS_ADO, busX, LANES[1] - BUS_ADO.length * BUS_SCALE - 10, BUS_SCALE);
    const sp2 = frame%16<8 ? FANY_RUN1 : FANY_RUN2;
    drawSprite(ctx, sp2, Math.floor(fanyX), LANES[1]-CHAR_H, CHAR_SCALE);

    cText('¡El ADO llegó! Sube rápido...', H-35, '26px "Caveat"', '#ffdc60');

    if (cinemaT > 100) { state = ST.TRAVELING; cinemaT = 0; busX = -350; fanyX = -60; silvanaX = W + 50; }
    return;
  }

  /* ── TRAVELING: trayecto al atardecer ── */
  if (state === ST.TRAVELING) {
    cinemaT++;
    const t = Math.min(1, cinemaT/180);
    // Gradiente cambia de día a atardecer
    sky(
      90  + Math.floor(165*t), 150 - Math.floor(70*t),  215 - Math.floor(135*t),
      170 + Math.floor(85*t),  215 - Math.floor(65*t),  240 - Math.floor(160*t)
    );
    // Carretera
    ctx.fillStyle='#444'; ctx.fillRect(0, SKY_H, W, H-SKY_H);
    ctx.fillStyle='#f5d060'; ctx.fillRect(0, SKY_H+20, W, 4);
    ctx.fillStyle='#f5d060'; ctx.fillRect(0, H-44, W, 4);
    // Líneas de carretera que se mueven (efecto velocidad)
    ctx.setLineDash([30,18]); ctx.strokeStyle='#f5d060'; ctx.lineWidth=3;
    const lineX = (cinemaT * 8) % 48;
    for (let lx = -48 + lineX; lx < W; lx += 48) {
      ctx.beginPath(); ctx.moveTo(lx, SKY_H+80); ctx.lineTo(lx+28, SKY_H+80); ctx.stroke();
    }
    ctx.setLineDash([]);
    // Bus moviéndose
    const bx2 = W/2 - BUS_ADO[0].length * BUS_SCALE / 2;
    drawSprite(ctx, BUS_ADO, bx2, LANES[1]-BUS_ADO.length*BUS_SCALE-10, BUS_SCALE);

    cText('Rumbo a Minatitlán...', H/2-28, '30px "Caveat"', '#fff5cc');
    // Barra de progreso
    const prog = Math.min(1, cinemaT/180);
    ctx.fillStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.roundRect(W/2-120,H/2+8,240,14,7); ctx.fill();
    ctx.fillStyle='#ffdc60'; ctx.beginPath(); ctx.roundRect(W/2-120,H/2+8,240*prog,14,7); ctx.fill();
    ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#fff';
    const pct = `${Math.floor(prog*100)}%`;
    ctx.fillText(pct, W/2-ctx.measureText(pct).width/2, H/2+20);

    if (cinemaT > 200) { state = ST.ARRIVING; cinemaT = 0; busX = -360; fanyX = -70; }
    return;
  }

  /* ── ARRIVING: bus frena, Fany baja ── */
  if (state === ST.ARRIVING) {
    cinemaT++;
    sky(255,195,115, 255,155,75);
    drawBuildings(cinemaT * .3);
    drawStreet();

    // Bus entra desde la izquierda y frena
    busX = Math.min(W/2 - BUS_ADO[0].length*BUS_SCALE - 20, busX + 4.5);
    if (cinemaT > 45) fanyX = Math.min(PLAYER_X + 90, fanyX + 3.5);

    drawSprite(ctx, BUS_ADO, busX, LANES[1]-BUS_ADO.length*BUS_SCALE-10, BUS_SCALE);
    if (cinemaT > 45) drawSprite(ctx, FANY_STAND, Math.floor(fanyX), LANES[1]-CHAR_H, CHAR_SCALE);

    cText('¡Llegó a Minatitlán! 🌟', H-38, '28px "Caveat"', '#ffdc60');

    if (cinemaT > 110) { state = ST.REUNION; cinemaT = 0; silvanaX = W + 50; }
    return;
  }

  /* ── REUNION: Silvana aparece ── */
  if (state === ST.REUNION) {
    cinemaT++;
    sky(255,195,115, 255,155,75);
    drawBuildings(0); drawStreet();

    silvanaX = Math.max(PLAYER_X + CHAR_W + 55, silvanaX - 2.8);

    drawSprite(ctx, FANY_STAND,    PLAYER_X + 90,           LANES[1]-CHAR_H, CHAR_SCALE);
    drawSprite(ctx, SILVANA_STAND, Math.floor(silvanaX),    LANES[1]-CHAR_H, CHAR_SCALE, true);

    if (cinemaT < 90) cText('Silvana...', H-48, '26px "Caveat"', '#ffd4ea');
    else              cText('¡Por fin juntas! 💙', H-48, '28px "Caveat"', '#ffdc60');

    if (cinemaT > 140) { state = ST.KISS; cinemaT = 0; burstCircle(W/2, LANES[1]-20, 24, '💙'); }
    return;
  }

  /* ── KISS: beso + explosión de corazones ── */
  if (state === ST.KISS) {
    cinemaT++;
    sky(255,195,115, 255,155,75);
    drawBuildings(0); drawStreet();

    const kfx = W/2 - CHAR_W - 4, ksx = W/2 + 4;
    drawSprite(ctx, FANY_STAND,    kfx, LANES[1]-CHAR_H, CHAR_SCALE);
    drawSprite(ctx, SILVANA_STAND, ksx, LANES[1]-CHAR_H, CHAR_SCALE, true);
    ctx.font = '34px sans-serif';
    ctx.fillText('💙', W/2-17, LANES[1]-CHAR_H-14);

    tickParticles();
    if (cinemaT % 16 === 0) burstCircle(W/2, LANES[1]-20, 8, ['💙','🤍','✨','🌸'][Math.floor(Math.random()*4)]);
    if (cinemaT > 160) { state = ST.WIN; cinemaT = 0; }
    return;
  }

  /* ── WIN ── */
  if (state === ST.WIN) {
    cinemaT++;
    sky(255,195,115, 255,155,75);
    drawBuildings(cinemaT*.2); drawStreet();
    const kfx = W/2 - CHAR_W - 4, ksx = W/2 + 4;
    drawSprite(ctx, FANY_STAND,    kfx, LANES[1]-CHAR_H, CHAR_SCALE);
    drawSprite(ctx, SILVANA_STAND, ksx, LANES[1]-CHAR_H, CHAR_SCALE, true);
    ctx.font='34px sans-serif'; ctx.fillText('💙', W/2-17, LANES[1]-CHAR_H-14);

    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,W,H);
    cText('¡Al fin juntas! 💙', H/2-58, '34px "Caveat"', '#ffdc60');
    cText('La distancia no pudo con nosotras.', H/2-18, '30px "Cormorant Garamond"');
    cText('"Te elijo cada día, desde Orizaba hasta aquí."', H/2+18, 'italic 26px "Cormorant Garamond"', '#ffd4ea');

    tickParticles();
    if (cinemaT%22===0) burstCircle(Math.random()*W, Math.random()*(H/2)+40, 7, ['💙','🤍','✨'][Math.floor(Math.random()*3)]);

    // Botón reiniciar
    const bx=W/2-90, by=H/2+55, bw=180, bh=38;
    ctx.fillStyle='rgba(123,169,201,.9)';
    ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,20); ctx.fill();
    ctx.font='9px "Press Start 2P"'; ctx.fillStyle='#fff';
    const rt='Jugar de nuevo';
    ctx.fillText(rt, bx+bw/2-ctx.measureText(rt).width/2, by+25);

    if (!canvas._wcb) {
      canvas._wcb = true;
      canvas.addEventListener('click', e => {
        if (state!==ST.WIN) return;
        const rc=canvas.getBoundingClientRect();
        const cx=(e.clientX-rc.left)*(W/rc.width), cy=(e.clientY-rc.top)*(H/rc.height);
        if (cx>bx&&cx<bx+bw&&cy>by&&cy<by+bh) startGame();
      });
    }
    return;
  }
}

loop();
})();
