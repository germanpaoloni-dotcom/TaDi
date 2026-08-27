const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "bau-moderno-minimal";

const sampleData = {
  nombreChico: "Mateo",
  padres: "Florencia y Nahuel",
  padrinos: "Agustina y Bruno",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Parroquia San Francisco",
  horaFiesta: "13:00",
  lugarFiesta: "Espacio Lumière, Palermo",
  direccionMapa: "https://maps.google.com/?q=Espacio+Lumiere+Palermo",
  mensaje: "Con el corazón lleno de fe y alegría, queremos compartir con ustedes el bautismo de Mateo. Su presencia es el mejor regalo.",
  whatsapp: "5491100000023",
  coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544213456-93d3d5c3c8de?w=800&q=80",
    "https://images.unsplash.com/photo-1765947382923-578ab761b7fc?w=800&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
  ],
};

// Formatea una fecha ISO (YYYY-MM-DD) a partes en español sin desfase de
// zona horaria (se arma la fecha a partir de las partes, no del string ISO).
function formatFechaLarga(fechaISO) {
  const vacio = { diaSemana: "", diaNum: "", mes: "", anio: "" };
  if (!fechaISO) return vacio;
  const [y, m, day] = fechaISO.split("-").map(Number);
  if (!y || !m || !day) return vacio;
  const dt = new Date(y, m - 1, day);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return { diaSemana: dias[dt.getDay()], diaNum: String(day).padStart(2, "0"), mes: meses[m - 1], anio: y };
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#b9924e");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cdb1");
  const gal = galleryWidget(d.galeria, "galb1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const f = formatFechaLarga(d.fecha);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#f8f5f0;
    --card:#ffffff;
    --ink:#4a4642;
    --muted:#9a9188;
    --line:#e7e0d6;
    --gold:${accent};
    --gold-soft:color-mix(in srgb, ${accent}, white 50%);
    --blue:#a9c3d9;
    --blue-deep:#8fadc9;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;max-width:100%;overflow-x:hidden;}
  body{
    font-family:'Montserrat',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
    background:var(--bg);
    color:var(--ink);
    line-height:1.7;
  }
  .wrap{max-width:620px;margin:0 auto;padding:0 24px;}
  a{color:var(--gold);}
  .script{font-family:'Great Vibes',cursive;}

  /* HERO */
  .hero{
    position:relative;
    overflow:hidden;
    background:
      radial-gradient(circle at 85% 8%, rgba(169,195,217,.28) 0%, transparent 55%),
      var(--bg);
    padding:clamp(52px,11vw,88px) 24px clamp(44px,8vw,64px);
  }
  .hero-cross{
    position:absolute;
    top:-6%;
    right:6%;
    width:120px;
    height:340px;
    pointer-events:none;
    z-index:0;
  }
  .hero-cross::before,
  .hero-cross::after{
    content:"";
    position:absolute;
    background:linear-gradient(180deg, var(--blue) 0%, var(--blue-deep) 100%);
    filter:blur(2px);
    opacity:.55;
    border-radius:6px;
  }
  .hero-cross::before{ /* barra vertical */
    top:0; left:50%;
    width:34px; height:100%;
    transform:translateX(-50%);
  }
  .hero-cross::after{ /* barra horizontal */
    top:20%; left:0;
    width:100%; height:30px;
  }
  @media (max-width:520px){
    .hero-cross{width:74px;height:220px;top:-4%;right:4%;}
    .hero-cross::before{width:22px;}
    .hero-cross::after{height:20px;}
  }
  .hero-inner{
    position:relative;
    z-index:1;
    max-width:520px;
    margin:0 auto;
    text-align:center;
  }
  .eyebrow{
    display:block;
    font-size:.72rem;
    letter-spacing:.28em;
    text-transform:uppercase;
    color:var(--muted);
    margin:0 0 18px;
  }
  h1.name{
    font-family:'Great Vibes',cursive;
    font-weight:400;
    font-size:clamp(3.4rem,17vw,5.6rem);
    line-height:1;
    margin:0 0 6px;
    color:var(--gold);
  }
  .filiacion{
    font-size:.8rem;
    letter-spacing:.24em;
    text-transform:uppercase;
    color:var(--ink);
    opacity:.75;
    margin:0 0 30px;
  }
  .datetime-row{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:18px;
    margin:0 0 22px;
    flex-wrap:wrap;
  }
  .dt-block{text-align:center;}
  .dt-hora{display:block;font-size:1.05rem;font-weight:600;letter-spacing:.03em;}
  .dt-dia{display:block;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-top:2px;}
  .dt-divider{width:1px;height:40px;background:var(--gold-soft);}
  .dt-num{display:block;font-size:1.6rem;font-weight:600;line-height:1;color:var(--gold);}
  .dt-mes{display:block;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:4px;}
  .lugar-ceremonia{
    font-size:.85rem;
    letter-spacing:.06em;
    text-transform:uppercase;
    color:var(--muted);
  }

  section{padding:clamp(38px,7vw,60px) 0;}
  section + section{border-top:1px solid var(--line);}
  .section-title{
    text-align:center;
    font-size:.72rem;
    letter-spacing:.3em;
    text-transform:uppercase;
    color:var(--gold);
    margin:0 0 28px;
  }

  /* FIESTA CARD */
  .fiesta-card{
    background:linear-gradient(135deg, var(--blue) 0%, var(--blue-deep) 100%);
    border-radius:4px;
    padding:clamp(32px,7vw,48px) clamp(24px,6vw,44px);
    text-align:center;
    color:#fff;
    position:relative;
    box-shadow:6px 0 0 0 var(--gold-soft);
  }
  .fiesta-pretexto{
    font-size:.78rem;
    letter-spacing:.12em;
    text-transform:uppercase;
    opacity:.92;
    margin:0 0 4px;
  }
  .fiesta-pretexto strong{font-weight:700;}
  .fiesta-lugar{
    font-family:'Great Vibes',cursive;
    font-size:clamp(2.2rem,8vw,3rem);
    margin:14px 0 10px;
    line-height:1;
  }
  .fiesta-map{
    display:inline-block;
    margin-top:16px;
    font-size:.78rem;
    letter-spacing:.08em;
    text-transform:uppercase;
    color:#fff;
    text-decoration:none;
    border-bottom:1px solid rgba(255,255,255,.55);
    padding-bottom:2px;
  }
  .fiesta-map:hover{border-color:#fff;}

  /* COUNTDOWN */
  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .countdown > div{
    min-width:74px;
    flex:1 1 74px;
    max-width:96px;
    text-align:center;
    background:var(--card);
    border:1px solid var(--line);
    padding:16px 6px;
  }
  .cd-num{display:block;font-size:clamp(1.4rem,5vw,1.9rem);font-weight:600;color:var(--gold);}
  .cd-label{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}

  /* FAMILIA */
  .familia{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:18px;
  }
  @media (max-width:520px){
    .familia{grid-template-columns:1fr;}
  }
  .familia-card{text-align:center;padding:18px 12px;}
  .familia-card .tag{
    font-size:.7rem;letter-spacing:.24em;text-transform:uppercase;color:var(--ink);
    font-weight:700;
    margin-bottom:12px;display:block;
  }
  .familia-divider{width:30px;height:1px;background:var(--gold);margin:0 auto 12px;opacity:.7;}
  .familia-card .names{font-size:1rem;font-weight:400;color:var(--muted);letter-spacing:.02em;}

  /* MENSAJE */
  .mensaje-box{max-width:440px;margin:0 auto;text-align:center;}
  .mensaje-box .quote-mark{
    font-family:'Great Vibes',cursive;
    font-size:2.6rem;
    color:var(--gold);
    display:block;
    line-height:1;
    margin-bottom:6px;
  }
  .mensaje-box p{
    font-size:.95rem;
    color:var(--muted);
    font-style:italic;
    margin:0;
  }

  /* MOMENTOS */
  .cover-frame{
    max-width:280px;
    margin:0 auto 22px;
    border-radius:4px;
    overflow:hidden;
    box-shadow:6px 6px 0 0 var(--gold-soft);
  }
  .cover-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:4/5;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:4px;cursor:pointer;display:block;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,26,22,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:88%;border-radius:6px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:0 auto;}
  .rsvp-form label{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:block;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;
    width:100%;
    margin-top:6px;
    padding:12px 14px;
    border:1px solid var(--line);
    border-radius:2px;
    background:var(--card);
    color:var(--ink);
    font-size:.95rem;
  }
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{
    background:var(--gold);
    color:#fff;
    border:0;
    padding:14px;
    border-radius:2px;
    text-transform:uppercase;
    letter-spacing:.16em;
    font-size:.76rem;
    cursor:pointer;
    margin-top:6px;
    transition:opacity .2s;
  }
  .rsvp-form button:hover{opacity:.88;}
  .rsvp-whatsapp{text-align:center;font-size:.85rem;color:var(--blue-deep);text-decoration:none;}
  .rsvp-whatsapp:hover{text-decoration:underline;}
  .rsvp-status{text-align:center;font-weight:600;color:#6f9d6f;min-height:1.2em;}

  footer{
    text-align:center;
    padding:34px 24px 48px;
  }
  footer .foot-line{
    display:block;
    font-size:.68rem;
    letter-spacing:.32em;
    text-transform:uppercase;
    color:var(--muted);
    margin-bottom:10px;
  }
  footer .foot-msg{
    font-size:.85rem;
    color:var(--ink);
  }
  footer .heart{color:var(--gold);}
</style></head>
<body>

  <header class="hero">
    <div class="hero-cross" aria-hidden="true"></div>
    <div class="hero-inner">
      <span class="eyebrow">Acompáñanos al bautizo de</span>
      <h1 class="name">${esc(d.nombreChico)}</h1>
      <p class="filiacion">Hijo${d.padres ? " de " + esc(d.padres) : ""}</p>
      <div class="datetime-row">
        <div class="dt-block">
          ${d.horaCeremonia ? `<span class="dt-hora">${esc(d.horaCeremonia)}</span>` : ""}
          <span class="dt-dia">${esc(f.diaSemana)}</span>
        </div>
        <div class="dt-divider"></div>
        <div class="dt-block">
          <span class="dt-num">${esc(f.diaNum)}</span>
          <span class="dt-mes">de ${esc(f.mes)}</span>
        </div>
      </div>
      ${d.lugarCeremonia ? `<p class="lugar-ceremonia">${esc(d.lugarCeremonia)}</p>` : ""}
    </div>
  </header>

  ${d.horaFiesta || d.lugarFiesta ? `<section>
    <div class="wrap">
      <div class="fiesta-card">
        ${d.horaFiesta ? `<p class="fiesta-pretexto">Los esperamos a partir de las <strong>${esc(d.horaFiesta)}</strong> en</p>` : ""}
        ${d.lugarFiesta ? `<p class="fiesta-lugar">${esc(d.lugarFiesta)}</p>` : ""}
        ${d.direccionMapa ? `<a class="fiesta-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
      </div>
    </div>
  </section>` : ""}

  <section>
    <div class="wrap">
      <p class="section-title">Faltan</p>
      ${cd.html}
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="section-title">Padrinos</p>
      <div class="familia">
        ${d.padres ? `<div class="familia-card">
          <span class="tag">Papás</span>
          <div class="familia-divider"></div>
          <div class="names">${esc(d.padres)}</div>
        </div>` : ""}
        ${d.padrinos ? `<div class="familia-card">
          <span class="tag">Padrinos</span>
          <div class="familia-divider"></div>
          <div class="names">${esc(d.padrinos)}</div>
        </div>` : ""}
      </div>
    </div>
  </section>

  ${d.mensaje ? `<section>
    <div class="wrap">
      <div class="mensaje-box">
        <span class="quote-mark">“</span>
        <p>${esc(d.mensaje)}</p>
      </div>
    </div>
  </section>` : ""}

  <section>
    <div class="wrap">
      ${d.coverImage || (d.galeria && d.galeria.length) ? `<p class="section-title">Momentos</p>` : ""}
      ${d.coverImage ? `<div class="cover-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div>` : ""}
      ${d.galeria && d.galeria.length ? gal.html : ""}
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="section-title">Confirmar asistencia</p>
      ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <span class="foot-line">${esc(d.nombreChico)}${f.anio ? " · " + esc(String(f.anio)) : ""}</span>
    <span class="foot-msg">Con cariño esperamos celebrar este día junto a ustedes <span class="heart">♥</span></span>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg, #f8f5f0 0%, #f8f5f0 55%, ${d.accent2} 150%);">
    <div style="position:absolute;top:-14px;right:14px;width:26px;height:96px;border-radius:8px;background:linear-gradient(180deg, ${d.accent2}, color-mix(in srgb, ${d.accent2}, black 15%));filter:blur(1px);opacity:.55;"></div>
    <div style="position:absolute;top:26px;right:-6px;width:64px;height:20px;border-radius:8px;background:linear-gradient(180deg, ${d.accent2}, color-mix(in srgb, ${d.accent2}, black 15%));filter:blur(1px);opacity:.55;"></div>
    <div style="position:relative;z-index:1;text-align:center;padding:0 14px;">
      <div style="font-family:'Segoe Script','Brush Script MT',cursive;font-size:1.5rem;color:${d.accent};line-height:1;">${esc(d.name)}</div>
      <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#8d8377;font-family:Arial,sans-serif;margin-top:6px;">Bautismo</div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "bautismos", name: "Moderno Minimal",
  summary: "Diseño editorial minimalista inspirado en acuarela: cruz celeste difuminada, nombre en caligrafía dorada y bloque en azul polvoriento para los datos de la celebración.",
  accent: "#b9924e", accent2: "#a9c3d9", schema: bautismoSchema, sampleData, render, cardPreview,
};
