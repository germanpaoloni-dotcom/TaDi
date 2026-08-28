const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { navidadSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "nav-luces-festivas";

const sampleData = {
  nombre: "Fiesta de Fin de Año — Amigos del Barrio",
  fecha: "2027-12-18",
  hora: "21:00",
  lugar: "Quincho de Fede, Villa Ballester",
  direccionMapa: "https://maps.google.com/?q=Villa+Ballester+Buenos+Aires",
  mensaje: "Cerramos el año como se debe: asado, luces por todos lados, buena música y la excusa perfecta para juntarnos antes de que termine diciembre. Traé ganas de bailar y un regalito para el amigo invisible 🎁",
  amigoInvisible: "Sorteamos amigo invisible en la fiesta — tope $8.000, se abre a las 23 hs. ¡No te olvides el regalo!",
  whatsapp: "5491100000038",
  fechaLimiteRSVP: "2027-12-10",
  coverImage: "https://images.unsplash.com/photo-1768464706260-e355a3d86803?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&q=80",
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80",
    "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80",
    "https://images.unsplash.com/photo-1481788298890-a7f2b5c66d6c?w=800&q=80",
  ],
};

const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Colores de la guirnalda: se repiten en ciclo a lo largo de toda la tira,
// para que se vea como una guirnalda real de bombitas multicolor.
const GARLAND_COLORS = ["#e0374a", "#f0c249", "#1f8a56", "#4fb0e0"];

// Ícono de una bombita de luz (teardrop con brillo interno), en currentColor.
// El color real, el delay y la duración del parpadeo se fijan por afuera
// vía variables CSS en el <span> que la envuelve.
const BULB_ICON = `<svg viewBox="0 0 24 34" width="18" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="12" y1="0" x2="12" y2="7" stroke="#1a2942" stroke-width="2"/>
  <path d="M12 7 C6.5 7 4.3 12.5 6.2 18 C7.7 22.2 10 26.5 12 30.5 C14 26.5 16.3 22.2 17.8 18 C19.7 12.5 17.5 7 12 7 Z" fill="currentColor"/>
  <ellipse cx="9.6" cy="14" rx="1.8" ry="2.8" fill="#fff" opacity=".4"/>
</svg>`;

// Traza el cable de la guirnalda como una serie de arcos "colgados" (sag)
// entre postes imaginarios repartidos a lo ancho del hero.
function garlandWireSVG(swags = 6) {
  const w = 1000, h = 120, topY = 12, dipY = 96;
  let d = "";
  for (let i = 0; i < swags; i++) {
    const x0 = (i / swags) * w;
    const x1 = ((i + 1) / swags) * w;
    const mx = (x0 + x1) / 2;
    if (i === 0) d += `M ${x0.toFixed(1)},${topY} `;
    d += `Q ${mx.toFixed(1)},${dipY} ${x1.toFixed(1)},${topY} `;
  }
  return `<svg class="garland-wire" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="${d}" fill="none" stroke="#0a1526" stroke-width="3" opacity=".65"/></svg>`;
}

// Reparte "count" bombitas siguiendo la misma curva del cable (misma
// cantidad de arcos "swags"), calculando su posición Y sobre la curva de
// Bézier cuadrática para que parezcan colgadas del cable real.
function garlandBulbs(count = 20, swags = 6) {
  const h = 120, topY = 12, dipY = 96;
  let out = "";
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const swagPos = t * swags;
    const localT = Math.min(1, Math.max(0, swagPos - Math.floor(swagPos)));
    const y = (1 - localT) * (1 - localT) * topY + 2 * (1 - localT) * localT * dipY + localT * localT * topY;
    const color = GARLAND_COLORS[i % GARLAND_COLORS.length];
    const delay = ((i * 0.43) % 3.1).toFixed(2);
    const dur = (1.7 + (i % 4) * 0.42).toFixed(2);
    out += `<span class="bulb" style="left:${(t * 100).toFixed(2)}%;top:${((y / h) * 100).toFixed(2)}%;--bulb-color:${color};--bulb-delay:${delay}s;--bulb-dur:${dur}s;">${BULB_ICON}</span>`;
  }
  return out;
}

