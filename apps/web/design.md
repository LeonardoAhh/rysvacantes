# design.md — Sistema de diseño · Sitio de reclutamiento ViñoPlastic

> Fuente de verdad visual. Cualquier color, tamaño, espacio, radio o fuente que use la interfaz **debe salir de los tokens de** `packages/ui/src/styles/tokens.css`. Si un valor no existe como token, se agrega aquí primero; nunca se escribe suelto en un componente.

## 1. Principios

1. **Claro antes que bonito.** Una persona que busca empleo desde su celular debe encontrar vacante, ruta y botón de postularse sin pensar.
2. **Móvil primero.** Se diseña desde 320 px hacia arriba. Escritorio es una ampliación, no el diseño base.
3. **Contraste alto por defecto.** Todo texto cumple **≥ 8.1:1** contra su fondo (ver sección 3). Si se pidió otro criterio, este documento se ajusta, no el código.
4. **Plano y sobrio.** Sin sombras ni degradados en la interfaz; la jerarquía se hace con relleno, borde y tipografía.
5. **El contenido no se inventa.** Vacantes, rutas, horarios y datos de contacto vienen de la fuente de datos o de configuración, nunca del componente.

## 2. Marca

- **Primario:** azul marino `#103672`, aproximación al azul del logo. _Pendiente: validar contra el archivo oficial del logo; si cambia, solo se edita `--color-brand` y derivados._
- Se usa en: botón principal, enlaces, indicadores activos, foco, tarjeta destacada.
- Sobre primario siempre texto blanco.
- Los hover y pressed del primario se derivan del azul (más oscuros), nunca de otro matiz.
- Esta adaptación **reemplaza** el primario negro y el acento azul eléctrico (`#0066ff`) de la referencia Mobbin. Se conservan el espacio, la jerarquía y la ausencia de sombras.

## 3. Color y contraste

### 3.1 Tokens

```css
:root {
  /* Superficies */
  --color-canvas: #ffffff;
  --color-surface: #f3f3f3; /* nav, tarjetas destacadas, filas */
  --color-field: #ffffff; /* fondo de inputs */
  --color-brand-tint: #e8eef8; /* selección, fila activa */

  /* Texto */
  --color-ink: #141414; /* títulos y cuerpo */
  --color-ink-soft: #262626;
  --color-text-muted: #444444; /* texto secundario (sí cumple 8.1:1) */

  /* Marca */
  --color-brand: #103672;
  --color-brand-hover: #0b2a5e;
  --color-brand-active: #081f47;
  --color-on-brand: #ffffff;

  /* Bordes */
  --color-border-strong: #707070; /* inputs, controles (no texto ≥3:1) */
  --color-hairline: #d9d9d9; /* solo divisores decorativos */

  /* Estados (siempre con ícono + texto, nunca solo color) */
  --color-error: #7f1d1d;
  --color-error-tint: #fdecec;
  --color-success: #0f4526;
  --color-success-tint: #e8f5ec;
  --color-warning: #5c3b00;
  --color-warning-tint: #fff4d6;

  /* Inverso (footer, overlays) */
  --color-inverse-bg: #141414;
  --color-on-inverse: #ffffff;
  --color-on-inverse-muted: #e0e0e0;

  /* Foco */
  --color-focus: var(--color-text-muted);
  --color-focus-on-dark: #ffffff;
}
```

### 3.2 Pares permitidos y contraste

Valores calculados con la fórmula WCAG; el agente debe **re-verificarlos con script** (ver `agents.md`) antes de cerrar cualquier tarea.

| Texto              | Fondo                     | Ratio      | ¿≥ 8.1? |
| ------------------ | ------------------------- | ---------- | ------- |
| `ink`              | `canvas`                  | 18.4       | Sí      |
| `text-muted`       | `canvas`                  | 9.7        | Sí      |
| `text-muted`       | `surface`                 | 8.8        | Sí      |
| `brand` (enlaces)  | `canvas`                  | 11.7       | Sí      |
| `brand`            | `surface`                 | 10.6       | Sí      |
| `brand`            | `brand-tint`              | 10.0       | Sí      |
| `on-brand`         | `brand`                   | 11.7       | Sí      |
| `on-brand`         | `brand-hover`             | 13.9       | Sí      |
| `error`            | `canvas` / `error-tint`   | 10.0 / 8.8 | Sí      |
| `success`          | `canvas` / `success-tint` | 11.1 / 9.9 | Sí      |
| `warning`          | `canvas` / `warning-tint` | 10.1 / 9.3 | Sí      |
| `on-inverse`       | `inverse-bg`              | 18.4       | Sí      |
| `on-inverse-muted` | `inverse-bg`              | 13.9       | Sí      |

