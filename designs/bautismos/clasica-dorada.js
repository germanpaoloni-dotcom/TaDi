const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");

const id = "bau-clasica-dorada";

const sampleData = {
  nombreChico: "Emilia",
  padres: "Julieta y Tomás",
  padrinos: "Sofía y Martín",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "13:00",
  lugarFiesta: "Salón Los Robles, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Robles+San+Isidro",
  mensaje: "Con la gracia de Dios y la alegría de toda la familia, los invitamos a acompañarnos en el bautismo de Emilia, un día para celebrar la fe y el amor que la reciben.",
  whatsapp: "5491100000020",
  coverImage: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80",
    "https://images.unsplash.com/photo-1518057111178-44a106bad636?w=800&q=80",
  ],
};

// Motivos religiosos sutiles en línea/dorado, dibujados a mano en SVG para
// no depender de ningún ícono ni fuente externa.
const crossSVG = `<svg class="motif motif-cross" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="12" y1="1" x2="12" y2="39" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="1" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const doveSVG = `<svg class="motif motif-dove" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 42 C 20 18, 42 14, 55 27 C 64 16, 86 10, 112 20 C 96 24, 82 30, 74 38 C 84 40, 96 38, 106 32 C 98 46, 80 52, 66 48 C 68 58, 60 66, 50 66 C 55 58, 54 50, 46 46 C 30 50, 16 48, 8 42 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <circle cx="60" cy="24" r="1.6" fill="currentColor"/>
</svg>`;

function branchSVG(flip) {
  return `<svg class="motif motif-branch${flip ? " flip" : ""}" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 10 H88" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <ellipse cx="18" cy="6" rx="6" ry="2.6" transform="rotate(-28 18 6)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="34" cy="14" rx="6" ry="2.6" transform="rotate(28 34 14)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="50" cy="6" rx="6" ry="2.6" transform="rotate(-28 50 6)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="66" cy="14" rx="6" ry="2.6" transform="rotate(28 66 14)" stroke="currentColor" stroke-width="1"/>
    <circle cx="82" cy="10" r="2.4" stroke="currentColor" stroke-width="1"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${branchSVG(false)}${crossSVG}${branchSVG(true)}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --gold:#c19a4b;
    --gold-dark:#96742f;
    --cream:#fbf6ea;
    --cream2:#f2e7cf;
    --ink:#3c3325;
    --ink-soft:#6e6249;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Iowan Old Style','Palatino Linotype',Georgia,serif;background:var(--cream);color:var(--ink);}
  img{max-width:100%;}
  .motif{color:var(--gold);}
  .motif-cross{width:18px;height:30px;flex:0 0 auto;}
  .motif-dove{width:clamp(48px,10vw,72px);height:auto;}
  .motif-branch{width:clamp(60px,16vw,90px);height:16px;flex:0 0 auto;}
  .motif-branch.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 auto 22px;}

  .hero{position:relative;min-height:88vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px 20px;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;filter:saturate(.85);}
  .hero-bg::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,rgba(60,51,37,.28),rgba(35,29,20,.72));}
  .hero-frame{position:absolute;inset:14px;border:1px solid rgba(250,244,227,.55);pointer-events:none;}
  .hero-content{position:relative;z-index:1;color:#faf4e3;max-width:560px;}
  .hero-content .motif-cross{color:var(--gold);margin:0 auto 18px;}
  .eyebrow{letter-spacing:.35em;text-transform:uppercase;font-size:clamp(.68rem,1.6vw,.8rem);opacity:.9;}
  .hero-content h1{font-size:clamp(2.6rem,8vw,4.4rem);font-weight:400;margin:14px 0 6px;font-style:italic;letter-spacing:1px;}
  .hero-date{letter-spacing:.2em;text-transform:uppercase;font-size:clamp(.75rem,2vw,.9rem);color:var(--gold);margin-top:10px;}

  section{max-width:740px;margin:0 auto;padding:60px 24px;text-align:center;}
  h2{font-weight:400;letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.05rem,2.6vw,1.35rem);color:var(--ink);margin:0 0 30px;}

  .message-wrap{position:relative;}
  .message-wrap .motif-dove{margin:0 auto 18px;}
  .message{font-size:clamp(1.02rem,2.4vw,1.2rem);line-height:1.8;font-style:italic;color:var(--ink-soft);}

  .countdown{display:flex;gap:clamp(12px,4vw,28px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:52px;}
  .cd-num{font-size:clamp(1.5rem,4vw,2.1rem);color:var(--gold-dark);font-family:Georgia,serif;}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);}

  .timeline{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;margin-top:10px;}
  .timeline .card{background:#fff;border:1px solid var(--cream2);box-shadow:0 4px 18px rgba(150,116,47,.08);padding:30px 32px;border-radius:2px;min-width:220px;flex:1 1 220px;max-width:280px;}
  .timeline .card .ico{width:26px;height:26px;margin:0 auto 12px;color:var(--gold);}
  .timeline .card h3{margin:0 0 10px;color:var(--gold-dark);font-weight:400;letter-spacing:1.5px;text-transform:uppercase;font-size:.95rem;}
  .timeline .card p{margin:0;line-height:1.6;color:var(--ink-soft);}
  .maplink{display:inline-block;margin-top:24px;color:var(--gold-dark);text-decoration:none;border-bottom:1px solid var(--gold);letter-spacing:.5px;font-size:.9rem;}

  .familia{display:flex;gap:40px;justify-content:center;flex-wrap:wrap;margin-top:8px;}
  .familia .col{flex:1 1 220px;max-width:260px;}
  .familia .col .label{display:block;letter-spacing:2px;text-transform:uppercase;font-size:.7rem;color:var(--gold-dark);margin-bottom:10px;}
  .familia .col .names{font-size:clamp(1.05rem,2.6vw,1.25rem);font-style:italic;color:var(--ink);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:2px;cursor:pointer;filter:sepia(.08);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,25,16,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fbf6ea;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid var(--cream2);border-radius:2px;margin-top:4px;width:100%;background:#fff;}
  .rsvp-form button{background:var(--gold-dark);color:#fff;border:0;padding:13px;border-radius:2px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;font-size:.85rem;}
  .rsvp-form button:hover{background:var(--gold);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold-dark);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:#6b8f5a;font-weight:bold;}

  footer{text-align:center;padding:40px 24px 50px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid var(--cream2);}
  footer .motif-cross{width:14px;height:22px;margin:0 auto 12px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-frame"></div>
    <div class="hero-content">
      ${crossSVG}
      <p class="eyebrow">Bautismo</p>
      <h1>${esc(d.nombreChico)}</h1>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  <section>
    ${divider()}
    <h2>Faltan para el gran día</h2>
    ${cd.html}
  </section>

  <section class="message-wrap">
    ${doveSVG}
    <p class="message">${esc(d.mensaje)}</p>
  </section>

  <section>
    ${divider()}
    <h2>Cronograma</h2>
    <div class="timeline">
      <div class="card">
        <svg class="ico" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="39" stroke="currentColor" stroke-width="1.4"/><line x1="1" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="1.4"/></svg>
        <h3>Ceremonia</h3>
        <p>${esc(d.horaCeremonia)}<br>${esc(d.lugarCeremonia)}</p>
      </div>
      <div class="card">
        <svg class="ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3"/><path d="M12 7v5l3.2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <h3>Fiesta</h3>
        <p>${esc(d.horaFiesta)}<br>${esc(d.lugarFiesta)}</p>
      </div>
    </div>
    ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
  </section>

  <section>
    ${divider()}
    <h2>Padres y padrinos</h2>
    <div class="familia">
      <div class="col"><span class="label">Padres</span><span class="names">${esc(d.padres)}</span></div>
      <div class="col"><span class="label">Padrinos</span><span class="names">${esc(d.padrinos)}</span></div>
    </div>
  </section>

  <section>
    ${divider()}
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section>
    ${divider()}
    <h2>Confirmá tu asistencia</h2>
    ${rsvp.html}
  </section>

  <footer>
    ${crossSVG}
    Con todo nuestro cariño, ${esc(d.padres)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Clásica Dorada",
  summary: "Hero elegante en crema y dorado con motivos religiosos sutiles, ideal para un bautismo tradicional.",
  accent: "#c19a4b", schema: bautismoSchema, sampleData, render,
};
