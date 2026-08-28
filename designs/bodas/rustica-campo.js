const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-rustica-campo";

const sampleData = {
  novia: "Florencia", novio: "Tomás",
  fecha: "2027-11-13", horaCeremonia: "18:00", lugarCeremonia: "Capilla San Isidro Labrador, Cañuelas",
  horaFiesta: "20:30", lugarFiesta: "Estancia La Candelaria, Cañuelas",
  direccionMapa: "https://maps.google.com/?q=Estancia+La+Candelaria+Cañuelas",
  mensaje: "Nos gusta pensar el amor como algo que se cultiva de a poco, como la tierra. Después de un tiempo sembrando esta historia juntos, queremos celebrar la cosecha rodeados de las personas que más queremos. Vengan con ganas de bailar bajo las estrellas.",
  dressCode: "Elegante campestre — evitar tacos finos, el piso es de pasto",
  alias: "flor.tomas.boda",
  whatsapp: "5491100000041",
  fechaLimiteRSVP: "2027-10-16",
  coverImage: "https://images.unsplash.com/photo-1646366045654-ed6b2b355dc9?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos dibujados a mano en SVG: flores silvestres de trazo
// orgánico e irregular (no geométrico), textura de papel kraft y un
// cordel/arpillera como separador entre secciones. Todo inline, sin
// dependencias externas. ---

// Ramita de flores silvestres: tallo curvo asimétrico, un par de hojas y
// una florcita tipo margarita de pétalos desparejos + un capullo chico,
// como dibujado a mano con pluma.
function wildflowerSprigSVG(w = 140, rotate = 0, accent = "#b5651d", accent2 = "#7c8f6e") {
  return `<svg class="sprig" width="${w}" height="${Math.round(w * 0.56)}" viewBox="0 0 160 90" style="transform:rotate(${rotate}deg)" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 82 C 36 72, 66 62, 90 34 C 104 20, 120 12, 152 7" fill="none" stroke="${accent2}" stroke-width="2.1" stroke-linecap="round" opacity=".85"/>
    <path d="M40 76 C 29 69, 24 58, 32 49 C 43 55, 47 67, 40 76 Z" fill="${accent2}" opacity=".78"/>
    <path d="M66 58 C 57 49, 55 38, 65 29 C 75 37, 76 50, 66 58 Z" fill="${accent2}" opacity=".7"/>
    <g transform="translate(110,22)">
      <path d="M0 -12 C 4 -8 4 -2 0 0 C -4 -2 -4 -8 0 -12Z" fill="#f4ead4"/>
      <path d="M12 -1 C 7 3 2 3 0 0 C 2 -4 7 -4 12 -1Z" fill="#f4ead4"/>
      <path d="M1 12 C -3 7 -3 2 0 0 C 4 2 4 7 1 12Z" fill="#f4ead4"/>
      <path d="M-11 2 C -6 -3 -1 -3 0 0 C -3 3 -7 4 -11 2Z" fill="#f4ead4"/>
      <path d="M8 -8 C 5 -4 2 -2 0 0 C 2 -3 4 -6 8 -8Z" fill="#f4ead4" opacity=".9"/>
      <path d="M-7 8 C -4 4 -2 2 0 0 C -2 3 -3 6 -7 8Z" fill="#f4ead4" opacity=".9"/>
      <circle cx="0" cy="0" r="3.6" fill="${accent}"/>
    </g>
    <g transform="translate(140,9) scale(.62)">
      <circle cx="0" cy="-8" r="4.6" fill="${accent}" opacity=".92"/>
      <circle cx="6" cy="-2" r="4.6" fill="${accent}" opacity=".82"/>
      <circle cx="-6" cy="-2" r="4.6" fill="${accent}" opacity=".82"/>
      <circle cx="0" cy="4" r="4.6" fill="${accent}" opacity=".88"/>
      <circle cx="0" cy="-2" r="3" fill="#6e4415"/>
    </g>
  </svg>`;
}

// Ramo de esquina, más grande y con dos ramitas cruzadas, para las
// esquinas del hero (como flores silvestres atadas apoyadas en el marco).
function cornerBouquetSVG(w = 128, mirror = false, accent = "#b5651d", accent2 = "#7c8f6e") {
  const flip = mirror ? "scaleX(-1)" : "none";
  return `<div style="transform:${flip};line-height:0;">
    <svg width="${w}" height="${Math.round(w * 0.85)}" viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 112 C 34 96, 44 70, 40 40 C 38 24, 44 12, 58 4" fill="none" stroke="${accent2}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>
      <path d="M8 112 C 40 108, 60 88, 66 58 C 70 40, 82 26, 100 18" fill="none" stroke="${accent2}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <path d="M30 78 C 20 72, 15 62, 22 52 C 32 57, 37 68, 30 78 Z" fill="${accent2}" opacity=".78"/>
      <path d="M52 46 C 43 39, 41 29, 49 20 C 58 27, 60 39, 52 46 Z" fill="${accent2}" opacity=".7"/>
      <g transform="translate(58,10)">
        <path d="M0 -13 C 4 -9 4 -2 0 0 C -4 -2 -4 -9 0 -13Z" fill="#f4ead4"/>
        <path d="M13 -1 C 8 3 2 3 0 0 C 2 -4 8 -4 13 -1Z" fill="#f4ead4"/>
        <path d="M1 13 C -3 8 -3 2 0 0 C 4 2 4 8 1 13Z" fill="#f4ead4"/>
        <path d="M-12 2 C -7 -3 -1 -3 0 0 C -3 3 -8 4 -12 2Z" fill="#f4ead4"/>
        <circle cx="0" cy="0" r="4" fill="${accent}"/>
      </g>
      <g transform="translate(96,16) scale(.7)">
        <circle cx="0" cy="-8" r="4.8" fill="${accent}" opacity=".92"/>
        <circle cx="6" cy="-2" r="4.8" fill="${accent}" opacity=".82"/>
        <circle cx="-6" cy="-2" r="4.8" fill="${accent}" opacity=".82"/>
        <circle cx="0" cy="4" r="4.8" fill="${accent}" opacity=".88"/>
        <circle cx="0" cy="-2" r="3.1" fill="#6e4415"/>
      </g>
      <g transform="translate(20,60) scale(.55)">
        <circle cx="0" cy="-8" r="4.8" fill="${accent2}" opacity=".85"/>
        <circle cx="6" cy="-2" r="4.8" fill="${accent2}" opacity=".78"/>
        <circle cx="-6" cy="-2" r="4.8" fill="${accent2}" opacity=".78"/>
        <circle cx="0" cy="4" r="4.8" fill="${accent2}" opacity=".82"/>
        <circle cx="0" cy="-2" r="3" fill="#4a5a3e"/>
      </g>
    </svg>
  </div>`;
}

// Separador de sección tipo cordel de arpillera: una línea sinuosa doble
// (como una soga) con un lacito de piolín anudado en el centro.
function twineDividerSVG(width = 200, color = "#a9835a") {
  return `<svg class="twine-divider" width="${width}" height="26" viewBox="0 0 200 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14 C 38 4, 68 24, 94 13" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <path d="M106 13 C 132 2, 162 22, 196 12" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <g transform="translate(100,13)">
      <path d="M-11 -7 C -16 -11 -15 3 -10 7 C -5 3 -6 -9 0 0 C 6 -9 5 3 10 7 C 15 3 16 -11 11 -7 C 6 -3 -6 -3 -11 -7Z" fill="none" stroke="${color}" stroke-width="1.7"/>
      <circle cx="0" cy="0" r="2.3" fill="${color}"/>
    </g>
  </svg>`;
}

// Abejita chica dibujada a mano (trazo simple, no geométrico) que
// sobrevuela el hero: cuerpo ovalado con rayas curvas y un par de alas
// asimétricas, coherente con el resto de los ornamentos "a pluma".
function beeSVG(size = 30, ink = "#3a2a12") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 16 C 6 8, 4 4, 9 2 C 13 3, 15 9, 16 15Z" fill="rgba(255,255,255,.8)" stroke="#7c8f6e" stroke-width=".7"/>
    <path d="M27 16 C 34 8, 36 4, 31 2 C 27 3, 25 9, 24 15Z" fill="rgba(255,255,255,.8)" stroke="#7c8f6e" stroke-width=".7"/>
    <ellipse cx="20" cy="22" rx="10" ry="7.2" fill="#e8b23d" stroke="${ink}" stroke-width="1.1"/>
    <path d="M11.5 21 Q20 16.5 28.5 21" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    <path d="M11.5 25 Q20 20.5 28.5 25" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="20" cy="12" r="5" fill="${ink}"/>
    <path d="M17 8 L15 5M23 8 L25 5" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`;
}

// Icono chico de capullo silvestre, para encabezar bloques de info
// (ceremonia, fiesta, etc). Trazo asimétrico, no un círculo perfecto.
function budIconSVG(size = 20, accent = "#b5651d") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4 C 9 5, 6 12, 8 19 C 9.5 24, 13 27.5, 16 29 C 19 27.5, 22.5 24, 24 19 C 26 12, 23 4.5, 16 4Z" fill="${accent}" opacity=".85"/>
    <path d="M16 11 C 14.5 16, 15 22, 16 27" fill="none" stroke="#5e3a10" stroke-width="1.2" opacity=".55"/>
  </svg>`;
}

