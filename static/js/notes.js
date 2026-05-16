/* notes.js — Animaciones e interactividad de la página de notas */
(function () {

  /* ── Contador de caracteres en el textarea ── */
  const textarea  = document.getElementById('notaMensaje');
  const charCount = document.getElementById('charCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 600`;
      charCount.classList.toggle('near-limit', len > 520);
    });
  }

  /* ── Animación de entrada de tarjetas al cargar ── */
  const cards = document.querySelectorAll('.note-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = `rotate(${card.style.getPropertyValue('--rot')}) translateY(24px)`;
    card.style.transition = `opacity .5s ease ${i * 0.07}s, transform .6s cubic-bezier(.2,.8,.2,1) ${i * 0.07}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = `rotate(var(--rot)) translateY(0)`;
      });
    });
  });

  /* ── Efecto hover: elevar la tarjeta activa ── */
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'rotate(0deg) scale(1.03) translateY(-6px)';
      card.style.zIndex = '5';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotate(var(--rot)) translateY(0)`;
      card.style.zIndex = '';
    });
  });

  /* ── Botón de submit: prevenir doble envío ── */
  const form   = document.getElementById('noteForm');
  const submit = form?.querySelector('.note-submit');
  if (form && submit) {
    form.addEventListener('submit', () => {
      submit.disabled = true;
      submit.textContent = 'Guardando…';
    });
  }

})();
