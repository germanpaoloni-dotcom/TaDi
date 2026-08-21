const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "emp-lanzamiento-producto";

const sampleData = {
  nombreEvento: "Lanzamiento NOVA X",
  empresa: "Nova Devices",
  fecha: "2027-02-12", hora: "19:00", lugar: "Espacio Wave, Palermo",
  direccionMapa: "https://maps.google.com/?q=Espacio+Wave+Palermo",
  descripcion: "Te invitamos a descubrir en primicia el producto que va a cambiar las reglas del juego. Sumate a nuestro nuevo camino, con innovación y celebración.",
  agenda: "19:00 - Bienvenida y drinks\n19:45 - Presentación del producto\n20:30 - Prueba en vivo\n21:00 - Networking",
  oradores: "Marina Suárez - CEO, Nova Devices\nFacundo Ibarra - Head of Product",
  dressCode: "Casual elegante",
  contacto: "5491100000007",
  coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#c9a15e");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "19:00"}:00` : sampleData.fecha, "cd8");
  const gal = galleryWidget(d.galeria, "gal8");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: false, withMenu: false, whatsapp: d.contacto });

  const agendaLines = (d.agenda || "").split("\n").filter(Boolean);
  const agendaItems = agendaLines.map((line) => {
    const [hora, ...rest] = line.split(" - ");
    const texto = rest.join(" - ").trim();
    return `<li><span class="ag-time">${esc(hora.trim())}</span><span class="ag-text">${esc(texto || hora.trim())}</span></li>`;
  }).join("");

  const speakerItems = (d.oradores || "").split("\n").filter(Boolean).map((line) => {
    const [nombre, cargo] = line.split(" - ");
    return `<div class="speaker"><span class="sp-name">${esc((nombre || "").trim())}</span>${cargo ? `<span class="sp-role">${esc(cargo.trim())}</span>` : ""}</div>`;
  }).join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&display=swap" rel="stylesheet">
