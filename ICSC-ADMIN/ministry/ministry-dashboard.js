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

// Excel upload data storage
let ministryParsedData = [];

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
    
    // Initialize ministry-specific fields
    const ministryName = document.getElementById('ministryNameDisplay').textContent;
    document.getElementById('ministryAttendeeMinistry').value = ministryName;
    document.getElementById('editMinistryAttendeeMinistry').value = ministryName;
    
    // Initialize Excel upload event listeners
    const ministryExcelFileInput = document.getElementById('ministryExcelFile');
    const ministryUploadExcelBtn = document.getElementById('ministryUploadExcelBtn');
    const ministryDownloadTemplateBtn = document.getElementById('ministryDownloadTemplateBtn');
    const ministryCancelUploadBtn = document.getElementById('ministryCancelUploadBtn');
    const ministryConfirmUploadBtn = document.getElementById('ministryConfirmUploadBtn');
    
    // Download Excel Template for Ministry
    ministryDownloadTemplateBtn.addEventListener('click', function() {
        downloadMinistryExcelTemplate(ministryName);
    });
    
    // Upload and Parse Excel File for Ministry
    ministryUploadExcelBtn.addEventListener('click', function() {
        if (!ministryExcelFileInput.files.length) {
            alert('Please select an Excel file first.');
            return;
        }
        
        const file = ministryExcelFileInput.files[0];
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }
        
        parseMinistryExcelFile(file, ministryName);
    });
    
    // Cancel Upload
    ministryCancelUploadBtn.addEventListener('click', function() {
        resetMinistryExcelUpload();
    });
    
    // Confirm Upload for Super Admin Approval
    ministryConfirmUploadBtn.addEventListener('click', function() {
        if (ministryParsedData.length === 0) {
            alert('No valid data to submit for approval.');
            return;
        }
        
        submitAttendeesForApproval(ministryParsedData, ministryName);
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

// Function to download ministry-specific Excel template
function downloadMinistryExcelTemplate(ministryName) {
    // Create template data specific to ministry
    const templateData = [
        {
            'Prefix': 'Mr',
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@ministry.gov.ng',
            'Password': 'Password123',
            'Job Title': 'Assistant Director',
            'Organization': 'Federal Government',
            'Work Phone': '+2348012345678',
            'Phone Number': '+2348012345678',
            'NIN': '12345678901',
            'Position': 'Assistant Director',
            'Grade Level': 'Assistant Director',
            'Ministry': ministryName,
            'Department': 'Accounts',
            'Department Agency': ministryName,
            'Staff ID': ministryName.substring(0, 3).toUpperCase() + '/AD/001',
            'Office Location': 'Abuja Headquarters',
            'Remarks': 'Sample entry'
        }
    ];
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendees Template');
    
    // Create instructions sheet
    const instructionData = [
        ['Instructions for Ministry Excel Upload:'],
        [''],
        ['1. All attendees will require Super Admin approval'],
        ['2. Ministry field is pre-filled and cannot be changed'],
        ['3. Fill in all required fields'],
        ['4. Email must be unique for each attendee'],
        ['5. Password must be at least 8 characters'],
        [''],
        ['Note: All submissions go to Super Admin for approval']
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(instructionData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Instructions');
    
    // Download the file
    XLSX.writeFile(wb, `${ministryName.replace(/\s+/g, '_')}_Attendee_Template.xlsx`);
}

// Function to submit attendees for Super Admin approval
async function submitAttendeesForApproval(attendees, ministryName) {
    console.log('Submitting attendees for approval:', attendees);
    
    if (!attendees || attendees.length === 0) {
        alert('No valid data to submit for approval.');
        return;
    }

    try {
        // Get ministry information
        const ministryCode = ministryName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
        
        // Prepare bulk upload data
        const bulkUploadData = {
            uploadId: `BULK_${Date.now()}_${ministryCode}`,
            ministry: ministryName,
            ministryCode: ministryCode,
            filename: document.getElementById('ministryExcelFile')?.files[0]?.name || 'Manual Entry',
            totalRecords: attendees.length,
            validRecords: attendees.length,
            errorRecords: 0,
            submittedBy: currentMinistry.name,
            submittedByType: 'ministry',
            submissionDate: new Date().toISOString(),
            status: 'pending',
            records: attendees.map(attendee => ({
                ...attendee,
                ministry: ministryName,
                ministryCode: ministryCode,
                status: 'Pending',
                source: 'ministry_bulk_upload',
                uploadId: `BULK_${Date.now()}_${ministryCode}`,
                submittedBy: currentMinistry.name,
                submissionDate: new Date().toISOString()
            }))
        };
        
        console.log('Bulk approval data prepared:', bulkUploadData);

        // Show loading state
        const confirmBtn = document.getElementById('ministryConfirmUploadBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }

        // Use apiClient if available
        let response;
        if (window.apiClient && typeof window.apiClient.post === 'function') {
            response = await window.apiClient.post('/bulk-approvals/create', bulkUploadData);
        } else {
            // Fallback using fetch
            const token = getAuthToken();
            const url = `${API_BASE_URL}/bulk-approvals/create`;
            
            const fetchResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bulkUploadData)
            });
            
            if (!fetchResponse.ok) {
                throw new Error(`API error: ${fetchResponse.status}`);
            }
            response = await fetchResponse.json();
        }

        console.log('Submission response:', response);

        // Show success message
        showSuccessMessage(`${attendees.length} attendees submitted for Super Admin approval! They will appear in the Bulk Approvals tab.`);
        
        // Reset form
        resetMinistryExcelUpload();
        
        // Clear form fields
        const form = document.getElementById('addMinistryAttendeeForm');
        if (form) form.reset();
        
        // Switch to attendees tab to see the new pending entries
        const attendeesTab = document.querySelector('[data-tab="attendees"]');
        if (attendeesTab) attendeesTab.click();
        
    } catch (error) {
        console.error('Error submitting attendees for approval:', error);
        alert(`Error submitting attendees: ${error.message || 'Unknown error'}`);
    } finally {
        const confirmBtn = document.getElementById('ministryConfirmUploadBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> Submit for Super Admin Approval';
        }
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
    jobTitle: document.getElementById('ministryAttendeeJobTitle').value,
    organization: document.getElementById('ministryAttendeeOrganization').value,
    workPhone: document.getElementById('ministryAttendeeWorkPhone').value,
    phone_number: document.getElementById('ministryAttendeePhone').value,
    nin: document.getElementById('ministryAttendeeNIN').value,
    position: document.getElementById('ministryAttendeePosition').value,
    grade: document.getElementById('ministryAttendeeGradeLevel').value,
    ministry: document.getElementById('ministryAttendeeMinistry').value,
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
        renderMinistryAttendeesTable(ministryAttendees);
        updateMinistryStats();

        // Also submit to Super Admin approval queue
        const attendeeForApproval = {
            ...formPayload,
            fullName: `${formPayload.prefix} ${formPayload.firstName} ${formPayload.lastName}`.trim(),
            source: 'ministry_manual_entry',
            submittedBy: currentMinistry.name,
            submissionDate: new Date().toISOString()
        };
        
        // Submit for Super Admin approval
        await submitAttendeesForApproval([attendeeForApproval], formPayload.ministry);

        // Show success message
        document.getElementById('successMessage').textContent = 'Attendee has been successfully added and submitted for approval!';
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
                <td>${attendee.nin}</td>
                <td>${attendee.position}</td>
                <td>${attendee.department}</td>
                <td>${attendee.agency}</td>
                <td><span class="status-badge ${statusClass}">${attendee.status}</span></td>
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

// Excel Upload Functions
function parseMinistryExcelFile(file, ministryName) {
    showMinistryUploadStatus(true);
    updateMinistryProgress(10, 'Reading file...');

    const reader = new FileReader();
    
    reader.onload = function(e) {
        updateMinistryProgress(30, 'Parsing data...');
        
        try {
            // Check if XLSX is available
            if (typeof XLSX === 'undefined') {
                throw new Error('XLSX library not loaded. Please include the XLSX library.');
            }
            
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: ''
            });
            
            updateMinistryProgress(50, 'Validating data...');
            
            // Process the data
            processMinistryExcelData(jsonData, ministryName);
            
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            alert('Error parsing Excel file. Please check the file format and ensure XLSX library is loaded.');
            resetMinistryExcelUpload();
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
        resetMinistryExcelUpload();
    };
    
    reader.readAsArrayBuffer(file);
}

function processMinistryExcelData(jsonData, ministryName) {
    if (jsonData.length < 2) {
        alert('Excel file is empty or has no data.');
        resetMinistryExcelUpload();
        return;
    }

    // Get headers (first row)
    const headers = jsonData[0].map(h => h ? h.toString().trim() : '');
    
    console.log('Excel Headers found:', headers);
    
    // Flexible header mapping
    const headerMapping = {
        // Flexible matching for common column names
        'prefix': 'prefix',
        'first name': 'firstName',
        'first_name': 'firstName',
        'firstname': 'firstName',
        'fname': 'firstName',
        
        'last name': 'lastName',
        'last_name': 'lastName',
        'lastname': 'lastName',
        'lname': 'lastName',
        
        'email': 'email',
        'email address': 'email',
        'email_address': 'email',
        
        'password': 'password',
        'pass': 'password',
        
        'job title': 'jobTitle',
        'job_title': 'jobTitle',
        'position': 'position',
        'role': 'position',
        
        'organization': 'organization',
        
        'work phone': 'workPhone',
        'work_phone': 'workPhone',
        
        'phone': 'phone',
        'phone number': 'phone',
        'phone_number': 'phone',
        'telephone': 'phone',
        'mobile': 'phone',
        
        'nin': 'nin',
        'national id': 'nin',
        'national_id': 'nin',
        'national id number': 'nin',
        
        'grade level': 'gradeLevel',
        'grade_level': 'gradeLevel',
        'grade': 'gradeLevel',
        
        'ministry': 'ministry',
        
        'department': 'department',
        'dept': 'department',
        
        'agency': 'agency',
        'department agency': 'agency',
        'department_agency': 'agency',
        
        'staff id': 'staffId',
        'staff_id': 'staffId',
        'employee id': 'staffId',
        'employee_id': 'staffId',
        
        'office': 'office',
        'office location': 'office',
        'office_location': 'office',
        
        'remarks': 'remarks',
        'remark': 'remarks'
    };

    ministryParsedData = [];
    const validationErrors = [];
    let validCount = 0;
    let errorCount = 0;

    // Process each row (skip header row)
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip empty rows
        if (row.every(cell => !cell || cell.toString().trim() === '')) {
            continue;
        }

        // Create attendee object
        const attendee = {
            ministry: ministryName,
            organization: 'Federal Government',
            status: 'Pending',
            source: 'ministry_excel_upload',
            submittedBy: currentMinistry.name,
            submissionDate: new Date().toISOString(),
            isValid: true
        };
        
        const errors = [];

        // Map headers to attendee fields
        headers.forEach((header, index) => {
            if (header && index < row.length) {
                const headerLower = header.toLowerCase().trim();
                const value = row[index] ? row[index].toString().trim() : '';
                
                // Find matching field
                let fieldName = null;
                for (const [key, field] of Object.entries(headerMapping)) {
                    if (headerLower === key) {
                        fieldName = field;
                        break;
                    }
                }
                
                // If no direct match, try partial matching
                if (!fieldName) {
                    Object.entries(headerMapping).forEach(([key, field]) => {
                        if (headerLower.includes(key) || key.includes(headerLower)) {
                            fieldName = field;
                        }
                    });
                }
                
                // Assign value to field
                if (fieldName && value) {
                    attendee[fieldName] = value;
                }
            }
        });

        // Set default prefix if not provided
        if (!attendee.prefix) {
            attendee.prefix = 'Mr';
        }
        
        // Combine first and last name for full name
        if (attendee.firstName && attendee.lastName) {
            attendee.fullName = `${attendee.prefix} ${attendee.firstName} ${attendee.lastName}`.trim();
        } else if (attendee.firstName) {
            attendee.fullName = `${attendee.prefix} ${attendee.firstName}`.trim();
        }

        // Validation - be more lenient
        if (!attendee.firstName || attendee.firstName.trim() === '') {
            errors.push('Missing first name');
        }
        
        if (!attendee.email) {
            errors.push('Missing email');
        } else if (!isValidEmail(attendee.email)) {
            errors.push('Invalid email format');
        }
        
        if (!attendee.position && !attendee.jobTitle) {
            errors.push('Missing position/job title');
        }

        // Assign position from jobTitle if needed
        if (!attendee.position && attendee.jobTitle) {
            attendee.position = attendee.jobTitle;
        }

        // Generate a simple password if not provided
        if (!attendee.password) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            attendee.password = `TempPass${randomNum}`;
        }

        if (errors.length === 0) {
            // Generate ID
            attendee.id = `excel_${Date.now()}_${i}`;
            attendee.isValid = true;
            ministryParsedData.push(attendee);
            validCount++;
        } else {
            attendee.errors = errors;
            attendee.isValid = false;
            validationErrors.push({
                row: i + 1,
                name: attendee.fullName || 'Unknown',
                errors: errors
            });
            errorCount++;
        }

        // Update progress
        const progress = 50 + Math.floor((i / (jsonData.length - 1)) * 40);
        updateMinistryProgress(progress, `Processing row ${i} of ${jsonData.length - 1}...`);
    }

    updateMinistryProgress(100, 'Processing complete!');
    
    // Log results for debugging
    console.log(`Parsed ${ministryParsedData.length} valid attendees from Excel`);
    console.log('Sample valid attendee:', ministryParsedData[0]);
    
    // Update counts
    const totalCount = document.getElementById('ministryTotalRecordsCount');
    const validCountEl = document.getElementById('ministryValidRecordsCount');
    const errorCountEl = document.getElementById('ministryErrorRecordsCount');
    const recordCountEl = document.getElementById('ministryExcelRecordCount');
    
    if (totalCount) totalCount.textContent = `Total: ${ministryParsedData.length + validationErrors.length} records`;
    if (validCountEl) validCountEl.textContent = `Valid: ${validCount}`;
    if (errorCountEl) errorCountEl.textContent = `Errors: ${errorCount}`;
    if (recordCountEl) recordCountEl.textContent = `${validCount} valid records ready for import`;

    // Show preview if we have valid data
    if (ministryParsedData.length > 0) {
        showMinistryExcelPreview();
    } else {
        alert(`No valid attendees found in Excel file. Please check the format.\n\nCommon issues:\n1. Missing required columns (First Name, Email, Position)\n2. Empty rows\n3. Invalid email format\n\nFound headers: ${headers.join(', ')}`);
        resetMinistryExcelUpload();
    }
}

function showMinistryExcelPreview() {
    const excelPreview = document.getElementById('ministryExcelPreview');
    const excelPreviewBody = document.getElementById('ministryExcelPreviewBody');
    
    if (!excelPreview || !excelPreviewBody) {
        console.error('Excel preview elements not found');
        return;
    }
    
    excelPreview.style.display = 'block';
    excelPreviewBody.innerHTML = '';

    // Show first 5 valid records in preview
    const previewData = ministryParsedData.slice(0, 5);
    
    previewData.forEach((attendee, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${attendee.fullName || `${attendee.prefix} ${attendee.firstName} ${attendee.lastName}`.trim()}</td>
            <td>${attendee.email}</td>
            <td>${attendee.department || 'N/A'}</td>
            <td><span class="status-badge status-approved">Valid</span></td>
        `;
        
        excelPreviewBody.appendChild(row);
    });

    // Show errors if any
    if (ministryParsedData.some(item => !item.isValid)) {
        const errorRow = document.createElement('tr');
        errorRow.style.backgroundColor = '#fff5f5';
        errorRow.innerHTML = `
            <td colspan="6" style="text-align: center; color: #dc3545;">
                <i class="fas fa-exclamation-triangle"></i>
                Some records have validation errors. They will be skipped during import.
            </td>
        `;
        excelPreviewBody.appendChild(errorRow);
    }
}

function showMinistryUploadStatus(show) {
    const excelUploadStatus = document.getElementById('ministryExcelUploadStatus');
    const excelPreview = document.getElementById('ministryExcelPreview');
    
    if (excelUploadStatus) {
        excelUploadStatus.style.display = show ? 'block' : 'none';
    }
    
    if (excelPreview && !show) {
        excelPreview.style.display = 'none';
    }
}

function updateMinistryProgress(percentage, text) {
    const excelProgressFill = document.getElementById('ministryExcelProgressFill');
    const excelProgressText = document.getElementById('ministryExcelProgressText');
    
    if (excelProgressFill) {
        excelProgressFill.style.width = `${percentage}%`;
    }
    
    if (excelProgressText) {
        if (text) {
            excelProgressText.textContent = `${percentage}% - ${text}`;
        } else {
            excelProgressText.textContent = `${percentage}%`;
        }
    }
}

function resetMinistryExcelUpload() {
    const excelFileInput = document.getElementById('ministryExcelFile');
    if (excelFileInput) excelFileInput.value = '';
    
    ministryParsedData = [];
    showMinistryUploadStatus(false);
    updateMinistryProgress(0, '0%');
}

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
let allAttendees = [];

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initMinistryDashboard();
    
    // Load initial data
    loadMinistryData();
    loadAttendees();
    
    // Tab switching for main navigation
    const tabLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
            
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
    
    // Excel upload functionality
    document.getElementById('ministryUploadExcelBtn').addEventListener('click', handleExcelUpload);
    document.getElementById('ministryDownloadTemplateBtn').addEventListener('click', downloadExcelTemplate);
    
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
    document.getElementById('addAnotherBtn').addEventListener('click', function() {
        closeModal('successModal');
        document.getElementById('addMinistryAttendeeForm').reset();
        document.getElementById('ministryAttendeeMinistry').value = currentMinistryData.name || 'Ministry of Finance';
        switchTab('add-attendee');
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
    // Set current ministry info from localStorage or default
    const ministryInfo = JSON.parse(localStorage.getItem('currentMinistry')) || {
        name: 'Ministry of Finance',
        code: 'MOF',
        contactPerson: 'Permanent Secretary Finance'
    };
    
    currentMinistryData = ministryInfo;
    
    // Display ministry info
    document.getElementById('currentMinistryName').textContent = ministryInfo.name;
    document.getElementById('currentMinistryCode').textContent = ministryInfo.code;
    document.getElementById('currentContactPerson').textContent = ministryInfo.contactPerson;
    document.getElementById('ministryNameDisplay').textContent = ministryInfo.name;
    document.getElementById('ministryAvatar').textContent = ministryInfo.code.substring(0, 2);
    
    // Set ministry field in forms
    document.getElementById('ministryAttendeeMinistry').value = ministryInfo.name;
    document.getElementById('editMinistryAttendeeMinistry').value = ministryInfo.name;
    
    // Set General Settings form values
    document.getElementById('ministryDisplayName').value = ministryInfo.name;
    document.getElementById('ministryCode').value = ministryInfo.code;
    document.getElementById('primaryContactName').value = ministryInfo.contactPerson;
    document.getElementById('primaryContactEmail').value = ministryInfo.contactEmail || 'permanent.secretary@finance.gov.ng';
}

// Load ministry data
function loadMinistryData() {
    // In a real app, this would be an API call
    const mockData = {
        pending: 3,
        approved: 42,
        total: 45
    };
    
    // Update counts
    document.getElementById('ministryPendingCount').textContent = mockData.pending;
    document.getElementById('ministryApprovedCount').textContent = mockData.approved;
    document.getElementById('ministryTotalCount').textContent = mockData.total;
}

// Load attendees
function loadAttendees() {
    // In a real app, this would be an API call
    const mockAttendees = [
        {
            id: 1,
            name: 'Samuel Johnson',
            email: 's.johnson@finance.gov.ng',
            nin: '12345678901',
            position: 'Assistant Director',
            department: 'Audit',
            agency: 'Office of the Accountant General',
            status: 'Pending'
        },
        {
            id: 2,
            name: 'Fatima Bello',
            email: 'f.bello@finance.gov.ng',
            nin: '23456789012',
            position: 'Chief Officer',
            department: 'Treasury',
            agency: 'National Treasury',
            status: 'Approved'
        },
        {
            id: 3,
            name: 'Michael Adekunle',
            email: 'm.adekunle@finance.gov.ng',
            nin: '34567890123',
            position: 'Senior Officer',
            department: 'Budget & Planning',
            agency: 'Budget Office of the Federation',
            status: 'Approved'
        }
    ];
    
    allAttendees = mockAttendees;
    renderAttendeesTable(mockAttendees);
}

// Render attendees table
function renderAttendeesTable(attendees) {
    const tbody = document.getElementById('ministryAttendeesTable');
    tbody.innerHTML = '';
    
    attendees.forEach(attendee => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', attendee.id);
        
        const statusClass = attendee.status === 'Approved' ? 'status-approved' : 
                          attendee.status === 'Pending' ? 'status-pending' : 'status-rejected';
        
        row.innerHTML = `
            <td>${attendee.name}</td>
            <td>${attendee.email}</td>
            <td>${attendee.nin}</td>
            <td>${attendee.position}</td>
            <td>${attendee.department}</td>
            <td>${attendee.agency}</td>
            <td><span class="status-badge ${statusClass}">${attendee.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-success btn-sm edit-ministry-attendee-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-ministry-attendee-btn">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Switch between tabs
function switchTab(tabId) {
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
        loadMinistryData();
    }
}

// Add new attendee
function addMinistryAttendee() {
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
        ministry: document.getElementById('ministryAttendeeMinistry').value,
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
    
    // Show success modal
    document.getElementById('successMessage').textContent = `Participant ${attendeeData.firstName} ${attendeeData.lastName} has been successfully added!`;
    openModal('successModal');
    
    // Reset form
    form.reset();
    document.getElementById('ministryAttendeeMinistry').value = currentMinistryData.name;
    
    // Update counts
    const pendingCount = parseInt(document.getElementById('ministryPendingCount').textContent) + 1;
    const totalCount = parseInt(document.getElementById('ministryTotalCount').textContent) + 1;
    
    document.getElementById('ministryPendingCount').textContent = pendingCount;
    document.getElementById('ministryTotalCount').textContent = totalCount;
    
    // Add to recent activity
    addToRecentActivity(attendeeData);
}

// Filter attendees
function filterAttendees() {
    const searchTerm = document.getElementById('searchMinistryAttendees').value.toLowerCase();
    const statusFilter = document.getElementById('filterMinistryStatus').value;
    const departmentFilter = document.getElementById('filterMinistryDepartment').value;
    
    const filtered = allAttendees.filter(attendee => {
        const matchesSearch = 
            attendee.name.toLowerCase().includes(searchTerm) ||
            attendee.email.toLowerCase().includes(searchTerm) ||
            attendee.nin.includes(searchTerm) ||
            attendee.position.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || attendee.status === statusFilter;
        const matchesDepartment = !departmentFilter || attendee.department === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    renderAttendeesTable(filtered);
}

// Export attendees
function exportAttendees() {
    const data = allAttendees.map(attendee => ({
        Name: attendee.name,
        Email: attendee.email,
        NIN: attendee.nin,
        Position: attendee.position,
        Department: attendee.department,
        Agency: attendee.agency,
        Status: attendee.status
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    
    const fileName = `Ministry_Participants_${currentMinistryData.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Edit attendee
function editAttendee(attendeeId) {
    const attendee = allAttendees.find(a => a.id == attendeeId);
    if (!attendee) return;
    
    currentEditingId = attendeeId;
    
    // Populate edit form
    document.getElementById('editMinistryAttendeePrefix').value = attendee.prefix || 'Mr';
    document.getElementById('editMinistryAttendeeFirstName').value = attendee.firstName || attendee.name.split(' ')[0];
    document.getElementById('editMinistryAttendeeLastName').value = attendee.lastName || attendee.name.split(' ').slice(1).join(' ');
    document.getElementById('editMinistryAttendeeEmail').value = attendee.email;
    document.getElementById('editMinistryAttendeeJobTitle').value = attendee.jobTitle || attendee.position;
    document.getElementById('editMinistryAttendeeWorkPhone').value = attendee.workPhone || '';
    document.getElementById('editMinistryAttendeePhone').value = attendee.phone || '';
    document.getElementById('editMinistryAttendeePosition').value = attendee.position;
    document.getElementById('editMinistryAttendeeGradeLevel').value = attendee.gradeLevel || '';
    document.getElementById('editMinistryAttendeeDepartment').value = attendee.department;
    document.getElementById('editMinistryAttendeeAgency').value = attendee.agency;
    document.getElementById('editMinistryAttendeeStaffId').value = attendee.staffId || '';
    document.getElementById('editMinistryAttendeeOffice').value = attendee.office || '';
    document.getElementById('editMinistryAttendeeRemarks').value = attendee.remarks || '';
    document.getElementById('editMinistryAttendeeStatus').value = attendee.status;
    
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
    const index = allAttendees.findIndex(a => a.id == currentEditingId);
    if (index !== -1) {
        allAttendees[index] = {
            ...allAttendees[index],
            name: `${document.getElementById('editMinistryAttendeeFirstName').value} ${document.getElementById('editMinistryAttendeeLastName').value}`,
            email: document.getElementById('editMinistryAttendeeEmail').value,
            position: document.getElementById('editMinistryAttendeePosition').value,
            department: document.getElementById('editMinistryAttendeeDepartment').value,
            agency: document.getElementById('editMinistryAttendeeAgency').value,
            status: document.getElementById('editMinistryAttendeeStatus').value
        };
        
        renderAttendeesTable(allAttendees);
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
function deleteAttendee() {
    allAttendees = allAttendees.filter(a => a.id != currentEditingId);
    renderAttendeesTable(allAttendees);
    
    closeModal('deleteMinistryModal');
    showSuccessMessage('Participant deleted successfully!');
    
    // Update counts
    const totalCount = allAttendees.length;
    const pendingCount = allAttendees.filter(a => a.status === 'Pending').length;
    const approvedCount = allAttendees.filter(a => a.status === 'Approved').length;
    
    document.getElementById('ministryPendingCount').textContent = pendingCount;
    document.getElementById('ministryApprovedCount').textContent = approvedCount;
    document.getElementById('ministryTotalCount').textContent = totalCount;
}

// Add to recent activity
function addToRecentActivity(attendeeData) {
    const table = document.getElementById('ministryActivityTable');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>Added</td>
        <td>${attendeeData.firstName} ${attendeeData.lastName}</td>
        <td>${attendeeData.position}</td>
        <td>${dateStr} ${timeStr}</td>
        <td><span class="status-badge status-pending">Pending</span></td>
    `;
    
    table.insertBefore(row, table.firstChild);
    
    // Keep only last 10 activities
    if (table.children.length > 10) {
        table.removeChild(table.lastChild);
    }
}

// Excel upload functionality
function handleExcelUpload() {
    const fileInput = document.getElementById('ministryExcelFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an Excel file to upload');
        return;
    }
    
    // Simulate upload process
    const uploadStatus = document.getElementById('ministryExcelUploadStatus');
    const progressBar = document.getElementById('ministryExcelProgressFill');
    const progressText = document.getElementById('ministryExcelProgressText');
    
    uploadStatus.style.display = 'block';
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            progressText.textContent = 'Processing data...';
            
            setTimeout(() => {
                // Show success
                progressBar.style.background = '#28a745';
                progressText.textContent = 'Upload complete!';
                
                // Show preview (simulated)
                setTimeout(() => {
                    showExcelPreview();
                }, 500);
            }, 1000);
        }
    }, 200);
}

function downloadExcelTemplate() {
    // Create template data
    const templateData = [
        {
            'Full Name': 'John Doe',
            'Email': 'john.doe@example.com',
            'Phone': '+2348012345678',
            'Position': 'Director',
            'Grade Level': 'Director',
            'Department': 'Budget & Planning',
            'Agency': 'Budget Office',
            'Staff ID': 'EMP001'
        }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    XLSX.writeFile(wb, `Ministry_Participant_Template_${currentMinistryData.code}.xlsx`);
}

function showExcelPreview() {
    const preview = document.getElementById('ministryExcelPreview');
    preview.style.display = 'block';
    
    // Simulate preview data
    const previewBody = document.getElementById('ministryExcelPreviewBody');
    previewBody.innerHTML = `
        <tr>
            <td>1</td>
            <td>Samuel Johnson</td>
            <td>s.johnson@finance.gov.ng</td>
            <td>Audit</td>
            <td><span class="status-badge status-pending">Pending</span></td>
        </tr>
        <tr>
            <td>2</td>
            <td>Fatima Bello</td>
            <td>f.bello@finance.gov.ng</td>
            <td>Treasury</td>
            <td><span class="status-badge status-pending">Pending</span></td>
        </tr>
    `;
    
    document.getElementById('ministryTotalRecordsCount').textContent = 'Total: 2 records';
    document.getElementById('ministryValidRecordsCount').textContent = 'Valid: 2';
    document.getElementById('ministryErrorRecordsCount').textContent = 'Errors: 0';
}

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
    document.getElementById('ministryAttendeeMinistry').value = currentMinistryData.name;
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