document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const success = await Auth.login({ username, password });
        
        if (success) {
            // Only redirect if user is super_admin
            if (Auth.isSuperAdmin()) {
                window.location.href = 'super-admin/super-admin-dashboard.html';
            } else {
                alert('Unauthorized access. This portal is only for Super Administrators.');
                Auth.logout();
            }
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        alert('Login failed: ' + (error.response?.data?.message || error.message));
    }
});