// Íconos de línea simples y sin ambigüedad para las tarjetas "TaDi" — uno
// por categoría. A propósito son formas muy estándar/reconocibles (no
// dibujos "creativos" propios) para evitar que a un tamaño chico se lean
// como otra cosa. Usan stroke="currentColor" para heredar el color del
// contenedor (funciona tanto en el círculo de la sección "El gran día"
// como en el thumbnail del catálogo).
const rings = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="14" r="5.5"/><circle cx="15" cy="14" r="5.5"/></svg>`;

const calendar = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><circle cx="12" cy="14" r="1.8" fill="currentColor" stroke="none"/></svg>`;

const partyHat = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l6 15H6Z"/><path d="M6 18l1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1"/><circle cx="12" cy="3" r="1.3" fill="currentColor" stroke="none"/></svg>`;

const crown = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18h16l-1.2-8-3.3 3-3.5-5-3.5 5-3.3-3Z"/><circle cx="8" cy="9" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r=".9" fill="currentColor" stroke="none"/><circle cx="16" cy="9" r=".9" fill="currentColor" stroke="none"/></svg>`;

const cake = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 21l1-7h14l1 7Z"/><path d="M4 21h16"/><path d="M7 14c0-4 1.5-6 1.5-9M12 14c0-4 1.5-6 1.5-9M17 14c0-4 1-6 1-9"/><circle cx="8.5" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="13.5" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="5" r="1" fill="currentColor" stroke="none"/></svg>`;

const droplet = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c-4 4-6.5 7.5-6.5 10.5a6.5 6.5 0 0 0 13 0C18.5 10.5 16 7 12 3Z"/></svg>`;

const pumpkin = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5c1-1 4-1 5 0"/><path d="M4 13c0-4 3.5-7 8-7s8 3 8 7-3.5 7-8 7-8-3-8-7Z"/><path d="M8 8v10M12 7v11M16 8v10"/></svg>`;

const tree = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2l4 6H8Z"/><path d="M12 8l5 7H7Z"/><path d="M12 15l6 6H6Z"/><path d="M12 21v-3"/></svg>`;

module.exports = { rings, calendar, partyHat, crown, cake, droplet, pumpkin, tree };
