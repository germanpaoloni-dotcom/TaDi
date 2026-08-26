const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-neon-y2k";

const sampleData = {
  nombre: "Bren",
  edad: "28",
  fecha: "2027-11-13",
  hora: "23:00",
  lugar: "Terraza Neón, Rooftop Palermo",
  direccionMapa: "https://maps.google.com/?q=Rooftop+Palermo+Buenos+Aires",
  mensaje: "Cumplo 28 y lo vamos a festejar como se debe: con la pista prendida fuego, luces por todos lados y la mejor gente. Guardate la energía del 2000, ponete lo más brillante que tengas y vení a bailar hasta que salga el sol ✨",
  dressCode: "Todo lo que brille — cuanto más flashero, mejor",
  whatsapp: "5491100000036",
  fechaLimiteRSVP: "2027-11-01",
  coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=800&q=80",
  ],
};

// Destello Y2K de 4 puntas ("sparkle"), dibujado a mano en SVG inline.
// size: alto/ancho en px. color: currentColor o un hex puntual.
function sparkleSVG(size, color, extraClass) {
  return `<svg class="sparkle${extraClass ? " " + extraClass : ""}" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:${color};">
    <path d="M20 0 C20 10 22 18 24 20 C22 22 20 30 20 40 C20 30 18 22 16 20 C18 18 20 10 20 0 Z" fill="currentColor"/>
    <path d="M0 20 C10 20 18 18 20 16 C22 18 30 20 40 20 C30 20 22 22 20 24 C18 22 10 20 0 20 Z" fill="currentColor" opacity=".9"/>
  </svg>`;
}

