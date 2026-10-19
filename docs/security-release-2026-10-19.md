# Correcciones de seguridad — ViñoPlastic

## Estado y alcance

Preparadas en el repositorio; **no aplicadas a Supabase ni desplegadas en Vercel**.
Se conservan `/`, `/vacancies`, las demás rutas, el diseño y los datos existentes.
No se añade un formulario de postulación ni se cambia el proveedor de autenticación.

### Cambios incluidos

- Vacantes vencidas: ocultas por RLS y por la consulta pública, incluso si quien navega es editor. La fecha se interpreta en `America/Mexico_City`; el día límite es inclusivo. Gestión conserva los registros y muestra «Vencida».
- Archivado recuperable: sustituye la eliminación física. El filtro «Archivadas» permite restaurar; restaurar no cambia la fecha ni el estado de publicación. Los editores pierden DELETE, incluso mediante REST directo.
- Versiones de registros: cada cambio usa la versión leída y la incrementa. Si alguien guardó antes, se rechaza la edición antigua y el formulario conserva su contenido. Los metadatos de creación no se pueden reescribir.
- Historial de cambios: captura antes/después y actor; los editores pueden leerlo pero no escribirlo ni borrarlo. No se reconstruye el historial anterior a la migración. Esta fase no añade un visor de historial.
- Creación repetida: cada formulario mantiene un identificador; un reintento no duplica la vacante. Si el contenido cambió tras un guardado cuya respuesta se perdió, se informa para revisar Gestión.
- Validación SQL de turno, período y formato de sueldo al publicar/modificar el contenido de una vacante publicada. Los registros históricos incompletos pueden conservarse sin inventar datos; una importación incompleta publicada se convierte en borrador. El formulario sigue exigiendo los campos. El archivado/restauración preserva los valores históricos.
- Registro de analítica por `/api/analytics`, con validación estricta, origen canónico y un identificador por acción. Se conservan los identificadores anónimos existentes y las series históricas. La deduplicación por recibo cubre dos días; no deben reintentarse acciones anteriores a esa ventana.
- Los antiguos RPC públicos de escritura quedan sin EXECUTE para navegadores. El nuevo RPC solo admite la cuenta de servicio del servidor. Las estadísticas y los controles internos no se exponen directamente.
- Cuotas compartidas en PostgreSQL: 120 acciones/minuto por dirección de origen, 3,000/día por origen y 50,000/día globales. Repetir el recibo de una misma acción no incrementa contadores. Se excluyen preview y desarrollo.
- La dirección IP se procesa en el servidor y se transforma con HMAC y rotación diaria. No se guarda la IP original ni se envían nombres, teléfonos o identificadores de vacantes a estadísticas. Esto sigue siendo información seudónima; no equivale a anonimato absoluto.
- Limpieza acotada solo de recibos y cuotas temporales de más de dos días. **No se eliminan visitas ni interacciones históricas.** La limpieza se ejecuta cuando entran acciones aceptadas; durante inactividad esos buffers pueden durar más de dos días. No hay cron nuevo.
- Cabeceras contra incrustación, MIME sniffing, permisos innecesarios y fuga de referencias. La CSP incluida restringe objetos, base URL y marcos que incrusten el sitio; todavía no impone una lista de scripts/estilos/conexiones.
- Rechazo de claves privilegiadas detectables en variables `VITE_` durante el build. No sustituye la revisión de secretos del administrador.
- Retiradas dependencias de scaffolding sin uso que arrastraban el paquete señalado en la auditoría.
- Typecheck real de aplicación y servidor; pruebas de RLS/SQL con PostgreSQL en memoria, servidor de métricas y regresiones del cliente. CI sin secretos ni despliegue.
- El teléfono que sale durante la animación deja de recibir foco y de exponerse a tecnologías de asistencia.

## Activación coordinada (pendiente)

1. Confirmar el proyecto y respaldar vacantes, editores y estadísticas mediante herramientas administrativas. Verificar que el respaldo sea recuperable. Guardar los totales previos y ejecutar únicamente `supabase/operations/security-preflight-readonly.sql` para contrastar el estado real.
2. Revisar las migraciones que ya están aplicadas. Las migraciones anteriores a `20261019` son prerrequisito; **no volver a ejecutar todo el esquema ni migraciones ya aplicadas**. Resolver cualquier diferencia antes de continuar.
3. Configurar **solo para Production, en variables cifradas del servidor de Vercel**:
   - `SUPABASE_URL`: URL del mismo proyecto.
   - `SUPABASE_SECRET_KEY`: clave secreta de servidor o la clave heredada `service_role`.
   - `ANALYTICS_HASH_SECRET`: valor aleatorio fuerte de al menos 32 caracteres, distinto de otras claves.
     Nunca usar el prefijo `VITE_` para estos secretos, ni incorporarlos al repositorio. El cliente conserva únicamente su clave pública. No imprimir secretos en logs.
