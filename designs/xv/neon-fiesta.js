const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-neon-fiesta";

const sampleData = {
  nombre: "Milagros",
  fecha: "2027-11-13",
  horaCeremonia: "19:00",
  lugarCeremonia: "Parroquia Santa Rita, San Isidro",
  horaFiesta: "21:00",
  lugarFiesta: "Salón Neon Club, San Isidro (pista con luces led + DJ en vivo)",
  direccionMapa: "https://maps.google.com/?q=Neon+Club+San+Isidro",
  padres: "Vanesa y Fabián",
  mensaje: "¡Se viene la fiesta del año! Prendé el flúo, calzate las mejores zapatillas y vení a bailar hasta que se apague la última luz 🎧✨",
  dressCode: "Colores flúo obligatorio, se viene la fiesta 💜💙💗",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#ff2d95");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "21:00"}:00` : sampleData.fecha, "cd-neon");
  const gal = galleryWidget(d.galeria || [], "gal-neon");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const fp = fechaPartes(d.fecha);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)} · Fiesta Neón</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Monoton&family=Yellowtail&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#120a17; --bg2:#1a0f22;
    --magenta:${accent}; --cyan:#22e5ff; --violeta:#7b2ff7;
    --ink:#fdf7ff; --ink-dim:#c9b8e0;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;font-family:'Poppins',Arial,sans-serif;background-color:var(--bg);color:var(--ink);
    background-image:
      radial-gradient(ellipse at 18% 12%, color-mix(in srgb, ${accent} 20%, transparent), transparent 55%),
      radial-gradient(ellipse at 85% 25%, rgba(34,229,255,.16), transparent 55%),
      radial-gradient(ellipse at 50% 95%, rgba(123,47,247,.18), transparent 55%),
      linear-gradient(335deg, rgba(0,0,0,.45) 23px, transparent 23px),
      linear-gradient(155deg, rgba(0,0,0,.45) 23px, transparent 23px),
      linear-gradient(335deg, rgba(0,0,0,.45) 23px, transparent 23px),
      linear-gradient(155deg, rgba(0,0,0,.45) 23px, transparent 23px);
    background-size: auto, auto, auto, 58px 58px, 58px 58px, 58px 58px, 58px 58px;
    background-position: 0 0, 0 0, 0 0, 0px 2px, 4px 35px, 29px 31px, 34px 6px;
    background-attachment: fixed, fixed, fixed, fixed, fixed, fixed, fixed;
  }
  a{color:var(--cyan);}

  .script{font-family:'Yellowtail',cursive;font-weight:400;}
  .outline{font-family:'Monoton',cursive;font-weight:400;letter-spacing:2px;}

  .neon-outline-magenta{color:#fff;text-shadow:0 0 4px #fff,0 0 12px var(--magenta),0 0 26px var(--magenta),0 0 46px var(--magenta);}
  .neon-outline-cyan{color:#fff;text-shadow:0 0 4px #fff,0 0 12px var(--cyan),0 0 26px var(--cyan),0 0 46px var(--cyan);}
  .neon-script-magenta{color:var(--magenta);text-shadow:0 0 6px var(--magenta),0 0 18px color-mix(in srgb, ${accent} 85%, transparent),0 0 38px color-mix(in srgb, ${accent} 50%, transparent);}
  .neon-script-cyan{color:var(--cyan);text-shadow:0 0 6px var(--cyan),0 0 18px rgba(34,229,255,.85),0 0 38px rgba(34,229,255,.5);}

  .glow-magenta{filter:drop-shadow(0 0 4px var(--magenta)) drop-shadow(0 0 10px color-mix(in srgb, ${accent} 75%, transparent));}
  .glow-cyan{filter:drop-shadow(0 0 4px var(--cyan)) drop-shadow(0 0 10px rgba(34,229,255,.75));}

  /* ===== HERO ===== */
  .hero{position:relative;min-height:clamp(560px,110vh,900px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;overflow:hidden;padding:56px 20px 40px;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.22;filter:saturate(1.2) contrast(1.05);}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(18,10,23,.55) 0%, rgba(18,10,23,.72) 45%, var(--bg) 100%);}
  .hero-deco{position:absolute;inset:0;pointer-events:none;}
  .hero-content{position:relative;z-index:2;max-width:520px;}
  .squiggle{position:absolute;top:26px;left:18px;}
  .dots-corner{position:absolute;bottom:22px;right:22px;}
  .hero-kicker{font-size:clamp(2.8rem,13vw,4.6rem);margin:6px 0 0;line-height:.95;}
  .hero-script-sm{font-size:clamp(1.6rem,7vw,2.4rem);margin:2px 0;}
  .hero-name{font-size:clamp(3.2rem,15vw,5.6rem);margin:0;line-height:1;word-break:break-word;}
  .hero-age{font-size:clamp(1.3rem,5vw,1.9rem);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin:6px 0 22px;}
  .hero-msg{font-weight:800;text-transform:uppercase;font-size:clamp(.85rem,3vw,1.05rem);line-height:1.6;color:#fff;letter-spacing:.5px;margin:0 0 28px;}
  .date-row{display:flex;align-items:center;justify-content:center;gap:clamp(10px,3vw,22px);font-weight:800;text-transform:uppercase;letter-spacing:2px;font-size:clamp(.85rem,3vw,1.05rem);flex-wrap:wrap;}
  .date-row .big{font-size:clamp(1.8rem,7vw,2.6rem);color:var(--magenta);text-shadow:0 0 8px var(--magenta),0 0 22px color-mix(in srgb, ${accent} 80%, transparent);}
  .date-row .div{color:var(--magenta);opacity:.8;font-weight:300;}
  .hero-time{margin-top:16px;font-weight:800;letter-spacing:2px;text-transform:uppercase;font-size:clamp(.85rem,3vw,1.05rem);}
  .hero-place{margin-top:20px;font-weight:800;letter-spacing:1px;text-transform:uppercase;font-size:clamp(.8rem,2.8vw,.95rem);color:var(--cyan);text-shadow:0 0 8px rgba(34,229,255,.7);max-width:420px;}
  .hero-mic{margin-top:30px;}
  .star{position:absolute;}

  /* ===== SECTIONS ===== */
  section{padding:clamp(36px,7vw,72px) 20px;position:relative;}
  .section-inner{max-width:1000px;margin:0 auto;}
  .section-title{text-align:center;font-size:clamp(1rem,3.2vw,1.3rem);margin:0 0 30px;text-transform:uppercase;letter-spacing:3px;font-weight:800;}
  .section-title.magenta{color:var(--magenta);text-shadow:0 0 8px var(--magenta),0 0 22px color-mix(in srgb, ${accent} 60%, transparent);}
  .section-title.cyan{color:var(--cyan);text-shadow:0 0 8px var(--cyan),0 0 22px rgba(34,229,255,.6);}
  .section-script{text-align:center;font-family:'Yellowtail',cursive;font-size:clamp(2.2rem,7vw,3.2rem);margin:0 0 6px;}

  /* ===== COUNTDOWN ===== */
  .countdown{display:flex;gap:clamp(8px,2vw,18px);justify-content:center;flex-wrap:wrap;max-width:560px;margin:0 auto;}
  .countdown>div{flex:1;min-width:70px;text-align:center;background:color-mix(in srgb, ${accent} 8%, transparent);border:1px solid rgba(34,229,255,.4);border-radius:16px;padding:clamp(12px,2vw,18px) 4px;box-shadow:0 0 20px rgba(34,229,255,.15), inset 0 0 20px color-mix(in srgb, ${accent} 12%, transparent);}
  .cd-num{display:block;font-size:clamp(1.6rem,5vw,2.4rem);font-weight:800;color:#fff;text-shadow:0 0 10px var(--cyan),0 0 22px var(--cyan);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:2px;color:#8fefff;}

  /* ===== CRONOGRAMA ===== */
  .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;}
  .card{background:linear-gradient(160deg, color-mix(in srgb, ${accent} 8%, transparent), rgba(0,0,0,.3));border:1px solid rgba(34,229,255,.35);border-radius:20px;padding:24px;position:relative;overflow:hidden;}
  .card::before{content:"";position:absolute;top:-40%;right:-30%;width:60%;height:140%;background:radial-gradient(circle, color-mix(in srgb, ${accent} 16%, transparent), transparent 65%);pointer-events:none;}
  .card h3{margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px;font-size:1rem;color:#fff;display:flex;align-items:center;gap:8px;}
  .card p{margin:0;line-height:1.6;color:var(--ink-dim);font-size:.95rem;}
  .card a.mapa{display:inline-block;margin-top:10px;font-weight:700;color:var(--cyan);text-decoration:none;border-bottom:1px dashed var(--cyan);}

  /* ===== MENSAJE / PADRES ===== */
  .center{text-align:center;}
  .mensaje-box{max-width:640px;margin:0 auto;text-align:center;font-size:clamp(1rem,2.5vw,1.2rem);line-height:1.7;color:#f0e6ff;}
  .padres-line{margin-top:18px;color:var(--ink-dim);font-size:.85rem;letter-spacing:1px;text-transform:uppercase;}

  /* ===== DRESS CODE ===== */
  .pill{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:999px;background:color-mix(in srgb, ${accent} 10%, transparent);border:1px solid var(--magenta);color:#fff;font-weight:700;box-shadow:0 0 22px color-mix(in srgb, ${accent} 35%, transparent);}

  /* ===== GALLERY ===== */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;}
  .gallery-item{border-radius:16px;overflow:hidden;border:1px solid rgba(34,229,255,.4);box-shadow:0 0 18px color-mix(in srgb, ${accent} 30%, transparent);}
  .gallery-item img{width:100%;height:180px;object-fit:cover;display:block;cursor:pointer;transition:transform .3s;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,2,10,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:10px;box-shadow:0 0 40px rgba(34,229,255,.5);}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;text-shadow:0 0 10px var(--magenta);}

  /* ===== RSVP ===== */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:520px;margin:0 auto;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:#8fefff;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px;border-radius:10px;border:1px solid rgba(34,229,255,.4);margin-top:6px;width:100%;background:rgba(255,255,255,.06);color:#fff;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#8f7bb0;}
  .rsvp-form button{background:linear-gradient(90deg,var(--magenta),var(--violeta));color:#fff;border:0;padding:14px;border-radius:999px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 0 24px color-mix(in srgb, ${accent} 50%, transparent);}
  .rsvp-whatsapp{color:var(--cyan);font-size:.85rem;text-align:center;}
  .rsvp-status{font-weight:bold;color:#7CFFB2;text-align:center;}

  footer{text-align:center;padding:40px 20px 50px;font-size:.8rem;color:var(--ink-dim);letter-spacing:1px;}
  footer .script{font-size:2rem;display:block;margin-bottom:8px;}
</style></head>
<body>

  <!-- ===== HERO ===== -->
  <div class="hero">
    <div class="hero-bg" style="background-image:url('${esc(d.coverImage)}')"></div>
    <div class="hero-overlay"></div>
    <div class="hero-deco">
      ${squiggle()}
      <div class="star" style="top:6%;right:8%">${starIcon(accent, 46)}</div>
      <div class="star" style="top:12%;left:6%">${starIcon("#22e5ff", 40)}</div>
      <div class="star" style="top:52%;left:4%">${boltIcon("#22e5ff", 40)}</div>
      <div class="star" style="top:48%;right:5%">${starIcon("#22e5ff", 44)}</div>
      <div class="star" style="top:72%;left:8%">${starIcon(accent, 40)}</div>
      <div class="star" style="top:78%;right:9%">${boltIcon(accent, 40)}</div>
      ${dotsGrid("#22e5ff")}
    </div>
    <div class="hero-content">
      <p class="outline neon-outline-magenta hero-kicker">MIS XV</p>
      <p class="script neon-script-cyan hero-script-sm">la fiesta de</p>
      <h1 class="script neon-script-magenta hero-name">${esc(d.nombre)}</h1>
      <p class="outline neon-outline-cyan hero-age">15 años</p>
      <p class="hero-msg">Luces, color y pura energía: vení a brillar con nosotros en mi cumple</p>
      <div class="date-row">
        <span>${esc(fp.weekday)}</span><span class="div">|</span><span class="big">${esc(fp.day)}</span><span class="div">|</span><span>${esc(fp.month)}</span>
      </div>
      ${(d.horaFiesta || d.horaCeremonia) ? `<p class="hero-time">${esc(d.horaFiesta || d.horaCeremonia)} hs en adelante</p>` : ""}
      ${d.lugarFiesta ? `<p class="hero-place">${esc(d.lugarFiesta)}</p>` : ""}
      <div class="hero-mic">${micIcon(accent)}</div>
    </div>
  </div>

  <!-- ===== COUNTDOWN ===== -->
  <section>
    <div class="section-inner">
      <p class="section-script neon-script-cyan">Ya casi arranca</p>
      <h2 class="section-title magenta">la cuenta regresiva</h2>
      ${cd.html}
    </div>
  </section>

  <!-- ===== CRONOGRAMA ===== -->
  <section>
    <div class="section-inner">
      <p class="section-script neon-script-magenta">El plan de</p>
      <h2 class="section-title cyan">la noche</h2>
      <div class="grid-2">
        ${d.horaCeremonia || d.lugarCeremonia ? `
        <div class="card">
          <h3>${starIcon("#22e5ff", 20)} Ceremonia</h3>
          <p>${d.horaCeremonia ? `Hora: <strong>${esc(d.horaCeremonia)}</strong><br>` : ""}${esc(d.lugarCeremonia)}</p>
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `
        <div class="card">
          <h3>${boltIcon(accent, 20)} Fiesta</h3>
          <p>${d.horaFiesta ? `Hora: <strong>${esc(d.horaFiesta)}</strong><br>` : ""}${esc(d.lugarFiesta)}</p>
          ${d.direccionMapa ? `<a class="mapa" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
        </div>` : ""}
      </div>
    </div>
  </section>

  <!-- ===== MENSAJE / PADRES ===== -->
  ${(d.mensaje || d.padres) ? `
  <section>
    <div class="section-inner">
      ${d.mensaje ? `<p class="section-script neon-script-cyan">Un mensaje</p>
      <h2 class="section-title magenta">para vos</h2>
      <p class="mensaje-box">${esc(d.mensaje)}</p>` : ""}
      ${d.padres ? `<p class="center padres-line">Con el cariño de ${esc(d.padres)}</p>` : ""}
    </div>
  </section>` : ""}

  <!-- ===== DRESS CODE ===== -->
  ${d.dressCode ? `
  <section>
    <div class="section-inner center">
      <p class="section-script neon-script-magenta">Vení así</p>
      <h2 class="section-title cyan">dress code</h2>
      <div class="pill">${boltIcon("#22e5ff", 20)} ${esc(d.dressCode)}</div>
    </div>
  </section>` : ""}

  <!-- ===== GALERÍA ===== -->
  ${(d.galeria && d.galeria.length) ? `
  <section>
    <div class="section-inner">
      <p class="section-script neon-script-cyan">Momentos</p>
      <h2 class="section-title magenta">antes de la fiesta</h2>
      ${gal.html}
    </div>
  </section>` : ""}

  <!-- ===== RSVP ===== -->
  <section>
    <div class="section-inner">
      <p class="section-script neon-script-magenta">Confirmá</p>
      <h2 class="section-title cyan">tu lugar en la pista</h2>
      ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <span class="script neon-script-magenta">${esc(d.nombre)}</span>
    Gracias por ser parte de esta noche de luces · ¡Nos vemos en la pista! 🎶
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

function fechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, day] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !day) return esc(fechaISO);
  return `${day} de ${meses[m - 1]} de ${y}`;
}

function fechaPartes(fechaISO) {
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
  if (!fechaISO) return { weekday: "", day: "", month: "" };
  const [y, m, day] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !day) return { weekday: "", day: "", month: "" };
  const dt = new Date(Date.UTC(y, m - 1, day));
  return { weekday: dias[dt.getUTCDay()], day: String(day), month: meses[m - 1] };
}

function starIcon(color, size) {
  const s = size || 20;
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="vertical-align:-4px;filter:drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color})"><path d="M12 2 l3 7 7 1 -5.2 4.8 1.6 7.2 -6.4 -3.8 -6.4 3.8 1.6 -7.2 -5.2 -4.8 7 -1 z" fill="none" stroke="${color}" stroke-width="1.4"/></svg>`;
}

function boltIcon(color, size) {
  const s = size || 20;
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="vertical-align:-4px;filter:drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color})"><path d="M13 2 L4 14h6l-1 8 9-12h-6z" fill="none" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
}

function squiggle() {
  return `<svg width="70" height="20" viewBox="0 0 70 20" style="position:absolute;top:20px;left:16px;filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #fff)"><path d="M2 10 L10 4 L18 16 L26 4 L34 16 L42 4 L50 16 L58 4 L66 10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function dotsGrid(color) {
  const dots = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      dots.push(`<circle cx="${col * 10 + 4}" cy="${row * 10 + 4}" r="1.6" fill="${color}"/>`);
    }
  }
  return `<svg class="dots-corner" width="34" height="34" viewBox="0 0 34 34" style="opacity:.7">${dots.join("")}</svg>`;
}

