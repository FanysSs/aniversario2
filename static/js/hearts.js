/* hearts.js — Corazones que aparecen al hacer click */
(function () {
  const css = '@keyframes hFloat{0%{opacity:1;transform:translate(-50%,-50%) scale(.7)}100%{opacity:0;transform:translate(-50%,-250%) scale(1.3)}}';
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  document.addEventListener('click', (e) => {
    if (e.target.closest('#gameCanvas, button, input, a')) return;
    const h = document.createElement('span');
    h.textContent = ['💙','🤍','✨'][Math.floor(Math.random()*3)];
    h.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;font-size:${1+Math.random()*1}rem;pointer-events:none;z-index:9999;animation:hFloat .9s ease-out forwards`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 950);
  });
})();
