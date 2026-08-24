const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-pop-vibrante";

const sampleData = {
  nombre: "Mariana Pérez",
  fecha: "2027-10-25", horaFiesta: "16:30", lugarFiesta: "Salón Fiorentina",
  horaCeremonia: "", lugarCeremonia: "",
  direccionMapa: "https://maps.google.com/?q=Salon+Fiorentina",
  padres: "Jorge Pérez & Carla Méndez",
  mensaje: "Hay momentos inolvidables que se atesoran en el corazón para siempre, por esa razón, quiero que compartas conmigo éste día tan especial.",
  dressCode: "Formal · evitar tonos lavanda y morado",
  whatsapp: "5491100000005",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
  ],
};

// Colores fijos "de fiesta" que acompañan al acento de la paleta (igual que
// otros diseños combinan su acento con un segundo tono propio): un fucsia
// vibrante y un dorado mostaza para el confeti. El acento (getPaletteColor)
// sigue siendo el que manda en título, nombre, íconos y botones.
const POP_PINK = "#e85fa0";
const POP_GOLD = "#ffb64d";

// Motivos dibujados a mano en SVG inline — sin imágenes externas para
// decoración. Todo en currentColor o con colores explícitos pasados por
// parámetro, para que siga funcionando con cualquier acento de paleta.
function tiaraSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 55 L18 20 L38 40 L60 12 L82 40 L102 20 L110 55" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
    <line x1="8" y1="58" x2="112" y2="58" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <circle cx="18" cy="20" r="4" fill="currentColor"/>
    <circle cx="60" cy="12" r="5" fill="currentColor"/>
    <circle cx="102" cy="20" r="4" fill="currentColor"/>
  </svg>`;
}

function dividerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="12" x2="82" y2="12" stroke="currentColor" stroke-width="1.4"/>
    <line x1="118" y1="12" x2="200" y2="12" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="100" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="100" cy="12" r="1.8" fill="currentColor"/>
  </svg>`;
}

function cheersSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 8 L20 30 C 20 36, 26 38, 26 38 L26 50 M14 8 L26 8 M14 8 C 12 16, 14 24, 20 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-14 26 30)"/>
    <path d="M44 8 L38 30 C 38 36, 32 38, 32 38 L32 50 M44 8 L32 8 M44 8 C 46 16, 44 24, 38 30" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(14 32 30)"/>
    <line x1="18" y1="52" x2="40" y2="52" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

function giftSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="24" width="40" height="28" rx="3" stroke="currentColor" stroke-width="2.2"/>
    <line x1="10" y1="34" x2="50" y2="34" stroke="currentColor" stroke-width="2.2"/>
    <line x1="30" y1="24" x2="30" y2="52" stroke="currentColor" stroke-width="2.2"/>
    <path d="M30 24 C 22 24, 16 18, 20 12 C 26 10, 30 18, 30 24 Z" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M30 24 C 38 24, 44 18, 40 12 C 34 10, 30 18, 30 24 Z" stroke="currentColor" stroke-width="2.2" fill="none"/>
  </svg>`;
}

function envelopeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2" y="2" width="56" height="40" rx="4" stroke="currentColor" stroke-width="2.2"/>
    <path d="M4 5 L30 26 L56 5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function calendarHeartSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="12" width="44" height="40" rx="5" stroke="currentColor" stroke-width="2.2"/>
    <line x1="8" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="2.2"/>
    <line x1="18" y1="6" x2="18" y2="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="42" y1="6" x2="42" y2="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M30 42 C 24 34, 14 34, 14 42 C 14 48, 22 52, 30 58 C 38 52, 46 48, 46 42 C 46 34, 36 34, 30 42 Z" fill="currentColor"/>
  </svg>`;
}

function dressCodeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M28 6 L36 16 L28 26 L20 20 Z" fill="currentColor"/>
    <path d="M14 26 L28 16 L28 66 L14 66 Z" fill="currentColor"/>
    <path d="M42 26 L28 16 L28 66 L42 66 Z" fill="currentColor"/>
    <line x1="28" y1="16" x2="28" y2="30" stroke="#fff" stroke-width="2"/>
    <path d="M90 8 C 78 8, 72 20, 76 30 C 66 40, 66 58, 74 66 L106 66 C 114 58, 114 40, 104 30 C 108 20, 102 8, 90 8 Z" fill="currentColor"/>
    <circle cx="90" cy="18" r="4" fill="#fff"/>
  </svg>`;
}

function mapPinSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21s7-6.7 7-12a7 7 0 1 0-14 0c0 5.3 7 12 7 12Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <circle cx="12" cy="9" r="2.6" fill="currentColor"/>
  </svg>`;
}

