// Authentication helpers (uses global apiClient)
(function (global) {
	const STORAGE_KEY = 'authUser';

	function saveAuth(auth) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
			// keep legacy compatibility keys so older code/guards read the token
			try { localStorage.setItem('user', JSON.stringify(auth)); } catch (e) {}
			if (auth && auth.token) {
				try { localStorage.setItem('accessToken', auth.token); } catch (e) {}
			}
		} catch (e) {
			console.warn('Failed to save auth', e);
		}
	}

	function getAuth() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	function clearAuth() {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem('user');
		localStorage.removeItem('accessToken');
		sessionStorage.removeItem(STORAGE_KEY);
		sessionStorage.removeItem('user');
	}

	async function loginSuperAdmin(username, password) {
		if (!global.apiClient) throw new Error('apiClient not initialized');
		const res = await global.apiClient.post('/auth/admin-login', { username, password });
		const token = res?.data?.token || res?.data?.data?.token;
		if (!token) throw new Error(res?.data?.message || 'No token received');
		const auth = { token, role: 'super_admin', username };
		saveAuth(auth);
		return auth;
	}

	async function loginMinistry(ministryCode, username, password) {
		if (!global.apiClient) throw new Error('apiClient not initialized');
		const payload = { organization_short_code: ministryCode, username, password };
		const res = await global.apiClient.post('/auth/user-login', payload);
		const token = res?.data?.token || res?.data?.data?.token;
		if (!token) throw new Error(res?.data?.message || 'No token received');
		const auth = {
			token,
			role: 'ministry',
			username,
			ministryCode,
			ministryName: res.data.user.organization,
			contactPerson: res.data.user.contact_person
		};
		saveAuth(auth);
		return auth;
	}

	function isAuthenticated() {
		const auth = getAuth();
		return !!(auth && auth.token);
	}

	function redirectToDashboard() {
		const auth = getAuth();
		if (!auth) return;
		if (auth.role === 'super_admin') {
			window.location.href = 'ICSC ADMIN/super-admin/super-admin-dashboard.html';
		} else if (auth.role === 'ministry') {
			window.location.href = 'ICSC ADMIN/ministry/ministry-dashboard.html';
		}
	}

	// expose helpers
	global.Auth = {
		loginSuperAdmin,
		loginMinistry,
		saveAuth,
		getAuth,
		clearAuth,
		isAuthenticated,
		redirectToDashboard
	};
})(window);
