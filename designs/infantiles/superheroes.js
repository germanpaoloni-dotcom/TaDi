const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-superheroes";

const sampleData = {
  nombreChico: "Bautista",
  edad: "7",
  fecha: "2027-05-24",
  hora: "17:00",
  lugar: "Salón Divertilandia, San Salvador de Jujuy",
  direccionMapa: "https://maps.google.com/?q=Salon+Divertilandia+San+Salvador+de+Jujuy",
  mensaje: "¡Bautista se pone la capa y cumple 7 años! Vení a ayudarnos a salvar el día: va a haber torta, juegos, misiones secretas y mucha diversión superheroica.",
  tematica: "Vení disfrazado de tu superhéroe favorito",
  whatsapp: "5491100000010",
  coverImage: "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80",
  ],
};

// Estrella de cómic reutilizable (bursts / onomatopeyas / número de edición).
const STAR_CLIP = "clip-path:polygon(50.0% 0.0%,58.3% 19.1%,75.0% 6.7%,72.6% 27.4%,93.3% 25.0%,80.9% 41.7%,100.0% 50.0%,80.9% 58.3%,93.3% 75.0%,72.6% 72.6%,75.0% 93.3%,58.3% 80.9%,50.0% 100.0%,41.7% 80.9%,25.0% 93.3%,27.4% 72.6%,6.7% 75.0%,19.1% 58.3%,0.0% 50.0%,19.1% 41.7%,6.7% 25.0%,27.4% 27.4%,25.0% 6.7%,41.7% 19.1%);";

