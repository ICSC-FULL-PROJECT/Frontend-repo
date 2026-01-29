// Minimal axios instance for reuse across pages; attaches Authorization header if token present.
(function (global) {
	// const API_BASE_URL = 'http://localhost:9100/api/v1';
	const API_BASE_URL = 'https://icsc-backend-api.afrikfarm.com/api/v1';
	// expose base URL for client-side debugging/consumption
	global.API_BASE_URL = API_BASE_URL;
	

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
    
	// Helper to POST JSON or FormData depending on payload
	async function postJSON(path, payload) {
		const res = await apiClient.post(path, payload);
		return res.data;
	}

	// Helper to GET JSON
	async function getJSON(path, params) {
		const res = await apiClient.get(path, { params });
		return res.data;
	}

	async function postForm(path, formData) {
		const res = await apiClient.post(path, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return res.data;
	}

	// Registration helpers
	// NOTE: assumptions: backend registration endpoints are named under /auth/ as shown below.
	// If your backend uses different paths (e.g. /register/attendee), update these functions accordingly.
	async function registerAttendee(data) {
		// data: plain object -> JSON
		return postJSON('/auth/attendee-register', data);
	}

	async function registerSpeaker(data) {
		// speakers may include files; detect File objects and use FormData when present
		const hasFile = Object.values(data).some(v => v instanceof File || v instanceof Blob);
		if (hasFile) {
			const fd = new FormData();
			Object.keys(data).forEach(k => {
				const v = data[k];
				if (v === undefined || v === null) return;
				if (Array.isArray(v)) {
					v.forEach(item => fd.append(k, item));
				} else {
					fd.append(k, v);
				}
			});
			return postForm('/auth/speaker-register', fd);
		}
		return postJSON('/auth/speaker-register', data);
	}

	async function registerExhibitor(data) {
		const hasFile = Object.values(data).some(v => v instanceof File || v instanceof Blob);
		if (hasFile) {
			const fd = new FormData();
			Object.keys(data).forEach(k => {
				const v = data[k];
				if (v === undefined || v === null) return;
				if (Array.isArray(v)) {
					v.forEach(item => fd.append(k, item));
				} else {
					fd.append(k, v);
				}
			});
			return postForm('/auth/register-exhibitor', fd);
		}
		return postJSON('/auth/register-exhibitor', data);
	}

	async function registerPartner(data) {
		const hasFile = Object.values(data).some(v => v instanceof File || v instanceof Blob);
		if (hasFile) {
			const fd = new FormData();
			Object.keys(data).forEach(k => {
				const v = data[k];
				if (v === undefined || v === null) return;
				if (Array.isArray(v)) {
					v.forEach(item => fd.append(k, item));
				} else {
					fd.append(k, v);
				}
			});
			return postForm('/auth/register-partner', fd);
		}
		return postJSON('/auth/register-partner', data);
	}

	// Fetch available packages (speaker/partner/exhibitor etc.)
	// Default backend path: '/packages' — change to match your API.
	// Fetch packages from a given path (default '/packages').
	// Example: RegisterAPI.getPackages('/packages/speaker-packages')
	async function getPackages(path = '/packages') {
		return getJSON(path);
	}

	global.RegisterAPI = {
		registerAttendee,
		registerSpeaker,
		registerExhibitor,
		registerPartner
		,getPackages
	};
})(window);
