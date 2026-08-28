const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-moderna-minimal";

const sampleData = {
  novia: "Sofía", novio: "Nicolás",
  fecha: "2027-03-20", horaCeremonia: "19:00", lugarCeremonia: "Registro Civil, CABA",
  horaFiesta: "21:00", lugarFiesta: "Terraza Puerto Madero",
  direccionMapa: "https://maps.google.com/?q=Puerto+Madero",
  mensaje: "Por encima de todo, vístanse de amor, que es el vínculo perfecto.",
  dressCode: "Formal minimal - blanco y negro",
  alias: "sofi.nico.wedding",
  whatsapp: "5491100000002",
  coverImage: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1529636444744-d90360e0c885?w=800&q=80",
    "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80",
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
  ],
};

// Ramita de eucalipto estilo acuarela + un hilo dorado fino que la acompaña,
// en SVG inline (sin ids, se puede repetir varias veces en la misma página
// sin colisiones). El hilo dorado es un detalle fijo (no depende de la
// paleta elegida por el usuario), igual que el verde de las hojas.
const EUCALYPTUS_BRANCH = `
<svg viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <path d="M244 6 C 198 58 168 96 150 140" fill="none" stroke="#c9a86a" stroke-width="1" opacity="0.5"/>
  <path d="M232 16 C 194 64 152 96 122 148 C 92 198 70 250 40 302" fill="none" stroke="#7c8a5e" stroke-width="2" opacity="0.55"/>
  <g opacity="0.94">
    <g transform="translate(226,34) rotate(35)"><path d="M0,0 C14,-22 14,-52 0,-72 C-14,-52 -14,-22 0,0 Z" fill="#93a06d"/><path d="M0,-4 L0,-66" stroke="#5f6b45" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(206,58) rotate(-24)"><path d="M0,0 C13,-20 13,-48 0,-66 C-13,-48 -13,-20 0,0 Z" fill="#7c8a5e"/><path d="M0,-4 L0,-60" stroke="#4f5b3a" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(176,88) rotate(50)"><path d="M0,0 C15,-24 15,-54 0,-76 C-15,-54 -15,-24 0,0 Z" fill="#a9b78a"/><path d="M0,-4 L0,-70" stroke="#5f6b45" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(154,120) rotate(-46)"><path d="M0,0 C12,-19 12,-45 0,-62 C-12,-45 -12,-19 0,0 Z" fill="#5f6b45"/><path d="M0,-4 L0,-56" stroke="#3d452c" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(124,154) rotate(15)"><path d="M0,0 C14,-22 14,-52 0,-72 C-14,-52 -14,-22 0,0 Z" fill="#93a06d"/><path d="M0,-4 L0,-66" stroke="#5f6b45" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(94,194) rotate(-60)"><path d="M0,0 C13,-20 13,-48 0,-66 C-13,-48 -13,-20 0,0 Z" fill="#7c8a5e"/><path d="M0,-4 L0,-60" stroke="#4f5b3a" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(70,234) rotate(30)"><path d="M0,0 C12,-19 12,-45 0,-62 C-12,-45 -12,-19 0,0 Z" fill="#a9b78a"/><path d="M0,-4 L0,-56" stroke="#5f6b45" stroke-width="1" opacity="0.5"/></g>
    <g transform="translate(44,274) rotate(-15)"><path d="M0,0 C11,-17 11,-40 0,-55 C-11,-40 -11,-17 0,0 Z" fill="#5f6b45"/><path d="M0,-4 L0,-50" stroke="#3d452c" stroke-width="1" opacity="0.5"/></g>
  </g>
</svg>`;