// Ramillete de confeti hecho a mano (círculos, triángulos y rombos) en los
// tres tonos de fiesta. Se usa tal cual y espejado en las bandas de color.
function confettiSvg(cls = "", accent = "#7c4a9e") {
  return `<svg class="${cls}" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="30" r="6" fill="#fff" opacity=".9"/>
    <circle cx="60" cy="70" r="4" fill="${POP_GOLD}" opacity=".9"/>
    <circle cx="140" cy="20" r="5" fill="#fff" opacity=".8"/>
    <circle cx="270" cy="55" r="7" fill="${POP_PINK}" opacity=".85"/>
    <circle cx="300" cy="15" r="4" fill="#fff" opacity=".9"/>
    <rect x="95" y="45" width="10" height="10" rx="2" fill="#fff" opacity=".85" transform="rotate(18 100 50)"/>
    <rect x="230" y="90" width="9" height="9" rx="2" fill="${POP_GOLD}" opacity=".9" transform="rotate(-20 234 94)"/>
    <polygon points="180,60 190,80 170,80" fill="#fff" opacity=".85"/>
    <polygon points="35,110 46,128 24,128" fill="${POP_PINK}" opacity=".8"/>
    <polygon points="255,25 265,40 245,40" fill="${accent}" opacity="0"/>
  </svg>`;
}

// Un par de globos simples, siempre en dos tonos (blanco + acento) para que
// convivan con cualquier paleta elegida.
function balloonsSvg(cls = "", accent = "#7c4a9e") {
  return `<svg class="${cls}" viewBox="0 0 90 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="24" cy="34" rx="22" ry="27" fill="#fff" opacity=".92"/>
    <path d="M24 61 L24 82" stroke="#fff" stroke-width="1.6" opacity=".8"/>
    <path d="M20 82 L28 82 L24 90 Z" fill="#fff" opacity=".8"/>
    <ellipse cx="66" cy="24" rx="17" ry="21" fill="${POP_GOLD}" opacity=".95"/>
    <path d="M66 45 L66 62" stroke="${POP_GOLD}" stroke-width="1.6" opacity=".85"/>
    <path d="M62 62 L70 62 L66 68 Z" fill="${POP_GOLD}" opacity=".85"/>
  </svg>`;
}

