// Piezas reutilizables (countdown, galería con lightbox, formulario de RSVP)
// que cada diseño combina de manera distinta. Lo que cambia entre diseños
// es la ESTRUCTURA de la página (secciones, orden, layout, CSS propio),
// no estos widgets de comportamiento.

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Si una foto (de ejemplo o cargada por el usuario) no llega a cargar,
// la reemplazamos por un placeholder prolijo en vez de mostrar el ícono
// de imagen rota. Se incluye una sola vez por página, enganchado al
// countdown porque todos los diseños lo usan.
const IMG_FALLBACK_SCRIPT = `
  document.addEventListener('error', function(e){
    var t = e.target;
    if(t && t.tagName === 'IMG' && t.src && !t.dataset.fallback){
      t.dataset.fallback = '1';
      t.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">'
        + '<rect width="100%" height="100%" fill="#ddd"/>'
        + '<text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#999" text-anchor="middle" dy=".3em">Foto</text>'
        + '</svg>'
      );
    }
  }, true);
`;

function countdownWidget(targetISO, id = "cd") {
  return {
    html: `<div class="countdown" id="${id}">
      <div><span class="cd-num" data-u="d">00</span><span class="cd-label">días</span></div>
      <div><span class="cd-num" data-u="h">00</span><span class="cd-label">hs</span></div>
      <div><span class="cd-num" data-u="m">00</span><span class="cd-label">min</span></div>
      <div><span class="cd-num" data-u="s">00</span><span class="cd-label">seg</span></div>
    </div>`,
    script: `${IMG_FALLBACK_SCRIPT}
      (function(){
        var target = new Date(${JSON.stringify(targetISO)}).getTime();
        var el = document.getElementById(${JSON.stringify(id)});
        if(!el || isNaN(target)) return;
        function tick(){
          var diff = Math.max(0, target - Date.now());
          var d = Math.floor(diff/86400000);
          var h = Math.floor(diff/3600000)%24;
          var m = Math.floor(diff/60000)%60;
          var s = Math.floor(diff/1000)%60;
          var map = {d:d,h:h,m:m,s:s};
          el.querySelectorAll('.cd-num').forEach(function(node){
            var u = node.getAttribute('data-u');
            node.textContent = String(map[u]).padStart(2,'0');
          });
        }
        tick(); setInterval(tick, 1000);
      })();`,
  };
}

function galleryWidget(images = [], id = "gal") {
  const imgs = images.length ? images : [];
  return {
    html: `<div class="gallery" id="${id}">
      ${imgs.map((src, i) => `<div class="gallery-item" data-idx="${i}"><img src="${esc(src)}" loading="lazy" alt="Foto ${i + 1}"></div>`).join("")}
    </div>
    <div class="lightbox" id="${id}-lb"><span class="lightbox-close">&times;</span><img id="${id}-lb-img" src=""></div>`,
    script: `
      (function(){
        var gal = document.getElementById(${JSON.stringify(id)});
        var lb = document.getElementById(${JSON.stringify(id + "-lb")});
        var lbImg = document.getElementById(${JSON.stringify(id + "-lb-img")});
        if(!gal || !lb) return;
        gal.querySelectorAll('.gallery-item img').forEach(function(img){
          img.addEventListener('click', function(){
            lbImg.src = img.src;
            lb.classList.add('open');
          });
        });
        lb.addEventListener('click', function(){ lb.classList.remove('open'); });
      })();`,
  };
}