// Mancha abstracta tipo acuarela (arena/beige) con un hilo dorado fino que
// la atraviesa — decoración de portada, no depende de la paleta elegida.
const BLOB_DECO = `
<svg viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs><filter id="blob-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>
  <g filter="url(#blob-soft)">
    <path d="M0,50 C40,15 95,2 140,28 C182,53 158,108 196,132 C224,150 255,128 280,150 C292,161 300,170 300,185 L300,0 L0,0 Z" fill="#e9dfca" opacity="0.9"/>
    <path d="M0,105 C50,72 82,108 122,92 C162,76 174,118 214,108 C240,101 254,120 270,112 L300,118 L300,0 L0,0 Z" fill="#ded1b0" opacity="0.55"/>
  </g>
  <path d="M-6,60 C34,104 58,10 100,42 C136,69 158,14 196,4" fill="none" stroke="#c9a86a" stroke-width="1.3" opacity="0.85"/>
</svg>`;

// Pequeño ornamento tipo ramita curva (dos trazos que se abren desde un
// punto) — se usa bajo títulos y entre el lugar y el botón de cada tarjeta
// de itinerario, en reemplazo de íconos "de librería".
const LEAF_SPRIG = `<svg class="leaf-sprig" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M45 10 C36 3 27 3 18 10 C27 7 34 8.5 40 10" stroke="currentColor" stroke-width="1.1"/>
  <path d="M45 10 C54 17 63 17 72 10 C63 13 56 11.5 50 10" stroke="currentColor" stroke-width="1.1"/>
  <circle cx="45" cy="10" r="1.5" fill="currentColor"/>
</svg>`;

const DOT_DIVIDER = `<div class="dot-divider" aria-hidden="true"><span class="ln"></span><span class="dot"></span><span class="ln"></span></div>`;

const GIFT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3.5" y="8.2" width="17" height="4" rx=".6"/>
  <rect x="4.7" y="12.2" width="14.6" height="8.6" rx=".6"/>
  <path d="M12 8.2 V20.8"/>
  <path d="M12 8.2c-2.6 0-4-1.4-4-2.8 0-1.3 1-1.9 1.9-1.5 1.4.6 2.1 2.5 2.1 4.3Z"/>
  <path d="M12 8.2c2.6 0 4-1.4 4-2.8 0-1.3-1-1.9-1.9-1.5-1.4.6-2.1 2.5-2.1 4.3Z"/>
</svg>`;

const RING_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="14.6" r="6"/>
  <path d="M9 8.6 L12 3 L15 8.6"/>
  <circle cx="12" cy="5.7" r="1.1" fill="currentColor" stroke="none"/>
</svg>`;

