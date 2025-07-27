// ========== Main Search Function ==========
async function searchPokemon(searchTerm) {
    showLoading();
    
    try {
        // Fetch Pokemon data from the API
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        
        if (!response.ok) {
            throw new Error('Pokémon not found. Please check the name or ID.');
        }
        
        const pokemonData = await response.json();
        
        // Store the current Pokemon
        currentPokemon = pokemonData;
        
        // Display the Pokemon
        displayPokemon(pokemonData);
        
        // Update favorite button
        updateFavoriteButton();
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// ========== Display Pokemon ==========
function displayPokemon(pokemon) {
    // Show the display section
    document.getElementById('pokemonDisplay').style.display = 'grid';
    
    // Basic Info
    document.getElementById('pokemonName').textContent = pokemon.name.toUpperCase();
    document.getElementById('pokemonId').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
    
    // Sprites
    document.getElementById('pokemonSpriteFront').src = pokemon.sprites.front_default;
    document.getElementById('pokemonSpriteBack').src = pokemon.sprites.back_default || pokemon.sprites.front_default;
    
    // Height and Weight
    document.getElementById('pokemonHeight').textContent = `${pokemon.height / 10} m`;
    document.getElementById('pokemonWeight').textContent = `${pokemon.weight / 10} kg`;
    
    // Types
    displayTypes(pokemon.types);
    
    // Stats
    displayStats(pokemon.stats);
    
    // Abilities
    displayAbilities(pokemon.abilities);
}

// ========== Display Types ==========
function displayTypes(types) {
    const container = document.getElementById('pokemonTypes');
    container.innerHTML = '';
    
    types.forEach(typeInfo => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${typeInfo.type.name}`;
        badge.textContent = typeInfo.type.name;
        container.appendChild(badge);
    });
}

// ========== Display Stats ==========
function displayStats(stats) {
    const container = document.getElementById('statsDisplay');
    container.innerHTML = '';
    
    let total = 0;
    
    stats.forEach(stat => {
        total += stat.base_stat;
        
        // Create stat row
        const row = document.createElement('div');
        row.className = 'stat-row';
        
        // Stat name
        const name = document.createElement('div');
        name.className = 'stat-name';
        name.textContent = formatStatName(stat.stat.name);
        
        // Stat bar
        const bar = document.createElement('div');
        bar.className = 'stat-bar';
        
        const fill = document.createElement('div');
        fill.className = `stat-fill stat-${stat.stat.name}`;
        fill.style.width = `${(stat.base_stat / 255) * 100}%`;
        
        // Stat value
        const value = document.createElement('div');
        value.className = 'stat-value';
        value.textContent = stat.base_stat;
        
        // Build the row
        bar.appendChild(fill);
        row.appendChild(name);
        row.appendChild(bar);
        row.appendChild(value);
        
        container.appendChild(row);
    });
    
    // Show total
    document.getElementById('statsTotal').textContent = total;
}

// ========== Display Abilities ==========
function displayAbilities(abilities) {
    const container = document.getElementById('abilitiesDisplay');
    container.innerHTML = '';
    
    abilities.forEach(abilityInfo => {
        const badge = document.createElement('span');
        badge.className = 'ability-badge';
        
        if (abilityInfo.is_hidden) {
            badge.classList.add('ability-hidden');
            badge.textContent = `${abilityInfo.ability.name} (Hidden)`;
        } else {
            badge.textContent = abilityInfo.ability.name;
        }
        
        container.appendChild(badge);
    });
}

// ========== Helper Function ==========
function formatStatName(statName) {
    const names = {
        'hp': 'HP',
        'attack': 'Attack',
        'defense': 'Defense',
        'special-attack': 'Sp. Attack',
        'special-defense': 'Sp. Defense',
        'speed': 'Speed'
    };
    return names[statName] || statName;
}