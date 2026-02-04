/**
 * Payment Page Logic
 */

// Check Auth
const user = JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
if (!user) {
    window.location.href = 'login.html';
}

const payBtn = document.getElementById('payBtn');
const paymentForm = document.getElementById('paymentForm');

// Calculate Total again for display
const cart = JSON.parse(localStorage.getItem(DB_KEYS.CART) || '[]');
const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
document.getElementById('payAmount').textContent = totalAmount;

if (cart.length === 0) {
    alert('Cart is empty!');
    window.location.href = 'locations.html';
}

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate Processing
    payBtn.textContent = 'Processing...';
    payBtn.disabled = true;

    setTimeout(() => {
        completeOrder();
    }, 1500);
});

function completeOrder() {
    // 1. Generate Order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-6);

    // 2. Generate Tokens Per Shop
    // We need to split the cart by shop
    const cartByShop = {};
    cart.forEach(item => {
        if (!cartByShop[item.shopId]) {
            cartByShop[item.shopId] = [];
        }
        cartByShop[item.shopId].push(item);
    });

    const shops = DataManager.getShops();
    const tokenList = [];
    const shopStatus = {}; // To track status per shop (e.g., { 'shop_g1': 'Preparing' })

    for (const [shopId, items] of Object.entries(cartByShop)) {
        // Generate Token: e.g. GZ-101 (Using shop name initials or mapped code needs logic)
        // Let's use simple logic: ShopNameInitials + Random 3 digit
        const shop = shops.find(s => s.id === shopId);
        const shopPrefix = shop ? shop.name.substring(0, 2).toUpperCase() : 'XX';
        const randomNum = Math.floor(100 + Math.random() * 900);
        const token = `${shopPrefix}-${randomNum}`;

        tokenList.push({
            shopId: shopId,
            shopName: shop.name,
            token: token,
            items: items
        });

        shopStatus[shopId] = 'Confirmed'; // Initial Status
    }

    // 3. Create Order Object
    const newOrder = {
        id: orderId,
        user: user,
        timestamp: new Date().toISOString(),
        items: cart, // Full flat list
        total: totalAmount,
        tokens: tokenList, // Grouped info with tokens
        shopStatus: shopStatus // Status tracking key-value
    };

    // 4. Save to DB
    DataManager.placeOrder(newOrder);

    // 5. Clear Cart
    localStorage.removeItem(DB_KEYS.CART);

    // 6. Redirect to Token Page (Passing Order ID)
    window.location.href = `token.html?orderId=${orderId}`;

}
