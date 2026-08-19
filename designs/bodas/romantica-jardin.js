const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");

const id = "boda-romantica-jardin";

const sampleData = {
  novia: "Camila", novio: "Ignacio",
  fecha: "2027-10-23", horaCeremonia: "17:30", lugarCeremonia: "Capilla del Rosedal, Palermo",
  horaFiesta: "20:00", lugarFiesta: "Invernadero El Jardín Secreto, Escobar",
  direccionMapa: "https://maps.google.com/?q=El+Jardin+Secreto+Escobar",
  mensaje: "Entre flores y buenos deseos, queremos celebrar el comienzo de esta nueva etapa junto a las personas que más queremos. Nos encantaría que nos acompañen en este día tan especial.",
  dressCode: "Elegante sport, tonos pastel",
  alias: "novios.mp",
  whatsapp: "5491122334455",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
  ],
};

// --- Motivos florales SVG dibujados a mano (inline, sin dependencias externas) ---

// Ramita con flor de acuarela simple, usada como divisor y decoración de esquina.
function sprigSVG(w = 120, rotate = 0) {
  return `<svg class="sprig" width="${w}" height="${Math.round(w * 0.55)}" viewBox="0 0 120 66" style="transform:rotate(${rotate}deg)" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 60 C 30 40, 55 45, 116 10" fill="none" stroke="#7c9473" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M30 47 C 24 40, 20 34, 24 28" fill="none" stroke="#7c9473" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M46 40 C 42 32, 40 26, 46 20" fill="none" stroke="#7c9473" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M66 30 C 62 22, 62 16, 70 12" fill="none" stroke="#7c9473" stroke-width="1.3" stroke-linecap="round"/>
    <g transform="translate(96,14)">
      <circle cx="0" cy="0" r="7" fill="#e8b4bc" opacity=".85"/>
      <circle cx="8" cy="4" r="6" fill="#e8b4bc" opacity=".7"/>
      <circle cx="-2" cy="9" r="6" fill="#f3d3cf" opacity=".8"/>
      <circle cx="4" cy="-6" r="5" fill="#f3d3cf" opacity=".7"/>
      <circle cx="3" cy="2" r="3" fill="#c98a94"/>
    </g>
  </svg>`;
}

// Corona/arco floral de fondo para el hero: hojas y flores lineales estilo acuarela.
function wreathSVG() {
  return `<svg class="wreath" viewBox="0 0 800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.95">
      <path d="M0 40 C 120 90, 220 10, 340 55 C 460 100, 560 15, 680 60 C 730 78, 780 55, 800 40" fill="none" stroke="#7c9473" stroke-width="2"/>
      ${[40, 130, 230, 330, 430, 530, 630, 730].map((x, i) => `
        <g transform="translate(${x},${34 + (i % 2 === 0 ? 26 : -6)}) rotate(${(i % 2 === 0 ? -18 : 18)})">
          <path d="M0 0 C 6 -14, -4 -22, -14 -18" fill="#9db98f" opacity=".8"/>
          <path d="M0 0 C -6 10, 4 18, 14 14" fill="#7c9473" opacity=".75"/>
        </g>`).join("")}
      ${[90, 260, 480, 650].map((x, i) => `
        <g transform="translate(${x},${i % 2 === 0 ? 20 : 68})">
          <circle cx="0" cy="0" r="9" fill="#e8b4bc" opacity=".8"/>
          <circle cx="9" cy="5" r="7" fill="#f3d3cf" opacity=".75"/>
          <circle cx="-6" cy="7" r="7" fill="#e8b4bc" opacity=".7"/>
          <circle cx="2" cy="2" r="3.5" fill="#c98a94"/>
        </g>`).join("")}
    </g>
  </svg>`;
}

