// DOM Elements
const viewAttendeeModal = document.getElementById('viewAttendeeModal');
const addAttendeeForm = document.getElementById('addAttendeeForm');
const editAttendeeForm = document.getElementById('editAttendeeForm');
const addMinistryForm = document.getElementById('addMinistryForm');
const editMinistryForm = document.getElementById('editMinistryForm');
const successModal = document.getElementById('successModal');
const editAttendeeModal = document.getElementById('editAttendeeModal');
const deleteModal = document.getElementById('deleteModal');
const addMinistryModal = document.getElementById('addMinistryModal');
const viewMinistryModal = document.getElementById('viewMinistryModal');
const editMinistryModal = document.getElementById('editMinistryModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const addAnotherBtn = document.getElementById('addAnotherBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const cancelDeleteMinistryBtn = document.getElementById('cancelDeleteMinistryBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const confirmDeleteMinistryBtn = document.getElementById('confirmDeleteMinistryBtn');
const cancelAddMinistryBtn = document.getElementById('cancelAddMinistryBtn');
const closeViewMinistryBtn = document.getElementById('closeViewMinistryBtn');
const cancelEditMinistryBtn = document.getElementById('cancelEditMinistryBtn');
const generateNewPasswordBtn = document.getElementById('generateNewPasswordBtn');
const allAttendeesTable = document.getElementById('allAttendeesTable');
const pendingAttendeesTable = document.getElementById('pendingAttendeesTable');
const ministriesTable = document.getElementById('ministriesTable');
const searchAttendees = document.getElementById('searchAttendees');
const filterMinistry = document.getElementById('filterMinistry');
const filterStatus = document.getElementById('filterStatus');
const filterDepartment = document.getElementById('filterDepartment');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const addMinistryBtn = document.getElementById('addMinistryBtn');

// API Configuration
const API_BASE_URL = 'https://icsc-backend-api-code.onrender.com/api/v1';
const CREATE_MINISTRY_URL = `${API_BASE_URL}/admin/create-user`;

// Tab Navigation
const tabs = document.querySelectorAll('.tab-content');
const tabLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
const pageTitle = document.getElementById('pageTitle');

let ministries = [];

// Current attendee/ministry being edited or deleted
let currentAttendeeId = null;
let currentMinistryId = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    // Load attendees and ministries from backend
    fetchAttendees(); // populate attendees list from backend, then update UI
    renderMinistriesTable();
    fetchMinistries(); // Load ministries from database on page load
});

// Tab Navigation
function initializeTabs() {
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Update page title
            pageTitle.textContent = getTabTitle(tabId);
        });
    });

    // Add event listeners for buttons that navigate between tabs
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.hasAttribute('data-tab')) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                
                // Update active tab
                tabLinks.forEach(l => l.classList.remove('active'));
                document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
                
                // Show selected tab content
                tabs.forEach(tab => tab.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Update page title
                pageTitle.textContent = getTabTitle(tabId);
            }
        });
    });
}

function getTabTitle(tabId) {
    const titles = {
        'dashboard': 'Super Admin Dashboard',
        'verification': 'Attendee Verification',
        'add-attendee': 'Add New Attendee',
        'attendees': 'All Attendees',
        'ministries': 'Participating Ministries',
        'reports': 'Reports & Analytics',
        'settings': 'System Settings'
    };
    return titles[tabId] || 'Super Admin Dashboard';
}

