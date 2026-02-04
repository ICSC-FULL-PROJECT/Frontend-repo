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

const API_BASE_URL = 'http://localhost:9100/api/v1';
// const API_BASE_URL = 'https://icsc-backend-api.afrikfarm.com/api/v1';

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
let ministryAttendees = [];

// Current attendee being edited or deleted
let currentMinistryAttendeeId = null;

// NEW: load attendees from backend and normalize
async function loadMinistryAttendees() {
    // Load cached data first
    const cachedData = localStorage.getItem('ministryAttendeesData');
    console.log('Cached data:', cachedData);
    if (cachedData) {
        try {
            ministryAttendees = JSON.parse(cachedData);
            console.log('Loaded from cache:', ministryAttendees.length, 'attendees');
            renderMinistryAttendeesTable(ministryAttendees);
            renderRecentActivity();
        } catch (e) {
            console.error('Failed to load cached attendees:', e);
        }
    } else {
        console.log('No cached data found');
    }

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

            // Save to cache
            localStorage.setItem('ministryAttendeesData', JSON.stringify(ministryAttendees));
            console.log('Saved to cache:', ministryAttendees.length, 'attendees');

            // Render
            renderMinistryAttendeesTable(ministryAttendees);
            renderRecentActivity();
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

        // Save to cache
        localStorage.setItem('ministryAttendeesData', JSON.stringify(ministryAttendees));
        console.log('Saved to cache (fallback):', ministryAttendees.length, 'attendees');

        renderMinistryAttendeesTable(ministryAttendees);
        renderRecentActivity();
    } catch (err) {
        console.error('Failed to load ministry attendees:', err);
        // keep current sample data as fallback (already present)
        renderMinistryAttendeesTable(ministryAttendees);
        renderRecentActivity();
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    displayMinistryInfo();
    // renderRecentActivity(); // Removed initial render to avoid mock data
    // load from backend and populate table (overrides sample data)
    loadMinistryAttendees();

    const userData = localStorage.getItem("user");

    if (userData) {
        try {
            const user = JSON.parse(userData);

            document.getElementById("ministryAttendeeOrganization").value =
                user.ministryName || "";
        } catch (error) {
            console.error("Invalid user data in localStorage");
        }
    }
    
    // Initialize ministry-specific fields
    const ministryName = document.getElementById('ministryNameDisplay').textContent;
    document.getElementById('editMinistryAttendeeMinistry').value = ministryName;
    
    // Initialize CSV upload event listeners
    const ministryExcelFileInput = document.getElementById('ministryExcelFile');
    const ministryUploadExcelBtn = document.getElementById('ministryUploadExcelBtn');
    const ministryDownloadTemplateBtn = document.getElementById('ministryDownloadTemplateBtn');
    
    // Download Template for Ministry
    ministryDownloadTemplateBtn.addEventListener('click', function() {
        downloadTemplate();
    });
    
    // Upload CSV File for Ministry
    ministryUploadExcelBtn.addEventListener('click', function() {
        if (!ministryExcelFileInput.files.length) {
            alert('Please select a CSV file first.');
            return;
        }
        
        const file = ministryExcelFileInput.files[0];
        
        // Check file type (CSV)
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Please select a CSV file.');
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }
        
        uploadCsvFile(file);
    });
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
        // Reset form
        addMinistryAttendeeForm.reset();
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

// Password toggle function
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentElement.querySelector('.password-toggle-btn');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Helper function to get auth token
function getAuthToken() {
    try {
        // Check if Auth helper exists
        if (window.Auth && typeof window.Auth.getAuth === 'function') {
            const auth = window.Auth.getAuth();
            if (auth && auth.token) return auth.token;
        }
        
        // Check localStorage
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
            const parsed = JSON.parse(authUser);
            if (parsed && parsed.token) return parsed.token;
        }
        
        // Check other possible storage keys
        const tokenKeys = ['accessToken', 'token', 'auth_token', 'jwtToken'];
        for (const key of tokenKeys) {
            const token = localStorage.getItem(key);
            if (token) return token;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

// Helper function to upload CSV file
async function uploadCsvFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/user/attendees/upload-csv`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        showSuccessMessage('CSV file uploaded successfully!');
        // Reload attendees to reflect changes
        loadMinistryAttendees();
    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload CSV file: ${error.message}`);
    }
}

