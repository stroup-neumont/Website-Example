// ========== Create Pokemon XML ==========
function createPokemonXML(data) {
    const currentDate = new Date().toISOString();
    
    // Build XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<favorites>
    <metadata>
        <created>${currentDate}</created>
        <trainer-name>${data.trainerName}</trainer-name>
        <total-favorites>${data.favorites.length}</total-favorites>
    </metadata>
    
    <pokemon-list>`;

    // Add each Pokemon
    data.favorites.forEach(pokemon => {
        xml += `
        <pokemon>
            <id>${pokemon.id}</id>
            <n>${pokemon.name}</n>
            <types>`;
        
        // Add types
        pokemon.types.forEach(type => {
            xml += `
                <type>${type}</type>`;
        });
        
        xml += `
            </types>
            <sprite>${pokemon.sprite}</sprite>
            <date-added>${pokemon.dateAdded}</date-added>
        </pokemon>`;
    });

    xml += `
    </pokemon-list>
</favorites>`;
    
    return xml;
}

// ========== Download XML File ==========
function downloadXML(xmlContent, filename) {
    // Create a blob (file in memory)
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Click the link to download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ========== Parse XML (for importing) ==========
function parseXMLString(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Check for errors
    if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid XML format');
    }
    
    return xmlDoc;
}

// ========== Extract Pokemon from XML ==========
function extractPokemonFromXML(xmlDoc) {
    const pokemonList = [];
    const pokemonNodes = xmlDoc.querySelectorAll('pokemon');
    
    pokemonNodes.forEach(node => {
        const pokemon = {
            id: parseInt(node.querySelector('id').textContent),
            name: node.querySelector('n').textContent,
            types: [],
            sprite: node.querySelector('sprite').textContent,
            dateAdded: node.querySelector('date-added').textContent
        };
        
        // Get all types
        const typeNodes = node.querySelectorAll('type');
        typeNodes.forEach(typeNode => {
            pokemon.types.push(typeNode.textContent);
        });
        
        pokemonList.push(pokemon);
    });
    
    return pokemonList;
}

// ========== Import XML File (Could make this part extra credit :) ) ==========
function importXMLFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const xmlDoc = parseXMLString(event.target.result);
            const pokemonList = extractPokemonFromXML(xmlDoc);
            
            // Add imported Pokemon to favorites
            pokemonList.forEach(pokemon => {
                if (!favorites.some(p => p.id === pokemon.id)) {
                    favorites.push(pokemon);
                }
            });
            
            saveFavorites();
            updateFavoritesDisplay();
            showNotification('XML imported successfully!');
            
        } catch (error) {
            showError('Failed to import XML file');
        }
    };
    
    reader.readAsText(file);
}