function render(data = {}) {
  const d = { ...sampleData, ...data };
  // Tono brillante de la gama elegida, pensado para usarse sobre el fondo
  // oscuro del hero y de las franjas nocturnas (ver comentario de palettes.js).
  const accent = getPaletteColor(d.colorPalette, "dark", "#ffce3d");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd9");
  const gal = galleryWidget(d.galeria, "gal9");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡Súper cumple de ${esc(d.nombreChico)}!</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#070a16; --night:#101a52; --night-deep:#080c28;
    --red:#e2241c; --red-deep:#a4140f; --blue:#2a4fdb; --yellow:${accent};
    --paper:#faf4e4; --paper-dim:#efe4c8;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{margin:0;font-family:'Poppins','Segoe UI',Verdana,Arial,sans-serif;background:var(--paper);color:var(--ink);
    background-image:radial-gradient(rgba(7,10,22,.12) 1.3px, transparent 1.5px);background-size:11px 11px;
    border:14px solid var(--ink);}
  h1,h2,.comic-font,.burst,.masthead-eyebrow,.issue-num,.cd-num,.generator .btn-pow,.mission-label{
    font-family:'Bangers','Arial Black',Impact,'Franklin Gothic Bold',sans-serif;font-weight:400;letter-spacing:1.5px;}

  /* ---- Bursts / estrellas de cómic (reutilizables) ---- */
  .burst{position:relative;display:flex;align-items:center;justify-content:center;text-align:center;
    font-weight:400;text-transform:uppercase;line-height:1;color:var(--ink);
    border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);${STAR_CLIP}}
  .burst-red{background:var(--red);color:var(--yellow);}
  .burst-blue{background:var(--blue);color:var(--yellow);}
  .burst-yellow{background:var(--yellow);color:var(--red-deep);}

  /* ---- Rayas de velocidad radiando desde el título ---- */
  .speedlines{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
  .speedlines::before{content:"";position:absolute;top:-35%;left:-25%;width:150%;height:170%;
    background:repeating-conic-gradient(from -15deg at 50% 20%, rgba(255,206,61,.5) 0deg 1.6deg, transparent 1.6deg 8deg);
    opacity:.35;}

  /* ---- Halftone: textura de trama de puntos, para fondos de sección y viñetas ---- */
  .halftone-night{background-image:radial-gradient(rgba(255,255,255,.12) 1.6px, transparent 1.8px);background-size:9px 9px;}
  .halftone-paper{background-image:radial-gradient(rgba(7,10,22,.16) 1.6px, transparent 1.8px);background-size:9px 9px;}

  /* ---- Franjas de sección con fondo nocturno degradado + halftone ---- */
  .strip{position:relative;overflow:hidden;z-index:0;}
  .strip-dark{background:linear-gradient(165deg, var(--night) 0%, var(--night-deep) 100%);}
  .strip-dark .strip-tex{position:absolute;inset:0;pointer-events:none;opacity:1;}

  .section-inner{max-width:760px;margin:0 auto;padding:52px 18px;position:relative;z-index:1;}
  section{max-width:760px;margin:0 auto;padding:52px 18px;position:relative;}

  h2.h2-paper{text-align:center;text-transform:uppercase;font-size:1.65rem;color:var(--red-deep);
    -webkit-text-stroke:1px var(--ink);margin:0 0 22px;letter-spacing:1px;}
  h2.h2-night{text-align:center;text-transform:uppercase;font-size:1.65rem;color:var(--yellow);
    -webkit-text-stroke:1px var(--ink);margin:0 0 22px;letter-spacing:1px;text-shadow:2px 2px 0 rgba(0,0,0,.4);}

  .panel{position:relative;z-index:1;background:#fff;border:5px solid var(--ink);border-radius:12px;
    box-shadow:8px 8px 0 var(--ink);padding:28px 22px;max-width:100%;}
  .tilt-l{transform:rotate(-.8deg);}
  .tilt-r{transform:rotate(.8deg);}

  .bubble{position:relative;z-index:1;background:#fff;border:5px solid var(--ink);border-radius:26px;
    box-shadow:8px 8px 0 var(--ink);padding:26px;font-size:1.05rem;line-height:1.6;text-align:center;}
  .bubble::before{content:"";position:absolute;left:56px;bottom:-30px;
    border-width:22px 22px 0 0;border-style:solid;border-color:var(--ink) transparent transparent transparent;}
  .bubble::after{content:"";position:absolute;left:62px;bottom:-22px;
    border-width:16px 16px 0 0;border-style:solid;border-color:#fff transparent transparent transparent;}

  .mission-label{display:inline-block;background:var(--blue);color:#fff;font-weight:400;
    text-transform:uppercase;font-size:.9rem;letter-spacing:1px;padding:6px 14px;border-radius:8px;
    border:3px solid var(--ink);margin-bottom:12px;}
  .mission-text{font-size:1.15rem;font-weight:700;}

  /* ---- Cabecera / portada estilo tira cómica ---- */
  .hero{position:relative;overflow:hidden;text-align:center;padding:20px 18px 0;
    background:linear-gradient(180deg, var(--night) 0%, var(--night-deep) 78%);}
  .hero .strip-tex{position:absolute;inset:0;opacity:.9;pointer-events:none;}
  .hero-glow{position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:520px;max-width:140%;height:340px;
    background:radial-gradient(ellipse at center, rgba(255,206,61,.22) 0%, transparent 68%);pointer-events:none;z-index:0;}

  .masthead{position:relative;z-index:1;display:flex;justify-content:center;}
  .masthead-eyebrow{background:var(--paper);color:var(--ink);border:3px solid var(--ink);border-radius:5px;
    padding:6px 16px;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;transform:rotate(-1.6deg);
    box-shadow:3px 3px 0 var(--ink);}
  .hero-sticker{position:absolute;z-index:2;top:6px;right:4%;width:78px;height:78px;font-size:.6rem;transform:rotate(10deg);}

  .hero-name{position:relative;z-index:1;max-width:720px;margin:16px auto 4px;}
  .hero-name h1{font-family:'Luckiest Guy',cursive;font-size:clamp(2.5rem,10.5vw,5rem);margin:0;
    text-transform:uppercase;letter-spacing:1px;color:var(--yellow);-webkit-text-stroke:3px var(--ink);
    paint-order:stroke fill;text-shadow:4px 4px 0 var(--red),8px 8px 0 rgba(0,0,0,.4);line-height:1.02;word-break:break-word;}
  .hero-tagline{position:relative;z-index:1;margin:2px 0 0;color:var(--paper);font-size:1rem;
    letter-spacing:1px;text-transform:uppercase;opacity:.92;}

  /* ---- Grilla de viñetas (comic strip real: panel grande + paneles chicos) ---- */
  .comic-grid{position:relative;z-index:1;display:grid;grid-template-columns:1.4fr 1fr;grid-template-rows:1fr 1fr;
    gap:12px;max-width:600px;margin:22px auto 0;padding-bottom:30px;}
  .cell{position:relative;overflow:hidden;border:5px solid var(--ink);border-radius:8px;box-shadow:7px 7px 0 rgba(0,0,0,.5);}
  .cell-photo{grid-column:1;grid-row:1/3;background:#1a2350;}
  .cell-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.1) saturate(1.08);}
  .cell-photo::after{content:"";position:absolute;inset:0;pointer-events:none;
    background-image:radial-gradient(rgba(255,255,255,.45) 1px, transparent 1.3px);background-size:6px 6px;
    mix-blend-mode:overlay;opacity:.45;}
  .cell-caption{grid-column:2;grid-row:1;background:var(--paper);display:flex;flex-direction:column;
    align-items:center;justify-content:center;text-align:center;padding:10px 6px;gap:2px;}
  .issue-eyebrow{font-family:'Bangers';font-size:.58rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--blue);}
  .issue-num{font-family:'Luckiest Guy',cursive;font-size:2.3rem;line-height:1;color:var(--red);
    -webkit-text-stroke:1.3px var(--ink);paint-order:stroke fill;}
  .issue-label{font-family:'Bangers';font-size:.62rem;letter-spacing:1px;text-transform:uppercase;color:var(--ink);}
  .cell-burst{grid-column:2;grid-row:2;background:var(--red);display:flex;align-items:center;justify-content:center;}
  .cell-burst .burst{width:82%;aspect-ratio:1;font-size:1rem;transform:rotate(-6deg);}

  .skyline{width:100%;height:44px;display:block;position:relative;z-index:1;}
  .skyline svg{width:100%;height:100%;display:block;}

  .zigzag{height:15px;background-color:var(--ink);
    background-image:linear-gradient(135deg,var(--tooth,var(--paper)) 25%,transparent 25%),linear-gradient(225deg,var(--tooth,var(--paper)) 25%,transparent 25%);
    background-position:0 0;background-size:22px 22px;background-repeat:repeat-x;position:relative;z-index:1;}

  /* Countdown (widget markup, custom styling) */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
  .countdown div{background:var(--night);color:var(--yellow);border:4px solid var(--ink);border-radius:10px;
    min-width:64px;padding:10px 6px;text-align:center;box-shadow:4px 4px 0 var(--ink);}
  .cd-num{display:block;font-size:1.8rem;font-weight:400;}
  .cd-label{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:1px;color:var(--paper);opacity:.85;}

  .loc-info p{font-size:1.05rem;margin:6px 0;text-align:center;}
  .btn-pow{display:block;width:max-content;margin:18px auto 0;background:var(--red);color:#fff;
    font-weight:900;text-transform:uppercase;text-decoration:none;padding:12px 26px;
    border:4px solid var(--ink);border-radius:10px;box-shadow:5px 5px 0 var(--ink);
    transition:transform .1s,box-shadow .1s;}
  .btn-pow:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}

  /* Gallery (widget markup) */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:10px;cursor:pointer;
    border:4px solid var(--ink);box-shadow:4px 4px 0 var(--ink);}
  .gallery-item:nth-child(odd) img{transform:rotate(-1.5deg);}
  .gallery-item:nth-child(even) img{transform:rotate(1.5deg);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(7,10,22,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;border:5px solid var(--yellow);}
  .lightbox-close{position:absolute;top:20px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;font-weight:900;}

  /* ---- "Cápsula generadora de identidad secreta" ---- */
  .generator{position:relative;background:linear-gradient(165deg,var(--night) 0%,var(--night-deep) 100%);
    border:5px solid var(--ink);border-radius:16px;box-shadow:8px 8px 0 rgba(0,0,0,.5);padding:26px 22px;overflow:hidden;}
  .generator .strip-tex{position:absolute;inset:0;opacity:.5;pointer-events:none;}
  .generator-inner{position:relative;z-index:1;}
  .generator-label{display:block;color:var(--paper);font-size:.75rem;text-transform:uppercase;
    letter-spacing:1.5px;margin-bottom:8px;opacity:.85;}
  .generator input{font-family:inherit;font-size:1rem;padding:10px 12px;border:3px solid var(--yellow);
    border-radius:8px;width:100%;margin-bottom:12px;background:#0c1440;color:#fff;}
  .generator input::placeholder{color:rgba(255,255,255,.5);}
  .generator .btn-pow{width:100%;display:block;background:var(--red);color:#fff;font-size:1.05rem;
    border:4px solid var(--ink);border-radius:10px;padding:13px;box-shadow:5px 5px 0 rgba(0,0,0,.5);
    cursor:pointer;transition:transform .1s,box-shadow .1s;}
  .generator .btn-pow:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 rgba(0,0,0,.5);}
  .generator-screen{position:relative;overflow:hidden;margin-top:16px;background:#04061a;
    border:3px solid var(--ink);border-radius:10px;padding:20px 14px;text-align:center;min-height:1.8em;}
  .generator-screen::before{content:"";position:absolute;inset:0;pointer-events:none;
    background-image:radial-gradient(rgba(255,255,255,.1) 1.4px, transparent 1.6px);background-size:7px 7px;}
  .generator-result{position:relative;z-index:1;font-size:1.35rem;color:var(--yellow);
    text-transform:uppercase;min-height:1.5em;text-shadow:0 0 12px rgba(255,206,61,.45);}

  /* RSVP (widget markup) */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;font-weight:700;color:var(--blue);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;
    border:3px solid var(--ink);border-radius:8px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--red);color:#fff;border:4px solid var(--ink);padding:12px;
    border-radius:10px;font-weight:900;text-transform:uppercase;box-shadow:5px 5px 0 var(--ink);
    cursor:pointer;transition:transform .1s,box-shadow .1s;}
  .rsvp-form button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}
  .rsvp-whatsapp{text-align:center;font-weight:700;color:var(--blue);text-decoration:none;}
  .rsvp-status{text-align:center;font-weight:900;color:#1f9d55;}

  footer{background:var(--night-deep);color:#fff;text-align:center;padding:34px 20px;position:relative;z-index:1;}
  footer .stars{color:var(--yellow);letter-spacing:6px;margin-bottom:8px;}
  footer p{margin:4px 0;font-size:.9rem;}

  /* ---- Bursts de esquina por sección ---- */
  .corner-burst{position:absolute;width:58px;height:58px;font-weight:400;text-align:center;
    display:flex;align-items:center;justify-content:center;line-height:1;font-size:.68rem;z-index:2;
    top:-14px;pointer-events:none;}
  .corner-burst.left{left:-6px;transform:rotate(-11deg);}
  .corner-burst.right{right:-6px;transform:rotate(9deg);}

  @media(max-width:600px){
    body{border-width:8px;}
  }

  @media(max-width:560px){
    .comic-grid{grid-template-columns:1fr 1fr;grid-template-rows:auto auto;}
    .cell-photo{grid-column:1/3;grid-row:1;aspect-ratio:16/10;}
    .cell-caption{grid-column:1;grid-row:2;min-height:118px;}
    .cell-burst{grid-column:2;grid-row:2;min-height:118px;}
  }

  @media(max-width:480px){
    .panel,.bubble{padding:20px 16px;}
    .hero{padding-top:52px;}
    .hero-sticker{width:56px;height:56px;font-size:.48rem;right:6%;}
    .issue-num{font-size:1.8rem;}
    .corner-burst{width:46px;height:46px;font-size:.56rem;}
  }
</style></head>
<body>

  <div class="hero strip">
    <div class="strip-tex halftone-night"></div>
    <div class="speedlines"></div>
    <div class="hero-glow"></div>

    <span class="burst burst-yellow hero-sticker">¡Edición<br>especial!</span>

    <div class="masthead">
      <span class="masthead-eyebrow">¡Alerta de súper cumple!</span>
    </div>

    <div class="hero-name">
      <h1>${esc(d.nombreChico)}</h1>
      <p class="hero-tagline">activa sus superpoderes</p>
    </div>

    <div class="comic-grid">
      <div class="cell cell-photo">
        <img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}">
      </div>
      <div class="cell cell-caption">
        <span class="issue-eyebrow">Edición Nº</span>
        <span class="issue-num">${esc(d.edad)}</span>
        <span class="issue-label">¡años de aventuras!</span>
      </div>
      <div class="cell cell-burst">
        <span class="burst burst-yellow">¡Boom!</span>
      </div>
    </div>

    <div class="skyline">
      <svg viewBox="0 0 600 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="20" width="40" height="40" fill="#050814"/>
        <rect x="42" y="8" width="26" height="52" fill="#050814"/>
        <rect x="72" y="26" width="34" height="34" fill="#050814"/>
        <rect x="110" y="0" width="30" height="60" fill="#050814"/>
        <rect x="144" y="16" width="24" height="44" fill="#050814"/>
        <rect x="172" y="30" width="46" height="30" fill="#050814"/>
        <rect x="222" y="10" width="20" height="50" fill="#050814"/>
        <rect x="246" y="24" width="30" height="36" fill="#050814"/>
        <rect x="280" y="2" width="28" height="58" fill="#050814"/>
        <rect x="312" y="22" width="36" height="38" fill="#050814"/>
        <rect x="352" y="12" width="22" height="48" fill="#050814"/>
        <rect x="378" y="30" width="40" height="30" fill="#050814"/>
        <rect x="422" y="6" width="26" height="54" fill="#050814"/>
        <rect x="452" y="24" width="32" height="36" fill="#050814"/>
        <rect x="488" y="0" width="24" height="60" fill="#050814"/>
        <rect x="516" y="18" width="30" height="42" fill="#050814"/>
        <rect x="550" y="28" width="50" height="32" fill="#050814"/>
        <g style="fill:var(--yellow);" opacity=".8">
          <rect x="8" y="30" width="4" height="4"/><rect x="20" y="30" width="4" height="4"/><rect x="8" y="42" width="4" height="4"/>
          <rect x="118" y="10" width="4" height="4"/><rect x="130" y="10" width="4" height="4"/>
          <rect x="288" y="14" width="4" height="4"/><rect x="288" y="26" width="4" height="4"/>
          <rect x="430" y="16" width="4" height="4"/><rect x="430" y="28" width="4" height="4"/>
          <rect x="496" y="12" width="4" height="4"/><rect x="496" y="24" width="4" height="4"/>
        </g>
      </svg>
    </div>
  </div>
  <div class="zigzag" style="--tooth:var(--night-deep);"></div>

  <section>
    <span class="corner-burst left burst burst-blue">¡Zap!</span>
    <h2 class="h2-paper">T-menos para la misión</h2>
    <div class="panel tilt-l" style="margin:0 auto;">
      ${cd.html}
    </div>
  </section>

  ${d.mensaje ? `<div class="strip strip-dark">
    <div class="strip-tex halftone-night"></div>
    <div class="section-inner">
      <span class="corner-burst right burst burst-yellow">¡Wham!</span>
      <h2 class="h2-night">Transmisión de la Liga</h2>
      <div class="bubble">${esc(d.mensaje)}</div>
    </div>
  </div>
  <div class="zigzag" style="--tooth:var(--night-deep);"></div>` : ""}

  <section>
    <span class="corner-burst left burst burst-red">¡Crash!</span>
    <h2 class="h2-paper">Coordenadas de la base secreta</h2>
    <div class="panel tilt-r loc-info">
      <p><strong>${esc(d.fecha)}</strong>${d.hora ? ` a las <strong>${esc(d.hora)}</strong> hs` : ""}</p>
      ${d.lugar ? `<p>${esc(d.lugar)}</p>` : ""}
      ${d.tematica ? `<div style="text-align:center;margin-top:16px;"><span class="mission-label">Misión especial</span><p class="mission-text">${esc(d.tematica)}</p></div>` : ""}
      ${d.direccionMapa ? `<a class="btn-pow" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver mapa →</a>` : ""}
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="corner-burst right burst burst-blue">¡Pow!</span>
    <h2 class="h2-paper">Bitácora de entrenamiento</h2>
    ${gal.html}
  </section>` : ""}

  <div class="strip strip-dark">
    <div class="strip-tex halftone-night"></div>
    <div class="section-inner">
      <h2 class="h2-night">Cápsula generadora de identidad secreta</h2>
      <div class="generator">
        <div class="strip-tex halftone-night"></div>
        <div class="generator-inner">
          <span class="generator-label">Ingresá tu nombre civil</span>
          <input type="text" id="heroNameInput" placeholder="Escribí tu nombre..." value="${esc(d.nombreChico)}">
          <button type="button" class="btn-pow" id="heroNameBtn">¡Activar poderes!</button>
          <div class="generator-screen">
            <p class="generator-result" id="heroNameResult"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="zigzag" style="--tooth:var(--night-deep);"></div>

  <section>
    <span class="corner-burst left burst burst-yellow">¡Pum!</span>
    <h2 class="h2-paper">Alistá al escuadrón</h2>
    ${rsvpDeadline ? `<p style="position:relative;z-index:1;margin:-6px 0 20px;text-align:center;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.7;">Confirmá antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="panel tilt-l">
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <div class="stars">★ ★ ★</div>
    <p>¡Te esperamos para salvar el día junto a ${esc(d.nombreChico)}!</p>
    <p>Con súper cariño, la familia organizadora.</p>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var prefixes = ['Capitán','Súper','Increíble','Doctor','Comandante','Mega','Ultra','Turbo',
        'Fantástico','Asombroso','Poderoso','Invencible','Titán','Guardián','Centinela','Vengador',
        'Justiciero','Fenómeno','Explosivo','Cósmico','Eléctrico','Vigilante','Veloz','Salvaje',
        'Místico','Radiante','Temerario','Valiente','Heroico','Legendario','Imparable','Estelar',
        'Galáctico','Supremo','Indomable'];
      var suffixes = ['Rayo','Cometa','Trueno','Fénix','Tornado','Estrella','Halcón','Cohete',
        'Tigre','Águila','Dragón','Pantera','Lobo','Cobra','Meteoro','Centella','Titanio','Fantasma',
        'Vórtice','Huracán','Relámpago','Bólido','Escarabajo','Guepardo','Tempestad','Nova','Impacto',
        'Puma','Corcel','Diamante','Sombra','Vendaval','Cristal','Fulgor','Zafiro'];
      var input = document.getElementById('heroNameInput');
      var btn = document.getElementById('heroNameBtn');
      var result = document.getElementById('heroNameResult');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var val = (input.value || '').trim() || 'Héroe';
        var seed = 0;
        for (var i = 0; i < val.length; i++) seed += val.charCodeAt(i);
        seed += Math.floor(Math.random() * 10000);
        var p = prefixes[seed % prefixes.length];
        var s = suffixes[(seed * 7 + val.length) % suffixes.length];
        result.textContent = '¡' + p + ' ' + s + '!';
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    border:4px solid #070a16;box-sizing:border-box;
    background:
      radial-gradient(rgba(255,255,255,.1) 1.3px, transparent 1.5px) 0 0/8px 8px,
      linear-gradient(165deg,#101a52 0%,#080c28 100%);">
    <span style="position:absolute;top:8px;left:8px;right:8px;display:flex;justify-content:space-between;align-items:flex-start;">
      <span style="background:#faf4e4;color:#070a16;font-family:'Arial Black',Impact,sans-serif;font-size:.5rem;
        text-transform:uppercase;letter-spacing:1px;padding:3px 7px;border:2px solid #070a16;border-radius:3px;transform:rotate(-2deg);">Edición especial</span>
      <span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:#e2241c;color:#ffce3d;
        font-weight:900;font-family:'Arial Black',Impact,sans-serif;font-size:.5rem;text-align:center;border:2px solid #070a16;
        transform:rotate(9deg);
        clip-path:polygon(50.0% 0.0%,58.3% 19.1%,75.0% 6.7%,72.6% 27.4%,93.3% 25.0%,80.9% 41.7%,100.0% 50.0%,80.9% 58.3%,93.3% 75.0%,72.6% 72.6%,75.0% 93.3%,58.3% 80.9%,50.0% 100.0%,41.7% 80.9%,25.0% 93.3%,27.4% 72.6%,6.7% 75.0%,19.1% 58.3%,0.0% 50.0%,19.1% 41.7%,6.7% 25.0%,27.4% 27.4%,25.0% 6.7%,41.7% 19.1%);">Pow</span>
    </span>
    <span style="font-family:'Arial Black',Impact,sans-serif;font-size:1.3rem;
      color:#ffce3d;-webkit-text-stroke:1.5px #070a16;paint-order:stroke fill;letter-spacing:1px;
      text-shadow:2px 2px 0 #e2241c;">Superhéroes</span>
    <span style="font-family:Arial,sans-serif;font-size:.56rem;color:#faf4e4;letter-spacing:2px;text-transform:uppercase;opacity:.8;">Cómic nocturno de acción</span>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Superhéroes",
  summary: "Tapa de cómic nocturno en tira de viñetas: panel de foto, número de edición y estallido gráfico, con halftone, generador de identidad secreta y skyline.",
  accent: "#e2241c", accent2: "#101a52", schema: infantilSchema, sampleData, render, cardPreview,
};