// Textura de papel kraft muy sutil: fibras y motitas irregulares
// repetidas como fondo, para dar sensación de papel reciclado hecho a mano.
function kraftTextureSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <rect width="180" height="180" fill="#d9c19c"/>
    <g stroke="#8a6a41" stroke-width=".6" opacity=".07">
      <path d="M0 20 C 40 10, 60 34, 100 18 C 140 4, 160 26, 180 14"/>
      <path d="M0 70 C 30 82, 70 58, 110 74 C 145 88, 160 64, 180 76"/>
      <path d="M0 128 C 36 118, 64 142, 104 126 C 138 112, 158 134, 180 122"/>
      <path d="M0 168 C 34 158, 70 178, 112 162 C 146 150, 162 172, 180 160"/>
    </g>
    <g fill="#7c5a34" opacity=".06">
      <circle cx="24" cy="46" r="1.4"/><circle cx="86" cy="12" r="1.1"/>
      <circle cx="150" cy="52" r="1.3"/><circle cx="42" cy="100" r="1.2"/>
      <circle cx="112" cy="96" r="1.4"/><circle cx="164" cy="112" r="1.1"/>
      <circle cx="18" cy="150" r="1.3"/><circle cx="96" cy="154" r="1.2"/>
      <circle cx="140" cy="166" r="1.1"/>
    </g>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#b5651d");
  const accent2 = "#7c8f6e";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "18:00"}:00` : sampleData.fecha, "cdrustica");
  const gal = galleryWidget(d.galeria, "galrustica");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "bodas", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const kraftURI = `data:image/svg+xml,${encodeURIComponent(kraftTextureSVG())}`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&amp;family=Bitter:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --accent:${accent}; --accent2:${accent2};
    --kraft:#cfb488; --kraft-dark:#9c7847; --kraft-deep:#6b4a26;
    --paper:#f6ecd8; --ink:#42311f; --wood:#6b4423; --rope:#a9835a;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--kraft) url('${kraftURI}');background-size:180px 180px;color:var(--ink);font-family:'Bitter',Georgia,serif;font-weight:400;font-size:1.04rem;line-height:1.7;}
  h1,h2,h3{font-family:'Caveat',cursive;font-weight:700;color:var(--kraft-deep);margin:0;}
  .script{font-family:'Caveat',cursive;color:var(--kraft-deep);}
  a{color:var(--accent);}
  section{max-width:740px;margin:0 auto;padding:clamp(36px,6vw,64px) clamp(18px,5vw,26px);text-align:center;}

  .eyebrow{letter-spacing:3px;text-transform:uppercase;font-size:.72rem;color:var(--accent2);font-family:'Bitter',serif;font-weight:700;}
  .eyebrow.on-dark{color:var(--paper);opacity:.85;}
  h2.section-title{font-size:clamp(2rem,6vw,2.8rem);margin:4px 0 20px;}
  .divider-flor{display:flex;justify-content:center;margin:6px 0 4px;}
  .sprig{max-width:100%;height:auto;}
  .twine-divider{max-width:100%;height:auto;margin:0 auto;display:block;}

  /* HERO */
  .hero{position:relative;padding:clamp(40px,7vw,72px) 16px clamp(50px,8vw,80px);text-align:center;overflow:hidden;background:linear-gradient(180deg,var(--kraft) 0%,#c3a878 100%);}
  .hero::before{content:"";position:absolute;inset:0;background:url('${kraftURI}');background-size:180px 180px;opacity:.5;pointer-events:none;}
  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;}
  .hero-corner{position:absolute;z-index:1;pointer-events:none;opacity:.95;}
  .hero-corner.hc-tl{top:-6px;left:-6px;transform-origin:12% 92%;animation:brisa-tallo 9s ease-in-out infinite;}
  .hero-corner.hc-br{bottom:-6px;right:-6px;transform-origin:88% 92%;animation:brisa-tallo 10s ease-in-out infinite 1.4s;}
  /* Balanceo levísimo tipo brisa de campo, sobre el ramo de las esquinas del hero */
  @keyframes brisa-tallo{
    0%,100%{transform:rotate(-1.6deg);}
    50%{transform:rotate(2deg);}
  }
  /* Abejita que sobrevuela el hero con una trayectoria suave y lenta */
  .bee-fly{position:absolute;top:32%;left:16%;z-index:2;pointer-events:none;opacity:.9;animation:vuelo-abeja 16s ease-in-out infinite;}
  @keyframes vuelo-abeja{
    0%{transform:translate(0,0) rotate(-6deg);}
    16%{transform:translate(42px,-20px) rotate(4deg);}
    34%{transform:translate(88px,8px) rotate(-5deg);}
    52%{transform:translate(58px,30px) rotate(3deg);}
    70%{transform:translate(16px,16px) rotate(-4deg);}
    86%{transform:translate(-20px,-10px) rotate(5deg);}
    100%{transform:translate(0,0) rotate(-6deg);}
  }
  @media (prefers-reduced-motion: reduce){
    .hero-corner.hc-tl,.hero-corner.hc-br,.bee-fly{animation:none !important;}
    .hero-corner.hc-tl,.hero-corner.hc-br{transform:none;}
    .bee-fly{transform:none;}
  }
  .hero .eyebrow{color:var(--kraft-deep);opacity:.8;}
  .hero h1{font-size:clamp(2.6rem,10vw,4.6rem);line-height:1;color:var(--kraft-deep);margin:10px 0;text-shadow:0 1px 0 rgba(255,255,255,.25);}
  .hero h1 .amp{color:var(--accent);padding:0 .1em;display:inline-block;}
  .hero-frame{width:min(76%,300px);aspect-ratio:4/5;margin:20px auto 8px;background:var(--paper);padding:14px 14px 34px;box-shadow:0 16px 32px rgba(80,55,25,.32),0 0 0 1px rgba(255,255,255,.4) inset;position:relative;transform:rotate(-1.4deg);}
  .hero-frame .frame-img-wrap{width:100%;height:100%;overflow:hidden;}
  .hero-frame img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.94) contrast(1.02);}
  .hero-frame .tape{position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(-2deg);width:74px;height:26px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(240,225,190,.55));border:1px solid rgba(255,255,255,.4);box-shadow:0 2px 4px rgba(0,0,0,.12);}
  .hero .fecha-linda{margin-top:14px;font-size:clamp(1rem,3vw,1.25rem);letter-spacing:2px;color:var(--wood);text-transform:uppercase;font-family:'Bitter',serif;font-weight:600;}

  /* Tarjeta tipo tabla de madera / kraft oscuro */
  .wood-card{position:relative;overflow:hidden;background:linear-gradient(165deg,#8a6136,var(--wood) 55%,#4d3116);border-radius:14px;padding:clamp(26px,5vw,44px) clamp(18px,5vw,32px);color:var(--paper);box-shadow:0 14px 30px rgba(60,38,16,.3);text-align:left;border:1px solid rgba(255,255,255,.08);}
  .wood-card::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(255,255,255,.03) 0 3px,transparent 3px 9px);pointer-events:none;}
  .wood-card h2,.wood-card h3{color:var(--paper);}
  .wood-card p{color:#e6d6b8;}

  /* COUNTDOWN — etiquetas colgantes tipo tag de vidrio/madera */
  .countdown{display:flex;gap:clamp(8px,3vw,18px);justify-content:center;flex-wrap:wrap;margin:22px 0 0;}
  .countdown div{position:relative;display:flex;flex-direction:column;background:rgba(255,255,255,.07);border:1px solid rgba(230,214,184,.35);border-radius:8px;width:clamp(64px,16vw,86px);height:clamp(64px,16vw,86px);align-items:center;justify-content:center;}
  .countdown div::before{content:"";position:absolute;top:6px;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:var(--wood);border:1px solid rgba(230,214,184,.5);}
  .cd-num{font-family:'Bitter',serif;font-weight:700;font-size:clamp(1.15rem,4vw,1.5rem);color:var(--accent);margin-top:4px;}
  .cd-label{font-size:.58rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--paper);opacity:.75;margin-top:2px;}

  /* MENSAJE tipo hoja de cuaderno de campo */
  .paper-card{background:var(--paper);max-width:560px;margin:0 auto;padding:30px clamp(20px,5vw,40px);border-radius:2px;position:relative;box-shadow:0 12px 26px rgba(60,38,16,.16);transform:rotate(.5deg);}
  .paper-card::before{content:"";position:absolute;top:-10px;left:50%;transform:translateX(-50%) rotate(-1deg);width:70px;height:24px;background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(240,225,190,.5));border:1px solid rgba(255,255,255,.4);box-shadow:0 2px 4px rgba(0,0,0,.1);}
  .message{font-size:clamp(1.25rem,3vw,1.6rem);font-family:'Caveat',cursive;font-weight:600;color:var(--kraft-deep);margin:0;line-height:1.45;}

  /* CRONOGRAMA */
  .timeline{list-style:none;margin:24px 0 0;padding:0;text-align:left;display:flex;flex-direction:column;gap:0;position:relative;}
  .timeline::before{content:"";position:absolute;left:20px;top:6px;bottom:6px;width:1px;background:repeating-linear-gradient(180deg,rgba(230,214,184,.5) 0 5px,transparent 5px 9px);}
  .timeline li{position:relative;padding:0 0 26px 52px;}
  .timeline li:last-child{padding-bottom:0;}
  .timeline li::before{content:"";position:absolute;left:14px;top:4px;width:13px;height:13px;border-radius:50%;background:var(--accent);border:2px solid var(--wood);}
  .timeline .t-hora{font-family:'Bitter',serif;font-weight:700;color:var(--accent);font-size:1.02rem;letter-spacing:.3px;}
  .timeline .t-label{margin:2px 0 0;color:var(--paper);opacity:.92;}
  .info-row{display:flex;flex-wrap:wrap;gap:12px 22px;justify-content:flex-start;margin-top:6px;text-align:left;}
  .info-row .item{display:flex;align-items:flex-start;gap:10px;color:var(--paper);}
  .map-link{display:inline-block;margin-top:22px;padding:11px 26px;border:1px solid var(--accent);color:var(--paper);background:color-mix(in srgb, var(--accent) 30%, transparent);border-radius:6px;text-decoration:none;font-size:.8rem;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;transition:background .2s;}
  .map-link:hover{background:var(--accent);color:#2f1c08;}

  /* DETALLES: dress code + regalo, como tags de equipaje de arpillera */
  .pill-row{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;margin-top:14px;}
  .pill{background:var(--paper);border-radius:4px;padding:30px 24px 24px;max-width:300px;flex:1 1 240px;text-align:center;box-shadow:0 10px 22px rgba(60,38,16,.14);position:relative;}
  .pill::before{content:"";position:absolute;top:10px;left:50%;transform:translateX(-50%);width:12px;height:12px;border:2px solid var(--kraft-dark);border-radius:50%;background:var(--kraft);}
  .pill .tag{display:inline-block;background:var(--accent2);color:var(--paper);border-radius:3px;padding:6px 16px;font-size:.7rem;letter-spacing:1.5px;text-transform:uppercase;margin:10px 0 14px;font-weight:700;}
  .pill h3{margin:6px 0 8px;font-size:1.5rem;color:var(--kraft-deep);}
  .pill p{margin:0;opacity:.85;font-size:.96rem;font-family:'Bitter',serif;}
  .alias-box{display:inline-block;margin-top:12px;background:var(--kraft);border:1px dashed var(--kraft-dark);border-radius:6px;padding:8px 18px;font-weight:700;color:var(--kraft-deep);letter-spacing:.5px;font-family:'Bitter',serif;}

  /* GALERÍA — fotos tipo polaroid apiladas prolijamente */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:18px 14px;margin-top:28px;}
  .gallery-item{background:var(--paper);padding:8px 8px 22px;box-shadow:0 10px 20px rgba(60,38,16,.18);position:relative;}
  .gallery-item:nth-child(odd){transform:rotate(-2deg);}
  .gallery-item:nth-child(even){transform:rotate(1.6deg);}
  .gallery-item::before{content:"";position:absolute;top:-9px;left:50%;transform:translateX(-50%) rotate(-3deg);width:46px;height:18px;background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(240,225,190,.5));border:1px solid rgba(255,255,255,.4);}
  .gallery img{width:100%;height:clamp(110px,20vw,170px);object-fit:cover;display:block;cursor:pointer;filter:saturate(.95);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(45,29,12,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:4px;border:6px solid var(--paper);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--paper);font-size:2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-deadline{margin:10px 0 0;font-size:.8rem;letter-spacing:1.4px;text-transform:uppercase;opacity:.85;color:var(--accent2);}
  .rsvp-cols{display:grid;grid-template-columns:1fr 1px 1fr;gap:clamp(20px,4vw,44px);align-items:center;margin-top:28px;text-align:left;}
  .rsvp-divider{align-self:stretch;background:repeating-linear-gradient(180deg,var(--rope) 0 6px,transparent 6px 11px);opacity:.7;}
  .rsvp-deco-col{display:flex;align-items:center;justify-content:center;color:var(--accent);}
  .rsvp-deco-col .sprig{width:min(100%,170px);}
  @media(max-width:640px){
    .rsvp-cols{grid-template-columns:1fr;gap:8px;}
    .rsvp-divider{display:none;}
    .rsvp-deco-col{display:none;}
  }
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.74rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--accent2);font-weight:700;font-family:'Bitter',serif;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Bitter',serif;font-size:1rem;padding:11px 12px;border:1px solid var(--kraft-dark);border-radius:6px;margin-top:5px;width:100%;background:var(--paper);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:2px solid var(--accent);border-color:var(--accent);}
  .rsvp-form button{background:var(--wood);color:var(--paper);border:0;padding:14px;border-radius:6px;letter-spacing:1.4px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-weight:700;transition:background .2s;font-family:'Bitter',serif;}
  .rsvp-form button:hover{background:#523419;}
  .rsvp-whatsapp{display:block;margin-top:14px;font-size:.88rem;color:var(--accent2);text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:var(--kraft-deep);font-weight:700;margin-top:10px;}

  footer{position:relative;text-align:center;padding:54px 20px 42px;color:var(--paper);background:linear-gradient(165deg,#8a6136,var(--wood) 55%,#4d3116);overflow:hidden;}
  footer .inner{position:relative;z-index:1;}
  footer .script{font-size:clamp(2.2rem,7vw,3rem);display:block;margin-bottom:8px;color:var(--paper);}
  footer p{margin:0;font-size:.92rem;opacity:.85;font-family:'Bitter',serif;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-corner hc-tl">${cornerBouquetSVG(100, false, accent, accent2)}</div>
    <div class="hero-corner hc-br">${cornerBouquetSVG(100, true, accent, accent2)}</div>
    <div class="bee-fly" aria-hidden="true">${beeSVG(30)}</div>
    <div class="hero-inner">
      <div class="eyebrow">Nos casamos en el campo</div>
      <h1>${esc(d.novia)} <span class="amp">&amp;</span> ${esc(d.novio)}</h1>
      <div class="hero-frame">
        <div class="tape"></div>
        <div class="frame-img-wrap"><img src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}"></div>
      </div>
      <div class="fecha-linda">${fechaLarga(d.fecha)}</div>
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<section>
    <div class="divider-flor">${twineDividerSVG(190, "#a9835a")}</div>
    <p class="eyebrow">La gran fecha</p>
    <h2 class="section-title">Ceremonia y fiesta</h2>
    <div class="wood-card">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="info-row">
        <div class="item">${budIconSVG(20, accent)} <div>${d.horaCeremonia ? `<strong>Ceremonia · ${esc(d.horaCeremonia)} hs</strong>` : `<strong>Ceremonia</strong>`}${d.lugarCeremonia ? `<br>${esc(d.lugarCeremonia)}` : ""}</div></div>
      </div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="info-row" style="margin-top:16px;">
        <div class="item">${budIconSVG(20, accent)} <div>${d.horaFiesta ? `<strong>Fiesta · ${esc(d.horaFiesta)} hs</strong>` : `<strong>Fiesta</strong>`}${d.lugarFiesta ? `<br>${esc(d.lugarFiesta)}` : ""}</div></div>
      </div>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Cómo llegar</a>` : ""}
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Cuenta regresiva</p>
    <h2 class="section-title">Faltan</h2>
    <div class="wood-card">
      ${cd.html}
    </div>
  </section>

  ${d.mensaje ? `<section>
    <div class="divider-flor">${twineDividerSVG(190, "#a9835a")}</div>
    <div class="paper-card">
      <p class="message">${esc(d.mensaje)}</p>
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Detalles para el día</p>
    <h2 class="section-title">Tené en cuenta</h2>
    <div class="pill-row">
      ${d.dressCode ? `<div class="pill">
        <span class="tag">Código de vestimenta</span>
        <h3>Elegante campestre</h3>
        <p>${esc(d.dressCode)}</p>
      </div>` : ""}
      <div class="pill">
        <span class="tag">Sugerencia de regalos</span>
        <h3>Un gesto con nosotros</h3>
        <p>Lo más importante es tenerlos ahí, pero si quieren hacernos un regalo, pueden hacerlo por transferencia.</p>
        ${d.alias ? `<div class="alias-box">Alias: ${esc(d.alias)}</div>` : ""}
      </div>
    </div>
  </section>

  ${(d.galeria && d.galeria.length) ? `<section>
    <div class="divider-flor">${twineDividerSVG(190, "#a9835a")}</div>
    <p class="eyebrow">Recuerdos</p>
    <h2 class="section-title">Nuestro camino hasta acá</h2>
    ${gal.html}
  </section>` : ""}

  <section class="rsvp-section">
    <p class="eyebrow">Por favor confirmá</p>
    <h2 class="section-title">Confirmar asistencia</h2>
    ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-cols">
      <div class="rsvp-form-col">${rsvp.html}</div>
      <div class="rsvp-divider" aria-hidden="true"></div>
      <div class="rsvp-deco-col">${wildflowerSprigSVG(150, 62, accent, accent2)}</div>
    </div>
  </section>

  <footer>
    <div class="inner">
      <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
      <p>Con todo nuestro cariño, gracias por ser parte de este día.</p>
    </div>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function fechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, dd] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd} de ${meses[m - 1]} de ${y}`;
}