// Estrella de 4 puntas, para el cielo nocturno titilando.
function starSVG(size, color) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:${color};">
    <path d="M20 0 C20 10 22 18 24 20 C22 22 20 30 20 40 C20 30 18 22 16 20 C18 18 20 10 20 0 Z" fill="currentColor"/>
    <path d="M0 20 C10 20 18 18 20 16 C22 18 30 20 40 20 C30 20 22 22 20 24 C18 22 10 20 0 20 Z" fill="currentColor" opacity=".85"/>
  </svg>`;
}

function starsField() {
  const specs = [
    { top: "6%", left: "8%", size: 14 }, { top: "12%", left: "88%", size: 10 },
    { top: "22%", left: "18%", size: 8 }, { top: "9%", left: "48%", size: 11 },
    { top: "28%", left: "72%", size: 9 }, { top: "16%", left: "62%", size: 7 },
    { top: "24%", left: "35%", size: 8 }, { top: "5%", left: "78%", size: 9 },
  ];
  return specs.map((s, i) => `<span class="twinkle-star" style="top:${s.top};left:${s.left};animation-delay:${(i * 0.55).toFixed(2)}s;">${starSVG(s.size, "#fff")}</span>`).join("");
}

// Nieve muy sutil: puntitos cayendo despacio, con posiciones/tiempos
// generados con una semilla simple (determinística entre renders).
function snowDots(count = 12) {
  let s = 17;
  let out = "";
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const left = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const dur = 9 + (s / 233280) * 9;
    s = (s * 9301 + 49297) % 233280;
    const delay = (s / 233280) * 10;
    s = (s * 9301 + 49297) % 233280;
    const size = 2.5 + (s / 233280) * 3;
    out += `<span class="snow-dot" style="left:${left.toFixed(2)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:-${delay.toFixed(1)}s;"></span>`;
  }
  return out;
}

// Pilita de regalos apilados, dibujada a mano, en tres colores de acento.
function giftsSVG(c1, c2, c3) {
  return `<svg class="gifts-svg" viewBox="0 0 140 100" width="100" height="72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="52" width="60" height="42" rx="3" fill="${c1}"/>
    <rect x="10" y="52" width="60" height="10" fill="${c3}" opacity=".85"/>
    <rect x="36" y="52" width="8" height="42" fill="${c3}" opacity=".85"/>
    <rect x="66" y="34" width="46" height="60" rx="3" fill="${c2}"/>
    <rect x="66" y="34" width="46" height="9" fill="${c3}" opacity=".85"/>
    <rect x="85" y="34" width="8" height="60" fill="${c3}" opacity=".85"/>
    <path d="M85 34 C78 26 78 18 85 18 C92 18 92 26 85 34 Z" fill="${c3}" opacity=".85"/>
    <path d="M93 34 C100 26 100 18 93 18 C86 18 86 26 93 34 Z" fill="${c3}" opacity=".85"/>
    <rect x="18" y="18" width="34" height="34" rx="3" fill="${c3}"/>
    <rect x="18" y="18" width="34" height="7" fill="${c1}" opacity=".9"/>
    <rect x="31" y="18" width="7" height="34" fill="${c1}" opacity=".9"/>
  </svg>`;
}

// Gorro navideño simple, en un solo color (currentColor).
function santaHatSVG(size, color) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:${color};">
    <path d="M8 46 C8 46 6 20 26 8 C40 0 54 12 52 26 C40 22 16 28 8 46 Z" fill="currentColor"/>
    <rect x="4" y="44" width="50" height="10" rx="5" fill="#fff"/>
    <circle cx="53" cy="14" r="7" fill="#fff"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#e0374a");
  const accent2 = "#0c1930";
  const gold = "#f0c249";
  const green = "#1f8a56";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-luces");
  const gal = galleryWidget(d.galeria, "gal-luces");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "navidad", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let fechaLarga = "";
  if (d.fecha) {
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    fechaLarga = y && m && day ? `${day} de ${MESES_LARGO[m - 1]} de ${y}` : d.fecha;
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Navidad: ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:${accent2};
    --accent:${accent};
    --gold:${gold};
    --green:${green};
    --ink:#fbf6ec;
    --ink-soft:#c7cfe2;
    --glass-bg:rgba(20,32,58,.55);
    --glass-border:rgba(255,255,255,.14);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Nunito',Arial,sans-serif;font-weight:400;}
  img{max-width:100%;}
  h1,h2,.brand{font-family:'Fredoka',Arial,sans-serif;}
  a{color:inherit;}

  @media (prefers-reduced-motion: reduce){
    *{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important;}
  }

  .glass{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:18px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}

  /* ===== HERO ===== */
  .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;overflow:hidden;
    background:radial-gradient(ellipse at 50% 0%, #16294a 0%, #0c1930 55%, #070f1e 100%);
    padding:0 20px 48px;}
  .stars{position:absolute;inset:0;z-index:0;opacity:.75;
    background-image:radial-gradient(1.4px 1.4px at 10% 15%,#fff,transparent),
      radial-gradient(1.2px 1.2px at 26% 8%,#fff,transparent),
      radial-gradient(1px 1px at 42% 20%,#fff,transparent),
      radial-gradient(1.4px 1.4px at 58% 12%,#fff,transparent),
      radial-gradient(1px 1px at 74% 6%,#fff,transparent),
      radial-gradient(1.4px 1.4px at 90% 18%,#fff,transparent),
      radial-gradient(1px 1px at 18% 28%,#fff,transparent),
      radial-gradient(1px 1px at 66% 26%,#fff,transparent);}
  .twinkle-star{position:absolute;pointer-events:none;z-index:1;animation:twinkle 3s ease-in-out infinite;filter:drop-shadow(0 0 4px rgba(255,255,255,.5));}
  @keyframes twinkle{0%,100%{opacity:.35;transform:scale(.85);}50%{opacity:1;transform:scale(1.1);}}

  .snow{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
  .snow-dot{position:absolute;top:-6%;border-radius:50%;background:#fff;opacity:.5;animation:snowfall linear infinite;}
  @keyframes snowfall{0%{transform:translateY(0) translateX(0);opacity:0;}8%{opacity:.55;}92%{opacity:.5;}100%{transform:translateY(115vh) translateX(14px);opacity:0;}}

  .garland{position:relative;z-index:2;height:70px;margin-top:0;}
  .garland-wire{position:absolute;inset:0;width:100%;height:100%;}
  .bulb{position:absolute;transform:translate(-50%,-10%);}
  .bulb svg{display:block;color:var(--bulb-color);animation:bulb-blink var(--bulb-dur,2.2s) ease-in-out infinite;animation-delay:var(--bulb-delay,0s);filter:drop-shadow(0 0 3px var(--bulb-color));}
  @keyframes bulb-blink{
    0%,100%{opacity:.5;filter:drop-shadow(0 0 2px var(--bulb-color));}
    50%{opacity:1;filter:drop-shadow(0 0 5px var(--bulb-color)) drop-shadow(0 0 14px var(--bulb-color));}
  }

  .hero-glow{position:absolute;left:50%;top:34%;width:75vw;height:75vw;max-width:620px;max-height:620px;transform:translateX(-50%);
    background:radial-gradient(circle,rgba(224,55,74,.16) 0%,transparent 65%);pointer-events:none;z-index:1;}
  .hero-content{position:relative;z-index:2;max-width:640px;margin:24px auto 0;text-align:center;width:100%;flex:1;display:flex;flex-direction:column;justify-content:center;}
  .eyebrow{letter-spacing:.32em;text-transform:uppercase;font-size:clamp(.6rem,1.8vw,.78rem);color:var(--gold);margin:0 0 14px;font-weight:600;}
  .hero-content h1{font-size:clamp(2.3rem,8vw,3.6rem);line-height:1.08;margin:0;color:var(--ink);font-weight:700;
    text-shadow:0 0 30px rgba(224,55,74,.35);}
  .hero-info{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px;}
  .hero-info span{display:inline-flex;align-items:center;gap:6px;background:var(--glass-bg);border:1px solid var(--glass-border);
    border-radius:999px;padding:8px 16px;font-size:.82rem;color:var(--ink-soft);backdrop-filter:blur(10px);}
  .hero-mensaje{margin:22px auto 0;max-width:460px;color:var(--ink-soft);font-size:clamp(.94rem,2.2vw,1.05rem);line-height:1.7;}

  section{max-width:800px;margin:0 auto;padding:56px 22px;text-align:center;position:relative;}
  h2{font-family:'Fredoka',Arial,sans-serif;font-size:clamp(1.6rem,5.2vw,2.2rem);margin:0 0 28px;color:var(--ink);font-weight:600;}
  h2 span{color:var(--accent);}

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,3.5vw,18px);justify-content:center;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:68px;padding:15px 8px;border-radius:14px;
    background:var(--glass-bg);border:1px solid var(--glass-border);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}
  .cd-num{font-family:'Fredoka',Arial,sans-serif;font-size:clamp(1.7rem,4.6vw,2.3rem);color:var(--gold);font-weight:600;}
  .cd-label{font-size:.64rem;text-transform:uppercase;letter-spacing:1.8px;color:var(--ink-soft);margin-top:4px;}

  /* DATOS */
  .datos-card{padding:32px 26px;text-align:left;display:flex;flex-direction:column;gap:18px;}
  .dato-row{display:flex;gap:14px;align-items:flex-start;}
  .dato-ico{flex:0 0 auto;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;
    background:rgba(224,55,74,.16);color:var(--accent);font-size:1.05rem;}
  .dato-label{font-size:.66rem;text-transform:uppercase;letter-spacing:1.8px;color:var(--accent);margin:0 0 4px;}
  .dato-value{font-size:clamp(1rem,2.6vw,1.1rem);color:var(--ink);margin:0;line-height:1.4;}
  .maplink{display:inline-block;margin-top:6px;color:var(--accent2);background:var(--gold);text-decoration:none;font-weight:700;
    padding:9px 20px;border-radius:999px;font-size:.8rem;letter-spacing:.4px;}

  /* AMIGO INVISIBLE */
  .amigo-card{padding:32px 26px;display:flex;flex-direction:column;align-items:center;gap:14px;}
  .amigo-card p{margin:0;color:var(--ink-soft);font-size:1rem;line-height:1.7;max-width:480px;}
  .amigo-title{display:flex;align-items:center;justify-content:center;gap:10px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:12px;cursor:pointer;border:1px solid var(--glass-border);transition:transform .2s ease;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(4,8,18,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--gold);border-radius:10px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold);font-size:2.2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.74rem;text-transform:uppercase;letter-spacing:1.4px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Nunito',inherit;padding:11px;border:1px solid var(--glass-border);
    border-radius:10px;margin-top:5px;width:100%;background:rgba(20,32,58,.7);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--accent);}
  .rsvp-form button{background:var(--accent);color:#fff;border:0;padding:14px;border-radius:999px;letter-spacing:1px;
    text-transform:uppercase;cursor:pointer;font-size:.88rem;font-weight:700;}
  .rsvp-form button:hover{filter:brightness(1.08);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--green);text-align:center;text-decoration:none;font-weight:600;}
  .rsvp-status{text-align:center;color:var(--gold);font-weight:bold;}

  .gifts-svg{display:block;margin:0 auto 6px;}

  footer{text-align:center;padding:44px 22px 52px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid var(--glass-border);}
  footer .signoff{font-family:'Fredoka',Arial,sans-serif;color:var(--gold);letter-spacing:.5px;font-size:1.05rem;margin:0 0 6px;}

  @media (max-width:480px){
    .garland{height:56px;}
    .bulb svg{width:14px;height:20px;}
    section{padding:44px 16px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="stars"></div>
    ${starsField()}
    <div class="hero-glow"></div>
    <div class="snow">${snowDots(12)}</div>
    <div class="garland">
      ${garlandWireSVG(6)}
      ${garlandBulbs(20, 6)}
    </div>
    <div class="hero-content">
      <p class="eyebrow">¡Feliz Navidad!</p>
      <h1>${esc(d.nombre)}</h1>
      <div class="hero-info">
        ${fechaLarga ? `<span>📅 ${esc(fechaLarga)}</span>` : ""}
        ${d.hora ? `<span>🕒 ${esc(d.hora)} hs</span>` : ""}
        ${d.lugar ? `<span>📍 ${esc(d.lugar)}</span>` : ""}
      </div>
      ${d.mensaje ? `<p class="hero-mensaje">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>

  <section>
    <h2>Faltan <span>para la fiesta</span></h2>
    ${cd.html}
  </section>

  <section>
    <h2>Los <span>datos</span></h2>
    <div class="datos-card glass">
      ${d.fecha ? `<div class="dato-row"><div class="dato-ico">📅</div><div><p class="dato-label">Fecha</p><p class="dato-value">${esc(fechaLarga || d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p></div></div>` : ""}
      ${d.lugar ? `<div class="dato-row"><div class="dato-ico">📍</div><div><p class="dato-label">Lugar</p><p class="dato-value">${esc(d.lugar)}</p>${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación →</a>` : ""}</div></div>` : ""}
    </div>
  </section>

  ${d.amigoInvisible ? `
  <section>
    <h2 class="amigo-title">${santaHatSVG(30, gold)} <span>Amigo</span> Invisible</h2>
    <div class="amigo-card glass">
      ${giftsSVG(accent, green, gold)}
      <p>${esc(d.amigoInvisible)}</p>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <section>
    <h2>Un <span>vistazo</span></h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2>Confirmá <span>tu lugar</span></h2>
    ${rsvpDeadline ? `<p style="margin:-14px 0 20px;font-size:.85rem;color:var(--ink-soft);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    <p class="signoff">🎄 ¡Los esperamos para brindar! 🎄</p>
    ${esc(d.nombre)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  const dots = [
    { l: 12, c: "#e0374a" }, { l: 26, c: "#f0c249" }, { l: 40, c: "#1f8a56" }, { l: 54, c: "#4fb0e0" },
    { l: 68, c: "#e0374a" }, { l: 82, c: "#f0c249" },
  ];
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
    background:radial-gradient(ellipse at 50% 0%, #16294a 0%, #0c1930 55%, #070f1e 100%);">
    <div style="position:absolute;top:6px;left:0;right:0;height:14px;">
      ${dots.map((s) => `<span style="position:absolute;left:${s.l}%;top:${(s.l % 3) * 3}px;width:6px;height:9px;border-radius:0 0 50% 50%;background:${s.c};box-shadow:0 0 5px ${s.c},0 0 10px ${s.c};"></span>`).join("")}
    </div>
    <span style="position:absolute;top:22%;left:14%;width:3px;height:3px;border-radius:50%;background:#fff;opacity:.8;"></span>
    <span style="position:absolute;top:14%;left:80%;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.7;"></span>
    <span style="position:absolute;top:30%;left:60%;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.6;"></span>
    <div style="position:relative;z-index:2;text-align:center;padding:14px 10px;">
      <div style="font-family:Arial,sans-serif;font-weight:800;font-size:1.2rem;letter-spacing:.3px;color:${d.accent};text-shadow:0 0 10px rgba(0,0,0,.5);line-height:1.15;">${esc(d.name)}</div>
      <div style="font-family:Arial,sans-serif;font-size:.66rem;letter-spacing:2px;text-transform:uppercase;color:#f0c249;opacity:.9;margin-top:6px;">luces festivas</div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "navidad", name: "Luces Festivas",
  summary: "Navidad pop y festiva para fiestas de fin de año: guirnalda de luces multicolor con glow, cielo nocturno estrellado y sección de amigo invisible.",
  accent: "#e0374a", accent2: "#0c1930", schema: navidadSchema, sampleData, render, cardPreview,
};
