const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-elegante-clasico";

const sampleData = {
  novia: "Sofía", novio: "Tomás",
  fecha: "2027-04-17",
  lugar: "Buenos Aires",
  mensaje: "Nos casamos y queremos que lo sepas primero. ¡Guardá la fecha!",
  instagram: "@sofiaytomas2027",
  whatsapp: "5491100000050",
  coverImage: "https://images.unsplash.com/photo-1683238112508-27ec0155e774?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#c9a86a");
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const calLink = googleCalendarLink({
    title: `${d.novia || ""} & ${d.novio || ""} se casan`,
    dateISO: d.fecha,
    time: "18:00",
    location: d.lugar || "",
  });

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  let fechaLarga = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
        fechaLarga = `${partes[2]} · ${partes[1]} · ${partes[0]} — ${dias[dt.getDay()]}`;
      }
    }
  }

  const laurelLeft = `<svg class="laurel laurel-left" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M55 5C40 20 30 40 28 60C26 80 32 100 45 115" stroke="currentColor" stroke-width="1.4"/>
    <path d="M28 20c-10 2-16 8-18 14M30 38c-11 1-18 6-21 12M30 56c-11 0-19 5-22 11M32 74c-10 0-18 4-21 10M35 92c-9 -1-17 2-20 8" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;
  const laurelRight = `<svg class="laurel laurel-right" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5 5C20 20 30 40 32 60C34 80 28 100 15 115" stroke="currentColor" stroke-width="1.4"/>
    <path d="M32 20c10 2 16 8 18 14M30 38c11 1 18 6 21 12M30 56c11 0 19 5 22 11M28 74c10 0 18 4 21 10M25 92c9 -1 17 2 20 8" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;

  const cornerFlourish = (extraClass) => `<svg class="corner-flourish ${extraClass}" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 34C3 16 16 3 34 3" stroke="currentColor" stroke-width="1"/>
    <path d="M3 24C3 12 12 3 24 3" stroke="currentColor" stroke-width=".7"/>
    <circle cx="3" cy="3" r="2.2" fill="currentColor"/>
    <circle cx="13" cy="3" r="1.1" fill="currentColor"/>
    <circle cx="3" cy="13" r="1.1" fill="currentColor"/>
  </svg>`;
  const corners = `${cornerFlourish("cf-tl")}${cornerFlourish("cf-tr")}${cornerFlourish("cf-bl")}${cornerFlourish("cf-br")}`;

  const calendarIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" rx="1" stroke="currentColor" stroke-width="1.4"/>
    <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Save the Date — ${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Cormorant+Garamond:ital@0;1&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --green-dark:#0f1a15;
    --green:#152621;
    --green-2:#1c332a;
    --gold:${accent};
    --gold-light:color-mix(in srgb, ${accent}, white 40%);
    --cream:#f7f1e2;
    --cream-2:#efe6cf;
    --ink:#2a2620;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--cream);color:var(--ink);overflow-x:hidden;}
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:400;}
  .eyebrow,.cd-label,.contact span,.on-dark .sub,.footer-note,footer .alias-label{
    text-transform:uppercase;letter-spacing:3px;font-size:.72rem;
  }

  /* ---------- ORNAMENTO DE ESQUINA ---------- */
  .corner-flourish{position:absolute;width:30px;height:30px;color:var(--gold);opacity:.85;pointer-events:none;z-index:2;}
  @media(min-width:480px){.corner-flourish{width:40px;height:40px;}}
  .corner-flourish.cf-tl{top:16px;left:16px;}
  .corner-flourish.cf-tr{top:16px;right:16px;transform:scaleX(-1);}
  .corner-flourish.cf-bl{bottom:16px;left:16px;transform:scaleY(-1);}
  .corner-flourish.cf-br{bottom:16px;right:16px;transform:scale(-1,-1);}

  /* ---------- ANIMACIONES SUTILES (brillo dorado tipo luz de vela) ---------- */
  @keyframes candleGlow{
    0%,100%{filter:brightness(1) saturate(1);}
    50%{filter:brightness(1.22) saturate(1.08);}
  }
  @keyframes monogramShimmer{
    0%,100%{background-position:-60% 0;}
    50%{background-position:160% 0;}
  }
  @keyframes dustFall{
    0%{transform:translateY(0);opacity:0;}
    8%{opacity:.55;}
    55%{opacity:.3;}
    92%{opacity:0;}
    100%{transform:translateY(100vh);opacity:0;}
  }
  .laurel{animation:candleGlow 10s ease-in-out infinite;}
  .laurel-left{animation-delay:0s;}
  .laurel-right{animation-delay:4.6s;}
  .corner-flourish{animation:candleGlow 13s ease-in-out infinite;}
  .corner-flourish.cf-tl{animation-delay:.8s;}
  .corner-flourish.cf-tr{animation-delay:4s;}
  .corner-flourish.cf-bl{animation-delay:7.3s;}
  .corner-flourish.cf-br{animation-delay:10.1s;}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    min-height:100vh;
    padding:56px 20px 70px;
    display:flex;align-items:center;justify-content:center;text-align:center;
    background:
      radial-gradient(circle at 18% 8%, rgba(255,255,255,.05), transparent 42%),
      radial-gradient(circle at 85% 92%, rgba(255,255,255,.05), transparent 45%),
      radial-gradient(circle at 60% 40%, color-mix(in srgb, ${accent} 6%, transparent), transparent 55%),
      linear-gradient(160deg, #16241d 0%, #0d1611 55%, #1a2b22 100%);
    color:var(--cream);
    overflow:hidden;
  }
  .hero.with-photo{
    background:
      linear-gradient(180deg, rgba(13,22,17,.55), rgba(13,22,17,.86) 60%, rgba(13,22,17,.96)),
      url('${d.coverImage ? String(d.coverImage).replace(/'/g, "%27") : ""}') center/cover no-repeat;
  }
  .hero::after{
    content:"";position:absolute;inset:14px;
    border:1px solid color-mix(in srgb, ${accent} 55%, transparent);
    pointer-events:none;
  }
  .gold-dust{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;}
  .dust{position:absolute;top:-6%;width:3px;height:3px;border-radius:50%;background:var(--gold-light);opacity:0;box-shadow:0 0 5px 1px color-mix(in srgb, ${accent} 65%, transparent);animation:dustFall 16s linear infinite;}
  .dust.d1{left:16%;animation-duration:15s;animation-delay:0s;}
  .dust.d2{left:40%;animation-duration:19s;animation-delay:5s;}
  .dust.d3{left:66%;animation-duration:17.5s;animation-delay:9.5s;}
  .dust.d4{left:83%;animation-duration:21s;animation-delay:2.8s;}
  .hero-content{position:relative;z-index:1;max-width:520px;}
  .monogram{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:22px;}
  .laurel{width:26px;height:52px;color:var(--gold);}
  @media(min-width:480px){.laurel{width:34px;height:68px;}}
  .monogram-circle{
    width:76px;height:76px;border-radius:50%;
    border:1px solid var(--gold);
    display:flex;align-items:center;justify-content:center;
    font-family:'Playfair Display',serif;font-size:1.15rem;letter-spacing:2px;color:var(--gold-light);
    flex-shrink:0;
  }
  @media(min-width:480px){.monogram-circle{width:92px;height:92px;font-size:1.35rem;}}
  .monogram-circle .amp-small{color:var(--gold);margin:0 4px;font-style:italic;font-size:.9em;}
  .mono-shine{display:inline-block;}
  @supports ((-webkit-background-clip:text) or (background-clip:text)){
    .mono-shine{
      background-image:linear-gradient(100deg, var(--gold-light) 25%, #fff6e0 45%, var(--gold) 55%, var(--gold-light) 75%);
      background-size:280% 100%;
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;color:transparent;
      animation:monogramShimmer 9s ease-in-out infinite;
    }
    .mono-shine .amp-small{-webkit-text-fill-color:var(--gold);color:var(--gold);}
  }
  .eyebrow{color:var(--gold-light);margin:0 0 14px;}
  .hero-content h1{
    margin:0;
    font-size:clamp(2.3rem,9vw,3.6rem);
    line-height:1.15;
    color:#fdfaf3;
    letter-spacing:1px;
  }
  .hero-content h1 .amp{
    display:block;
    font-family:'Cormorant Garamond',serif;font-style:italic;
    color:var(--gold);
    font-size:.55em;
    margin:2px 0;
  }
  .thin-divider{width:70px;height:1px;background:var(--gold);margin:26px auto;position:relative;}
  .thin-divider::before{content:"◆";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.5rem;color:var(--gold);background:transparent;}
  .date-line{margin:0;color:var(--gold-light);letter-spacing:3px;font-size:.9rem;text-transform:uppercase;}
  .date-line-big{
    margin:14px 0 0;
    font-family:'Playfair Display',serif;font-size:clamp(1.4rem,5vw,1.9rem);
    color:#fdfaf3;letter-spacing:1px;
  }

  /* ---------- SECTIONS (cream) ---------- */
  section{max-width:640px;margin:0 auto;padding:60px 22px;text-align:center;}
  h2{
    letter-spacing:3px;text-transform:uppercase;
    font-size:clamp(1.1rem,4vw,1.5rem);
    color:var(--green);
    margin:0 0 8px;
  }
  .divider-gold{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:22px auto;position:relative;}
  .divider-gold::before{content:"◆";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.45rem;color:var(--gold);}
  .mini-divider{width:70px;height:1px;background:var(--gold);margin:0 auto 22px;position:relative;}
  .mini-divider::before{content:"◆";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.5rem;color:var(--gold);}

  /* ---------- QUOTE / MENSAJE ---------- */
  .message-row{display:flex;align-items:center;justify-content:center;gap:14px;}
  .message-row .laurel{width:20px;height:58px;flex-shrink:0;opacity:.9;}
  @media(min-width:480px){.message-row .laurel{width:26px;height:76px;}}
  .message{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.35rem;line-height:1.8;color:var(--green-2);margin:0;}

  /* ---------- COUNTDOWN (widget) ---------- */
  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:28px 0 4px;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;
    background:var(--green);
    color:var(--cream);
    min-width:68px;padding:16px 10px;
    border:1px solid var(--gold);
  }
  @media(min-width:480px){.countdown div{min-width:82px;padding:20px 14px;}}
  .cd-num{font-family:'Playfair Display',serif;font-size:1.8rem;color:var(--gold-light);line-height:1;}
  .cd-label{color:var(--gold);margin-top:8px;font-size:.62rem;}

  /* ---------- CALENDAR BUTTON ---------- */
  .cal-button{
    display:inline-flex;align-items:center;gap:10px;
    margin-top:36px;
    background:transparent;color:var(--green);
    border:1px solid var(--gold);padding:14px 30px;
    letter-spacing:2px;text-transform:uppercase;font-size:.78rem;
    text-decoration:none;
    transition:background .25s, color .25s;
  }
  .cal-button:hover{background:var(--gold);color:#fff;}
  .cal-button svg{width:18px;height:18px;flex-shrink:0;}

  /* ---------- LUGAR ---------- */
  .place-line{
    font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--green);margin:0;
  }
  .place-eyebrow{color:var(--gold);margin:0 0 8px;}

  /* ---------- NOTA FIJA ---------- */
  .footer-note{color:var(--gold);}
  .note-text{
    font-family:'Cormorant Garamond',serif;font-style:italic;
    font-size:1.1rem;color:var(--green-2);line-height:1.7;
    max-width:480px;margin:10px auto 0;
  }

  /* ---------- CONTACTO ---------- */
  .contact-row{display:flex;flex-wrap:wrap;justify-content:center;gap:22px;margin-top:18px;}
  .contact{
    display:inline-flex;flex-direction:column;gap:4px;align-items:center;
  }
  .contact span{color:var(--gold);}
  .contact a{color:var(--green);text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:2px;font-size:.92rem;letter-spacing:.5px;}
  .contact a:hover{color:var(--gold);}

  /* ---------- DARK SECTIONS (galería) ---------- */
  .dark{
    position:relative;
    max-width:none;
    background:
      radial-gradient(circle at 15% 15%, rgba(255,255,255,.04), transparent 40%),
      radial-gradient(circle at 90% 85%, rgba(255,255,255,.04), transparent 42%),
      linear-gradient(160deg,#16241d,#0f1913 55%,#1a2b22);
    color:var(--cream);
    padding:64px 22px;
  }
  .dark > *{max-width:640px;margin-left:auto;margin-right:auto;}
  .dark h2.on-dark{color:#fdfaf3;}

  /* ---------- GALLERY (widget) ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px;}
  .gallery-item{border:1px solid var(--gold);overflow:hidden;}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;filter:saturate(.95);transition:transform .4s ease;}
  .gallery img:hover{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(9,15,12,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:18px;right:24px;color:var(--gold-light);font-size:2rem;cursor:pointer;line-height:1;}

  /* ---------- FOOTER ---------- */
  footer{
    text-align:center;padding:50px 22px 60px;
    background:var(--green-dark);color:var(--gold-light);
  }
  footer .monogram-mini{
    width:52px;height:52px;border-radius:50%;border:1px solid var(--gold);
    display:flex;align-items:center;justify-content:center;margin:0 auto 18px;
    font-family:'Playfair Display',serif;font-size:.85rem;letter-spacing:1px;color:var(--gold-light);
  }
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;color:#fdfaf3;margin:0 0 6px;}

  /* ---------- MOVIMIENTO REDUCIDO ---------- */
  @media (prefers-reduced-motion: reduce){
    .laurel,.corner-flourish,.mono-shine,.dust{animation:none !important;}
    .dust{opacity:0 !important;}
  }
</style></head>
<body>

  <div class="hero${d.coverImage ? " with-photo" : ""}">
    ${corners}
    <div class="gold-dust" aria-hidden="true">
      <span class="dust d1"></span><span class="dust d2"></span><span class="dust d3"></span><span class="dust d4"></span>
    </div>
    <div class="hero-content">
      <div class="monogram">
        ${laurelLeft}
        <div class="monogram-circle"><span class="mono-shine">${esc(inicialNovia)}<span class="amp-small">&amp;</span>${esc(inicialNovio)}</span></div>
        ${laurelRight}
      </div>
      <p class="eyebrow">Save the Date</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="thin-divider"></div>
      <p class="date-line">Nos casamos</p>
      <p class="date-line-big">${fechaLarga ? esc(fechaLarga) : esc(d.fecha)}</p>
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="message-row">
      ${laurelLeft}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
      ${laurelRight}
    </div>
  </section>` : ""}

  <section>
    <div class="mini-divider"></div>
    <h2>Falta muy poco</h2>
    ${cd.html}
    ${calLink ? `<a class="cal-button" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIcon}<span>Agregar a mi calendario</span></a>` : ""}
  </section>

  ${d.lugar ? `<section>
    <p class="place-eyebrow eyebrow" style="color:var(--gold);">Dónde va a ser</p>
    <p class="place-line">${esc(d.lugar)}</p>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section class="dark">
    ${corners}
    <h2 class="on-dark">Momentos</h2>
    <div class="divider-gold"></div>
    ${gal.html}
  </section>` : ""}

  <section>
    <div class="mini-divider"></div>
    <p class="footer-note">Muy pronto</p>
    <p class="note-text">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
    ${(d.instagram || d.whatsapp) ? `<div class="contact-row">
      ${d.instagram ? `<div class="contact"><span>Seguinos</span><a href="https://instagram.com/${esc(String(d.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">${esc(d.instagram)}</a></div>` : ""}
      ${d.whatsapp ? `<div class="contact"><span>Consultas</span><a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a></div>` : ""}
    </div>` : ""}
  </section>

  <footer>
    <div class="monogram-mini">${esc(inicialNovia)}&amp;${esc(inicialNovio)}</div>
    <p class="thanks">Con amor, ${esc(d.novia)} &amp; ${esc(d.novio)}</p>
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  const accent = d.accent || "#c9a86a";
  const accent2 = d.accent2 || "#152621";
  return `<svg viewBox="0 0 300 200" width="100%" height="100%" style="position:absolute;inset:0" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="300" height="200" fill="${accent2}"/>
    <rect x="10" y="10" width="280" height="180" fill="none" stroke="${accent}" stroke-width="1"/>
    <circle cx="150" cy="82" r="34" fill="none" stroke="${accent}" stroke-width="1.4"/>
    <text x="150" y="92" font-family="Georgia, 'Playfair Display', serif" font-size="26" fill="${accent}" text-anchor="middle">S&amp;T</text>
    <text x="150" y="140" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="#f7f1e2" text-anchor="middle">SAVE THE DATE</text>
    <text x="150" y="165" font-family="Arial, sans-serif" font-size="13" fill="${accent}" text-anchor="middle">${esc(d.name || "Elegante Clásico")}</text>
  </svg>`;
}

module.exports = {
  id, category: "savethedate", name: "Elegante Clásico",
  summary: "Verde nocturno y dorado, monograma de iniciales y ornamentos de laurel — el anticipo perfecto para una boda clásica y elegante.",
  accent: "#c9a86a", accent2: "#152621", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
