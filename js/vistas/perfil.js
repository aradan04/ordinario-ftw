document.addEventListener("DOMContentLoaded", () => {
    let xmlDoc = null;

    const selector = document.getElementById("select-jugador");

    // Cargar el XML
    fetch("../../Datos/jugadores.xml")
        .then(res => {

            if (!res.ok) {
                throw new Error(
                    `No se pudo cargar el XML. Error ${res.status}`
                );
            }

            return res.text();
        })
        .then(data => {

            xmlDoc = new DOMParser().parseFromString(
                data,
                "application/xml"
            );

            // Detectar errores de XML
            const errorXML = xmlDoc.querySelector("parsererror");

            if (errorXML) {
                console.error(
                    "Error al interpretar el XML:",
                    errorXML.textContent
                );

                document.getElementById("player-nombre").textContent =
                    "ERROR EN XML";

                return;
            }

            console.log(
                "Jugadores encontrados:",
                xmlDoc.getElementsByTagName("jugador").length
            );

            poblarSelector();
        })
        .catch(err => {
            console.error("Error al cargar el XML:", err);

            document.getElementById("player-nombre").textContent =
                "ERROR AL CARGAR DATOS";
        });

    // Llenar el selector
    function poblarSelector() {

        const jugadores = xmlDoc.getElementsByTagName("jugador");

        if (jugadores.length === 0) {
            console.warn("No se encontraron jugadores en el XML.");
            return;
        }

        for (let i = 0; i < jugadores.length; i++) {

            const id = jugadores[i].getAttribute("id");

            const nombre =
                jugadores[i]
                    .getElementsByTagName("nombre")[0]
                    .textContent;

            const opc = document.createElement("option");

            opc.value = id;
            opc.textContent = nombre;

            selector.appendChild(opc);
        }
    }

    // Cambiar jugador
    selector.addEventListener("change", (e) => {

        if (!xmlDoc) return;

        const idSel = e.target.value;

        if (!idSel) {
            resetearInterfaz();
            return;
        }

        const jugadores =
            xmlDoc.getElementsByTagName("jugador");

        for (let i = 0; i < jugadores.length; i++) {

            if (
                jugadores[i].getAttribute("id") === idSel
            ) {

                const j = jugadores[i];

                const nombre =
                    j.getElementsByTagName("nombre")[0].textContent;

                const foto =
                    j.getElementsByTagName("foto")[0].textContent;

                const region =
                    j.getElementsByTagName("region")[0].textContent;

                const clan =
                    j.getElementsByTagName("clan")[0].textContent;

                const main =
                    j.getElementsByTagName("main")[0].textContent;

                const secundario =
                    j.getElementsByTagName("secundario")[0].textContent;

                document.getElementById("player-nombre").textContent =
                    nombre;

                document.getElementById("player-foto").src =
                    foto;

                document.getElementById("player-foto").alt =
                    `Foto de ${nombre}`;

                document.getElementById("player-status").textContent =
                    "ANALIZADO";

                document.getElementById("player-region").textContent =
                    region;

                document.getElementById("player-clan").textContent =
                    clan;

                document.getElementById("player-main").textContent =
                    main;

                document.getElementById("player-secundario").textContent =
                    secundario;

                break;
            }
        }
    });

    // Reiniciar interfaz
    function resetearInterfaz() {

        document.getElementById("player-nombre").textContent =
            "CARGANDO...";

        document.getElementById("player-status").textContent =
            "ANALIZANDO...";

        document.getElementById("player-foto").src = "";

        document.getElementById("player-foto").alt =
            "Foto de perfil";

        document.getElementById("player-region").textContent =
            "-";

        document.getElementById("player-clan").textContent =
            "-";

        document.getElementById("player-main").textContent =
            "-";

        document.getElementById("player-secundario").textContent =
            "-";
    }
});