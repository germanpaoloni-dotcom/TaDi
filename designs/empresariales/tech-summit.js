const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");

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
  coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
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
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0b0b14;
    --bg2:#12122199;
    --violet:#6c2bd9;
    --cyan:#00d4ff;
    --card:#14141f;
    --border:#2a2a3d;
    --text:#e8e8f5;
    --muted:#9797b0;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;
    background:var(--bg);
    color:var(--text);
    font-family:'Inter',Arial,sans-serif;
    line-height:1.5;
  }
  h1,h2,h3{font-family:'Space Grotesk','Inter',Arial,sans-serif;}
  a{color:var(--cyan);}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    min-height:clamp(420px,72vh,640px);
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
    filter:saturate(0.7) brightness(0.55);
  }
  .hero-mesh{
    position:absolute; inset:0; z-index:-2;
    background:
      radial-gradient(circle at 15% 20%, rgba(108,43,217,0.55), transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(0,212,255,0.4), transparent 50%),
      radial-gradient(circle at 50% 90%, rgba(108,43,217,0.45), transparent 55%),
      linear-gradient(180deg, rgba(11,11,20,0.55), rgba(11,11,20,0.92) 80%);
  }
  .hero-grid{
    position:absolute; inset:0; z-index:-1;
    opacity:0.35;
    background-image:
      linear-gradient(rgba(0,212,255,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.15) 1px, transparent 1px);
    background-size:40px 40px;
    mask-image:radial-gradient(ellipse at center, black 40%, transparent 80%);
  }
  .hero-svg{position:absolute; inset:0; z-index:-1; width:100%; height:100%; pointer-events:none;}
  .hero .tag{
    text-transform:uppercase; letter-spacing:4px; font-size:.72rem;
    color:var(--cyan); font-weight:600; margin-bottom:14px;
  }
  .hero h1{
    font-size:clamp(2rem,5.5vw,3.6rem);
    margin:.1em 0;
    background:linear-gradient(90deg,#fff 20%,var(--cyan) 60%,var(--violet) 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent;
    letter-spacing:-1px;
  }
  .hero .sub{color:var(--muted); font-size:clamp(.95rem,2vw,1.1rem); max-width:560px; margin:10px auto 0;}
  .hero .meta{
    margin-top:24px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center;
  }
  .pill{
    border:1px solid var(--border); background:rgba(255,255,255,0.04);
    border-radius:999px; padding:8px 16px; font-size:.85rem; color:var(--text);
    backdrop-filter:blur(4px);
  }
  .pill strong{color:var(--cyan); font-weight:600;}

  /* ---------- LAYOUT ---------- */
  .layout{max-width:960px; margin:0 auto; padding:0 20px 60px;}
  .section{padding:clamp(36px,6vw,56px) 0;}
  .section-title{
    font-size:clamp(1.3rem,2.6vw,1.8rem);
    margin:0 0 6px;
    letter-spacing:-.5px;
  }
  .section-title .accent{color:var(--cyan);}
  .section-sub{color:var(--muted); margin:0 0 28px; font-size:.95rem;}

  .card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:16px;
    padding:clamp(20px,3vw,28px);
    position:relative;
    overflow:hidden;
  }
  .card::before{
    content:"";
    position:absolute; top:-1px; left:-1px; right:-1px; height:2px;
    background:linear-gradient(90deg,var(--violet),var(--cyan));
  }

  /* countdown (from widget, style hooked to markup) */
  .countdown{display:flex; gap:12px; flex-wrap:wrap; justify-content:center;}
  .countdown > div{
    flex:1; min-width:70px; text-align:center;
    background:linear-gradient(160deg,rgba(108,43,217,0.18),rgba(0,212,255,0.08));
    border:1px solid var(--border);
    border-radius:12px; padding:16px 8px;
  }
  .cd-num{font-size:clamp(1.4rem,4vw,2rem); display:block; font-weight:700; color:#fff; font-family:'Space Grotesk',sans-serif;}
  .cd-label{font-size:.65rem; text-transform:uppercase; letter-spacing:1px; color:var(--muted);}

  /* description */
  .desc-card p{color:#c7c7dd; font-size:1rem;}

  /* agenda timeline */
  .agenda-list{display:flex; flex-direction:column; gap:0;}
  .agenda-item{
    display:grid; grid-template-columns:clamp(70px,15vw,100px) 1fr;
    gap:16px; padding:16px 0; border-bottom:1px solid var(--border);
    position:relative;
  }
  .agenda-item:last-child{border-bottom:0;}
  .agenda-time{
    font-family:'Space Grotesk',sans-serif; font-weight:700; color:var(--cyan);
    font-size:.95rem;
  }
  .agenda-activity{color:var(--text); font-size:.95rem;}
  .agenda-dot{
    position:absolute; left:calc(clamp(70px,15vw,100px) - 5px); top:22px;
    width:8px; height:8px; border-radius:50%;
    background:var(--violet); box-shadow:0 0 8px 2px rgba(108,43,217,0.7);
  }

  /* speakers */
  .speakers{display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px;}
  .speaker{
    background:linear-gradient(160deg,rgba(108,43,217,0.12),rgba(20,20,31,0.4));
    border:1px solid var(--border); border-radius:14px; padding:20px; text-align:left;
  }
  .speaker .avatar{
    width:52px; height:52px; border-radius:12px;
    background:linear-gradient(135deg,var(--violet),var(--cyan));
    margin-bottom:14px;
    display:flex; align-items:center; justify-content:center;
    font-family:'Space Grotesk',sans-serif; font-weight:700; color:#0b0b14; font-size:1.1rem;
  }
  .speaker strong{display:block; font-size:1rem; margin-bottom:2px;}
  .speaker span{font-size:.82rem; color:var(--muted);}

  /* venue */
  .venue-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px;}
  .venue-item{border:1px solid var(--border); border-radius:12px; padding:16px; background:rgba(255,255,255,0.02);}
  .venue-item .label{font-size:.7rem; text-transform:uppercase; letter-spacing:1px; color:var(--cyan); margin-bottom:6px;}
  .venue-item .value{font-size:.95rem; color:var(--text);}

  /* gallery (structure comes from widget, styled here) */
  .gallery{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px;}
  .gallery img{width:100%; height:150px; object-fit:cover; border-radius:12px; cursor:pointer; border:1px solid var(--border); display:block;}
  .lightbox{display:none; position:fixed; inset:0; background:rgba(5,5,10,0.94); align-items:center; justify-content:center; z-index:60;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%; max-height:86%; border-radius:8px;}
  .lightbox-close{position:absolute; top:20px; right:28px; color:#fff; font-size:2rem; cursor:pointer;}

  /* rsvp */
  .rsvp-form{display:flex; flex-direction:column; gap:14px; max-width:460px;}
  .rsvp-form label{font-size:.75rem; text-transform:uppercase; letter-spacing:.5px; color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit; padding:11px 12px; border:1px solid var(--border); border-radius:8px;
    margin-top:6px; width:100%; background:#0d0d17; color:var(--text);
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{
    outline:none; border-color:var(--cyan);
  }
  .rsvp-form button{
    background:linear-gradient(90deg,var(--violet),var(--cyan));
    color:#fff; border:0; padding:13px; border-radius:8px; cursor:pointer;
    font-weight:700; font-family:'Space Grotesk',sans-serif; letter-spacing:.5px;
  }
  .rsvp-whatsapp{color:var(--cyan); font-size:.9rem; text-decoration:none;}
  .rsvp-status{font-weight:600; color:#4ade80;}

  footer{
    text-align:center; padding:32px 20px; font-size:.8rem; color:var(--muted);
    border-top:1px solid var(--border);
  }
  footer .brand{color:var(--cyan); font-weight:600;}
</style></head>
<body>

  <section class="hero" style="--cover:url('${esc(d.coverImage)}')">
    <div class="hero-bg"></div>
    <div class="hero-mesh"></div>
    <div class="hero-grid"></div>
    <svg class="hero-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#6c2bd9" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#lineGrad)" stroke-width="1.5">
        <path d="M20 60 H180 V140 H340"/>
        <circle cx="20" cy="60" r="4" fill="#00d4ff" stroke="none"/>
        <circle cx="340" cy="140" r="4" fill="#6c2bd9" stroke="none"/>
        <path d="M780 40 H620 V120 H460 V60"/>
        <circle cx="780" cy="40" r="4" fill="#00d4ff" stroke="none"/>
        <circle cx="460" cy="60" r="4" fill="#6c2bd9" stroke="none"/>
        <path d="M60 460 H240 V380 H400 V430"/>
        <circle cx="60" cy="460" r="4" fill="#6c2bd9" stroke="none"/>
        <path d="M760 470 H600 V400 H500"/>
        <circle cx="760" cy="470" r="4" fill="#00d4ff" stroke="none"/>
      </g>
      <g opacity="0.5">
        <rect x="120" y="220" width="26" height="26" fill="none" stroke="#00d4ff" stroke-width="1.2" transform="rotate(20 133 233)"/>
        <rect x="640" y="230" width="34" height="34" fill="none" stroke="#6c2bd9" stroke-width="1.2" transform="rotate(-15 657 247)"/>
        <polygon points="400,20 415,45 385,45" fill="none" stroke="#00d4ff" stroke-width="1.2"/>
      </g>
    </svg>
    <div class="tag">${esc(d.empresa)} presenta</div>
    <h1>${esc(d.nombreEvento)}</h1>
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
  summary: "Estética tech/startup con gradientes violeta-cian, motivos de circuito y agenda tipo timeline — ideal para summits y conferencias digitales.",
  accent: "#6c2bd9",
  schema: empresarialSchema,
  sampleData,
  render,
};
