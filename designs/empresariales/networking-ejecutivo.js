const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "emp-networking-ejecutivo";

const sampleData = {
  nombreEvento: "Cóctel de Networking — Cámara Empresarial",
  empresa: "Cámara de Comercio e Industria",
  fecha: "2027-04-15",
  hora: "18:30",
  lugar: "Rooftop Hotel Podestá, CABA",
  direccionMapa: "https://maps.google.com/?q=Hotel+Podesta+Rooftop+CABA",
  descripcion:
    "Un encuentro pensado para conectar líderes, emprendedores y profesionales del sector. Charlas breves, mesas de conversación y un cóctel al atardecer con vista a la ciudad, en un ambiente distendido y profesional.",
  agenda:
    "18:30 - Recepción y acreditación\n19:00 - Bienvenida institucional\n19:15 - Paneles de conversación\n20:15 - Cóctel y networking libre\n21:30 - Cierre y brindis",
  oradores:
    "Marina Sosa - Directora Ejecutiva, Cámara de Comercio\nFacundo Ibarra - Fundador, Nodo Ventures\nCarolina Reyes - VP de Innovación, Grupo Meridian\nLucas Ferreyra - Economista, Consultora Prisma",
  dressCode: "Business casual",
  contacto: "5491122334455",
  coverImage: "https://images.unsplash.com/photo-1560523159-4a9692d222f8?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
  ],
};

function parseLines(raw, fallback) {
  const src = String(raw ?? "").trim() ? String(raw) : fallback;
  return String(src)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf(" - ");
      if (idx === -1) return [l, ""];
      return [l.slice(0, idx).trim(), l.slice(idx + 3).trim()];
    });
}

