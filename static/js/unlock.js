/* unlock.js — Valida la fecha y desbloquea el sitio */
(function () {
  const form  = document.getElementById('unlockForm');
  const input = document.getElementById('fechaInput');
  const msg   = document.getElementById('unlockMsg');
  if (!form) return;

  // Auto-formato DD/MM/AAAA mientras escribe
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) v = v.slice(0,2) + '/' + v.slice(2,4) + '/' + v.slice(4);
    else if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    e.target.value = v;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = ''; msg.classList.remove('ok');
    try {
      const res  = await fetch('/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fecha: input.value.trim() }) });
      const data = await res.json();
      if (data.ok) {
        msg.textContent = '¡Es esa! Abriendo… 💙'; msg.classList.add('ok');
        form.style.transition = 'opacity .5s'; form.style.opacity = '.4';
        setTimeout(() => window.location.href = data.redirect, 900);
      } else {
        msg.textContent = data.mensaje || 'Intenta otra vez 💙';
        form.classList.remove('shake');
        void form.offsetWidth;
        form.classList.add('shake');
        input.select();
      }
    } catch { msg.textContent = 'Hubo un error. Inténtalo de nuevo.'; }
  });
})();
