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
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#ffd400");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd9");
  const gal = galleryWidget(d.galeria, "gal9");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡Súper cumple de ${esc(d.nombreChico)}!</title>
<style>
  :root{--red:#ed1c24;--blue:#1a3aad;--yellow:${accent};--green:#3ecf4a;--ink:#0c1b3a;--paper:#f5f2e8;}
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{margin:0;font-family:'Segoe UI',Verdana,Arial,sans-serif;background:var(--paper);color:var(--ink);
    background-image:radial-gradient(rgba(12,27,58,.16) 1.4px, transparent 1.6px);background-size:11px 11px;}
  h1,h2,.comic-font{font-family:'Arial Black',Impact,'Franklin Gothic Bold',sans-serif;}

  /* ---- Bursts de cómic (reutilizables) ---- */
  .burst{position:relative;display:flex;align-items:center;justify-content:center;text-align:center;
    font-weight:900;text-transform:uppercase;line-height:1;color:var(--ink);
    border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);
    clip-path:polygon(50% 0%,61% 18%,78% 6%,78% 26%,98% 20%,88% 38%,100% 50%,88% 62%,98% 80%,78% 74%,78% 94%,61% 82%,50% 100%,39% 82%,22% 94%,22% 74%,2% 80%,12% 62%,0% 50%,12% 38%,2% 20%,22% 26%,22% 6%,39% 18%);}
  .burst-red{background:var(--red);color:var(--yellow);}
  .burst-blue{background:var(--blue);color:var(--yellow);}
  .burst-yellow{background:var(--yellow);color:var(--red);}
  .burst-green{background:var(--green);color:var(--blue);}

  /* ---- Rayas de velocidad radiando desde una esquina (estilo puño impactando) ---- */
  .speedlines{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
  .speedlines::before{content:"";position:absolute;top:-40%;left:-30%;width:160%;height:180%;
    background:repeating-conic-gradient(from -20deg at 20% 30%, rgba(12,27,58,.14) 0deg 2.2deg, transparent 2.2deg 9deg);}

  /* ---- Halftone dot cloud decorativa (como las nubes de puntos del cómic) ---- */
  .dot-cloud{position:absolute;border-radius:46% 54% 58% 42% / 50% 44% 56% 50%;
    background-image:radial-gradient(var(--ink) 1.6px, transparent 1.8px);background-size:8px 8px;
    opacity:.16;pointer-events:none;}

  /* ---- Skyline urbano ---- */
  .skyline{width:100%;height:50px;display:block;}
  .skyline svg{width:100%;height:100%;display:block;}

  /* ---- Hero: portada de historieta ---- */
  .hero{position:relative;overflow:hidden;text-align:center;padding:22px 18px 0;}
  .hero-top{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;max-width:720px;margin:0 auto;}
  .caption-box{background:#fff;border:4px solid var(--ink);border-radius:4px;box-shadow:5px 5px 0 var(--ink);
    padding:8px 16px;font-weight:900;text-transform:uppercase;font-size:.78rem;letter-spacing:1px;
    transform:rotate(-2deg);text-align:left;}
  .hero-burst-1{width:96px;height:96px;font-size:.85rem;transform:rotate(-9deg);flex:0 0 auto;}
  .hero-burst-2{width:80px;height:80px;font-size:.72rem;transform:rotate(7deg);flex:0 0 auto;}

  .hero-name{position:relative;z-index:1;max-width:720px;margin:14px auto 0;}
  .hero-name h1{font-size:clamp(2.4rem,10vw,4.6rem);margin:0;text-transform:uppercase;letter-spacing:1px;
    color:#fff;-webkit-text-stroke:3px var(--ink);paint-order:stroke fill;
    text-shadow:5px 5px 0 var(--red);line-height:1.02;word-break:break-word;}

  .hero-photo-wrap{position:relative;z-index:1;max-width:520px;margin:22px auto 0;padding:0 0 40px;}
  .hero-photo{position:relative;border:6px solid var(--ink);border-radius:10px;box-shadow:9px 9px 0 var(--ink);
    overflow:hidden;transform:rotate(-1.2deg);background:#dfe3ea;aspect-ratio:4/3;}
  .hero-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.08) saturate(1.05);}
  .hero-photo::after{content:"";position:absolute;inset:0;pointer-events:none;
    background-image:radial-gradient(rgba(255,255,255,.5) 1px, transparent 1.3px);background-size:6px 6px;
    mix-blend-mode:overlay;opacity:.5;}

  .age-impact{position:absolute;right:-16px;bottom:-30px;z-index:2;width:132px;height:132px;
    background:var(--yellow);color:var(--red);border:4px solid var(--ink);box-shadow:5px 5px 0 var(--ink);
    border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;
    transform:rotate(8deg);
    clip-path:polygon(50% 0%,58% 14%,72% 4%,74% 20%,90% 12%,86% 28%,100% 28%,92% 42%,100% 50%,88% 54%,96% 68%,80% 66%,82% 82%,68% 74%,64% 90%,50% 100%,36% 90%,32% 74%,18% 82%,20% 66%,4% 68%,12% 54%,0% 50%,8% 42%,0% 28%,14% 28%,10% 12%,26% 20%,28% 4%,42% 14%);}
  .age-impact .num{font-size:2.6rem;font-weight:900;line-height:1;font-family:'Arial Black',Impact,sans-serif;}
  .age-impact .txt{font-size:.56rem;text-transform:uppercase;font-weight:900;letter-spacing:.5px;}

  .zigzag{height:16px;background-color:var(--ink);
    background-image:linear-gradient(135deg,var(--yellow) 25%,transparent 25%),linear-gradient(225deg,var(--yellow) 25%,transparent 25%);
    background-position:0 0;background-size:22px 22px;background-repeat:repeat-x;position:relative;z-index:1;}

  /* ---- Layout ---- */
  section{max-width:760px;margin:0 auto;padding:52px 18px;position:relative;}
  section h2{text-align:center;text-transform:uppercase;font-size:1.7rem;color:var(--red);
    -webkit-text-stroke:1px var(--ink);margin:0 0 22px;letter-spacing:1px;position:relative;z-index:1;}

  .panel{position:relative;z-index:1;background:#fff;border:5px solid var(--ink);border-radius:12px;
    box-shadow:8px 8px 0 var(--ink);padding:28px 22px;max-width:100%;}
  .tilt-l{transform:rotate(-.8deg);}
  .tilt-r{transform:rotate(.8deg);}

  .bubble{position:relative;z-index:1;background:#fff;border:5px solid var(--ink);border-radius:26px;
    box-shadow:8px 8px 0 var(--ink);padding:26px;font-size:1.05rem;line-height:1.6;text-align:center;}
  .bubble::before{content:"";position:absolute;left:56px;bottom:-30px;
    border-width:22px 22px 0 0;border-style:solid;border-color:var(--ink) transparent transparent transparent;}
  .bubble::after{content:"";position:absolute;left:62px;bottom:-22px;
    border-width:16px 16px 0 0;border-style:solid;border-color:#fff transparent transparent transparent;}

  .mission-label{display:inline-block;background:var(--red);color:#fff;font-weight:900;
    text-transform:uppercase;font-size:.8rem;letter-spacing:1px;padding:6px 14px;border-radius:8px;
    border:3px solid var(--ink);margin-bottom:12px;}
  .mission-text{font-size:1.15rem;font-weight:700;}

  /* Countdown (widget markup, custom styling) */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
  .countdown div{background:var(--blue);color:#fff;border:4px solid var(--ink);border-radius:10px;
    min-width:64px;padding:10px 6px;text-align:center;box-shadow:4px 4px 0 var(--ink);}
  .cd-num{display:block;font-size:1.6rem;font-weight:900;}
  .cd-label{display:block;font-size:.62rem;text-transform:uppercase;letter-spacing:1px;}

  .loc-info p{font-size:1.05rem;margin:6px 0;text-align:center;}
  .btn-pow{display:block;width:max-content;margin:18px auto 0;background:var(--red);color:#fff;
    font-weight:900;text-transform:uppercase;text-decoration:none;padding:12px 26px;
    border:4px solid var(--ink);border-radius:10px;box-shadow:5px 5px 0 var(--ink);
    transition:transform .1s,box-shadow .1s;}
  .btn-pow:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}

  /* Gallery (widget markup) */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:10px;cursor:pointer;
    border:4px solid var(--ink);box-shadow:4px 4px 0 var(--ink);}
  .gallery-item:nth-child(odd) img{transform:rotate(-1.5deg);}
  .gallery-item:nth-child(even) img{transform:rotate(1.5deg);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(12,27,58,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;border:5px solid var(--yellow);}
  .lightbox-close{position:absolute;top:20px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;font-weight:900;}

  /* Generador de nombre de superhéroe */
  .generator input{font-family:inherit;font-size:1rem;padding:10px 12px;border:3px solid var(--ink);
    border-radius:8px;width:100%;margin-bottom:12px;}
  .generator button{width:100%;background:var(--yellow);color:var(--ink);font-weight:900;
    text-transform:uppercase;border:4px solid var(--ink);border-radius:10px;padding:12px;
    box-shadow:5px 5px 0 var(--ink);cursor:pointer;transition:transform .1s,box-shadow .1s;}
  .generator button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}
  .generator-result{margin-top:16px;text-align:center;font-size:1.3rem;font-weight:900;color:var(--red);
    min-height:1.6em;text-transform:uppercase;}

  /* RSVP (widget markup) */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;font-weight:700;color:var(--blue);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;
    border:3px solid var(--ink);border-radius:8px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--red);color:#fff;border:4px solid var(--ink);padding:12px;
    border-radius:10px;font-weight:900;text-transform:uppercase;box-shadow:5px 5px 0 var(--ink);
    cursor:pointer;transition:transform .1s,box-shadow .1s;}
  .rsvp-form button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}
  .rsvp-whatsapp{text-align:center;font-weight:700;color:var(--blue);text-decoration:none;}
  .rsvp-status{text-align:center;font-weight:900;color:#1f9d55;}

  footer{background:var(--ink);color:#fff;text-align:center;padding:34px 20px;position:relative;z-index:1;}
  footer .stars{color:var(--yellow);letter-spacing:6px;margin-bottom:8px;}
  footer p{margin:4px 0;font-size:.9rem;}

  /* ---- Bursts de esquina por sección ---- */
  .corner-burst{position:absolute;width:60px;height:60px;font-weight:900;text-align:center;
    display:flex;align-items:center;justify-content:center;line-height:1;font-size:.6rem;z-index:2;
    top:-14px;pointer-events:none;}
  .corner-burst.left{left:-6px;transform:rotate(-11deg);}
  .corner-burst.right{right:-6px;transform:rotate(9deg);}

  @media(max-width:480px){
    .panel,.bubble{padding:20px 16px;}
    .hero-burst-1{width:76px;height:76px;font-size:.68rem;}
    .hero-burst-2{width:64px;height:64px;font-size:.58rem;}
    .age-impact{width:104px;height:104px;right:-8px;bottom:-22px;}
    .age-impact .num{font-size:2.1rem;}
    .corner-burst{width:46px;height:46px;font-size:.5rem;}
    .dot-cloud{display:none;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="speedlines"></div>
    <div class="dot-cloud" style="width:220px;height:150px;top:-20px;left:-60px;"></div>
    <div class="dot-cloud" style="width:180px;height:130px;top:60px;right:-50px;"></div>

    <div class="hero-top">
      <span class="caption-box">¡Alerta de<br>súper cumple!</span>
      <span class="burst burst-red hero-burst-1">¡BOOM!</span>
    </div>
    <span class="burst burst-blue hero-burst-2" style="position:absolute;left:4%;top:22%;z-index:3;">¡WHAM!</span>

    <div class="hero-name">
      <h1>${esc(d.nombreChico)}</h1>
    </div>

    <div class="hero-photo-wrap">
      <div class="hero-photo">
        <img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}">
        <div class="age-impact"><span class="num">${esc(d.edad)}</span><span class="txt">¡Años!</span></div>
      </div>
    </div>

    <div class="skyline">
      <svg viewBox="0 0 600 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="20" width="40" height="40" fill="#0c1b3a"/>
        <rect x="42" y="8" width="26" height="52" fill="#0c1b3a"/>
        <rect x="72" y="26" width="34" height="34" fill="#0c1b3a"/>
        <rect x="110" y="0" width="30" height="60" fill="#0c1b3a"/>
        <rect x="144" y="16" width="24" height="44" fill="#0c1b3a"/>
        <rect x="172" y="30" width="46" height="30" fill="#0c1b3a"/>
        <rect x="222" y="10" width="20" height="50" fill="#0c1b3a"/>
        <rect x="246" y="24" width="30" height="36" fill="#0c1b3a"/>
        <rect x="280" y="2" width="28" height="58" fill="#0c1b3a"/>
        <rect x="312" y="22" width="36" height="38" fill="#0c1b3a"/>
        <rect x="352" y="12" width="22" height="48" fill="#0c1b3a"/>
        <rect x="378" y="30" width="40" height="30" fill="#0c1b3a"/>
        <rect x="422" y="6" width="26" height="54" fill="#0c1b3a"/>
        <rect x="452" y="24" width="32" height="36" fill="#0c1b3a"/>
        <rect x="488" y="0" width="24" height="60" fill="#0c1b3a"/>
        <rect x="516" y="18" width="30" height="42" fill="#0c1b3a"/>
        <rect x="550" y="28" width="50" height="32" fill="#0c1b3a"/>
        <g fill="#ffd400" opacity=".7">
          <rect x="8" y="30" width="4" height="4"/><rect x="20" y="30" width="4" height="4"/><rect x="8" y="42" width="4" height="4"/>
          <rect x="118" y="10" width="4" height="4"/><rect x="130" y="10" width="4" height="4"/>
          <rect x="288" y="14" width="4" height="4"/><rect x="288" y="26" width="4" height="4"/>
          <rect x="430" y="16" width="4" height="4"/><rect x="430" y="28" width="4" height="4"/>
          <rect x="496" y="12" width="4" height="4"/><rect x="496" y="24" width="4" height="4"/>
        </g>
      </svg>
    </div>
  </div>
  <div class="zigzag"></div>

  <section>
    <span class="corner-burst left burst burst-green">¡ZAP!</span>
    <h2>Cuenta regresiva para la misión</h2>
    <div class="panel tilt-l" style="margin:0 auto;">
      ${cd.html}
    </div>
  </section>

  ${d.mensaje ? `<section>
    <span class="corner-burst right burst burst-blue">¡WHAM!</span>
    <h2>Mensaje de la Liga</h2>
    <div class="bubble">${esc(d.mensaje)}</div>
  </section>` : ""}

  <section>
    <span class="corner-burst left burst burst-yellow">¡CRASH!</span>
    <h2>¡Dónde es la misión!</h2>
    <div class="panel tilt-r loc-info">
      <p><strong>${esc(d.fecha)}</strong>${d.hora ? ` a las <strong>${esc(d.hora)}</strong> hs` : ""}</p>
      ${d.lugar ? `<p>${esc(d.lugar)}</p>` : ""}
      ${d.tematica ? `<div style="text-align:center;margin-top:16px;"><span class="mission-label">Misión especial</span><p class="mission-text">${esc(d.tematica)}</p></div>` : ""}
      ${d.direccionMapa ? `<a class="btn-pow" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver mapa →</a>` : ""}
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="corner-burst right burst burst-red">¡BOOM!</span>
    <h2>Fotos de entrenamiento</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2>Descubrí tu nombre de superhéroe</h2>
    <div class="panel tilt-l generator">
      <input type="text" id="heroNameInput" placeholder="Escribí tu nombre..." value="${esc(d.nombreChico)}">
      <button type="button" id="heroNameBtn">¡Transformarme!</button>
      <p class="generator-result" id="heroNameResult"></p>
    </div>
  </section>

  <section>
    <span class="corner-burst left burst burst-green">¡POW!</span>
    <h2>Confirmá tu asistencia a la misión</h2>
    ${rsvpDeadline ? `<p style="position:relative;z-index:1;margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="panel tilt-r">
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <div class="stars">★ ★ ★</div>
    <p>¡Te esperamos para salvar el día junto a ${esc(d.nombreChico)}!</p>
    <p>Con súper cariño, la familia organizadora.</p>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var prefixes = ['Capitán','Súper','Increíble','Relámpago','Doctor','Comandante','Mega','Ultra'];
      var suffixes = ['Rayo','Cometa','Trueno','Fénix','Tornado','Estrella','Halcón','Cohete'];
      var input = document.getElementById('heroNameInput');
      var btn = document.getElementById('heroNameBtn');
      var result = document.getElementById('heroNameResult');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var val = (input.value || '').trim() || 'Héroe';
        var seed = 0;
        for (var i = 0; i < val.length; i++) seed += val.charCodeAt(i);
        var p = prefixes[seed % prefixes.length];
        var s = suffixes[(seed * 7 + val.length) % suffixes.length];
        result.textContent = '¡' + p + ' ' + s + '!';
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:#0c1b3a;background-image:radial-gradient(rgba(255,255,255,.22) 1.4px, transparent 1.6px);background-size:9px 9px;">
    <span style="display:flex;align-items:center;justify-content:center;width:64px;height:64px;
      background:#ed1c24;color:#ffd400;font-weight:900;text-transform:uppercase;font-family:'Arial Black',Impact,sans-serif;
      font-size:.68rem;text-align:center;border:3px solid #fff;box-shadow:3px 3px 0 rgba(0,0,0,.35);transform:rotate(-8deg);
      clip-path:polygon(50% 0%,61% 18%,78% 6%,78% 26%,98% 20%,88% 38%,100% 50%,88% 62%,98% 80%,78% 74%,78% 94%,61% 82%,50% 100%,39% 82%,22% 94%,22% 74%,2% 80%,12% 62%,0% 50%,12% 38%,2% 20%,22% 26%,22% 6%,39% 18%);">¡Pow!</span>
    <span style="font-family:'Arial Black',Impact,sans-serif;font-size:1.15rem;
      color:#fff;-webkit-text-stroke:1.5px #0c1b3a;paint-order:stroke fill;letter-spacing:1px;">Superhéroes</span>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Superhéroes",
  summary: "Portada de historieta con halftone, viñetas, globos de diálogo estilo BOOM/WHAM/ZAP y skyline de ciudad.",
  accent: "#ed1c24", schema: infantilSchema, sampleData, render, cardPreview,
};
