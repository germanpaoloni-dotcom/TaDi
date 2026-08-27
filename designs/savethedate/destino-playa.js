const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-destino-playa";

const sampleData = {
  novia: "Valentina", novio: "Tomás",
  fecha: "2027-01-16",
  lugar: "José Ignacio, Uruguay",
  mensaje: "Guardá la fecha: nos casamos frente al mar y queremos que este viaje lo hagamos juntos. El destino es la excusa, ustedes son el motivo.",
  instagram: "vale.tomas.boda",
  whatsapp: "5491100000042",
  coverImage: "https://images.unsplash.com/photo-1606495185824-688328ed7871?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
  ],
};

// Mismos motivos que designs/bodas/destino-playa.js, porque este save the
// date acompaña a esa invitación de boda: olas suaves en SVG inline y una
// hoja de palmera fina. Colores fijos de la paleta turquesa/arena, igual
// que en la boda que acompañan.

const WAVE_LINES = `
<svg viewBox="0 0 600 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0,46 C75,18 150,74 225,46 C300,18 375,74 450,46 C500,26 550,26 600,46" fill="none" stroke="#2fa8a3" stroke-width="2" opacity="0.4"/>
  <path d="M0,62 C75,34 150,90 225,62 C300,34 375,90 450,62 C500,42 550,42 600,62" fill="none" stroke="#2fa8a3" stroke-width="1.4" opacity="0.22"/>
  <path d="M0,28 C75,58 150,-2 225,28 C300,58 375,-2 450,28 C500,48 550,48 600,28" fill="none" stroke="#c9a978" stroke-width="1.4" opacity="0.5"/>
</svg>`;

const PALM_FROND = `
<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <path d="M100 300 C 96 220 92 140 76 58" fill="none" stroke="#2c8f8a" stroke-width="2" opacity="0.55"/>
  <g opacity="0.88">
    <path d="M100,292 C60,254 32,204 22,146 C56,170 86,208 100,258 Z" fill="#2fa8a3"/>
    <path d="M100,266 C52,232 18,176 12,114 C51,142 86,190 100,238 Z" fill="#4fc0b8"/>
    <path d="M100,238 C50,200 26,144 34,82 C68,116 93,168 100,216 Z" fill="#2fa8a3"/>
    <path d="M100,208 C60,170 48,116 66,58 C89,96 100,150 100,192 Z" fill="#4fc0b8"/>
    <path d="M100,292 C140,254 168,204 178,146 C144,170 114,208 100,258 Z" fill="#2fa8a3" opacity="0.92"/>
    <path d="M100,266 C148,232 182,176 188,114 C149,142 114,190 100,238 Z" fill="#4fc0b8" opacity="0.92"/>
    <path d="M100,238 C150,200 174,144 166,82 C132,116 107,168 100,216 Z" fill="#2fa8a3" opacity="0.92"/>
  </g>
</svg>`;

