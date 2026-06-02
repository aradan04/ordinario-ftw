/**
 * js/vistas/estadisticas.js
 * Lógica global y optimizada para index.html, torneos.html y estadisticas.html.
 * Maneja auto-recuperación de rutas dinámicas ante entornos de subcarpetas locales.
 */

async function inicializarModuloEstadisticas() {
    // 1. Detectar qué elementos existen en la página actual para saber qué bloques de código aplicar
    const contenedorHome = document.getElementById('num-combates');
    const contenedorTorneos = document.getElementById('lista-torneos');
    const contenedorMetricas = document.getElementById('global-winrate');

    // ==========================================================================
    // LÓGICA A: PÁGINA DE INICIO / DASHBOARD (index.html)
    // ==========================================================================
    if (contenedorHome) {
        // AJUSTE DE RUTA: Intentamos cargar saliendo un nivel atrás por si el servidor base se montó sobre /Vistas
        let xmlCombates = await cargarXML('../datos/combates.xml');
        let xmlPersonajes = await cargarXML('../datos/personajes.xml');
        let xmlJugadores = await cargarXML('../datos/jugadores.xml');

        // Si la petición previa falla (da 404), nos auto-recuperamos buscando en la raíz directa
        if (!xmlCombates) {
            console.log("🔄 Reintentando localización de bases de datos desde la raíz directa...");
            xmlCombates = await cargarXML('datos/combates.xml');
            xmlPersonajes = await cargarXML('datos/personajes.xml');
            xmlJugadores = await cargarXML('datos/jugadores.xml');
        }

        // Si los archivos se lograron parsear correctamente de forma elástica, inyectamos la información
        if (xmlCombates && xmlPersonajes && xmlJugadores) {
            document.getElementById('num-combates').innerText = xmlCombates.getElementsByTagName('combate').length;
            document.getElementById('num-personajes').innerText = xmlPersonajes.getElementsByTagName('personaje').length;

            const jugadorDestacado = xmlJugadores.getElementsByTagName('jugador')[0];
            if (jugadorDestacado) {
                document.getElementById('tag-destacado').innerText = jugadorDestacado.getElementsByTagName('tag')[0].textContent;
                document.getElementById('rango-destacado').innerText = jugadorDestacado.getElementsByTagName('rango')[0].textContent;
            }
            console.log("✅ Datos del Dashboard cargados exitosamente.");
        } else {
            console.error("❌ No se pudieron recuperar los archivos XML de la base de datos en ninguna de las rutas relativas.");
        }
    }

    // ==========================================================================
    // LÓGICA B: CALENDARIO DE TORNEOS (torneos.html)
    // ==========================================================================
    if (contenedorTorneos) {
        // Al estar situados dentro de vistas/torneos/, salimos dos niveles jerárquicos para mapear la raíz
        const xmlTorneos = await cargarXML('../../datos/torneos.xml');
        
        if (xmlTorneos) {
            const listaTorneos = xmlTorneos.getElementsByTagName('torneo');
            contenedorTorneos.innerHTML = ""; // Limpieza preventiva del nodo principal

            for (let i = 0; i < listaTorneos.length; i++) {
                const torneo = listaTorneos[i];
                const nombre = torneo.getElementsByTagName('nombre')[0].textContent;
                const sede = torneo.getElementsByTagName('sede')[0].textContent;
                const fechaString = torneo.getElementsByTagName('fecha')[0].textContent;
                const participantes = torneo.getElementsByTagName('participantes')[0].textContent;
                const logoUrl = torneo.getElementsByTagName('logo_url')[0].textContent;
                const estadoManual = torneo.getElementsByTagName('estado_manual')[0].textContent;

                // --- OPERACIÓN LÓGICA TEMPORAL: Clasificación dinámica del evento ---
                const fechaTorneo = new Date(fechaString);
                const fechaActual = new Date();
                let etiquetaEstado = estadoManual;
                let estiloBadge = "background: #555;";

                if (fechaTorneo < fechaActual) {
                    etiquetaEstado = "Finalizado ✓";
                    estiloBadge = "background: #e74c3c; color: #fff;"; // Tonalidad roja de cierre
                } else {
                    etiquetaEstado = "¡Próximamente! ⚔️";
                    estiloBadge = "background: #2ecc71; color: #000; font-weight: bold;"; // Tonalidad verde activa
                }

                const tarjeta = document.createElement('div');
                tarjeta.className = "tarjeta-resumen";
                tarjeta.style = "display: flex; align-items: center; gap: 20px; margin-bottom: 15px; background: #1c1c1c; padding: 20px; border-radius: 6px; border: 1px solid #2d2d2d;";
                
                tarjeta.innerHTML = `
                    <img src="${logoUrl}" alt="Logo Torneo" style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; background: #333;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0; color: #ff0043; font-size: 1.2rem;">${nombre}</h3>
                        <p style="margin: 5px 0; color: #aaa; font-size: 0.95rem;">📍 ${sede} | 📅 ${fechaString}</p>
                        <p style="margin: 0; font-size: 0.9rem; color: #eee;">Asistentes: <strong>${participantes} smashers</strong></p>
                    </div>
                    <span class="badge" style="${estiloBadge} padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">${etiquetaEstado}</span>
                `;
                contenedorTorneos.appendChild(tarjeta);
            }
        }
    }

    // ==========================================================================
    // LÓGICA C: MÉTRICAS Y ANALÍTICAS GENERALES (estadisticas.html)
    // ==========================================================================
    if (contenedorMetricas) {
        // Al estar situados dentro de vistas/torneos/, salimos dos niveles jerárquicos para mapear la raíz
        const xmlCombates = await cargarXML('../../datos/combates.xml');
        const xmlPersonajes = await cargarXML('../../datos/personajes.xml');
        
        if (xmlCombates && xmlPersonajes) {
            const listaCombates = xmlCombates.getElementsByTagName('combate');
            const listaPersonajes = xmlPersonajes.getElementsByTagName('personaje');

            let totalCombates = listaCombates.length;
            let victorias = 0;
            let mapeoUsos = {};

            for (let i = 0; i < totalCombates; i++) {
                const combate = listaCombates[i];
                const resultado = combate.getElementsByTagName('resultado')[0].textContent;
                const personajeId = combate.getElementsByTagName('personaje_id')[0].textContent;

                // 1. Acumulador matemático para el porcentaje de victorias
                if (resultado.toLowerCase() === "victoria") {
                    victorias++;
                }

                // 2. Mapeo estructural de frecuencias para determinar popularidad de selección
                if (mapeoUsos[personajeId]) {
                    mapeoUsos[personajeId]++;
                } else {
                    mapeoUsos[personajeId] = 1;
                }
            }

            // --- OPERACIÓN MATEMÁTICA: Render de Win Rate Global ---
            let winRateGlobal = totalCombates > 0 ? (victorias / totalCombates) * 100 : 0;
            document.getElementById('global-winrate').innerText = `${winRateGlobal.toFixed(1)}%`;
            
            const barraProgreso = document.getElementById('barra-winrate');
            if (barraProgreso) {
                barraProgreso.style.width = `${winRateGlobal}%`;
            }

            // --- OPERACIÓN LÓGICA DE ALGORITMO: Buscar la frecuencia de selección dominante ---
            let idMasUsado = null;
            let maxUsos = 0;

            for (const id in mapeoUsos) {
                if (mapeoUsos[id] > maxUsos) {
                    maxUsos = mapeoUsos[id];
                    idMasUsado = id;
                }
            }

            // Mapeo inverso de propiedades cruzando datos con personajes.xml para renderizar el Main Estadístico
            if (idMasUsado) {
                let nombreMasUsado = "Desconocido";
                let imgMasUsado = "";

                for (let j = 0; j < listaPersonajes.length; j++) {
                    if (listaPersonajes[j].getAttribute('id') === idMasUsado) {
                        nombreMasUsado = listaPersonajes[j].getElementsByTagName('nombre')[0].textContent;
                        imgMasUsado = listaPersonajes[j].getElementsByTagName('imagen_url')[0].textContent;
                        break;
                    }
                }

                document.getElementById('nombre-mas-usado').innerText = nombreMasUsado;
                document.getElementById('usos-mas-usado').innerText = maxUsos;
                
                const imgElement = document.getElementById('img-mas-usado');
                if (imgElement) {
                    imgElement.src = imgMasUsado;
                    imgElement.style.display = "block"; // Rompe el estado oculto inicial del CSS base
                }
            }
        }
    }
}

// Inicializar el disparador lógico del ciclo una vez renderizado el DOM de la vista actual
window.onload = inicializarModuloEstadisticas;