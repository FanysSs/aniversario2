/* reasons.js
 * Las razones se leen desde la variable global RAZONES_DATA,
 * que Flask inyecta en razones.html desde data/razones.json.
 *
 * ✅ PARA EDITAR LAS RAZONES: abre data/razones.json y edita el arreglo.
 *    Puedes agregar, eliminar o reordenar — sin tocar este archivo.
 */
(function () {
  const grid   = document.getElementById('reasonsGrid');
  const modal  = document.getElementById('reasonsModal');
  const numEl  = document.getElementById('reasonNum');
  const txtEl  = document.getElementById('reasonText');
  const closeB = document.getElementById('reasonsClose');
  if (!grid) return;

  // RAZONES_DATA es inyectado por el template desde data/razones.json
  const razones = (typeof RAZONES_DATA !== 'undefined' && RAZONES_DATA.length)
    ? RAZONES_DATA
    : ["Edita data/razones.json para agregar tus razones. 💙"];

  const total = Math.max(razones.length, 100);

  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.className = 'reason-btn';
    b.textContent = i + 1;
    b.setAttribute('aria-label', `Razón ${i + 1}`);
    b.addEventListener('click', () => {
      numEl.textContent = `#${i + 1}`;
      txtEl.textContent  = razones[i] || '¡Hay tantas que no caben todas! 💙';
      modal.classList.add('open');
      b.classList.add('seen');
    });
    grid.appendChild(b);
  }

  const closeModal = () => modal.classList.remove('open');
  closeB.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
