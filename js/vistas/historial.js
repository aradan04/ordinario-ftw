async function cargarXML(ruta) {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`No se pudo cargar: ${ruta}`);
    const textoXML = await respuesta.text();
    return new DOMParser().parseFromString(textoXML, "text/xml");
}

async function inicializarHistorial() {
    try {
        const xmlCombates   = await cargarXML('../../datos/combates.xml');
        const xmlPersonajes = await cargarXML('../../datos/personajes.xml');
        const xmlJugadores  = await cargarXML('../../datos/jugadores.xml');

        const listaCombates   = xmlCombates.getElementsByTagName('combate');
        const listaPersonajes = xmlPersonajes.getElementsByTagName('personaje');
        const listaJugadores  = xmlJugadores.getElementsByTagName('jugador');

        const tablaBody       = document.getElementById('tabla-combates');
        const totalPeleasSpan = document.getElementById('total-peleas');
        const winRateSpan     = document.getElementById('win-rate');

        tablaBody.innerHTML = "";

        const totalCombates = listaCombates.length;
        let victorias = 0;

        for (let i = 0; i < totalCombates; i++) {

            const combate = listaCombates[i];

            // ── Datos del combate ──────────────────────────────
            const id         = combate.getAttribute('id') || "N/A";
            const jugadorId  = combate.getAttribute('jugador_id')?.trim() || "";
            const rival      = combate.getElementsByTagName('rival')[0]?.textContent.trim() || "Desconocido";
            const personajeId = combate.getElementsByTagName('personaje_id')[0]?.textContent.trim() || "";
            const resultado  = combate.getElementsByTagName('resultado')[0]?.textContent.trim() || "Derrota";
            const stocks     = combate.getElementsByTagName('stocks')[0]?.textContent.trim() || "0";

            // ── Buscar nombre del jugador en jugadores.xml ─────
            let nombreJugador = jugadorId;

            for (let k = 0; k < listaJugadores.length; k++) {
                if (listaJugadores[k].getAttribute('id').trim() === jugadorId) {
                    nombreJugador = listaJugadores[k]
                        .getElementsByTagName('nombre')[0]?.textContent.trim() || jugadorId;
                    break;
                }
            }

            // ── Buscar personaje en personajes.xml ─────────────
            let nombreFighter = "Desconocido";
            let estiloFighter = "N/A";
            let imgFighter    = "";

            for (let j = 0; j < listaPersonajes.length; j++) {
                if (listaPersonajes[j].getAttribute('id').trim() === personajeId) {
                    nombreFighter = listaPersonajes[j]
                        .getElementsByTagName('nombre')[0]?.textContent.trim() || "Desconocido";
                    estiloFighter = listaPersonajes[j]
                        .getElementsByTagName('estilo')[0]?.textContent.trim() || "N/A";
                    imgFighter = listaPersonajes[j]
                        .getElementsByTagName('imagen_url')[0]?.textContent.trim() || "";
                    break;
                }
            }

            // ── Clase y stocks visuales ────────────────────────
            let claseFila = "perdido";
            if (resultado.toLowerCase() === "victoria") {
                victorias++;
                claseFila = "ganado";
            }

            const cantidadStocks = parseInt(stocks);
            const visualStocks   = cantidadStocks > 0 ? "⭐".repeat(cantidadStocks) : "❌ KO";

            // ── Crear fila ─────────────────────────────────────
            // Columnas: ID | Jugador | Personaje | Estilo | Rival | Resultado | Stocks
            const fila = document.createElement('tr');
            fila.className = claseFila;

            fila.innerHTML = `
                <td>#${id}</td>
                <td>${nombreJugador}</td>
                <td>
                    <img src="${imgFighter}" alt="${nombreFighter}" class="mini-avatar">
                    <strong>${nombreFighter}</strong>
                </td>
                <td>${estiloFighter}</td>
                <td>${rival}</td>
                <td>${resultado}</td>
                <td>${visualStocks}</td>
            `;

            tablaBody.appendChild(fila);
        }

        const winRate = totalCombates > 0 ? (victorias / totalCombates) * 100 : 0;

        totalPeleasSpan.textContent = totalCombates;
        winRateSpan.textContent     = `${winRate.toFixed(1)}%`;

    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

window.addEventListener('load', inicializarHistorial);