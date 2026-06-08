document.addEventListener("DOMContentLoaded", async () => {

    // CORREGIDO: Rutas relativas directas desde la raíz para evitar errores 404 en GitHub Pages
    const xmlJugadores = await cargarXML("datos/jugadores.xml");
    const xmlCombates   = await cargarXML("datos/combates.xml");
    const xmlPersonajes = await cargarXML("datos/personajes.xml");

    if (!xmlJugadores || !xmlCombates || !xmlPersonajes) {
        console.error("Error cargando XML");
        return;
    }

    const selector = document.getElementById("select-jugador");
    const jugadores = xmlJugadores.getElementsByTagName("jugador");

    for (let i = 0; i < jugadores.length; i++) {

        const jugador = jugadores[i];
        const option  = document.createElement("option");

        // Ahora jugadores.xml usa "SMASH-01" etc., coincide con combates.xml
        option.value       = jugador.getAttribute("id").trim();
        option.textContent = jugador
            .getElementsByTagName("nombre")[0]
            .textContent
            .trim();

        selector.appendChild(option);
    }

    selector.addEventListener("change", () => {
        calcularEstadisticas(selector.value);
    });

    if (selector.options.length > 1) {
        selector.selectedIndex = 1;
        calcularEstadisticas(selector.value);
    }

    // ─────────────────────────────────────────────
    function calcularEstadisticas(idJugador) {

        if (!idJugador) return;

        const combates  = xmlCombates.getElementsByTagName("combate");
        const personajes = xmlPersonajes.getElementsByTagName("personaje");

        let victorias = 0;
        let derrotas  = 0;
        const usoPersonajes = {};

        for (let i = 0; i < combates.length; i++) {

            const combate         = combates[i];
            const jugadorCombate  = combate.getAttribute("jugador_id").trim();

            if (jugadorCombate !== idJugador.trim()) continue;

            const resultado = combate
                .getElementsByTagName("resultado")[0]
                .textContent.trim();

            const personajeId = combate
                .getElementsByTagName("personaje_id")[0]
                .textContent.trim();

            if (resultado.toLowerCase() === "victoria") {
                victorias++;
            } else {
                derrotas++;
            }

            usoPersonajes[personajeId] = (usoPersonajes[personajeId] || 0) + 1;
        }

        const total   = victorias + derrotas;
        const winRate = total > 0 ? (victorias / total) * 100 : 0;

        document.getElementById("victorias").innerText       = victorias;
        document.getElementById("derrotas").innerText        = derrotas;
        document.getElementById("total-combates").innerText  = total;
        document.getElementById("global-winrate").innerText  = winRate.toFixed(1) + "%";
        document.getElementById("barra-winrate").style.width = winRate + "%";

        // Personaje más usado
        let personajeMasUsado = null;
        let maxUsos = 0;

        for (const id in usoPersonajes) {
            if (usoPersonajes[id] > maxUsos) {
                maxUsos = usoPersonajes[id];
                personajeMasUsado = id;
            }
        }

        const nombreMasUsado = document.getElementById("nombre-mas-usado");
        const usosMasUsado   = document.getElementById("usos-mas-usado");
        const imagenMasUsado = document.getElementById("img-mas-usado");

        if (!personajeMasUsado) {
            nombreMasUsado.innerText     = "Sin datos";
            usosMasUsado.innerText       = "0";
            imagenMasUsado.style.display = "none";
            return;
        }

        let encontrado = false;

        for (let i = 0; i < personajes.length; i++) {

            const personaje   = personajes[i];
            const idPersonaje = personaje.getAttribute("id").trim();

            if (idPersonaje !== personajeMasUsado) continue;

            nombreMasUsado.innerText = personaje
                .getElementsByTagName("nombre")[0]
                .textContent.trim();

            usosMasUsado.innerText = maxUsos;

            imagenMasUsado.src           = personaje
                .getElementsByTagName("imagen_url")[0]
                .textContent.trim();

            imagenMasUsado.style.display = "block";
            encontrado = true;
            break;
        }

        if (!encontrado) {
            nombreMasUsado.innerText     = "Personaje no encontrado";
            usosMasUsado.innerText       = maxUsos;
            imagenMasUsado.style.display = "none";
        }
    }

    // ─────────────────────────────────────────────
    async function cargarXML(ruta) {
        try {
            const respuesta = await fetch(ruta);
            // CORREGIDO: Mensaje de error mejorado para debuguear fácilmente el estado HTTP (como un 404)
            if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta}. Estado: ${respuesta.status}`);
            const texto = await respuesta.text();
            return new DOMParser().parseFromString(texto, "text/xml");
        } catch (error) {
            console.error(error);
            return null;
        }
    }

});