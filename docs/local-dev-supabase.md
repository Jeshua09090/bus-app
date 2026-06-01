# Desarrollo Local Con Supabase

Este repo puede usar una base local de Supabase con Docker para probar cambios
de datos sin tocar el proyecto remoto.

Este flujo es principalmente para maintainers. Un clon público no trae una base
Supabase completa ni un seed nacional; los cambios SQL revisables viven en
`sql/`, y los dumps o seeds grandes se generan localmente cuando haga falta.

## Cuándo Usar Esto

Usá Supabase local antes de cambios de datos que necesiten regenerar snapshots:
ventanas de servicio, paradas por patrón, enlaces de transbordo o seeds del
runtime.

Local no es una preview branch de Supabase. Es una base Docker aislada para
iterar. Los cambios remotos deben pasar por SQL revisable antes de aplicarse.

## Requisitos

- Docker Desktop con backend WSL2 corriendo.
- Supabase CLI vía `npx supabase@latest`.
- Acceso a un proyecto Supabase con el schema/datos correctos, solo si vas a
  regenerar snapshots reales.

No corrás `supabase migration repair` solo porque `db pull` reporte diferencias
entre historial local y remoto. Ese comando muta el historial remoto de
migraciones. Para este repo, preferí dumps deliberados y SQL revisable.

Si no tenés acceso al proyecto Supabase, todavía podés revisar la app, el
runtime RAPTOR, los tests unitarios y la documentación.

## Setup Local

Arrancar la base local:

```powershell
npx supabase start
```

URLs locales:

- Studio: `http://127.0.0.1:54323`
- Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- API: `http://127.0.0.1:54321`

`npx supabase status` es el check principal. El collector local `vector` puede
reiniciarse en Docker Desktop si no logra leer logs, pero DB/API/Studio siguen
sirviendo para snapshots y cambios de datos mientras `supabase status` reporte
el stack corriendo y `supabase_db_busescr` esté sano.

Detener el stack:

```powershell
npx supabase stop
```

## Schema Y SQL Revisable

El repo público no depende de una carpeta `supabase/migrations/` ya generada.
Los cambios SQL revisables se guardan en `sql/`.

Cuando un maintainer necesite reconstruir una base local completa, puede generar
un baseline local con Supabase CLI. Ese archivo debe revisarse antes de
committearse, y no debe incluir datos privados.

Si el schema remoto debe refrescarse, hacelo deliberadamente:

```powershell
npx supabase db dump --linked --schema public --file supabase/migrations/<timestamp>_remote_schema_baseline.sql
```

Review the generated SQL before using it as a new baseline.

## Seed De Datos

`supabase db pull` solo sincroniza schema, no datos. La generación de snapshots
RAPTOR necesita tablas de transporte pobladas.

Crear un dump solo de datos:

```powershell
npx supabase db dump --linked --data-only --schema public --use-copy --file supabase/seed.sql
```

`supabase/seed.sql` está ignorado por Git porque es grande y depende del entorno.

El seed runner del CLI puede fallar con dumps `COPY` grandes. En ese caso cargá
el seed directo en Postgres local:

```powershell
docker cp supabase\seed.sql supabase_db_busescr:/tmp/busescr_seed.sql
docker exec supabase_db_busescr psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/busescr_seed.sql
```

Si el seed falla después de cargar las tablas críticas para RAPTOR, verificá esas
tablas antes de reintentar. Puede aparecer un fallo no bloqueante al compilar
funciones CTP de staging que referencian tipos geometry sin schema explícito.

Conteos esperados para tablas críticas de RAPTOR después de un seed remoto
fresco, antes de SQL local-only:

| Table | Expected Count |
| --- | ---: |
| `rutas` | 162 |
| `route_patterns` | 169 total, 167 active for snapshot |
| `service_windows` | 1027 |
| `paradas` | 2896 |
| `route_pattern_stops` | 13791 total, 13721 active for snapshot |
| `planner_boarding_points` | 24885 |
| `planner_transfer_edges` | 49586 |

## Generar Snapshot Contra DB Local

Apuntar el generador al Postgres local:

```powershell
$env:SNAPSHOT_DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres'
npm run snapshot:dev
Remove-Item Env:SNAPSHOT_DATABASE_URL
```

Empaquetar el snapshot generado en la app:

```powershell
npm run snapshot:bundle
```

Validate:

```powershell
npm --prefix .\scripts\snapshot test
npm --prefix .\scripts\snapshot run typecheck
npm run raptor:test
npm run raptor:golden
npm run raptor:outward-discovery
```

Baseline actual verificado con datos remotos:

- Snapshot: `v20260521T204708Z-cartago-local`
- `npm --prefix .\scripts\snapshot test`: 37/37 pass
- `npm --prefix .\scripts\snapshot run typecheck`: pass
- `npm run raptor:test`: 126/126 pass
- `npm run raptor:golden`: 65/65 pass+acceptable, 52 strict PASS
- `npm run raptor:spot-check`: 20/20
- `npm run raptor:outward-discovery`: 14 expected + 1 acceptable, 0 watches,
  0 data gaps

El proyecto remoto incluye estos arreglos de datos validados primero en local:

- `sql/cartago_outward_cartago_ice_special_windows_v1.sql`
- `sql/cartago_outward_route4692_westside_reactivation_v1.sql`

Los rollbacks se escribieron y probaron localmente antes de aplicar remoto:

- `sql/cartago_outward_cartago_ice_special_windows_v1_rollback.sql`
- `sql/cartago_outward_route4692_westside_reactivation_v1_rollback.sql`

Conteos locales críticos post-FU1/FU2:

| Metric | Count |
| --- | ---: |
| `route_patterns` total | 169 |
| `route_patterns` active | 169 |
| `service_windows` active | 1013 |
| `service_windows` total | 1029 |
| `route_pattern_stops` | 13791 |
| `planner_transfer_edges` | 49586 |

## Hallazgo Local Conocido

Postgres local devuelve ids `bigint` como strings a través de `pg`. El generador
de snapshots no debe comparar `row.id` crudo contra ids numéricos parseados con
igualdad estricta al unir metadatos de ruta. `scripts/snapshot/src/read-postgres.ts`
arma los route patterns desde cada fila para que `route_name` use
`rutas.nombre_ruta`, mientras `pattern_name` conserva etiquetas direccionales
como `/ IDA` y `/ VUELTA`.

## Patrón Para Aplicar Remoto

Para arreglos de datos:

1. Aplicar y validar SQL localmente.
2. Regenerar el snapshot local y correr los checks RAPTOR relevantes.
3. Preparar SQL revisable para remoto.
4. Aplicar remoto de forma deliberada con CLI o SQL editor.
5. Regenerar y empaquetar el snapshot de producción.

No usés `db push` automático para arreglos de datos no revisados.

## Nota De Seguridad

Las tablas legacy de rutas y trazas pueden aparecer en Supabase Advisors si RLS
está apagado o si las políticas son demasiado amplias. No activés RLS a ciegas:
puede romper lecturas/escrituras si no hay políticas correctas.

Para tablas de solo lectura pública, las políticas deben ser explícitas. Para
tablas con GPS, trazas o datos operativos, el acceso debe limitarse a dueños,
roles internos o administradores antes de producción.

La acción mínima para una tabla candidata es:

```sql
ALTER TABLE public.ruta_puntos ENABLE ROW LEVEL SECURITY;
```

Agregá políticas que correspondan al modelo de acceso antes de aplicar esto en
remoto.
