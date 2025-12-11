// DOM Elements
const deleteMinistryModal = document.getElementById('deleteMinistryModal');
const successMessageEl = document.getElementById('successMessage');
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
const addAnotherBtn = document.getElementById('addAnotherBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const cancelDeleteMinistryBtn = document.getElementById('cancelDeleteMinistryBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const confirmDeleteMinistryBtn = document.getElementById('confirmDeleteMinistryBtn');
const cancelAddMinistryBtn = document.getElementById('cancelAddMinistryBtn');
const closeViewMinistryBtn = document.getElementById('closeViewMinistryBtn');
const cancelEditMinistryBtn = document.getElementById('cancelEditMinistryBtn');
const cancelEditExhibitorBtn = document.getElementById('cancelEditExhibitorBtn');
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
let attendees = [];

// Current attendee/ministry being edited or deleted
let currentAttendeeId = null;
let currentMinistryId = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    initializeModalManager();
    // Load attendees and ministries from backend
    fetchAttendees();
    renderMinistriesTable();
    fetchMinistries();
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

    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.hasAttribute('data-tab')) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                
                tabLinks.forEach(l => l.classList.remove('active'));
                document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
                
                tabs.forEach(tab => tab.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
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
        'settings': 'System Settings',
        'booths': 'Booth Management',
        'speakers': 'Speaker Management',
        'exhibitors': 'Exhibitor Management',
        'partners': 'Partner Management',
        'agenda': 'Agenda Management',
        'resources': 'Resources Management',
        'bulk-approvals': 'Bulk Approvals'
    };
    return titles[tabId] || 'Super Admin Dashboard';
}

// Fixed Modal Manager
function initializeModalManager() {
    console.log("Initializing modal manager...");
    
    // Handle all modal buttons with event delegation
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle Add buttons - use both ID and closest for nested elements
        if (target.id === 'addExhibitorBtn' || target.closest('#addExhibitorBtn')) {
            e.preventDefault();
            console.log("Opening Add Exhibitor modal");
            const modal = document.getElementById('addExhibitorModal');
            if (modal) {
                modal.style.display = 'flex';
                // Reset form if exists
                const form = document.getElementById('addExhibitorForm');
                if (form) form.reset();
            } else {
                console.warn("Add Exhibitor modal not found");
            }
        }
        else if (target.id === 'addPartnerBtn' || target.closest('#addPartnerBtn')) {
            e.preventDefault();
            console.log("Opening Add Partner modal");
            const modal = document.getElementById('addPartnerModal');
            if (modal) {
                modal.style.display = 'flex';
                const form = document.getElementById('addPartnerForm');
                if (form) form.reset();
            }
        }
        else if (target.id === 'addSpeakerBtn' || target.closest('#addSpeakerBtn')) {
            e.preventDefault();
            console.log("Opening Add Speaker modal");
            const modal = document.getElementById('addSpeakerModal');
            if (modal) {
                modal.style.display = 'flex';
                const form = document.getElementById('addSpeakerForm');
                if (form) form.reset();
            }
        }
        else if (target.id === 'addBoothBtn' || target.closest('#addBoothBtn')) {
            e.preventDefault();
            console.log("Opening Add Booth modal");
            const modal = document.getElementById('addBoothModal');
            if (modal) {
                modal.style.display = 'flex';
                const form = document.getElementById('addBoothForm');
                if (form) form.reset();
            }
        }
        else if (target.id === 'addAgendaBtn' || target.closest('#addAgendaBtn')) {
            e.preventDefault();
            console.log("Opening Add Agenda modal");
            const modal = document.getElementById('addAgendaItemModal');
            if (modal) {
                modal.style.display = 'flex';
                const form = document.getElementById('addAgendaItemForm');
                if (form) form.reset();
            }
        }
        
        // Handle Cancel buttons for modals
        if (target.id === 'cancelAddExhibitorBtn' || target.closest('#cancelAddExhibitorBtn')) {
            e.preventDefault();
            const modal = document.getElementById('addExhibitorModal');
            if (modal) modal.style.display = 'none';
        }
        else if (target.id === 'cancelAddPartnerBtn' || target.closest('#cancelAddPartnerBtn')) {
            e.preventDefault();
            const modal = document.getElementById('addPartnerModal');
            if (modal) modal.style.display = 'none';
        }
        else if (target.id === 'cancelAddSpeakerBtn' || target.closest('#cancelAddSpeakerBtn')) {
            e.preventDefault();
            const modal = document.getElementById('addSpeakerModal');
            if (modal) modal.style.display = 'none';
        }
        else if (target.id === 'cancelAddBoothBtn' || target.closest('#cancelAddBoothBtn')) {
            e.preventDefault();
            const modal = document.getElementById('addBoothModal');
            if (modal) modal.style.display = 'none';
        }
        else if (target.id === 'cancelAddAgendaBtn' || target.closest('#cancelAddAgendaBtn')) {
            e.preventDefault();
            const modal = document.getElementById('addAgendaItemModal');
            if (modal) modal.style.display = 'none';
        }
    });
    
    // Add form submission handlers
    setupFormHandler('addExhibitorForm', 'addExhibitorModal', 'Exhibitor');
    setupFormHandler('addPartnerForm', 'addPartnerModal', 'Partner');
    setupFormHandler('addSpeakerForm', 'addSpeakerModal', 'Speaker');
    setupFormHandler('addBoothForm', 'addBoothModal', 'Booth');
    setupFormHandler('addAgendaItemForm', 'addAgendaItemModal', 'Agenda item');
    
    function setupFormHandler(formId, modalId, itemName) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log(`${itemName} form submitted`);
                
                // Show success message
                document.getElementById('successMessage').textContent = `${itemName} has been successfully added!`;
                document.getElementById('successModal').style.display = 'flex';
                
                // Close the modal
                const modal = document.getElementById(modalId);
                if (modal) modal.style.display = 'none';
                
                // Reset form
                this.reset();
            });
        }
    }
    
// Add to your initializeModalManager() or existing modal close handlers:
document.addEventListener('click', function(e) {
    // Close package success modal
    const packageModal = document.getElementById('packageSuccessModal');
    if (packageModal && packageModal.style.display === 'flex' && e.target === packageModal) {
        packageModal.style.display = 'none';
    }
})
    // Close modals when clicking X button or outside
    document.addEventListener('click', function(e) {
        // Close modals when clicking X
        if (e.target.classList.contains('close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                e.preventDefault();
            }
        }
});

}

// Event Listeners
function initializeEventListeners() {
    // Safely add form submit handlers only if elements exist
    if (addAttendeeForm) addAttendeeForm.addEventListener('submit', handleAddAttendee);
    if (editAttendeeForm) editAttendeeForm.addEventListener('submit', handleEditAttendee);
    if (addMinistryForm) addMinistryForm.addEventListener('submit', handleAddMinistry);
    if (editMinistryForm) editMinistryForm.addEventListener('submit', handleEditMinistry);
    
    // Modal close buttons (simplified)
    if (addAnotherBtn) addAnotherBtn.addEventListener('click', function() {
        if (successModal) successModal.style.display = 'none';
    });
    
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', function() {
        if (editAttendeeModal) editAttendeeModal.style.display = 'none';
    });

    if (cancelEditExhibitorBtn) {
        cancelEditExhibitorBtn.addEventListener('click', function() {
            const modal = document.getElementById('editExhibitorModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', function() {
        if (deleteModal) deleteModal.style.display = 'none';
    });
    if (cancelDeleteMinistryBtn) cancelDeleteMinistryBtn.addEventListener('click', function() {
        if (deleteMinistryModal) deleteMinistryModal.style.display = 'none';
    });
    
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDeleteAttendee);
    if (confirmDeleteMinistryBtn) confirmDeleteMinistryBtn.addEventListener('click', handleDeleteMinistry);
    
    if (cancelAddMinistryBtn) cancelAddMinistryBtn.addEventListener('click', function() {
        if (addMinistryModal) addMinistryModal.style.display = 'none';
    });
    
    if (closeViewMinistryBtn) closeViewMinistryBtn.addEventListener('click', function() {
        if (viewMinistryModal) viewMinistryModal.style.display = 'none';
    });
    
    if (cancelEditMinistryBtn) cancelEditMinistryBtn.addEventListener('click', function() {
        if (editMinistryModal) editMinistryModal.style.display = 'none';
    });
    
    if (generateNewPasswordBtn) generateNewPasswordBtn.addEventListener('click', generateNewPassword);
    
    // Search and filter
    if (searchAttendees) searchAttendees.addEventListener('input', filterAttendees);
    if (filterMinistry) filterMinistry.addEventListener('change', filterAttendees);
    if (filterStatus) filterStatus.addEventListener('change', filterAttendees);
    if (filterDepartment) filterDepartment.addEventListener('change', filterAttendees);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Add Ministry button
    if (addMinistryBtn) {
        addMinistryBtn.addEventListener('click', function() {
            const mn = document.getElementById('ministryName');
            const mc = document.getElementById('ministryCode');
            const cp = document.getElementById('contactPerson');
            const cpe = document.getElementById('contactPersonEmail');

            if (mn) mn.value = '';
            if (mc) mc.value = '';
            if (cp) cp.value = 'Permanent Secretary';
            if (cpe) cpe.value = '';

            generateMinistryCredentials();
            if (addMinistryModal) addMinistryModal.style.display = 'flex';
        });
    }

    // Global document click handlers for table actions
    document.addEventListener('click', function(e) {
        const closestRow = e.target.closest && e.target.closest('tr');
        
        // Attendee actions
        if (e.target.classList.contains('edit-btn') && closestRow) {
            const attendeeId = parseInt(closestRow.getAttribute('data-id'));
            if (!Number.isNaN(attendeeId)) openEditModal(attendeeId);
        }
        if (e.target.classList.contains('view-btn') && closestRow) {
            const attendeeId = parseInt(closestRow.getAttribute('data-id'));
            if (!Number.isNaN(attendeeId)) openViewModal(attendeeId);
        }
        if (e.target.classList.contains('delete-btn') && closestRow) {
            const attendeeId = parseInt(closestRow.getAttribute('data-id'));
            const attendeeName = closestRow.cells && closestRow.cells[0] ? closestRow.cells[0].textContent : '';
            if (!Number.isNaN(attendeeId)) openDeleteModal(attendeeId, attendeeName);
        }

        // Ministry actions
        if (e.target.classList.contains('delete-ministry-btn') && closestRow) {
            const ministryId = parseInt(closestRow.getAttribute('data-id'));
            const ministryName = closestRow.cells && closestRow.cells[0] ? closestRow.cells[0].textContent : '';
            if (!Number.isNaN(ministryId)) openDeleteMinistryModal(ministryId, ministryName);
        }

        // Verification actions
        if (e.target.classList.contains('approve-btn') && closestRow) {
            const attendeeId = parseInt(closestRow.getAttribute('data-id'));
            if (!Number.isNaN(attendeeId)) approveAttendee(attendeeId);
        }
        if (e.target.classList.contains('reject-btn') && closestRow) {
            const attendeeId = parseInt(closestRow.getAttribute('data-id'));
            if (!Number.isNaN(attendeeId)) rejectAttendee(attendeeId);
        }

        if (e.target.classList.contains('view-ministry-btn') && closestRow) {
            const ministryId = parseInt(closestRow.getAttribute('data-id'));
            if (!Number.isNaN(ministryId)) openViewMinistryModal(ministryId);
        }
        if (e.target.classList.contains('edit-ministry-btn') && closestRow) {
            const ministryId = parseInt(closestRow.getAttribute('data-id'));
            if (!Number.isNaN(ministryId)) openEditMinistryModal(ministryId);
        }

        // Exhibitor actions
        if (e.target.classList.contains('edit-exhibitor-btn') && closestRow) {
            const exhibitorId = closestRow.getAttribute('data-id');
            editExhibitor(exhibitorId);
        }
        if (e.target.classList.contains('view-exhibitor-btn') && closestRow) {
            const exhibitorId = closestRow.getAttribute('data-id');
            viewExhibitor(exhibitorId);
        }

        // Partner actions
        if (e.target.classList.contains('edit-partner-btn') && closestRow) {
            const partnerId = closestRow.getAttribute('data-id');
            editPartner(partnerId);
        }
        if (e.target.classList.contains('view-partner-btn') && closestRow) {
            const partnerId = closestRow.getAttribute('data-id');
            viewPartner(partnerId);
        }

        // Speaker actions
        if (e.target.classList.contains('edit-speaker-btn') && closestRow) {
            const speakerId = closestRow.getAttribute('data-id');
            editSpeaker(speakerId);
        }
        if (e.target.classList.contains('view-speaker-btn') && closestRow) {
            const speakerId = closestRow.getAttribute('data-id');
            viewSpeaker(speakerId);
        }
    });

    // Refresh & export buttons
    const refreshActivityBtn = document.getElementById('refreshActivityBtn');
    const refreshPendingBtn = document.getElementById('refreshPendingBtn');
    const exportAttendeesBtn = document.getElementById('exportAttendeesBtn');

    if (refreshActivityBtn) refreshActivityBtn.addEventListener('click', function () { alert('Refreshing recent activity...'); });
    if (refreshPendingBtn) refreshPendingBtn.addEventListener('click', function () { alert('Refreshing pending attendees...'); });
    if (exportAttendeesBtn) exportAttendeesBtn.addEventListener('click', function () { alert('Exporting attendees data...'); });
}

// Form Handlers
async function handleAddAttendee(e) {
    e.preventDefault();
    
    const values = {
        prefix: document.getElementById('attendeePrefix').value.trim(),
        firstName: document.getElementById('attendeeFirstName').value.trim(),
        lastName: document.getElementById('attendeeLastName').value.trim(),
        email: document.getElementById('attendeeEmail').value.trim(),
        password: document.getElementById('attendeePassword').value.trim(),
        jobTitle: document.getElementById('attendeeJobTitle').value.trim(),
        organization: document.getElementById('attendeeOrganization').value.trim(),
        phone: document.getElementById('attendeePhone').value.trim(),
        position: document.getElementById('attendeePosition').value.trim(),
        gradeLevel: document.getElementById('attendeeGradeLevel').value,
        ministry: document.getElementById('attendeeMinistry')?.value || '',
        department: document.getElementById('attendeeDepartment')?.value.trim() || '',
        agency: document.getElementById('attendeeAgency')?.value.trim() || '',
        staffId: document.getElementById('attendeeStaffId')?.value.trim() || '',
        office: document.getElementById('attendeeOffice')?.value.trim() || '',
        status: document.getElementById('attendeeStatus')?.value || 'Pending',
        remarks: document.getElementById('attendeeRemarks')?.value.trim() || ''
    };

    const fullName = `${values.prefix} ${values.firstName} ${values.lastName}`.trim();

    const required = ['prefix', 'firstName', 'lastName', 'email', 'password', 'jobTitle', 'organization', 'phone', 'position', 'gradeLevel'];
    for (const field of required) {
        if (!values[field]) {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return;
        }
    }

    const payload = {
        fullname: fullName,
        email: values.email,
        password: values.password,
        phone_number: values.phone,
        position: values.position,
        jobTitle: values.jobTitle,
        grade: values.gradeLevel,
        organization: values.organization,
        department: values.department,
        department_agency: values.agency,
        staff_id: values.staffId,
        office_location: values.office,
        status: values.status,
        remark: values.remarks
    };

    const submitBtn = addAttendeeForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
    }

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

            const newId = created.id || (attendees.length > 0 ? Math.max(...attendees.map(a=>a.id))+1 : 1);
            const newAttendee = {
                id: newId,
                name: created.full_name || created.name || payload.full_name,
                email: created.email || payload.email,
                phone: created.phone || payload.phone,
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

            attendees.push(newAttendee);
            renderAttendeesTable(attendees);
            updatePendingTable();
            updateStats();

            document.getElementById('successMessage').textContent = 'Attendee has been successfully added!';
            successModal.style.display = 'flex';
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

async function handleEditAttendee(e) {
    e.preventDefault();
    
    const updatedData = {
        prefix: document.getElementById('editAttendeePrefix').value.trim(),
        firstName: document.getElementById('editAttendeeFirstName').value.trim(),
        lastName: document.getElementById('editAttendeeLastName').value.trim(),
        email: document.getElementById('editAttendeeEmail').value.trim(),
        password: document.getElementById('editAttendeePassword').value.trim(),
        jobTitle: document.getElementById('editAttendeeJobTitle').value.trim(),
        organization: document.getElementById('editAttendeeOrganization').value.trim(),
        phone: document.getElementById('editAttendeePhone').value.trim(),
        position: document.getElementById('editAttendeePosition').value.trim(),
        gradeLevel: document.getElementById('editAttendeeGradeLevel').value
    };

    const fullName = `${updatedData.prefix} ${updatedData.firstName} ${updatedData.lastName}`.trim();

    const payload = {
        fullname: fullName,
        email: updatedData.email,
        password: updatedData.password,
        phone_number: updatedData.phone,
        position: updatedData.position,
        job_title: updatedData.jobTitle,
        grade: updatedData.gradeLevel,
        organization: updatedData.organization
    };

    const submitBtn = editAttendeeForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
    }

    try {
        let res;
        if (window.apiClient) {
            res = await window.apiClient.put(`/admin/update-attendee?attendee_id=${currentAttendeeId}`, payload);
        } else {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            res = await axios.put(`${API_BASE_URL}/admin/update-attendee?attendee_id=${currentAttendeeId}`, payload, { headers });
        }

        if (res && (res.status === 200 || res.status === 201)) {
            const attendeeIndex = attendees.findIndex(a => a.id === currentAttendeeId);
            if (attendeeIndex !== -1) {
                attendees[attendeeIndex] = {
                    ...attendees[attendeeIndex],
                    name: fullName,
                    email: updatedData.email,
                    phone: updatedData.phone,
                    position: updatedData.position,
                    gradeLevel: updatedData.gradeLevel,
                    ministry: updatedData.organization
                };
                
                renderAttendeesTable(attendees);
                updatePendingTable();
                updateStats();
                
                document.getElementById('successMessage').textContent = 'Attendee has been successfully updated!';
                successModal.style.display = 'flex';
                editAttendeeModal.style.display = 'none';
            }
        } else {
            throw new Error(res?.data?.message || 'Failed to update attendee');
        }
    } catch (err) {
        const msg = err?.response?.data?.message || err.message || 'Update failed';
        alert(msg);
        console.error('Edit attendee error:', err);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText || 'Update Attendee';
        }
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

        if (res && (res.status === 200 || res.status === 204 || res.status === 202)) {
            attendees = attendees.filter(a => String(a.id) !== String(currentAttendeeId));

            renderAttendeesTable(attendees);
            updatePendingTable();
            updateStats();

            document.getElementById('successMessage').textContent = 'Attendee has been successfully deleted!';
            successModal.style.display = 'flex';
            deleteModal.style.display = 'none';
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

        if (res && (res.status === 200 || res.status === 204 || res.status === 202)) {
            ministries = ministries.filter(m => String(m.id) !== String(currentMinistryId));

            renderMinistriesTable(ministries);
            updateStats();

            document.getElementById('successMessage').textContent = 'Ministry has been successfully deleted!';
            successModal.style.display = 'flex';
            deleteMinistryModal.style.display = 'none';
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
    }
}

async function handleAddMinistry(e) {
    e.preventDefault();

    const organization = document.getElementById('ministryName').value.trim();
    const organization_short_code = document.getElementById('ministryCode').value.trim();
    const contact_person = document.getElementById('contactPerson').value.trim();
    const contact_person_email = document.getElementById('contactPersonEmail').value.trim();
    const username = document.getElementById('generatedUsername').textContent.trim();
    const password = document.getElementById('generatedPassword').textContent.trim();

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

    const submitBtn = addMinistryForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
    }

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
            res = await window.apiClient.post('/admin/create-user', payload);
        } else {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            res = await axios.post(`${API_BASE_URL}/admin/create-user`, payload, { headers });
        }

        if (res && (res.status === 200 || res.status === 201)) {
            const created = res.data?.data || res.data || payload;

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

            document.getElementById('successMessage').textContent = 'Ministry has been successfully created!';
            successModal.style.display = 'flex';

            addMinistryForm.reset();
            addMinistryModal.style.display = 'none';
        } else {
            const msg = res?.data?.message || 'Failed to create ministry';
            throw new Error(msg);
        }
    } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Create ministry failed';
        alert(message);
        console.error('Create ministry error:', err);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText || 'Add Ministry';
        }
    }
}

