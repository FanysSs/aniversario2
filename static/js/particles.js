/* particles.js — Íconos flotantes en el fondo */
(function () {
  const c = document.getElementById('bgParticles');
  if (!c) return;
  const icons = ['💙','🤍','✨','🌸','🌷','💫'];
  for (let i = 0; i < 20; i++) {
    const s = document.createElement('span');
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration  = (14 + Math.random() * 16) + 's';
    s.style.animationDelay     = (Math.random() * -20) + 's';
    s.style.fontSize            = (.7 + Math.random() * 1.3) + 'rem';
    s.style.opacity             = .2 + Math.random() * .35;
    c.appendChild(s);
  }
})();
