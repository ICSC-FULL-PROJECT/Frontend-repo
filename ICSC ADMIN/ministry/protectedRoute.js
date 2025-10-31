(function () {
	// Minimal client-side protected route guard.
	// Looks for auth object in localStorage/sessionStorage (keys: authUser or user).
	// Expected shape: { token: "...", role: "ministry", ... }
	// If not valid -> redirect to parent login page ../index.html
	// If valid -> reveal the page and wire logout button to clear auth.

	function getAuth() {
		// Prefer centralized helper if available (safer parsing & single source)
		if (window.Auth && typeof window.Auth.getAuth === 'function') {
			try { return window.Auth.getAuth(); } catch (e) { /* fall through */ }
		}

		try {
			const raw = localStorage.getItem('authUser') || localStorage.getItem('user') ||
			            sessionStorage.getItem('authUser') || sessionStorage.getItem('user');
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	function redirectToLogin() {
		// Keep previous behavior (relative to /ICSC ADMIN/ministry/)
		window.location.replace('../index.html');
	}

	function revealPage() {
		// unhide body (body may be hidden until auth check runs)
		if (document.body) {
			document.body.style.display = '';
		} else {
			document.addEventListener('DOMContentLoaded', function () {
				document.body.style.display = '';
			});
		}
	}

	function wireLogout() {
		// Look for common logout button ids and wire them all
		const logoutIds = ['ministryLogoutBtn', 'superAdminLogoutBtn', 'logoutBtn'];
		logoutIds.forEach(id => {
			const btn = document.getElementById(id);
			if (!btn) return;
			btn.addEventListener('click', function (e) {
				// clear all known auth storage locations
				localStorage.removeItem('authUser');
				localStorage.removeItem('user');
				localStorage.removeItem('accessToken');
				sessionStorage.removeItem('authUser');
				sessionStorage.removeItem('user');
				// if href exists, let it navigate; otherwise go to parent index
				const href = btn.getAttribute('href');
				if (!href || href.trim() === '#') {
					e.preventDefault();
					window.location.replace('../index.html');
				}
			});
		});
	}

	// Run guard: require a valid token. Be tolerant about missing/variant role strings
	const auth = getAuth();
	if (!auth || !auth.token) {
		// small delay to ensure body stays hidden in case script runs after render
		setTimeout(redirectToLogin, 10);
		return;
	}

	// authorized (token present)
	revealPage();
	wireLogout();
 })();
