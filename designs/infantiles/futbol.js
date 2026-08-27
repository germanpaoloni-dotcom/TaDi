const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-futbol";

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

const sampleData = {
  nombreChico: "Thiago",
  edad: "8",
  fecha: "2027-05-24",
  hora: "16:00",
  lugar: "Cancha 3 - Complejo Deportivo Sur, Rosario",
  direccionMapa: "https://maps.google.com/?q=Complejo+Deportivo+Sur+Rosario",
  mensaje: "¡Armamos un partidazo! Vení con los botines puestos a jugar un picadito y después nos quedamos a comer algo rico entre todos. La numeración de la camiseta se define en la cancha.",
  tematica: "Vení con la camiseta de tu equipo favorito",
  whatsapp: "5491100000015",
  coverImage: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#d6a72c");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-fut");
  const gal = galleryWidget(d.galeria, "gal-fut");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const fechaLarga = formatFechaLarga(d.fecha);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}! Partido de cumple</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
 --navy:#071827;--navy2:#0d263b;--green:#0e6b36;--green2:#178345;
 --gold:${accent};--gold2:#f0c44b;--cream:#f5efe0;--cream2:#fffaf0;
 --white:#fff;--muted:#aebdca;--line:rgba(255,255,255,.16);--ink:#0b1d2d;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--navy);color:var(--white);font-family:'Barlow Condensed','Arial Narrow',Arial,sans-serif;overflow-x:hidden}
