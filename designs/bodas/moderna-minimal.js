const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");

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

// Ramita de eucalipto estilo acuarela, en SVG inline (sin ids, se puede repetir
// varias veces en la misma página sin colisiones).
const EUCALYPTUS_BRANCH = `
<svg viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
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

const ICON_CHURCH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 6"/><path d="M9.5 4 L14.5 4"/><path d="M5 21 V11 L12 6 L19 11 V21"/><path d="M9 21 V15 H15 V21"/></svg>`;
const ICON_TOAST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 H20 L12 13 V20"/><path d="M8 20 H16"/></svg>`;

const MESES_ES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const DIAS_ES = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd3");
  const gal = galleryWidget(d.galeria, "gal3");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

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
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --olive:#6d7a52;
    --olive-dark:#4a5236;
    --olive-light:#a3af84;
    --sage-bg:#eef1e3;
    --cream:#fdfcf7;
    --ink:#3c3c2e;
    --line:#dde0cd;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;overflow-x:hidden;font-family:'Montserrat',sans-serif;color:var(--ink);background:var(--cream);line-height:1.6;}
  a{color:inherit;}
  .section{position:relative;max-width:640px;margin:0 auto;padding:56px 24px;overflow:hidden;}
  .section.tight{padding-top:34px;padding-bottom:34px;}
  .bg-sage{background:var(--sage-bg);}
  .bg-cream{background:var(--cream);}
  .eyebrow{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--olive);font-weight:600;margin:0 0 10px;}
  .section-title{text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.3rem,4vw,1.8rem);color:var(--olive-dark);margin:0 0 28px;}

  /* --- decoración de hojas --- */
  .leaf-deco{position:absolute;pointer-events:none;z-index:0;opacity:.95;}
  .leaf-deco svg{width:100%;height:100%;display:block;}
  .leaf-tr{top:-18px;right:-30px;width:180px;height:230px;}
  .leaf-tr-sm{top:-10px;right:-16px;width:120px;height:150px;}
  .leaf-bl{bottom:-24px;left:-34px;width:170px;height:220px;transform:rotate(190deg) scaleX(-1);}
  .leaf-br{bottom:-20px;right:-28px;width:150px;height:190px;transform:rotate(160deg);}
  .leaf-tl{top:-16px;left:-28px;width:150px;height:190px;transform:rotate(-70deg) scaleX(-1);}

  /* --- divisor tipo papel rasgado --- */
  .torn{position:relative;width:100%;height:30px;margin:0;padding:0;z-index:1;}
  .torn.into-sage{background:var(--sage-bg);clip-path:polygon(0% 100%,3% 30%,7% 85%,11% 20%,15% 75%,19% 15%,23% 70%,27% 10%,31% 60%,35% 15%,39% 75%,43% 20%,47% 65%,51% 5%,55% 55%,59% 20%,63% 70%,67% 10%,71% 60%,75% 15%,79% 75%,83% 25%,87% 65%,91% 5%,95% 55%,100% 20%,100% 100%);}
  .torn.into-cream{background:var(--cream);clip-path:polygon(0% 0%,3% 70%,7% 15%,11% 80%,15% 25%,19% 85%,23% 30%,27% 90%,31% 40%,35% 85%,39% 25%,43% 80%,47% 35%,51% 95%,55% 45%,59% 80%,63% 30%,67% 90%,71% 40%,75% 85%,79% 25%,83% 75%,87% 35%,91% 95%,95% 45%,100% 80%,100% 0%);}

  /* --- hero / portada --- */
  .hero{padding-top:64px;padding-bottom:40px;}
  .hero blockquote{margin:8px auto 30px;max-width:420px;text-align:center;font-size:.82rem;letter-spacing:1px;line-height:1.9;color:var(--olive-dark);font-style:normal;text-transform:uppercase;}
  .monogram{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:16px;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2.6rem,9vw,3.6rem);color:var(--olive-dark);margin:10px 0 6px;}
  .monogram .bar{width:1px;height:.85em;background:var(--olive-dark);display:inline-block;}
  .monogram-label{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--olive);}

  /* --- foto de portada --- */
  .cover-photo{width:100%;height:min(70vw,460px);object-fit:cover;display:block;}

  /* --- nombres --- */
  .names-intro{text-align:center;font-size:.78rem;letter-spacing:1px;color:#6b6b57;max-width:420px;margin:0 auto 24px;text-transform:uppercase;}
  .names-script{position:relative;z-index:1;font-family:'Great Vibes',cursive;text-align:center;color:var(--olive-dark);line-height:1.05;}
  .names-script .name{display:block;font-size:clamp(3rem,12vw,5rem);}
  .names-script .amp{display:block;font-size:clamp(1.6rem,6vw,2.3rem);margin:.05em 0;color:var(--olive);}
  .honor-text{text-align:center;max-width:380px;margin:22px auto 0;font-size:.85rem;color:#5a5a48;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:26px auto 0;}
  .date-block .weekday,.date-block .year{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--olive-dark);border-top:1px solid var(--olive);border-bottom:1px solid var(--olive);padding:8px 6px;white-space:nowrap;}
  .date-block .day{font-family:'Cormorant Garamond',serif;font-size:clamp(3.2rem,11vw,4.6rem);color:var(--olive-dark);line-height:1;}
  .month-label{text-align:center;letter-spacing:5px;font-size:.8rem;text-transform:uppercase;color:var(--olive);margin:8px 0 0;}

  /* --- countdown --- */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown > div{background:#fff;border:1px solid var(--line);min-width:74px;padding:16px 8px;border-radius:3px;text-align:center;box-shadow:0 2px 8px rgba(74,82,54,.06);}
  .cd-num{display:block;font-family:'Cormorant Garamond',serif;font-size:clamp(1.7rem,5vw,2.3rem);color:var(--olive-dark);font-weight:600;}
  .cd-label{font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#8b8b73;}

  /* --- detalle ceremonia / fiesta --- */
  .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;position:relative;z-index:1;}
  .info-card{background:#fff;border:1px solid var(--line);border-radius:6px;padding:26px 20px;text-align:center;}
  .info-card .info-time{font-size:.72rem;letter-spacing:2px;color:var(--olive);text-transform:uppercase;}
  .info-card h3{margin:6px 0 2px;font-family:'Cormorant Garamond',serif;font-size:1.25rem;letter-spacing:1px;text-transform:uppercase;color:var(--olive-dark);}
  .info-card p{margin:0 0 16px;font-size:.85rem;color:#666;font-style:italic;}
  .btn-map{display:inline-block;background:var(--olive-dark);color:#fff;text-decoration:none;font-size:.68rem;letter-spacing:2px;text-transform:uppercase;padding:12px 22px;border-radius:2px;}
  .btn-map:hover{background:var(--olive);}
  .dress-note{text-align:center;margin-top:22px;font-size:.85rem;color:#5a5a48;position:relative;z-index:1;}
  .dress-note strong{color:var(--olive-dark);}

  /* --- timeline / itinerario --- */
  .timeline{position:relative;z-index:1;max-width:420px;margin:34px auto 0;}
  .timeline-item{position:relative;display:flex;gap:18px;padding-bottom:34px;}
  .timeline-item:last-child{padding-bottom:0;}
  .timeline-item:not(:last-child)::before{content:'';position:absolute;left:21px;top:44px;bottom:-34px;width:1px;background:var(--olive-light);}
  .timeline-icon{width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:var(--olive);color:#fff;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;}
  .timeline-icon svg{width:20px;height:20px;}
  .timeline-content{padding-top:4px;}
  .timeline-time{font-size:.72rem;letter-spacing:1.5px;color:var(--olive-dark);font-weight:600;}
  .timeline-place{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;color:var(--ink);margin-top:2px;}
  .timeline-sub{font-size:.78rem;color:#777;margin-top:2px;}

  /* --- galería --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;border-radius:5px;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;transition:transform .35s ease;}
  .gallery-item:hover img{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(40,44,28,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* --- regalo / aviso adultos --- */
  .extra-grid{display:flex;flex-direction:column;gap:34px;position:relative;z-index:1;}
  .extra-item{text-align:center;max-width:420px;margin:0 auto;}
  .extra-item .ico{font-size:1.6rem;margin-bottom:6px;}
  .extra-item h4{margin:0 0 6px;font-family:'Cormorant Garamond',serif;font-size:1.1rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--olive-dark);}
  .extra-item p{margin:0;font-size:.85rem;color:#5a5a48;}
  .extra-item .alias-pill{display:inline-block;margin-top:8px;padding:8px 16px;border:1px solid var(--olive);border-radius:20px;font-size:.8rem;letter-spacing:1px;color:var(--olive-dark);}

  /* --- rsvp --- */
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
  }
</style></head>
<body>

  <!-- Portada -->
  <section class="section hero bg-cream">
    ${leaf("leaf-tr")}
    <p class="eyebrow">Nos casamos</p>
    <blockquote>${esc(d.mensaje)}</blockquote>
    <div class="monogram"><span>${esc(inicialNovia)}</span><span class="bar"></span><span>${esc(inicialNovio)}</span></div>
    <p class="monogram-label">Nuestra boda</p>
  </section>

  <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">

  <!-- Nombres -->
  <section class="section bg-cream">
    ${leaf("leaf-br")}
    <p class="names-intro">Con la bendición de Dios y de nuestras familias,<br>tenemos el honor de invitarte a celebrar</p>
    <div class="names-script">
      <span class="name">${esc(d.novia)}</span>
      <span class="amp">&amp;</span>
      <span class="name">${esc(d.novio)}</span>
    </div>
    <p class="honor-text">Nos encantaría contar con tu presencia en este día tan especial para nosotros.</p>
    ${fechaObj ? `
    <p class="month-label">${esc(mesLabel)}</p>
    <div class="date-block">
      <span class="weekday">${esc(diaSemana)}</span>
      <span class="day">${esc(diaNum)}</span>
      <span class="year">${esc(anioLabel)}</span>
    </div>` : ""}
  </section>

  <div class="torn into-sage"></div>

  <!-- Cuenta regresiva -->
  <section class="section bg-sage tight">
    ${leaf("leaf-tr-sm")}
    <h2 class="section-title">Falta muy poco</h2>
    ${cd.html}
  </section>

  <!-- Ceremonia y fiesta -->
  <section class="section bg-sage">
    <p class="eyebrow">Itinerario</p>
    <h2 class="section-title">Celebremos juntos</h2>
    <div class="info-grid">
      <div class="info-card">
        <span class="info-time">${esc(d.horaCeremonia)}</span>
        <h3>Ceremonia</h3>
        <p>${esc(d.lugarCeremonia)}</p>
        ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </div>
      <div class="info-card">
        <span class="info-time">${esc(d.horaFiesta)}</span>
        <h3>Fiesta</h3>
        <p>${esc(d.lugarFiesta)}</p>
        ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </div>
    </div>

    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-icon">${ICON_CHURCH}</div>
        <div class="timeline-content">
          <div class="timeline-time">${esc(d.horaCeremonia)}</div>
          <div class="timeline-place">Ceremonia</div>
          <div class="timeline-sub">${esc(d.lugarCeremonia)}</div>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-icon">${ICON_TOAST}</div>
        <div class="timeline-content">
          <div class="timeline-time">${esc(d.horaFiesta)}</div>
          <div class="timeline-place">Recepción y fiesta</div>
          <div class="timeline-sub">${esc(d.lugarFiesta)}</div>
        </div>
      </div>
    </div>

    <p class="dress-note">Código de vestimenta: <strong>${esc(d.dressCode)}</strong></p>
  </section>

  <div class="torn into-cream"></div>

  <!-- Galería -->
  <section class="section bg-cream">
    ${leaf("leaf-tl")}
    <p class="eyebrow">Recuerdos</p>
    <h2 class="section-title">Nuestros momentos</h2>
    ${gal.html}
  </section>

  <!-- Regalo y aviso -->
  <section class="section bg-sage">
    <div class="extra-grid">
      <div class="extra-item">
        <div class="ico">&#127873;</div>
        <h4>Sugerencia de regalo</h4>
        <p>Si desean hacernos un presente, nos harían muy felices ayudándonos a cumplir nuestros próximos sueños.</p>
        ${d.alias ? `<span class="alias-pill">Alias: ${esc(d.alias)}</span>` : ""}
      </div>
      <div class="extra-item">
        <div class="ico">&#128141;</div>
        <h4>Sólo adultos</h4>
        <p>Adoramos a tus hijos, pero creemos que esta noche merecen un rato para ustedes. ¡Gracias por entenderlo!</p>
      </div>
    </div>
  </section>

  <div class="torn into-cream"></div>

  <!-- RSVP -->
  <section class="section bg-cream">
    ${leaf("leaf-bl")}
    <p class="eyebrow">Confirmación</p>
    <h2 class="section-title">Contanos si nos acompañás</h2>
    ${rsvp.html}
  </section>

  <footer>
    <span class="thanks">Gracias por ser parte de nuestra historia</span>
    ${esc(d.novia)} &amp; ${esc(d.novio)} — ${esc(d.fecha)}
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Moderna Minimal",
  summary: "Paleta blanco y verde oliva con hojas de eucalipto en acuarela, monograma de iniciales, nombres en script y timeline de itinerario con íconos.",
  accent: "#4a5236", accent2: "#eef1e3", schema: bodaSchema, sampleData, render,
};
