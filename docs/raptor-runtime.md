# Runtime RAPTOR

Buses CR está moviendo la planificación de viajes fuera de RPCs lentos en base
de datos y hacia un runtime de transporte que pueda correr en el dispositivo.

La versión pública actual incluye:

- un snapshot de tránsito, con alcance inicial en corredores de validación
- generación y verificación de snapshots en `scripts/snapshot/`
- un planner RAPTOR en memoria en `lib/raptor/`
- pantallas y scripts de planner-lab para inspeccionar decisiones de ruta
- tests de regresión para casos locales de Costa Rica

## Forma Del Runtime

El runtime sigue detrás de feature flag. Producción puede seguir usando el
planner legacy mientras RAPTOR se valida con viajes reales.

Flujo general:

1. `scripts/snapshot/` lee las tablas de runtime de transporte.
2. El generador empaqueta un snapshot compatible con Minotor.
3. `scripts/bundle-snapshot.mjs` copia el snapshot comprimido a assets de la app.
4. `lib/raptor/snapshot-cache.ts` carga y cachea el snapshot en el dispositivo.
5. `lib/raptor/find-journeys.ts` ejecuta la búsqueda de viajes.
6. `lib/raptor/result-mapper.ts` mapea el resultado al shape que ya entiende la
   UI.

La app reutiliza `PlannedJourney` y `JourneyLeg` del planner legacy para no
mantener dos modelos paralelos en la UI de pasajeros.

## Restricciones Importantes

- `minotor` está fijado exactamente en `11.2.2`.
- El código de app importa desde `minotor`, no desde `minotor/parser`.
- El feature flag sigue apagado por defecto.
- El snapshot está empaquetado como asset local; todavía no hay descarga desde
  Supabase Storage.
- Las reglas de ranking deben respaldarse con casos de validación, no con
  intuición.

## Comandos De Validación

```bash
npm run raptor:test
npm run raptor:golden
npm run raptor:perf-p95
npm run snapshot:test
```

Algunos scripts necesitan variables de entorno y datos locales de Supabase. Los
tests unitarios y los tests del paquete de snapshot son la entrada más simple
para reviewers desde un clon limpio.

## Por Qué Es Público

Este trabajo está público para que el algoritmo, los tests y el runtime se
puedan revisar sin publicar notas privadas, logs locales ni scratchpads de
planificación. La meta es mostrar la arquitectura concreta que eventualmente
reemplazará el planner viejo basado en base de datos.
