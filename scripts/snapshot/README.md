# Generador De Snapshots

Generador local para el snapshot de transporte que usa el runtime RAPTOR de
Buses CR. El alcance inicial está centrado en corredores de validación de Costa
Rica, empezando por Cartago.

## Comandos

Desde la raíz del repo:

```bash
npm run snapshot:test
npm run snapshot:dev -- --scope=cartago --out=./local-snapshots
npm run snapshot:verify -- --in=./local-snapshots/<snapshot>.bin.gz
```

La ruta preferida de base de datos es `SNAPSHOT_DATABASE_URL` con conexión
directa por `pg`. Si no está presente, el generador puede caer a
`SUPABASE_URL`/`SUPABASE_ANON_KEY` o a las variables públicas existentes de Expo
cuando el entorno lo permite.

## Alcance

Este paquete no sube archivos a Supabase Storage, no escribe `app_config` y no
importa `minotor/parser`.

## Fixtures Reales

Los fixtures de regresión de linearización viven en
`tests/fixtures/pattern-*.json`.

`tests/fixtures/_dump.sql` documenta la consulta usada para refrescar fixtures
desde el entorno local de validación. El nombre histórico `prueba_*` en algunos
SQL significa que el archivo nació como seed o corrección de laboratorio; no es
un entorno separado que venga incluido en el repo público.
