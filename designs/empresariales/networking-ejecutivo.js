const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");

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
  coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
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

function render(data = {}) {
  const d = { ...sampleData, ...data };
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
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --carbon:#232323; --emerald:#1f8a5f; --white:#fafafa;
    --line: rgba(35,35,35,.14);
    --line-light: rgba(250,250,250,.18);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--white);color:var(--carbon);font-family:'Inter',sans-serif;line-height:1.55;}
  h1,h2,h3{font-family:'Sora',sans-serif;margin:0;}
  a{color:var(--emerald);}
  .wrap{max-width:920px;margin:0 auto;padding:0 clamp(18px,4vw,32px);}

  /* --- hero --- */
  .hero{position:relative;min-height:clamp(420px,72vh,640px);display:flex;align-items:flex-end;color:var(--white);overflow:hidden;background:var(--carbon);}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(35,35,35,.35) 0%,rgba(35,35,35,.55) 55%,rgba(35,35,35,.92) 100%);}
  .hero-grid{position:absolute;inset:0;opacity:.18;
    background-image:linear-gradient(var(--line-light) 1px,transparent 1px),linear-gradient(90deg,var(--line-light) 1px,transparent 1px);
    background-size:44px 44px;}
  .hero-svg{position:absolute;top:clamp(16px,4vw,40px);right:clamp(16px,4vw,40px);width:clamp(64px,10vw,110px);height:auto;opacity:.85;}
  .hero-inner{position:relative;z-index:2;padding:clamp(28px,6vw,64px) clamp(18px,4vw,32px) clamp(36px,6vw,56px);max-width:920px;margin:0 auto;width:100%;}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;text-transform:uppercase;letter-spacing:3px;font-size:.7rem;color:var(--emerald);font-weight:600;}
  .hero-tag::before{content:"";width:20px;height:1px;background:var(--emerald);display:inline-block;}
  .hero h1{font-size:clamp(1.9rem,5vw,3.1rem);font-weight:700;margin:.35em 0 .15em;letter-spacing:-.02em;}
  .hero-empresa{font-size:.95rem;color:#d8d8d8;font-weight:400;}
  .hero-meta{margin-top:22px;display:flex;flex-wrap:wrap;gap:10px 26px;font-size:.85rem;color:#e6e6e6;}
  .hero-meta span{display:flex;align-items:center;gap:8px;}
  .dot{width:5px;height:5px;background:var(--emerald);border-radius:50%;display:inline-block;flex:none;}

  /* --- generic section --- */
  section{padding:clamp(40px,7vw,72px) 0;}
  .divider{border-top:1px solid var(--line);}
  .eyebrow{text-transform:uppercase;letter-spacing:3px;font-size:.7rem;color:var(--emerald);font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
  .eyebrow::before{content:"";width:18px;height:1px;background:var(--emerald);}
  h2.title{font-size:clamp(1.4rem,3.4vw,2rem);font-weight:600;letter-spacing:-.01em;margin-bottom:6px;}
  .lead{max-width:640px;color:#4a4a4a;font-weight:300;font-size:1.02rem;}

  /* --- countdown --- */
  .countdown{display:flex;gap:clamp(8px,2vw,18px);flex-wrap:wrap;}
  .countdown div{border:1px solid var(--line);border-radius:2px;padding:16px 20px;min-width:76px;text-align:center;position:relative;}
  .countdown div::after{content:"";position:absolute;top:-1px;left:-1px;width:10px;height:10px;border-top:1px solid var(--emerald);border-left:1px solid var(--emerald);}
  .cd-num{font-family:'Sora',sans-serif;font-size:clamp(1.5rem,4vw,2.2rem);font-weight:600;display:block;color:var(--carbon);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1.5px;color:#767676;}

  /* --- agenda timeline --- */
  .agenda{position:relative;margin-top:28px;padding-left:22px;border-left:1px solid var(--line);display:flex;flex-direction:column;gap:26px;}
  .agenda-item{position:relative;}
  .agenda-item::before{content:"";position:absolute;left:-27px;top:4px;width:9px;height:9px;border-radius:50%;background:var(--white);border:2px solid var(--emerald);}
  .agenda-time{font-family:'Sora',sans-serif;font-weight:600;color:var(--emerald);font-size:.85rem;letter-spacing:.5px;}
  .agenda-desc{color:var(--carbon);font-size:.98rem;margin-top:2px;}

  /* --- oradores --- */
  .oradores-grid{margin-top:26px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;}
  .orador-card{border:1px solid var(--line);padding:20px;position:relative;background:var(--white);}
  .orador-card::before{content:"";position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-bottom:1px solid var(--emerald);border-right:1px solid var(--emerald);}
  .orador-nombre{font-family:'Sora',sans-serif;font-weight:600;font-size:1.02rem;}
  .orador-cargo{color:#6a6a6a;font-size:.85rem;margin-top:4px;font-weight:300;}

  /* --- lugar --- */
  .lugar-box{margin-top:26px;display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start;justify-content:space-between;}
  .lugar-info{flex:1 1 260px;}
  .lugar-info p{margin:.3em 0;font-size:.95rem;}
  .lugar-info strong{font-family:'Sora',sans-serif;}
  .dress-badge{display:inline-block;border:1px solid var(--carbon);padding:8px 16px;font-size:.78rem;letter-spacing:1px;text-transform:uppercase;margin-top:10px;}
  .maps-link{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-weight:600;font-size:.88rem;text-decoration:none;}
  .maps-link::after{content:"→";transition:transform .2s;}
  .maps-link:hover::after{transform:translateX(3px);}
  .lugar-svg{flex:0 0 auto;width:clamp(90px,16vw,140px);opacity:.9;}

  /* --- gallery --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:26px;}
  .gallery img{width:100%;height:170px;object-fit:cover;filter:grayscale(35%) contrast(1.02);cursor:pointer;transition:filter .2s;}
  .gallery img:hover{filter:grayscale(0%);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,20,20,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* --- rsvp --- */
  .rsvp-section{background:var(--carbon);color:var(--white);}
  .rsvp-section .eyebrow{color:var(--emerald);}
  .rsvp-section .lead{color:#c9c9c9;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin-top:26px;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#b8b8b8;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Inter',sans-serif;padding:11px 12px;border:1px solid rgba(250,250,250,.25);background:rgba(250,250,250,.04);color:var(--white);margin-top:5px;width:100%;border-radius:2px;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#7a7a7a;}
  .rsvp-form button{background:var(--emerald);color:var(--white);border:0;padding:13px;font-weight:600;letter-spacing:.5px;cursor:pointer;text-transform:uppercase;font-size:.82rem;}
  .rsvp-form button:hover{background:#186f4d;}
  .rsvp-whatsapp{color:var(--emerald);font-size:.85rem;text-decoration:none;font-weight:600;}
  .rsvp-status{font-weight:600;color:#4fd394;}

  footer{text-align:center;padding:28px 20px;font-size:.78rem;color:#8a8a8a;border-top:1px solid var(--line);}
  footer strong{color:var(--carbon);}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-grid"></div>
    <div class="hero-overlay"></div>
    <svg class="hero-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#fafafa" stroke-opacity="0.5" stroke-width="1"/>
      <line x1="50" y1="4" x2="50" y2="96" stroke="#1f8a5f" stroke-width="1"/>
      <line x1="4" y1="50" x2="96" y2="50" stroke="#fafafa" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="50" cy="50" r="6" fill="#1f8a5f"/>
    </svg>
    <div class="hero-inner">
      <span class="hero-tag">Evento empresarial</span>
      <h1>${esc(d.nombreEvento)}</h1>
      <div class="hero-empresa">${esc(d.empresa)}</div>
      <div class="hero-meta">
        <span><i class="dot"></i>${esc(d.fecha)}</span>
        <span><i class="dot"></i>${esc(d.hora)} hs</span>
        <span><i class="dot"></i>${esc(d.lugar)}</span>
      </div>
    </div>
  </div>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">Cuenta regresiva</div>
      <h2 class="title">Faltan pocos días</h2>
      ${cd.html}
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">Sobre el evento</div>
      <h2 class="title">Networking con propósito</h2>
      <p class="lead">${esc(d.descripcion)}</p>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">Programa</div>
      <h2 class="title">Agenda del evento</h2>
      <div class="agenda">
        ${agendaItems.map(([hora, act]) => `<div class="agenda-item"><div class="agenda-time">${esc(hora)}</div><div class="agenda-desc">${esc(act)}</div></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">Panel</div>
      <h2 class="title">Oradores</h2>
      <div class="oradores-grid">
        ${oradoresItems.map(([nombre, cargo]) => `<div class="orador-card"><div class="orador-nombre">${esc(nombre)}</div><div class="orador-cargo">${esc(cargo)}</div></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">Ubicación</div>
      <h2 class="title">Dónde y cómo ir vestido</h2>
      <div class="lugar-box">
        <div class="lugar-info">
          <p><strong>Lugar:</strong> ${esc(d.lugar)}</p>
          <p><strong>Fecha:</strong> ${esc(d.fecha)} · ${esc(d.hora)} hs</p>
          ${d.direccionMapa ? `<div><a class="maps-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa</a></div>` : ""}
          <div class="dress-badge">Dress code: ${esc(d.dressCode)}</div>
        </div>
        <svg class="lugar-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="100" height="100" stroke="#232323" stroke-opacity="0.25" stroke-width="1"/>
          <rect x="30" y="30" width="60" height="60" stroke="#1f8a5f" stroke-width="1"/>
          <line x1="10" y1="60" x2="110" y2="60" stroke="#232323" stroke-opacity="0.15" stroke-width="1"/>
          <line x1="60" y1="10" x2="60" y2="110" stroke="#232323" stroke-opacity="0.15" stroke-width="1"/>
          <circle cx="60" cy="60" r="5" fill="#1f8a5f"/>
        </svg>
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="wrap">
      <div class="eyebrow">Galería</div>
      <h2 class="title">Ediciones anteriores</h2>
      ${gal.html}
    </div>
  </section>

  <section class="rsvp-section divider">
    <div class="wrap">
      <div class="eyebrow">Registro</div>
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
  summary: "Estética minimalista carbón y esmeralda, con motivos geométricos en SVG para cócteles y encuentros de networking corporativo.",
  accent: "#1f8a5f", schema: empresarialSchema, sampleData, render,
};
