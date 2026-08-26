const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-rooftop-nocturno";

const sampleData = {
  nombre: "Nico",
  edad: "30",
  fecha: "2027-02-13",
  hora: "20:00",
  lugar: "SKY Rooftop, Puerto Madero",
  direccionMapa: "https://maps.google.com/?q=Puerto+Madero+Buenos+Aires+Rooftop",
  mensaje: "Treinta años se festejan arriba de todo. Los espero en la terraza para brindar con la ciudad de fondo, buena música y las personas que más quiero.",
  dressCode: "Elegante urbano, un toque de brillo",
  whatsapp: "5491100000034",
  fechaLimiteRSVP: "2027-02-06",
  coverImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&q=80",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80",
  ],
};

const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Skyline de ciudad de noche dibujado a mano en SVG: siluetas de edificios de
// distinta altura, algunas ventanas encendidas (accent turquesa + un dorado
// tenue). Se usa como decoración de fondo del hero, detrás del degradé de
// cielo nocturno. Genera ventanas con una semilla simple (determinística)
// para que no cambie entre renders del mismo diseño.
function skylineSVG(accent) {
  function windows(x0, y0, w, h, cols, rows, seed) {
    const cw = w / cols;
    const rh = h / rows;
    let out = "";
    let s = seed;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        s = (s * 9301 + 49297) % 233280;
        const lit = s / 233280 > 0.45;
        if (!lit) continue;
        s = (s * 9301 + 49297) % 233280;
        const gold = s / 233280 > 0.75;
        const wx = x0 + c * cw + cw * 0.28;
        const wy = y0 + r * rh + rh * 0.28;
        out += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${(cw * 0.44).toFixed(1)}" height="${(rh * 0.44).toFixed(1)}" fill="${gold ? "#e8c98a" : accent}" opacity="${gold ? 0.75 : 0.85}"/>`;
      }
    }
    return out;
  }
  const buildings = [
    { x: 0, y: 300, w: 90, h: 260, fill: "#1c2150", cols: 3, rows: 8, seed: 11 },
    { x: 84, y: 210, w: 70, h: 350, fill: "#232a63", cols: 3, rows: 11 , seed: 23 },
    { x: 148, y: 340, w: 60, h: 220, fill: "#171b3d", cols: 2, rows: 7, seed: 37 },
    { x: 200, y: 120, w: 100, h: 440, fill: "#2a2f6e", cols: 4, rows: 14, seed: 51 },
    { x: 292, y: 260, w: 80, h: 300, fill: "#1c2150", cols: 3, rows: 9, seed: 67 },
    { x: 364, y: 360, w: 66, h: 200, fill: "#232a63", cols: 2, rows: 6, seed: 79 },
    { x: 422, y: 180, w: 92, h: 380, fill: "#171b3d", cols: 3, rows: 12, seed: 89 },
    { x: 506, y: 300, w: 74, h: 260, fill: "#2a2f6e", cols: 3, rows: 8, seed: 101 },
    { x: 572, y: 240, w: 88, h: 320, fill: "#1c2150", cols: 3, rows: 10, seed: 113 },
    { x: 652, y: 350, w: 68, h: 210, fill: "#232a63", cols: 2, rows: 6, seed: 127 },
    { x: 712, y: 150, w: 96, h: 410, fill: "#171b3d", cols: 4, rows: 13, seed: 139 },
    { x: 800, y: 280, w: 80, h: 280, fill: "#2a2f6e", cols: 3, rows: 9, seed: 151 },
  ];
  const shapes = buildings.map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${b.fill}"/>${windows(b.x, b.y, b.w, b.h, b.cols, b.rows, b.seed)}`).join("");
  return `<svg class="skyline-svg" viewBox="0 0 880 560" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shapes}</svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#37E0C4");
  const accent2 = "#171B3D";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let fechaLarga = "";
  if (d.fecha) {
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    fechaLarga = y && m && day ? `${day} de ${MESES_LARGO[m - 1]} de ${y}` : d.fecha;
  }

  const ambiente = [
    { titulo: "DJ en vivo", texto: "Sesión en vivo toda la noche, del atardecer a la madrugada." },
    { titulo: "Barra de tragos de autor", texto: "Cócteles de autor y clásicos bien hechos, sin parar." },
    { titulo: "Terraza al aire libre", texto: "Aire libre, buena onda y la ciudad como escenario." },
    { titulo: "Vista 360°", texto: "Skyline completo desde las alturas, ideal para las fotos." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0d1030;
    --accent:${accent};
    --accent2:${accent2};
    --ink:#f3f5fb;
    --ink-soft:#b9bfe0;
    --glass-bg:rgba(23,27,61,.46);
    --glass-border:rgba(255,255,255,.14);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',Arial,sans-serif;font-weight:400;}
  img{max-width:100%;}
  h1,h2,.brand{font-family:'Space Grotesk',Arial,sans-serif;}
  a{color:inherit;}

  .glass{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:18px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}

  /* ===== HERO ===== */
  .hero{position:relative;min-height:100vh;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;
    background:linear-gradient(180deg,#0a0c22 0%,#141a45 42%,#3a2a5c 72%,#5c3a5e 88%,#7a4a5a 100%);
    padding:26px 20px 48px;}
  .hero-glow{position:absolute;left:50%;bottom:36%;width:70vw;height:70vw;max-width:640px;max-height:640px;transform:translateX(-50%);
    background:radial-gradient(circle,rgba(55,224,196,.20) 0%,transparent 65%);pointer-events:none;}
  .hero-skyline{position:absolute;left:0;right:0;bottom:0;height:56%;z-index:1;}
  .skyline-svg{width:100%;height:100%;display:block;}
  .hero-skyline::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,rgba(9,10,26,.55) 70%,rgba(9,10,26,.92) 100%);}
  .stars{position:absolute;inset:0;z-index:0;opacity:.7;
    background-image:radial-gradient(1.5px 1.5px at 12% 18%,#fff,transparent),
      radial-gradient(1.5px 1.5px at 28% 10%,#fff,transparent),
      radial-gradient(1px 1px at 45% 22%,#fff,transparent),
      radial-gradient(1.5px 1.5px at 62% 14%,#fff,transparent),
      radial-gradient(1px 1px at 78% 8%,#fff,transparent),
      radial-gradient(1.5px 1.5px at 88% 20%,#fff,transparent),
      radial-gradient(1px 1px at 20% 30%,#fff,transparent),
      radial-gradient(1px 1px at 70% 28%,#fff,transparent);}
  .hero-content{position:relative;z-index:2;max-width:640px;margin:0 auto;text-align:center;width:100%;}
  .eyebrow{letter-spacing:.35em;text-transform:uppercase;font-size:clamp(.62rem,1.8vw,.8rem);color:var(--accent);margin:0 0 14px;}
  .hero-content h1{font-size:clamp(3rem,13vw,5.6rem);line-height:1;margin:0;color:var(--ink);font-weight:700;
    text-shadow:0 0 30px rgba(55,224,196,.35);}
  .hero-edad{display:inline-block;margin-top:14px;font-family:'Space Grotesk',Arial,sans-serif;font-size:clamp(1rem,3vw,1.3rem);color:var(--accent2);
    background:var(--accent);border-radius:999px;padding:6px 22px;font-weight:600;letter-spacing:.5px;}
  .hero-mensaje{margin:22px auto 0;max-width:460px;color:var(--ink-soft);font-size:clamp(.95rem,2.2vw,1.08rem);line-height:1.7;}

  section{max-width:800px;margin:0 auto;padding:60px 22px;text-align:center;position:relative;}
  h2{font-family:'Space Grotesk',Arial,sans-serif;font-size:clamp(1.7rem,5.5vw,2.4rem);margin:0 0 30px;color:var(--ink);font-weight:600;}
  h2 span{color:var(--accent);}

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,3.5vw,20px);justify-content:center;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:70px;padding:16px 10px;border-radius:14px;
    background:var(--glass-bg);border:1px solid var(--glass-border);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
  .cd-num{font-family:'Space Grotesk',Arial,sans-serif;font-size:clamp(1.9rem,5vw,2.6rem);color:var(--accent);font-weight:600;}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:2px;color:var(--ink-soft);margin-top:4px;}

  /* DATOS */
  .datos-card{padding:34px 28px;text-align:left;display:flex;flex-direction:column;gap:18px;}
  .dato-row{display:flex;gap:14px;align-items:flex-start;}
  .dato-ico{flex:0 0 auto;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;
    background:rgba(55,224,196,.14);color:var(--accent);font-size:1.05rem;}
  .dato-label{font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent);margin:0 0 4px;}
  .dato-value{font-size:clamp(1rem,2.6vw,1.15rem);color:var(--ink);margin:0;line-height:1.4;}
  .maplink{display:inline-block;margin-top:6px;color:var(--accent2);background:var(--accent);text-decoration:none;font-weight:600;
    padding:9px 20px;border-radius:999px;font-size:.82rem;letter-spacing:.5px;}

  /* AMBIENTE */
  .ambiente-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;text-align:left;}
  .ambiente-card{padding:24px 20px;}
  .ambiente-card h3{font-family:'Space Grotesk',Arial,sans-serif;font-size:1.05rem;margin:0 0 8px;color:var(--accent);font-weight:600;}
  .ambiente-card p{margin:0;font-size:.9rem;color:var(--ink-soft);line-height:1.6;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:12px;cursor:pointer;border:1px solid var(--glass-border);transition:transform .2s ease;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,7,20,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--accent);border-radius:10px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--accent);font-size:2.2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Inter',inherit;padding:11px;border:1px solid var(--glass-border);
    border-radius:10px;margin-top:5px;width:100%;background:rgba(23,27,61,.6);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--accent);}
  .rsvp-form button{background:var(--accent);color:var(--accent2);border:0;padding:14px;border-radius:999px;letter-spacing:1px;
    text-transform:uppercase;cursor:pointer;font-size:.9rem;font-weight:600;}
  .rsvp-form button:hover{filter:brightness(1.08);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--accent);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--accent);font-weight:bold;}

  footer{text-align:center;padding:44px 22px 52px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid var(--glass-border);}
</style></head>
<body>

  <div class="hero">
    <div class="stars"></div>
    <div class="hero-glow"></div>
    <div class="hero-skyline">${skylineSVG(accent)}</div>
    <div class="hero-content">
      <p class="eyebrow">Nos vamos a lo alto</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<span class="hero-edad">Cumple ${esc(d.edad)}</span>` : ""}
      ${d.mensaje ? `<p class="hero-mensaje">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>

  <section>
    <h2>Faltan <span>para el brindis</span></h2>
    ${cd.html}
    ${fechaLarga ? `<p style="margin-top:18px;color:var(--ink-soft);">${esc(fechaLarga)}</p>` : ""}
  </section>

  <section>
    <h2>Los <span>datos</span></h2>
    <div class="datos-card glass">
      ${d.fecha ? `<div class="dato-row"><div class="dato-ico">📅</div><div><p class="dato-label">Fecha</p><p class="dato-value">${esc(fechaLarga || d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p></div></div>` : ""}
      ${d.lugar ? `<div class="dato-row"><div class="dato-ico">📍</div><div><p class="dato-label">Lugar</p><p class="dato-value">${esc(d.lugar)}</p>${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación →</a>` : ""}</div></div>` : ""}
      ${d.dressCode ? `<div class="dato-row"><div class="dato-ico">✨</div><div><p class="dato-label">Dress Code</p><p class="dato-value">${esc(d.dressCode)}</p></div></div>` : ""}
    </div>
  </section>

  <section>
    <h2>Ambiente <span>de la noche</span></h2>
    <div class="ambiente-grid">
      ${ambiente.map((a) => `<div class="ambiente-card glass"><h3>${esc(a.titulo)}</h3><p>${esc(a.texto)}</p></div>`).join("")}
    </div>
  </section>

  ${(d.galeria && d.galeria.length) ? `
  <section>
    <h2>Un <span>vistazo</span></h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2>Confirmá <span>tu lugar</span></h2>
    ${rsvpDeadline ? `<p style="margin:-14px 0 20px;font-size:.85rem;color:var(--ink-soft);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    Te espero arriba, con la ciudad de fondo. — ${esc(d.nombre)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
    background:linear-gradient(180deg, #0a0c22 0%, ${d.accent2} 55%, #4a2f52 100%);">
    <svg viewBox="0 0 200 90" width="100%" height="60%" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;left:0;right:0;bottom:0;">
      <rect x="0" y="30" width="24" height="60" fill="${d.accent2}"/>
      <rect x="4" y="36" width="4" height="4" fill="${d.accent}"/><rect x="14" y="44" width="4" height="4" fill="${d.accent}"/><rect x="4" y="54" width="4" height="4" fill="${d.accent}"/>
      <rect x="26" y="14" width="30" height="76" fill="#232a63"/>
      <rect x="32" y="22" width="4" height="4" fill="${d.accent}"/><rect x="44" y="22" width="4" height="4" fill="${d.accent}"/><rect x="32" y="34" width="4" height="4" fill="${d.accent}"/><rect x="44" y="34" width="4" height="4" fill="${d.accent}"/><rect x="32" y="46" width="4" height="4" fill="${d.accent}"/>
      <rect x="58" y="40" width="26" height="50" fill="${d.accent2}"/>
      <rect x="63" y="48" width="4" height="4" fill="${d.accent}"/><rect x="74" y="56" width="4" height="4" fill="${d.accent}"/>
      <rect x="86" y="6" width="32" height="84" fill="#2a2f6e"/>
      <rect x="92" y="14" width="4" height="4" fill="${d.accent}"/><rect x="104" y="14" width="4" height="4" fill="${d.accent}"/><rect x="92" y="26" width="4" height="4" fill="${d.accent}"/><rect x="104" y="26" width="4" height="4" fill="${d.accent}"/><rect x="92" y="38" width="4" height="4" fill="${d.accent}"/>
      <rect x="120" y="34" width="24" height="56" fill="#232a63"/>
      <rect x="126" y="42" width="4" height="4" fill="${d.accent}"/><rect x="136" y="50" width="4" height="4" fill="${d.accent}"/>
      <rect x="146" y="18" width="28" height="72" fill="${d.accent2}"/>
      <rect x="152" y="26" width="4" height="4" fill="${d.accent}"/><rect x="162" y="26" width="4" height="4" fill="${d.accent}"/><rect x="152" y="38" width="4" height="4" fill="${d.accent}"/>
      <rect x="176" y="44" width="24" height="46" fill="#2a2f6e"/>
      <rect x="182" y="52" width="4" height="4" fill="${d.accent}"/><rect x="190" y="60" width="4" height="4" fill="${d.accent}"/>
    </svg>
    <div style="position:relative;z-index:2;text-align:center;padding:14px 10px 20px;">
      <div style="font-family:'Century Gothic',Arial,sans-serif;font-size:1.25rem;font-weight:700;letter-spacing:.5px;color:${d.accent};text-shadow:0 0 10px rgba(0,0,0,.4);line-height:1.1;">${esc(d.name)}</div>
      <div style="font-family:'Century Gothic',Arial,sans-serif;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:#fff;opacity:.85;margin-top:4px;">cumpleaños rooftop</div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Rooftop Nocturno",
  summary: "Cumpleaños en una terraza de noche con vista a la ciudad: skyline en degradé, tarjetas glass y acentos turquesa neón sobre azul medianoche.",
  accent: "#37E0C4", accent2: "#171B3D", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