// Event Listeners
function initializeEventListeners() {
    // Form submissions
    addAttendeeForm.addEventListener('submit', handleAddAttendee);
    editAttendeeForm.addEventListener('submit', handleEditAttendee);
    addMinistryForm.addEventListener('submit', handleAddMinistry);
    editMinistryForm.addEventListener('submit', handleEditMinistry);
    
    // Modal controls
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            successModal.classList.remove('active');
            editAttendeeModal.classList.remove('active');
            deleteModal.classList.remove('active');
            deleteMinistryModal.classList.remove('active');
            addMinistryModal.classList.remove('active');
            viewMinistryModal.classList.remove('active');
            editMinistryModal.classList.remove('active');
            viewAttendeeModal.classList.remove('active');
        });
    });
    
    addAnotherBtn.addEventListener('click', function() {
        successModal.classList.remove('active');
    });
    
    cancelEditBtn.addEventListener('click', function() {
        editAttendeeModal.classList.remove('active');
    });
    
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.remove('active');
    });
    cancelDeleteMinistryBtn.addEventListener('click', function() {
        deleteMinistryModal.classList.remove('active');
    });
    document.querySelector('.close-view-modal').addEventListener('click', function() {
        viewAttendeeModal.classList.remove('active');
    });
    
    confirmDeleteBtn.addEventListener('click', handleDeleteAttendee);

    confirmDeleteMinistryBtn.addEventListener('click', handleDeleteMinistry);
    
    cancelAddMinistryBtn.addEventListener('click', function() {
        addMinistryModal.classList.remove('active');
    });
    
    closeViewMinistryBtn.addEventListener('click', function() {
        viewMinistryModal.classList.remove('active');
    });
    
    cancelEditMinistryBtn.addEventListener('click', function() {
        editMinistryModal.classList.remove('active');
    });
    
    generateNewPasswordBtn.addEventListener('click', generateNewPassword);
    
    // Search and filter
    searchAttendees.addEventListener('input', filterAttendees);
    filterMinistry.addEventListener('change', filterAttendees);
    filterStatus.addEventListener('change', filterAttendees);
    filterDepartment.addEventListener('change', filterAttendees);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Add Ministry button
    addMinistryBtn.addEventListener('click', function() {
        document.getElementById('ministryName').value = '';
        document.getElementById('ministryCode').value = '';
        document.getElementById('contactPerson').value = 'Permanent Secretary';
        document.getElementById('contactPersonEmail').value = '';
        
        // Generate credentials
        generateMinistryCredentials();
        addMinistryModal.classList.add('active');
    });
    
    // Edit and delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            openEditModal(attendeeId);
        }
        if (e.target.classList.contains('view-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            openViewModal(attendeeId);
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            const attendeeName = row.cells[0].textContent;
            openDeleteModal(attendeeId, attendeeName);
        }

        if (e.target.classList.contains('delete-ministry-btn')) {
            const row = e.target.closest('tr');
            const ministryId = parseInt(row.getAttribute('data-id'));
            const ministryName = row.cells[0].textContent;
            openDeleteMinistryModal(ministryId, ministryName);
        }

        if (e.target.classList.contains('approve-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            approveAttendee(attendeeId);
        }
        
        if (e.target.classList.contains('reject-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            rejectAttendee(attendeeId);
        }
        
        if (e.target.classList.contains('view-ministry-btn')) {
            const row = e.target.closest('tr');
            const ministryId = parseInt(row.getAttribute('data-id'));
            openViewMinistryModal(ministryId);
        }
        
        if (e.target.classList.contains('edit-ministry-btn')) {
            const row = e.target.closest('tr');
            const ministryId = parseInt(row.getAttribute('data-id'));
            openEditMinistryModal(ministryId);
        }
    });
    
    // Refresh buttons
    document.getElementById('refreshActivityBtn').addEventListener('click', function() {
        alert('Refreshing recent activity...');
    });
    
    document.getElementById('refreshPendingBtn').addEventListener('click', function() {
        alert('Refreshing pending attendees...');
    });
    
    // Export button
    document.getElementById('exportAttendeesBtn').addEventListener('click', function() {
        alert('Exporting attendees data...');
    });
}

// Form Handlers
async function handleAddAttendee(e) {
    e.preventDefault();
    
    // Collect values
    const values = {
        name: document.getElementById('attendeeName').value.trim(),
        email: document.getElementById('attendeeEmail').value.trim(),
        phone: document.getElementById('attendeePhone').value.trim(),
        nin: document.getElementById('attendeeNIN').value.trim(),
        position: document.getElementById('attendeePosition').value.trim(),
        gradeLevel: document.getElementById('attendeeGradeLevel').value,
        ministry: document.getElementById('attendeeMinistry').value,
        department: document.getElementById('attendeeDepartment').value.trim(),
        agency: document.getElementById('attendeeAgency').value.trim(),
        staffId: document.getElementById('attendeeStaffId').value.trim(),
        office: document.getElementById('attendeeOffice').value.trim(),
        status: document.getElementById('attendeeStatus').value,
        remarks: document.getElementById('attendeeRemarks').value.trim()
    };

    // Basic client-side validation
    const required = ['name','email','phone','nin','position','gradeLevel','ministry','department','agency'];
    for (const k of required) {
        if (!values[k]) {
            alert('Please fill all required fields.');
            return;
        }
    }

    // Build backend payload (adjust keys if your API expects different names)
    const payload = {
        fullname: values.name,
        email: values.email,
        phone_number: values.phone,
        nin: values.nin,
        position: values.position,
        grade: values.gradeLevel,
        organization: values.ministry,
        department: values.department,
        department_agency: values.agency,
        staff_id: values.staffId,
        office_location: values.office,
        status: values.status,
        remark: values.remarks
    };

    // Disable submit button
    const submitBtn = addAttendeeForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
    }

    // helper to get token if apiClient not available
    function getToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (err) { /* ignore */ }
        return localStorage.getItem('accessToken') || null;
    }

    try {
        let res;
        if (window.apiClient) {
            res = await window.apiClient.post('/admin/create-attendee', payload);
        } else {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            res = await axios.post(`${API_BASE_URL}/admin/create-attendee`, payload, { headers });
        }

        if (res && (res.status === 200 || res.status === 201)) {
            const created = res.data?.data || res.data || payload;

            // Normalize to local model
            const newId = created.id || (attendees.length > 0 ? Math.max(...attendees.map(a=>a.id))+1 : 1);
            const newAttendee = {
                id: newId,
                name: created.full_name || created.name || payload.full_name,
                email: created.email || payload.email,
                phone: created.phone || payload.phone,
                nin: created.nin || payload.nin,
                position: created.position || payload.position,
                gradeLevel: created.grade_level || payload.grade_level,
                ministry: created.ministry || payload.ministry,
                department: created.department || payload.department,
                agency: created.agency || payload.agency,
                staffId: created.staff_id || payload.staff_id || '',
                office: created.office_location || payload.office_location || '',
                status: created.status || payload.status || 'Pending',
                remarks: created.remarks || payload.remarks || '',
                dateAdded: created.dateAdded || (new Date().toISOString().split('T')[0]),
                addedBy: 'Super Admin'
            };

            // Update local state and UI
            attendees.push(newAttendee);
            renderAttendeesTable(attendees);
            updatePendingTable();
            updateStats();

            // Show success modal and reset form
            document.getElementById('successMessage').textContent = 'Attendee has been successfully added!';
            successModal.classList.add('active');
            addAttendeeForm.reset();
        } else {
            const msg = res?.data?.message || 'Failed to add attendee';
            throw new Error(msg);
        }
    } catch (err) {
        const msg = err?.response?.data?.message || err.message || 'Add attendee failed';
        alert(msg);
        console.error('Add attendee error:', err);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText || 'Add Attendee';
        }
    }
}

