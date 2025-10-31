// DOM Elements
const addMinistryAttendeeForm = document.getElementById('addMinistryAttendeeForm');
const editMinistryAttendeeForm = document.getElementById('editMinistryAttendeeForm');
const successModal = document.getElementById('successModal');
const editMinistryAttendeeModal = document.getElementById('editMinistryAttendeeModal');
const deleteMinistryModal = document.getElementById('deleteMinistryModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const addAnotherBtn = document.getElementById('addAnotherBtn');
const cancelMinistryEditBtn = document.getElementById('cancelMinistryEditBtn');
const cancelMinistryDeleteBtn = document.getElementById('cancelMinistryDeleteBtn');
const confirmMinistryDeleteBtn = document.getElementById('confirmMinistryDeleteBtn');
const ministryAttendeesTable = document.getElementById('ministryAttendeesTable');
const searchMinistryAttendees = document.getElementById('searchMinistryAttendees');
const filterMinistryStatus = document.getElementById('filterMinistryStatus');
const filterMinistryDepartment = document.getElementById('filterMinistryDepartment');
const clearMinistryFiltersBtn = document.getElementById('clearMinistryFiltersBtn');

const API_BASE_URL = 'https://icsc-backend-api-code.onrender.com/api/v1';

// Tab Navigation
const tabs = document.querySelectorAll('.tab-content');
const tabLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
const pageTitle = document.getElementById('pageTitle');

// Current ministry information
const currentMinistry = {
    id: 1,
    name: 'Ministry of Finance',
    code: 'MOF',
    contactPerson: 'Permanent Secretary Finance',
    username: 'MOF2024'
};

// Sample data for demonstration - Ministry-specific attendees
let ministryAttendees = [
    {
        id: 1,
        name: 'Samuel Johnson',
        email: 's.johnson@finance.gov.ng',
        phone: '08012345678',
        nin: '12345678901',
        position: 'Assistant Director',
        gradeLevel: 'Assistant Director',
        ministry: 'Ministry of Finance',
        department: 'Audit',
        agency: 'Office of the Accountant General',
        staffId: 'MOF/AD/001',
        office: 'Abuja HQ',
        status: 'Pending',
        remarks: '',
        addedBy: 'Ministry',
        dateAdded: '2023-10-20'
    },
    {
        id: 2,
        name: 'Fatima Bello',
        email: 'f.bello@finance.gov.ng',
        phone: '08023456789',
        nin: '23456789012',
        position: 'Chief Officer',
        gradeLevel: 'Chief Officer',
        ministry: 'Ministry of Finance',
        department: 'Treasury',
        agency: 'National Treasury',
        staffId: 'MOF/CO/045',
        office: 'Abuja HQ',
        status: 'Approved',
        remarks: '',
        addedBy: 'Ministry',
        dateAdded: '2023-10-22'
    },
    {
        id: 3,
        name: 'Michael Adekunle',
        email: 'm.adekunle@finance.gov.ng',
        phone: '08034567890',
        nin: '34567890123',
        position: 'Senior Officer',
        gradeLevel: 'Senior Officer',
        ministry: 'Ministry of Finance',
        department: 'Budget & Planning',
        agency: 'Budget Office of the Federation',
        staffId: 'MOF/SO/128',
        office: 'Abuja HQ',
        status: 'Approved',
        remarks: '',
        addedBy: 'Ministry',
        dateAdded: '2023-10-23'
    }
];

// Current attendee being edited or deleted
let currentMinistryAttendeeId = null;

// NEW: load attendees from backend and normalize
async function loadMinistryAttendees() {
    // Prefer global apiClient if available (sets Authorization header)
    try {
        if (window.apiClient) {
            const res = await window.apiClient.get('/user/attendees');
            // normalise response payload: possible shapes: array, { attendees: [...] }, { data: [...] }, { data: { attendees: [...] } }
            let payload = res?.data;
            if (!payload) throw new Error('Empty response');
            // drill into common wrappers
            if (payload.data && (Array.isArray(payload.data) || payload.data.attendees)) payload = payload.data;
            let list = Array.isArray(payload) ? payload : (payload.attendees || payload.items || payload.results || []);
            if (!Array.isArray(list)) list = [];

            // Normalize each item to expected UI shape
            ministryAttendees = list.map(item => {
                return {
                    id: item.id || item._id || item.attendee_id || null,
                    name: item.name || item.fullName || item.fullname || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                    email: item.email || item.emailAddress || item.email_address || '',
                    phone: item.phone || item.phoneNumber || item.phone_number || '',
                    nin: item.nin || item.national_id || item.nationalId || '',
                    position: item.position || item.job_title || item.role || '',
                    gradeLevel: item.gradeLevel || item.grade_level || item.rank || '',
                    ministry: item.ministry || item.organization_name || item.organization || currentMinistry.name,
                    department: item.department || item.dept || '',
                    agency: item.agency || item.department_agency || '',
                    staffId: item.staffId || item.staff_id || '',
                    office: item.office || item.office_location || '',
                    status: (item.status || item.verification_status || 'Pending'),
                    remarks: item.remarks || item.note || '',
                    addedBy: item.addedBy || item.createdBy || '',
                    dateAdded: item.dateAdded || item.createdAt || item.added_at || ''
                };
            });

            // Render
            renderMinistryAttendeesTable(ministryAttendees);
            updateMinistryStats();
            return;
        }

        // Fallback: use fetch with full URL if apiClient not available
        const FALLBACK_URL = `${API_BASE_URL}/user/attendees`;
        // obtain token from auth helper or legacy storage
        const authFromHelper = (window.Auth && typeof window.Auth.getAuth === 'function') ? window.Auth.getAuth() : null;
        let token = authFromHelper?.token || null;
        if (!token) {
            try {
                const raw = localStorage.getItem('authUser') || localStorage.getItem('user');
                const parsed = raw ? JSON.parse(raw) : null;
                token = parsed?.token || localStorage.getItem('accessToken') || null;
            } catch (e) {
                token = localStorage.getItem('accessToken') || null;
            }
        }
        if (!token) {
            console.warn('No auth token found — cannot call protected attendees endpoint (fallback).');
            throw new Error('Missing auth token');
        }
        const fallbackRes = await fetch(FALLBACK_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        if (!fallbackRes.ok) throw new Error('Failed to fetch attendees');
        const data = await fallbackRes.json();
        let list = Array.isArray(data) ? data : (data.attendees || data.data || []);
        if (!Array.isArray(list)) list = [];
        ministryAttendees = list.map(item => ({
            id: item.id || item._id || null,
            name: item.name || item.fullName || item.fullname || '',
            email: item.email || '',
            phone: item.phone_number || '',
            nin: item.nin || '',
            position: item.position || '',
            gradeLevel: item.grade || '',
            ministry: item.organization || currentMinistry.name,
            department: item.department || '',
            agency: item.department_agency || '',
            staffId: item.staff_id || '',
            office: item.office_location || '',
            status: item.status || 'Pending',
            remarks: item.remark || '',
            addedBy: item.addedBy || '',
            dateAdded: item.dateAdded || ''
        }));

        renderMinistryAttendeesTable(ministryAttendees);
        updateMinistryStats();
    } catch (err) {
        console.error('Failed to load ministry attendees:', err);
        // keep current sample data as fallback (already present)
        renderMinistryAttendeesTable(ministryAttendees);
        updateMinistryStats();
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    updateMinistryStats();
    displayMinistryInfo();
    // load from backend and populate table (overrides sample data)
    loadMinistryAttendees();
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
        'dashboard': 'Ministry Dashboard',
        'attendees': 'My Attendees',
        'add-attendee': 'Add New Attendee',
        'reports': 'Reports & Analytics',
        'settings': 'Ministry Settings'
    };
    return titles[tabId] || 'Ministry Dashboard';
}

// Event Listeners
function initializeEventListeners() {
    // Form submissions
    addMinistryAttendeeForm.addEventListener('submit', handleAddMinistryAttendee);
    editMinistryAttendeeForm.addEventListener('submit', handleEditMinistryAttendee);
    
    // Modal controls
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            successModal.classList.remove('active');
            editMinistryAttendeeModal.classList.remove('active');
            deleteMinistryModal.classList.remove('active');
        });
    });
    
    addAnotherBtn.addEventListener('click', function() {
        successModal.classList.remove('active');
    });
    
    cancelMinistryEditBtn.addEventListener('click', function() {
        editMinistryAttendeeModal.classList.remove('active');
    });
    
    cancelMinistryDeleteBtn.addEventListener('click', function() {
        deleteMinistryModal.classList.remove('active');
    });
    
    confirmMinistryDeleteBtn.addEventListener('click', handleDeleteMinistryAttendee);
    
    // Search and filter
    searchMinistryAttendees.addEventListener('input', filterMinistryAttendees);
    filterMinistryStatus.addEventListener('change', filterMinistryAttendees);
    filterMinistryDepartment.addEventListener('change', filterMinistryAttendees);
    clearMinistryFiltersBtn.addEventListener('click', clearMinistryFilters);
    
    // Edit and delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-ministry-attendee-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            openEditMinistryModal(attendeeId);
        }
        
        if (e.target.classList.contains('delete-ministry-attendee-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = parseInt(row.getAttribute('data-id'));
            const attendeeName = row.cells[0].textContent;
            openDeleteMinistryModal(attendeeId, attendeeName);
        }
    });
    
    // Refresh buttons
    document.getElementById('refreshMinistryActivityBtn').addEventListener('click', function() {
        loadMinistryAttendees();
    });
    
    // Export button
    document.getElementById('exportMinistryAttendeesBtn').addEventListener('click', function() {
        // Simple CSV export of current ministryAttendees array
        if (!ministryAttendees || ministryAttendees.length === 0) {
            alert('No attendees to export.');
            return;
        }
        const headers = ['Name','Email','NIN','Position','Department','Agency','Status'];
        const csvRows = [
            headers.join(','),
            ...ministryAttendees.map(r => [
                `"${(r.name || '').replace(/"/g,'""')}"`,
                `"${(r.email || '').replace(/"/g,'""')}"`,
                `"${(r.nin || '').replace(/"/g,'""')}"`,
                `"${(r.position || '').replace(/"/g,'""')}"`,
                `"${(r.department || '').replace(/"/g,'""')}"`,
                `"${(r.agency || '').replace(/"/g,'""')}"`,
                `"${(r.status || '').replace(/"/g,'""')}"`
            ].join(',')).join('\n')
        ].join('\n');
        const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ministry_attendees.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Form Handlers
async function handleAddMinistryAttendee(e) {
    e.preventDefault();

    // Disable submit while processing
    const submitBtn = addMinistryAttendeeForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Collect form data
    const formPayload = {
        fullname: document.getElementById('ministryAttendeeName').value,
        email: document.getElementById('ministryAttendeeEmail').value,
        phone_number: document.getElementById('ministryAttendeePhone').value,
        nin: document.getElementById('ministryAttendeeNIN').value,
        position: document.getElementById('ministryAttendeePosition').value,
        grade: document.getElementById('ministryAttendeeGradeLevel').value,
        organization: currentMinistry.name,
        department: document.getElementById('ministryAttendeeDepartment').value,
        department_agency: document.getElementById('ministryAttendeeAgency').value,
        staff_id: document.getElementById('ministryAttendeeStaffId').value,
        office_location: document.getElementById('ministryAttendeeOffice').value,
        remark: document.getElementById('ministryAttendeeRemarks').value,
        status: 'Pending'
    };

    try {
        let saved = null;

        // Prefer global apiClient if available (it may set Authorization header)
        if (window.apiClient && typeof window.apiClient.post === 'function') {
            const res = await window.apiClient.post('/user/create-attendee', formPayload);
            const payload = res?.data ?? res;
            // extract attendee object from common wrappers
            saved = payload?.attendee || payload?.data || payload;
        } else {
            // Fallback: use fetch with full URL if apiClient not available
            const FALLBACK_URL = `${API_BASE_URL}/user/create-attendee`;
            // obtain token from auth helper or legacy storage
            const authFromHelper = (window.Auth && typeof window.Auth.getAuth === 'function') ? window.Auth.getAuth() : null;
            let token = authFromHelper?.token || null;
            if (!token) {
                try {
                    const raw = localStorage.getItem('authUser') || localStorage.getItem('user');
                    const parsed = raw ? JSON.parse(raw) : null;
                    token = parsed?.token || localStorage.getItem('accessToken') || null;
                } catch (err) {
                    token = localStorage.getItem('accessToken') || null;
                }
            }

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const response = await fetch(FALLBACK_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(formPayload)
            });

            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                throw new Error('Failed to add attendee: ' + (txt || response.status));
            }
            const data = await response.json().catch(() => null);
            saved = data?.attendee || data?.data || data;
        }

        // If server didn't return a saved attendee, fall back to using client-side generated item
        const nowDate = new Date().toISOString().split('T')[0];
        const newAttendee = {
            id: saved?.id || saved?._id || (ministryAttendees.length > 0 ? Math.max(...ministryAttendees.map(a => a.id || 0)) + 1 : 1),
            name: saved?.fullname || formPayload.name || '',
            email: saved?.email || formPayload.email || '',
            phone: saved?.phone_number || formPayload.phone || '',
            nin: saved?.nin || formPayload.nin || '',
            position: saved?.position || formPayload.position || '',
            gradeLevel: saved?.grade || saved?.grade_level || formPayload.gradeLevel || '',
            ministry: saved?.organization || formPayload.ministry || currentMinistry.name,
            department: saved?.department || formPayload.department || '',
            agency: saved?.department_agency || formPayload.agency || '',
            staffId: saved?.staff_id || saved?.staff_id || formPayload.staffId || '',
            office: saved?.office_location || formPayload.office || '',
            status: saved?.status || 'Pending', // default to Pending
            remarks: saved?.remark || formPayload.remarks || '',
            addedBy: saved?.addedBy || 'Ministry',
            dateAdded: saved?.dateAdded || saved?.createdAt || nowDate
        };

        // Persist in local array and update UI
        ministryAttendees.push(newAttendee);
        renderMinistryAttendeesTable(ministryAttendees);
        updateMinistryStats();

        // Optional compatibility: still log/send to Super Admin workflow
        sendToSuperAdminForApproval(newAttendee);

        // Show success message
        document.getElementById('successMessage').textContent = 'Attendee has been successfully added!';
        successModal.classList.add('active');

        // Reset form
        addMinistryAttendeeForm.reset();
    } catch (err) {
        console.error('Failed to add attendee:', err);
        alert('Failed to add attendee. Please try again.');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

function handleEditMinistryAttendee(e) {
    e.preventDefault();
    
    // Update attendee data
    const attendeeIndex = ministryAttendees.findIndex(a => a.id === currentMinistryAttendeeId);
    if (attendeeIndex !== -1) {
        ministryAttendees[attendeeIndex] = {
            ...ministryAttendees[attendeeIndex],
            name: document.getElementById('editMinistryAttendeeName').value,
            email: document.getElementById('editMinistryAttendeeEmail').value,
            phone: document.getElementById('editMinistryAttendeePhone').value,
            nin: document.getElementById('editMinistryAttendeeNIN').value,
            position: document.getElementById('editMinistryAttendeePosition').value,
            gradeLevel: document.getElementById('editMinistryAttendeeGradeLevel').value,
            department: document.getElementById('editMinistryAttendeeDepartment').value,
            agency: document.getElementById('editMinistryAttendeeAgency').value,
            staffId: document.getElementById('editMinistryAttendeeStaffId').value,
            office: document.getElementById('editMinistryAttendeeOffice').value,
            remarks: document.getElementById('editMinistryAttendeeRemarks').value
        };
        
        // Update UI
        updateMinistryAttendeesTable();
        updateMinistryStats();
        
        // Show success message
        document.getElementById('successMessage').textContent = 'Attendee has been successfully updated!';
        successModal.classList.add('active');
        
        // Close modal
        editMinistryAttendeeModal.classList.remove('active');
    }
}

async function handleDeleteMinistryAttendee() {
    // Disable confirm button while processing
    const btn = confirmMinistryDeleteBtn;
    if (btn) btn.disabled = true;

    try {
        if (!currentMinistryAttendeeId) throw new Error('No attendee selected for deletion');

        let deleted = false;

        // Prefer global apiClient if available
        if (window.apiClient && typeof window.apiClient.delete === 'function') {
            // try RESTful delete
            const res = await window.apiClient.delete(`/user/delete-attendee?attendee_id=${currentMinistryAttendeeId}`);
            // consider success if response status is OK or response.data indicates success
            deleted = (res && (res.status >= 200 && res.status < 300)) || Boolean(res?.data);
        } else {
            // Fallback using fetch
            // obtain token from auth helper or legacy storage
            const authFromHelper = (window.Auth && typeof window.Auth.getAuth === 'function') ? window.Auth.getAuth() : null;
            let token = authFromHelper?.token || null;
            if (!token) {
                try {
                    const raw = localStorage.getItem('authUser') || localStorage.getItem('user');
                    const parsed = raw ? JSON.parse(raw) : null;
                    token = parsed?.token || localStorage.getItem('accessToken') || null;
                } catch (e) {
                    token = localStorage.getItem('accessToken') || null;
                }
            }

            const deleteUrl = `${API_BASE_URL}/user/delete-attendee?attendee_id=${currentMinistryAttendeeId}`;
            let response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': 'Bearer ' + token } : {})
                }
            });

            if (response.ok) {
                deleted = true;
            } else {
                // Attempt fallback endpoint that expects POST { id }
                const fallbackUrl = `${API_BASE_URL}/user/delete-attendee`;
                const fallbackRes = await fetch(fallbackUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
                    },
                    body: JSON.stringify({ id: currentMinistryAttendeeId })
                });

                if (fallbackRes.ok) {
                    deleted = true;
                } else {
                    // bubble up error for unified handling
                    const txt = await response.text().catch(() => '');
                    throw new Error('Delete request failed: ' + (txt || response.status));
                }
            }
        }

        if (!deleted) throw new Error('Delete operation did not succeed');

        // Remove attendee from local array and update UI
        ministryAttendees = ministryAttendees.filter(a => a.id !== currentMinistryAttendeeId);
        renderMinistryAttendeesTable(ministryAttendees);
        updateMinistryStats();

        // Show success message
        document.getElementById('successMessage').textContent = 'Attendee has been successfully deleted!';
        successModal.classList.add('active');

        // Close delete modal
        deleteMinistryModal.classList.remove('active');
    } catch (err) {
        console.error('Failed to delete attendee:', err);
        alert('Failed to delete attendee. Please try again.');
    } finally {
        if (btn) btn.disabled = false;
        currentMinistryAttendeeId = null;
    }
}

