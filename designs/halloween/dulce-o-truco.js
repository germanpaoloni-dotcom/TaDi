const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { halloweenSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "hall-dulce-o-truco";

const sampleData = {
  nombre: "Fiesta de Disfraces de los Gómez",
  fecha: "2027-10-30",
  hora: "17:00",
  lugar: "Quinta Los Aromos, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Quinta+Los+Aromos+San+Isidro",
  mensaje: "¡Se viene la tarde más dulce del año! Nos juntamos toda la familia y los amigos a festejar Halloween con juegos, golosinas y muchísimos disfraces. Vení con onda, con ganas de reírte y con la bolsita lista para el 'dulce o truco' 🍬🎃",
  disfraz: "Disfraz obligatorio: buena onda y mucho color, nada de sustos de verdad 🎃",
  whatsapp: "5491100000045",
  fechaLimiteRSVP: "2027-10-24",
  coverImage: "https://images.unsplash.com/photo-1603663572429-bfd1920fef23?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1508361727343-ca787442dcd7?w=800&q=80",
    "https://images.unsplash.com/photo-1541257087499-9bb0791f7825?w=800&q=80",
    "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&q=80",
    "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=800&q=80",
  ],
};

// ---------- Iconografía / decoración inline (sin librerías externas) ----------
// Todo en SVG con currentColor para heredar el color del contenedor, salvo
// donde la ilustración necesita más de un color (candy corn, mascota).

function jackOLanternIcon(size = 26) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 8c-1-3-4-5-7-5" stroke="#5a7d3a" stroke-width="3" stroke-linecap="round"/>
    <path d="M34 8c1-3 4-5 7-5" stroke="#5a7d3a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="32" cy="36" rx="26" ry="22" fill="#ff8c1a"/>
    <path d="M32 14v44" stroke="#e0700a" stroke-width="2" opacity=".55"/>
    <path d="M15 16c3 6 3 40 0 40" stroke="#e0700a" stroke-width="2" opacity=".55"/>
    <path d="M49 16c-3 6-3 40 0 40" stroke="#e0700a" stroke-width="2" opacity=".55"/>
    <ellipse cx="32" cy="36" rx="26" ry="22" fill="none" stroke="#e0700a" stroke-width="2"/>
    <path d="M20 32c2-4 8-4 10 0" stroke="#3a2618" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M34 32c2-4 8-4 10 0" stroke="#3a2618" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M18 44c4 6 24 6 28 0-2 5-6 8-14 8s-12-3-14-8Z" fill="#3a2618"/>
    <path d="M25 44l2 4M32 44v5M39 44l-2 4" stroke="#ff8c1a" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function candyCornIcon(size = 20, rotate = 0) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="transform:rotate(${rotate}deg)">
    <path d="M12 2 22 20a2 2 0 0 1-1.8 3H3.8A2 2 0 0 1 2 20L12 2Z" fill="#fff6e9" stroke="#e0700a" stroke-width="1.4"/>
    <path d="M4.6 16.6h14.8L12 2 4.6 16.6Z" fill="#ff8c1a"/>
    <path d="M2.7 20.4h18.6L12 2 2.7 20.4Z" fill="none"/>
    <path d="M6.4 20.6h11.2c1 0 1.6.6 1.9 1.4L22 20l-10-18-10 18 2.2 1.9c.3-.7.9-1.3 2.2-1.3Z" fill="#ffce54"/>
    <path d="M8.2 23.4h7.6c.7 1.3.6 2.9-1.9 3.4H10c-2.4-.5-2.5-2.1-1.8-3.4Z" fill="#fff6e9"/>
  </svg>`;
}

function lollipopIcon(size = 22, hue = "#7b4fb0") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 30v27" stroke="#c99b52" stroke-width="3" stroke-linecap="round"/>
    <circle cx="20" cy="17" r="16" fill="${hue}"/>
    <path d="M20 17 A16 16 0 0 1 36 17 A16 16 0 0 1 20 33 A9 9 0 0 0 20 17Z" fill="#fff" opacity=".2"/>
    <path d="M20 3a14 14 0 0 1 9.9 4.1" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>
    <circle cx="20" cy="17" r="16" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1.4"/>
  </svg>`;
}

function ghostIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 2C10 2 4 10 4 20v20l5-5 5 5 6-6 6 6 5-5 5 5V20C36 10 30 2 20 2Z" fill="currentColor"/>
    <circle cx="14" cy="19" r="2.6" fill="#3a2618"/>
    <circle cx="26" cy="19" r="2.6" fill="#3a2618"/>
    <path d="M15 27c3 2 7 2 10 0" stroke="#3a2618" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function batIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M24 8c-3-6-11-8-24-6 6 2 9 5 10 8-6-1-9 1-10 4 5 0 8 1 10 3-3 1-4 3-3 6 3-2 6-4 9-3 2 .6 3.4 2 4 4 .6-2 2-3.4 4-4 3-1 6 1 9 3 1-3 0-5-3-6 2-2 5-4 10-3-1-3-4-5-10-4 1-3 4-6 10-8-13-2-21 0-24 6-.6-1.2-1.4-2-3-2s-2.4.8-3 2Z" fill="currentColor"/>
  </svg>`;
}

function maskIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 8c2-6 9-8 14-4 5-4 12-2 14 4-1 8-6 11-14 8-8 3-13 0-14-8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="2"/>
    <circle cx="23" cy="9" r="3" stroke="currentColor" stroke-width="2"/>
    <path d="M27 6l4-3M27 12l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

function bagIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 12h16l2 16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l2-16Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M11 12V9a5 5 0 0 1 10 0v3" stroke="currentColor" stroke-width="2"/>
    <path d="M6 17h20" stroke="currentColor" stroke-width="1.6" stroke-dasharray="1 3.2" stroke-linecap="round"/>
  </svg>`;
}

function clockIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9.4" stroke="currentColor" stroke-width="1.6"/>
    <path d="M12 7v5.4l3.6 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function pinIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21s7-7.2 7-12.4A7 7 0 0 0 5 8.6C5 13.8 12 21 12 21Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="12" cy="8.4" r="2.6" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

function ticketIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 9.6a2 2 0 0 0 0-4h18a2 2 0 0 0 0 4 2 2 0 0 1 0 4.8 2 2 0 0 0 0 4.8H3a2 2 0 0 0 0-4.8 2 2 0 0 1 0-4.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M14.2 5.4v13.2" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2.2 2.4"/>
  </svg>`;
}

// separador con dulces alternados en vez de la típica línea + estrella
function candyDivider() {
  return `<div class="divider" aria-hidden="true">
    <span></span>${candyCornIcon(16, -8)}<span class="ghost-mini">${ghostIcon(15)}</span>${lollipopIcon(16, "#9be564")}<span></span>
  </div>`;
}

// franja ondulada (SVG wave) usada como remate divertido antes de la
// sección de disfraz — juega con las dos acepciones de "onda".
function waveBand(colorTop, colorBottom) {
  return `<div class="wave-band" aria-hidden="true" style="color:${colorTop}">
    <svg viewBox="0 0 500 40" preserveAspectRatio="none"><path d="M0 20c40 20 80 20 125 0s85-20 125 0 85 20 125 0 85-20 125 0v20H0Z" fill="currentColor"/></svg>
  </div>
  <div class="wave-fill" style="background:${colorBottom}"></div>`;
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

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#ff8c1a");
  const accent2 = "#7b4fb0";
  const lime = "#9be564";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd-dot");
  const gal = galleryWidget(d.galeria || [], "gal-dot");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const fp = fechaPartes(d.fecha);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombre)} · Dulce o Truco</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --cream:#fff6e9; --cream2:#fdecd2;
    --ink:#3a2618; --ink-dim:#7a5f47;
    --accent:${accent}; --accent2:${accent2}; --lime:${lime};
    --line:color-mix(in srgb, var(--accent) 35%, transparent);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;font-family:'Nunito',Arial,sans-serif;background-color:var(--cream);color:var(--ink);
    background-image:
      repeating-linear-gradient(135deg, transparent 0 22px, color-mix(in srgb, var(--accent) 7%, transparent) 22px 26px, transparent 26px 48px),
      radial-gradient(ellipse at 12% 6%, color-mix(in srgb, var(--lime) 30%, transparent), transparent 55%),
      radial-gradient(ellipse at 90% 14%, color-mix(in srgb, var(--accent2) 22%, transparent), transparent 55%),
      linear-gradient(180deg, var(--cream) 0%, var(--cream2) 100%);
    background-attachment:fixed,fixed,fixed,fixed;
  }
  a{color:var(--accent2);}
  .fun{font-family:'Baloo 2',Verdana,sans-serif;font-weight:800;}

  /* ===== accesibilidad: respetar "menos movimiento" ===== */
  @media (prefers-reduced-motion: reduce){
    *, *::before, *::after{
      animation-duration:.01ms !important; animation-iteration-count:1 !important;
      transition-duration:.01ms !important; scroll-behavior:auto !important;
    }
  }

  /* ===== decoración flotante (caramelos/fantasmitas) ===== */
  .floaty{position:absolute;pointer-events:none;animation:candy-bob 4.2s ease-in-out infinite;}
  @keyframes candy-bob{0%,100%{transform:translateY(0) rotate(var(--r,0deg));}50%{transform:translateY(-10px) rotate(var(--r,0deg));}}

  /* ===== HERO ===== */
  .hero{position:relative;min-height:clamp(520px,92vh,820px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;overflow:hidden;padding:40px 20px 44px;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.24;filter:saturate(1.2);}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,246,233,.35) 0%, rgba(255,246,233,.78) 46%, var(--cream) 100%);}
  .hero-content{position:relative;z-index:2;max-width:560px;width:100%;}

  .mascot-wrap{display:flex;flex-direction:column;align-items:center;margin:0 0 6px;}
  .mascot{animation:pumpkin-bob 3.2s ease-in-out infinite;filter:drop-shadow(0 10px 16px rgba(122,79,20,.28));}
  @keyframes pumpkin-bob{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-8px) rotate(2deg);}}

  .hero-kicker{display:inline-flex;align-items:center;gap:8px;font-family:'Baloo 2',sans-serif;font-size:.78rem;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:#fff;background:var(--accent2);padding:7px 18px;border-radius:30px;margin:8px 0 4px;box-shadow:0 4px 0 color-mix(in srgb, var(--accent2), black 20%);}
  .hero-name{font-size:clamp(2.3rem,9vw,3.6rem);line-height:1.08;margin:14px 0 6px;color:var(--ink);text-shadow:0 3px 0 rgba(255,140,26,.25);word-break:break-word;}
  .hero-msg{font-weight:700;font-size:clamp(.94rem,3vw,1.08rem);line-height:1.7;color:var(--ink-dim);max-width:460px;margin:0 auto 22px;}
  .date-row{display:flex;align-items:center;justify-content:center;gap:clamp(8px,3vw,18px);font-family:'Baloo 2',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;font-size:clamp(.82rem,3vw,1rem);flex-wrap:wrap;color:var(--ink);}
  .date-row .big{font-size:clamp(1.7rem,7vw,2.4rem);color:var(--accent);}
  .date-row .div{opacity:.5;font-weight:400;}
  .hero-time,.hero-place{margin-top:10px;font-weight:800;letter-spacing:.5px;font-size:clamp(.86rem,2.8vw,1rem);color:var(--ink-dim);}
  .hero-time span, .hero-place span{display:inline-flex;vertical-align:-4px;margin-right:6px;color:var(--accent2);}

  /* ===== SECTIONS ===== */
  section{padding:clamp(30px,7vw,64px) 20px;position:relative;}
  .section-inner{max-width:1000px;margin:0 auto;}
  .section-title{text-align:center;font-size:clamp(1.5rem,5vw,2.1rem);margin:0 0 6px;color:var(--ink);}
  .section-sub{text-align:center;color:var(--ink-dim);font-size:.9rem;font-weight:700;margin:0 0 28px;}
  .divider{display:flex;align-items:center;justify-content:center;gap:10px;max-width:260px;margin:0 auto 26px;color:var(--accent);}
  .divider span:not(.ghost-mini){flex:1;height:2px;border-radius:2px;background:repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 11px);opacity:.55;}
  .ghost-mini{color:var(--accent2);opacity:.85;}

  /* ===== COUNTDOWN ===== */
  .card-panel{position:relative;background:#fff;border:2px solid var(--line);border-radius:22px;padding:26px 24px 22px;box-shadow:0 18px 36px -20px rgba(122,79,20,.35);}
  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown>div{flex:1;min-width:64px;text-align:center;background:color-mix(in srgb, var(--accent) 10%, transparent);border:2px solid color-mix(in srgb, var(--accent) 35%, transparent);border-radius:16px;padding:clamp(12px,2vw,18px) 4px;}
  .cd-num{display:block;font-family:'Baloo 2',sans-serif;font-size:clamp(1.6rem,5vw,2.3rem);font-weight:800;color:var(--accent2);}
  .cd-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--ink-dim);}

  /* ===== DATOS ===== */
  .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px 20px;max-width:760px;margin:0 auto;}
  .info-card{position:relative;background:#fff;border:2px solid var(--line);border-radius:20px;padding:26px 22px;box-shadow:0 16px 32px -20px rgba(122,79,20,.3);text-align:center;transition:transform .25s ease;}
  .info-card:hover{transform:translateY(-4px) rotate(-.6deg);}
  .info-card .ico{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:color-mix(in srgb, var(--accent) 16%, transparent);color:var(--accent2);margin-bottom:12px;}
  .info-card h3{margin:0 0 8px;font-family:'Baloo 2',sans-serif;font-size:.9rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent2);}
  .info-card p{margin:0;line-height:1.6;color:var(--ink-dim);font-weight:700;font-size:.96rem;}
  .info-card p strong{color:var(--ink);}
  .info-card a.mapa{display:inline-block;margin-top:12px;font-weight:800;color:var(--accent2);text-decoration:none;border-bottom:2px dashed var(--accent2);}

  /* ===== MENSAJE ===== */
  .quote-card{position:relative;max-width:640px;margin:0 auto;background:#fff;border:2px dashed var(--accent);border-radius:22px;padding:clamp(28px,5vw,40px) clamp(22px,4vw,36px) 26px;box-shadow:0 16px 34px -20px rgba(122,79,20,.3);text-align:center;}
  .quote-mark{position:absolute;top:0;left:50%;transform:translate(-50%,-54%);background:var(--cream);padding:0 12px;}
  .mensaje-box{margin:0;font-weight:700;font-size:clamp(1rem,2.5vw,1.12rem);line-height:1.75;color:var(--ink);}

  /* ===== ONDA / DISFRAZ ===== */
  .wave-band{position:relative;line-height:0;margin-top:-1px;}
  .wave-band svg{display:block;width:100%;height:34px;}
  .wave-fill{padding:6px 0 1px;}
  .disfraz-section{padding-top:0;}
  .disfraz-inner{padding:clamp(30px,6vw,54px) 20px clamp(40px,7vw,64px);text-align:center;}
  .disfraz-pill{display:inline-flex;align-items:center;gap:12px;background:#fff;border:2px solid rgba(255,255,255,.7);color:var(--accent2);padding:16px 26px;border-radius:999px;font-weight:800;font-size:clamp(.92rem,2.6vw,1.05rem);box-shadow:0 14px 28px -14px rgba(0,0,0,.35);max-width:520px;}
  .disfraz-pill .ico{flex:0 0 auto;color:var(--accent);}
  .disfraz-title{color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.12);}
  .disfraz-sub{color:rgba(255,255,255,.9);}

  /* ===== GALLERY ===== */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;}
  .gallery-item{position:relative;background:#fff;border-radius:16px;padding:8px 8px 20px;border:2px solid var(--line);box-shadow:0 14px 28px -16px rgba(122,79,20,.35);transition:transform .3s;}
  .gallery-item:nth-child(4n+1){transform:rotate(-2deg);}
  .gallery-item:nth-child(4n+2){transform:rotate(1.5deg);}
  .gallery-item:nth-child(4n+3){transform:rotate(-1deg);}
  .gallery-item:nth-child(4n+4){transform:rotate(2deg);}
  .gallery-item:hover{transform:rotate(0deg) scale(1.05);z-index:2;}
  .gallery-item img{width:100%;height:170px;object-fit:cover;display:block;cursor:pointer;border-radius:10px;}
  .gallery-item::after{content:"";position:absolute;left:50%;bottom:9px;transform:translateX(-50%);width:26px;height:4px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:.85;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(58,38,24,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,.5);}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;}

  /* ===== RSVP ===== */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin:0 auto;max-width:520px;}
  .rsvp-form label{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent2);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px;border-radius:12px;border:2px solid var(--line);margin-top:6px;width:100%;background:#fffaf1;color:var(--ink);}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#b79a7c;}
  .rsvp-form button{background:linear-gradient(90deg,var(--accent),var(--accent2));color:#fff;border:0;padding:14px;border-radius:999px;font-family:'Baloo 2',sans-serif;font-weight:800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;box-shadow:0 6px 0 color-mix(in srgb, var(--accent2), black 20%);transition:transform .15s ease, box-shadow .15s ease;}
  .rsvp-form button:hover{transform:translateY(-2px);}
  .rsvp-form button:active{transform:translateY(3px);box-shadow:0 2px 0 color-mix(in srgb, var(--accent2), black 20%);}
  .rsvp-whatsapp{color:var(--accent2);font-weight:800;font-size:.85rem;text-align:center;}
  .rsvp-status{font-weight:800;color:#4a8f2a;text-align:center;}
  .rsvp-deadline{text-align:center;font-family:'Baloo 2',sans-serif;font-size:.82rem;letter-spacing:1.2px;text-transform:uppercase;color:var(--accent2);margin:0 0 18px;}

  footer{position:relative;text-align:center;padding:44px 20px 50px;font-size:.9rem;font-weight:700;color:var(--ink-dim);border-top:2px dashed var(--line);}
  footer .foot-name{display:block;font-family:'Baloo 2',sans-serif;font-size:1.5rem;margin-bottom:8px;color:var(--accent2);}
</style></head>
<body>

  <!-- ===== HERO ===== -->
  <div class="hero">
    <div class="hero-bg" style="background-image:url('${esc(d.coverImage)}')"></div>
    <div class="hero-overlay"></div>
    <div class="floaty" style="top:10%;left:7%;color:${accent};--r:-10deg;">${candyCornIcon(30, -10)}</div>
    <div class="floaty" style="top:16%;right:8%;color:${lime};--r:12deg;animation-delay:.6s;">${lollipopIcon(28, lime)}</div>
    <div class="floaty" style="top:62%;left:6%;color:${accent2};--r:-6deg;animation-delay:1.1s;">${ghostIcon(30)}</div>
    <div class="floaty" style="top:58%;right:7%;color:${accent};--r:8deg;animation-delay:1.6s;">${batIcon(30)}</div>
    <div class="hero-content">
      <div class="mascot-wrap">
        <div class="mascot">${jackOLanternIcon(96)}</div>
      </div>
      <p class="hero-kicker">${bagIcon(14)} Dulce o truco</p>
      <h1 class="fun hero-name">${esc(d.nombre)}</h1>
      ${d.mensaje ? `<p class="hero-msg">${esc(d.mensaje)}</p>` : ""}
      <div class="date-row">
        <span>${esc(fp.weekday)}</span><span class="div">·</span><span class="big fun">${esc(fp.day)}</span><span class="div">·</span><span>${esc(fp.month)}</span>
      </div>
      ${d.hora ? `<p class="hero-time"><span>${clockIcon(16)}</span>${esc(d.hora)} hs</p>` : ""}
      ${d.lugar ? `<p class="hero-place"><span>${pinIcon(16)}</span>${esc(d.lugar)}</p>` : ""}
    </div>
  </div>

  <!-- ===== COUNTDOWN ===== -->
  <section>
    <div class="section-inner">
      <h2 class="fun section-title">Faltan...</h2>
      <p class="section-sub">para salir a pedir caramelos</p>
      <div class="card-panel">
        ${cd.html}
      </div>
    </div>
  </section>

  <!-- ===== DATOS ===== -->
  ${(d.fecha || d.hora || d.lugar) ? `
  <section>
    <div class="section-inner">
      ${candyDivider()}
      <h2 class="fun section-title">La previa</h2>
      <p class="section-sub">todo lo que tenés que saber</p>
      <div class="grid-2">
        ${(d.fecha || d.hora) ? `
        <div class="info-card">
          <span class="ico">${clockIcon(20)}</span>
          <h3>Cuándo</h3>
          <p>${d.fecha ? `${esc(fp.weekday)} ${esc(fp.day)} de ${esc((fp.month || "").toLowerCase())}<br>` : ""}${d.hora ? `<strong>${esc(d.hora)} hs</strong>` : ""}</p>
        </div>` : ""}
        ${d.lugar ? `
        <div class="info-card">
          <span class="ico">${pinIcon(20)}</span>
          <h3>Dónde</h3>
          <p>${esc(d.lugar)}</p>
          ${d.direccionMapa ? `<a class="mapa" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
        </div>` : ""}
      </div>
    </div>
  </section>` : ""}

  <!-- ===== MENSAJE ===== -->
  ${d.mensaje ? `
  <section>
    <div class="section-inner">
      ${candyDivider()}
      <h2 class="fun section-title">Un mensajito</h2>
      <p class="section-sub">antes de que se arme la fiesta</p>
      <div class="quote-card">
        <div class="quote-mark">${jackOLanternIcon(34)}</div>
        <p class="mensaje-box">${esc(d.mensaje)}</p>
      </div>
    </div>
  </section>` : ""}

  <!-- ===== DISFRAZ (con su "onda" divertida) ===== -->
  ${d.disfraz ? `
  <div class="disfraz-section">
    ${waveBand(accent2, `linear-gradient(135deg, ${accent2}, ${accent})`)}
    <div class="disfraz-inner">
      <h2 class="fun section-title disfraz-title">¿Y vos... de qué vas?</h2>
      <p class="section-sub disfraz-sub">la consigna de disfraz para esta fiesta</p>
      <span class="disfraz-pill"><span class="ico">${maskIcon(24)}</span>${esc(d.disfraz)}</span>
    </div>
  </div>` : ""}

  <!-- ===== GALERÍA ===== -->
  ${(d.galeria && d.galeria.length) ? `
  <section>
    <div class="section-inner">
      ${candyDivider()}
      <h2 class="fun section-title">Buena onda</h2>
      <p class="section-sub">un poco de ambiente antes del gran día</p>
      ${gal.html}
    </div>
  </section>` : ""}

  <!-- ===== RSVP ===== -->
  <section>
    <div class="section-inner">
      ${candyDivider()}
      <h2 class="fun section-title">¿Venís a la fiesta?</h2>
      <p class="section-sub">confirmá tu asistencia y preparate la bolsita</p>
      <div class="card-panel" style="max-width:560px;margin:0 auto;">
        <div style="display:flex;justify-content:center;margin-bottom:14px;color:${accent2}">${ticketIcon(22)}</div>
        ${rsvpDeadline ? `<p class="rsvp-deadline">Confirmá antes del ${esc(rsvpDeadline)}</p>` : ""}
        ${rsvp.html}
      </div>
    </div>
  </section>

  <footer>
    <span class="foot-name fun">${esc(d.nombre)}</span>
    Gracias por venir a festejar · ¡nos vemos con disfraz puesto! 🎃
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg, #fff6e9 0%, #fdecd2 60%, #fbe2b8 100%);">
    <span style="position:absolute;top:10px;left:12px;font-size:1rem;opacity:.5;">🍬</span>
    <span style="position:absolute;bottom:10px;right:12px;font-size:1rem;opacity:.5;">👻</span>
    <svg width="46" height="46" viewBox="0 0 64 64">
      <ellipse cx="32" cy="36" rx="26" ry="22" fill="${d.accent}"/>
      <ellipse cx="32" cy="36" rx="26" ry="22" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="2"/>
      <path d="M20 32c2-4 8-4 10 0" stroke="#3a2618" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M34 32c2-4 8-4 10 0" stroke="#3a2618" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M18 44c4 6 24 6 28 0-2 5-6 8-14 8s-12-3-14-8Z" fill="#3a2618"/>
    </svg>
    <div style="font-family:Verdana,sans-serif;font-weight:800;font-size:1.15rem;color:${d.accent2};letter-spacing:.5px;">DULCE O TRUCO</div>
    <div style="font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:${d.accent};font-weight:700;">Fiesta pop de Halloween</div>
  </div>`;
}

module.exports = {
  id, category: "halloween", name: "Dulce o Truco",
  summary: "Halloween festivo y familiar: calabazas sonrientes, caramelos ilustrados y toda la diversión del trick-or-treat, sin nada tenebroso.",
  accent: "#ff8c1a", accent2: "#7b4fb0", schema: halloweenSchema, sampleData, render, cardPreview,
};