function handleEditAttendee(e) {
    e.preventDefault();
    
    // Update attendee data
    const attendeeIndex = attendees.findIndex(a => a.id === currentAttendeeId);
    if (attendeeIndex !== -1) {
        attendees[attendeeIndex] = {
            ...attendees[attendeeIndex],
            name: document.getElementById('editAttendeeName').value,
            email: document.getElementById('editAttendeeEmail').value,
            phone: document.getElementById('editAttendeePhone').value,
            nin: document.getElementById('editAttendeeNIN').value,
            position: document.getElementById('editAttendeePosition').value,
            gradeLevel: document.getElementById('editAttendeeGradeLevel').value,
            ministry: document.getElementById('editAttendeeMinistry').value,
            department: document.getElementById('editAttendeeDepartment').value,
            agency: document.getElementById('editAttendeeAgency').value,
            staffId: document.getElementById('editAttendeeStaffId').value,
            office: document.getElementById('editAttendeeOffice').value,
            status: document.getElementById('editAttendeeStatus').value,
            remarks: document.getElementById('editAttendeeRemarks').value
        };
        
        // Update UI
        updateAttendeesTable();
        updatePendingTable();
        updateStats();
        
        // Show success message
        document.getElementById('successMessage').textContent = 'Attendee has been successfully updated!';
        successModal.classList.add('active');
        
        // Close modal
        editAttendeeModal.classList.remove('active');
    }
}

async function handleDeleteAttendee() {
    if (!currentAttendeeId) {
        alert('No attendee selected.');
        return;
    }

    const confirmBtn = confirmDeleteBtn;
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';
    }

    // optional loading helper if present
    if (typeof showLoading === 'function') showLoading('Deleting attendee...');

    // helper to retrieve token
    function getToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (e) { /* ignore */ }
        return localStorage.getItem('accessToken') || null;
    }

    try {
        let res;
        const endpoint = `/admin/delete-attendee?attendee_id=${currentAttendeeId}`;

        if (window.apiClient) {
            res = await window.apiClient.delete(endpoint);
        } else {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            res = await axios.delete(`${API_BASE_URL}/admin/delete-attendee?attendee_id=${currentAttendeeId}`, { headers });
        }

        // consider 200/204/202 as success
        if (res && (res.status === 200 || res.status === 204 || res.status === 202)) {
            // remove from local state
            attendees = attendees.filter(a => String(a.id) !== String(currentAttendeeId));

            // update UI
            renderAttendeesTable(attendees);
            updatePendingTable();
            updateStats();

            // success feedback
            document.getElementById('successMessage').textContent = 'Attendee has been successfully deleted!';
            successModal.classList.add('active');
            deleteModal.classList.remove('active');
            currentAttendeeId = null;
        } else {
            const msg = res?.data?.message || 'Failed to delete attendee';
            throw new Error(msg);
        }
    } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Delete failed';
        alert(message);
        console.error('Delete attendee error:', err);
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete';
        }
        if (typeof hideLoading === 'function') hideLoading();
    }
}

