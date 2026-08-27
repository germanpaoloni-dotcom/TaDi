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
    "https://images.unsplash.com/photo-1765635648081-73f1e9e2189a?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80"
  ]
};

const STAR_CLIP = "clip-path:polygon(50% 0%,58% 18%,72% 5%,71% 25%,94% 24%,80% 42%,100% 50%,80% 58%,94% 76%,72% 75%,75% 95%,58% 82%,50% 100%,42% 82%,25% 95%,28% 75%,6% 76%,20% 58%,0% 50%,20% 42%,6% 24%,29% 25%,28% 5%,42% 18%);";

// Convierte "YYYY-MM-DD" en "24 de mayo de 2027" (mismo criterio que el
// resto de las tarjetas — no viene del widget compartido porque cada
// diseño lo combina con su propia tipografía/mayúsculas).
function formatFechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, day] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !day) return String(fechaISO);
  return `${day} de ${meses[m - 1]} de ${y}`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#ffcf00");
  const cd = countdownWidget(
    d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha,
    "cdComic"
  );
  const gal = galleryWidget(d.galeria, "galComic");
  const rsvp = rsvpWidget(d.__slug || "demo", {
    withGuests: true,
    withMenu: false,
    whatsapp: d.whatsapp
  });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const fechaLarga = formatFechaLarga(d.fecha);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡Súper cumple de ${esc(d.nombreChico)}!</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&family=Permanent+Marker&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<style>
:root{
  --ink:#101010;
  --black:#050505;
  --blue:#168fd0;
  --blue-deep:#0870ad;
  --red:#ed1c24;
  --red-deep:#bd1017;
  --yellow:${accent};
  --yellow-main:#ffcf00;
  --paper:#fffdf5;
  --white:#ffffff;
  --gray:#e9e9e9;
  --shadow:7px 7px 0 var(--ink);
}

*{box-sizing:border-box;}

html,body{
  margin:0;
  padding:0;
  overflow-x:hidden;
}

body{
  font-family:'Poppins','Segoe UI',Arial,sans-serif;
  color:var(--ink);
  background:
    radial-gradient(circle at 3px 3px, rgba(0,0,0,.17) 1.2px, transparent 1.5px) 0 0/10px 10px,
    var(--paper);
  border:10px solid var(--ink);
}

a{color:inherit;}

h1,h2,h3,.comic-font,.burst,.comic-label,.eyebrow,.panel-title,.hero-age,.action-btn{
  font-family:'Bangers','Arial Black',Impact,sans-serif;
  font-weight:400;
  letter-spacing:1px;
}

/* =========================================================
   COMIC TEXTURES
   ========================================================= */

.halftone-blue{
  background:
    radial-gradient(circle, rgba(255,255,255,.28) 1.2px, transparent 1.5px) 0 0/9px 9px,
    var(--blue);
}

.halftone-red{
  background:
    radial-gradient(circle, rgba(0,0,0,.18) 1.2px, transparent 1.5px) 0 0/9px 9px,
    var(--red);
}

.halftone-yellow{
  background:
    radial-gradient(circle, rgba(0,0,0,.12) 1.2px, transparent 1.5px) 0 0/9px 9px,
    var(--yellow-main);
}

.speed-lines{
  position:absolute;
  inset:-20%;
  pointer-events:none;
  opacity:.45;
  background:
    repeating-conic-gradient(
      from -12deg at 50% 35%,
      transparent 0deg 5deg,
      rgba(255,255,255,.55) 5.2deg 6deg,
      transparent 6.2deg 12deg
    );
  transform:rotate(-4deg);
}

.ink-lines{
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity:.6;
  background:
    linear-gradient(12deg,transparent 48%,rgba(0,0,0,.28) 49%,transparent 50%) 0 0/130px 90px,
    linear-gradient(-20deg,transparent 48%,rgba(0,0,0,.2) 49%,transparent 50%) 0 0/170px 120px;
}

.burst{
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  line-height:.9;
  text-transform:uppercase;
  border:4px solid var(--ink);
  color:var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  ${STAR_CLIP}
}

.burst-yellow{
  background:var(--yellow-main);
  color:var(--red);
}

.burst-red{
  background:var(--red);
  color:var(--yellow-main);
}

.burst-blue{
  background:var(--blue);
  color:var(--yellow-main);
}

/* =========================================================
   GENERAL LAYOUT
   ========================================================= */

.section{
  max-width:1120px;
  margin:0 auto;
  padding:42px 22px;
  position:relative;
}

.section.dark{
  max-width:none;
  background:
    radial-gradient(circle, rgba(255,255,255,.12) 1.3px, transparent 1.6px) 0 0/10px 10px,
    var(--blue-deep);
}

.section.dark .section-inner{
  max-width:1120px;
  margin:0 auto;
}

.panel{
  position:relative;
  background:var(--white);
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
  padding:28px;
}

