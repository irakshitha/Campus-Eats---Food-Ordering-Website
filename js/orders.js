/**
 * Orders and Token Page Logic
 */

// Check Auth
const user = JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
if (!user) {
    window.location.href = 'login.html';
}

// ---------------------------------------------------------
// TOKEN PAGE LOGIC (token.html)
// ---------------------------------------------------------
if (window.location.pathname.includes('token.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const tokenListEl = document.getElementById('tokenList');

    if (!orderId) {
        window.location.href = 'orders.html';
    }

    const orders = DataManager.getOrders(user.regNo);
    const order = orders.find(o => o.id === orderId);

    if (order && tokenListEl) {
        tokenListEl.innerHTML = order.tokens.map(t => `
            <div class="card token-card" style="text-align: center; background: #fff8f8; border: 2px dashed var(--primary-color);">
                <h3 style="color: var(--gray);">${t.shopName}</h3>
                <h1 style="font-size: 3rem; color: var(--primary-color); margin: 10px 0;">${t.token}</h1>
                <p>Show this token at the counter</p>
            </div>
        `).join('');
    }
}

// ---------------------------------------------------------
// ORDERS PAGE LOGIC (orders.html)
// ---------------------------------------------------------
if (window.location.pathname.includes('orders.html')) {
    const ordersContainer = document.getElementById('ordersContainer');
    const myOrders = DataManager.getOrders(user.regNo);

    if (myOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center section">
                <div style="font-size: 4rem; opacity: 0.3; margin-bottom: var(--space-4);">📋</div>
                <h3 style="margin-bottom: var(--space-4);">No active orders</h3>
                <a href="locations.html" class="btn btn-primary">Make your first order</a>
            </div>
        `;
    } else {
        ordersContainer.innerHTML = myOrders.reverse().map(order => {
            const shopStatuses = order.tokens.map(t => {
                const status = order.shopStatus[t.shopId] || 'Pending';
                let badgeClass = 'status-badge status-preparing'; // Default
                if (status === 'Ready') badgeClass = 'status-badge status-ready';
                if (status === 'Completed') badgeClass = 'status-badge status-collected';
                if (status === 'Confirmed') badgeClass = 'status-badge status-confirmed';

                return `
                    <div style="background: var(--lighter-gray); padding: var(--space-4); border-radius: var(--radius-lg); margin-top: var(--space-4);">
                        <div class="flex-between">
                            <strong>${t.shopName}</strong>
                            <span class="${badgeClass}">${status}</span>
                        </div>
                        <div style="font-size: var(--text-2xl); font-weight: var(--weight-bold); margin: var(--space-2) 0; color: var(--primary-red);">Token: ${t.token}</div>
                        <div class="text-muted" style="font-size: var(--text-sm);">
                            ${t.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                        </div>
                        <div class="text-right" style="margin-top: var(--space-2);">
                             <a href="token.html?orderId=${order.id}" class="btn btn-small btn-outline">View Ticket</a>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="card order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${new Date(order.timestamp).toLocaleString()}</span>
                    </div>
                    ${shopStatuses}
                    <div class="divider"></div>
                    <div class="text-right">
                        <span class="text-muted">Total Paid:</span>
                        <span style="font-weight: var(--weight-bold); font-size: var(--text-lg); margin-left: var(--space-2);">₹${order.total}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}
