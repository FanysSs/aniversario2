/* music.js — Reproductor de música opcional que persiste entre páginas */
(function () {
  const player = document.getElementById('musicPlayer');
  const btn    = document.getElementById('musicBtn');
  const audio  = document.getElementById('bgMusic');
  if (!player || !audio) return;

  // Si el archivo de audio no carga, ocultamos el botón
  audio.addEventListener('error', () => { player.style.display = 'none'; });

  const KEY_PLAY = 'scrapbook_music_playing';
  const KEY_VOL  = 'scrapbook_music_vol';
  let playing = sessionStorage.getItem(KEY_PLAY) === '1';

  audio.volume = parseFloat(sessionStorage.getItem(KEY_VOL) || '0.35');

  function setPlaying(state) {
    playing = state;
    sessionStorage.setItem(KEY_PLAY, state ? '1' : '0');
    if (state) { audio.play().catch(() => {}); btn.classList.add('playing'); btn.querySelector('.music-icon').textContent = '🔊'; }
    else        { audio.pause(); btn.classList.remove('playing'); btn.querySelector('.music-icon').textContent = '🎵'; }
  }

  // Restaurar estado al cargar
  if (playing) {
    audio.load();
    // Los navegadores requieren gesto previo. Intentamos reproducir.
    audio.play().then(() => { btn.classList.add('playing'); btn.querySelector('.music-icon').textContent = '🔊'; }).catch(() => { playing = false; });
  }

  btn.addEventListener('click', () => setPlaying(!playing));
})();
