# Historial de cambios

## 2026-10 — Carga y compatibilidad

- Modo ligero automático: si el navegador pierde el contexto WebGL, la página se recarga con `?ligero` (#11).
- Navegación con EarthControls: la rueda acerca hacia el punto bajo el cursor y arrastrar desplaza el terreno (#10).
- Workers LAZ con 16 MB de memoria en lugar de 112 MB mediante `laz-worker.js` (#9).
- Se quitó la precarga de workers LAZ y se detecta WebGL limitado (Brave con bloqueo estricto de huellas) con un mensaje que explica cómo resolverlo (#7, #8).
- Detección de WebGL antes de iniciar el visor y manejo de la pérdida de contexto.
- Precarga de `cloud.js` y del nodo raíz, scripts con `defer` y presupuesto de puntos reducido en equipos de gama baja (#5, #6).

## 2025-11 — Refactorización (v2.0.0)

- JavaScript separado en `app.js` con un objeto `CONFIG` centralizado, y estilos propios en `styles.css`.
- Indicador de carga con barra de progreso y mensajes de error con botón "Reintentar".
- Meta etiquetas, `lang="es"`, soporte de `prefers-reduced-motion` y ajustes para móviles.
- Correcciones del botón de la barra lateral y de la opción de fondo `none`.

## 2022-06 — Versión inicial

- Publicación del visor Potree con la nube de puntos del Vuelo Armenia.
