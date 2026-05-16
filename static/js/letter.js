/* letter.js — Sobre que se abre y despliega la carta */
(function () {
  const env    = document.getElementById('envelope');
  const letter = document.getElementById('letter');
  if (!env) return;

  function toggle() {
    env.classList.toggle('open');
    if (letter) {
      letter.classList.toggle('open');
      letter.setAttribute('aria-hidden', !letter.classList.contains('open'));
    }
  }
  env.addEventListener('click', toggle);
  env.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' '){e.preventDefault();toggle();} });
})();