// Un puñado de destellos dispersos con distintos tamaños/colores/posiciones,
// pensados para tirar por encima del hero como decoración fija.
function sparkleField() {
  const specs = [
    { top: "8%", left: "10%", size: 26, color: "var(--lime)" },
    { top: "16%", left: "82%", size: 18, color: "var(--magenta)" },
    { top: "30%", left: "6%", size: 14, color: "#fff" },
    { top: "6%", left: "48%", size: 16, color: "var(--magenta)" },
    { top: "68%", left: "88%", size: 22, color: "var(--lime)" },
    { top: "78%", left: "12%", size: 20, color: "#fff" },
    { top: "50%", left: "92%", size: 14, color: "var(--lime)" },
    { top: "88%", left: "50%", size: 18, color: "var(--magenta)" },
  ];
  return specs.map((s) => `<div class="sparkle-wrap" style="top:${s.top};left:${s.left};">${sparkleSVG(s.size, s.color)}</div>`).join("");
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#B6FF3C");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "23:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-neon");
  const gal = galleryWidget(d.galeria, "gal-neon");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const look = [
    { icono: "✨", titulo: "Brillos y purpurina", detalle: "Glitter en la cara, en el pelo, donde quieras. Nunca es demasiado." },
    { icono: "🕶️", titulo: "Anteojos de sol de noche", detalle: "Sí, adentro. Sí, de noche. Es Y2K, no tiene que tener sentido." },
    { icono: "🪩", titulo: "Algo metalizado", detalle: "Plateado, dorado, holográfico. Que refleje toda la luz de la pista." },
    { icono: "👢", titulo: "Plataformas o botas altas", detalle: "Para bailar toda la noche pisando fuerte y brillando fuerte." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños Y2K de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --lime:${accent};
    --violet:#7A1FD1;
    --magenta:#ff2ec4;
    --black:#050106;
    --black-2:#0e0212;
    --white:#f5f2ff;
    --dim:#b9a9d6;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;
    background:
      radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--violet) 45%, transparent), transparent 55%),
      radial-gradient(circle at 85% 90%, color-mix(in srgb, var(--lime) 18%, transparent), transparent 50%),
      var(--black);
    color:var(--white);
    font-family:'Rubik',Arial,sans-serif;
  }
  img{max-width:100%;}
  h1,h2,h3{font-family:'Orbitron','Arial Black',Arial,sans-serif;margin:0;}

  .glow-lime{color:var(--lime);text-shadow:0 0 6px var(--lime),0 0 16px var(--lime),0 0 34px color-mix(in srgb, var(--lime) 70%, transparent),0 0 60px color-mix(in srgb, var(--lime) 40%, transparent);}
  .glow-magenta{color:var(--magenta);text-shadow:0 0 6px var(--magenta),0 0 16px var(--magenta),0 0 32px rgba(255,46,196,.6);}
  .glow-violet{color:#caa2ff;text-shadow:0 0 6px var(--violet),0 0 18px var(--violet),0 0 36px rgba(122,31,209,.6);}

  .sparkle-wrap{position:absolute;pointer-events:none;filter:drop-shadow(0 0 6px currentColor);animation:twinkle 3.2s ease-in-out infinite;}
  .sparkle-wrap:nth-child(2n){animation-duration:2.4s;animation-delay:.4s;}
  .sparkle-wrap:nth-child(3n){animation-duration:4s;animation-delay:.9s;}
  @keyframes twinkle{0%,100%{opacity:.55;transform:scale(.85) rotate(0deg);}50%{opacity:1;transform:scale(1.15) rotate(12deg);}}

  .hero{position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:70px 20px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:
    linear-gradient(180deg, rgba(5,1,6,.55) 0%, rgba(5,1,6,.75) 55%, var(--black) 100%),
    radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--violet) 35%, transparent), transparent 60%);}
  .hero-content{position:relative;z-index:2;max-width:680px;}
  .eyebrow{text-transform:uppercase;letter-spacing:.5em;font-size:clamp(.62rem,1.8vw,.8rem);color:var(--magenta);margin:0 0 18px;text-shadow:0 0 10px rgba(255,46,196,.7);}
  .hero h1{font-size:clamp(2.6rem,10vw,5.2rem);font-weight:900;letter-spacing:1px;line-height:1.02;}
  .hero .edad{display:inline-block;margin-top:16px;font-family:'Orbitron',Arial,sans-serif;font-weight:800;font-size:clamp(1.1rem,3.4vw,1.5rem);padding:8px 22px;border:2px solid var(--lime);border-radius:40px;box-shadow:0 0 14px var(--lime),inset 0 0 14px color-mix(in srgb, var(--lime) 25%, transparent);}
  .hero .edad strong{font-size:1.2em;}
  .hero p.sub{margin-top:22px;font-size:1.02rem;line-height:1.7;color:var(--white);opacity:.92;}

  section{max-width:800px;margin:0 auto;padding:64px 22px;text-align:center;position:relative;}
  .section-title{font-size:clamp(1.15rem,3.2vw,1.6rem);letter-spacing:2px;text-transform:uppercase;margin-bottom:30px;font-weight:800;}

  .panel{background:linear-gradient(160deg, rgba(122,31,209,.16), rgba(255,255,255,.02));border:1px solid color-mix(in srgb, var(--lime) 45%, transparent);border-radius:20px;padding:34px 24px;box-shadow:0 0 30px rgba(122,31,209,.35), inset 0 0 40px rgba(182,255,60,.04);}

  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:4px;}
  .countdown div{min-width:64px;flex:1 1 64px;max-width:92px;background:var(--black-2);border:1px solid var(--lime);border-radius:14px;padding:14px 4px;box-shadow:0 0 18px color-mix(in srgb, var(--lime) 45%, transparent);}
  .cd-num{display:block;font-family:'Orbitron',Arial,sans-serif;font-size:1.8rem;font-weight:800;color:var(--lime);text-shadow:0 0 6px var(--lime),0 0 18px color-mix(in srgb, var(--lime) 70%, transparent);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--dim);}

  .message{font-size:1.05rem;line-height:1.8;color:var(--white);opacity:.95;}

  .venue-card{display:flex;flex-direction:column;gap:10px;align-items:center;}
  .fecha-badge{display:inline-block;background:var(--violet);color:#fff;padding:8px 20px;border-radius:24px;font-family:'Orbitron',Arial,sans-serif;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;box-shadow:0 0 18px rgba(122,31,209,.7);}
  .venue-card h3{font-size:1.15rem;margin-top:4px;}
  .venue-card a{color:var(--lime);text-decoration:none;font-weight:700;text-shadow:0 0 8px color-mix(in srgb, var(--lime) 50%, transparent);}
  .venue-card a:hover{text-decoration:underline;}
  .dresscode{margin-top:18px;padding-top:16px;border-top:1px dashed color-mix(in srgb, var(--magenta) 55%, transparent);}
  .dresscode .label{display:block;text-transform:uppercase;letter-spacing:2px;font-size:.64rem;color:var(--magenta);margin-bottom:6px;}
  .dresscode p{margin:0;color:var(--white);}

  .look-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-top:8px;}
  .look-card{background:var(--black-2);border:1px solid color-mix(in srgb, var(--lime) 40%, transparent);border-radius:16px;padding:24px 16px;box-shadow:0 0 20px rgba(182,255,60,.12);transition:box-shadow .2s;}
  .look-card .icono{font-size:1.8rem;display:block;margin-bottom:10px;filter:drop-shadow(0 0 8px var(--lime));}
  .look-card h3{font-size:.95rem;letter-spacing:.5px;margin-bottom:8px;color:var(--lime);text-shadow:0 0 8px color-mix(in srgb, var(--lime) 60%, transparent);}
  .look-card p{margin:0;font-size:.82rem;line-height:1.55;color:var(--dim);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:160px;object-fit:cover;border-radius:14px;cursor:pointer;border:2px solid color-mix(in srgb, var(--lime) 45%, transparent);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,1,6,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;box-shadow:0 0 40px color-mix(in srgb, var(--lime) 40%, transparent);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:var(--dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Rubik',Arial,sans-serif;padding:11px;border:1px solid color-mix(in srgb, var(--lime) 40%, transparent);border-radius:10px;margin-top:5px;width:100%;background:var(--black-2);color:var(--white);}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#7c6c96;}
  .rsvp-form button{background:linear-gradient(90deg,var(--violet),var(--lime));color:#050106;border:0;padding:14px;border-radius:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;cursor:pointer;box-shadow:0 0 20px rgba(182,255,60,.5);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--lime);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--lime);font-weight:bold;}

  footer{text-align:center;padding:44px 20px;font-size:.85rem;color:var(--dim);border-top:1px solid color-mix(in srgb, var(--violet) 45%, transparent);}
  footer .signoff{font-family:'Orbitron',Arial,sans-serif;color:var(--lime);letter-spacing:1.5px;text-shadow:0 0 10px color-mix(in srgb, var(--lime) 60%, transparent);}

  @media (max-width:480px){
    .sparkle-wrap{transform:scale(.75);}
    section{padding:48px 16px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    ${sparkleField()}
    <div class="hero-content">
      <p class="eyebrow glow-magenta">Fiesta Y2K</p>
      <h1 class="glow-lime">${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="edad glow-lime">Cumple <strong>${esc(d.edad)}</strong></div>` : ""}
      ${d.mensaje ? `<p class="sub">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>

  <section>
    <h2 class="section-title glow-lime">Cuenta regresiva para la pista</h2>
    <div class="panel">
      ${cd.html}
    </div>
  </section>

  ${(d.lugar || d.hora || d.direccionMapa || d.dressCode) ? `
  <section>
    <h2 class="section-title glow-violet">Dónde y cuándo</h2>
    <div class="panel venue-card">
      <span class="fecha-badge">${esc(d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</span>
      ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
      ${d.direccionMapa ? `<a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">📍 Ver ubicación en el mapa →</a>` : ""}
      ${d.dressCode ? `<div class="dresscode"><span class="label">Dress code</span><p>${esc(d.dressCode)}</p></div>` : ""}
    </div>
  </section>` : ""}

  <section>
    <h2 class="section-title glow-magenta">Código del look</h2>
    <div class="look-grid">
      ${look.map((l) => `<div class="look-card"><span class="icono">${l.icono}</span><h3>${esc(l.titulo)}</h3><p>${esc(l.detalle)}</p></div>`).join("")}
    </div>
  </section>

  ${(d.galeria && d.galeria.length) ? `
  <section>
    <h2 class="section-title glow-lime">Fotos de otras noches</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2 class="section-title glow-violet">Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p style="margin:-14px 0 20px;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--magenta);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="panel">
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <p class="signoff">✨ NOS VEMOS EN LA PISTA ✨</p>
    <p>Cumpleaños Y2K de ${esc(d.nombre)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:radial-gradient(circle at 20% 15%, rgba(122,31,209,.55), transparent 55%),radial-gradient(circle at 85% 85%, rgba(182,255,60,.18), transparent 50%),#050106;">
    <svg width="18" height="18" viewBox="0 0 40 40" style="position:absolute;top:14%;left:12%;" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0 C20 10 22 18 24 20 C22 22 20 30 20 40 C20 30 18 22 16 20 C18 18 20 10 20 0 Z" fill="${d.accent}"/>
      <path d="M0 20 C10 20 18 18 20 16 C22 18 30 20 40 20 C30 20 22 22 20 24 C18 22 10 20 0 20 Z" fill="${d.accent}" opacity=".9"/>
    </svg>
    <svg width="12" height="12" viewBox="0 0 40 40" style="position:absolute;top:20%;right:16%;" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0 C20 10 22 18 24 20 C22 22 20 30 20 40 C20 30 18 22 16 20 C18 18 20 10 20 0 Z" fill="#ff2ec4"/>
      <path d="M0 20 C10 20 18 18 20 16 C22 18 30 20 40 20 C30 20 22 22 20 24 C18 22 10 20 0 20 Z" fill="#ff2ec4" opacity=".9"/>
    </svg>
    <svg width="14" height="14" viewBox="0 0 40 40" style="position:absolute;bottom:18%;right:12%;" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0 C20 10 22 18 24 20 C22 22 20 30 20 40 C20 30 18 22 16 20 C18 18 20 10 20 0 Z" fill="${d.accent2}"/>
      <path d="M0 20 C10 20 18 18 20 16 C22 18 30 20 40 20 C30 20 22 22 20 24 C18 22 10 20 0 20 Z" fill="${d.accent2}" opacity=".9"/>
    </svg>
    <div style="font-family:'Century Gothic',Arial,sans-serif;font-weight:800;font-size:1.25rem;letter-spacing:.5px;color:${d.accent};text-shadow:0 0 4px ${d.accent},0 0 14px ${d.accent},0 0 26px ${d.accent};">${esc(d.name)}</div>
    <div style="font-family:'Century Gothic',Arial,sans-serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#fff;opacity:.85;">Fiesta Y2K</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Neón Y2K",
  summary: "Cumpleaños de adultos con estética Y2K/rave: neón eléctrico, destellos y glow, para festejar hasta que salga el sol.",
  accent: "#B6FF3C", accent2: "#7A1FD1", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
