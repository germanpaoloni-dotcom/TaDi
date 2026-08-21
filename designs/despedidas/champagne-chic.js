const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta } = require("../widgets");
const { despedidaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "desp-champagne-chic";

const sampleData = {
  nombre: "Valentina",
  fecha: "2027-03-13",
  hora: "17:00",
  lugar: "Rooftop Ala, Palermo Soho",
  direccionMapa: "https://maps.google.com/?q=Rooftop+Ala+Palermo+Soho+Buenos+Aires",
  plan: "Arrancamos con una tarde de spa y masajes, seguimos con un brunch con burbujas en la terraza y cerramos con brindis, torta y sorpresas para la futura novia. ¡Team Bride al completo, no puede faltar nadie!",
  dressCode: "Elegante sport, paleta de colores pastel. La novia va de blanco, el resto evitamos ese color.",
  organizadores: "Sofía, Cata y Meli (las damas de honor)",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80",
    "https://images.unsplash.com/photo-1533622597524-a1215e26c0a1?w=800&q=80",
  ],
};

// Motivos chic dibujados a mano en SVG inline (sin depender de íconos externos):
// copa de champagne con burbujas, lazo, confeti suelto y una tiara sutil.
const champagneSVG = `<svg class="motif motif-champagne" viewBox="0 0 40 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 6 C8 22 14 30 20 34 C26 30 32 22 32 6 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <line x1="20" y1="34" x2="20" y2="72" stroke="currentColor" stroke-width="1.3"/>
  <ellipse cx="20" cy="76" rx="13" ry="4" stroke="currentColor" stroke-width="1.3"/>
  <path d="M20 34 C20 50 20 60 20 72" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="16" cy="14" r="1" fill="currentColor"/>
  <circle cx="22" cy="20" r=".8" fill="currentColor"/>
  <circle cx="18" cy="24" r=".9" fill="currentColor"/>
  <circle cx="24" cy="12" r=".7" fill="currentColor"/>
</svg>`;

const clinkSVG = `<svg class="motif motif-clink" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g transform="rotate(-18 30 40)">
    <path d="M20 6 C20 20 25 27 30 30 C35 27 40 20 40 6 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <line x1="30" y1="30" x2="30" y2="62" stroke="currentColor" stroke-width="1.3"/>
    <ellipse cx="30" cy="65" rx="10" ry="3.2" stroke="currentColor" stroke-width="1.3"/>
  </g>
  <g transform="rotate(18 110 40)">
    <path d="M100 6 C100 20 105 27 110 30 C115 27 120 20 120 6 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <line x1="110" y1="30" x2="110" y2="62" stroke="currentColor" stroke-width="1.3"/>
    <ellipse cx="110" cy="65" rx="10" ry="3.2" stroke="currentColor" stroke-width="1.3"/>
  </g>
  <circle cx="55" cy="16" r="1" fill="currentColor"/>
  <circle cx="60" cy="10" r=".8" fill="currentColor"/>
  <circle cx="64" cy="18" r=".9" fill="currentColor"/>
  <circle cx="80" cy="14" r="1" fill="currentColor"/>
</svg>`;

const bowSVG = `<svg class="motif motif-bow" viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M30 17 C30 17 24 4 12 5 C2 6 2 17 12 18 C22 19 30 17 30 17 C30 17 38 19 48 18 C58 17 58 6 48 5 C36 4 30 17 30 17 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <circle cx="30" cy="17" r="3" stroke="currentColor" stroke-width="1.3"/>
  <path d="M27 20 L23 32 M33 20 L37 32" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`;

