let pokemonCards = []; // Declare pokemonCards fuera de loadCatalog para que sea accesible globalmente

async function getTotalPokemonCount() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
    const data = await response.json();
    return data.count;
}

async function fetchPokemonList(offset, limit = 20) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    return data.results; // Devuelve solo los nombres y URLs de los Pokémon
}

async function fetchPokemonData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data; // Devuelve la información completa del Pokémon
}

async function loadCatalog() {
    const container = document.getElementById("catalog-container");
    const progressBar = document.getElementById("progress-bar");
    const progressPercentage = document.getElementById("progress-percentage");
    const pokemonCount = document.getElementById("pokemon-count");

    // Limpiar el contenedor del catálogo para evitar el mensaje "Cargando Pokémon"
    container.innerHTML = "";

    try {
        const totalPokemon = await getTotalPokemonCount();
        const limit = 120; // Pokémon por página
        const totalPages = Math.ceil(totalPokemon / limit);
        let currentPage = 0;

        // Cargar los Pokémon por etapas
        for (currentPage; currentPage < totalPages; currentPage++) {
            const offset = currentPage * limit;
            const pokemonList = await fetchPokemonList(offset, limit);

            // Actualiza la barra de progreso
            progressBar.value = ((currentPage + 1) / totalPages) * 100;
            progressPercentage.textContent = `${Math.round(((currentPage + 1) / totalPages) * 100)}%`;

            // Obtener y mostrar los Pokémon de la página actual
            for (const pokemon of pokemonList) {
                const data = await fetchPokemonData(pokemon.url); // Obtiene los detalles de cada Pokémon

                // Crear la tarjeta del Pokémon
                const card = document.createElement("div");
                card.className = "pokemon-card";

                // Crear la imagen del Pokémon
                const img = document.createElement("img");
                img.src = data.sprites.other["official-artwork"].front_default;
                img.alt = pokemon.name;

                // Crear la sección del nombre con fondo
                const nameContainer = document.createElement("div");
                nameContainer.className = "pokemon-name"; // Clase para el fondo
                const name = document.createElement("h3");
                name.textContent = pokemon.name; // Mostrar solo el nombre del Pokémon

                nameContainer.appendChild(name);

                // Crear el enlace a la página de detalles del Pokémon
                const link = document.createElement("a");
                link.href = `pokemon.html?name=${pokemon.name.toLowerCase()}`; // Usamos el nombre del Pokémon
                link.target = "_blank"; // Abrir en una nueva ventana o pestaña
                link.appendChild(card); // Añadimos la tarjeta al enlace


                // Agregar los elementos a la tarjeta
                card.appendChild(img);
                card.appendChild(nameContainer);

                // Guardar la tarjeta de Pokémon en el array global
                pokemonCards.push({ name: pokemon.name.toLowerCase(), card: link });
            }

            // Actualizar el contador de Pokémon cargados
            pokemonCount.textContent = `Pokémon cargados: ${Math.min((currentPage + 1) * limit, totalPokemon)} de ${totalPokemon}`;

            // Si no es la última página, agregar un pequeño retraso para no sobrecargar el servidor
            if (currentPage < totalPages - 1) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Retraso de 500 ms
            }

            // Aplicar el filtro después de cada carga de Pokémon
            const currentQuery = document.getElementById("search-box").value.toLowerCase(); // Obtiene el valor del input
            applyFilter(currentQuery); // Aplica el filtro
        }

        // Cuando se termine de cargar
        progressBar.value = 100;
        progressPercentage.textContent = '100%';

    } catch (error) {
        container.innerHTML = "<p>Error al cargar el catálogo.</p>";
        console.error(error);
    }
}

function applyFilter(query) {
    const container = document.getElementById("catalog-container");
    const noResultsMessage = document.getElementById("no-results");

    // Limpiar el contenedor antes de aplicar el filtro
    container.innerHTML = ""; // Limpiar todo el catálogo visible

    let foundResults = false;

    // Filtrar y mostrar solo las tarjetas que coinciden con la búsqueda
    pokemonCards.forEach(({ card, name }) => {
        if (name.includes(query)) {
            container.appendChild(card); // Mostrar tarjeta
            foundResults = true;
        }
    });

    // Si no hay resultados, mostrar el mensaje de "No se encontraron resultados"
    if (!foundResults) {
        noResultsMessage.classList.add('visible');
    } else {
        noResultsMessage.classList.remove('visible');
    }
}

// Registra el evento de búsqueda para aplicar el filtro cada vez que se escribe
const searchBox = document.getElementById("search-box");
searchBox.addEventListener("input", () => {
    const currentQuery = searchBox.value.toLowerCase(); // Obtiene el valor del input
    applyFilter(currentQuery); // Aplica el filtro
});

// Cargar el catálogo al iniciar la página
loadCatalog();
