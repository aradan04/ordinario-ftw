/**
 * Carga un archivo XML.
 */
async function cargarXML(ruta) {
    const respuesta = await fetch(ruta);

    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${ruta}`);
    }

    const texto = await respuesta.text();

    return new DOMParser().parseFromString(texto, "text/xml");
}

/**
 * Determina el estado real del torneo comparando la fecha.
 */
function calcularEstado(fechaTorneo) {

    const hoy = new Date();

    const fecha = new Date(fechaTorneo);

    return fecha >= hoy ? "Programado" : "Finalizado";
}

/**
 * Carga y dibuja los torneos.
 */
async function inicializarTorneos() {

    try {

        const xml = await cargarXML('../../datos/torneos.xml');

        const listaTorneos = xml.getElementsByTagName('torneo');

        const contenedor = document.getElementById('lista-torneos');

        contenedor.innerHTML = "";

        for (let i = 0; i < listaTorneos.length; i++) {

            const torneo = listaTorneos[i];

            const id = torneo.getAttribute('id');

            const nombre =
                torneo.getElementsByTagName('nombre')[0]?.textContent || "Sin nombre";

            const sede =
                torneo.getElementsByTagName('sede')[0]?.textContent || "Sin sede";

            const fecha =
                torneo.getElementsByTagName('fecha')[0]?.textContent || "";

            const participantes =
                torneo.getElementsByTagName('participantes')[0]?.textContent || "0";

            const logo =
                torneo.getElementsByTagName('logo_url')[0]?.textContent || "";

            const estado = calcularEstado(fecha);

            const claseEstado =
                estado === "Programado"
                    ? "estado-programado"
                    : "estado-finalizado";

            const tarjeta = document.createElement('article');

            tarjeta.className = "torneo-card";

            tarjeta.innerHTML = `
                <div class="torneo-header-card">
                    <img src="${logo}" alt="${nombre}" class="torneo-logo">

                    <div>
                        <h2>${nombre}</h2>
                        <p class="torneo-id">${id}</p>
                    </div>
                </div>

                <div class="torneo-info">
                    <p><strong>📍 Sede:</strong> ${sede}</p>
                    <p><strong>📅 Fecha:</strong> ${fecha}</p>
                    <p><strong>👥 Participantes:</strong> ${participantes}</p>
                </div>

                <div class="estado ${claseEstado}">
                    ${estado}
                </div>
            `;

            contenedor.appendChild(tarjeta);
        }

    } catch (error) {

        console.error("Error al cargar torneos:", error);

    }
}

window.addEventListener("load", inicializarTorneos);