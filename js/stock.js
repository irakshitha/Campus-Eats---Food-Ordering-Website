/**
 * Stock Management Logic
 */

// Check Auth
const admin = JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_ADMIN));
if (!admin) {
    window.location.href = 'admin-login.html';
}

document.getElementById('shopName').textContent = admin.name;
const stockContainer = document.getElementById('stockContainer');

function renderStock() {
    const menu = DataManager.getMenu(admin.id);

    stockContainer.innerHTML = menu.map(item => `
        <div class="stock-item">
            <div style="flex-grow: 1;">
                <strong>${item.name}</strong><br>
                <span style="font-size: 0.9rem; color: #666;">Price: ₹${item.price} | Type: ${item.type}</span>
            </div>
            
            <div style="display: flex; align-items: center;">
                <label style="margin-right: 10px; font-size: 0.9rem;">Qty:</label>
                <input type="number" id="stock-${item.id}" value="${item.stock}" class="stock-input" min="0">
                <button class="save-stock-btn" onclick="updateStock('${item.id}')">Update</button>
            </div>
        </div>
    `).join('');
}

function updateStock(itemId) {
    const newVal = document.getElementById(`stock-${itemId}`).value;
    if (newVal < 0) {
        alert('Stock cannot be negative');
        return;
    }

    const success = DataManager.updateStock(itemId, newVal);
    if (success) {
        alert('Stock Updated!');
        renderStock(); // Refresh to confirm
    } else {
        alert('Update Failed');
    }
}

function logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_ADMIN);
    window.location.href = 'admin-login.html';
}

renderStock();
