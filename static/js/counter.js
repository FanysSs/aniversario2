/* counter.js — Contador de tiempo desde la fecha especial */
(function () {
  const el = document.querySelector('.counter');
  if (!el) return;
  const target = new Date(el.dataset.target);
  const pad = n => String(n).padStart(2,'0');

  function tick() {
    const d = Date.now() - target;
    if (d < 0) return;
    const totalSecs  = Math.floor(d / 1000);
    const totalMins  = Math.floor(d / 60000);
    const totalHours = Math.floor(d / 3600000);
    const totalWeeks = Math.floor(d / 604800000);

    document.getElementById('cnt-days').textContent  = Math.floor(d/86400000);
    document.getElementById('cnt-hours').textContent = pad(Math.floor(d/3600000)%24);
    document.getElementById('cnt-mins').textContent  = pad(Math.floor(d/60000)%60);
    document.getElementById('cnt-secs').textContent  = pad(totalSecs%60);

    const mw = document.querySelector('#ms-weeks .ms-num');
    const mh = document.querySelector('#ms-hours-total .ms-num');
    const mm = document.querySelector('#ms-mins-total .ms-num');
    if (mw) mw.textContent = totalWeeks;
    if (mh) mh.textContent = totalHours.toLocaleString('es-MX');
    if (mm) mm.textContent = totalMins.toLocaleString('es-MX');
  }
  tick();
  setInterval(tick, 1000);
})();
