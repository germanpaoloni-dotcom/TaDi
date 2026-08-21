const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "bau-clasica-dorada";

const sampleData = {
  nombreChico: "Danna Paola",
  padres: "Pablo Martínez y Luciana López",
  padrinos: "Roberto Pérez y Alicia Tórrez",
  fecha: "2027-07-31",
  horaCeremonia: "15:00",
  lugarCeremonia: "Parroquia de San Juan Bautista y de Nuestra Señora de la Candelaria",
  horaFiesta: "15:00",
  lugarFiesta: "Salón La Fuente",
  direccionMapa: "https://maps.google.com/?q=Parroquia+San+Juan+Bautista",
  mensaje: "Con la gracia de Dios y la alegría de toda la familia, los invitamos a acompañarnos en el bautismo de Danna Paola, un día para celebrar la fe y el amor que la reciben.",
  whatsapp: "5491100000020",
  coverImage: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80",
    "https://images.unsplash.com/photo-1518057111178-44a106bad636?w=800&q=80",
  ],
};

// Motivos dorados dibujados a mano en SVG (sin depender de íconos ni
// fuentes externas), inspirados en la referencia "Clásica Dorada":
// cruz con flor, ramitas con capullos y una rama floral de esquina.

const crossSVG = `<svg class="orn orn-cross" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="34" height="51">
  <line x1="30" y1="4" x2="30" y2="86" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="6" y1="28" x2="54" y2="28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <g transform="translate(30 26)">
    <ellipse cx="0" cy="-10" rx="6" ry="10" fill="var(--blush)" opacity=".85"/>
    <ellipse cx="0" cy="10" rx="6" ry="10" fill="var(--blush)" opacity=".85"/>
    <ellipse cx="-10" cy="0" rx="10" ry="6" fill="var(--blush-dark)" opacity=".8"/>
    <ellipse cx="10" cy="0" rx="10" ry="6" fill="var(--blush-dark)" opacity=".8"/>
    <circle cx="0" cy="0" r="4.5" fill="var(--gold)"/>
  </g>
</svg>`;

const flowerDotSVG = `<svg class="orn orn-flower" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="14" height="14">
  <g stroke="currentColor" stroke-width="1">
    <ellipse cx="12" cy="6" rx="3.4" ry="5" transform="rotate(0 12 12)"/>
    <ellipse cx="12" cy="6" rx="3.4" ry="5" transform="rotate(72 12 12)"/>
    <ellipse cx="12" cy="6" rx="3.4" ry="5" transform="rotate(144 12 12)"/>
    <ellipse cx="12" cy="6" rx="3.4" ry="5" transform="rotate(216 12 12)"/>
    <ellipse cx="12" cy="6" rx="3.4" ry="5" transform="rotate(288 12 12)"/>
  </g>
  <circle cx="12" cy="12" r="2" fill="currentColor"/>
</svg>`;

function branchSVG(flip) {
  return `<svg class="orn orn-branch${flip ? " flip" : ""}" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="64" height="14">
    <path d="M2 10 H88" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <ellipse cx="18" cy="6" rx="6" ry="2.6" transform="rotate(-28 18 6)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="34" cy="14" rx="6" ry="2.6" transform="rotate(28 34 14)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="50" cy="6" rx="6" ry="2.6" transform="rotate(-28 50 6)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="66" cy="14" rx="6" ry="2.6" transform="rotate(28 66 14)" stroke="currentColor" stroke-width="1"/>
    <circle cx="82" cy="10" r="2.4" stroke="currentColor" stroke-width="1"/>
  </svg>`;
}