async function handleDeleteMinistry() {
    if (!currentMinistryId) {
        alert('No ministry selected.');
        return;
    }

    const confirmBtn = confirmDeleteMinistryBtn;
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';
    }

    // optional loading helper if present
    if (typeof showLoading === 'function') showLoading('Deleting attendee...');

    // helper to retrieve token
    function getToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (e) { /* ignore */ }
        return localStorage.getItem('accessToken') || null;
    }

    try {
        let res;
        const endpoint = `/admin/delete-user?user_id=${currentMinistryId}`;

        if (window.apiClient) {
            res = await window.apiClient.delete(endpoint);
        } else {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            res = await axios.delete(`${API_BASE_URL}/admin/delete-user?user_id=${currentMinistryId}`, { headers });
        }

        // consider 200/204/202 as success
        if (res && (res.status === 200 || res.status === 204 || res.status === 202)) {
            // remove from local state
            ministries = ministries.filter(m => String(m.id) !== String(currentMinistryId));

            // update UI
            renderMinistriesTable(ministries);
            updateStats();

            // success feedback
            document.getElementById('successMessage').textContent = 'Ministry has been successfully deleted!';
            successModal.classList.add('active');
            deleteMinistryModal.classList.remove('active');
            currentMinistryId = null;
        } else {
            const msg = res?.data?.message || 'Failed to delete ministry';
            throw new Error(msg);
        }
    } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Delete failed';
        alert(message);
        console.error('Delete attendee error:', err);
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete';
        }
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// ✅ Database Integration for Ministry Creation (Corrected to match backend)
// async function handleAddMinistry(e) {
// e.preventDefault();

// // Collect form data from input fields
// const organization = document.getElementById('ministryName').value;
// const organization_short_code = document.getElementById('ministryCode').value;
// const contact_person = document.getElementById('contactPerson').value;
// const contact_person_email = document.getElementById('contactPersonEmail').value;
// const username = document.getElementById('generatedUsername').textContent;
// const password = document.getElementById('generatedPassword').textContent;

// // ✅ Prepare correct payload for backend
// const ministryData = {
// organization,
// organization_short_code,
// username,
// contact_person,
// contact_person_email,
// password
// };

// console.log("Sending to API:", ministryData);

// try {
// // Show loading state
// const submitBtn = addMinistryForm.querySelector('button[type="submit"]');
// const originalText = submitBtn.textContent;
// submitBtn.textContent = 'Creating...';
// submitBtn.disabled = true;

// // ✅ Get stored Super Admin token
// const token = localStorage.getItem('accessToken');
// if (!token) {
// alert('Session expired. Please log in again.');
// window.location.href = '../index.html';
// return;
// }

// // ✅ Make authenticated API call
// const response = await axios.post(
// `${API_BASE_URL}/admin/create-user`,
// ministryData,
// {
// headers: {
// 'Content-Type': 'application/json',
// 'Authorization': `Bearer ${token}`
// }
// }
// );

// // Restore button state
// submitBtn.textContent = originalText;
// submitBtn.disabled = false;

// console.log("API Response:", response.data);

// if (response.data && (response.data.success || response.status === 200)) {
// document.getElementById('successMessage').textContent =
// 'Ministry has been successfully created!';
// successModal.classList.add('active');

// // Optional: reset form + close modal
// addMinistryForm.reset();
// addMinistryModal.classList.remove('active');
// } else {
// throw new Error(response.data.message || 'Failed to create ministry');
// }

// } catch (error) {
// console.error('Error creating user:', error.response?.data || error.message);

// // Reset button
// const submitBtn = addMinistryForm.querySelector('button[type="submit"]');
// submitBtn.textContent = 'Add Ministry';
// submitBtn.disabled = false;

// // Show error message
// alert(`Error creating user: ${error.response?.data?.message || error.message}`);
// }
// }


