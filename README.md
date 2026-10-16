# ViñoPlastic

Sitio de reclutamiento y panel de vacantes de ViñoPlastic. Monorepo con React 19, Vite, TypeScript, Tailwind CSS 4, componentes shadcn/ui basados en Base UI y Motion.

## Estado actual

| URL                 | Página visible       | Estado                                                                 |
| ------------------- | -------------------- | ---------------------------------------------------------------------- |
| `/`                 | Inicio               | Landing pública.                                                       |
| `/about`            | Empresa              | Historia, servicios, productos y valores de ViñoPlastic.               |
| `/vacancies`        | Vacantes             | Listado público de vacantes publicadas con búsqueda y filtro por área. |
| `/contact`          | Contacto             | Datos de reclutamiento y enlaces de correo y teléfono.                 |
| `/auth`             | Iniciar sesión       | Acceso por usuario y contraseña con Supabase Auth.                     |
| `/dashboard`        | Gestión de vacantes  | Acceso con sesión y permiso de editor; CRUD en Supabase.               |
| Cualquier otra ruta | Página no encontrada | Mensaje 404 y enlace al inicio.                                        |

El enlace principal del inicio lleva al listado público. Cada vacante muestra descripción, horario laboral, días de trabajo, días de descanso, sueldo y prestaciones, además de ubicación, modalidad y fecha límite. Enlaza a Contacto para pedir información; todavía no hay postulación en línea. El listado consulta solo registros con estado `published`. El panel exige los nuevos campos al crear o editar y no acepta «Por definir» como valor final. Las vacantes se guardan en Supabase y se comparten entre dispositivos autorizados. Los datos locales anteriores solo se leen para ofrecer una importación opcional desde el panel; nunca sustituyen a la base de datos ni se muestran públicamente por sí solos.