// Modal Functions
function openEditMinistryModal(attendeeId) {
    const attendee = ministryAttendees.find(a => a.id === attendeeId);
    if (attendee) {
        currentMinistryAttendeeId = attendeeId;
        
        // Populate form with attendee data
        document.getElementById('editMinistryAttendeeName').value = attendee.name;
        document.getElementById('editMinistryAttendeeEmail').value = attendee.email;
        document.getElementById('editMinistryAttendeePhone').value = attendee.phone;
        document.getElementById('editMinistryAttendeeNIN').value = attendee.nin;
        document.getElementById('editMinistryAttendeePosition').value = attendee.position;
        document.getElementById('editMinistryAttendeeGradeLevel').value = attendee.gradeLevel;
        document.getElementById('editMinistryAttendeeDepartment').value = attendee.department;
        document.getElementById('editMinistryAttendeeAgency').value = attendee.agency;
        document.getElementById('editMinistryAttendeeStaffId').value = attendee.staffId;
        document.getElementById('editMinistryAttendeeOffice').value = attendee.office;
        document.getElementById('editMinistryAttendeeRemarks').value = attendee.remarks;
        
        // Show modal
        editMinistryAttendeeModal.classList.add('active');
    }
}

function openDeleteMinistryModal(attendeeId, attendeeName) {
    currentMinistryAttendeeId = attendeeId;
    document.getElementById('deleteMinistryAttendeeName').textContent = attendeeName;
    deleteMinistryModal.classList.add('active');
}