<style>
  :root{
    --wine:#3a0d1f;
    --wine2:#5c1230;
    --wine-deep:#260815;
    --gold:${accent};
    --blush:#f0d8bb;
    --blush-dim:#d8b895;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    font-family:'Cormorant Garamond',serif;
    background:radial-gradient(120% 90% at 30% 0%,var(--wine2),var(--wine) 55%,var(--wine-deep) 100%);
    color:var(--blush);
  }
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:700;margin:0;}
  a{color:var(--gold);}
  .leaf{position:fixed;pointer-events:none;z-index:0;opacity:.55;}
  .leaf svg{display:block;width:100%;height:100%;}
  .leaf-tr{top:0;right:-30px;width:190px;height:190px;}
  .leaf-bl{bottom:0;left:-30px;width:170px;height:170px;}
  .frame{position:relative;max-width:760px;margin:0 auto;padding:0 18px;}
  .frame::before{
    content:"";position:absolute;inset:14px;border:1px solid color-mix(in srgb, ${accent} 55%, transparent);pointer-events:none;z-index:0;
  }

  .hero{
    position:relative;z-index:1;
    max-width:640px;margin:0 auto;padding:64px 24px 40px;
    text-align:center;
  }
  .hero .powered{font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;color:var(--blush-dim);}
  .hero .brand{margin-top:6px;font-family:'Playfair Display',serif;font-weight:700;font-size:1.1rem;letter-spacing:.03em;color:var(--gold);}
  .hero-logo-wrap{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:8px;padding:10px 18px;margin-top:6px;}
  .hero-logo{display:block;max-height:34px;max-width:150px;width:auto;height:auto;}
  .hero h1{
    margin-top:22px;
    font-size:clamp(2.6rem,10vw,4.4rem);
    line-height:1.02;
    letter-spacing:.01em;
    color:var(--blush);
    text-transform:uppercase;
  }
  .hero .empresa-tag{
    margin-top:18px;font-size:clamp(1.1rem,4vw,1.4rem);font-family:'Cormorant Garamond',serif;
    color:var(--blush-dim);
  }
  .hero p.desc{
    max-width:480px;margin:14px auto 0;font-size:1.05rem;line-height:1.5;color:var(--blush-dim);
  }

  section{position:relative;z-index:1;max-width:640px;margin:0 auto;padding:34px 24px;text-align:center;}
  .kicker{
    display:block;color:var(--gold);text-transform:uppercase;letter-spacing:.25em;
    font-family:'Cormorant Garamond',serif;font-size:.85rem;margin-bottom:10px;
  }
  h2.title{font-size:clamp(1.5rem,5vw,2.1rem);color:var(--blush);}

  .divider{display:flex;align-items:center;gap:14px;max-width:420px;margin:22px auto;}
  .divider span{flex:1;height:1px;background:color-mix(in srgb, ${accent} 50%, transparent);}
  .divider em{font-style:normal;color:var(--gold);font-size:1.3rem;}

  .date-row{
    display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:18px;margin:20px 0;
  }
  .date-col{flex:1 1 130px;text-align:center;}
  .date-col .rule{height:1px;background:color-mix(in srgb, ${accent} 50%, transparent);margin-bottom:8px;}
  .date-col .lbl{font-family:'Playfair Display',serif;font-size:clamp(1.1rem,4vw,1.4rem);text-transform:uppercase;letter-spacing:.05em;color:var(--blush);}
  .date-col .sub{font-size:.9rem;color:var(--blush-dim);margin-top:4px;}
  .date-day{flex:0 0 auto;}
  .date-day .num{font-family:'Playfair Display',serif;font-size:clamp(2.6rem,10vw,3.6rem);color:var(--blush);line-height:1;}
  .date-day .year{font-size:1rem;color:var(--blush-dim);}

  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .countdown div{border:1px solid color-mix(in srgb, ${accent} 50%, transparent);border-radius:6px;padding:12px 16px;min-width:64px;}
  .cd-num{display:block;font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--blush);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--blush-dim);}

  .info-line{font-size:1.05rem;color:var(--blush-dim);line-height:1.7;}
  .info-line strong{color:var(--blush);font-weight:600;}

  .agenda-list{list-style:none;margin:18px 0 0;padding:0;text-align:left;max-width:420px;margin-left:auto;margin-right:auto;}
  .agenda-list li{display:flex;gap:14px;padding:10px 0;border-bottom:1px solid color-mix(in srgb, ${accent} 25%, transparent);}
  .agenda-list li:last-child{border-bottom:0;}
  .ag-time{flex:0 0 auto;color:var(--gold);font-family:'Playfair Display',serif;font-size:1rem;}
  .ag-text{color:var(--blush-dim);}

  .speakers{display:flex;flex-wrap:wrap;justify-content:center;gap:24px;margin-top:16px;}
  .speaker{min-width:160px;}
  .sp-name{display:block;font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--blush);}
  .sp-role{display:block;font-size:.9rem;color:var(--blush-dim);margin-top:2px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px;}
  .gallery-item img{width:100%;height:150px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid color-mix(in srgb, ${accent} 40%, transparent);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,4,12,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--blush);font-size:2rem;cursor:pointer;line-height:1;}

  .rsvp-form{display:flex;flex-direction:column;gap:12px;max-width:380px;margin:18px auto 0;text-align:left;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--blush-dim);display:flex;flex-direction:column;gap:4px;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px 12px;border-radius:4px;
    border:1px solid color-mix(in srgb, ${accent} 50%, transparent);background:rgba(0,0,0,.18);color:var(--blush);
  }
  .rsvp-form button{
    background:var(--gold);color:var(--wine-deep);border:0;padding:12px;border-radius:4px;
    cursor:pointer;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-family:'Cormorant Garamond',serif;
  }
  .rsvp-whatsapp{text-align:center;color:var(--gold);text-decoration:underline;}
  .rsvp-status{font-weight:600;color:var(--gold);text-align:center;}

  footer{position:relative;z-index:1;text-align:center;padding:30px 24px 46px;font-size:.95rem;color:var(--blush-dim);}
  footer .thanks{font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--blush);margin-bottom:8px;}

  @media (max-width:420px){
    .frame::before{inset:8px;}
    .hero{padding:48px 16px 30px;}
    section{padding:26px 16px;}
  }