function micIcon(magentaColor) {
  return `<svg width="60" height="90" viewBox="0 0 60 90" style="filter:drop-shadow(0 0 5px #22e5ff) drop-shadow(0 0 12px #22e5ff)">
    <rect x="20" y="4" width="20" height="34" rx="10" fill="none" stroke="#22e5ff" stroke-width="2.2"/>
    <line x1="24" y1="12" x2="36" y2="12" stroke="#22e5ff" stroke-width="1.6"/>
    <line x1="24" y1="18" x2="36" y2="18" stroke="#22e5ff" stroke-width="1.6"/>
    <line x1="24" y1="24" x2="36" y2="24" stroke="#22e5ff" stroke-width="1.6"/>
    <line x1="24" y1="30" x2="36" y2="30" stroke="#22e5ff" stroke-width="1.6"/>
    <path d="M12 34 a18 18 0 0 0 36 0" fill="none" stroke="${magentaColor}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="30" y1="52" x2="30" y2="66" stroke="${magentaColor}" stroke-width="2.2"/>
    <ellipse cx="30" cy="76" rx="18" ry="6" fill="none" stroke="${magentaColor}" stroke-width="2.2"/>
  </svg>`;
}

module.exports = {
  id, category: "xv", name: "Neón Fiesta",
  summary: "Noche disco flúo: pared de ladrillos, luces de neón magenta y cian, tipografía outline y script para una fiesta de 15 a pura energía.",
  accent: "#ff2d95", accent2: "#22e5ff", schema: xvSchema, sampleData, render,
};
