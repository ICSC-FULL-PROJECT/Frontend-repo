// Minimal axios instance for reuse across pages; attaches Authorization header if token present.
(function (global) {
	const API_BASE_URL = 'https://icsc-backend-api-code.onrender.com/api/v1';

	// require axios global (already included in pages)
	if (typeof axios === 'undefined') {
		console.warn('axios not found. Please include axios before apiClient.js');
		global.apiClient = null;
		return;
	}

	const apiClient = axios.create({
		baseURL: API_BASE_URL,
		headers: { 'Content-Type': 'application/json' },
		timeout: 15000
	});

	// attach token from either localStorage.authUser or localStorage.accessToken
	apiClient.interceptors.request.use((config) => {
		try {
			let token = null;
			const rawAuthUser = localStorage.getItem('authUser');
			if (rawAuthUser) {
				const a = JSON.parse(rawAuthUser);
				token = a?.token || token;
			}
			// fallback to legacy key
			const legacyToken = localStorage.getItem('accessToken');
			if (!token && legacyToken) token = legacyToken;
			if (token) config.headers['Authorization'] = 'Bearer ' + token;
		} catch (e) {
			// ignore
		}
		return config;
	}, (err) => Promise.reject(err));

	// normalize errors
	apiClient.interceptors.response.use(
		(res) => res,
		(err) => {
			const msg = err?.response?.data?.message || err.message || 'Network error';
			return Promise.reject({ original: err, message: msg, status: err?.response?.status });
		}
	);

	global.apiClient = apiClient;
})(window);