.panel.yellow{background:var(--yellow-main);}
.panel.red{background:var(--red);color:#fff;}
.panel.blue{background:var(--blue);color:#fff;}

.panel.skew-left{transform:rotate(-.7deg);}
.panel.skew-right{transform:rotate(.7deg);}

.section-title{
  margin:0 0 25px;
  text-align:center;
  font-family:'Bangers','Arial Black',Impact,sans-serif;
  font-size:clamp(2rem,5vw,3.5rem);
  line-height:.95;
  text-transform:uppercase;
  color:var(--ink);
  -webkit-text-stroke:1px rgba(255,255,255,.5);
  text-shadow:3px 3px 0 rgba(0,0,0,.12);
}

.section.dark .section-title{
  color:var(--yellow-main);
  -webkit-text-stroke:1px var(--ink);
}

.section-tag{
  display:table;
  margin:0 auto 12px;
  padding:7px 15px;
  background:var(--ink);
  color:#fff;
  border:3px solid var(--white);
  font-family:'Bangers',Impact,sans-serif;
  font-size:1rem;
  text-transform:uppercase;
  transform:rotate(-2deg);
}

.cloud{
  position:relative;
  background:#fff;
  border:5px solid var(--ink);
  border-radius:42px;
  padding:24px 28px;
  box-shadow:6px 6px 0 var(--ink);
}

.cloud:before,
.cloud:after{
  content:"";
  position:absolute;
  background:#fff;
  border:4px solid var(--ink);
  border-radius:50%;
  z-index:-1;
}

.cloud:before{
  width:58px;
  height:58px;
  left:34px;
  bottom:-27px;
}

.cloud:after{
  width:38px;
  height:38px;
  left:82px;
  bottom:-20px;
}

/* =========================================================
   HERO / COMIC COVER
   ========================================================= */

.hero{
  position:relative;
  overflow:hidden;
  background:
    radial-gradient(circle at 50% 30%, rgba(255,255,255,.12), transparent 40%),
    var(--blue);
  border-bottom:7px solid var(--ink);
}

.hero-inner{
  position:relative;
  z-index:2;
  max-width:1120px;
  margin:0 auto;
  min-height:780px;
  padding:42px 28px 0;
}

.hero-masthead{
  position:relative;
  z-index:4;
  display:flex;
  justify-content:center;
}

.hero-alert{
  display:inline-block;
  padding:8px 18px;
  background:var(--yellow-main);
  border:4px solid var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  font-family:'Bangers',Impact,sans-serif;
  font-size:1.2rem;
  text-transform:uppercase;
  transform:rotate(-2deg);
}

.hero-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(280px,.75fr);
  align-items:center;
  gap:18px;
  margin-top:25px;
}

.hero-copy{
  position:relative;
  z-index:5;
}

.hero-title-box{
  position:relative;
  background:var(--paper);
  border:6px solid var(--ink);
  padding:30px 26px 28px;
  box-shadow:9px 9px 0 var(--ink);
  transform:rotate(-1.5deg);
}

.hero-title-box:after{
  content:"";
  position:absolute;
  right:-20px;
  bottom:-30px;
  width:70px;
  height:70px;
  background:var(--paper);
  border-right:6px solid var(--ink);
  border-bottom:6px solid var(--ink);
  transform:rotate(35deg);
}

.hero-mini{
  display:inline-block;
  padding:5px 13px;
  background:var(--yellow-main);
  border:3px solid var(--ink);
  font-family:'Bangers',Impact,sans-serif;
  font-size:1.05rem;
  text-transform:uppercase;
  transform:rotate(-2deg);
}

.hero-title{
  margin:10px 0 2px;
  font-family:'Luckiest Guy','Bangers',Impact,sans-serif;
  font-size:clamp(4rem,9vw,8.2rem);
  line-height:.78;
  text-transform:uppercase;
  color:var(--red);
  -webkit-text-stroke:5px var(--ink);
  paint-order:stroke fill;
  text-shadow:7px 7px 0 var(--yellow-main);
  word-break:break-word;
}

.hero-subtitle{
  display:inline-block;
  margin-top:18px;
  padding:9px 18px;
  background:var(--blue-deep);
  border:4px solid var(--ink);
  color:#fff;
  font-family:'Bangers',Impact,sans-serif;
  font-size:1.45rem;
  line-height:1;
  text-transform:uppercase;
  transform:rotate(1deg);
}

.hero-age{
  display:inline-flex;
  align-items:center;
  gap:8px;
  margin-top:18px;
  padding:8px 17px;
  background:#fff;
  border:4px solid var(--ink);
  box-shadow:4px 4px 0 var(--ink);
  font-size:2rem;
  color:var(--ink);
}

.hero-age strong{
  color:var(--red);
  font-size:2.5rem;
}

.hero-photo-wrap{
  position:relative;
  z-index:4;
  align-self:stretch;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:470px;
}

.hero-photo-frame{
  width:min(100%,440px);
  aspect-ratio:4/5;
  position:relative;
  overflow:hidden;
  border:7px solid var(--ink);
  box-shadow:10px 10px 0 var(--ink);
  transform:rotate(2deg);
  background:#0b3154;
}

.hero-photo-frame img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  filter:contrast(1.1) saturate(1.12);
}