**Elementos no textuales** (bordes de input, íconos con significado, foco): ≥ 3:1. `border-strong` sobre blanco = 4.95:1.

**Cambios respecto a la referencia, por contraste:**

- Se elimina el gris claro `#adadad` (placeholders, footer, letra pequeña). Ya no existe token "faint".
- El gris `#707070` ya no se usa para texto; solo como borde.
- Los inputs **ya no van sin borde**: llevan borde de 1 px `border-strong`.
- El badge translúcido sobre imágenes se sustituye por relleno sólido `inverse-bg` con texto `on-inverse`.
- No hay modo oscuro en esta versión. Si se agrega, requiere su propia tabla de contraste.

### 3.3 Reglas

- Nunca transmitir información solo con color (vacante "cerrada", error de campo, ruta activa): siempre texto o ícono además.
- Enlaces en texto corrido: color `brand` **y subrayado**.
- Texto sobre imágenes: solo sobre un bloque sólido, no sobre la foto.

## 4. Tipografía

### 4.1 Fuente única: **Familjen Grotesk**

- Grotesca contemporánea de uso poco extendido, de licencia **SIL Open Font License 1.1** (gratuita, uso comercial permitido, se puede alojar en tu servidor).
- Variable, pesos 400–700, con cursiva. Soporta acentos y ñ del español.
- Descarga: Google Fonts (familia "Familjen Grotesk"). Incluir el archivo `OFL.txt` junto a la fuente en el repositorio.
- **Se aloja localmente** (`apps/web/public/fonts/`), no se carga desde CDN: más rápido y sin enviar la IP del candidato a terceros.
- Los subconjuntos `latin` y `latin-ext`, y sus declaraciones `@font-face`, viven en `packages/ui/src/styles/tokens.css`. El archivo `OFL.txt` acompaña a las fuentes.

El token `--font-family` define la familia y sus fuentes de respaldo.

No se mezcla otra fuente. Tampoco monoespaciada, salvo bloques de código en el admin si fueran necesarios (usar `ui-monospace`).

### 4.2 Escala (móvil → escritorio ≥ 840 px)

| Token            | Móvil    | Escritorio | Peso | Interlineado | Uso                          |
| ---------------- | -------- | ---------- | ---- | ------------ | ---------------------------- |
| `--type-display` | 2.5rem   | 4.5rem     | 700  | 1.05         | Hero de aterrizaje           |
| `--type-h1`      | 2rem     | 3rem       | 700  | 1.1          | Título de página             |
| `--type-h2`      | 1.75rem  | 2.25rem    | 700  | 1.15         | Secciones                    |
| `--type-h3`      | 1.5rem   | 1.75rem    | 700  | 1.2          | Tarjetas, detalle de vacante |
| `--type-h4`      | 1.25rem  | 1.375rem   | 600  | 1.25         | Subsecciones                 |
| `--type-lead`    | 1.125rem | 1.25rem    | 400  | 1.5          | Subtítulo bajo el título     |
| `--type-body`    | 1rem     | 1rem       | 400  | 1.5          | Texto base                   |
| `--type-body-sm` | 0.875rem | 0.875rem   | 400  | 1.5          | Metadatos, ayudas            |
| `--type-label`   | 0.875rem | 0.875rem   | 600  | 1.4          | Etiquetas de campo y chips   |

Pesos compartidos: regular `400`, medium `500`, semibold `600` y bold `700`. Los títulos H1–H3 usan sus tokens de rol y peso bold; el hero de inicio usa `--type-display`.

Reglas:

- Mínimo absoluto 14 px; texto de lectura y campos de formulario, **16 px o más** (evita el zoom automático de iOS).
- Sin mayúsculas forzadas ni espaciado entre letras. Español en oración normal.
- Largo de línea de lectura: 45–75 caracteres (`max-width: 68ch`).
- Debe resistir el espaciado de texto de WCAG 1.4.12 (interlineado 1.5, párrafos 2×, letras 0.12em, palabras 0.16em) sin cortar contenido.
- Los títulos por defecto **no** llevan punto final (los datos vienen de contenido real y no siempre son frases).

