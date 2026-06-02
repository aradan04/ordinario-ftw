/**
 * Carga y parsea un archivo XML desde una URL.
 * @param {string} url - Ruta del archivo XML
 * @returns {Promise<Document>} - Documento XML listo para ser manipulado
 */
async function cargarXML(url) {
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`Error al cargar el XML: ${respuesta.status}`);
        }
        const texto = await respuesta.text();
        const parser = new DOMParser();
        return parser.parseFromString(texto, "application/xml");
    } catch (error) {
        console.error("Error en la petición Fetch del XML:", error);
    }
}