.hero-photo-frame:after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle, rgba(255,255,255,.42) 1.3px, transparent 1.7px) 0 0/7px 7px;
  mix-blend-mode:overlay;
  opacity:.45;
  pointer-events:none;
}

.hero-edition{
  position:absolute;
  right:-24px;
  bottom:20px;
  z-index:7;
  width:120px;
  height:120px;
  padding:10px;
  flex-direction:column;
  gap:2px;
  font-family:'Bangers',Impact,sans-serif;
  font-size:.78rem;
  transform:rotate(9deg);
}

.hero-edition strong{
  display:block;
  font-family:'Luckiest Guy',Impact,sans-serif;
  font-size:2.5rem;
  line-height:.9;
  color:var(--red);
  -webkit-text-stroke:2px var(--ink);
}

.hero-burst{
  position:absolute;
  z-index:7;
  left:-15px;
  top:35%;
  width:145px;
  height:125px;
  font-size:1.65rem;
  transform:rotate(-9deg);
}

.hero-cloud{
  position:absolute;
  z-index:8;
  right:10%;
  top:15%;
  width:90px;
  height:55px;
  background:#fff;
  border:4px solid var(--ink);
  border-radius:50%;
  box-shadow:-25px 8px 0 -7px #fff, 25px 8px 0 -7px #fff;
}

.city{
  position:absolute;
  z-index:3;
  left:0;
  right:0;
  bottom:0;
  height:125px;
  background:var(--ink);
  clip-path:polygon(
    0 100%,0 55%,5% 55%,5% 35%,10% 35%,10% 65%,15% 65%,15% 20%,
    20% 20%,20% 50%,25% 50%,25% 30%,30% 30%,30% 70%,35% 70%,35% 42%,
    40% 42%,40% 60%,45% 60%,45% 25%,50% 25%,50% 55%,55% 55%,55% 35%,
    60% 35%,60% 68%,65% 68%,65% 45%,70% 45%,70% 15%,75% 15%,75% 55%,
    80% 55%,80% 30%,85% 30%,85% 62%,90% 62%,90% 38%,95% 38%,95% 52%,
    100% 52%,100% 100%
  );
}

.city:after{
  content:"";
  position:absolute;
  inset:25px 0 0;
  background:
    radial-gradient(circle at 8% 60%, var(--yellow-main) 0 3px, transparent 4px),
    radial-gradient(circle at 20% 45%, var(--yellow-main) 0 3px, transparent 4px),
    radial-gradient(circle at 35% 65%, var(--yellow-main) 0 3px, transparent 4px),
    radial-gradient(circle at 50% 35%, var(--yellow-main) 0 3px, transparent 4px),
    radial-gradient(circle at 65% 60%, var(--yellow-main) 0 3px, transparent 4px),
    radial-gradient(circle at 80% 45%, var(--yellow-main) 0 3px, transparent 4px),
    radial-gradient(circle at 92% 65%, var(--yellow-main) 0 3px, transparent 4px);
}

/* =========================================================
   EVENT + COUNTDOWN
   ========================================================= */

.event-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
}

.event-card{
  position:relative;
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
  padding:30px;
  overflow:hidden;
}

