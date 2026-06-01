# Buses CR

**English:** see [README.en.md](./README.en.md).

Buses CR es una app móvil open source para entender mejor los buses en Costa
Rica. Está hecha con Expo, React Native, Mapbox y Supabase.

El proyecto empezó en Cartago porque ahí tenemos los primeros datos, casos de
validación y pruebas de buses en vivo más trabajados. Ese enfoque local es el
punto de partida, no el límite. La meta es una app nacional que pueda manejar la
realidad del transporte público tico: paradas informales, rutas con variantes,
transbordos que dependen del conocimiento local y datos oficiales que no siempre
vienen listos para usar.

## Qué Es

Buses CR une tres líneas de trabajo:

- una app móvil para pasajeros, con mapa como centro de la experiencia
- herramientas de chofer/ubicación para visibilidad de flota en tiempo real
- experimentos de planificación de viajes, incluyendo transbordos y el nuevo
  runtime RAPTOR

La etapa actual es primero algoritmo. Las capturas y videos públicos vendrán
después; por ahora lo más importante es que el planificador sea rápido, honesto
y validado contra corredores reales.

## Por Qué Importa

Planificar viajes en bus en Costa Rica no es solo dibujar una línea en un mapa.
Para que una recomendación sirva de verdad hay que lidiar con detalles que los
mapas genéricos suelen ignorar:

- paradas que la gente conoce por referencia, no por nombre oficial
- variantes de ruta que comparten varios kilómetros y luego se separan
- paradas cercanas que no siempre son las paradas útiles
- transbordos que son obvios para alguien local, pero invisibles en datos crudos
- poca visibilidad en vivo fuera de algunas experiencias comerciales cerradas

Buses CR nace desde esa realidad. La idea es construir guía práctica para la
gente que sí usa bus, y dejar herramientas abiertas para que más corredores se
puedan validar con el tiempo.

## Estado Actual

El proyecto está activo y en una etapa temprana. No es una app de autoridad de
tránsito en producción, ni promete cobertura nacional completa todavía.

Hoy el foco está en:

- mejorar precisión y velocidad del planificador
- validar el runtime RAPTOR contra viajes locales reales
- mantener el planificador anterior como respaldo
- mejorar datos de rutas, paradas y transbordos
- sostener una experiencia móvil primero, con mapa y controles flotantes
- documentar el trabajo de forma que otras personas puedan revisarlo

## Capacidades Actuales

- app móvil con Expo Router para flujos de pasajero y chofer
- mapa de pasajero con Mapbox
- transmisión de posiciones en vivo con Supabase Realtime Broadcast
- simulador local de flota
- metadatos de rutas y paradas para los primeros corredores de validación
- búsqueda de viajes y presentación de itinerarios
- runtime RAPTOR en memoria alimentado por snapshots versionados
- scripts de validación local para comparar comportamiento del planificador

## Stack Técnico

| Capa | Tecnología |
| --- | --- |
| App móvil | Expo SDK 54, React Native 0.81, React 19 |
| Lenguaje | TypeScript |
| Navegación | Expo Router v6 |
| Mapas | `@rnmapbox/maps` |
| Backend | Supabase JS v2 |
| Tiempo real | Supabase Realtime Broadcast |
| Ubicación | `expo-location`, `expo-task-manager` |
| UI/movimiento | Reanimated, Gesture Handler, Gorhom Bottom Sheet |

## Trabajo Del Algoritmo

El foco principal de ingeniería es mover la planificación de viajes fuera de
RPCs lentos en base de datos y hacia un runtime móvil:

- cargar un snapshot versionado de la red de transporte
- ejecutar búsqueda de rutas en memoria, en el dispositivo
- mantener el planner legacy como fallback mientras madura RAPTOR
- validar con casos locales curados antes de ampliar cobertura
- preferir evidencia de corredores reales sobre fixtures inventados

Ver [docs/raptor-runtime.md](./docs/raptor-runtime.md) para la arquitectura
pública del runtime y sus notas de validación.

## Para Revisores

La superficie más útil para revisar hoy es:

- `lib/raptor/` para el runtime de planificación
- `scripts/snapshot/` para generación y verificación de snapshots
- `docs/raptor-runtime.md` para el mapa de arquitectura
- tests de RAPTOR y snapshot para validar regresiones
- issues abiertos para próximos pasos públicos

Checks útiles desde un clon limpio:

```bash
npm run lint
npx tsc --noEmit
npm audit --audit-level=high
npm --prefix scripts/snapshot audit --audit-level=high
npm run raptor:test
npm run snapshot:test
```

Algunos scripts necesitan datos de Supabase o variables privadas. Cuando un flujo
depende de datos que no vienen con el repo, la documentación debe decirlo de
frente en vez de fingir que hay un demo completo.

## Requisitos Locales

El CI usa Node `24.11.0`. Para evitar diferencias raras con `minotor` y el
lockfile, usá:

- Node `24.11.0` o compatible
- npm `11.5.2` o superior

Instalación:

```bash
npm install
```

Arrancar Expo:

```bash
npm run start
```

Scripts frecuentes:

```bash
npm run web
npm run lint
npm run android
```

Variables de entorno comunes:

- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_PLACES_KEY`
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`
- `EAS_PROJECT_ID`, si se compila con EAS
- `EXPO_PUBLIC_PARTIAL_PLANNER_PROJECT_REFS`, solo para fallbacks de maintainers

Ver [.env.example](./.env.example) para el formato esperado. Un clon limpio
puede levantar el shell de la app, pero el planner y la flota en vivo dependen de
datos configurados.

## Estructura Del Repo

- `app/` - pantallas y rutas de Expo Router
- `components/` - componentes móviles compartidos
- `context/` - estado global como sesión y rol
- `hooks/` - hooks reutilizables de React Native
- `lib/` - planner, Supabase, rutas, ubicación y utilidades centrales
- `scripts/` - simulación, snapshots y herramientas locales
- `assets/` - íconos, snapshots y assets estáticos
- `sql/` - cambios SQL revisables para datos, runtime y soporte de planner

## Contribuir

Las contribuciones son bienvenidas, especialmente en validación de rutas, datos
locales de transporte, casos de prueba del planner, pulido de UX móvil y
documentación. Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licencia

MIT. Ver [LICENSE](./LICENSE).
