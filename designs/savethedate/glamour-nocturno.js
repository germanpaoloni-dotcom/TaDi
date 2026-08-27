const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-glamour-nocturno";

// Mismo dorado de gala que designs/bodas/nocturna-glamour.js — este save
// the date acompaña a esa invitación de boda, así que comparte paleta.
const GOLD_FALLBACK = "#c9a45c";

const sampleData = {
  novia: "Valentina",
  novio: "Ignacio",
  fecha: "2027-11-13",
  lugar: "Buenos Aires",
  mensaje: "Después de tanto soñarlo, llegó el momento: nos casamos. Guardá la fecha — la invitación con todos los detalles llega más adelante, pero por ahora queremos que lo sepas antes que nadie.",
  instagram: "valen.ignacio.boda",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1769038936373-07c4806ee247?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
  ],
};

// Destello / estrella de 4 puntas — misma ornamentación que la boda
// hermana, para que el conjunto se sienta parte de la misma familia visual.
function sparkleIcon(size = 18) {
  return `<svg class="spark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 1.5c0 6.2 2.3 8.5 8.5 8.5-6.2 0-8.5 2.3-8.5 8.5 0-6.2-2.3-8.5-8.5-8.5 6.2 0 8.5-2.3 8.5-8.5Z" fill="currentColor"/>
  </svg>`;
}

// Ícono de calendario, para el botón de "agregar a mi calendario".
function calendarIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="18" height="18">
    <rect x="3.5" y="5" width="17" height="15" rx="1.4" stroke="currentColor" stroke-width="1.3"/>
    <path d="M3.5 9.4h17M8 3v3.6M16 3v3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}