const MESES_ES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const DIAS_ES = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#6d7a52");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd3");
  const gal = galleryWidget(d.galeria, "gal3");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "bodas", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  // Fecha formateada (server-side, sin depender de zona horaria del browser)
  let fechaObj = null;
  if (d.fecha && /^\d{4}-\d{2}-\d{2}/.test(d.fecha)) {
    const [y, m, day] = d.fecha.split("-").map(Number);
    fechaObj = new Date(y, m - 1, day);
  }
  const diaSemana = fechaObj ? DIAS_ES[fechaObj.getDay()] : "";
  const diaNum = fechaObj ? String(fechaObj.getDate()).padStart(2, "0") : "";
  const mesLabel = fechaObj ? MESES_ES[fechaObj.getMonth()] : "";
  const anioLabel = fechaObj ? fechaObj.getFullYear() : "";

  const inicialNovia = (d.novia || "").trim().charAt(0).toUpperCase() || "•";
  const inicialNovio = (d.novio || "").trim().charAt(0).toUpperCase() || "•";

  const leaf = (cls) => `<div class="leaf-deco ${cls}" aria-hidden="true">${EUCALYPTUS_BRANCH}</div>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --olive:${accent};
    --olive-dark:color-mix(in srgb, ${accent}, black 33%);
    --sage-bg:#eef1e3;
    --cream:#fdfcf7;
    --ink:#3c3c2e;
    --line:#dde0cd;
    --gold:#c9a86a;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;overflow-x:hidden;font-family:'Montserrat',sans-serif;color:var(--ink);background:var(--cream);line-height:1.6;}
  a{color:inherit;}

  /* --- franjas de fondo a todo el ancho, con el contenido centrado adentro.
     Las decoraciones de esquina cuelgan del ".band" (ancho completo) en vez
     del ".section" (acotado a 640px), para que lleguen hasta el borde real
     de la pantalla como en las referencias, en vez de cortarse en la caja
     de contenido. --- */
  .band{width:100%;position:relative;overflow:hidden;}
  .band.bg-sage{background:var(--sage-bg);}
  .band.bg-cream{background:var(--cream);}
  .section{position:relative;max-width:640px;margin:0 auto;padding:56px 24px;}
  .section.tight{padding-top:34px;padding-bottom:34px;}
  .eyebrow{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--olive);font-weight:600;margin:0 0 10px;}
  .section-title{text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.3rem,4vw,1.8rem);color:var(--olive-dark);margin:0 0 28px;}
  .section-title.tight{margin-bottom:12px;}

  /* --- divisor lineal con punto central --- */
  .dot-divider{display:flex;align-items:center;justify-content:center;gap:10px;width:130px;margin:0 auto 26px;position:relative;z-index:1;}
  .dot-divider .ln{flex:1;height:1px;background:var(--olive);opacity:.5;}
  .dot-divider .dot{width:5px;height:5px;border-radius:50%;background:var(--gold);flex:none;}

  .leaf-sprig{width:64px;height:15px;color:var(--olive);opacity:.85;}

  /* --- decoración de hojas + mancha acuarela (cuelgan del .band, esquinas reales) --- */
  .leaf-deco{position:absolute;pointer-events:none;z-index:0;opacity:.95;}
  /* El sway va en el <svg> interno (no en .leaf-deco), así no pisa el
     rotate/scaleX ya fijado por corner en .leaf-tr/.leaf-bl/etc. */
  .leaf-deco svg{width:100%;height:100%;display:block;transform-origin:center;animation:leafSway 12s ease-in-out infinite;}
  .leaf-tr{top:-14px;right:-14px;width:170px;height:220px;}
  .leaf-tr-sm{top:-8px;right:-8px;width:110px;height:140px;}
  .leaf-tr-sm svg{animation-duration:9s;animation-delay:-2s;}
  .leaf-bl{bottom:-16px;left:-16px;width:160px;height:210px;transform:rotate(190deg) scaleX(-1);}
  .leaf-bl svg{animation-duration:13s;animation-delay:-4s;}
  .leaf-br{bottom:-14px;right:-14px;width:140px;height:180px;transform:rotate(160deg);}
  .leaf-br svg{animation-duration:10.5s;animation-delay:-1s;}
  .leaf-tl{top:-12px;left:-12px;width:140px;height:180px;transform:rotate(-70deg) scaleX(-1);}
  .leaf-tl svg{animation-duration:14s;animation-delay:-6s;}
  .blob-deco{position:absolute;top:-16px;left:-20px;width:420px;height:320px;z-index:0;pointer-events:none;opacity:.95;}
  .blob-deco svg{width:100%;height:100%;display:block;}

  /* --- hero / portada --- */
  .hero{padding-top:60px;padding-bottom:46px;}
  .hero-inner{position:relative;z-index:1;max-width:460px;margin:0 auto;}
  .hero blockquote{margin:8px auto 34px;max-width:400px;text-align:center;font-size:.82rem;letter-spacing:1px;line-height:1.9;color:var(--olive-dark);font-style:normal;text-transform:uppercase;}
  .monogram{display:flex;align-items:center;justify-content:center;gap:18px;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(2.8rem,10vw,3.8rem);color:var(--olive-dark);margin:6px 0 22px;}
  .monogram .bar{width:1px;height:.8em;background:var(--olive-dark);display:inline-block;opacity:.7;}
  .monogram-label{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--olive);margin:0;}

  /* --- foto de portada --- */
  .cover-photo{width:100%;height:min(70vw,460px);object-fit:cover;display:block;}

  /* --- nombres --- */
  .names-intro{text-align:center;font-size:.78rem;letter-spacing:1px;color:#6b6b57;max-width:420px;margin:0 auto 24px;text-transform:uppercase;position:relative;z-index:1;}
  .names-script{position:relative;z-index:1;font-family:'Cormorant Garamond',serif;font-weight:500;text-align:center;color:var(--olive-dark);line-height:1.05;}
  .names-script .name{display:block;font-size:clamp(2.6rem,9vw,3.6rem);}
  .names-script .amp{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:clamp(1.4rem,5vw,1.9rem);margin:.08em 0;color:var(--olive);}
  .honor-text{text-align:center;max-width:380px;margin:0 auto;font-size:.85rem;color:#5a5a48;position:relative;z-index:1;}

  .month-label{text-align:center;letter-spacing:5px;font-size:.8rem;text-transform:uppercase;color:var(--olive);margin:32px 0 12px;position:relative;z-index:1;}
  .date-block{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 auto;position:relative;z-index:1;}
  .date-block .weekday,.date-block .year{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--olive-dark);border-top:1px solid var(--olive);border-bottom:1px solid var(--olive);padding:8px 6px;white-space:nowrap;}
  .date-block .day{font-family:'Cormorant Garamond',serif;font-size:clamp(3.2rem,11vw,4.6rem);color:var(--olive-dark);line-height:1;}

  /* --- countdown --- */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown > div{background:#fff;border:1px solid var(--line);min-width:74px;padding:16px 8px;border-radius:3px;text-align:center;box-shadow:0 2px 8px color-mix(in srgb, var(--olive-dark) 6%, transparent);}
  .cd-num{display:block;font-family:'Cormorant Garamond',serif;font-size:clamp(1.7rem,5vw,2.3rem);color:var(--olive-dark);font-weight:600;}
  .cd-label{font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#8b8b73;}

  /* --- detalle ceremonia / fiesta --- */
  .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;position:relative;z-index:1;}
  .info-card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:28px 22px 24px;text-align:center;animation:cardFadeIn .9s ease-out both;}
  .info-grid .info-card:nth-child(1){animation-delay:.05s;}
  .info-grid .info-card:nth-child(2){animation-delay:.22s;}
  .info-card .info-time{font-size:.72rem;letter-spacing:2px;color:var(--olive);text-transform:uppercase;}
  .info-card h3{margin:6px 0 2px;font-family:'Cormorant Garamond',serif;font-size:1.25rem;letter-spacing:1px;text-transform:uppercase;color:var(--olive-dark);}
  .info-card p{margin:0;font-size:.85rem;color:#666;font-style:italic;}
  .info-card .leaf-sprig{margin:14px auto 16px;}
  .btn-map{display:inline-block;background:var(--olive-dark);color:#fff;text-decoration:none;font-size:.68rem;letter-spacing:2px;text-transform:uppercase;padding:12px 22px;border-radius:2px;}
  .btn-map:hover{background:var(--olive);}
  .dress-note{text-align:center;margin-top:30px;font-size:.85rem;color:#5a5a48;position:relative;z-index:1;}
  .dress-note strong{color:var(--olive-dark);}

  /* --- galería --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;border-radius:5px;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;transition:transform .35s ease;}
  .gallery-item:hover img{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(40,44,28,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* --- regalo / aviso adultos: caja sage flotando sobre el fondo crema --- */
  .gift-box{position:relative;z-index:1;background:var(--sage-bg);border-radius:16px;padding:44px 26px;}
  .extra-grid{display:flex;flex-direction:column;gap:34px;}
  .extra-item{text-align:center;max-width:400px;margin:0 auto;}
  .extra-item .ico{width:26px;height:26px;margin:0 auto 8px;color:var(--olive-dark);}
  .extra-item h4{margin:0 0 12px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:2.5px;text-transform:uppercase;color:var(--olive-dark);}
  .extra-item p{margin:0;font-size:.85rem;color:#5a5a48;}
  .extra-item .alias-pill{display:inline-block;margin-top:12px;padding:8px 16px;border:1px solid var(--olive);border-radius:20px;font-size:.8rem;letter-spacing:1px;color:var(--olive-dark);}

  /* --- rsvp --- */
  .rsvp-deadline{text-align:center;margin:0 0 6px;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--olive);position:relative;z-index:1;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;position:relative;z-index:1;max-width:420px;margin:0 auto;}
  .rsvp-form label{font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--olive-dark);display:flex;flex-direction:column;gap:6px;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Montserrat',sans-serif;font-size:.9rem;padding:11px 12px;border:1px solid var(--line);border-radius:3px;background:#fff;width:100%;color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--olive);}
  .rsvp-form textarea{min-height:80px;resize:vertical;}
  .rsvp-form button{background:var(--olive-dark);color:#fff;border:0;padding:14px;text-transform:uppercase;letter-spacing:2px;font-size:.75rem;border-radius:2px;cursor:pointer;margin-top:4px;}
  .rsvp-form button:hover{background:var(--olive);}
  .rsvp-whatsapp{display:inline-block;text-align:center;font-size:.78rem;letter-spacing:1px;color:var(--olive-dark);text-decoration:none;border:1px solid var(--olive);border-radius:2px;padding:10px;}
  .rsvp-status{text-align:center;font-weight:600;color:var(--olive-dark);min-height:1em;}

  footer{text-align:center;padding:40px 24px 50px;font-size:.78rem;color:#8b8b73;letter-spacing:1px;}
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:var(--olive-dark);display:block;margin-bottom:10px;}

  @media (max-width:420px){
    .section{padding-left:18px;padding-right:18px;}
    .leaf-tr{width:130px;height:170px;}
    .blob-deco{width:230px;height:190px;top:-20px;left:-34px;}
    .monogram{gap:12px;}
  }

  /* --- animaciones sutiles: drift levísimo de las hojas + fade-in
     escalonado de las tarjetas de itinerario al cargar la página --- */
  @keyframes leafSway{
    0%,100%{transform:translateY(0) rotate(0deg);}
    50%{transform:translateY(-2px) rotate(1deg);}
  }
  @keyframes cardFadeIn{
    from{opacity:0;transform:translateY(10px);}
    to{opacity:1;transform:translateY(0);}
  }
  @media (prefers-reduced-motion: reduce){
    .leaf-deco svg{animation:none !important;}
    .info-card{animation:none !important;opacity:1;transform:none;}
  }
</style></head>
<body>

  <!-- Portada -->
  <div class="band bg-cream">
    <div class="blob-deco" aria-hidden="true">${BLOB_DECO}</div>
    ${leaf("leaf-tr")}
    <section class="section hero">
      <div class="hero-inner">
        <p class="eyebrow">Nos casamos</p>
        ${d.mensaje ? `<blockquote>${esc(d.mensaje)}</blockquote>` : ""}
        <div class="monogram"><span>${esc(inicialNovia)}</span><span class="bar"></span><span>${esc(inicialNovio)}</span></div>
        ${DOT_DIVIDER}
        <p class="monogram-label">Nuestra boda</p>
      </div>
    </section>
  </div>

  <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">

  <!-- Nombres -->
  <div class="band bg-cream">
    ${leaf("leaf-br")}
    <section class="section">
      <p class="names-intro">Con la bendición de Dios y de nuestras familias,<br>tenemos el honor de invitarte a celebrar</p>
      <div class="names-script">
        <span class="name">${esc(d.novia)}</span>
        <span class="amp">&amp;</span>
        <span class="name">${esc(d.novio)}</span>
      </div>
      ${DOT_DIVIDER}
      <p class="honor-text">Nos encantaría contar con tu presencia en este día tan especial para nosotros.</p>
      ${fechaObj ? `
      <p class="month-label">${esc(mesLabel)}</p>
      <div class="date-block">
        <span class="weekday">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNum)}</span>
        <span class="year">${esc(anioLabel)}</span>
      </div>` : ""}
    </section>
  </div>

  <!-- Cuenta regresiva -->
  <div class="band bg-sage">
    ${leaf("leaf-tr-sm")}
    <section class="section tight">
      <h2 class="section-title">Falta muy poco</h2>
      ${cd.html}
    </section>
  </div>

  <!-- Ceremonia y fiesta -->
  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.dressCode) ? `<div class="band bg-sage">
    <section class="section">
      <p class="eyebrow">Itinerario</p>
      <h2 class="section-title tight">Celebremos juntos</h2>
      ${DOT_DIVIDER}
      ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="info-grid">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="info-card">
          ${d.horaCeremonia ? `<span class="info-time">${esc(d.horaCeremonia)}</span>` : ""}
          <h3>Ceremonia</h3>
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
          ${LEAF_SPRIG}
          ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="info-card">
          ${d.horaFiesta ? `<span class="info-time">${esc(d.horaFiesta)}</span>` : ""}
          <h3>Fiesta</h3>
          ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
          ${LEAF_SPRIG}
          ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
        </div>` : ""}
      </div>` : ""}
      ${d.dressCode ? `<p class="dress-note">Código de vestimenta: <strong>${esc(d.dressCode)}</strong></p>` : ""}
    </section>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="band bg-cream">
    ${leaf("leaf-tl")}
    <section class="section">
      <p class="eyebrow">Recuerdos</p>
      <h2 class="section-title tight">Nuestros momentos</h2>
      ${DOT_DIVIDER}
      ${gal.html}
    </section>
  </div>` : ""}

  <!-- Regalo y aviso -->
  <div class="band bg-cream">
    ${leaf("leaf-bl")}
    <section class="section">
      <div class="gift-box">
        <div class="extra-grid">
          <div class="extra-item">
            <div class="ico">${GIFT_ICON}</div>
            <h4>Sugerencia de regalo</h4>
            <p>Si desean hacernos un presente, nos harían muy felices ayudándonos a cumplir nuestros próximos sueños.</p>
            ${d.alias ? `<span class="alias-pill">Alias: ${esc(d.alias)}</span>` : ""}
          </div>
          <div class="extra-item">
            <div class="ico">${RING_ICON}</div>
            <h4>Sólo adultos</h4>
            <p>Adoramos a tus hijos, pero creemos que esta noche merecen un rato para ustedes. ¡Gracias por entenderlo!</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- RSVP -->
  <div class="band bg-cream">
    ${leaf("leaf-br")}
    <section class="section">
      <p class="eyebrow">Confirmación</p>
      <h2 class="section-title tight">Contanos si nos acompañás</h2>
      <div style="display:flex;justify-content:center;position:relative;z-index:1;margin-bottom:26px;">${LEAF_SPRIG}</div>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </section>
  </div>

  <footer>
    <span class="thanks">Gracias por ser parte de nuestra historia</span>
    ${esc(d.novia)} &amp; ${esc(d.novio)} — ${esc(d.fecha)}
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:#fdfcf7;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;top:-22px;left:-30px;width:150px;height:120px;opacity:.95;">${BLOB_DECO}</div>
    <div style="position:absolute;top:-14px;right:-20px;width:90px;height:110px;opacity:.95;transform:none;">${EUCALYPTUS_BRANCH}</div>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:5px;">
      <span style="font-size:.5rem;letter-spacing:2.5px;text-transform:uppercase;color:#6d7a52;font-family:Georgia,'Times New Roman',serif;">Nos casamos</span>
      <div style="display:flex;align-items:center;gap:7px;font-family:Georgia,'Times New Roman',serif;font-size:1.5rem;color:#3f4a2c;">
        <span>${esc(sampleData.novia.charAt(0))}</span><span style="width:1px;height:.75em;background:#3f4a2c;opacity:.6;display:inline-block;"></span><span>${esc(sampleData.novio.charAt(0))}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;width:70px;">
        <span style="flex:1;height:1px;background:#6d7a52;opacity:.5;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:#c9a86a;flex:none;"></span>
        <span style="flex:1;height:1px;background:#6d7a52;opacity:.5;"></span>
      </div>
      <span style="font-size:.72rem;letter-spacing:1px;color:#3f4a2c;font-family:Georgia,'Times New Roman',serif;">${esc(d.name)}</span>
    </div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Moderna Minimal",
  summary: "Paleta blanco y verde oliva con hojas de eucalipto en acuarela, monograma de iniciales, nombres en serif y tarjetas de itinerario minimalistas.",
  accent: "#4a5236", accent2: "#eef1e3", schema: bodaSchema, sampleData, render, cardPreview,
};