// Icono decorativo: pequeño nodo de red (punto conectado) usado como bullet de "eyebrow"
function nodeIcon(color) {
  return `<svg class="node-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="2" y1="14" x2="9" y2="4" stroke="${color}" stroke-width="1"/>
  <line x1="9" y1="4" x2="16" y2="12" stroke="${color}" stroke-width="1"/>
  <circle cx="2" cy="14" r="1.6" fill="${color}"/>
  <circle cx="9" cy="4" r="1.6" fill="${color}"/>
  <circle cx="16" cy="12" r="1.6" fill="${color}"/>
</svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#dba846");
  const goldSoft = `color-mix(in srgb, ${accent}, white 35%)`;
  const copper = `color-mix(in srgb, ${accent}, black 25%)`;
  const NODE_ICON = nodeIcon(accent);
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "18:30"}:00` : sampleData.fecha, "cd-net");
  const gal = galleryWidget(d.galeria && d.galeria.length ? d.galeria : sampleData.galeria, "gal-net");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: false, withMenu: false, whatsapp: d.contacto });

  const agendaItems = parseLines(d.agenda, sampleData.agenda);
  const oradoresItems = parseLines(d.oradores, sampleData.oradores);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#0a0d17; --ink2:#121a2c; --ink3:#1a2338;
    --gold:${accent}; --gold-soft:${goldSoft}; --copper:${copper};
    --paper:#f6f1e6;
    --line: color-mix(in srgb, ${accent} 25%, transparent);
    --text-soft: rgba(245,240,230,.68);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--ink);color:var(--paper);font-family:'Inter',sans-serif;line-height:1.6;}
  h1,h2,h3{font-family:'Playfair Display',serif;margin:0;}
  a{color:var(--gold);}
  .wrap{max-width:920px;margin:0 auto;padding:0 clamp(18px,4vw,32px);}
  .node-icon{width:18px;height:18px;display:inline-block;flex:none;}

  /* --- hero --- */
  .hero{position:relative;min-height:clamp(460px,80vh,680px);display:flex;align-items:flex-end;color:var(--paper);overflow:hidden;background:var(--ink);text-align:center;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center 30%/cover;}
  .hero-overlay{position:absolute;inset:0;background:
    linear-gradient(180deg,rgba(10,13,23,.25) 0%,rgba(10,13,23,.55) 45%,rgba(10,13,23,.96) 92%),
    linear-gradient(90deg,rgba(10,13,23,.55) 0%,transparent 30%,transparent 70%,rgba(10,13,23,.55) 100%);}
  .hero-net{position:absolute;top:8%;left:50%;transform:translateX(-50%);width:min(86%,520px);height:auto;opacity:.8;}
  .hero-inner{position:relative;z-index:2;padding:clamp(28px,6vw,64px) clamp(18px,4vw,32px) clamp(40px,7vw,64px);max-width:760px;margin:0 auto;width:100%;text-align:center;}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;text-transform:uppercase;letter-spacing:3px;font-size:.7rem;color:var(--gold);font-weight:600;justify-content:center;}
  .hero-tag::before,.hero-tag::after{content:"";width:20px;height:1px;background:var(--gold);display:inline-block;}
  .hero h1{font-size:clamp(2rem,6.2vw,3.6rem);font-weight:700;margin:.4em 0 .12em;letter-spacing:.01em;text-transform:uppercase;line-height:1.08;}
  .hero-empresa{font-size:.92rem;color:var(--text-soft);font-weight:300;letter-spacing:.5px;}
  .hero-logo-wrap{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:8px;padding:10px 18px;margin-top:6px;}
  .hero-logo{display:block;max-height:32px;max-width:160px;width:auto;height:auto;}
  .hero-meta{margin-top:24px;display:flex;flex-wrap:wrap;gap:10px 26px;font-size:.85rem;color:#e6ddc8;justify-content:center;}
  .hero-meta span{display:flex;align-items:center;gap:8px;}
  .dot{width:5px;height:5px;background:var(--gold);border-radius:50%;display:inline-block;flex:none;}

  /* --- generic section --- */
  section{padding:clamp(40px,7vw,72px) 0;text-align:center;}
  .divider{border-top:1px solid var(--line);}
  .eyebrow{text-transform:uppercase;letter-spacing:3px;font-size:.7rem;color:var(--gold);font-weight:600;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;}
  h2.title{font-size:clamp(1.5rem,3.6vw,2.1rem);font-weight:700;letter-spacing:.01em;margin-bottom:6px;}
  .lead{max-width:640px;color:var(--text-soft);font-weight:300;font-size:1.02rem;margin-left:auto;margin-right:auto;}

  /* --- countdown --- */
  .countdown{display:flex;gap:clamp(8px,2vw,18px);flex-wrap:wrap;justify-content:center;margin-top:26px;}
  .countdown div{border:1px solid var(--line);border-radius:2px;padding:16px 20px;min-width:76px;text-align:center;position:relative;background:var(--ink2);}
  .countdown div::after{content:"";position:absolute;top:-1px;left:-1px;width:10px;height:10px;border-top:1px solid var(--gold);border-left:1px solid var(--gold);}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.5rem,4vw,2.2rem);font-weight:700;display:block;color:var(--gold-soft);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1.5px;color:#a49a80;}

  /* --- agenda timeline --- */
  .agenda{position:relative;margin-top:28px;display:flex;flex-direction:column;gap:22px;max-width:520px;margin-left:auto;margin-right:auto;text-align:left;}
  .agenda-item{position:relative;padding-left:26px;border-left:1px solid var(--line);padding-bottom:2px;}
  .agenda-item::before{content:"";position:absolute;left:-5px;top:4px;width:9px;height:9px;border-radius:50%;background:var(--ink);border:2px solid var(--gold);}
  .agenda-time{font-family:'Playfair Display',serif;font-weight:700;color:var(--gold);font-size:.9rem;letter-spacing:.5px;}
  .agenda-desc{color:var(--paper);font-size:.98rem;margin-top:2px;}

  /* --- oradores --- */
  .oradores-grid{margin-top:26px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;text-align:left;}
  .orador-card{border:1px solid var(--line);padding:20px;position:relative;background:var(--ink2);}
  .orador-card::before{content:"";position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-bottom:1px solid var(--gold);border-right:1px solid var(--gold);}
  .orador-nombre{font-family:'Playfair Display',serif;font-weight:700;font-size:1.02rem;color:var(--paper);}
  .orador-cargo{color:#b2a98e;font-size:.85rem;margin-top:4px;font-weight:300;}

  /* --- lugar --- */
  .lugar-box{margin-top:26px;display:flex;flex-wrap:wrap;gap:32px;align-items:center;justify-content:center;text-align:left;}
  .lugar-info{flex:1 1 260px;}
  .lugar-info p{margin:.3em 0;font-size:.95rem;}
  .lugar-info strong{font-family:'Playfair Display',serif;color:var(--gold-soft);}
  .dress-badge{display:inline-block;border:1px solid var(--gold);color:var(--gold-soft);padding:8px 16px;font-size:.78rem;letter-spacing:1px;text-transform:uppercase;margin-top:10px;}
  .maps-link{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-weight:600;font-size:.88rem;text-decoration:none;color:var(--gold);}
  .maps-link::after{content:"→";transition:transform .2s;}
  .maps-link:hover::after{transform:translateX(3px);}
  .lugar-svg{flex:0 0 auto;width:clamp(90px,16vw,140px);height:clamp(90px,16vw,140px);opacity:.9;}

  /* --- gallery --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:26px;}
  .gallery-item{background:var(--ink3);border-radius:4px;overflow:hidden;}
  .gallery img{width:100%;height:170px;object-fit:cover;display:block;filter:grayscale(20%) sepia(25%) saturate(1.1);cursor:pointer;transition:filter .2s;}
  .gallery img:hover{filter:none;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,8,14,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* --- rsvp --- */
  .rsvp-section{background:var(--ink2);}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:26px auto 0;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#b2a98e;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Inter',sans-serif;padding:11px 12px;border:1px solid var(--line);background:color-mix(in srgb, ${accent} 5%, transparent);color:var(--paper);margin-top:5px;width:100%;border-radius:2px;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#736c58;}
  .rsvp-form button{background:var(--gold);color:var(--ink);border:0;padding:13px;font-weight:700;letter-spacing:.5px;cursor:pointer;text-transform:uppercase;font-size:.82rem;}
  .rsvp-form button:hover{background:var(--gold-soft);}
  .rsvp-whatsapp{color:var(--gold);font-size:.85rem;text-decoration:none;font-weight:600;}
  .rsvp-status{font-weight:600;color:var(--gold-soft);}

  footer{text-align:center;padding:28px 20px;font-size:.78rem;color:#8a8270;border-top:1px solid var(--line);}
  footer strong{color:var(--gold-soft);}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-overlay"></div>
    <svg class="hero-net" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="${accent}" stroke-width="0.6" stroke-opacity="0.75">
        <line x1="20" y1="120" x2="60" y2="60"/>
        <line x1="60" y1="60" x2="100" y2="30"/>
        <line x1="100" y1="30" x2="140" y2="55"/>
        <line x1="140" y1="55" x2="180" y2="110"/>
        <line x1="60" y1="60" x2="100" y2="90"/>
        <line x1="100" y1="30" x2="130" y2="15"/>
        <line x1="100" y1="90" x2="140" y2="55"/>
        <line x1="20" y1="120" x2="100" y2="90"/>
        <line x1="100" y1="90" x2="180" y2="110"/>
      </g>
      <g fill="${goldSoft}">
        <circle cx="20" cy="120" r="2.4"/>
        <circle cx="60" cy="60" r="2.4"/>
        <circle cx="100" cy="30" r="3.2"/>
        <circle cx="130" cy="15" r="2"/>
        <circle cx="140" cy="55" r="2.4"/>
        <circle cx="100" cy="90" r="2.4"/>
        <circle cx="180" cy="110" r="2.4"/>
      </g>
    </svg>
    <div class="hero-inner">
      <span class="hero-tag">Evento empresarial</span>
      <h1>${esc(d.nombreEvento)}</h1>
      ${d.logo ? `<div class="hero-logo-wrap"><img class="hero-logo" src="${esc(d.logo)}" alt="${esc(d.empresa)}"></div>` : `<div class="hero-empresa">${esc(d.empresa)}</div>`}
      <div class="hero-meta">
        <span><i class="dot"></i>${esc(d.fecha)}</span>
        <span><i class="dot"></i>${esc(d.hora)} hs</span>
        <span><i class="dot"></i>${esc(d.lugar)}</span>
      </div>
    </div>
  </div>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Cuenta regresiva</div>
      <h2 class="title">Faltan pocos días</h2>
      ${cd.html}
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Sobre el evento</div>
      <h2 class="title">Networking con propósito</h2>
      <p class="lead">${esc(d.descripcion)}</p>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Programa</div>
      <h2 class="title">Agenda del evento</h2>
      <div class="agenda">
        ${agendaItems.map(([hora, act]) => `<div class="agenda-item"><div class="agenda-time">${esc(hora)}</div><div class="agenda-desc">${esc(act)}</div></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Panel</div>
      <h2 class="title">Oradores</h2>
      <div class="oradores-grid">
        ${oradoresItems.map(([nombre, cargo]) => `<div class="orador-card"><div class="orador-nombre">${esc(nombre)}</div><div class="orador-cargo">${esc(cargo)}</div></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Ubicación</div>
      <h2 class="title">Dónde y cómo ir vestido</h2>
      <div class="lugar-box">
        <div class="lugar-info">
          <p><strong>Lugar:</strong> ${esc(d.lugar)}</p>
          <p><strong>Fecha:</strong> ${esc(d.fecha)} · ${esc(d.hora)} hs</p>
          ${d.direccionMapa ? `<div><a class="maps-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa</a></div>` : ""}
          <div class="dress-badge">Dress code: ${esc(d.dressCode)}</div>
        </div>
        <svg class="lugar-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
          <rect x="10" y="10" width="100" height="100" stroke="${accent}" stroke-opacity="0.3" stroke-width="1"/>
          <g stroke="${accent}" stroke-width="0.8" stroke-opacity="0.85">
            <line x1="30" y1="90" x2="55" y2="55"/>
            <line x1="55" y1="55" x2="85" y2="35"/>
            <line x1="55" y1="55" x2="80" y2="75"/>
          </g>
          <g fill="${goldSoft}">
            <circle cx="30" cy="90" r="3"/>
            <circle cx="55" cy="55" r="3.6"/>
            <circle cx="85" cy="35" r="3"/>
            <circle cx="80" cy="75" r="3"/>
          </g>
        </svg>
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Galería</div>
      <h2 class="title">Ediciones anteriores</h2>
      ${gal.html}
    </div>
  </section>

  <section class="rsvp-section divider">
    <div class="wrap">
      <div class="eyebrow">${NODE_ICON}Registro</div>
      <h2 class="title">Confirmá tu lugar</h2>
      <p class="lead">Los cupos son limitados. Completá el formulario o escribinos por WhatsApp para reservar tu registro.</p>
      ${rsvp.html}
    </div>
  </section>

  <footer><strong>${esc(d.empresa)}</strong> · ${esc(d.nombreEvento)}</footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "empresariales", name: "Networking Ejecutivo",
  summary: "Estética corporativa nocturna en tinta azul-negra y dorado, con motivos de red/nodos conectados sobre skyline, para cócteles y encuentros de networking ejecutivo.",
  accent: "#dba846", accent2: "#0a0d17", schema: empresarialSchema, sampleData, render,
};
