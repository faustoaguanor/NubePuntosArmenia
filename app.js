/**
 * Aplicación de visualización de nube de puntos - Armenia
 * Configuración optimizada para rendimiento y experiencia de usuario
 */

(function() {
    'use strict';

    // Configuración centralizada
    const CONFIG = {
        title: 'Armenia',
        description: 'Vuelo Armenia',
        language: 'es',
        pointCloud: {
            path: 'pointclouds/indexl/cloud.js',
            name: 'indexl'
        },
        viewer: {
            fov: 60,
            pointBudget: 1000000, // 1 millón de puntos (escritorio)
            pointBudgetLowEnd: 500000, // Móviles / equipos con poca memoria
            edlEnabled: true,
            background: 'black', // Opciones: "skybox", "gradient", "black", "white"
        },
        loading: {
            // Nodos del octree descargados y decodificados en paralelo (Potree usa 4 por defecto).
            // Cada nodo en carga usa un worker LAZ que reserva ~112 MB y Potree nunca los libera,
            // así que este valor fija el pico de memoria de los workers (~450 MB con 4).
            parallelNodes: 4,
            // Tiempo máximo con el loader visible mientras llega el primer nodo
            firstNodeTimeout: 15000
        },
        material: {
            pointColorType: 'RGB',
            size: 1,
            pointSizeType: 'ADAPTIVE',
            shape: 'SQUARE'
        }
    };

    /**
     * Muestra un mensaje de carga en la UI
     */
    function showLoader(message = 'Cargando...') {
        const loader = document.getElementById('loader');
        if (loader) {
            const loaderText = loader.querySelector('.loader-text');
            if (loaderText) loaderText.textContent = message;
            loader.style.display = 'flex';
        }
    }

    /**
     * Oculta el mensaje de carga
     */
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Muestra mensajes de error al usuario
     */
    function showError(message) {
        console.error('Error:', message);
        hideLoader();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error al cargar la visualización</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Comprueba si el navegador puede crear un contexto WebGL con lo que Potree necesita.
     * Devuelve 'ok', 'no-webgl' o 'no-extensions'.
     * Potree usa OES_vertex_array_object sin comprobar que exista; si falta (p. ej. Brave
     * con protección estricta contra huellas digitales) muestra "Potree Encountered An Error".
     */
    function checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'no-webgl';
            const hasVAO = !!gl.getExtension('OES_vertex_array_object');
            // Liberar el contexto de prueba para no consumir uno de los disponibles
            const lose = gl.getExtension('WEBGL_lose_context');
            if (lose) lose.loseContext();
            return hasVAO ? 'ok' : 'no-extensions';
        } catch (e) {
            return 'no-webgl';
        }
    }

    const WEBGL_ERROR_MESSAGE = `Tu navegador no pudo iniciar WebGL, necesario para mostrar la nube de puntos.<br><br>
        • Activa la aceleración por hardware (Ajustes → Sistema → "Usar aceleración por hardware") y reinicia el navegador.<br>
        • En Firefox revisa en <code>about:config</code> que <code>webgl.disabled</code> sea <code>false</code>.<br>
        • Actualiza los controladores de la tarjeta gráfica o prueba con otro navegador (Chrome, Edge, Firefox).<br>
        • Puedes comprobar el soporte en <a href="https://get.webgl.org" target="_blank" rel="noopener">get.webgl.org</a>.`;

    const WEBGL_EXTENSIONS_ERROR_MESSAGE = `Tu navegador bloqueó funciones de WebGL necesarias para mostrar la nube de puntos.<br><br>
        • En Brave pulsa el icono del león junto a la barra de direcciones y desactiva "Bloquear huellas digitales" para este sitio (o déjalo en "Estándar"), luego pulsa "Reintentar".<br>
        • En otros navegadores revisa extensiones de privacidad o anti-huellas que limiten WebGL.<br>
        • Si el problema sigue, activa la aceleración por hardware o prueba con otro navegador (Chrome, Edge, Firefox).`;

    /**
     * Detecta equipos de gama baja para reducir el presupuesto de puntos
     */
    function isLowEndDevice() {
        const memory = navigator.deviceMemory || 8;
        const cores = navigator.hardwareConcurrency || 4;
        const smallScreen = Math.min(window.screen.width, window.screen.height) < 768;
        return memory <= 4 || cores <= 2 || smallScreen;
    }

    /**
     * Ajusta la concurrencia de carga. Los workers LAZ se crean bajo demanda:
     * precargarlos solo adelantaba ~112 MB por worker sin acelerar la carga.
     */
    function configureLoading() {
        Potree.maxNodesLoading = CONFIG.loading.parallelNodes;
    }

    /**
     * Hace que el pool de Potree cree los workers LAZ desde laz-worker.js, que reserva
     * 16 MB por worker en lugar de 112 MB. Potree nunca libera estos workers, así que
     * esto recorta el pico de memoria de la carga sin cambiar la concurrencia.
     */
    function useLightLazWorkers() {
        const lazUrl = `${Potree.scriptPath}/workers/LASLAZWorker.js`;
        const pool = Potree.workerPool;
        const getWorker = pool.getWorker.bind(pool);
        pool.getWorker = (url) => {
            if (url === lazUrl) {
                const idle = pool.workers[url] = pool.workers[url] || [];
                if (idle.length === 0) idle.push(new Worker('laz-worker.js'));
            }
            return getWorker(url);
        };
    }

    /**
     * Si el navegador pierde el contexto WebGL (p. ej. por falta de memoria de GPU),
     * muestra un aviso en español en lugar de la pantalla de error de Potree.
     */
    function handleContextLoss(viewer) {
        const canvas = viewer.renderer && viewer.renderer.domElement;
        if (!canvas) return;
        canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            showError(`El navegador perdió el contexto gráfico (WebGL), normalmente por falta de memoria de la tarjeta gráfica.<br><br>
                Cierra otras pestañas o aplicaciones que usen la GPU y pulsa "Reintentar".`);
        }, false);
    }

    /**
     * Inicializa y configura el viewer de Potree
     */
    function initializeViewer() {
        try {
            showLoader('Inicializando visor...');

            // Crear el viewer
            const renderArea = document.getElementById('potree_render_area');
            if (!renderArea) {
                throw new Error('Elemento de renderizado no encontrado');
            }

            useLightLazWorkers();
            window.viewer = new Potree.Viewer(renderArea);
            handleContextLoss(viewer);

            // Configurar el viewer con las opciones optimizadas
            viewer.setEDLEnabled(CONFIG.viewer.edlEnabled);
            viewer.setFOV(CONFIG.viewer.fov);
            viewer.setPointBudget(isLowEndDevice()
                ? CONFIG.viewer.pointBudgetLowEnd
                : CONFIG.viewer.pointBudget);
            viewer.setBackground(CONFIG.viewer.background);
            viewer.setDescription(CONFIG.description);

            // Establecer título del documento
            document.title = CONFIG.title;

            // Cargar configuración desde URL (si existe)
            viewer.loadSettingsFromURL();

            return viewer;
        } catch (error) {
            showError(`Error al inicializar el visor: ${error.message}`);
            throw error;
        }
    }

    /**
     * Carga la interfaz gráfica del viewer
     */
    function loadGUI(viewer) {
        return new Promise((resolve, reject) => {
            try {
                viewer.loadGUI(() => {
                    try {
                        // Configurar idioma
                        viewer.setLanguage(CONFIG.language);

                        // Mostrar menús principales
                        const menus = ['#menu_appearance', '#menu_tools', '#menu_scene'];
                        menus.forEach(menuId => {
                            const menu = document.querySelector(menuId);
                            if (menu && menu.nextElementSibling) {
                                menu.nextElementSibling.style.display = 'block';
                            }
                        });

                        // Mostrar sidebar
                        viewer.toggleSidebar();

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Carga y configura la nube de puntos
     */
    function loadPointCloud(viewer) {
        return new Promise((resolve, reject) => {
            showLoader('Cargando nube de puntos...');

            Potree.loadPointCloud(
                CONFIG.pointCloud.path,
                CONFIG.pointCloud.name,
                (e) => {
                    try {
                        if (!e || !e.pointcloud) {
                            throw new Error('No se pudo cargar la nube de puntos');
                        }

                        const pointcloud = e.pointcloud;
                        const material = pointcloud.material;

                        // Agregar la nube de puntos a la escena
                        viewer.scene.addPointCloud(pointcloud);

                        // Configurar material
                        material.pointColorType = Potree.PointColorType[CONFIG.material.pointColorType];
                        material.size = CONFIG.material.size;
                        material.pointSizeType = Potree.PointSizeType[CONFIG.material.pointSizeType];
                        material.shape = Potree.PointShape[CONFIG.material.shape];

                        // Ajustar la vista a la nube de puntos
                        viewer.fitToScreen();

                        // Ocultar el loader cuando el nodo raíz ya tiene puntos visibles
                        waitForFirstNode(pointcloud).then(() => {
                            hideLoader();
                            resolve(pointcloud);
                        });
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * Resuelve cuando el nodo raíz de la nube está cargado (o al vencer el tiempo límite)
     */
    function waitForFirstNode(pointcloud) {
        return new Promise(resolve => {
            const start = performance.now();
            const check = () => {
                const root = pointcloud.pcoGeometry && pointcloud.pcoGeometry.root;
                const elapsed = performance.now() - start;
                if ((root && root.loaded) || elapsed > CONFIG.loading.firstNodeTimeout) {
                    resolve();
                } else {
                    requestAnimationFrame(check);
                }
            };
            check();
        });
    }

    /**
     * Función principal de inicialización
     */
    async function init() {
        try {
            // Verificar que Potree esté disponible
            if (typeof Potree === 'undefined') {
                throw new Error('Potree no está cargado. Verifica que las librerías estén correctamente incluidas.');
            }

            const webgl = checkWebGL();
            if (webgl !== 'ok') {
                showError(webgl === 'no-extensions' ? WEBGL_EXTENSIONS_ERROR_MESSAGE : WEBGL_ERROR_MESSAGE);
                return;
            }

            configureLoading();
            const viewer = initializeViewer();

            // La GUI y la nube de puntos se cargan en paralelo
            await Promise.all([loadGUI(viewer), loadPointCloud(viewer)]);

            console.log('Aplicación inicializada correctamente');
        } catch (error) {
            showError(error.message);
            console.error('Error fatal en la inicialización:', error);
        }
    }

    // Iniciar la aplicación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Manejar errores globales
    window.addEventListener('error', (event) => {
        console.error('Error global capturado:', event.error);
    });

    // Manejar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promesa rechazada no manejada:', event.reason);
        event.preventDefault();
    });

})();
