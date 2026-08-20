const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "emp-tech-summit";

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
  nombreEvento: "Tech Summit 2027",
  empresa: "NodeHub Argentina",
  fecha: "2027-05-14",
  hora: "09:30",
  lugar: "Hub Tech CABA - Distrito Tecnológico",
  direccionMapa: "https://maps.google.com/?q=Distrito+Tecnologico+CABA",
  descripcion:
    "Un día completo para conectar con líderes de producto, ingeniería e inversión. Charlas, paneles y demos en vivo sobre IA, escalabilidad y el futuro de las startups en Latinoamérica.",
  agenda:
    "09:30 - Acreditación y coffee de bienvenida\n10:15 - Apertura oficial\n10:45 - Keynote: El futuro de la IA aplicada\n12:00 - Panel: Escalar un producto SaaS en LATAM\n13:30 - Almuerzo y networking\n15:00 - Workshops simultáneos\n17:00 - Demo Day de startups\n18:30 - Cierre y after tech",
  oradores:
    "Sofía Martínez - CEO, NodeHub Argentina\nMatías Ferreyra - CTO, CloudNine\nCarolina Vidal - VP Product, ScaleUp\nDiego Suárez - Founding Engineer, ByteForge",
  dressCode: "Smart casual",
  contacto: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "https://images.unsplash.com/photo-1526378787940-576a539ba69d?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#5fe3ff");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "09:00"}:00` : sampleData.fecha, "cd-tech");
  const gal = galleryWidget(d.galeria || [], "gal-tech");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: false, withMenu: false, whatsapp: d.contacto });
  const agenda = parseLines(d.agenda);
  const oradores = parseLines(d.oradores);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#040a1c;
    --navy:#0a1a42;
    --navy2:#0d2359;
    --blue:#1657d6;
    --cyan:${accent};
    --card:#0a1638;
    --border:#1e3468;
    --text:#eef3ff;
    --muted:#8fa1cc;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;
    background:var(--bg);
    color:var(--text);
    font-family:'Inter',Arial,sans-serif;
    line-height:1.6;
  }
  h1,h2,h3{font-family:'Rajdhani','Inter',Arial,sans-serif; text-transform:uppercase;}
  a{color:var(--cyan);}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    min-height:clamp(460px,86vh,760px);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:clamp(32px,6vw,64px) 20px;
    overflow:hidden;
    isolation:isolate;
  }
  .hero-bg{
    position:absolute; inset:0; z-index:-3;
    background-image:var(--cover);
    background-size:cover; background-position:center;
    filter:saturate(0.6) brightness(0.35);
  }
  .hero-mesh{
    position:absolute; inset:0; z-index:-2;
    background:
      radial-gradient(circle at 78% 22%, color-mix(in srgb, ${accent} 35%, transparent), transparent 45%),
      radial-gradient(circle at 15% 85%, rgba(22,87,214,0.55), transparent 55%),
      linear-gradient(160deg, #030817 0%, #0a1a42 45%, #123a8f 100%);
  }
  .hero-dots{
    position:absolute; z-index:-1; width:96px; height:132px;
    background-image:radial-gradient(rgba(255,255,255,0.55) 1.6px, transparent 1.6px);
    background-size:22px 22px;
    opacity:.55;
  }
  .hero-dots.tl{top:6%; left:5%;}
  .hero-dots.br{bottom:8%; right:6%;}
  .hero-circuit{position:absolute; inset:0; z-index:-1; width:100%; height:100%; pointer-events:none; opacity:.8;}
  .hero .tag{
    text-transform:uppercase; letter-spacing:5px; font-size:.78rem;
    color:var(--text); font-weight:500; margin-bottom:10px; font-family:'Rajdhani',sans-serif;
  }
  .hero-logo-wrap{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:10px;padding:11px 20px;margin-bottom:14px;}
  .hero-logo{display:block;max-height:34px;max-width:170px;width:auto;height:auto;}
  .hero h1{
    font-size:clamp(2.1rem,7.5vw,4.2rem);
    margin:.05em 0;
    font-weight:700;
    color:#fff;
    letter-spacing:1px;
    line-height:1.05;
  }
  .hero .year{
    font-size:clamp(1.4rem,4.5vw,2.2rem);
    font-weight:500;
    color:var(--cyan);
    margin:6px 0 0;
    letter-spacing:2px;
  }
  .hero .sub{color:#c7d3f2; font-size:clamp(.9rem,2vw,1.02rem); max-width:520px; margin:22px auto 0; text-transform:none; font-family:'Inter',sans-serif;}
  .hero .meta{
    margin-top:26px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center;
  }
  .pill{
    border:1px solid color-mix(in srgb, ${accent} 40%, transparent); background:rgba(10,26,66,0.55);
    border-radius:999px; padding:8px 16px; font-size:.85rem; color:var(--text);
    backdrop-filter:blur(4px); font-family:'Inter',sans-serif;
  }
  .pill strong{color:var(--cyan); font-weight:600;}

  /* ---------- LAYOUT ---------- */
  .layout{max-width:960px; margin:0 auto; padding:0 20px 60px;}
  .section{padding:clamp(36px,6vw,56px) 0;}
  .section-title{
    font-size:clamp(1.5rem,3.4vw,2.1rem);
    margin:0 0 6px;
    letter-spacing:.5px;
    font-weight:700;
    color:#fff;
  }
  .section-title .accent{color:var(--cyan);}
  .section-sub{color:var(--muted); margin:0 0 28px; font-size:.95rem; font-family:'Inter',sans-serif;}

  .card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:clamp(20px,3vw,28px);
    position:relative;
    overflow:hidden;
  }
  .card::before{
    content:"";
    position:absolute; top:-1px; left:-1px; right:-1px; height:2px;
    background:linear-gradient(90deg,var(--blue),var(--cyan));
  }

  /* countdown (from widget, style hooked to markup) */
  .countdown{display:flex; gap:12px; flex-wrap:wrap; justify-content:center;}
  .countdown > div{
    flex:1; min-width:70px; text-align:center;
    background:linear-gradient(160deg,rgba(22,87,214,0.25),color-mix(in srgb, ${accent} 8%, transparent));
    border:1px solid var(--border);
    border-radius:10px; padding:16px 8px;
  }
  .cd-num{font-size:clamp(1.4rem,4vw,2rem); display:block; font-weight:700; color:#fff; font-family:'Rajdhani',sans-serif;}
  .cd-label{font-size:.65rem; text-transform:uppercase; letter-spacing:1px; color:var(--muted);}

  /* description */
  .desc-card p{color:#c7d3f2; font-size:1rem; font-family:'Inter',sans-serif;}

  /* agenda timeline */
  .agenda-list{display:flex; flex-direction:column; gap:0;}
  .agenda-item{
    display:grid; grid-template-columns:clamp(70px,15vw,100px) 1fr;
    gap:16px; padding:16px 0; border-bottom:1px solid var(--border);
    position:relative;
  }
  .agenda-item:last-child{border-bottom:0;}
  .agenda-time{
    font-family:'Rajdhani',sans-serif; font-weight:700; color:var(--cyan);
    font-size:1rem;
  }
  .agenda-activity{color:var(--text); font-size:.95rem; font-family:'Inter',sans-serif;}
  .agenda-dot{
    position:absolute; left:calc(clamp(70px,15vw,100px) - 5px); top:22px;
    width:8px; height:8px; border-radius:50%;
    background:var(--cyan); box-shadow:0 0 8px 2px color-mix(in srgb, ${accent} 70%, transparent);
  }

  /* speakers */
  .speakers{display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px;}
  .speaker{
    background:linear-gradient(160deg,rgba(22,87,214,0.2),rgba(10,22,56,0.4));
    border:1px solid var(--border); border-radius:14px; padding:20px; text-align:left;
  }
  .speaker .avatar{
    width:52px; height:52px; border-radius:10px;
    background:linear-gradient(135deg,var(--blue),var(--cyan));
    margin-bottom:14px;
    display:flex; align-items:center; justify-content:center;
    font-family:'Rajdhani',sans-serif; font-weight:700; color:#04102b; font-size:1.2rem;
  }
  .speaker strong{display:block; font-size:1rem; margin-bottom:2px; text-transform:none; font-family:'Inter',sans-serif;}
  .speaker span{font-size:.82rem; color:var(--muted); font-family:'Inter',sans-serif;}

  /* venue */
  .venue-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px;}
  .venue-item{border:1px solid var(--border); border-radius:12px; padding:16px; background:color-mix(in srgb, ${accent} 3%, transparent);}
  .venue-item .label{font-size:.7rem; text-transform:uppercase; letter-spacing:1px; color:var(--cyan); margin-bottom:6px; font-family:'Rajdhani',sans-serif;}
  .venue-item .value{font-size:.95rem; color:var(--text); font-family:'Inter',sans-serif;}

  /* gallery (structure comes from widget, styled here) */
  .gallery{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px;}
  .gallery img{width:100%; height:150px; object-fit:cover; border-radius:10px; cursor:pointer; border:1px solid var(--border); display:block;}
  .lightbox{display:none; position:fixed; inset:0; background:rgba(2,6,18,0.95); align-items:center; justify-content:center; z-index:60;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%; max-height:86%; border-radius:8px;}
  .lightbox-close{position:absolute; top:20px; right:28px; color:#fff; font-size:2rem; cursor:pointer;}

  /* rsvp */
  .rsvp-form{display:flex; flex-direction:column; gap:14px; max-width:460px; font-family:'Inter',sans-serif;}
  .rsvp-form label{font-size:.75rem; text-transform:uppercase; letter-spacing:.5px; color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit; padding:11px 12px; border:1px solid var(--border); border-radius:8px;
    margin-top:6px; width:100%; background:#061127; color:var(--text);
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{
    outline:none; border-color:var(--cyan);
  }
  .rsvp-form button{
    background:linear-gradient(90deg,var(--blue),var(--cyan));
    color:#04102b; border:0; padding:13px; border-radius:8px; cursor:pointer;
    font-weight:700; font-family:'Rajdhani',sans-serif; letter-spacing:.5px; text-transform:uppercase; font-size:1.05rem;
  }
  .rsvp-whatsapp{color:var(--cyan); font-size:.9rem; text-decoration:none;}
  .rsvp-status{font-weight:600; color:#4ade80;}

  footer{
    text-align:center; padding:32px 20px; font-size:.8rem; color:var(--muted);
    border-top:1px solid var(--border); font-family:'Inter',sans-serif;
  }
  footer .brand{color:var(--cyan); font-weight:600; font-family:'Rajdhani',sans-serif; text-transform:uppercase; letter-spacing:1px;}
</style></head>
<body>

  <section class="hero" style="--cover:url('${esc(d.coverImage)}')">
    <div class="hero-bg"></div>
    <div class="hero-mesh"></div>
    <div class="hero-dots tl"></div>
    <div class="hero-dots br"></div>
    <svg class="hero-circuit" width="800" height="600" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#1657d6" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#lineGrad)" stroke-width="1.5">
        <path d="M10 40 H140 V110 H300 V60 H420"/>
        <circle cx="10" cy="40" r="5" fill="${accent}" stroke="none"/>
        <circle cx="140" cy="40" r="4" fill="${accent}" stroke="none"/>
        <circle cx="300" cy="110" r="5" fill="#1657d6" stroke="none"/>
        <path d="M60 20 V90 H180"/>
        <circle cx="60" cy="20" r="4" fill="${accent}" stroke="none"/>
        <path d="M760 500 H620 V420 H480 V470 H360"/>
        <circle cx="760" cy="500" r="5" fill="${accent}" stroke="none"/>
        <circle cx="480" cy="420" r="4" fill="#1657d6" stroke="none"/>
        <circle cx="360" cy="470" r="5" fill="${accent}" stroke="none"/>
        <path d="M700 540 V590"/>
        <circle cx="700" cy="540" r="4" fill="${accent}" stroke="none"/>
      </g>
    </svg>
    ${d.logo ? `<div class="hero-logo-wrap"><img class="hero-logo" src="${esc(d.logo)}" alt="${esc(d.empresa)}"></div>` : `<div class="tag">We are the future</div>`}
    <h1>${esc(d.nombreEvento)}</h1>
    <p class="year">${esc(d.empresa)}</p>
    <p class="sub">${esc(d.descripcion)}</p>
    <div class="meta">
      <span class="pill">📅 <strong>${esc(d.fecha)}</strong></span>
      <span class="pill">🕘 <strong>${esc(d.hora)} hs</strong></span>
      <span class="pill">📍 <strong>${esc(d.lugar)}</strong></span>
    </div>
  </section>

  <div class="layout">

    <div class="section">
      <h2 class="section-title">Faltan <span class="accent">poco</span> para el summit</h2>
      <p class="section-sub">La cuenta regresiva ya empezó.</p>
      <div class="card">
        ${cd.html}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Sobre el <span class="accent">evento</span></h2>
      <div class="card desc-card">
        <p>${esc(d.descripcion)}</p>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Agenda del <span class="accent">día</span></h2>
      <p class="section-sub">Todo lo que vas a vivir en el summit.</p>
      <div class="card">
        <div class="agenda-list">
          ${
            agenda.length
              ? agenda
                  .map(
                    ([t, a]) =>
                      `<div class="agenda-item"><span class="agenda-dot"></span><div class="agenda-time">${esc(t)}</div><div class="agenda-activity">${esc(a)}</div></div>`
                  )
                  .join("")
              : `<p>Agenda a confirmar.</p>`
          }
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Nuestros <span class="accent">oradores</span></h2>
      <p class="section-sub">Referentes de tech, producto e inversión.</p>
      <div class="speakers">
        ${
          oradores.length
            ? oradores
                .map(
                  ([n, c]) =>
                    `<div class="speaker"><div class="avatar">${esc((n || "?").trim().charAt(0).toUpperCase() || "?")}</div><strong>${esc(n)}</strong><span>${esc(c)}</span></div>`
                )
                .join("")
            : `<p>Oradores a confirmar.</p>`
        }
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Sede y <span class="accent">detalles</span></h2>
      <div class="card">
        <div class="venue-grid">
          <div class="venue-item"><div class="label">Lugar</div><div class="value">${esc(d.lugar)}</div></div>
          <div class="venue-item"><div class="label">Fecha</div><div class="value">${esc(d.fecha)}</div></div>
          <div class="venue-item"><div class="label">Hora</div><div class="value">${esc(d.hora)} hs</div></div>
          <div class="venue-item"><div class="label">Dress code</div><div class="value">${esc(d.dressCode)}</div></div>
        </div>
        ${d.direccionMapa ? `<p style="margin-top:16px"><a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>` : ""}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Galería</h2>
      <p class="section-sub">Ediciones anteriores y sponsors.</p>
      <div class="card">
        ${gal.html}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Confirmá tu <span class="accent">registro</span></h2>
      <p class="section-sub">Los cupos son limitados, ¡asegurá tu lugar!</p>
      <div class="card">
        ${rsvp.html}
      </div>
    </div>

  </div>

  <footer>
    <div class="brand">${esc(d.empresa)}</div>
    ${esc(d.nombreEvento)}
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id,
  category: "empresariales",
  name: "Tech Summit",
  summary: "Estética tech/conferencia con degradé azul noche a cian eléctrico, líneas de circuito y grillas de puntos — ideal para summits y conferencias digitales.",
  accent: "#5fe3ff",
  accent2: "#1657d6",
  schema: empresarialSchema,
  sampleData,
  render,
};
