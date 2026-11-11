# agents.md — Instrucciones para la IA · Sitio de reclutamiento ViñoPlastic

Eres un agente de desarrollo trabajando en un sitio de reclutamiento con estas partes: **aterrizaje, rutas de transporte, vacantes, contacto** y un **panel de administrador con editor de vacantes**.

Sigue este archivo en orden. Si algo no está definido aquí, en `design.md` o en el repositorio, **no lo inventes: pregunta**.

---

## 1. Reglas de oro (no negociables)

1. **No inventar.** Prohibido crear datos que parezcan reales: vacantes, salarios, rutas, paradas, horarios, teléfonos, correos, direcciones, cifras, testimonios, textos legales, nombres de personas.
2. **No hardcodear.** Nada de colores, tamaños, espacios, radios, fuentes, textos de contenido, URLs, correos, teléfonos, claves ni datos de negocio escritos dentro de componentes.
3. **`design.md` manda.** Todo valor visual sale de los tokens definidos ahí. Si falta un token, propónlo y agrégalo a `design.md` antes de usarlo.
   Las utilidades de espaciado usan la escala base `--space-1`; el CSS de página usa tokens semánticos `--space-*`.
4. **No asumir el stack.** Detecta framework, lenguaje, gestor de paquetes y estructura leyendo el repositorio (`package.json`, lockfiles, configuración). Si no hay repositorio, pregunta qué stack usar.
5. **Un paso a la vez.** Termina y verifica cada paso antes de pasar al siguiente. No avances con errores pendientes.
6. **No instalar dependencias sin motivo.** Antes de añadir una librería, revisa si el proyecto ya tiene algo equivalente; si agregas una, justifícalo en una línea.
7. **No modificar lo que no se pidió.** Cambios mínimos y acotados a la tarea.
8. **Declarar lo no verificado.** Si no pudiste ejecutar algo (pruebas, build, contraste), dilo; nunca afirmes que pasó.

## 2. Cuando falte información

No rellenes el hueco. Haz esto:

1. Detén esa parte de la tarea (continúa con lo que sí esté definido).
2. Haz **una pregunta concreta** con opciones si las hay. Ejemplo: "No encuentro el esquema de vacantes. ¿Está en una base de datos, API o archivo? ¿Puedes compartir los campos?"
3. Mientras tanto, usa **estados vacíos reales** (por ejemplo "Aún no hay vacantes publicadas"), nunca datos de relleno.
4. Si necesitas datos de prueba para desarrollo, ponlos **solo** en un archivo claramente marcado (`/fixtures/` o `seed`), con nombres obviamente ficticios (por ejemplo `Vacante de prueba 1`), excluido de producción.

## 3. Dónde vive cada cosa (no mezclar)

| Qué | Dónde debe vivir | Prohibido |
|---|---|---|
| Colores, tipografía, espacio, radios | Tokens CSS (`styles/tokens.css`) según `design.md` | Valores sueltos en componentes (`#103672`, `16px`, etc.) |
| Textos de interfaz (botones, títulos fijos, mensajes) | Archivo de textos/i18n del proyecto | Cadenas repetidas dentro de componentes |
| Datos de negocio (vacantes, rutas, paradas, horarios) | Base de datos / API / CMS del proyecto | Arreglos escritos en el componente |
| Contacto, nombre de empresa, redes, horarios de atención | Configuración (`config/site` o variables de entorno) | Teléfonos o correos en el JSX/HTML |
| Claves, tokens, URLs de servicios | Variables de entorno (`.env`, con `.env.example` sin valores reales) | Secretos en el código o en el repositorio |
| Textos legales (aviso de privacidad, términos) | Contenido proporcionado por el usuario | Redactarlos tú mismo |

Una prueba rápida antes de entregar: busca en el código literales de color (`#`, `rgb(`, `hsl(`), números de píxeles en estilos de componentes, teléfonos, correos y URLs. Si aparecen fuera de tokens o configuración, corrígelos.

## 4. Pasos de trabajo

### Paso 0 — Leer
- Lee `design.md` completo y este archivo.
- Revisa el repositorio: estructura, stack, rutas existentes, componentes existentes, esquema de datos, autenticación.
- Entrega un resumen corto de lo que encontraste y lista de **preguntas abiertas**. No escribas código todavía si hay bloqueos críticos (stack, fuente de datos, autenticación).

### Paso 1 — Tokens y base global
- Crea o actualiza `styles/tokens.css` con **todos** los tokens de `design.md` (color, espacio, radio, tipografía, foco).
- Estilos base: `html lang="es-MX"`, reset mínimo, tipografía base, foco visible global, `prefers-reduced-motion`, enlace "Saltar al contenido".
- **Verifica:** ningún componente aún; solo tokens y base. Revisa que los valores coincidan exactamente con `design.md`.

### Paso 2 — Fuente
- Usa **Familjen Grotesk** alojada localmente en la carpeta pública de fuentes, con `@font-face` y `font-display: swap`, tal como indica `design.md`.
- Incluye el archivo de licencia `OFL.txt` junto a la fuente.
- Si no tienes acceso para descargar la fuente, **no la sustituyas por otra**: deja el stack de respaldo del token y avisa al usuario que debe colocar el archivo.
- **Verifica:** se carga una sola familia; no hay peticiones a CDN de fuentes.

### Paso 3 — Componentes base
Construye, en este orden, siguiendo la sección 8 de `design.md`:
1. Botones (primary, outline, soft, danger)
2. Campos (input, select, textarea, checkbox, radio, switch) con estados de error
3. Chips de filtro y badges de estado
4. Tarjetas (card, vacancy-card, route-card)
5. Navegación (desktop y móvil), footer
6. Acordeón, modal, toast

