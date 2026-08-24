const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "emp-gala-aniversario";

const sampleData = {
  nombreEvento: "20° Aniversario Grupo Andina",
  empresa: "Grupo Andina",
  fecha: "2027-10-30", hora: "20:30", lugar: "Salón Alvear, CABA",
  direccionMapa: "https://maps.google.com/?q=Salon+Alvear+CABA",
  descripcion: "Celebramos 20 años de historia junto a nuestro equipo, clientes y aliados. Una noche de gala para agradecer y brindar por lo que viene.",
  agenda: "20:30 - Recepción\n21:15 - Palabras de la dirección\n21:45 - Cena de gala\n23:00 - Show en vivo y baile",
  oradores: "Roberto Aguilar - CEO, Grupo Andina",
  dressCode: "Formal / Black tie",
  contacto: "5491100000008",
  coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#d9a441");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : sampleData.fecha, "cd9");
  const gal = galleryWidget(d.galeria || [], "gal9");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.contacto });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const agenda = String(d.agenda || "")
    .split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => {
      const idx = l.indexOf("-");
      return idx === -1 ? ["", l] : [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    });

  const aniversarioNum = (String(d.nombreEvento || "").match(/\d+/) || [])[0] || null;

  const oradores = String(d.oradores || "")
    .split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => {
      const idx = l.lastIndexOf("-");
      return idx === -1 ? [l, ""] : [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --navy:#16232e;
    --navy2:#1e3242;
    --gold:${accent};
    --gold-dim:color-mix(in srgb, ${accent}, black 20%);
    --cream:#f4efe4;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Montserrat',sans-serif;background:var(--navy);color:var(--cream);overflow-x:hidden;}
  a{color:inherit;}
  .wrap{max-width:720px;margin:0 auto;padding:0 24px;}

  /* decorative confetti ribbon svg — explicit size to avoid huge default render */
  .ribbon{width:26px;height:60px;position:absolute;opacity:.85;}

  header.hero{
    position:relative;
    text-align:center;
    padding:64px 24px 56px;
    background:
      linear-gradient(180deg, rgba(20,32,42,.72) 0%, rgba(20,32,42,.85) 55%, var(--navy) 100%),
      url('${esc(d.coverImage)}') center/cover no-repeat;
    overflow:hidden;
  }
  header.hero .content{max-width:640px;margin:0 auto;position:relative;z-index:2;}
  header.hero .tag{
    letter-spacing:4px;text-transform:uppercase;font-size:.72rem;
    color:var(--gold);font-weight:600;margin-bottom:18px;
  }
  .hero-logo-wrap{
    display:inline-flex;align-items:center;justify-content:center;
    background:#fff;border-radius:10px;padding:12px 20px;margin-bottom:18px;
  }
  .hero-logo{display:block;max-height:38px;max-width:170px;width:auto;height:auto;}
  header.hero .big-num{
    font-size:clamp(4.5rem,22vw,8.5rem);
    font-weight:800;
    color:var(--gold);
    line-height:.85;
    margin:0;
    letter-spacing:-2px;
  }
  header.hero h1{
    font-size:clamp(1.5rem,5vw,2.2rem);
    font-weight:400;
    text-transform:uppercase;
    letter-spacing:2px;
    margin:10px 0 0;
    color:#fff;
  }
  header.hero h1 strong{display:block;color:var(--gold);font-weight:800;letter-spacing:3px;}
  header.hero .desc{max-width:520px;margin:26px auto 0;font-size:1rem;line-height:1.5;color:#e9e4d8;}
  header.hero .script{
    font-family:'Dancing Script',cursive;
    color:var(--gold);
    font-size:clamp(1.3rem,4vw,1.7rem);
    margin:14px 0 0;
  }

  section{max-width:720px;margin:0 auto;padding:48px 24px;border-top:1px solid rgba(217,164,65,.18);text-align:center;}
  h2{
    color:var(--gold);
    text-transform:uppercase;
    letter-spacing:3px;
    font-size:1rem;
    font-weight:700;
    margin:0 0 26px;
  }
  h2 span{display:block;color:#fff;font-weight:400;letter-spacing:2px;font-size:.85rem;margin-top:4px;}

  .info-line{margin:18px auto 6px;max-width:480px;font-size:.98rem;color:#e9e4d8;line-height:1.7;}
  .info-line strong{color:var(--gold);}
  .map-link{display:inline-block;margin-top:10px;color:var(--gold);text-decoration:none;border-bottom:1px solid var(--gold-dim);font-size:.9rem;}
  .dresscode{
    display:inline-block;margin-top:18px;padding:8px 20px;border:1px solid var(--gold);
    border-radius:30px;font-size:.8rem;letter-spacing:1px;text-transform:uppercase;color:var(--gold);
  }

  /* countdown widget */
  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .countdown > div{
    background:var(--navy2);border:1px solid rgba(217,164,65,.4);border-radius:8px;
    padding:14px 16px;min-width:68px;
  }
  .cd-num{font-size:1.8rem;font-weight:800;color:var(--gold);display:block;line-height:1;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1px;color:#c7bfa8;}

  /* agenda */
  .agenda-list{list-style:none;margin:0 auto;padding:0;max-width:460px;text-align:left;}
  .agenda-list li{
    display:flex;gap:16px;align-items:baseline;padding:12px 0;border-bottom:1px dashed rgba(217,164,65,.25);
  }
  .agenda-list li:last-child{border-bottom:none;}
  .agenda-list .time{color:var(--gold);font-weight:700;min-width:64px;font-size:.9rem;}
  .agenda-list .act{color:#e9e4d8;font-size:.95rem;}

  /* oradores */
  .speakers{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;}
  .speaker-card{
    background:var(--navy2);border:1px solid rgba(217,164,65,.25);border-radius:10px;
    padding:20px 18px;min-width:180px;flex:1 1 200px;max-width:260px;
  }
  .speaker-card .name{color:var(--gold);font-weight:700;font-size:.98rem;}
  .speaker-card .role{color:#c7bfa8;font-size:.8rem;margin-top:4px;}

  /* gallery */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;}
  .gallery-item img{width:100%;height:150px;object-fit:cover;border-radius:6px;cursor:pointer;filter:grayscale(35%) brightness(.92);transition:filter .2s;}
  .gallery-item img:hover{filter:grayscale(0%) brightness(1);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,16,20,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* rsvp */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#c7bfa8;display:block;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px 12px;border:1px solid rgba(217,164,65,.35);border-radius:6px;
    background:var(--navy2);color:#fff;margin-top:6px;width:100%;font-size:.95rem;
  }
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{
    background:var(--gold);color:var(--navy);border:0;padding:13px;border-radius:6px;
    cursor:pointer;font-weight:800;text-transform:uppercase;letter-spacing:1px;font-size:.85rem;margin-top:4px;
  }
  .rsvp-whatsapp{text-align:center;color:var(--gold);text-decoration:none;font-size:.85rem;border-bottom:1px solid var(--gold-dim);align-self:center;}
  .rsvp-status{font-weight:700;color:#8fd19e;text-align:center;min-height:1.2em;}

  footer{text-align:center;padding:34px 24px 44px;font-size:.78rem;color:#8a8470;border-top:1px solid rgba(217,164,65,.18);}
  footer .foot-brand{color:var(--gold);font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:.75rem;margin-bottom:6px;}

  @media (max-width:420px){
    header.hero{padding:48px 16px 40px;}
    .countdown > div{min-width:60px;padding:10px 10px;}
    .cd-num{font-size:1.4rem;}
    .speaker-card{max-width:100%;flex:1 1 100%;}
  }
</style></head>
<body>

  <header class="hero">
    <svg class="ribbon" style="top:14%;left:8%;transform:rotate(-15deg);" viewBox="0 0 24 60" width="26" height="60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2c8 6 -6 12 2 18c8 6 -6 12 2 18c8 6 -6 12 2 18" stroke="${accent}" stroke-width="4" stroke-linecap="round"/></svg>
    <svg class="ribbon" style="top:60%;right:10%;transform:rotate(20deg);" viewBox="0 0 24 60" width="26" height="60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2c8 6 -6 12 2 18c8 6 -6 12 2 18c8 6 -6 12 2 18" stroke="${accent}" stroke-width="4" stroke-linecap="round"/></svg>
    <div class="content">
      ${d.logo ? `<div class="hero-logo-wrap"><img class="hero-logo" src="${esc(d.logo)}" alt="${esc(d.empresa)}"></div>` : (d.empresa ? `<div class="tag">${esc(d.empresa)}</div>` : "")}
      ${aniversarioNum ? `<p class="big-num">${esc(aniversarioNum)}</p>` : ""}
      <h1>${esc(d.nombreEvento)}</h1>
      ${d.descripcion ? `<p class="desc">${esc(d.descripcion)}</p>` : ""}
      <p class="script">¡Que vengan muchos años de conquistas!</p>
    </div>
  </header>

  <section>
    <h2>Cuenta regresiva<span>Faltan pocos días para celebrar</span></h2>
    ${cd.html}
    <p class="info-line">📅 <strong>${esc(d.fecha)}</strong>${d.hora ? ` · 🕗 <strong>${esc(d.hora)} hs</strong>` : ""}${d.lugar ? `<br>📍 ${esc(d.lugar)}` : ""}</p>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    ${d.dressCode ? `<br><span class="dresscode">Dress code: ${esc(d.dressCode)}</span>` : ""}
  </section>

  ${agenda.length ? `
  <section>
    <h2>Programa de la noche<span>Así vivimos la velada</span></h2>
    <ul class="agenda-list">
      ${agenda.map(([time, act]) => `<li>${time ? `<span class="time">${esc(time)}</span>` : ""}<span class="act">${esc(act)}</span></li>`).join("")}
    </ul>
  </section>` : ""}

  ${oradores.length && oradores[0][0] ? `
  <section>
    <h2>Palabras de<span>Nuestros anfitriones</span></h2>
    <div class="speakers">
      ${oradores.map(([name, role]) => `<div class="speaker-card"><div class="name">${esc(name)}</div>${role ? `<div class="role">${esc(role)}</div>` : ""}</div>`).join("")}
    </div>
  </section>` : ""}

  ${d.galeria && d.galeria.length ? `
  <section>
    <h2>Momentos de la empresa<span>20 años en imágenes</span></h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2>Confirmá tu asistencia<span>Te esperamos para brindar juntos</span></h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${d.empresa ? `<div class="foot-brand">${esc(d.empresa)}</div>` : ""}
    Gracias por acompañarnos en estos 20 años de historia.
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

module.exports = {
  id, category: "empresariales", name: "Gala Aniversario",
  summary: "Gala corporativa en azul noche y dorado, con número de aniversario protagonista y línea de tiempo del evento.",
  accent: "#d9a441", accent2: "#16232e", schema: empresarialSchema, sampleData, render,
};
