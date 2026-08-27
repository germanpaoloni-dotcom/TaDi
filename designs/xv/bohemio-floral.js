const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-bohemio-floral";

const sampleData = {
  nombre: "Martina",
  fecha: "2027-09-04", horaCeremonia: "18:00", lugarCeremonia: "Parroquia San José",
  horaFiesta: "20:00", lugarFiesta: "Quinta La Flor, Pilar",
  direccionMapa: "https://maps.google.com/?q=Quinta+La+Flor+Pilar",
  padres: "Marcela y Fernando",
  mensaje: "A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo mis 15 años. Porque su presencia siempre será mi mejor regalo.",
  dressCode: "Boho / colores pastel",
  whatsapp: "5491100000004",
  coverImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos SVG (rosas y hojas en acuarela boho, dibujados a mano en vectores) ---
function roseCluster(opts = {}) {
  const { w = 130, flip = false, flop = false } = opts;
  const t = [flip ? "scaleX(-1)" : "", flop ? "scaleY(-1)" : ""].filter(Boolean).join(" ");
  return `<svg class="floral" width="${w}" viewBox="0 0 200 200" style="transform:${t || "none"}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M42 172 C 14 128, 22 78, 58 52" stroke="#93a679" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M58 52 C 70 44, 90 40, 110 46" stroke="#93a679" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="52" cy="76" rx="17" ry="9" fill="#93a679" transform="rotate(-35 52 76)"/>
    <ellipse cx="34" cy="118" rx="16" ry="8" fill="#a3b489" transform="rotate(25 34 118)"/>
    <ellipse cx="30" cy="150" rx="14" ry="7" fill="#93a679" transform="rotate(-15 30 150)"/>
    <g>
      <circle cx="70" cy="46" r="21" fill="#f7ece0"/>
      <circle cx="53" cy="38" r="16" fill="#f0dcc9"/>
      <circle cx="87" cy="38" r="16" fill="#f0dcc9"/>
      <circle cx="70" cy="27" r="15" fill="#e7c6ac"/>
      <circle cx="70" cy="43" r="10" fill="#d9a988"/>
    </g>
    <g>
      <circle cx="128" cy="82" r="15" fill="#f7ece0"/>
      <circle cx="116" cy="75" r="11" fill="#f0dcc9"/>
      <circle cx="140" cy="75" r="11" fill="#f0dcc9"/>
      <circle cx="128" cy="80" r="8" fill="#d9a988"/>
    </g>
    <ellipse cx="146" cy="104" rx="14" ry="7" fill="#93a679" transform="rotate(-20 146 104)"/>
    <g>
      <circle cx="112" cy="130" r="10" fill="#f0dcc9"/>
      <circle cx="104" cy="125" r="7" fill="#e7c6ac"/>
      <circle cx="120" cy="125" r="7" fill="#e7c6ac"/>
    </g>
  </svg>`;
}

// Pétalo suelto (usado en la lluvia de pétalos animada del hero)
function petal() {
  return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 1C4 9 2 19 12 33C22 19 20 9 12 1Z" fill="currentColor"/>
  </svg>`;
}

function sprig(w = 70) {
  return `<svg class="sprig" width="${w}" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 20 C 30 2, 70 2, 98 20" stroke="#c9a98f" stroke-width="1.5" fill="none"/>
    <circle cx="50" cy="13" r="4" fill="#d9a988"/>
    <ellipse cx="30" cy="18" rx="6" ry="3" fill="#93a679" transform="rotate(-20 30 18)"/>
    <ellipse cx="70" cy="18" rx="6" ry="3" fill="#93a679" transform="rotate(20 70 18)"/>
  </svg>`;
}

// Borde de "papel rasgado": recorta el rectángulo del elemento con dientes
// irregulares arriba y abajo, para usarlo como divisor entre secciones de
// distinto color de fondo (misma técnica que el clip-path de .photo-wrap,
// aplicada acá a ambos bordes de la franja del itinerario).
function tornClip(teeth = 16, amp = 6) {
  const top = [];
  for (let i = 0; i <= teeth; i++) {
    const x = ((i / teeth) * 100).toFixed(2);
    const y = i % 2 === 0 ? 0 : amp + (i % 3 === 0 ? 2 : 0);
    top.push(`${x}% ${y}%`);
  }
  const bottom = [];
  for (let i = teeth; i >= 0; i--) {
    const x = ((i / teeth) * 100).toFixed(2);
    const y = i % 2 === 0 ? 100 : 100 - amp - (i % 3 === 0 ? 2 : 0);
    bottom.push(`${x}% ${y}%`);
  }
  return `polygon(${top.concat(bottom).join(",")})`;
}

// --- Iconos de línea dibujados a mano (badges del itinerario, vestimenta, confirmación) ---
const churchIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2.5l1.7 2M12 2.5v3M9 9h6M7 21V11l5-4 5 4v10M7 21h10M10 21v-5h4v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const plateIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="7.6" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="3.3" stroke="currentColor" stroke-width="1.1"/></svg>`;
const danceIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="8.2" cy="5" r="1.6" fill="currentColor"/><circle cx="15.8" cy="5" r="1.6" fill="currentColor"/><path d="M8.2 8c-1.6 1-2.4 2.7-2 4.6l1 5.4M8.2 8c1 1 1.6 2.2 1.7 3.6M15.8 8c1.6 1 2.4 2.7 2 4.6l-1 5.4M15.8 8c-1 1-1.6 2.2-1.7 3.6M9.9 11.6c1.2 1 2.9 1 4.2-.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const suitIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 4l4 3.2 4-3.2M6.5 21V8.3l2-2.3h1.7L12 9l1.8-3h1.7l2 2.3V21" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v12" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`;
const dressIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="4.2" r="1.5" stroke="currentColor" stroke-width="1"/><path d="M12 5.7v3.3M9.3 9h5.4l2.8 11.5H6.5L9.3 9z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const waIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3.2a8.8 8.8 0 00-7.5 13.4L3.2 20.8l4.4-1.4A8.8 8.8 0 1012 3.2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8.7 9.4c.3-.6.5-.6.8-.6h.5c.2 0 .3 0 .5.4.2.4.7 1.5.7 1.7s0 .3-.1.4c-.1.2-.3.3-.4.5-.2.1-.3.3-.1.5.2.4.8 1.3 1.7 2 1.2 1 2 1.2 2.3 1.4.2.1.4 0 .5-.1.2-.2.6-.6.7-.8.2-.2.3-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .4-.2 1.1-.5 1.4-.4.4-1.2.7-1.9.6-1.2-.1-2.9-.6-4.8-2.3-2.3-2-2.8-3.6-2.9-3.9-.1-.3-.5-1.1-.5-1.8 0-.8.4-1.2.6-1.4z" fill="currentColor"/></svg>`;

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#a9825a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd5");
  const gal = galleryWidget(d.galeria, "gal5");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechaObj = d.fecha ? new Date(`${d.fecha}T00:00:00`) : null;
  const diaSemana = fechaObj && !isNaN(fechaObj) ? dias[fechaObj.getDay()] : "";
  const diaNum = fechaObj && !isNaN(fechaObj) ? String(fechaObj.getDate()).padStart(2, "0") : "--";
  const mesNombre = fechaObj && !isNaN(fechaObj) ? meses[fechaObj.getMonth()] : "";
  const anio = fechaObj && !isNaN(fechaObj) ? fechaObj.getFullYear() : "";

  const mapaBtn = d.direccionMapa
    ? `<a class="btn-outline" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>`
    : "";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --cream:#fffaf3; --paper:#fdf5ea; --blush:#f4ddd2; --rose:#d9a988;
    --gold:${accent}; --sage:#8a9b6f; --brown:#4a3c32; --muted:#8a7a6c;
    --beige:#f1e5d5; --line:#e5d6c6;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;font-family:'Playfair Display',Georgia,serif;background:#c9a988;color:var(--brown);overflow-x:hidden;}
  .card{max-width:560px;margin:0 auto;background:var(--cream);position:relative;box-shadow:0 0 60px rgba(0,0,0,.25);}
  .script{font-family:'Alex Brush',cursive;color:var(--gold);line-height:1;}
  .label{font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.2em;font-size:.7rem;color:var(--muted);}
  section{max-width:480px;margin:0 auto;padding:44px 28px;position:relative;}
  .center{text-align:center;}
  h2.section-title{font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.25em;font-weight:500;font-size:.85rem;color:var(--brown);margin:0 0 22px;text-align:center;}
  .floral{position:absolute;pointer-events:none;z-index:2;}
  .divider{display:flex;justify-content:center;margin:26px 0;}

  /* HERO */
  .hero{position:relative;background:linear-gradient(180deg,var(--blush) 0%,var(--cream) 70%);padding:54px 24px 30px;text-align:center;overflow:hidden;}
  .hero .floral.tl{top:-10px;left:-16px;}
  .hero .floral.tr{top:-10px;right:-16px;}
  .hero .tiara{width:clamp(90px,26vw,120px);margin:10px auto 8px;display:block;}
  .hero .label{color:var(--gold);}
  .hero h1{font-weight:400;text-transform:uppercase;letter-spacing:.18em;font-size:clamp(1.6rem,7vw,2.3rem);margin:.3em 0 0;color:var(--brown);}

  /* PHOTO */
  .photo-wrap{position:relative;width:100%;padding-bottom:118%;overflow:hidden;
    clip-path:polygon(0 0,100% 0,100% 90%,94% 95%,88% 91%,82% 96%,76% 92%,70% 97%,64% 93%,58% 98%,52% 94%,46% 99%,40% 94%,34% 98%,28% 93%,22% 97%,16% 92%,10% 96%,4% 91%,0 95%);
  }
  .photo-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .photo-section{position:relative;}
  .photo-section .floral.bl{bottom:-6px;left:-18px;z-index:3;}

  /* MENSAJE */
  .mensaje p{font-style:italic;line-height:1.9;color:var(--brown);font-size:1rem;margin:0 0 28px;}
  .name-script{font-size:clamp(2.4rem,11vw,3.4rem);margin:0 0 20px;}
  .padres-block{font-family:'Poppins',sans-serif;font-size:.8rem;letter-spacing:.05em;line-height:2.1;color:var(--brown);}
  .padres-block .lbl{text-transform:uppercase;letter-spacing:.2em;font-size:.68rem;color:var(--muted);display:block;margin-top:14px;}
  .padres-block .names{font-style:italic;color:var(--gold);font-weight:600;}
  .heart{color:var(--gold);font-size:1.3rem;margin:22px 0;}
  .month{font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.3em;font-size:.85rem;color:var(--brown);text-align:center;margin-bottom:14px;}
  .date-box{display:flex;align-items:stretch;justify-content:center;margin:0 auto 8px;max-width:280px;border-top:1px solid var(--rose);border-bottom:1px solid var(--rose);padding:14px 0;}
  .date-box .db-col{flex:1;position:relative;display:flex;align-items:center;justify-content:center;padding:0 10px;}
  .date-box .db-col + .db-col::before{content:"";position:absolute;left:0;top:4px;bottom:4px;width:1px;background:var(--line);}
  .date-box .dow, .date-box .yr{font-family:'Poppins',sans-serif;font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}
  .date-box .day{font-size:2.5rem;color:var(--gold);font-family:'Playfair Display',serif;line-height:1;}

  /* INFO CARDS (ceremonia / recepcion) */
  .info-card{text-align:center;background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:24px 20px;margin:18px 0;}
  .info-card .ev-label{font-family:'Poppins',sans-serif;font-weight:600;letter-spacing:.15em;text-transform:uppercase;font-size:.8rem;color:var(--brown);margin-bottom:6px;}
  .info-card .ev-time{font-size:1.5rem;color:var(--gold);margin:4px 0;}
  .info-card .ev-place{font-family:'Poppins',sans-serif;font-size:.9rem;}
  .info-card .ev-city{font-style:italic;color:var(--muted);font-size:.8rem;margin-bottom:14px;}
  .btn-outline{display:inline-block;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.15em;font-size:.75rem;font-weight:500;background:var(--beige);color:var(--brown);border:1px solid var(--rose);padding:12px 22px;border-radius:2px;text-decoration:none;transition:background .2s;}
  .btn-outline:hover{background:var(--rose);color:#fff;}

  /* ITINERARIO */
  .itinerary-wrap{background:var(--paper);position:relative;padding:64px 28px;}
  .timeline{max-width:420px;margin:0 auto;display:flex;flex-direction:column;gap:26px;position:relative;}
  .timeline::before{content:"";position:absolute;left:21px;top:22px;bottom:22px;border-left:2px dotted var(--rose);opacity:.7;}
  .tl-item{display:flex;align-items:center;gap:16px;font-family:'Poppins',sans-serif;position:relative;}
  .tl-item .ico{width:44px;height:44px;border-radius:50%;background:var(--paper);border:1px solid var(--rose);display:flex;align-items:center;justify-content:center;color:var(--rose);flex-shrink:0;position:relative;z-index:1;}
  .tl-item .ico svg{width:20px;height:20px;}
  .tl-item .txt{flex:1;}
  .tl-item .txt b{display:block;letter-spacing:.15em;text-transform:uppercase;font-size:.85rem;color:var(--brown);}
  .tl-item .txt span{font-size:.8rem;color:var(--muted);}
  .tl-item .hora{color:var(--gold);font-size:1rem;white-space:nowrap;}

  /* COUNTDOWN */
  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
  .countdown div{text-align:center;min-width:56px;}
  .cd-num{font-size:1.9rem;color:var(--gold);display:block;font-family:'Playfair Display',serif;}
  .cd-label{font-family:'Poppins',sans-serif;font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);}

  /* CONFIRMACION */
  .confirm-wrap{text-align:center;}
  .confirm-wrap .icon-circle{width:56px;height:56px;border-radius:50%;background:var(--paper);border:1px solid var(--rose);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--sage);}
  .confirm-wrap .icon-circle svg{width:26px;height:26px;}
  .confirm-wrap p{font-family:'Poppins',sans-serif;font-size:.85rem;color:var(--muted);max-width:280px;margin:0 auto 20px;line-height:1.6;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;text-align:left;max-width:360px;margin:0 auto;font-family:'Poppins',sans-serif;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px;border:1px solid var(--line);border-radius:2px;margin-top:4px;width:100%;background:#fff;color:var(--brown);}
  .rsvp-form button{background:var(--gold);color:#fff;border:0;padding:13px;border-radius:2px;cursor:pointer;text-transform:uppercase;letter-spacing:.15em;font-size:.78rem;margin-top:6px;}
  .rsvp-form button:hover{background:var(--rose);}
  .rsvp-whatsapp{display:inline-block;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.15em;font-size:.75rem;font-weight:500;background:var(--beige);color:var(--brown);border:1px solid var(--rose);padding:12px 22px;border-radius:2px;text-decoration:none;margin-bottom:22px;}
  .rsvp-status{font-weight:bold;color:var(--sage);font-family:'Poppins',sans-serif;font-size:.85rem;margin-top:10px;display:block;}

  .dresscode{margin-top:36px;}
  .dresscode .ico-row{display:flex;justify-content:center;gap:22px;margin-bottom:8px;color:var(--rose);}
  .dresscode .ico-row svg{width:26px;height:26px;}
  .dresscode .lbl{font-family:'Poppins',sans-serif;letter-spacing:.2em;text-transform:uppercase;font-size:.75rem;color:var(--brown);font-weight:600;}
  .dresscode .val{font-family:'Poppins',sans-serif;letter-spacing:.1em;text-transform:uppercase;font-size:.8rem;color:var(--muted);margin-top:4px;}
  .te-esperamos{font-size:clamp(1.8rem,7vw,2.4rem);margin-top:34px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
  .gallery-item{position:relative;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--line);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,20,15,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  footer{text-align:center;padding:36px 20px 44px;font-family:'Poppins',sans-serif;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);background:var(--paper);}

  @media(max-width:380px){
    section{padding:36px 18px;}
    .floral{transform:scale(.8);}
  }

  /* Lluvia sutil de pétalos en el hero + leve balanceo de los ramos florales */
  .petals{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
  .petal{position:absolute;top:-8%;width:15px;color:var(--rose);opacity:0;
    animation:petal-fall 12s ease-in-out infinite;}
  .petal svg{width:100%;height:auto;display:block;}
  .petal.p1{left:8%; width:12px; color:#e7c6ac; animation-duration:11.5s; animation-delay:.4s;}
  .petal.p2{left:27%;width:16px; color:#d9a988; animation-duration:13s;   animation-delay:2.6s;}
  .petal.p3{left:50%;width:11px; color:#f0dcc9; animation-duration:10.5s;animation-delay:5s;}
  .petal.p4{left:70%;width:15px; color:#e7c6ac; animation-duration:14s;  animation-delay:1.6s;}
  .petal.p5{left:89%;width:13px; color:#d9a988; animation-duration:9.5s; animation-delay:4s;}

  @keyframes petal-fall{
    0%{opacity:0;transform:translateY(0) translateX(0) rotate(0deg);}
    10%{opacity:.75;}
    50%{transform:translateY(120px) translateX(8px) rotate(90deg);}
    88%{opacity:.5;}
    100%{opacity:0;transform:translateY(255px) translateX(-6px) rotate(180deg);}
  }
  @keyframes sway{
    0%,100%{transform:rotate(-2deg);}
    50%{transform:rotate(2deg);}
  }
  .floral{animation:sway 9s ease-in-out infinite;transform-origin:50% 30%;}
  .hero .floral.tl{animation-delay:.3s;}
  .hero .floral.tr{animation-delay:1.8s;}
  .photo-section .floral.bl{animation-delay:1s;}
  .divider .sprig{animation:sway 8s ease-in-out infinite;transform-origin:50% 50%;}

  @media (prefers-reduced-motion: reduce){
    .petal{display:none;}
    .floral,.divider .sprig{animation:none;}
  }
</style></head>
<body>
<div class="card">

  <div class="hero">
    <div class="petals" aria-hidden="true">
      <span class="petal p1">${petal()}</span>
      <span class="petal p2">${petal()}</span>
      <span class="petal p3">${petal()}</span>
      <span class="petal p4">${petal()}</span>
      <span class="petal p5">${petal()}</span>
    </div>
    <span class="floral tl">${roseCluster({ w: 120 })}</span>
    <span class="floral tr">${roseCluster({ w: 120, flip: true })}</span>
    <span class="label">Mis quince años</span>
    <svg class="tiara" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 50 L14 20 L32 38 L45 12 L60 34 L75 12 L88 38 L106 20 L112 50 Z" fill="none" stroke="#b7ab9c" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="16" r="4" fill="#b7ab9c"/>
      <line x1="8" y1="50" x2="112" y2="50" stroke="#b7ab9c" stroke-width="3"/>
    </svg>
    <h1>Mis XV Años</h1>
  </div>

  <div class="photo-section">
    <div class="photo-wrap"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}"></div>
    <span class="floral bl">${roseCluster({ w: 130, flop: true })}</span>
  </div>

  <section class="mensaje center">
    ${d.mensaje ? `<p>${esc(d.mensaje)}</p>` : ""}
    <div class="name-script script">${esc(d.nombre)}</div>
    <div class="padres-block">
      ${d.padres ? `<span>Con la bendición de Dios y mis padres</span>
      <span class="names">${esc(d.padres)}</span>` : ""}
      <span class="lbl">Tengo el honor de invitarte a celebrar</span>
      <b>Mis XV Años</b>
    </div>
    <div class="heart">&#10084;</div>
    <div class="month">${esc(mesNombre)}</div>
    <div class="date-box">
      <div class="db-col"><span class="dow">${esc(diaSemana)}</span></div>
      <div class="db-col"><span class="day">${esc(diaNum)}</span></div>
      <div class="db-col"><span class="yr">${esc(String(anio))}</span></div>
    </div>

    ${(d.horaCeremonia || d.lugarCeremonia) ? `
    <div class="info-card">
      <div class="ev-label">Ceremonia</div>
      ${d.horaCeremonia ? `<div class="ev-time">${esc(d.horaCeremonia)}</div>` : ""}
      ${d.lugarCeremonia ? `<div class="ev-place">${esc(d.lugarCeremonia)}</div>` : ""}
      <div class="ev-city">Los espero</div>
      ${mapaBtn}
    </div>` : ""}
  </section>

  ${(d.horaFiesta || d.lugarFiesta) ? `
  <section class="center">
    <div class="info-card">
      <div class="ev-label">Recepción</div>
      ${d.horaFiesta ? `<div class="ev-time">${esc(d.horaFiesta)}</div>` : ""}
      ${d.lugarFiesta ? `<div class="ev-place">${esc(d.lugarFiesta)}</div>` : ""}
      ${mapaBtn}
    </div>
  </section>` : ""}

  <div class="itinerary-wrap" style="clip-path:${tornClip(16, 6)}">
    <span class="floral bl" style="position:absolute;bottom:-10px;left:-18px;">${roseCluster({ w: 110, flop: true })}</span>
    <h2 class="section-title">Itinerario de actividades</h2>
    <div class="timeline">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `
      <div class="tl-item">
        <div class="ico">${churchIcon}</div>
        <div class="txt"><b>Ceremonia</b>${d.lugarCeremonia ? `<span>${esc(d.lugarCeremonia)}</span>` : ""}</div>
        ${d.horaCeremonia ? `<div class="hora">${esc(d.horaCeremonia)}</div>` : ""}
      </div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `
      <div class="tl-item">
        <div class="ico">${plateIcon}</div>
        <div class="txt"><b>Recepción</b>${d.lugarFiesta ? `<span>${esc(d.lugarFiesta)}</span>` : ""}</div>
        ${d.horaFiesta ? `<div class="hora">${esc(d.horaFiesta)}</div>` : ""}
      </div>` : ""}
      <div class="tl-item">
        <div class="ico">${danceIcon}</div>
        <div class="txt"><b>Baile y celebración</b><span>Toda la noche</span></div>
      </div>
    </div>
  </div>

  <section class="center">
    <h2 class="section-title">Cuenta regresiva</h2>
    ${cd.html}
  </section>

  ${(d.galeria && d.galeria.length) ? `
  <section class="center">
    <h2 class="section-title">Momentos</h2>
    ${gal.html}
  </section>` : ""}

  <section class="confirm-wrap">
    <div class="icon-circle">${waIcon}</div>
    <div class="ev-label" style="font-family:'Poppins',sans-serif;font-weight:600;letter-spacing:.15em;text-transform:uppercase;">Confirmación</div>
    <p>Por favor confirma tu asistencia lo antes posible</p>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}

    ${d.dressCode ? `
    <div class="dresscode">
      <div class="ico-row">${suitIcon}${dressIcon}</div>
      <div class="lbl">Vestimenta</div>
      <div class="val">${esc(d.dressCode)}</div>
    </div>` : ""}

    <div class="te-esperamos script">¡Te esperamos!</div>
    <div class="divider">${sprig(90)}</div>
  </section>

  <footer>Con cariño, ${esc(d.nombre)} &#127804;</footer>