const tiaraSVG = `<svg class="motif motif-tiara" viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 40 C6 22 20 24 24 34 C28 18 40 10 50 10 C60 10 72 18 76 34 C80 24 94 22 94 40" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="50" cy="8" r="3.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="24" cy="32" r="2" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="76" cy="32" r="2" stroke="currentColor" stroke-width="1.2"/>
  <line x1="4" y1="40" x2="96" y2="40" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

function confettiSVG(extraClass) {
  return `<svg class="motif motif-confetti${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="10" cy="14" r="2.4" fill="currentColor"/>
    <circle cx="40" cy="40" r="1.6" fill="currentColor"/>
    <rect x="64" y="8" width="5" height="5" transform="rotate(30 66 10)" fill="currentColor"/>
    <circle cx="96" cy="22" r="2" fill="currentColor"/>
    <path d="M118 40 l4 -4 l4 4 l-4 4 z" fill="currentColor"/>
    <circle cx="150" cy="10" r="1.8" fill="currentColor"/>
    <rect x="170" y="30" width="4.5" height="4.5" transform="rotate(-20 172 32)" fill="currentColor"/>
    <circle cx="190" cy="16" r="2.2" fill="currentColor"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${confettiSVG()}${bowSVG}${confettiSVG("flip")}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#c9a15a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-champ");
  const gal = galleryWidget(d.galeria, "gal-champ");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

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
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Tangerine:wght@700&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --blush:#f7e0d4;
    --blush-soft:#fbeee6;
    --gold:${accent};
    --gold-deep:color-mix(in srgb, ${accent}, black 20%);
    --ink:#2b2320;
    --ink-soft:#5a4c42;
    --cream:#fffaf5;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--cream);color:var(--ink);font-family:'Montserrat',sans-serif;font-weight:300;}
  img{max-width:100%;}
  h1,h2,h3{font-family:'Cormorant Garamond',serif;}
  .script{font-family:'Tangerine',cursive;}

  .motif{color:var(--gold);}
  .motif-champagne{width:clamp(26px,6vw,38px);height:auto;}
  .motif-clink{width:clamp(90px,22vw,150px);height:auto;margin:0 auto;}
  .motif-bow{width:clamp(38px,8vw,56px);height:auto;flex:0 0 auto;}
  .motif-tiara{width:clamp(70px,18vw,110px);height:auto;margin:0 auto;}
  .motif-confetti{width:clamp(70px,18vw,150px);height:auto;flex:1 1 auto;}
  .motif-confetti.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,16px);max-width:520px;margin:0 auto 26px;}

  .hero{position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:48px 20px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(43,35,32,.32) 0%,rgba(43,35,32,.5) 55%,rgba(43,35,32,.78) 100%);}
  .hero-frame{position:absolute;inset:16px;border:1px solid rgba(255,250,245,.55);pointer-events:none;}
  .hero-frame::before,.hero-frame::after{content:"";position:absolute;width:26px;height:26px;border:1px solid var(--gold);}
  .hero-frame::before{top:-1px;left:-1px;border-right:0;border-bottom:0;}
  .hero-frame::after{bottom:-1px;right:-1px;border-left:0;border-top:0;}
  .hero-content{position:relative;z-index:1;color:#fffaf5;max-width:620px;}
  .hero-content .motif-tiara{color:var(--gold);margin-bottom:12px;}
  .eyebrow{letter-spacing:.4em;text-transform:uppercase;font-size:clamp(.62rem,1.6vw,.78rem);opacity:.92;}
  .hero-content h1{font-size:clamp(3.4rem,11vw,6.2rem);font-weight:600;margin:10px 0 4px;font-style:italic;letter-spacing:1px;}
  .team-bride{font-family:'Tangerine',cursive;font-size:clamp(2rem,7vw,3.2rem);color:var(--gold);margin:0 0 6px;line-height:1;}
  .hero-date{letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.72rem,2vw,.9rem);color:var(--blush);margin-top:14px;}
  .hero-champagnes{display:flex;justify-content:center;gap:18px;margin-top:22px;}

  section{max-width:760px;margin:0 auto;padding:64px 24px;text-align:center;}
  h2{font-weight:500;letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.1rem,2.8vw,1.5rem);color:var(--gold-deep);margin:0 0 30px;}

  .countdown{display:flex;gap:clamp(10px,4vw,30px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:56px;}
  .cd-num{font-family:'Cormorant Garamond',serif;font-size:clamp(1.7rem,5vw,2.5rem);color:var(--gold-deep);}
  .cd-label{font-size:.64rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--ink-soft);}

  .plan-wrap{background:var(--blush-soft);border-radius:4px;padding:48px 32px;position:relative;}
  .plan-wrap .motif-champagne{margin:0 auto 16px;}
  .plan-text{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.05rem,2.6vw,1.3rem);line-height:1.85;color:var(--ink-soft);max-width:560px;margin:0 auto;}
  .dresscode{margin-top:26px;padding-top:22px;border-top:1px dashed var(--gold);display:inline-block;}
  .dresscode .label{display:block;letter-spacing:2px;text-transform:uppercase;font-size:.7rem;color:var(--gold-deep);margin-bottom:8px;}
  .dresscode p{margin:0;font-size:.95rem;color:var(--ink-soft);}

  .venue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;text-align:left;margin-top:8px;}
  .venue-card{background:#fff;border:1px solid var(--blush);box-shadow:0 6px 22px color-mix(in srgb, var(--gold) 12%, transparent);padding:30px;border-radius:4px;text-align:center;}
  .venue-card h3{margin:0 0 10px;font-weight:500;letter-spacing:1px;color:var(--gold-deep);font-size:1.15rem;}
  .venue-card p{margin:0;line-height:1.7;color:var(--ink-soft);}
  .maplink{display:inline-block;margin-top:20px;color:var(--gold-deep);text-decoration:none;border-bottom:1px solid var(--gold);letter-spacing:.5px;font-size:.9rem;}

  .organiza{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.2rem,3vw,1.5rem);color:var(--ink);}
  .organiza .script{display:block;font-family:'Tangerine',cursive;font-size:clamp(2.4rem,7vw,3.4rem);color:var(--gold);margin-top:6px;font-style:normal;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:4px;cursor:pointer;filter:saturate(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(43,35,32,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:2px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fffaf5;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Montserrat',sans-serif;padding:11px;border:1px solid var(--blush);border-radius:3px;margin-top:5px;width:100%;background:#fff;}
  .rsvp-form button{background:var(--gold);color:#fff;border:0;padding:14px;border-radius:3px;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-weight:500;transition:background .2s;}
  .rsvp-form button:hover{background:var(--gold-deep);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold-deep);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:#7c8f5a;font-weight:bold;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid var(--blush);background:var(--blush-soft);}
  footer .motif-bow{width:32px;height:auto;margin:0 auto 14px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-frame"></div>
    <div class="hero-content">
      ${tiaraSVG}
      <p class="eyebrow">Despedida de Soltera</p>
      <p class="team-bride">Team Bride</p>
      <h1>${esc(d.nombre)}</h1>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
      <div class="hero-champagnes">${champagneSVG}${champagneSVG}${champagneSVG}</div>
    </div>
  </div>

  <section>
    ${divider()}
    <h2>Faltan para brindar</h2>
    ${cd.html}
  </section>

  ${(d.plan || d.dressCode) ? `
  <section>
    <div class="plan-wrap">
      ${champagneSVG}
      <h2>El plan</h2>
      ${d.plan ? `<p class="plan-text">${esc(d.plan)}</p>` : ""}
      ${d.dressCode ? `<div class="dresscode"><span class="label">Dress code</span><p>${esc(d.dressCode)}</p></div>` : ""}
    </div>
  </section>` : ""}

  ${(d.lugar || d.hora || d.direccionMapa) ? `
  <section>
    ${divider()}
    <h2>Dónde nos encontramos</h2>
    <div class="venue-grid">
      <div class="venue-card">
        ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
        <p>${d.hora ? `Nos juntamos a las ${esc(d.hora)} hs` : "Horario a confirmar"}</p>
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
      </div>
    </div>
  </section>` : ""}

  ${d.organizadores ? `
  <section>
    ${divider()}
    <h2>Organiza</h2>
    <p class="organiza">Con muchísimo amor<span class="script">${esc(d.organizadores)}</span></p>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <section>
    ${divider()}
    <h2>Momentos</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Confirmá tu lugar</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${bowSVG}
    Brindamos por ${esc(d.nombre)} — ¡nos vemos ahí!
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Champagne Chic",
  summary: "Despedida de soltera elegante en tonos champagne, blush y dorado, con copas, lazos y confeti dibujados a mano.",
  accent: "#c9a15a", schema: despedidaSchema, sampleData, render,
};