4. Confirmar que el proyecto Vercel usa `apps/web` como directorio raíz y reconoce `api/analytics.ts` como Function de Node; la salida estática por sí sola no incluye el colector. Comprobar Node 24 y el dominio canónico `https://www.vinoplasticrys.lat`.
5. Preparar el despliegue completo con API y cliente, validar en preview con dobles o un proyecto de pruebas. Preview no registra métricas en producción.
6. En una ventana coordinada, pausar la edición en el panel, aplicar exclusivamente y en orden:
   - `20261019000000_vacancy_integrity.sql`
   - `20261019010000_analytics_collector.sql`
     Después publicar/promover el cliente y la Function de esta misma revisión. El frontend nuevo necesita las columnas nuevas. Los clientes antiguos fallarán al escribir con versiones antiguas; deben recargar. Entre la revocación del RPC anterior y la publicación nueva no se registrará parte del tráfico; nunca reabrir el RPC público como fallback.
7. Repetir preflight. Confirmar: anon/auth sin acceso al colector y a los RPC antiguos; solo service_role puede llamar el nuevo colector; editores sin DELETE; políticas y funciones con `search_path` cerrado; totales históricos conservados.
8. Probar como visitante y como editor: inicio → listado → detalle → transporte → WhatsApp; comprobar un evento por acción y resumen actualizado. Probar vencidas, archivado/restauración y conflicto entre dos pestañas. Un clic a WhatsApp sigue sin confirmar una conversación o contratación.
9. Confirmar cabeceras HTTP en páginas y API, que `/api/analytics` devuelve 204 para acciones válidas y rechaza solicitudes inválidas. Observar errores 429/503 sin registrar payloads. Ajustar cuotas si las redes compartidas legítimas alcanzan el límite.

### Si falla la activación

Mantener los datos y suspender escrituras desde el panel hasta corregir hacia delante. No borrar columnas ni historial para volver atrás; no restaurar permisos anónimos de estadísticas. Un frontend anterior no es compatible con la nueva obligación de versión. Una recuperación desde respaldo requiere un procedimiento administrativo revisado, evitando sobrescribir datos posteriores.

## Conservación: decisión del usuario

Conservar todas las estadísticas históricas por ahora. `analytics-retention-preview.sql` permite comparar volúmenes de 30/90/180/365 días **solo en lectura**. Antes de activar una futura retención: acordar plazo y finalidad, archivar si se necesita conservar comparativos, comprobar respaldo/restauración y aprobar por separado la eliminación y su calendario. No existe tarea programada para purgar estadísticas ni historial de vacantes.

## Pendiente de acceso administrativo

No se han inspeccionado ni cambiado configuraciones remotas: usuarios editores reales, otras funciones/políticas fuera de las migraciones, backups, rate limits de Auth, registro público de usuarios, duración/rotación de sesiones, MFA, Vercel WAF, variables desplegadas y estado de migraciones. Verificar cada punto con el administrador. No es posible asegurar desde estos archivos que producción ya esté protegida.

MFA requiere primero enrolamiento y recuperación de acceso y después políticas AAL2. No activar una exigencia de segundo factor sin preparar el flujo y las cuentas existentes. Mantener la renovación de sesiones del SDK; RLS sigue siendo la autorización real. Si una sesión es robada, conserva su alcance hasta su caducidad/revocación según la configuración de Auth.

Los límites del colector reducen abuso, pero `Origin` no prueba que una solicitud sea humana; redes distribuidas aún pueden consumir cuotas. El endpoint sigue recibiendo tráfico antes de llegar al límite SQL. Revisar WAF/observabilidad y, si existe abuso real, añadir un desafío verificado por el servidor sin impedir el recorrido accesible.

Quedan como mejoras opcionales independientes las páginas SEO por vacante y la optimización de búsqueda de gran volumen; no se cambian rutas en esta corrección.

## Verificación reproducible

Con Node 24 y dependencias instaladas:

```sh
npm run typecheck
npm run lint
npm test
npm run build --workspace web -- --configLoader native
npm audit
git diff --check
```

Las pruebas SQL crean roles y una implementación local mínima de `auth.uid()`; no prueban el gateway PostgREST, Supabase Auth real, red distribuida ni configuración de Vercel. Los dobles del cliente no sustituyen la prueba de aceptación en el despliegue. Las comprobaciones visuales locales no certifican producción.

### Resultado local del 19 de octubre de 2026

- 22 pruebas automatizadas aprobadas, incluyendo permisos con grants predeterminados amplios, protección de la secuencia del historial, versiones, cuotas y conservación de estadísticas de 2020.
- Typecheck de ambos paquetes, lint y compilación web aprobados.
- `npm audit`: cero vulnerabilidades conocidas en el árbol final consultado. Esto no garantiza ausencia de fallos desconocidos.
- Chromium con peticiones externas interceptadas y datos simulados: recorrido público a 320, 390, 768 y 1280 px, detalle de vacante, filtros de transporte, ausencia de desbordamiento horizontal y movimiento reducido. Se revisaron capturas móviles.
- Panel con sesión simulada: conflicto de guardado conserva el borrador, archivado/filtro/restauración, resumen de 30 días y cierre de sesión. Visitante sin sesión y cuenta sin rol editor quedan bloqueados.
- Durante la rotación solo el teléfono actual resulta accesible; con movimiento reducido los tres se muestran estáticos.
