/**
 * Menu Page Logic
 */

// Check Auth
const user = localStorage.getItem(DB_KEYS.CURRENT_USER);
if (!user) {
    window.location.href = 'login.html';
}

const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get('shopId');

if (!shopId) {
    window.location.href = 'locations.html';
}

const menuContainer = document.getElementById('menuContainer');
const shopNameEl = document.getElementById('shopName');
const shop = DataManager.getShopDetails(shopId);
const menuItems = DataManager.getMenu(shopId);

if (shop) {
    shopNameEl.textContent = shop.name;
}

// Render Menu with modern cards
function renderMenu() {
    // Get current cart to show existing quantities
    const cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');

    menuContainer.innerHTML = menuItems.map(item => {
        const cartItem = cart.find(c => c.id === item.id);
        const qty = cartItem ? cartItem.qty : 0;
        const isOutOfStock = item.stock <= 0;

        return `
        <div class="menu-item ${isOutOfStock ? 'out-of-stock' : ''}">
            <div class="menu-item-image">
                <div class="veg-indicator ${item.type}"></div>
            </div>
            <div class="menu-item-content">
                <div class="item-header">
                    <h3 class="item-name">${item.name}</h3>
                </div>
                <div class="item-footer">
                    <div class="item-price">₹${item.price}</div>
                    <div class="item-actions">
                        ${qty === 0 ? `
                            <button class="add-btn" onclick="addToCart('${item.id}')" ${isOutOfStock ? 'disabled' : ''}>
                                ${isOutOfStock ? 'Sold Out' : '+ Add'}
                            </button>
                        ` : `
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
                                <span class="qty-value">${qty}</span>
                                <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    updateCartBadge();
}

function addToCart(itemId) {
    changeQty(itemId, 1);
}

function changeQty(itemId, change) {
    let cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');
    const item = menuItems.find(m => m.id === itemId);
    const cartItemIndex = cart.findIndex(c => c.id === itemId);

    // Rule 1: Max 5 items total in cart
    const currentTotalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);

    // We only care about total limit if we are ADDING
    if (change > 0 && currentTotalItems >= 5) {
        alert('Max 5 items total allowed per order.');
        return;
    }

    if (cartItemIndex > -1) {
        // Item exists
        const newQty = cart[cartItemIndex].qty + change;

        // Rule 2: Max 2 quantity per item
        if (newQty > 2) {
            alert('Max quantity of 2 per item allowed.');
            return;
        }

        if (newQty <= 0) {
            cart.splice(cartItemIndex, 1);
        } else {
            // Check stock limit again just in case
            if (newQty > item.stock) {
                alert('Cannot exceed available stock.');
                return;
            }
            cart[cartItemIndex].qty = newQty;
        }
    } else {
        // New Item
        if (change > 0) {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                type: item.type,
                shopId: shopId, // Store shopId to group items later
                qty: 1
            });
        }
    }

    // Rule 3: Max ₹300 per shop
    // Group by shop and check
    const shopTotal = cart
        .filter(c => c.shopId === shopId)
        .reduce((sum, c) => sum + (c.price * c.qty), 0);

    if (shopTotal > 300) {
        alert('Max order value ₹300 per shop allowed.');
        // Revert change (lazy way: just reload or manual revert logic. 
        // Better: calculate *before* committing. 
        // For simplicity: We will just alert and NOT save if it violates, effectively reverting)
        // But we already modified the array. Let's re-read old cart and return.
        // Or simply remove/decrement the item we just modified.

        // Let's do it cleanly:
        // We will just not save to localStorage and re-render.
        renderMenu();
        return;
    }

    localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
    renderMenu();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');
    document.getElementById('cartBadge').textContent = cart.length;
}

renderMenu();
