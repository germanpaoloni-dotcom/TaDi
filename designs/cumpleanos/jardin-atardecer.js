const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-jardin-atardecer";

const sampleData = {
  nombre: "Male",
  edad: "40",
  fecha: "2027-03-13",
  hora: "19:30",
  lugar: "Quinta Los Ceibos, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Quinta+Los+Ceibos+San+Isidro",
  mensaje: "Quiero festejar rodeada de la gente que quiero, con buena luz, buena música y algo rico en la mano. Nada de formalidades — solo ganas de pasarla lindo al aire libre.",
  dressCode: "Colores tierra, calzado cómodo — es al aire libre",
  whatsapp: "5491100000033",
  fechaLimiteRSVP: "2027-03-01",
  coverImage: "https://images.unsplash.com/photo-1470753323753-3f8091bb0231?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80",
    "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80",
    "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
  ],
};

// --- Ilustraciones lineales finas (ramitas, hojas y flores dibujadas a mano) ---
// Solo trazos (stroke), sin rellenos sólidos, para un aire delicado de
// acuarela/línea, en los tonos terracota (accent) y salvia (accent2).

function twigSVG(w = 140, rotate = 0, color = "#C97B5A") {
  return `<svg class="twig" width="${w}" height="${Math.round(w * 0.55)}" viewBox="0 0 140 77" style="transform:rotate(${rotate}deg)" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 70 C 40 55, 60 60, 136 8" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M26 63 C 19 54, 21 45, 32 41" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round"/>
    <path d="M52 51 C 45 41, 47 32, 58 28" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round"/>
    <path d="M78 37 C 71 27, 73 18, 84 14" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round"/>
    <circle cx="118" cy="18" r="3.2" fill="none" stroke="${color}" stroke-width="1"/>
    <circle cx="127" cy="13" r="2.1" fill="none" stroke="${color}" stroke-width="1"/>
  </svg>`;
}

// Flor de línea de cinco pétalos, usada como acento suelto y como ícono.
function blossomLineSVG(size = 28, color = "#C97B5A") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="none" stroke="${color}" stroke-width="1.1">
      <ellipse cx="20" cy="11" rx="5.4" ry="8" transform="rotate(0 20 20)"/>
      <ellipse cx="20" cy="11" rx="5.4" ry="8" transform="rotate(72 20 20)"/>
      <ellipse cx="20" cy="11" rx="5.4" ry="8" transform="rotate(144 20 20)"/>
      <ellipse cx="20" cy="11" rx="5.4" ry="8" transform="rotate(216 20 20)"/>
      <ellipse cx="20" cy="11" rx="5.4" ry="8" transform="rotate(288 20 20)"/>
      <circle cx="20" cy="20" r="2.6"/>
    </g>
  </svg>`;
}

// Divisor sinuoso fino con una florcita al centro, para separar secciones.
function dividerSVG(leafColor = "#7C8F6E", dotColor = "#C97B5A") {
  return `<svg class="divider" width="170" height="20" viewBox="0 0 170 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 10 C 40 -1, 60 20, 84 9" fill="none" stroke="${leafColor}" stroke-width="1"/>
    <path d="M86 9 C 110 20, 130 -1, 168 10" fill="none" stroke="${leafColor}" stroke-width="1"/>
    <circle cx="85" cy="9.5" r="3" fill="${dotColor}"/>
  </svg>`;
}

// Filete de esquina, una sola curva fina que hereda color por currentColor.
function cornerLineSVG() {
  return `<svg class="corner-line" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 4C56 4 2 48 36 70C66 88 24 110 62 136" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;
}

// Copa de cóctel dibujada en línea fina, para la sección "Para brindar".
function coupeSVG(size = 30, color = "#C97B5A") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 6 C 8 19, 20 24, 20 24 C 20 24, 32 19, 32 6 Z" fill="none" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/>
    <line x1="20" y1="24" x2="20" y2="39" stroke="${color}" stroke-width="1.3"/>
    <line x1="11" y1="41.5" x2="29" y2="41.5" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M13 10 C 16 13, 24 13, 27 10" fill="none" stroke="${color}" stroke-width=".9" opacity=".65"/>
  </svg>`;
}

// Fecha larga en español, ej. "13 de marzo de 2027".
function fechaLarga(fechaISO) {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  if (!fechaISO) return "";
  const [y, m, dd] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd} de ${meses[m - 1]} de ${y}`;
}