El enlace «Conoce ViñoPlastic» lleva a `/about`. La página adapta información de [Empresa](https://www.vinoplastic.com.mx/empresa/), [Servicios](https://www.vinoplastic.com.mx/servicios/) y [Productos](https://www.vinoplastic.com.mx/productos/). La interfaz utiliza voz de empresa y no muestra notas de investigación ni afirmaciones sobre la vigencia de certificaciones antiguas; por eso se omitieron las menciones a ISO/TS 16949:2009 y UL C-3347. Los logotipos corresponden a empresas mencionadas en la página corporativa de Productos. Las imágenes se cargan desde ese sitio y requieren conexión. `about-content.ts` centraliza imágenes y listas; `about-sections.tsx` compone las secciones y `about-reveal.tsx` aplica entradas suaves que respetan la preferencia de movimiento reducido.

Los logotipos de `/about` aparecen en un carrusel horizontal sin tarjetas. Los archivos originales incluyen un fondo blanco; se integran visualmente con el fondo de la página mediante mezcla de color. El recorrido continuo se pausa al pasar el cursor o al enfocar la fila con el teclado; con movimiento reducido se presenta una fila desplazable manualmente. La segunda copia visual de los logotipos se oculta a tecnologías de asistencia.

El desplazamiento de `/about` conserva el scroll nativo del navegador. Motion anima entradas cortas una sola vez y dibuja una línea de progreso de lectura con transformaciones; ambas se reducen o desactivan con la preferencia de movimiento reducido. El fondo decorativo se limita al inicio de la página y el carrusel se detiene fuera de la vista o mientras se desplaza la página para reducir trabajo de renderizado.

El cierre de `/about` muestra la ubicación de Querétaro en un mapa de Google dentro de un marco CSS responsive, con la dirección visible y un enlace para abrirla en Google Maps. El mapa se carga de forma diferida y requiere conexión; la dirección y el enlace permanecen disponibles si no carga. `company-location.ts` centraliza esa dirección y las URL del mapa para `/about` y `/contact`.

Cada tarjeta pública presenta tres vistas dentro de la misma tarjeta: resumen (ubicación, modalidad, sueldo y fecha límite), descripción, y jornada y prestaciones (horario, días de trabajo y descanso, y beneficios). Los controles «Detalle», «Siguiente» y «Volver» recorren esas vistas sin cambiar de página; el número de sección se comunica a lectores de pantalla y no ocupa espacio visual. En escritorio, las dos columnas acomodan cada tarjeta según su propia altura: al cambiar de vista, las siguientes vacantes ocupan el espacio disponible sin estirar las tarjetas vecinas. En móvil se conserva una sola columna. Al final de la tercera vista aparecen «Pedir información» y «Proceso» en la misma fila. Este último abre un popover con los tres pasos de selección; «Avanzar» muestra los documentos para contratación y el aviso sobre pruebas antidopaje. La lista no tiene desplazamiento interno; en pantallas muy bajas puede desplazarse el popover completo para mantener visible todo el contenido.

Las URL y los identificadores internos son en inglés; el contenido visible, las etiquetas accesibles, los valores predeterminados de las primitivas y los mensajes de estado son en español. El calendario compartido usa español por defecto. Las rutas y enlaces internos están centralizados en `apps/web/src/lib/routes.ts`.

En Vercel, `apps/web/vercel.json` reescribe las solicitudes de rutas de la SPA a `index.html`. Esto permite abrir o recargar directamente `/auth`, `/dashboard` y las demás rutas sin recibir un 404 del servidor estático.

El título de la pestaña cambia con cada ruta desde `apps/web/src/lib/page-title.ts`: Inicio usa «ViñoPlastic - Reclutamiento» y las demás páginas muestran un nombre breve en español. `apps/web/index.html` define el título inicial y carga `apps/web/public/favicon.svg`, basado en el símbolo de la marca. La ruta desconocida y los errores de carga también reciben un título propio.

## Autenticación

`/auth` acepta un nombre de usuario, no una dirección de correo. El cliente normaliza el usuario a minúsculas y lo convierte a `<usuario>@<dominio configurado>` antes de llamar a `supabase.auth.signInWithPassword`. Por ejemplo, con `VITE_AUTH_EMAIL_DOMAIN=reclutamiento.local`, `leonardo` corresponde a `leonardo@reclutamiento.local`. Solo se permite iniciar sesión con cuentas que ya existan en Supabase Auth; la aplicación no ofrece registro. Crea la cuenta y asigna su contraseña desde el panel de Supabase.

El acceso muestra una tarjeta compacta con un título, dos campos etiquetados y una sola acción. Usa el fondo neutro global, sin decoración adicional; los mensajes de error aparecen únicamente cuando corresponden. En móvil, los campos conservan texto de al menos 16 px para evitar el zoom automático al enfocarlos.

Copia `apps/web/.env.example` a `apps/web/.env.local` y configura `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_AUTH_EMAIL_DOMAIN`. Vite no lee `env.local` sin el punto inicial ni las variables `NEXT_PUBLIC_`. La clave pública está destinada al navegador; nunca coloques claves `service_role` o `sb_secret_` en variables `VITE_`. El archivo `.env.local` está ignorado por Git y debes reiniciar Vite al cambiarlo.

El panel espera a que `supabase.auth.getUser()` verifique la sesión y a que la cuenta esté registrada en `vacancy_editors` antes de consultar vacantes. Si no hay sesión, redirige a `/auth`; si no hay permiso, muestra acceso denegado. El botón «Cerrar sesión» elimina la sesión de este navegador. La autorización efectiva se aplica en la base mediante RLS; ocultar el panel por sí solo no concede ni protege acceso.

## Base de datos de vacantes

1. Configura `apps/web/.env.local` según `apps/web/.env.example`, con la URL, la clave publicable de Supabase y el dominio de correo del acceso. No añadas claves secretas ni `service_role` al cliente.
2. En un proyecto nuevo, ejecuta en orden [`20261015000000_vacancies.sql`](supabase/migrations/20261015000000_vacancies.sql), [`20261015010000_vacancy_salary_period.sql`](supabase/migrations/20261015010000_vacancy_salary_period.sql) y [`20261015020000_vacancy_shift.sql`](supabase/migrations/20261015020000_vacancy_shift.sql). En un proyecto ya configurado, ejecuta solo las migraciones pendientes. La última agrega el turno opcional y separa títulos existentes que terminan en «-Turno X». No ejecutes el esquema completo.
3. Crea la cuenta de editor en Supabase Auth desde el panel administrativo. Para habilitar a `leonardo@reclutamiento.local`, ejecuta en SQL Editor, después de crear la cuenta:

   ```sql
   insert into public.vacancy_editors (user_id)
   select id from auth.users where email = 'leonardo@reclutamiento.local'
   on conflict (user_id) do nothing;
   ```

   Comprueba que se insertó una fila. Cambia el correo si asignas otra cuenta. Para revocar acceso, elimina solo su fila de `public.vacancy_editors`; las vacantes permanecen.

La clave publicable puede estar en el navegador. RLS permite a cualquiera leer solo vacantes publicadas. Solo usuarios autenticados incluidos en `vacancy_editors` pueden leer borradores y crear, editar o eliminar vacantes. La tabla de editores no se expone directamente a `anon` ni a `authenticated`; la comprobación usa una función que consulta únicamente el ID de la sesión. La base vuelve a comprobar los estados válidos, la longitud de los campos y que una vacante publicada tenga descripción, jornada, sueldo y prestaciones.

Para cuidar el plan gratuito, los listados traen 12 vacantes por solicitud y seleccionan únicamente las columnas usadas. Búsqueda y filtros se resuelven en Supabase, con 350 ms de espera al escribir; las solicitudes obsoletas se cancelan. Las áreas públicas se consultan una vez por sesión de página y se invalidan al modificar vacantes. El resumen del panel usa una sola consulta agregada y se actualiza tras cambios; no hay suscripciones en tiempo real ni sondeos periódicos. Cada carga del listado también pide un conteo exacto para la paginación. Si el volumen crece mucho, conviene revisar este conteo y la búsqueda antes de añadir más consultas.

Si había vacantes reales en el almacenamiento de este navegador, el panel ofrece «Importar a Supabase». La importación excluye los ejemplos, conserva el respaldo local y los IDs originales, y no sobrescribe IDs que ya existan. Una vacante publicada sin detalles completos se importa como borrador para revisarla antes de publicarla. Si la importación falla, se puede reintentar sin duplicar los registros ya insertados. Revisa el contenido antes de importar: el respaldo local puede contener datos escritos por personas con acceso a ese navegador.

## Validación del formulario de vacantes

El turno se captura por separado del puesto y es opcional. Cuando se especifica, aparece como insignia junto al nombre de la vacante en el listado público y en el panel.

El modal divide la captura en cuatro pasos: puesto y ubicación, condiciones, descripción y jornada, y sueldo y prestaciones. Cada paso valida sus campos antes de avanzar; Anterior conserva los datos y el guardado final vuelve al primer campo inválido si cambió un paso previo. El modal muestra errores junto a cada campo al salir de él o al intentar avanzar. Los campos de texto eliminan espacios sobrantes al salir y al guardar; descripción y prestaciones conservan los saltos de línea. Se capitaliza únicamente la primera letra cuando corresponde, sin cambiar el resto del texto ni los nombres con mayúsculas internas. Horario y sueldo conservan su formato, por ejemplo `8:00 - 18:00` y `20000`.

Prestaciones de ley se incluye siempre. En la captura se pueden activar Fondo de ahorro, Vales de despensa y Transporte de personal solo cuando apliquen. El porcentaje del fondo es opcional y, si se captura, debe ser mayor que 0 y máximo 100. Otras prestaciones se pueden escribir por renglón. Los registros anteriores mantienen su campo de texto: IMSS, INFONAVIT, vacaciones y aguinaldo se agrupan visualmente como «Prestaciones de ley», mientras que las demás prestaciones reconocidas y cualquier texto adicional se conservan. La tarjeta pública muestra una sola entrada para las prestaciones de ley y las opciones aplicables.

Cada paso usa dos columnas en escritorio y una por debajo de 48 rem. Puesto, descripción y prestaciones ocupan todo el ancho disponible. Inputs y selector comparten altura y anchura de columna; las áreas de texto tienen más altura para redactar contenido. Solo el cuerpo del paso puede desplazarse cuando la altura de la pantalla es reducida; el encabezado y las acciones permanecen visibles.

Todos los campos principales son obligatorios; el porcentaje del fondo y las otras prestaciones son opcionales. Se respetan los límites de caracteres definidos en `vacancy-form-validation.ts`, se rechazan emojis y caracteres invisibles y no se acepta `Por definir` en los detalles de la vacante. La fecha debe ser real y cumplir el mínimo del control; al editar una vacante vencida se permite conservar su fecha anterior. El estado usa el `Select` compartido y presenta su nombre en español. La validación y normalización están centralizadas en `apps/web/src/features/vacancies/vacancy-form-validation.ts`.

## Estructura

- `apps/web/src/App.tsx`: navegación interna, historial y transición entre páginas.
- `apps/web/src/lib/route-loader.ts`: carga diferida y caché de módulos de página.
- `apps/web/src/features/landing/`: hero y estilos del inicio; `LandingHeader` selecciona la acción de cada página pública.
- `apps/web/src/features/about/`: página de Empresa, contenido corporativo, secciones y estilos propios.
- `apps/web/src/features/contact/`: página y estilos de Contacto.
- `apps/web/src/features/auth/`: formulario, conversión de usuario, verificación de sesión y protección del panel.
- `apps/web/src/features/vacancies/`: modelo, repositorio de Supabase, paginación, importación local opcional, listado público, tarjetas, formulario y panel de vacantes.
- `apps/web/src/features/vacancies/use-vacancy-masonry.ts`: mide la altura real de las tarjetas públicas con `ResizeObserver` y ajusta la cuadrícula de dos columnas cuando cambia una vista o el ancho disponible. Si el navegador no dispone de esa API, se conserva la cuadrícula normal.
- `supabase/migrations/`: esquema y políticas de acceso de vacantes.
- `apps/web/src/components/`: componentes propios de la aplicación, como la marca, `SiteHeader` y la tarjeta de contacto; sus CSS viven junto a ellos.
- `apps/web/src/lib/`: utilidades y constantes de rutas de la aplicación.
- `packages/ui/src/components/`: primitivas compartidas de shadcn/ui y `PageBackground`. Se importan mediante `@workspace/ui/components/<nombre>`.
- `packages/ui/src/hooks/` y `packages/ui/src/lib/`: lógica compartida por las primitivas UI.
- `packages/ui/src/styles/globals.css`: tema, fuentes, tokens, estilos base y clases compartidas.

Para crear una página, coloca su TSX y CSS en `apps/web/src/features/<feature>/`, añade una ruta inglesa a `routes.ts` y regístrala en `App.tsx`. Mantén sus textos visibles en español. Para una primitiva reutilizable entre aplicaciones, usa `packages/ui`; para una pieza específica de ViñoPlastic, usa `apps/web/src/components` o la carpeta de su feature. Reutiliza los controles de `@workspace/ui` antes de crear controles propios.

## Diseño y accesibilidad

La apariencia global sigue `apps/web/design.md` y se define en `packages/ui/src/styles/globals.css`. Usa los tokens semánticos de color, tipografía, pesos, espacio y radios. Inter Variable se usa en todos los textos. La escala de espacio parte de `--space-1` (4 px). `--page-gutter` y `--container-max` gobiernan el ancho de todas las páginas; aplica `page-container` al contenido de páginas futuras. La clase `skip-link` compartida ofrece navegación directa al contenido principal.

`SiteHeader` comparte marca, altura y comportamiento responsive. Se desplaza con la página y alinea su contenido con las secciones mediante un único `page-container`. Acepta un enlace de acción, un control personalizado o ninguna acción. Inicio, Contacto y Vacantes usan enlaces; Dashboard muestra el botón para cerrar sesión. Los estilos del header están en `apps/web/src/components/site-header.css` y no dependen de variables definidas por una página concreta.

Todas las páginas existentes usan `PageBackground` detrás del contenido. La primitiva comparte el lienzo blanco del tema y añade un degradado neutro y un aro fino en la primera altura de pantalla. También se aplica al esqueleto inicial para evitar un cambio brusco de fondo.

El foco de teclado usa `--outline-width` y `--focus-ring`, derivado del primario. Los campos y selectores muestran un único borde de foco; los demás controles usan un contorno fino. No añadas anillos o contornos de foco en los CSS de cada página. Los campos editables mantienen al menos 16 px en dispositivos táctiles para evitar el zoom automático al enfocarlos, sin restringir el zoom manual. La carga inicial de una ruta muestra un esqueleto de página. Durante la navegación interna se conserva la página anterior hasta que la nueva está lista y Motion anima el cambio respetando el movimiento reducido. Los enlaces conservan su semántica nativa, la apertura en otra pestaña y el historial del navegador. El filtro de estado del panel usa el `Select` compartido de shadcn/ui.

Los estilos específicos de una pantalla pueden definir geometría de ilustraciones y composición local, pero deben usar los tokens globales para decisiones repetidas de diseño. Los breakpoints del tema son xs, md, lg y xl. Revisa también los estados de foco, los nombres accesibles, la navegación con teclado y la preferencia de movimiento reducido al añadir interfaces nuevas. Usa HTML semántico y los componentes de formulario y diálogo de shadcn/ui.

## Desarrollo y validación

Desde la raíz:

```sh
npm install
npm run dev --workspace=web
npm run typecheck
npm run lint
npm run build
```

En PowerShell administrado, usa `npm.cmd` si `npm.ps1` está bloqueado. El servidor de desarrollo y la revisión visual en navegadores no sustituyen el typecheck, lint ni build; comprueba por separado escritorio, móvil, teclado y zoom antes de publicar.

Si Vite no puede iniciar su cargador de configuración por restricciones de procesos en Windows con Node 24, usa `npm.cmd exec --workspace=web -- vite build --configLoader native` para verificar el bundle.

## Límites actuales

La migración SQL y el alta de al menos un editor deben ejecutarse en el proyecto de Supabase antes de que funcionen los listados y el panel. Este repositorio no incluye credenciales administrativas ni despliega cambios de esquema por sí solo. No hay postulaciones en línea ni gestión de candidatos.
