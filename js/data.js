/**
 * CampusEats - Data & LocalStorage Management
 */

const CAMPUS_DATA = {
    locations: [
        { id: 'loc_gazebo', name: 'Gazebo' },
        { id: 'loc_north', name: 'North Square' },
        { id: 'loc_ab3', name: 'AB3 Canteen' },
        { id: 'loc_gym', name: 'Gymkhana' }
    ],
    shops: [
        // Gazebo (4 shops)
        { id: 'shop_g1', locationId: 'loc_gazebo', name: 'Gazebo Juice Bar', image: 'juice.jpg' },
        { id: 'shop_g2', locationId: 'loc_gazebo', name: 'Gazebo Snacks', image: 'snacks.jpg' },
        { id: 'shop_g3', locationId: 'loc_gazebo', name: 'Gazebo Waffle', image: 'waffle.jpg' },
        { id: 'shop_g4', locationId: 'loc_gazebo', name: 'Gazebo Coffee', image: 'coffee.jpg' },

        // North Square (4 shops)
        { id: 'shop_n1', locationId: 'loc_north', name: 'North Spicy', image: 'spicy.jpg' },
        { id: 'shop_n2', locationId: 'loc_north', name: 'North Sweets', image: 'sweets.jpg' },
        { id: 'shop_n3', locationId: 'loc_north', name: 'North Burger', image: 'burger.jpg' },
        { id: 'shop_n4', locationId: 'loc_north', name: 'North Pizza', image: 'pizza.jpg' },

        // AB3 (1 shop)
        { id: 'shop_ab3', locationId: 'loc_ab3', name: 'AB3 Quick Bites', image: 'quick.jpg' },

        // Gymkhana (1 shop)
        { id: 'shop_gym', locationId: 'loc_gym', name: 'Gymkhana MultiCuisine', image: 'gymfood.jpg' }
    ],
    menuItems: [
        // Sample Menu Items - Gazebo Juice Bar
        { id: 'm_g1_1', shopId: 'shop_g1', name: 'Orange Juice', price: 40, type: 'veg', stock: 50 },
        { id: 'm_g1_2', shopId: 'shop_g1', name: 'Mango Shake', price: 60, type: 'veg', stock: 40 },
        
        // Sample Menu Items - Gazebo Snacks
        { id: 'm_g2_1', shopId: 'shop_g2', name: 'Samosa', price: 15, type: 'veg', stock: 100 },
        { id: 'm_g2_2', shopId: 'shop_g2', name: 'Chicken Puff', price: 25, type: 'non-veg', stock: 30 },

        // Sample Menu Items - Gymkhana
        { id: 'm_gym_1', shopId: 'shop_gym', name: 'Chicken Biryani', price: 180, type: 'non-veg', stock: 20 },
        { id: 'm_gym_2', shopId: 'shop_gym', name: 'Paneer Butter Masala', price: 150, type: 'veg', stock: 25 },
        { id: 'm_gym_3', shopId: 'shop_gym', name: 'Naan', price: 30, type: 'veg', stock: 100 }
    ]
};

// Admin Credentials (Hardcoded for simulation)
const ADMIN_CREDENTIALS = {
    'shop_g1': 'pass123',
    'shop_gym': 'pass123'
    // In a real app, this would be robust auth
};

const DB_KEYS = {
    LOCATIONS: 'ce_locations',
    SHOPS: 'ce_shops',
    MENU: 'ce_menu',
    ORDERS: 'ce_orders',
    CART: 'ce_cart',
    CURRENT_USER: 'ce_user',
    CURRENT_ADMIN: 'ce_admin'
};

const DataManager = {
    init: () => {
        if (!localStorage.getItem(DB_KEYS.LOCATIONS)) {
            console.log('Seeding Data...');
            localStorage.setItem(DB_KEYS.LOCATIONS, JSON.stringify(CAMPUS_DATA.locations));
            localStorage.setItem(DB_KEYS.SHOPS, JSON.stringify(CAMPUS_DATA.shops));
            localStorage.setItem(DB_KEYS.MENU, JSON.stringify(CAMPUS_DATA.menuItems));
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
        }
    },

    getLocations: () => JSON.parse(localStorage.getItem(DB_KEYS.LOCATIONS) || '[]'),
    
    getShops: (locationId) => {
        const shops = JSON.parse(localStorage.getItem(DB_KEYS.SHOPS) || '[]');
        if (locationId) return shops.filter(s => s.locationId === locationId);
        return shops;
    },

    getShopDetails: (shopId) => {
        const shops = JSON.parse(localStorage.getItem(DB_KEYS.SHOPS) || '[]');
        return shops.find(s => s.id === shopId);
    },

    getMenu: (shopId) => {
        const menu = JSON.parse(localStorage.getItem(DB_KEYS.MENU) || '[]');
        if (shopId) return menu.filter(m => m.shopId === shopId);
        return menu;
    },

    updateStock: (itemId, newStock) => {
        const menu = JSON.parse(localStorage.getItem(DB_KEYS.MENU) || '[]');
        const itemIndex = menu.findIndex(m => m.id === itemId);
        if (itemIndex > -1) {
            menu[itemIndex].stock = parseInt(newStock);
            localStorage.setItem(DB_KEYS.MENU, JSON.stringify(menu));
            return true;
        }
        return false;
    },

    placeOrder: (orderData) => {
        const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
        orders.push(orderData);
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        
        // Deduct stock
        const menu = JSON.parse(localStorage.getItem(DB_KEYS.MENU) || '[]');
        
        orderData.items.forEach(orderItem => {
             const menuItem = menu.find(m => m.id === orderItem.id);
             if(menuItem) {
                 menuItem.stock = Math.max(0, menuItem.stock - orderItem.qty);
             }
        });
        localStorage.setItem(DB_KEYS.MENU, JSON.stringify(menu));
    },

    getOrders: (regNo) => {
        const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
        return orders.filter(o => o.user.regNo === regNo);
    },

    getShopOrders: (shopId) => {
        const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
        // Orders contain items from multiple shops, we need to filter/split orders relevant to this shop
        // For simplicity in this structure: Each "Order" record in DB is a Checkout Transaction. 
        // It might contain sub-orders for different shops.
        // Let's refine the structure: An Order saved in LS should be per-transaction, but containing Shop-specific Tokens.
        
        // Actually, to make "Admin View" easier, let's flatten the retrieval.
        // We will filter orders that contain items from this shop.
        
        return orders.filter(o => o.items.some(i => i.shopId === shopId));
    },
    
    updateOrderStatus: (orderId, shopId, newStatus) => {
        const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if(orderIndex > -1) {
            // Update status for the specific shop token in the order
            const statusObj = orders[orderIndex].shopStatus || {};
            statusObj[shopId] = newStatus;
            orders[orderIndex].shopStatus = statusObj;
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
            return true;
        }
        return false;
    }
};

// Initialize on load
DataManager.init();