// Contenido fijo del diseño: una cartita de cócteles de jardín, no viene
// del schema — es parte de la ambientación de "Jardín al Atardecer".
const TRAGOS = [
  { nombre: "Spritz de Flor de Saúco", desc: "Aperol, prosecco, flor de saúco y una torsión de limón." },
  { nombre: "Limonada Rosada con Romero", desc: "Limonada casera, jarabe de romero y un toque de granadina." },
  { nombre: "Gin Tonic de Pomelo y Enebro", desc: "Gin, tónica premium, pomelo rosado y bayas de enebro." },
  { nombre: "Sangría Blanca de Durazno", desc: "Vino blanco, durazno fresco, canela y un hilo de miel." },
];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#C97B5A");
  const accent2 = "#7C8F6E";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "19:00"}:00` : sampleData.fecha, "cdjardinatard");
  const gal = galleryWidget(d.galeria, "galjardinatard");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "cumpleanos", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const tituloPagina = d.edad ? `${d.nombre} cumple ${d.edad}` : `Cumpleaños de ${d.nombre}`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(tituloPagina)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --terracota:${accent}; --salvia:${accent2};
    --dorado:#D9A45C; --dorado-suave:color-mix(in srgb, #D9A45C, white 30%);
    --cream:#FAF2E7; --paper:#FFFCF6; --ink:#4A3B2F; --ink-soft:#7A6A58;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--cream);color:var(--ink);font-family:'Jost',Arial,sans-serif;font-weight:400;font-size:1.02rem;line-height:1.65;}
  h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;color:var(--ink);margin:0;}
  a{color:var(--terracota);}
  section{max-width:760px;margin:0 auto;padding:clamp(36px,6vw,64px) clamp(18px,5vw,26px);text-align:center;}

  .eyebrow{letter-spacing:3.5px;text-transform:uppercase;font-size:.72rem;color:var(--salvia);font-weight:600;}
  .eyebrow.on-dark{color:var(--dorado-suave);}
  h2.section-title{font-size:clamp(1.5rem,4vw,2.15rem);font-style:italic;margin:6px 0 22px;}
  .divider-row{display:flex;justify-content:center;margin:6px 0 2px;transform-origin:50% 100%;animation:gardenSway 10s ease-in-out infinite;}
  .rsvp-section .divider-row{animation-duration:12s;animation-delay:1.2s;}
  .twig{max-width:100%;height:auto;}

  /* HERO */
  .hero{position:relative;overflow:hidden;text-align:center;padding:clamp(50px,9vw,88px) 18px clamp(60px,9vw,96px);
    background-image:linear-gradient(160deg, rgba(217,164,92,.55), rgba(201,123,90,.62) 45%, rgba(124,143,110,.7) 100%), url('${esc(d.coverImage)}');
    background-size:cover;background-position:center;}
  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;}
  .corner-line{position:absolute;width:56px;height:64px;color:#fff;opacity:.55;pointer-events:none;z-index:1;}
  @media(min-width:480px){.corner-line{width:78px;height:90px;}}
  .corner-line.cs-tl{top:0;left:0;}
  .corner-line.cs-br{bottom:0;right:0;transform:rotate(180deg);}
  .hero .eyebrow{color:#fff;opacity:.92;}
  .hero h1{font-style:italic;font-size:clamp(2.3rem,8vw,3.8rem);color:#fff;text-shadow:0 3px 18px rgba(60,30,15,.35);margin:10px 0;}
  .hero .edad-badge{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;border:1.5px solid #fff;color:#fff;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:1.5rem;margin:6px 0 14px;background:rgba(255,255,255,.12);}
  .hero .fecha-linda{margin-top:8px;font-size:clamp(.95rem,2.6vw,1.1rem);letter-spacing:1.5px;color:#fff;text-transform:uppercase;opacity:.95;}
  .hero .lugar-linda{margin-top:4px;font-size:.92rem;color:#fff;opacity:.85;}

  /* CITA / MENSAJE */
  .paper-card{background:var(--paper);max-width:560px;margin:0 auto;padding:30px clamp(20px,5vw,40px);border-radius:6px;box-shadow:0 14px 30px rgba(74,59,47,.1);}
  .message{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(1.1rem,2.4vw,1.35rem);color:var(--ink);margin:0;}
  .message::before,.message::after{content:'"';color:var(--terracota);}

  /* Tarjeta clara con borde suave para countdown / datos */
  .soft-card{position:relative;background:var(--paper);border:1px solid color-mix(in srgb, var(--salvia) 25%, transparent);border-radius:20px;padding:clamp(26px,5vw,42px) clamp(20px,5vw,34px);box-shadow:0 14px 30px rgba(74,59,47,.08);text-align:left;}
  .soft-card h3{color:var(--ink);}

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,3vw,18px);justify-content:center;flex-wrap:wrap;margin:6px 0 0;}
  .countdown div{display:flex;flex-direction:column;background:var(--cream);border:1px solid color-mix(in srgb, var(--terracota) 30%, transparent);border-radius:14px;width:clamp(62px,16vw,84px);height:clamp(62px,16vw,84px);align-items:center;justify-content:center;}
  .cd-num{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.2rem,4vw,1.65rem);color:var(--terracota);font-weight:600;}
  .cd-label{font-size:.58rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--ink-soft);margin-top:3px;}

  /* DATOS */
  .info-row{display:flex;flex-wrap:wrap;gap:16px 26px;justify-content:center;text-align:left;}
  .info-row .item{display:flex;align-items:flex-start;gap:10px;max-width:280px;}
  .info-row .item h3{font-size:1.1rem;font-style:italic;margin-bottom:3px;}
  .info-row .item p{margin:0;color:var(--ink-soft);font-size:.95rem;}
  .map-link{display:inline-block;margin-top:24px;padding:11px 26px;border:1px solid var(--terracota);color:var(--terracota);border-radius:30px;text-decoration:none;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;transition:background .2s,color .2s;}
  .map-link:hover{background:var(--terracota);color:#fff;}
  .dresscode-pill{display:inline-block;margin-top:20px;background:var(--cream);border:1px dashed var(--salvia);border-radius:14px;padding:12px 20px;color:var(--ink);font-size:.9rem;}
  .dresscode-pill strong{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:1.05rem;color:var(--salvia);margin-bottom:3px;}

  /* PARA BRINDAR */
  .tragos-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:26px;text-align:left;}
  .trago-card{background:var(--paper);border-radius:16px;padding:22px 20px;box-shadow:0 12px 26px rgba(74,59,47,.09);border-top:2px solid var(--terracota);}
  .trago-card h3{font-size:1.1rem;font-style:italic;margin:10px 0 8px;}
  .trago-card p{margin:0;font-size:.88rem;color:var(--ink-soft);}

  /* GALERÍA */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:24px;}
  .gallery-item{position:relative;}
  .gallery img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:8px;cursor:pointer;border:3px solid var(--paper);box-shadow:0 10px 22px rgba(74,59,47,.14);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(42,28,18,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:8px;border:4px solid var(--dorado);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-deadline{margin:10px 0 0;font-size:.78rem;letter-spacing:1.4px;text-transform:uppercase;opacity:.85;color:var(--salvia);}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:26px auto 0;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--ink-soft);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',Arial,sans-serif;font-size:1rem;padding:11px 12px;border:1px solid #e2d3bf;border-radius:8px;margin-top:5px;width:100%;background:var(--paper);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:2px solid var(--terracota);border-color:var(--terracota);}
  .rsvp-form button{background:var(--terracota);color:#fff;border:0;padding:14px;border-radius:30px;letter-spacing:1.4px;text-transform:uppercase;cursor:pointer;font-size:.8rem;font-weight:600;transition:background .2s;}
  .rsvp-form button:hover{background:var(--salvia);}
  .rsvp-whatsapp{display:block;margin-top:14px;font-size:.86rem;color:var(--salvia);text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:var(--terracota);font-weight:600;margin-top:10px;}

  footer.despedida{position:relative;text-align:center;padding:52px 20px 40px;color:#fff;overflow:hidden;
    background-image:linear-gradient(160deg, rgba(217,164,92,.85), rgba(201,123,90,.9) 45%, rgba(124,143,110,.95) 100%), url('${esc(d.coverImage)}');
    background-size:cover;background-position:center;}
  footer.despedida .inner{position:relative;z-index:1;}
  footer.despedida .script{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(1.8rem,5vw,2.4rem);display:block;margin-bottom:8px;}
  footer.despedida p{margin:0;font-size:.9rem;opacity:.9;}

  /* Brisa de jardín: leve balanceo en los divisores de ramitas */
  @keyframes gardenSway{0%,100%{transform:rotate(-1.6deg);}50%{transform:rotate(1.6deg);}}
  /* Resplandor de atardecer, muy sutil, detrás del contenido del hero */
  @keyframes duskGlow{0%,100%{opacity:.55;}50%{opacity:.85;}}
  .hero::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;
    background:radial-gradient(ellipse at 50% 105%, rgba(255,185,120,.4), transparent 70%);
    animation:duskGlow 11s ease-in-out infinite;}
  @media (prefers-reduced-motion: reduce){
    .divider-row,.rsvp-section .divider-row{animation:none !important;}
    .hero::after{animation:none !important;opacity:.7;}
  }
</style></head>
<body>

  <div class="hero">
    ${cornerLineSVG().replace('class="corner-line"', 'class="corner-line cs-tl"')}
    ${cornerLineSVG().replace('class="corner-line"', 'class="corner-line cs-br"')}
    <div class="hero-inner">
      <div class="eyebrow">Nos vemos al atardecer</div>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="edad-badge">${esc(d.edad)}</div>` : ""}
      ${d.fecha ? `<div class="fecha-linda">${fechaLarga(d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</div>` : ""}
      ${d.lugar ? `<div class="lugar-linda">${esc(d.lugar)}</div>` : ""}
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="divider-row">${dividerSVG(accent2, accent)}</div>
    <div class="paper-card">
      <p class="message">${esc(d.mensaje)}</p>
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Cuenta regresiva</p>
    <h2 class="section-title">Faltan</h2>
    <div class="soft-card" style="display:flex;justify-content:center;">
      ${cd.html}
    </div>
  </section>

  ${(d.fecha || d.hora || d.lugar || d.direccionMapa || d.dressCode) ? `<section>
    <div class="divider-row">${twigSVG(120, -8, accent)}</div>
    <p class="eyebrow">Los datos</p>
    <h2 class="section-title">¿Cuándo y dónde?</h2>
    <div class="soft-card">
      <div class="info-row">
        ${(d.fecha || d.hora) ? `<div class="item">${blossomLineSVG(24, accent)}<div><h3>Fecha y hora</h3><p>${fechaLarga(d.fecha)}${d.hora ? ` — ${esc(d.hora)} hs` : ""}</p></div></div>` : ""}
        ${d.lugar ? `<div class="item">${blossomLineSVG(24, accent2)}<div><h3>Lugar</h3><p>${esc(d.lugar)}</p></div></div>` : ""}
      </div>
      ${d.direccionMapa ? `<div style="text-align:center;"><a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a></div>` : ""}
      ${d.dressCode ? `<div style="text-align:center;"><div class="dresscode-pill"><strong>Código de vestimenta</strong>${esc(d.dressCode)}</div></div>` : ""}
    </div>
  </section>` : ""}

  <section>
    <div class="divider-row">${dividerSVG(accent2, accent)}</div>
    <p class="eyebrow">Hora mágica</p>
    <h2 class="section-title">Para brindar</h2>
    <p style="color:var(--ink-soft);margin:-8px 0 0;">Una selección de tragos de jardín para acompañar la puesta de sol.</p>
    <div class="tragos-grid">
      ${TRAGOS.map((t) => `<div class="trago-card">${coupeSVG(28, accent)}<h3>${esc(t.nombre)}</h3><p>${esc(t.desc)}</p></div>`).join("")}
    </div>
  </section>

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Momentos</p>
    <h2 class="section-title">Galería</h2>
    ${gal.html}
  </section>` : ""}

  <section class="rsvp-section">
    <div class="divider-row">${twigSVG(120, 172, accent2)}</div>
    <p class="eyebrow">Por favor confirmá</p>
    <h2 class="section-title">Confirmar asistencia</h2>
    ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer class="despedida">
    <div class="inner">
      <span class="script">${esc(d.nombre)}</span>
      <p>Gracias por venir a brindar con nosotros al atardecer.</p>
    </div>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

// Preview en miniatura para la grilla del catálogo: degradé cálido tipo
// atardecer con una ramita fina en un costado y el nombre del diseño en
// itálica serif (fuente de sistema, ya que Google Fonts no carga en el
// swatch). Solo estilos inline, sin <style> ni var().
function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:linear-gradient(160deg, #D9A45C 0%, ${d.accent} 55%, ${d.accent2} 100%);">
    <svg style="position:absolute;bottom:-6px;left:-8px;width:120px;height:66px;opacity:.5;" viewBox="0 0 140 77" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 70 C 40 55, 60 60, 136 8" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M52 51 C 45 41, 47 32, 58 28" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M78 37 C 71 27, 73 18, 84 14" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
    <div style="position:relative;z-index:1;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:1.15rem;color:#fff;letter-spacing:.3px;text-align:center;padding:0 18px;text-shadow:0 2px 10px rgba(60,30,15,.3);">${esc(d.name)}</div>
    <div style="position:relative;width:40px;height:1px;background:#fff;opacity:.8;"></div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Jardín al Atardecer",
  summary: "Cóctel de jardín en la hora dorada: ramitas y flores dibujadas en línea fina, degradé de atardecer, y una cartita de tragos para brindar al aire libre.",
  accent: "#C97B5A", accent2: "#7C8F6E", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
