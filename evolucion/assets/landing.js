/* =======================================================================
   Logica compartida por los 5 mockups.
   En la entrega final esto sera script.js, con los mismos tres bloques:
     1. Validacion en tiempo real   -> heuristica 5, prevencion de errores
     2. Estado de envio visible     -> heuristica 1, visibilidad del estado
     3. Modal de confirmacion       -> heuristica 1 + control del usuario
   ======================================================================= */
(function () {
  const form  = document.getElementById('form');
  if (!form) return;
  const email = document.getElementById('email');
  const boton = document.getElementById('boton');
  const aviso = document.getElementById('aviso');
  const velo  = document.getElementById('velo');
  const modal = document.getElementById('modal');

  const ICONO =
    '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M8 1.6 15 14H1L8 1.6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M8 6.2v3.1M8 11.4h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  /* --- 1. Validacion: mensajes en lenguaje humano, no "email invalido" --- */
  function revisar(valor) {
    const v = valor.trim();
    if (v === '')                 return 'Escribe tu email para suscribirte.';
    if (/\s/.test(v))             return 'El email no puede llevar espacios.';
    if (!v.includes('@'))         return 'Falta la @ en el email.';
    const partes = v.split('@');
    if (partes.length > 2)        return 'Sobra una @.';
    const [antes, despues] = partes;
    if (!antes)                   return 'Falta el nombre antes de la @.';
    if (!despues.includes('.'))   return 'Falta el punto del dominio, por ejemplo .com';
    if (despues.split('.').pop().length < 2) return 'Revisa lo que va despues del ultimo punto.';
    return null;
  }

  function marcarError(texto) {
    aviso.className = 'aviso aviso--mal';
    aviso.innerHTML = ICONO + '<span>' + texto + '</span>';   // icono + texto: nunca solo color
    email.setAttribute('aria-invalid', 'true');
  }
  function limpiar() {
    aviso.className = 'aviso';
    aviso.textContent = '';
    email.removeAttribute('aria-invalid');
  }

  email.addEventListener('input', limpiar);          // mientras escribe no se le regana
  email.addEventListener('blur', function () {       // al salir del campo, ya avisa
    if (!email.value.trim()) return;
    const fallo = revisar(email.value);
    if (fallo) marcarError(fallo);
  });

  /* --- 2. Envio simulado con estado visible --- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const fallo = revisar(email.value);
    if (fallo) { marcarError(fallo); email.focus(); return; }

    const original = boton.textContent;
    limpiar();
    boton.disabled = true;
    boton.textContent = 'Enviando…';
    aviso.className = 'aviso aviso--bien';
    aviso.textContent = 'Comprobando tu email…';

    setTimeout(function () {
      boton.disabled = false;
      boton.textContent = original;
      limpiar();
      abrirModal(email.value.trim());
      form.reset();
    }, 1100);
  });

  /* --- 3. Modal accesible: foco atrapado, Esc, devuelve el foco --- */
  let focoPrevio = null;

  function abrirModal(valor) {
    const hueco = document.getElementById('modal-email');
    if (hueco) hueco.textContent = valor;
    focoPrevio = document.activeElement;
    velo.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('ok').focus();
  }
  function cerrarModal() {
    velo.hidden = true;
    document.body.style.overflow = '';
    if (focoPrevio) focoPrevio.focus();
  }

  document.getElementById('ok').addEventListener('click', cerrarModal);
  const equis = document.getElementById('x');
  if (equis) equis.addEventListener('click', cerrarModal);
  velo.addEventListener('click', function (e) { if (e.target === velo) cerrarModal(); });

  document.addEventListener('keydown', function (e) {
    if (velo.hidden) return;
    if (e.key === 'Escape') { cerrarModal(); return; }
    if (e.key === 'Tab') {
      const focos = modal.querySelectorAll('button');
      const primero = focos[0], ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });
})();
