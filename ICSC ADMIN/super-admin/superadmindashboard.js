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
        'settings': 'System Settings'
    };
    return titles[tabId] || 'Super Admin Dashboard';
}

// Fixed Modal Manager
function initializeModalManager() {
    const modalConfigs = [
        {
            btn: "addExhibitorBtn",
            modal: "addExhibitorModal",
            cancel: "cancelAddExhibitorBtn",
            form: "addExhibitorForm",
            name: "Exhibitor"
        },
        {
            btn: "addPartnerBtn",
            modal: "addPartnerModal",
            cancel: "cancelAddPartnerBtn",
            form: "addPartnerForm",
            name: "Partner"
        },
        {
            btn: "addSpeakerBtn",
            modal: "addSpeakerModal",
            cancel: "cancelAddSpeakerBtn",
            form: "addSpeakerForm",
            name: "Speaker"
        },
        {
            btn: "addBoothBtn",
            modal: "addBoothModal",
            cancel: "cancelAddBoothBtn",
            form: "addBoothForm",
            name: "Booth"
        }
    ];

    function openModal(modalEl, formEl) {
        if (formEl) formEl.reset();
        modalEl.style.display = 'flex';
    }

    function closeModal(modalEl) {
        modalEl.style.display = 'none';
    }

    modalConfigs.forEach(cfg => {
        const btn = document.getElementById(cfg.btn);
        const modal = document.getElementById(cfg.modal);
        const cancel = document.getElementById(cfg.cancel);
        const form = document.getElementById(cfg.form);

        if (!modal) {
            console.warn(`Modal not found: ${cfg.modal}`);
            return;
        }

        // Open modal
        if (btn) {
            btn.addEventListener("click", () => openModal(modal, form));
        }

        // Cancel inside modal
        if (cancel) {
            cancel.addEventListener("click", () => closeModal(modal));
        }

        // Submit form
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                console.log(`Submitted → ${cfg.form}`);
                
                // Show success message
                document.getElementById('successMessage').textContent = `${cfg.name} has been successfully added!`;
                document.getElementById('successModal').style.display = 'flex';
                
                closeModal(modal);
            });
        }
    });

    // Close modals when clicking X button
    document.querySelectorAll(".close-modal").forEach(x => {
        x.addEventListener("click", function() {
            const modal = this.closest(".modal");
            if (modal) modal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
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
    
    // Modal controls (safe)
    if (closeModalBtns && closeModalBtns.length) {
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (successModal) successModal.style.display = 'none';
                if (editAttendeeModal) editAttendeeModal.style.display = 'none';
                if (deleteModal) deleteModal.style.display = 'none';
                if (deleteMinistryModal) deleteMinistryModal.style.display = 'none';
                if (addMinistryModal) addMinistryModal.style.display = 'none';
                if (viewMinistryModal) viewMinistryModal.style.display = 'none';
                if (editMinistryModal) editMinistryModal.style.display = 'none';
                if (viewAttendeeModal) viewAttendeeModal.style.display = 'none';
            });
        });
    }
    
    if (addAnotherBtn) addAnotherBtn.addEventListener('click', function() {
        if (successModal) successModal.style.display = 'none';
    });
    
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', function() {
        if (editAttendeeModal) editAttendeeModal.style.display = 'none';
    });

      if (cancelEditExhibitorBtn) 
        cancelEditExhibitorBtn.addEventListener('click', function() {
            document.getElementById('editExhibitorModal').style.display = 'none';
      });      
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', function() {
        if (deleteModal) deleteModal.style.display = 'none';
    });
    if (cancelDeleteMinistryBtn) cancelDeleteMinistryBtn.addEventListener('click', function() {
        if (deleteMinistryModal) deleteMinistryModal.style.display = 'none';
    });
    if (document.querySelector('.close-view-modal')) {
        document.querySelector('.close-view-modal').addEventListener('click', function() {
            if (viewAttendeeModal) viewAttendeeModal.style.display = 'none';
        });
    }
    
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

    // Global document click handlers
    document.addEventListener('click', function(e) {
        const closestRow = e.target.closest && e.target.closest('tr');
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

        if (e.target.classList.contains('delete-ministry-btn') && closestRow) {
            const ministryId = parseInt(closestRow.getAttribute('data-id'));
            const ministryName = closestRow.cells && closestRow.cells[0] ? closestRow.cells[0].textContent : '';
            if (!Number.isNaN(ministryId)) openDeleteMinistryModal(ministryId, ministryName);
        }

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

        // Exhibitor table functionality
        if (e.target.classList.contains('edit-exhibitor-btn') && closestRow) {
            const exhibitorId = closestRow.getAttribute('data-id');
            editExhibitor(exhibitorId);
        }
        if (e.target.classList.contains('view-exhibitor-btn') && closestRow) {
            const exhibitorId = closestRow.getAttribute('data-id');
            viewExhibitor(exhibitorId);
        }

        // Partner table functionality
        if (e.target.classList.contains('edit-partner-btn') && closestRow) {
            const partnerId = closestRow.getAttribute('data-id');
            editPartner(partnerId);
        }
        if (e.target.classList.contains('view-partner-btn') && closestRow) {
            const partnerId = closestRow.getAttribute('data-id');
            viewPartner(partnerId);
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
        fullname: values.fullName,
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
	} finally {
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

// Exhibitor and Partner Modal Functions
function editExhibitor(exhibitorId) {
    const row = document.querySelector(`#exhibitorsTable tr[data-id="${exhibitorId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    document.getElementById('editExhibitorId').value = exhibitorId;
    document.getElementById('editExhibitorName').value = cells[1].textContent;
    document.getElementById('editExhibitorCompany').value = cells[0].textContent;
    
    document.getElementById('editExhibitorModal').style.display = 'flex';
}

function viewExhibitor(exhibitorId) {
    const row = document.querySelector(`#exhibitorsTable tr[data-id="${exhibitorId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    document.getElementById('viewExhibitorDetails').innerHTML = `
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
    
    document.getElementById('viewExhibitorModal').style.display = 'flex';
}

function editPartner(partnerId) {
    const row = document.querySelector(`#partnersTable tr[data-id="${partnerId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    document.getElementById('editPartnerId').value = partnerId;
    document.getElementById('editCompanyName').value = cells[0].textContent;
    document.getElementById('editContactPerson').value = cells[1].textContent;
    document.getElementById('editContactEmail').value = cells[2].textContent;
    
    document.getElementById('editPartnerModal').style.display = 'flex';
}

function viewPartner(partnerId) {
    const row = document.querySelector(`#partnersTable tr[data-id="${partnerId}"]`);
    if (!row) return;
    
    const cells = row.cells;
    
    document.getElementById('viewPartnerDetails').innerHTML = `
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
    
    document.getElementById('viewPartnerModal').style.display = 'flex';
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

// Update the partners table rendering to include all fields
function renderPartnersTable() {
    const partnersTable = document.getElementById('partnersTable');
    if (!partnersTable) return;
    
    let html = '';
    
    // Sample data - replace with your actual data
    const partners = [
        {
            id: 'P001',
            company: 'Tech Solutions Ltd',
            contactPerson: 'John Smith',
            email: 'john@techsolutions.com',
            package: 'diamond',
            investment: '5,000,000',
            status: 'active',
            paymentStatus: 'paid',
            startDate: '2026-01-15',
            endDate: '2026-12-31'
        }
        // Add more partners as needed
    ];
    
    partners.forEach(partner => {
        const packageNames = {
            'diamond': 'Diamond Partner',
            'gold': 'Gold Partner', 
            'silver': 'Silver Partner',
            'bronze': 'Bronze Partner'
        };
        
        html += `
            <tr data-id="${partner.id}">
                <td>${partner.company}</td>
                <td>${partner.contactPerson}</td>
                <td>${partner.email}</td>
                <td><span class="status-badge status-approved">${packageNames[partner.package]}</span></td>
                <td>${partner.investment}</td>
                <td><span class="status-badge status-${partner.status === 'active' ? 'approved' : partner.status === 'pending' ? 'pending' : 'rejected'}">${partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}</span></td>
                <td><span class="status-badge status-${partner.paymentStatus === 'paid' ? 'approved' : partner.paymentStatus === 'pending' ? 'pending' : 'rejected'}">${partner.paymentStatus.charAt(0).toUpperCase() + partner.paymentStatus.slice(1)}</span></td>
                <td>${partner.startDate}</td>
                <td>${partner.endDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-partner-btn">View</button>
                        <button class="btn btn-warning btn-sm edit-partner-btn">Edit</button>
                        <button class="btn btn-danger btn-sm delete-partner-btn">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    partnersTable.querySelector('tbody').innerHTML = html;
}

// Settings Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings when settings tab is opened
    document.querySelector('a[data-tab="settings"]').addEventListener('click', function() {
        initializeSettingsTab();
    });

    // Also initialize if settings tab is already active on page load
    if (document.getElementById('settings').classList.contains('active')) {
        setTimeout(initializeSettingsTab, 100);
    }
});

// Initialize Settings Tab
function initializeSettingsTab() {
    loadEventTimerSettings();
    loadRegistrationCaps();
    loadCurrentRegistrationStats();
    loadSystemConfig();
    setupSettingsEventListeners();
}

// Load Event Timer Settings
function loadEventTimerSettings() {
    // Get saved settings or use defaults
    const eventDate = localStorage.getItem('icsc_event_date') || '2026-05-25T09:00:00';
    const timezone = localStorage.getItem('icsc_event_timezone') || 'Africa/Lagos';
    const popupDuration = localStorage.getItem('icsc_popup_duration') || '5';
    const popupFrequency = localStorage.getItem('icsc_popup_frequency') || 'daily';
    
    // Set form values
    document.getElementById('eventDateTime').value = eventDate.substring(0, 16);
    document.getElementById('eventTimezone').value = timezone;
    document.getElementById('popupDuration').value = popupDuration;
    document.getElementById('popupFrequency').value = popupFrequency;
    
    // Display current setting
    const date = new Date(
    new Date(eventDate).toLocaleString("en-US", { timeZone: timezone })
);
    const currentTimerSetting = document.getElementById('currentTimerSetting');
    currentTimerSetting.innerHTML = `
        <p><strong>Event Date:</strong> ${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
        <p><strong>Timezone:</strong> ${timezone}</p>
        <p><strong>Popup:</strong> ${popupDuration}s auto-close, ${popupFrequency} display</p>
    `;
}

// Load Registration Caps
function loadRegistrationCaps() {
    // Get saved caps or use defaults
    const caps = JSON.parse(localStorage.getItem('icsc_registration_caps')) || {
        attendee: { cap: 1000, action: 'disable' },
        speaker: { cap: 50, action: 'show_message' },
        exhibitor: { cap: 100, action: 'disable' },
        partner: { cap: 30, action: 'show_message' },
        globalMessage: 'Registration for this category is currently full. Please check back later.',
        status: 'open'
    };
    
    // Set form values
    document.getElementById('attendeeCap').value = caps.attendee.cap;
    document.getElementById('attendeeCapAction').value = caps.attendee.action;
    document.getElementById('speakerCap').value = caps.speaker.cap;
    document.getElementById('speakerCapAction').value = caps.speaker.action;
    document.getElementById('exhibitorCap').value = caps.exhibitor.cap;
    document.getElementById('exhibitorCapAction').value = caps.exhibitor.action;
    document.getElementById('partnerCap').value = caps.partner.cap;
    document.getElementById('partnerCapAction').value = caps.partner.action;
    document.getElementById('globalRegistrationMessage').value = caps.globalMessage || '';
    document.getElementById('registrationStatus').value = caps.status;
}

// Load Current Registration Statistics
function loadCurrentRegistrationStats() {
    // In a real application, you would fetch this from your database
    // For now, we'll use localStorage or simulate data
    const stats = JSON.parse(localStorage.getItem('icsc_registration_stats')) || {
        attendees: 45,
        speakers: 10,
        exhibitors: 15,
        partners: 8
    };
    
    document.getElementById('currentAttendees').textContent = stats.attendees;
    document.getElementById('currentSpeakers').textContent = stats.speakers;
    document.getElementById('currentExhibitors').textContent = stats.exhibitors;
    document.getElementById('currentPartners').textContent = stats.partners;
    
    // Get caps to show max values
    const caps = JSON.parse(localStorage.getItem('icsc_registration_caps')) || {
        attendee: { cap: 1000 },
        speaker: { cap: 50 },
        exhibitor: { cap: 100 },
        partner: { cap: 30 }
    };
    
    document.getElementById('maxAttendees').textContent = caps.attendee.cap || 'Unlimited';
    document.getElementById('maxSpeakers').textContent = caps.speaker.cap || 'Unlimited';
    document.getElementById('maxExhibitors').textContent = caps.exhibitor.cap || 'Unlimited';
    document.getElementById('maxPartners').textContent = caps.partner.cap || 'Unlimited';
    
    // Update progress indicators (add color coding if caps are reached)
    updateRegistrationStatusIndicators();
}

// Load System Configuration
function loadSystemConfig() {
    const config = JSON.parse(localStorage.getItem('icsc_system_config')) || {
        systemEmail: 'system@icsc2026.gov.ng',
        adminEmail: 'admin@icsc2026.gov.ng',
        emailNotifications: 'all'
    };
    
    document.getElementById('systemEmail').value = config.systemEmail;
    document.getElementById('adminEmail').value = config.adminEmail;
    document.getElementById('emailNotifications').value = config.emailNotifications;
}

// Setup Settings Event Listeners
function setupSettingsEventListeners() {
    // Event Timer Form
    document.getElementById('eventTimerForm').addEventListener('submit', saveEventTimerSettings);
    
    // Registration Caps Form
    document.getElementById('registrationCapsForm').addEventListener('submit', saveRegistrationCaps);
    
    // System Config Form
    document.getElementById('systemConfigForm').addEventListener('submit', saveSystemConfig);
    
    // Test Timer Button
    document.getElementById('testTimerBtn').addEventListener('click', testTimerSettings);
    
    // Reset Timer Button
    document.getElementById('resetTimerBtn').addEventListener('click', resetTimerSettings);
    
    // Reset Caps Button
    document.getElementById('resetCapsBtn').addEventListener('click', resetRegistrationCaps);
    
    // Backup Database Button
    document.getElementById('backupDatabaseBtn').addEventListener('click', backupDatabase);
    
    // Export Settings Button
    document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);
    
    // Real-time cap validation
    setupRealTimeCapValidation();
}

// Save Event Timer Settings
function saveEventTimerSettings(e) {
    e.preventDefault();
    
    const eventDateTime = document.getElementById('eventDateTime').value;
    const timezone = document.getElementById('eventTimezone').value;
    const popupDuration = document.getElementById('popupDuration').value;
    const popupFrequency = document.getElementById('popupFrequency').value;
    
    if (!eventDateTime) {
        showToast('Please select an event date and time', 'error');
        return;
    }

    // Convert admin’s selected datetime into selected timezone
    const adminLocal = new Date(eventDateTime);

    // Convert the provided datetime into the actual moment in the selected timezone
    const eventInTZ = new Date(
        adminLocal.toLocaleString("en-US", { timeZone: timezone })
    );

    // Save full ISO string (UTC standardized)
    const isoWithTZ = eventInTZ.toISOString();

    // Save canonical values
    localStorage.setItem('icsc_event_date', isoWithTZ);
    localStorage.setItem('icsc_event_timezone', timezone);
    localStorage.setItem('icsc_event_epoch', String(eventInTZ.getTime()));

    // Save popup settings
    localStorage.setItem('icsc_popup_duration', popupDuration);
    localStorage.setItem('icsc_popup_frequency', popupFrequency);

    // Clear popup history so it re-displays properly under new settings
    localStorage.removeItem('icsc_last_popup_date');

    // Update admin display panel (uses timezone correctly)
    loadEventTimerSettings();

    showToast('Event timer settings saved successfully!', 'success');

     // In a real application, you would send this to your backend:
    // fetch('/api/save-event-settings', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         eventDate: isoDate,
    //         timezone: timezone,
    //         popupDuration: popupDuration,
    //         popupFrequency: popupFrequency
    //     })
    // });
}


 // In a real application, you would send this to your backend:
    // fetch('/api/save-event-settings', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         eventDate: isoDate,
    //         timezone: timezone,
    //         popupDuration: popupDuration,
    //         popupFrequency: popupFrequency
    //     })
    // });
// Save Registration Caps
function saveRegistrationCaps(e) {
    e.preventDefault();
    
    const caps = {
        attendee: {
            cap: parseInt(document.getElementById('attendeeCap').value) || 0,
            action: document.getElementById('attendeeCapAction').value
        },
        speaker: {
            cap: parseInt(document.getElementById('speakerCap').value) || 0,
            action: document.getElementById('speakerCapAction').value
        },
        exhibitor: {
            cap: parseInt(document.getElementById('exhibitorCap').value) || 0,
            action: document.getElementById('exhibitorCapAction').value
        },
        partner: {
            cap: parseInt(document.getElementById('partnerCap').value) || 0,
            action: document.getElementById('partnerCapAction').value
        },
        globalMessage: document.getElementById('globalRegistrationMessage').value,
        status: document.getElementById('registrationStatus').value
    };
    
    // Validate caps
    if (!validateRegistrationCaps(caps)) {
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('icsc_registration_caps', JSON.stringify(caps));
    
    // Update display
    loadCurrentRegistrationStats();
    
    showToast('Registration caps saved successfully!', 'success');
    
    // Apply caps to registration forms
    applyRegistrationCaps();
    
    // In a real application, you would send this to your backend:
    // fetch('/api/save-registration-caps', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(caps)
    // });
}

// Save System Configuration
function saveSystemConfig(e) {
    e.preventDefault();
    
    const config = {
        systemEmail: document.getElementById('systemEmail').value,
        adminEmail: document.getElementById('adminEmail').value,
        emailNotifications: document.getElementById('emailNotifications').value
    };
    
    // Validate emails
    if (config.systemEmail && !isValidEmail(config.systemEmail)) {
        showToast('Please enter a valid system email', 'error');
        return;
    }
    
    if (config.adminEmail && !isValidEmail(config.adminEmail)) {
        showToast('Please enter a valid admin email', 'error');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('icsc_system_config', JSON.stringify(config));
    
    showToast('System configuration saved successfully!', 'success');
    
    // In a real application, you would send this to your backend:
    // fetch('/api/save-system-config', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(config)
    // });
}

// Test Timer Settings
function testTimerSettings() {
    // Temporarily set event to 1 minute from now for testing
    const testDate = new Date(Date.now() + 60000); // 1 minute from now
    const testIsoDate = testDate.toISOString().split('.')[0];
    
    // Save original date
    const originalDate = localStorage.getItem('icsc_event_date');
    localStorage.setItem('icsc_event_test_date', originalDate);
    localStorage.setItem('icsc_event_date', testIsoDate);
    
    // Clear popup history
    localStorage.removeItem('icsc_last_popup_date');
    
    showToast('Test mode activated! Countdown set to 1 minute from now. Refresh homepage to see effect.', 'info');
    
    // Auto-revert after 5 minutes
    setTimeout(() => {
        if (localStorage.getItem('icsc_event_test_date')) {
            localStorage.setItem('icsc_event_date', localStorage.getItem('icsc_event_test_date'));
            localStorage.removeItem('icsc_event_test_date');
            showToast('Test mode ended. Timer restored to original.', 'info');
            loadEventTimerSettings();
        }
    }, 300000); // 5 minutes
}

// Reset Timer Settings
function resetTimerSettings() {
    if (confirm('Reset event timer to default settings?')) {
        const defaultDate = '2026-05-25T09:00:00';
        
        localStorage.setItem('icsc_event_date', defaultDate);
        localStorage.setItem('icsc_event_timezone', 'Africa/Lagos');
        localStorage.setItem('icsc_popup_duration', '5');
        localStorage.setItem('icsc_popup_frequency', 'daily');
        localStorage.removeItem('icsc_last_popup_date');
        
        loadEventTimerSettings();
        showToast('Timer settings reset to default', 'success');
    }
}

// Reset Registration Caps
function resetRegistrationCaps() {
    if (confirm('Reset all registration caps to default values?')) {
        const defaultCaps = {
            attendee: { cap: 1000, action: 'disable' },
            speaker: { cap: 50, action: 'show_message' },
            exhibitor: { cap: 100, action: 'disable' },
            partner: { cap: 30, action: 'show_message' },
            globalMessage: 'Registration for this category is currently full. Please check back later.',
            status: 'open'
        };
        
        localStorage.setItem('icsc_registration_caps', JSON.stringify(defaultCaps));
        
        loadRegistrationCaps();
        loadCurrentRegistrationStats();
        showToast('Registration caps reset to default', 'success');
    }
}

// Backup Database (Simulated)
function backupDatabase() {
    showToast('Starting database backup...', 'info');
    
    // Simulate backup process
    setTimeout(() => {
        // Create backup data
        const backupData = {
            timestamp: new Date().toISOString(),
            eventSettings: {
                eventDate: localStorage.getItem('icsc_event_date'),
                timezone: localStorage.getItem('icsc_event_timezone'),
                popupDuration: localStorage.getItem('icsc_popup_duration'),
                popupFrequency: localStorage.getItem('icsc_popup_frequency')
            },
            registrationCaps: JSON.parse(localStorage.getItem('icsc_registration_caps') || '{}'),
            systemConfig: JSON.parse(localStorage.getItem('icsc_system_config') || '{}')
        };
        
        // Download as JSON file
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `icsc-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Database backup completed successfully!', 'success');
    }, 1500);
}

// Export Settings
function exportSettings() {
    const settings = {
        eventTimer: {
            eventDate: localStorage.getItem('icsc_event_date'),
            timezone: localStorage.getItem('icsc_event_timezone'),
            popupDuration: localStorage.getItem('icsc_popup_duration'),
            popupFrequency: localStorage.getItem('icsc_popup_frequency')
        },
        registrationCaps: JSON.parse(localStorage.getItem('icsc_registration_caps') || '{}'),
        systemConfig: JSON.parse(localStorage.getItem('icsc_system_config') || '{}')
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `icsc-settings-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Settings exported successfully!', 'success');
}

// Validate Registration Caps
function validateRegistrationCaps(caps) {
    const stats = JSON.parse(localStorage.getItem('icsc_registration_stats')) || {
        attendees: 0,
        speakers: 0,
        exhibitors: 0,
        partners: 0
    };
    
    // Check if new cap is lower than current registrations
    if (caps.attendee.cap > 0 && caps.attendee.cap < stats.attendees) {
        if (!confirm(`Warning: Attendee cap (${caps.attendee.cap}) is lower than current registrations (${stats.attendees}). Continue anyway?`)) {
            return false;
        }
    }
    
    if (caps.speaker.cap > 0 && caps.speaker.cap < stats.speakers) {
        if (!confirm(`Warning: Speaker cap (${caps.speaker.cap}) is lower than current registrations (${stats.speakers}). Continue anyway?`)) {
            return false;
        }
    }
    
    if (caps.exhibitor.cap > 0 && caps.exhibitor.cap < stats.exhibitors) {
        if (!confirm(`Warning: Exhibitor cap (${caps.exhibitor.cap}) is lower than current registrations (${caps.exhibitors}). Continue anyway?`)) {
            return false;
        }
    }
    
    if (caps.partner.cap > 0 && caps.partner.cap < stats.partners) {
        if (!confirm(`Warning: Partner cap (${caps.partner.cap}) is lower than current registrations (${caps.partners}). Continue anyway?`)) {
            return false;
        }
    }
    
    return true;
}

// Update Registration Status Indicators
function updateRegistrationStatusIndicators() {
    const stats = JSON.parse(localStorage.getItem('icsc_registration_stats')) || {
        attendees: 0,
        speakers: 0,
        exhibitors: 0,
        partners: 0
    };
    
    const caps = JSON.parse(localStorage.getItem('icsc_registration_caps')) || {
        attendee: { cap: 0 },
        speaker: { cap: 0 },
        exhibitor: { cap: 0 },
        partner: { cap: 0 }
    };
    
    // Update attendee status
    const attendeeCard = document.querySelector('#registrationStats .stat-card:first-child');
    if (caps.attendee.cap > 0 && stats.attendees >= caps.attendee.cap) {
        attendeeCard.style.borderLeft = '4px solid #dc3545';
    } else {
        attendeeCard.style.borderLeft = '';
    }
    
    // Update speaker status
    const speakerCard = document.querySelector('#registrationStats .stat-card:nth-child(2)');
    if (caps.speaker.cap > 0 && stats.speakers >= caps.speaker.cap) {
        speakerCard.style.borderLeft = '4px solid #dc3545';
    } else {
        speakerCard.style.borderLeft = '';
    }
    
    // Update exhibitor status
    const exhibitorCard = document.querySelector('#registrationStats .stat-card:nth-child(3)');
    if (caps.exhibitor.cap > 0 && stats.exhibitors >= caps.exhibitor.cap) {
        exhibitorCard.style.borderLeft = '4px solid #dc3545';
    } else {
        exhibitorCard.style.borderLeft = '';
    }
    
    // Update partner status
    const partnerCard = document.querySelector('#registrationStats .stat-card:last-child');
    if (caps.partner.cap > 0 && stats.partners >= caps.partner.cap) {
        partnerCard.style.borderLeft = '4px solid #dc3545';
    } else {
        partnerCard.style.borderLeft = '';
    }
}

// Apply Registration Caps to Forms
function applyRegistrationCaps() {
    const caps = JSON.parse(localStorage.getItem('icsc_registration_caps')) || {};
    const stats = JSON.parse(localStorage.getItem('icsc_registration_stats')) || {
        attendees: 0,
        speakers: 0,
        exhibitors: 0,
        partners: 0
    };
    
    // Check each registration type and apply caps
    const capStatus = {
        attendees: caps.attendee?.cap > 0 && stats.attendees >= caps.attendee.cap,
        speakers: caps.speaker?.cap > 0 && stats.speakers >= caps.speaker.cap,
        exhibitors: caps.exhibitor?.cap > 0 && stats.exhibitors >= caps.exhibitor.cap,
        partners: caps.partner?.cap > 0 && stats.partners >= caps.partner.cap
    };
    
    // Save cap status to localStorage for frontend to read
    localStorage.setItem('icsc_cap_status', JSON.stringify(capStatus));
    
    // Save global message
    if (caps.globalMessage) {
        localStorage.setItem('icsc_registration_full_message', caps.globalMessage);
    }
    
    // Save registration status
    if (caps.status) {
        localStorage.setItem('icsc_registration_status', caps.status);
    }
}

// Setup Real-time Cap Validation
function setupRealTimeCapValidation() {
    const capInputs = ['attendeeCap', 'speakerCap', 'exhibitorCap', 'partnerCap'];
    
    capInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', function() {
                const value = parseInt(this.value) || 0;
                if (value < 0) {
                    this.value = 0;
                    showToast('Cap cannot be negative. Set to 0 for unlimited.', 'error');
                }
            });
        }
    });
}

// Helper: Show Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Helper: Validate Email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Auto-save registration stats (simulate real-time updates)
function updateRegistrationStats() {
    // In a real application, you would fetch this from your database
    // For simulation, we'll increment randomly occasionally
    const stats = JSON.parse(localStorage.getItem('icsc_registration_stats')) || {
        attendees: 45,
        speakers: 10,
        exhibitors: 15,
        partners: 8
    };
    
    // Simulate random new registrations
    if (Math.random() > 0.7) {
        stats.attendees += Math.floor(Math.random() * 3);
        stats.speakers += Math.floor(Math.random() * 2);
        stats.exhibitors += Math.floor(Math.random() * 2);
        stats.partners += Math.random() > 0.8 ? 1 : 0;
        
        localStorage.setItem('icsc_registration_stats', JSON.stringify(stats));
        
        // Update display if settings tab is open
        if (document.getElementById('settings').classList.contains('active')) {
            loadCurrentRegistrationStats();
        }
    }
}

// Periodically update stats (simulate real-time updates)
setInterval(updateRegistrationStats, 30000); // Update every 30 seconds

// Initialize tables
renderAttendeesTable(attendees);
updatePendingTable();

// Add event listener for ministry code to generate credentials
const ministryCodeEl = document.getElementById('ministryCode');
if (ministryCodeEl) {
    ministryCodeEl.addEventListener('input', generateMinistryCredentials);
}

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

// Dashboard script (handles Add Attendee submission + UI updates)
// - Posts form data to POST /attendees (adjust endpoint if different).
// - Requires apiClient (preferred) or falls back to axios with token from localStorage.

(function () {
	// ...existing code...
	// Add Attendee form integration
	const addForm = document.getElementById('addAttendeeForm');
	// NOTE: The main add-attendee submit handler is attached via initializeEventListeners()
	// and implemented in handleAddAttendee above. Avoid adding a second submit listener here.
	// ...existing code continues...
})();