// Arma una frase tipo "el cumple nº 7 de Bruno" o "el casamiento de Cande y
// Manchi" a partir de la categoría y los datos cargados, para que el
// mensaje de WhatsApp diga para qué evento es la confirmación (en vez de
// un genérico "la invitación"). Si falta algún dato, cae a un fallback
// prolijo en vez de mostrar "undefined" o una frase rota.
function eventoLabel(categoria, d = {}) {
  switch (categoria) {
    case "bodas":
      if (d.novia && d.novio) return `el casamiento de ${d.novia} y ${d.novio}`;
      return "el casamiento";
    case "xv":
      if (d.nombre) return `los 15 de ${d.nombre}`;
      return "la fiesta de 15";
    case "cumpleanos":
      if (d.nombre && d.edad) return `el cumple nº ${d.edad} de ${d.nombre}`;
      if (d.nombre) return `el cumpleaños de ${d.nombre}`;
      return "el cumpleaños";
    case "infantiles":
      if (d.nombreChico && d.edad) return `el cumple nº ${d.edad} de ${d.nombreChico}`;
      if (d.nombreChico) return `el cumpleaños de ${d.nombreChico}`;
      return "el cumpleaños";
    case "bautismos":
      if (d.nombreChico) return `el bautismo de ${d.nombreChico}`;
      return "el bautismo";
    case "halloween":
      if (d.nombre) return `el festejo de Halloween de ${d.nombre}`;
      return "el festejo de Halloween";
    case "navidad":
      if (d.nombre) return `el festejo de ${d.nombre}`;
      return "el festejo";
    default:
      return "la invitación";
  }
}