// Divisor ondulado, en vez de una línea recta, para separar bloques dentro
// de una misma sección.
const WAVE_DIVIDER = `<svg class="wave-divider" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M0 10 C 10 2 20 2 30 10 C 40 18 50 18 60 10 C 70 2 80 2 90 10 C 100 18 110 18 120 10" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

const CALENDAR_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:18px;height:18px;vertical-align:-4px;margin-right:8px;">
  <rect x="3.5" y="5" width="17" height="16" rx="1.4"/>
  <path d="M3.5 10h17"/>
  <path d="M8 3v4M16 3v4"/>
</svg>`;

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#2fa8a3");
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cdstdplaya");
  const gal = galleryWidget(d.galeria, "galstdplaya");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} se casan`,
    dateISO: d.fecha,
    time: "12:00",
    location: d.lugar,
  });

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  let fechaObj = null;
  if (d.fecha && /^\d{4}-\d{2}-\d{2}/.test(d.fecha)) {
    const [y, m, day] = d.fecha.split("-").map(Number);
    fechaObj = new Date(y, m - 1, day);
  }
  const diaSemana = fechaObj ? DIAS_ES[fechaObj.getDay()] : "";
  const diaNum = fechaObj ? String(fechaObj.getDate()).padStart(2, "0") : "";
  const mesLabel = fechaObj ? MESES_ES[fechaObj.getMonth()] : "";
  const anioLabel = fechaObj ? fechaObj.getFullYear() : "";
  const fechaLarga = fechaObj ? `${esc(diaSemana)} ${diaNum} de ${esc(mesLabel)} de ${anioLabel}` : "";

  const hasContact = d.instagram || d.whatsapp;

  const wave = (cls) => `<div class="wave-deco ${cls}" aria-hidden="true">${WAVE_LINES}</div>`;
  const palm = (cls) => `<div class="palm-deco ${cls}" aria-hidden="true">${PALM_FROND}</div>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Save the Date</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --turquoise:${accent};
    --turquoise-dark:color-mix(in srgb, ${accent}, black 28%);
    --arena:#e8d5b5;
    --arena-soft:#faf3e6;
    --foam:#eaf7f6;
    --cream:#fffdf9;
    --ink:#2e4342;
    --line:#dde7e3;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;overflow-x:hidden;font-family:'Jost',sans-serif;color:var(--ink);background:linear-gradient(180deg,var(--foam) 0%,var(--cream) 40%,var(--arena-soft) 100%);line-height:1.65;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  .band{width:100%;position:relative;overflow:hidden;}
  .band.bg-foam{background:linear-gradient(180deg,var(--foam),var(--cream));}
  .band.bg-cream{background:var(--cream);}
  .band.bg-arena{background:linear-gradient(180deg,var(--arena-soft),var(--cream));}
  .section{position:relative;max-width:600px;margin:0 auto;padding:56px 24px;text-align:center;}
  .section.tight{padding-top:34px;padding-bottom:34px;}
  .eyebrow{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--turquoise-dark);font-weight:500;margin:0 0 10px;}
  .section-title{text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.4rem,4.2vw,2rem);color:var(--turquoise-dark);margin:0 0 28px;}
  .section-title.tight{margin-bottom:12px;}

  .wave-divider{width:120px;height:16px;color:var(--turquoise);opacity:.8;display:block;margin:0 auto 26px;position:relative;z-index:1;}

  .wave-deco{position:absolute;left:0;right:0;pointer-events:none;z-index:0;line-height:0;}
  .wave-deco svg{width:100%;height:100%;display:block;}
  .wave-top{top:-1px;height:60px;transform:scaleY(-1);}
  .wave-bottom{bottom:-1px;height:60px;}

  .palm-deco{position:absolute;pointer-events:none;z-index:0;opacity:.9;}
  .palm-deco svg{width:100%;height:100%;display:block;}
  .palm-tr{top:-18px;right:-16px;width:100px;height:150px;}
  .palm-bl{bottom:-18px;left:-16px;width:90px;height:136px;transform:scaleX(-1);}

  /* --- hero / portada --- */
  .hero{padding-top:60px;padding-bottom:0;}
  .hero-inner{position:relative;z-index:1;max-width:460px;margin:0 auto;}
  .monogram-frame{width:96px;height:96px;border-radius:50%;border:1.5px solid var(--turquoise);background:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 22px;position:relative;z-index:1;}
  .monogram-frame span{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.6rem;color:var(--turquoise-dark);letter-spacing:1px;}
  .hero-label{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--turquoise-dark);margin:0 0 18px;}
  .names-script{position:relative;z-index:1;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;text-align:center;color:var(--turquoise-dark);line-height:1.1;}
  .names-script .name{display:block;font-size:clamp(2.6rem,9.5vw,3.6rem);}
  .names-script .amp{display:block;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(1.3rem,5vw,1.7rem);margin:.08em 0;color:var(--turquoise);font-style:normal;}
  .hero-date{text-align:center;margin-top:18px;font-size:.85rem;letter-spacing:1.5px;text-transform:uppercase;color:#5a716f;position:relative;z-index:1;}

  .month-label{text-align:center;letter-spacing:5px;font-size:.8rem;text-transform:uppercase;color:var(--turquoise-dark);margin:26px 0 12px;position:relative;z-index:1;}
  .date-block{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 auto;position:relative;z-index:1;}
  .date-block .weekday,.date-block .year{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--turquoise-dark);border-top:1px solid var(--turquoise);border-bottom:1px solid var(--turquoise);padding:8px 6px;white-space:nowrap;}
  .date-block .day{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,11vw,4.2rem);color:var(--turquoise-dark);line-height:1;}

  /* --- mensaje --- */
  .quote-box{position:relative;z-index:1;max-width:520px;margin:0 auto;}
  .message{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1rem,2.4vw,1.15rem);color:#3d5654;margin:0;}

  /* --- countdown --- */
  .countdown-intro{text-align:center;font-size:.85rem;color:#3d5654;max-width:380px;margin:0 auto 26px;position:relative;z-index:1;}
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown > div{background:#fff;border:1px solid var(--line);min-width:74px;padding:16px 8px;border-radius:12px;text-align:center;box-shadow:0 6px 16px rgba(47,168,163,.12);}
  .cd-num{display:block;font-family:'Cormorant Garamond',serif;font-size:clamp(1.7rem,5vw,2.3rem);color:var(--turquoise-dark);font-weight:600;}
  .cd-label{font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#7f9694;}

  .cal-btn{display:inline-flex;align-items:center;margin-top:28px;background:var(--turquoise-dark);color:#fff;text-decoration:none;font-size:.75rem;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;border-radius:24px;position:relative;z-index:1;}
  .cal-btn:hover{background:var(--turquoise);}

  /* --- lugar / nota --- */
  .lugar-badge{display:inline-block;font-size:.86rem;letter-spacing:1px;color:var(--turquoise-dark);border:1px solid var(--turquoise);border-radius:20px;padding:11px 26px;position:relative;z-index:1;}
  .nota-fija{max-width:480px;margin:24px auto 0;font-size:.85rem;color:#4d6462;font-style:italic;position:relative;z-index:1;}

  /* --- contacto --- */
  .contact-row{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin-top:22px;position:relative;z-index:1;}
  .contact-row a{font-size:.82rem;letter-spacing:.5px;color:var(--turquoise-dark);text-decoration:none;border-bottom:1px solid var(--turquoise);padding-bottom:3px;}

  /* --- galería --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;border-radius:12px;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;transition:transform .35s ease;}
  .gallery-item:hover img{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,38,37,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  footer{text-align:center;padding:40px 24px 50px;font-size:.78rem;color:#7f9694;letter-spacing:1px;}
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:var(--turquoise-dark);display:block;margin-bottom:10px;}

  @media (max-width:420px){
    .section{padding-left:18px;padding-right:18px;}
    .palm-tr{width:74px;height:112px;}
    .palm-bl{width:70px;height:106px;}
  }
</style></head>
<body>

  <!-- Portada -->
  <div class="band bg-foam">
    ${palm("palm-tr")}
    <section class="section hero">
      <div class="hero-inner">
        <p class="eyebrow">Guardá la fecha</p>
        <div class="monogram-frame"><span>${esc(inicialNovia)}&amp;${esc(inicialNovio)}</span></div>
        <div class="names-script">
          <span class="name">${esc(d.novia)}</span>
          <span class="amp">&amp;</span>
          <span class="name">${esc(d.novio)}</span>
        </div>
        ${fechaLarga ? `<p class="hero-date">${fechaLarga}</p>` : ""}
      </div>
    </section>
    ${wave("wave-bottom")}
  </div>

  <img class="cover-photo" style="width:100%;height:min(60vw,360px);object-fit:cover;" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">

  ${fechaObj ? `<div class="band bg-cream">
    <section class="section tight">
      <p class="month-label">${esc(mesLabel)}</p>
      <div class="date-block">
        <span class="weekday">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNum)}</span>
        <span class="year">${esc(anioLabel)}</span>
      </div>
    </section>
  </div>` : ""}

  <!-- Mensaje -->
  ${d.mensaje ? `<div class="band bg-arena">
    ${palm("palm-bl")}
    <section class="section">
      <div class="wave-divider">${WAVE_DIVIDER}</div>
      <div class="quote-box"><p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p></div>
    </section>
  </div>` : ""}

  <!-- Cuenta regresiva -->
  <div class="band bg-cream">
    ${wave("wave-top")}
    <section class="section tight">
      <h2 class="section-title">Cuenta regresiva para el viaje</h2>
      <p class="countdown-intro">Faltan estos días para hacer las valijas y brindar todos juntos frente al mar.</p>
      ${cd.html}
      ${calLink ? `<a class="cal-btn" href="${esc(calLink)}" target="_blank" rel="noopener">${CALENDAR_ICON}Agregar a mi calendario</a>` : ""}
    </section>
  </div>

  <!-- Lugar y nota -->
  <div class="band bg-arena">
    <section class="section">
      ${d.lugar ? `<p class="eyebrow">Dónde va a ser</p><div class="lugar-badge">${esc(d.lugar)}</div>` : ""}
      <p class="nota-fija">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
      ${hasContact ? `<div class="contact-row">
        ${d.instagram ? `<a href="https://instagram.com/${esc(String(d.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">📷 @${esc(String(d.instagram).replace(/^@/, ""))}</a>` : ""}
        ${d.whatsapp ? `<a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
      </div>` : ""}
    </section>
  </div>

  <!-- Galería -->
  ${(d.galeria && d.galeria.length) ? `<div class="band bg-cream">
    <section class="section">
      <p class="eyebrow">Recuerdos</p>
      <h2 class="section-title tight">Nuestros momentos</h2>
      <div class="wave-divider">${WAVE_DIVIDER}</div>
      ${gal.html}
    </section>
  </div>` : ""}

  <footer>
    <span class="thanks">Con todo nuestro cariño, esperamos verte pronto</span>
    ${esc(d.novia)} &amp; ${esc(d.novio)}${fechaLarga ? ` — ${fechaLarga}` : ""}
  </footer>

  <script>
    ${cd.script}${gal.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:linear-gradient(180deg,#eaf7f6 0%,#fffdf9 55%,#faf3e6 100%);display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 600 90" preserveAspectRatio="none" style="position:absolute;left:0;right:0;bottom:0;height:38%;width:100%;" aria-hidden="true">
      <path d="M0,46 C75,18 150,74 225,46 C300,18 375,74 450,46 C500,26 550,26 600,46" fill="none" stroke="${esc(d.accent)}" stroke-width="2" opacity="0.4"/>
      <path d="M0,62 C75,34 150,90 225,62 C300,34 375,90 450,62 C500,42 550,42 600,62" fill="none" stroke="${esc(d.accent)}" stroke-width="1.4" opacity="0.22"/>
      <path d="M0,28 C75,58 150,-2 225,28 C300,58 375,-2 450,28 C500,48 550,48 600,28" fill="none" stroke="${esc(d.accent2)}" stroke-width="1.4" opacity="0.6"/>
    </svg>
    <div style="position:absolute;top:-14px;right:-12px;width:78px;height:114px;opacity:.92;">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <path d="M100 300 C 96 220 92 140 76 58" fill="none" stroke="${esc(d.accent)}" stroke-width="2" opacity="0.55"/>
        <g opacity="0.88">
          <path d="M100,292 C60,254 32,204 22,146 C56,170 86,208 100,258 Z" fill="${esc(d.accent)}"/>
          <path d="M100,266 C52,232 18,176 12,114 C51,142 86,190 100,238 Z" fill="${esc(d.accent2)}"/>
          <path d="M100,292 C140,254 168,204 178,146 C144,170 114,208 100,258 Z" fill="${esc(d.accent)}" opacity="0.92"/>
          <path d="M100,266 C148,232 182,176 188,114 C149,142 114,190 100,238 Z" fill="${esc(d.accent2)}" opacity="0.92"/>
        </g>
      </svg>
    </div>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:0 18px;">
      <span style="font-size:.5rem;letter-spacing:2.5px;text-transform:uppercase;color:${esc(d.accent)};font-family:Georgia,'Times New Roman',serif;">Save the date</span>
      <span style="font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:600;font-size:1.35rem;color:#2e4342;line-height:1.15;">${esc(d.name)}</span>
      <div style="display:flex;align-items:center;gap:6px;width:64px;margin-top:2px;">
        <span style="flex:1;height:1px;background:${esc(d.accent)};opacity:.6;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:${esc(d.accent2)};flex:none;"></span>
        <span style="flex:1;height:1px;background:${esc(d.accent)};opacity:.6;"></span>
      </div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "savethedate", name: "Destino Playa",
  summary: "Paleta turquesa y arena con olas y una hoja de palmera fina — el save the date de playa que acompaña a la invitación de boda a orillas del mar.",
  accent: "#2fa8a3", accent2: "#e8d5b5", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
