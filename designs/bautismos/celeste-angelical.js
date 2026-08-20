const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");

const id = "bau-celeste-angelical";

const sampleData = {
  nombreChico: "Benjamín",
  padres: "Ana y Federico",
  padrinos: "Lucía y Nicolás",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Iglesia Nuestra Señora del Carmen",
  horaFiesta: "13:00",
  lugarFiesta: "Quinta Los Álamos, Tigre",
  direccionMapa: "https://maps.google.com/?q=Quinta+Los+Alamos+Tigre",
  mensaje: "Señor, toma mi pequeño corazón en tus benditas manos a partir de este día en que te ofrezco la inocencia de mi niñez, y jamás te separes de mí.",
  whatsapp: "5491100000021",
  coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
  ],
};

// Ramo de hortensias celestes en SVG puro (tamaño explícito siempre,
// vía atributos width/height, para evitar el bug del SVG gigante).
function hydrangeaSvg(w, h) {
  return `<svg class="hydrangea" width="${w}" height="${h}" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g>
      <path d="M100 130 C70 120 40 95 35 60 C55 70 65 90 78 108" fill="none" stroke="#8ea88f" stroke-width="3" stroke-linecap="round"/>
      <path d="M90 120 C75 105 68 85 72 62" fill="none" stroke="#8ea88f" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="46" cy="72" rx="13" ry="7" fill="#9fb897" transform="rotate(-30 46 72)"/>
      <ellipse cx="64" cy="98" rx="12" ry="6" fill="#8ea88f" transform="rotate(20 64 98)"/>
      <ellipse cx="88" cy="118" rx="11" ry="6" fill="#9fb897" transform="rotate(-10 88 118)"/>
      <g fill="#a9c3ea">
        <circle cx="55" cy="30" r="9"/><circle cx="72" cy="24" r="9"/><circle cx="90" cy="28" r="9"/>
        <circle cx="46" cy="46" r="9"/><circle cx="64" cy="40" r="10"/><circle cx="83" cy="44" r="9"/><circle cx="100" cy="42" r="8"/>
        <circle cx="55" cy="60" r="9"/><circle cx="73" cy="58" r="10"/><circle cx="91" cy="60" r="9"/>
        <circle cx="66" cy="76" r="8"/><circle cx="83" cy="76" r="8"/>
      </g>
      <g fill="#cddcf3">
        <circle cx="55" cy="30" r="3.4"/><circle cx="72" cy="24" r="3.4"/><circle cx="90" cy="28" r="3.4"/>
        <circle cx="46" cy="46" r="3.4"/><circle cx="64" cy="40" r="3.6"/><circle cx="83" cy="44" r="3.4"/><circle cx="100" cy="42" r="3.2"/>
        <circle cx="55" cy="60" r="3.4"/><circle cx="73" cy="58" r="3.6"/><circle cx="91" cy="60" r="3.4"/>
        <circle cx="66" cy="76" r="3.2"/><circle cx="83" cy="76" r="3.2"/>
      </g>
    </g>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cd-cel");
  const gal = galleryWidget(d.galeria, "gal-cel");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const fecha = d.fecha ? new Date(`${d.fecha}T00:00:00`) : null;
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
  const mesTxt = fecha ? meses[fecha.getMonth()] : "";
  const diaTxt = fecha ? dias[fecha.getDay()] : "";
  const diaNum = fecha ? fecha.getDate() : "";
  const anioTxt = fecha ? fecha.getFullYear() : "";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --white:#ffffff;
    --cream:#fbfaf7;
    --ink:#40506a;
    --ink-soft:#6b7a91;
    --periwinkle:#7c93c4;
    --periwinkle-dk:#5c74a6;
    --hydrangea:#a9c3ea;
    --sky:#e7eef9;
    --sage:#8ea88f;
    --gold:#c9a24d;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Georgia','Times New Roman',serif;
    background:var(--cream);
    color:var(--ink);
  }
  .script{
    font-family:'Brush Script MT','Segoe Script','Lucida Handwriting',cursive;
  }
  .hydrangea{display:block;}

  section, .hero{
    max-width:640px;
    margin:0 auto;
    padding:48px 24px;
    text-align:center;
    position:relative;
  }

  .divider{
    width:60px;
    height:1px;
    background:var(--periwinkle);
    margin:0 auto 22px;
    opacity:.6;
  }

  h2{
    font-weight:400;
    letter-spacing:3px;
    text-transform:uppercase;
    font-size:.95rem;
    color:var(--periwinkle-dk);
    margin:0 0 20px;
  }

  /* ---------- hero ---------- */
  .hero{
    padding-top:56px;
    overflow:visible;
  }
  .hero .hydrangea.corner{
    position:absolute;
    top:-10px;
    right:-6px;
    z-index:1;
  }
  .hero-inner{position:relative;z-index:2;}

  .cross{margin:18px auto 22px;display:block;}

  .quote{
    font-style:italic;
    font-size:clamp(.95rem,3vw,1.05rem);
    line-height:1.85;
    color:var(--ink-soft);
    max-width:420px;
    margin:0 auto 34px;
    letter-spacing:.3px;
  }

  .kicker-script{
    font-size:clamp(2.6rem,9vw,3.6rem);
    color:var(--ink);
    margin:0 0 6px;
    line-height:1;
  }
  .hero h1{
    font-weight:400;
    letter-spacing:3px;
    text-transform:uppercase;
    font-size:clamp(2.2rem,8vw,3rem);
    color:var(--periwinkle-dk);
    margin:0 0 30px;
  }

  .roles{margin-bottom:8px;}
  .roles + .roles{margin-top:18px;}
  .roles h3{
    margin:0 0 6px;
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    font-size:.78rem;
    color:var(--ink);
  }
  .roles p{margin:0;line-height:1.6;color:var(--ink-soft);font-size:.95rem;text-transform:uppercase;letter-spacing:.5px;}

  .invite-text{
    margin:30px auto 0;
    max-width:440px;
    line-height:1.85;
    font-size:.98rem;
    color:var(--ink-soft);
  }

  .date-block{
    margin:34px auto 0;
    max-width:320px;
  }
  .date-month{
    letter-spacing:5px;
    font-size:.85rem;
    color:var(--ink);
    margin-bottom:8px;
  }
  .date-row{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:16px;
  }
  .date-row .line{flex:1;height:1px;background:var(--ink-soft);opacity:.4;max-width:70px;}
  .date-day-name{
    font-size:.78rem;
    letter-spacing:2px;
    color:var(--ink-soft);
  }
  .date-num{
    font-size:2.6rem;
    color:var(--periwinkle-dk);
    line-height:1;
    font-weight:400;
  }
  .date-year{
    font-size:.85rem;
    letter-spacing:3px;
    color:var(--ink-soft);
  }

  /* ---------- tarjetas de evento (misa / fiesta) ---------- */
  .event-card{
    margin:34px auto 0;
    max-width:340px;
  }
  .event-icon{display:block;margin:0 auto 10px;}
  .event-time{font-size:1.05rem;color:var(--ink);margin-bottom:2px;}
  .event-name{
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    font-size:.85rem;
    color:var(--ink);
    margin:2px 0;
  }
  .event-place{font-size:.92rem;color:var(--ink-soft);}
  .event-city{font-style:italic;font-size:.88rem;color:var(--ink-soft);}
  .btn-ubicacion{
    display:inline-block;
    margin-top:16px;
    background:var(--periwinkle);
    color:#fff;
    text-decoration:none;
    padding:12px 28px;
    border-radius:6px;
    font-size:.78rem;
    letter-spacing:2px;
    text-transform:uppercase;
    box-shadow:0 6px 16px rgba(92,116,166,.28);
  }

  /* ---------- countdown ---------- */
  .countdown{display:flex;gap:14px;justify-content:center;margin:0;flex-wrap:wrap;}
  .countdown div{
    display:flex;flex-direction:column;
    background:#fff;
    border-radius:14px;
    padding:14px 16px;
    min-width:62px;
    box-shadow:0 6px 16px rgba(124,147,196,.18);
  }
  .cd-num{font-size:1.5rem;color:var(--periwinkle-dk);font-weight:bold;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);}

  /* ---------- galería ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
  .gallery-item img{width:100%;height:150px;object-fit:cover;border-radius:10px;cursor:pointer;box-shadow:0 6px 14px rgba(124,147,196,.2);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,40,60,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* ---------- rsvp ---------- */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:360px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--periwinkle-dk);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px;border:1px solid var(--sky);border-radius:8px;margin-top:5px;width:100%;background:#fff;color:var(--ink);
  }
  .rsvp-form button{
    background:var(--periwinkle);color:#fff;border:0;padding:13px;border-radius:6px;
    letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-size:.8rem;
  }
  .rsvp-whatsapp{font-size:.85rem;color:var(--periwinkle-dk);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--sage);font-weight:bold;}

  .vestimenta{margin-top:36px;}
  .vestimenta h3{
    font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:.78rem;color:var(--ink);margin:0 0 10px;
  }
  .vestimenta p{margin:6px 0 0;color:var(--ink-soft);letter-spacing:1px;font-size:.85rem;text-transform:uppercase;}

  footer{
    position:relative;
    text-align:center;
    padding:50px 20px 60px;
    background:var(--sky);
    overflow:hidden;
  }
  footer .foot-inner{max-width:640px;margin:0 auto;position:relative;z-index:2;}
  footer .hydrangea.corner{
    position:absolute;
    bottom:-12px;
    left:-8px;
    z-index:1;
  }
  footer p{color:var(--ink-soft);font-size:.9rem;margin:0 0 14px;letter-spacing:.5px;}
  footer .script{font-size:2.2rem;display:block;color:var(--ink);}

  @media (max-width:420px){
    .hero .hydrangea.corner{width:110px;height:110px;}
    footer .hydrangea.corner{width:110px;height:110px;}
  }
</style></head>
<body>

  <section class="hero">
    ${hydrangeaSvg(150, 150)}
    <div class="hero-inner">
      <svg class="cross" width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="14" y="0" width="6" height="46" fill="var(--gold)"/>
        <rect x="0" y="12" width="34" height="6" fill="var(--gold)"/>
      </svg>
      <p class="quote">${esc(d.mensaje)}</p>
      <p class="kicker-script script">Mi Bautizo</p>
      <h1>${esc(d.nombreChico)}</h1>

      ${d.padres ? `<div class="roles"><h3>Mis papás</h3><p>${esc(d.padres)}</p></div>` : ""}
      ${d.padrinos ? `<div class="roles"><h3>Mis padrinos</h3><p>${esc(d.padrinos)}</p></div>` : ""}

      <p class="invite-text">Queremos invitarte a celebrar el bautizo de ${esc(d.nombreChico)}, un momento especial en el que recibirá la bendición de Dios y será acogido en su fe.</p>

      ${fecha ? `<div class="date-block">
        <div class="date-month">${esc(mesTxt)}</div>
        <div class="date-row">
          <span class="date-day-name">${esc(diaTxt)}</span>
          <span class="line"></span>
          <span class="date-num">${esc(diaNum)}</span>
          <span class="line"></span>
          <span class="date-year">${esc(anioTxt)}</span>
        </div>
      </div>` : ""}

      <div class="event-card">
        <svg class="event-icon" width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 2v6" stroke="var(--ink)" stroke-width="1.4"/>
          <path d="M11 5h8" stroke="var(--ink)" stroke-width="1.4"/>
          <path d="M6 28l3-11c0-3.3 2.7-6 6-6s6 2.7 6 6l3 11z" fill="none" stroke="var(--ink)" stroke-width="1.4"/>
          <path d="M15 15v13" stroke="var(--ink)" stroke-width="1.2"/>
          <path d="M4 28h22" stroke="var(--ink)" stroke-width="1.4"/>
        </svg>
        <p class="event-time">${esc(d.horaCeremonia)}</p>
        <p class="event-name">Misa</p>
        <p class="event-place">${esc(d.lugarCeremonia)}</p>
        ${d.direccionMapa ? `<a class="btn-ubicacion" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </div>
    </div>
  </section>

  <section>
    <div class="divider"></div>
    <h2>Falta poco</h2>
    ${cd.html}
  </section>

  <section>
    <div class="divider"></div>
    <h2>Celebración</h2>
    <div class="event-card">
      <svg class="event-icon" width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M8 3l3 10a3 3 0 01-3 3 3 3 0 01-3-3z" fill="none" stroke="var(--ink)" stroke-width="1.3"/>
        <path d="M8 16v11" stroke="var(--ink)" stroke-width="1.3"/>
        <path d="M4 27h8" stroke="var(--ink)" stroke-width="1.3"/>
        <path d="M22 3l-3 8a3 3 0 003 3 3 3 0 003-3z" fill="none" stroke="var(--ink)" stroke-width="1.3"/>
        <path d="M22 14v13" stroke="var(--ink)" stroke-width="1.3"/>
        <path d="M18 27h8" stroke="var(--ink)" stroke-width="1.3"/>
      </svg>
      <p class="event-time">${esc(d.horaFiesta)}</p>
      <p class="event-name">Fiesta</p>
      <p class="event-place">${esc(d.lugarFiesta)}</p>
      ${d.direccionMapa ? `<a class="btn-ubicacion" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>
    <div class="vestimenta">
      <h3>Vestimenta</h3>
      <p>Formal</p>
    </div>
  </section>

  <section>
    <div class="divider"></div>
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section>
    <div class="divider"></div>
    <h2>Confirmación</h2>
    <p class="invite-text" style="margin-top:-8px;">Agradecemos que confirmes tu asistencia lo antes posible.</p>
    ${rsvp.html}
  </section>

  <footer>
    ${hydrangeaSvg(140, 140)}
    <div class="foot-inner">
      <p>Esperamos contar con tu presencia</p>
      <span class="script">¡Muchas gracias!</span>
    </div>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Celeste Angelical",
  summary: "Blanco y celeste con hortensias delicadas, cruz dorada y tipografía clásica — inspirada en tarjetas de bautismo elegantes y luminosas.",
  accent: "#5c74a6", accent2: "#c9a24d", schema: bautismoSchema, sampleData, render,
};