</style></head>
<body>
  <div class="leaf leaf-tr" aria-hidden="true">
    <svg width="190" height="190" viewBox="0 0 190 190" xmlns="http://www.w3.org/2000/svg">
      <g stroke="${accent}" stroke-width="1" fill="#7a1030" opacity=".8">
        <path d="M190 0 C150 20 120 55 110 100 C140 70 165 45 190 30 Z"/>
        <path d="M190 0 C160 35 140 70 135 115 C160 80 178 45 190 20 Z"/>
        <path d="M190 10 C170 45 158 80 158 120 C178 90 190 55 190 10 Z"/>
        <path d="M170 0 C130 25 100 60 90 105 C122 78 148 50 170 0 Z"/>
      </g>
    </svg>
  </div>
  <div class="leaf leaf-bl" aria-hidden="true">
    <svg width="170" height="170" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
      <g stroke="${accent}" stroke-width="1" fill="#7a1030" opacity=".8">
        <path d="M0 170 C40 150 70 115 80 70 C50 100 25 125 0 140 Z"/>
        <path d="M0 170 C30 135 50 100 55 55 C30 90 12 125 0 150 Z"/>
        <path d="M0 160 C20 125 32 90 32 50 C12 80 0 115 0 160 Z"/>
        <path d="M20 170 C60 145 90 110 100 65 C68 92 42 120 20 170 Z"/>
      </g>
    </svg>
  </div>

  <div class="frame">
    <div class="hero">
      <div class="powered">Powered by</div>
      ${d.logo ? `<div class="hero-logo-wrap"><img class="hero-logo" src="${esc(d.logo)}" alt="${esc(d.empresa)}"></div>` : (d.empresa ? `<div class="brand">${esc(d.empresa)}</div>` : "")}
      <h1>You're<br>Invited</h1>
      <p class="empresa-tag">Estamos a punto de lanzar <strong>${esc(d.nombreEvento)}</strong></p>
      ${d.descripcion ? `<p class="desc">${esc(d.descripcion)}</p>` : ""}
    </div>

    <section>
      <span class="kicker">Cuenta regresiva</span>
      ${cd.html}
    </section>

    <section>
      <span class="kicker">Cuándo y dónde</span>
      <div class="date-row">
        <div class="date-col">
          <div class="rule"></div>
          <div class="lbl">${esc(d.fecha)}</div>
          ${d.lugar ? `<div class="sub">${d.direccionMapa ? `<a href="${esc(d.direccionMapa)}" target="_blank">${esc(d.lugar)}</a>` : esc(d.lugar)}</div>` : ""}
        </div>
        ${d.hora ? `<div class="date-col date-day">
          <div class="num">${esc(d.hora)}</div>
          <div class="year">Horario</div>
        </div>` : ""}
        ${d.dressCode ? `<div class="date-col">
          <div class="rule"></div>
          <div class="lbl">Dress code</div>
          <div class="sub">${esc(d.dressCode)}</div>
        </div>` : ""}
      </div>
      <div class="divider"><span></span><em>&#10058;</em><span></span></div>
      <p class="info-line">Tu presencia significa mucho para nosotros.<br>Sumate a celebrar este nuevo comienzo.</p>
    </section>

    ${agendaLines.length ? `<section>
      <span class="kicker">Agenda del día</span>
      <ul class="agenda-list">
        ${agendaItems}
      </ul>
    </section>` : ""}

    ${speakerItems ? `<section>
      <span class="kicker">Oradores</span>
      <div class="speakers">${speakerItems}</div>
    </section>` : ""}

    ${d.galeria && d.galeria.length ? `<section>
      <span class="kicker">Adelanto</span>
      ${gal.html}
    </section>` : ""}

    <section>
      <span class="kicker">Confirmá tu lugar</span>
      ${rsvp.html}
    </section>

    <footer>
      <div class="thanks">We can't wait to see you there!</div>
      ${d.empresa ? `${esc(d.empresa)} · ` : ""}Todos los derechos reservados
    </footer>
  </div>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "empresariales", name: "Lanzamiento de Producto",
  summary: "Invitación tipo tarjeta elegante en tonos vino y dorado, con hojas ornamentales y tipografía serif, ideal para el lanzamiento de un producto.",
  accent: "#c9a15e", accent2: "#5c1230", schema: empresarialSchema, sampleData, render,
};