</div>
<script>
${cd.script}${gal.script}${rsvp.script}
</script>
${tadiFooterWidget()}
</body></html>`;
}

// Miniatura para la grilla del catálogo. Estilos 100% inline (no depende
// de site.css) y sin las tipografías de Google Fonts del diseño real
// (la página de catálogo no las carga), así que usamos stacks de
// respaldo serif/cursive equivalentes.
function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:linear-gradient(160deg,#f4ddd2 0%,#fdf5ea 55%,#fffaf3 100%);overflow:hidden;">
    <span style="position:absolute;top:-16px;left:-16px;opacity:.9;">${roseCluster({ w: 60 })}</span>
    <span style="position:absolute;bottom:-18px;right:-18px;opacity:.9;">${roseCluster({ w: 60, flip: true, flop: true })}</span>
    <svg width="32" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:relative;z-index:1;">
      <path d="M8 50 L14 20 L32 38 L45 12 L60 34 L75 12 L88 38 L106 20 L112 50 Z" fill="none" stroke="#a9825a" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="60" cy="16" r="5" fill="#a9825a"/>
      <line x1="8" y1="50" x2="112" y2="50" stroke="#a9825a" stroke-width="4"/>
    </svg>
    <span style="position:relative;z-index:1;font-family:Georgia,'Times New Roman',serif;font-size:.56rem;letter-spacing:3px;text-transform:uppercase;color:#a9825a;">Mis XV años</span>
    <span style="position:relative;z-index:1;font-family:'Segoe Script','Brush Script MT',cursive,Georgia,serif;font-style:italic;font-size:1.55rem;color:#6b5a4a;">${esc(d.name)}</span>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Bohemio Floral",
  summary: "Invitación boho romántica en tonos crema, blush y dorado, con rosas dibujadas a mano, tipografía caligráfica y bordes de papel rasgado.",
  accent: "#a9825a", accent2: "#8a9b6f", schema: xvSchema, sampleData, render, cardPreview,
};
