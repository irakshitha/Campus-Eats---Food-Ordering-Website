/**
 * Admin Dashboard Logic (Async - Appwrite)
 */

const admin = AppwriteAuth.getCurrentAdmin();
if (!admin) {
    window.location.href = 'admin-login.html';
}

document.getElementById('shopName').textContent = admin.name;

const pendingContainer = document.getElementById('pendingOrders');
const activeContainer = document.getElementById('activeOrders');
const completedContainer = document.getElementById('completedOrders');

async function renderDashboard() {
    const orders = await DataManager.getShopOrders(admin.id);

    // Calculate Stats
    let revenue = 0;

    // Clear Containers
    if (pendingContainer) pendingContainer.innerHTML = '';
    if (activeContainer) activeContainer.innerHTML = '';
    if (completedContainer) completedContainer.innerHTML = '';

    orders.forEach(order => {
        // Filter items for this shop only
        const shopItems = order.items.filter(i => i.shopId === admin.id);
        const shopTotal = shopItems.reduce((sum, i) => sum + (i.price * i.qty), 0);

        // Get this shop's specific token and status
        const tokenObj = order.tokens.find(t => t.shopId === admin.id);
        const currentStatus = order.shopStatus[admin.id] || 'Pending';

        if (currentStatus === 'Completed') {
            revenue += shopTotal;
        }

        const cardHtml = `
            <div class="card order-card status-${currentStatus.toLowerCase().replace(' ', '-')}" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-weight: bold; font-size: 1.2rem;">${tokenObj ? tokenObj.token : 'N/A'}</span>
                    <span style="color: #666;">₹${shopTotal}</span>
                </div>
                <div style="margin-bottom: 10px; font-size: 0.9rem;">
                    ${shopItems.map(i => `<div>${i.qty} x ${i.name}</div>`).join('')}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <select class="status-select" onchange="updateStatus('${order.id}', this.value)" ${currentStatus === 'Completed' ? 'disabled' : ''}>
                        <option value="Confirmed" ${currentStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Preparing" ${currentStatus === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${currentStatus === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
        `;

        if (currentStatus === 'Completed') {
            if (completedContainer) completedContainer.insertAdjacentHTML('afterbegin', cardHtml);
        } else if (currentStatus === 'Ready') {
            if (activeContainer) activeContainer.insertAdjacentHTML('beforeend', cardHtml);
        } else {
            if (pendingContainer) pendingContainer.insertAdjacentHTML('beforeend', cardHtml);
        }
    });

    // Update Stats
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = revenue;
}

async function updateStatus(orderId, newStatus) {
    if (confirm(`Change status to ${newStatus}?`)) {
        await DataManager.updateOrderStatus(orderId, admin.id, newStatus);
        await renderDashboard();
    } else {
        await renderDashboard();
    }
}

function logout() {
    AppwriteAuth.logoutAdmin();
    window.location.href = 'admin-login.html';
}

// Auto refresh every 10 seconds
setInterval(renderDashboard, 10000);

renderDashboard();
