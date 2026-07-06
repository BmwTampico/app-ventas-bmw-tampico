# Design

## Theme

Dos temas (oscuro por defecto, claro opcional), controlados con `body.theme-light` sobre las mismas variables CSS custom. Estilo: interfaz de trabajo oscura tipo "cockpit" — navy profundo de fondo, azul BMW como acento único, sin gradientes ni decoración.

## Color Palette

Definidas como CSS custom properties en `:root` (oscuro) y sobrescritas en `body.theme-light` (claro).

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `--navy` | `#0d1b2a` | `#f0f4f8` | Fondo de página |
| `--navy2` | `#1c2b3a` | `#e2eaf3` | Fondo secundario (inputs) |
| `--blue` | `#1c69d4` | `#1c69d4` | Acento primario (marca BMW) |
| `--blue2` | `#1a5fbf` | `#1a5fbf` | Hover de acento |
| `--blue-light` | `#4d8fea` | `#1a5fbf` | Texto/iconos sobre acento |
| `--card` | `#162233` | `#ffffff` | Fondo de tarjetas/paneles |
| `--border` | `#243447` | `#dde3ec` | Bordes |
| `--text` | `#e2eaf5` | `#1e293b` | Texto principal |
| `--text2` | `#8a9bb0` | `#64748b` | Texto secundario/labels |
| `--red` | `#e53e3e` | `#dc2626` | Errores, acciones destructivas |
| `--green` | `#38a169` | `#16a34a` | Éxito, validación |
| `--gray` a `--gray4` | escala de grises | escala de grises | superficies neutras, texto muted |

Un solo acento de marca (azul BMW). Sin morado, sin gradientes. Rojo/verde reservados exclusivamente para estado (error/éxito), nunca decorativos.

## Typography

Font stack del sistema (no Inter, no fuente cargada): `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`.

Escala en uso (sin tokens formales aún, valores directos en px):
- `11px` — metadatos, badges pequeños
- `12–13px` — texto de cuerpo secundario, labels
- `14–15px` — texto de cuerpo primario, inputs, botones
- `16–17px` — subtítulos
- `20–26px` — títulos de sección/página
- `32px` — cifras destacadas (stat cards)

Labels de formulario: uppercase, `letter-spacing` amplio, `font-weight:600`, tamaño 11-12px, color `--text2` — patrón consistente en toda la app.

## Spacing & Radius

- `--radius: 10px` — radio estándar para botones, inputs, tarjetas, stat cards.
- Variantes puntuales: `8px` (inputs de formularios anidados), `12–16px` (paneles/modales grandes), `20px` (píldoras de rol/badge), `6–7px` (elementos pequeños como tabs).
- `--shadow: 0 4px 24px rgba(0,0,0,.35)` (oscuro) / `rgba(0,0,0,.08)` (claro) — sombra sutil, usada con moderación (paneles flotantes, no en cada tarjeta).

## Components

- **`.btn`** (+ `.btn-primary/-secondary/-danger/-ghost/-green`, `.btn-sm`, `.btn-full`): botón base único con variantes de color, `border-radius:var(--radius)`, transición de color en hover (gateada a `hover: hover` + `pointer: fine`).
- **`.form-control`**: inputs/selects consistentes, fondo `--navy`, borde `--border`, foco con borde `--blue`. Estados `.valid`/`.invalid` para RFC/CURP.
- **`.stat-card`**: tarjetas de métricas del dashboard, fondo `--card`, sin sombra pesada.
- **`.role-pill`** / **`.badge-tipo`**: píldoras de estado (rol de usuario, tipo de persona) con color de fondo tenue + texto del mismo tono, `border-radius:20px`.
- **`.toast`**: notificación flotante inferior-derecha, entrada/salida por transición (no keyframes), curva `cubic-bezier(0.16,1,0.3,1)`, respeta `prefers-reduced-motion`.
- **`.modal` / `.modal-overlay`**: modal centrado clásico sin animación de entrada (oportunidad de mejora, ver auditoría).
- **`.nav-item`**: barra de navegación superior por rol, subrayado en azul para el ítem activo.

## Motion

- Duraciones cortas (150–300ms), `ease-out` o curvas custom para transiciones de UI — no `ease-in` en interacciones.
- `transition` acotada a propiedades específicas (`background-color`, `border-color`, `color`, `transform`, `opacity`), nunca `transition: all`.
- Hover gateado tras `@media (hover: hover) and (pointer: fine)` — importante dado el uso en tablet/celular en piso de venta.
- `prefers-reduced-motion` respetado donde hay movimiento (toast).
- Spinner de carga (`.btn-spinner`): rotación infinita lineal, solo visible durante operaciones asíncronas reales.
