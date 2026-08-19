# TaDi — prototipo funcional

Sitio de invitaciones digitales interactivas por categoría (bodas, XV años,
eventos empresariales), con catálogo ampliable, pago con Mercado Pago y
edición de datos después de pagar. Pensado para validar el producto antes
de invertir en una versión productiva.

## Qué incluye este prototipo

- **Catálogo** (`/`) con 9 diseños de muestra: 3 para bodas, 3 para XV años
  y 3 para eventos empresariales. Cada uno tiene una estructura y set de
  funciones distinto (cronograma, acordeón, pestañas, carrusel, trivia,
  buscador de mesa, agenda + oradores, QR de acceso, etc.), no son el mismo
  molde con otro color.
- **Demo en vivo de cada diseño** (`/demo/:id`) con datos de ejemplo.
- **Checkout** (`/checkout/:id`) con el precio actual y botón "Pagar con
  Mercado Pago".
- **Pago**: si no hay credenciales de Mercado Pago cargadas, el pago se
  simula como aprobado al instante (modo demo) para poder probar todo el
  flujo. Si se cargan las credenciales reales, se crea una Preferencia real
  de Checkout Pro y se cobra de verdad.
- **Editor post-pago** (`/editar/:token`) con vista previa en vivo en pantalla
  dividida: se cargan los datos del evento (nombres, fecha, lugar, fotos,
  mensaje, etc.) y se ve la tarjeta actualizarse al instante.
- **Página pública de la invitación** (`/invitacion/:slug`), la tarjeta final
  que se comparte con los invitados, con RSVP funcional.
- **Panel de confirmaciones** (`/editar/:token/invitados`) para que el
  comprador vea quién confirmó.

## Cómo probarlo

```bash
npm install
node server.js
```

Abrir `http://localhost:3000`. El flujo completo:
catálogo → "Ver demo" o "Elegir" → checkout → pago (simulado) → editor →
"Guardar cambios" → copiar el link público y abrirlo.

## Cómo sumar un diseño nuevo (catálogo que crece con el tiempo)

1. Crear un archivo en `designs/<categoria>/<nombre-del-diseño>.js` copiando
   la estructura de cualquiera de los existentes (exporta `id`, `category`,
   `name`, `summary`, `accent`, `schema`, `sampleData` y una función
   `render(data)` que devuelve el HTML completo de la tarjeta).
2. Agregarlo a la lista en `designs/index.js`.
3. Listo — aparece automáticamente en el catálogo, en el checkout y es
   compatible con el editor y el pago.

Para agregar una categoría nueva (por ejemplo cumpleaños, baby shower),
alcanza con sumarla al array `categories` en `designs/index.js` y crear
sus diseños con el mismo patrón.

## Cómo pasar a producción

1. **Mercado Pago real**: crear una cuenta de Mercado Pago (Negocio), ir a
   *Tus integraciones → Credenciales de producción* y copiar el
   **Access Token**. Definir las variables de entorno:
   ```
   MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
   PUBLIC_BASE_URL=https://tudominio.com
   ```
   Con eso, el checkout deja de simular el pago y usa Checkout Pro real
   (`mercadopago.js` ya tiene toda la integración escrita, incluida la
   verificación del pago contra la API antes de dar acceso al editor, y el
   webhook en `/webhook/mercadopago`).
2. **Base de datos**: este prototipo guarda todo en `data/db.json` (un
   archivo). Para producción conviene migrarlo a Postgres/MySQL/SQLite —
   las funciones `getDB()`/`saveDB()` de `db.js` son el único lugar que
   habría que reemplazar.
3. **Imágenes**: hoy se guardan en `public/uploads`. Para producción
   conviene subirlas a un storage (S3, Cloudinary, etc.) en vez del disco
   del servidor.
4. **Precio**: se controla con la variable de entorno `PRICE_ARS` (por
   defecto $14.900, según la recomendación del informe de mercado adjunto).
   Se puede pasar a un esquema de 3 planes editando `checkout/:id` y el
   catálogo.
5. **Hosting**: cualquier servicio que corra Node.js (Railway, Render,
   Fly.io, un VPS, etc.) + un dominio propio.
6. **Dominio del negocio**: registrar el dominio elegido y sumar RSVP por
   WhatsApp real (ya está contemplado en el esquema de cada diseño, campo
   `whatsapp`/`contacto`).

## Estructura del proyecto

```
server.js              → rutas del sitio (catálogo, checkout, pago, editor, RSVP)
mercadopago.js          → integración con Mercado Pago (modo demo + real)
db.js                   → "base de datos" en JSON (reemplazable por una real)
designs/
  widgets.js             → piezas reutilizables (countdown, galería, RSVP)
  schemas.js              → campos del editor por categoría
  index.js                 → catálogo de diseños y categorías
  bodas/                    → 3 diseños de boda
  xv/                        → 3 diseños de XV años
  empresariales/               → 3 diseños de eventos empresariales
public/css/site.css      → estilos del catálogo, checkout y editor
data/db.json              → datos del prototipo (órdenes, invitaciones, RSVPs)
```

## Nota sobre las fotos de ejemplo

Los diseños de muestra usan fotos de stock (Unsplash) sólo para la demo.
Si alguna no carga (por bloqueo de red del lugar donde se lo abra), se
reemplaza automáticamente por un cuadro gris con la palabra "Foto" en vez
de mostrar el ícono de imagen rota. En el editor real, cada comprador sube
sus propias fotos.
