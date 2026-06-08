document.addEventListener("DOMContentLoaded", async () => {

    // ── Cargar los tres XMLs ──────────────────────────────────────
    const xmlCombates  = await cargarXML("datos/combates.xml");
    const xmlPersonajes = await cargarXML("datos/personajes.xml");
    const xmlJugadores = await cargarXML("datos/jugadores.xml");

    if (!xmlCombates || !xmlPersonajes || !xmlJugadores) {
        console.error("Error al cargar uno o más archivos XML.");
        return;
    }

    // ── Contador de combates ──────────────────────────────────────
    const combates = xmlCombates.getElementsByTagName("combate");
    document.getElementById("num-combates").innerText = combates.length;

    // ── Contador de personajes ────────────────────────────────────
    const personajes = xmlPersonajes.getElementsByTagName("personaje");
    document.getElementById("num-personajes").innerText = personajes.length;

    // ── Jugador destacado: el que tenga más victorias ─────────────
    const jugadores = xmlJugadores.getElementsByTagName("jugador");

    let jugadorDestacado = null;
    let maxVictorias = -1;

    for (let i = 0; i < jugadores.length; i++) {

        const jugador = jugadores[i];
        const id      = jugador.getAttribute("id").trim();
        let victorias = 0;

        for (let j = 0; j < combates.length; j++) {

            const combate     = combates[j];
            const jugadorId   = combate.getAttribute("jugador_id").trim();
            const resultado   = combate
                .getElementsByTagName("resultado")[0]
                .textContent.trim().toLowerCase();

            if (jugadorId === id && resultado === "victoria") {
                victorias++;
            }
        }

        if (victorias > maxVictorias) {
            maxVictorias     = victorias;
            jugadorDestacado = jugador;
        }
    }

    if (jugadorDestacado) {

        const nombre = jugadorDestacado
            .getElementsByTagName("nombre")[0].textContent.trim();

        const region = jugadorDestacado
            .getElementsByTagName("region")[0].textContent.trim();

        const clan = jugadorDestacado
            .getElementsByTagName("clan")[0].textContent.trim();

        const main = jugadorDestacado
            .getElementsByTagName("main")[0].textContent.trim();

        document.getElementById("tag-destacado").innerText    = nombre;
        document.getElementById("region-destacado").innerText = region;
        document.getElementById("clan-destacado").innerText   = clan;
        document.getElementById("main-destacado").innerText   = main;
    }

    // ── Utilidad: carga y parsea un XML ──────────────────────────
    async function cargarXML(ruta) {
        try {
            const respuesta = await fetch(ruta);
            if (!respuesta.ok) throw new Error("No se pudo cargar: " + ruta);
            const texto = await respuesta.text();
            return new DOMParser().parseFromString(texto, "text/xml");
        } catch (error) {
            console.error(error);
            return null;
        }
    }

});