.event-card.yellow{background:var(--yellow-main);}
.event-card.red{background:var(--red);color:#fff;}

.event-card h3{
  margin:0 0 22px;
  font-size:2.5rem;
  line-height:.9;
  text-transform:uppercase;
}

.event-line{
  display:flex;
  align-items:flex-start;
  gap:13px;
  margin:15px 0;
  font-weight:800;
  font-size:1.05rem;
}

.event-icon{
  flex:0 0 34px;
  width:34px;
  height:34px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:3px solid var(--ink);
  background:#fff;
  font-size:1.1rem;
}

.action-btn{
  display:block;
  width:max-content;
  max-width:100%;
  margin:22px auto 0;
  padding:12px 24px;
  background:var(--blue);
  color:#fff;
  border:4px solid var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  text-decoration:none;
  text-transform:uppercase;
  font-size:1.25rem;
  cursor:pointer;
  transition:.12s ease;
}

.action-btn:hover{
  transform:translate(3px,3px);
  box-shadow:2px 2px 0 var(--ink);
}

.countdown-wrap{
  position:relative;
  padding:30px;
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
  background:
    radial-gradient(circle, rgba(0,0,0,.18) 1.3px, transparent 1.7px) 0 0/9px 9px,
    var(--red);
  overflow:hidden;
}

.countdown-wrap .comic-cloud{
  display:table;
  margin:-3px auto 24px;
  position:relative;
  background:#fff;
  border:5px solid var(--ink);
  border-radius:45px;
  padding:13px 25px;
  font-family:'Bangers',Impact,sans-serif;
  font-size:1.8rem;
  text-transform:uppercase;
}

.countdown{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
  position:relative;
  z-index:2;
}

.countdown div{
  min-width:0;
  padding:15px 8px 13px;
  text-align:center;
  background:#fff;
  border:5px solid var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  transform:rotate(-1deg);
}

.countdown div:nth-child(even){transform:rotate(1.5deg);}

.countdown .cd-num{
  display:block;
  font-family:'Bangers',Impact,sans-serif;
  font-size:clamp(2.2rem,5vw,4rem);
  line-height:.9;
  color:var(--blue);
  -webkit-text-stroke:1px var(--ink);
}

.countdown .cd-label{
  display:block;
  margin-top:8px;
  color:var(--ink);
  font-weight:800;
  font-size:.7rem;
  text-transform:uppercase;
}

/* =========================================================
   MESSAGE
   ========================================================= */

.message-comic{
  position:relative;
  padding:36px;
  background:
    radial-gradient(circle, rgba(255,255,255,.13) 1.3px, transparent 1.7px) 0 0/9px 9px,
    var(--blue);
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
}

.message-comic .cloud{
  max-width:850px;
  margin:0 auto;
  text-align:center;
  font-size:1.12rem;
  line-height:1.7;
}

.message-burst{
  position:absolute;
  right:-25px;
  top:-35px;
  width:105px;
  height:105px;
  font-size:1.2rem;
  transform:rotate(9deg);
}

/* =========================================================
   GALLERY
   ========================================================= */

.gallery-comic{
  position:relative;
  padding:28px;
  background:
    radial-gradient(circle, rgba(255,255,255,.16) 1.2px, transparent 1.6px) 0 0/9px 9px,
    var(--blue);
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
}

.gallery{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:15px;
}

.gallery-item{
  position:relative;
}

.gallery img{
  width:100%;
  height:220px;
  object-fit:cover;
  display:block;
  background:#fff;
  padding:8px;
  border:5px solid var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  cursor:pointer;
}

.gallery-item:nth-child(odd) img{transform:rotate(-2deg);}
.gallery-item:nth-child(even) img{transform:rotate(2deg);}

.gallery-item:after{
  content:"★";
  position:absolute;
  right:-7px;
  top:-14px;
  color:var(--yellow-main);
  font-size:2rem;
  -webkit-text-stroke:2px var(--ink);
}

.lightbox{
  display:none;
  position:fixed;
  inset:0;
  z-index:100;
  background:rgba(0,0,0,.92);
  align-items:center;
  justify-content:center;
  padding:25px;
}

.lightbox.open{display:flex;}

.lightbox img{
  max-width:92%;
  max-height:86%;
  border:6px solid var(--yellow-main);
  box-shadow:10px 10px 0 var(--ink);
}

.lightbox-close{
  position:absolute;
  top:18px;
  right:24px;
  color:#fff;
  font-size:3rem;
  font-weight:900;
  cursor:pointer;
}

/* =========================================================
   MISSION
   ========================================================= */

.mission-grid{
  display:grid;
  grid-template-columns:1.15fr .85fr;
  gap:18px;
  align-items:stretch;
}

.mission-card{
  position:relative;
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
  padding:30px;
  overflow:hidden;
}

.mission-card.yellow{background:var(--yellow-main);}
.mission-card.blue{background:var(--blue);color:#fff;}

.mission-list{
  list-style:none;
  margin:20px 0 0;
  padding:0;
}

.mission-list li{
  display:flex;
  align-items:center;
  gap:10px;
  margin:12px 0;
  font-weight:800;
}

.mission-list li:before{
  content:"★";
  color:var(--red);
  font-size:1.35rem;
  -webkit-text-stroke:1px var(--ink);
}

.mission-label{
  display:table;
  margin:25px auto 0;
  padding:12px 18px;
  background:var(--yellow-main);
  color:var(--ink);
  border:4px solid var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  font-size:1.05rem;
  text-align:center;
  text-transform:uppercase;
}

/* =========================================================
   SECRET IDENTITY GENERATOR
   ========================================================= */

.generator{
  position:relative;
  overflow:hidden;
  padding:32px;
  background:
    radial-gradient(circle, rgba(255,255,255,.13) 1.3px, transparent 1.7px) 0 0/9px 9px,
    var(--red);
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
}

.generator-inner{
  position:relative;
  z-index:2;
  max-width:900px;
  margin:0 auto;
}

.generator-cloud{
  display:table;
  margin:0 auto 22px;
  padding:12px 25px;
  background:#fff;
  border:5px solid var(--ink);
  border-radius:42px;
  font-family:'Bangers',Impact,sans-serif;
  font-size:1.8rem;
  text-transform:uppercase;
  box-shadow:5px 5px 0 var(--ink);
}

.generator-label{
  display:block;
  color:#fff;
  text-align:center;
  font-size:.82rem;
  font-weight:800;
  letter-spacing:1px;
  text-transform:uppercase;
  margin-bottom:8px;
}

.generator input{
  width:100%;
  padding:14px 16px;
  margin-bottom:13px;
  background:#fff;
  color:var(--ink);
  border:4px solid var(--ink);
  border-radius:0;
  font:700 1rem 'Poppins',sans-serif;
  outline:none;
}

.generator input:focus{
  box-shadow:0 0 0 4px var(--yellow-main);
}

.generator .action-btn{
  width:100%;
  background:var(--blue);
  margin-top:0;
}

.generator-screen{
  min-height:85px;
  margin-top:18px;
  padding:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  background:#050505;
  border:4px solid var(--ink);
  box-shadow:inset 0 0 0 3px var(--yellow-main);
}

.generator-result{
  position:relative;
  z-index:1;
  margin:0;
  font-family:'Bangers',Impact,sans-serif;
  font-size:clamp(2rem,6vw,3.4rem);
  line-height:.95;
  color:var(--yellow-main);
  text-transform:uppercase;
}

/* =========================================================
   RSVP
   ========================================================= */

.rsvp-shell{
  position:relative;
  padding:30px;
  background:
    radial-gradient(circle, rgba(0,0,0,.1) 1.3px, transparent 1.7px) 0 0/9px 9px,
    var(--yellow-main);
  border:5px solid var(--ink);
  box-shadow:var(--shadow);
}

.rsvp-shell:before{
  content:"";
  position:absolute;
  left:-22px;
  bottom:-32px;
  width:95px;
  height:80px;
  background:#fff;
  border:5px solid var(--ink);
  border-radius:50%;
  transform:rotate(-12deg);
}

.rsvp-shell .panel{
  max-width:900px;
  margin:0 auto;
}

.rsvp-form{
  display:flex;
  flex-direction:column;
  gap:15px;
}

.rsvp-form label{
  font-size:.8rem;
  font-weight:800;
  letter-spacing:.6px;
  text-transform:uppercase;
}

.rsvp-form input,
.rsvp-form select,
.rsvp-form textarea{
  width:100%;
  margin-top:5px;
  padding:12px;
  border:3px solid var(--ink);
  border-radius:0;
  background:#fff;
  color:var(--ink);
  font:500 1rem 'Poppins',sans-serif;
}

.rsvp-form button{
  background:var(--red);
  color:#fff;
  border:4px solid var(--ink);
  box-shadow:5px 5px 0 var(--ink);
  padding:14px;
  font:400 1.3rem 'Bangers',Impact,sans-serif;
  text-transform:uppercase;
  cursor:pointer;
}

.rsvp-form button:hover{
  transform:translate(3px,3px);
  box-shadow:2px 2px 0 var(--ink);
}

.rsvp-whatsapp{
  display:block;
  margin-top:18px;
  text-align:center;
  color:var(--blue-deep);
  font-weight:800;
  text-decoration:none;
}

.rsvp-status{
  text-align:center;
  font-weight:900;
  color:#15803d;
}

/* =========================================================
   DECORATIVE DIVIDERS / FOOTER
   ========================================================= */

.comic-divider{
  height:22px;
  background:var(--ink);
  position:relative;
}

.comic-divider:after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:0;
  height:22px;
  background:
    linear-gradient(135deg,var(--yellow-main) 25%,transparent 25%) 0 0/28px 28px,
    linear-gradient(225deg,var(--yellow-main) 25%,transparent 25%) 0 0/28px 28px;
}

footer{
  position:relative;
  overflow:hidden;
  padding:48px 22px 60px;
  text-align:center;
  color:#fff;
  background:
    radial-gradient(circle, rgba(255,255,255,.12) 1.3px, transparent 1.7px) 0 0/9px 9px,
    var(--blue-deep);
  border-top:6px solid var(--ink);
}

footer .footer-stars{
  color:var(--yellow-main);
  font-size:2rem;
  letter-spacing:8px;
  -webkit-text-stroke:2px var(--ink);
}

footer .footer-cloud{
  display:table;
  max-width:700px;
  margin:15px auto;
  padding:16px 25px;
  background:#fff;
  color:var(--ink);
  border:5px solid var(--ink);
  border-radius:42px;
  box-shadow:6px 6px 0 var(--ink);
  font-family:'Bangers',Impact,sans-serif;
  font-size:1.45rem;
  line-height:1.05;
  text-transform:uppercase;
}

footer p{
  margin:7px 0;
  font-size:.9rem;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media(max-width:850px){
  .hero-inner{
    min-height:auto;
    padding:35px 18px 135px;
  }

  .hero-layout{
    grid-template-columns:1fr;
  }

  .hero-copy{order:1;}
  .hero-photo-wrap{order:2;min-height:auto;}

  .hero-photo-frame{
    width:min(75vw,390px);
  }

  .hero-burst{
    left:3%;
    top:45%;
    width:105px;
    height:95px;
    font-size:1.1rem;
  }

  .event-grid,
  .mission-grid{
    grid-template-columns:1fr;
  }

  .gallery{
    grid-template-columns:repeat(2,1fr);
  }

  .gallery img{height:190px;}
}

@media(max-width:560px){
  body{border-width:7px;}

  .section{
    padding:32px 13px;
  }

  .panel,
  .event-card,
  .message-comic,
  .gallery-comic,
  .mission-card,
  .generator,
  .rsvp-shell,
  .countdown-wrap{
    padding:20px;
  }

  /* deja lugar arriba para que el botón fijo "← Volver" de la demo
     nunca quede pisando el cartel "¡Alerta de súper cumple!" */
  .hero-inner{
    padding:66px 12px 110px;
  }

  .hero-alert{
    font-size:1rem;
    padding:7px 14px;
  }

  .hero-title-box{
    padding:22px 16px;
  }

  .hero-title{
    font-size:clamp(3.4rem,18vw,5.5rem);
    -webkit-text-stroke:3px var(--ink);
    text-shadow:5px 5px 0 var(--yellow-main);
  }

  .hero-subtitle{
    font-size:1.1rem;
  }

  .hero-age{
    font-size:1.45rem;
  }

  .hero-age strong{
    font-size:2rem;
  }

  .hero-photo-frame{
    width:82vw;
  }

  .hero-edition{
    width:90px;
    height:90px;
    right:-5px;
    bottom:5px;
    padding:6px;
    font-size:.6rem;
  }

  .hero-edition strong{
    font-size:1.7rem;
  }

  .hero-burst{
    left:-5px;
    top:48%;
    width:85px;
    height:80px;
    font-size:.9rem;
  }

  .countdown{
    grid-template-columns:repeat(2,1fr);
  }

  .gallery{
    grid-template-columns:1fr 1fr;
    gap:10px;
  }

  .gallery img{
    height:145px;
    padding:5px;
    border-width:4px;
  }

  .message-burst{
    width:75px;
    height:75px;
    right:-10px;
    top:-22px;
    font-size:.85rem;
  }

  .section-title{
    font-size:2.2rem;
  }
}

@media(max-width:360px){
  .gallery{
    grid-template-columns:1fr;
  }

  .gallery img{
    height:220px;
  }

  .hero-title{
    font-size:3.1rem;
  }
}
</style>
</head>

<body>

<!-- =====================================================
     PORTADA / HERO
     ===================================================== -->
<header class="hero">
  <div class="speed-lines"></div>
  <div class="ink-lines"></div>

  <div class="hero-inner">
    <div class="hero-masthead">
      <span class="hero-alert">¡Alerta de súper cumple!</span>
    </div>

    <div class="hero-layout">

      <div class="hero-copy">
        <div class="hero-title-box">
          <span class="hero-mini">¡Súper cumple de!</span>

          <h1 class="hero-title">${esc(d.nombreChico)}</h1>

          <span class="hero-subtitle">¡Vení a ayudarnos a salvar el día!</span>

          <div class="hero-age">
            <span>EDICIÓN</span>
            <strong>#${esc(d.edad)}</strong>
            <span>AÑOS</span>
          </div>
        </div>
      </div>

      <div class="hero-photo-wrap">
        <div class="hero-photo-frame">
          <img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}">
        </div>

        <div class="hero-burst burst burst-yellow">¡BOOM!</div>

        <div class="hero-edition burst burst-yellow">
          EDICIÓN
          <strong>#${esc(d.edad)}</strong>
        </div>
      </div>

    </div>

    <div class="city"></div>
  </div>
</header>

<div class="comic-divider"></div>

<!-- =====================================================
     FECHA + CUENTA REGRESIVA
     ===================================================== -->
<section class="section">
  <div class="section-tag">★ ¡Te esperamos! ★</div>
  <h2 class="section-title">La misión tiene fecha</h2>

  <div class="event-grid">

    <div class="event-card yellow">
      <h3>📍 Coordenadas secretas</h3>

      <div class="event-line">
        <span class="event-icon">📅</span>
        <span>${esc(fechaLarga || d.fecha)}</span>
      </div>

      ${d.hora ? `<div class="event-line">
        <span class="event-icon">⏰</span>
        <span>${esc(d.hora)} hs</span>
      </div>` : ""}

      ${d.lugar ? `<div class="event-line">
        <span class="event-icon">★</span>
        <span>${esc(d.lugar)}</span>
      </div>` : ""}

      ${d.direccionMapa ? `<a class="action-btn" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver en el mapa →</a>` : ""}
    </div>

    <div class="countdown-wrap">
      <div class="comic-cloud">¡Faltan!</div>
      ${cd.html}
    </div>

  </div>
</section>

<!-- =====================================================
     MENSAJE
     ===================================================== -->
${d.mensaje ? `<section class="section dark">
  <div class="section-inner">
    <div class="section-tag">★ Transmisión especial ★</div>
    <h2 class="section-title">Mensaje de la liga</h2>

    <div class="message-comic">
      <div class="message-burst burst burst-yellow">¡WHAM!</div>
      <div class="cloud">${esc(d.mensaje)}</div>
    </div>
  </div>
</section>` : ""}

<!-- =====================================================
     MISIÓN / TEMÁTICA
     ===================================================== -->
<section class="section">
  <div class="section-tag">★ Prepará tu equipo ★</div>
  <h2 class="section-title">¿Qué vamos a tener?</h2>

  <div class="mission-grid">

    <div class="mission-card blue">
      <h3 class="comic-font" style="font-size:2.8rem;margin:0 0 12px;">¡No te lo pierdas!</h3>

      <ul class="mission-list">
        <li>Torta</li>
        <li>Juegos</li>
        <li>Misiones secretas</li>
        <li>Mucha diversión</li>
      </ul>

      ${d.tematica ? `<div class="mission-label">${esc(d.tematica)}</div>` : ""}
    </div>

    <div class="mission-card yellow">
      <div class="cloud" style="text-align:center;">
        <strong class="comic-font" style="font-size:2rem;">¡Código de vestimenta!</strong>
        <p style="margin:12px 0 0;font-weight:800;">
          Vení listo para activar tus superpoderes y formar parte de la aventura.
        </p>
      </div>
      <div class="burst burst-red" style="width:120px;height:105px;margin:30px auto 0;font-size:1.25rem;transform:rotate(-7deg);">
        ¡BANG!
      </div>
    </div>

  </div>
</section>

<!-- =====================================================
     GALERÍA
     ===================================================== -->
${d.galeria && d.galeria.length ? `<section class="section dark">
  <div class="section-inner">
    <div class="section-tag">★ Archivo secreto ★</div>
    <h2 class="section-title">Galería de aventuras</h2>

    <div class="gallery-comic">
      ${gal.html}
    </div>
  </div>
</section>` : ""}

<!-- =====================================================
     GENERADOR DE SUPERHÉROE
     ===================================================== -->
<section class="section">
  <div class="section-tag">★ Activá tus poderes ★</div>
  <h2 class="section-title">Descubrí tu identidad secreta</h2>

  <div class="generator">
    <div class="speed-lines"></div>

    <div class="generator-inner">
      <div class="generator-cloud">¿Cuál será tu nombre de superhéroe?</div>

      <label class="generator-label" for="heroNameInput">
        Ingresá tu nombre civil
      </label>

      <input
        type="text"
        id="heroNameInput"
        placeholder="Escribí tu nombre..."
        value="${esc(d.nombreChico)}"
      >

      <button type="button" class="action-btn" id="heroNameBtn">
        ⚡ ¡Activar poderes!
      </button>

      <div class="generator-screen">
        <p class="generator-result" id="heroNameResult"></p>
      </div>
    </div>
  </div>
</section>

<!-- =====================================================
     RSVP
     ===================================================== -->
<section class="section">
  <div class="section-tag">★ Última misión ★</div>
  <h2 class="section-title">Confirmá tu asistencia</h2>

  <div class="rsvp-shell">

    ${rsvpDeadline ? `<p style="position:relative;z-index:2;margin:-4px 0 22px;text-align:center;font-weight:800;text-transform:uppercase;">
      Confirmá antes del ${esc(rsvpDeadline)}
    </p>` : ""}

    <div class="panel skew-left">
      ${rsvp.html}
    </div>

  </div>
</section>

<div class="comic-divider"></div>

<footer>
  <div class="footer-stars">★ ★ ★</div>

  <div class="footer-cloud">
    ¡Te esperamos para vivir una aventura inolvidable junto a ${esc(d.nombreChico)}!
  </div>

  <p>Con súper cariño, la familia organizadora.</p>
</footer>

<script>
${cd.script}${gal.script}${rsvp.script}

(function(){
  var prefixes = [
    'Capitán','Súper','Increíble','Doctor','Comandante','Mega','Ultra','Turbo',
    'Fantástico','Asombroso','Poderoso','Invencible','Titán','Guardián','Centinela',
    'Vengador','Justiciero','Fenómeno','Explosivo','Cósmico','Eléctrico','Vigilante',
    'Veloz','Salvaje','Místico','Radiante','Temerario','Valiente','Heroico',
    'Legendario','Imparable','Estelar','Galáctico','Supremo','Indomable'
  ];

  var suffixes = [
    'Rayo','Cometa','Trueno','Fénix','Tornado','Estrella','Halcón','Cohete',
    'Tigre','Águila','Dragón','Pantera','Lobo','Cobra','Meteoro','Centella',
    'Titanio','Fantasma','Vórtice','Huracán','Relámpago','Bólido','Escarabajo',
    'Guepardo','Tempestad','Nova','Impacto','Puma','Corcel','Diamante','Sombra',
    'Vendaval','Cristal','Fulgor','Zafiro'
  ];

  var input = document.getElementById('heroNameInput');
  var btn = document.getElementById('heroNameBtn');
  var result = document.getElementById('heroNameResult');

  if(!btn || !input || !result) return;

  function generateHeroName(){
    var val = (input.value || '').trim() || 'Héroe';
    var seed = 0;

    for(var i = 0; i < val.length; i++){
      seed += val.charCodeAt(i);
    }

    seed += Math.floor(Math.random() * 10000);

    var p = prefixes[seed % prefixes.length];
    var s = suffixes[(seed * 7 + val.length) % suffixes.length];

    result.textContent = '¡' + p + ' ' + s + '!';
  }

  btn.addEventListener('click', generateHeroName);

  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      generateHeroName();
    }
  });
})();

