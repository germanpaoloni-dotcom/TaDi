const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");

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
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "21:00"}:00` : sampleData.fecha, "cd-neon");
  const gal = galleryWidget(d.galeria || [], "gal-neon");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)} · Fiesta Neón</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Monoton&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#14071f; --violeta:#7b2ff7; --celeste:#00d4ff; --fucsia:#ff2eb0;
    --ink:#f4ecff;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;font-family:'Poppins',Arial,sans-serif;background:var(--bg);color:var(--ink);
    background-image:
      radial-gradient(ellipse at 15% 10%, rgba(123,47,247,.35), transparent 55%),
      radial-gradient(ellipse at 85% 20%, rgba(0,212,255,.28), transparent 55%),
      radial-gradient(ellipse at 50% 90%, rgba(255,46,176,.28), transparent 55%);
    background-attachment:fixed;
  }
  a{color:var(--celeste);}
  .neon-text{
    font-family:'Monoton',cursive;font-weight:400;letter-spacing:2px;
    color:#fff;
    text-shadow:
      0 0 6px #fff,
      0 0 16px var(--fucsia),
      0 0 32px var(--fucsia),
      0 0 48px var(--violeta),
      0 0 70px var(--violeta);
  }
  .glow-violeta{filter:drop-shadow(0 0 6px var(--violeta)) drop-shadow(0 0 14px rgba(123,47,247,.7));}
  .glow-celeste{filter:drop-shadow(0 0 6px var(--celeste)) drop-shadow(0 0 14px rgba(0,212,255,.7));}
  .glow-fucsia{filter:drop-shadow(0 0 6px var(--fucsia)) drop-shadow(0 0 14px rgba(255,46,176,.7));}

  /* ===== HERO ===== */
  .hero{position:relative;min-height:clamp(420px,80vh,720px);display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(1.3) contrast(1.05);}
  .hero-overlay{position:absolute;inset:0;
    background:
      linear-gradient(180deg, rgba(20,7,31,.55) 0%, rgba(20,7,31,.55) 40%, var(--bg) 100%),
      radial-gradient(circle at 50% 30%, rgba(123,47,247,.25), transparent 60%);
  }
  .hero-deco{position:absolute;inset:0;pointer-events:none;}
  .hero-content{position:relative;z-index:2;padding:24px;}
  .hero-kicker{text-transform:uppercase;letter-spacing:6px;font-size:clamp(.7rem,2vw,.85rem);color:var(--celeste);font-weight:700;margin:0 0 10px;text-shadow:0 0 10px rgba(0,212,255,.8);}
  .hero h1{font-size:clamp(2.6rem,9vw,5.5rem);margin:0 0 6px;line-height:1.05;}
  .hero-sub{font-size:clamp(1rem,3vw,1.4rem);color:#e5d6ff;margin:8px 0 0;font-weight:600;}
  .hero-date{margin-top:20px;display:inline-block;padding:10px 26px;border-radius:999px;border:2px solid var(--fucsia);color:#fff;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:clamp(.75rem,2vw,.95rem);
    box-shadow:0 0 18px rgba(255,46,176,.6), inset 0 0 12px rgba(255,46,176,.25);}

  /* ===== SECTIONS ===== */
  section{padding:clamp(36px,7vw,72px) 20px;position:relative;}
  .section-inner{max-width:1000px;margin:0 auto;}
  .section-title{text-align:center;font-size:clamp(1.6rem,5vw,2.4rem);margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;}
  .section-title.violeta{color:#fff;text-shadow:0 0 8px var(--violeta),0 0 24px var(--violeta);}
  .section-title.celeste{color:#fff;text-shadow:0 0 8px var(--celeste),0 0 24px var(--celeste);}
  .section-title.fucsia{color:#fff;text-shadow:0 0 8px var(--fucsia),0 0 24px var(--fucsia);}
  .section-sub{text-align:center;color:#c9b8e8;max-width:560px;margin:0 auto 32px;font-size:.95rem;}

  /* ===== COUNTDOWN ===== */
  .countdown{display:flex;gap:clamp(8px,2vw,18px);justify-content:center;flex-wrap:wrap;max-width:560px;margin:0 auto;}
  .countdown>div{flex:1;min-width:70px;text-align:center;background:rgba(123,47,247,.12);border:1px solid rgba(0,212,255,.4);border-radius:16px;padding:clamp(12px,2vw,18px) 4px;box-shadow:0 0 20px rgba(0,212,255,.15), inset 0 0 20px rgba(123,47,247,.15);}
  .cd-num{display:block;font-size:clamp(1.6rem,5vw,2.4rem);font-weight:800;color:#fff;text-shadow:0 0 10px var(--celeste),0 0 22px var(--celeste);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:2px;color:#a3f3ff;}

  /* ===== CRONOGRAMA ===== */
  .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;}
  .card{background:linear-gradient(160deg, rgba(123,47,247,.14), rgba(0,0,0,.25));border:1px solid rgba(255,46,176,.35);border-radius:20px;padding:24px;position:relative;overflow:hidden;}
  .card::before{content:"";position:absolute;top:-40%;right:-30%;width:60%;height:140%;background:radial-gradient(circle, rgba(0,212,255,.18), transparent 65%);pointer-events:none;}
  .card h3{margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px;font-size:1rem;color:#fff;display:flex;align-items:center;gap:8px;}
  .card p{margin:0;line-height:1.6;color:#e5d6ff;font-size:.95rem;}
  .card a.mapa{display:inline-block;margin-top:10px;font-weight:700;color:var(--celeste);text-decoration:none;border-bottom:1px dashed var(--celeste);}

  /* ===== DRESS CODE / PADRES ===== */
  .pill{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:999px;background:rgba(255,46,176,.1);border:1px solid var(--fucsia);color:#fff;font-weight:700;box-shadow:0 0 22px rgba(255,46,176,.35);}
  .center{text-align:center;}
  .mensaje-box{max-width:640px;margin:0 auto;text-align:center;font-size:clamp(1rem,2.5vw,1.2rem);line-height:1.7;color:#f0e6ff;}
  .padres-line{margin-top:18px;color:#b6a2d9;font-size:.9rem;letter-spacing:1px;text-transform:uppercase;}

  /* ===== GALLERY ===== */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;}
  .gallery-item{border-radius:16px;overflow:hidden;border:1px solid rgba(0,212,255,.4);box-shadow:0 0 18px rgba(123,47,247,.35);}
  .gallery-item img{width:100%;height:180px;object-fit:cover;display:block;cursor:pointer;transition:transform .3s;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,2,10,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:10px;box-shadow:0 0 40px rgba(0,212,255,.5);}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;text-shadow:0 0 10px var(--fucsia);}

  /* ===== RSVP ===== */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:520px;margin:0 auto;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:#a3f3ff;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px;border-radius:10px;border:1px solid rgba(0,212,255,.4);margin-top:6px;width:100%;background:rgba(255,255,255,.06);color:#fff;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#8f7bb0;}
  .rsvp-form button{background:linear-gradient(90deg,var(--violeta),var(--fucsia));color:#fff;border:0;padding:14px;border-radius:999px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 0 24px rgba(255,46,176,.5);}
  .rsvp-whatsapp{color:var(--celeste);font-size:.85rem;text-align:center;}
  .rsvp-status{font-weight:bold;color:#7CFFB2;text-align:center;}

  footer{text-align:center;padding:40px 20px 50px;font-size:.8rem;color:#8f7bb0;letter-spacing:1px;}
  footer .neon-text{font-size:1.4rem;display:block;margin-bottom:8px;}

  .disco-row{display:flex;justify-content:center;gap:18px;margin:26px auto 0;flex-wrap:wrap;}
</style></head>
<body>

  <!-- ===== HERO ===== -->
  <div class="hero">
    <div class="hero-bg" style="background-image:url('${esc(d.coverImage)}')"></div>
    <div class="hero-overlay"></div>
    <div class="hero-deco">
      <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;opacity:.9">
        <g class="glow-celeste">
          <path d="M60 60 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6 z" fill="#00d4ff"/>
          <circle cx="700" cy="90" r="3" fill="#00d4ff"/>
          <circle cx="740" cy="130" r="2" fill="#00d4ff"/>
        </g>
        <g class="glow-fucsia">
          <path d="M120 420 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5 z" fill="#ff2eb0"/>
          <circle cx="90" cy="200" r="2.5" fill="#ff2eb0"/>
        </g>
        <g class="glow-violeta">
          <path d="M720 400 l7 18 18 7 -18 7 -7 18 -7 -18 -18 -7 18 -7 z" fill="#7b2ff7"/>
          <circle cx="600" cy="60" r="2.5" fill="#7b2ff7"/>
        </g>
        <g class="glow-celeste" fill="none" stroke="#00d4ff" stroke-width="2">
          <circle cx="400" cy="250" r="180" opacity=".25"/>
          <circle cx="400" cy="250" r="130" opacity=".2"/>
        </g>
      </svg>
    </div>
    <div class="hero-content">
      <p class="hero-kicker">Se vienen mis XV</p>
      <h1 class="neon-text">${esc(d.nombre)}</h1>
      <p class="hero-sub">15 años · noche de luces, música y pura fiesta</p>
      <div class="hero-date">${fechaLarga(d.fecha)}</div>
    </div>
  </div>

  <!-- ===== COUNTDOWN ===== -->
  <section>
    <div class="section-inner">
      <h2 class="section-title celeste">Ya casi arranca la fiesta</h2>
      <p class="section-sub">Preparate: la cuenta regresiva ya empezó.</p>
      ${cd.html}
    </div>
  </section>

  <!-- ===== CRONOGRAMA ===== -->
  <section>
    <div class="section-inner">
      <h2 class="section-title violeta">El plan de la noche</h2>
      <p class="section-sub">Ceremonia y después... ¡a bailar!</p>
      <div class="grid-2">
        ${d.horaCeremonia || d.lugarCeremonia ? `
        <div class="card">
          <h3>${starIcon("#00d4ff")} Ceremonia</h3>
          <p>${d.horaCeremonia ? `Hora: <strong>${esc(d.horaCeremonia)}</strong><br>` : ""}${esc(d.lugarCeremonia)}</p>
        </div>` : ""}
        <div class="card">
          <h3>${discoIcon("#ff2eb0")} Fiesta</h3>
          <p>${d.horaFiesta ? `Hora: <strong>${esc(d.horaFiesta)}</strong><br>` : ""}${esc(d.lugarFiesta)}</p>
          ${d.direccionMapa ? `<a class="mapa" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
        </div>
      </div>
    </div>
  </section>

  <!-- ===== MENSAJE / PADRES ===== -->
  <section>
    <div class="section-inner">
      <h2 class="section-title fucsia">${bulbIcon("#ff2eb0")}</h2>
      <p class="mensaje-box">${esc(d.mensaje)}</p>
      ${d.padres ? `<p class="center padres-line">Con el cariño de ${esc(d.padres)}</p>` : ""}
    </div>
  </section>

  <!-- ===== DRESS CODE ===== -->
  <section>
    <div class="section-inner center">
      <h2 class="section-title celeste">Dress code</h2>
      <div class="pill">${discoIcon("#00d4ff")} ${esc(d.dressCode)}</div>
    </div>
  </section>

  <!-- ===== GALERÍA ===== -->
  <section>
    <div class="section-inner">
      <h2 class="section-title violeta">Momentos antes de la fiesta</h2>
      ${gal.html}
    </div>
  </section>

  <!-- ===== RSVP ===== -->
  <section>
    <div class="section-inner">
      <h2 class="section-title fucsia">Confirmá tu lugar en la pista</h2>
      <p class="section-sub">Contanos si venís, cuántos son y qué preferís comer.</p>
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <span class="neon-text">${esc(d.nombre)}</span>
    Gracias por ser parte de esta noche de luces · ¡Nos vemos en la pista! 🎶
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

function fechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, day] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !day) return esc(fechaISO);
  return `${day} de ${meses[m - 1]} de ${y}`;
}

function starIcon(color) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" class="glow-celeste" style="vertical-align:-4px"><path d="M12 2 l3 7 7 1 -5.2 4.8 1.6 7.2 -6.4 -3.8 -6.4 3.8 1.6 -7.2 -5.2 -4.8 7 -1 z" fill="${color}"/></svg>`;
}

function discoIcon(color) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" class="glow-fucsia" style="vertical-align:-4px"><circle cx="12" cy="12" r="9" fill="none" stroke="${color}" stroke-width="2"/><circle cx="12" cy="7" r="1.4" fill="${color}"/><circle cx="17" cy="12" r="1.4" fill="${color}"/><circle cx="12" cy="17" r="1.4" fill="${color}"/><circle cx="7" cy="12" r="1.4" fill="${color}"/><circle cx="15.3" cy="8.7" r="1.1" fill="${color}"/><circle cx="15.3" cy="15.3" r="1.1" fill="${color}"/><circle cx="8.7" cy="15.3" r="1.1" fill="${color}"/><circle cx="8.7" cy="8.7" r="1.1" fill="${color}"/></svg>`;
}

function bulbIcon(color) {
  return `<svg width="34" height="34" viewBox="0 0 24 24" class="glow-fucsia" style="vertical-align:-8px"><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1v.7h6v-.7c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" fill="none" stroke="${color}" stroke-width="1.6"/><line x1="9.5" y1="20" x2="14.5" y2="20" stroke="${color}" stroke-width="1.6"/><line x1="10" y1="22" x2="14" y2="22" stroke="${color}" stroke-width="1.6"/></svg>`;
}

module.exports = {
  id, category: "xv", name: "Neón Fiesta",
  summary: "Noche disco flúo con luces de neón, glow y energía de boliche para la fiesta de 15.",
  accent: "#7b2ff7", schema: xvSchema, sampleData, render,
};
