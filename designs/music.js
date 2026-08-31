// Catálogo de música de fondo — pistas ambient instrumentales 100% propias
// (sintetizadas por código, no samples ni canciones de terceros), así el
// feature "música de fondo" del plan Plus/Premium no tiene ningún riesgo de
// copyright. Los archivos viven en /public/audio/<id>.mp3 y hacen loop.
//
// Se muestra al comprador como menú desplegable en el editor (solo si su
// plan tiene la feature "musica" — ver pricing.hasFeature).

const MUSIC_LIBRARY = [
  { id: "piano-suave", label: "Piano Suave", mood: "Elegante y cálido — bodas, bautismos" },
  { id: "cuerdas-calidas", label: "Cuerdas Cálidas", mood: "Romántico — bodas, save the date" },
  { id: "vals-brillante", label: "Vals Brillante", mood: "Festivo elegante — xv años" },
  { id: "realeza-dorada", label: "Realeza Dorada", mood: "Solemne y brillante — xv años" },
  { id: "acustico-alegre", label: "Acústico Alegre", mood: "Cálido y ameno — cumpleaños, bautismos" },
  { id: "fiesta-pop", label: "Fiesta Pop", mood: "Alegre y liviano — cumpleaños, infantiles" },
  { id: "aventura-juguetona", label: "Aventura Juguetona", mood: "Curioso y juguetón — infantiles" },
  { id: "mundo-magico", label: "Mundo Mágico", mood: "Encantado y dulce — infantiles" },
  { id: "brindis", label: "Brindis", mood: "Festivo y adulto — cumpleaños" },
  { id: "misterio-halloween", label: "Misterio", mood: "Misterioso y divertido — halloween" },
  { id: "navidad-dorada", label: "Navidad Dorada", mood: "Cálido y festivo — navidad" },
  { id: "minimal-elegante", label: "Minimal Elegante", mood: "Sobrio y sutil — save the date, bodas modernas" },
];

function getTrack(id) {
  return MUSIC_LIBRARY.find((t) => t.id === id) || null;
}

function trackUrl(id) {
  return `/static/audio/${id}.mp3`;
}

module.exports = { MUSIC_LIBRARY, getTrack, trackUrl };
