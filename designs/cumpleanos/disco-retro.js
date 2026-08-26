const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-disco-retro";

const sampleData = {
  nombre: "Charly",
  edad: "50",
  fecha: "2027-03-13",
  hora: "22:00",
  lugar: "Salón Studio 74, Palermo",
  direccionMapa: "https://maps.google.com/?q=Studio+74+Palermo+Buenos+Aires",
  mensaje: "¡Se cumplen 50 y los festejamos como se debe! Sacá los pantalones acampanados, calentá la voz para el funk y vení a prender la pista conmigo. No falta nadie a este bailongo 🕺💫",
  dressCode: "Brillos, purpurina y mucho color — nada de negro aburrido",
  whatsapp: "5491100000032",
  fechaLimiteRSVP: "2027-03-06",
  coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=800&q=80",
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  ],
};

// ---------- Iconografía / decoración inline (sin imágenes externas) ----------

// Bola de espejos: un círculo con una grilla de "facetas" (líneas radiales +
// concéntricas via CSS repeating-*) más un brillo giratorio conic-gradient,
// todo animado con @keyframes. Se arma en HTML/CSS puro dentro del hero.
function discoBallHTML(accent, accent2) {
  return `<div class="disco-ball-wrap" aria-hidden="true">
    <div class="disco-hang"></div>
    <div class="disco-ball">
      <div class="disco-ball-shine"></div>
      <div class="disco-ball-facets"></div>
      <div class="disco-ball-highlight"></div>
    </div>
    <div class="disco-beam b1" style="background:linear-gradient(180deg, color-mix(in srgb, ${accent} 55%, transparent), transparent)"></div>
    <div class="disco-beam b2" style="background:linear-gradient(180deg, color-mix(in srgb, ${accent2} 50%, transparent), transparent)"></div>
    <div class="disco-beam b3" style="background:linear-gradient(180deg, color-mix(in srgb, #ffd76b 45%, transparent), transparent)"></div>
  </div>`;
}

function starSparkle(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 1c0 7.2 2.8 10 10 10-7.2 0-10 2.8-10 10 0-7.2-2.8-10-10-10 7.2 0 10-2.8 10-10Z" fill="currentColor"/></svg>`;
}

function vinylIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9.4" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="12" cy="12" r="5.6" stroke="currentColor" stroke-width="1" opacity=".6"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>`;
}

function noteIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 17.5V5.6l10-2v11.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="6.6" cy="17.8" r="2.6" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="16.6" cy="15" r="2.6" stroke="currentColor" stroke-width="1.4"/>
  </svg>`;
}

function pinIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21s7-7.2 7-12.4A7 7 0 0 0 5 8.6C5 13.8 12 21 12 21Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="12" cy="8.4" r="2.6" stroke="currentColor" stroke-width="1.4"/>
  </svg>`;
}

function hangerIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="4.6" r="1.3" stroke="currentColor" stroke-width="1.3"/>
    <path d="M12 5.9v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M12 7.9 3.3 14.6c-1.2.9-.5 2.8 1 2.8h15.4c1.5 0 2.2-1.9 1-2.8L12 7.9Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M6.4 17.9h11.2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`;
}

function ticketIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 9.6a2 2 0 0 0 0-4h18a2 2 0 0 0 0 4 2 2 0 0 1 0 4.8 2 2 0 0 0 0 4.8H3a2 2 0 0 0 0-4.8 2 2 0 0 1 0-4.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M14.2 5.4v13.2" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2.2 2.4"/>
  </svg>`;
}

function sectionDivider() {
  return `<div class="divider" aria-hidden="true"><span></span>${starSparkle(14)}<span></span></div>`;
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
  const accent = getPaletteColor(d.colorPalette, "dark", "#E94BB0");
  const accent2 = "#6C2BD9";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "22:00"}:00` : sampleData.fecha, "cd-disco");
  const gal = galleryWidget(d.galeria || [], "gal-disco");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const fp = fechaPartes(d.fecha);
  const nombreUpper = String(d.nombre || "").toUpperCase();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)} · Disco Retro</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#120817; --bg2:#1c0d26;
    --accent:${accent}; --accent2:${accent2}; --gold:#ffd76b;
    --ink:#fbf3ff; --ink-dim:#c7aede;
    --line:color-mix(in srgb, var(--accent) 40%, transparent);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;font-family:'Poppins',Arial,sans-serif;background-color:var(--bg);color:var(--ink);
    background-image:
      radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0),
      radial-gradient(ellipse at 18% 8%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 55%),
      radial-gradient(ellipse at 85% 20%, color-mix(in srgb, var(--accent2) 30%, transparent), transparent 55%),
      radial-gradient(ellipse at 50% 100%, rgba(0,0,0,.6), transparent 60%),
      linear-gradient(160deg, #1c0d26 0%, #150a1c 45%, #0c0610 100%);
    background-size:3px 3px, auto, auto, auto, auto;
    background-attachment: fixed, fixed, fixed, fixed, fixed;
  }
  a{color:var(--gold);}
  .groovy{font-family:'Righteous',Impact,'Arial Black',sans-serif;}

  .glow-accent{color:#fff;text-shadow:0 0 4px #fff,0 0 18px var(--accent),0 0 38px color-mix(in srgb, var(--accent) 55%, transparent);}
  .glow-gold{color:var(--gold);text-shadow:0 0 4px var(--gold),0 0 16px rgba(255,215,107,.55);}

  /* ===== BOLA DE ESPEJOS (100% CSS) ===== */
  .disco-ball-wrap{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;margin:0 0 6px;}
  .disco-hang{width:2px;height:26px;background:linear-gradient(180deg, transparent, rgba(255,255,255,.5));}
  .disco-ball{
    position:relative;width:clamp(96px,22vw,150px);height:clamp(96px,22vw,150px);border-radius:50%;
    background:
      repeating-conic-gradient(from 0deg, rgba(255,255,255,.55) 0deg 3deg, rgba(160,160,190,.35) 3deg 6deg),
      radial-gradient(circle at 35% 30%, #f4f4fb, #b9b9cf 45%, #7d7d96 75%, #4c4c60 100%);
    background-blend-mode:overlay, normal;
    box-shadow:
      0 0 40px 6px color-mix(in srgb, var(--accent) 55%, transparent),
      0 0 80px 18px color-mix(in srgb, var(--accent2) 35%, transparent),
      inset -10px -10px 24px rgba(0,0,0,.5),
      inset 8px 8px 18px rgba(255,255,255,.35);
    background-size: 100% 100%, 100% 100%;
    animation: disco-spin 9s linear infinite, disco-bob 3.4s ease-in-out infinite;
  }
  .disco-ball::before{
    content:"";position:absolute;inset:0;border-radius:50%;
    background:
      repeating-linear-gradient(0deg, rgba(20,10,30,.55) 0 1.5px, transparent 1.5px 11px),
      repeating-linear-gradient(90deg, rgba(20,10,30,.5) 0 1.5px, transparent 1.5px 11px);
    mix-blend-mode:multiply;
  }
  .disco-ball-shine{
    position:absolute;top:10%;left:14%;width:34%;height:22%;border-radius:50%;
    background:radial-gradient(closest-side, rgba(255,255,255,.85), transparent);
    filter:blur(1px);
  }
  .disco-ball-highlight{
    position:absolute;inset:0;border-radius:50%;
    background:conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,.5) 8deg, transparent 20deg, transparent 160deg, rgba(255,255,255,.35) 168deg, transparent 180deg, transparent 340deg, rgba(255,255,255,.45) 350deg, transparent 360deg);
    animation: disco-spin 9s linear infinite;
    mix-blend-mode:screen;
  }
  @keyframes disco-spin{ from{ background-position:0 0,0 0; } to{ background-position:150px 0,0 0; } }
  @keyframes disco-bob{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-6px); } }
  .disco-beam{position:absolute;top:24px;width:2px;height:0;opacity:.9;filter:blur(1px);animation:beam-sweep 4.6s ease-in-out infinite;transform-origin:top center;}
  .disco-beam.b1{left:calc(50% - 60px);animation-delay:0s;}
  .disco-beam.b2{left:calc(50% + 4px);animation-delay:.9s;}
  .disco-beam.b3{left:calc(50% + 50px);animation-delay:1.8s;}
  @keyframes beam-sweep{ 0%,100%{ height:0; opacity:0; } 45%{ height:220px; opacity:.75; transform:rotate(-6deg); } 55%{ height:220px; opacity:.75; transform:rotate(6deg); } }

  /* ===== HERO ===== */
  .hero{position:relative;min-height:clamp(560px,100vh,880px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;overflow:hidden;padding:44px 20px 40px;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.22;filter:saturate(1.25) contrast(1.05);}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(18,8,23,.55) 0%, rgba(18,8,23,.72) 45%, var(--bg) 100%);}
  .hero-sparkle{position:absolute;pointer-events:none;}
  .hero-content{position:relative;z-index:2;max-width:540px;width:100%;}
  .hero-kicker{font-size:.72rem;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:var(--gold);margin:6px 0 0;}
  .hero-name{font-size:clamp(3rem,14vw,5.2rem);line-height:1.02;margin:8px 0 4px;word-break:break-word;}
  .hero-age{display:inline-block;margin:2px 0 18px;font-size:clamp(1.1rem,4.4vw,1.5rem);font-weight:700;letter-spacing:2px;color:#fff;text-shadow:0 0 10px var(--accent2);}
  .hero-msg{font-weight:500;font-size:clamp(.92rem,3vw,1.08rem);line-height:1.7;color:#f1e6ff;max-width:460px;margin:0 auto 26px;}
  .date-row{display:flex;align-items:center;justify-content:center;gap:clamp(10px,3vw,22px);font-weight:800;text-transform:uppercase;letter-spacing:2px;font-size:clamp(.85rem,3vw,1.05rem);flex-wrap:wrap;}
  .date-row .big{font-size:clamp(1.8rem,7vw,2.6rem);}
  .date-row .div{opacity:.6;font-weight:300;}
  .hero-time{margin-top:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:clamp(.82rem,2.8vw,1rem);color:var(--ink-dim);}
  .hero-place{margin-top:8px;font-weight:600;letter-spacing:.5px;font-size:clamp(.82rem,2.8vw,.96rem);color:var(--ink-dim);max-width:420px;}

  /* ===== SECTIONS ===== */
  section{padding:clamp(34px,7vw,68px) 20px;position:relative;}
  .section-inner{max-width:1000px;margin:0 auto;}
  .section-title{text-align:center;font-size:clamp(1.4rem,5vw,2rem);margin:0 0 8px;}
  .section-sub{text-align:center;color:var(--ink-dim);font-size:.85rem;letter-spacing:1px;text-transform:uppercase;margin:0 0 30px;}
  .divider{display:flex;align-items:center;justify-content:center;gap:14px;max-width:220px;margin:0 auto 30px;color:var(--gold);}
  .divider span{flex:1;height:1px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.6;}

  /* ===== COUNTDOWN ===== */
  .glass-panel{position:relative;background:linear-gradient(165deg, rgba(255,255,255,.06), rgba(0,0,0,.28));border:1px solid var(--line);border-radius:20px;padding:26px 26px 22px;box-shadow:0 22px 46px -22px rgba(0,0,0,.7), 0 0 26px -8px color-mix(in srgb, var(--accent) 32%, transparent);}
  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown>div{flex:1;min-width:64px;text-align:center;background:color-mix(in srgb, var(--accent) 8%, transparent);border:1px solid color-mix(in srgb, var(--accent2) 45%, transparent);border-radius:14px;padding:clamp(12px,2vw,18px) 4px;}
  .cd-num{display:block;font-size:clamp(1.6rem,5vw,2.4rem);font-weight:800;color:#fff;text-shadow:0 0 8px var(--accent),0 0 18px var(--accent);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:2px;color:var(--ink-dim);}

  /* ===== DATOS ===== */
  .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:26px 20px;max-width:820px;margin:0 auto;}
  .info-card{position:relative;background:linear-gradient(165deg, rgba(255,255,255,.045), rgba(0,0,0,.28));border:1px solid var(--line);border-radius:18px;padding:26px 22px;box-shadow:0 18px 38px -20px rgba(0,0,0,.7);text-align:center;}
  .info-card .ico{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:color-mix(in srgb, var(--accent) 18%, transparent);border:1px solid var(--line);color:var(--gold);margin-bottom:12px;}
  .info-card h3{margin:0 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold);}
  .info-card p{margin:0;line-height:1.6;color:var(--ink-dim);font-size:.96rem;}
  .info-card p strong{color:#fff;}
  .info-card a.mapa{display:inline-block;margin-top:12px;font-weight:700;color:var(--gold);text-decoration:none;border-bottom:1px dashed var(--gold);}

  /* ===== MENSAJE ===== */
  .quote-card{position:relative;max-width:640px;margin:0 auto;background:linear-gradient(165deg, rgba(255,255,255,.045), rgba(0,0,0,.28));border:1px solid var(--line);border-radius:18px;padding:clamp(30px,5vw,44px) clamp(22px,4vw,40px) 28px;box-shadow:0 20px 42px -20px rgba(0,0,0,.7);text-align:center;}
  .quote-mark{position:absolute;top:0;left:50%;transform:translate(-50%,-52%);background:var(--bg2);padding:0 10px;color:var(--accent);}
  .mensaje-box{margin:0;font-style:italic;font-size:clamp(1rem,2.5vw,1.15rem);line-height:1.75;color:#f1e6ff;}

  /* ===== DRESS CODE ===== */
  .pill{display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:999px;background:color-mix(in srgb, var(--accent) 12%, transparent);border:1px solid var(--accent);color:#fff;font-weight:700;box-shadow:0 0 20px color-mix(in srgb, var(--accent) 32%, transparent);}
  .swatches-row{display:flex;justify-content:center;gap:10px;margin:0 0 20px;}
  .swatches-row span{width:22px;height:22px;border-radius:50%;display:inline-block;border:1px solid rgba(255,255,255,.25);}

  /* ===== PASE VIP / BACKSTAGE ===== */
  .vip-pass{position:relative;max-width:420px;margin:0 auto;background:linear-gradient(165deg, #2a1436, #170a1f);border:1px solid var(--line);border-radius:20px;padding:0 0 24px;box-shadow:0 24px 50px -22px rgba(0,0,0,.75), 0 0 30px -6px color-mix(in srgb, var(--accent) 40%, transparent);overflow:hidden;}
  .vip-pass-top{padding:24px 24px 18px;text-align:center;position:relative;}
  .vip-pass-top::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2));}
  .vip-eyebrow{font-size:.62rem;letter-spacing:3px;text-transform:uppercase;color:var(--ink-dim);margin:0 0 10px;}
  .vip-name{font-size:clamp(1.6rem,6vw,2.2rem);margin:0 0 6px;color:#fff;text-shadow:0 0 10px var(--accent);}
  .vip-sub{font-size:.78rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin:0;}
  .vip-perf{position:relative;height:0;margin:16px 0;border-top:1.5px dashed rgba(255,255,255,.22);}
  .vip-perf::before,.vip-perf::after{content:"";position:absolute;top:-9px;width:18px;height:18px;border-radius:50%;background:var(--bg);}
  .vip-perf::before{left:-9px;}
  .vip-perf::after{right:-9px;}
  .vip-punch-row{display:flex;justify-content:space-between;padding:0 10px;margin:-4px 0 -2px;}
  .vip-punch-row span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);}
  .vip-pass-bottom{padding:6px 24px 0;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;color:var(--ink-dim);}
  .vip-pass-bottom .row{display:flex;flex-direction:column;align-items:center;gap:2px;}
  .vip-pass-bottom .label{font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:var(--ink-dim);}
  .vip-pass-bottom .val{font-size:.85rem;font-weight:700;color:#fff;}
  .vip-icon-row{display:flex;justify-content:center;margin-top:16px;color:var(--gold);opacity:.85;}

  /* ===== GALLERY ===== */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;}
  .gallery-item{position:relative;background:var(--bg2);border-radius:14px;padding:8px 8px 20px;border:1px solid rgba(255,255,255,.12);box-shadow:0 16px 32px -16px rgba(0,0,0,.65), 0 0 16px -6px color-mix(in srgb, var(--accent2) 30%, transparent);transition:transform .3s;}
  .gallery-item:nth-child(4n+1){transform:rotate(-2deg);}
  .gallery-item:nth-child(4n+2){transform:rotate(1.5deg);}
  .gallery-item:nth-child(4n+3){transform:rotate(-1deg);}
  .gallery-item:nth-child(4n+4){transform:rotate(2deg);}
  .gallery-item:hover{transform:rotate(0deg) scale(1.05);z-index:2;}
  .gallery-item img{width:100%;height:170px;object-fit:cover;display:block;cursor:pointer;border-radius:9px;}
  .gallery-item::after{content:"";position:absolute;left:50%;bottom:9px;transform:translateX(-50%);width:28px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:.85;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,2,9,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:10px;box-shadow:0 0 40px color-mix(in srgb, var(--accent) 50%, transparent);}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;text-shadow:0 0 10px var(--accent);}

  /* ===== RSVP ===== */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin:0;max-width:520px;margin:0 auto;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--gold);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px;border-radius:10px;border:1px solid color-mix(in srgb, var(--accent2) 45%, transparent);margin-top:6px;width:100%;background:rgba(255,255,255,.06);color:#fff;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#a98fc4;}
  .rsvp-form button{background:linear-gradient(90deg,var(--accent),var(--accent2));color:#fff;border:0;padding:14px;border-radius:999px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 0 22px color-mix(in srgb, var(--accent) 45%, transparent);}
  .rsvp-whatsapp{color:var(--gold);font-size:.85rem;text-align:center;}
  .rsvp-status{font-weight:bold;color:#7CFFB2;text-align:center;}
  .rsvp-deadline{text-align:center;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin:0 0 18px;}

  footer{position:relative;text-align:center;padding:44px 20px 50px;font-size:.85rem;color:var(--ink-dim);letter-spacing:.5px;border-top:1px dashed rgba(255,255,255,.14);}
  footer .foot-name{display:block;font-family:'Righteous',Impact,'Arial Black',sans-serif;font-size:1.6rem;margin-bottom:8px;color:#fff;text-shadow:0 0 10px var(--accent);}
</style></head>
<body>

  <!-- ===== HERO ===== -->
  <div class="hero">
    <div class="hero-bg" style="background-image:url('${esc(d.coverImage)}')"></div>
    <div class="hero-overlay"></div>
    <div class="hero-sparkle" style="top:8%;left:8%;color:${accent}">${starSparkle(30)}</div>
    <div class="hero-sparkle" style="top:14%;right:9%;color:${accent2}">${starSparkle(24)}</div>
    <div class="hero-sparkle" style="top:60%;left:6%;color:#ffd76b">${starSparkle(22)}</div>
    <div class="hero-sparkle" style="top:66%;right:7%;color:${accent}">${starSparkle(28)}</div>
    <div class="hero-content">
      ${discoBallHTML(accent, accent2)}
      <p class="hero-kicker">SE ARMA EL FESTEJO</p>
      <h1 class="groovy hero-name glow-accent">${esc(d.nombre)}</h1>
      ${d.edad ? `<span class="groovy hero-age">cumple ${esc(d.edad)}</span>` : ""}
      ${d.mensaje ? `<p class="hero-msg">${esc(d.mensaje)}</p>` : ""}
      <div class="date-row">
        <span>${esc(fp.weekday)}</span><span class="div">·</span><span class="big glow-gold">${esc(fp.day)}</span><span class="div">·</span><span>${esc(fp.month)}</span>
      </div>
      ${d.hora ? `<p class="hero-time">${esc(d.hora)} hs</p>` : ""}
      ${d.lugar ? `<p class="hero-place">${esc(d.lugar)}</p>` : ""}
    </div>
  </div>

  <!-- ===== COUNTDOWN ===== -->
  <section>
    <div class="section-inner">
      <h2 class="groovy section-title glow-accent">Faltan...</h2>
      <p class="section-sub">para prender la bola de espejos</p>
      <div class="glass-panel">
        ${cd.html}
      </div>
    </div>
  </section>

  <!-- ===== DATOS ===== -->
  ${(d.fecha || d.hora || d.lugar || d.dressCode) ? `
  <section>
    <div class="section-inner">
      ${sectionDivider()}
      <h2 class="groovy section-title glow-accent">La previa</h2>
      <p class="section-sub">todo lo que tenés que saber</p>
      <div class="grid-2">
        ${(d.fecha || d.hora) ? `
        <div class="info-card">
          <span class="ico">${vinylIcon(20)}</span>
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
        ${d.dressCode ? `
        <div class="info-card">
          <span class="ico">${hangerIcon(20)}</span>
          <h3>Dress code</h3>
          <div class="swatches-row" style="margin-bottom:12px;">
            <span style="background:${accent}"></span>
            <span style="background:${accent2}"></span>
            <span style="background:#ffd76b"></span>
            <span style="background:#fbf3ff"></span>
          </div>
          <p>${esc(d.dressCode)}</p>
        </div>` : ""}
      </div>
    </div>
  </section>` : ""}

  <!-- ===== MENSAJE ===== -->
  ${d.mensaje ? `
  <section>
    <div class="section-inner">
      ${sectionDivider()}
      <h2 class="groovy section-title glow-accent">Un mensajito</h2>
      <p class="section-sub">antes de que se arme la fiesta</p>
      <div class="quote-card">
        <div class="quote-mark">${starSparkle(20)}</div>
        <p class="mensaje-box">${esc(d.mensaje)}</p>
      </div>
    </div>
  </section>` : ""}

  <!-- ===== PASE VIP / BACKSTAGE ===== -->
  <section>
    <div class="section-inner">
      ${sectionDivider()}
      <h2 class="groovy section-title glow-accent">Tu pase</h2>
      <p class="section-sub">acceso backstage a la pista</p>
      <div class="vip-pass">
        <div class="vip-pass-top">
          <p class="vip-eyebrow">Backstage · Acceso VIP</p>
          <h3 class="groovy vip-name">${esc(nombreUpper)}</h3>
          <p class="vip-sub">${d.edad ? `${esc(d.edad)} años · ` : ""}Noche disco</p>
        </div>
        <div class="vip-perf"></div>
        <div class="vip-punch-row">
          ${Array.from({ length: 14 }).map(() => "<span></span>").join("")}
        </div>
        <div class="vip-pass-bottom" style="margin-top:14px;">
          <div class="row"><span class="label">Fecha</span><span class="val">${esc(fp.day)}/${esc(fp.month ? fp.month.slice(0, 3) : "")}</span></div>
          <div class="row"><span class="label">Hora</span><span class="val">${d.hora ? esc(d.hora) : "--:--"}</span></div>
          <div class="row"><span class="label">Puerta</span><span class="val">01</span></div>
        </div>
        <div class="vip-icon-row">${noteIcon(22)}</div>
      </div>
    </div>
  </section>

  <!-- ===== GALERÍA ===== -->
  ${(d.galeria && d.galeria.length) ? `
  <section>
    <div class="section-inner">
      ${sectionDivider()}
      <h2 class="groovy section-title glow-accent">Buena onda</h2>
      <p class="section-sub">un poco de ambiente antes del gran día</p>
      ${gal.html}
    </div>
  </section>` : ""}

  <!-- ===== RSVP ===== -->
  <section>
    <div class="section-inner">
      ${sectionDivider()}
      <h2 class="groovy section-title glow-accent">¿Venís a bailar?</h2>
      <p class="section-sub">confirmá tu lugar en la pista</p>
      <div class="glass-panel" style="max-width:560px;margin:0 auto;">
        <div style="display:flex;justify-content:center;margin-bottom:14px;color:${accent2}">${ticketIcon(22)}</div>
        ${rsvpDeadline ? `<p class="rsvp-deadline">Confirmá antes del ${esc(rsvpDeadline)}</p>` : ""}
        ${rsvp.html}
      </div>
    </div>
  </section>

  <footer>
    <span class="foot-name groovy">${esc(d.nombre)}</span>
    Gracias por venir a bailar · ¡nos vemos en la pista! 🪩
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
    background:linear-gradient(160deg, ${d.accent2} 0%, #1a0d24 55%, #0c0610 100%);">
    <svg width="58" height="58" viewBox="0 0 58 58" style="filter:drop-shadow(0 0 6px ${d.accent});">
      <circle cx="29" cy="29" r="24" fill="#c9c9dd"/>
      <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(20,10,30,.55)" stroke-width="1"/>
      <g stroke="rgba(20,10,30,.55)" stroke-width="1">
        <line x1="5" y1="29" x2="53" y2="29"/>
        <line x1="9" y1="17" x2="49" y2="17"/>
        <line x1="9" y1="41" x2="49" y2="41"/>
        <line x1="29" y1="5" x2="29" y2="53"/>
        <line x1="17" y1="9" x2="17" y2="49"/>
        <line x1="41" y1="9" x2="41" y2="49"/>
      </g>
      <circle cx="21" cy="19" r="7" fill="#fff" opacity=".55"/>
      <path d="M46 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="${d.accent}"/>
    </svg>
    <div style="font-family:Impact,'Arial Black',sans-serif;font-size:1.4rem;letter-spacing:1px;color:${d.accent};text-shadow:0 0 6px ${d.accent},0 0 16px ${d.accent2};line-height:1;">DISCO RETRO</div>
    <div style="font-family:Impact,'Arial Black',sans-serif;font-size:.65rem;letter-spacing:3px;color:#ffd76b;">A BAILAR</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Disco Retro",
  summary: "Cumpleaños con onda fiestera años 70/80: bola de espejos animada, pase VIP backstage y toda la energía de una noche de club.",
  accent: "#E94BB0", accent2: "#6C2BD9", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
