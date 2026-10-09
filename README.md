# Nube de Puntos Armenia

Visor web en 3D para explorar la nube de puntos del **Vuelo Armenia**: 88 millones de puntos con color real que reproducen en 3D la zona sobrevolada. Permite recorrer el modelo desde el navegador, sin instalar programas, y hacer mediciones de distancias, áreas, alturas y perfiles directamente sobre los puntos.

El visor está construido sobre [Potree](https://github.com/potree/potree), un motor de código abierto para mostrar nubes de puntos masivas con WebGL. Los datos están convertidos a un octree LAZ, así que el navegador solo descarga el nivel de detalle que hace falta para lo que hay en pantalla. Es un sitio estático publicado en GitHub Pages: no necesita servidor de aplicaciones ni base de datos.

**Ver en línea:** https://faustoaguanor.github.io/NubePuntosArmenia/

## Datos

| | |
| --- | --- |
| Puntos | 88 237 413, con color RGB |
| Formato | Octree Potree 1.7 (`cloud.js`) con teselas LAZ, generado desde un archivo `pointcloud.las` |
| Extensión | Unos 2,3 km × 1,6 km |
| Cota | Entre 2369 y 2651 m |
| Coordenadas | Proyectadas en metros (X ≈ 503 000 – 505 300, Y ≈ 9 970 360 – 9 971 940); `cloud.js` no declara la proyección |
| Ubicación en el repositorio | `pointclouds/indexl/` (unos 376 MB) |

## Cómo navegar

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

## Compatibilidad

Funciona en Chrome, Edge, Firefox, Safari y Brave recientes con WebGL y aceleración por hardware activados.

- En equipos con poca memoria o gráfica integrada, abre el **modo ligero**: https://faustoaguanor.github.io/NubePuntosArmenia/?ligero (menos puntos y sin sombreado EDL). Si el navegador se queda sin memoria gráfica, la página cambia sola a este modo.
- En **Brave**, si el escudo bloquea las huellas digitales en modo estricto, el visor no puede iniciar WebGL y muestra cómo permitirlo para este sitio.

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

## Créditos

Este visor existe gracias a estas librerías de código abierto, incluidas en `libs/` con sus archivos de licencia:

| Librería | Uso en el visor | Autoría | Licencia |
| --- | --- | --- | --- |
| [Potree](https://github.com/potree/potree) 1.6 | Motor de visualización de nubes de puntos | Markus Schütz | BSD 2-Clause |
| [three.js](https://threejs.org/) r85 | Renderizado 3D con WebGL | three.js authors | MIT |
| [laz-perf](https://github.com/hobuinc/laz-perf) (en `potree/workers/LASLAZWorker.js`) | Descompresión de teselas LAZ | Hobu Inc. | Ver su repositorio |
| [plasio](https://github.com/verma/plasio) (`laslaz.js`) | Lectura de archivos LAS/LAZ | Uday Verma | MIT |
| [proj4js](https://github.com/proj4js/proj4js) | Transformación de coordenadas | Colaboradores de Proj4js | MIT |
| [OpenLayers](https://openlayers.org/) 3 | Mapa 2D de ubicación | Colaboradores de OpenLayers | BSD 2-Clause |
| [D3](https://d3js.org/) 3.5.5 | Gráfico de perfiles de elevación | Michael Bostock | BSD 3-Clause |
| [jQuery](https://jquery.com/) 3.1.1 y [jQuery UI](https://jqueryui.com/) | Interfaz de la barra lateral | jQuery Foundation | MIT |
| [jsTree](https://www.jstree.com/) | Árbol de la escena | Ivan Bozhanov | MIT |
| [Spectrum](https://bgrins.github.io/spectrum/) | Selector de color | Brian Grinstead | MIT |
| [perfect-scrollbar](https://github.com/mdbootstrap/perfect-scrollbar) 0.6.12 | Barras de desplazamiento | Hyunje Jun | MIT |
| [i18next](https://www.i18next.com/) 1.8.0 | Traducción de la interfaz | Jan Mühlemann | MIT |
| [tween.js](https://github.com/tweenjs/tween.js) | Animaciones de cámara | gskinner.com, inc. | MIT |
| BinaryHeap (`other/BinaryHeap.js`) | Cola de prioridad para cargar nodos | Marijn Haverbeke (*Eloquent JavaScript*) | MIT |

`libs/` también incluye, sin que el visor las cargue, [Cesium](https://cesium.com/) (Cesium Contributors, Apache 2.0), [shapefile](https://github.com/mbostock/shapefile) 0.6.2 (Mike Bostock) y [THREE.MeshLine](https://github.com/spite/THREE.MeshLine) (Jaume Sanchez, MIT), que vienen con la distribución de Potree.

El icono del mapa de Potree proviene de [PotreeViewer](https://github.com/PotreeViewer/PotreeViewer) del SITN (ver `libs/potree/resources/LICENSE`).

## Licencia

El código propio de este repositorio (`index.html`, `app.js`, `styles.css`, `laz-worker.js`) se publica bajo la [licencia MIT](LICENSE). Las librerías de `libs/` conservan sus propias licencias, listadas en [Créditos](#créditos). La licencia MIT no cubre los datos de `pointclouds/`.

## Historial de cambios

Las mejoras de carga y compatibilidad están en [CHANGELOG.md](CHANGELOG.md).
