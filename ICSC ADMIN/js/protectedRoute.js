function protectRoute(allowedRoles = ['super_admin']) {
    if (!Auth.isAuthenticated()) {
        window.location.href = '../index.html';
        return;
    }

    const userRole = localStorage.getItem('userRole');
    if (!allowedRoles.includes(userRole)) {
        alert('Unauthorized access');
        Auth.logout();
        return;
    }
}

// Usage in dashboard page
document.addEventListener('DOMContentLoaded', () => {
    protectRoute(['super_admin']);
});