// Preview en miniatura para la grilla del catálogo: fondo cálido tipo
// kraft con una ramita de flores silvestres dibujada a mano en la
// esquina y el nombre del diseño en manuscrita, con buen contraste.
// Solo estilos inline, sin <style> ni var() (site.css es compartido).
function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:linear-gradient(160deg,#e2c99a 0%,#c9a876 55%,#a9835a 100%);">
    <svg style="position:absolute;bottom:-6px;left:-8px;width:120px;height:auto;opacity:.95;" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 82 C 36 72, 66 62, 90 34 C 104 20, 120 12, 152 7" fill="none" stroke="${d.accent2}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
      <path d="M40 76 C 29 69, 24 58, 32 49 C 43 55, 47 67, 40 76 Z" fill="${d.accent2}" opacity=".8"/>
      <path d="M66 58 C 57 49, 55 38, 65 29 C 75 37, 76 50, 66 58 Z" fill="${d.accent2}" opacity=".72"/>
      <g transform="translate(110,22)">
        <path d="M0 -12 C 4 -8 4 -2 0 0 C -4 -2 -4 -8 0 -12Z" fill="#f7efdd"/>
        <path d="M12 -1 C 7 3 2 3 0 0 C 2 -4 7 -4 12 -1Z" fill="#f7efdd"/>
        <path d="M1 12 C -3 7 -3 2 0 0 C 4 2 4 7 1 12Z" fill="#f7efdd"/>
        <path d="M-11 2 C -6 -3 -1 -3 0 0 C -3 3 -7 4 -11 2Z" fill="#f7efdd"/>
        <circle cx="0" cy="0" r="3.8" fill="${d.accent}"/>
      </g>
      <g transform="translate(140,9) scale(.65)">
        <circle cx="0" cy="-8" r="4.8" fill="${d.accent}" opacity=".92"/>
        <circle cx="6" cy="-2" r="4.8" fill="${d.accent}" opacity=".82"/>
        <circle cx="-6" cy="-2" r="4.8" fill="${d.accent}" opacity=".82"/>
        <circle cx="0" cy="4" r="4.8" fill="${d.accent}" opacity=".88"/>
        <circle cx="0" cy="-2" r="3.1" fill="#6e4415"/>
      </g>
    </svg>
    <div style="position:relative;z-index:1;font-family:'Segoe Script','Brush Script MT',cursive;font-size:1.5rem;font-weight:700;color:#4a2f12;text-shadow:0 1px 0 rgba(255,255,255,.35);text-align:center;padding:0 18px;">${esc(d.name)}</div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Rústica de Campo",
  summary: "Papel kraft, madera y flores silvestres dibujadas a mano con acentos de terracota y verde salvia — un diseño cálido y campestre para bodas en quintas y estancias.",
  accent: "#b5651d", accent2: "#7c8f6e", schema: bodaSchema, sampleData, render, cardPreview,
};