// La confirmación de asistencia es un solo paso: la persona completa la
// ficha y un único botón la manda directo por WhatsApp al número que cargó
// el organizador (campo "whatsapp" del formulario del editor) — no hay un
// botón separado que "guarda en el sitio" más un link aparte de WhatsApp.
// Igual seguimos guardando la respuesta en segundo plano (silencioso, sin
// bloquear ni depender de eso) para que el organizador la vea también en su
// panel de invitados por si no llega a revisar WhatsApp.
function rsvpWidget(slug, { withGuests = true, withMenu = false, whatsapp = null, categoria = null, datos = {} } = {}) {
  const id = "rsvp-" + Math.random().toString(36).slice(2, 8);
  const waNumber = whatsapp ? String(whatsapp).replace(/[^0-9]/g, "") : "";
  const evento = eventoLabel(categoria, datos);
  const btnLabel = waNumber ? "✅ Confirmar asistencia por WhatsApp" : "✅ Confirmar asistencia";
  const menuLabels = { clasico: "Clásico", vegetariano: "Vegetariano", vegano: "Vegano", celiaco: "Sin TACC" };

  // Modo invitado nombrado (feature "invitadosPersonalizados", plan Premium
  // bodas/xv): si el organizador cargó a este invitado en su panel, "datos"
  // trae "__guest" (inyectado por server.js al resolver el link personal
  // /invitacion/:slug/i/:token) con { nombre, cupo, confirmacion }. En ese
  // caso el form pide un nombre por acompañante hasta el cupo asignado en
  // vez del campo libre "¿Cuántos asisten?", y guarda contra el endpoint
  // del invitado puntual (para que se pueda reeditar la respuesta después)
  // en vez del RSVP anónimo genérico.
  const guest = datos && datos.__guest ? datos.__guest : null;
  const cupo = guest ? Math.max(1, Number(guest.cupo) || 1) : null;
  const prevConf = guest && guest.confirmacion ? guest.confirmacion : null;
  const prevNombres = prevConf && Array.isArray(prevConf.nombres) ? prevConf.nombres : [];

  const guestIntro = guest
    ? `<p class="rsvp-guest-intro" style="font-weight:700;margin:0 0 12px;">¡Hola <strong>${esc(guest.nombre)}</strong>! Tenés ${cupo === 1 ? "1 lugar reservado" : `${cupo} lugares reservados`} para ${evento}.</p>`
    : "";

  const guestNameFields = guest
    ? Array.from({ length: cupo }).map((_, i) => `
      <label class="rsvp-guest-name-field" data-idx="${i}" ${i > 0 ? 'style="display:none"' : ""}>
        Nombre del invitado ${cupo > 1 ? i + 1 : ""}
        <input name="invitadoNombre${i}" type="text" placeholder="Nombre y apellido" value="${esc(prevNombres[i] || "")}" ${i === 0 ? "required" : ""}>
      </label>`).join("")
    : "";

  return {
    html: `<form class="rsvp-form" id="${id}">
      ${guestIntro}
      ${guest ? "" : `<label>Nombre y apellido <input required name="nombre" type="text" placeholder="Tu nombre"></label>`}
      ${guest
        ? `<label>¿Cuántos van a ir (de los ${cupo} reservados)? <select name="cantidadInvitados">${Array.from({ length: cupo }).map((_, i) => `<option value="${i + 1}" ${prevConf && Number(prevConf.cantidad) === i + 1 ? "selected" : (!prevConf && i === cupo - 1 ? "selected" : "")}>${i + 1}</option>`).join("")}</select></label>
           <div class="rsvp-guest-names">${guestNameFields}</div>`
        : (withGuests ? `<label>¿Cuántos asisten? <input name="acompaniantes" type="number" min="1" value="1"></label>` : "")}
      <label>¿Asistís? <select name="asiste"><option value="si" ${prevConf && prevConf.asiste === "no" ? "" : "selected"}>Sí, ahí estaré</option><option value="no" ${prevConf && prevConf.asiste === "no" ? "selected" : ""}>No voy a poder ir</option></select></label>
      ${withMenu ? `<label>Preferencia de menú <select name="menu"><option value="clasico">Clásico</option><option value="vegetariano">Vegetariano</option><option value="vegano">Vegano</option><option value="celiaco">Sin TACC</option></select></label>` : ""}
      <label>Mensaje (opcional) <textarea name="mensaje" placeholder="¡Les mando un beso!">${prevConf ? esc(prevConf.mensaje || "") : ""}</textarea></label>
      <button type="submit">${prevConf ? "✏️ Actualizar mi confirmación" : btnLabel}</button>
      <p class="rsvp-status" id="${id}-status"></p>
    </form>`,
    script: `
      (function(){
        var form = document.getElementById(${JSON.stringify(id)});
        var status = document.getElementById(${JSON.stringify(id + "-status")});
        var waNumber = ${JSON.stringify(waNumber)};
        var evento = ${JSON.stringify(evento)};
        var menuLabels = ${JSON.stringify(menuLabels)};
        var guestToken = ${JSON.stringify(guest ? guest.token : null)};
        var cupo = ${JSON.stringify(cupo)};
        if(!form) return;

        // En modo invitado nombrado, mostrar/ocultar los campos de nombre
        // según cuántos de los lugares reservados va a usar.
        var cantidadSel = form.querySelector('select[name="cantidadInvitados"]');
        if (cantidadSel) {
          var nameFields = form.querySelectorAll('.rsvp-guest-name-field');
          function syncNameFields(){
            var n = Number(cantidadSel.value) || 1;
            nameFields.forEach(function(f){
              var idx = Number(f.dataset.idx);
              f.style.display = idx < n ? '' : 'none';
              var input = f.querySelector('input');
              if (idx < n) { if (idx === 0) input.required = true; }
              else { input.required = false; }
            });
          }
          cantidadSel.addEventListener('change', syncNameFields);
          syncNameFields();
        }

        form.addEventListener('submit', function(e){
          e.preventDefault();
          var data = Object.fromEntries(new FormData(form).entries());

          if (guestToken) {
            var n = Number(data.cantidadInvitados) || 1;
            var nombres = [];
            for (var i = 0; i < n; i++) { nombres.push(data['invitadoNombre' + i] || ''); }
            fetch('/api/invitacion/${slug}/invitado/' + guestToken + '/rsvp', {
              method: 'POST', headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ asiste: data.asiste, cantidad: n, nombres: nombres, mensaje: data.mensaje || '' })
            }).catch(function(){});

            if (waNumber) {
              var lineas2 = ['¡Hola! Somos ' + nombres.filter(Boolean).join(', ') + '.'];
              lineas2.push(data.asiste === 'no' ? 'Lamentablemente no vamos a poder ir 😔' : ('¡Sí, ahí vamos a estar! Confirmamos ' + n + ' persona(s). 🎉'));
              if (data.mensaje) lineas2.push('"' + data.mensaje + '"');
              lineas2.push('Confirmamos nuestra asistencia para ' + evento + '.');
              window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lineas2.join('\\n')), '_blank', 'noopener');
              status.textContent = '¡Te llevamos a WhatsApp para avisarles también!';
            } else {
              status.textContent = '¡Gracias, guardamos tu confirmación!';
            }
            return;
          }

          // Guardado best-effort en segundo plano: no bloquea ni condiciona
          // el paso a WhatsApp, es solo para que quede también en el panel
          // de invitados del organizador.
          fetch('/api/invitacion/${slug}/rsvp', {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
          }).catch(function(){});

          if (waNumber) {
            var lineas = ['¡Hola! Soy ' + (data.nombre || '') + '.'];
            lineas.push(data.asiste === 'no' ? 'Lamentablemente no voy a poder ir 😔' : '¡Sí, ahí voy a estar! 🎉');
            if (data.acompaniantes && data.asiste !== 'no') lineas.push('Vamos a ser ' + data.acompaniantes + ' persona(s).');
            if (data.menu && menuLabels[data.menu] && data.asiste !== 'no') lineas.push('Preferencia de menú: ' + menuLabels[data.menu] + '.');
            if (data.mensaje) lineas.push('"' + data.mensaje + '"');
            lineas.push('Confirmo mi asistencia para ' + evento + '.');
            var texto = lineas.join('\\n');
            window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
            status.textContent = '¡Te llevamos a WhatsApp para confirmar!';
          } else {
            status.textContent = '¡Gracias, confirmamos tu respuesta!';
          }
          form.reset();
        });
      })();`,
  };
}