function starDivider() {
  return `<div class="star-divider">${sparkleIcon(16)}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const GOLD = getPaletteColor(d.colorPalette, "dark", GOLD_FALLBACK);
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");

  const nombres = `${d.novia || ""} ${d.novio ? "& " + d.novio : ""}`.trim();
  const calLink = googleCalendarLink({
    title: `${d.novia || ""} & ${d.novio || ""} se casan`.trim(),
    dateISO: d.fecha,
    time: "21:00",
    details: d.mensaje || "",
    location: d.lugar || "",
  });

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Save the Date</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --black:#0a0a0a;
    --black2:#131110;
    --gold:${GOLD};
    --gold-soft:color-mix(in srgb, ${GOLD}, white 38%);
    --gold-dim:color-mix(in srgb, ${GOLD}, black 30%);
    --ivory:#f3ead7;
    --muted:#b6a888;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--black);color:var(--ivory);font-family:'Cormorant Garamond',serif;line-height:1.7;}
  h1,h2{font-family:'Playfair Display',serif;font-weight:600;margin:0;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  .eyebrow{font-family:'Jost',sans-serif;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.78rem);color:var(--gold-soft);margin:0 0 14px;}
  .spark{color:var(--gold);}

  .star-divider{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 6px;width:200px;max-width:70%;}
  .star-divider::before,.star-divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold-dim));}
  .star-divider::after{background:linear-gradient(90deg,var(--gold-dim),transparent);}

  section{max-width:820px;margin:0 auto;padding:clamp(36px,6vw,64px) 24px;text-align:center;position:relative;}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:clamp(460px,88vh,780px);
    display:flex;align-items:flex-end;justify-content:center;text-align:center;
    background:
      radial-gradient(circle at 20% 22%, rgba(255,255,255,.08) 0%, transparent 4%),
      radial-gradient(circle at 80% 16%, rgba(255,255,255,.06) 0%, transparent 3%),
      radial-gradient(circle at 30% 66%, color-mix(in srgb, ${GOLD} 30%, transparent) 0%, transparent 16%),
      linear-gradient(180deg, rgba(6,6,5,.4) 0%, rgba(6,6,5,.72) 55%, var(--black) 100%),
      url('${esc(d.coverImage)}') center/cover no-repeat;
  }
  /* Destellos dorados titilando, como luces de gala desenfocadas al fondo del hero */
  .gala-lights{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;}
  .gala-lights span{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--gold);box-shadow:0 0 14px 4px color-mix(in srgb, var(--gold), transparent 35%);opacity:.14;animation:galaFlicker 8s ease-in-out infinite;}
  @keyframes galaFlicker{
    0%,100%{opacity:.12;}
    50%{opacity:.6;}
  }
  @media(prefers-reduced-motion:reduce){
    .gala-lights span{animation:none !important;opacity:.32;}
  }

  .hero-content{position:relative;z-index:1;padding:0 24px 32px;max-width:620px;}
  .hero-content h1{font-size:clamp(1.9rem,7.5vw,3.2rem);color:var(--gold-soft);font-weight:600;line-height:1.16;letter-spacing:3px;text-transform:uppercase;}
  .hero-content .amp{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:.5em;letter-spacing:0;color:var(--gold);margin:6px 0;text-transform:none;}
  .hero-divider{width:70px;height:1px;background:var(--gold-dim);margin:22px auto;}
  .hero-date{font-family:'Jost',sans-serif;margin-top:2px;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.76rem,2vw,.92rem);color:var(--muted);}

  /* ---------- MENSAJE ---------- */
  .quote-box{position:relative;border:1px solid var(--gold-dim);padding:clamp(30px,5vw,44px) clamp(20px,5vw,48px) clamp(24px,4vw,32px);max-width:600px;margin:0 auto;background:var(--black2);}
  .quote-box .quote-star{position:absolute;top:0;left:50%;transform:translate(-50%,-52%);background:var(--black2);padding:0 10px;color:var(--gold);}
  .message{font-size:clamp(1rem,2.2vw,1.18rem);font-style:italic;color:var(--ivory);max-width:540px;margin:0 auto;}

  /* ---------- COUNTDOWN ---------- */
  .countdown{display:flex;gap:clamp(10px,2.6vw,18px);justify-content:center;flex-wrap:wrap;margin:8px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:64px;padding:16px 10px;border:1px solid var(--gold-dim);background:var(--black2);}
  @media(min-width:480px){.countdown div{min-width:80px;padding:20px 14px;}}
  .cd-num{font-family:'Playfair Display',serif;font-weight:600;font-size:clamp(1.5rem,5vw,2.2rem);color:var(--gold);line-height:1;}
  .cd-label{font-family:'Jost',sans-serif;font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-top:8px;}

  /* ---------- CALENDARIO ---------- */
  .cal-link{display:inline-flex;align-items:center;gap:10px;margin-top:26px;font-family:'Jost',sans-serif;letter-spacing:2px;text-transform:uppercase;font-size:.76rem;color:var(--gold);border:1px solid var(--gold);border-radius:999px;padding:13px 30px;transition:background .2s,color .2s;text-decoration:none;}
  .cal-link:hover{background:var(--gold);color:var(--black);}

  /* ---------- LUGAR / NOTA ---------- */
  .place{font-family:'Playfair Display',serif;font-weight:600;font-size:clamp(1.2rem,3.4vw,1.6rem);color:#fbf6ea;margin-top:6px;}
  .note{font-family:'Jost',sans-serif;font-size:.82rem;letter-spacing:.5px;color:var(--muted);max-width:460px;margin:22px auto 0;}

  /* ---------- CONTACTO ---------- */
  .contact-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:8px;}
  .contact-link{font-family:'Jost',sans-serif;font-size:.8rem;letter-spacing:.5px;text-decoration:none;color:var(--gold-soft);border:1px solid var(--gold-dim);border-radius:999px;padding:11px 22px;transition:background .2s,color .2s;}
  .contact-link:hover{background:var(--gold);color:var(--black);border-color:var(--gold);}

  /* ---------- GALERÍA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:8px;}
  .gallery img{width:100%;height:190px;object-fit:cover;cursor:pointer;border:1px solid var(--gold-dim);filter:saturate(.92) contrast(1.04) brightness(.95);transition:transform .35s ease;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(4,4,4,.95);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-soft);font-size:2.2rem;cursor:pointer;line-height:1;}

  .gold-rule{height:1px;max-width:820px;margin:0 auto;background:linear-gradient(90deg,transparent,var(--gold-dim) 15%,var(--gold-dim) 85%,transparent);opacity:.7;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;overflow:hidden;text-align:center;padding:48px 24px 42px;background:var(--black);}
  footer::before,footer::after{content:"";position:absolute;bottom:0;width:150px;height:100px;background-image:radial-gradient(circle, var(--gold) 1px, transparent 1.6px);background-size:16px 16px;opacity:.3;pointer-events:none;}
  footer::before{left:0;}
  footer::after{right:0;background-position:7px 9px;}
  .foot-mono{width:52px;height:52px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-family:'Playfair Display',serif;font-size:.85rem;letter-spacing:1px;color:var(--gold-soft);position:relative;z-index:1;}
  .foot-names{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;letter-spacing:1px;font-size:1.3rem;color:var(--gold-soft);margin-bottom:8px;position:relative;z-index:1;}
  .foot-thanks{font-family:'Jost',sans-serif;font-size:.78rem;letter-spacing:.5px;color:var(--muted);position:relative;z-index:1;margin:0;}
</style></head>
<body>

  <div class="hero">
    <div class="gala-lights" aria-hidden="true">
      <span style="top:16%;left:12%;animation-duration:8.5s;animation-delay:0s;"></span>
      <span style="top:10%;left:78%;width:3px;height:3px;animation-duration:9.5s;animation-delay:1.3s;"></span>
      <span style="top:32%;left:88%;animation-duration:7.2s;animation-delay:2.6s;"></span>
      <span style="top:44%;left:20%;width:3px;height:3px;animation-duration:10s;animation-delay:.7s;"></span>
      <span style="top:62%;left:68%;animation-duration:8s;animation-delay:3.4s;"></span>
      <span style="top:70%;left:8%;width:3px;height:3px;animation-duration:9s;animation-delay:1.9s;"></span>
    </div>
    <div class="hero-content">
      <p class="eyebrow">Save the Date</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="hero-divider"></div>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="quote-box">
      <div class="quote-star">${sparkleIcon(18)}</div>
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Faltan</p>
    ${cd.html}
    ${calLink ? `<a class="cal-link" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIcon()} Agregar a mi calendario</a>` : ""}
  </section>

  ${starDivider()}

  ${d.lugar ? `<section>
    <p class="eyebrow">Dónde va a ser</p>
    <p class="place">${esc(d.lugar)}</p>
    <p class="note">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
  </section>` : `<section>
    <p class="note">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
  </section>`}

  ${(d.instagram || d.whatsapp) ? `<section>
    <p class="eyebrow">Seguinos</p>
    <div class="contact-row">
      ${d.instagram ? `<a class="contact-link" href="https://instagram.com/${esc(d.instagram)}" target="_blank" rel="noopener">📷 @${esc(d.instagram)}</a>` : ""}
      ${d.whatsapp ? `<a class="contact-link" href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Momentos</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:26px;">Un poco de nosotros</h2>
    ${gal.html}
  </section>` : ""}

  <div class="gold-rule"></div>

  <footer>
    <div class="foot-mono">${esc(inicialNovia)}&nbsp;|&nbsp;${esc(inicialNovio)}</div>
    <p class="foot-names">${esc(nombres)}</p>
    <p class="foot-thanks">Gracias por acompañarnos desde ahora — ¡nos vemos pronto!</p>
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:
      radial-gradient(circle at 20% 20%, rgba(255,255,255,.05), transparent 45%),
      radial-gradient(circle at 82% 82%, rgba(255,255,255,.05), transparent 45%),
      linear-gradient(160deg,${d.accent2 || "#141210"} 0%,#070706 55%,${d.accent2 || "#181310"} 100%);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 1.5c0 6.2 2.3 8.5 8.5 8.5-6.2 0-8.5 2.3-8.5 8.5 0-6.2-2.3-8.5-8.5-8.5 6.2 0 8.5-2.3 8.5-8.5Z" fill="${d.accent}"/>
    </svg>
    <div style="font-family:'Jost',Georgia,sans-serif;font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:${d.accent};">Save the Date</div>
    <div style="font-family:Georgia,'Playfair Display',serif;font-size:1rem;letter-spacing:2.5px;text-transform:uppercase;color:#f4e6c2;line-height:1.3;text-align:center;">${esc(d.name)}</div>
    <div style="width:44px;height:1px;background:${d.accent};margin-top:2px;"></div>
  </div>`;
}

module.exports = {
  id, category: "savethedate", name: "Glamour Nocturno",
  summary: "Save the date de gala en negro y dorado: nombres en serif elegante, cuenta regresiva brillante y botón directo para agendar en Google Calendar.",
  accent: GOLD_FALLBACK, accent2: "#0a0a0a", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
