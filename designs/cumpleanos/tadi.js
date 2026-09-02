const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { cumpleanosSchema } = require("../schemas");

const id = "cum-tadi";
const ACCENT = "#f2b84b";
const ACCENT2 = "#c98f1f";
const AURORA_A = "#f2b84b";
const AURORA_B = "#ff9c6b";

const sampleData = {
  nombre: "Fede", edad: "40",
  fecha: "2027-05-08", hora: "21:00", lugar: "Terraza Palermo",
  direccionMapa: "https://maps.google.com/?q=Terraza+Palermo",
  mensaje: "Después de tantos años, hay que festejarlo como corresponde. ¡Los espero para brindar!",
  dressCode: "Casual elegante",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-05-01",
  coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
  galeria: [],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent2 = getPaletteColor(d.colorPalette, "light", ACCENT2);
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
  const inicial = (d.nombre || "?").trim().charAt(0).toUpperCase();
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "cumpleanos", datos: d }) };

  const eventCards = [];
  if (d.hora || d.lugar) eventCards.push({ icon: icons.cake, label: "El festejo", time: d.hora, place: d.lugar });

  const chips = [];
  if (d.dressCode) chips.push({ html: `Dress code <b>${esc(d.dressCode)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "cumpleanos", group: "playful",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "A celebrar", monogram: inicial,
    titleHtml: d.edad ? `${esc(d.nombre)} <em>cumple ${esc(d.edad)}</em>` : esc(d.nombre),
    subLine: "¡Los espero para brindar!",
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventHeading: "El festejo", eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: `¡Nos vemos ahí! ${esc(d.nombre)}`,
    coverTitle: `Cumpleaños de ${d.nombre}`,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "A celebrar",
    group: "playful", iconSvg: icons.cake, catLabel: "Cumpleaños",
    darkFrom: "#8a6a20", darkTo: "#241d0c",
  });
}

module.exports = {
  id, category: "cumpleanos", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: aurora animada dorada, neomorfismo premium con tipografía redonda y buena onda, para cumpleaños.",
  accent: ACCENT, accent2: "#241d0c", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
