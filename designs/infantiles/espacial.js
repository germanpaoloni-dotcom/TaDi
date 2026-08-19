const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");

const id = "inf-espacial";

const sampleData = {
  nombreChico: "Lautaro",
  edad: "8",
  fecha: "2027-05-24",
  hora: "17:00",
  lugar: "Club Atlético, Mendoza",
  direccionMapa: "https://maps.google.com/?q=Club+Atletico+Mendoza",
  mensaje: "¡La misión está por comenzar! Vení a festejar mi cumple entre astronautas, cohetes y planetas. Va a ser una fiesta fuera de este mundo 🚀",
  tematica: "Vení vestido de astronauta, la misión te espera",
  whatsapp: "5491100000013",
  coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80",
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&q=80",
    "https://images.unsplash.com/photo-1541873676-a18131494184?w=800&q=80",
    "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd-esp");
  const gal = galleryWidget(d.galeria, "gal-esp");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Misión Espacial de ${esc(d.nombreChico)}</title>
<style>
  :root{--night:#080b24;--night2:#0f1440;--cyan:#3ff0ff;--purple:#a45bff;--yellow:#ffd23f;--pink:#ff5fa8;}
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Trebuchet MS','Verdana',Arial,sans-serif;
    background:
      radial-gradient(2px 2px at 10% 20%, #fff, transparent),
      radial-gradient(2px 2px at 30% 70%, #fff, transparent),
      radial-gradient(1.5px 1.5px at 50% 15%, #fff, transparent),
      radial-gradient(2px 2px at 70% 45%, #fff, transparent),
      radial-gradient(1.5px 1.5px at 90% 80%, #fff, transparent),
      radial-gradient(2px 2px at 15% 90%, #fff, transparent),
      radial-gradient(1.5px 1.5px at 85% 25%, #fff, transparent),
      radial-gradient(1.5px 1.5px at 60% 60%, #fff, transparent),
      radial-gradient(1.5px 1.5px at 40% 40%, #fff, transparent),
      radial-gradient(1.5px 1.5px at 95% 55%, #fff, transparent),
      linear-gradient(180deg,var(--night),var(--night2) 50%,var(--night));
    background-attachment:fixed;
    background-size:100% 100%;
    color:#eaf0ff;
  }
  h1,h2,h3{font-family:'Trebuchet MS',Arial,sans-serif;}
  .neon-cyan{color:var(--cyan);text-shadow:0 0 6px var(--cyan),0 0 18px rgba(63,240,255,.6);}
  .neon-purple{color:var(--purple);text-shadow:0 0 6px var(--purple),0 0 18px rgba(164,91,255,.6);}
  .neon-yellow{color:var(--yellow);text-shadow:0 0 6px var(--yellow),0 0 16px rgba(255,210,63,.5);}

  .hero{
    position:relative;
    min-height:80vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:60px 20px 40px;
    background:
      radial-gradient(circle at 20% 15%, rgba(164,91,255,.35), transparent 45%),
      radial-gradient(circle at 85% 75%, rgba(63,240,255,.28), transparent 45%),
      url('${esc(d.coverImage)}') center/cover;
  }
  .hero::before{
    content:"";
    position:absolute;inset:0;
    background:linear-gradient(180deg, rgba(8,11,36,.55), rgba(8,11,36,.9));
  }
  .hero-inner{position:relative;z-index:1;max-width:640px;}
  .rocket{font-size:2.8rem;display:block;margin-bottom:6px;animation:float 3s ease-in-out infinite;}
  @keyframes float{0%,100%{transform:translateY(0) rotate(-5deg);}50%{transform:translateY(-14px) rotate(5deg);}}
  .hero-eyebrow{text-transform:uppercase;letter-spacing:4px;font-size:.75rem;color:var(--cyan);margin:0 0 10px;}
  .hero h1{
    font-size:clamp(2.2rem,8vw,3.6rem);
    margin:0 0 6px;
    line-height:1.1;
    color:#fff;
  }
  .hero .edad{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    margin-top:14px;
    font-size:clamp(1.1rem,4vw,1.4rem);
    background:radial-gradient(circle at 30% 30%, #ffe27a, var(--yellow) 60%, #e08a00);
    color:#241a00;
    font-weight:bold;
    border-radius:50%;
    width:clamp(72px,18vw,96px);
    height:clamp(72px,18vw,96px);
    box-shadow:0 0 24px rgba(255,210,63,.7), inset 0 -6px 10px rgba(0,0,0,.25);
  }
  .hero .edad strong{font-size:clamp(1.8rem,7vw,2.4rem);display:block;line-height:1;}
  .hero p.sub{margin-top:18px;font-size:1rem;color:#c8d3ff;}

  section{max-width:820px;margin:0 auto;padding:50px 20px;text-align:center;position:relative;}
  .section-title{
    display:inline-block;
    text-transform:uppercase;
    letter-spacing:2px;
    font-size:1.15rem;
    margin:0 0 26px;
    padding-bottom:8px;
    border-bottom:2px solid var(--purple);
  }
  .planet{position:absolute;border-radius:50%;opacity:.55;filter:blur(0px);pointer-events:none;}
  .planet.p1{width:70px;height:70px;top:10px;left:6%;background:radial-gradient(circle at 35% 30%, #ff9fd1, var(--pink) 60%, #7a1f4a);box-shadow:0 0 30px rgba(255,95,168,.4);}
  .planet.p2{width:46px;height:46px;bottom:0;right:8%;background:radial-gradient(circle at 35% 30%, #9fe9ff, var(--cyan) 60%, #0a5f6b);box-shadow:0 0 24px rgba(63,240,255,.4);}

  .panel{
    background:linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
    border:1px solid rgba(164,91,255,.35);
    border-radius:18px;
    padding:30px 24px;
    box-shadow:0 0 30px rgba(164,91,255,.15);
  }

  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .countdown div{
    min-width:64px;
    flex:1 1 64px;
    max-width:90px;
    background:rgba(8,11,36,.6);
    border:1px solid var(--cyan);
    border-radius:12px;
    padding:12px 4px;
    box-shadow:0 0 16px rgba(63,240,255,.35);
  }
  .cd-num{display:block;font-size:1.8rem;font-weight:bold;color:var(--cyan);text-shadow:0 0 8px rgba(63,240,255,.8);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:#a9b8ff;}
  .countdown-caption{margin-top:16px;font-size:.85rem;color:#a9b8ff;letter-spacing:1px;text-transform:uppercase;}

  .message{font-size:1.05rem;line-height:1.7;color:#dbe3ff;}
  .tematica-box{
    margin-top:20px;
    display:inline-block;
    padding:12px 20px;
    border-radius:14px;
    background:rgba(255,210,63,.1);
    border:1px dashed var(--yellow);
    color:var(--yellow);
    font-weight:bold;
  }

  .lugar-card{display:flex;flex-direction:column;gap:8px;align-items:center;}
  .lugar-card .fecha-badge{
    display:inline-block;
    background:var(--purple);
    color:#fff;
    padding:6px 16px;
    border-radius:20px;
    font-size:.85rem;
    letter-spacing:1px;
    text-transform:uppercase;
    box-shadow:0 0 14px rgba(164,91,255,.6);
  }
  .lugar-card a{color:var(--cyan);text-decoration:none;font-weight:bold;}
  .lugar-card a:hover{text-decoration:underline;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:14px;cursor:pointer;border:2px solid rgba(63,240,255,.4);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(3,4,20,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;box-shadow:0 0 40px rgba(63,240,255,.4);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:#a9b8ff;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px;border:1px solid rgba(63,240,255,.4);border-radius:10px;
    margin-top:5px;width:100%;background:rgba(8,11,36,.6);color:#fff;
  }
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#7c86b8;}
  .rsvp-form button{
    background:linear-gradient(90deg,var(--purple),var(--cyan));
    color:#fff;border:0;padding:13px;border-radius:10px;
    letter-spacing:1px;text-transform:uppercase;font-weight:bold;cursor:pointer;
    box-shadow:0 0 18px rgba(164,91,255,.5);
  }
  .rsvp-whatsapp{font-size:.85rem;color:var(--yellow);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--cyan);font-weight:bold;}

  footer{
    text-align:center;padding:36px 20px;font-size:.85rem;color:#8b96c9;
    border-top:1px solid rgba(164,91,255,.25);
  }
  footer .signoff{color:var(--cyan);font-weight:bold;letter-spacing:1px;}

  @media (max-width:480px){
    .planet{display:none;}
    section{padding:40px 16px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-inner">
      <span class="rocket">🚀</span>
      <p class="hero-eyebrow neon-cyan">Misión espacial</p>
      <h1>¡${esc(d.nombreChico)} cumple años!</h1>
      <div class="edad"><strong>${esc(d.edad)}</strong>años</div>
      <p class="sub">Preparate para el mejor lanzamiento del universo 🌌</p>
    </div>
  </div>

  <section>
    <div class="planet p1"></div>
    <div class="planet p2"></div>
    <h2 class="section-title neon-cyan">Cuenta regresiva para el despegue</h2>
    <div class="panel">
      ${cd.html}
      <p class="countdown-caption">T-menos... ¡preparando motores! 🛸</p>
    </div>
  </section>

  <section>
    <h2 class="section-title neon-purple">La misión</h2>
    <p class="message">${esc(d.mensaje)}</p>
    ${d.tematica ? `<div class="tematica-box">👨‍🚀 ${esc(d.tematica)}</div>` : ""}
  </section>

  <section>
    <h2 class="section-title neon-yellow">Base de lanzamiento</h2>
    <div class="panel lugar-card">
      <span class="fecha-badge">${esc(d.fecha)} · ${esc(d.hora)} hs</span>
      <p style="margin:6px 0 0;font-size:1.05rem;">${esc(d.lugar)}</p>
      ${d.direccionMapa ? `<a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">📍 Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>

  <section>
    <h2 class="section-title neon-cyan">Fotos de la tripulación</h2>
    ${gal.html}
  </section>

  <section>
    <h2 class="section-title neon-purple">Confirmá tu asistencia</h2>
    <div class="panel">
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <p class="signoff">🪐 ¡Nos vemos en órbita! 🪐</p>
    <p>Cumpleaños espacial de ${esc(d.nombreChico)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "infantiles", name: "Misión Espacial",
  summary: "Cumple temático de astronautas con fondo estrellado, acentos neón y cuenta regresiva de lanzamiento.",
  accent: "#3ff0ff", schema: infantilSchema, sampleData, render,
};
