const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-princesas";

const sampleData = {
  nombreChico: "Delfina",
  edad: "5",
  fecha: "2027-05-24",
  hora: "17:00",
  lugar: "Salón Arcoíris, San Salvador de Jujuy",
  direccionMapa: "https://maps.google.com/?q=Salon+Arcoiris+San+Salvador+de+Jujuy",
  mensaje: "Delfina se convierte en princesa por un día y quiere compartir su cuento de hadas favorito con vos. Habrá torta, magia y mucho baile en el castillo. ¡No puede faltar su invitado/a de honor!",
  tematica: "Vení vestida de tu princesa favorita 👑",
  whatsapp: "5491100000011",
  coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-e3fa06c6c9c8?w=800&q=80",
    "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=80",
    "https://images.unsplash.com/photo-1610737632200-83b6a48a349d?w=800&q=80",
  ],
};

// Tile de "almenas" de castillo (crenellation) usado como borde decorativo
// entre el hero y el resto de la página.
const CASTLE_TILE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cpath d='M0 20 L0 8 L8 8 L8 0 L16 0 L16 8 L24 8 L24 0 L32 0 L32 8 L40 8 L40 20 Z' fill='%23fff7fb'/%3E%3C/svg%3E";

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#ff5fa2");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-princesa");
  const gal = galleryWidget(d.galeria, "gal-princesa");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const sparkles = [
    { top: "12%", left: "8%", delay: "0s", size: "1.1rem" },
    { top: "20%", left: "85%", delay: ".6s", size: ".9rem" },
    { top: "62%", left: "12%", delay: "1.2s", size: "1.4rem" },
    { top: "70%", left: "90%", delay: ".3s", size: "1rem" },
    { top: "38%", left: "50%", delay: "1.6s", size: "1.2rem" },
    { top: "8%", left: "45%", delay: "2s", size: ".8rem" },
  ]
    .map(
      (s) =>
        `<span class="sparkle" style="top:${s.top};left:${s.left};animation-delay:${s.delay};font-size:${s.size}">✦</span>`
    )
    .join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreChico)} cumple ${esc(d.edad)} años</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Quicksand:wght@400;500;600;700&display=swap');
  :root{
    --rose:${accent};
    --rose-deep:color-mix(in srgb, ${accent}, black 20%);
    --rose-light:color-mix(in srgb, ${accent}, white 80%);
    --gold:#d4af37;
    --gold-light:#f6e2a8;
    --cream:#fff7fb;
    --ink:#5c3457;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;overflow-x:hidden;}
  body{font-family:'Quicksand',Arial,sans-serif;background:var(--cream);color:var(--ink);}
  h1,h2,.script{font-family:'Great Vibes',cursive;}
  a{color:inherit;}

  .hero{
    position:relative;
    min-height:78vh;
    padding:70px 20px 90px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;
    background:
      radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 45%),
      linear-gradient(160deg, var(--rose) 0%, var(--rose-deep) 45%, #7a2a6b 100%);
    color:#fff;
    overflow:hidden;
  }
  .hero-cover{
    position:absolute;inset:0;
    background:url('${esc(d.coverImage)}') center/cover;
    opacity:.28;mix-blend-mode:overlay;
  }
  .sparkle{
    position:absolute;color:#fff8dc;text-shadow:0 0 8px rgba(255,255,255,.8);
    animation:twinkle 2.6s ease-in-out infinite;pointer-events:none;
  }
  @keyframes twinkle{
    0%,100%{opacity:.15;transform:scale(.7) rotate(0deg);}
    50%{opacity:1;transform:scale(1.15) rotate(20deg);}
  }
  .crown{
    position:relative;z-index:1;
    font-size:3rem;display:inline-block;margin-bottom:6px;
    animation:wiggle 3.5s ease-in-out infinite;
    filter:drop-shadow(0 4px 8px rgba(0,0,0,.25));
  }
  @keyframes wiggle{
    0%,100%{transform:rotate(-6deg);}
    50%{transform:rotate(6deg);}
  }
  .hero-kicker{
    position:relative;z-index:1;
    text-transform:uppercase;letter-spacing:4px;font-size:.75rem;
    color:var(--gold-light);font-weight:600;margin:0 0 8px;
  }
  .hero h1{
    position:relative;z-index:1;
    font-size:clamp(3rem,12vw,5.5rem);margin:0;line-height:1;
    color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.3);
  }
  .hero-age{
    position:relative;z-index:1;
    display:inline-flex;align-items:center;justify-content:center;
    margin-top:18px;width:96px;height:96px;border-radius:50%;
    background:radial-gradient(circle at 35% 30%, var(--gold-light), var(--gold) 70%);
    color:#5c3457;font-weight:700;font-size:2.6rem;
    box-shadow:0 0 0 4px rgba(255,255,255,.6), 0 8px 20px rgba(0,0,0,.25);
  }
  .hero-sub{
    position:relative;z-index:1;
    margin-top:16px;font-size:1rem;letter-spacing:1px;color:#fff;
  }
  .castle-edge{
    position:absolute;bottom:-1px;left:0;width:100%;height:20px;
    background-image:url("${CASTLE_TILE}");
    background-repeat:repeat-x;background-size:40px 20px;
  }

  section{max-width:740px;margin:0 auto;padding:56px 22px;text-align:center;}
  .section-title{
    font-family:'Great Vibes',cursive;
    font-size:2.4rem;color:var(--rose-deep);margin:0 0 4px;
  }
  .section-title small{
    display:block;font-family:'Quicksand',sans-serif;
    text-transform:uppercase;letter-spacing:3px;font-size:.65rem;color:var(--gold);
    font-weight:700;margin-top:4px;
  }

  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
  .countdown div{
    background:linear-gradient(160deg,#fff,var(--rose-light));
    border:2px solid var(--gold);border-radius:16px;
    padding:14px 16px;min-width:70px;
    box-shadow:0 6px 14px color-mix(in srgb, var(--rose-deep) 15%, transparent);
  }
  .cd-num{display:block;font-size:1.8rem;font-weight:700;color:var(--rose-deep);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink);}

  .storycard{
    position:relative;
    background:#fff;
    border:2px dashed var(--gold);
    border-radius:24px;
    padding:34px 26px;
    box-shadow:0 10px 28px color-mix(in srgb, var(--rose-deep) 10%, transparent);
  }
  .storycard p{font-size:1.05rem;line-height:1.7;margin:0;}
  .tematica{
    margin-top:20px;display:inline-block;
    background:linear-gradient(90deg,var(--rose),var(--rose-deep));
    color:#fff;padding:10px 22px;border-radius:30px;
    font-weight:600;font-size:.9rem;box-shadow:0 6px 14px color-mix(in srgb, var(--rose-deep) 30%, transparent);
  }

  .location-card{
    background:linear-gradient(160deg,#fff,var(--rose-light));
    border-radius:20px;padding:30px 24px;
    border:2px solid var(--gold-light);
  }
  .location-card p{font-size:1.05rem;margin:6px 0;}
  .map-btn{
    display:inline-block;margin-top:16px;
    background:var(--gold);color:#5c3457;font-weight:700;
    padding:10px 24px;border-radius:30px;text-decoration:none;
    box-shadow:0 6px 14px rgba(212,175,55,.35);
  }

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:24px;}
  .gallery-item{
    border-radius:14px;overflow:hidden;border:3px solid var(--gold-light);
    transition:transform .25s ease;
  }
  .gallery-item:hover{transform:translateY(-4px) scale(1.02);border-color:var(--gold);}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(92,52,87,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .generator input{
    font-family:inherit;font-size:1rem;padding:11px 14px;border:2px solid var(--rose-light);
    border-radius:30px;width:100%;margin-bottom:14px;background:#fffafd;text-align:center;
  }
  .generator input:focus{outline:none;border-color:var(--gold);}
  .generator button{
    width:100%;background:linear-gradient(90deg,var(--gold),var(--gold-light));
    color:#5c3457;font-weight:700;border:0;border-radius:30px;padding:13px;
    cursor:pointer;box-shadow:0 6px 14px rgba(212,175,55,.35);
  }
  .generator-result{
    margin-top:18px;text-align:center;font-family:'Great Vibes',cursive;
    font-size:1.8rem;color:var(--rose-deep);min-height:1.4em;
  }

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:26px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--rose-deep);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px 12px;border:2px solid var(--rose-light);
    border-radius:12px;margin-top:5px;width:100%;background:#fffafd;
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--gold);}
  .rsvp-form button{
    background:linear-gradient(90deg,var(--rose),var(--rose-deep));
    color:#fff;border:0;padding:13px;border-radius:30px;
    font-weight:700;letter-spacing:.5px;cursor:pointer;
    box-shadow:0 8px 18px color-mix(in srgb, var(--rose-deep) 35%, transparent);
  }
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold);text-align:center;text-decoration:none;font-weight:600;}
  .rsvp-status{text-align:center;color:#3f9d5c;font-weight:700;}

  footer{
    text-align:center;padding:40px 20px 50px;
    background:linear-gradient(180deg,transparent,var(--rose-light));
    color:var(--rose-deep);
  }
  footer .crown-small{font-size:1.6rem;display:block;margin-bottom:8px;}
  footer p{margin:4px 0;font-size:.95rem;}

  @media (max-width:480px){
    .hero{padding:56px 16px 80px;}
    .hero-age{width:80px;height:80px;font-size:2.1rem;}
    .countdown div{min-width:60px;padding:10px 12px;}
    .cd-num{font-size:1.4rem;}
    .storycard{padding:26px 18px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-cover"></div>
    ${sparkles}
    <span class="crown">👑</span>
    <p class="hero-kicker">Un cuento de hadas hecho fiesta</p>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="hero-age">${esc(d.edad)}</div>
    <p class="hero-sub">¡Cumple ${esc(d.edad)} años y quiere celebrarlo con vos!</p>
    <div class="castle-edge"></div>
  </div>

  <section>
    <h2 class="section-title">Cuenta regresiva<small>Faltan para la fiesta</small></h2>
    ${cd.html}
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <div class="storycard">
      ${d.mensaje ? `<p>${esc(d.mensaje)}</p>` : ""}
      ${d.tematica ? `<span class="tematica">✨ ${esc(d.tematica)}</span>` : ""}
    </div>
  </section>` : ""}

  <section>
    <h2 class="section-title">El castillo<small>Dónde es la fiesta</small></h2>
    <div class="location-card">
      ${d.lugar ? `<p><strong>${esc(d.lugar)}</strong></p>` : ""}
      <p>${esc(d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p>
      ${d.direccionMapa ? `<a class="map-btn" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación 🗺️</a>` : ""}
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <h2 class="section-title">Momentos mágicos<small>Galería</small></h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <h2 class="section-title">Descubrí tu nombre de princesa<small>El hada madrina te espera</small></h2>
    <div class="storycard generator">
      <input type="text" id="princessNameInput" placeholder="Escribí tu nombre..." value="${esc(d.nombreChico)}">
      <button type="button" id="princessNameBtn">✨ ¡Transformarme!</button>
      <p class="generator-result" id="princessNameResult"></p>
    </div>
  </section>

  <section>
    <h2 class="section-title">Confirmá tu asistencia<small>Te esperamos en el reino</small></h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    <span class="crown-small">👑✨👑</span>
    <p>¡Vení a festejar el cumpleaños de <strong>${esc(d.nombreChico)}</strong>!</p>
    <p>Con cariño, la familia de la princesa.</p>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var prefixes = ['Princesa','Reina','Hada','Duquesa','Condesa','Estrella','Lady','Dulce'];
      var suffixes = ['Luna','Aurora','Jazmín','Cristal','Rosa','Estrellita','Perla','Encanto'];
      var input = document.getElementById('princessNameInput');
      var btn = document.getElementById('princessNameBtn');
      var result = document.getElementById('princessNameResult');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var val = (input.value || '').trim() || 'Princesa';
        var seed = 0;
        for (var i = 0; i < val.length; i++) seed += val.charCodeAt(i);
        var p = prefixes[seed % prefixes.length];
        var s = suffixes[(seed * 7 + val.length) % suffixes.length];
        result.textContent = '✨ ' + p + ' ' + s + ' ✨';
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
    background:linear-gradient(160deg,#e0357f 0%,#a83570 55%,#7a2a6b 100%);">
    <span style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:2.6rem;letter-spacing:8px;opacity:.5;">✦&nbsp;&nbsp;✦</span>
    <span style="font-size:1.9rem;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3));">👑</span>
    <div style="font-family:'Great Vibes','Brush Script MT','Segoe Script',cursive;font-size:1.7rem;color:#fff;line-height:1;">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#f6e2a8;font-weight:600;">Un cuento de hadas</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Princesas",
  summary: "Fiesta temática de princesas con paleta rosa y dorado, borde de castillo, brillos animados y tipografía cursiva elegante.",
  accent: "#e0357f", schema: infantilSchema, sampleData, render, cardPreview,
};
