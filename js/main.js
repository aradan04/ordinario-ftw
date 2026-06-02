/**
 * js/main.js
 * Lógica global de la plataforma (Navbar interactiva y configuraciones del sistema).
 */

function inicializarConfiguracionGlobal() {
    console.log("⚔️ Smash Dashboard: Sistema global inicializado correctamente.");
    
    // Ejecutar el iluminador dinámico de la barra de navegación
    configurarNavbarActiva();
}

/**
 * Operación lógica que analiza la URL actual del navegador 
 * y le añade la clase CSS '.active' al enlace correspondiente.
 */
function configurarNavbarActiva() {
    // 1. Obtener la ruta de la página actual (ej: /vistas/jugador/perfil.html)
    const rutaActual = window.location.pathname;
    
    // 2. Capturar todos los enlaces de la barra de navegación
    const enlacesNav = document.querySelectorAll('.nav-links a');

    // 3. Recorrer los enlaces y evaluar lógicamente cuál coincide con la URL
    enlacesNav.forEach(enlace => {
        // Quitamos la clase active que traiga por defecto el HTML estático
        enlace.classList.remove('active');

        // Obtener el atributo href del enlace (ej: perfil.html o ../roster/roster.html)
        const hrefAtributo = enlace.getAttribute('href');

        // Limpiamos los saltos de carpeta "../" para comparar solo el nombre del archivo
        const nombreArchivoEnlace = hrefAtributo.replace(/\.\.\//g, "");

        // Si la URL actual contiene el nombre del archivo del enlace, lo iluminamos
        if (rutaActual.includes(nombreArchivoEnlace)) {
            enlace.classList.add('active');
        }
        
        // Caso especial para la raíz (Página de Inicio / index.html)
        if ((rutaActual.endsWith('/') || rutaActual.endsWith('index.html')) && nombreArchivoEnlace === 'index.html') {
            enlace.classList.add('active');
        }
    });
}

// Escuchar el evento de carga global para arrancar las configuraciones de la plataforma
document.addEventListener('DOMContentLoaded', inicializarConfiguracionGlobal);