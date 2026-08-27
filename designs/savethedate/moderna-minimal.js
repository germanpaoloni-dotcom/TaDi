const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-moderna-minimal";

const sampleData = {
  novia: "Sofía", novio: "Nicolás",
  fecha: "2027-03-20",
  lugar: "Puerto Madero, CABA",
  mensaje: "Guardá la fecha. Por encima de todo, vístanse de amor, que es el vínculo perfecto.",
  instagram: "sofi.nico.wedding",
  whatsapp: "5491100000002",
  coverImage: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1529636444744-d90360e0c885?w=800&q=80",
    "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80",
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
  ],
};

// Misma ramita de eucalipto estilo acuarela y misma ramita chica que
// designs/bodas/moderna-minimal.js, porque este save the date acompaña a
// esa invitación de boda (idéntica paleta olivo/sage y misma tipografía).
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

const LEAF_SPRIG = `<svg class="leaf-sprig" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M45 10 C36 3 27 3 18 10 C27 7 34 8.5 40 10" stroke="currentColor" stroke-width="1.1"/>
  <path d="M45 10 C54 17 63 17 72 10 C63 13 56 11.5 50 10" stroke="currentColor" stroke-width="1.1"/>
  <circle cx="45" cy="10" r="1.5" fill="currentColor"/>
</svg>`;

const DOT_DIVIDER = `<div class="dot-divider" aria-hidden="true"><span class="ln"></span><span class="dot"></span><span class="ln"></span></div>`;

function calendarIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:16px;height:16px;vertical-align:-3px;margin-right:8px;">
    <rect x="3" y="5" width="18" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M3 10h18" stroke="currentColor" stroke-width="1.3"/>
    <path d="M7 2v6M17 2v6" stroke="currentColor" stroke-width="1.3"/>
    <rect x="7.5" y="13" width="3" height="3" fill="currentColor"/>
  </svg>`;
}

const MESES_ES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const DIAS_ES = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#4a5236");
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cd2");
  const gal = galleryWidget(d.galeria, "gal2");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} — Save the date`,
    dateISO: d.fecha,
    time: "12:00",
    location: d.lugar,
  });

  // Fecha formateada a mano (sin toLocaleDateString / Intl) para no
  // depender de que el Node de producción tenga el locale es-AR completo.
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

  const hasContact = d.instagram || d.whatsapp;

  const leaf = (cls) => `<div class="leaf-deco ${cls}" aria-hidden="true">${EUCALYPTUS_BRANCH}</div>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Save the Date</title>
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
  img{max-width:100%;display:block;}

  .band{width:100%;position:relative;overflow:hidden;}
  .band.bg-sage{background:var(--sage-bg);}
  .band.bg-cream{background:var(--cream);}
  .section{position:relative;max-width:640px;margin:0 auto;padding:56px 24px;}
  .section.tight{padding-top:34px;padding-bottom:34px;}
  .eyebrow{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--olive);font-weight:600;margin:0 0 10px;}
  .section-title{text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.3rem,4vw,1.8rem);color:var(--olive-dark);margin:0 0 28px;}
  .section-title.tight{margin-bottom:12px;}

  .dot-divider{display:flex;align-items:center;justify-content:center;gap:10px;width:130px;margin:0 auto 26px;position:relative;z-index:1;}
  .dot-divider .ln{flex:1;height:1px;background:var(--olive);opacity:.5;}
  .dot-divider .dot{width:5px;height:5px;border-radius:50%;background:var(--gold);flex:none;}

  .leaf-sprig{width:64px;height:15px;color:var(--olive);opacity:.85;}

  /* --- decoración de hojas de eucalipto, cuelgan del .band a todo el
     ancho para llegar al borde real de la pantalla, con pointer-events:none
     y overflow:hidden en el .band contenedor para nunca forzar scroll
     horizontal en pantallas chicas. --- */
  .leaf-deco{position:absolute;pointer-events:none;z-index:0;opacity:.95;}
  /* El sway va en el <svg> interno (no en .leaf-deco), así no pisa el
     rotate/scaleX ya fijado por corner en .leaf-tr/.leaf-bl/etc. */
  .leaf-deco svg{width:100%;height:100%;display:block;transform-origin:center;animation:leafSway 12s ease-in-out infinite;}
  .leaf-tr{top:-14px;right:-14px;width:150px;height:196px;}
  .leaf-tr svg{animation-duration:11s;}
  .leaf-tl{top:-12px;left:-12px;width:120px;height:156px;transform:rotate(-70deg) scaleX(-1);}
  .leaf-tl svg{animation-duration:14s;animation-delay:-6s;}
  .leaf-br{bottom:-14px;right:-14px;width:130px;height:170px;transform:rotate(160deg);}
  .leaf-br svg{animation-duration:10.5s;animation-delay:-1s;}
  .leaf-bl{bottom:-16px;left:-16px;width:140px;height:184px;transform:rotate(190deg) scaleX(-1);}
  .leaf-bl svg{animation-duration:13s;animation-delay:-4s;}

  /* --- hero --- */
  .hero{padding-top:60px;padding-bottom:46px;}
  .hero-inner{position:relative;z-index:1;max-width:460px;margin:0 auto;}
  .monogram{display:flex;align-items:center;justify-content:center;gap:18px;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(2.8rem,10vw,3.8rem);color:var(--olive-dark);margin:6px 0 22px;}
  .monogram .bar{width:1px;height:.8em;background:var(--olive-dark);display:inline-block;opacity:.7;}
  .monogram-label{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--olive);margin:0;}

  .cover-photo{width:100%;height:min(70vw,420px);object-fit:cover;display:block;}

  .names-script{position:relative;z-index:1;font-family:'Cormorant Garamond',serif;font-weight:500;text-align:center;color:var(--olive-dark);line-height:1.05;}
  .names-script .name{display:block;font-size:clamp(2.6rem,9vw,3.6rem);}
  .names-script .amp{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:clamp(1.4rem,5vw,1.9rem);margin:.08em 0;color:var(--olive);}

  .month-label{text-align:center;letter-spacing:5px;font-size:.8rem;text-transform:uppercase;color:var(--olive);margin:30px 0 12px;position:relative;z-index:1;}
  .date-block{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 auto;position:relative;z-index:1;}
  .date-block .weekday,.date-block .year{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--olive-dark);border-top:1px solid var(--olive);border-bottom:1px solid var(--olive);padding:8px 6px;white-space:nowrap;}
  .date-block .day{font-family:'Cormorant Garamond',serif;font-size:clamp(3.2rem,11vw,4.6rem);color:var(--olive-dark);line-height:1;}

  /* --- frase --- */
  .quote-box{position:relative;z-index:1;background:#fff;border:1px solid var(--line);border-radius:10px;padding:32px 26px;max-width:480px;margin:0 auto;text-align:center;}
  .message{margin:0;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.05rem,2.6vw,1.25rem);color:var(--olive-dark);line-height:1.6;}

  /* --- countdown --- */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown > div{background:#fff;border:1px solid var(--line);min-width:74px;padding:16px 8px;border-radius:3px;text-align:center;box-shadow:0 2px 8px color-mix(in srgb, var(--olive-dark) 6%, transparent);animation:cardFadeIn .9s ease-out both;}
  .countdown > div:nth-child(1){animation-delay:.05s;}
  .countdown > div:nth-child(2){animation-delay:.16s;}
  .countdown > div:nth-child(3){animation-delay:.27s;}
  .countdown > div:nth-child(4){animation-delay:.38s;}
  .cd-num{display:block;font-family:'Cormorant Garamond',serif;font-size:clamp(1.7rem,5vw,2.3rem);color:var(--olive-dark);font-weight:600;}
  .cd-label{font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#8b8b73;}

  .cal-btn{display:inline-flex;align-items:center;margin-top:28px;background:var(--olive-dark);color:#fff;text-decoration:none;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;padding:13px 26px;border-radius:2px;position:relative;z-index:1;}
  .cal-btn:hover{background:var(--olive);}

  /* --- lugar / nota fija --- */
  .lugar-badge{display:inline-block;font-size:.85rem;letter-spacing:1px;text-transform:uppercase;color:var(--olive-dark);border:1px solid var(--olive);border-radius:20px;padding:10px 24px;position:relative;z-index:1;}
  .nota-fija{max-width:420px;margin:22px auto 0;font-size:.85rem;font-style:italic;color:#5a5a48;text-align:center;position:relative;z-index:1;}

  /* --- contacto --- */
  .contact-row{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin-top:22px;position:relative;z-index:1;}
  .contact-row a{font-size:.8rem;letter-spacing:.5px;color:var(--olive-dark);text-decoration:none;border-bottom:1px solid var(--olive);padding-bottom:3px;}

  /* --- galería --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;border-radius:5px;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;transition:transform .35s ease;}
  .gallery-item:hover img{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(40,44,28,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  footer{text-align:center;padding:40px 24px 50px;font-size:.78rem;color:#8b8b73;letter-spacing:1px;}
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:var(--olive-dark);display:block;margin-bottom:10px;}

  @media (max-width:420px){
    .section{padding-left:18px;padding-right:18px;}
    .leaf-tr{width:110px;height:145px;}
    .monogram{gap:12px;}
  }

  /* --- animaciones sutiles: drift levísimo de las hojas + fade-in
     escalonado de las tarjetas de la cuenta regresiva al cargar la página --- */
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
    .countdown > div{animation:none !important;opacity:1;transform:none;}
  }
</style></head>
<body>

  <!-- Portada -->
  <div class="band bg-cream">
    ${leaf("leaf-tr")}
    <section class="section hero">
      <div class="hero-inner">
        <p class="eyebrow">Guardá la fecha</p>
        <div class="monogram"><span>${esc(inicialNovia)}</span><span class="bar"></span><span>${esc(inicialNovio)}</span></div>
        ${DOT_DIVIDER}
        <p class="monogram-label">Nos casamos</p>
      </div>
    </section>
  </div>

  <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">

  <!-- Nombres y fecha -->
  <div class="band bg-cream">
    ${leaf("leaf-bl")}
    <section class="section">
      <div class="names-script">
        <span class="name">${esc(d.novia)}</span>
        <span class="amp">&amp;</span>
        <span class="name">${esc(d.novio)}</span>
      </div>
      ${DOT_DIVIDER}
      ${fechaObj ? `
      <p class="month-label">${esc(mesLabel)}</p>
      <div class="date-block">
        <span class="weekday">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNum)}</span>
        <span class="year">${esc(anioLabel)}</span>
      </div>` : ""}
    </section>
  </div>

  ${d.mensaje ? `<div class="band bg-sage">
    <section class="section tight">
      <div class="quote-box"><p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p></div>
    </section>
  </div>` : ""}

  <!-- Cuenta regresiva -->
  <div class="band bg-cream">
    ${leaf("leaf-tl")}
    <section class="section">
      <h2 class="section-title">Falta muy poco</h2>
      ${cd.html}
      <div style="text-align:center;">
        ${calLink ? `<a class="cal-btn" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIcon()}Agregar a mi calendario</a>` : ""}
      </div>
    </section>
  </div>

  <!-- Lugar y nota -->
  <div class="band bg-sage">
    ${leaf("leaf-br")}
    <section class="section tight">
      ${d.lugar ? `<p class="eyebrow">Dónde va a ser</p><div style="text-align:center;position:relative;z-index:1;"><span class="lugar-badge">${esc(d.lugar)}</span></div>` : ""}
      <p class="nota-fija">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
      ${hasContact ? `<div class="contact-row">
        ${d.instagram ? `<a href="https://instagram.com/${esc(String(d.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">📷 @${esc(String(d.instagram).replace(/^@/, ""))}</a>` : ""}
        ${d.whatsapp ? `<a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
      </div>` : ""}
    </section>
  </div>

  ${(d.galeria && d.galeria.length) ? `<div class="band bg-cream">
    ${leaf("leaf-tr")}
    <section class="section">
      <p class="eyebrow">Recuerdos</p>
      <h2 class="section-title tight">Nuestros momentos</h2>
      ${DOT_DIVIDER}
      ${gal.html}
    </section>
  </div>` : ""}

  <footer>
    <span class="thanks">Nos vemos pronto</span>
    ${esc(d.novia)} &amp; ${esc(d.novio)}
  </footer>

  <script>
    ${cd.script}${gal.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:#fdfcf7;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;top:-16px;right:-22px;width:100px;height:130px;opacity:.95;">${EUCALYPTUS_BRANCH}</div>
    <div style="position:absolute;bottom:-16px;left:-22px;width:90px;height:118px;opacity:.9;transform:rotate(190deg) scaleX(-1);">${EUCALYPTUS_BRANCH}</div>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:5px;">
      <span style="font-size:.5rem;letter-spacing:2.5px;text-transform:uppercase;color:#6d7a52;font-family:Georgia,'Times New Roman',serif;">Guardá la fecha</span>
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
  id, category: "savethedate", name: "Moderna Minimal",
  summary: "Paleta blanco y verde oliva con hojas de eucalipto en acuarela — el save the date minimalista que acompaña a la invitación de boda.",
  accent: "#4a5236", accent2: "#eef1e3", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
