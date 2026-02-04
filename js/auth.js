/**
 * Auth Logic for Students
 */

const loginForm = document.getElementById('loginForm');
const regInput = document.getElementById('regNo');
const emailInput = document.getElementById('email');
const errorMsg = document.getElementById('errorMsg');

// Check if already logged in
const user = localStorage.getItem(DB_KEYS.CURRENT_USER);
if (user) {
    window.location.href = 'locations.html';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const regNo = regInput.value.trim().toUpperCase();
    const email = emailInput.value.trim().toLowerCase();

    errorMsg.classList.add('hidden');

    // Validation
    if (regNo.length < 8) {
        showError('Registration Number must be at least 8 characters.');
        return;
    }

    if (!email.endsWith('@vitstudent.ac.in')) {
        showError('Email must end with @vitstudent.ac.in');
        return;
    }

    // Success - Save Session
    const userData = {
        regNo: regNo,
        email: email,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(userData));
    localStorage.removeItem(DB_KEYS.CART); // Clear previous session cart if any

    window.location.href = 'locations.html';
});

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}