// Flor suelta usada como icono/adorno pequeño (rsvp, regalo, dresscode).
function blossomSVG(size = 34) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <g fill="#e8b4bc">
      <ellipse cx="20" cy="10" rx="7" ry="9" opacity=".85"/>
      <ellipse cx="20" cy="30" rx="7" ry="9" opacity=".85"/>
      <ellipse cx="10" cy="20" rx="9" ry="7" opacity=".85"/>
      <ellipse cx="30" cy="20" rx="9" ry="7" opacity=".85"/>
    </g>
    <circle cx="20" cy="20" r="5" fill="#c98a94"/>
  </svg>`;
}

// Hoja larga usada como separador de línea decorativa.
function leafDividerSVG() {
  return `<svg class="leaf-divider" width="180" height="24" viewBox="0 0 180 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12 C 60 2, 120 22, 178 12" fill="none" stroke="#7c9473" stroke-width="1.4"/>
    <g fill="#9db98f">
      <path d="M40 12 C 46 4, 54 4, 58 12 C 54 20, 46 20, 40 12 Z"/>
      <path d="M120 12 C 126 4, 134 4, 138 12 C 134 20, 126 20, 120 12 Z"/>
    </g>
    <circle cx="90" cy="12" r="4.5" fill="#e8b4bc"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "17:00"}:00` : sampleData.fecha, "cdjardin");
  const gal = galleryWidget(d.galeria, "galjardin");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --sage:#7c9473; --sage-dark:#5f7457; --blush:#e8b4bc; --cream:#faf6f0; --ink:#453f38;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--cream);color:var(--ink);font-family:'Jost',sans-serif;font-weight:300;line-height:1.6;}
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:400;color:var(--sage-dark);}
  .script{font-family:'Great Vibes',cursive;color:var(--sage-dark);}
  a{color:var(--sage-dark);}
  section{max-width:820px;margin:0 auto;padding:clamp(36px,6vw,64px) clamp(18px,5vw,24px);text-align:center;}

  /* HERO */
  .hero{position:relative;min-height:clamp(420px,80vh,640px);display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--sage);}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(94,110,80,.35),rgba(69,63,56,.55));}
  .wreath{position:absolute;top:0;left:0;width:100%;height:auto;z-index:1;opacity:.9;}
  .wreath.bottom{top:auto;bottom:0;transform:scaleY(-1);}
  .hero-content{position:relative;z-index:2;color:#fff;text-align:center;padding:0 16px;}
  .hero-content .kicker{letter-spacing:4px;text-transform:uppercase;font-size:clamp(.7rem,2vw,.85rem);opacity:.9;}
  .hero-content h1{font-size:clamp(2.4rem,7vw,4.2rem);margin:14px 0;text-shadow:0 2px 18px rgba(0,0,0,.25);color:#fff;}
  .hero-content .amp{font-family:'Great Vibes',cursive;font-size:1.1em;color:var(--blush);}
  .hero-content .fecha-linda{font-size:clamp(1rem,3vw,1.3rem);letter-spacing:2px;}

  .divider-flor{display:flex;justify-content:center;margin:6px 0 18px;}
  .sprig{max-width:100%;height:auto;}
  .leaf-divider{max-width:100%;height:auto;margin:0 auto 22px;display:block;}

  .kicker-label{letter-spacing:3px;text-transform:uppercase;font-size:.75rem;color:var(--sage-dark);opacity:.8;}
  .message{font-size:clamp(1.05rem,2.3vw,1.25rem);font-style:italic;color:var(--ink);max-width:620px;margin:0 auto;}

  .countdown{display:flex;gap:clamp(10px,4vw,28px);justify-content:center;flex-wrap:wrap;margin:26px 0 6px;}
  .countdown div{display:flex;flex-direction:column;background:#fff;border-radius:50%;width:clamp(64px,16vw,84px);height:clamp(64px,16vw,84px);align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(124,148,115,.15);}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.2rem,4vw,1.7rem);color:var(--sage-dark);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink);opacity:.7;}

  /* CRONOGRAMA */
  .timeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:clamp(14px,3vw,26px);margin-top:26px;text-align:left;}
  .timeline .card{background:#fff;border-radius:18px;padding:26px 24px;position:relative;border:1px solid #eee0d8;box-shadow:0 8px 24px rgba(124,148,115,.08);}
  .timeline .card h3{margin:0 0 10px;font-size:1.15rem;display:flex;align-items:center;gap:8px;}
  .timeline .card p{margin:0;color:var(--ink);opacity:.85;}
  .timeline .card .hora{color:var(--blush);font-weight:500;filter:brightness(.75);}
  .map-link{display:inline-block;margin-top:24px;padding:10px 22px;border:1px solid var(--sage);border-radius:30px;text-decoration:none;font-size:.85rem;letter-spacing:.5px;transition:background .2s;}
  .map-link:hover{background:var(--sage);color:#fff;}

  /* DRESS CODE + REGALO */
  .pill-row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:18px;}
  .pill{background:#fff;border:1px solid #eee0d8;border-radius:16px;padding:22px 26px;max-width:320px;text-align:center;box-shadow:0 8px 24px rgba(124,148,115,.08);}
  .pill h3{margin:8px 0 6px;font-size:1.05rem;}
  .pill p{margin:0;opacity:.85;font-size:.95rem;}
  .alias-box{display:inline-block;margin-top:8px;background:var(--cream);border:1px dashed var(--sage);border-radius:10px;padding:8px 16px;font-weight:500;color:var(--sage-dark);letter-spacing:.5px;}

  /* GALERÍA */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:22px;}
  .gallery img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:14px;cursor:pointer;box-shadow:0 6px 16px rgba(124,148,115,.15);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(69,63,56,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:24px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--sage-dark);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',sans-serif;padding:11px 12px;border:1px solid #e2d6cb;border-radius:10px;margin-top:5px;width:100%;background:#fff;}
  .rsvp-form button{background:var(--sage);color:#fff;border:0;padding:13px;border-radius:30px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-size:.85rem;transition:background .2s;}
  .rsvp-form button:hover{background:var(--sage-dark);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--sage-dark);text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:var(--sage-dark);font-weight:500;}

  footer{text-align:center;padding:44px 20px 36px;font-size:.85rem;color:var(--sage-dark);background:linear-gradient(180deg,transparent,rgba(124,148,115,.08));}
  footer .script{font-size:1.6rem;display:block;margin-bottom:8px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    ${wreathSVG()}
    <div class="hero-content">
      <div class="kicker">Nos casamos</div>
      <h1>${esc(d.novia)} <span class="amp">&amp;</span> ${esc(d.novio)}</h1>
      <div class="fecha-linda">${fechaLarga(d.fecha)}</div>
    </div>
  </div>

  <section>
    <div class="divider-flor">${sprigSVG(140, 0)}</div>
    <p class="kicker-label">Cuenta regresiva</p>
    <h2>Falta muy poquito</h2>
    ${cd.html}
  </section>

  <section>
    ${leafDividerSVG()}
    <p class="message">${esc(d.mensaje)}</p>
  </section>

  <section>
    <div class="divider-flor">${sprigSVG(140, 180)}</div>
    <p class="kicker-label">Agenda del día</p>
    <h2>Cronograma</h2>
    <div class="timeline">
      <div class="card">
        <h3>${blossomSVG(22)} Ceremonia</h3>
        <p class="hora">${esc(d.horaCeremonia)} hs</p>
        <p>${esc(d.lugarCeremonia)}</p>
      </div>
      <div class="card">
        <h3>${blossomSVG(22)} Fiesta</h3>
        <p class="hora">${esc(d.horaFiesta)} hs</p>
        <p>${esc(d.lugarFiesta)}</p>
      </div>
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
  </section>

  <section>
    ${leafDividerSVG()}
    <p class="kicker-label">Detalles</p>
    <div class="pill-row">
      <div class="pill">
        ${blossomSVG(30)}
        <h3>Código de vestimenta</h3>
        <p>${esc(d.dressCode)}</p>
      </div>
      <div class="pill">
        ${blossomSVG(30)}
        <h3>¿Un regalo?</h3>
        <p>Si quieren hacernos un regalo, lo más lindo es un aporte para nuestra nueva vida juntos.</p>
        <div class="alias-box">Alias: ${esc(d.alias)}</div>
      </div>
    </div>
  </section>

  <section>
    <div class="divider-flor">${sprigSVG(140, 0)}</div>
    <p class="kicker-label">Recuerdos</p>
    <h2>Nuestra historia en fotos</h2>
    ${gal.html}
  </section>

  <section>
    ${leafDividerSVG()}
    <p class="kicker-label">Por favor confirmá</p>
    <h2>Confirmá tu asistencia</h2>
    ${rsvp.html}
  </section>

  <footer>
    <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
    Con todo nuestro cariño, gracias por ser parte de este día.
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

function fechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, dd] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd} de ${meses[m - 1]} de ${y}`;
}

module.exports = {
  id, category: "bodas", name: "Romántica Jardín",
  summary: "Flores acuareladas dibujadas a mano, tonos sage y blush, aire de invernadero — perfecta para una boda al aire libre.",
  accent: "#7c9473", schema: bodaSchema, sampleData, render,
};