// Helper function to download template
async function downloadTemplate() {
    try {
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/user/download-template`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'participant_template.csv'; // or whatever the server sends
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download error:', error);
        alert(`Failed to download template: ${error.message}`);
    }
}

// Add this CSS for password toggle button
const style = document.createElement('style');
style.textContent = `
.password-input-container {
    position: relative;
}
.password-toggle-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
}
.alert-info {
    background-color: #d1ecf1;
    border-color: #bee5eb;
    color: #0c5460;
    padding: 15px;
    border-radius: 4px;
    margin: 20px 0;
}
`;
document.head.appendChild(style);

// Form Handlers
async function handleAddMinistryAttendee(e) {
    e.preventDefault();

    // Disable submit while processing
    const submitBtn = addMinistryAttendeeForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Collect form data
   const formPayload = {
    prefix: document.getElementById('ministryAttendeePrefix').value,
    firstName: document.getElementById('ministryAttendeeFirstName').value,
    lastName: document.getElementById('ministryAttendeeLastName').value,
    email: document.getElementById('ministryAttendeeEmail').value,
    password: document.getElementById('ministryAttendeePassword').value,
    position: document.getElementById('ministryAttendeeJobTitle').value,
    organization: document.getElementById('ministryAttendeeOrganization').value,
    workPhone: document.getElementById('ministryAttendeeWorkPhone').value,
    phone_number: document.getElementById('ministryAttendeePhone').value,
    nin: document.getElementById('ministryAttendeeNIN').value,
    // position: document.getElementById('ministryAttendeePosition').value,
    grade: document.getElementById('ministryAttendeeGradeLevel').value,
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
            const token = getAuthToken();

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
            name: saved?.fullname || `${formPayload.firstName} ${formPayload.lastName}`,
            email: saved?.email || formPayload.email || '',
            phone: saved?.phone_number || formPayload.phone_number || '',
            nin: saved?.nin || formPayload.nin || '',
            position: saved?.position || formPayload.position || '',
            gradeLevel: saved?.grade || saved?.grade_level || formPayload.grade || '',
            ministry: saved?.organization || formPayload.ministry || currentMinistry.name,
            department: saved?.department || formPayload.department || '',
            agency: saved?.department_agency || formPayload.department_agency || '',
            staffId: saved?.staff_id || saved?.staff_id || formPayload.staff_id || '',
            office: saved?.office_location || formPayload.office_location || '',
            status: saved?.status || 'Pending', // default to Pending
            remarks: saved?.remark || formPayload.remark || '',
            addedBy: saved?.addedBy || 'Ministry',
            dateAdded: saved?.dateAdded || saved?.createdAt || nowDate
        };

        // Persist in local array and update UI
        ministryAttendees.push(newAttendee);
        localStorage.setItem('ministryAttendeesData', JSON.stringify(ministryAttendees));
        console.log('Saved to cache after add:', ministryAttendees.length, 'attendees');
        renderMinistryAttendeesTable(ministryAttendees);
        await loadMinistryData();

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
        const prefix = document.getElementById('editMinistryAttendeePrefix').value;
        const firstName = document.getElementById('editMinistryAttendeeFirstName').value;
        const lastName = document.getElementById('editMinistryAttendeeLastName').value;
        
        ministryAttendees[attendeeIndex] = {
            ...ministryAttendees[attendeeIndex],
            name: `${prefix} ${firstName} ${lastName}`.trim(),
            email: document.getElementById('editMinistryAttendeeEmail').value,
            phone: document.getElementById('editMinistryAttendeePhone').value,
            nin: document.getElementById('editMinistryAttendeeNIN').value,
            position: document.getElementById('editMinistryAttendeePosition').value,
            gradeLevel: document.getElementById('editMinistryAttendeeGradeLevel').value,
            department: document.getElementById('editMinistryAttendeeDepartment').value,
            agency: document.getElementById('editMinistryAttendeeAgency').value,
            staffId: document.getElementById('editMinistryAttendeeStaffId').value,
            office: document.getElementById('editMinistryAttendeeOffice').value,
            remarks: document.getElementById('editMinistryAttendeeRemarks').value,
            status: document.getElementById('editMinistryAttendeeStatus').value
        };
        
        // Save to cache
        localStorage.setItem('ministryAttendeesData', JSON.stringify(ministryAttendees));
        console.log('Saved to cache after edit:', ministryAttendees.length, 'attendees');
        
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
            const token = getAuthToken();

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
        localStorage.setItem('ministryAttendeesData', JSON.stringify(ministryAttendees));
        console.log('Saved to cache after delete:', ministryAttendees.length, 'attendees');
        renderMinistryAttendeesTable(ministryAttendees);
        await loadMinistryData();

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
        
        // Parse name into prefix, first, last if needed
        const nameParts = attendee.name.split(' ');
        let firstName = '', lastName = '', prefix = 'Mr';
        
        if (nameParts.length >= 2) {
            // Check if first part is a prefix
            const possiblePrefixes = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
            if (possiblePrefixes.includes(nameParts[0])) {
                prefix = nameParts[0];
                firstName = nameParts[1] || '';
                lastName = nameParts.slice(2).join(' ') || '';
            } else {
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
            }
        } else {
            firstName = attendee.name;
        }
        
        // Populate form with attendee data
        document.getElementById('editMinistryAttendeePrefix').value = prefix;
        document.getElementById('editMinistryAttendeeFirstName').value = firstName;
        document.getElementById('editMinistryAttendeeLastName').value = lastName;
        document.getElementById('editMinistryAttendeeEmail').value = attendee.email;
        document.getElementById('editMinistryAttendeePassword').value = '********'; // Placeholder
        document.getElementById('editMinistryAttendeeJobTitle').value = attendee.position || '';
        document.getElementById('editMinistryAttendeeWorkPhone').value = attendee.phone || '';
        document.getElementById('editMinistryAttendeePhone').value = attendee.phone || '';
        document.getElementById('editMinistryAttendeeNIN').value = attendee.nin;
        document.getElementById('editMinistryAttendeePosition').value = attendee.position;
        document.getElementById('editMinistryAttendeeGradeLevel').value = attendee.gradeLevel;
        document.getElementById('editMinistryAttendeeMinistry').value = attendee.ministry;
        document.getElementById('editMinistryAttendeeDepartment').value = attendee.department;
        document.getElementById('editMinistryAttendeeAgency').value = attendee.agency;
        document.getElementById('editMinistryAttendeeStaffId').value = attendee.staffId;
        document.getElementById('editMinistryAttendeeOffice').value = attendee.office;
        document.getElementById('editMinistryAttendeeRemarks').value = attendee.remarks;
        document.getElementById('editMinistryAttendeeStatus').value = attendee.status;
        
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
        html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name}</td>
                <td>${attendee.email}</td>
                <td>${attendee.position || ''}</td>
                <td>${attendee.phone || ''}</td>
                
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm edit-ministry-attendee-btn">Edit</button>
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

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showSuccessMessage(message) {
    // You can implement a toast notification or use the existing success modal
    const successModal = document.getElementById('successModal');
    const successMessage = document.getElementById('successMessage');
    
    if (successModal && successMessage) {
        successMessage.textContent = message;
        successModal.style.display = 'flex';
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            successModal.style.display = 'none';
        }, 3000);
    } else {
        // Fallback to alert if modal not found
        alert(message);
    }
}
// ministry-dashboard.js - Updated with simplified Settings tab functionality

// Global variables
let currentMinistryData = {};
let currentEditingId = null;

// Tab switching functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the dashboard
    initMinistryDashboard();
    
    // Load initial data
    await loadMinistryData();
    
    // Tab switching for main navigation
    const tabLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
    tabLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            await switchTab(tabId);
            
            // Update active state in sidebar
            tabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            document.getElementById('pageTitle').textContent = this.textContent.trim() + ' - Ministry Dashboard';
        });
    });
    
    // Settings tab switching
    const settingsTabs = document.querySelectorAll('.settings-tab-btn');
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all settings tabs
            settingsTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add Attendee Form Submission
    document.getElementById('addMinistryAttendeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addMinistryAttendee();
    });
    
    // Search functionality for attendees
    document.getElementById('searchMinistryAttendees').addEventListener('input', function() {
        filterAttendees();
    });
    
    // Filter functionality
    document.getElementById('filterMinistryStatus').addEventListener('change', filterAttendees);
    document.getElementById('filterMinistryDepartment').addEventListener('change', filterAttendees);
    
    // Clear filters
    document.getElementById('clearMinistryFiltersBtn').addEventListener('click', function() {
        document.getElementById('searchMinistryAttendees').value = '';
        document.getElementById('filterMinistryStatus').value = '';
        document.getElementById('filterMinistryDepartment').value = '';
        filterAttendees();
    });
    
    // Export attendees
    document.getElementById('exportMinistryAttendeesBtn').addEventListener('click', exportAttendees);
    
    // Edit and Delete buttons (event delegation)
    document.getElementById('ministryAttendeesTable').addEventListener('click', function(e) {
        if (e.target.closest('.edit-ministry-attendee-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = row.getAttribute('data-id');
            editAttendee(attendeeId);
        }
        
        if (e.target.closest('.delete-ministry-attendee-btn')) {
            const row = e.target.closest('tr');
            const attendeeId = row.getAttribute('data-id');
            const attendeeName = row.querySelector('td:first-child').textContent;
            confirmDeleteAttendee(attendeeId, attendeeName);
        }
    });
    
    // Edit Attendee Form Submission
    document.getElementById('editMinistryAttendeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateAttendee();
    });
    
    // Cancel Edit
    document.getElementById('cancelMinistryEditBtn').addEventListener('click', function() {
        closeModal('editMinistryAttendeeModal');
    });
    
    // Delete Attendee Modal Actions
    document.getElementById('cancelMinistryDeleteBtn').addEventListener('click', function() {
        closeModal('deleteMinistryModal');
    });
    
    document.getElementById('confirmMinistryDeleteBtn').addEventListener('click', function() {
        deleteAttendee();
    });
    
    // Save General Settings
    document.getElementById('saveMinistrySettingsBtn').addEventListener('click', function() {
        saveGeneralSettings();
    });
    
    // Password Change Form
    document.getElementById('ministryPasswordSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
    
    // Cancel Password Change
    document.getElementById('cancelPasswordChangeBtn').addEventListener('click', function() {
        resetPasswordForm();
    });
    
    // Password strength and match validation
    document.getElementById('newPassword').addEventListener('input', checkPasswordStrength);
    document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);
    
    // Logout
    document.getElementById('ministryLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Success Modal - Add Another
    document.getElementById('addAnotherBtn').addEventListener('click', async function() {
        closeModal('successModal');
        document.getElementById('addMinistryAttendeeForm').reset();
        await switchTab('add-attendee');
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
});

// Initialize dashboard
function initMinistryDashboard() {
    const userData = localStorage.getItem("user");
    if (!userData) {
        console.warn("No user data found in localStorage");
        return;
    }

    let user;
    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Invalid user data in localStorage", error);
        return;
    }

    // Normalize values
    const ministryName = user.ministryName || "—";
    const ministryCode = user.ministryCode || "—";
    const contactPerson =
        user.contactPerson || user.contact_person || "—";
    const contactEmail =
        user.contactEmail || user.contact_person_email || "";

    // Header / dashboard info
    setText("currentMinistryName", ministryName);
    setText("currentMinistryCode", ministryCode);
    setText("currentContactPerson", contactPerson);
    setText("ministryNameDisplay", ministryName);
    setText("ministryAvatar", ministryCode.substring(0, 2));

    // Forms
    setValue("editMinistryAttendeeMinistry", ministryName);

    // Settings form
    setValue("ministryDisplayName", ministryName);
    setValue("ministryCode", ministryCode);
    setValue("primaryContactName", contactPerson);
    setValue("primaryContactEmail", contactEmail);
}

/*************************************************
 * SAFE DOM HELPERS
 *************************************************/
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}


// Load ministry data
async function loadMinistryData() {
    try {
        // Prefer global apiClient if available (sets Authorization header)
        if (window.apiClient) {
            const res = await window.apiClient.get('/user/attendee-stats');
            const payload = res?.data;
            if (!payload) throw new Error('Empty response');
            const stats = payload.data;
            
            // Update counts
            document.getElementById('ministryPendingCount').textContent = stats.pendingAttendees || 0;
            document.getElementById('ministryApprovedCount').textContent = stats.approvedAttendees || 0;
            document.getElementById('ministryTotalCount').textContent = stats.totalAttendees || 0;
            return;
        }

        // Fallback: use fetch with full URL if apiClient not available
        const FALLBACK_URL = `${API_BASE_URL}/user/attendee-stats`;
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
            console.warn('No auth token found — cannot call protected stats endpoint (fallback).');
            throw new Error('Missing auth token');
        }
        const fallbackRes = await fetch(FALLBACK_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        if (!fallbackRes.ok) throw new Error('Failed to fetch stats');
        const data = await fallbackRes.json();
        const stats = data.data;
        
        // Update counts
        document.getElementById('ministryPendingCount').textContent = stats.pendingAttendees || 0;
        document.getElementById('ministryApprovedCount').textContent = stats.approvedAttendees || 0;
        document.getElementById('ministryTotalCount').textContent = stats.totalAttendees || 0;
    } catch (err) {
        console.error('Failed to load ministry stats:', err);
        // Fallback to mock data
        const mockData = {
            pending: 0,
            approved: 0,
            total: 0
        };
        document.getElementById('ministryPendingCount').textContent = mockData.pending;
        document.getElementById('ministryApprovedCount').textContent = mockData.approved;
        document.getElementById('ministryTotalCount').textContent = mockData.total;
    }

}

// Switch between tabs
async function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // If switching to dashboard, refresh data
    if (tabId === 'dashboard') {
        await loadMinistryData();
    }
    
    // If switching to attendees, load attendees data
    if (tabId === 'attendees') {
        await loadMinistryAttendees();
    }
}

// Add new attendee
async function addMinistryAttendee() {
    const form = document.getElementById('addMinistryAttendeeForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const attendeeData = {
        prefix: document.getElementById('ministryAttendeePrefix').value,
        firstName: document.getElementById('ministryAttendeeFirstName').value,
        lastName: document.getElementById('ministryAttendeeLastName').value,
        email: document.getElementById('ministryAttendeeEmail').value,
        jobTitle: document.getElementById('ministryAttendeeJobTitle').value,
        organization: document.getElementById('ministryAttendeeOrganization').value,
        workPhone: document.getElementById('ministryAttendeeWorkPhone').value,
        phone: document.getElementById('ministryAttendeePhone').value,
        position: document.getElementById('ministryAttendeePosition').value,
        gradeLevel: document.getElementById('ministryAttendeeGradeLevel').value,
        department: document.getElementById('ministryAttendeeDepartment').value,
        agency: document.getElementById('ministryAttendeeAgency').value,
        staffId: document.getElementById('ministryAttendeeStaffId').value,
        office: document.getElementById('ministryAttendeeOffice').value,
        remarks: document.getElementById('ministryAttendeeRemarks').value,
        status: 'Pending',
        addedBy: currentMinistryData.name,
        addedDate: new Date().toISOString()
    };
    
    // In a real app, this would be an API call
    console.log('Adding attendee:', attendeeData);

    formPayload = {
        prefix: attendeeData.prefix,
        fullname: `${attendeeData.firstName} ${attendeeData.lastName}`,
        email: attendeeData.email,
        job_title: attendeeData.jobTitle,
        organization: attendeeData.organization,
        workPhone: attendeeData.workPhone,
        phone_number: attendeeData.phone,
        position: attendeeData.position,
        grade: attendeeData.gradeLevel,
        department: attendeeData.department,
        department_agency: attendeeData.agency,
        staff_id: attendeeData.staffId,
        office_location: attendeeData.office,
        remark: attendeeData.remarks
    };
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

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
            const token = getAuthToken();

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
            name: saved?.fullname || `${formPayload.firstName} ${formPayload.lastName}`,
            email: saved?.email || formPayload.email || '',
            phone: saved?.phone_number || formPayload.phone_number || '',
            nin: saved?.nin || formPayload.nin || '',
            position: saved?.position || formPayload.position || '',
            gradeLevel: saved?.grade || saved?.grade_level || formPayload.grade || '',
            ministry: saved?.organization || formPayload.ministry || currentMinistry.name,
            department: saved?.department || formPayload.department || '',
            agency: saved?.department_agency || formPayload.department_agency || '',
            staffId: saved?.staff_id || saved?.staff_id || formPayload.staff_id || '',
            office: saved?.office_location || formPayload.office_location || '',
            status: saved?.status || 'Pending', // default to Pending
            remarks: saved?.remark || formPayload.remark || '',
            addedBy: saved?.addedBy || 'Ministry',
            dateAdded: saved?.dateAdded || saved?.createdAt || nowDate
        };

        // Show success modal
        document.getElementById('successMessage').textContent = `Participant ${attendeeData.firstName} ${attendeeData.lastName} has been successfully added!`;
        openModal('successModal');

        // Persist in local array and update UI
        ministryAttendees.push(newAttendee);
        localStorage.setItem('ministryAttendeesData', JSON.stringify(ministryAttendees));
        console.log('Saved to cache after add (2):', ministryAttendees.length, 'attendees');
        renderMinistryAttendeesTable(ministryAttendees);
        await loadMinistryData();

        // Reset form
        addMinistryAttendeeForm.reset();
    } catch (err) {
        console.error('Failed to add attendee:', err);
        alert('Failed to add attendee. Please try again.');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
    
    // Add to recent activity
    addToRecentActivity(attendeeData);
}

// Filter attendees
function filterAttendees() {
    const searchTerm = document.getElementById('searchMinistryAttendees').value.toLowerCase();
    const statusFilter = document.getElementById('filterMinistryStatus').value;
    const departmentFilter = document.getElementById('filterMinistryDepartment').value;
    
    const filtered = ministryAttendees.filter(attendee => {
        const matchesSearch = 
            attendee.name.toLowerCase().includes(searchTerm) ||
            attendee.email.toLowerCase().includes(searchTerm) ||
            attendee.nin.includes(searchTerm) ||
            attendee.position.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || attendee.status === statusFilter;
        const matchesDepartment = !departmentFilter || attendee.department === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    renderMinistryAttendeesTable(filtered);
}

// Export attendees
function exportAttendees() {
    const data = ministryAttendees.map(attendee => ({
        Name: attendee.name,
        Email: attendee.email,
        Position: attendee.position,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    
    const fileName = `Ministry_Participants_${currentMinistryData.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Edit attendee
function editAttendee(attendeeId) {
    const attendee = ministryAttendees.find(a => a.id == attendeeId);
    if (!attendee) return;
    
    currentEditingId = attendeeId;
    
    // Populate edit form
    document.getElementById('editMinistryAttendeePrefix').value = attendee.prefix || 'Mr';
    document.getElementById('editMinistryAttendeeFirstName').value = attendee.firstName || attendee.name.split(' ')[0];
    document.getElementById('editMinistryAttendeeLastName').value = attendee.lastName || attendee.name.split(' ').slice(1).join(' ');
    document.getElementById('editMinistryAttendeeEmail').value = attendee.email;
    document.getElementById('editMinistryAttendeeJobTitle').value = attendee.position;
    document.getElementById('editMinistryAttendeePhone').value = attendee.phone || '';

    
    openModal('editMinistryAttendeeModal');
}

// Update attendee
function updateAttendee() {
    const form = document.getElementById('editMinistryAttendeeForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Find and update attendee
    const index = ministryAttendees.findIndex(a => a.id == currentEditingId);
    if (index !== -1) {
        ministryAttendees[index] = {
            ...ministryAttendees[index],
            name: `${document.getElementById('editMinistryAttendeeFirstName').value} ${document.getElementById('editMinistryAttendeeLastName').value}`,
            email: document.getElementById('editMinistryAttendeeEmail').value,
            position: document.getElementById('editMinistryAttendeeJobTitle').value,
            phone: document.getElementById('editMinistryAttendeePhone').value,  
            status: document.getElementById('editMinistryAttendeeStatus').value
        };
        
        renderMinistryAttendeesTable(ministryAttendees);
        closeModal('editMinistryAttendeeModal');
        showSuccessMessage('Participant updated successfully!');
    }
}

// Confirm delete attendee
function confirmDeleteAttendee(attendeeId, attendeeName) {
    currentEditingId = attendeeId;
    document.getElementById('deleteMinistryAttendeeName').textContent = attendeeName;
    openModal('deleteMinistryModal');
}

// Delete attendee
async function deleteAttendee() {
    ministryAttendees = ministryAttendees.filter(a => a.id != currentEditingId);
    renderMinistryAttendeesTable(ministryAttendees);
    
    closeModal('deleteMinistryModal');
    showSuccessMessage('Participant deleted successfully!');
    
    // Refresh stats from backend
    await loadMinistryData();
}

// Add to recent activity
function addToRecentActivity(attendeeData) {
    const table = document.getElementById('ministryActivityTable');
    const now = new Date();
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>Added</td>
        <td>${attendeeData.firstName} ${attendeeData.lastName}</td>
        <td>${attendeeData.position}</td>
        <td>${attendeeData.phone}</td>
        <td><span class="status-badge status-pending">Pending</span></td>
    `;
    
    table.insertBefore(row, table.firstChild);
    
    // Keep only last 10 activities
    if (table.children.length > 10) {
        table.removeChild(table.lastChild);
    }
}

// Render recent activity table with last 3 participants
function renderRecentActivity() {
    const tbody = document.getElementById('ministryActivityTable');
    if (!tbody) {
        console.error('ministryActivityTable not found');
        return;
    }
    tbody.innerHTML = ''; // Clear existing content

    console.log('Rendering recent activity, attendees count:', ministryAttendees.length);

    // Sort attendees by dateAdded descending, handling empty dates
    const recentAttendees = ministryAttendees
        .sort((a, b) => {
            const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
            const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
            return dateB - dateA;
        })
        .slice(0, 3);

    console.log('Recent attendees:', recentAttendees);

    recentAttendees.forEach(attendee => {
        const row = document.createElement('tr');
        const statusClass = attendee.status.toLowerCase() === 'approved' ? 'status-approved' : 
                           attendee.status.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-pending';
        
        row.innerHTML = `
            <td>Added</td>
            <td>${attendee.name}</td>
            <td>${attendee.position || ''}</td>
            <td>${attendee.phone || ''}</td>
            
        `;
        tbody.appendChild(row);
    });
}

// Excel upload functionality
// Save General Settings
function saveGeneralSettings() {
    const form = document.getElementById('ministryGeneralSettingsForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect settings
    const settings = {
        name: document.getElementById('ministryDisplayName').value,
        contactPerson: document.getElementById('primaryContactName').value,
        contactEmail: document.getElementById('primaryContactEmail').value,
        phone: document.getElementById('ministryPhone').value,
        address: document.getElementById('ministryAddress').value,
        defaultDepartment: document.getElementById('defaultDepartment').value,
        timezone: document.getElementById('timezone').value,
        autoSaveForms: document.getElementById('autoSaveForms').checked,
        showConfirmationDialogs: document.getElementById('showConfirmationDialogs').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        showHelpTooltips: document.getElementById('showHelpTooltips').checked
    };
    
    // Save to localStorage (in real app, API call)
    localStorage.setItem('ministrySettings', JSON.stringify(settings));
    
    // Update current ministry data
    currentMinistryData.name = settings.name;
    currentMinistryData.contactPerson = settings.contactPerson;
    
    // Update UI
    initMinistryDashboard();
    
    showSuccessMessage('Settings saved successfully!');
}

// Change password
function changePassword() {
    const form = document.getElementById('ministryPasswordSettingsForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showErrorMessage('New passwords do not match!');
        return;
    }
    
    // Validate password strength
    if (!isStrongPassword(newPassword)) {
        showErrorMessage('Password does not meet strength requirements!');
        return;
    }
    
    // In a real app, this would be an API call
    console.log('Changing password...');
    
    // Simulate API call
    setTimeout(() => {
        resetPasswordForm();
        showSuccessMessage('Password changed successfully!');
        
        // If logout all devices is checked
        if (document.getElementById('logoutAllDevices').checked) {
            setTimeout(() => {
                logout();
            }, 2000);
        }
    }, 1000);
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthText = document.getElementById('passwordStrengthText');
    const segments = document.querySelectorAll('.strength-segment');
    
    // Reset segments
    segments.forEach(segment => {
        segment.style.background = '#e0e0e0';
    });
    
    let strength = 0;
    let text = 'Very Weak';
    let color = '#dc3545';
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update segments
    for (let i = 0; i < strength; i++) {
        segments[i].style.background = color;
    }
    
    // Update text and color based on strength
    switch(strength) {
        case 1:
            text = 'Weak';
            color = '#dc3545';
            break;
        case 2:
            text = 'Fair';
            color = '#ffc107';
            break;
        case 3:
            text = 'Good';
            color = '#17a2b8';
            break;
        case 4:
            text = 'Strong';
            color = '#28a745';
            break;
    }
    
    strengthText.textContent = text;
    strengthText.style.color = color;
    
    // Update segments color
    for (let i = 0; i < strength; i++) {
        segments[i].style.background = color;
    }
}

// Check password match
function checkPasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (!confirmPassword) {
        matchDiv.innerHTML = '';
        return;
    }
    
    if (newPassword === confirmPassword) {
        matchDiv.innerHTML = '<small style="color: #28a745;"><i class="fas fa-check-circle"></i> Passwords match</small>';
    } else {
        matchDiv.innerHTML = '<small style="color: #dc3545;"><i class="fas fa-times-circle"></i> Passwords do not match</small>';
    }
}

// Check if password is strong
function isStrongPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
}

// Reset password form
function resetPasswordForm() {
    document.getElementById('ministryPasswordSettingsForm').reset();
    document.getElementById('passwordStrengthText').textContent = '';
    document.getElementById('passwordMatch').innerHTML = '';
    
    // Reset strength segments
    document.querySelectorAll('.strength-segment').forEach(segment => {
        segment.style.background = '#e0e0e0';
    });
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
// Save General Settings
document.getElementById('saveMinistrySettingsBtn').addEventListener('click', function() {
    saveGeneralSettings();
});

function saveGeneralSettings() {
    const form = document.getElementById('ministryGeneralSettingsForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    this.disabled = true;
    
    // Collect settings
    const settings = {
        name: document.getElementById('ministryDisplayName').value,
        contactPerson: document.getElementById('primaryContactName').value,
        contactEmail: document.getElementById('primaryContactEmail').value,
        phone: document.getElementById('ministryPhone').value,
        address: document.getElementById('ministryAddress').value,
        timezone: document.getElementById('timezone').value,
        autoSaveForms: document.getElementById('autoSaveForms').checked,
        showConfirmationDialogs: document.getElementById('showConfirmationDialogs').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        showHelpTooltips: document.getElementById('showHelpTooltips').checked
    };
    
    // Simulate API call (in real app, this would be an actual API call)
    setTimeout(() => {
        // Save to localStorage (in real app, API call)
        localStorage.setItem('ministrySettings', JSON.stringify(settings));
        
        // Update current ministry data
        currentMinistryData.name = settings.name;
        currentMinistryData.contactPerson = settings.contactPerson;
        
        // Update UI
        updateMinistryDisplay();
        
        // Reset button state
        this.innerHTML = originalText;
        this.disabled = false;
        
        // Show success modal
        openModal('settingsSuccessModal');
        
    }, 1000);
}

// Update ministry display function
function updateMinistryDisplay() {
    // Update dashboard display
    document.getElementById('currentMinistryName').textContent = currentMinistryData.name;
    document.getElementById('currentContactPerson').textContent = currentMinistryData.contactPerson;
    document.getElementById('ministryNameDisplay').textContent = currentMinistryData.name;
    
    // Update form fields
    document.getElementById('editMinistryAttendeeMinistry').value = currentMinistryData.name;
}

// Close settings success modal
document.getElementById('closeSettingsSuccessBtn').addEventListener('click', function() {
    closeModal('settingsSuccessModal');
});

// Also add this to your existing modal close event listeners
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Settings success modal close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
});

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show success message
function showSuccessMessage(message) {
    // In a real app, use a toast notification
    alert('Success: ' + message);
}

// Show error message
function showErrorMessage(message) {
    // In a real app, use a toast notification
    alert('Error: ' + message);
}

// Logout
function logout() {
    // Clear session data
    localStorage.removeItem('currentMinistry');
    localStorage.removeItem('ministryToken');
    
    // Redirect to login page
    window.location.href = '../index.html';
}