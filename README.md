# Nube de Puntos Armenia

Visor web en 3D de la nube de puntos del **Vuelo Armenia**, construido sobre [Potree 1.6](https://github.com/potree/potree). Muestra 88 237 413 puntos con color RGB, convertidos a un octree LAZ que el navegador descarga por partes según lo que hay en pantalla. Es un sitio estático: no necesita servidor de aplicaciones ni base de datos.

**Ver en línea:** https://faustoaguanor.github.io/NubePuntosArmenia/

## Cómo usarlo

| Acción | Control |
| --- | --- |
| Desplazar el terreno | Arrastrar con el botón izquierdo |
| Rotar la cámara | Arrastrar con el botón derecho |
| Acercar o alejar hacia el cursor | Rueda del ratón |
| Centrar en un punto | Doble clic |

La barra lateral de Potree ofrece las herramientas habituales: medición de distancias, áreas y alturas, perfiles, cambio de color de puntos, tamaño de punto y fondo.

## Ejecutar en local

El visor carga archivos con `fetch` y Web Workers, así que **no funciona abriendo `index.html` con doble clic** (`file://`). Hay que servir la carpeta por HTTP:

```bash
git clone https://github.com/faustoaguanor/NubePuntosArmenia.git
cd NubePuntosArmenia
python3 -m http.server 8000
# abrir http://localhost:8000
```

También sirve cualquier servidor estático, por ejemplo la extensión Live Server de VS Code (el repositorio la configura en el puerto 5501). El repositorio pesa unos 380 MB porque incluye la nube de puntos.

## Rendimiento y compatibilidad

Funciona en Chrome, Edge, Firefox, Safari y Brave recientes con WebGL activado y aceleración por hardware.

- **Presupuesto de puntos:** 1 millón en escritorio y 500 000 en móviles o equipos con poca memoria (detectado automáticamente).
- **Modo ligero:** añade `?ligero` a la URL (https://faustoaguanor.github.io/NubePuntosArmenia/?ligero) para desactivar el sombreado EDL, bajar a 500 000 puntos y descargar menos nodos a la vez. Útil en gráficas integradas. Si el navegador pierde el contexto WebGL por falta de memoria de GPU, la página se recarga sola en este modo.
- **Brave:** con "Bloquear huellas digitales" en modo estricto, Brave oculta funciones de WebGL que Potree necesita. El visor lo detecta y explica cómo desactivarlo para este sitio (icono del león, opción "Estándar").
- **Memoria:** los workers que decodifican LAZ se crean desde `laz-worker.js`, que reserva 16 MB por worker en lugar de los 112 MB del decodificador original de Potree.

## Estructura del proyecto

```
NubePuntosArmenia/
├── index.html          # Página del visor: carga librerías y precarga el nodo raíz
├── app.js              # Configuración (objeto CONFIG) e inicialización de Potree
├── styles.css          # Loader, mensajes de error y ajustes de interfaz
├── laz-worker.js       # Decodificador LAZ de Potree con menos memoria
├── libs/               # Potree 1.6 y sus dependencias (three.js, jQuery, OpenLayers, proj4, d3…)
└── pointclouds/
    └── indexl/         # Nube de puntos en formato Potree 1.7 (cloud.js + octree LAZ en data/)
```

## Configuración

Los parámetros del visor están en el objeto `CONFIG` al inicio de `app.js`: ruta de la nube, presupuesto de puntos, campo de visión, EDL, fondo, modo de navegación, concurrencia de carga, opciones del modo ligero y material de los puntos.

Para mostrar otra nube, conviértela con [PotreeConverter](https://github.com/potree/PotreeConverter) 1.7 (formato `cloud.js` + octree LAZ), copia la salida dentro de `pointclouds/` y cambia `CONFIG.pointCloud.path` (y la precarga en `index.html`).

## Datos

- Puntos: 88 237 413, con color RGB, en formato LAZ.
- Extensión: unos 2,3 km × 1,6 km, cota entre 2369 y 2651 m.
- Coordenadas proyectadas en metros (X ≈ 503 000 – 505 300, Y ≈ 9 970 360 – 9 971 940). El archivo `cloud.js` no declara la proyección.

## Historial de cambios

Las mejoras de carga y compatibilidad están en [CHANGELOG.md](CHANGELOG.md).

## Licencia

El código propio de este repositorio (`index.html`, `app.js`, `styles.css`, `laz-worker.js`) se publica bajo la [licencia MIT](LICENSE). Las librerías de `libs/` conservan sus propias licencias (Potree: BSD 2-Clause, ver `libs/potree/LICENSE`; Cesium: Apache 2.0; etc.). La licencia MIT no cubre los datos de `pointclouds/`.