## 5. Espacio, forma y elevación

### Espacio (base 4 px)

`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 24 · `--space-6` 32 · `--space-7` 48 · `--space-8` 64 · `--space-9` 96

- Margen lateral de página: 16 px (móvil), 24 px (≥ 600), 32 px (≥ 1024).
- Separación entre secciones: `--page-section-space` (32 px en móvil, 48 px desde 840 px).
- Separación entre contenidos relacionados: `--page-content-gap` (24 px en móvil, 32 px desde 840 px).
- Contenedor máximo: 1200 px, centrado.

### Radios

`--radius-control` 8 px (botones, campos, chips y badges) · `--radius-card` 12 px (tarjetas y menús) · `--radius-modal` 16 px (modales) · `--radius-full` 9999 px (avatares y controles inherentemente circulares).

### Elevación

Sin sombras. Niveles: 0 plano sobre `canvas` · 1 relleno `surface` · 2 borde 1 px `hairline` · modal = borde `border-strong` + velo `rgb(20 20 20 / 0.6)`.

## 6. Accesibilidad (obligatorio)

Base: **WCAG 2.2 nivel AA**, endurecida con el contraste ≥ 8.1:1 de este documento.

**Estructura**

- `<html lang="es-MX">`; un solo `<h1>` por página; jerarquía de títulos sin saltos.
- Landmarks: `header`, `nav`, `main`, `footer`; `aside` para filtros/vista previa.
- Enlace "Saltar al contenido" como primer elemento enfocable.
- Título de página (`<title>`) único y descriptivo.

**Teclado y foco**

- Todo es operable con teclado, en orden visual lógico.
- Foco visible: anillo de 2 px `--color-focus` (`--focus-ring-width`) con separación de 2 px (`--focus-ring-offset`) (en footer: `--color-focus-on-dark`). En inputs, selects y textareas, el anillo de 2 px va hacia dentro para no desbordar; nunca `outline: none` sin reemplazo visible.
- Los diálogos atrapan el foco, cierran con `Esc` y devuelven el foco al disparador.

**Objetivos táctiles**

- Mínimo **48 × 48 px** en botones, filtros, filas clicables y navegación móvil (WCAG pide 24, aquí se exige más). Separación ≥ 8 px entre objetivos.

**Formularios**

- Etiqueta visible siempre arriba del campo (el placeholder nunca sustituye la etiqueta).
- Campos obligatorios marcados con texto "(obligatorio)", no solo con asterisco.
- Errores: junto al campo, con ícono y texto, enlazados con `aria-describedby`; además un resumen de errores al inicio del formulario con enlaces a cada campo.
- `autocomplete` correcto (`name`, `email`, `tel`).
- No usar CAPTCHA visual; protección con límite de envíos y campo trampa.

**Contenido dinámico**

- Mensajes de éxito/estado: `role="status"`; errores críticos: `role="alert"`.
- Resultados filtrados: anunciar el total ("12 vacantes encontradas") en una región `aria-live="polite"`.

**Imágenes, mapas y tablas**

- Texto alternativo real (vacío `alt=""` si es decorativa). Los mapas de rutas **siempre** tienen alternativa textual (lista de paradas y horarios).
- Tablas con `<th scope>`; en móvil se transforman a tarjetas conservando las etiquetas.

**Movimiento y zoom**

- Respetar `prefers-reduced-motion`; transiciones ≤ 200 ms, sin animaciones que parpadeen.
- El mockup decorativo del hero puede flotar en un ciclo suave de `6s` (`--duration-hero-float`), sin cambiar su contenido ni su posición de lectura. Con movimiento reducido permanece estático.
- El nombre de marca del hero se revela letra por letra, cambia al primario y pulsa suavemente con `--duration-brand-pulse` y `--scale-brand-pulse`. El bucle se detiene fuera de pantalla o cuando la pestaña está oculta; con movimiento reducido queda estático.
- Al salir del inicio por navegación, la página hace fade-out usando `--duration-fast`; con movimiento reducido no se anima.
- Sin bloqueo de zoom (`user-scalable` nunca en `no`). Debe funcionar al 200 % y reflujar a 320 px sin scroll horizontal (400 % de zoom).

## 7. Responsive (móvil completo)

Enfoque _mobile-first_: los estilos base son los de móvil; las media queries solo agregan.

| Nombre | Desde   | Cambios                                                     |
| ------ | ------- | ----------------------------------------------------------- |
| base   | 320 px  | Una columna, menú en hamburguesa, tablas → tarjetas         |
| sm     | 600 px  | Cuadrícula de 2 columnas en tarjetas                        |
| md     | 840 px  | Nav horizontal, filtros en barra lateral, admin con sidebar |
| lg     | 1024 px | 3 columnas, editor con vista previa en paralelo             |
| xl     | 1280 px | Contenedor máximo 1200 px                                   |

Reglas móviles:

- Cero scroll horizontal a 320 px de ancho.
- Navegación: barra superior con logo + botón de menú (≥ 48 px) que abre panel a pantalla completa.
- CTA principal de cada página visible sin desplazarse mucho; en detalle de vacante, botón "Postularme" fijo al borde inferior.
- Usar `100dvh` (no `100vh`) y `env(safe-area-inset-*)` en barras fijas.
- Teclado móvil correcto: `inputmode`, `type="tel"`, `type="email"`.
- Imágenes con `max-width: 100%`, proporción fija y carga diferida (excepto la primera).
- Texto nunca se trunca para ocultar información esencial (título de vacante, ruta, horario).

## 8. Componentes

Todos usan solo tokens. Nombres de referencia (BEM o equivalente del proyecto).

### Botones

- **button-primary**: relleno `brand`, texto `on-brand`, `radius-control`, alto 48 px, padding horizontal `space-5`. Hover `brand-hover`, pressed `brand-active`. Deshabilitado: relleno `surface`, texto `text-muted`, borde `border-strong`, con `aria-disabled`.
- **button-outline**: fondo `canvas`, texto `brand`, borde 2 px `brand`. Hover: fondo `brand-tint`.
- **button-soft**: fondo `surface`, texto `ink`. Para acciones terciarias.
- **button-danger** (solo admin): relleno `error`, texto blanco; siempre pide confirmación.

### Campos

- **text-input / select / textarea**: fondo `field`, borde 1 px `border-strong`, `radius-control`, alto mínimo 48 px, texto 16 px, placeholder `text-muted`.
- Foco: borde `muted` + anillo interno de 2 px. Error: borde `error` + mensaje debajo con ícono.
- **checkbox / radio / switch**: área táctil de 48 px; etiqueta clicable.

### Chips y badges

- **chip-filter**: `radius-control`, 48 px de alto táctil (visual 36 px + área extendida), seleccionado = `brand-tint` + borde `brand` + ícono de check.
- **badge-status**: `radius-control`, con ícono + texto. Estados de vacante: Borrador (`surface`), Publicada (`success`), Pausada (`warning`), Cerrada (`error`).

### Tarjetas

- **card**: `canvas`, borde 1 px `hairline`, `radius-card`, padding `space-5`.
- **card-featured**: fondo `surface`, sin borde.
- **vacancy-card**: título (h3), área, ubicación, tipo de jornada, enlace "Ver vacante". Toda la tarjeta es un solo enlace al detalle; sin enlaces anidados.
- **route-card**: nombre de ruta y cantidad de paradas en línea, separados por un borde; control con chevron y texto para mostrar u ocultar paradas. Solo una ruta puede expandirse a la vez; el panel se anima con `--duration-fast` y queda inmediato con movimiento reducido.

### Navegación

- **nav** (≥ 840 px): barra `surface`, logo + enlaces + botón primario "Ver vacantes".
- **nav-mobile**: barra superior fija + panel completo; enlace activo con `aria-current="page"` y marcador no solo de color.
- La navegación de cada vista se expresa mediante el encabezado principal y sus títulos, sin rutas jerárquicas.

### Otros

- **accordion** (FAQ): botón con `aria-expanded`, fila `surface`, `radius-control`.
- **toast**: `surface` con borde y ícono, `role="status"`, no desaparece solo en menos de 8 s ni si tiene acción.
- **modal**: borde `border-strong`, `radius-modal`, título, botón cerrar de 48 px.
- **footer**: `inverse-bg`, esquinas superiores `radius-card`, texto `on-inverse`/`on-inverse-muted`, enlaces subrayados.

## 9. Páginas

> Estructura de UI. **Los datos reales (vacantes, rutas, horarios, contactos, textos legales) no se definen aquí**: vienen de la fuente de datos o de `config/site`.

### 9.1 Aterrizaje

1. Hero: título (`display`), subtítulo (`lead`), botón primario "Ver vacantes" y botón outline "Ver rutas de transporte".
2. Vacantes destacadas (máx. 3–6, dinámicas) con enlace a la lista completa.
3. Cómo es el proceso de selección (pasos numerados, contenido configurable).
4. Rutas de transporte: resumen con enlace a la página.
5. Preguntas frecuentes (acordeón).
6. Llamado final a postularse + footer.

### 9.2 Rutas de transporte

- Buscador/filtro por zona o colonia y por turno.
- Lista de `route-card`; al abrir: paradas en orden, horarios por turno y mapa **opcional** con alternativa textual completa.
- Estado vacío: "No hay rutas para este filtro" + botón para limpiar filtros.
- Fecha de última actualización visible si el dato existe.

### 9.3 Vacantes

- Barra de búsqueda y filtros (área, ubicación, jornada). En móvil: botón "Filtros" que abre panel; resultado con contador anunciado.
- Lista de `vacancy-card` con paginación o "Cargar más" (con foco administrado).
- **Detalle**: título, resumen, descripción, requisitos, prestaciones, ruta de transporte asociada (enlace), botón "Postularme" (fijo abajo en móvil).
- Estados: cargando (esqueleto sin animación parpadeante), vacío, error con botón de reintento, vacante cerrada (mensaje y alternativas).

### 9.4 Contacto

- Formulario (nombre, correo, teléfono opcional, asunto, mensaje) con validación accesible y confirmación `role="status"`.
- Datos de contacto y horarios **leídos de configuración**, con enlaces `tel:` y `mailto:` de objetivo táctil amplio.
- Enlace al aviso de privacidad antes del botón de enviar; casilla de aceptación si el área legal lo requiere.

### 9.5 Admin · Editor de vacantes

Acceso protegido por autenticación y roles (definidos en el proyecto, no en este archivo).

- **Layout**: ≥ 840 px sidebar de 13 rem + contenido; < 840 px barra superior + menú desplegable o navegación inferior de hasta 4 elementos.
- **Lista de vacantes**: tabla con orden, búsqueda y filtro por estatus; en móvil, tarjetas con las mismas etiquetas. Acciones por fila: Editar, Duplicar, Pausar/Publicar, Eliminar (con confirmación).
- **Editor**: formulario por secciones (datos generales, descripción, requisitos, prestaciones, ruta asociada, publicación).
  - ≥ 1024 px: formulario a la izquierda, **vista previa** del detalle público a la derecha.
  - < 1024 px: pestañas "Editar" / "Vista previa".
  - Barra de acciones fija abajo: Guardar borrador, Publicar, Cancelar.
  - Indicador de estado en texto ("Guardado hace 1 min", "Cambios sin guardar"); advertencia al salir con cambios.
  - Validación antes de publicar, con resumen de errores.
  - Eliminar o despublicar siempre pide confirmación en modal.
- Campos del editor: **los define el esquema de datos del proyecto**. Esta lista es solo referencia de UI y debe confirmarse contra el esquema: título, área, ubicación, jornada, descripción, requisitos, prestaciones, ruta asociada, estatus, fechas de publicación/cierre.

## 10. Hacer / No hacer

**Hacer**

- Usar tokens para todo valor visual.
- Verificar contraste de cada par nuevo antes de usarlo.
- Probar a 320 px, 375 px, 768 px y 1280 px, y con teclado.
- Escribir interfaz en español de México, claro y sin tecnicismos.

**No hacer**

- Sombras, degradados en la interfaz, bandas de color extra o más acentos.
- Texto gris claro, placeholders como etiqueta, color como única señal.
- Botones o filtros menores a 48 px de área táctil.
- Contenido, cifras, salarios, rutas o teléfonos escritos dentro de componentes.
- Cargar la fuente desde un CDN o mezclar otra familia tipográfica.