// ✅ Replace handleAddMinistry to call backend and update UI
async function handleAddMinistry(e) {
    e.preventDefault();

    // collect inputs
    const organization = document.getElementById('ministryName').value.trim();
    const organization_short_code = document.getElementById('ministryCode').value.trim();
    const contact_person = document.getElementById('contactPerson').value.trim();
    const contact_person_email = document.getElementById('contactPersonEmail').value.trim();
    const username = document.getElementById('generatedUsername').textContent.trim();
    const password = document.getElementById('generatedPassword').textContent.trim();

    // basic validation
    if (!organization || !organization_short_code || !contact_person || !contact_person_email || !username || !password) {
        alert('Please fill all required ministry fields.');
        return;
    }

    const payload = {
        organization,
        organization_short_code,
        username,
        password,
        contact_person,
        contact_person_email
    };

    // UI: disable submit and show loading
    const submitBtn = addMinistryForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
    }
    if (typeof showLoading === 'function') showLoading('Creating ministry...');

    // token helper for fallback
    function getToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (err) { /* ignore */ }
        return localStorage.getItem('accessToken') || null;
    }

    try {
        let res;
        // prefer centralized apiClient
        if (window.apiClient) {
            res = await window.apiClient.post('/admin/create-user', payload);
        } else {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            res = await axios.post(`${API_BASE_URL}/admin/create-user`, payload, { headers });
        }

        if (res && (res.status === 200 || res.status === 201)) {
            const created = res.data?.data || res.data || payload;

            // normalize and append to local ministries list (best-effort)
            const newMinistry = {
                id: created.id || created._id || (ministries.length ? Math.max(...ministries.map(m => m.id || 0)) + 1 : 1),
                name: created.organization || created.organization_name || organization,
                code: created.organization_short_code || organization_short_code,
                attendeesCount: created.attendeesCount || 0,
                pendingCount: created.pendingCount || 0,
                approvedCount: created.approvedCount || 0,
                contactPerson: created.contact_person || contact_person,
                contactPersonEmail: created.contact_person_email || contact_person_email,
                username: created.username || username,
                password: created.password || password
            };

            ministries.push(newMinistry);
            renderMinistriesTable();
            updateStats();

            // success feedback
            document.getElementById('successMessage').textContent = 'Ministry has been successfully created!';
            successModal.classList.add('active');

            // reset & close
            addMinistryForm.reset();
            addMinistryModal.classList.remove('active');
        } else {
            const msg = res?.data?.message || 'Failed to create ministry';
            throw new Error(msg);
        }
    } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Create ministry failed';
        alert(message);
        console.error('Create ministry error:', err);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText || 'Add Ministry';
        }
    }
}

// Fetch ministries from database (calls backend endpoint and updates UI)
async function fetchMinistries() {
	try {
		if (typeof showLoading === 'function') showLoading('Loading ministries...');

		let res;
		// Try admin-specific endpoint first, then fallback to general /ministries
		const endpoints = ['/admin/users'];

		// prefer apiClient if present
		if (window.apiClient) {
			for (const ep of endpoints) {
				try {
					res = await window.apiClient.get(ep);
					if (res && (res.status === 200 || res.status === 201)) break;
				} catch (e) {
					// try next endpoint
					res = null;
				}
			}
		} else {
			// fallback using axios + token
			let token = null;
			try {
				const raw = localStorage.getItem('authUser');
				if (raw) {
					const a = JSON.parse(raw);
					token = a?.token || token;
				}
			} catch (e) { /* ignore */ }
			if (!token) token = localStorage.getItem('accessToken') || null;
			const headers = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = 'Bearer ' + token;

			for (const ep of endpoints) {
				try {
					res = await axios.get(`${API_BASE_URL}${ep}`, { headers });
					if (res && (res.status === 200 || res.status === 201)) break;
				} catch (e) {
					res = null;
				}
			}
		}

		const list = res?.data?.data || res?.data || [];
		if (Array.isArray(list)) {
			// normalize to local ministry model
			ministries = list.map((m, idx) => ({
				id: m.id || m._id || m.organization_short_code || idx + 1,
				name: m.organization || m.organization_name || m.name || m.organization || '',
				code: m.organization_short_code || m.code || m.short_code || '',
				attendeesCount: m.attendeesCount || m.attendees_count || m.count || 0,
				pendingCount: m.pendingCount || m.pending_count || 0,
				approvedCount: m.approvedCount || m.approved_count || 0,
				contactPerson: m.contact_person || m.contactPerson || m.contact || '',
				contactPersonEmail: m.contact_person_email || m.contactPersonEmail || m.contact_email || '',
				username: m.username || '',
				password: m.password || ''
			}));

			renderMinistriesTable();
			updateStats();
			console.log(`Fetched ${ministries.length} ministries from backend`);
		} else {
			console.warn('Unexpected ministries response format', res);
		}
	} catch (err) {
		console.error('Error fetching ministries:', err?.response?.data || err.message || err);
		// keep existing local ministries if available
		renderMinistriesTable();
		updateStats();
	} finally {
		if (typeof hideLoading === 'function') hideLoading();
	}
}

