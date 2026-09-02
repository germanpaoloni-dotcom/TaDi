const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { halloweenSchema } = require("../schemas");

const id = "hall-tadi";
const ACCENT = "#8a5cb8";
const ACCENT2 = "#f2864b";
const AURORA_A = "#8a5cb8";
const AURORA_B = "#f2864b";

const sampleData = {
  nombre: "Noche de Brujas en lo de los Fernández",
  fecha: "2027-10-31", hora: "20:00", lugar: "Casa de los Fernández",
  direccionMapa: "https://maps.google.com/?q=Casa+Fernandez",
  mensaje: "Disfraz obligatorio, buena onda y sustos garantizados. ¡No falten!",
  disfraz: "Terror clásico (nada de sangre de verdad, por favor)",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-10-24",
  coverImage: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&q=80",
  galeria: [],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent2 = getPaletteColor(d.colorPalette, "dark", ACCENT2);
  let fechaNum = "", fechaDia = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
        fechaNum = `${partes[2]} · ${partes[1]} · ${partes[0]}`;
        fechaDia = dias[dt.getDay()];
      }
    }
  }
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "halloween", datos: d }) };

  const eventCards = [];
  if (d.hora || d.lugar) eventCards.push({ icon: icons.pumpkin, label: "La fiesta", time: d.hora, place: d.lugar });

  const chips = [];
  if (d.disfraz) chips.push({ html: `🎭 <b>${esc(d.disfraz)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "halloween", group: "spooky",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "Trick or treat", monogram: "🎃",
    titleHtml: `<em>${esc(d.nombre)}</em>`,
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventHeading: "La fiesta", eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: "¡Te esperamos... si te animás! 🦇",
    coverTitle: d.nombre,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "Trick or treat",
    group: "spooky", iconSvg: icons.pumpkin, catLabel: "Halloween",
    darkFrom: "#241534", darkTo: "#0c0714",
  });
}

module.exports = {
  id, category: "halloween", name: "TaDi",
  summary: "La tarjeta de marca de TaDi, versión oscura y misteriosa: aurora animada violeta y naranja sobre neomorfismo oscuro, para Halloween.",
  accent: ACCENT, accent2: "#0c0714", schema: halloweenSchema, sampleData, render, cardPreview,
};
