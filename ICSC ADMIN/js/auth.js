const API_BASE_URL = 'https://icsc-backend-api-code.onrender.com/api/v1';

class Auth {
    static isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }

    static isSuperAdmin() {
        return localStorage.getItem('userRole') === 'super_admin';
    }

    static getToken() {
        return localStorage.getItem('accessToken');
    }

    static async login(credentials) {
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/login`, credentials);
            
            if (response.data.success) {
                const { token, role } = response.data;
                localStorage.setItem('accessToken', token);
                localStorage.setItem('userRole', role);
                
                if (role !== 'super_admin') {
                    throw new Error('Unauthorized access');
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        window.location.href = '../index.html';
    }

    static async verifyToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await axios.get(`${API_BASE_URL}/admin/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.success;
        } catch (error) {
            this.logout();
            return false;
        }
    }
}

// Add axios interceptor for all requests
axios.interceptors.request.use(
    config => {
        const token = Auth.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);