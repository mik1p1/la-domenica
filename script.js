/* =====================================================================
   sitio.js — comportamiento comun a todas las paginas
     1. Menu hamburguesa en movil  (patron aprendido, Unidad 02 punto 4)
     2. Formulario: validacion en tiempo real + estado de envio + modal
     3. Filtros de la pagina de recetas
     4. Comprobacion visual del patron Z (solo si la URL lleva ?z)
   ===================================================================== */
(function () {

  /* ---------- 1. Menu hamburguesa ---------- */
  const boton = document.querySelector('.hamburguesa');
  const nav = document.getElementById('nav');
  if (boton && nav) {
    boton.addEventListener('click', function () {
      const abierta = nav.classList.toggle('abierta');
      boton.setAttribute('aria-expanded', abierta);
      boton.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  /* ---------- 2. Formulario de suscripcion ---------- */
  const form = document.getElementById('form');
  if (form) {
    const email = document.getElementById('email');
    const enviar = document.getElementById('boton');
    const aviso = document.getElementById('aviso');
    const velo = document.getElementById('velo');
    const modal = document.getElementById('modal');
    const ICONO = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M8 1.6 15 14H1L8 1.6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M8 6.2v3.1M8 11.4h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

    function revisar(valor) {
      const v = valor.trim();
      if (v === '') return 'Escribe tu email para suscribirte.';
      if (/\s/.test(v)) return 'El email no puede contener espacios.';
      if (!v.includes('@')) return 'Falta la @. Ejemplo: nombre@correo.com';
      const partes = v.split('@');
      if (partes.length > 2) return 'El email solo puede tener una @.';
      if (!partes[0]) return 'Falta el nombre antes de la @.';
      if (!partes[1].includes('.')) return 'Falta el dominio. Ejemplo: @correo.com';
      if (partes[1].split('.').pop().length < 2) return 'Revisa la terminación del dominio (.com, .es…).';
      return null;
    }
    function error(texto) {
      aviso.className = 'aviso aviso--mal';
      aviso.innerHTML = ICONO + '<span>' + texto + '</span>';
      email.setAttribute('aria-invalid', 'true');
    }
    function limpiar() {
      aviso.className = 'aviso';
      aviso.textContent = '';
      email.removeAttribute('aria-invalid');
    }
    email.addEventListener('input', limpiar);
    email.addEventListener('blur', function () {
      if (!email.value.trim()) return;
      const fallo = revisar(email.value);
      if (fallo) error(fallo);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fallo = revisar(email.value);
      if (fallo) { error(fallo); email.focus(); return; }
      const original = enviar.innerHTML;
      limpiar();
      enviar.disabled = true;
      enviar.textContent = 'Enviando…';
      setTimeout(function () {
        enviar.disabled = false;
        enviar.innerHTML = original;
        abrir(email.value.trim());
        form.reset();
      }, 1200);
    });

    let previo = null;
    function abrir(valor) {
      document.getElementById('modal-email').textContent = valor;
      previo = document.activeElement;
      velo.hidden = false;
      document.body.style.overflow = 'hidden';
      document.getElementById('ok').focus();
    }
    function cerrar() {
      velo.hidden = true;
      document.body.style.overflow = '';
      if (previo) previo.focus();
    }
    document.getElementById('ok').addEventListener('click', cerrar);
    document.getElementById('x').addEventListener('click', cerrar);
    velo.addEventListener('click', function (e) { if (e.target === velo) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (velo.hidden) return;
      if (e.key === 'Escape') { cerrar(); return; }
      if (e.key === 'Tab') {
        const focos = modal.querySelectorAll('button');
        const a = focos[0], b = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    });
  }

  /* ---------- 3. Filtros de recetas ---------- */
  const filtros = document.querySelectorAll('.filtro');
  if (filtros.length) {
    const tarjetas = document.querySelectorAll('.receta');
    const contador = document.getElementById('contador');
    filtros.forEach(function (f) {
      f.addEventListener('click', function () {
        filtros.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        f.setAttribute('aria-pressed', 'true');
        const cat = f.dataset.cat;
        let visibles = 0;
        tarjetas.forEach(function (t) {
          const ver = cat === 'todas' || t.dataset.cat === cat;
          t.hidden = !ver;
          if (ver) visibles++;
        });
        contador.textContent = visibles + (visibles === 1 ? ' receta' : ' recetas');
      });
    });
  }

  /* ---------- 4. Patron Z (solo con ?z) ---------- */
  if (location.search.indexOf('z') !== -1) {
    window.addEventListener('load', function () {
      const pts = [1, 2, 3, 4].map(function (n) {
        const el = document.querySelector('[data-z="' + n + '"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY];
      });
      if (pts.indexOf(null) !== -1) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'capa-z');
      svg.setAttribute('width', document.documentElement.scrollWidth);
      svg.setAttribute('height', document.documentElement.scrollHeight);
      svg.innerHTML = '<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') +
        '" fill="none" stroke="#E53935" stroke-width="4" stroke-dasharray="12 8"/>' +
        pts.map(function (p, i) {
          return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" fill="#E53935"/>' +
            '<text x="' + p[0] + '" y="' + (p[1] + 6) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">' + (i + 1) + '</text>';
        }).join('');
      document.body.appendChild(svg);
    });
  }
})();
