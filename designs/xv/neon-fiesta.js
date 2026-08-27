const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-neon-fiesta";

const sampleData = {
  nombre: "Milagros",
  fecha: "2027-11-13",
  horaCeremonia: "19:00",
  lugarCeremonia: "Parroquia Santa Rita, San Isidro",
  horaFiesta: "21:00",
  lugarFiesta: "Salón Neon Club, San Isidro (pista con luces led + DJ en vivo)",
  direccionMapa: "https://maps.google.com/?q=Neon+Club+San+Isidro",
  padres: "Vanesa y Fabián",
  mensaje: "¡Se viene la fiesta del año! Prendé el flúo, calzate las mejores zapatillas y vení a bailar hasta que se apague la última luz 🎧✨",
  dressCode: "Colores flúo obligatorio, se viene la fiesta 💜💙💗",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1778874902512-70d36cca2557?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=800&q=80",
  ],
};

// --- Iconografía dibujada a mano en SVG inline (sin dependencias externas),
// todos con currentColor para heredar el color de acento vía CSS. El
// lenguaje visual de todo el diseño es el de un "pase / entrada VIP" de
// noche de club: líneas finas, insignias circulares, perforado punteado
// con muescas — la traducción en flúo del papel rasgado / cintas de las
// referencias florales, sin tomar nada de su paleta.

function starIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2 l3 7 7 1 -5.2 4.8 1.6 7.2 -6.4 -3.8 -6.4 3.8 1.6 -7.2 -5.2 -4.8 7 -1 z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
}

function boltIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13 2 L4 14h6l-1 8 9-12h-6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
}

function sparkleIcon(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2c0 6.6 2.4 9 9 9-6.6 0-9 2.4-9 9 0-6.6-2.4-9-9-9 6.6 0 9-2.4 9-9Z" fill="currentColor"/></svg>`;
}

function headphonesIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 13.4v-1.6a8 8 0 0 1 16 0v1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="2.8" y="13.2" width="4.2" height="6.6" rx="1.7" stroke="currentColor" stroke-width="1.5"/>
    <rect x="17" y="13.2" width="4.2" height="6.6" rx="1.7" stroke="currentColor" stroke-width="1.5"/>
  </svg>`;
}

function hangerIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="4.6" r="1.3" stroke="currentColor" stroke-width="1.3"/>
    <path d="M12 5.9v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M12 7.9 3.3 14.6c-1.2.9-.5 2.8 1 2.8h15.4c1.5 0 2.2-1.9 1-2.8L12 7.9Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M6.4 17.9h11.2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`;
}

function cameraIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 8.6h3.1l1.3-2.1h7.2l1.3 2.1H20v10.4H4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="12" cy="13.4" r="3.3" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="17.4" cy="11.2" r=".45" fill="currentColor"/>
  </svg>`;
}

function ticketIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 9.6a2 2 0 0 0 0-4h18a2 2 0 0 0 0 4 2 2 0 0 1 0 4.8 2 2 0 0 0 0 4.8H3a2 2 0 0 0 0-4.8 2 2 0 0 1 0-4.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M14.2 5.4v13.2" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2.2 2.4"/>
  </svg>`;
}

