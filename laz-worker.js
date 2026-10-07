/**
 * Envoltorio del decodificador LAZ de Potree con menos memoria.
 * LASLAZWorker.js está compilado con un montículo fijo de 112 MB (TOTAL_MEMORY = 117440512)
 * y sin crecimiento de memoria, pero una tesela de esta nube solo necesita la pila (5 MB)
 * más el archivo comprimido (< 150 KB). Con 16 MB se decodificaron las 16 248 teselas
 * (88 237 413 puntos) sin errores.
 */
var Module = { TOTAL_MEMORY: 16 * 1024 * 1024 };
importScripts('libs/potree/workers/LASLAZWorker.js');
