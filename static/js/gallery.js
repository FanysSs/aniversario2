/* gallery.js — Carrusel + editor de descripciones */
(function () {
  const track  = document.getElementById('galleryTrack');
  const prev   = document.getElementById('galleryPrev');
  const next   = document.getElementById('galleryNext');
  const dotsEl = document.getElementById('galleryDots');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.polaroid'));
  let current = 0;
  let autoplay = null;

  /* Dots */
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'g-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Ir a foto ${i+1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl && dotsEl.appendChild(d);
  });

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, cards.length - 1));
    cards[current].scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
    updateDots();
    pauseAllVideos();
  }
  function updateDots() {
    dotsEl && dotsEl.querySelectorAll('.g-dot').forEach((d,i) => d.classList.toggle('active', i===current));
  }
  function pauseAllVideos() {
    track.querySelectorAll('video').forEach(v => { v.pause(); v.closest('.polaroid-media')?.classList.remove('playing'); });
  }

  prev && prev.addEventListener('click', () => { goTo(current-1); resetAutoplay(); });
  next && next.addEventListener('click', () => { goTo(current+1); resetAutoplay(); });

  document.addEventListener('keydown', e => {
    if (e.key==='ArrowLeft')  { goTo(current-1); resetAutoplay(); }
    if (e.key==='ArrowRight') { goTo(current+1); resetAutoplay(); }
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { current = cards.indexOf(entry.target); updateDots(); }
    });
  }, { root: track, threshold: .6 });
  cards.forEach(c => obs.observe(c));

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current < cards.length-1 ? current+1 : 0), 3500);
  }
  function resetAutoplay() { clearInterval(autoplay); startAutoplay(); }
  startAutoplay();
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => startAutoplay());

  /* Botones de video */
  track.querySelectorAll('.vid-play-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const wrap  = btn.closest('.polaroid-media');
      const video = wrap.querySelector('video');
      if (!video) return;
      if (video.paused) {
        pauseAllVideos(); video.play(); wrap.classList.add('playing'); clearInterval(autoplay);
      } else {
        video.pause(); wrap.classList.remove('playing'); startAutoplay();
      }
    });
  });

  /* Swipe táctil */
  let touchX = null;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive:true });
  track.addEventListener('touchend', e => {
    if (touchX===null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx)>40) { goTo(dx<0 ? current+1 : current-1); resetAutoplay(); }
    touchX = null;
  });

  /* Nombre de archivo al elegir */
  const fileInput = document.getElementById('uploadFile');
  const fileName  = document.getElementById('uploadName');
  if (fileInput && fileName) {
    fileInput.addEventListener('change', () => {
      fileName.textContent = fileInput.files[0]?.name || '';
    });
  }

})();

/* Editor de descripciones */
(function () {
  const modal     = document.getElementById('editModal');
  const srcInput  = document.getElementById('editSrc');
  const textInput = document.getElementById('editInput');
  const btnClose  = document.getElementById('editClose');
  const btnCancel = document.getElementById('editCancel');
  if (!modal) return;

  document.querySelectorAll('.edit-caption-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      srcInput.value  = btn.dataset.src;
      textInput.value = btn.dataset.caption || '';
      modal.classList.add('open');
      modal.removeAttribute('aria-hidden');
      setTimeout(() => textInput.focus(), 200);
    });
  });

  function cerrar() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  btnClose?.addEventListener('click',  cerrar);
  btnCancel?.addEventListener('click', cerrar);
  modal.addEventListener('click', e => { if (e.target===modal) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key==='Escape') cerrar(); });
})();