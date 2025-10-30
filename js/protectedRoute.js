(function () {
	// Minimal client-side protected route guard.
	// Looks for auth object in localStorage/sessionStorage (keys: authUser or user).
	// Expected shape: { token: "...", role: "super_admin", ... }
	// If not valid -> redirect to parent login page ../index.html
	// If valid -> reveal the page and wire logout button to clear auth.

	function getAuth() {
		try {
			const raw = localStorage.getItem('authUser') || localStorage.getItem('user') ||
			            sessionStorage.getItem('authUser') || sessionStorage.getItem('user');
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	function redirectToLogin() {
		// From super-admin folder, parent index is ../index.html
		window.location.replace('../index.html');
	}

	function revealPage() {
		// unhide body (body was initially display:none)
		if (document.body) {
			document.body.style.display = '';
		} else {
			document.addEventListener('DOMContentLoaded', function () {
				document.body.style.display = '';
			});
		}
	}

	function wireLogout() {
		// if a logout link/button exists, ensure it clears stored auth
		const logoutBtn = document.getElementById('superAdminLogoutBtn');
		if (!logoutBtn) return;
		logoutBtn.addEventListener('click', function (e) {
			// clear auth and allow default navigation to index.html
			localStorage.removeItem('authUser');
			localStorage.removeItem('user');
			sessionStorage.removeItem('authUser');
			sessionStorage.removeItem('user');
			// if href exists, let it navigate; otherwise go to parent index
			const href = logoutBtn.getAttribute('href');
			if (!href || href.trim() === '#') {
				e.preventDefault();
				window.location.replace('../index.html');
			}
		});
	}

	// Run guard
	const auth = getAuth();
	if (!auth || !auth.token || auth.role !== 'super_admin') {
		// small delay to ensure body stays hidden in case script runs after render
		setTimeout(redirectToLogin, 10);
		return;
	}

	// authorized
	revealPage();
	wireLogout();
})();
