const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

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
  const accent = getPaletteColor(d.colorPalette, "light", "#86a9d5");

  const cd = countdownWidget(
    d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha,
    "cd-cel"
  );
  const gal = galleryWidget(d.galeria, "gal-cel");
  const rsvp = rsvpWidget(d.__slug || "demo", {
    withGuests: true,
    withMenu: false,
    whatsapp: d.whatsapp
  });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fecha = d.fecha ? new Date(`${d.fecha}T00:00:00`) : null;
  const meses = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
  const dias = ["DOMINGO","LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES","SÁBADO"];
  const mesTxt = fecha ? meses[fecha.getMonth()] : "";
  const diaTxt = fecha ? dias[fecha.getDay()] : "";
  const diaNum = fecha ? fecha.getDate() : "";
  const anioTxt = fecha ? fecha.getFullYear() : "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#eef4fa">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
:root{
  --paper:#f8f6f1;
  --paper2:#eef4fa;
  --white:#ffffff;
  --ink:#34445c;
  --muted:#758398;
  --blue:${accent};
  --blue-dark:color-mix(in srgb, ${accent}, #263b57 42%);
  --blue-soft:#dce9f6;
  --sage:#91aa9d;
  --gold:#c8a45b;
  --gold-soft:#ead9ad;
  --line:rgba(52,68,92,.13);
  --shadow:0 16px 44px rgba(45,62,82,.10);
}
*{box-sizing:border-box}
html{overflow-x:hidden;scroll-behavior:smooth}
body{
  margin:0;
  overflow-x:hidden;
  color:var(--ink);
  background:#e8eef4;
  font-family:Georgia,"Times New Roman",serif;
}
.page{
  width:100%;
  max-width:640px;
  margin:0 auto;
  background:var(--paper);
  overflow:hidden;
  box-shadow:0 0 60px rgba(31,49,70,.12);
}
.section{
  position:relative;
  padding:54px 22px;
  text-align:center;
  overflow:hidden;
}
.section-inner{position:relative;z-index:2;max-width:540px;margin:auto}
.eyebrow{
  margin:0 0 10px;
  color:var(--gold);
  font:700 .58rem/1.2 Arial,sans-serif;
  letter-spacing:2.8px;
  text-transform:uppercase;
}
h2{
  margin:0;
  color:var(--blue-dark);
  font-size:1.62rem;
  font-weight:400;
  line-height:1.18;
}
.rule{
  width:62px;
  height:1px;
  margin:16px auto 0;
  background:var(--gold);
  opacity:.72;
}
.script{
  font-family:"Brush Script MT","Segoe Script","Lucida Handwriting",cursive;
}

/* HERO: impacto inmediato en pantalla de celular */
.hero{
  min-height:720px;
  padding:28px 20px 42px;
  display:flex;
  align-items:flex-end;
  background:var(--paper);
}
.hero:before{
  content:"";
  position:absolute;
  inset:0;
  z-index:1;
  background:
    linear-gradient(180deg,rgba(25,42,60,.03) 25%,rgba(25,42,60,.16) 58%,rgba(25,42,60,.68) 100%);
  pointer-events:none;
}
.hero-photo{
  position:absolute;
  inset:0;
  z-index:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
}
.hero-top{
  position:absolute;
  z-index:4;
  top:22px;
  left:20px;
  right:20px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.hero-pill{
  padding:9px 12px;
  border:1px solid rgba(255,255,255,.55);
  border-radius:999px;
  color:#fff;
  background:rgba(255,255,255,.14);
  backdrop-filter:blur(10px);
  font:700 .55rem/1 Arial,sans-serif;
  letter-spacing:1.8px;
  text-transform:uppercase;
}
.hero-cross{color:#fff}
.hero-content{
  position:relative;
  z-index:3;
  width:100%;
  color:#fff;
}
.hero-content .eyebrow{color:#f5e2b2}
.hero-script{
  margin:0;
  color:#fff;
  font-size:clamp(2.5rem,11vw,4rem);
  line-height:.95;
  text-shadow:0 5px 22px rgba(0,0,0,.22);
}
.hero h1{
  margin:4px 0 0;
  color:#fff;
  font-size:clamp(3.1rem,14vw,5.2rem);
  line-height:.88;
  font-weight:400;
  letter-spacing:-1.5px;
  text-shadow:0 6px 28px rgba(0,0,0,.25);
}
.hero-sub{
  max-width:420px;
  margin:18px auto 0;
  color:rgba(255,255,255,.92);
  font-size:.88rem;
  line-height:1.7;
}
.hero-meta{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  margin-top:20px;
  color:#fff;
  font:700 .58rem/1.3 Arial,sans-serif;
  letter-spacing:1.5px;
  text-transform:uppercase;
}
.hero-meta .dot{
  width:4px;height:4px;border-radius:50%;background:var(--gold-soft)
}

/* INTRO */
.intro{background:var(--paper)}
.botanical{position:absolute;pointer-events:none}
.intro .botanical{right:-30px;top:-20px;opacity:.72}
.seal{display:block;margin:0 auto 10px;color:var(--gold)}
.quote{
  max-width:440px;
  margin:24px auto 0;
  color:var(--muted);
  font-size:.96rem;
  line-height:1.85;
  font-style:italic;
}
.names{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:12px;
  max-width:470px;
  margin:30px auto 0;
}
.name-block{position:relative}
.name-block:before{
  content:"";
  position:absolute;
  top:50%;
  left:0;
  right:0;
  height:1px;
  background:var(--line);
  z-index:-1;
}
.name-block strong{
  display:inline-block;
  padding-right:10px;
  background:var(--paper);
  color:var(--gold);
  font:700 .58rem/1.3 Arial,sans-serif;
  letter-spacing:1.8px;
  text-transform:uppercase;
}
.name-block span{
  display:block;
  margin-top:6px;
  color:var(--ink);
  font-size:.9rem;
  line-height:1.4;
}
.name-cross{color:var(--gold)}
.date-card{
  max-width:390px;
  margin:34px auto 0;
  padding:22px 16px 24px;
  border:1px solid rgba(134,169,213,.22);
  border-radius:24px;
  background:linear-gradient(145deg,#fff 0%,#f0f5fa 100%);
  box-shadow:var(--shadow);
}
.date-month{
  color:var(--muted);
  font:700 .6rem/1 Arial,sans-serif;
  letter-spacing:3px;
}
.date-row{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:13px;
  margin-top:11px;
}
.date-row .line{width:36px;height:1px;background:var(--gold);opacity:.7}
.date-day-name,.date-year{
  color:var(--muted);
  font:700 .55rem/1 Arial,sans-serif;
  letter-spacing:1.6px;
}
.date-num{color:var(--blue-dark);font-size:2.9rem;line-height:.9}

/* EVENTOS */
.event-section{background:var(--paper2)}
.event-grid{display:grid;gap:13px;margin-top:28px}
.event-card{
  padding:23px 18px;
  border:1px solid rgba(134,169,213,.22);
  border-radius:22px;
  background:rgba(255,255,255,.84);
  box-shadow:0 12px 30px rgba(52,68,92,.07);
}
.event-label{
  color:var(--gold);
  font:700 .58rem/1 Arial,sans-serif;
  letter-spacing:2.2px;
  text-transform:uppercase;
}
.event-time{margin:9px 0 4px;color:var(--ink);font-size:1.12rem}
.event-name{
  margin:0;
  color:var(--ink);
  font:700 .7rem/1.3 Arial,sans-serif;
  letter-spacing:1.8px;
  text-transform:uppercase;
}
.event-place{
  margin:8px 0 0;
  color:var(--muted);
  font-size:.88rem;
  line-height:1.5;
}
.btn-ubicacion{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:44px;
  margin-top:15px;
  padding:0 20px;
  border-radius:999px;
  background:var(--blue-dark);
  color:#fff;
  text-decoration:none;
  box-shadow:0 8px 20px rgba(52,68,92,.16);
  font:700 .57rem/1 Arial,sans-serif;
  letter-spacing:1.8px;
  text-transform:uppercase;
}
.vestimenta{margin-top:27px}
.vestimenta h3{
  margin:0 0 7px;
  color:var(--gold);
  font:700 .58rem/1 Arial,sans-serif;
  letter-spacing:2px;
  text-transform:uppercase;
}
.vestimenta p{margin:0;color:var(--muted);font-size:.82rem;letter-spacing:1px;text-transform:uppercase}

/* COUNTDOWN */
.countdown-section{background:var(--paper)}
.countdown-wrap{margin-top:25px}
.countdown{
  display:grid !important;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:7px;
  width:100%;
}
.countdown div{
  min-width:0 !important;
  padding:14px 5px !important;
  border:1px solid var(--line);
  border-radius:17px !important;
  background:#fff !important;
  box-shadow:none !important;
}
.cd-num{color:var(--blue-dark) !important;font-size:1.38rem !important}
.cd-label{
  margin-top:3px;
  color:var(--muted) !important;
  font-size:.5rem !important;
  letter-spacing:1.2px !important;
}

/* GALERÍA */
.gallery-section{background:#edf3f8}
.gallery{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
  margin-top:28px;
}
.gallery-item{overflow:hidden;border-radius:18px}
.gallery-item img{
  display:block;
  width:100%;
  height:170px;
  object-fit:cover;
  border-radius:18px !important;
  box-shadow:0 10px 24px rgba(52,68,92,.11) !important;
}
.gallery-item:first-child{grid-column:span 2}
.gallery-item:first-child img{height:240px}
.lightbox{
  display:none;
  position:fixed;
  inset:0;
  z-index:200;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:rgba(29,42,58,.94) !important;
}
.lightbox.open{display:flex}
.lightbox img{max-width:92%;max-height:88%;border-radius:12px !important}
.lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.4rem;cursor:pointer}

/* RSVP */
.confirm-section{background:var(--paper)}
.confirm-card{
  margin-top:26px;
  padding:26px 17px 21px;
  border:1px solid var(--line);
  border-radius:24px;
  background:#fff;
  box-shadow:var(--shadow);
}
.confirm-note{
  max-width:390px;
  margin:0 auto 19px;
  color:var(--muted);
  font-size:.85rem;
  line-height:1.7;
}
.rsvp-form{
  max-width:100% !important;
  gap:12px !important;
}
.rsvp-form label{
  color:var(--blue-dark) !important;
  font:700 .58rem/1.2 Arial,sans-serif !important;
  letter-spacing:1.5px !important;
}
.rsvp-form input,.rsvp-form select,.rsvp-form textarea{
  width:100%;
  margin-top:5px;
  padding:13px !important;
  border:1px solid rgba(52,68,92,.13) !important;
  border-radius:13px !important;
  background:#fbfcfd !important;
  color:var(--ink) !important;
}
.rsvp-form button{
  min-height:48px;
  border:0;
  border-radius:999px !important;
  background:var(--blue-dark) !important;
  color:#fff;
  font-weight:700 !important;
  letter-spacing:1.7px;
}
.rsvp-whatsapp{color:var(--blue-dark) !important}

/* FOOTER */
.footer{
  position:relative;
  overflow:hidden;
  padding:60px 22px 72px;
  text-align:center;
  background:linear-gradient(145deg,#91afd0 0%,#536b88 100%);
}
.footer .botanical{left:-35px;bottom:-30px;opacity:.28}
.footer .foot-inner{position:relative;z-index:2;max-width:470px;margin:auto}
.footer .seal{color:#f0dba9}
.footer p{margin:0;color:rgba(255,255,255,.84);font-size:.82rem}
.footer .script{display:block;margin-top:7px;color:#fff;font-size:2.5rem}
.footer .small{
  margin-top:15px;
  color:#f2dfb3;
  font:700 .52rem/1.3 Arial,sans-serif;
  letter-spacing:1.8px;
  text-transform:uppercase;
}

/* ANIMACIONES SUTILES: balanceo de hortensias, brillo dorado en la cruz
   y nubecitas/plumitas flotando lentísimo en el hero (tema angelical). */
.hydrangea{
  animation:hortensiaSway 8s ease-in-out infinite;
  transform-origin:50% 55%;
}
.hero-cross .hydrangea{animation-delay:.4s}
.name-cross .hydrangea{animation-delay:1.1s}
.intro .botanical .hydrangea{animation-delay:.8s}
.footer .botanical .hydrangea{animation-delay:1.6s}
.seal{animation:cruzBrillo 6s ease-in-out infinite}
@keyframes hortensiaSway{
  0%,100%{transform:rotate(-1.6deg)}
  50%{transform:rotate(1.6deg)}
}
@keyframes cruzBrillo{
  0%,100%{filter:brightness(1)}
  50%{filter:brightness(1.22)}
}
.hero-clouds{
  position:absolute;
  inset:0;
  z-index:2;
  overflow:hidden;
  pointer-events:none;
}
.cloud{
  position:absolute;
  border-radius:50%;
  background:rgba(255,255,255,.62);
  filter:blur(.3px);
  animation:nubeFlotar 20s ease-in-out infinite;
}
.cloud-a{
  top:16%;left:13%;width:20px;height:7px;
  box-shadow:9px -3px 0 -1px rgba(255,255,255,.5),-8px -2px 0 -2px rgba(255,255,255,.4);
  animation-duration:19s;
}
.cloud-b{
  top:27%;right:15%;width:16px;height:6px;
  box-shadow:7px -2px 0 -1px rgba(255,255,255,.45);
  animation-duration:23s;
  animation-delay:3s;
}
.cloud-c{
  top:9%;left:52%;width:13px;height:5px;
  box-shadow:6px -2px 0 -1px rgba(255,255,255,.4);
  animation-duration:26s;
  animation-delay:6s;
}
@keyframes nubeFlotar{
  0%,100%{transform:translate(0,0);opacity:.55}
  50%{transform:translate(7px,-15px);opacity:.85}
}

@media (max-width:430px){
  .hero{min-height:680px}
  /* deja lugar arriba para que el botón fijo "← Volver" de la demo no
     quede pisando el cartel "Un día para recordar" */
  .hero-top{top:64px}
  .section{padding:50px 19px}
  .gallery-item img{height:155px}
  .gallery-item:first-child img{height:215px}
}
@media (prefers-reduced-motion:reduce){
  *{scroll-behavior:auto!important;transition:none!important;animation:none!important}
}
</style>
</head>
<body>
<div class="page">

<section class="section hero">
  ${d.coverImage ? `<img class="hero-photo" src="${esc(d.coverImage)}" alt="Foto de ${esc(d.nombreChico)}">` : ""}
  <div class="hero-clouds" aria-hidden="true">
    <span class="cloud cloud-a"></span>
    <span class="cloud cloud-b"></span>
    <span class="cloud cloud-c"></span>
  </div>
  <div class="hero-top">
    <div class="hero-pill">Un día para recordar</div>
    <div class="hero-cross">${hydrangeaSvg(28,28)}</div>
  </div>
  <div class="hero-content">
    <p class="eyebrow">Con mucha alegría te invitamos</p>
    <p class="hero-script script">Mi Bautizo</p>
    <h1>${esc(d.nombreChico)}</h1>
    <p class="hero-sub">Una celebración llena de amor, familia y bendiciones para compartir juntos.</p>
    ${fecha ? `<div class="hero-meta">
      <span>${esc(diaTxt)}</span><i class="dot"></i><span>${esc(diaNum)} ${esc(mesTxt)}</span><i class="dot"></i><span>${esc(anioTxt)}</span>
    </div>` : ""}
  </div>
</section>

<section class="section intro">
  <div class="botanical">${hydrangeaSvg(135,135)}</div>
  <div class="section-inner">
    <svg class="seal" width="58" height="58" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="36" cy="36" r="29" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="36" cy="36" r="24" fill="none" stroke="currentColor" stroke-width=".7" opacity=".6"/>
      <path d="M33 17h6v14h12v6H39v18h-6V37H21v-6h12V17z" fill="currentColor"/>
    </svg>
    <p class="eyebrow">Una bendición muy especial</p>
    <h2>Con amor queremos compartir este momento</h2>
    <div class="rule"></div>
    ${d.mensaje ? `<p class="quote">${esc(d.mensaje)}</p>` : ""}
    ${d.padres || d.padrinos ? `<div class="names">
      <div class="name-block">${d.padres ? `<strong>Mis papás</strong><span>${esc(d.padres)}</span>` : ""}</div>
      <div class="name-cross">${hydrangeaSvg(24,24)}</div>
      <div class="name-block">${d.padrinos ? `<strong>Mis padrinos</strong><span>${esc(d.padrinos)}</span>` : ""}</div>
    </div>` : ""}
    ${fecha ? `<div class="date-card">
      <div class="date-month">${esc(mesTxt)}</div>
      <div class="date-row">
        <span class="date-day-name">${esc(diaTxt)}</span>
        <span class="line"></span>
        <span class="date-num">${esc(diaNum)}</span>
        <span class="line"></span>
        <span class="date-year">${esc(anioTxt)}</span>
      </div>
    </div>` : ""}
  </div>
</section>

<section class="section event-section">
  <div class="section-inner">
    <p class="eyebrow">El gran día</p>
    <h2>Ceremonia y celebración</h2>
    <div class="rule"></div>
    <div class="event-grid">
      ${d.horaCeremonia || d.lugarCeremonia ? `<article class="event-card">
        <div class="event-label">Ceremonia</div>
        ${d.horaCeremonia ? `<div class="event-time">${esc(d.horaCeremonia)} hs</div>` : ""}
        <p class="event-name">Iglesia</p>
        ${d.lugarCeremonia ? `<p class="event-place">${esc(d.lugarCeremonia)}</p>` : ""}
        ${d.direccionMapa ? `<a class="btn-ubicacion" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </article>` : ""}
      ${d.horaFiesta || d.lugarFiesta ? `<article class="event-card">
        <div class="event-label">Celebración</div>
        ${d.horaFiesta ? `<div class="event-time">${esc(d.horaFiesta)} hs</div>` : ""}
        <p class="event-name">Recepción</p>
        ${d.lugarFiesta ? `<p class="event-place">${esc(d.lugarFiesta)}</p>` : ""}
        ${d.direccionMapa ? `<a class="btn-ubicacion" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </article>` : ""}
    </div>
    <div class="vestimenta">
      <h3>Vestimenta</h3>
      <p>Formal</p>
    </div>
  </div>
</section>

<section class="section countdown-section">
  <div class="section-inner">
    <p class="eyebrow">Cuenta regresiva</p>
    <h2>Falta muy poquito</h2>
    <div class="rule"></div>
    <div class="countdown-wrap">${cd.html}</div>
  </div>
</section>

${d.galeria && d.galeria.length ? `<section class="section gallery-section">
  <div class="section-inner">
    <p class="eyebrow">Nuestros momentos</p>
    <h2>Recuerdos para guardar</h2>
    <div class="rule"></div>
    ${gal.html}
  </div>
</section>` : ""}

<section class="section confirm-section">
  <div class="section-inner">
    <p class="eyebrow">Nos encantaría contar con vos</p>
    <h2>Confirmá tu asistencia</h2>
    <div class="rule"></div>
    <div class="confirm-card">
      <p class="confirm-note">Tu confirmación nos ayuda a preparar cada detalle de este día tan especial.</p>
      ${rsvpDeadline ? `<p style="margin:0 0 17px;color:var(--gold);font:700 .55rem/1.4 Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;">Responder antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>
</section>

<footer class="footer">
  <div class="botanical">${hydrangeaSvg(135,135)}</div>
  <div class="foot-inner">
    <svg class="seal" width="58" height="58" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="36" cy="36" r="29" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="36" cy="36" r="24" fill="none" stroke="currentColor" stroke-width=".7" opacity=".6"/>
      <path d="M33 17h6v14h12v6H39v18h-6V37H21v-6h12V17z" fill="currentColor"/>
    </svg>
    <p>Esperamos contar con tu presencia</p>
    <span class="script">¡Muchas gracias!</span>
    <div class="small">${esc(d.nombreChico)} · Mi Bautizo</div>
  </div>
</footer>

</div>
<script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body>
</html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:linear-gradient(145deg,${d.accent || "#86a9d5"} 0%,${d.accent2 || "#c8a45b"} 130%);">
    <div style="position:absolute;inset:9px;border:1px solid rgba(255,255,255,.7);border-radius:13px;"></div>
    <div style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:1.4rem;color:#fff;line-height:1;">Mi Bautizo</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:1.05rem;color:#fff;line-height:1.1;">${esc(d.name)}</div>
    <div style="width:38px;height:1px;background:#f2dfb3;margin-top:4px;"></div>
    <div style="font:700 .45rem/1 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#eef4fa;">Un día para recordar</div>
  </div>`;
}
module.exports = {
  id, category: "bautismos", name: "Celeste Angelical",
  summary: "Blanco y celeste con hortensias delicadas, cruz dorada y tipografía clásica — inspirada en tarjetas de bautismo elegantes y luminosas.",
  accent: "#5c74a6", accent2: "#c9a24d", schema: bautismoSchema, sampleData, render, cardPreview,
};