// Search and Filter Functions
function filterMinistryAttendees() {
    const searchTerm = searchMinistryAttendees.value.toLowerCase();
    const statusFilter = filterMinistryStatus.value;
    const departmentFilter = filterMinistryDepartment.value;
    
    const filteredAttendees = ministryAttendees.filter(attendee => {
        const matchesSearch = 
            attendee.name.toLowerCase().includes(searchTerm) ||
            attendee.email.toLowerCase().includes(searchTerm) ||
            attendee.nin.includes(searchTerm) ||
            attendee.position.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter ? attendee.status === statusFilter : true;
        const matchesDepartment = departmentFilter ? attendee.department === departmentFilter : true;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    renderMinistryAttendeesTable(filteredAttendees);
}

function clearMinistryFilters() {
    searchMinistryAttendees.value = '';
    filterMinistryStatus.value = '';
    filterMinistryDepartment.value = '';
    renderMinistryAttendeesTable(ministryAttendees);
}

// Super Admin Integration
function sendToSuperAdminForApproval(attendeeData) {
    // In a real application, this would be an API call to the Super Admin system
    console.log('Sending attendee to Super Admin for approval:', attendeeData);
    
    // Simulate API call
    setTimeout(() => {
        console.log('Attendee sent to Super Admin successfully. Pending approval.');
    }, 1000);
}

// UI Update Functions
function displayMinistryInfo() {
    document.getElementById('currentMinistryName').textContent = currentMinistry.name;
    document.getElementById('currentMinistryCode').textContent = currentMinistry.code;
    document.getElementById('currentContactPerson').textContent = currentMinistry.contactPerson;
    document.getElementById('ministryNameDisplay').textContent = currentMinistry.name;
    document.getElementById('ministryAvatar').textContent = currentMinistry.code.substring(0, 2);
}

function updateMinistryStats() {
    const pendingCount = ministryAttendees.filter(a => a.status === 'Pending').length;
    const approvedCount = ministryAttendees.filter(a => a.status === 'Approved').length;
    const totalCount = ministryAttendees.length;
    
    document.getElementById('ministryPendingCount').textContent = pendingCount;
    document.getElementById('ministryApprovedCount').textContent = approvedCount;
    document.getElementById('ministryTotalCount').textContent = totalCount;
}

function updateMinistryAttendeesTable() {
    renderMinistryAttendeesTable(ministryAttendees);
}

function renderMinistryAttendeesTable(attendeesList) {
    let html = '';
    
    attendeesList.forEach(attendee => {
        const statusClass = `status-${attendee.status.toLowerCase()}`;
        // <button class="btn btn-success btn-sm edit-ministry-attendee-btn">Edit</button>
        html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name}</td>
                <td>${attendee.email}</td>
                <td>${attendee.nin}</td>
                <td>${attendee.position}</td>
                <td>${attendee.department}</td>
                <td>${attendee.agency}</td>
                <td><span class="status-badge ${statusClass}">${attendee.status}</span></td>
                <td>
                    <div class="action-buttons">
                        
                        <button class="btn btn-danger btn-sm delete-ministry-attendee-btn">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    ministryAttendeesTable.innerHTML = html;
}

// Initialize tables
renderMinistryAttendeesTable(ministryAttendees);