// Fetch attendees from backend and populate UI
async function fetchAttendees() {
    try {
        let res;
        // prefer apiClient if present (it attaches Authorization automatically)
        if (window.apiClient) {
            res = await window.apiClient.get('/admin/attendees');
        } else {
            // fallback: get token and use axios
            let token = null;
            try {
                const raw = localStorage.getItem('authUser');
                if (raw) {
                    const a = JSON.parse(raw);
                    token = a?.token || token;
                }
            } catch (e) { /* ignore */ }
            if (!token) token = localStorage.getItem('accessToken') || null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            res = await axios.get(`${API_BASE_URL}/admin/attendees`, { headers });
        }

        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
            // normalize incoming items to local model
            attendees = list.map(item => ({
                id: item.id || item._id || (item.attendeeId || null),
                name: item.full_name || item.name || item.fullName || item.fullname || '',
                email: item.email || '',
                phone: item.phone || item.phone_number || '',
                nin: item.nin || item.national_id || '',
                position: item.position || '',
                gradeLevel: item.grade || item.gradeLevel || '',
                ministry: item.ministry || item.organization_name || item.organization || '',
                department: item.department || '',
                agency: item.agency || item.department_agency || '',
                staffId: item.staff_id || item.staffId || '',
                office: item.office_location || item.office || '',
                status: (item.status || 'Pending'),
                remarks: item.remark || '',
                dateAdded: item.created_at || item.dateAdded || item.date || (new Date().toISOString().split('T')[0])
            }));

            // Update UI
            renderAttendeesTable(attendees);
            updatePendingTable();
            updateStats();
            console.log(`Fetched ${attendees.length} attendees from backend`);
            return;
        }

        console.warn('Unexpected attendees response format', res);
    } catch (err) {
        console.error('Error fetching attendees:', err?.response?.data || err.message || err);
        // keep existing sample data and ensure UI is rendered
        renderAttendeesTable(attendees);
        updatePendingTable();
        updateStats();
    }
}

function handleEditMinistry(e) {
    e.preventDefault();
    
    // Update ministry data
    const ministryIndex = ministries.findIndex(m => m.id === currentMinistryId);
    if (ministryIndex !== -1) {
        ministries[ministryIndex] = {
            ...ministries[ministryIndex],
            name: document.getElementById('editMinistryName').value,
            code: document.getElementById('editMinistryCode').value,
            contactPerson: document.getElementById('editContactPerson').value,
            contactPersonEmail: document.getElementById('editContactPersonEmail').value,
            username: document.getElementById('editUsername').value,
            password: document.getElementById('editPassword').value
        };
        
        // Update UI
        renderMinistriesTable();
        
        // Show success message
        document.getElementById('successMessage').textContent = 'Ministry has been successfully updated!';
        successModal.classList.add('active');
        
        // Close modal
        editMinistryModal.classList.remove('active');
    }
}

// Modal Functions
function openEditModal(attendeeId) {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee) {
        currentAttendeeId = attendeeId;
        
        // Populate form with attendee data
        document.getElementById('editAttendeeName').value = attendee.name;
        document.getElementById('editAttendeeEmail').value = attendee.email;
        document.getElementById('editAttendeePhone').value = attendee.phone;
        document.getElementById('editAttendeeNIN').value = attendee.nin;
        document.getElementById('editAttendeePosition').value = attendee.position;
        document.getElementById('editAttendeeGradeLevel').value = attendee.gradeLevel;
        document.getElementById('editAttendeeMinistry').value = attendee.ministry;
        document.getElementById('editAttendeeDepartment').value = attendee.department;
        document.getElementById('editAttendeeAgency').value = attendee.agency;
        document.getElementById('editAttendeeStaffId').value = attendee.staffId;
        document.getElementById('editAttendeeOffice').value = attendee.office;
        document.getElementById('editAttendeeStatus').value = attendee.status;
        document.getElementById('editAttendeeRemarks').value = attendee.remarks;
        
        // Show modal
        editAttendeeModal.classList.add('active');
    }
}

function openDeleteModal(attendeeId, attendeeName) {
    currentAttendeeId = attendeeId;
    document.getElementById('deleteAttendeeName').textContent = attendeeName;
    deleteModal.classList.add('active');
}

function openDeleteMinistryModal(ministryId, ministryName) {
    currentMinistryId = ministryId;
    document.getElementById('deleteMinistryName').textContent = ministryName;
    deleteMinistryModal.classList.add('active');
}

function openViewModal(attendeeId) {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee) {
        // Populate view modal with attendee data
        document.getElementById('viewName').textContent = attendee.name;
        document.getElementById('viewEmail').textContent = attendee.email;
        document.getElementById('viewPhone').textContent = attendee.phone;
        document.getElementById('viewNIN').textContent = attendee.nin;
        document.getElementById('viewPosition').textContent = attendee.position;
        document.getElementById('viewGradeLevel').textContent = attendee.gradeLevel;
        document.getElementById('viewMinistry').textContent = attendee.ministry;
        document.getElementById('viewDepartment').textContent = attendee.department;
        document.getElementById('viewAgency').textContent = attendee.agency;
        document.getElementById('viewStaffId').textContent = attendee.staffId || 'N/A';
        document.getElementById('viewOffice').textContent = attendee.office || 'N/A';
        document.getElementById('viewStatus').textContent = attendee.status;
        document.getElementById('viewRemarks').textContent = attendee.remarks || 'No remarks';
        
        // Show modal
        viewAttendeeModal.classList.add('active');
    }
}

