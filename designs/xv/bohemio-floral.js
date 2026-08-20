const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-bohemio-floral";

const sampleData = {
  nombre: "Martina",
  fecha: "2027-09-04", horaCeremonia: "18:00", lugarCeremonia: "Parroquia San José",
  horaFiesta: "20:00", lugarFiesta: "Quinta La Flor, Pilar",
  direccionMapa: "https://maps.google.com/?q=Quinta+La+Flor+Pilar",
  padres: "Marcela y Fernando",
  mensaje: "A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo mis 15 años. Porque su presencia siempre será mi mejor regalo.",
  dressCode: "Boho / colores pastel",
  whatsapp: "5491100000004",
  coverImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos SVG (rosas y hojas en acuarela boho, dibujados a mano en vectores) ---
function roseCluster(opts = {}) {
  const { w = 130, flip = false, flop = false } = opts;
  const t = [flip ? "scaleX(-1)" : "", flop ? "scaleY(-1)" : ""].filter(Boolean).join(" ");
  return `<svg class="floral" width="${w}" viewBox="0 0 200 200" style="transform:${t || "none"}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M42 172 C 14 128, 22 78, 58 52" stroke="#93a679" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M58 52 C 70 44, 90 40, 110 46" stroke="#93a679" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="52" cy="76" rx="17" ry="9" fill="#93a679" transform="rotate(-35 52 76)"/>
    <ellipse cx="34" cy="118" rx="16" ry="8" fill="#a3b489" transform="rotate(25 34 118)"/>
    <ellipse cx="30" cy="150" rx="14" ry="7" fill="#93a679" transform="rotate(-15 30 150)"/>
    <g>
      <circle cx="70" cy="46" r="21" fill="#f7ece0"/>
      <circle cx="53" cy="38" r="16" fill="#f0dcc9"/>
      <circle cx="87" cy="38" r="16" fill="#f0dcc9"/>
      <circle cx="70" cy="27" r="15" fill="#e7c6ac"/>
      <circle cx="70" cy="43" r="10" fill="#d9a988"/>
    </g>
    <g>
      <circle cx="128" cy="82" r="15" fill="#f7ece0"/>
      <circle cx="116" cy="75" r="11" fill="#f0dcc9"/>
      <circle cx="140" cy="75" r="11" fill="#f0dcc9"/>
      <circle cx="128" cy="80" r="8" fill="#d9a988"/>
    </g>
    <ellipse cx="146" cy="104" rx="14" ry="7" fill="#93a679" transform="rotate(-20 146 104)"/>
    <g>
      <circle cx="112" cy="130" r="10" fill="#f0dcc9"/>
      <circle cx="104" cy="125" r="7" fill="#e7c6ac"/>
      <circle cx="120" cy="125" r="7" fill="#e7c6ac"/>
    </g>
  </svg>`;
}

function sprig(w = 70) {
  return `<svg class="sprig" width="${w}" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 20 C 30 2, 70 2, 98 20" stroke="#c9a98f" stroke-width="1.5" fill="none"/>
    <circle cx="50" cy="13" r="4" fill="#d9a988"/>
    <ellipse cx="30" cy="18" rx="6" ry="3" fill="#93a679" transform="rotate(-20 30 18)"/>
    <ellipse cx="70" cy="18" rx="6" ry="3" fill="#93a679" transform="rotate(20 70 18)"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#a9825a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd5");
  const gal = galleryWidget(d.galeria, "gal5");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechaObj = d.fecha ? new Date(`${d.fecha}T00:00:00`) : null;
  const diaSemana = fechaObj && !isNaN(fechaObj) ? dias[fechaObj.getDay()] : "";
  const diaNum = fechaObj && !isNaN(fechaObj) ? String(fechaObj.getDate()).padStart(2, "0") : "--";
  const mesNombre = fechaObj && !isNaN(fechaObj) ? meses[fechaObj.getMonth()] : "";
  const anio = fechaObj && !isNaN(fechaObj) ? fechaObj.getFullYear() : "";

  const mapaBtn = d.direccionMapa
    ? `<a class="btn-outline" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>`
    : "";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --cream:#fffaf3; --paper:#fdf5ea; --blush:#f4ddd2; --rose:#d9a988;
    --gold:${accent}; --sage:#8a9b6f; --brown:#4a3c32; --muted:#8a7a6c;
    --beige:#f1e5d5; --line:#e5d6c6;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;font-family:'Playfair Display',Georgia,serif;background:#c9a988;color:var(--brown);overflow-x:hidden;}
  .card{max-width:560px;margin:0 auto;background:var(--cream);position:relative;box-shadow:0 0 60px rgba(0,0,0,.25);}
  .script{font-family:'Alex Brush',cursive;color:var(--gold);line-height:1;}
  .label{font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.2em;font-size:.7rem;color:var(--muted);}
  section{max-width:480px;margin:0 auto;padding:44px 28px;position:relative;}
  .center{text-align:center;}
  h2.section-title{font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.25em;font-weight:500;font-size:.85rem;color:var(--brown);margin:0 0 22px;text-align:center;}
  .floral{position:absolute;pointer-events:none;z-index:2;}
  .divider{display:flex;justify-content:center;margin:26px 0;}

  /* HERO */
  .hero{position:relative;background:linear-gradient(180deg,var(--blush) 0%,var(--cream) 70%);padding:54px 24px 30px;text-align:center;overflow:hidden;}
  .hero .floral.tl{top:-10px;left:-16px;}
  .hero .floral.tr{top:-10px;right:-16px;}
  .hero .tiara{width:clamp(90px,26vw,120px);margin:10px auto 8px;display:block;}
  .hero .label{color:var(--gold);}
  .hero h1{font-weight:400;text-transform:uppercase;letter-spacing:.18em;font-size:clamp(1.6rem,7vw,2.3rem);margin:.3em 0 0;color:var(--brown);}

  /* PHOTO */
  .photo-wrap{position:relative;width:100%;padding-bottom:118%;overflow:hidden;
    clip-path:polygon(0 0,100% 0,100% 90%,94% 95%,88% 91%,82% 96%,76% 92%,70% 97%,64% 93%,58% 98%,52% 94%,46% 99%,40% 94%,34% 98%,28% 93%,22% 97%,16% 92%,10% 96%,4% 91%,0 95%);
  }
  .photo-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .photo-section{position:relative;}
  .photo-section .floral.bl{bottom:-6px;left:-18px;z-index:3;}

  /* MENSAJE */
  .mensaje p{font-style:italic;line-height:1.9;color:var(--brown);font-size:1rem;margin:0 0 28px;}
  .name-script{font-size:clamp(2.4rem,11vw,3.4rem);margin:0 0 20px;}
  .padres-block{font-family:'Poppins',sans-serif;font-size:.8rem;letter-spacing:.05em;line-height:2.1;color:var(--brown);}
  .padres-block .lbl{text-transform:uppercase;letter-spacing:.2em;font-size:.68rem;color:var(--muted);display:block;margin-top:14px;}
  .padres-block .names{font-style:italic;color:var(--gold);font-weight:600;}
  .heart{color:var(--gold);font-size:1.3rem;margin:22px 0;}
  .date-box{display:flex;align-items:center;justify-content:center;gap:14px;margin:18px 0 8px;font-family:'Poppins',sans-serif;}
  .date-box .line{flex:1;max-width:60px;height:1px;background:var(--line);}
  .date-box .dow, .date-box .yr{font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}
  .date-box .day{font-size:2.6rem;color:var(--gold);font-family:'Playfair Display',serif;line-height:1;}
  .month{font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.3em;font-size:.85rem;color:var(--brown);text-align:center;margin-bottom:6px;}

  /* INFO CARDS (ceremonia / recepcion) */
  .info-card{text-align:center;background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:24px 20px;margin:18px 0;}
  .info-card .ev-label{font-family:'Poppins',sans-serif;font-weight:600;letter-spacing:.15em;text-transform:uppercase;font-size:.8rem;color:var(--brown);margin-bottom:6px;}
  .info-card .ev-time{font-size:1.5rem;color:var(--gold);margin:4px 0;}
  .info-card .ev-place{font-family:'Poppins',sans-serif;font-size:.9rem;}
  .info-card .ev-city{font-style:italic;color:var(--muted);font-size:.8rem;margin-bottom:14px;}
  .btn-outline{display:inline-block;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.15em;font-size:.75rem;font-weight:500;background:var(--beige);color:var(--brown);border:1px solid var(--rose);padding:12px 22px;border-radius:2px;text-decoration:none;transition:background .2s;}
  .btn-outline:hover{background:var(--rose);color:#fff;}

  /* ITINERARIO */
  .itinerary-wrap{background:var(--paper);position:relative;padding:44px 28px;}
  .timeline{max-width:420px;margin:0 auto;display:flex;flex-direction:column;gap:26px;}
  .tl-item{display:flex;align-items:center;gap:16px;font-family:'Poppins',sans-serif;}
  .tl-item .ico{width:44px;height:44px;border-radius:50%;background:var(--cream);border:1px solid var(--rose);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
  .tl-item .txt{flex:1;}
  .tl-item .txt b{display:block;letter-spacing:.15em;text-transform:uppercase;font-size:.85rem;color:var(--brown);}
  .tl-item .txt span{font-size:.8rem;color:var(--muted);}
  .tl-item .hora{color:var(--gold);font-size:1rem;white-space:nowrap;}

  /* COUNTDOWN */
  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
  .countdown div{text-align:center;min-width:56px;}
  .cd-num{font-size:1.9rem;color:var(--gold);display:block;font-family:'Playfair Display',serif;}
  .cd-label{font-family:'Poppins',sans-serif;font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);}

  /* CONFIRMACION */
  .confirm-wrap{text-align:center;}
  .confirm-wrap .icon-circle{width:56px;height:56px;border-radius:50%;background:var(--paper);border:1px solid var(--rose);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:1.5rem;color:var(--sage);}
  .confirm-wrap p{font-family:'Poppins',sans-serif;font-size:.85rem;color:var(--muted);max-width:280px;margin:0 auto 20px;line-height:1.6;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;text-align:left;max-width:360px;margin:0 auto;font-family:'Poppins',sans-serif;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px;border:1px solid var(--line);border-radius:2px;margin-top:4px;width:100%;background:#fff;color:var(--brown);}
  .rsvp-form button{background:var(--gold);color:#fff;border:0;padding:13px;border-radius:2px;cursor:pointer;text-transform:uppercase;letter-spacing:.15em;font-size:.78rem;margin-top:6px;}
  .rsvp-form button:hover{background:var(--rose);}
  .rsvp-whatsapp{display:inline-block;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.15em;font-size:.75rem;font-weight:500;background:var(--beige);color:var(--brown);border:1px solid var(--rose);padding:12px 22px;border-radius:2px;text-decoration:none;margin-bottom:22px;}
  .rsvp-status{font-weight:bold;color:var(--sage);font-family:'Poppins',sans-serif;font-size:.85rem;margin-top:10px;display:block;}

  .dresscode{margin-top:36px;}
  .dresscode .ico-row{display:flex;justify-content:center;gap:22px;font-size:1.8rem;margin-bottom:8px;color:var(--rose);}
  .dresscode .lbl{font-family:'Poppins',sans-serif;letter-spacing:.2em;text-transform:uppercase;font-size:.75rem;color:var(--brown);font-weight:600;}
  .dresscode .val{font-family:'Poppins',sans-serif;letter-spacing:.1em;text-transform:uppercase;font-size:.8rem;color:var(--muted);margin-top:4px;}
  .te-esperamos{font-size:clamp(1.8rem,7vw,2.4rem);margin-top:34px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
  .gallery-item{position:relative;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--line);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,20,15,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  footer{text-align:center;padding:36px 20px 44px;font-family:'Poppins',sans-serif;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);background:var(--paper);}

  @media(max-width:380px){
    section{padding:36px 18px;}
    .floral{transform:scale(.8);}
  }
</style></head>
<body>
<div class="card">

  <div class="hero">
    <span class="floral tl">${roseCluster({ w: 120 })}</span>
    <span class="floral tr">${roseCluster({ w: 120, flip: true })}</span>
    <span class="label">Mis quince años</span>
    <svg class="tiara" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 50 L14 20 L32 38 L45 12 L60 34 L75 12 L88 38 L106 20 L112 50 Z" fill="none" stroke="#b7ab9c" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="16" r="4" fill="#b7ab9c"/>
      <line x1="8" y1="50" x2="112" y2="50" stroke="#b7ab9c" stroke-width="3"/>
    </svg>
    <h1>Mis XV Años</h1>
  </div>

  <div class="photo-section">
    <div class="photo-wrap"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}"></div>
    <span class="floral bl">${roseCluster({ w: 130, flop: true })}</span>
  </div>

  <section class="mensaje center">
    <p>${esc(d.mensaje)}</p>
    <div class="name-script script">${esc(d.nombre)}</div>
    <div class="padres-block">
      <span>Con la bendición de Dios y mis padres</span>
      <span class="names">${esc(d.padres)}</span>
      <span class="lbl">Tengo el honor de invitarte a celebrar</span>
      <b>Mis XV Años</b>
    </div>
    <div class="heart">&#10084;</div>
    <div class="month">${esc(mesNombre)} ${esc(String(anio))}</div>
    <div class="date-box">
      <span class="dow">${esc(diaSemana)}</span>
      <span class="day">${esc(diaNum)}</span>
      <span class="line"></span>
    </div>

    <div class="info-card">
      <div class="ev-label">Ceremonia</div>
      <div class="ev-time">${esc(d.horaCeremonia)}</div>
      <div class="ev-place">${esc(d.lugarCeremonia)}</div>
      <div class="ev-city">Los espero</div>
      ${mapaBtn}
    </div>
  </section>

  <section class="center">
    <div class="info-card">
      <div class="ev-label">Recepción</div>
      <div class="ev-time">${esc(d.horaFiesta)}</div>
      <div class="ev-place">${esc(d.lugarFiesta)}</div>
      ${mapaBtn}
    </div>
  </section>

  <div class="itinerary-wrap">
    <span class="floral bl" style="position:absolute;bottom:-10px;left:-18px;">${roseCluster({ w: 110, flop: true })}</span>
    <h2 class="section-title">Itinerario de actividades</h2>
    <div class="timeline">
      <div class="tl-item">
        <div class="ico">&#9962;</div>
        <div class="txt"><b>Ceremonia</b><span>${esc(d.lugarCeremonia)}</span></div>
        <div class="hora">${esc(d.horaCeremonia)}</div>
      </div>
      <div class="tl-item">
        <div class="ico">&#127881;</div>
        <div class="txt"><b>Recepción</b><span>${esc(d.lugarFiesta)}</span></div>
        <div class="hora">${esc(d.horaFiesta)}</div>
      </div>
      <div class="tl-item">
        <div class="ico">&#127942;</div>
        <div class="txt"><b>Baile y celebración</b><span>Toda la noche</span></div>
      </div>
    </div>
  </div>

  <section class="center">
    <h2 class="section-title">Cuenta regresiva</h2>
    ${cd.html}
  </section>

  <section class="center">
    <h2 class="section-title">Momentos</h2>
    ${gal.html}
  </section>

  <section class="confirm-wrap">
    <div class="icon-circle">&#128172;</div>
    <div class="ev-label" style="font-family:'Poppins',sans-serif;font-weight:600;letter-spacing:.15em;text-transform:uppercase;">Confirmación</div>
    <p>Por favor confirma tu asistencia lo antes posible</p>
    ${rsvp.html}

    <div class="dresscode">
      <div class="ico-row"><span>&#128085;</span><span>&#128090;</span></div>
      <div class="lbl">Vestimenta</div>
      <div class="val">${esc(d.dressCode)}</div>
    </div>

    <div class="te-esperamos script">¡Te esperamos!</div>
    <div class="divider">${sprig(90)}</div>
  </section>

  <footer>Con cariño, ${esc(d.nombre)} &#127804;</footer>

</div>
<script>
${cd.script}${gal.script}${rsvp.script}
</script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Bohemio Floral",
  summary: "Invitación boho romántica en tonos crema, blush y dorado, con rosas dibujadas a mano, tipografía caligráfica y bordes de papel rasgado.",
  accent: "#a9825a", accent2: "#8a9b6f", schema: xvSchema, sampleData, render,
};