// Rama floral de esquina (orquídeas + hojas) usada en el hero, a modo de
// eco del ornamento pintado de la referencia, resuelta en línea dorada
// con acentos rosados para no depender de imágenes externas.
function cornerBranchSVG(flip) {
  return `<svg class="orn orn-corner${flip ? " flip" : ""}" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="86" height="68">
    <path d="M4 4 C 30 8, 55 22, 66 46" stroke="var(--gold)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M18 10 C 34 16, 44 26, 48 40" stroke="var(--gold)" stroke-width="1" stroke-linecap="round"/>
    <g fill="var(--blush)" opacity=".9">
      <ellipse cx="16" cy="14" rx="10" ry="6" transform="rotate(-30 16 14)"/>
      <ellipse cx="34" cy="10" rx="8" ry="5" transform="rotate(10 34 10)"/>
    </g>
    <g fill="var(--blush-dark)" opacity=".85">
      <ellipse cx="46" cy="30" rx="7" ry="4.5" transform="rotate(35 46 30)"/>
      <ellipse cx="10" cy="30" rx="6" ry="4" transform="rotate(-50 10 30)"/>
    </g>
    <g fill="var(--gold-light)" opacity=".9">
      <ellipse cx="60" cy="46" rx="6" ry="10" transform="rotate(20 60 46)"/>
      <ellipse cx="26" cy="20" rx="5" ry="8" transform="rotate(-15 26 20)"/>
    </g>
    <circle cx="16" cy="14" r="2.2" fill="var(--gold-dark)"/>
    <circle cx="34" cy="10" r="1.8" fill="var(--gold-dark)"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${branchSVG(false)}${flowerDotSVG}${branchSVG(true)}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#b8934f");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  let fechaLarga = "";
  let mesAnio = "";
  let diaNum = "";
  let diaSemana = "";
  if (d.fecha) {
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (y && m && day) {
      fechaLarga = `${day} de ${meses[m - 1]} de ${y}`;
      mesAnio = `${meses[m - 1]} ${y}`;
      diaNum = String(day).padStart(2, "0");
      const dt = new Date(Date.UTC(y, m - 1, day));
      diaSemana = diasSemana[dt.getUTCDay()];
    } else {
      fechaLarga = d.fecha;
    }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --gold:${accent};
    --gold-dark:color-mix(in srgb, ${accent}, black 25%);
    --gold-light:color-mix(in srgb, ${accent}, white 45%);
    --blush:#e0aab8;
    --blush-dark:#cf8ea0;
    --cream:#faf3e6;
    --cream2:#f1e2c4;
    --paper:#fffbf2;
    --ink:#372c1d;
    --ink-soft:#6d5c40;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:Georgia,'Palatino Linotype','Times New Roman',serif;background:var(--cream);color:var(--ink);}
  img{max-width:100%;display:block;}
  a{color:inherit;}

  .orn{color:var(--gold);flex:0 0 auto;}
  .orn-branch.flip,.orn-corner.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 auto 24px;}
  .divider .orn-flower{color:var(--gold-dark);}

  .script{font-family:'Brush Script MT','Segoe Script','Lucida Handwriting',cursive;}

  /* ---- Hero ---- */
  .hero{position:relative;max-width:640px;margin:0 auto;padding:56px 22px 46px;text-align:center;overflow:hidden;background:var(--paper);}
  .hero::before{content:"";position:absolute;inset:10px;border:1px solid var(--gold-light);pointer-events:none;}
  .hero .orn-corner{position:absolute;top:14px;left:10px;}
  .hero .orn-corner.flip{left:auto;right:10px;}
  .hero-inner{position:relative;z-index:1;}
  .eyebrow{letter-spacing:.28em;text-transform:uppercase;font-size:clamp(.62rem,2vw,.75rem);color:var(--gold-dark);margin:34px 0 18px;}
  .hero .orn-cross{margin:0 auto 18px;}
  .hero-title{font-size:clamp(2.1rem,7vw,3rem);color:var(--ink);margin:0 0 8px;font-weight:400;}
  .hero-name{font-size:clamp(2.6rem,9vw,4rem);color:var(--gold-dark);margin:2px 0 4px;line-height:1.05;}

  .photo-frame{position:relative;max-width:320px;margin:26px auto 8px;border-radius:50% 50% 6px 6px/22% 22% 6px 6px;overflow:hidden;box-shadow:0 10px 26px color-mix(in srgb, var(--gold-dark) 22%, transparent);border:6px solid var(--paper);outline:1px solid var(--gold-light);}
  .photo-frame img{width:100%;height:360px;object-fit:cover;}

  .message{font-size:clamp(1rem,2.4vw,1.15rem);line-height:1.85;font-style:italic;color:var(--ink-soft);margin:22px auto 8px;max-width:480px;}

  .familia{margin-top:8px;}
  .familia .lead{font-size:.95rem;color:var(--ink-soft);margin:0 0 16px;}
  .familia .grupo{margin-bottom:18px;}
  .familia .label{display:block;letter-spacing:1.5px;text-transform:uppercase;font-size:.78rem;color:var(--gold-dark);margin-bottom:6px;}
  .familia .names{font-size:clamp(1.02rem,2.6vw,1.18rem);color:var(--ink);}

  .festejar{margin-top:26px;}
  .festejar .a{font-size:.9rem;letter-spacing:1px;text-transform:uppercase;color:var(--ink-soft);}
  .festejar .big{font-size:clamp(1.6rem,5vw,2.1rem);letter-spacing:2px;color:var(--gold-dark);margin:4px 0 18px;}
  .datebox{display:flex;align-items:center;justify-content:center;gap:14px;border-top:1px solid var(--gold-light);border-bottom:1px solid var(--gold-light);padding:14px 10px;max-width:320px;margin:0 auto;}
  .datebox .mes,.datebox .anio{font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--ink-soft);}
  .datebox .dia{font-family:'Brush Script MT','Segoe Script','Lucida Handwriting',cursive;font-size:2.4rem;color:var(--gold-dark);line-height:1;}

  /* ---- Secciones generales ---- */
  section{max-width:640px;margin:0 auto;padding:54px 22px;text-align:center;}
  h2{font-weight:400;letter-spacing:.5px;font-size:clamp(1.15rem,3vw,1.4rem);color:var(--ink);margin:0 0 6px;}
  .subtitle{font-size:.85rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold-dark);margin:0 0 26px;}
  .section-head{margin-bottom:30px;}
  .section-head .kicker{display:block;}
  .section-head .kicker h2{display:inline-block;border-bottom:1px solid var(--gold-light);padding-bottom:8px;}

  /* ---- Countdown / gran día ---- */
  .diacard{background:var(--paper);border:1px solid var(--cream2);border-radius:6px;padding:30px 20px 26px;box-shadow:0 6px 22px color-mix(in srgb, var(--gold-dark) 10%, transparent);}
  .diacard .mesanio{text-transform:uppercase;letter-spacing:2px;font-size:1rem;color:var(--gold-dark);margin-bottom:18px;}
  .countdown{display:flex;gap:clamp(10px,4vw,26px);justify-content:center;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:50px;}
  .cd-num{font-size:clamp(1.5rem,4vw,2.1rem);color:var(--gold-dark);font-family:Georgia,serif;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);}

  /* ---- Ubicación ---- */
  .timeline{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .timeline .card{background:var(--paper);border:1px solid var(--cream2);box-shadow:0 4px 18px color-mix(in srgb, var(--gold-dark) 9%, transparent);padding:30px 26px;border-radius:6px;min-width:220px;flex:1 1 220px;max-width:280px;}
  .timeline .card .ico{width:28px;height:28px;margin:0 auto 14px;color:var(--gold);}
  .timeline .card h3{margin:0 0 10px;color:var(--ink);font-weight:400;letter-spacing:.5px;font-size:1.02rem;}
  .timeline .card .hora{color:var(--gold-dark);font-weight:bold;font-size:.85rem;margin-bottom:6px;}
  .timeline .card p{margin:0;line-height:1.6;color:var(--ink-soft);font-size:.92rem;}
  .maplink{display:inline-block;margin-top:16px;background:var(--gold-light);color:var(--ink);text-decoration:none;padding:8px 16px;border-radius:20px;letter-spacing:.5px;font-size:.78rem;}
  .maplink:hover{background:var(--gold);color:#fff;}

  /* ---- Galería ---- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:8px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:4px;cursor:pointer;border:3px solid var(--paper);outline:1px solid var(--cream2);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,24,15,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream);font-size:2rem;cursor:pointer;}

  /* ---- RSVP ---- */
  .rsvp-note{font-size:.9rem;color:var(--ink-soft);margin:0 0 20px;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid var(--cream2);border-radius:4px;margin-top:4px;width:100%;background:var(--paper);}
  .rsvp-form button{background:var(--gold-dark);color:#fff;border:0;padding:13px;border-radius:24px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;font-size:.82rem;margin-top:4px;}
  .rsvp-form button:hover{background:var(--gold);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold-dark);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:#5c8a56;font-weight:bold;}

  footer{position:relative;max-width:640px;margin:0 auto;text-align:center;padding:44px 22px 54px;font-size:.88rem;color:var(--ink-soft);border-top:1px solid var(--cream2);}
  footer .orn-cross{margin:0 auto 14px;width:22px;height:33px;}
  footer .fam{font-family:'Brush Script MT','Segoe Script','Lucida Handwriting',cursive;font-size:1.5rem;color:var(--gold-dark);margin-top:6px;}
</style></head>
<body>

  <div class="hero">
    ${cornerBranchSVG(false)}
    ${cornerBranchSVG(true)}
    <div class="hero-inner">
      <p class="eyebrow">Acompáñanos a celebrar</p>
      ${crossSVG}
      <h1 class="hero-title script">Mi Bautizo</h1>
      <p class="hero-name script">${esc(d.nombreChico)}</p>

      <div class="photo-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div>

      ${d.mensaje ? `<p class="message">${esc(d.mensaje)}</p>` : ""}

      <div class="familia">
        <p class="lead">Acompáñame en este día tan especial junto a:</p>
        ${d.padres ? `<div class="grupo">
          <span class="label">Mis padres</span>
          <span class="names">${esc(d.padres)}</span>
        </div>` : ""}
        ${d.padrinos ? `<div class="grupo">
          <span class="label">Mis padrinos de bautizo</span>
          <span class="names">${esc(d.padrinos)}</span>
        </div>` : ""}
      </div>

      <div class="festejar">
        <p class="a">A festejar mi</p>
        <p class="big">Bautizo</p>
        ${fechaLarga ? `<div class="datebox">
          <span class="mes">${esc((mesAnio.split(" ")[0] || "").toUpperCase())}</span>
          <span class="dia">${esc(diaNum)}</span>
          <span class="anio">${esc((mesAnio.split(" ")[1] || ""))}</span>
        </div>` : ""}
      </div>
    </div>
  </div>

  <section>
    <div class="section-head"><span class="kicker"><h2>El gran día</h2></span></div>

    <div class="diacard">
      ${mesAnio ? `<p class="mesanio">${esc(mesAnio)}${diaSemana ? ` · ${esc(diaSemana)}` : ""}</p>` : ""}
      ${cd.html}
    </div>
  </section>

  <section>
    ${divider()}
    <div class="section-head"><h2>¿Dónde será?</h2><p class="subtitle">Ubicación</p></div>
    <div class="timeline">
      ${d.horaCeremonia || d.lugarCeremonia ? `<div class="card">
        <svg class="ico" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="28" height="28"><line x1="12" y1="1" x2="12" y2="39" stroke="currentColor" stroke-width="1.4"/><line x1="1" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="1.4"/></svg>
        <h3>Ceremonia religiosa</h3>
        ${d.horaCeremonia ? `<p class="hora">${esc(d.horaCeremonia)} hs</p>` : ""}
        ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </div>` : ""}
      ${d.horaFiesta || d.lugarFiesta ? `<div class="card">
        <svg class="ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="28" height="28"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3"/><path d="M12 7v5l3.2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <h3>Recepción</h3>
        ${d.horaFiesta ? `<p class="hora">${esc(d.horaFiesta)} hs</p>` : ""}
        ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </div>` : ""}
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `
  <section>
    ${divider()}
    <div class="section-head"><h2>Momentos</h2></div>
    ${gal.html}
  </section>` : ""}

  <section>
    ${divider()}
    <div class="section-head"><h2>Confirmar asistencia</h2></div>
    <p class="rsvp-note">Por favor confirmá tu asistencia lo más antes posible.</p>
    ${rsvp.html}
  </section>

  <footer>
    ${crossSVG}
    <p>¡Esperamos contar con su presencia!</p>
    ${d.padres ? `<p>Con cariño,</p>
    <p class="fam">${esc(d.padres)}</p>` : ""}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Clásica Dorada",
  summary: "Papel crema con ramas florales doradas y rosadas, cruz con flor, foto en marco de arco y detalles caligráficos: la clásica invitación de bautismo elegante.",
  accent: "#8c6a30", accent2: "#e0aab8", schema: bautismoSchema, sampleData, render,
};