function squiggle() {
  return `<svg width="70" height="20" viewBox="0 0 70 20" style="position:absolute;top:20px;left:16px;filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #fff)"><path d="M2 10 L10 4 L18 16 L26 4 L34 16 L42 4 L50 16 L58 4 L66 10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function dotsGrid(color) {
  const dots = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      dots.push(`<circle cx="${col * 10 + 4}" cy="${row * 10 + 4}" r="1.6" fill="${color}"/>`);
    }
  }
  return `<svg class="dots-corner" width="34" height="34" viewBox="0 0 34 34" style="opacity:.7">${dots.join("")}</svg>`;
}

function micIcon(magentaColor) {
  return `<svg width="60" height="90" viewBox="0 0 60 90" style="filter:drop-shadow(0 0 5px #22e5ff) drop-shadow(0 0 12px #22e5ff)">
    <rect x="20" y="4" width="20" height="34" rx="10" fill="none" stroke="#22e5ff" stroke-width="2.2"/>
    <line x1="24" y1="12" x2="36" y2="12" stroke="#22e5ff" stroke-width="1.6"/>
    <line x1="24" y1="18" x2="36" y2="18" stroke="#22e5ff" stroke-width="1.6"/>
    <line x1="24" y1="24" x2="36" y2="24" stroke="#22e5ff" stroke-width="1.6"/>
    <line x1="24" y1="30" x2="36" y2="30" stroke="#22e5ff" stroke-width="1.6"/>
    <path d="M12 34 a18 18 0 0 0 36 0" fill="none" stroke="${magentaColor}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="30" y1="52" x2="30" y2="66" stroke="${magentaColor}" stroke-width="2.2"/>
    <ellipse cx="30" cy="76" rx="18" ry="6" fill="none" stroke="${magentaColor}" stroke-width="2.2"/>
  </svg>`;
}

// Marca de esquina tipo "visor de cámara" — el guiño editorial/premium que
// reemplaza al ornamento floral de esquina en las referencias.
function bracketCorner() {
  return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 11V4a2 2 0 0 1 2-2h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

// Código de barras decorativo (determinístico, sin datos reales) para
// reforzar la fantasía de "pase / entrada de club" en la sección de
// cuenta regresiva y en el formulario de RSVP.
function barcodeSVG(color, height = 26) {
  const widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 4, 1, 2];
  let x = 0;
  const bars = widths.map((w) => {
    const rect = `<rect x="${x}" y="0" width="${w}" height="${height}" fill="${color}"/>`;
    x += w + 2;
    return rect;
  }).join("");
  return `<svg width="${x}" height="${height}" viewBox="0 0 ${x} ${height}" preserveAspectRatio="none" style="display:block">${bars}</svg>`;
}

function ticketDivider() {
  return `<div class="ticket-divider" aria-hidden="true"><span></span>${sparkleIcon(14)}<span></span></div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#ff2d95");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "21:00"}:00` : sampleData.fecha, "cd-neon");
  const gal = galleryWidget(d.galeria || [], "gal-neon");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const fp = fechaPartes(d.fecha);
  const nombreUpper = String(d.nombre || "").toUpperCase();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)} · Fiesta Neón</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Monoton&family=Yellowtail&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0d0710; --bg2:#170c1e;
    --magenta:${accent}; --cyan:#22e5ff; --violeta:#7b2ff7;
    --ink:#fdf7ff; --ink-dim:#c9b8e0;
    --line:color-mix(in srgb, var(--cyan) 40%, transparent);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;font-family:'Poppins',Arial,sans-serif;background-color:var(--bg);color:var(--ink);
    background-image:
      radial-gradient(circle at 1px 1px, rgba(255,255,255,.045) 1px, transparent 0),
      linear-gradient(180deg, rgba(0,0,0,.5) 0%, transparent 14%, transparent 86%, rgba(0,0,0,.55) 100%),
      radial-gradient(ellipse at 18% 12%, color-mix(in srgb, ${accent} 17%, transparent), transparent 55%),
      radial-gradient(ellipse at 85% 25%, rgba(34,229,255,.13), transparent 55%),
      radial-gradient(ellipse at 50% 95%, rgba(123,47,247,.16), transparent 55%),
      linear-gradient(335deg, rgba(0,0,0,.32) 23px, transparent 23px),
      linear-gradient(155deg, rgba(0,0,0,.32) 23px, transparent 23px),
      linear-gradient(335deg, rgba(0,0,0,.32) 23px, transparent 23px),
      linear-gradient(155deg, rgba(0,0,0,.32) 23px, transparent 23px);
    background-size: 3px 3px, auto, auto, auto, auto, 58px 58px, 58px 58px, 58px 58px, 58px 58px;
    background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0px 2px, 4px 35px, 29px 31px, 34px 6px;
    background-attachment: fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed;
  }
  a{color:var(--cyan);}

  .script{font-family:'Yellowtail',cursive;font-weight:400;}
  .outline{font-family:'Monoton',cursive;font-weight:400;letter-spacing:2px;}

  .neon-outline-magenta{color:#fff;text-shadow:0 0 3px #fff,0 0 16px var(--magenta);}
  .neon-outline-cyan{color:#fff;text-shadow:0 0 3px #fff,0 0 16px var(--cyan);}
  .neon-script-magenta{color:var(--magenta);text-shadow:0 0 4px var(--magenta),0 0 22px color-mix(in srgb, ${accent} 55%, transparent);}
  .neon-script-cyan{color:var(--cyan);text-shadow:0 0 4px var(--cyan),0 0 22px rgba(34,229,255,.55);}

  .glow-magenta{filter:drop-shadow(0 0 4px var(--magenta)) drop-shadow(0 0 9px color-mix(in srgb, ${accent} 65%, transparent));}
  .glow-cyan{filter:drop-shadow(0 0 4px var(--cyan)) drop-shadow(0 0 9px rgba(34,229,255,.65));}

  /* ===== NEON FLICKER (letrero de neón) =====
     Titileo sutil de cartel de neón real: oscila apenas entre brillo pleno y
     un poco más tenue, nunca apagado. ease-in-out, 4-6s, con delays
     distintos por pieza para que no titilen todas sincronizadas. */
  @keyframes neonKickerFlicker{0%,100%{text-shadow:0 0 3px #fff,0 0 16px var(--magenta);}50%{text-shadow:0 0 2px #fff,0 0 11px var(--magenta);}}
  @keyframes neonAgeFlicker{0%,100%{text-shadow:0 0 3px #fff,0 0 16px var(--cyan);}50%{text-shadow:0 0 2px #fff,0 0 11px var(--cyan);}}
  @keyframes neonNameFlicker{0%,100%{text-shadow:0 0 4px var(--magenta),0 0 22px color-mix(in srgb, var(--magenta) 55%, transparent);}50%{text-shadow:0 0 3px var(--magenta),0 0 15px color-mix(in srgb, var(--magenta) 38%, transparent);}}
  @keyframes neonScriptFlicker{0%,100%{text-shadow:0 0 4px var(--cyan),0 0 22px rgba(34,229,255,.55);}50%{text-shadow:0 0 3px var(--cyan),0 0 15px rgba(34,229,255,.36);}}
  @keyframes neonStarMagentaFlicker{0%,100%{filter:drop-shadow(0 0 4px var(--magenta)) drop-shadow(0 0 9px color-mix(in srgb, var(--magenta) 65%, transparent));}50%{filter:drop-shadow(0 0 3px var(--magenta)) drop-shadow(0 0 6px color-mix(in srgb, var(--magenta) 44%, transparent));}}
  @keyframes neonStarCyanFlicker{0%,100%{filter:drop-shadow(0 0 4px var(--cyan)) drop-shadow(0 0 9px rgba(34,229,255,.65));}50%{filter:drop-shadow(0 0 3px var(--cyan)) drop-shadow(0 0 6px rgba(34,229,255,.44));}}
  @keyframes neonDateFlicker{0%,100%{text-shadow:0 0 6px var(--magenta),0 0 20px color-mix(in srgb, var(--magenta) 70%, transparent);}50%{text-shadow:0 0 4px var(--magenta),0 0 13px color-mix(in srgb, var(--magenta) 48%, transparent);}}
  @keyframes neonPlaceFlicker{0%,100%{text-shadow:0 0 8px rgba(34,229,255,.65);}50%{text-shadow:0 0 5px rgba(34,229,255,.42);}}
  @keyframes neonTagFlicker{0%,100%{box-shadow:0 0 10px rgba(34,229,255,.35);text-shadow:0 0 6px rgba(34,229,255,.5);}50%{box-shadow:0 0 6px rgba(34,229,255,.2);text-shadow:0 0 3px rgba(34,229,255,.28);}}

  .neon-outline-magenta{animation:neonKickerFlicker 4.4s ease-in-out infinite;}
  .neon-outline-cyan{animation:neonAgeFlicker 5.1s ease-in-out infinite;animation-delay:.7s;}
  .neon-script-magenta{animation:neonNameFlicker 4.8s ease-in-out infinite;animation-delay:1.3s;}
  .neon-script-cyan{animation:neonScriptFlicker 5.6s ease-in-out infinite;animation-delay:.3s;}
  .glow-magenta{animation:neonStarMagentaFlicker 4.2s ease-in-out infinite;animation-delay:1.6s;}
  .glow-cyan{animation:neonStarCyanFlicker 5.3s ease-in-out infinite;animation-delay:.9s;}
  .date-row .big{animation:neonDateFlicker 4.6s ease-in-out infinite;animation-delay:2.1s;}
  .hero-place{animation:neonPlaceFlicker 5.8s ease-in-out infinite;animation-delay:.5s;}
  .hero-pass-tag{box-shadow:0 0 10px rgba(34,229,255,.35);animation:neonTagFlicker 4.9s ease-in-out infinite;animation-delay:1.9s;}

  @media (prefers-reduced-motion: reduce){
    .neon-outline-magenta,.neon-outline-cyan,.neon-script-magenta,.neon-script-cyan,
    .glow-magenta,.glow-cyan,.date-row .big,.hero-place,.hero-pass-tag{
      animation:none !important;
    }
  }

  /* ===== HERO ===== */
  .hero{position:relative;min-height:clamp(560px,110vh,900px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;overflow:hidden;padding:56px 20px 40px;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.2;filter:saturate(1.2) contrast(1.05);}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(13,7,16,.58) 0%, rgba(13,7,16,.74) 45%, var(--bg) 100%);}
  .hero-deco{position:absolute;inset:0;pointer-events:none;}
  .hero-content{position:relative;z-index:2;max-width:520px;}
  .squiggle{position:absolute;top:20px;left:16px;}
  .dots-corner{position:absolute;bottom:22px;right:22px;}
  .hero-bracket{position:absolute;width:26px;height:26px;color:rgba(255,255,255,.5);}
  .hero-bracket.tl{top:18px;left:18px;}
  .hero-bracket.tr{top:18px;right:18px;transform:scaleX(-1);}
  .hero-bracket.bl{bottom:18px;left:18px;transform:scaleY(-1);}
  .hero-bracket.br{bottom:18px;right:18px;transform:scale(-1,-1);}
  .hero-kicker{font-size:clamp(2.8rem,13vw,4.6rem);margin:6px 0 0;line-height:.95;}
  .hero-script-sm{font-size:clamp(1.6rem,7vw,2.4rem);margin:2px 0;}
  .hero-name{font-size:clamp(3.2rem,15vw,5.6rem);margin:0;line-height:1;word-break:break-word;}
  .hero-age{font-size:clamp(1.3rem,5vw,1.9rem);font-weight:800;letter-spacing:3px;text-transform:uppercase;margin:6px 0 20px;}
  .hero-pass-tag{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px dashed color-mix(in srgb, var(--cyan) 55%, transparent);border-radius:999px;color:var(--cyan);font-weight:700;font-size:.66rem;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:22px;background:rgba(255,255,255,.03);}
  .hero-msg{font-weight:800;text-transform:uppercase;font-size:clamp(.85rem,3vw,1.05rem);line-height:1.6;color:#fff;letter-spacing:.5px;margin:0 0 28px;}
  .date-row{display:flex;align-items:center;justify-content:center;gap:clamp(10px,3vw,22px);font-weight:800;text-transform:uppercase;letter-spacing:2px;font-size:clamp(.85rem,3vw,1.05rem);flex-wrap:wrap;}
  .date-row .big{font-size:clamp(1.8rem,7vw,2.6rem);color:var(--magenta);text-shadow:0 0 6px var(--magenta),0 0 20px color-mix(in srgb, ${accent} 70%, transparent);}
  .date-row .div{color:var(--magenta);opacity:.8;font-weight:300;}
  .hero-time{margin-top:16px;font-weight:800;letter-spacing:2px;text-transform:uppercase;font-size:clamp(.85rem,3vw,1.05rem);}
  .hero-place{margin-top:20px;font-weight:800;letter-spacing:1px;text-transform:uppercase;font-size:clamp(.8rem,2.8vw,.95rem);color:var(--cyan);text-shadow:0 0 8px rgba(34,229,255,.65);max-width:420px;}
  .hero-mic{margin-top:30px;}
  .star{position:absolute;}

  /* ===== SECTIONS ===== */
  section{padding:clamp(36px,7vw,72px) 20px;position:relative;}
  .section-inner{max-width:1000px;margin:0 auto;}
  .section-title{text-align:center;font-size:clamp(1rem,3.2vw,1.3rem);margin:0 0 30px;text-transform:uppercase;letter-spacing:3px;font-weight:800;}
  .section-title.magenta{color:var(--magenta);text-shadow:0 0 6px var(--magenta),0 0 18px color-mix(in srgb, ${accent} 50%, transparent);}
  .section-title.cyan{color:var(--cyan);text-shadow:0 0 6px var(--cyan),0 0 18px rgba(34,229,255,.5);}
  .section-script{text-align:center;font-family:'Yellowtail',cursive;font-size:clamp(2.2rem,7vw,3.2rem);margin:0 0 6px;}

  .ticket-divider{display:flex;align-items:center;justify-content:center;gap:14px;max-width:220px;margin:0 auto 34px;color:color-mix(in srgb, var(--cyan) 70%, var(--magenta));}
  .ticket-divider span{flex:1;height:1px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.55;}

  /* ===== COUNTDOWN / TICKET STRIP ===== */
  .ticket-strip{position:relative;max-width:640px;margin:0 auto;background:linear-gradient(165deg, rgba(255,255,255,.05), rgba(0,0,0,.3));border:1px solid var(--line);border-radius:20px;padding:26px 26px 20px;box-shadow:0 22px 46px -22px rgba(0,0,0,.7), 0 0 26px -8px color-mix(in srgb, ${accent} 32%, transparent);}
  .ticket-eyebrow{text-align:center;font-size:.62rem;letter-spacing:3px;text-transform:uppercase;color:var(--ink-dim);margin:0 0 18px;}
  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown>div{flex:1;min-width:64px;text-align:center;background:color-mix(in srgb, ${accent} 7%, transparent);border:1px solid rgba(34,229,255,.32);border-radius:14px;padding:clamp(12px,2vw,18px) 4px;}
  .cd-num{display:block;font-size:clamp(1.6rem,5vw,2.4rem);font-weight:800;color:#fff;text-shadow:0 0 8px var(--cyan),0 0 18px var(--cyan);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:2px;color:#8fefff;}
  .ticket-perf{position:relative;height:0;margin:22px -26px 14px;border-top:1.5px dashed rgba(255,255,255,.18);}
  .ticket-perf::before,.ticket-perf::after{content:"";position:absolute;top:-8px;width:16px;height:16px;border-radius:50%;background:var(--bg);}
  .ticket-perf::before{left:-8px;}
  .ticket-perf::after{right:-8px;}
  .ticket-foot{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;color:var(--ink-dim);}
  .ticket-foot span{font-size:.6rem;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;}

  /* ===== TARJETAS "PASE" (cronograma / dress code) ===== */
  .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:34px 20px;}
  .pass{position:relative;background:linear-gradient(165deg, rgba(255,255,255,.045), rgba(0,0,0,.3));border:1px solid var(--line);border-radius:18px;padding:34px 24px 26px;box-shadow:0 20px 42px -20px rgba(0,0,0,.7), 0 0 22px -8px color-mix(in srgb, ${accent} 30%, transparent);}
  .pass-badge{position:absolute;top:-23px;left:50%;transform:translateX(-50%);width:46px;height:46px;border-radius:50%;background:var(--bg2);border:1px solid var(--cyan);display:flex;align-items:center;justify-content:center;color:var(--cyan);box-shadow:0 0 14px rgba(34,229,255,.5);z-index:3;}
  .pass-badge.magenta{border-color:var(--magenta);color:var(--magenta);box-shadow:0 0 14px color-mix(in srgb, ${accent} 60%, transparent);}
  .pass h3{margin:0 0 14px;text-transform:uppercase;letter-spacing:2px;font-size:.92rem;color:#fff;text-align:center;}
  .pass-perf-sm{position:relative;height:0;margin:0 -24px 16px;border-top:1.5px dashed rgba(255,255,255,.16);}
  .pass-perf-sm::before,.pass-perf-sm::after{content:"";position:absolute;top:-7px;width:14px;height:14px;border-radius:50%;background:var(--bg);}
  .pass-perf-sm::before{left:-7px;}
  .pass-perf-sm::after{right:-7px;}
  .pass p{margin:0;line-height:1.6;color:var(--ink-dim);font-size:.94rem;text-align:center;}
  .pass p strong{color:#fff;}
  .pass a.mapa{display:inline-block;margin-top:14px;font-weight:700;color:var(--cyan);text-decoration:none;border-bottom:1px dashed var(--cyan);}
  .pass-wrap{text-align:center;}

  /* ===== MENSAJE / PADRES ===== */
  .center{text-align:center;}
  .quote-card{position:relative;max-width:640px;margin:0 auto;background:linear-gradient(165deg, rgba(255,255,255,.045), rgba(0,0,0,.3));border:1px solid var(--line);border-radius:18px;padding:clamp(34px,5vw,48px) clamp(22px,4vw,44px) 30px;box-shadow:0 20px 42px -20px rgba(0,0,0,.7);}
  .quote-mark{position:absolute;top:0;left:50%;transform:translate(-50%,-52%);background:var(--bg2);padding:0 10px;color:var(--magenta);}
  .mensaje-box{margin:0;text-align:center;font-style:italic;font-size:clamp(1rem,2.5vw,1.2rem);line-height:1.75;color:#f0e6ff;}
  .padres-line{margin-top:20px;color:var(--ink-dim);font-size:.85rem;letter-spacing:1px;text-transform:uppercase;text-align:center;}

  /* ===== DRESS CODE ===== */
  .swatches-row{display:flex;justify-content:center;gap:10px;margin:0 0 20px;}
  .swatches-row span{width:22px;height:22px;border-radius:50%;display:inline-block;border:1px solid rgba(255,255,255,.2);}
  .pill{display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:999px;background:color-mix(in srgb, ${accent} 10%, transparent);border:1px solid var(--magenta);color:#fff;font-weight:700;box-shadow:0 0 20px color-mix(in srgb, ${accent} 32%, transparent);}

  /* ===== GALLERY ===== */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;}
  .gallery-item{position:relative;background:var(--bg2);border-radius:14px;padding:8px 8px 20px;border:1px solid rgba(255,255,255,.12);box-shadow:0 16px 32px -16px rgba(0,0,0,.65), 0 0 16px -6px color-mix(in srgb, var(--cyan) 26%, transparent);transition:transform .3s;}
  .gallery-item:nth-child(4n+1){transform:rotate(-2deg);}
  .gallery-item:nth-child(4n+2){transform:rotate(1.5deg);}
  .gallery-item:nth-child(4n+3){transform:rotate(-1deg);}
  .gallery-item:nth-child(4n+4){transform:rotate(2deg);}
  .gallery-item:hover{transform:rotate(0deg) scale(1.05);z-index:2;}
  .gallery-item img{width:100%;height:170px;object-fit:cover;display:block;cursor:pointer;border-radius:9px;}
  .gallery-item::after{content:"";position:absolute;left:50%;bottom:9px;transform:translateX(-50%);width:28px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--magenta),var(--cyan));opacity:.85;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,2,10,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:10px;box-shadow:0 0 40px rgba(34,229,255,.5);}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;text-shadow:0 0 10px var(--magenta);}

  /* ===== RSVP ===== */
  .rsvp-pass{max-width:560px;margin:0 auto;}
  .pass-eyebrow{text-align:center;font-size:.62rem;letter-spacing:3px;text-transform:uppercase;color:var(--ink-dim);margin:0 0 6px;}
  .pass-deadline{text-align:center;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--cyan);margin:0 0 4px;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin:0;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:#8fefff;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px;border-radius:10px;border:1px solid rgba(34,229,255,.4);margin-top:6px;width:100%;background:rgba(255,255,255,.06);color:#fff;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#8f7bb0;}
  .rsvp-form button{background:linear-gradient(90deg,var(--magenta),var(--violeta));color:#fff;border:0;padding:14px;border-radius:999px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 0 22px color-mix(in srgb, ${accent} 45%, transparent);}
  .rsvp-whatsapp{color:var(--cyan);font-size:.85rem;text-align:center;}
  .rsvp-status{font-weight:bold;color:#7CFFB2;text-align:center;}
  .pass-barcode{display:flex;justify-content:center;margin-top:22px;color:rgba(255,255,255,.4);}

  footer{position:relative;text-align:center;padding:44px 20px 50px;font-size:.8rem;color:var(--ink-dim);letter-spacing:1px;border-top:1px dashed rgba(255,255,255,.12);}
  footer .script{font-size:2rem;display:block;margin-bottom:8px;}
  footer .foot-spark{color:var(--magenta);margin-bottom:10px;}
</style></head>
<body>

  <!-- ===== HERO ===== -->
  <div class="hero">
    <div class="hero-bg" style="background-image:url('${esc(d.coverImage)}')"></div>
    <div class="hero-overlay"></div>
    <div class="hero-deco">
      ${squiggle()}
      <div class="hero-bracket tl">${bracketCorner()}</div>
      <div class="hero-bracket tr">${bracketCorner()}</div>
      <div class="hero-bracket bl">${bracketCorner()}</div>
      <div class="hero-bracket br">${bracketCorner()}</div>
      <div class="star" style="top:6%;right:8%">${`<span class="glow-magenta" style="color:${accent}">${starIcon(46)}</span>`}</div>
      <div class="star" style="top:12%;left:6%"><span class="glow-cyan" style="color:#22e5ff">${starIcon(40)}</span></div>
      <div class="star" style="top:52%;left:4%"><span class="glow-cyan" style="color:#22e5ff">${boltIcon(40)}</span></div>
      <div class="star" style="top:48%;right:5%"><span class="glow-cyan" style="color:#22e5ff">${starIcon(44)}</span></div>
      <div class="star" style="top:72%;left:8%"><span class="glow-magenta" style="color:${accent}">${starIcon(40)}</span></div>
      <div class="star" style="top:78%;right:9%"><span class="glow-magenta" style="color:${accent}">${boltIcon(40)}</span></div>
      ${dotsGrid("#22e5ff")}
    </div>
    <div class="hero-content">
      <p class="outline neon-outline-magenta hero-kicker">MIS XV</p>
      <p class="script neon-script-cyan hero-script-sm">la fiesta de</p>
      <h1 class="script neon-script-magenta hero-name">${esc(d.nombre)}</h1>
      <p class="outline neon-outline-cyan hero-age">15 años</p>
      <div class="hero-pass-tag">${ticketIcon(14)} Pase VIP · Noche de Neón</div>
      <p class="hero-msg">Luces, color y pura energía: vení a brillar con nosotros en mi cumple</p>
      <div class="date-row">
        <span>${esc(fp.weekday)}</span><span class="div">|</span><span class="big">${esc(fp.day)}</span><span class="div">|</span><span>${esc(fp.month)}</span>
      </div>
      ${(d.horaFiesta || d.horaCeremonia) ? `<p class="hero-time">${esc(d.horaFiesta || d.horaCeremonia)} hs en adelante</p>` : ""}
      ${d.lugarFiesta ? `<p class="hero-place">${esc(d.lugarFiesta)}</p>` : ""}
      <div class="hero-mic">${micIcon(accent)}</div>
    </div>
  </div>

  <!-- ===== COUNTDOWN ===== -->
  <section>
    <div class="section-inner">
      <p class="section-script neon-script-cyan">Ya casi arranca</p>
      <h2 class="section-title magenta">la cuenta regresiva</h2>
      <div class="ticket-strip">
        <p class="ticket-eyebrow">Pase de ingreso · válido para 1 persona</p>
        ${cd.html}
        <div class="ticket-perf"></div>
        <div class="ticket-foot">
          ${barcodeSVG("rgba(255,255,255,.42)", 22)}
          <span>Admit One — Mis XV de ${esc(nombreUpper)}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== CRONOGRAMA ===== -->
  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `
  <section>
    <div class="section-inner">
      ${ticketDivider()}
      <p class="section-script neon-script-magenta">El plan de</p>
      <h2 class="section-title cyan">la noche</h2>
      <div class="grid-2">
        ${d.horaCeremonia || d.lugarCeremonia ? `
        <div class="pass">
          <div class="pass-badge">${starIcon(18)}</div>
          <h3>Ceremonia</h3>
          <div class="pass-perf-sm"></div>
          <p>${d.horaCeremonia ? `Hora: <strong>${esc(d.horaCeremonia)}</strong><br>` : ""}${esc(d.lugarCeremonia)}</p>
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `
        <div class="pass">
          <div class="pass-badge magenta">${headphonesIcon(18)}</div>
          <h3>Fiesta</h3>
          <div class="pass-perf-sm"></div>
          <p>${d.horaFiesta ? `Hora: <strong>${esc(d.horaFiesta)}</strong><br>` : ""}${esc(d.lugarFiesta)}</p>
          ${d.direccionMapa ? `<p class="pass-wrap"><a class="mapa" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>` : ""}
        </div>` : ""}
      </div>
    </div>
  </section>` : ""}

  <!-- ===== MENSAJE / PADRES ===== -->
  ${(d.mensaje || d.padres) ? `
  <section>
    <div class="section-inner">
      ${ticketDivider()}
      ${d.mensaje ? `<p class="section-script neon-script-cyan">Un mensaje</p>
      <h2 class="section-title magenta">para vos</h2>
      <div class="quote-card">
        <div class="quote-mark">${sparkleIcon(20)}</div>
        <p class="mensaje-box">${esc(d.mensaje)}</p>
      </div>` : ""}
      ${d.padres ? `<p class="center padres-line">Con el cariño de ${esc(d.padres)}</p>` : ""}
    </div>
  </section>` : ""}

  <!-- ===== DRESS CODE ===== -->
  ${d.dressCode ? `
  <section>
    <div class="section-inner center">
      ${ticketDivider()}
      <p class="section-script neon-script-magenta">Vení así</p>
      <h2 class="section-title cyan">dress code</h2>
      <div class="swatches-row">
        <span style="background:${accent}"></span>
        <span style="background:#22e5ff"></span>
        <span style="background:#7b2ff7"></span>
        <span style="background:#fdf7ff"></span>
      </div>
      <div class="pill">${hangerIcon(20)} ${esc(d.dressCode)}</div>
    </div>
  </section>` : ""}

  <!-- ===== GALERÍA ===== -->
  ${(d.galeria && d.galeria.length) ? `
  <section>
    <div class="section-inner">
      ${ticketDivider()}
      <p class="section-script neon-script-cyan">Momentos</p>
      <h2 class="section-title magenta">antes de la fiesta</h2>
      ${gal.html}
    </div>
  </section>` : ""}

  <!-- ===== RSVP ===== -->
  <section>
    <div class="section-inner">
      ${ticketDivider()}
      <p class="section-script neon-script-magenta">Confirmá</p>
      <h2 class="section-title cyan">tu lugar en la pista</h2>
      <div class="pass rsvp-pass">
        <div class="pass-badge">${ticketIcon(18)}</div>
        <p class="pass-eyebrow">Pase de acceso</p>
        ${rsvpDeadline ? `<p class="pass-deadline">Confirmá antes del ${esc(rsvpDeadline)}</p>` : ""}
        <div class="pass-perf-sm"></div>
        ${rsvp.html}
        <div class="pass-barcode">${barcodeSVG("rgba(255,255,255,.42)", 20)}</div>
      </div>
    </div>
  </section>

  <footer>
    <div class="foot-spark">${sparkleIcon(18)}</div>
    <span class="script neon-script-magenta">${esc(d.nombre)}</span>
    Gracias por ser parte de esta noche de luces · ¡Nos vemos en la pista! 🎶
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function fechaPartes(fechaISO) {
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
  if (!fechaISO) return { weekday: "", day: "", month: "" };
  const [y, m, day] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !day) return { weekday: "", day: "", month: "" };
  const dt = new Date(Date.UTC(y, m - 1, day));
  return { weekday: dias[dt.getUTCDay()], day: String(day), month: meses[m - 1] };
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:
      radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0),
      radial-gradient(ellipse at 20% 15%, rgba(255,45,149,.25), transparent 55%),
      radial-gradient(ellipse at 85% 85%, rgba(34,229,255,.22), transparent 55%),
      linear-gradient(160deg,#150a1a 0%,#0d0710 55%,#1a0e21 100%);
    background-size:3px 3px, auto, auto, auto;">
    <div style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border:1px dashed rgba(34,229,255,.6);border-radius:999px;color:#22e5ff;font-family:Poppins,Arial,sans-serif;font-size:.5rem;letter-spacing:1.5px;text-transform:uppercase;">Pase VIP</div>
    <div style="font-family:'Yellowtail',cursive;font-size:1.5rem;color:#ff2d95;text-shadow:0 0 4px #ff2d95,0 0 16px rgba(255,45,149,.6);line-height:1;">${esc(d.name)}</div>
    <div style="font-family:Poppins,Arial,sans-serif;font-size:.55rem;letter-spacing:3px;color:#fff;text-shadow:0 0 3px #fff,0 0 10px #22e5ff;">15 AÑOS</div>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Neón Fiesta",
  summary: "Noche de club flúo con estética de pase VIP: pared texturizada, insignias circulares de línea, tarjetas perforadas y luces de neón magenta y cian a pura energía.",
  accent: "#ff2d95", accent2: "#22e5ff", schema: xvSchema, sampleData, render, cardPreview,
};
