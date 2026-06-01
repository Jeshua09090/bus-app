# Seguridad

Buses CR es una app de transporte en etapa temprana, no un sistema de autoridad
de tránsito en producción. La seguridad se trabaja por capas prácticas: mantener
secretos fuera del repo, hacer visibles los riesgos de ubicación y tratar las
políticas de Supabase como parte del diseño, no como un detalle final.

## Reportar Un Problema

Para reportes privados, usá GitHub Security Advisories:

<https://github.com/Jeshua09090/buses-cr/security/advisories/new>

Si no podés usar advisories, abrí un issue con solo detalles no sensibles y decí
que tenés un posible problema de seguridad para coordinarlo en privado.

No incluyás tokens, dumps de base de datos, coordenadas privadas, datos de
usuarios, llaves de Supabase, tokens de Mapbox ni URLs internas en issues
públicos.

## Alcance Actual

El repo público cubre:

- app móvil Expo/React Native
- runtime RAPTOR y herramientas de snapshot
- SQL revisable para datos y soporte del planner
- documentación, templates y scripts locales

El proyecto todavía no maneja una operación pública de producción con choferes o
pasajeros reales a escala. Cualquier flujo que use trazas GPS o ubicación de
flota debe tratarse como sensible antes de producción.

## Notas Vigentes

- Las variables `EXPO_PUBLIC_*` son configuración publicable del cliente, no
  secretos.
- Tokens privados, dumps locales, logs generados y seed data deben quedarse fuera
  de Git.
- Las posiciones en vivo usan Supabase Realtime Broadcast durante validación.
  Antes de producción hay que endurecer autenticación de choferes y autorización
  de canales.
- Los SQL de trazas de ruta ayudan para trabajo de datos, pero las trazas GPS son
  sensibles. Cualquier uso productivo debe limitar lectura/escritura a dueños,
  roles operativos o administradores.
- Llaves antiguas de Mapbox o Supabase que hayan sido compartidas fuera del repo
  deben rotarse.
- El CI bloquea advisories de severidad alta. Los advisories moderados que vienen
  de la cadena de Expo deben manejarse con upgrades normales de SDK, no forzando
  saltos grandes dentro de una rama de revisión.

Este archivo no afirma que la app tenga una auditoría formal. Es una descripción
honesta del estado actual y de los riesgos que no queremos esconder.
