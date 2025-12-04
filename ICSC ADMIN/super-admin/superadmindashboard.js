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
        
        // Close modals when clicking outside
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
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
        workPhone: document.getElementById('attendeeWorkPhone').value.trim(),
        phone: document.getElementById('attendeePhone').value.trim(),
        nin: document.getElementById('attendeeNIN').value.trim(),
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

    const required = ['prefix', 'firstName', 'lastName', 'email', 'password', 'jobTitle', 'organization', 'workPhone', 'phone', 'nin', 'position', 'gradeLevel'];
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
        nin: values.nin,
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
        workPhone: document.getElementById('editAttendeeWorkPhone').value.trim(),
        phone: document.getElementById('editAttendeePhone').value.trim(),
        nin: document.getElementById('editAttendeeNIN').value.trim(),
        position: document.getElementById('editAttendeePosition').value.trim(),
        gradeLevel: document.getElementById('editAttendeeGradeLevel').value
    };

    const fullName = `${updatedData.prefix} ${updatedData.firstName} ${updatedData.lastName}`.trim();

    const payload = {
        fullname: fullName,
        email: updatedData.email,
        password: updatedData.password,
        phone_number: updatedData.phone,
        work_phone: updatedData.workPhone,
        nin: updatedData.nin,
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
                    nin: updatedData.nin,
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
        document.getElementById('editAttendeeWorkPhone').value = attendee.phone;
        document.getElementById('editAttendeePhone').value = attendee.phone;
        document.getElementById('editAttendeeNIN').value = attendee.nin;
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

// Initialize the page to show content
document.body.style.display = 'block';