document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = db.validateUser(username, password);
        
        if (user) {
            // Store user info in session
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'marketplace/browse.html';
            }
        } else {
            alert('Invalid username or password!');
        }
    });
});

// Prevent accessing pages without authentication
function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return null;
    }
    return currentUser;
}

// Check if user is already logged in
window.addEventListener('load', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && window.location.pathname.endsWith('index.html')) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'marketplace/browse.html';
        }
    }
});

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}
