// Función que se ejecuta automáticamente al cargar la página
async function inicializarModuloRoster() {
    // 1. Cargar la base de datos de personajes saliendo correctamente a la raíz (../../)
    const xmlPersonajes = await cargarXML('../../datos/personajes.xml');
    const listaPersonajes = xmlPersonajes.getElementsByTagName('personaje');

    // 2. Identificar en qué página está parado el usuario actualmente
    const gridRoster = document.getElementById('grid-personajes');
    const contenedorDetalle = document.getElementById('char-nombre');

    // ==========================================================================
    // LÓGICA A: PÁGINAS DEL ROSTER (roster.html)
    // ==========================================================================
    if (gridRoster) {
        const selectorEstilo = document.getElementById('select-estilo');

        // Función interna para filtrar y dibujar los luchadores en la cuadrícula
        function renderizarRoster(filtroEstilo) {
            gridRoster.innerHTML = ""; // Limpiar el contenedor antes de pintar

            for (let i = 0; i < listaPersonajes.length; i++) {
                const personaje = listaPersonajes[i];
                
                const id = personaje.getAttribute('id');
                const nombre = personaje.getElementsByTagName('nombre')[0].textContent;
                const estilo = personaje.getElementsByTagName('estilo')[0].textContent;
                const imgUrl = personaje.getElementsByTagName('imagen_url')[0].textContent;

                // --- OPERACIÓN LÓGICA: ¿Cumple con el filtro seleccionado? ---
                if (filtroEstilo === "todos" || estilo === filtroEstilo) {
                    
                    // Creamos un enlace dinámico que manda el ID por la URL (parámetro ?id=XX)
                    const tarjeta = document.createElement('a');
                    tarjeta.href = `personaje.html?id=${id}`;
                    tarjeta.className = "tarjeta-fighter";
                    
                    tarjeta.innerHTML = `
                        <img src="${imgUrl}" alt="${nombre}">
                        <h3>${nombre}</h3>
                        <small style="color: #aaa; font-weight: bold; text-transform: uppercase;">${estilo}</small>
                    `;
                    gridRoster.appendChild(tarjeta);
                }
            }
        }

        // Escuchar cuando el usuario cambie la opción del menú desplegable
        selectorEstilo.addEventListener('change', (e) => {
            renderizarRoster(e.target.value);
        });

        // Carga inicial: Mostrar todos los personajes del roster
        renderizarRoster("todos");
    }

    // ==========================================================================
    // LÓGICA B: PÁGINA DE DETALLE INDIVIDUAL (personaje.html)
    // ==========================================================================
    if (contenedorDetalle) {
        // Capturar el ID que pasamos en la URL usando URLSearchParams
        const parametrosURL = new URLSearchParams(window.location.search);
        const idBuscado = parametrosURL.get('id');

        // Buscar el personaje en el XML que coincida con ese ID
        let personajeEncontrado = null;
        for (let i = 0; i < listaPersonajes.length; i++) {
            if (listaPersonajes[i].getAttribute('id') === idBuscado) {
                personajeEncontrado = listaPersonajes[i];
                break;
            }
        }

        // Si encontramos el personaje, extraemos los datos e inyectamos
        if (personajeEncontrado) {
            const nombre = personajeEncontrado.getElementsByTagName('nombre')[0].textContent;
            const franquicia = personajeEncontrado.getElementsByTagName('franquicia')[0].textContent;
            const estilo = personajeEncontrado.getElementsByTagName('estilo')[0].textContent;
            const pesoValor = parseInt(personajeEncontrado.getElementsByTagName('peso_valor')[0].textContent);
            const tier = personajeEncontrado.getElementsByTagName('tier_sugerida')[0].textContent;
            const imgUrl = personajeEncontrado.getElementsByTagName('imagen_url')[0].textContent;

            // Inyección básica de textos e imágenes de internet
            document.getElementById('char-nombre').innerText = nombre;
            document.getElementById('char-franquicia').innerText = franquicia;
            document.getElementById('char-estilo').innerText = estilo;
            document.getElementById('char-tier').innerText = "TIER " + tier;
            document.getElementById('char-imagen').src = imgUrl;

            // --- OPERACIÓN LÓGICA CON IF/ELSE: Clasificación de tipos por peso ---
            let clasificacionPeso = "";
            if (pesoValor >= 110) {
                clasificacionPeso = "Heavyweight (Peso Pesado) 🏋️‍♂️";
            } else if (pesoValor >= 90 && pesoValor < 110) {
                clasificacionPeso = "Middleweight (Peso Medio) ⚔️";
            } else {
                clasificacionPeso = "Featherweight (Peso Ligero) 🦅";
            }

            // Inyectamos el tipo calculado por la lógica
            document.getElementById('char-peso-valor').innerText = pesoValor;
            document.getElementById('char-peso-clase').innerText = clasificacionPeso;
        } else {
            // Control de errores si modifican la URL manualmente
            document.getElementById('char-nombre').innerText = "Personaje no encontrado";
        }
    }
}

// Inicializar el script al cargar el DOM
window.onload = inicializarModuloRoster;