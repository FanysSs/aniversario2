/* nav.js — Hamburguesa para móvil */
(function () {
  const btn   = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });
  links && links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    })
  );
})();