Para cada componente: usa solo tokens, soporta teclado, foco visible, estados (hover, activo, deshabilitado, error), área táctil ≥ 48 px.
- **Verifica:** una página de prueba de componentes (solo en desarrollo) y revisa con teclado.

### Paso 4 — Capa de datos
- Detecta cómo se obtienen vacantes y rutas. Si ya existe, úsala. Si no existe, **pregunta** (no elijas base de datos ni API por tu cuenta).
- Define tipos/esquemas a partir de lo que exista; si propones campos nuevos, preséntalos para aprobación.
- Maneja los cuatro estados en cada consumo de datos: cargando, vacío, error, con datos.
- **Verifica:** ningún componente contiene datos escritos a mano.

### Paso 5 — Páginas públicas (en este orden)
1. **Vacantes** (lista + filtros + detalle + postulación)
2. **Rutas de transporte** (lista + detalle con paradas y horarios + alternativa textual del mapa)
3. **Contacto** (formulario accesible + datos desde configuración + enlace al aviso de privacidad)
4. **Aterrizaje** (ensambla secciones con datos reales de vacantes y rutas)

Para cada página: estructura de `design.md` sección 9, un solo `<h1>`, landmarks, `<title>` propio, responsive desde 320 px.
- **Verifica** por página: estados vacío/error/cargando, teclado, 320 px y 1280 px.

### Paso 6 — Panel de administrador
- Reutiliza la autenticación y roles del proyecto. Si no existen, **pregunta**; no inventes un login ni credenciales.
- Construye: lista de vacantes (tabla en escritorio, tarjetas en móvil) → editor con secciones, vista previa, barra de acciones fija, indicador de guardado, advertencia por cambios sin guardar, confirmación para eliminar/despublicar.
- Los campos del editor salen del esquema real. Si hay duda, pregunta.
- Validación en cliente **y** servidor; mensajes accesibles.
- **Verifica:** flujo completo (crear borrador → editar → vista previa → publicar → pausar → eliminar) con teclado y en móvil.

### Paso 7 — Accesibilidad y contraste
- Ejecuta una verificación automática de contraste sobre todos los pares texto/fondo reales de los tokens (ratio **≥ 8.1:1** para texto, **≥ 3:1** para bordes e íconos con significado). Si el proyecto no tiene herramienta, escribe un pequeño script que lea `tokens.css` y calcule la fórmula WCAG.
- Ejecuta auditoría automática de accesibilidad si hay herramienta disponible (por ejemplo axe o Lighthouse) y corrige lo encontrado.
- Prueba manual: solo teclado, lector de pantalla básico si es posible, zoom al 200 % y 400 %.
- **Entrega la tabla de resultados.** No marques "cumple" sin evidencia.

### Paso 8 — Responsive
- Revisa a 320, 375, 768, 1024 y 1280 px.
- Criterios: sin scroll horizontal, nada recortado, tablas convertidas a tarjetas, CTA accesible con el pulgar, barras fijas respetan zonas seguras, campos a 16 px.
- **Verifica** también orientación horizontal en móvil.

### Paso 9 — Cierre
Entrega el reporte con el formato de la sección 6.

## 5. Lista de verificación antes de dar algo por terminado

- [ ] Todos los valores visuales vienen de tokens
- [ ] Cero datos de negocio escritos dentro de componentes
- [ ] Textos de interfaz en el archivo de textos, no repetidos en código
- [ ] Contacto y datos de empresa leídos de configuración
- [ ] Sin secretos en el código; `.env.example` actualizado
- [ ] Contraste verificado (≥ 8.1:1 texto, ≥ 3:1 no textual) con resultado a la vista
- [ ] Teclado completo, foco visible, orden lógico
- [ ] Un `<h1>` por página, landmarks, `lang="es-MX"`
- [ ] Objetivos táctiles ≥ 48 px
- [ ] 320 px sin scroll horizontal
- [ ] Estados cargando / vacío / error / éxito presentes
- [ ] Formularios con etiqueta visible, errores asociados y resumen de errores
- [ ] Mapas con alternativa textual
- [ ] Solo una fuente (Familjen Grotesk), alojada localmente, con licencia incluida
- [ ] Sin sombras, degradados ni colores fuera de `design.md`
- [ ] El build y las pruebas del proyecto pasan (o se declara que no se pudieron ejecutar)

## 6. Formato del reporte al terminar cada tarea

```
Hecho:
- (qué se construyó o cambió, en viñetas cortas)

Archivos tocados:
- ruta/archivo — motivo en una línea

Verificado:
- (qué se comprobó y cómo: contraste, teclado, anchos, build)

No verificado / pendiente:
- (lo que no pudiste comprobar y por qué)

Preguntas abiertas:
- (lo que necesitas del usuario para continuar)

Supuestos:
- (idealmente ninguno; si hubo, listarlos para que se confirmen)
```

## 7. Prohibido

- Rellenar con "lorem ipsum" o datos que parezcan reales
- Inventar el aviso de privacidad, requisitos legales, prestaciones o salarios
- Cambiar paleta, fuente o geometría sin actualizar primero `design.md` y avisar
- Usar `!important`, `outline: none` sin reemplazo, `user-scalable=no`
- Información transmitida solo por color
- Añadir analíticas, rastreadores, CAPTCHAs o servicios de terceros sin autorización
- Guardar datos personales de candidatos sin que el usuario confirme dónde y cómo se almacenan
- Dar por hecho que algo funciona sin haberlo ejecutado

## 8. Privacidad de candidatos

El sitio recibe datos personales (formulario de contacto y postulaciones). No definas tú el tratamiento legal: pide al usuario el aviso de privacidad vigente, enlázalo desde cada formulario, recoge solo los campos necesarios y no los registres en logs ni los expongas en URLs.