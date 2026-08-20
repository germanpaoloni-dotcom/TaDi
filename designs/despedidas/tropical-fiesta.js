const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { despedidaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "desp-tropical-fiesta";

const sampleData = {
  nombre: "Euge",
  fecha: "2027-01-16",
  hora: "21:00",
  lugar: "Terraza Bahía Rooftop, Costa Esmeralda",
  direccionMapa: "https://maps.google.com/?q=Terraza+Bahia+Rooftop+Costa+Esmeralda",
  plan:
    "Arrancamos a las 21 hs con tragos tropicales al pie de la pileta (usá tu look más brillante). A las 22:30, cena bajo las palmeras iluminadas con barra libre y música en vivo. Después, DJ hasta que salga el sol, con juegos, desafíos y sorpresas para la festejada. No puede faltar la remera de la despedida, ¡así que confirmá tu talle al anotarte!",
  dressCode: "Tropical glam nocturno: brillos, flores y colores neón — nada de básicos, ¡queremos fiesta!",
  organizadores: "Male, Sole y las chicas del grupo",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1400&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80",
    "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&q=80",
  ],
};

// Motivos tropicales dibujados a mano en SVG inline (hoja de palmera con
// degradé neón, flor tropical, piña, pin y diamante decorativo) para no
// depender de ningún set de íconos externo.
function frondSVG(flip, uid, accent) {
  const gid = `frondGrad-${uid}`;
  return `<svg class="motif motif-frond${flip ? " flip" : ""}" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="140" x2="60" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="#1fe8d5"/>
      </linearGradient>
    </defs>
    <g stroke="url(#${gid})">
      <path d="M30 138 C 25 100, 30 58, 35 4" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M32 20 C 8 13, -4 26, 1 41" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M32 42 C 6 37, -6 52, 0 68" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M32 64 C 8 61, -3 78, 3 94" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M33 25 C 57 17, 69 30, 64 45" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M33 47 C 58 41, 70 56, 63 72" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M33 69 C 56 66, 66 82, 59 96" stroke-width="2.6" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function hibiscusSVG(accent) {
  return `<svg class="motif motif-flower" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="flowerGrad" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="#e3c088"/>
    </linearGradient>
  </defs>
  <g fill="url(#flowerGrad)">
    <ellipse cx="30" cy="14" rx="9" ry="14"/>
    <ellipse cx="30" cy="14" rx="9" ry="14" transform="rotate(72 30 30)"/>
    <ellipse cx="30" cy="14" rx="9" ry="14" transform="rotate(144 30 30)"/>
    <ellipse cx="30" cy="14" rx="9" ry="14" transform="rotate(216 30 30)"/>
    <ellipse cx="30" cy="14" rx="9" ry="14" transform="rotate(288 30 30)"/>
  </g>
  <circle cx="30" cy="30" r="5" fill="#1fe8d5"/>
</svg>`;
}

const pineappleSVG = `<svg class="motif motif-pineapple" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 44 C8 30 8 24 20 24 C32 24 32 30 32 44 C32 51 26 54 20 54 C14 54 8 51 8 44 Z" stroke="currentColor" stroke-width="2.2"/>
  <path d="M12 30 C16 33 24 33 28 30 M11 37 C16 40 24 40 29 37 M12 44 C16 47 24 47 28 44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M20 24 L20 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M20 14 C10 8 6 12 9 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M20 14 C30 8 34 12 31 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

const pinSVG = `<svg class="motif motif-pin" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 2 C 30 2, 38 10, 38 20 C 38 33, 20 50, 20 50 C 20 50, 2 33, 2 20 C 2 10, 10 2, 20 2 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="20" cy="20" r="7" stroke="currentColor" stroke-width="2.4"/>
</svg>`;

const glassSVG = `<svg class="motif motif-glass" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 4 H34 L20 30 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <line x1="20" y1="30" x2="20" y2="48" stroke="currentColor" stroke-width="2.4"/>
  <line x1="10" y1="50" x2="30" y2="50" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M13 11 C 16 15, 24 15, 27 11" stroke="currentColor" stroke-width="2"/>
</svg>`;

const diamondSVG = `<svg class="motif motif-diamond" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M4 9 L12 3 L20 9 L12 21 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M4 9 H20 M8.5 9 L12 21 M15.5 9 L12 21 M8.5 9 L12 3 M15.5 9 L12 3" stroke="currentColor" stroke-width="1"/>
</svg>`;

// Divisor elegante (línea degradé + diamante) usado entre título y
// contenido de cada sección, en reemplazo de imágenes externas.
function divider() {
  return `<div class="divider"><span class="divider-line"></span>${diamondSVG}<span class="divider-line"></span></div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#ff2f9c");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cdesp1");
  const gal = galleryWidget(d.galeria, "galesp1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Despedida de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Marck+Script&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg-1:#170a2c;
    --bg-2:#0d1f22;
    --bg-3:#0a0416;
    --magenta:${accent};
    --magenta-dark:color-mix(in srgb, ${accent}, black 25%);
    --teal:#1fe8d5;
    --teal-dark:#0fa89c;
    --gold:#e3c088;
    --cream:#f7ecd9;
    --cream-soft:rgba(247,236,217,.7);
    --panel:rgba(255,255,255,.045);
    --panel-border:rgba(227,192,136,.35);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Poppins',system-ui,sans-serif;background:var(--bg-1);color:var(--cream);}
  img{max-width:100%;}
  a{color:inherit;}
  h1,h2,h3{font-family:'Playfair Display',Georgia,serif;}
  .script{font-family:'Marck Script',cursive;font-weight:400;}

  .motif{display:block;}
  .motif-frond{width:clamp(58px,16vw,110px);height:auto;}
  .motif-frond.flip{transform:scaleX(-1);}
  .motif-flower{width:44px;height:auto;}
  .motif-pineapple{width:30px;height:auto;color:var(--gold);flex:0 0 auto;}
  .motif-pin{width:32px;height:auto;color:var(--gold);flex:0 0 auto;}
  .motif-glass{width:28px;height:auto;color:var(--teal);flex:0 0 auto;}
  .motif-diamond{width:14px;height:14px;color:var(--gold);flex:0 0 auto;}

  .divider{display:flex;align-items:center;justify-content:center;gap:10px;max-width:220px;margin:0 auto 30px;}
  .divider-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}

  /* ---------- HERO ---------- */
  .hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-3);padding:64px 16px;text-align:center;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(165deg,rgba(23,10,44,.72),rgba(6,3,16,.93) 65%);}
  .hero-frond{position:absolute;z-index:1;opacity:.9;filter:drop-shadow(0 0 14px rgba(0,0,0,.5));}
  .hero-frond.tl{top:-8px;left:-8px;}
  .hero-frond.tr{top:-8px;right:-8px;transform:scaleX(-1);}
  .hero-frond.bl{bottom:-8px;left:-8px;transform:scaleY(-1);}
  .hero-frond.br{bottom:-8px;right:-8px;transform:scale(-1,-1);}
  .hero-frame{position:relative;z-index:2;width:100%;max-width:460px;margin:0 auto;text-align:center;padding:clamp(36px,8vw,60px) clamp(22px,6vw,40px);border:1.5px solid var(--magenta);border-radius:6px;background:rgba(10,4,20,.35);box-shadow:0 0 0 6px color-mix(in srgb, ${accent} 8%, transparent), inset 0 0 40px color-mix(in srgb, ${accent} 18%, transparent), 0 0 60px rgba(31,232,213,.12);}
  .hero-content{max-width:400px;margin:0 auto;text-align:center;}
  .script-eyebrow{font-family:'Marck Script',cursive;font-size:clamp(1.6rem,5vw,2.1rem);color:var(--gold);margin:0 0 6px;}
  .hero-content h1{font-size:clamp(2.6rem,10vw,4.1rem);font-weight:800;letter-spacing:.03em;margin:0 0 12px;line-height:1.02;color:var(--cream);text-shadow:0 0 24px color-mix(in srgb, ${accent} 35%, transparent);}
  .hero-sub{font-size:clamp(.82rem,2.4vw,.98rem);letter-spacing:.06em;color:var(--cream-soft);margin:0 0 20px;}
  .hero-date{display:inline-block;padding:9px 22px;border:1px solid var(--gold);border-radius:999px;letter-spacing:.14em;text-transform:uppercase;font-size:clamp(.66rem,1.9vw,.78rem);color:var(--gold);}

  section{padding:70px 22px;text-align:center;}
  .sec-inner{max-width:760px;margin:0 auto;}
  .kicker{letter-spacing:.3em;text-transform:uppercase;font-size:.7rem;font-weight:600;color:var(--gold);margin-bottom:8px;}
  h2{font-weight:700;font-size:clamp(1.7rem,5vw,2.4rem);margin:0 0 10px;color:var(--cream);}

  .sec-a{background:var(--bg-1);}
  .sec-b{background:var(--bg-2);}

  /* ---------- COUNTDOWN ---------- */
  .countdown{display:flex;gap:clamp(10px,4vw,22px);justify-content:center;flex-wrap:wrap;margin-top:14px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:64px;background:var(--panel);border:1px solid var(--panel-border);border-radius:14px;padding:14px 12px;}
  .cd-num{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.6rem,5vw,2.3rem);color:var(--magenta);line-height:1;}
  .cd-label{font-size:.64rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--cream-soft);margin-top:5px;}

  /* ---------- PLAN ---------- */
  .plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;text-align:left;margin-top:10px;}
  .plan-card{background:var(--panel);border:1px solid var(--panel-border);border-radius:18px;padding:28px 26px;}
  .plan-card .head{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
  .plan-card h3{margin:0;font-size:1.1rem;color:var(--teal);}
  .plan-card p{margin:0;line-height:1.75;color:var(--cream-soft);font-size:.96rem;}
  .plan-card.dress{background:linear-gradient(135deg,color-mix(in srgb, ${accent} 16%, transparent),rgba(31,232,213,.10));border-color:var(--magenta);}
  .plan-card.dress h3{color:var(--magenta);}

  /* ---------- LUGAR ---------- */
  .lugar-card{display:inline-flex;flex-direction:column;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--panel-border);border-radius:20px;padding:32px 34px;max-width:100%;}
  .lugar-card .lugar-nombre{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.15rem,3.4vw,1.45rem);color:var(--cream);}
  .lugar-card .lugar-hora{color:var(--cream-soft);font-size:.92rem;}
  .maplink{display:inline-block;margin-top:8px;padding:10px 24px;background:linear-gradient(90deg,var(--magenta),var(--teal-dark));color:#0a0416 !important;text-decoration:none;border-radius:999px;font-weight:700;font-size:.85rem;letter-spacing:.02em;}

  /* ---------- ORGANIZA ---------- */
  .organiza-names{font-family:'Marck Script',cursive;font-size:clamp(1.7rem,5vw,2.3rem);color:var(--gold);margin-top:6px;}

  /* ---------- GALERIA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:12px;}
  .gallery-item{border-radius:14px;overflow:hidden;border:1px solid var(--panel-border);}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,3,16,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream);font-size:2rem;cursor:pointer;}

  /* ---------- RSVP ---------- */
  .sec-rsvp{background:var(--bg-3);}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:16px auto 0;text-align:left;background:var(--panel);border:1px solid var(--panel-border);border-radius:20px;padding:28px 26px;}
  .rsvp-form label{font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--cream-soft);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px 12px;border:1.5px solid var(--panel-border);border-radius:10px;margin-top:5px;width:100%;background:rgba(255,255,255,.05);color:var(--cream);}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:rgba(247,236,217,.4);}
  .rsvp-form button{background:linear-gradient(90deg,var(--magenta),var(--teal-dark));color:#0a0416;border:0;padding:14px;border-radius:999px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;font-size:.86rem;font-weight:700;}
  .rsvp-form button:hover{filter:brightness(1.08);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--teal);text-align:center;text-decoration:none;font-weight:600;}
  .rsvp-status{text-align:center;color:var(--teal);font-weight:700;}

  /* ---------- FOOTER ---------- */
  footer{background:var(--bg-3);color:var(--cream-soft);text-align:center;padding:48px 22px 40px;position:relative;overflow:hidden;}
  footer .foot-motifs{display:flex;justify-content:center;align-items:flex-end;gap:14px;margin-bottom:14px;}
  footer .foot-motifs .motif-frond{width:52px;}
  footer p{margin:0;font-size:.88rem;}
  footer .brand{font-family:'Marck Script',cursive;font-size:1.5rem;color:var(--gold);margin-bottom:6px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-frond tl">${frondSVG(false, "tl", accent)}</div>
    <div class="hero-frond tr">${frondSVG(false, "tr", accent)}</div>
    <div class="hero-frond bl">${frondSVG(false, "bl", accent)}</div>
    <div class="hero-frond br">${frondSVG(false, "br", accent)}</div>
    <div class="hero-frame">
      <div class="hero-content">
        <p class="script-eyebrow">Despedida de</p>
        <h1>${esc(d.nombre)}</h1>
        <p class="hero-sub">SOL, TRAGOS Y PURPURINA PARA DESPEDIR LA SOLTERÍA</p>
        ${fechaLarga ? `<div class="hero-date">${esc(fechaLarga)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</div>` : ""}
      </div>
    </div>
  </div>

  <section class="sec-a">
    <div class="sec-inner">
      <p class="kicker">Faltan solo</p>
      <h2>Cuenta regresiva</h2>
      ${divider()}
      ${cd.html}
    </div>
  </section>

  <section class="sec-b">
    <div class="sec-inner">
      <p class="kicker">Agenda del día</p>
      <h2>El plan</h2>
      ${divider()}
      <div class="plan-grid">
        <div class="plan-card">
          <div class="head">${glassSVG}<h3>Itinerario</h3></div>
          <p>${esc(d.plan)}</p>
        </div>
        <div class="plan-card dress">
          <div class="head">${hibiscusSVG(accent)}<h3>Dress code</h3></div>
          <p>${esc(d.dressCode)}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec-a">
    <div class="sec-inner">
      <p class="kicker">Punto de encuentro</p>
      <h2>¿Dónde nos juntamos?</h2>
      ${divider()}
      <div class="lugar-card">
        ${pinSVG}
        <span class="lugar-nombre">${esc(d.lugar)}</span>
        ${d.hora ? `<span class="lugar-hora">Nos encontramos a las ${esc(d.hora)} hs</span>` : ""}
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
      </div>
    </div>
  </section>

  <section class="sec-b">
    <div class="sec-inner">
      <p class="kicker">Con mucho amor</p>
      <h2>Organiza</h2>
      ${divider()}
      ${pineappleSVG}
      <div class="organiza-names">${esc(d.organizadores)}</div>
    </div>
  </section>

  <section class="sec-a">
    <div class="sec-inner">
      <p class="kicker">Previa</p>
      <h2>Momentos que nos esperan</h2>
      ${divider()}
      ${gal.html}
    </div>
  </section>

  <section class="sec-rsvp">
    <div class="sec-inner">
      <p class="kicker">Última llamada</p>
      <h2>Confirmá tu lugar en la fiesta</h2>
      ${divider()}
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <div class="foot-motifs">${frondSVG(false, "fa", accent)}${diamondSVG}${frondSVG(true, "fb", accent)}</div>
    <p class="brand">Despedida de ${esc(d.nombre)}</p>
    <p>Organizado con cariño por ${esc(d.organizadores)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Tropical Fiesta",
  summary: "Invitación tropical nocturna en magenta y turquesa neón sobre fondo oscuro, con hojas de palmera en degradé, flores y marco elegante dorado.",
  accent: "#ff2f9c", accent2: "#1fe8d5", schema: despedidaSchema, sampleData, render,
};
