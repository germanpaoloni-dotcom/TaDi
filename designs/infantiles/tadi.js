const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { infantilSchema } = require("../schemas");

const id = "inf-tadi";
const ACCENT = "#4fb3a9";
const ACCENT2 = "#2f8a7e";
const AURORA_A = "#4fb3a9";
const AURORA_B = "#f2c265";

const sampleData = {
  nombreChico: "Bruno", edad: "7",
  fecha: "2027-03-14", hora: "17:00", lugar: "Club San Fernando",
  direccionMapa: "https://maps.google.com/?q=Club+San+Fernando",
  mensaje: "¡Vení a festejar con nosotros! Va a haber juegos, torta y mucha diversión.",
  tematica: "Superhéroes (disfraz opcional)",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-03-07",
  coverImage: "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=1200&q=80",
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
  const inicial = (d.nombreChico || "?").trim().charAt(0).toUpperCase();
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "infantiles", datos: d }) };

  const eventCards = [];
  if (d.hora || d.lugar) eventCards.push({ icon: icons.partyHat, label: "La fiesta", time: d.hora, place: d.lugar });

  const chips = [];
  if (d.tematica) chips.push({ html: `🎨 <b>${esc(d.tematica)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "infantiles", group: "playful",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "¡A jugar!", monogram: inicial,
    titleHtml: d.edad ? `${esc(d.nombreChico)} <em>cumple ${esc(d.edad)}</em>` : esc(d.nombreChico),
    subLine: "¡Vení a festejar con nosotros!",
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventHeading: "La fiesta", eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: "¡Nos vemos en la fiesta! 🎉",
    coverTitle: `Cumple de ${d.nombreChico}`,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "¡A jugar!",
    group: "playful", iconSvg: icons.partyHat, catLabel: "Fiestas Infantiles",
    darkFrom: "#2f6a63", darkTo: "#122320",
  });
}

module.exports = {
  id, category: "infantiles", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: aurora animada, neomorfismo premium con tipografía redonda y colores bien alegres, para fiestas infantiles.",
  accent: ACCENT, accent2: "#122320", schema: infantilSchema, sampleData, render, cardPreview,
};
