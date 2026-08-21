const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "emp-conferencia-corporativa";

function parseLines(text, sep = "-") {
  return String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf(sep);
      return idx === -1 ? [l.trim(), ""] : [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    });
}

const sampleData = {
  nombreEvento: "Global Conference",
  empresa: "Nortia",
  fecha: "2027-05-14",
  hora: "09:00",
  lugar: "Four Seasons, Vancouver",
  direccionMapa: "https://maps.google.com/?q=Four+Seasons+Vancouver",
  descripcion:
    "Dos jornadas para conectar con líderes de la industria, compartir visión estratégica y celebrar los logros del año junto a todo el equipo global.",
  agenda:
    "09:00 - Acreditación y café de bienvenida\n10:00 - Apertura y keynote inaugural\n11:30 - Panel: el futuro de la industria\n13:00 - Almuerzo y networking\n15:00 - Sesiones simultáneas por área\n18:30 - Cóctel de cierre",
  oradores:
    "Andrea Sosa - CEO, Nortia\nMartín Cabrera - CFO, Nortia\nLucía Beltrán - VP Estrategia Global",
  dressCode: "Formal de negocios",
  contacto: "5491100000006",
  coverImage: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    "https://images.unsplash.com/photo-1560523159-4a9692d222f8?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#9fb4c7");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "09:00"}:00` : sampleData.fecha, "cd-conf");
  const gal = galleryWidget(d.galeria || [], "gal-conf");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: false, withMenu: false, whatsapp: d.contacto });
  const agenda = parseLines(d.agenda);
  const oradores = parseLines(d.oradores);
  const qrData = encodeURIComponent(`Registro: ${d.nombreEvento} - ${d.__slug || "demo"}`);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#0b151f;
    --navy:#152436;
    --navy2:#1c3347;
    --card:#132231;
    --border:#2a3f52;
    --steel:${accent};
    --steel-dim:color-mix(in srgb, ${accent}, black 28%);
    --text:#eef3f7;
    --muted:#8ea0b1;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;
    background:var(--ink);
    color:var(--text);
    font-family:'Work Sans',Arial,sans-serif;
    line-height:1.6;
    font-weight:300;
  }
  h1,h2,h3{font-family:'Oswald','Work Sans',Arial,sans-serif;font-weight:600;}
  a{color:var(--steel);}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    min-height:clamp(460px,86vh,760px);
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    isolation:isolate;
    padding:clamp(40px,8vw,80px) 20px;
  }
  .hero-bg{
    position:absolute; inset:0; z-index:-2;
    background-image:var(--cover);
    background-size:cover; background-position:center;
    filter:grayscale(.25) brightness(.55);
  }
  .hero-overlay{
    position:absolute; inset:0; z-index:-1;
    background:linear-gradient(180deg, rgba(11,21,31,.55) 0%, rgba(11,21,31,.55) 40%, rgba(11,21,31,.92) 92%),
               linear-gradient(90deg, rgba(11,21,31,.35), transparent 45%, transparent 55%, rgba(11,21,31,.35));
  }
  .hero-inner{
    position:relative;
    max-width:520px;
    margin:0 auto;
    text-align:center;
  }
  .hero-mark{
    font-family:'Oswald',sans-serif;
    font-weight:600;
    font-size:.95rem;
    letter-spacing:5px;
    text-transform:uppercase;
    color:var(--steel);
    margin-bottom:clamp(20px,5vw,40px);
  }
  .hero-logo-wrap{
    display:inline-flex; align-items:center; justify-content:center;
    background:#fff; border-radius:10px; padding:14px 22px;
    margin:0 auto clamp(20px,5vw,40px);
  }
  .hero-logo{display:block; max-height:42px; max-width:190px; width:auto; height:auto;}
  .hero-title{
    margin:0;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:clamp(2px,.6vw,6px);
    font-size:clamp(2.3rem,9vw,4.6rem);
    line-height:1.05;
    color:#f4f8fb;
    text-shadow:0 2px 24px rgba(0,0,0,.35);
  }
  .hero-title .thin{font-weight:300; color:var(--steel);}
  .hero-divider{margin:clamp(20px,5vw,34px) auto; width:70px; height:14px;}
  .hero-meta{
    margin:0;
    font-family:'Oswald',sans-serif;
    font-weight:500;
    font-size:clamp(.85rem,2.2vw,1rem);
    letter-spacing:2px;
    text-transform:uppercase;
    color:#fff;
  }
  .hero-meta.sub{color:var(--steel); font-weight:400; margin-top:6px;}
  .hero-desc{
    margin:clamp(24px,6vw,40px) 0 0;
    font-size:.92rem;
    color:var(--muted);
    max-width:420px;
    margin-left:auto; margin-right:auto;
  }

  /* ---------- LAYOUT ---------- */
  .layout{max-width:880px; margin:0 auto; padding:0 20px 40px;}
  .section{padding:clamp(40px,7vw,64px) 0; border-bottom:1px solid var(--border);}
  .section:last-of-type{border-bottom:0;}
  .eyebrow{
    display:block;
    font-family:'Oswald',sans-serif;
    text-transform:uppercase;
    letter-spacing:4px;
    font-size:.7rem;
    color:var(--steel);
    margin-bottom:8px;
  }
  .section-title{
    font-size:clamp(1.4rem,3.4vw,2rem);
    margin:0 0 28px;
    text-transform:uppercase;
    letter-spacing:1px;
    color:var(--text);
  }
  .card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:2px;
    padding:clamp(20px,4vw,32px);
  }

  /* countdown (structure from widget) */
  .countdown{display:flex; gap:2px; flex-wrap:wrap; justify-content:center;}
  .countdown > div{
    flex:1; min-width:74px; text-align:center;
    padding:18px 8px;
    border-right:1px solid var(--border);
  }
  .countdown > div:last-child{border-right:0;}
  .cd-num{
    font-family:'Oswald',sans-serif;
    font-size:clamp(1.6rem,5vw,2.4rem);
    display:block; font-weight:600; color:#fff;
  }
  .cd-label{font-size:.62rem; text-transform:uppercase; letter-spacing:2px; color:var(--steel-dim);}

  /* description card */
  .desc-card p{color:#c7d3dc; font-size:1rem; margin:0;}

  /* agenda */
  .agenda-list{display:flex; flex-direction:column;}
  .agenda-item{
    display:grid; grid-template-columns:clamp(80px,18vw,110px) 1fr;
    gap:18px; padding:16px 0; border-bottom:1px solid var(--border);
  }
  .agenda-item:last-child{border-bottom:0;}
  .agenda-time{
    font-family:'Oswald',sans-serif; font-weight:600; color:var(--steel);
    font-size:.9rem; letter-spacing:1px;
  }
  .agenda-activity{color:var(--text); font-size:.95rem; font-weight:300;}

  /* speakers */
  .speakers{display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1px; background:var(--border); border:1px solid var(--border);}
  .speaker{background:var(--card); padding:22px 20px; text-align:left;}
  .speaker .avatar{
    width:44px; height:44px; border:1px solid var(--steel-dim);
    display:flex; align-items:center; justify-content:center;
    font-family:'Oswald',sans-serif; font-weight:600; color:var(--steel); font-size:1rem;
    margin-bottom:14px;
  }
  .speaker strong{display:block; font-size:1rem; margin-bottom:3px; font-weight:500; letter-spacing:.3px;}
  .speaker span{font-size:.8rem; color:var(--muted);}

  /* venue */
  .venue-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1px; background:var(--border); border:1px solid var(--border);}
  .venue-item{background:var(--card); padding:18px 20px;}
  .venue-item .label{font-family:'Oswald',sans-serif; font-size:.65rem; text-transform:uppercase; letter-spacing:2px; color:var(--steel); margin-bottom:6px;}
  .venue-item .value{font-size:.95rem; color:var(--text); font-weight:300;}

  /* gallery (structure from widget) */
  .gallery{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px;}
  .gallery img{width:100%; height:150px; object-fit:cover; cursor:pointer; display:block; filter:grayscale(.15);}
  .lightbox{display:none; position:fixed; inset:0; background:rgba(4,8,12,.94); align-items:center; justify-content:center; z-index:60;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%; max-height:86%;}
  .lightbox-close{position:absolute; top:20px; right:28px; color:#fff; font-size:2rem; cursor:pointer; line-height:1;}

  /* qr access */
  .qr-box{display:flex; align-items:center; gap:20px; flex-wrap:wrap;}
  .qr-box img{border:1px solid var(--border);}
  .qr-box p{margin:0; color:var(--muted); font-size:.9rem; max-width:280px;}

  /* rsvp */
  .rsvp-form{display:flex; flex-direction:column; gap:14px; max-width:460px;}
  .rsvp-form label{font-family:'Oswald',sans-serif; font-size:.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--steel);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Work Sans',inherit; padding:11px 12px; border:1px solid var(--border); border-radius:2px;
    margin-top:6px; width:100%; background:var(--navy); color:var(--text);
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none; border-color:var(--steel);}
  .rsvp-form button{
    background:var(--steel); color:var(--ink); border:0; padding:13px; border-radius:2px; cursor:pointer;
    font-family:'Oswald',sans-serif; font-weight:600; letter-spacing:2px; text-transform:uppercase; font-size:.85rem;
  }
  .rsvp-whatsapp{color:var(--steel); font-size:.85rem; text-decoration:none;}
  .rsvp-status{font-weight:500; color:#8fd19e;}

  footer{
    text-align:center; padding:36px 20px; font-size:.75rem; color:var(--muted);
    background:var(--navy2); letter-spacing:1px; text-transform:uppercase;
  }
  footer .brand{color:var(--steel); font-weight:600; margin-bottom:4px; font-family:'Oswald',sans-serif;}
</style></head>
<body>

  <section class="hero" style="--cover:url('${esc(d.coverImage)}')">
    <div class="hero-bg"></div>
    <div class="hero-overlay"></div>
    <div class="hero-inner">
      ${d.logo ? `<div class="hero-logo-wrap"><img class="hero-logo" src="${esc(d.logo)}" alt="${esc(d.empresa)}"></div>` : (d.empresa ? `<div class="hero-mark">${esc(d.empresa)}</div>` : "")}
      <h1 class="hero-title">${esc(d.nombreEvento)}</h1>
      <svg class="hero-divider" width="70" height="14" viewBox="0 0 70 14" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="7" x2="26" y2="7" stroke="#9fb4c7" stroke-width="1"/>
        <line x1="30" y1="3" x2="30" y2="11" stroke="#9fb4c7" stroke-width="1"/>
        <line x1="34" y1="3" x2="34" y2="11" stroke="#9fb4c7" stroke-width="1"/>
        <line x1="44" y1="7" x2="70" y2="7" stroke="#9fb4c7" stroke-width="1"/>
      </svg>
      <p class="hero-meta">${esc(d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p>
      ${d.lugar ? `<p class="hero-meta sub">${esc(d.lugar)}</p>` : ""}
      ${d.descripcion ? `<p class="hero-desc">${esc(d.descripcion)}</p>` : ""}
    </div>
  </section>

  <div class="layout">

    <div class="section">
      <span class="eyebrow">Cuenta regresiva</span>
      <h2 class="section-title">Comienza en</h2>
      <div class="card">
        ${cd.html}
      </div>
    </div>

    ${
      agenda.length
        ? `<div class="section">
      <span class="eyebrow">Agenda</span>
      <h2 class="section-title">Programa del evento</h2>
      <div class="card">
        <div class="agenda-list">
          ${agenda
            .map(
              ([t, a]) =>
                `<div class="agenda-item"><div class="agenda-time">${esc(t)}</div><div class="agenda-activity">${esc(a)}</div></div>`
            )
            .join("")}
        </div>
      </div>
    </div>`
        : ""
    }

    ${
      oradores.length
        ? `<div class="section">
      <span class="eyebrow">Oradores</span>
      <h2 class="section-title">Quiénes exponen</h2>
      <div class="speakers">
        ${oradores
          .map(
            ([n, c]) =>
              `<div class="speaker"><div class="avatar">${esc((n || "?").trim().charAt(0).toUpperCase() || "?")}</div><strong>${esc(n)}</strong><span>${esc(c)}</span></div>`
          )
          .join("")}
      </div>
    </div>`
        : ""
    }

    <div class="section">
      <span class="eyebrow">Sede</span>
      <h2 class="section-title">Detalles del lugar</h2>
      <div class="venue-grid">
        ${d.lugar ? `<div class="venue-item"><div class="label">Lugar</div><div class="value">${esc(d.lugar)}</div></div>` : ""}
        <div class="venue-item"><div class="label">Fecha</div><div class="value">${esc(d.fecha)}</div></div>
        ${d.hora ? `<div class="venue-item"><div class="label">Hora</div><div class="value">${esc(d.hora)} hs</div></div>` : ""}
        ${d.dressCode ? `<div class="venue-item"><div class="label">Dress code</div><div class="value">${esc(d.dressCode)}</div></div>` : ""}
      </div>
      ${d.direccionMapa ? `<p style="margin-top:16px"><a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>` : ""}
    </div>

    ${
      d.galeria && d.galeria.length
        ? `<div class="section">
      <span class="eyebrow">Galería</span>
      <h2 class="section-title">Ediciones anteriores</h2>
      <div class="card">
        ${gal.html}
      </div>
    </div>`
        : ""
    }

    <div class="section">
      <span class="eyebrow">Acceso</span>
      <h2 class="section-title">Tu credencial</h2>
      <div class="card qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}" width="140" height="140" alt="QR de acceso">
        <p>Presentá este código QR en la acreditación el día del evento.</p>
      </div>
    </div>

    <div class="section">
      <span class="eyebrow">RSVP</span>
      <h2 class="section-title">Confirmá tu asistencia</h2>
      <div class="card">
        ${rsvp.html}
      </div>
    </div>

  </div>

  <footer>
    ${d.empresa ? `<div class="brand">${esc(d.empresa)}</div>` : ""}
    ${esc(d.nombreEvento)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id,
  category: "empresariales",
  name: "Conferencia Corporativa",
  summary: "Estética editorial oscura, tipografía condensada y foto de skyline de fondo — ideal para conferencias globales y jornadas ejecutivas.",
  accent: "#152436",
  accent2: "#9fb4c7",
  schema: empresarialSchema,
  sampleData,
  render,
};
