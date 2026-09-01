// Genera el Excel de "Confirmaciones" que el organizador puede bajar desde
// su Panel de tu evento (pestaña Confirmaciones) — combina las del link
// general y las de invitados con link personal (mismo criterio que ya usa
// el panel de administrador, ver allConfirmaciones() en server.js) en una
// sola planilla con el diseño de marca de TaDi, no una tabla cruda.
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const INK = "FF33363F";
const ACCENT = "FFFF7A3D";
const ACCENT_2 = "FFE8672E";
const MUTED = "FF6D7280";
const BG = "FFEAEEF2";
const WHITE = "FFFFFFFF";
const SI_FILL = "FFE3F5E9";
const SI_TEXT = "FF1F8A4C";
const NO_FILL = "FFFCE9E9";
const NO_TEXT = "FFC0392B";

const LOGO_PATH = path.join(__dirname, "public/img/logo/tadi-logo-dark-bg.png");
const MENU_LABELS = { clasico: "Clásico", vegetariano: "Vegetariano", vegano: "Vegano", celiaco: "Sin TACC" };

function fmtFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// confirmaciones: array de { nombre, asiste, cantidad, menu, mensaje, origen, fecha }
// (misma forma que arma allConfirmaciones() en server.js).
async function buildConfirmacionesWorkbook({ eventoTitulo, confirmaciones }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "TaDi";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Confirmaciones", {
    views: [{ state: "frozen", ySplit: 7, showGridLines: false }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  const cols = [
    { header: "Invitado", key: "nombre", width: 30 },
    { header: "Asiste", key: "asiste", width: 12 },
    { header: "Personas", key: "cantidad", width: 12 },
    { header: "Menú", key: "menu", width: 16 },
    { header: "Mensaje", key: "mensaje", width: 42 },
    { header: "Cómo confirmó", key: "origen", width: 16 },
    { header: "Fecha de confirmación", key: "fecha", width: 22 },
  ];
  sheet.columns = cols.map((c) => ({ key: c.key, width: c.width }));
  const lastColLetter = String.fromCharCode(64 + cols.length); // 7 cols -> "G"

  // --- Fila 1: franja oscura con el logo (misma que el pie de marca de las
  // tarjetas: logo claro sobre fondo oscuro, look consistente con el resto
  // de TaDi). ---
  sheet.mergeCells(`A1:${lastColLetter}1`);
  sheet.getRow(1).height = 40;
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
  if (fs.existsSync(LOGO_PATH)) {
    const imgId = wb.addImage({ filename: LOGO_PATH, extension: "png" });
    sheet.addImage(imgId, { tl: { col: 0.15, row: 0.18 }, ext: { width: 108, height: 48 } });
  }

  // --- Fila 2: título del evento. Fila 3: metadata (generado el ..., total). ---
  sheet.mergeCells("A2:G2");
  const tituloCell = sheet.getCell("A2");
  tituloCell.value = `Confirmaciones — ${eventoTitulo}`;
  tituloCell.font = { name: "Calibri", size: 15, bold: true, color: { argb: INK } };
  sheet.getRow(2).height = 24;

  const totalPersonas = confirmaciones
    .filter((c) => c.asiste !== "no")
    .reduce((sum, c) => sum + (Number(c.cantidad) || 1), 0);
  const totalSi = confirmaciones.filter((c) => c.asiste !== "no").length;
  sheet.mergeCells("A3:G3");
  const metaCell = sheet.getCell("A3");
  metaCell.value = `${totalSi} de ${confirmaciones.length} confirmaron que van · ${totalPersonas} persona(s) en total · generado el ${fmtFecha(new Date().toISOString())}`;
  metaCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: MUTED } };
  sheet.getRow(3).height = 16;

  sheet.getRow(4).height = 6; // espaciador

  // --- Fila 5 (índice real de encabezados; ySplit=7 más abajo lo tiene en
  // cuenta): encabezados de columna, fondo naranja de marca. ---
  const headerRowIdx = 5;
  const headerRow = sheet.getRow(headerRowIdx);
  cols.forEach((c, i) => { headerRow.getCell(i + 1).value = c.header; });
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ACCENT } };
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: WHITE } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: ACCENT_2 } } };
  });
  headerRow.height = 20;
  sheet.autoFilter = { from: { row: headerRowIdx, column: 1 }, to: { row: headerRowIdx, column: cols.length } };

  // --- Filas de datos, con sombreado alternado y la columna "Asiste"
  // resaltada en verde/rojo como una etiqueta de estado. ---
  confirmaciones.forEach((c, i) => {
    const r = sheet.getRow(headerRowIdx + 1 + i);
    r.getCell(1).value = c.nombre || "—";
    r.getCell(2).value = c.asiste === "no" ? "No asiste" : "Asiste";
    r.getCell(3).value = c.cantidad ? Number(c.cantidad) || c.cantidad : "";
    r.getCell(4).value = c.menu ? (MENU_LABELS[c.menu] || c.menu) : "";
    r.getCell(5).value = c.mensaje || "";
    r.getCell(6).value = c.origen || "";
    r.getCell(7).value = fmtFecha(c.fecha);

    const zebra = i % 2 === 1;
    r.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: "Calibri", size: 10.5, color: { argb: INK } };
      cell.alignment = { vertical: "middle", wrapText: colNumber === 5 };
      cell.border = { bottom: { style: "hair", color: { argb: "FFD8DBE0" } } };
      if (zebra) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BG } };
    });
    const asisteCell = r.getCell(2);
    const si = c.asiste !== "no";
    asisteCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: si ? SI_FILL : NO_FILL } };
    asisteCell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: si ? SI_TEXT : NO_TEXT } };
    asisteCell.alignment = { vertical: "middle", horizontal: "center" };
  });

  if (!confirmaciones.length) {
    sheet.mergeCells(`A${headerRowIdx + 1}:G${headerRowIdx + 1}`);
    const emptyCell = sheet.getCell(`A${headerRowIdx + 1}`);
    emptyCell.value = "Todavía no hay confirmaciones.";
    emptyCell.font = { name: "Calibri", size: 10.5, italic: true, color: { argb: MUTED } };
  }

  // --- Pie: mismo criterio de marca que el zócalo de las tarjetas. ---
  const footerRowIdx = headerRowIdx + Math.max(confirmaciones.length, 1) + 2;
  sheet.mergeCells(`A${footerRowIdx}:G${footerRowIdx}`);
  const footerCell = sheet.getCell(`A${footerRowIdx}`);
  footerCell.value = "Generado con TaDi — tadi.com.ar";
  footerCell.font = { name: "Calibri", size: 9, color: { argb: MUTED } };

  return wb.xlsx.writeBuffer();
}

module.exports = { buildConfirmacionesWorkbook };