async function fetchMinistries() {
    try {
        let res;
        const endpoints = ['/admin/users'];

        if (window.apiClient) {
            for (const ep of endpoints) {
                try {
                    res = await window.apiClient.get(ep);
                    if (res && (res.status === 200 || res.status === 201)) break;
                } catch (e) {
                    res = null;
                }
            }
        } else {
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
        renderMinistriesTable();
        updateStats();
    }
}

async function fetchAttendees() {
    try {
        let res;
        if (window.apiClient) {
            res = await window.apiClient.get('/admin/attendees');
        } else {
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
            attendees = list.map(item => ({
                id: item.id || item._id || (item.attendeeId || null),
                name: item.full_name || item.name || item.fullName || item.fullname || '',
                email: item.email || '',
                phone: item.phone || item.phone_number || '',
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

            renderAttendeesTable(attendees);
            updatePendingTable();
            updateStats();
            console.log(`Fetched ${attendees.length} attendees from backend`);
            return;
        }

        console.warn('Unexpected attendees response format', res);
    } catch (err) {
        console.error('Error fetching attendees:', err?.response?.data || err.message || err);
        renderAttendeesTable(attendees);
        updatePendingTable();
        updateStats();
    }
}

function handleEditMinistry(e) {
    e.preventDefault();
    
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
        
        renderMinistriesTable();
        
        document.getElementById('successMessage').textContent = 'Ministry has been successfully updated!';
        successModal.style.display = 'flex';
        
        editMinistryModal.style.display = 'none';
    }
}

// Modal Functions
function openEditModal(attendeeId) {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee) {
        currentAttendeeId = attendeeId;
        
        const nameParts = attendee.name.split(' ');
        let prefix = 'Mr';
        let firstName = '';
        let lastName = '';
        
        if (nameParts.length > 0) {
            const possiblePrefixes = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
            if (possiblePrefixes.includes(nameParts[0])) {
                prefix = nameParts[0];
                firstName = nameParts[1] || '';
                lastName = nameParts.slice(2).join(' ') || '';
            } else {
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
            }
        }
        
        document.getElementById('editAttendeePrefix').value = prefix;
        document.getElementById('editAttendeeFirstName').value = firstName;
        document.getElementById('editAttendeeLastName').value = lastName;
        document.getElementById('editAttendeeEmail').value = attendee.email;
        document.getElementById('editAttendeePassword').value = '';
        document.getElementById('editAttendeeJobTitle').value = attendee.position;
        document.getElementById('editAttendeeOrganization').value = attendee.ministry;
        document.getElementById('editAttendeePhone').value = attendee.phone;
        document.getElementById('editAttendeePosition').value = attendee.position;
        document.getElementById('editAttendeeGradeLevel').value = attendee.gradeLevel;
        
        editAttendeeModal.style.display = 'flex';
    }
}

function openDeleteModal(attendeeId, attendeeName) {
    currentAttendeeId = attendeeId;
    document.getElementById('deleteAttendeeName').textContent = attendeeName;
    deleteModal.style.display = 'flex';
}

function openDeleteMinistryModal(ministryId, ministryName) {
    currentMinistryId = ministryId;
    document.getElementById('deleteMinistryName').textContent = ministryName;
    deleteMinistryModal.style.display = 'flex';
}

function openViewModal(attendeeId) {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee) {
        document.getElementById('viewName').textContent = attendee.name;
        document.getElementById('viewEmail').textContent = attendee.email;
        document.getElementById('viewPhone').textContent = attendee.phone;
        document.getElementById('viewWorkPhone').textContent = attendee.phone;
        document.getElementById('viewNIN').textContent = attendee.nin;
        document.getElementById('viewPosition').textContent = attendee.position;
        document.getElementById('viewJobTitle').textContent = attendee.position;
        document.getElementById('viewGradeLevel').textContent = attendee.gradeLevel;
        document.getElementById('viewOrganization').textContent = attendee.ministry;
        document.getElementById('viewStatus').textContent = attendee.status;
        
        viewAttendeeModal.style.display = 'flex';
    }
}

function openViewMinistryModal(ministryId) {
    const ministry = ministries.find(m => m.id === ministryId);
    if (ministry) {
        currentMinistryId = ministryId;

        document.getElementById('viewMinistryName').textContent = ministry.name;
        document.getElementById('viewMinistryCode').textContent = ministry.code;
        document.getElementById('viewContactPerson').textContent = ministry.contactPerson || '';
        document.getElementById('viewContactPersonEmail').textContent = ministry.contactPersonEmail || '';
        document.getElementById('viewUsername').textContent = ministry.username || '';

        viewMinistryModal.style.display = 'flex';
    }
}

// Speaker Modal Functions
function editSpeaker(speakerId) {
    const row = document.querySelector(`#speakersTable tr[data-id="${speakerId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    // Populate edit form
    if (document.getElementById('editSpeakerId')) {
        document.getElementById('editSpeakerId').value = speakerId;
    }
    
    // Show modal
    const modal = document.getElementById('editSpeakerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function viewSpeaker(speakerId) {
    const row = document.querySelector(`#speakersTable tr[data-id="${speakerId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    const modal = document.getElementById('viewSpeakerModal');
    if (!modal) return;
    
    // Populate view details
    const detailsDiv = document.getElementById('viewSpeakerDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[0].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Topic</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[1].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Affiliation</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[2].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Package</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[3].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Day</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[4].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Session</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[5].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Status</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[6].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Payment Status</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[7].textContent}</p>
                </div>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
}

// Exhibitor Modal Functions
function editExhibitor(exhibitorId) {
    const row = document.querySelector(`#exhibitorsTable tr[data-id="${exhibitorId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    // Show modal
    const modal = document.getElementById('editExhibitorModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function viewExhibitor(exhibitorId) {
    const row = document.querySelector(`#exhibitorsTable tr[data-id="${exhibitorId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    const modal = document.getElementById('viewExhibitorModal');
    if (!modal) return;
    
    // Populate view details
    const detailsDiv = document.getElementById('viewExhibitorDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[0].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[1].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Booth</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[2].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Day</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[3].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Budget</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[4].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[5].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Status</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[6].textContent}</p>
                </div>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
}

// Partner Modal Functions
function editPartner(partnerId) {
    const row = document.querySelector(`#partnersTable tr[data-id="${partnerId}"]`);
    if (!row) return;
    
    // Show modal
    const modal = document.getElementById('editPartnerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function viewPartner(partnerId) {
    const row = document.querySelector(`#partnersTable tr[data-id="${partnerId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    const modal = document.getElementById('viewPartnerModal');
    if (!modal) return;
    
    // Populate view details
    const detailsDiv = document.getElementById('viewPartnerDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Company</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[0].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Contact Person</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[1].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[2].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Package</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[3].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Investment</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[4].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[5].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Status</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[6].textContent}</p>
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[7].textContent}</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>End Date</label>
                    <p class="form-control" style="background: #f8f9fa;">${cells[8].textContent}</p>
                </div>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
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
        
        html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name}</td>
                <td>${attendee.email}</td>
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

// Logout Functionality
const superAdminLogoutBtn = document.getElementById('superAdminLogoutBtn');
if (superAdminLogoutBtn) {
    superAdminLogoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../index.html';
        }
    });
}

// Bulk Approvals JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const bulkApprovalsTable = document.getElementById('bulkApprovalsTable');
    const reviewBulkModal = document.getElementById('reviewBulkModal');
    const viewApprovedBulkModal = document.getElementById('viewApprovedBulkModal');
    const refreshBulkBtn = document.getElementById('refreshBulkApprovalsBtn');
    const searchBulkInput = document.getElementById('searchBulkApprovals');
    const filterBulkStatus = document.getElementById('filterBulkStatus');
    const filterBulkMinistry = document.getElementById('filterBulkMinistry');
    const clearBulkFiltersBtn = document.getElementById('clearBulkFiltersBtn');
    
    // Sample data for demonstration
    const bulkUploadsData = [
        {
            id: 'BULK001',
            ministry: 'Ministry of Finance',
            filename: 'MOF_Attendees_2024.xlsx',
            totalRecords: 25,
            validRecords: 22,
            errorRecords: 3,
            submittedBy: 'MOF Admin',
            dateSubmitted: '2024-01-15 14:30',
            status: 'pending',
            records: [
                { id: 1, name: 'John Doe', email: 'john@finance.gov.ng', position: 'Assistant Director', department: 'Accounts', ministry: 'Ministry of Finance', grade: 'Assistant Director', status: 'valid' },
                { id: 2, name: 'Jane Smith', email: 'jane@finance.gov.ng', position: 'Senior Officer', department: 'Budget', ministry: 'Ministry of Finance', grade: 'Senior Officer', status: 'valid' },
                { id: 3, name: 'Error Record', email: 'invalid-email', position: '', department: '', ministry: 'Ministry of Finance', grade: '', status: 'error', error: 'Invalid email format' }
            ],
            errors: [
                { row: 3, name: 'Error Record', email: 'invalid-email', errorType: 'Validation', errorMessage: 'Invalid email format' },
                { row: 10, name: 'Another Error', email: 'duplicate@finance.gov.ng', errorType: 'Duplicate', errorMessage: 'Duplicate email address' },
                { row: 15, name: '', email: '', errorType: 'Required', errorMessage: 'Name field is required' }
            ]
        },
        {
            id: 'BULK002',
            ministry: 'Ministry of Education',
            filename: 'MOE_Staff_Jan.xlsx',
            totalRecords: 18,
            validRecords: 18,
            errorRecords: 0,
            submittedBy: 'MOE Admin',
            dateSubmitted: '2024-01-14 11:20',
            status: 'approved',
            approvedBy: 'Super Admin',
            approvedDate: '2024-01-16 10:15',
            records: [
                { id: 1, name: 'Alice Johnson', email: 'alice@education.gov.ng', position: 'Director', department: 'Curriculum', ministry: 'Ministry of Education', grade: 'Director', approvalDate: '2024-01-16' },
                { id: 2, name: 'Bob Williams', email: 'bob@education.gov.ng', position: 'Deputy Director', department: 'Examinations', ministry: 'Ministry of Education', grade: 'Deputy Director', approvalDate: '2024-01-16' }
            ]
        }
    ];
    
    // Initialize Bulk Approvals Table
    function initBulkApprovalsTable() {
        if (!bulkApprovalsTable) return;
        
        // Add click event listener
        bulkApprovalsTable.addEventListener('click', function(e) {
            const reviewBtn = e.target.closest('.review-bulk-btn');
            const viewApprovedBtn = e.target.closest('.view-approved-btn');
            const rejectBtn = e.target.closest('.reject-bulk-btn');
            
            if (reviewBtn) {
                const row = reviewBtn.closest('tr');
                const uploadId = row.querySelector('td:first-child').textContent;
                openReviewModal(uploadId);
            }
            
            if (viewApprovedBtn) {
                const row = viewApprovedBtn.closest('tr');
                const uploadId = row.querySelector('td:first-child').textContent;
                openApprovedViewModal(uploadId);
            }
            
            if (rejectBtn) {
                const row = rejectBtn.closest('tr');
                const uploadId = row.querySelector('td:first-child').textContent;
                const ministry = row.querySelector('td:nth-child(2)').textContent;
                showRejectConfirmation(uploadId, ministry);
            }
        });
        
        // Populate table with data
        populateBulkTable();
    }
    
    // Populate Bulk Table with Data
    function populateBulkTable() {
        const tbody = bulkApprovalsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        bulkUploadsData.forEach(upload => {
            const statusBadge = getStatusBadge(upload.status);
            const actionButtons = getActionButtons(upload.status, upload.id);
            
            const row = document.createElement('tr');
            row.setAttribute('data-upload-id', upload.id);
            row.setAttribute('data-ministry', upload.ministry);
            row.setAttribute('data-records', JSON.stringify(upload.records));
            
            row.innerHTML = `
                <td>${upload.id}</td>
                <td>${upload.ministry}</td>
                <td>${upload.filename}</td>
                <td>${upload.totalRecords}</td>
                <td>${upload.validRecords}</td>
                <td>${upload.errorRecords}</td>
                <td>${upload.submittedBy}</td>
                <td>${upload.dateSubmitted}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    // Get Status Badge HTML
    function getStatusBadge(status) {
        const statusMap = {
            'pending': { class: 'status-pending', text: 'Pending Review' },
            'approved': { class: 'status-approved', text: 'Approved' },
            'rejected': { class: 'status-rejected', text: 'Rejected' },
            'partially_approved': { class: 'status-approved', text: 'Partially Approved' }
        };
        
        const statusInfo = statusMap[status] || statusMap.pending;
        return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }
    
    // Get Action Buttons HTML
    function getActionButtons(status, uploadId) {
        if (status === 'pending') {
            return `
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm review-bulk-btn">Review & Approve</button>
                    <button class="btn btn-danger btn-sm reject-bulk-btn">Reject All</button>
                </div>
            `;
        } else if (status === 'approved') {
            return `
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm view-approved-btn">View Details</button>
                </div>
            `;
        } else if (status === 'rejected') {
            return `
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm review-bulk-btn">Review Again</button>
                </div>
            `;
        }
        
        return '';
    }
    
    // Open Review Modal
    function openReviewModal(uploadId) {
        const upload = bulkUploadsData.find(u => u.id === uploadId);
        if (!upload) return;
        
        // Populate summary
        document.getElementById('reviewUploadId').textContent = upload.id;
        document.getElementById('reviewMinistry').textContent = upload.ministry;
        document.getElementById('reviewFilename').textContent = upload.filename;
        document.getElementById('reviewTotalRecords').textContent = upload.totalRecords;
        document.getElementById('reviewValidRecords').textContent = upload.validRecords;
        document.getElementById('reviewErrorRecords').textContent = upload.errorRecords;
        document.getElementById('reviewSubmittedBy').textContent = upload.submittedBy;
        document.getElementById('reviewDateSubmitted').textContent = upload.dateSubmitted;
        
        // Show/hide validation errors
        const errorsSection = document.getElementById('validationErrorsSection');
        if (upload.errorRecords > 0) {
            errorsSection.style.display = 'block';
            populateValidationErrors(upload.errors);
        } else {
            errorsSection.style.display = 'none';
        }
        
        // Populate valid records preview
        populateValidRecordsPreview(upload.records.filter(r => r.status === 'valid'));
        
        // Setup modal event listeners
        setupReviewModalListeners(upload);
        
        // Show modal
        reviewBulkModal.style.display = 'block';
    }
    
    // Populate Validation Errors Table
    function populateValidationErrors(errors) {
        const tbody = document.getElementById('validationErrorsTable');
        tbody.innerHTML = '';
        
        errors.forEach(error => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${error.row}</td>
                <td>${error.name || '-'}</td>
                <td>${error.email || '-'}</td>
                <td><span class="status-badge status-rejected">${error.errorType}</span></td>
                <td>${error.errorMessage}</td>
                <td>
                    <button class="btn btn-warning btn-sm fix-error-btn" data-row="${error.row}">
                        <i class="fas fa-wrench"></i> Fix
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Populate Valid Records Preview
    function populateValidRecordsPreview(records) {
        const tbody = document.getElementById('validRecordsPreviewTable');
        tbody.innerHTML = '';
        
        // Show only first 10 records
        const previewRecords = records.slice(0, 10);
        
        previewRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.email}</td>
                <td>${record.position}</td>
                <td>${record.department}</td>
                <td>${record.ministry}</td>
                <td>${record.grade}</td>
                <td><span class="status-badge status-approved">Valid</span></td>
            `;
            tbody.appendChild(row);
        });
        
        // Add info row if there are more records
        if (records.length > 10) {
            const infoRow = document.createElement('tr');
            infoRow.innerHTML = `
                <td colspan="8" style="text-align: center; font-style: italic;">
                    ... and ${records.length - 10} more valid records
                </td>
            `;
            tbody.appendChild(infoRow);
        }
    }
    
    // Setup Review Modal Event Listeners
    function setupReviewModalListeners(upload) {
        // Bulk status select change
        const bulkStatusSelect = document.getElementById('bulkStatusSelect');
        const customSection = document.getElementById('customSelectionSection');
        
        bulkStatusSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customSection.style.display = 'block';
            } else {
                customSection.style.display = 'none';
            }
        });
        
        // Selection buttons
        document.getElementById('selectAllValidBtn')?.addEventListener('click', function() {
            // Implementation for selecting all valid records
            showToast('All valid records selected', 'info');
        });
        
        document.getElementById('deselectAllBtn')?.addEventListener('click', function() {
            // Implementation for deselecting all
            showToast('All records deselected', 'info');
        });
        
        // Close button
        document.getElementById('closeReviewBtn').addEventListener('click', function() {
            reviewBulkModal.style.display = 'none';
        });
        
        // Reject button
        document.getElementById('rejectBulkBtn').addEventListener('click', function() {
            if (confirm(`Are you sure you want to reject the entire upload "${upload.filename}"? This will reject all ${upload.totalRecords} records.`)) {
                rejectBulkUpload(upload.id);
            }
        });
        
        // Approve button
        document.getElementById('approveBulkBtn').addEventListener('click', function() {
            const action = bulkStatusSelect.value;
            const remarks = document.getElementById('bulkRemarks').value;
            
            switch(action) {
                case 'approve_all':
                    approveBulkUpload(upload.id, 'all', remarks);
                    break;
                case 'approve_except_errors':
                    approveBulkUpload(upload.id, 'except_errors', remarks);
                    break;
                case 'reject_all':
                    rejectBulkUpload(upload.id, remarks);
                    break;
                case 'custom':
                    approveBulkUpload(upload.id, 'custom', remarks);
                    break;
            }
        });
    }
    
    // Open Approved View Modal
    function openApprovedViewModal(uploadId) {
        const upload = bulkUploadsData.find(u => u.id === uploadId);
        if (!upload) return;
        
        // Populate summary
        document.getElementById('viewApprovedUploadId').textContent = upload.id;
        document.getElementById('viewApprovedMinistry').textContent = upload.ministry;
        document.getElementById('viewApprovedCount').textContent = upload.validRecords;
        document.getElementById('viewApprovedBy').textContent = upload.approvedBy || 'Super Admin';
        document.getElementById('viewApprovedDate').textContent = upload.approvedDate || '2024-01-16 10:15';
        
        // Populate approved records
        populateApprovedRecords(upload.records);
        
        // Setup export buttons
        document.getElementById('exportApprovedExcelBtn').addEventListener('click', function() {
            exportApprovedRecords(upload.id, 'excel');
        });
        
        document.getElementById('exportApprovedPDFBtn').addEventListener('click', function() {
            exportApprovedRecords(upload.id, 'pdf');
        });
        
        document.getElementById('exportApprovedCSVBtn').addEventListener('click', function() {
            exportApprovedRecords(upload.id, 'csv');
        });
        
        // Close button
        document.getElementById('closeApprovedViewBtn').addEventListener('click', function() {
            viewApprovedBulkModal.style.display = 'none';
        });
        
        // Show modal
        viewApprovedBulkModal.style.display = 'block';
    }
    
    // Populate Approved Records Table
    function populateApprovedRecords(records) {
        const tbody = document.getElementById('approvedRecordsTable');
        tbody.innerHTML = '';
        
        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.email}</td>
                <td>${record.position}</td>
                <td>${record.department}</td>
                <td>${record.ministry}</td>
                <td>${record.grade}</td>
                <td>${record.approvalDate || '2024-01-16'}</td>
                <td>
                    <button class="btn btn-info btn-sm view-attendee-btn" data-email="${record.email}">
                        View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Approve Bulk Upload
    function approveBulkUpload(uploadId, action, remarks = '') {
        // API call to approve bulk upload
        console.log(`Approving upload ${uploadId} with action: ${action}`);
        
        // Simulate API call
        setTimeout(() => {
            showToast(`Bulk upload approved successfully!`, 'success');
            
            // Update local data
            const upload = bulkUploadsData.find(u => u.id === uploadId);
            if (upload) {
                upload.status = 'approved';
                upload.approvedBy = 'Super Admin';
                upload.approvedDate = new Date().toLocaleString();
                upload.approvalRemarks = remarks;
            }
            
            // Update table
            populateBulkTable();
            
            // Close modal
            reviewBulkModal.style.display = 'none';
        }, 1500);
    }
    
    // Reject Bulk Upload
    function rejectBulkUpload(uploadId, remarks = '') {
        // API call to reject bulk upload
        console.log(`Rejecting upload ${uploadId}`);
        
        // Simulate API call
        setTimeout(() => {
            showToast(`Bulk upload rejected!`, 'warning');
            
            // Update local data
            const upload = bulkUploadsData.find(u => u.id === uploadId);
            if (upload) {
                upload.status = 'rejected';
                upload.rejectedBy = 'Super Admin';
                upload.rejectedDate = new Date().toLocaleString();
                upload.rejectionRemarks = remarks;
            }
            
            // Update table
            populateBulkTable();
            
            // Close modal
            reviewBulkModal.style.display = 'none';
        }, 1500);
    }
    
    // Export Approved Records
    function exportApprovedRecords(uploadId, format) {
        const upload = bulkUploadsData.find(u => u.id === uploadId);
        if (!upload) return;
        
        // Create export data
        const exportData = upload.records.map(record => ({
            'Full Name': record.name,
            'Email': record.email,
            'Position': record.position,
            'Department': record.department,
            'Ministry': record.ministry,
            'Grade Level': record.grade,
            'Approval Date': record.approvalDate || '2024-01-16'
        }));
        
        // Export based on format
        switch(format) {
            case 'excel':
                exportToExcel(exportData, `Bulk_Upload_${uploadId}_Approved`);
                break;
            case 'csv':
                exportToCSV(exportData, `Bulk_Upload_${uploadId}_Approved`);
                break;
            case 'pdf':
                exportToPDF(exportData, `Bulk_Upload_${uploadId}_Approved`);
                break;
        }
        
        showToast(`Exporting ${exportData.length} records as ${format.toUpperCase()}`, 'info');
    }
    
    // Show Reject Confirmation
    function showRejectConfirmation(uploadId, ministry) {
        if (confirm(`Are you sure you want to reject the bulk upload from ${ministry}?\n\nThis will reject ALL records in this upload.`)) {
            rejectBulkUpload(uploadId, 'Rejected via quick reject button');
        }
    }
    
    // Filter and Search Functions
    function setupFilters() {
        // Search functionality
        searchBulkInput?.addEventListener('input', function() {
            filterBulkTable();
        });
        
        // Filter functionality
        filterBulkStatus?.addEventListener('change', filterBulkTable);
        filterBulkMinistry?.addEventListener('change', filterBulkTable);
        
        // Clear filters
        clearBulkFiltersBtn?.addEventListener('click', function() {
            searchBulkInput.value = '';
            filterBulkStatus.value = '';
            filterBulkMinistry.value = '';
            filterBulkTable();
        });
        
        // Refresh button
        refreshBulkBtn?.addEventListener('click', function() {
            // Simulate API refresh
            showToast('Refreshing bulk approvals...', 'info');
            setTimeout(() => {
                populateBulkTable();
                showToast('Bulk approvals refreshed successfully!', 'success');
            }, 1000);
        });
    }
    
    // Filter Bulk Table
    function filterBulkTable() {
        const searchTerm = searchBulkInput?.value.toLowerCase() || '';
        const statusFilter = filterBulkStatus?.value || '';
        const ministryFilter = filterBulkMinistry?.value || '';
        
        const rows = bulkApprovalsTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const ministry = row.cells[1].textContent.toLowerCase();
            const status = row.cells[8].textContent.toLowerCase();
            const filename = row.cells[2].textContent.toLowerCase();
            const uploadId = row.cells[0].textContent.toLowerCase();
            
            const matchesSearch = !searchTerm || 
                ministry.includes(searchTerm) ||
                filename.includes(searchTerm) ||
                uploadId.includes(searchTerm);
            
            const matchesStatus = !statusFilter || 
                (statusFilter === 'pending' && status.includes('pending')) ||
                (statusFilter === 'approved' && status.includes('approved')) ||
                (statusFilter === 'rejected' && status.includes('rejected')) ||
                (statusFilter === 'partially_approved' && status.includes('partially'));
            
            const matchesMinistry = !ministryFilter || 
                ministry === ministryFilter.toLowerCase();
            
            row.style.display = (matchesSearch && matchesStatus && matchesMinistry) ? '' : 'none';
        });
    }
    
    // Helper Functions for Export
    function exportToExcel(data, filename) {
        // Implementation for Excel export using SheetJS
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Approved Records");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }
    
    function exportToCSV(data, filename) {
        const headers = Object.keys(data[0] || {});
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ];
        
        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    function exportToPDF(data, filename) {
        // Simple PDF export implementation
        showToast('PDF export would be implemented with a PDF library', 'info');
    }
    
    // Show Toast Notification
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Initialize when DOM is loaded
    initBulkApprovalsTable();
    setupFilters();
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === reviewBulkModal) {
            reviewBulkModal.style.display = 'none';
        }
        if (e.target === viewApprovedBulkModal) {
            viewApprovedBulkModal.style.display = 'none';
        }
    });
});

// Partnership Package Management
let partnershipPackages = {
    diamond: {
        maxRegistrants: 10,
        currentRegistrants: 0,
        actionOnFull: "hide",
        investment: 5000000,
        features: [],
        description: "",
        isAvailable: true,
        gracePeriod: 48,
        autoReopen: false
    },
    gold: {
        maxRegistrants: 20,
        currentRegistrants: 0,
        actionOnFull: "hide",
        investment: 3000000,
        features: [],
        description: "",
        isAvailable: true,
        gracePeriod: 48,
        autoReopen: false
    },
    silver: {
        maxRegistrants: 30,
        currentRegistrants: 0,
        actionOnFull: "hide",
        investment: 1500000,
        features: [],
        description: "",
        isAvailable: true,
        gracePeriod: 48,
        autoReopen: false
    },
    bronze: {
        maxRegistrants: 50,
        currentRegistrants: 0,
        actionOnFull: "hide",
        investment: 500000,
        features: [],
        description: "",
        isAvailable: true,
        gracePeriod: 48,
        autoReopen: false
    }
};


// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initializePackageManagement();
});

function initializePackageManagement() {
    loadPackageConfigurations();
    initializeBenefitsTabs();
    setupPackageEventListeners();
    updatePackageStatistics();
}

// Load / Save
function loadPackageConfigurations() {
    try {
        const saved = localStorage.getItem("partnershipPackages");
        if (!saved) return;

        let parsed = JSON.parse(saved);

        if (typeof parsed === "object" && parsed !== null) {
            partnershipPackages = parsed;
        }

        updatePackageUI();
    } catch (e) {
        console.error("Invalid saved configuration. Resetting.", e);
        localStorage.removeItem("partnershipPackages");
    }
}

function savePackageConfigurations() {
    try {
        localStorage.setItem("partnershipPackages", JSON.stringify(partnershipPackages));
        updatePartnerDashboards();
        showSuccessMessage("Package configurations saved successfully!");
    } catch (e) {
        console.error("Error saving package configurations:", e);
        alert("Error saving configurations.");
    }
}

// UI sync
function updatePackageUI() {
    for (const packageName in partnershipPackages) {
        const pkg = partnershipPackages[packageName];

        setValue(`${packageName}MaxRegistrants`, pkg.maxRegistrants);
        setValue(`${packageName}CurrentCount`, pkg.currentRegistrants);
        setValue(`${packageName}Action`, pkg.actionOnFull);
        setValue(`${packageName}Investment`, pkg.investment);
        setValue(`${packageName}Description`, pkg.description);

        const featureBox = document.getElementById(`${packageName}Features`);
        if (featureBox) featureBox.value = pkg.features.join("\n");
    }

    updatePackageStatistics();
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function updatePackageStatistics() {
    fetchCurrentPartnerCounts().then((counts) => {
        for (const packageName in partnershipPackages) {
            partnershipPackages[packageName].currentRegistrants =
                counts[packageName] || 0;
        }
        updatePackageDisplay();
    });
}

function updatePackageDisplay() {
    for (const packageName in partnershipPackages) {
        const pkg = partnershipPackages[packageName];

        setText(`${packageName}Utilization`, `${pkg.currentRegistrants}/${pkg.maxRegistrants}`);

        const percentage =
            pkg.maxRegistrants > 0
                ? Math.round((pkg.currentRegistrants / pkg.maxRegistrants) * 100)
                : 0;

        setText(`${packageName}Percentage`, `${percentage}%`);

        const statusEl = document.getElementById(`${packageName}Status`);
        if (statusEl) {
            if (pkg.currentRegistrants >= pkg.maxRegistrants) {
                statusEl.textContent = "Full";
                statusEl.className = "package-status status-full";
                handleFullPackage(packageName);
            } else if (!pkg.isAvailable) {
                statusEl.textContent = "Closed";
                statusEl.className = "package-status status-closed";
            } else {
                statusEl.textContent = "Available";
                statusEl.className = "package-status status-available";
            }
        }
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Full package handling
function handleFullPackage(packageName) {
    const action = partnershipPackages[packageName].actionOnFull;

    switch (action) {
        case "hide":
            console.log(`Hiding ${packageName}`);
            break;
        case "disable":
            console.log(`Disabling ${packageName}`);
            break;
        case "show_message":
            console.log(`Showing full message for ${packageName}`);
            break;
        case "waitlist":
            console.log(`Enabling waitlist for ${packageName}`);
            break;
    }
}

// Adjust capacity
function adjustCapacity(packageName, delta) {
    const input = document.getElementById(`${packageName}MaxRegistrants`);
    if (!input) return;

    let newValue = Math.max(0, parseInt(input.value) + delta);
    input.value = newValue;

    partnershipPackages[packageName].maxRegistrants = newValue;
    updatePackageDisplay();
}

// Tabs
function initializeBenefitsTabs() {
    const tabButtons = document.querySelectorAll(".benefits-tab-btn");
    const panes = document.querySelectorAll(".benefits-tab-pane");

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            const packageName = button.dataset.package;
            panes.forEach((pane) => (pane.style.display = "none"));

            const pane = document.getElementById(`${packageName}Benefits`);
            if (pane) pane.style.display = "block";
        });
    });
}

// Event Listeners
function setupPackageEventListeners() {
    const form = document.getElementById("packageConfigForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            savePackageConfigurations();
        });
    }

    bindClick("refreshPackageStatsBtn", () => {
        updatePackageStatistics();
        showSuccessMessage("Stats refreshed!");
    });

    bindClick("resetPackageDefaultsBtn", () => {
        if (confirm("Reset all packages to default?")) resetPackageDefaults();
    });

    setupPackageChangeMonitoring();
}

function bindClick(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
}

// Save config
function saveAllPackageConfiguration() {
    for (const packageName in partnershipPackages) {
        const pkg = partnershipPackages[packageName];

        pkg.maxRegistrants = getInt(`${packageName}MaxRegistrants`);
        pkg.actionOnFull = getValue(`${packageName}Action`);
        pkg.investment = getInt(`${packageName}Investment`);
        pkg.description = getValue(`${packageName}Description`);

        const featuresBox = document.getElementById(`${packageName}Features`);
        if (featuresBox) {
            pkg.features = featuresBox.value
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean);
        }

        pkg.gracePeriod = getInt("paymentGracePeriod") || pkg.gracePeriod;
        pkg.autoReopen = getValue("autoReopenEnabled") === "yes";
    }

    savePackageConfigurations();
    updatePackageDisplay();
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function getInt(id) {
    return parseInt(getValue(id)) || 0;
}

// Defaults
function resetPackageDefaults() {
    partnershipPackages = JSON.parse(JSON.stringify(defaultPackageStructure()));
    updatePackageUI();
    savePackageConfigurations();
    showSuccessMessage("Defaults restored!");
}

function defaultPackageStructure() {
    return {
        diamond: {
            maxRegistrants: 10,
            currentRegistrants: 0,
            actionOnFull: "hide",
            investment: 5000000,
            features: [
                "Prime booth location (6x9m)",
                "10 conference passes",
                "Keynote speaking slot",
                "Company logo on all promotional materials",
                "VIP dinner",
                "Dedicated event staff",
                "Social media promotion",
                "Full-page brochure ad"
            ],
            description:
                "Premium partnership with maximum visibility.",
            isAvailable: true,
            gracePeriod: 48,
            autoReopen: false
        },
        gold: {
            maxRegistrants: 20,
            currentRegistrants: 0,
            actionOnFull: "hide",
            investment: 3000000,
            features: [
                "Standard booth (6x6m)",
                "6 passes",
                "Panel discussion",
                "Logo on website",
                "Networking reception",
                "Half-page brochure ad"
            ],
            description: "Strong visibility and networking opportunities.",
            isAvailable: true,
            gracePeriod: 48,
            autoReopen: false
        },
        silver: {
            maxRegistrants: 30,
            currentRegistrants: 0,
            actionOnFull: "hide",
            investment: 1500000,
            features: [
                "Booth (3x6m)",
                "4 passes",
                "Roundtable participation",
                "Logo in event program",
                "Website listing"
            ],
            description: "Good visibility and engagement.",
            isAvailable: true,
            gracePeriod: 48,
            autoReopen: false
        },
        bronze: {
            maxRegistrants: 50,
            currentRegistrants: 0,
            actionOnFull: "hide",
            investment: 500000,
            features: [
                "Exhibition space (3x3m)",
                "2 passes",
                "Website listing",
                "Basic promo materials"
            ],
            description: "Entry-level partnership tier.",
            isAvailable: true,
            gracePeriod: 48,
            autoReopen: false
        }
    };
}

// Monitoring
function setupPackageChangeMonitoring() {
    setInterval(() => updatePackageStatistics(), 30000);

    document.addEventListener("partnerApplicationSubmitted", (e) => {
        const { packageName } = e.detail;
        if (partnershipPackages[packageName]) {
            partnershipPackages[packageName].currentRegistrants++;
            updatePackageDisplay();
            savePackageConfigurations();
        }
    });

    document.addEventListener("paymentFailed", (e) => {
        const { packageName } = e.detail;
        if (partnershipPackages[packageName]?.autoReopen) {
            partnershipPackages[packageName].currentRegistrants--;
            updatePackageDisplay();
            savePackageConfigurations();
            showSuccessMessage(`${packageName} reopened due to failed payment`);
        }
    });
}

// Fake fetch
async function fetchCurrentPartnerCounts() {
    try {
        const response = await fetch("/api/partners/counts-by-package");
        if (response.ok) return await response.json();
        throw new Error("API failed");
    } catch (error) {
        console.warn("Using fallback partner counts");
        return { diamond: 0, gold: 0, silver: 0, bronze: 0 };
    }
}

// Toast
function showSuccessMessage(message) {
    const modal = document.getElementById("packageSuccessModal");
    const msgEl = document.getElementById("packageSuccessMessage");

    if (!modal || !msgEl) {
        console.warn("Package success modal not found, using alert fallback");
        alert(message);
        return;
    }

    msgEl.textContent = message;
    modal.style.display = "flex";

    // Auto-hide after 3 seconds
    setTimeout(() => {
        modal.style.display = "none";
    }, 3000);
    
    // Add click to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    }, { once: true }); // Use once so we don't add multiple listeners
}
// Report System Functionality with Chart.js
document.addEventListener('DOMContentLoaded', function() {
    // Chart instances storage
    const charts = {};
    
    // Initialize event dates (2-day event)
    const eventStartDate = '2026-06-01';
    const eventEndDate = '2026-06-02';
    
    // Set default date range to event dates
    document.getElementById('reportStartDate').value = eventStartDate;
    document.getElementById('reportEndDate').value = eventEndDate;
    
    // Report Type Switching
    const reportTypeCards = document.querySelectorAll('.report-type-card');
    const reportSections = document.querySelectorAll('.report-section');
    
    reportTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            const reportType = this.getAttribute('data-report');
            
            // Remove active class from all cards
            reportTypeCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
            
            // Hide all report sections
            reportSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Show selected report section
            const targetSection = document.getElementById(`${reportType}Report`);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
                
                // Update report data for selected section
                updateReportData(reportType);
            }
        });
    });
    
    // Quick Date Range Selection
    const quickDateRange = document.getElementById('quickDateRange');
    const startDateInput = document.getElementById('reportStartDate');
    const endDateInput = document.getElementById('reportEndDate');
    
    quickDateRange.addEventListener('change', function() {
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();
        
        switch(this.value) {
            case 'all':
                // For 2-day event, show both days
                startDate = new Date(eventStartDate);
                endDate = new Date(eventEndDate);
                break;
            case 'today':
                // If today is within event dates
                const eventDate1 = new Date(eventStartDate);
                const eventDate2 = new Date(eventEndDate);
                const todayStr = today.toISOString().split('T')[0];
                
                if (todayStr === eventStartDate) {
                    startDate = eventDate1;
                    endDate = eventDate1;
                } else if (todayStr === eventEndDate) {
                    startDate = eventDate2;
                    endDate = eventDate2;
                } else {
                    // Default to event dates if today is not event day
                    startDate = eventDate1;
                    endDate = eventDate2;
                }
                break;
            case 'yesterday':
                // For demo, show first day if "yesterday"
                startDate = new Date(eventStartDate);
                endDate = new Date(eventStartDate);
                break;
            case 'week':
            case 'month':
            case 'quarter':
                // For 2-day event, these all show the full event
                startDate = new Date(eventStartDate);
                endDate = new Date(eventEndDate);
                break;
            case 'year':
                startDate = new Date('2026-01-01');
                endDate = new Date('2026-12-31');
                break;
            case 'last_year':
                startDate = new Date('2025-01-01');
                endDate = new Date('2025-12-31');
                break;
            case 'custom':
                // Allow custom selection but validate within event dates
                startDateInput.disabled = false;
                endDateInput.disabled = false;
                return;
        }
        
        // Format dates as YYYY-MM-DD
        startDateInput.value = startDate.toISOString().split('T')[0];
        endDateInput.value = endDate.toISOString().split('T')[0];
        
        // Update all reports with new date range
        const activeReport = document.querySelector('.report-type-card.active').getAttribute('data-report');
        updateReportData(activeReport);
    });
    
    // Date Input Validation for 2-day event
    startDateInput.addEventListener('change', validateDateRange);
    endDateInput.addEventListener('change', validateDateRange);
    
    function validateDateRange() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        const eventStart = new Date(eventStartDate);
        const eventEnd = new Date(eventEndDate);
        
        // Ensure dates are within event range
        if (startDate < eventStart) {
            startDateInput.value = eventStartDate;
        }
        if (endDate > eventEnd) {
            endDateInput.value = eventEndDate;
        }
        if (startDate > eventEnd) {
            startDateInput.value = eventStartDate;
        }
        if (endDate < eventStart) {
            endDateInput.value = eventEndDate;
        }
        
        // Update quick select to custom
        quickDateRange.value = 'custom';
        
        // Update reports
        const activeReport = document.querySelector('.report-type-card.active').getAttribute('data-report');
        updateReportData(activeReport);
    }
    
    // Initialize date validation
    validateDateRange();
    
    // Export Functionality
    document.getElementById('exportPDFBtn').addEventListener('click', () => exportReport('pdf'));
    document.getElementById('exportExcelBtn').addEventListener('click', () => exportReport('excel'));
    document.getElementById('exportCSVBtn').addEventListener('click', () => exportReport('csv'));
    document.getElementById('exportChartBtn').addEventListener('click', exportCharts);
    document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvas);
    document.getElementById('generateCustomBtn').addEventListener('click', generateCustomReport);
    document.getElementById('saveTemplateBtn').addEventListener('click', saveTemplate);
    
    // Multi-select filters
    initializeMultiSelectFilters();
    
    // Initialize drag and drop for custom report builder
    initializeDragAndDrop();
    
    // Initialize sample data
    initializeSampleData();
    
    // Generate initial report
    updateReportData('overview');
    
    function updateReportData(reportType) {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        console.log(`Updating ${reportType} report for dates: ${startDate} to ${endDate}`);
        
        switch(reportType) {
            case 'overview':
                updateOverviewReport();
                break;
            case 'attendees':
                updateAttendeeReport();
                break;
            case 'financial':
                updateFinancialReport();
                break;
            case 'ministry':
                updateMinistryReport();
                break;
            case 'participation':
                updateParticipationReport();
                break;
            case 'custom':
                // Custom report doesn't auto-update
                break;
        }
    }
    
    function updateOverviewReport() {
        // Sample data for 2-day event
        const data = {
            totalRegistrations: 1874,
            approvalRate: '92%',
            revenue: '₦47,850,000',
            ministryCount: 32,
            registrationTrend: {
                labels: ['Day 1 AM', 'Day 1 PM', 'Day 2 AM', 'Day 2 PM'],
                data: [450, 620, 530, 274]
            },
            ministryDistribution: {
                labels: ['Finance', 'Education', 'Health', 'Transport', 'Agriculture', 'Technology', 'Energy', 'Defense', 'Justice', 'Environment'],
                data: [210, 185, 178, 162, 150, 145, 142, 138, 135, 129]
            },
            statusDistribution: {
                labels: ['Approved', 'Pending', 'Rejected'],
                data: [1724, 100, 50]
            },
            revenueByCategory: {
                labels: ['Registration', 'Exhibition', 'Sponsorship', 'Merchandise'],
                data: [28000000, 12500000, 5000000, 2350000]
            }
        };
        
        // Update KPI values
        document.getElementById('kpiTotalReg').textContent = data.totalRegistrations.toLocaleString();
        document.getElementById('kpiApprovalRate').textContent = data.approvalRate;
        document.getElementById('kpiRevenue').textContent = data.revenue;
        document.getElementById('kpiMinistryCount').textContent = data.ministryCount;
        
        // Update progress bars (calculate based on targets)
        const progressBars = document.querySelectorAll('.key-metrics-table .progress-bar > div');
        const percentages = [
            (data.totalRegistrations / 2500 * 100).toFixed(0),
            parseFloat(data.approvalRate),
            (parseFloat(data.revenue.replace(/[^0-9]/g, '')) / 50000000 * 100).toFixed(0),
            (data.ministryCount / 35 * 100).toFixed(0)
        ];
        
        progressBars.forEach((bar, index) => {
            const percent = Math.min(percentages[index], 100);
            bar.style.width = `${percent}%`;
            bar.previousElementSibling.textContent = `${percent}%`;
        });
        
        // Initialize/Update charts
        createOrUpdateChart('registrationTrendChart', {
            type: 'line',
            data: {
                labels: data.registrationTrend.labels,
                datasets: [{
                    label: 'Registrations',
                    data: data.registrationTrend.data,
                    borderColor: '#008751',
                    backgroundColor: 'rgba(0, 135, 81, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
        
        createOrUpdateChart('ministryDistributionChart', {
            type: 'bar',
            data: {
                labels: data.ministryDistribution.labels,
                datasets: [{
                    label: 'Attendees',
                    data: data.ministryDistribution.data,
                    backgroundColor: [
                        '#008751', '#00c974', '#27ae60', '#f39c12', '#e74c3c',
                        '#3498db', '#9b59b6', '#34495e', '#1abc9c', '#d35400'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        createOrUpdateChart('statusDistributionChart', {
            type: 'doughnut',
            data: {
                labels: data.statusDistribution.labels,
                datasets: [{
                    data: data.statusDistribution.data,
                    backgroundColor: [
                        '#27ae60', // Approved - green
                        '#f39c12', // Pending - orange
                        '#e74c3c'  // Rejected - red
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        createOrUpdateChart('revenueCategoryChart', {
            type: 'pie',
            data: {
                labels: data.revenueByCategory.labels,
                datasets: [{
                    data: data.revenueByCategory.data,
                    backgroundColor: [
                        '#008751', // Registration
                        '#00c974', // Exhibition
                        '#27ae60', // Sponsorship
                        '#f39c12'  // Merchandise
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    function updateAttendeeReport() {
        // Sample attendee data for 2-day event
        const ministries = [
            { name: 'Ministry of Finance', total: 210, approved: 195, pending: 10, rejected: 5, grades: [15, 25, 30, 40, 50, 50] },
            { name: 'Ministry of Education', total: 185, approved: 175, pending: 8, rejected: 2, grades: [12, 22, 28, 35, 45, 43] },
            { name: 'Ministry of Health', total: 178, approved: 165, pending: 10, rejected: 3, grades: [10, 20, 25, 38, 42, 43] },
            { name: 'Ministry of Transport', total: 162, approved: 150, pending: 9, rejected: 3, grades: [8, 18, 22, 35, 40, 39] },
            { name: 'Ministry of Agriculture', total: 150, approved: 140, pending: 7, rejected: 3, grades: [7, 15, 20, 32, 38, 38] }
        ];
        
        // Populate ministry filter
        const ministryFilter = document.getElementById('attendeeMinistryFilter');
        if (ministryFilter.children.length <= 1) { // Only has "All Ministries" option
            ministries.forEach(ministry => {
                const option = document.createElement('option');
                option.value = ministry.name;
                option.textContent = ministry.name;
                ministryFilter.appendChild(option);
            });
        }
        
        // Update detailed stats table
        const tbody = document.getElementById('attendeeDetailedStats');
        tbody.innerHTML = '';
        
        ministries.forEach(ministry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ministry.name}</td>
                <td>${ministry.total}</td>
                <td>${ministry.approved}</td>
                <td>${ministry.pending}</td>
                <td>${ministry.rejected}</td>
                <td>${ministry.grades[0]}</td>
                <td>${ministry.grades[1]}</td>
                <td>${ministry.grades[2]}</td>
                <td>${ministry.grades[3]}</td>
                <td>${ministry.grades[4]}</td>
                <td>${ministry.grades[5]}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.total, 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.approved, 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.pending, 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.rejected, 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.grades[0], 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.grades[1], 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.grades[2], 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.grades[3], 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.grades[4], 0)}</strong></td>
            <td><strong>${ministries.reduce((sum, m) => sum + m.grades[5], 0)}</strong></td>
        `;
        tbody.appendChild(totalRow);
        
        // Create attendee distribution chart
        const gradeLabels = ['Directors', 'Deputy Directors', 'Assistant Directors', 'Chief Officers', 'Senior Officers', 'Officers'];
        const ministryLabels = ministries.map(m => m.name);
        
        const gradeData = [];
        gradeLabels.forEach((grade, gradeIndex) => {
            gradeData.push(ministries.map(m => m.grades[gradeIndex]));
        });
        
        createOrUpdateChart('attendeeDistributionChart', {
            type: 'bar',
            data: {
                labels: ministryLabels,
                datasets: gradeLabels.map((label, index) => ({
                    label: label,
                    data: gradeData[index],
                    backgroundColor: [
                        '#008751', '#00c974', '#27ae60', '#f39c12', '#e74c3c', '#3498db'
                    ][index],
                    borderWidth: 1
                }))
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }
    
    function updateFinancialReport() {
        // Sample financial data for 2-day event
        const financialData = {
            totalRevenue: '₦47,850,000',
            boothRevenue: '₦12,500,000',
            partnerRevenue: '₦5,000,000',
            speakerRevenue: '₦2,800,000',
            monthlyTrend: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [5000000, 8500000, 12500000, 18500000, 28500000, 47850000]
            },
            categories: [
                { name: 'Registration', total: 28000000, paid: 25000000, pending: 2500000, overdue: 500000, rate: '89%', avg: '₦175,000' },
                { name: 'Exhibition', total: 12500000, paid: 11000000, pending: 1000000, overdue: 500000, rate: '88%', avg: '₦2,500,000' },
                { name: 'Sponsorship', total: 5000000, paid: 4500000, pending: 500000, overdue: 0, rate: '90%', avg: '₦1,250,000' },
                { name: 'Merchandise', total: 2350000, paid: 2000000, pending: 350000, overdue: 0, rate: '85%', avg: '₦25,000' }
            ]
        };
        
        // Update financial cards
        document.getElementById('financialTotalRevenue').textContent = financialData.totalRevenue;
        document.getElementById('financialBoothRevenue').textContent = financialData.boothRevenue;
        document.getElementById('financialPartnerRevenue').textContent = financialData.partnerRevenue;
        document.getElementById('financialSpeakerRevenue').textContent = financialData.speakerRevenue;
        
        // Update revenue details table
        const tbody = document.getElementById('revenueDetailsTable');
        tbody.innerHTML = '';
        
        financialData.categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.name}</td>
                <td>₦${category.total.toLocaleString()}</td>
                <td>₦${category.paid.toLocaleString()}</td>
                <td>₦${category.pending.toLocaleString()}</td>
                <td>₦${category.overdue.toLocaleString()}</td>
                <td>${category.rate}</td>
                <td>${category.avg}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Create revenue trend chart
        createOrUpdateChart('revenueTrendChart', {
            type: 'line',
            data: {
                labels: financialData.monthlyTrend.labels,
                datasets: [{
                    label: 'Revenue (₦)',
                    data: financialData.monthlyTrend.data,
                    borderColor: '#008751',
                    backgroundColor: 'rgba(0, 135, 81, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₦' + (value / 1000000).toFixed(1) + 'M';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
        
        // Create payment status chart
        const paymentStatusData = {
            paid: financialData.categories.reduce((sum, cat) => sum + cat.paid, 0),
            pending: financialData.categories.reduce((sum, cat) => sum + cat.pending, 0),
            overdue: financialData.categories.reduce((sum, cat) => sum + cat.overdue, 0)
        };
        
        createOrUpdateChart('paymentStatusChart', {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue'],
                datasets: [{
                    data: [paymentStatusData.paid, paymentStatusData.pending, paymentStatusData.overdue],
                    backgroundColor: [
                        '#27ae60', // Paid - green
                        '#f39c12', // Pending - orange
                        '#e74c3c'  // Overdue - red
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    function updateMinistryReport() {
        // Sample ministry data
        const ministries = [
            { name: 'Ministry of Finance', code: 'MOF', registrations: 210, approvalRate: '93%', completionRate: '98%', processingTime: '2.1h', lastUpdated: '2026-06-02', score: 95 },
            { name: 'Ministry of Education', code: 'MOE', registrations: 185, approvalRate: '95%', completionRate: '96%', processingTime: '1.8h', lastUpdated: '2026-06-02', score: 93 },
            { name: 'Ministry of Health', code: 'MOH', registrations: 178, approvalRate: '93%', completionRate: '95%', processingTime: '2.3h', lastUpdated: '2026-06-01', score: 91 },
            { name: 'Ministry of Transport', code: 'MOT', registrations: 162, approvalRate: '93%', completionRate: '94%', processingTime: '2.5h', lastUpdated: '2026-06-01', score: 89 },
            { name: 'Ministry of Agriculture', code: 'MOA', registrations: 150, approvalRate: '93%', completionRate: '93%', processingTime: '2.8h', lastUpdated: '2026-06-01', score: 87 }
        ];
        
        // Update ranking list
        const rankingList = document.getElementById('ministryRankingList');
        rankingList.innerHTML = '';
        
        ministries.forEach((ministry, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'ranking-item';
            rankItem.innerHTML = `
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${ministry.name}</div>
                    <div class="ranking-stats">
                        <span class="ranking-stat"><strong>${ministry.registrations}</strong> registrations</span>
                        <span class="ranking-stat"><strong>${ministry.approvalRate}</strong> approval rate</span>
                        <span class="ranking-stat"><strong>${ministry.score}/100</strong> score</span>
                    </div>
                </div>
            `;
            rankingList.appendChild(rankItem);
        });
        
        // Update performance table
        const tbody = document.getElementById('ministryPerformanceTable');
        tbody.innerHTML = '';
        
        ministries.forEach(ministry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ministry.name}</td>
                <td>${ministry.code}</td>
                <td>${ministry.registrations}</td>
                <td>${ministry.approvalRate}</td>
                <td>${ministry.completionRate}</td>
                <td>${ministry.processingTime}</td>
                <td>${ministry.lastUpdated}</td>
                <td>
                    <div class="progress-bar" style="width: 100px; margin: 0 auto;">
                        <div style="width: ${ministry.score}%"></div>
                        <span>${ministry.score}%</span>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Create ministry timeline chart
        const timelineData = {
            labels: ['Day 1 AM', 'Day 1 PM', 'Day 2 AM', 'Day 2 PM'],
            datasets: ministries.map((ministry, index) => ({
                label: ministry.name,
                data: [
                    Math.floor(ministry.registrations * 0.2), // Day 1 AM
                    Math.floor(ministry.registrations * 0.35), // Day 1 PM
                    Math.floor(ministry.registrations * 0.3), // Day 2 AM
                    Math.floor(ministry.registrations * 0.15)  // Day 2 PM
                ],
                borderColor: [
                    '#008751', '#00c974', '#27ae60', '#f39c12', '#e74c3c'
                ][index % 5],
                backgroundColor: 'rgba(0, 135, 81, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }))
        };
        
        createOrUpdateChart('ministryTimelineChart', {
            type: 'line',
            data: timelineData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }
    
    function updateParticipationReport() {
        // Sample participation data
        const data = {
            totalSpeakers: 45,
            totalExhibitors: 28,
            totalPartners: 15,
            topPackage: 'Platinum',
            packageDistribution: {
                labels: ['Platinum', 'Gold', 'Silver', 'Bronze'],
                data: [15, 20, 7, 3]
            },
            exhibitorStatus: {
                labels: ['Confirmed', 'Pending', 'Cancelled'],
                data: [22, 4, 2]
            },
            details: [
                { category: 'Speakers', confirmed: 40, pending: 5, rejected: 0, paid: 38, paymentPending: 2, totalValue: '₦28,500,000', avgValue: '₦712,500' },
                { category: 'Exhibitors', confirmed: 22, pending: 4, rejected: 2, paid: 20, paymentPending: 2, totalValue: '₦12,500,000', avgValue: '₦568,182' },
                { category: 'Partners', confirmed: 12, pending: 3, rejected: 0, paid: 10, paymentPending: 2, totalValue: '₦5,000,000', avgValue: '₦416,667' }
            ]
        };
        
        // Update stats cards
        document.getElementById('totalSpeakersCount').textContent = data.totalSpeakers;
        document.getElementById('totalExhibitorsCount').textContent = data.totalExhibitors;
        document.getElementById('totalPartnersCount').textContent = data.totalPartners;
        document.getElementById('topSpeakerPackage').textContent = data.topPackage;
        
        // Update details table
        const tbody = document.getElementById('participationDetailsTable');
        tbody.innerHTML = '';
        
        data.details.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.category}</td>
                <td>${item.confirmed}</td>
                <td>${item.pending}</td>
                <td>${item.rejected}</td>
                <td>${item.paid}</td>
                <td>${item.paymentPending}</td>
                <td>${item.totalValue}</td>
                <td>${item.avgValue}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Create speaker package chart
        createOrUpdateChart('speakerPackageChart', {
            type: 'bar',
            data: {
                labels: data.packageDistribution.labels,
                datasets: [{
                    label: 'Speakers',
                    data: data.packageDistribution.data,
                    backgroundColor: [
                        '#008751', // Platinum
                        '#00c974', // Gold
                        '#27ae60', // Silver
                        '#f39c12'  // Bronze
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Create exhibitor status chart
        createOrUpdateChart('exhibitorStatusChart', {
            type: 'doughnut',
            data: {
                labels: data.exhibitorStatus.labels,
                datasets: [{
                    data: data.exhibitorStatus.data,
                    backgroundColor: [
                        '#27ae60', // Confirmed - green
                        '#f39c12', // Pending - orange
                        '#e74c3c'  // Cancelled - red
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Chart utility function
    function createOrUpdateChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Destroy existing chart if it exists
        if (charts[canvasId]) {
            charts[canvasId].destroy();
        }
        
        // Create new chart
        charts[canvasId] = new Chart(canvas, config);
    }
    
    function initializeMultiSelectFilters() {
        // Convert select elements to multi-select with checkboxes
        const multiSelects = document.querySelectorAll('select[multiple]');
        
        multiSelects.forEach(select => {
            // Store original select
            const originalSelect = select;
            
            // Create container for custom multi-select
            const container = document.createElement('div');
            container.className = 'multi-select-container';
            
            // Create selected items display
            const selectedDisplay = document.createElement('div');
            selectedDisplay.className = 'multi-select-display';
            selectedDisplay.textContent = 'Select options...';
            selectedDisplay.addEventListener('click', () => {
                optionsList.style.display = optionsList.style.display === 'block' ? 'none' : 'block';
            });
            
            // Create options list
            const optionsList = document.createElement('div');
            optionsList.className = 'multi-select-options';
            optionsList.style.display = 'none';
            
            // Populate options
            Array.from(originalSelect.options).forEach(option => {
                if (option.value) {
                    const optionItem = document.createElement('div');
                    optionItem.className = 'multi-select-option';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = option.value;
                    checkbox.id = `${originalSelect.id}_${option.value}`;
                    
                    const label = document.createElement('label');
                    label.htmlFor = checkbox.id;
                    label.textContent = option.text;
                    
                    optionItem.appendChild(checkbox);
                    optionItem.appendChild(label);
                    optionsList.appendChild(optionItem);
                    
                    // Handle checkbox change
                    checkbox.addEventListener('change', () => {
                        updateSelectedDisplay(selectedDisplay, Array.from(optionsList.querySelectorAll('input:checked')));
                    });
                }
            });
            
            container.appendChild(selectedDisplay);
            container.appendChild(optionsList);
            
            // Replace original select with custom container
            originalSelect.style.display = 'none';
            originalSelect.parentNode.insertBefore(container, originalSelect.nextSibling);
            
            // Close options when clicking outside
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    optionsList.style.display = 'none';
                }
            });
        });
        
        function updateSelectedDisplay(display, selectedCheckboxes) {
            if (selectedCheckboxes.length === 0) {
                display.textContent = 'Select options...';
            } else if (selectedCheckboxes.length === 1) {
                display.textContent = selectedCheckboxes[0].nextElementSibling.textContent;
            } else {
                display.textContent = `${selectedCheckboxes.length} options selected`;
            }
        }
    }
    
    function initializeDragAndDrop() {
        const componentItems = document.querySelectorAll('.component-item');
        const canvas = document.getElementById('reportCanvas');
        const canvasPlaceholder = canvas.querySelector('.canvas-placeholder');
        
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('component', item.getAttribute('data-component'));
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });
        
        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });
        
        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            
            const componentType = e.dataTransfer.getData('component');
            if (componentType) {
                addComponentToCanvas(componentType);
                
                // Hide placeholder if first component added
                if (canvasPlaceholder.style.display !== 'none') {
                    canvasPlaceholder.style.display = 'none';
                }
            }
        });
        
        function addComponentToCanvas(type) {
            const component = document.createElement('div');
            component.className = 'report-component';
            component.draggable = true;
            
            let content = '';
            switch(type) {
                case 'table':
                    content = `
                        <div class="component-header">
                            <h5>Data Table</h5>
                            <div class="component-actions">
                                <button class="btn btn-sm btn-secondary">Edit</button>
                                <button class="btn btn-sm btn-danger">Remove</button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead><tr><th>Column 1</th><th>Column 2</th></tr></thead>
                                <tbody><tr><td>Sample Data</td><td>Sample Data</td></tr></tbody>
                            </table>
                        </div>
                    `;
                    break;
                case 'chart':
                    content = `
                        <div class="component-header">
                            <h5>Chart Visualization</h5>
                            <div class="component-actions">
                                <button class="btn btn-sm btn-secondary">Edit</button>
                                <button class="btn btn-sm btn-danger">Remove</button>
                            </div>
                        </div>
                        <div style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 4px;">
                            <i class="fas fa-chart-bar" style="font-size: 3rem; color: var(--text-light);"></i>
                            <p style="margin-top: 10px; color: var(--text-medium);">Chart will be generated based on data source</p>
                        </div>
                    `;
                    break;
                case 'summary':
                    content = `
                        <div class="component-header">
                            <h5>Summary Card</h5>
                            <div class="component-actions">
                                <button class="btn btn-sm btn-secondary">Edit</button>
                                <button class="btn btn-sm btn-danger">Remove</button>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon total">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-info">
                                <h3>1,234</h3>
                                <p>Total Metric</p>
                            </div>
                        </div>
                    `;
                    break;
                case 'metrics':
                    content = `
                        <div class="component-header">
                            <h5>Metrics Grid</h5>
                            <div class="component-actions">
                                <button class="btn btn-sm btn-secondary">Edit</button>
                                <button class="btn btn-sm btn-danger">Remove</button>
                            </div>
                        </div>
                        <div class="stats-container">
                            <div class="stat-card">
                                <div class="stat-icon total">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>567</h3>
                                    <p>Attendees</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon approved">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>89%</h3>
                                    <p>Approval Rate</p>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
            }
            
            component.innerHTML = content;
            component.querySelector('.btn-danger').addEventListener('click', () => {
                component.remove();
                // Show placeholder if no components left
                if (canvas.querySelectorAll('.report-component').length === 0) {
                    canvasPlaceholder.style.display = 'block';
                }
            });
            
            canvas.appendChild(component);
        }
    }
    
    function clearCanvas() {
        const canvas = document.getElementById('reportCanvas');
        const components = canvas.querySelectorAll('.report-component');
        components.forEach(component => component.remove());
        
        // Show placeholder
        canvas.querySelector('.canvas-placeholder').style.display = 'block';
    }
    
    function generateCustomReport() {
        const dataSource = document.getElementById('customDataSource');
        const selectedSources = Array.from(dataSource.selectedOptions).map(opt => opt.value);
        
        if (selectedSources.length === 0) {
            alert('Please select at least one data source');
            return;
        }
        
        const components = document.querySelectorAll('.report-component');
        if (components.length === 0) {
            alert('Please add at least one component to the canvas');
            return;
        }
        
        // Show loading state
        const generateBtn = document.getElementById('generateCustomBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;
        
        // Simulate report generation
        setTimeout(() => {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
            
            // Show success message
            showToast('Custom report generated successfully!', 'success');
            
            // Switch to overview to show generated report
            document.querySelector('.report-type-card[data-report="overview"]').click();
        }, 2000);
    }
    
    function saveTemplate() {
        const templateName = prompt('Enter template name:');
        if (templateName) {
            showToast(`Template "${templateName}" saved successfully!`, 'success');
        }
    }
    
    function exportReport(format) {
        const fileName = document.getElementById('exportFileName').value || 'ICSC2026_Report';
        const formatType = document.getElementById('exportFormat').value;
        const includeOptions = Array.from(document.getElementById('exportInclude').selectedOptions).map(opt => opt.value);
        
        // Show loading state
        showToast(`Exporting ${format.toUpperCase()} report...`, 'info');
        
        // Simulate export process
        setTimeout(() => {
            showToast(`${fileName}.${format} downloaded successfully!`, 'success');
            
            // Add to report history
            addToReportHistory(fileName, format, formatType);
        }, 1500);
    }
    
    function exportCharts() {
        // Export all charts as images
        Object.keys(charts).forEach(chartId => {
            const chart = charts[chartId];
            if (chart) {
                const link = document.createElement('a');
                link.download = `${chartId}.png`;
                link.href = chart.toBase64Image();
                link.click();
            }
        });
        showToast('Charts exported as images!', 'success');
    }
    
    function addToReportHistory(name, format, type) {
        const historyTable = document.getElementById('reportHistoryTable');
        const now = new Date();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
            <td>Super Admin</td>
            <td>${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}</td>
            <td>${(Math.random() * 2 + 1).toFixed(1)} MB</td>
            <td>${format.toUpperCase()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm view-report-btn">View</button>
                    <button class="btn btn-success btn-sm download-report-btn">Download</button>
                    <button class="btn btn-danger btn-sm delete-report-btn">Delete</button>
                </div>
            </td>
        `;
        
        // Add event listeners to new buttons
        row.querySelector('.view-report-btn').addEventListener('click', () => {
            showToast('Opening report...', 'info');
        });
        
        row.querySelector('.download-report-btn').addEventListener('click', () => {
            showToast('Downloading report...', 'info');
        });
        
        row.querySelector('.delete-report-btn').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this report?')) {
                this.closest('tr').remove();
                showToast('Report deleted successfully!', 'success');
            }
        });
        
        historyTable.insertBefore(row, historyTable.firstChild);
    }
    
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    function initializeSampleData() {
        // Add event listeners to existing history rows
        document.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast('Opening report...', 'info');
            });
        });
        
        document.querySelectorAll('.download-report-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast('Downloading report...', 'info');
            });
        });
        
        document.querySelectorAll('.delete-report-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this report?')) {
                    this.closest('tr').remove();
                    showToast('Report deleted successfully!', 'success');
                }
            });
        });
    }
});

// Dashboard Charts Module
class DashboardCharts {
    constructor() {
        this.registrationChart = null;
        this.ministryChart = null;
        this.lastUpdateTime = null;
        this.updateInterval = null;
        
        // Sample real-time data
        this.sampleData = {
            registrationTrend: {
                today: [45, 68, 92, 120, 150, 185, 210],
                week: [450, 620, 780, 920, 1100, 1350, 1600],
                month: [1500, 1850, 2100, 2300, 2500, 2700, 2900],
                all: [1874]
            },
            ministries: [
                { name: 'Finance', attendees: 210, approvalRate: 93, color: '#008751' },
                { name: 'Education', attendees: 185, approvalRate: 95, color: '#00c974' },
                { name: 'Health', attendees: 178, approvalRate: 93, color: '#27ae60' },
                { name: 'Transport', attendees: 162, approvalRate: 93, color: '#f39c12' },
                { name: 'Agriculture', attendees: 150, approvalRate: 93, color: '#e74c3c' }
            ]
        };
    }
    
    init() {
        this.createCharts();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.updateLastUpdateTime();
    }
    
    createCharts() {
        // Registration Trend Chart
        const regCtx = document.getElementById('dashboardRegTrendChart');
        if (regCtx) {
            this.registrationChart = new Chart(regCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Registrations',
                        data: this.sampleData.registrationTrend.week,
                        borderColor: '#008751',
                        backgroundColor: 'rgba(0, 135, 81, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#008751',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleFont: { size: 12 },
                            bodyFont: { size: 12 },
                            padding: 10
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    }
                }
            });
        }
        
        // Ministry Chart
        const ministryCtx = document.getElementById('dashboardMinistryChart');
        if (ministryCtx) {
            const sortedMinistries = [...this.sampleData.ministries].sort((a, b) => b.attendees - a.attendees);
            const top5Ministries = sortedMinistries.slice(0, 5);
            
            this.ministryChart = new Chart(ministryCtx, {
                type: 'bar',
                data: {
                    labels: top5Ministries.map(m => m.name),
                    datasets: [{
                        label: 'Attendees',
                        data: top5Ministries.map(m => m.attendees),
                        backgroundColor: top5Ministries.map(m => m.color),
                        borderColor: top5Ministries.map(m => m.color),
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const ministry = top5Ministries[context.dataIndex];
                                    return [
                                        `Attendees: ${ministry.attendees}`,
                                        `Approval Rate: ${ministry.approvalRate}%`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
            
            // Update dashboard stats
            this.updateDashboardStats(sortedMinistries);
        }
    }
    
    updateDashboardStats(ministries) {
        if (ministries.length > 0) {
            document.getElementById('topMinistryName').textContent = ministries[0].name;
            document.getElementById('topMinistryCount').textContent = ministries[0].attendees;
            document.getElementById('totalMinistries').textContent = ministries.length;
            
            // Calculate registration trend
            const totalRegistrations = ministries.reduce((sum, m) => sum + m.attendees, 0);
            const prevTotal = totalRegistrations * 0.88; // Simulate previous period
            const trendPercentage = ((totalRegistrations - prevTotal) / prevTotal * 100).toFixed(1);
            
            document.getElementById('currentRegCount').textContent = totalRegistrations.toLocaleString();
            document.getElementById('regTrend').textContent = `${trendPercentage >= 0 ? '+' : ''}${trendPercentage}%`;
            document.getElementById('regTrend').className = `stat-value ${trendPercentage >= 0 ? 'positive' : 'negative'}`;
        }
    }
    
    setupEventListeners() {
        // Registration time selector
        const timeSelector = document.querySelector('.chart-time-selector');
        if (timeSelector) {
            timeSelector.addEventListener('change', (e) => {
                this.updateRegistrationChart(e.target.value);
            });
        }
        
        // Ministry chart type selector
        const typeSelector = document.querySelector('.chart-type-selector');
        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                this.updateMinistryChart(e.target.value);
            });
        }
        
        // Manual refresh button
        const refreshBtn = document.querySelector('.refresh-charts-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateChartsWithNewData();
            });
        }
    }
    
    updateRegistrationChart(timeRange) {
        if (!this.registrationChart) return;
        
        let data = this.sampleData.registrationTrend[timeRange];
        let labels = [];
        
        switch(timeRange) {
            case 'today':
                labels = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'];
                break;
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;
            case 'month':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
                data = data.slice(0, 5);
                break;
            case 'all':
                labels = ['Total'];
                break;
        }
        
        this.registrationChart.data.labels = labels;
        this.registrationChart.data.datasets[0].data = data;
        this.registrationChart.update('none');
    }
    
    updateMinistryChart(chartType) {
        if (!this.ministryChart) return;
        
        const sortedMinistries = [...this.sampleData.ministries];
        
        switch(chartType) {
            case 'attendance':
                sortedMinistries.sort((a, b) => b.attendees - a.attendees);
                this.ministryChart.data.datasets[0].label = 'Attendees';
                this.ministryChart.data.datasets[0].data = sortedMinistries.map(m => m.attendees);
                break;
            case 'approval':
                sortedMinistries.sort((a, b) => b.approvalRate - a.approvalRate);
                this.ministryChart.data.datasets[0].label = 'Approval Rate %';
                this.ministryChart.data.datasets[0].data = sortedMinistries.map(m => m.approvalRate);
                break;
            case 'completion':
                // Simulate completion rates
                sortedMinistries.forEach(m => m.completionRate = 80 + Math.random() * 15);
                sortedMinistries.sort((a, b) => b.completionRate - a.completionRate);
                this.ministryChart.data.datasets[0].label = 'Completion Rate %';
                this.ministryChart.data.datasets[0].data = sortedMinistries.map(m => m.completionRate);
                break;
        }
        
        this.ministryChart.data.labels = sortedMinistries.map(m => m.name);
        this.ministryChart.update('none');
    }
    
    startRealTimeUpdates() {
        // Update every 30 seconds for real-time effect
        this.updateInterval = setInterval(() => {
            this.updateChartsWithNewData();
        }, 30000); // 30 seconds
        
        // Also update on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateChartsWithNewData();
            }
        });
    }
    
    updateChartsWithNewData() {
        // Simulate new registrations
        const increment = Math.floor(Math.random() * 10) + 1;
        
        // Update registration data
        const lastValue = this.sampleData.registrationTrend.week[this.sampleData.registrationTrend.week.length - 1];
        this.sampleData.registrationTrend.week.push(lastValue + increment);
        this.sampleData.registrationTrend.week.shift(); // Remove first item to keep 7 items
        
        // Update ministries randomly
        this.sampleData.ministries.forEach(ministry => {
            // Small random changes
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            ministry.attendees = Math.max(0, ministry.attendees + change);
            
            // Small random approval rate changes
            const rateChange = (Math.random() * 0.5) - 0.25; // -0.25 to +0.25
            ministry.approvalRate = Math.min(100, Math.max(0, ministry.approvalRate + rateChange));
        });
        
        // Update charts
        if (this.registrationChart) {
            this.registrationChart.data.datasets[0].data = this.sampleData.registrationTrend.week;
            this.registrationChart.update('none');
        }
        
        if (this.ministryChart) {
            const sortedMinistries = [...this.sampleData.ministries].sort((a, b) => b.attendees - a.attendees);
            const top5Ministries = sortedMinistries.slice(0, 5);
            
            this.ministryChart.data.labels = top5Ministries.map(m => m.name);
            this.ministryChart.data.datasets[0].data = top5Ministries.map(m => m.attendees);
            this.ministryChart.update('none');
            
            // Update dashboard stats
            this.updateDashboardStats(sortedMinistries);
        }
        
        this.updateLastUpdateTime();
        this.showUpdateNotification();
    }
    
    updateLastUpdateTime() {
        this.lastUpdateTime = new Date();
        const timeStr = this.lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update time indicator if it exists
        const timeIndicator = document.querySelector('.last-update-time');
        if (timeIndicator) {
            timeIndicator.textContent = `Last updated: ${timeStr}`;
        }
    }
    
    showUpdateNotification() {
        // Show a subtle notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Charts updated</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out, fadeOut 2s ease-out 1s forwards;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        // Add animation styles if not already present
        if (!document.querySelector('style[data-update-animations]')) {
            const style = document.createElement('style');
            style.setAttribute('data-update-animations', 'true');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.registrationChart) {
            this.registrationChart.destroy();
        }
        
        if (this.ministryChart) {
            this.ministryChart.destroy();
        }
    }
}

// Settings Tab Charts
class SettingsCharts {
    constructor() {
        this.charts = {};
    }
    
    init() {
        this.createSettingsCharts();
    }
    
    createSettingsCharts() {
        // Create settings section charts if the container exists
        const settingsChartsContainer = document.querySelector('.settings-charts-container');
        if (settingsChartsContainer) {
            // Registration trend for settings
            const settingsRegCanvas = document.createElement('canvas');
            settingsRegCanvas.id = 'settingsRegTrendChart';
            settingsRegCanvas.height = 200;
            
            const settingsRegCard = document.createElement('div');
            settingsRegCard.className = 'settings-chart-card';
            settingsRegCard.innerHTML = '<h4><i class="fas fa-user-plus"></i> Registration Activity</h4>';
            settingsRegCard.appendChild(settingsRegCanvas);
            settingsChartsContainer.appendChild(settingsRegCard);
            
            // Ministry distribution for settings
            const settingsMinistryCanvas = document.createElement('canvas');
            settingsMinistryCanvas.id = 'settingsMinistryChart';
            settingsMinistryCanvas.height = 200;
            
            const settingsMinistryCard = document.createElement('div');
            settingsMinistryCard.className = 'settings-chart-card';
            settingsMinistryCard.innerHTML = '<h4><i class="fas fa-university"></i> Ministry Distribution</h4>';
            settingsMinistryCard.appendChild(settingsMinistryCanvas);
            settingsChartsContainer.appendChild(settingsMinistryCard);
            
            // Initialize the charts
            this.createRegistrationChart();
            this.createMinistryChart();
        }
    }
    
    createRegistrationChart() {
        const ctx = document.getElementById('settingsRegTrendChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Registrations',
                data: [150, 320, 480, 620, 850, 1100],
                borderColor: '#008751',
                backgroundColor: 'rgba(0, 135, 81, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
        
        this.charts.settingsReg = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }
    
    createMinistryChart() {
        const ctx = document.getElementById('settingsMinistryChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Finance', 'Education', 'Health', 'Transport', 'Others'],
            datasets: [{
                data: [25, 22, 18, 15, 20],
                backgroundColor: [
                    '#008751', '#00c974', '#27ae60', '#f39c12', '#3498db'
                ],
                borderWidth: 1
            }]
        };
        
        this.charts.settingsMinistry = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Initialize dashboard charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard charts
    window.dashboardCharts = new DashboardCharts();
    dashboardCharts.init();
    
    // Initialize settings charts
    window.settingsCharts = new SettingsCharts();
    settingsCharts.init();
    
    // Also initialize when settings tab is clicked
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-tab="settings"]') || 
            e.target.closest('.sidebar-menu a[href*="settings"]')) {
            // Reinitialize settings charts if needed
            setTimeout(() => {
                if (settingsCharts && !document.getElementById('settingsRegTrendChart')) {
                    settingsCharts.init();
                }
            }, 100);
        }
    });
});
// notification-attendance-system.js - Complete Implementation
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.currentFilter = 'all';
        this.initialize();
    }

    async initialize() {
        await this.loadNotifications();
        this.setupEventListeners();
        this.startPolling();
        this.updateNotificationBadge();
    }

    setupEventListeners() {
        // Notification bell click
        const bell = document.getElementById('notificationBell');
        const dropdown = document.getElementById('notificationDropdown');
        
        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
                if (dropdown.classList.contains('show')) {
                    this.loadNotifications();
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!bell?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove('show');
            }
        });

        // Mark all as read
        document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Refresh notifications
        document.getElementById('refreshNotificationsBtn')?.addEventListener('click', () => {
            this.loadNotifications();
        });

        // View all notifications
        document.getElementById('viewAllNotificationsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAllNotificationsModal();
        });
    }

    async loadNotifications() {
        try {
            const mockNotifications = await this.fetchMockNotifications();
            this.notifications = mockNotifications;
            this.unreadCount = mockNotifications.filter(n => n.status === 'pending').length;
            this.renderNotifications();
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async fetchMockNotifications() {
        return [
            {
                id: 1,
                type: 'attendee',
                userId: 101,
                userName: 'John Doe',
                userEmail: 'john.doe@finance.gov.ng',
                eventId: 'A002',
                eventTitle: 'Opening Ceremony & Keynote Address',
                eventDate: '2026-06-25',
                eventTime: '09:00',
                eventDay: 'Wednesday',
                status: 'pending',
                notificationStatus: 'unread',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                type: 'speaker',
                userId: 201,
                userName: 'Dr. Elizabeth Williams',
                userEmail: 'elizabeth@university.edu',
                eventId: 'A002',
                eventTitle: 'Opening Ceremony & Keynote Address',
                eventDate: '2026-06-25',
                eventTime: '09:00',
                eventDay: 'Wednesday',
                status: 'pending',
                notificationStatus: 'unread',
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 3,
                type: 'exhibitor',
                userId: 301,
                userName: 'Tech Innovations Ltd',
                userEmail: 'exhibitor@techinnovations.com',
                eventId: 'A004',
                eventTitle: 'Digital Transformation in Public Service',
                eventDate: '2026-06-26',
                eventTime: '08:30',
                eventDay: 'Thursday',
                status: 'pending',
                notificationStatus: 'unread',
                createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: 4,
                type: 'partner',
                userId: 401,
                userName: 'Global Solutions Inc',
                userEmail: 'partner@globalsolutions.com',
                eventId: 'A005',
                eventTitle: 'Leadership Workshop',
                eventDate: '2026-06-26',
                eventTime: '10:00',
                eventDay: 'Thursday',
                status: 'pending',
                notificationStatus: 'unread',
                createdAt: new Date(Date.now() - 10800000).toISOString()
            }
        ];
    }

    renderNotifications() {
        const container = document.getElementById('notificationList');
        if (!container) return;

        const filteredNotifications = this.currentFilter === 'all' 
            ? this.notifications 
            : this.notifications.filter(n => n.status === this.currentFilter);

        if (filteredNotifications.length === 0) {
            container.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash fa-2x" style="margin-bottom: 10px;"></i>
                    <p>No notifications to display</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredNotifications.map(notification => `
            <div class="notification-item ${notification.status}" data-id="${notification.id}">
                <div class="notification-content">
                    <div class="notification-icon icon-${notification.type}">
                        <i class="fas ${this.getTypeIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-title">
                            <span>${notification.userName}</span>
                            <span class="status-badge status-${notification.status}">
                                ${notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                            </span>
                        </div>
                        <div class="notification-message">
                            Wants to attend ${notification.eventDay} event
                        </div>
                        <div class="notification-event">
                            <div class="event-title">${notification.eventTitle}</div>
                            <div class="event-details">
                                <span><i class="far fa-calendar"></i> ${notification.eventDate}</span>
                                <span><i class="far fa-clock"></i> ${notification.eventTime}</span>
                            </div>
                        </div>
                        <div class="notification-actions-bottom">
                            <button class="btn-sm btn-approve" onclick="window.notificationSystem.approveSchedule(${notification.id})">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="btn-sm btn-reject" onclick="window.notificationSystem.rejectSchedule(${notification.id})">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                        <div class="notification-time">
                            <i class="far fa-clock"></i> ${this.formatTimeAgo(notification.createdAt)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getTypeIcon(type) {
        const icons = {
            'attendee': 'fa-user',
            'speaker': 'fa-microphone',
            'exhibitor': 'fa-store',
            'partner': 'fa-handshake'
        };
        return icons[type] || 'fa-user';
    }

    async approveSchedule(notificationId) {
        try {
            const notification = this.notifications.find(n => n.id === notificationId);
            
            if (notification) {
                // Update notification status
                notification.status = 'approved';
                
                // Record attendance in reports system
                await this.recordAttendance(notification);
                
                // Send approval notification to user
                await this.sendApprovalNotification(notification);
                
                // Update UI
                this.renderNotifications();
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateNotificationBadge();
                
                // Update reports if manager exists
                if (window.attendanceReportManager) {
                    window.attendanceReportManager.refreshData();
                }
                
                // Show success message
                this.showToast('Schedule approved successfully!', 'success');
                
                // Close notification dropdown after approval
                setTimeout(() => {
                    const dropdown = document.getElementById('notificationDropdown');
                    if (dropdown) dropdown.classList.remove('show');
                }, 1500);
            }
        } catch (error) {
            console.error('Error approving schedule:', error);
            this.showToast('Error approving schedule', 'error');
        }
    }

    async rejectSchedule(notificationId) {
        try {
            const notification = this.notifications.find(n => n.id === notificationId);
            
            if (notification) {
                notification.status = 'rejected';
                
                // Send rejection notification to user
                await this.sendRejectionNotification(notification);
                
                this.renderNotifications();
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateNotificationBadge();
                this.showToast('Schedule rejected', 'info');
            }
        } catch (error) {
            console.error('Error rejecting schedule:', error);
            this.showToast('Error rejecting schedule', 'error');
        }
    }

    async recordAttendance(notification) {
        const attendanceRecord = {
            id: Date.now(),
            userId: notification.userId,
            userName: notification.userName,
            userType: notification.type,
            userEmail: notification.userEmail,
            eventId: notification.eventId,
            eventTitle: notification.eventTitle,
            eventDate: notification.eventDate,
            eventTime: notification.eventTime,
            eventDay: notification.eventDay,
            status: 'attended',
            approvedBy: 'Super Admin',
            approvedAt: new Date().toISOString()
        };

        // Save to localStorage for demo
        let attendanceRecords = JSON.parse(localStorage.getItem('icsc_attendance_records') || '[]');
        attendanceRecords.push(attendanceRecord);
        localStorage.setItem('icsc_attendance_records', JSON.stringify(attendanceRecords));
        
        return attendanceRecord;
    }

    async sendApprovalNotification(notification) {
        // Mock API call
        console.log(`Approval notification sent to ${notification.userEmail}`);
        return true;
    }

    async sendRejectionNotification(notification) {
        // Mock API call
        console.log(`Rejection notification sent to ${notification.userEmail}`);
        return true;
    }

    async markAllAsRead() {
        this.notifications.forEach(n => {
            if (n.status === 'pending') {
                n.status = 'read';
            }
        });
        this.unreadCount = 0;
        this.renderNotifications();
        this.updateNotificationBadge();
        this.showToast('All notifications marked as read', 'info');
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationCount');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    showAllNotificationsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>All Schedule Notifications</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="filter-controls" style="margin-bottom: 15px;">
                        <select class="form-control" id="allNotificationsFilter" style="width: 200px;">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div class="notification-list-full" id="allNotificationsList" style="max-height: 400px; overflow-y: auto; padding: 10px;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Filter change
        modal.querySelector('#allNotificationsFilter').addEventListener('change', (e) => {
            this.renderAllNotifications(e.target.value);
        });
        
        // Initial render
        this.renderAllNotifications('all');
    }

    renderAllNotifications(filter) {
        const container = document.getElementById('allNotificationsList');
        if (!container) return;
        
        const filtered = filter === 'all' 
            ? this.notifications 
            : this.notifications.filter(n => n.status === filter);
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-notifications">No notifications found</div>';
            return;
        }
        
        container.innerHTML = filtered.map(notification => `
            <div class="notification-item ${notification.status}" style="margin-bottom: 10px; padding: 12px; border-radius: 6px; background: #f8f9fa;">
                <div class="notification-content" style="align-items: center;">
                    <div class="notification-icon icon-${notification.type}" style="width: 35px; height: 35px; font-size: 0.9rem;">
                        <i class="fas ${this.getTypeIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-details" style="flex: 1;">
                        <div class="notification-title" style="margin-bottom: 5px;">
                            <strong style="color: #333;">${notification.userName}</strong>
                            <span class="status-badge status-${notification.status}" style="margin-left: 10px;">
                                ${notification.status.toUpperCase()}
                            </span>
                        </div>
                        <div class="notification-message" style="font-size: 0.9rem; color: #666;">
                            ${notification.type.toUpperCase()} - ${notification.eventTitle}
                        </div>
                        <div class="notification-time" style="font-size: 0.8rem; color: #888;">
                            ${notification.eventDate} • ${notification.eventTime}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    startPolling() {
        // Check for new notifications every 30 seconds
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
    }

    async checkForNewNotifications() {
        const oldCount = this.unreadCount;
        await this.loadNotifications();
        
        if (this.unreadCount > oldCount) {
            this.showDesktopNotification(`You have ${this.unreadCount - oldCount} new schedule submissions`);
            this.playNotificationSound();
        }
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showDesktopNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ICSC 2026 Dashboard', {
                body: message,
                icon: '../icsc-logo.png'
            });
        } else if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    playNotificationSound() {
        // Simple beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}

class AttendanceReportManager {
    constructor() {
        this.attendanceData = [];
        this.filters = {
            day: 'all',
            type: 'all',
            event: 'all'
        };
        this.initialize();
    }

    async initialize() {
        await this.loadAttendanceData();
        this.setupEventListeners();
        this.renderAttendanceTable();
        this.updateAttendanceStats();
    }

    async loadAttendanceData() {
        // Load from localStorage (mock)
        this.attendanceData = JSON.parse(localStorage.getItem('icsc_attendance_records') || '[]');
        
        // If no data, load mock data for demo
        if (this.attendanceData.length === 0) {
            this.attendanceData = this.getMockAttendanceData();
            localStorage.setItem('icsc_attendance_records', JSON.stringify(this.attendanceData));
        }
    }

    getMockAttendanceData() {
        return [
            {
                id: 1,
                userId: 101,
                userName: 'John Doe',
                userType: 'attendee',
                userEmail: 'john.doe@finance.gov.ng',
                eventId: 'A002',
                eventTitle: 'Opening Ceremony & Keynote Address',
                eventDate: '2026-06-25',
                eventTime: '09:00',
                eventDay: 'Wednesday',
                status: 'attended',
                approvedBy: 'Super Admin',
                approvedAt: '2026-01-15T10:30:00Z'
            },
            {
                id: 2,
                userId: 102,
                userName: 'Sarah Johnson',
                userType: 'attendee',
                userEmail: 'sarah@education.gov.ng',
                eventId: 'A004',
                eventTitle: 'Digital Transformation in Public Service',
                eventDate: '2026-06-26',
                eventTime: '08:30',
                eventDay: 'Thursday',
                status: 'attended',
                approvedBy: 'Super Admin',
                approvedAt: '2026-01-15T11:45:00Z'
            },
            {
                id: 3,
                userId: 201,
                userName: 'Dr. Elizabeth Williams',
                userType: 'speaker',
                userEmail: 'elizabeth@university.edu',
                eventId: 'A002',
                eventTitle: 'Opening Ceremony & Keynote Address',
                eventDate: '2026-06-25',
                eventTime: '09:00',
                eventDay: 'Wednesday',
                status: 'attended',
                approvedBy: 'Super Admin',
                approvedAt: '2026-01-15T09:15:00Z'
            },
            {
                id: 4,
                userId: 301,
                userName: 'Tech Innovations Ltd',
                userType: 'exhibitor',
                userEmail: 'exhibitor@techinnovations.com',
                eventId: 'A004',
                eventTitle: 'Digital Transformation in Public Service',
                eventDate: '2026-06-26',
                eventTime: '08:30',
                eventDay: 'Thursday',
                status: 'attended',
                approvedBy: 'Super Admin',
                approvedAt: '2026-01-16T14:20:00Z'
            }
        ];
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('applyAttendanceFilter')?.addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('refreshAttendanceBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('exportAttendanceBtn')?.addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('clearAttendanceFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Filter change listeners
        ['attendanceDayFilter', 'attendanceTypeFilter', 'attendanceEventFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFilterValues();
                    // Auto-apply filters on change
                    setTimeout(() => this.applyFilters(), 100);
                });
            }
        });
    }

    updateFilterValues() {
        this.filters = {
            day: document.getElementById('attendanceDayFilter')?.value || 'all',
            type: document.getElementById('attendanceTypeFilter')?.value || 'all',
            event: document.getElementById('attendanceEventFilter')?.value || 'all'
        };
    }

    clearFilters() {
        document.getElementById('attendanceDayFilter').value = 'all';
        document.getElementById('attendanceTypeFilter').value = 'all';
        document.getElementById('attendanceEventFilter').value = 'all';
        this.filters = { day: 'all', type: 'all', event: 'all' };
        this.renderAttendanceTable();
        this.updateAttendanceStats();
        this.showToast('Filters cleared', 'info');
    }

    applyFilters() {
        this.updateFilterValues();
        this.renderAttendanceTable();
        this.updateAttendanceStats();
    }

    getFilteredData() {
        return this.attendanceData.filter(record => {
            // Apply day filter
            if (this.filters.day !== 'all') {
                const dayMap = {
                    'wednesday': 'Wednesday',
                    'thursday': 'Thursday'
                };
                if (record.eventDay !== dayMap[this.filters.day]) {
                    return false;
                }
            }
            
            // Apply type filter
            if (this.filters.type !== 'all' && record.userType !== this.filters.type) {
                return false;
            }
            
            // Apply event filter
            if (this.filters.event !== 'all' && record.eventId !== this.filters.event) {
                return false;
            }
            
            return true;
        });
    }

    renderAttendanceTable() {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;

        const filteredData = this.getFilteredData();

        if (filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 40px;">
                        <i class="fas fa-users-slash fa-2x" style="color: #ccc; margin-bottom: 10px;"></i>
                        <p>No attendance records found for the selected filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredData.map(record => `
            <tr>
                <td><strong>${record.userName}</strong></td>
                <td>
                    <span class="status-badge ${this.getTypeClass(record.userType)}">
                        ${record.userType.toUpperCase()}
                    </span>
                </td>
                <td>${record.userEmail}</td>
                <td>${record.eventTitle}</td>
                <td>
                    <span class="status-badge ${record.eventDay === 'Wednesday' ? 'status-pending' : 'status-approved'}">
                        ${record.eventDay}
                    </span>
                </td>
                <td>${record.eventTime}</td>
                <td><span class="status-badge status-approved">Attended</span></td>
                <td>${record.approvedBy}</td>
                <td>${this.formatDate(record.approvedAt)}</td>
            </tr>
        `).join('');
    }

    getTypeClass(type) {
        const classes = {
            'attendee': 'status-approved',
            'speaker': 'status-pending',
            'exhibitor': 'status-rejected',
            'partner': 'status-approved'
        };
        return classes[type] || '';
    }

    updateAttendanceStats() {
        const filteredData = this.getFilteredData();
        const day1Count = filteredData.filter(r => r.eventDay === 'Wednesday').length;
        const day2Count = filteredData.filter(r => r.eventDay === 'Thursday').length;
        const totalCount = filteredData.length;

        // Update stats in the card
        const totalEl = document.getElementById('totalAttendance');
        const day1El = document.getElementById('day1Attendance');
        const day2El = document.getElementById('day2Attendance');
        
        if (totalEl) totalEl.textContent = totalCount;
        if (day1El) day1El.textContent = day1Count;
        if (day2El) day2El.textContent = day2Count;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    async refreshData() {
        await this.loadAttendanceData();
        this.renderAttendanceTable();
        this.updateAttendanceStats();
        this.showToast('Attendance data refreshed', 'success');
    }

    exportToExcel() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet data
        const wsData = [
            ['Attendance Report - ICSC 2026'],
            ['Generated: ' + new Date().toLocaleDateString()],
            [''],
            ['Name', 'Type', 'Email', 'Event', 'Day', 'Time', 'Status', 'Approved By', 'Approved At']
        ];
        
        // Add filtered data
        filteredData.forEach(record => {
            wsData.push([
                record.userName,
                record.userType.toUpperCase(),
                record.userEmail,
                record.eventTitle,
                record.eventDay,
                record.eventTime,
                'Attended',
                record.approvedBy,
                this.formatDate(record.approvedAt)
            ]);
        });
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        const colWidths = [
            {wch: 25}, // Name
            {wch: 12}, // Type
            {wch: 30}, // Email
            {wch: 40}, // Event
            {wch: 15}, // Day
            {wch: 10}, // Time
            {wch: 12}, // Status
            {wch: 15}, // Approved By
            {wch: 20}  // Approved At
        ];
        ws['!cols'] = colWidths;
        
        // Merge header rows
        ws['!merges'] = [
            {s: {r: 0, c: 0}, e: {r: 0, c: 8}}, // Title row
            {s: {r: 1, c: 0}, e: {r: 1, c: 8}}  // Date row
        ];
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        
        // Generate filename based on filters
        let filename = 'ICSC_Attendance_';
        
        if (this.filters.day !== 'all') {
            filename += this.filters.day.charAt(0).toUpperCase() + this.filters.day.slice(1) + '_';
        }
        
        if (this.filters.type !== 'all') {
            filename += this.filters.type + '_';
        }
        
        if (this.filters.event !== 'all') {
            const eventName = this.filters.event === 'A001' ? 'Registration' :
                            this.filters.event === 'A002' ? 'Opening' :
                            this.filters.event === 'A003' ? 'CoffeeBreak' :
                            this.filters.event === 'A004' ? 'DigitalTransformation' :
                            this.filters.event === 'A005' ? 'Leadership' : 'Event';
            filename += eventName + '_';
        }
        
        filename += new Date().toISOString().split('T')[0] + '.xlsx';
        
        // Export file
        XLSX.writeFile(wb, filename);
        
        this.showToast(`Exported ${filteredData.length} records to Excel`, 'success');
    }

    showToast(message, type = 'info') {
        // Use notification system's toast if available
        if (window.notificationSystem) {
            window.notificationSystem.showToast(message, type);
        } else {
            // Fallback toast
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                padding: 12px 16px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
            `;
            
            toast.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" 
                   style="color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};"></i>
                <span style="font-size: 0.9rem;">${message}</span>
            `;
            
            document.body.appendChild(toast);
            
            // Add animation
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize systems when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on super admin dashboard
    const isSuperAdmin = document.body.getAttribute('data-protected') === 'super_admin';
    
    if (isSuperAdmin) {
        // Initialize Notification System
        window.notificationSystem = new NotificationSystem();
        
        // Initialize Attendance Report System
        window.attendanceReportManager = new AttendanceReportManager();
        
        // Load attendance data when reports tab is clicked
        const reportsTabLink = document.querySelector('a[data-tab="reports"]');
        if (reportsTabLink) {
            reportsTabLink.addEventListener('click', function() {
                setTimeout(() => {
                    if (window.attendanceReportManager) {
                        window.attendanceReportManager.refreshData();
                    }
                }, 100);
            });
        }
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Add export button styling
        const exportBtn = document.getElementById('exportAttendanceBtn');
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Export to Excel';
        }
    }
});

// Make functions available globally for onclick attributes
window.approveSchedule = function(notificationId) {
    if (window.notificationSystem) {
        window.notificationSystem.approveSchedule(notificationId);
    }
};

window.rejectSchedule = function(notificationId) {
    if (window.notificationSystem) {
        window.notificationSystem.rejectSchedule(notificationId);
    }
};

// Add inline styles for toast notifications
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid #1976d2;
        border-radius: 4px;
        padding: 12px 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 350px;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-success {
        border-left-color: #4CAF50;
    }
    
    .toast-error {
        border-left-color: #f44336;
    }
    
    .toast-info {
        border-left-color: #2196F3;
    }
    
    .toast i {
        font-size: 1.1rem;
    }
    
    .toast-success i { color: #4CAF50; }
    .toast-error i { color: #f44336; }
    .toast-info i { color: #2196F3; }
    
    .toast span {
        font-size: 0.9rem;
        color: #333;
    }
    
    /* Status badge colors */
    .status-badge.status-approved {
        background: #D4EDDA;
        color: #155724;
        border: 1px solid #C3E6CB;
    }
    
    .status-badge.status-pending {
        background: #FFF3CD;
        color: #856404;
        border: 1px solid #FFEAA7;
    }
    
    .status-badge.status-rejected {
        background: #F8D7DA;
        color: #721C24;
        border: 1px solid #F5C6CB;
    }
`;
document.head.appendChild(style);

// Initialize the page to show content
document.body.style.display = 'block';