const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-unicornio-magico";

const sampleData = {
  nombreChico: "Guadalupe",
  edad: "5",
  fecha: "2027-04-17",
  hora: "16:30",
  lugar: "Salón Estrella de Mar, Mar del Plata",
  direccionMapa: "https://maps.google.com/?q=Salon+Estrella+de+Mar+Mar+del+Plata",
  mensaje: "Guadalupe cumple 5 años y nos invita a cruzar el arcoíris hasta su reino mágico. Habrá torta de nubes, purpurina, sorpresas y muchísima magia unicornio. ¡Traé tu varita y tus mejores brillos!",
  tematica: "Vení con tu disfraz más brillante y mágico",
  whatsapp: "5491100000061",
  coverImage: "https://images.unsplash.com/photo-1519308914928-2e6b45de9ac1?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-e3fa06c6c9c8?w=800&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80",
    "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=80",
  ],
};

// Datos de los 8 sectores de la ruleta mágica: color e ícono/mensaje corto
// para dibujar (SVG conic-gradient de fondo) y el mensaje completo que se
// revela cuando la flecha queda apuntando a ese sector. Todo hardcodeado en
// el diseño (no depende del schema).
const WHEEL_SECTORS = [
  { emoji: "🍪", short: "Hada de las galletas", full: "¡Sos la hada de las galletas! Tenés el poder de hacer aparecer meriendas ricas de la nada." },
  { emoji: "✨", short: "Brillo infinito", full: "¡Tenés poderes de brillo infinito! Todo lo que tocás queda cubierto de purpurina mágica." },
  { emoji: "🦄", short: "Amiga de unicornios", full: "¡Podés hablar con los unicornios! Ellos te cuentan todos sus secretos del reino." },
  { emoji: "🌈", short: "Guardiana del arcoíris", full: "¡Sos la guardiana del arcoíris! Podés cruzarlo cuando quieras para visitar las nubes." },
  { emoji: "🌟", short: "Dueña de un deseo", full: "¡Ganaste un deseo mágico! Pedilo antes de que se apague la primera estrella de la noche." },
  { emoji: "🍭", short: "Reina de los dulces", full: "¡Sos la reina de los dulces! En tu reino los caramelos crecen en los árboles." },
  { emoji: "👑", short: "Corona de nubes", full: "¡Te ganaste una corona hecha de nubes! Flota sobre tu cabeza a donde vayas." },
  { emoji: "🔮", short: "Vidente de fiestas", full: "¡Sos vidente de fiestas! Siempre sabés cuándo se viene la próxima torta." },
];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#d98ec4");
  const accent2 = "#8fd9c4";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-unicornio");
  const gal = galleryWidget(d.galeria, "gal-unicornio");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const nSectors = WHEEL_SECTORS.length;
  const sliceDeg = 360 / nSectors;
  const wheelColors = [accent, "#fff2f8", accent2, "#fff9e3", "#c9b8f0", "#ffe3ef", "#bfe9df", "#f6e2f7"];
  const conicStops = WHEEL_SECTORS.map((s, i) => `${wheelColors[i % wheelColors.length]} ${i * sliceDeg}deg ${(i + 1) * sliceDeg}deg`).join(",");
  const wheelLabels = WHEEL_SECTORS.map((s, i) => {
    const mid = i * sliceDeg + sliceDeg / 2;
    return `<span class="wheel-ico" style="transform:rotate(${mid}deg) translate(0,-108px) rotate(${-mid}deg)">${s.emoji}</span>`;
  }).join("");

  const clouds = [
    { top: "10%", left: "6%", size: "70px", delay: "0s" },
    { top: "18%", left: "80%", size: "50px", delay: "1.4s" },
    { top: "60%", left: "4%", size: "46px", delay: "2.3s" },
    { top: "70%", left: "86%", size: "60px", delay: "0.7s" },
  ]
    .map((c) => `<span class="cloud" style="top:${c.top};left:${c.left};width:${c.size};animation-delay:${c.delay}">☁️</span>`)
    .join("");

  const stars = [
    { top: "8%", left: "40%", delay: "0s" },
    { top: "26%", left: "16%", delay: ".8s" },
    { top: "16%", left: "62%", delay: "1.6s" },
    { top: "48%", left: "90%", delay: "1.1s" },
    { top: "40%", left: "10%", delay: "2.2s" },
  ]
    .map((s) => `<span class="star" style="top:${s.top};left:${s.left};animation-delay:${s.delay}">✦</span>`)
    .join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreChico)} cumple ${esc(d.edad)} años</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --pink:${accent};
    --pink-deep:color-mix(in srgb, ${accent}, black 15%);
    --pink-light:color-mix(in srgb, ${accent}, white 82%);
    --mint:${accent2};
    --mint-deep:color-mix(in srgb, ${accent2}, black 18%);
    --gold:#f3c948;
    --lilac:#c9b8f0;
    --sky:#a8d8ef;
    --ink:#5a3d68;
    --cream:#fffaf3;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;overflow-x:hidden;}
  body{font-family:'Nunito',Verdana,Arial,sans-serif;background:var(--cream);color:var(--ink);}
  h1,h2,.magic-font{font-family:'Baloo 2','Chewy',Verdana,Arial,sans-serif;font-weight:800;}
  a{color:inherit;}

  .hero{
    position:relative;
    min-height:76vh;
    padding:64px 20px 84px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;overflow:hidden;
    background:
      radial-gradient(circle at 18% 15%, rgba(255,255,255,.5), transparent 45%),
      linear-gradient(150deg, var(--lilac) 0%, var(--pink) 42%, var(--sky) 78%, var(--mint) 100%);
    color:#fff;
  }
  .hero-cover{
    position:absolute;inset:0;
    background:url('${esc(d.coverImage)}') center/cover;
    opacity:.24;mix-blend-mode:overlay;
  }
  .cloud{position:absolute;font-size:2.2rem;opacity:.85;filter:drop-shadow(0 3px 5px rgba(0,0,0,.1));
    animation:drift 7s ease-in-out infinite;}
  @keyframes drift{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
  .star{position:absolute;color:#fff8dc;font-size:1.1rem;text-shadow:0 0 8px rgba(255,255,255,.8);
    animation:twinkle 2.4s ease-in-out infinite;pointer-events:none;}
  @keyframes twinkle{0%,100%{opacity:.2;transform:scale(.7);}50%{opacity:1;transform:scale(1.2);}}

  .unicorn-wrap{position:relative;z-index:1;width:118px;height:118px;margin-bottom:8px;
    animation:bob 3.2s ease-in-out infinite;filter:drop-shadow(0 6px 10px rgba(0,0,0,.18));}
  @keyframes bob{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-8px) rotate(2deg);}}

  .hero-kicker{position:relative;z-index:1;text-transform:uppercase;letter-spacing:3px;font-size:.72rem;
    color:#fff6d9;font-weight:700;margin:0 0 6px;}
  .hero h1{position:relative;z-index:1;font-size:clamp(2.8rem,11vw,5rem);margin:0;line-height:1;
    color:#fff;text-shadow:0 4px 16px rgba(0,0,0,.25);}
  .hero-age{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;
    margin-top:16px;width:92px;height:92px;border-radius:50%;
    background:radial-gradient(circle at 35% 30%, #fff, var(--gold) 75%);
    color:var(--ink);font-weight:800;font-size:2.4rem;
    box-shadow:0 0 0 4px rgba(255,255,255,.55), 0 8px 18px rgba(0,0,0,.22);}
  .hero-sub{position:relative;z-index:1;margin-top:14px;font-size:1rem;color:#fff;}
  .rainbow-edge{position:absolute;bottom:-2px;left:0;width:100%;height:26px;
    background:repeating-linear-gradient(180deg,
      #ff6b6b 0 4px,#ffb56b 4px 8px,#ffe36b 8px 12px,#8fd98f 12px 16px,#6bb8ff 16px 20px,#b78fff 20px 26px);
    clip-path:polygon(0 100%,0 40%,4% 20%,8% 8%,14% 2%,22% 0,30% 4%,38% 14%,46% 22%,54% 22%,62% 14%,70% 4%,78% 0,86% 2%,92% 8%,96% 20%,100% 40%,100% 100%);}

  section{max-width:740px;margin:0 auto;padding:54px 22px;text-align:center;}
  .section-title{font-family:'Baloo 2',Verdana,Arial,sans-serif;font-weight:800;
    font-size:2rem;color:var(--pink-deep);margin:0 0 4px;}
  .section-title small{display:block;font-family:'Nunito',sans-serif;font-weight:700;
    text-transform:uppercase;letter-spacing:2.5px;font-size:.62rem;color:var(--mint-deep);margin-top:6px;}

  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px;}
  .countdown div{background:linear-gradient(160deg,#fff,var(--pink-light));border:2px solid var(--gold);
    border-radius:18px;padding:14px 16px;min-width:70px;
    box-shadow:0 6px 14px color-mix(in srgb, var(--pink-deep) 15%, transparent);}
  .cd-num{display:block;font-size:1.75rem;font-weight:800;color:var(--pink-deep);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink);}

  .cloudcard{position:relative;background:#fff;border:3px solid var(--mint);border-radius:28px;
    padding:32px 26px;box-shadow:0 10px 24px color-mix(in srgb, var(--pink-deep) 10%, transparent);}
  .cloudcard p{font-size:1.03rem;line-height:1.7;margin:0;}
  .tematica{margin-top:18px;display:inline-block;background:linear-gradient(90deg,var(--pink),var(--lilac));
    color:#fff;padding:10px 22px;border-radius:30px;font-weight:700;font-size:.88rem;
    box-shadow:0 6px 14px color-mix(in srgb, var(--pink-deep) 30%, transparent);}

  .location-card{background:linear-gradient(160deg,#fff,var(--mint) 220%);background:linear-gradient(160deg,#fff,color-mix(in srgb, var(--mint) 25%, white));
    border-radius:22px;padding:28px 24px;border:2px solid var(--gold);}
  .location-card p{font-size:1.03rem;margin:6px 0;}
  .map-btn{display:inline-block;margin-top:16px;background:var(--gold);color:var(--ink);font-weight:800;
    padding:10px 24px;border-radius:30px;text-decoration:none;box-shadow:0 6px 14px rgba(243,201,72,.4);}

  /* ---- Ruleta mágica ---- */
  .wheel-card{background:linear-gradient(180deg,#fff,var(--pink-light));border-radius:26px;
    padding:30px 20px 26px;border:2px dashed var(--pink);}
  .wheel-card p.lead{margin:0 0 20px;font-size:1rem;}
  .wheel-stage{position:relative;width:240px;height:240px;margin:0 auto;}
  .wheel-pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);
    width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;
    border-top:22px solid var(--pink-deep);z-index:3;filter:drop-shadow(0 3px 3px rgba(0,0,0,.25));}
  .wheel{position:relative;width:100%;height:100%;border-radius:50%;
    background:conic-gradient(${conicStops});
    border:6px solid #fff;box-shadow:0 0 0 4px var(--gold), 0 10px 26px rgba(0,0,0,.2);
    transition:transform 3.6s cubic-bezier(.17,.67,.16,1);}
  .wheel-ico{position:absolute;top:50%;left:50%;font-size:1.3rem;
    transform-origin:0 0;pointer-events:none;}
  .wheel-hub{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--gold) 75%);
    border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.25);z-index:2;
    display:flex;align-items:center;justify-content:center;font-size:1.1rem;}
  #unicornioWheelBtn{margin-top:26px;background:linear-gradient(90deg,var(--pink),var(--lilac));
    color:#fff;font-family:'Baloo 2',Verdana,Arial,sans-serif;font-weight:700;font-size:1.02rem;
    border:0;border-radius:30px;padding:13px 30px;cursor:pointer;
    box-shadow:0 8px 18px color-mix(in srgb, var(--pink-deep) 35%, transparent);}
  #unicornioWheelBtn:disabled{opacity:.65;cursor:default;}
  .wheel-result{margin-top:20px;min-height:1.6em;font-family:'Baloo 2',Verdana,Arial,sans-serif;
    font-weight:700;font-size:1.15rem;color:var(--pink-deep);opacity:0;transition:opacity .4s ease;}
  .wheel-result.show{opacity:1;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:22px;}
  .gallery-item{border-radius:16px;overflow:hidden;border:3px solid var(--gold);transition:transform .25s ease;}
  .gallery-item:hover{transform:translateY(-4px) scale(1.02);border-color:var(--pink);}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(90,61,104,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:26px auto 0;text-align:left;}
  .rsvp-form label{font-size:.74rem;text-transform:uppercase;letter-spacing:1px;color:var(--pink-deep);font-weight:700;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px 12px;
    border:2px solid var(--pink-light);border-radius:12px;margin-top:5px;width:100%;background:#fffdfb;}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--gold);}
  .rsvp-form button{background:linear-gradient(90deg,var(--pink),var(--mint));color:#fff;border:0;
    padding:13px;border-radius:30px;font-weight:800;letter-spacing:.5px;cursor:pointer;
    box-shadow:0 8px 18px color-mix(in srgb, var(--pink-deep) 35%, transparent);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--mint-deep);text-align:center;text-decoration:none;font-weight:700;}
  .rsvp-status{text-align:center;color:#3f9d5c;font-weight:700;}

  footer{text-align:center;padding:40px 20px 50px;background:linear-gradient(180deg,transparent,var(--pink-light));color:var(--pink-deep);}
  footer .footer-ico{font-size:1.5rem;display:block;margin-bottom:8px;}
  footer p{margin:4px 0;font-size:.95rem;}

  @media (max-width:480px){
    .hero{padding:52px 16px 76px;}
    .hero-age{width:78px;height:78px;font-size:2rem;}
    .countdown div{min-width:60px;padding:10px 12px;}
    .cd-num{font-size:1.35rem;}
    .cloudcard{padding:24px 18px;}
    .wheel-stage{width:210px;height:210px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-cover"></div>
    ${clouds}${stars}
    <svg class="unicorn-wrap" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 108 C24 90 26 74 36 62 C30 56 28 46 34 36 C40 24 54 16 68 18 L88 12 L82 26 C90 30 96 40 94 52 C92 64 82 72 70 74 C74 84 74 96 70 108 Z" fill="#fff" stroke="${accent}" stroke-width="2.5"/>
      <path d="M88 12 L100 4 L92 22 Z" fill="${accent2}" stroke="${accent}" stroke-width="2"/>
      <path d="M34 36 C24 34 14 40 12 30 C22 28 26 20 36 22 C40 26 38 32 34 36 Z" fill="${accent}"/>
      <path d="M40 30 C50 22 62 20 72 26" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity=".8"/>
      <path d="M44 34 C56 24 68 22 78 30" fill="none" stroke="${accent2}" stroke-width="4" stroke-linecap="round" opacity=".8"/>
      <circle cx="62" cy="46" r="3" fill="${accent}"/>
    </svg>
    <p class="hero-kicker">Un reino mágico hecho fiesta</p>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="hero-age">${esc(d.edad)}</div>
    <p class="hero-sub">¡Cumple ${esc(d.edad)} años y te invita a cruzar el arcoíris!</p>
    <div class="rainbow-edge"></div>
  </div>

  <section>
    <h2 class="section-title">Cuenta regresiva mágica<small>Faltan para la fiesta</small></h2>
    ${cd.html}
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <div class="cloudcard">
      ${d.mensaje ? `<p>${esc(d.mensaje)}</p>` : ""}
      ${d.tematica ? `<span class="tematica">✨ ${esc(d.tematica)}</span>` : ""}
    </div>
  </section>` : ""}

  ${d.lugar || d.fecha || d.direccionMapa ? `<section>
    <h2 class="section-title">El reino mágico<small>Dónde es la fiesta</small></h2>
    <div class="location-card">
      ${d.lugar ? `<p><strong>${esc(d.lugar)}</strong></p>` : ""}
      <p>${esc(d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p>
      ${d.direccionMapa ? `<a class="map-btn" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación 🗺️</a>` : ""}
    </div>
  </section>` : ""}

  <section>
    <h2 class="section-title">Ruleta mágica<small>Descubrí tu poder de hoy</small></h2>
    <div class="wheel-card">
      <p class="lead">Girá la ruleta y descubrí qué poder mágico tenés hoy en el reino de ${esc(d.nombreChico)}.</p>
      <div class="wheel-stage">
        <span class="wheel-pointer"></span>
        <div class="wheel" id="unicornioWheel">${wheelLabels}</div>
        <div class="wheel-hub">🦄</div>
      </div>
      <button type="button" id="unicornioWheelBtn">✨ ¡Girar la ruleta mágica!</button>
      <p class="wheel-result" id="unicornioWheelResult"></p>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <h2 class="section-title">Fotos del reino mágico<small>Galería</small></h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2 class="section-title">Confirmá tu lugar en el reino<small>Te esperamos</small></h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    <span class="footer-ico">🦄🌈✨</span>
    <p>¡Vení a festejar el cumpleaños de <strong>${esc(d.nombreChico)}</strong>!</p>
    <p>Con cariño, la familia del reino mágico.</p>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var messages = ${JSON.stringify(WHEEL_SECTORS.map((s) => s.full))};
      var n = messages.length;
      var slice = 360 / n;
      var wheel = document.getElementById('unicornioWheel');
      var btn = document.getElementById('unicornioWheelBtn');
      var result = document.getElementById('unicornioWheelResult');
      if(!wheel || !btn) return;
      var currentRotation = 0;
      var spinning = false;
      btn.addEventListener('click', function(){
        if(spinning) return;
        spinning = true;
        btn.disabled = true;
        result.classList.remove('show');
        var idx = Math.floor(Math.random() * n);
        // El puntero apunta hacia arriba (0deg). Para que el sector "idx"
        // (que va de idx*slice a (idx+1)*slice) quede centrado ahí,
        // rotamos la rueda para que su centro llegue a 0deg, más vueltas
        // extra para que se note el giro.
        var sectorCenter = idx * slice + slice / 2;
        var extraSpins = 4 + Math.floor(Math.random() * 3); // 4 a 6 vueltas
        var targetRotation = extraSpins * 360 + (360 - sectorCenter);
        currentRotation += targetRotation;
        wheel.style.transform = 'rotate(' + currentRotation + 'deg)';
        setTimeout(function(){
          result.textContent = messages[idx];
          result.classList.add('show');
          btn.disabled = false;
          spinning = false;
        }, 3700);
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
    background:linear-gradient(150deg,#c9b8f0 0%,${d.accent} 42%,#a8d8ef 78%,${d.accent2} 100%);">
    <span style="position:absolute;top:10px;left:0;right:0;text-align:center;font-size:1.2rem;letter-spacing:10px;opacity:.6;">✦&nbsp;&nbsp;✦&nbsp;&nbsp;✦</span>
    <svg width="46" height="46" viewBox="0 0 120 120" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,.25));">
      <path d="M30 108 C24 90 26 74 36 62 C30 56 28 46 34 36 C40 24 54 16 68 18 L88 12 L82 26 C90 30 96 40 94 52 C92 64 82 72 70 74 C74 84 74 96 70 108 Z" fill="#fff" stroke="${d.accent}" stroke-width="3"/>
      <path d="M88 12 L100 4 L92 22 Z" fill="${d.accent2}" stroke="${d.accent}" stroke-width="2"/>
      <path d="M34 36 C24 34 14 40 12 30 C22 28 26 20 36 22 C40 26 38 32 34 36 Z" fill="${d.accent}"/>
    </svg>
    <div style="font-family:Verdana,Arial,sans-serif;font-weight:800;font-size:1.35rem;color:#fff;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,.3);">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#fff6d9;font-weight:700;">Reino mágico</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Unicornio Mágico",
  summary: "Fiesta de unicornios con degradé pastel arcoíris, un unicornio ilustrado y una ruleta mágica interactiva que revela un poder distinto en cada giro.",
  accent: "#d98ec4", accent2: "#8fd9c4", schema: infantilSchema, sampleData, render, cardPreview,
};
