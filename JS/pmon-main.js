// Global variables to store data
let currentPokemon = null;  
let favorites = [];         

// ========== Start the Application ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Starting Pokédex...');
    
    // Set up button clicks
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('randomBtn').addEventListener('click', handleRandom);
    document.getElementById('addToFavoritesBtn').addEventListener('click', handleAddToFavorites);
    document.getElementById('exportXmlBtn').addEventListener('click', handleExportXML);
    
    // Allow Enter key to search
    document.getElementById('pokemonInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Load saved favorites
    loadFavorites();
    updateFavoritesDisplay();
});

// ========== Search Handler ==========
async function handleSearch() {
    const searchTerm = document.getElementById('pokemonInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        showError('Please enter a Pokémon name or ID');
        return;
    }
    
    await searchPokemon(searchTerm);
}

// ========== Random Pokemon Handler ==========
async function handleRandom() {
    // First, fetch the total count of Pokemon dynamically
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
        const data = await response.json();
        const totalPokemon = data.count;
        
        // Generate random ID between 1 and total count
        const randomId = Math.floor(Math.random() * totalPokemon) + 1;
        await searchPokemon(randomId);
    } catch (error) {
        // Fallback to a known safe range if the count fetch fails
        const randomId = Math.floor(Math.random() * 1010) + 1;
        await searchPokemon(randomId);
    }
}

// ========== Add to Favorites Handler ==========
function handleAddToFavorites() {
    if (!currentPokemon) return;
    
    // Check if already in favorites
    const index = favorites.findIndex(p => p.id === currentPokemon.id);
    
    if (index !== -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        document.getElementById('addToFavoritesBtn').innerHTML = '<span class="heart-icon">❤️</span> Add to Favorites';
        showNotification(`${currentPokemon.name} removed from favorites`);
    } else {
        // Add to favorites
        const favoriteData = {
            id: currentPokemon.id,
            name: currentPokemon.name,
            types: currentPokemon.types.map(t => t.type.name),
            sprite: currentPokemon.sprites.front_default,
            dateAdded: new Date().toISOString()
        };
        
        favorites.push(favoriteData);
        document.getElementById('addToFavoritesBtn').innerHTML = '<span class="heart-icon">💔</span> Remove from Favorites';
        showNotification(`${currentPokemon.name} added to favorites!`);
    }
    
    // Save and update display
    saveFavorites();
    updateFavoritesDisplay();
}

// ========== Export XML Handler ==========
function handleExportXML() {
    if (favorites.length === 0) {
        showError('No favorites to export');
        return;
    }
    
    const xmlContent = createPokemonXML({
        trainerName: 'Pokémon Trainer',
        favorites: favorites
    });
    
    downloadXML(xmlContent, 'pokemon-favorites.xml');
    showNotification('Favorites exported successfully!', 'success');
}

// ========== Display Functions ==========
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('pokemonDisplay').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    document.getElementById('error').textContent = message;
    document.getElementById('error').style.display = 'block';
    document.getElementById('pokemonDisplay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Use the same notification system as the audio player
    createNotification(message, type);
}

function createNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `audio-notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ========== Favorites Management ==========
function loadFavorites() {
    // Get favorites from browser storage
    const saved = localStorage.getItem('pokemonFavorites');
    if (saved) {
        favorites = JSON.parse(saved);
    }
}

function saveFavorites() {
    // Save favorites to browser storage
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

function updateFavoritesDisplay() {
    const container = document.getElementById('favoritesContainer');
    const section = document.getElementById('favoritesSection');
    const exportBtn = document.getElementById('exportXmlBtn');
    
    if (favorites.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    // Show the favorites section and export button
    section.style.display = 'block';
    if (exportBtn) {
        exportBtn.style.display = 'flex';
    }
    
    // Clear and rebuild the display
    container.innerHTML = '';
    
    favorites.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <img src="${pokemon.sprite}" alt="${pokemon.name}">
            <h4>${pokemon.name}</h4>
            <p>${pokemon.types.join(', ')}</p>
        `;
        
        // Click to search for this Pokemon
        card.addEventListener('click', () => {
            searchPokemon(pokemon.id);
        });
        
        container.appendChild(card);
    });
}

// ========== Update Favorite Button ==========
function updateFavoriteButton() {
    if (!currentPokemon) return;
    
    const button = document.getElementById('addToFavoritesBtn');
    const isFavorite = favorites.some(p => p.id === currentPokemon.id);
    
    if (isFavorite) {
        button.innerHTML = '<span class="heart-icon">💔</span> Remove from Favorites';
    } else {
        button.innerHTML = '<span class="heart-icon">❤️</span> Add to Favorites';
    }
}