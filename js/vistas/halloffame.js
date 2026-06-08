async function cargarXML(ruta) {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta}`);
    const texto = await respuesta.text();
    return new DOMParser().parseFromString(texto, "text/xml");
}

async function inicializarHallOfFame() {
    try {

        const combatesXML   = await cargarXML('../../datos/combates.xml');
        const personajesXML = await cargarXML('../../datos/personajes.xml');
        const torneosXML    = await cargarXML('../../datos/torneos.xml');

        const combates   = combatesXML.getElementsByTagName('combate');
        const personajes = personajesXML.getElementsByTagName('personaje');
        const torneos    = torneosXML.getElementsByTagName('torneo');

        // ── Contadores ────────────────────────────────────────────
        let victoriasPorPersonaje = {};
        let usosPorPersonaje      = {};
        let rivales               = {};

        let victorias   = 0;
        let rachaActual = 0;
        let mejorRacha  = 0;

        for (let i = 0; i < combates.length; i++) {

            const combate = combates[i];

            const personajeId = combate
                .getElementsByTagName('personaje_id')[0]?.textContent.trim();

            const rival = combate
                .getElementsByTagName('rival')[0]?.textContent.trim();

            const resultado = combate
                .getElementsByTagName('resultado')[0]?.textContent.trim();

            usosPorPersonaje[personajeId] =
                (usosPorPersonaje[personajeId] || 0) + 1;

            rivales[rival] = (rivales[rival] || 0) + 1;

            if (resultado?.toLowerCase() === "victoria") {
                victorias++;
                victoriasPorPersonaje[personajeId] =
                    (victoriasPorPersonaje[personajeId] || 0) + 1;
                rachaActual++;
                if (rachaActual > mejorRacha) mejorRacha = rachaActual;
            } else {
                rachaActual = 0;
            }
        }

        // ── IDs destacados ────────────────────────────────────────
        const mejorPersonajeId = Object.keys(victoriasPorPersonaje)
            .reduce((a, b) =>
                victoriasPorPersonaje[a] > victoriasPorPersonaje[b] ? a : b);

        const personajeMasUsadoId = Object.keys(usosPorPersonaje)
            .reduce((a, b) =>
                usosPorPersonaje[a] > usosPorPersonaje[b] ? a : b);

        const rivalFrecuente = Object.keys(rivales)
            .reduce((a, b) => rivales[a] > rivales[b] ? a : b);

        // ── Buscar datos en personajes.xml ────────────────────────
        let mejorPersonaje          = "Desconocido";
        let mejorPersonajeImagen    = "";
        let personajeMasUsado       = "Desconocido";
        let personajeMasUsadoImagen = "";
        let imgRival                = "";   // imagen del rival por nombre

        for (let i = 0; i < personajes.length; i++) {

            const personaje = personajes[i];
            const id        = personaje.getAttribute('id')?.trim();
            const nombre    = personaje
                .getElementsByTagName('nombre')[0]?.textContent.trim();
            const imagen    = personaje
                .getElementsByTagName('imagen_url')[0]?.textContent.trim();

            if (id === mejorPersonajeId) {
                mejorPersonaje       = nombre;
                mejorPersonajeImagen = imagen;
            }

            if (id === personajeMasUsadoId) {
                personajeMasUsado       = nombre;
                personajeMasUsadoImagen = imagen;
            }

            // Buscar rival por nombre (los rivales en combates.xml
            // se guardan como nombre, no como ID)
            if (nombre?.toLowerCase() === rivalFrecuente?.toLowerCase()) {
                imgRival = imagen;
            }
        }

        // ── Torneo más grande ─────────────────────────────────────
        let torneoGrande     = "Sin datos";
        let maxParticipantes = 0;

        for (let i = 0; i < torneos.length; i++) {

            const participantes = parseInt(
                torneos[i].getElementsByTagName('participantes')[0]?.textContent
            );

            if (participantes > maxParticipantes) {
                maxParticipantes = participantes;
                torneoGrande = torneos[i]
                    .getElementsByTagName('nombre')[0]?.textContent.trim();
            }
        }

        // ── Win rate ──────────────────────────────────────────────
        const winrate = combates.length > 0
            ? ((victorias / combates.length) * 100).toFixed(1)
            : "0.0";

        // ── Renderizar ────────────────────────────────────────────
        document.getElementById('mejor-personaje').textContent      = mejorPersonaje;
        document.getElementById('img-mejor-personaje').src          = mejorPersonajeImagen;
        document.getElementById('img-mejor-personaje').alt          = mejorPersonaje;

        document.getElementById('personaje-mas-usado').textContent  = personajeMasUsado;
        document.getElementById('img-mas-usado').src                = personajeMasUsadoImagen;
        document.getElementById('img-mas-usado').alt                = personajeMasUsado;

        document.getElementById('rival-frecuente').textContent      = rivalFrecuente;

        // Imagen del rival: mostrar solo si se encontró
        const imgRivalEl = document.getElementById('img-rival-frecuente');
        if (imgRival) {
            imgRivalEl.src          = imgRival;
            imgRivalEl.alt          = rivalFrecuente;
            imgRivalEl.style.display = "block";
        }

        document.getElementById('mejor-racha').textContent          = `${mejorRacha} victorias seguidas`;
        document.getElementById('winrate-historico').textContent     = `${winrate}%`;
        document.getElementById('torneo-grande').textContent         = `${torneoGrande} (${maxParticipantes} participantes)`;

    } catch (error) {
        console.error("Error al cargar Hall of Fame:", error);
    }
}

window.addEventListener("load", inicializarHallOfFame);