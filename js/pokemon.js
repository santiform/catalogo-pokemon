const apiBaseUrl = "https://pokeapi.co/api/v2/pokemon";

// Función para cargar los detalles de un Pokémon
async function fetchPokemonDetails(pokemonName) {
    const response = await fetch(`${apiBaseUrl}/${pokemonName}`);
    if (!response.ok) throw new Error(`No se encontró el Pokémon: ${pokemonName}`);
    const data = await response.json();
    return data;
}

// Función para cargar detalles de descripción, buscando en varios idiomas
async function fetchPokemonDescription(pokemonName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
    if (!response.ok) throw new Error(`No se encontró la descripción del Pokémon: ${pokemonName}`);
    const data = await response.json();

    // Buscar la descripción en español primero
    const descriptionInSpanish = data.flavor_text_entries.find(entry => entry.language.name === 'es');
    if (descriptionInSpanish) return descriptionInSpanish.flavor_text;

    // Si no se encuentra en español, buscar en inglés
    const descriptionInEnglish = data.flavor_text_entries.find(entry => entry.language.name === 'en');
    if (descriptionInEnglish) return descriptionInEnglish.flavor_text;

    // Si no se encuentra en ningún idioma, retornar un mensaje predeterminado
    return "Descripción no disponible.";
}

// Función para mostrar los detalles en la página
async function loadPokemonDetails() {
    const params = new URLSearchParams(window.location.search);
    const pokemonName = params.get("name") || "charizard"; // Si no se pasa un nombre, cargar "charizard" por defecto
    const container = document.querySelector(".pokemon-card");

    try {
        const data = await fetchPokemonDetails(pokemonName);

        // Imagen principal
        const pokemonImg = document.getElementById("pokemon-img");
        const artwork = data.sprites?.other?.["official-artwork"]?.front_default;
        pokemonImg.src = artwork || "https://path.to/your/fan-art.png"; // Usa tu fan art como fallback
        pokemonImg.alt = data.name || "Pokémon";

        // Nombre
        const pokemonNameElem = document.getElementById("pokemon-name");
        pokemonNameElem.textContent = data.name
            ? data.name.charAt(0).toUpperCase() + data.name.slice(1)
            : "Nombre no disponible";

        // Altura
        const heightElem = document.getElementById("pokemon-height");
        heightElem.textContent = data.height
            ? `${(data.height / 10).toFixed(1)}`
            : "Altura no disponible";

        // Peso
        const weightElem = document.getElementById("pokemon-weight");
        weightElem.textContent = data.weight
            ? `${(data.weight / 10).toFixed(1)}`
            : "Peso no disponible";

        // Tipos
        const typesElem = document.getElementById("pokemon-types");
        const types = data.types?.map(t => t.type?.name).join(", ") || "Tipos no disponibles";
        typesElem.textContent = types;

        // Habilidades
        const abilitiesElem = document.getElementById("pokemon-abilities");
        const abilities = data.abilities?.map(a => a.ability?.name).join(", ") || "Habilidades no disponibles";
        abilitiesElem.textContent = abilities;

        // Descripción
        try {
            const description = await fetchPokemonDescription(pokemonName);
            document.getElementById("pokemon-description").textContent = description;
        } catch {
            document.getElementById("pokemon-description").textContent = "Descripción no disponible.";
        }

        // Imágenes adicionales
        const frontDefault = data.sprites?.front_default;
        const backDefault = data.sprites?.back_default;
        const frontShiny = data.sprites?.front_shiny;

        // Verificar si al menos una imagen está disponible
        const pokemonImagesContainer = document.getElementById("pokemon-images");
        pokemonImagesContainer.innerHTML = "";  // Limpiar el contenedor antes de agregar nuevas imágenes

        if (frontDefault || backDefault || frontShiny) {
            if (frontDefault) {
                const frontDefaultContainer = document.createElement('div');
                frontDefaultContainer.classList.add('pokemon-sprite-container');
                const frontImg = document.createElement('img');
                frontImg.src = frontDefault;
                frontImg.classList.add('pokemon-sprite');
                frontDefaultContainer.appendChild(frontImg);
                pokemonImagesContainer.appendChild(frontDefaultContainer);
            }
            
            if (backDefault) {
                const backDefaultContainer = document.createElement('div');
                backDefaultContainer.classList.add('pokemon-sprite-container');
                const backImg = document.createElement('img');
                backImg.src = backDefault;
                backImg.classList.add('pokemon-sprite');
                backDefaultContainer.appendChild(backImg);
                pokemonImagesContainer.appendChild(backDefaultContainer);
            }

            if (frontShiny) {
                const frontShinyContainer = document.createElement('div');
                frontShinyContainer.classList.add('pokemon-sprite-container');
                const shinyImg = document.createElement('img');
                shinyImg.src = frontShiny;
                shinyImg.classList.add('pokemon-sprite');
                frontShinyContainer.appendChild(shinyImg);
                pokemonImagesContainer.appendChild(frontShinyContainer);
            }

            // Mostrar la sección de imágenes solo si alguna está disponible
            pokemonImagesContainer.style.display = "grid";  // Asegura que se muestren las imágenes en un grid
        } else {
            // Si ninguna imagen está disponible, ocultar la sección
            pokemonImagesContainer.style.display = "none";
        }

    } catch (error) {
        container.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error("Error al cargar los detalles:", error);
    }
}

document.getElementById("back-button").addEventListener("click", () => {
    window.close(); // Cierra la pestaña actual
});

// Cargar los detalles cuando la página esté lista
document.addEventListener("DOMContentLoaded", loadPokemonDetails);