img{max-width:100%}
a{text-decoration:none}
h1,h2,h3,p{margin:0}
.page{max-width:980px;margin:0 auto;background:var(--navy);overflow:hidden;box-shadow:0 0 80px rgba(0,0,0,.35)}
.grain{pointer-events:none;position:fixed;inset:0;z-index:100;background-image:radial-gradient(rgba(255,255,255,.055) .7px,transparent .7px);background-size:5px 5px;opacity:.22}
.kicker{font-size:.75rem;letter-spacing:3px;text-transform:uppercase;font-weight:800;color:var(--gold2)}
.brush{display:inline-block;padding:6px 18px;background:var(--green);color:#fff;clip-path:polygon(2% 16%,96% 0,100% 78%,5% 100%,0 48%);font-weight:800;text-transform:uppercase;letter-spacing:1px;transform:rotate(-1deg)}
.gold-rule{height:3px;background:linear-gradient(90deg,transparent,var(--gold2),transparent);width:100%;margin:14px 0}

/* HERO */
.hero{position:relative;min-height:760px;padding:58px 34px 42px;display:grid;grid-template-columns:1.02fr .98fr;gap:28px;align-items:center;
 background:
 radial-gradient(circle at 80% 18%,rgba(255,255,255,.22),transparent 2px),
 radial-gradient(circle at 15% 20%,rgba(255,255,255,.16),transparent 2px),
 linear-gradient(180deg,#0b2740 0%,#061725 58%,#0a3a23 58%,#0c6b35 100%);
}
.hero:before{content:"";position:absolute;inset:0;opacity:.22;background-image:linear-gradient(105deg,transparent 0 46%,rgba(255,255,255,.22) 47%,transparent 48%);background-size:120px 120px}
.stadium-lights{position:absolute;top:20px;left:0;right:0;height:70px;background:repeating-linear-gradient(90deg,transparent 0 35px,rgba(255,255,255,.18) 36px 38px,transparent 39px 72px);filter:blur(.2px);opacity:.7}
.hero-copy,.hero-card{position:relative;z-index:2}
.hero-copy{padding:20px 0 0;min-width:0}
.hero-copy .brush{font-size:1.05rem;margin-bottom:18px}
.hero h1{font-family:'Anton','Impact',sans-serif;font-size:clamp(4.5rem,12vw,8rem);line-height:.84;letter-spacing:1px;text-transform:uppercase;text-shadow:8px 8px 0 rgba(0,0,0,.38)}
.hero h1 .hero-name{display:inline-block;max-width:100%}
.hero h1 .hero-age-line{display:block;color:var(--gold2);font-size:.64em;font-style:italic;margin-top:14px;text-shadow:5px 5px 0 #513a0b}
.hero-sub{font-size:1.35rem;font-weight:700;text-transform:uppercase;letter-spacing:1.4px;margin-top:22px;max-width:500px}
.hero-sub b{color:var(--gold2)}
.hero-ball{font-size:5rem;display:block;transform:rotate(-12deg);filter:drop-shadow(8px 10px 0 rgba(0,0,0,.3));margin:12px 0 0 48%}
.hero-card{justify-self:end;width:min(100%,390px);transform:rotate(2.2deg);filter:drop-shadow(16px 20px 0 rgba(0,0,0,.35))}
.player-card{background:linear-gradient(145deg,#172d40,#06121d);border:8px solid #e8e2d4;padding:8px;position:relative;overflow:hidden}
.player-card:before{content:"";position:absolute;inset:8px;border:1px solid rgba(255,255,255,.22);pointer-events:none}
.player-card:after{content:"";position:absolute;width:170%;height:70px;left:-35%;top:42%;transform:rotate(-25deg);background:rgba(255,255,255,.08);pointer-events:none}
.player-top{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 10px 8px}
.edition{font-size:.72rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold2);font-weight:800}
.jersey{background:#050b11;color:#fff;border:3px solid var(--gold2);padding:4px 11px;font-family:'Anton',sans-serif;font-size:2.2rem;line-height:1}
.player-photo{aspect-ratio:4/4.8;background:#162b3d;overflow:hidden;border:2px solid rgba(255,255,255,.2)}
.player-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.05) contrast(1.08)}
.card-name{font-family:'Anton','Impact',sans-serif;font-size:2.4rem;text-transform:uppercase;letter-spacing:1px;padding:12px 10px 2px}
.card-meta{display:flex;justify-content:space-between;align-items:center;padding:0 10px 13px;color:var(--gold2);font-size:.78rem;text-transform:uppercase;font-weight:800;letter-spacing:1px}
.badge{width:54px;height:54px;border:2px solid var(--gold2);border-radius:50%;display:grid;place-items:center;font-size:1.55rem;background:#08131f}
.hero-bottom{position:absolute;bottom:0;left:0;right:0;background:rgba(4,13,21,.9);border-top:2px solid var(--gold2);padding:12px 30px;display:flex;justify-content:center;gap:35px;text-transform:uppercase;font-weight:800;letter-spacing:1.2px;font-size:.82rem}
.hero-bottom span:nth-child(2){color:var(--gold2)}
@media(max-width:760px){.hero{grid-template-columns:1fr;text-align:center;padding:54px 20px 70px;min-height:auto}.hero-copy{padding-top:20px}.hero-sub{margin:18px auto 0}.hero-ball{margin:8px 0 0}.hero-card{justify-self:center;width:min(92vw,360px)}.hero-bottom{gap:14px;flex-wrap:wrap;font-size:.72rem}}

/* GENERAL SECTIONS */
.section{position:relative;padding:58px 28px;background:var(--navy)}
.section.cream{background:var(--cream);color:var(--ink)}
.section.green{background:linear-gradient(135deg,#0a4d29,#0f793e);color:#fff}
.section-title{font-family:'Anton','Impact',sans-serif;text-transform:uppercase;font-size:2.45rem;line-height:1;text-align:center;letter-spacing:.8px}
.section-title span{color:var(--gold2)}
.section-intro{text-align:center;max-width:680px;margin:10px auto 28px;font-size:1.05rem;font-weight:500}
.section-head{max-width:860px;margin:0 auto 28px}
.stadium-divider{max-width:860px;height:10px;margin:0 auto 30px;background:repeating-linear-gradient(90deg,var(--gold2) 0 12px,transparent 12px 22px)}

/* COUNTDOWN */
.count-wrap{max-width:860px;margin:0 auto}
.count-label{text-align:center;font-size:1rem;text-transform:uppercase;letter-spacing:2px;font-weight:800;color:var(--muted);margin-bottom:14px}
.countdown{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.countdown div{background:#050d15;border:1px solid #3b4d5c;border-bottom:4px solid var(--gold2);padding:18px 8px;text-align:center;box-shadow:inset 0 0 25px rgba(255,255,255,.035)}
.cd-num{display:block;font-family:'Anton','Impact',sans-serif;font-size:2.7rem;line-height:1;color:#fff}
.cd-label{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold2);margin-top:6px;font-weight:800}
@media(max-width:560px){.countdown{grid-template-columns:repeat(2,1fr)}}

/* MATCH INFO */
.match-grid{max-width:860px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:18px}
.panel{padding:25px;background:var(--cream2);color:var(--ink);border:1px solid #c9bfa8;box-shadow:8px 8px 0 rgba(0,0,0,.18);position:relative}
.panel:before{content:"";position:absolute;inset:8px;border:1px dashed #c5b99f;pointer-events:none}
.panel>*{position:relative}
.panel h3{font-family:'Anton',sans-serif;font-size:1.65rem;text-transform:uppercase;margin-bottom:12px}
.match-message{font-size:1.1rem;line-height:1.45;font-weight:500}
.program{display:grid;gap:10px}
.program .step{display:grid;grid-template-columns:42px 1fr;align-items:center;gap:9px}
.program .ico{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--navy);color:var(--gold2);font-size:1.1rem}
.program strong{display:block;text-transform:uppercase;font-size:.68rem;letter-spacing:1.5px;color:#557}
.program span{font-size:1rem;font-weight:700}
.tematica-box{margin-top:18px;padding:10px 14px;background:var(--gold2);color:var(--ink);font-weight:800;text-transform:uppercase;display:inline-block;transform:rotate(-1deg)}
@media(max-width:700px){.match-grid{grid-template-columns:1fr}}

/* LOCATION */
.location{max-width:860px;margin:0 auto;display:grid;grid-template-columns:.85fr 1.15fr;gap:18px;align-items:stretch}
.field-card{background:var(--cream2);color:var(--ink);padding:30px;border:1px solid #c9bfa8;box-shadow:8px 8px 0 rgba(0,0,0,.2)}
.field-card .date{font-family:'Anton';font-size:2rem;text-transform:uppercase}
.field-card .lugar{font-size:1.35rem;font-weight:800;margin:10px 0}
.map-link{display:inline-block;background:var(--gold2);color:var(--ink);padding:12px 22px;font-weight:900;text-transform:uppercase;box-shadow:4px 4px 0 #6c5214}
.pitch{min-height:260px;background:linear-gradient(135deg,#0d6b36,#0a522b);border:4px solid rgba(255,255,255,.55);position:relative;overflow:hidden}
.pitch:before{content:"";position:absolute;inset:12%;border:3px solid rgba(255,255,255,.5)}
.pitch:after{content:"";position:absolute;left:50%;top:12%;bottom:12%;width:3px;background:rgba(255,255,255,.5);transform:translateX(-50%)}
.pitch-circle{position:absolute;width:95px;height:95px;border:3px solid rgba(255,255,255,.5);border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%)}
.pitch-ball{position:absolute;font-size:3.5rem;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-12deg);filter:drop-shadow(5px 7px 0 rgba(0,0,0,.25))}
@media(max-width:700px){.location{grid-template-columns:1fr}.pitch{min-height:190px}}

/* GAME */
.game-shell{max-width:520px;margin:0 auto;background:#06131f;border:2px solid var(--gold2);padding:22px;box-shadow:10px 10px 0 rgba(0,0,0,.3);position:relative}
.game-shell:before{content:"SPECIAL EDITION";position:absolute;right:-1px;top:12px;background:var(--gold2);color:var(--ink);padding:4px 12px;font-size:.65rem;font-weight:900;letter-spacing:2px}
.game-copy{text-align:center;padding:20px 10px 8px}
.game-copy p{font-size:1.12rem;font-weight:600}
.game-card{margin-top:16px;background:linear-gradient(145deg,#17354c,#071521);border:5px solid #eee7d8;padding:8px;position:relative;min-height:250px}
.game-card-inner{border:1px solid rgba(255,255,255,.25);padding:28px 20px;text-align:center}
.game-silhouette{font-size:6rem;line-height:1;opacity:.9}
.game-question{font-family:'Anton';font-size:3.4rem;color:var(--gold2);line-height:1}
.game-card button{margin-top:18px;width:100%;border:0;background:var(--gold2);color:var(--ink);font-family:'Anton';font-size:1.45rem;text-transform:uppercase;padding:13px;cursor:pointer;box-shadow:5px 5px 0 #59420c}
.game-card button:active{transform:translate(2px,2px);box-shadow:3px 3px 0 #59420c}
.mini-card{margin-top:18px;background:var(--cream2);color:var(--ink);border:4px solid var(--ink);display:none}
.mini-card.show{display:block}
.mini-card-top{background:var(--green);color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center}
.rv-tag{font-weight:800;text-transform:uppercase;letter-spacing:1px}
.rv-num{background:var(--gold2);color:var(--ink);font-family:'Anton';font-size:1.5rem;padding:4px 10px}
.mini-card-bottom{padding:14px;text-align:center}
.rv-name{font-family:'Anton';font-size:2rem;text-transform:uppercase}
.rv-pos{text-transform:uppercase;color:#577;letter-spacing:2px;font-weight:800}

/* GALLERY */
.gallery{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:center}
.gallery img{width:100%;height:170px;object-fit:cover;border:5px solid #f5efe0;padding:2px;background:#fff;box-shadow:6px 8px 0 rgba(0,0,0,.35);display:block}
.gallery-item:nth-child(odd) img{transform:rotate(-2deg)}
.gallery-item:nth-child(even) img{transform:rotate(1.5deg)}
.lightbox{display:none;position:fixed;inset:0;background:rgba(3,9,14,.96);align-items:center;justify-content:center;z-index:200;padding:20px}
.lightbox.open{display:flex}.lightbox img{max-width:92%;max-height:88%;border:5px solid var(--cream)}.lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.4rem;cursor:pointer}
@media(max-width:720px){.gallery img{height:145px}}

/* RSVP */
.rsvp-wrap{max-width:900px;margin:0 auto;background:var(--cream2);color:var(--ink);border:1px solid #c9bfa8;box-shadow:10px 10px 0 rgba(0,0,0,.22);display:grid;grid-template-columns:1.25fr .75fr;overflow:hidden}
.rsvp-content{padding:30px}.rsvp-side{background:linear-gradient(160deg,#111,#050b11);color:#fff;padding:30px;display:flex;flex-direction:column;justify-content:center;text-align:center;border-left:4px solid var(--gold2)}
.rsvp-side .cup{font-size:5rem}.rsvp-side h3{font-family:'Anton';font-size:2.6rem;color:var(--gold2);text-transform:uppercase}
.rsvp-side p{font-size:1.05rem;font-weight:600}
.rsvp-box{margin-top:8px}
.rsvp-form{display:flex;flex-direction:column;gap:12px;text-align:left}
.rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.2px;font-weight:900}
.rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px;border:2px solid #9aa8b1;background:#fff;border-radius:0;width:100%}
.rsvp-form button{background:var(--green);color:#fff;border:0;padding:14px;font-family:'Anton';font-size:1.25rem;text-transform:uppercase;letter-spacing:1px;cursor:pointer;box-shadow:5px 5px 0 #07371e}
.rsvp-status{text-align:center;font-weight:800;color:var(--green)}
.rsvp-whatsapp{display:block;text-align:center;color:var(--green);font-weight:900;margin-top:8px}
@media(max-width:700px){.rsvp-wrap{grid-template-columns:1fr}.rsvp-side{border-left:0;border-top:4px solid var(--gold2)}}

/* FOOTER */
footer{background:#030a11;padding:34px 20px;text-align:center;border-top:2px solid var(--gold2)}
footer .whistle{display:block;font-size:1.6rem;margin-bottom:8px}
footer .brand{font-family:'Anton';font-size:2rem;letter-spacing:4px}
footer p{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:1.5px}
@media(max-width:480px){.section{padding:45px 17px}.section-title{font-size:2rem}.hero h1{font-size:4rem}}
</style></head>
<body>
<div class="grain"></div>
<div class="page">

  <header class="hero">
    <div class="stadium-lights"></div>
    <div class="hero-copy">
      <div class="brush">¡Armemos un partidazo!</div>
      <h1><span class="hero-name">${esc(d.nombreChico)}</span><span class="hero-age-line">cumple ${esc(d.edad)}</span></h1>
      <p class="hero-sub">Vení a jugar y festejar un <b>cumple de campeones</b></p>
      <span class="hero-ball">⚽</span>
    </div>

    <div class="hero-card">
      <div class="player-card">
        <div class="player-top">
          <div><div class="edition">Edición especial</div><div style="font-size:.75rem;color:#fff;letter-spacing:2px;text-transform:uppercase;margin-top:3px">Los Cracks FC</div></div>
          <div class="jersey">${esc(d.edad)}</div>
        </div>
        <div class="player-photo"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div>
        <div class="card-name">${esc(d.nombreChico)}</div>
        <div class="card-meta"><span>Delantero · Futuro campeón</span><span class="badge">⚽</span></div>
      </div>
    </div>

    <div class="hero-bottom"><span>⚽ Partido de cumple</span><span>★ Edición especial ★</span><span>🏆 Festejo de campeones</span></div>
  </header>

  <section class="section">
    <div class="section-head">
      <div class="kicker" style="text-align:center">Cuenta regresiva</div>
      <h2 class="section-title">Falta muy poco para el <span>partidazo</span></h2>
      <div class="stadium-divider"></div>
    </div>
    <div class="count-wrap">${cd.html}</div>
  </section>

  <section class="section green">
    <div class="section-head">
      <div class="kicker" style="text-align:center;color:#dff7e8">La agenda del campeón</div>
      <h2 class="section-title">¿Qué vamos a <span>hacer?</span></h2>
    </div>
    <div class="match-grid">
      <div class="panel">
        <h3>⚽ Datos del partido</h3>
        <div class="gold-rule"></div>
        <div class="match-message">${esc(d.mensaje)}</div>
        ${d.tematica ? `<div class="tematica-box">👕 ${esc(d.tematica)}</div>` : ""}
      </div>
      <div class="panel">
        <h3>🏆 Programa</h3>
        <div class="gold-rule"></div>
        <div class="program">
          <div class="step"><span class="ico">⚽</span><div><strong>1er tiempo</strong><span>Picadito entre amigos</span></div></div>
          <div class="step"><span class="ico">🎯</span><div><strong>Entretiempo</strong><span>Juegos y desafíos de fútbol</span></div></div>
          <div class="step"><span class="ico">🎁</span><div><strong>Premios</strong><span>Premios y sorpresas</span></div></div>
          <div class="step"><span class="ico">🍕</span><div><strong>3er tiempo</strong><span>Comemos algo rico todos juntos</span></div></div>
        </div>
      </div>
    </div>
  </section>

  ${d.lugar || d.hora || d.direccionMapa ? `<section class="section cream">
    <div class="section-head">
      <div class="kicker" style="color:#557;text-align:center">Información del partido</div>
      <h2 class="section-title">Datos de la <span>cancha</span></h2>
    </div>
    <div class="location">
      <div class="field-card">
        <div class="date">📅 ${esc(fechaLarga || d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</div>
        ${d.lugar ? `<div class="lugar">📍 ${esc(d.lugar)}</div>` : ""}
        <div class="gold-rule"></div>
        ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver en el mapa 📍</a>` : ""}
      </div>
      <div class="pitch"><div class="pitch-circle"></div><div class="pitch-ball">⚽</div></div>
    </div>
  </section>` : ""}

  <section class="section">
    <div class="section-head">
      <div class="kicker" style="text-align:center">Mini desafío</div>
      <h2 class="section-title">¿Qué jugador de la <span>Scaloneta</span> sos?</h2>
    </div>
    <div class="game-shell">
      <div class="game-copy"><p>Descubrí qué crack te representa en este partido.</p></div>
      <div class="game-card">
        <div class="game-card-inner">
          <div class="game-silhouette">⚽</div>
          <div class="game-question">¿Quién sos?</div>
          <button type="button" id="futPlayerBtn">Jugar ahora ⚽</button>
          <div class="mini-card" id="futPlayerReveal">
            <div class="mini-card-top"><span class="rv-tag">Hoy jugás como</span><span class="rv-num" id="futPlayerNum"></span></div>
            <div class="mini-card-bottom"><div class="rv-name" id="futPlayerName"></div><div class="rv-pos" id="futPlayerPos"></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section class="section green">
    <div class="section-head">
      <div class="kicker" style="color:#dff7e8;text-align:center">Nuestros recuerdos</div>
      <h2 class="section-title">Galería de <span>campeones</span></h2>
    </div>
    ${gal.html}
  </section>` : ""}

  <section class="section cream">
    <div class="section-head">
      <div class="kicker" style="color:#557;text-align:center">Último paso</div>
      <h2 class="section-title">Confirmá tu <span>asistencia</span></h2>
      ${rsvpDeadline ? `<p style="text-align:center;margin:8px 0 18px;font-size:.9rem;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    </div>
    <div class="rsvp-wrap">
      <div class="rsvp-content"><div class="rsvp-box">${rsvp.html}</div></div>
      <aside class="rsvp-side"><div class="cup">🏆</div><h3>¡No faltes!</h3><p>Te esperamos para vivir una aventura inolvidable en la cancha.</p></aside>
    </div>
  </section>

  <footer>
    <span class="whistle">⚽ ★ 🏆</span>
    <div class="brand">TADI</div>
    <p>Invitaciones online · Nos vemos en la cancha</p>
  </footer>
</div>

<script>
${cd.script}${gal.script}${rsvp.script}
(function(){
  var players = [
    {n:'E. Martínez',p:'Arquero'},{n:'F. Armani',p:'Arquero'},{n:'G. Rulli',p:'Arquero'},
    {n:'N. Molina',p:'Defensor'},{n:'G. Montiel',p:'Defensor'},{n:'C. Romero',p:'Defensor'},
    {n:'N. Otamendi',p:'Defensor'},{n:'Lisandro Martínez',p:'Defensor'},{n:'M. Acuña',p:'Defensor'},
    {n:'N. Tagliafico',p:'Defensor'},{n:'G. Pezzella',p:'Defensor'},
    {n:'R. De Paul',p:'Mediocampista'},{n:'L. Paredes',p:'Mediocampista'},{n:'G. Rodríguez',p:'Mediocampista'},
    {n:'A. Mac Allister',p:'Mediocampista'},{n:'E. Fernández',p:'Mediocampista'},{n:'E. Palacios',p:'Mediocampista'},
    {n:'A. Gómez',p:'Mediocampista'},{n:'T. Almada',p:'Mediocampista'},
    {n:'L. Messi',p:'Delantero'},{n:'J. Álvarez',p:'Delantero'},{n:'Á. Di María',p:'Delantero'},
    {n:'Lautaro Martínez',p:'Delantero'},{n:'P. Dybala',p:'Delantero'},{n:'J. Correa',p:'Delantero'}
  ];
  var btn=document.getElementById('futPlayerBtn'), reveal=document.getElementById('futPlayerReveal');
  var nameEl=document.getElementById('futPlayerName'), posEl=document.getElementById('futPlayerPos'), numEl=document.getElementById('futPlayerNum');
  if(!btn)return;
  btn.addEventListener('click',function(){
    var pick=players[Math.floor(Math.random()*players.length)];
    nameEl.textContent=pick.n; posEl.textContent=pick.p; numEl.textContent=1+Math.floor(Math.random()*11);
    reveal.classList.add('show');
  });
})();

(function(){
  // Nombres largos podían desbordar el h1 (clamp hasta 8rem) y apretar la
  // ficha de jugador de al lado. Medimos la palabra más larga del nombre y
  // achicamos el título hasta que entre, dejando el resto del diseño intacto.
  var nameEl = document.querySelector('.hero-name');
  var h1 = document.querySelector('.hero h1');
  var box = document.querySelector('.hero-copy');
  if(!nameEl || !h1 || !box) return;

  var text = nameEl.textContent || '';
  var words = text.trim().split(' ').filter(function(w){ return w.length > 0; });
  var longest = words.reduce(function(a, b){ return b.length > a.length ? b : a; }, '');

  var measurer = document.createElement('span');
  measurer.style.position = 'absolute';
  measurer.style.visibility = 'hidden';
  measurer.style.whiteSpace = 'nowrap';
  measurer.style.left = '-9999px';
  measurer.style.top = '0';
  measurer.textContent = longest;
  document.body.appendChild(measurer);

  function fitName(){
    h1.style.fontSize = '';
    var cs = getComputedStyle(h1);
    measurer.style.fontFamily = cs.fontFamily;
    measurer.style.textTransform = cs.textTransform;
    measurer.style.letterSpacing = cs.letterSpacing;
    measurer.style.fontWeight = cs.fontWeight;

    var maxWidth = box.clientWidth - 10;
    var size = parseFloat(cs.fontSize);
    measurer.style.fontSize = size + 'px';

    var guard = 0;
    while(measurer.scrollWidth > maxWidth && size > 32 && guard < 40){
      size -= 3;
      measurer.style.fontSize = size + 'px';
      guard++;
    }

    if(guard > 0) h1.style.fontSize = size + 'px';
  }

  fitName();
  window.addEventListener('resize', fitName);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(fitName).catch(function(){});
  }
})();
</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:
      radial-gradient(ellipse at 50% 8%, rgba(255,255,255,.4), transparent 60%),
      repeating-linear-gradient(90deg,#2e8b3d 0 20px,#1c5c28 20px 40px);">
    <span style="position:absolute;top:0;left:0;right:0;height:10px;background-color:#0c2340;
      background-image:radial-gradient(circle,rgba(255,255,255,.55) 1.2px,transparent 1.4px);
      background-size:7px 7px;background-position:0 3px;"></span>
    <span style="position:absolute;top:14px;left:0;right:0;text-align:center;">
      <span style="display:inline-block;width:68px;height:68px;border:3px solid rgba(255,255,255,.5);border-radius:50%;"></span>
    </span>
    <span style="font-size:2.1rem;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35));">⚽</span>
    <div style="font-family:'Arial Black',Impact,sans-serif;font-size:1.2rem;color:#fff;letter-spacing:1px;
      -webkit-text-stroke:1px #0c2340;paint-order:stroke fill;">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#ffd400;font-weight:700;
      background:#0c2340;padding:2px 8px;border-radius:8px;">Partido de cumple</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Fútbol",
  summary: "Cumpleaños con partido de fútbol y comida después: cancha con líneas de juego, ficha de jugador y un mini juego de qué crack de la Scaloneta sos.",
  accent: "#6cace4", schema: infantilSchema, sampleData, render, cardPreview,
};