// ---------- Zócalo de marca ("Tarjeta creada en: TaDi" + redes + web) ----------
// Se muestra al pie de las 30 invitaciones, debajo del footer propio de cada
// diseño. Es una barra neutra (fondo blanco) con estilos 100% inline para que
// se vea igual de bien sin importar la paleta de cada tarjeta.
const TADI_INSTAGRAM = "tadi.tarjetas"; // sin @
const TADI_WEBSITE = "tadi.com.ar";

function tadiFooterWidget() {
  return `<div style="background:#fff;padding:26px 20px 24px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
    <p style="margin:0 0 12px;font-size:.68rem;letter-spacing:.6px;color:#9a9a9a;">Tarjeta creada en</p>
    <a href="https://${TADI_WEBSITE}" target="_blank" rel="noopener" style="display:inline-block;margin-bottom:12px;">
      <img src="/static/img/logo/tadi-logo-light-bg.svg" alt="TaDi" style="height:20px;width:auto;display:block;">
    </a>
    <div style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
      ${TADI_INSTAGRAM ? `<a href="https://instagram.com/${TADI_INSTAGRAM}" target="_blank" rel="noopener" style="color:#9a9a9a;font-size:.76rem;text-decoration:none;">📷 @${TADI_INSTAGRAM}</a>` : ""}
      <a href="https://${TADI_WEBSITE}" target="_blank" rel="noopener" style="color:#9a9a9a;font-size:.76rem;text-decoration:none;">🌐 ${TADI_WEBSITE}</a>
    </div>
  </div>`;
}

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Convierte una fecha "YYYY-MM-DD" en algo legible tipo "10 de abril",
// para usar en frases como "Confirmá tu asistencia antes del 10 de abril".
// Devuelve "" si la fecha no está cargada o no es válida (así el llamador
// puede simplemente no mostrar nada).
function formatFechaCorta(fechaISO) {
  if (!fechaISO) return "";
  const partes = String(fechaISO).split("-");
  if (partes.length !== 3) return "";
  const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  if (isNaN(dt.getTime())) return "";
  return `${Number(partes[2])} de ${MESES_ES[dt.getMonth()]}`;
}

// Link de "Agregar a Google Calendar" — pensado sobre todo para Save the
// Date (donde no tiene sentido pedir RSVP todavía, pero sí que la fecha
// quede agendada). No depende de red ni de nada externo: es sólo una URL,
// se arma con el formato que Google Calendar espera (fechas en UTC
// "AAAAMMDDTHHMMSSZ"). Si la fecha no es válida, devuelve "" para que el
// llamador decida no mostrar el botón.
function googleCalendarLink({ title, dateISO, time = "12:00", details = "", location = "" }) {
  if (!dateISO) return "";
  const [y, m, d] = String(dateISO).split("-").map(Number);
  const [hh, mm] = String(time || "12:00").split(":").map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1, hh || 12, mm || 0);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "",
    dates: `${fmt(start)}/${fmt(end)}`,
    details: details || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

module.exports = { esc, countdownWidget, galleryWidget, rsvpWidget, eventoLabel, formatFechaCorta, tadiFooterWidget, googleCalendarLink };
