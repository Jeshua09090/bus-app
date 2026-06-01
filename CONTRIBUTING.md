# Contribuir

Gracias por ayudar a mejorar Buses CR.

El proyecto todavía está temprano, así que las mejores contribuciones son
concretas y verificables. El conocimiento local vale muchísimo: nombres de
paradas, referencias, variantes de ruta, transbordos reales y casos donde el
planner se equivoca.

## Buenas Primeras Áreas

- documentar corredores, paradas, variantes y puntos de transbordo reales
- agregar casos pequeños de validación con origen/destino claro
- mejorar accesibilidad móvil, estados de carga e interacción con el mapa
- simplificar setup y documentación de entorno
- reportar resultados confusos del planner con datos suficientes para repetirlos

## Setup Local

Usá Node `24.11.0` o compatible y npm `11.5.2` o superior. El CI corre con esa
versión para mantenerse alineado con `minotor` y el lockfile.

```bash
npm install
npm run start
```

Para lint:

```bash
npm run lint
```

Checks útiles antes de abrir PR:

```bash
npx tsc --noEmit
npm audit --audit-level=high
npm --prefix scripts/snapshot audit --audit-level=high
npm run raptor:test
npm run snapshot:test
```

No todos los cambios necesitan correr todo. Si un flujo depende de datos privados
de Supabase o de tokens locales, explicá qué no se pudo reproducir en vez de
inventar resultados.

## Estilo De Contribución

- Mantené cada PR enfocado en un solo tema.
- Preferí TypeScript para código de app.
- Usá `@rnmapbox/maps` para mapas.
- No subás secretos, tokens, logs locales ni datasets privados.
- Para cambios de datos de transporte, indicá corredor/ruta y por qué el cambio
  es válido localmente.
- Para cambios del planner, incluí al menos un caso antes/después o una nota de
  validación.
- Para cambios visuales, las capturas ayudan, pero no son obligatorias si el
  cambio no toca UI.

## Reportar Problemas De Rutas

Cuando reportés un problema del planificador, incluí:

- origen y destino
- hora aproximada de salida
- ruta o transbordo esperado
- ruta que mostró la app
- si el problema parece de caminata, espera, ruta elegida, punto de transbordo o
  datos faltantes

## Pull Requests

Antes de abrir un pull request:

- corré el check más pequeño que realmente aplique
- explicá supuestos de datos o variables de entorno
- marcá cualquier cosa que todavía necesite validación en calle
- mantené el texto humano: qué cambió, por qué importa, cómo se revisó

English is welcome in issues or PRs. Spanish is the source language for the
project docs because the first users and validation context are in Costa Rica.