function openViewMinistryModal(ministryId) {
    const ministry = ministries.find(m => m.id === ministryId);
    if (ministry) {
        currentMinistryId = ministryId;

        // Populate view with ministry data
        document.getElementById('viewMinistryName').textContent = ministry.name;
        document.getElementById('viewMinistryCode').textContent = ministry.code;
        document.getElementById('viewContactPerson').textContent = ministry.contactPerson || '';
        document.getElementById('viewContactPersonEmail').textContent = ministry.contactPersonEmail || '';
        document.getElementById('viewUsername').textContent = ministry.username || '';

        // DO NOT render the real password directly.
        // Store it in data-password on the masked element and show a masked value.
        // const pwMaskEl = document.getElementById('viewPasswordMask');
        // if (pwMaskEl) {
        //     pwMaskEl.dataset.password = ministry.password || '';
        //     pwMaskEl.textContent = '••••••••';
        //     pwMaskEl.setAttribute('aria-hidden', 'true');
        // }

        // // Ensure toggle button reflects "Show"
        // const toggleBtn = document.getElementById('toggleViewPasswordBtn');
        // if (toggleBtn) {
        //     toggleBtn.textContent = 'Show';
        //     toggleBtn.dataset.shown = 'false';
        // }

        // Show modal
        viewMinistryModal.classList.add('active');
    }
}

// Toggle reveal/hide password (safe explicit action)
const toggleViewPasswordBtn = document.getElementById('toggleViewPasswordBtn');
if (toggleViewPasswordBtn) {
    toggleViewPasswordBtn.addEventListener('click', function () {
        const pwEl = document.getElementById('viewPasswordMask');
        if (!pwEl) return;

        const currentlyShown = this.dataset.shown === 'true';
        if (!currentlyShown) {
            // confirm before revealing
            const ok = confirm('Reveal ministry password? Only reveal when necessary.');
            if (!ok) return;
            // reveal
            const real = pwEl.dataset.password || '';
            pwEl.textContent = real || '(no password)';
            pwEl.setAttribute('aria-hidden', 'false');
            this.textContent = 'Hide';
            this.dataset.shown = 'true';
        } else {
            // hide again
            pwEl.textContent = '••••••••';
            pwEl.setAttribute('aria-hidden', 'true');
            this.textContent = 'Show';
            this.dataset.shown = 'false';
        }
    });
}

// Verification Functions
function approveAttendee(attendeeId) {
    const attendeeIndex = attendees.findIndex(a => a.id === attendeeId);
    if (attendeeIndex !== -1) {
        attendees[attendeeIndex].status = 'Approved';
        updateAttendeesTable();
        updatePendingTable();
        updateStats();
        alert('Attendee has been approved!');
    }
}

function rejectAttendee(attendeeId) {
    const attendeeIndex = attendees.findIndex(a => a.id === attendeeId);
    if (attendeeIndex !== -1) {
        attendees[attendeeIndex].status = 'Rejected';
        updateAttendeesTable();
        updatePendingTable();
        updateStats();
        alert('Attendee has been rejected!');
    }
}

// Search and Filter Functions
function filterAttendees() {
    const searchTerm = searchAttendees.value.toLowerCase();
    const ministryFilter = filterMinistry.value;
    const statusFilter = filterStatus.value;
    const departmentFilter = filterDepartment.value;
    
    const filteredAttendees = attendees.filter(attendee => {
        const matchesSearch = 
            attendee.name.toLowerCase().includes(searchTerm) ||
            attendee.email.toLowerCase().includes(searchTerm) ||
            attendee.nin.includes(searchTerm) ||
            attendee.position.toLowerCase().includes(searchTerm);
        
        const matchesMinistry = ministryFilter ? attendee.ministry === ministryFilter : true;
        const matchesStatus = statusFilter ? attendee.status === statusFilter : true;
        const matchesDepartment = departmentFilter ? attendee.department === departmentFilter : true;
        
        return matchesSearch && matchesMinistry && matchesStatus && matchesDepartment;
    });
    
    renderAttendeesTable(filteredAttendees);
}

function clearFilters() {
    searchAttendees.value = '';
    filterMinistry.value = '';
    filterStatus.value = '';
    filterDepartment.value = '';
    renderAttendeesTable(attendees);
}

// Ministry Functions
function generateMinistryCredentials() {
    const ministryCode = document.getElementById('ministryCode').value.toUpperCase();
    if (ministryCode) {
        const username = `${ministryCode}2024`;
        const password = `ICSC@${ministryCode}2024`;
        
        document.getElementById('generatedUsername').textContent = username;
        document.getElementById('generatedPassword').textContent = password;
    }
}

function generateNewPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 10; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('editPassword').value = newPassword;
}

// UI Update Functions
function updateStats() {
    const pendingCount = attendees.filter(a => a.status === 'Pending').length;
    const approvedCount = attendees.filter(a => a.status === 'Approved').length;
    const totalCount = attendees.length;
    const ministriesCount = ministries.length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('approvedCount').textContent = approvedCount;
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('ministriesCount').textContent = ministriesCount;
}

function updateAttendeesTable() {
    renderAttendeesTable(attendees);
}

function updatePendingTable() {
    const pendingAttendees = attendees.filter(a => a.status === 'Pending');
    renderPendingTable(pendingAttendees);
}

function renderMinistriesTable() {
    let html = '';
    // <button class="btn btn-warning btn-sm edit-ministry-btn">Edit</button>
    
    ministries.forEach(ministry => {
        html += `
            <tr data-id="${ministry.id}">
                <td>${ministry.name}</td>
                <td>${ministry.code}</td>
                <td>${ministry.attendeesCount}</td>
                <td>${ministry.pendingCount}</td>
                <td>${ministry.approvedCount}</td>
                <td>${ministry.contactPerson}</td>
                <td>${ministry.contactPersonEmail}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm view-ministry-btn">View</button>
                        <button class="btn btn-danger btn-sm delete-ministry-btn">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    ministriesTable.innerHTML = html;
}

function renderAttendeesTable(attendeesList) {
    let html = '';
    
    attendeesList.forEach(attendee => {
        const statusClass = `status-${attendee.status.toLowerCase()}`;
        // <button class="btn btn-warning btn-sm edit-btn">Edit</button>
        
        html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name}</td>
                <td>${attendee.email}</td>
                <td>${attendee.nin}</td>
                <td>${attendee.position}</td>
                <td>${attendee.ministry}</td>
                <td>${attendee.department}</td>
                <td>${attendee.agency}</td>
                <td><span class="status-badge ${statusClass}">${attendee.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-btn">View</button>
                        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    allAttendeesTable.innerHTML = html;
}

function renderPendingTable(pendingAttendees) {
    let html = '';
    
    pendingAttendees.forEach(attendee => {
        html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name}</td>
                <td>${attendee.email}</td>
                <td>${attendee.position}</td>
                <td>${attendee.department}</td>
                <td>${attendee.ministry}</td>
                <td>${attendee.dateAdded}</td>
                <td>
                    <div class="verification-actions">
                        <button class="btn btn-success approve-btn">Approve</button>
                        <button class="btn btn-danger reject-btn">Reject</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    pendingAttendeesTable.innerHTML = html;
}

// Initialize tables
renderAttendeesTable(attendees);
updatePendingTable();

// Add event listener for ministry code to generate credentials
document.getElementById('ministryCode').addEventListener('input', generateMinistryCredentials);

document.getElementById('superAdminLogoutBtn').addEventListener('click', function (e) {
    e.preventDefault(); // prevent default link behavior
    localStorage.clear(); // clear stored login info
    sessionStorage.clear(); // clear session too, if used

    // Redirect back to your login page
    window.location.href = '../index.html';
});

document.addEventListener("DOMContentLoaded", function () {
    const superAdminLogoutBtn = document.getElementById("superAdminLogoutBtn");

    if (superAdminLogoutBtn) {
        superAdminLogoutBtn.addEventListener("click", function (event) {
            event.preventDefault(); // Stop the normal redirect

            const confirmLogout = confirm("Are you sure you want to log out?");
            if (confirmLogout) {
                // Optional: Clear any session storage if you're using it
                sessionStorage.clear();
                localStorage.removeItem("superAdminLoggedIn");

                // Redirect to login page
                window.location.href = '../index.html';
            }
        });
    }
});

// Dashboard script (handles Add Attendee submission + UI updates)
// - Posts form data to POST /attendees (adjust endpoint if different).
// - Requires apiClient (preferred) or falls back to axios with token from localStorage.

(function () {
	// ...existing code...

	// Add Attendee form integration
	const addForm = document.getElementById('addAttendeeForm');
	// const successModal = document.getElementById('successModal'); // already defined above in file
	// const successMessageEl = document.getElementById('successMessage'); // already defined above in file
	// const allAttendeesTable = document.getElementById('allAttendeesTable'); // already defined above in file

	if (!addForm) return;

	// NOTE: The main add-attendee submit handler is attached via initializeEventListeners()
	// and implemented in handleAddAttendee above. Avoid adding a second submit listener here.
	// (previously: addForm.addEventListener('submit', async function (e) { ... }); )
	// ...existing code continues...
})();