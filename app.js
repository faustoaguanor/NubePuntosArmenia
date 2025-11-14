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
            pointBudget: 1000000, // 1 millón de puntos
            edlEnabled: true,
            background: 'black', // Opciones: "skybox", "gradient", "black", "white"
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

            window.viewer = new Potree.Viewer(renderArea);

            // Configurar el viewer con las opciones optimizadas
            viewer.setEDLEnabled(CONFIG.viewer.edlEnabled);
            viewer.setFOV(CONFIG.viewer.fov);
            viewer.setPointBudget(CONFIG.viewer.pointBudget);
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

                        hideLoader();
                        resolve(pointcloud);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
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

            // Inicializar componentes en secuencia
            const viewer = initializeViewer();
            await loadGUI(viewer);
            await loadPointCloud(viewer);

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
