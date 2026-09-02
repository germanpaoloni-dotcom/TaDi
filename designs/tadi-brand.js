// ---------- "TaDi" — la tarjeta de marca ----------
// Una tarjeta por categoría que usa la identidad visual del sitio (aurora
// animada, sombras neumórficas, isotipo "TaDi") en vez de un diseño de
// invitación bespoke como el resto del catálogo. Cada archivo
// designs/<categoria>/tadi.js sólo aporta los datos propios de su
// categoría (textos, campos, ícono, grupo visual) y delega el armado del
// HTML acá, así las 8 comparten motor y quedan consistentes entre sí sin
// duplicar ~500 líneas de CSS ocho veces.
//
// "Grupo visual" (opts.group) — pensado para que las 8 no se lean como la
// misma tarjeta recoloreada:
//  - "elegante": bodas, save the date, quince, bautismos — serif itálica,
//    esquinas finas, distintivo circular, sobre el fondo claro del sitio.
//  - "playful": infantiles, cumpleaños — tipografía redonda (Baloo 2),
//    esquinas bien curvas tipo "sticker", chips circulares, confetti.
//  - "spooky": halloween, navidad — mismo esqueleto que "elegante" pero
//    sobre una base oscura propia de la categoría (no el fondo claro del
//    sitio), con su propia paleta de sombras neumórficas oscuras.
const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("./widgets");
const { getPaletteColor } = require("./palettes");

// Paleta oscura por categoría del grupo "spooky" — un solo lugar para no
// tener que reinventar tonos de sombra neumórfica oscura por archivo.
const SPOOKY_PALETTES = {
  halloween: { bg1: "#241534", bg2: "#150d20", panel: "#2a1c3d", shLight: "#3d2955", shDark: "#150d20", ink: "#f5edff", muted: "#c9b8dd" },
  navidad: { bg1: "#173826", bg2: "#0a1a11", panel: "#1c4530", shLight: "#2c6a48", shDark: "#0a1a11", ink: "#f2f7f3", muted: "#a9c9b6" },
};

