const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-safari-aventura";

const sampleData = {
  nombreChico: "Benicio",
  edad: "6",
  fecha: "2027-05-24",
  hora: "17:00",
  lugar: "Parque Aventura, Córdoba",
  direccionMapa: "https://maps.google.com/?q=Parque+Aventura+Cordoba",
  mensaje: "¡Nos vamos de expedición! Benicio cumple 6 años y quiere que lo acompañes a explorar la selva, buscar animales y vivir una aventura inolvidable.",
  tematica: "Vení listo para la expedición: gorra y binoculares",
  whatsapp: "5491100000012",
  coverImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800&q=80",
    "https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?w=800&q=80",
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#f2b33d");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd-safari");
  const gal = galleryWidget(d.galeria, "gal-safari");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}! Safari Aventura</title>
<style>
  :root{
    --selva-oscura:#2f4a2e;
    --selva:#4c7a3f;
    --selva-clara:#7fae5c;
    --khaki:#d8c491;
    --khaki-claro:#f3ecd8;
    --ocre:#c07d31;
    --sol:${accent};
    --tinta:#25301f;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Trebuchet MS','Verdana',sans-serif;
    background:var(--khaki-claro);
    color:var(--tinta);
  }
  h1,h2,h3{font-family:'Impact','Arial Black','Trebuchet MS',sans-serif;letter-spacing:1px;}

  /* ---- textura hojas de fondo, repetida con gradientes CSS ---- */
  .leaf-strip{
    height:14px;
    width:100%;
    background:
      repeating-linear-gradient(135deg,var(--selva-clara) 0 10px, var(--selva) 10px 20px);
  }

  .hero{
    position:relative;
    min-height:78vh;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:60px 18px 50px;
    background:
      radial-gradient(circle at 15% 20%, color-mix(in srgb, ${accent} 35%, transparent), transparent 45%),
      radial-gradient(circle at 85% 75%, rgba(192,125,49,.35), transparent 50%),
      linear-gradient(160deg, rgba(20,35,15,.55), rgba(15,25,10,.75)),
      url('${esc(d.coverImage)}') center/cover;
    overflow:hidden;
  }
  .hero::before{
    content:"🌿🐘🌴🦁🌿🦒🌴🐒🌿";
    position:absolute;
    top:14px; left:0; right:0;
    text-align:center;
    font-size:1.4rem;
    letter-spacing:14px;
    opacity:.55;
    filter:drop-shadow(0 2px 2px rgba(0,0,0,.4));
  }
  .hero-content{position:relative;z-index:1;color:#fff;max-width:640px;}
  .stamp{
    display:inline-block;
    border:3px dashed var(--sol);
    color:var(--sol);
    text-transform:uppercase;
    font-weight:bold;
    letter-spacing:3px;
    font-size:.75rem;
    padding:6px 16px;
    border-radius:40px;
    margin-bottom:18px;
    transform:rotate(-3deg);
  }
  .hero-content h1{
    font-size:2.6rem;
    margin:0 0 6px;
    color:#fff;
    text-shadow:3px 3px 0 var(--selva-oscura), 0 0 20px rgba(0,0,0,.5);
    line-height:1.1;
  }
  .hero-age{
    display:inline-flex;
    align-items:baseline;
    gap:10px;
    background:var(--sol);
    color:var(--tinta);
    padding:10px 26px;
    border-radius:60px;
    margin:14px 0 6px;
    box-shadow:0 6px 0 var(--ocre);
    transform:rotate(-2deg);
  }
  .hero-age .num{font-size:2.8rem;font-weight:900;line-height:1;}
  .hero-age .txt{font-size:.95rem;text-transform:uppercase;font-weight:bold;letter-spacing:1px;}
  .hero-content p.tag{
    margin-top:14px;
    font-size:1.05rem;
    text-transform:uppercase;
    letter-spacing:2px;
    color:var(--khaki);
  }

  section{max-width:820px;margin:0 auto;padding:46px 20px;text-align:center;position:relative;}
  section.map-bg{
    background:
      linear-gradient(180deg, var(--khaki-claro), #ece0bd 60%, var(--khaki-claro));
    max-width:100%;
  }
  section.map-bg > .inner{max-width:820px;margin:0 auto;}

  .section-badge{
    display:inline-block;
    background:var(--selva);
    color:#fff;
    text-transform:uppercase;
    font-weight:bold;
    letter-spacing:2px;
    font-size:.75rem;
    padding:8px 20px;
    border-radius:30px;
    margin-bottom:18px;
  }
  h2{
    font-size:1.5rem;
    color:var(--selva-oscura);
    margin:0 0 20px;
    text-transform:uppercase;
  }
  .message{
    font-size:1.1rem;
    line-height:1.7;
    background:#fff;
    border:3px solid var(--khaki);
    border-radius:18px;
    padding:26px 24px;
    position:relative;
    box-shadow:0 6px 0 var(--khaki);
  }
  .message::before{content:"🐾";position:absolute;top:-16px;left:20px;font-size:1.6rem;background:var(--khaki-claro);padding:0 6px;}

  .tematica-card{
    display:inline-flex;
    align-items:center;
    gap:12px;
    background:linear-gradient(135deg, var(--selva), var(--selva-oscura));
    color:#fff;
    padding:18px 26px;
    border-radius:16px;
    margin-top:16px;
    font-weight:bold;
    box-shadow:0 6px 0 var(--tinta);
    max-width:100%;
  }
  .tematica-card .ico{font-size:1.8rem;}

  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:10px 0 0;}
  .countdown div{
    background:#fff;
    border:3px solid var(--selva);
    border-radius:14px;
    padding:14px 10px;
    min-width:68px;
    box-shadow:0 5px 0 var(--selva);
  }
  .cd-num{display:block;font-size:1.8rem;font-weight:900;color:var(--selva-oscura);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--ocre);}

  .map-card{
    background:#fff;
    border:3px dashed var(--ocre);
    border-radius:18px;
    padding:26px 22px;
    max-width:520px;
    margin:0 auto;
  }
  .map-card .lugar{font-size:1.2rem;font-weight:bold;color:var(--selva-oscura);margin:6px 0;}
  .map-card a.map-link{
    display:inline-block;
    margin-top:14px;
    background:var(--ocre);
    color:#fff;
    text-decoration:none;
    padding:10px 22px;
    border-radius:30px;
    font-weight:bold;
    box-shadow:0 4px 0 #8a5a1f;
  }

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:14px;cursor:pointer;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.15);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,30,15,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-box{
    background:#fff;
    border:3px solid var(--selva);
    border-radius:20px;
    padding:28px 22px;
    max-width:420px;
    margin:0 auto;
    box-shadow:0 6px 0 var(--selva);
  }
  .rsvp-form{display:flex;flex-direction:column;gap:14px;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:.5px;color:var(--selva-oscura);font-weight:bold;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:10px;border:2px solid var(--khaki);border-radius:10px;margin-top:5px;width:100%;
  }
  .rsvp-form button{
    background:var(--sol);
    color:var(--tinta);
    border:0;
    padding:13px;
    border-radius:10px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:1px;
    cursor:pointer;
    box-shadow:0 4px 0 var(--ocre);
  }
  .rsvp-form button:active{transform:translateY(2px);box-shadow:0 2px 0 var(--ocre);}
  .rsvp-whatsapp{display:block;text-align:center;color:var(--selva);font-weight:bold;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--selva-oscura);font-weight:bold;}

  footer{
    text-align:center;
    padding:34px 20px;
    background:var(--selva-oscura);
    color:var(--khaki-claro);
    font-size:.9rem;
  }
  footer .roar{font-size:1.4rem;display:block;margin-bottom:6px;}

  @media (max-width:480px){
    .hero-content h1{font-size:2rem;}
    .hero-age .num{font-size:2.2rem;}
    .hero::before{font-size:1rem;letter-spacing:8px;}
  }
