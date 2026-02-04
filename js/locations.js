/**
 * Locations Page Logic
 */

// Check Auth
const user = localStorage.getItem(DB_KEYS.CURRENT_USER);
if (!user) {
    window.location.href = 'login.html';
}

const locationsContainer = document.getElementById('locationsContainer');
const locations = DataManager.getLocations();

// Render Locations with modern cards
locationsContainer.innerHTML = locations.map(loc => `
    <div class="location-card" onclick="selectLocation('${loc.id}')">
        <div class="location-image">
            <div class="location-icon">${loc.icon || '📍'}</div>
        </div>
        <div class="location-content">
            <div class="location-name">${loc.name}</div>
            <div class="location-meta">
                <span>🏪 ${DataManager.getShops(loc.id).length} shops</span>
            </div>
        </div>
    </div>
`).join('');

function selectLocation(id) {
    // Pass location ID via URL parameter
    window.location.href = `shops.html?locationId=${id}`;
}

// Update Cart Badge
const cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');
document.getElementById('cartBadge').textContent = cart.length;

