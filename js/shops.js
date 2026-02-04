/**
 * Shops Page Logic
 */

// Check Auth
const user = localStorage.getItem(DB_KEYS.CURRENT_USER);
if (!user) {
    window.location.href = 'login.html';
}

// Get Location ID from URL
const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get('locationId');

if (!locationId) {
    window.location.href = 'locations.html';
}

const shopsContainer = document.getElementById('shopsContainer');
const locationNameEl = document.getElementById('locationName');
const shops = DataManager.getShops(locationId);
const locations = DataManager.getLocations();
const currentLocation = locations.find(l => l.id === locationId);

if (currentLocation) {
    locationNameEl.textContent = currentLocation.name;
}

// Render Shops
shopsContainer.innerHTML = shops.map(shop => `
    <div class="card shop-card">
        <div class="shop-image" style="background-image: url('../assets/food-images/${shop.image}'); background-color: #ddd;"></div>
        <div class="shop-info">
            <h3>${shop.name}</h3>
            <p style="color: var(--gray); font-size: 0.9rem;">Tap to view menu</p>
            <button class="btn btn-secondary" onclick="viewMenu('${shop.id}')" style="margin-top: 15px; width: 100%;">View Menu</button>
        </div>
    </div>
`).join('');

if (shops.length === 0) {
    shopsContainer.innerHTML = '<p>No shops found in this zone.</p>';
}

function viewMenu(shopId) {
    window.location.href = `menu.html?shopId=${shopId}`;
}

// Update Cart Badge
const cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');
document.getElementById('cartBadge').textContent = cart.length;