function tadiCardPreview({ accent, auroraA, auroraB, ghost, group, iconSvg, catLabel, darkFrom, darkTo }) {
  const shape = group === "playful" ? "46% 54% 60% 40%/50% 46% 54% 50%" : "50%";
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg, ${darkFrom}, ${darkTo});">
    <svg viewBox="0 0 300 200" style="position:absolute;inset:-30%;filter:blur(22px);" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="50" r="90" fill="${auroraA}" opacity=".55"/>
      <circle cx="250" cy="150" r="100" fill="${auroraB}" opacity=".32"/>
    </svg>
    <div style="position:relative;z-index:2;display:inline-flex;align-items:center;gap:1px;background:linear-gradient(120deg,#fff3ea,#ffe4d6 45%,#ffd9e6 100%);border-radius:20px;padding:4px 12px;box-shadow:0 2px 6px rgba(0,0,0,.18);font-weight:800;font-size:.8rem;margin-bottom:9px;font-family:Arial,Helvetica,sans-serif;">
      <span style="color:#33363f;">Ta</span><span style="color:${accent};">Di</span>
    </div>
    <div style="position:relative;z-index:2;font-size:.55rem;letter-spacing:2.2px;text-transform:uppercase;font-weight:700;color:#fff;opacity:.92;margin-bottom:8px;font-family:Arial,Helvetica,sans-serif;">${esc(ghost)}</div>
    <div style="position:relative;z-index:2;width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.14);border-radius:${shape};color:#fff;">${iconSvg}</div>
    <div style="position:relative;z-index:2;font-size:.6rem;letter-spacing:1px;text-transform:uppercase;color:#fff;opacity:.75;margin-top:6px;font-family:Arial,Helvetica,sans-serif;">${esc(catLabel)}</div>
  </div>`;
}

function tadiRender(opts) {
  const {
    d, category, group, accent, accent2, auroraA, auroraB,
    ghost, monogram, titleHtml, subLine, dateLine, dayLine,
    countdownTarget, iconSvg,
    message, eventHeading = "El gran día", eventCards = [], chips = [],
    gallery = [], rsvp, rsvpDeadline, footerName, alias, coverTitle,
  } = opts;

  const isDark = group === "spooky";
  const isPlayful = group === "playful";
  const sp = isDark ? SPOOKY_PALETTES[category] : null;

  const cd = countdownTarget ? countdownWidget(countdownTarget, "cd1") : null;
  const gal = gallery.length ? galleryWidget(gallery, "gal1") : null;

  const fontDisplay = isPlayful ? "'Baloo 2', sans-serif" : "'Playfair Display', serif";
  const fontImport = isPlayful
    ? `family=Baloo+2:wght@600;700`
    : `family=Playfair+Display:ital,wght@0,600;1,500`;

  const bg = isDark ? sp.bg1 : "#eaeef2";
  const ink = isDark ? sp.ink : "#33363f";
  const muted = isDark ? sp.muted : "#6d7280";
  const shDark = isDark ? sp.shDark : "#c5cbd6";
  const shLight = isDark ? sp.shLight : "#ffffff";
  const panelBg = isDark ? sp.panel : "#eaeef2";
  const heroBgCss = isDark ? `linear-gradient(180deg, ${sp.bg1}, ${sp.bg2})` : "#eaeef2";

  const monoShape = isPlayful ? "46% 54% 60% 40%/50% 46% 54% 50%" : "50%";
  const cdShape = isPlayful ? "50%" : "16px";
  const cdSize = isPlayful ? "width:58px;height:58px;padding:0;justify-content:center;" : "min-width:60px;padding:13px 8px;";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(coverTitle)} · TaDi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fontImport}&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:${bg}; --ink:${ink}; --muted:${muted};
    --accent:${accent}; --accent-2:${accent2};
    --sh-dark:${shDark}; --sh-light:${shLight};
    --nu-xs:3px 3px 7px var(--sh-dark),-3px -3px 7px var(--sh-light);
    --nu-sm:5px 5px 12px var(--sh-dark),-5px -5px 12px var(--sh-light);
    --nu-md:8px 8px 18px var(--sh-dark),-8px -8px 18px var(--sh-light);
    --nu-inset-sm:inset 2px 2px 5px var(--sh-dark),inset -2px -2px 5px var(--sh-light);
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Helvetica Neue',Arial,sans-serif;background:var(--bg);color:var(--ink);overflow-x:hidden;}
  h1,h2{font-family:${fontDisplay};font-weight:${isPlayful ? 700 : 600};margin:0;}

  .hero{position:relative;overflow:hidden;padding:38px 22px 54px;text-align:center;background:${heroBgCss};}
  .aurora{position:absolute;inset:-30% -10% -10% -10%;z-index:0;pointer-events:none;filter:blur(36px);
    background:
      radial-gradient(circle at 20% 20%, ${auroraA}66, transparent 55%),
      radial-gradient(circle at 85% 15%, ${auroraB}47, transparent 52%),
      radial-gradient(circle at 55% 55%, ${auroraA}47, transparent 58%),
      radial-gradient(circle at 10% 70%, ${auroraB}38, transparent 52%);
    animation:tadiAurora 22s ease-in-out infinite;
  }
  @keyframes tadiAurora{0%,100%{transform:translate(0,0) rotate(0deg) scale(1);}33%{transform:translate(1.5%,-2%) rotate(4deg) scale(1.04);}66%{transform:translate(-2%,1.5%) rotate(-3deg) scale(1.02);}}
  .dot{position:absolute;border-radius:50%;z-index:0;opacity:.5;animation:tadiDot 5s ease-in-out infinite;}
  @keyframes tadiDot{0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);}}
  .moon{position:absolute;z-index:1;top:22px;right:26px;width:32px;height:32px;border-radius:50%;background:#f2c265;box-shadow:0 0 22px 4px rgba(242,194,101,.4);opacity:.9;}
  .moon::after{content:"";position:absolute;inset:0;border-radius:50%;background:${isDark ? sp.bg1 : "#eaeef2"};transform:translate(8px,-4px) scale(1.02);}

  .tadi-pill{position:relative;z-index:2;display:inline-flex;align-items:center;gap:1px;background:linear-gradient(120deg,#fff3ea,#ffe4d6 45%,#ffd9e6 100%);border-radius:20px;padding:6px 16px;box-shadow:0 3px 10px rgba(0,0,0,.25),inset 0 1px 1px rgba(255,255,255,.8);font-weight:800;font-size:.85rem;margin-bottom:18px;font-family:Arial,Helvetica,sans-serif;}
  .tadi-pill .ta{color:#33363f;}
  .tadi-pill .di{color:#e8672e;}

  .ghost{position:relative;z-index:2;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:var(--accent-2);margin-bottom:18px;}
  ${isPlayful ? `.ghost{display:inline-block;background:var(--bg);padding:5px 15px;border-radius:20px;box-shadow:var(--nu-xs);letter-spacing:2px;}` : ""}

  .mono{position:relative;z-index:2;width:76px;height:76px;margin:0 auto 20px;border-radius:${monoShape};background:var(--bg);box-shadow:var(--nu-md);display:flex;align-items:center;justify-content:center;font-family:${fontDisplay};font-size:${isPlayful ? "1.7rem" : "1.15rem"};font-weight:${isPlayful ? 700 : 400};color:var(--accent-2);}

  .hero h1{position:relative;z-index:2;font-size:clamp(2rem,8vw,3rem);line-height:1.15;color:var(--ink);font-style:${isPlayful ? "normal" : "normal"};}
  .hero h1 em{font-style:${isPlayful ? "normal" : "italic"};color:var(--accent-2);}
  .hero .sub{position:relative;z-index:2;font-family:${fontDisplay};font-weight:600;color:var(--muted);margin:8px 0 0;font-size:1rem;}
  .hero .dateline{position:relative;z-index:2;margin:16px 0 0;letter-spacing:2.5px;text-transform:uppercase;font-size:.8rem;color:var(--muted);font-weight:600;}
  .hero .dayline{position:relative;z-index:2;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--muted);opacity:.85;}

  .divider{position:relative;z-index:2;width:60px;height:1px;background:var(--sh-dark);margin:20px auto 0;}
  .divider::before{content:"";position:absolute;top:-2.5px;left:50%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:var(--accent-2);}

  .countdown{position:relative;z-index:2;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:26px 0 0;}
  .countdown div{display:flex;flex-direction:column;align-items:center;background:var(--bg);border-radius:${cdShape};box-shadow:var(--nu-inset-sm);${cdSize}}
  .cd-num{font-family:${fontDisplay};font-weight:${isPlayful ? 700 : 400};font-size:${isPlayful ? "1.2rem" : "1.4rem"};color:var(--accent-2);line-height:1;}
  .cd-label{margin-top:5px;font-size:.56rem;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);}

  section{max-width:640px;margin:0 auto;padding:46px 22px;text-align:center;}
  .eyebrow-sm{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin:0 0 4px;}
  h2{font-size:1.5rem;color:var(--ink);margin-bottom:8px;}

  .message-card{background:var(--panel-bg,var(--bg));background:${panelBg};border-radius:${isPlayful ? "30px" : "24px"};box-shadow:var(--nu-sm);padding:32px 26px;}
  .message-card p{font-family:${fontDisplay};font-style:${isPlayful ? "normal" : "italic"};font-weight:${isPlayful ? 600 : 400};font-size:1.15rem;line-height:1.7;color:var(--ink);margin:0;}

  .timeline{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .tl-card{background:${panelBg};border-radius:${isPlayful ? "26px" : "20px"};box-shadow:var(--nu-sm);padding:26px 22px;min-width:190px;flex:1 1 190px;max-width:260px;}
  .tl-icon{width:44px;height:44px;border-radius:${isPlayful ? "46% 54% 60% 40%/50% 46% 54% 50%" : "50%"};background:${panelBg};box-shadow:var(--nu-inset-sm);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--accent-2);}
  .tl-card h3{margin:0 0 6px;font-size:.92rem;letter-spacing:1.3px;text-transform:uppercase;color:var(--ink);font-family:'Helvetica Neue',sans-serif;font-weight:700;}
  .tl-time{color:var(--accent-2);font-weight:700;margin:0 0 4px;font-size:.86rem;}
  .tl-place{margin:0;color:var(--muted);font-size:.84rem;line-height:1.5;}

  .chip-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
  .chip{background:${panelBg};box-shadow:var(--nu-xs);border-radius:20px;padding:9px 18px;font-size:.78rem;color:var(--muted);text-decoration:none;display:inline-block;}
  .chip b{color:var(--ink);}
  .chip a,a.chip{color:var(--muted);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:8px;}
  .gallery-item{border-radius:16px;overflow:hidden;box-shadow:var(--nu-inset-sm);}
  .gallery img{width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(9,10,14,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  .rsvp-card{background:${panelBg};border-radius:${isPlayful ? "30px" : "24px"};box-shadow:var(--nu-sm);padding:32px 26px;text-align:left;}
  .rsvp-card label{display:flex;flex-direction:column;gap:6px;font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:14px;}
  .rsvp-card input,.rsvp-card select,.rsvp-card textarea{font-family:inherit;padding:12px 14px;border:0;border-radius:14px;background:${bg};box-shadow:var(--nu-inset-sm);font-size:.92rem;color:var(--ink);}
  .rsvp-card button{width:100%;padding:14px;border:0;border-radius:20px;background:linear-gradient(120deg,var(--accent),var(--accent-2));color:#fff;font-weight:700;letter-spacing:.5px;box-shadow:var(--nu-sm);cursor:pointer;font-size:.9rem;transition:transform .12s;}
  .rsvp-card button:hover{transform:translateY(-1px);}
  .rsvp-status{text-align:center;color:var(--muted);font-weight:600;letter-spacing:.5px;margin-top:10px;}

  .cal-btn{display:inline-flex;align-items:center;gap:10px;padding:15px 26px;border-radius:24px;background:linear-gradient(120deg,var(--accent),var(--accent-2));color:#fff;text-decoration:none;font-weight:700;letter-spacing:.4px;box-shadow:var(--nu-sm);font-size:.9rem;}

  footer{text-align:center;padding:46px 22px 56px;}
  .footer-mono{width:54px;height:54px;border-radius:${monoShape};background:var(--bg);box-shadow:var(--nu-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:${fontDisplay};color:var(--accent-2);font-size:${isPlayful ? "1.3rem" : "1rem"};font-weight:${isPlayful ? 700 : 400};}
  footer p{font-family:${fontDisplay};font-style:${isPlayful ? "normal" : "italic"};font-weight:${isPlayful ? 600 : 400};color:var(--ink);font-size:1.05rem;margin:0;}
  footer .alias-row{margin-top:12px;font-size:.8rem;color:var(--muted);}
  footer .alias-row b{color:var(--ink);}

  @media (prefers-reduced-motion: reduce){ .aurora,.dot{animation:none !important;} }
</style></head>
<body>

  <div class="hero">
    <div class="aurora"></div>
    <span class="dot" style="width:12px;height:12px;background:${auroraA};top:28px;left:14%;"></span>
    <span class="dot" style="width:8px;height:8px;background:${accent};top:78px;right:16%;animation-delay:-2s;"></span>
    <span class="dot" style="width:14px;height:14px;background:${auroraB};top:128px;left:8%;opacity:.3;animation-delay:-3.4s;"></span>
    ${isDark ? `<div class="moon"></div>` : ""}

    <div class="tadi-pill"><span class="ta">Ta</span><span class="di">Di</span></div>
    <div class="ghost">${esc(ghost)}</div>
    <div class="mono">${monogram}</div>
    <h1>${titleHtml}</h1>
    ${subLine ? `<p class="sub">${esc(subLine)}</p>` : ""}
    ${dateLine ? `<p class="dateline">${esc(dateLine)}</p>` : ""}
    ${dayLine ? `<p class="dayline">${esc(dayLine)}</p>` : ""}

    ${cd ? `<div class="countdown" id="cd1">
      <div><span class="cd-num" data-u="d">00</span><span class="cd-label">días</span></div>
      <div><span class="cd-num" data-u="h">00</span><span class="cd-label">hs</span></div>
      <div><span class="cd-num" data-u="m">00</span><span class="cd-label">min</span></div>
      <div><span class="cd-num" data-u="s">00</span><span class="cd-label">seg</span></div>
    </div>` : ""}
  </div>

  ${message ? `<section>
    <div class="divider"></div>
    <div class="message-card"><p>&ldquo;${esc(message)}&rdquo;</p></div>
  </section>` : ""}

  ${eventCards.length ? `<section>
    <p class="eyebrow-sm">${esc(eventHeading)}</p>
    <h2>Nos vemos ahí</h2>
    <div class="divider"></div>
    <div class="timeline">
      ${eventCards.map((c) => `<div class="tl-card">
        <div class="tl-icon">${c.icon}</div>
        <h3>${esc(c.label)}</h3>
        ${c.time ? `<p class="tl-time">${esc(c.time)}</p>` : ""}
        ${c.place ? `<p class="tl-place">${esc(c.place)}</p>` : ""}
      </div>`).join("")}
    </div>
    ${chips.length ? `<div class="chip-row">${chips.map((c) => c.href ? `<a class="chip" href="${esc(c.href)}" target="_blank" rel="noopener">${c.html}</a>` : `<div class="chip">${c.html}</div>`).join("")}</div>` : ""}
  </section>` : (chips.length ? `<section><div class="chip-row">${chips.map((c) => c.href ? `<a class="chip" href="${esc(c.href)}" target="_blank" rel="noopener">${c.html}</a>` : `<div class="chip">${c.html}</div>`).join("")}</div></section>` : "")}

  ${gal ? `<section>
    <p class="eyebrow-sm">Momentos</p>
    <h2>Galería</h2>
    <div class="divider"></div>
    ${gal.html}
  </section>` : ""}

  ${rsvp && rsvp.mode === "form" ? `<section>
    <p class="eyebrow-sm">RSVP</p>
    <h2>Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p class="eyebrow-sm" style="color:var(--accent-2);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="divider"></div>
    <div class="rsvp-card">${rsvp.widget.html}</div>
  </section>` : ""}

  ${rsvp && rsvp.mode === "calendar" && rsvp.calLink ? `<section>
    <p class="eyebrow-sm">Agendalo</p>
    <h2>No te lo pierdas</h2>
    <div class="divider" style="margin-bottom:26px;"></div>
    <a class="cal-btn" href="${esc(rsvp.calLink)}" target="_blank" rel="noopener">📅 Agregar a Google Calendar</a>
  </section>` : ""}

  <footer>
    <div class="footer-mono">${monogram}</div>
    <p>${footerName}</p>
    ${alias ? `<p class="alias-row"><span>Alias para regalo&nbsp;</span><b>${esc(alias)}</b></p>` : ""}
  </footer>

  <script>${cd ? cd.script : ""}${gal ? gal.script : ""}${rsvp && rsvp.mode === "form" ? rsvp.widget.script : ""}</script>
${tadiFooterWidget()}
</body></html>`;
}

module.exports = { tadiRender, tadiCardPreview, getPaletteColor, googleCalendarLink, rsvpWidget, formatFechaCorta, esc };
