(function () {
	// DOM references (assumes same IDs as existing markup)
	const superAdminTab = document.getElementById('superAdminTab');
	const ministryTab = document.getElementById('ministryTab');
	const ministryCodeGroup = document.getElementById('ministryCodeGroup');
	const usernameInput = document.getElementById('username');
	const passwordInput = document.getElementById('password');
	const ministryCodeInput = document.getElementById('ministryCode');
	const loginBtn = document.getElementById('loginBtn');
	const loginBtnText = document.getElementById('loginBtnText');
	const loginSpinner = document.getElementById('loginSpinner');
	const errorMessage = document.getElementById('errorMessage');
	const loginForm = document.getElementById('loginForm');

	// Ensure UI elements exist before attaching events
	if (!loginForm) return;

	// helper UI functions
	function showError(msg) {
		if (!errorMessage) return;
		errorMessage.textContent = msg;
		errorMessage.style.display = 'block';
		setTimeout(() => (errorMessage.style.display = 'none'), 6000);
	}

	function setLoading(isLoading) {
		if (loginSpinner) loginSpinner.style.display = isLoading ? 'block' : 'none';
		if (loginBtn) loginBtn.disabled = !!isLoading;
	}

	function setActiveTab(tab) {
		if (tab === 'super') {
			superAdminTab.classList.add('active');
			ministryTab.classList.remove('active');
			if (ministryCodeGroup) ministryCodeGroup.style.display = 'none';
			if (loginBtnText) loginBtnText.textContent = 'Login as Super Admin';
		} else {
			superAdminTab.classList.remove('active');
			ministryTab.classList.add('active');
			if (ministryCodeGroup) ministryCodeGroup.style.display = 'block';
			if (loginBtnText) loginBtnText.textContent = 'Login as Ministry';
		}
	}

	// Events
	superAdminTab && superAdminTab.addEventListener('click', () => setActiveTab('super'));
	ministryTab && ministryTab.addEventListener('click', () => setActiveTab('ministry'));

	// Toggle password visibility (progressive enhancement — keep existing element)
	const togglePassword = document.getElementById('togglePassword');
	if (togglePassword && passwordInput) {
		togglePassword.addEventListener('click', function () {
			const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
			passwordInput.setAttribute('type', type);
			const icon = this.querySelector('i');
			if (icon) {
				icon.classList.toggle('fa-eye');
				icon.classList.toggle('fa-eye-slash');
			}
		});
	}

	// Form submit
	async function handleSubmit(e) {
		if (e) e.preventDefault();
		const username = usernameInput.value.trim();
		const password = passwordInput.value.trim();
		const isMinistry = ministryTab.classList.contains('active');
		const ministryCode = ministryCodeInput?.value.trim();

		// Basic validation
		if (!username) return showError('Please enter username');
		if (!password) return showError('Please enter password');
		if (isMinistry && !ministryCode) return showError('Please enter ministry code');

		setLoading(true);
		try {
			let auth;
			if (isMinistry) {
				auth = await window.Auth.loginMinistry(ministryCode, username, password);
			} else {
				auth = await window.Auth.loginSuperAdmin(username, password);
			}
			// successful login -> redirect to appropriate dashboard
			if (auth && auth.role) {
				// small delay to show success
				setTimeout(() => {
					// if protectedRoute or other code expects 'userType' key, set it too for compatibility
					if (auth.role === 'super_admin') localStorage.setItem('userType', 'superAdmin');
					if (auth.role === 'ministry') localStorage.setItem('userType', 'ministry');
					// redirect
					window.location.href = auth.role === 'super_admin'
						? 'super-admin/super-admin-dashboard.html'
						: 'ministry/ministry-dashboard.html';
				}, 300);
			} else {
				showError('Login succeeded but role is unknown');
			}
		} catch (err) {
			showError(err.message || 'Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	// Wire form submit & Enter key
	loginForm.addEventListener('submit', handleSubmit);
	loginBtn.addEventListener('click', handleSubmit);
	loginForm.addEventListener('keypress', function (e) {
		if (e.key === 'Enter') handleSubmit(e);
	});

	// Auto-redirect if already authenticated
	document.addEventListener('DOMContentLoaded', function () {
		const existing = window.Auth.getAuth ? window.Auth.getAuth() : null;
		if (existing && existing.token) {
			// Redirect to dashboard immediately
			if (existing.role === 'super_admin') {
				window.location.href = 'super-admin/super-admin-dashboard.html';
			} else if (existing.role === 'ministry') {
				window.location.href = 'ministry/ministry-dashboard.html';
			}
		}
	});

	// Initialize UI with super admin selected by default
	setActiveTab('super');
})();