// Silueta de la quinceañera en vestido de gala, traducida a formas
// geométricas de color-block (nunca una ilustración importada): la cabeza es
// un círculo, la tiara son triángulos, y el vestido es un abanico de
// triángulos superpuestos en los tonos de la paleta.
function girlSilhouetteSvg(cls = "", accent = "#7c4a9e") {
  return `<svg class="${cls}" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="82,140 100,140 100,255 20,255" fill="${accent}"/>
    <polygon points="100,140 118,140 180,255 100,255" fill="${POP_PINK}"/>
    <line x1="100" y1="140" x2="100" y2="255" stroke="#fff" stroke-width="3"/>
    <path d="M78 92 L76 128 C76 136,84 140,100 140 C116 140,124 136,124 128 L122 92 Z" fill="${accent}"/>
    <circle cx="100" cy="60" r="24" fill="${accent}"/>
    <polygon points="78,42 87,20 95,38 100,16 105,38 113,20 122,42" fill="${POP_GOLD}"/>
    <line x1="78" y1="42" x2="122" y2="42" stroke="${POP_GOLD}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#7c4a9e");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cdpop");
  const gal = galleryWidget(d.galeria || [], "galpop");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaBox = (() => {
    if (!d.fecha) return null;
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      if (isNaN(dt.getTime())) return null;
      return {
        weekday: dt.toLocaleDateString("es-AR", { weekday: "long" }),
        day: dt.getDate(),
        month: dt.toLocaleDateString("es-AR", { month: "long" }),
        year: dt.getFullYear(),
      };
    } catch { return null; }
  })();

  const bandDecor = `${confettiSvg("confetti confetti-a", accent)}${confettiSvg("confetti confetti-b", accent)}${balloonsSvg("balloons balloons-l", accent)}${balloonsSvg("balloons balloons-r", accent)}`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Marcellus&family=Great+Vibes&display=swap" rel="stylesheet">
<style>
  :root{
    --accent:${accent};
    --accent-soft:color-mix(in srgb, ${accent}, white 82%);
    --pink:${POP_PINK};
    --gold:${POP_GOLD};
    --cream:#fffaf3;
    --ink:#2f2438;
    --muted:#6d6275;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--cream);color:var(--ink);line-height:1.6;}
  h1,h2,.serif-caps{font-family:'Marcellus',serif;}
  .script{font-family:'Great Vibes',cursive;}
  .icon-accent{color:var(--accent);}
  img{max-width:100%;}

  /* ---------- Bandas de color (hero / galería / footer) ---------- */
  .pop-band{
    position:relative;overflow:hidden;
    background:linear-gradient(135deg, var(--accent) 0%, var(--pink) 100%);
    padding:clamp(46px,9vw,72px) 20px;
  }
  .confetti{position:absolute;width:min(46vw,300px);height:auto;pointer-events:none;z-index:0;}
  .confetti-a{top:6px;left:-30px;}
  .confetti-b{bottom:6px;right:-30px;transform:scaleX(-1);}
  .balloons{position:absolute;width:clamp(46px,10vw,74px);height:auto;pointer-events:none;z-index:0;opacity:.95;}
  .balloons-l{top:14px;left:16px;}
  .balloons-r{bottom:10px;right:18px;transform:scaleX(-1);}

  /* ---------- Tarjeta blanca (hero) ---------- */
  .invite-card{
    position:relative;z-index:1;max-width:460px;margin:0 auto;background:#fff;
    border-radius:26px;padding:clamp(28px,6vw,44px) clamp(22px,5vw,34px) 34px;
    box-shadow:0 24px 50px rgba(30,10,40,.28);text-align:center;
  }
  .frame{
    width:min(78%,260px);margin:0 auto 6px;border-radius:8px 8px 60px 8px;overflow:hidden;
    box-shadow:0 12px 26px color-mix(in srgb, var(--accent) 30%, transparent);
    border:6px solid #fff;outline:2px solid var(--accent-soft);transform:rotate(-2deg);position:relative;
  }
  .frame img{width:100%;display:block;aspect-ratio:3/4;object-fit:cover;}
  .sticker{
    position:absolute;bottom:-14px;right:-14px;width:58px;height:58px;border-radius:50%;
    background:var(--pink);color:#fff;display:flex;align-items:center;justify-content:center;
    font-family:'Marcellus',serif;font-size:1.15rem;letter-spacing:.5px;transform:rotate(8deg);
    box-shadow:0 8px 18px rgba(0,0,0,.22);border:3px solid #fff;z-index:2;
  }
  .icon-xl{width:clamp(52px,12vw,72px);height:auto;margin:20px auto 8px;display:block;}
  h1.title{
    font-size:clamp(1.4rem,4.4vw,1.85rem);letter-spacing:4px;margin:4px 0 10px;color:var(--accent);
  }
  .title-rule{width:64px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--pink));margin:0 auto 18px;}
  .name-script{font-size:clamp(2.1rem,7vw,2.9rem);color:var(--pink);margin:0 0 10px;line-height:1;}
  .quote{font-style:italic;color:var(--muted);max-width:380px;margin:0 auto 18px;font-size:clamp(.98rem,2.2vw,1.08rem);}
  .parents{margin:0 0 18px;}
  .parents .eyebrow{display:block;margin-bottom:6px;}
  .parents strong{color:var(--accent);font-family:'Marcellus',serif;font-weight:400;font-size:1.05rem;}
  .eyebrow{letter-spacing:3px;text-transform:uppercase;font-size:.72rem;color:var(--accent);font-family:'Marcellus',serif;}

  .date-strip{display:flex;align-items:stretch;justify-content:center;gap:0;margin:20px auto 0;border:1.5px solid var(--accent-soft);border-radius:14px;overflow:hidden;max-width:300px;}
  .date-strip > div{flex:1;padding:12px 8px;}
  .date-strip .d-weekday{border-right:1.5px solid var(--accent-soft);display:flex;align-items:center;justify-content:center;text-transform:uppercase;letter-spacing:1.5px;font-size:.72rem;color:var(--accent);font-family:'Marcellus',serif;}
  .date-strip .d-day{font-family:'Marcellus',serif;font-size:clamp(1.9rem,6vw,2.4rem);color:var(--pink);line-height:1;display:flex;align-items:center;justify-content:center;border-right:1.5px solid var(--accent-soft);}
  .date-strip .d-my{display:flex;flex-direction:column;align-items:center;justify-content:center;text-transform:uppercase;letter-spacing:1.5px;font-size:.68rem;color:var(--accent);font-family:'Marcellus',serif;gap:2px;}

  .countdown-wrap{position:relative;z-index:1;margin:clamp(26px,5vw,36px) auto 0;text-align:center;}
  .countdown-wrap .eyebrow{display:block;margin-bottom:12px;color:#fff;}
  .countdown{display:flex;gap:clamp(8px,2vw,14px);justify-content:center;flex-wrap:wrap;}
  .countdown div{
    background:#fff;border-radius:12px;
    padding:clamp(8px,2vw,14px) clamp(10px,2.4vw,18px);min-width:64px;
    box-shadow:0 8px 18px rgba(0,0,0,.18);
  }
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.4rem,4vw,1.9rem);color:var(--accent);display:block;}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);}

  /* ---------- Secciones claras ---------- */
  section{position:relative;max-width:720px;margin:0 auto;padding:clamp(46px,9vw,70px) 24px;text-align:center;}
  .section-tint{background:var(--accent-soft);max-width:none;}
  .section-tint > *{max-width:720px;margin-left:auto;margin-right:auto;}
  h2{
    font-size:clamp(1.05rem,2.8vw,1.4rem);color:var(--accent);
    text-transform:uppercase;letter-spacing:3px;font-weight:400;margin:10px 0 6px;
  }
  p{font-size:clamp(1rem,2.2vw,1.15rem);}
  .icon-md{width:clamp(38px,8vw,50px);height:auto;margin:0 auto 6px;display:block;}

  /* ---------- Bloques de detalle (ceremonia / fiesta / dresscode) ---------- */
  .detail-grid{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:30px;}
  .detail-card{
    background:#fff;border-radius:18px;padding:26px 22px;min-width:190px;flex:1 1 190px;max-width:250px;
    box-shadow:0 10px 24px color-mix(in srgb, var(--accent) 14%, transparent);
  }
  .detail-icon{
    width:48px;height:48px;border-radius:50%;background:var(--accent);color:#fff;
    display:flex;align-items:center;justify-content:center;margin:0 auto 14px;
  }
  .detail-icon svg{width:22px;height:22px;}
  .detail-card h3{margin:0 0 8px;color:var(--accent);font-size:1rem;letter-spacing:2px;text-transform:uppercase;font-family:'Marcellus',serif;font-weight:400;}
  .detail-time{color:var(--pink);font-weight:600;margin:0 0 4px;font-size:1.05rem;}
  .detail-place{margin:0;color:var(--muted);font-size:.94rem;line-height:1.5;}

  .map-btn{
    display:inline-flex;align-items:center;gap:8px;margin-top:26px;padding:11px 28px;border-radius:24px;
    background:var(--accent);color:#fff;text-decoration:none;letter-spacing:1px;
    font-family:'Marcellus',serif;font-size:.85rem;box-shadow:0 8px 18px color-mix(in srgb, var(--accent) 35%, transparent);
  }
  .map-btn svg{width:16px;height:16px;}

  .feature-photo{position:relative;max-width:280px;margin:38px auto 0;}
  .feature-photo img{
    width:100%;display:block;border-radius:60px 8px 8px 8px;
    box-shadow:0 16px 30px color-mix(in srgb, var(--pink) 30%, transparent);
    border:6px solid #fff;outline:2px solid var(--accent-soft);aspect-ratio:3/4;object-fit:cover;
    transform:rotate(2deg);
  }

  .dresscode{margin-top:8px;}
  .dresscode p{color:var(--muted);max-width:340px;margin:0 auto;}

  .timeline{margin-top:34px;text-align:left;max-width:380px;margin-left:auto;margin-right:auto;}
  .timeline-item{display:flex;align-items:center;gap:16px;padding:10px 0;border-left:2px solid var(--accent-soft);padding-left:20px;position:relative;}
  .timeline-item::before{content:"";position:absolute;left:-7px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:50%;background:var(--pink);border:2px solid #fff;box-shadow:0 0 0 2px var(--accent-soft);}
  .timeline-item:nth-child(even)::before{background:var(--accent);}
  .timeline-item .t-hora{font-family:'Marcellus',serif;color:var(--accent);min-width:74px;font-size:.92rem;}
  .timeline-item .t-label{text-transform:uppercase;letter-spacing:1px;font-size:.8rem;color:var(--ink);}

  /* ---------- Galería (banda de color) ---------- */
  .pop-band h2{color:#fff;}
  .pop-band .icon-md{color:#fff;}
  .gallery{
    position:relative;z-index:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:24px;
  }
  .gallery-item{border-radius:10px;overflow:hidden;aspect-ratio:1/1;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.22);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,10,40,.92);z-index:50;align-items:center;justify-content:center;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:8px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2rem;cursor:pointer;}

  /* ---------- Regalos ---------- */
  .gift-note{max-width:420px;margin:14px auto 0;color:var(--muted);}
  .envelope-tag{
    display:inline-flex;align-items:center;gap:10px;margin-top:16px;padding:10px 24px;
    background:var(--pink);color:#fff;border-radius:24px;letter-spacing:1.5px;text-transform:uppercase;font-size:.78rem;
    box-shadow:0 8px 18px color-mix(in srgb, var(--pink) 35%, transparent);
  }
  .envelope-tag svg{width:20px;height:auto;}

  /* ---------- RSVP ---------- */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:24px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--accent);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px;border-radius:10px;
    border:1.5px solid var(--accent-soft);background:#fff;color:var(--ink);margin-top:5px;width:100%;
  }
  .rsvp-form button{
    background:var(--pink);border:0;color:#fff;font-weight:600;letter-spacing:2px;
    text-transform:uppercase;font-size:.85rem;padding:14px;border-radius:24px;cursor:pointer;
    transition:background .2s,transform .15s;box-shadow:0 10px 20px color-mix(in srgb, var(--pink) 40%, transparent);
  }
  .rsvp-form button:hover{background:var(--accent);transform:translateY(-1px);}
  .rsvp-whatsapp{color:var(--accent);font-size:.9rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#3f8f5a;font-weight:600;}

  .closing{max-width:420px;margin:26px auto 0;color:var(--muted);font-size:.95rem;}

  /* ---------- Footer ---------- */
  footer{
    position:relative;text-align:center;padding:clamp(50px,10vw,80px) 20px clamp(20px,5vw,30px);
    background:linear-gradient(135deg, var(--accent) 0%, var(--pink) 100%);
    overflow:hidden;
  }
  footer .script{font-size:clamp(2rem,6vw,2.6rem);color:#fff;position:relative;z-index:1;margin:0 0 12px;text-shadow:0 4px 14px rgba(0,0,0,.18);}
  .girl-silhouette{position:relative;z-index:1;width:clamp(110px,26vw,150px);height:auto;margin:6px auto 0;filter:drop-shadow(0 10px 16px rgba(0,0,0,.2));}
</style></head>
<body>

  <div class="pop-band">
    ${bandDecor}
    <div class="invite-card">
      ${d.coverImage ? `<div class="frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}"><span class="sticker">XV</span></div>` : ""}
      ${tiaraSvg("icon-xl icon-accent")}
      <h1 class="title">Mis XV Años</h1>
      <div class="title-rule"></div>
      <div class="name-script script">${esc(d.nombre)}</div>
      ${d.mensaje ? `<p class="quote">&ldquo;${esc(d.mensaje)}&rdquo;</p>` : ""}
      ${d.padres ? `<div class="parents">
        <span class="eyebrow">Con el cariño de mis padres</span>
        <strong>${esc(d.padres)}</strong>
      </div>` : ""}
      ${fechaBox ? `<div class="date-strip">
        <div class="d-weekday">${esc(fechaBox.weekday)}</div>
        <div class="d-day">${esc(fechaBox.day)}</div>
        <div class="d-my"><span>${esc(fechaBox.month)}</span><span>${esc(fechaBox.year)}</span></div>
      </div>` : ""}
    </div>

    <div class="countdown-wrap">
      <span class="eyebrow">Faltan</span>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa || d.dressCode) ? `<section>
    ${cheersSvg("icon-md icon-accent")}
    <h2>El gran día</h2>

    ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="detail-grid">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="detail-card">
        <div class="detail-icon">${calendarHeartSvg()}</div>
        <h3>Ceremonia</h3>
        ${d.horaCeremonia ? `<p class="detail-time">${esc(d.horaCeremonia)}</p>` : ""}
        ${d.lugarCeremonia ? `<p class="detail-place">${esc(d.lugarCeremonia)}</p>` : ""}
      </div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="detail-card">
        <div class="detail-icon">${cheersSvg()}</div>
        <h3>Recepción</h3>
        ${d.horaFiesta ? `<p class="detail-time">${esc(d.horaFiesta)}</p>` : ""}
        ${d.lugarFiesta ? `<p class="detail-place">${esc(d.lugarFiesta)}</p>` : ""}
      </div>` : ""}
    </div>` : ""}

    ${d.direccionMapa ? `<a class="map-btn" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">${mapPinSvg()} Ver ubicación</a>` : ""}

    ${(d.galeria && d.galeria.length) || d.coverImage ? `<div class="feature-photo"><img src="${esc((d.galeria && d.galeria[0]) || d.coverImage)}" alt="${esc(d.nombre)}"></div>` : ""}

    <h2 style="margin-top:44px;">Itinerario de actividades</h2>
    <div class="timeline">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="timeline-item"><span class="t-hora">${d.horaCeremonia ? esc(d.horaCeremonia) : "&nbsp;"}</span><span class="t-label">Ceremonia</span></div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="timeline-item"><span class="t-hora">${d.horaFiesta ? esc(d.horaFiesta) : "&nbsp;"}</span><span class="t-label">Recepción</span></div>` : ""}
      <div class="timeline-item"><span class="t-hora">&nbsp;</span><span class="t-label">Vals y baile</span></div>
      <div class="timeline-item"><span class="t-hora">&nbsp;</span><span class="t-label">Despedida</span></div>
    </div>

    ${d.dressCode ? `<div class="dresscode">
      <h2 style="margin-top:40px;">Código de vestimenta</h2>
      <div class="detail-icon" style="margin:0 auto 12px;">${dressCodeSvg()}</div>
      <p>${esc(d.dressCode)}</p>
    </div>` : ""}
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <div class="pop-band">
    ${bandDecor}
    <section style="padding:0;max-width:720px;">
      ${dividerSvg("icon-md")}
      <h2>Momentos</h2>
      ${gal.html}
    </section>
  </div>` : ""}

  <section class="section-tint">
    ${giftSvg("icon-md icon-accent")}
    <h2>Sugerencia de regalos</h2>
    <p class="gift-note">Tu compañía en este día tan especial es el mejor regalo. Pero si deseas darme un obsequio, aquí tienes una opción:</p>
    <div class="envelope-tag">${envelopeSvg()} Lluvia de sobres</div>
  </section>

  <section>
    ${calendarHeartSvg("icon-md icon-accent")}
    <h2>Confirmar asistencia</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
    <p class="closing">Con mucho cariño, los espero para compartir juntos esta noche tan especial. ¡Su presencia y alegría harán que sea inolvidable!</p>
  </section>

  <footer>
    ${bandDecor}
    <p class="script">¡Te esperamos!</p>
    ${girlSilhouetteSvg("girl-silhouette", accent)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(135deg, #7c4a9e 0%, ${POP_PINK} 100%);">
    <div style="position:absolute;top:8px;left:10px;width:26px;height:26px;border-radius:50%;background:#fff;opacity:.85;"></div>
    <div style="position:absolute;bottom:10px;right:14px;width:16px;height:16px;border-radius:3px;background:${POP_GOLD};opacity:.9;transform:rotate(18deg);"></div>
    <div style="position:absolute;top:14px;right:22px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:13px solid #fff;opacity:.8;"></div>
    <svg viewBox="0 0 120 70" width="46" height="27" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:#fff;position:relative;z-index:1;">
      <path d="M10 55 L18 20 L38 40 L60 12 L82 40 L102 20 L110 55" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <line x1="8" y1="58" x2="112" y2="58" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <div style="position:relative;z-index:1;font-family:'Great Vibes','Brush Script MT','Segoe Script',cursive;font-size:1.5rem;color:#fff;line-height:1;">${esc(d.name)}</div>
    <div style="position:relative;z-index:1;font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#fff;font-family:Georgia,'Times New Roman',serif;font-weight:600;background:rgba(255,255,255,.22);padding:3px 10px;border-radius:20px;">Mis XV Años</div>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Pop Vibrante",
  summary: "Bandas de color vibrante en degradé, confeti y globos dibujados a mano, tarjeta de invitación blanca con tiara y silueta geométrica — un XV festivo y con mucho pop.",
  accent: "#7c4a9e", accent2: "#e85fa0", schema: xvSchema, sampleData, render, cardPreview,
};