</style></head>
<body>

  <div class="hero"><div class="hero-content">
    <span class="stamp">Expedición especial</span>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="hero-age"><span class="num">${esc(d.edad)}</span><span class="txt">años<br>de aventura</span></div>
    <p class="tag">🦁 Safari en la Selva 🐘</p>
  </div></div>

  <div class="leaf-strip"></div>

  <section>
    <span class="section-badge">Cuenta regresiva</span>
    <h2>Faltan para la expedición</h2>
    ${cd.html}
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <span class="section-badge">Mensaje</span>
    <h2>¡Te invitamos a explorar!</h2>
    ${d.mensaje ? `<p class="message">${esc(d.mensaje)}</p>` : ""}
    ${d.tematica ? `<div class="tematica-card"><span class="ico">🎒</span><span>${esc(d.tematica)}</span></div>` : ""}
  </section>` : ""}

  <section class="map-bg"><div class="inner">
    <span class="section-badge">Campamento base</span>
    <h2>¿Dónde es la aventura?</h2>
    <div class="map-card">
      <p>📅 ${esc(d.fecha)}${d.hora ? ` — 🕐 ${esc(d.hora)}` : ""}</p>
      ${d.lugar ? `<p class="lugar">📍 ${esc(d.lugar)}</p>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver mapa del territorio →</a>` : ""}
    </div>
  </div></section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-badge">Galería</span>
    <h2>Fotos de la selva</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <span class="section-badge">RSVP</span>
    <h2>Confirmá tu lugar en la expedición</h2>
    <div class="rsvp-box">${rsvp.html}</div>
  </section>

  <footer>
    <span class="roar">🦁🐘🦒🐒🌴</span>
    ¡Te esperamos para vivir la aventura, ${esc(d.nombreChico)}!
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "infantiles", name: "Safari Aventura",
  summary: "Cumpleaños infantil con temática safari y selva, en verdes y ocres, con estética de expedición y mapa de aventura.",
  accent: "#4c7a3f", schema: infantilSchema, sampleData, render,
};
