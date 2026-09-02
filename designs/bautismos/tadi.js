const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { bautismoSchema } = require("../schemas");

const id = "bau-tadi";
const ACCENT = "#8fb2c9";
const ACCENT2 = "#4f7f9c";
const AURORA_A = "#8fb2c9";
const AURORA_B = "#e8a2c0";

const sampleData = {
  nombreChico: "Danna Paola",
  padres: "Pablo Martínez y Luciana López",
  padrinos: "Marcos López y Sole Martínez",
  fecha: "2027-06-12", horaCeremonia: "11:00", lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "13:00", lugarFiesta: "Salón Los Nogales",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Nogales",
  mensaje: "Con inmensa alegría los invitamos a acompañarnos en el bautismo de nuestra hija.",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-06-01",
  coverImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80",
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
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "bautismos", datos: d }) };

  const eventCards = [];
  if (d.horaCeremonia || d.lugarCeremonia) eventCards.push({ icon: icons.droplet, label: "Ceremonia", time: d.horaCeremonia, place: d.lugarCeremonia });
  if (d.horaFiesta || d.lugarFiesta) eventCards.push({ icon: icons.droplet, label: "Fiesta", time: d.horaFiesta, place: d.lugarFiesta });

  const chips = [];
  if (d.padres) chips.push({ html: `Padres <b>${esc(d.padres)}</b>` });
  if (d.padrinos) chips.push({ html: `Padrinos <b>${esc(d.padrinos)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "bautismos", group: "elegante",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "Bautismo", monogram: inicial,
    titleHtml: esc(d.nombreChico),
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: "Con cariño, la familia",
    coverTitle: `Bautismo de ${d.nombreChico}`,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "Bautismo",
    group: "elegante", iconSvg: icons.droplet, catLabel: "Bautismos",
    darkFrom: "#3a5a70", darkTo: "#131c22",
  });
}

module.exports = {
  id, category: "bautismos", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: aurora animada celeste, neomorfismo premium y el mismo estilo de tadi.com.ar, para bautismos.",
  accent: ACCENT, accent2: "#131c22", schema: bautismoSchema, sampleData, render, cardPreview,
};