(function(){
  // Nombres largos con el font-size fijo del título se cortaban a la mitad
  // de la palabra (ej. "BAUTIST" / "A"). Medimos la palabra más larga del
  // nombre y achicamos el título hasta que esa palabra entre en una sola
  // línea dentro de su caja (nombres de dos palabras siguen pudiendo
  // envolver entre palabras, eso sí se ve prolijo).
  var title = document.querySelector('.hero-title');
  var box = document.querySelector('.hero-title-box');
  if(!title || !box) return;

  var words = (title.textContent || '').trim().split(/\\s+/);
  var longest = words.reduce(function(a, b){ return b.length > a.length ? b : a; }, '');

  var measurer = document.createElement('span');
  measurer.style.position = 'absolute';
  measurer.style.visibility = 'hidden';
  measurer.style.whiteSpace = 'nowrap';
  measurer.style.left = '-9999px';
  measurer.style.top = '0';
  measurer.textContent = longest;
  document.body.appendChild(measurer);

  function fitTitle(){
    title.style.fontSize = '';
    var cs = getComputedStyle(title);
    measurer.style.fontFamily = cs.fontFamily;
    measurer.style.textTransform = cs.textTransform;
    measurer.style.letterSpacing = cs.letterSpacing;

    var maxWidth = box.clientWidth - 52;
    var size = parseFloat(cs.fontSize);
    measurer.style.fontSize = size + 'px';

    var guard = 0;
    while(measurer.scrollWidth > maxWidth && size > 28 && guard < 40){
      size -= 2;
      measurer.style.fontSize = size + 'px';
      guard++;
    }

    if(guard > 0) title.style.fontSize = size + 'px';
  }

  fitTitle();
  window.addEventListener('resize', fitTitle);
  // La tipografía cómic (Luckiest Guy) carga async por @font-face: si medimos
  // antes de que termine de cargar, el ancho se calcula con la fuente de
  // reemplazo (más angosta) y el ajuste queda mal. Reintentamos cuando el
  // navegador confirma que las fuentes ya están listas.
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(fitTitle).catch(function(){});
  }
})();
</script>

