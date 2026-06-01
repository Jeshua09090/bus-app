# Roadmap

Buses CR se está construyendo en pasos pequeños y verificables. La idea no es
pretender que todo el país queda resuelto de una vez, sino mejorar cada corredor
con evidencia antes de ampliar cobertura.

## Ahora

- Mejorar la calidad del planner en los primeros corredores de validación.
- Validar el runtime RAPTOR contra viajes reales locales.
- Mantener posiciones en vivo livianas con Supabase Realtime Broadcast.
- Preservar una interfaz móvil primero, con mapa y controles sobre el mapa.
- Hacer que el repo público sea más fácil de revisar y contribuir.

## Siguiente

- Publicar casos de validación más claros para el planner.
- Ampliar cobertura de rutas y paradas fuera del núcleo inicial de Cartago.
- Mejorar onboarding y setup para contribuidores.
- Endurecer tracking de choferes y comportamiento de ubicación en segundo plano.
- Documentar mejor los supuestos de datos de transporte.

## Después

- Ampliar cobertura nacional corredor por corredor.
- Soportar estados de servicio, alertas y cambios históricos de ruta.
- Mejorar flujos offline-friendly para pasajeros.
- Separar tooling reutilizable de planner/datos cuando pueda ayudar a otros
  proyectos de transporte.

## No Objetivos Por Ahora

- No prometer cobertura oficial completa.
- No escribir posiciones en vivo con frecuencia alta en la base de datos.
- No rediseñar con supuestos desktop-first.
- No activar RAPTOR por defecto hasta tener suficiente validación real.
