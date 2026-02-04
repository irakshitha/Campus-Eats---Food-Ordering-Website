/**
 * Cart Page Logic
 */

// Check Auth
const user = localStorage.getItem(DB_KEYS.CURRENT_USER);
if (!user) {
    window.location.href = 'login.html';
}

const cartContainer = document.getElementById('cartContainer');
const totalAmountEl = document.getElementById('totalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');

function renderCart() {
    const cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');
    const shops = DataManager.getShops(); // Get all shops to lookup names

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center section">
                <div style="font-size: 4rem; opacity: 0.3; margin-bottom: var(--space-4);">🛒</div>
                <h3 style="margin-bottom: var(--space-4);">Your cart is empty</h3>
                <a href="locations.html" class="btn btn-primary">Start Ordering</a>
            </div>
        `;
        totalAmountEl.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }

    checkoutBtn.disabled = false;

    // Group items by Shop
    const cartByShop = {};
    cart.forEach(item => {
        if (!cartByShop[item.shopId]) {
            cartByShop[item.shopId] = [];
        }
        cartByShop[item.shopId].push(item);
    });

    let html = '';
    let grandTotal = 0;

    for (const [shopId, items] of Object.entries(cartByShop)) {
        const shop = shops.find(s => s.id === shopId);
        const shopTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        grandTotal += shopTotal;

        html += `
            <div class="card card-elevated" style="margin-bottom: var(--space-6);">
                <div class="card-header">
                    <h3>${shop ? shop.name : 'Unknown Shop'}</h3>
                </div>
                <div class="card-body">
                    ${items.map(item => `
                        <div class="flex-between" style="margin-bottom: var(--space-3);">
                            <div>
                                <span style="font-weight: var(--weight-medium);">${item.name}</span>
                                <span class="text-muted" style="font-size: var(--text-sm);"> x ${item.qty}</span>
                            </div>
                            <span style="font-weight: var(--weight-semibold);">₹${item.price * item.qty}</span>
                        </div>
                    `).join('')}
                    
                    <div class="divider"></div>
                    
                    <div class="text-right">
                        <span class="text-muted" style="margin-right: var(--space-2);">Subtotal:</span>
                        <span style="font-weight: var(--weight-bold); font-size: var(--text-lg);">₹${shopTotal}</span>
                    </div>
                </div>
            </div>
        `;
    }

    cartContainer.innerHTML = html;
    totalAmountEl.textContent = grandTotal;
}

// Logic to clear cart is handled by just overwriting or editing.
// For now, checkout proceeds to Payment.

checkoutBtn.addEventListener('click', () => {
    window.location.href = 'payment.html';
});

document.addEventListener('DOMContentLoaded', renderCart);