${tadiFooterWidget()}

</body>
</html>`;
}

function cardPreview(d) {
  return `<div style="
    position:absolute;inset:0;overflow:hidden;
    border:4px solid #101010;box-sizing:border-box;
    background:
      radial-gradient(circle,rgba(255,255,255,.18) 1.3px,transparent 1.6px) 0 0/8px 8px,
      #168fd0;
  ">
    <div style="
      position:absolute;left:8%;right:8%;top:12%;padding:8px;
      background:#fffdf5;border:4px solid #101010;
      transform:rotate(-2deg);box-shadow:4px 4px 0 #101010;
    ">
      <div style="
        font-family:'Arial Black',Impact,sans-serif;
        font-size:1.2rem;text-align:center;line-height:.9;
        color:#ed1c24;-webkit-text-stroke:1.5px #101010;
        text-shadow:2px 2px 0 #ffcf00;
      ">${esc((d.name || "SUPERHÉROES").toUpperCase())}</div>
      <div style="
        margin-top:5px;text-align:center;
        font-family:Arial,sans-serif;font-size:.48rem;
        font-weight:800;text-transform:uppercase;
      ">Invitación estilo cómic</div>
    </div>

    <div style="
      position:absolute;left:12%;bottom:16%;width:58%;height:35%;
      background:#0b3154;border:4px solid #101010;
      transform:rotate(2deg);
    "></div>

    <div style="
      position:absolute;right:7%;bottom:18%;width:48px;height:48px;
      display:flex;align-items:center;justify-content:center;
      background:#ffcf00;color:#ed1c24;
      border:3px solid #101010;
      font-family:'Arial Black',Impact,sans-serif;
      font-size:.55rem;text-align:center;
      clip-path:polygon(50% 0%,58% 18%,72% 5%,71% 25%,94% 24%,80% 42%,100% 50%,80% 58%,94% 76%,72% 75%,75% 95%,58% 82%,50% 100%,42% 82%,25% 95%,28% 75%,6% 76%,20% 58%,0% 50%,20% 42%,6% 24%,29% 25%,28% 5%,42% 18%);
    ">POW!</div>

    <div style="
      position:absolute;bottom:5%;left:8%;right:8%;
      font-family:'Arial Black',Impact,sans-serif;
      font-size:.48rem;color:#fff;text-align:center;
      text-transform:uppercase;
    ">BOOM • BANG • POW • ZAP</div>
  </div>`;
}

module.exports = {
  id,
  category: "infantiles",
  name: "Superhéroes",
  summary: "Invitación infantil estilo portada de cómic con viñetas, halftone, explosiones, foto protagonista, countdown, galería, generador de identidad secreta y RSVP.",
  accent: "#ed1c24",
  accent2: "#168fd0",
  schema: infantilSchema,
  sampleData,
  render,
  cardPreview
};
