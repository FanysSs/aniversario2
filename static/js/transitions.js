/* transitions.js — Fade suave entre páginas */
(function () {
  const curtain = document.getElementById('pageCurtain');
  if (!curtain) return;

  // Interceptar todos los links internos marcados con data-nav
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-nav]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    e.preventDefault();
    curtain.classList.add('show');
    setTimeout(() => window.location.href = href, 360);
  });
})();
