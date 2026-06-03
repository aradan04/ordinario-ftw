// ==========================================================================
// FUNCIÓN PARA CARGAR XML
// ==========================================================================

async function cargarXML(ruta) {
    try {
        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar el archivo XML: ${ruta}`);
        }

        const textoXML = await respuesta.text();

        return new DOMParser().parseFromString(
            textoXML,
            "text/xml"
        );

    } catch (error) {
        console.error("Error cargando XML:", error);
    }
}

// ==========================================================================
// FUNCIÓN PRINCIPAL
// ==========================================================================

async function inicializarModuloRoster() {

    // Ajusta Datos/datos según el nombre real de tu carpeta
    const xmlPersonajes = await cargarXML('../../Datos/personajes.xml');

    if (!xmlPersonajes) {
        console.error("No se pudo leer personajes.xml");
        return;
    }

    const listaPersonajes =
        xmlPersonajes.getElementsByTagName("personaje");

    console.log(
        "Personajes encontrados:",
        listaPersonajes.length
    );

    const gridRoster =
        document.getElementById("grid-personajes");

    const contenedorDetalle =
        document.getElementById("char-nombre");

    // ======================================================================
    // ROSTER.HTML
    // ======================================================================

    if (gridRoster) {

        const selectorEstilo =
            document.getElementById("select-estilo");

        function renderizarRoster(filtroEstilo) {

            gridRoster.innerHTML = "";

            for (let i = 0; i < listaPersonajes.length; i++) {

                const personaje = listaPersonajes[i];

                const id =
                    personaje.getAttribute("id");

                const nombre =
                    personaje.getElementsByTagName("nombre")[0].textContent;

                const franquicia =
                    personaje.getElementsByTagName("franquicia")[0].textContent;

                const estilo =
                    personaje.getElementsByTagName("estilo")[0].textContent;

                const tier =
                    personaje.getElementsByTagName("tier_sugerida")[0].textContent;

                const imgUrl =
                    personaje.getElementsByTagName("imagen_url")[0].textContent;

                if (
                    filtroEstilo === "todos" ||
                    estilo === filtroEstilo
                ) {

                    const tarjeta =
                        document.createElement("a");

                    tarjeta.href =
                        `personaje.html?id=${id}`;

                    tarjeta.className =
                        "tarjeta-fighter";

                    tarjeta.innerHTML = `
                        <img src="${imgUrl}" alt="${nombre}">
                        <h3>${nombre}</h3>
                        <p>${franquicia}</p>
                        <small>${estilo}</small>
                        <br><br>
                        <span class="badge">
                            Tier ${tier}
                        </span>
                    `;

                    gridRoster.appendChild(tarjeta);
                }
            }
        }

        selectorEstilo.addEventListener(
            "change",
            (e) => {
                renderizarRoster(
                    e.target.value
                );
            }
        );

        renderizarRoster("todos");
    }

    // ======================================================================
    // PERSONAJE.HTML
    // ======================================================================

    if (contenedorDetalle) {

        const parametrosURL =
            new URLSearchParams(
                window.location.search
            );

        const idBuscado =
            parametrosURL.get("id");

        let personajeEncontrado = null;

        for (let i = 0; i < listaPersonajes.length; i++) {

            if (
                listaPersonajes[i].getAttribute("id")
                === idBuscado
            ) {

                personajeEncontrado =
                    listaPersonajes[i];

                break;
            }
        }

        if (personajeEncontrado) {

            const nombre =
                personajeEncontrado.getElementsByTagName("nombre")[0].textContent;

            const franquicia =
                personajeEncontrado.getElementsByTagName("franquicia")[0].textContent;

            const estilo =
                personajeEncontrado.getElementsByTagName("estilo")[0].textContent;

            const pesoValor =
                parseInt(
                    personajeEncontrado
                        .getElementsByTagName("peso_valor")[0]
                        .textContent
                );

            const tier =
                personajeEncontrado.getElementsByTagName("tier_sugerida")[0].textContent;

            const imgUrl =
                personajeEncontrado.getElementsByTagName("imagen_url")[0].textContent;

            document.getElementById("char-nombre").innerText =
                nombre;

            document.getElementById("char-franquicia").innerText =
                franquicia;

            document.getElementById("char-estilo").innerText =
                estilo;

            document.getElementById("char-tier").innerText =
                "TIER " + tier;

            document.getElementById("char-imagen").src =
                imgUrl;

            let clasificacionPeso = "";

            if (pesoValor >= 110) {

                clasificacionPeso =
                    "Heavyweight (Peso Pesado) 🏋️";

            } else if (
                pesoValor >= 90 &&
                pesoValor < 110
            ) {

                clasificacionPeso =
                    "Middleweight (Peso Medio) ⚔️";

            } else {

                clasificacionPeso =
                    "Featherweight (Peso Ligero) 🦅";
            }

            document.getElementById("char-peso-valor").innerText =
                pesoValor;

            document.getElementById("char-peso-clase").innerText =
                clasificacionPeso;

        } else {

            document.getElementById("char-nombre").innerText =
                "Personaje no encontrado";
        }
    }
}

// ==========================================================================
// INICIO
// ==========================================================================

window.onload = inicializarModuloRoster;