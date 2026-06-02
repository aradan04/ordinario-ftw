/**
 * Lógica para la página vistas/jugador/historial.html
 * Carga el historial de combates, cruza los datos con el roster y calcula métricas.
 */
async function inicializarHistorial() {
    // 1. Cargar las fuentes de datos XML saliendo correctamente a la raíz (../../)
    const xmlCombates = await cargarXML('../../datos/combates.xml');
    const xmlPersonajes = await cargarXML('../../datos/personajes.xml');

    // 2. Obtener las listas de nodos de ambos archivos
    const listaCombates = xmlCombates.getElementsByTagName('combate');
    const listaPersonajes = xmlPersonajes.getElementsByTagName('personaje');
    
    // Elemento del DOM donde se inyectarán las filas de la tabla
    const tablaBody = document.getElementById('tabla-combates');

    // Variables de control para las operaciones lógicas y matemáticas
    let totalCombates = listaCombates.length;
    let victorias = 0;

    // Limpiar el cuerpo de la tabla para evitar duplicados en la carga
    tablaBody.innerHTML = "";

    // 3. Recorrer de forma dinámica cada combate registrado
    for (let i = 0; i < totalCombates; i++) {
        const combate = listaCombates[i];
        
        // Extracción de atributos y nodos del combate actual
        const id = combate.getAttribute('id');
        const rival = combate.getElementsByTagName('rival')[0].textContent;
        const personajeId = combate.getElementsByTagName('personaje_id')[0].textContent;
        const resultado = combate.getElementsByTagName('resultado')[0].textContent;
        const stocks = combate.getElementsByTagName('stocks')[0].textContent;

        // Variables temporales para el cruce de datos
        let nombreFighter = "Desconocido";
        let estiloFighter = "N/A";
        let imgFighter = "";

        // --- OPERACIÓN LÓGICA: Cruzar datos con personajes.xml ---
        // Buscamos las propiedades del personaje usando el "personaje_id" como llave
        for (let j = 0; j < listaPersonajes.length; j++) {
            if (listaPersonajes[j].getAttribute('id') === personajeId) {
                nombreFighter = listaPersonajes[j].getElementsByTagName('nombre')[0].textContent;
                estiloFighter = listaPersonajes[j].getElementsByTagName('estilo')[0].textContent;
                imgFighter = listaPersonajes[j].getElementsByTagName('imagen_url')[0].textContent;
                break; // Coincidencia encontrada, rompemos el ciclo interno
            }
        }

        // --- OPERACIÓN LÓGICA: Evaluar resultado para aplicar estilos CSS ---
        let claseFila = "perdido"; // Estado por defecto
        if (resultado.toLowerCase() === "victoria") {
            victorias++;          // Contador para la operación matemática posterior
            claseFila = "ganado";  // Clase CSS para pintar la fila verde
        }

        // --- OPERACIÓN LÓGICA: Dibujar las vidas/stocks restantes ---
        // Convierte el texto numérico en estrellas repetidas, si es 0 muestra KO
        let visualStocks = "⭐".repeat(parseInt(stocks)) || "❌ KO";

        // 4. Crear la fila e inyectarla en el árbol DOM de la tabla
        const fila = document.createElement('tr');
        fila.className = claseFila; // Inyección de la clase lógica (.ganado o .perdido)
        
        fila.innerHTML = `
            <td>#${id}</td>
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

    // ==========================================================================
    // OPERACIONES MATEMÁTICAS: Cálculo de Métricas Globales del Jugador
    // ==========================================================================
    
    // Inyectar el total de peleas contadas en el XML
    document.getElementById('total-peleas').innerText = totalCombates;
    
    // Calcular el Win Rate en porcentaje (Fórmula: (Victorias / Total) * 100)
    let winRateCalculado = 0;
    if (totalCombates > 0) {
        winRateCalculado = (victorias / totalCombates) * 100;
    }
    
    // Inyectar el resultado formateado a un solo decimal en el HTML
    document.getElementById('win-rate').innerText = `${winRateCalculado.toFixed(1)}%`;
}

// Inicializar el script una vez que la estructura HTML de la página esté cargada
window.onload = inicializarHistorial;