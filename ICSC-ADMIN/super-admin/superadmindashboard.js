// DOM Elements
const deleteMinistryModal = document.getElementById('deleteMinistryModal');
const successMessageEl = document.getElementById('successMessage');
const viewAttendeeModal = document.getElementById('viewAttendeeModal');
const addAttendeeForm = document.getElementById('addAttendeeForm');
const editAttendeeForm = document.getElementById('editAttendeeForm');
const addMinistryForm = document.getElementById('addMinistryForm');
const editMinistryForm = document.getElementById('editMinistryForm');
const addSpeakerForm = document.getElementById('addSpeakerForm');
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
const API_BASE_URL = 'http://localhost:9100/api/v1';
// const API_BASE_URL = 'https://icsc-backend-api.afrikfarm.com/api/v1';
window.API_BASE_URL = API_BASE_URL;

// Tab Navigation
const tabs = document.querySelectorAll('.tab-content');
const tabLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
const pageTitle = document.getElementById('pageTitle');

let ministries = [];
let attendees = [];

// Current attendee/ministry being edited or deleted
let currentAttendeeId = null;
let currentMinistryId = null;

// Add to recent activity
function addToRecentActivity(attendeeData) {
    const table = document.getElementById('recentActivityTable');
    const now = new Date();
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>Added</td>
        <td>${attendeeData.firstName} ${attendeeData.lastName}</td>
        <td>${attendeeData.position}</td>
        
    `;
    
    table.insertBefore(row, table.firstChild);
    
    // Keep only last 10 activities
    if (table.children.length > 10) {
        table.removeChild(table.lastChild);
    }
}

// Render recent activity table with last 3 participants
function renderRecentActivity() {
    const tbody = document.getElementById('recentActivityTable');
    if (!tbody) {
        console.error('recentActivityTable not found');
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
        // const statusClass = attendee.status.toLowerCase() === 'approved' ? 'status-approved' : 
        //                    attendee.status.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-pending';
        
        row.innerHTML = `
            <td>Added</td>
            <td>${attendee.name}</td>
            <td>${attendee.position}</td>
            // 
        `;
        tbody.appendChild(row);
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    initializeModalManager();
    // Load attendees and ministries from backend
    fetchAttendees();
    renderMinistriesTable();
    fetchMinistries();
    // renderRecentActivity()
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
            
            // Load tab-specific data
            if (tabId === 'exhibitors' && typeof window.fetchExhibitors === 'function') {
                window.fetchExhibitors();
            }
            if (tabId === 'partners' && typeof window.fetchPartners === 'function') {
                window.fetchPartners();
            }
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
                
                // Load tab-specific data
                if (tabId === 'exhibitors' && typeof window.fetchExhibitors === 'function') {
                    window.fetchExhibitors();
                }
                if (tabId === 'partners' && typeof window.fetchPartners === 'function') {
                    window.fetchPartners();
                }
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
    setupFormHandler('addPartnerForm', 'addPartnerModal', 'Partner');
    setupFormHandler('addBoothForm', 'addBoothModal', 'Booth');
    setupFormHandler('addAgendaItemForm', 'addAgendaItemModal', 'Agenda item');
    
    function setupFormHandler(formId, modalId, itemName) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log(`${itemName} form submitted`);
                
                // Show success message
                toastr.success(`${itemName} has been successfully added!`);
                
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
  if (addAttendeeForm)
    addAttendeeForm.addEventListener("submit", handleAddAttendee);
  if (editAttendeeForm)
    editAttendeeForm.addEventListener("submit", handleEditAttendee);
  if (addMinistryForm)
    addMinistryForm.addEventListener("submit", handleAddMinistry);
  if (editMinistryForm)
    editMinistryForm.addEventListener("submit", handleEditMinistry);
  if (addSpeakerForm)
    addSpeakerForm.addEventListener("submit", handleAddSpeaker);
  if (document.getElementById("addExhibitorForm"))
    document
      .getElementById("addExhibitorForm")
      .addEventListener("submit", handleAddExhibitor);

  // Modal close buttons (simplified)
  if (addAnotherBtn)
    addAnotherBtn.addEventListener("click", function () {
      if (successModal) successModal.style.display = "none";
    });

  if (cancelEditBtn)
    cancelEditBtn.addEventListener("click", function () {
      if (editAttendeeModal) editAttendeeModal.style.display = "none";
    });

  if (cancelEditExhibitorBtn) {
    cancelEditExhibitorBtn.addEventListener("click", function () {
      const modal = document.getElementById("editExhibitorModal");
      if (modal) modal.style.display = "none";
    });
  }

  if (cancelDeleteBtn)
    cancelDeleteBtn.addEventListener("click", function () {
      if (deleteModal) deleteModal.style.display = "none";
    });
  if (cancelDeleteMinistryBtn)
    cancelDeleteMinistryBtn.addEventListener("click", function () {
      if (deleteMinistryModal) deleteMinistryModal.style.display = "none";
    });

  if (confirmDeleteBtn)
    confirmDeleteBtn.addEventListener("click", handleDeleteAttendee);
  if (confirmDeleteMinistryBtn)
    confirmDeleteMinistryBtn.addEventListener("click", handleDeleteMinistry);

  if (cancelAddMinistryBtn)
    cancelAddMinistryBtn.addEventListener("click", function () {
      if (addMinistryModal) addMinistryModal.style.display = "none";
    });

  if (closeViewMinistryBtn)
    closeViewMinistryBtn.addEventListener("click", function () {
      if (viewMinistryModal) viewMinistryModal.style.display = "none";
    });

  if (cancelEditMinistryBtn)
    cancelEditMinistryBtn.addEventListener("click", function () {
      if (editMinistryModal) editMinistryModal.style.display = "none";
    });

  if (generateNewPasswordBtn)
    generateNewPasswordBtn.addEventListener("click", generateNewPassword);

  // Search and filter
  if (searchAttendees)
    searchAttendees.addEventListener("input", filterAttendees);
  if (filterMinistry)
    filterMinistry.addEventListener("change", filterAttendees);
  if (filterStatus) filterStatus.addEventListener("change", filterAttendees);
  if (filterDepartment)
    filterDepartment.addEventListener("change", filterAttendees);
  if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearFilters);

  // Add Ministry button
  if (addMinistryBtn) {
    addMinistryBtn.addEventListener("click", function () {
      const mn = document.getElementById("ministryName");
      const mc = document.getElementById("ministryCode");
      const cp = document.getElementById("contactPerson");
      const cpe = document.getElementById("contactPersonEmail");

      if (mn) mn.value = "";
      if (mc) mc.value = "";
      if (cp) cp.value = "Permanent Secretary";
      if (cpe) cpe.value = "";

      generateMinistryCredentials();
      if (addMinistryModal) addMinistryModal.style.display = "flex";
    });
  }

  // Global document click handlers for table actions
  document.addEventListener("click", function (e) {
    // 1. Find the button (handle clicks on the <i> icon inside)
    const btn = e.target.closest("button");
    if (!btn) return;

    // 2. Find the row and ID
    const closestRow = btn.closest("tr");
    if (!closestRow) return;

    // 3. Get ID as a STRING (Do not use parseInt)
    const dataId = closestRow.getAttribute("data-id");

    // --- MINISTRY ACTIONS ---
    if (btn.classList.contains("view-ministry-btn")) {
      e.preventDefault();
      if (dataId) openViewMinistryModal(dataId);
    }
    if (btn.classList.contains("edit-ministry-btn")) {
      e.preventDefault();
      if (dataId) openEditMinistryModal(dataId);
    }
    if (btn.classList.contains("delete-ministry-btn")) {
      e.preventDefault();
      const ministryName = closestRow.cells[0].textContent;
      if (dataId) openDeleteMinistryModal(dataId, ministryName);
    }

    // --- ATTENDEE ACTIONS ---
    if (btn.classList.contains("view-btn")) {
      e.preventDefault();
      if (dataId) openViewModal(dataId);
    }
    if (btn.classList.contains("edit-btn")) {
      e.preventDefault();
      // Here parseInt is okay if your attendee IDs are strictly numbers,
      // but removing it is safer:
      if (dataId) openEditModal(parseInt(dataId) || dataId);
    }
    if (btn.classList.contains("delete-btn")) {
      e.preventDefault();
      const name = closestRow.cells[0].textContent;
      if (dataId) openDeleteModal(dataId, name);
    }

    // --- EXHIBITOR ACTIONS ---
    if (btn.classList.contains("edit-exhibitor-btn")) {
      e.preventDefault();
      if (dataId) editExhibitor(dataId);
    }
    if (btn.classList.contains("view-exhibitor-btn")) {
      e.preventDefault();
      if (dataId) viewExhibitor(dataId);
    }

    // --- PARTNER & SPEAKER ACTIONS ---
    if (btn.classList.contains("edit-partner-btn")) {
      e.preventDefault();
      if (dataId) editPartner(dataId);
    }
    if (btn.classList.contains("view-partner-btn")) {
      e.preventDefault();
      if (dataId) viewPartner(dataId);
    }
    if (btn.classList.contains("edit-speaker-btn")) {
      e.preventDefault();
      if (dataId) editSpeaker(dataId);
    }
    if (btn.classList.contains("view-speaker-btn")) {
      e.preventDefault();
      if (dataId) viewSpeaker(dataId);
    }
  });

  // Refresh & export buttons
  const refreshActivityBtn = document.getElementById("refreshActivityBtn");
  const refreshPendingBtn = document.getElementById("refreshPendingBtn");
  const exportAttendeesBtn = document.getElementById("exportAttendeesBtn");

  if (refreshActivityBtn)
    refreshActivityBtn.addEventListener("click", function () {
      alert("Refreshing recent activity...");
    });
  if (refreshPendingBtn)
    refreshPendingBtn.addEventListener("click", function () {
      alert("Refreshing pending attendees...");
    });
  if (exportAttendeesBtn)
    exportAttendeesBtn.addEventListener("click", function () {
      alert("Exporting attendees data...");
    });

  // Form Handlers
  async function handleAddAttendee(e) {
    e.preventDefault();

    // Collect values from form (safe access)
    const values = {
      prefix: (document.getElementById("attendeePrefix")?.value || "").trim(),
      firstName: (
        document.getElementById("attendeeFirstName")?.value || ""
      ).trim(),
      lastName: (
        document.getElementById("attendeeLastName")?.value || ""
      ).trim(),
      email: (document.getElementById("attendeeEmail")?.value || "").trim(),
      jobTitle: (
        document.getElementById("attendeeJobTitle")?.value || ""
      ).trim(),
      organization: (
        document.getElementById("attendeeOrganization")?.value || ""
      ).trim(),
      phone: (document.getElementById("attendeePhone")?.value || "").trim(),
      ministry: (
        document.getElementById("attendeeMinistry")?.value || ""
      ).trim(),
    };

    const fullName =
      `${values.prefix} ${values.firstName} ${values.lastName}`.trim();

    // Validate required fields that exist in the form
    const required = [
      "prefix",
      "firstName",
      "lastName",
      "email",
      "phone",
      "ministry",
    ];
    for (const field of required) {
      if (!values[field]) {
        toastr.error(
          `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`,
        );
        return;
      }
    }

    // Helper: generate a temporary password for the attendee
    function generateRandomPassword(length = 10) {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      let pw = "";
      for (let i = 0; i < length; i++) {
        pw += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pw;
    }

    const tempPassword = generateRandomPassword(10);

    // Prepare payload using snake_case keys commonly expected by backend
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: tempPassword,
      phone_number: values.phone,
      jobTitle: values.jobTitle,
      organization: values.organization,
      ministry: values.ministry,
    };

    const submitBtn = addAttendeeForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Adding...";
    }

    function getToken() {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
          const a = JSON.parse(raw);
          if (a && a.token) return a.token;
        }
      } catch (err) {
        /* ignore */
      }
      return localStorage.getItem("accessToken") || null;
    }

    try {
      let res;
      if (window.apiClient) {
        // apiClient should handle base path already
        res = await window.apiClient.post("/admin/create-attendee", payload);
      } else {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        res = await axios.post(
          `${API_BASE_URL}/admin/create-attendee`,
          payload,
          { headers },
        );
      }

      if (res && (res.status === 200 || res.status === 201)) {
        const created = res.data?.data || res.data || payload;

        const newId =
          created.id ||
          created._id ||
          (attendees.length > 0
            ? Math.max(...attendees.map((a) => a.id || 0)) + 1
            : 1);
        const newAttendee = {
          id: newId,
          name:
            created.fullname || created.full_name || created.name || fullName,
          email: created.email || payload.email,
          phone: created.phone_number || created.phone || payload.phone_number,
          jobTitle: created.job_title || payload.job_title || values.jobTitle,
          organization:
            created.organization || payload.organization || values.organization,
          ministry: created.ministry || payload.ministry || values.ministry,
          jobTitle:
            created.job_title || payload.job_title || values.jobTitle || "",
          position: created.position || created.job_title || "",
          department: created.department || created.department_agency || "",
          status: created.status || "Pending",
          dateAdded:
            created.createdAt ||
            created.created_at ||
            created.registeredAt ||
            created.dateAdded ||
            new Date().toISOString().split("T")[0],
          addedBy: "Super Admin",
        };

        attendees.push(newAttendee);
        renderAttendeesTable(attendees);
        updatePendingTable();
        updateStats();

        // Show generated password in the success message so admin can communicate it
        const displayedPassword =
          created.password || payload.password || tempPassword;
        toastr.success(`Participant has been successfully added`);
        if (successModal) successModal.style.display = "flex";
        addAttendeeForm.reset();
      } else {
        const msg = res?.data?.message || "Failed to add attendee";
        throw new Error(msg);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Add attendee failed";
      toastr.error(msg);
      console.error("Add attendee error:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText || "Add Attendee";
      }
    }

    // Add to recent activity
    addToRecentActivity(values);
  }

  async function handleAddSpeaker(e) {
    e.preventDefault();

    // Collect values from form (safe access)
    const values = {
      prefix: (document.getElementById("speakerPrefix")?.value || "").trim(),
      firstName: (
        document.getElementById("speakerFirstName")?.value || ""
      ).trim(),
      lastName: (
        document.getElementById("speakerLastName")?.value || ""
      ).trim(),
      email: (document.getElementById("speakerEmail")?.value || "").trim(),
      experience: (
        document.getElementById("speakerExperience")?.value || ""
      ).trim(),
      country: (document.getElementById("speakerCountry")?.value || "").trim(),
      description: (
        document.getElementById("speakerDescription")?.value || ""
      ).trim(),
      topic: (document.getElementById("speakerTopic")?.value || "").trim(),
      affiliation: (
        document.getElementById("speakerAffiliation")?.value || ""
      ).trim(),
      links: (document.getElementById("speakerLinks")?.value || "").trim(),
      jobTitle: (
        document.getElementById("speakerJobTitle")?.value || ""
      ).trim(),
      phone: (document.getElementById("speakerPhone")?.value || "").trim(),
    };

    const fullName =
      `${values.prefix} ${values.firstName} ${values.lastName}`.trim();

    // Validate required fields
    const required = ["prefix", "firstName", "lastName", "email", "country"];
    for (const field of required) {
      if (!values[field]) {
        toastr.error(
          `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`,
        );
        return;
      }
    }

    // Prepare payload
    const payload = {
      first_name: values.firstName,
      last_name: values.lastName,
      work_email: values.email,
      prefix: values.prefix,
      experience: values.experience,
      country: values.country,
      bio: values.description,
      topic: values.topic,
      organization: values.affiliation,
      socialMediaLinks: values.links,
      job_title: values.jobTitle,
      phone: values.phone,
    };

    const submitBtn = addSpeakerForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Adding...";
    }

    function getToken() {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
          const a = JSON.parse(raw);
          if (a && a.token) return a.token;
        }
      } catch (err) {
        /* ignore */
      }
      return localStorage.getItem("accessToken") || null;
    }

    try {
      let res;
      if (window.apiClient) {
        res = await window.apiClient.post("/admin/create-speaker", payload);
      } else {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        res = await axios.post(
          `${API_BASE_URL}/admin/create-speaker`,
          payload,
          { headers },
        );
      }

      if (res && (res.status === 200 || res.status === 201)) {
        // Show success message
        toastr.success(`Speaker has been successfully added!`);
        addSpeakerForm.reset();
        // Close the add speaker modal
        const addSpeakerModal = document.getElementById("addSpeakerModal");
        if (addSpeakerModal) addSpeakerModal.style.display = "none";
        // Optionally refresh the speakers list
        // fetchSpeakers();
      } else {
        const msg = res?.data?.message || "Failed to add speaker";
        throw new Error(msg);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Add speaker failed";
      toastr.error(msg);
      console.error("Add speaker error:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText || "Add Speaker";
      }
    }
  }

  async function handleEditAttendee(e) {
    e.preventDefault();

    const updatedData = {
      prefix: document.getElementById("editAttendeePrefix").value.trim(),
      firstName: document.getElementById("editAttendeeFirstName").value.trim(),
      lastName: document.getElementById("editAttendeeLastName").value.trim(),
      email: document.getElementById("editAttendeeEmail").value.trim(),
      jobTitle: document.getElementById("editAttendeeJobTitle").value.trim(),
      organization: document
        .getElementById("editAttendeeOrganization")
        .value.trim(),
      phone: document.getElementById("editAttendeePhone").value.trim(),
    };

    const fullName =
      `${updatedData.prefix} ${updatedData.firstName} ${updatedData.lastName}`.trim();

    const payload = {
      fullname: fullName,
      email: updatedData.email,

      phone_number: updatedData.phone,
      job_title: updatedData.jobTitle,
      organization: updatedData.organization,
    };

    const submitBtn = editAttendeeForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";
    }

    try {
      let res;
      if (window.apiClient) {
        res = await window.apiClient.put(
          `/admin/update-attendee?attendee_id=${currentAttendeeId}`,
          payload,
        );
      } else {
        const token = localStorage.getItem("accessToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        res = await axios.put(
          `${API_BASE_URL}/admin/update-attendee?attendee_id=${currentAttendeeId}`,
          payload,
          { headers },
        );
      }

      if (res && (res.status === 200 || res.status === 201)) {
        const attendeeIndex = attendees.findIndex(
          (a) => a.id === currentAttendeeId,
        );
        if (attendeeIndex !== -1) {
          attendees[attendeeIndex] = {
            ...attendees[attendeeIndex],
            name: fullName,
            email: updatedData.email,
            phone: updatedData.phone,
            ministry: updatedData.organization,
          };

          renderAttendeesTable(attendees);
          updatePendingTable();
          updateStats();

          toastr.success("Attendee has been successfully updated!");
          editAttendeeModal.style.display = "none";
        }
      } else {
        throw new Error(res?.data?.message || "Failed to update attendee");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Update failed";
      toastr.error(msg);
      console.error("Edit attendee error:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText || "Update Attendee";
      }
    }
  }

  async function handleDeleteAttendee() {
    if (!currentAttendeeId) {
      toastr.error("No attendee selected.");
      return;
    }

    const confirmBtn = confirmDeleteBtn;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Deleting...";
    }

    function getToken() {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
          const a = JSON.parse(raw);
          if (a && a.token) return a.token;
        }
      } catch (e) {
        /* ignore */
      }
      return localStorage.getItem("accessToken") || null;
    }

    try {
      let res;
      const endpoint = `/admin/delete-attendee?attendee_id=${currentAttendeeId}`;

      if (window.apiClient) {
        res = await window.apiClient.delete(endpoint);
      } else {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        res = await axios.delete(
          `${API_BASE_URL}/admin/delete-attendee?attendee_id=${currentAttendeeId}`,
          { headers },
        );
      }

      if (
        res &&
        (res.status === 200 || res.status === 204 || res.status === 202)
      ) {
        attendees = attendees.filter(
          (a) => String(a.id) !== String(currentAttendeeId),
        );

        renderAttendeesTable(attendees);
        updatePendingTable();
        updateStats();

        toastr.success("Attendee has been successfully deleted!");
        deleteModal.style.display = "none";
        currentAttendeeId = null;
      } else {
        const msg = res?.data?.message || "Failed to delete attendee";
        throw new Error(msg);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Delete failed";
      toastr.error(message);
      console.error("Delete attendee error:", err);
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Delete";
      }
    }
  }

  async function handleDeleteMinistry() {
    if (!currentMinistryId) {
      toastr.error("No ministry selected.");
      return;
    }

    const confirmBtn = confirmDeleteMinistryBtn;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Deleting...";
    }

    function getToken() {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
          const a = JSON.parse(raw);
          if (a && a.token) return a.token;
        }
      } catch (e) {
        /* ignore */
      }
      return localStorage.getItem("accessToken") || null;
    }

    try {
      let res;
      const endpoint = `/admin/delete-user?user_id=${currentMinistryId}`;

      if (window.apiClient) {
        res = await window.apiClient.delete(endpoint);
      } else {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        res = await axios.delete(
          `${API_BASE_URL}/admin/delete-user?user_id=${currentMinistryId}`,
          { headers },
        );
      }

      if (
        res &&
        (res.status === 200 || res.status === 204 || res.status === 202)
      ) {
        ministries = ministries.filter(
          (m) => String(m.id) !== String(currentMinistryId),
        );

        renderMinistriesTable(ministries);
        updateStats();

        toastr.success("Ministry has been successfully deleted!");
        deleteMinistryModal.style.display = "none";
        currentMinistryId = null;
      } else {
        const msg = res?.data?.message || "Failed to delete ministry";
        throw new Error(msg);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Delete failed";
      toastr.error(message);
      console.error("Delete attendee error:", err);
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Delete";
      }
    }
  }

  async function handleAddMinistry(e) {
    e.preventDefault();

    const organization = document.getElementById("ministryName").value.trim();
    const organization_short_code = document
      .getElementById("ministryCode")
      .value.trim();
    const contact_person = document
      .getElementById("contactPerson")
      .value.trim();
    const contact_person_email = document
      .getElementById("contactPersonEmail")
      .value.trim();
    const username = document
      .getElementById("generatedUsername")
      .textContent.trim();
    const password = document
      .getElementById("generatedPassword")
      .textContent.trim();

    if (
      !organization ||
      !organization_short_code ||
      !contact_person ||
      !contact_person_email ||
      !username ||
      !password
    ) {
      toastr.error("Please fill all required ministry fields.");
      return;
    }

    const payload = {
      organization,
      organization_short_code,
      username,
      password,
      contact_person,
      contact_person_email,
    };

    const submitBtn = addMinistryForm.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating...";
    }

    function getToken() {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
          const a = JSON.parse(raw);
          if (a && a.token) return a.token;
        }
      } catch (err) {
        /* ignore */
      }
      return localStorage.getItem("accessToken") || null;
    }

    try {
      let res;
      if (window.apiClient) {
        res = await window.apiClient.post("/admin/create-user", payload);
      } else {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        res = await axios.post(`${API_BASE_URL}/admin/create-user`, payload, {
          headers,
        });
      }

      if (res && (res.status === 200 || res.status === 201)) {
        const created = res.data?.data || res.data || payload;

        const newMinistry = {
          id:
            created.id ||
            created._id ||
            (ministries.length
              ? Math.max(...ministries.map((m) => m.id || 0)) + 1
              : 1),
          name:
            created.organization || created.organization_name || organization,
          code: created.organization_short_code || organization_short_code,
          attendeesCount: created.attendeesCount || 0,
          pendingCount: created.pendingCount || 0,
          approvedCount: created.approvedCount || 0,
          contactPerson: created.contact_person || contact_person,
          contactPersonEmail:
            created.contact_person_email || contact_person_email,
          username: created.username || username,
          password: created.password || password,
        };

        ministries.push(newMinistry);
        renderMinistriesTable();
        updateStats();

        toastr.success("Ministry has been successfully created!");
        if (successModal) successModal.style.display = "flex";

        addMinistryForm.reset();
        addMinistryModal.style.display = "none";
      } else {
        const msg = res?.data?.message || "Failed to create ministry";
        throw new Error(msg);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Create ministry failed";
      toastr.error(message);
      console.error("Create ministry error:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText || "Add Ministry";
      }
    }
  }

  async function handleAddExhibitor(e) {
    e.preventDefault();

    const category = document.getElementById("exhibitorPrefix").value.trim();
    const company_name = document
      .getElementById("exhibitorCompanyName")
      .value.trim();
    const contact_person = document
      .getElementById("exhibitorContactName")
      .value.trim();
    const contact_email = document
      .getElementById("exhibitorContactEmail")
      .value.trim();
    const contact_phone = document
      .getElementById("exhibitorContactPhone")
      .value.trim();
    const exhibition_title = document
      .getElementById("exhibitionTitle")
      .value.trim();
    const description = document
      .getElementById("exhibitionDescription")
      .value.trim();

    console.log("Adding exhibitor with data:", {
      category,
      companyName: company_name,
      contactPerson: contact_person,
      contactEmail: contact_email,
      contactPhone: contact_phone,
      exhibitionTitle: exhibition_title,
      description,
    });

    if (!category || !contact_person || !contact_email || !exhibition_title) {
      toastr.error("Please fill all required exhibitor fields.");
      return;
    }

    const payload = {
      category,
      company_name: company_name,
      contact_person: contact_person,
      contact_email: contact_email,
      contact_phone: contact_phone,
      exhibition_title: exhibition_title,
      description,
    };

    const submitBtn = document
      .getElementById("addExhibitorForm")
      .querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating...";
    }

    function getToken() {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
          const a = JSON.parse(raw);
          if (a && a.token) return a.token;
        }
      } catch (err) {
        /* ignore */
      }
      return localStorage.getItem("accessToken") || null;
    }

    try {
      let res;
      if (window.apiClient) {
        res = await window.apiClient.post("/admin/create-exhibitor", payload);
      } else {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        res = await axios.post(
          `${API_BASE_URL}/admin/create-exhibitor`,
          payload,
          { headers },
        );
      }

      if (res && (res.status === 200 || res.status === 201)) {
        document.getElementById("addExhibitorForm").reset();
        document.getElementById("addExhibitorModal").style.display = "none";

        // Refresh exhibitors list if there's a function to do so
        if (typeof window.fetchExhibitors === "function") {
          window.fetchExhibitors();
        }

        toastr.success("Exhibitor has been successfully created!");
      } else {
        const msg = res?.data?.message || "Failed to create exhibitor";
        throw new Error(msg);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Create exhibitor failed";
      toastr.error(message);
      console.error("Create exhibitor error:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText || "Add Exhibitor";
      }
    }
  }

  async function fetchMinistries() {
    try {
      let res;
      const endpoints = ["/admin/users"];

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
          const raw = localStorage.getItem("authUser");
          if (raw) {
            const a = JSON.parse(raw);
            token = a?.token || token;
          }
        } catch (e) {
          /* ignore */
        }
        if (!token) token = localStorage.getItem("accessToken") || null;
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;

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
          name:
            m.organization ||
            m.organization_name ||
            m.name ||
            m.organization ||
            "",
          code: m.organization_short_code || m.code || m.short_code || "",
          attendeesCount: m.attendeesCount || m.attendees_count || m.count || 0,
          pendingCount: m.pendingCount || m.pending_count || 0,
          approvedCount: m.approvedCount || m.approved_count || 0,
          contactPerson: m.contact_person || m.contactPerson || m.contact || "",
          contactPersonEmail:
            m.contact_person_email ||
            m.contactPersonEmail ||
            m.contact_email ||
            "",
          username: m.username || "",
          password: m.password || "",
        }));

        renderMinistriesTable();
        updateStats();
        console.log(`Fetched ${ministries.length} ministries from backend`);
      } else {
        console.warn("Unexpected ministries response format", res);
      }
    } catch (err) {
      console.error(
        "Error fetching ministries:",
        err?.response?.data || err.message || err,
      );
      renderMinistriesTable();
      updateStats();
    }
  }

  async function fetchAttendees() {
    try {
      let res;
      if (window.apiClient) {
        res = await window.apiClient.get("/admin/attendees");
      } else {
        let token = null;
        try {
          const raw = localStorage.getItem("authUser");
          if (raw) {
            const a = JSON.parse(raw);
            token = a?.token || token;
          }
        } catch (e) {
          /* ignore */
        }
        if (!token) token = localStorage.getItem("accessToken") || null;
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        res = await axios.get(`${API_BASE_URL}/admin/attendees`, { headers });
      }

      const list = res?.data?.data || res?.data || [];
      if (Array.isArray(list)) {
        attendees = list.map((item) => ({
          id: item.id || item._id || item.attendeeId || null,
          name:
            item.full_name || item.name || item.fullName || item.fullname || "",
          email: item.email || "",
          phone: item.phone || item.phone_number || "",
          ministry:
            item.ministry || item.organization_name || item.organization || "",
          department: item.department || "",
          jobTitle: item.job_title || "",
          status: item.status || "Pending",
          remarks: item.remark || "",
          dateAdded:
            item.created_at ||
            item.dateAdded ||
            item.date ||
            new Date().toISOString().split("T")[0],
        }));

        renderAttendeesTable(attendees);
        updatePendingTable();
        updateStats();
        console.log(`Fetched ${attendees.length} attendees from backend`);
        return;
      }

      console.warn("Unexpected attendees response format", res);
    } catch (err) {
      console.error(
        "Error fetching attendees:",
        err?.response?.data || err.message || err,
      );
      renderAttendeesTable(attendees);
      updatePendingTable();
      updateStats();
    }
  }

  function handleEditMinistry(e) {
    e.preventDefault();

    const ministryIndex = ministries.findIndex(
      (m) => m.id === currentMinistryId,
    );
    if (ministryIndex !== -1) {
      ministries[ministryIndex] = {
        ...ministries[ministryIndex],
        name: document.getElementById("editMinistryName").value,
        code: document.getElementById("editMinistryCode").value,
        contactPerson: document.getElementById("editContactPerson").value,
        contactPersonEmail: document.getElementById("editContactPersonEmail")
          .value,
        username: document.getElementById("editUsername").value,
        password: document.getElementById("editPassword").value,
      };

      renderMinistriesTable();

      toastr.success("Ministry has been successfully updated!");

      editMinistryModal.style.display = "none";
    }
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
        document.getElementById('editAttendeeEmail').value = attendee.email;;
        document.getElementById('editAttendeeOrganization').value = attendee.ministry;
        document.getElementById('editAttendeePhone').value = attendee.phone;
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

function openViewModal(id) {
  const attendee = attendees.find((a) => a.id == id);
  // If not found in attendees, it might be an exhibitor or partner
  if (!attendee) {
    console.warn("Item not found in attendees list");
    // Add logic here to find in exhibitors if needed
    return;
  }

  document.getElementById("viewName").textContent = attendee.name || "N/A";
  document.getElementById("viewEmail").textContent = attendee.email || "N/A";
  document.getElementById("viewPhone").textContent = attendee.phone || "N/A";
  document.getElementById("viewJobTitle").textContent =
    attendee.jobTitle || "N/A";
  document.getElementById("viewMinistry").textContent =
    attendee.ministry || "N/A";
  document.getElementById("viewDepartment").textContent =
    attendee.department || "N/A";

  const viewModal = document.getElementById("viewAttendeeModal");
  if (viewModal) viewModal.style.display = "flex";
}

function openViewMinistryModal(ministryId) {
    const ministry = ministries.find(
      (m) => String(m.id) === String(ministryId),
    );
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

function openEditMinistryModal(ministryId) {
  // 1. Find the specific ministry from your global 'ministries' array
  const ministry = ministries.find((m) => String(m.id) === String(ministryId));

  if (!ministry) {
    alert("Ministry data not found");
    return;
  }

  // 2. Populate the Edit Modal Form Fields
  document.getElementById("editMinistryId").value = ministry.id;
  document.getElementById("editMinistryName").value = ministry.name || "";
  document.getElementById("editMinistryCode").value = ministry.code || "";
  document.getElementById("editContactPerson").value =
    ministry.contactPerson || "";
  document.getElementById("editContactPersonEmail").value =
    ministry.contactPersonEmail || "";

  // 3. Show the Modal
  const modal = document.getElementById("editMinistryModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Edit Ministry Modal HTML element missing!");
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
// Verification System for Admin Dashboard
// AUTO-APPROVAL NOTIFICATION SYSTEM

class AutoApprovalNotificationSystem {
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
            this.unreadCount = mockNotifications.filter(n => n.status === 'approved' && n.notificationStatus === 'unread').length;
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
                status: 'approved',
                notificationStatus: 'read',
                approvedBy: 'Auto-approval System',
                approvedAt: new Date().toISOString(),
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
                status: 'approved',
                notificationStatus: 'unread',
                approvedBy: 'Auto-approval System',
                approvedAt: new Date(Date.now() - 3600000).toISOString(),
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
                status: 'approved',
                notificationStatus: 'unread',
                approvedBy: 'Auto-approval System',
                approvedAt: new Date(Date.now() - 7200000).toISOString(),
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
                status: 'approved',
                notificationStatus: 'read',
                approvedBy: 'Auto-approval System',
                approvedAt: new Date(Date.now() - 10800000).toISOString(),
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
                    <div class="notification-icon icon-${notification.type} ${notification.status}">
                        <i class="fas ${this.getTypeIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-title">
                            <span>${notification.userName}</span>
                            <span class="status-badge status-${notification.status}">
                                ${notification.status === 'approved' ? 'AUTO-APPROVED' : notification.status.toUpperCase()}
                            </span>
                        </div>
                        <div class="notification-message">
                            Automatically attended ${notification.eventDay} event
                        </div>
                        <div class="notification-event">
                            <div class="event-title">${notification.eventTitle}</div>
                            <div class="event-details">
                                <span><i class="far fa-calendar"></i> ${notification.eventDate}</span>
                                <span><i class="far fa-clock"></i> ${notification.eventTime}</span>
                            </div>
                        </div>
                        <div class="notification-actions-bottom">
                            <button class="btn-sm btn-view-details" onclick="window.autoApprovalSystem.viewDetails(${notification.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                        <div class="notification-time">
                            <i class="far fa-clock"></i> ${this.formatTimeAgo(notification.createdAt)}
                            ${notification.approvedBy === 'Auto-approval System' ? 
                              '<span style="margin-left: 10px; color: #4CAF50;"><i class="fas fa-robot"></i> Auto-approved</span>' : ''}
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

    async handleNewSubmission(notificationData) {
        try {
            // Automatically approve the submission
            const approvedNotification = {
                ...notificationData,
                id: Date.now(),
                status: 'approved',
                notificationStatus: 'unread',
                approvedBy: 'Auto-approval System',
                approvedAt: new Date().toISOString()
            };
            
            // Add to notifications list (at the beginning)
            this.notifications.unshift(approvedNotification);
            
            // Send confirmation to user
            await this.sendAutoApprovalNotification(approvedNotification);

                    if (window.attendanceReportManager) {
            window.attendanceReportManager.refreshData();
        }
            
            // Update UI
            this.unreadCount++;
            this.renderNotifications();
            this.updateNotificationBadge();
            
            // Show success message
            this.showToast(`Submission from ${notificationData.userName} automatically approved!`, 'success');
            
            // Play notification sound
            this.playNotificationSound();
            
            // Update attendance reports
            if (window.attendanceReportManager) {
                window.attendanceReportManager.refreshData();
            }
            
            return true;
        } catch (error) {
            console.error('Error handling auto-approval:', error);
            this.showToast('Error processing submission', 'error');
            return false;
        }
    }

    async sendAutoApprovalNotification(notification) {
        // Mock email/notification API call
        console.log(`Auto-approval confirmation sent to ${notification.userEmail}`);
        
        // In a real app, you would send this via your email API:
        // await fetch('/api/send-email', { 
        //     method: 'POST', 
        //     body: JSON.stringify({
        //         to: notification.userEmail,
        //         subject: `Schedule Confirmation - ${notification.eventTitle}`,
        //         body: `Your attendance for ${notification.eventTitle} has been automatically confirmed.`
        //     }) 
        // });
        
        return true;
    }

    viewDetails(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Attendance Details</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Name</label>
                            <p>${notification.userName}</p>
                        </div>
                        <div class="detail-item">
                            <label>Email</label>
                            <p>${notification.userEmail}</p>
                        </div>
                        <div class="detail-item">
                            <label>Type</label>
                            <p><span class="badge badge-${notification.type}">${notification.type.toUpperCase()}</span></p>
                        </div>
                        <div class="detail-item">
                            <label>Event</label>
                            <p>${notification.eventTitle}</p>
                        </div>
                        <div class="detail-item">
                            <label>Date & Time</label>
                            <p>${notification.eventDate} at ${notification.eventTime}</p>
                        </div>
                        <div class="detail-item">
                            <label>Day</label>
                            <p>${notification.eventDay}</p>
                        </div>
                        <div class="detail-item">
                            <label>Status</label>
                            <p><span class="badge badge-success">AUTO-APPROVED</span></p>
                        </div>
                        <div class="detail-item">
                            <label>Approved By</label>
                            <p>${notification.approvedBy || 'System'}</p>
                        </div>
                        <div class="detail-item">
                            <label>Approved At</label>
                            <p>${new Date(notification.approvedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.style.display = 'block';
    }

    async markAllAsRead() {
        this.notifications.forEach(n => {
            if (n.notificationStatus === 'unread') {
                n.notificationStatus = 'read';
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
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h2>All Auto-Approved Submissions</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="notification-summary">
                        <div class="summary-stats">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>${this.notifications.length}</h3>
                                    <p>Total Submissions</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>${this.notifications.filter(n => n.status === 'approved').length}</h3>
                                    <p>Auto-Approved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-controls" style="margin: 15px 0;">
                        <select class="form-control" id="allNotificationsFilter" style="width: 200px; margin-right: 10px;">
                            <option value="all">All Submissions</option>
                            <option value="approved">Approved Only</option>
                            <option value="attendee">Attendees</option>
                            <option value="speaker">Speakers</option>
                            <option value="exhibitor">Exhibitors</option>
                            <option value="partner">Partners</option>
                        </select>
                        <button class="btn btn-primary btn-sm" id="exportAttendanceBtn">
                            <i class="fas fa-download"></i> Export CSV
                        </button>
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
        
        // Export button
        modal.querySelector('#exportAttendanceBtn').addEventListener('click', () => {
            this.exportAttendanceCSV();
        });
        
        // Initial render
        this.renderAllNotifications('all');
    }

    renderAllNotifications(filter) {
        const container = document.getElementById('allNotificationsList');
        if (!container) return;
        
        let filtered = this.notifications;
        if (filter === 'approved') {
            filtered = this.notifications.filter(n => n.status === 'approved');
        } else if (['attendee', 'speaker', 'exhibitor', 'partner'].includes(filter)) {
            filtered = this.notifications.filter(n => n.type === filter);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-notifications">No submissions found</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="data-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(notification => `
                        <tr>
                            <td>${notification.userName}</td>
                            <td><span class="badge badge-${notification.type}">${notification.type.toUpperCase()}</span></td>
                            <td>${notification.eventTitle}</td>
                            <td>${notification.eventDate}</td>
                            <td>${notification.eventTime}</td>
                            <td><span class="badge badge-success">AUTO-APPROVED</span></td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="window.autoApprovalSystem.viewDetails(${notification.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    exportAttendanceCSV() {
        const headers = ['Name', 'Email', 'Type', 'Event', 'Date', 'Time', 'Day', 'Approved At'];
        const data = this.notifications.map(n => [
            n.userName,
            n.userEmail,
            n.type,
            n.eventTitle,
            n.eventDate,
            n.eventTime,
            n.eventDay,
            new Date(n.approvedAt).toLocaleString()
        ]);
        
        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Attendance data exported to CSV', 'success');
    }

    startPolling() {
        // Check for new submissions every 30 seconds
        setInterval(() => {
            this.checkForNewSubmissions();
        }, 30000);
    }

    async checkForNewSubmissions() {
        // In a real app, this would poll your API for new submissions
        console.log('Checking for new submissions...');
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
    document.querySelectorAll('.app-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `app-toast app-toast-${type}`;
    toast.innerHTML = `
        <div class="app-toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


    playNotificationSound() {
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

// SIMULATION FUNCTIONS (for testing)
function simulateUserSubmission() {
    const userTypes = ['attendee', 'speaker', 'exhibitor', 'partner'];
    const events = [
        { id: 'A002', title: 'Opening Ceremony & Keynote Address', day: 'Wednesday', date: '2026-06-25', time: '09:00' },
        { id: 'A004', title: 'Digital Transformation in Public Service', day: 'Thursday', date: '2026-06-26', time: '08:30' },
        { id: 'A005', title: 'Leadership Workshop', day: 'Thursday', date: '2026-06-26', time: '10:00' }
    ];
    
    const names = [
        'Michael Chen', 'Sarah Johnson', 'Robert Kim', 'Emma Davis',
        'James Wilson', 'Alice Brown', 'David Miller', 'Olivia Taylor',
        'William Garcia', 'Sophia Martinez', 'Daniel Anderson', 'Isabella Thomas'
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const randomType = userTypes[Math.floor(Math.random() * userTypes.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const submission = {
        type: randomType,
        userId: Math.floor(Math.random() * 1000) + 100,
        userName: randomName,
        userEmail: `${randomName.toLowerCase().replace(/ /g, '.')}@example.com`,
        eventId: randomEvent.id,
        eventTitle: randomEvent.title,
        eventDate: randomEvent.date,
        eventTime: randomEvent.time,
        eventDay: randomEvent.day,
        status: 'pending',
        notificationStatus: 'unread',
        createdAt: new Date().toISOString()
    };
    
    // Handle the submission with auto-approval
    if (window.autoApprovalSystem) {
        window.autoApprovalSystem.handleNewSubmission(submission);
    }
    
    return submission;
}

function addSimulationButton() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('simulateBtn')) {
        const simBtn = document.createElement('button');
        simBtn.id = 'simulateBtn';
        simBtn.className = 'btn btn-sm btn-warning';
        simBtn.innerHTML = '<i class="fas fa-user-plus"></i> Simulate Submission';
        simBtn.style.marginLeft = '10px';
        simBtn.onclick = () => {
            const submission = simulateUserSubmission();
            console.log('Simulated submission:', submission);
        };
        headerActions.appendChild(simBtn);
    }
}

// SIMPLE ATTENDANCE REPORT MANAGER
class SimpleAttendanceManager {
    constructor() {
        this.attendanceData = [];
        this.initialize();
    }

    async initialize() {
        await this.loadAttendanceData();
        console.log('Attendance Manager: Loaded', this.attendanceData.length, 'records');
    }

    async loadAttendanceData() {
        // Load from localStorage
        this.attendanceData = JSON.parse(localStorage.getItem('icsc_attendance_records') || '[]');
    }

    refreshData() {
        this.loadAttendanceData();
        console.log('Attendance Manager: Refreshed data');
    }

    getStats() {
        const total = this.attendanceData.length;
        const byType = this.attendanceData.reduce((acc, record) => {
            acc[record.userType] = (acc[record.userType] || 0) + 1;
            return acc;
        }, {});
        
        const byEvent = this.attendanceData.reduce((acc, record) => {
            acc[record.eventTitle] = (acc[record.eventTitle] || 0) + 1;
            return acc;
        }, {});
        
        return { total, byType, byEvent };
    }
}

// CSS STYLES FOR AUTO-APPROVAL
const autoApprovalStyles = `
    <style>
        /* Auto-approval Notification Styles */
        .notification-item.approved {
            border-left-color: #4CAF50;
            background-color: rgba(76, 175, 80, 0.05);
        }
        
        .notification-icon.approved {
            background-color: #4CAF50;
            color: white;
        }
        
        .btn-sm.btn-view-details {
            background-color: #2196F3;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
        }
        
        .btn-sm.btn-view-details:hover {
            background-color: #1976D2;
        }
        
        .badge.badge-success {
            background-color: #4CAF50;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .badge.badge-attendee { background-color: #008751; color: white; }
        .badge.badge-speaker { background-color: #00c974; color: white; }
        .badge.badge-exhibitor { background-color: #f39c12; color: white; }
        .badge.badge-partner { background-color: #3498db; color: white; }
        
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        
        .detail-item {
            margin-bottom: 10px;
        }
        
        .detail-item label {
            display: block;
            font-weight: 600;
            color: #555;
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .detail-item p {
            margin: 0;
            padding: 8px;
            background-color: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
        }
        
        .summary-stats {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            display: flex;
            align-items: center;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #008751;
        }
        
        .stat-icon {
            background: #008751;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 1.2rem;
        }
        
        .stat-info h3 {
            margin: 0;
            font-size: 1.5rem;
            color: #333;
        }
        
        .stat-info p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9rem;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s, transform 0.3s;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .toast-success {
            background-color: #4CAF50;
        }
        
        .toast-info {
            background-color: #2196F3;
        }
        
        .toast-error {
            background-color: #f44336;
        }
    </style>
`;

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    // Add styles
    document.head.insertAdjacentHTML('beforeend', autoApprovalStyles);
    
    // Initialize auto-approval system
    window.autoApprovalSystem = new AutoApprovalNotificationSystem();
    
    // Initialize attendance manager
    window.attendanceReportManager = new SimpleAttendanceManager();

    window.autoApprovalSystem.onAttendanceRecorded = (record) => {
        window.attendanceReportManager.refreshData();
           };
    
    // Add simulation button for testing
    setTimeout(addSimulationButton, 1000);
    
    // Simulate some initial submissions - REMOVED for production
    // setTimeout(() => simulateUserSubmission(), 2000);
    // setTimeout(() => simulateUserSubmission(), 4000);
    // setTimeout(() => simulateUserSubmission(), 6000);
    
    // Auto-simulate every 10 seconds (for demo purposes) - REMOVED
    // setInterval(() => {
    //     if (Math.random() > 0.7) { // 30% chance every 10 seconds
    //         simulateUserSubmission();
    //     }
    // }, 10000);
    
    console.log('Auto-approval notification system initialized');
});

// EXPORT FOR USE IN OTHER FILES
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AutoApprovalNotificationSystem,
        SimpleAttendanceManager,
        simulateUserSubmission
    };
}


// Utility function for notifications
function showNotification(message, type = 'info') {
    // Use existing notification system or create a simple one
    alert(`${type.toUpperCase()}: ${message}`);
}
// // // Verification Functions
// // function approveAttendee(attendeeId) {
// //     const attendeeIndex = attendees.findIndex(a => a.id === attendeeId);
// //     if (attendeeIndex !== -1) {
// //         attendees[attendeeIndex].status = 'Approved';
// //         updateAttendeesTable();
// //         updatePendingTable();
// //         updateStats();
// //         alert('Attendee has been approved!');
// //     }
// }

function rejectAttendee(attendeeId) {
    const attendeeIndex = attendees.findIndex(a => a.id === attendeeId);
    if (attendeeIndex !== -1) {
        attendees[attendeeIndex].status = 'Rejected';
        updateAttendeesTable();
        updatePendingTable();
        updateStats();
        alert('Participant has been rejected!');
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
            attendee.email.toLowerCase().includes(searchTerm);
        
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

    const pendingEl = document.getElementById('pendingCount');
    const approvedEl = document.getElementById('approvedCount');
    const totalEl = document.getElementById('totalCount');
    const ministriesEl = document.getElementById('ministriesCount');

    if (pendingEl) pendingEl.textContent = pendingCount;
    if (approvedEl) approvedEl.textContent = approvedCount;
    if (totalEl) totalEl.textContent = totalCount;
    if (ministriesEl) ministriesEl.textContent = ministriesCount;
}

function updateAttendeesTable() {
    renderAttendeesTable(attendees);
}

function updatePendingTable() {
    const pendingAttendees = attendees.filter(a => a.status === 'Pending');
    renderPendingTable(pendingAttendees);
}

function renderMinistriesTable() {
    if (!ministriesTable) {
        console.warn('renderMinistriesTable: #ministriesTable element not found in DOM');
        return;
    }

    let html = '';

    ministries.forEach(ministry => {
        html += `
            <tr data-id="${ministry.id}">
                <td>${ministry.name || ''}</td>
                <td>${ministry.code || ''}</td>
                <td>${ministry.attendeesCount || 0}</td>
                <td>${ministry.pendingCount || 0}</td>
                <td>${ministry.approvedCount || 0}</td>
                <td>${ministry.contactPerson || ''}</td>
                <td>${ministry.contactPersonEmail || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm view-ministry-btn">View</button>
                        <button class="btn btn-danger btn-sm delete-ministry-btn">Delete</button>
                        <button class="btn btn-warning btn-sm edit-ministry-btn">Edit</button>
                    </div>
                </td>
            </tr>
        `;
    });

    ministriesTable.innerHTML = html;
}

function renderAttendeesTable(attendeesList) {
  if (!allAttendeesTable) {
    console.warn(
      "renderAttendeesTable: #allAttendeesTable element not found in DOM",
    );
    return;
  }

  // FIX: Filter out "Pending" status before rendering
  const approvedList = attendeesList.filter((a) => {
    const status = (a.status || "").toLowerCase();
    return status !== "pending";
  });

  let html = "";

  if (approvedList.length === 0) {
    allAttendeesTable.innerHTML =
      '<tr><td colspan="7" style="text-align:center;">No approved participants found.</td></tr>';
    return;
  }

  approvedList.forEach((attendee) => {
    const statusVal = (attendee.status || "").toLowerCase();
    const statusClass = statusVal ? `status-${statusVal}` : "";

    html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name || ""}</td>
                <td>${attendee.email || ""}</td>
                <td>${attendee.ministry || ""}</td>
                <td>${attendee.jobTitle || ""}</td>
                <td>${attendee.phone || ""}</td>
                <td><span class="status-badge ${statusClass}">${attendee.status || ""}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-btn">View</button>
                        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                        <button class="btn btn-warning btn-sm edit-btn">Edit</button>
                    </div>
                </td>
            </tr>
        `;
  });

  allAttendeesTable.innerHTML = html;
}

function renderPendingTable(pendingAttendees) {
    if (!pendingAttendeesTable) {
        console.warn('renderPendingTable: #pendingAttendeesTable element not found in DOM');
        return;
    }

    let html = '';

    if (pendingAttendees.length === 0) {
        pendingAttendeesTable.innerHTML = '<tr><td colspan="7" style="text-align:center;">No pending attendees</td></tr>';
        return;
    }

    pendingAttendees.forEach(attendee => {
        html += `
            <tr data-id="${attendee.id}">
                <td>${attendee.name || ''}</td>
                <td>${attendee.email || ''}</td>
                <td>${attendee.position || ''}</td>
                <td>${attendee.department || ''}</td>
                <td>${attendee.ministry || ''}</td>
                <td>${attendee.dateAdded || ''}</td>
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
                { id: 1, name: 'John Doe', email: 'john@finance.gov.ng',ministry: 'Ministry of Finance',status: 'valid' },
                { id: 2, name: 'Jane Smith', email: 'jane@finance.gov.ng',ministry: 'Ministry of Finance',status: 'valid' },
                { id: 3, name: 'Error Record', email: 'invalid-email',ministry: 'Ministry of Finance',status: 'error', error: 'Invalid email format' }
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
                { id: 1, name: 'Alice Johnson', email: 'alice@education.gov.ng',ministry: 'Ministry of Education',approvalDate: '2024-01-16' },
                { id: 2, name: 'Bob Williams', email: 'bob@education.gov.ng',ministry: 'Ministry of Education',approvalDate: '2024-01-16' }
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
        const tbody = bulkApprovalsTable;
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
            'Department': record.department,
            'Ministry': record.ministry,
            'Country' : record.country,
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
        
        const rows = bulkApprovalsTable.querySelectorAll('tr');
        
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


// Package Management with Pagination
(function () {
    // State management
    let packages = [];
    let filteredPackages = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalPages = 1;
    let totalPackages = 0;

    // Initialize
    function init() {
        loadSampleData();
        setupEventListeners();
        renderTable();
        updateStats();
    }

    // Generate sample data
    function loadSampleData() {
        const samplePackages = [];
        const types = ['diamond', 'gold', 'silver', 'bronze'];
        const typeNames = {
            diamond: 'Diamond Partner',
            gold: 'Gold Knowledge Partner',
            silver: 'Silver Roundtable Partner',
            bronze: 'Bronze Exhibition Partner'
        };
        const prices = {
            diamond: 5000000,
            gold: 3000000,
            silver: 1500000,
            bronze: 500000
        };
        const maxSlots = {
            diamond: 10,
            gold: 20,
            silver: 30,
            bronze: 50
        };

        for (let i = 1; i <= 45; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const usedSlots = Math.floor(Math.random() * (maxSlots[type] * 0.8));
            
            samplePackages.push({
                id: i,
                name: `${typeNames[type]} Package ${i}`,
                type: type,
                price: prices[type],
                benefits: `• Premium benefits package\n• Conference passes\n• Networking opportunities\n• Brand visibility\n• Speaking slot\n• Exhibition space`,
                maxAvailable: maxSlots[type],
                currentUsed: usedSlots,
                speakRights: type === 'diamond' || type === 'gold',
                speakingSlots: type === 'diamond' ? 2 : type === 'gold' ? 1 : 0,
                exhibitRights: true,
                exhibitSlots: type === 'diamond' ? 3 : type === 'gold' ? 2 : type === 'silver' ? 1 : 1,
                status: Math.random() > 0.2 ? 'active' : 'inactive',
                whenFull: 'show_message',
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} level partnership package`,
                createdDate: new Date().toISOString()
            });
        }

        packages = samplePackages;
        filteredPackages = [...packages];
        totalPackages = packages.length;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Refresh button
        document.getElementById('refreshPackagesBtn')?.addEventListener('click', refreshPackages);
        
        // Add package button
        document.getElementById('addPackageBtn')?.addEventListener('click', openPackageModal);
        
        // Search and filter
        document.getElementById('searchPackages')?.addEventListener('input', debounce(filterPackages, 300));
        document.getElementById('filterPackageType')?.addEventListener('change', filterPackages);
        document.getElementById('filterPackageStatus')?.addEventListener('change', filterPackages);
        document.getElementById('itemsPerPage')?.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            renderTable();
        });
        document.getElementById('clearPackageFiltersBtn')?.addEventListener('click', clearFilters);
        
        // Form submission
        document.getElementById('packageForm')?.addEventListener('submit', savePackage);
        document.getElementById('cancelPackageBtn')?.addEventListener('click', closePackageModal);
        
        // Pagination
        document.getElementById('firstPageBtn')?.addEventListener('click', () => goToPage(1));
        document.getElementById('prevPageBtn')?.addEventListener('click', () => goToPage(currentPage - 1));
        document.getElementById('nextPageBtn')?.addEventListener('click', () => goToPage(currentPage + 1));
        document.getElementById('lastPageBtn')?.addEventListener('click', () => goToPage(totalPages));
        document.getElementById('jumpToPageBtn')?.addEventListener('click', jumpToPage);
        document.getElementById('pageJumpInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') jumpToPage();
        });
        
        // Modal close buttons
        document.querySelectorAll('#packageModal .close-modal, #deletePackageModal .close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Filter packages
    function filterPackages() {
        const searchTerm = document.getElementById('searchPackages').value.toLowerCase();
        const typeFilter = document.getElementById('filterPackageType').value;
        const statusFilter = document.getElementById('filterPackageStatus').value;
        
        filteredPackages = packages.filter(pkg => {
            const matchesSearch = !searchTerm || 
                pkg.name.toLowerCase().includes(searchTerm) ||
                pkg.description.toLowerCase().includes(searchTerm) ||
                pkg.benefits.toLowerCase().includes(searchTerm);
            
            const matchesType = !typeFilter || pkg.type === typeFilter;
            const matchesStatus = !statusFilter || pkg.status === statusFilter;
            
            return matchesSearch && matchesType && matchesStatus;
        });
        
        currentPage = 1;
        renderTable();
    }

    // Clear filters
    function clearFilters() {
        document.getElementById('searchPackages').value = '';
        document.getElementById('filterPackageType').value = '';
        document.getElementById('filterPackageStatus').value = '';
        document.getElementById('itemsPerPage').value = '10';
        itemsPerPage = 10;
        filteredPackages = [...packages];
        currentPage = 1;
        renderTable();
    }

    // Render table with pagination
    function renderTable() {
        const tableBody = document.getElementById('packagesTableBody');
        if (!tableBody) return;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredPackages.length);
        const pagePackages = filteredPackages.slice(startIndex, endIndex);
        totalPages = Math.ceil(filteredPackages.length / itemsPerPage) || 1;
        
        // Update pagination info
        document.getElementById('paginationInfo').textContent = 
            `Showing ${startIndex + 1}-${endIndex} of ${filteredPackages.length} packages`;
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (pagePackages.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: #dee2e6; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #6c757d;">No packages found</p>
                        ${filteredPackages.length === 0 && packages.length > 0 ? 
                          '<p class="text-muted">Try adjusting your filters</p>' : ''}
                    </td>
                </tr>`;
        } else {
            pagePackages.forEach(pkg => {
                const availableSlots = pkg.maxAvailable - pkg.currentUsed;
                const utilization = (pkg.currentUsed / pkg.maxAvailable) * 100;
                
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', pkg.id);
                
                // Type badge
                const typeClass = `badge-${pkg.type}`;
                const typeText = pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1);
                
                // Status badge
                const statusClass = pkg.status === 'active' ? 'status-approved' : 
                                   pkg.status === 'inactive' ? 'status-pending' : 'status-rejected';
                const statusText = pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1);
                
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 600; color: var(--primary-dark);">${pkg.name}</div>
                        <small style="color: var(--text-medium);">${pkg.description}</small>
                    </td>
                    <td>
                        <span class="status-badge ${typeClass}">${typeText}</span>
                    </td>
                    <td style="max-width: 250px;">
                        <div style="max-height: 60px; overflow: hidden; line-height: 1.4;">
                            ${pkg.benefits.split('\n').slice(0, 3).join('<br>')}
                            ${pkg.benefits.split('\n').length > 3 ? '...' : ''}
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 600;">₦${pkg.price.toLocaleString()}</div>
                    </td>
                    <td>
                        <div style="margin-bottom: 5px;">
                            <span style="font-weight: 500;">${availableSlots}/${pkg.maxAvailable}</span>
                            <span style="float: right; color: ${availableSlots <= 2 ? '#dc3545' : '#28a745'}">
                                ${availableSlots} left
                            </span>
                        </div>
                        <div class="progress" style="height: 6px; background: #e9ecef; border-radius: 3px;">
                            <div class="progress-bar" style="width: ${utilization}%; background: ${utilization >= 90 ? '#dc3545' : utilization >= 70 ? '#ffc107' : '#28a745'}"></div>
                        </div>
                    </td>
                    <td>
                        ${pkg.speakRights ? 
                          `<span class="badge badge-success" style="background: #28a745; padding: 4px 8px;">
                            <i class="fas fa-microphone"></i> ${pkg.speakingSlots}
                          </span>` : 
                          `<span class="badge badge-secondary" style="background: #6c757d; padding: 4px 8px;">None</span>`}
                    </td>
                    <td>
                        ${pkg.exhibitRights ? 
                          `<span class="badge badge-info" style="background: #17a2b8; padding: 4px 8px;">
                            <i class="fas fa-store"></i> ${pkg.exhibitSlots}
                          </span>` : 
                          `<span class="badge badge-secondary" style="background: #6c757d; padding: 4px 8px;">None</span>`}
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-info btn-sm view-package-btn" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-warning btn-sm edit-package-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-package-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
        
        // Render pagination controls
        renderPagination();
        
        // Attach event listeners to buttons
        attachRowEventListeners();
    }

    // Render pagination controls
    function renderPagination() {
        const pageNumbersContainer = document.getElementById('pageNumbers');
        if (!pageNumbersContainer) return;
        
        pageNumbersContainer.innerHTML = '';
        
        // Determine which page numbers to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        // Adjust if near start
        if (currentPage <= 3) {
            endPage = Math.min(totalPages, 5);
        }
        
        // Adjust if near end
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }
        
        // Create page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pageNumbersContainer.appendChild(li);
            
            // Add click event
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                goToPage(i);
            });
        }
        
        // Update pagination button states
        document.getElementById('firstPageBtn').classList.toggle('disabled', currentPage === 1);
        document.getElementById('prevPageBtn').classList.toggle('disabled', currentPage === 1);
        document.getElementById('nextPageBtn').classList.toggle('disabled', currentPage === totalPages);
        document.getElementById('lastPageBtn').classList.toggle('disabled', currentPage === totalPages);
        
        // Update page jump input
        document.getElementById('pageJumpInput').value = currentPage;
        document.getElementById('pageJumpInput').max = totalPages;
    }

    // Pagination functions
    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        renderTable();
        scrollToTop();
    }

    function jumpToPage() {
        const input = document.getElementById('pageJumpInput');
        const page = parseInt(input.value);
        if (page >= 1 && page <= totalPages) {
            goToPage(page);
        } else {
            input.value = currentPage;
        }
    }

    function scrollToTop() {
        const packagesTab = document.getElementById('packages');
        if (packagesTab) {
            packagesTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Update statistics
    function updateStats() {
        const diamondPackages = packages.filter(p => p.type === 'diamond');
        const goldPackages = packages.filter(p => p.type === 'gold');
        const silverPackages = packages.filter(p => p.type === 'silver');
        const bronzePackages = packages.filter(p => p.type === 'bronze');
        
        // Calculate available slots
        const diamondAvailable = diamondPackages.reduce((sum, p) => sum + (p.maxAvailable - p.currentUsed), 0);
        const goldAvailable = goldPackages.reduce((sum, p) => sum + (p.maxAvailable - p.currentUsed), 0);
        const silverAvailable = silverPackages.reduce((sum, p) => sum + (p.maxAvailable - p.currentUsed), 0);
        const bronzeAvailable = bronzePackages.reduce((sum, p) => sum + (p.maxAvailable - p.currentUsed), 0);
        
        // Update display
        document.getElementById('totalPackages').textContent = packages.length;
        document.getElementById('diamondCount').textContent = diamondPackages.length;
        document.getElementById('goldCount').textContent = goldPackages.length;
        document.getElementById('silverCount').textContent = silverPackages.length;
        document.getElementById('bronzeCount').textContent = bronzePackages.length;
        
        document.getElementById('diamondAvailable').textContent = diamondAvailable;
        document.getElementById('goldAvailable').textContent = goldAvailable;
        document.getElementById('silverAvailable').textContent = silverAvailable;
        document.getElementById('bronzeAvailable').textContent = bronzeAvailable;
    }

    // Package modal functions
    function openPackageModal(packageId = null) {
        const modal = document.getElementById('packageModal');
        const title = document.getElementById('packageModalTitle');
        
        if (packageId) {
            // Edit mode
            const pkg = packages.find(p => p.id == packageId);
            if (pkg) {
                title.textContent = 'Edit Package';
                document.getElementById('packageId').value = pkg.id;
                document.getElementById('packageType').value = pkg.type;
                document.getElementById('packageName').value = pkg.name;
                document.getElementById('packagePrice').value = pkg.price;
                document.getElementById('packageStatus').value = pkg.status;
                document.getElementById('packageMaxAvailable').value = pkg.maxAvailable;
                document.getElementById('packageCurrentUsed').value = pkg.currentUsed;
                document.getElementById('packageWhenFull').value = pkg.whenFull;
                document.getElementById('packageFullMessage').value = pkg.fullMessage || '';
                document.getElementById('packageSpeakRights').checked = pkg.speakRights;
                document.getElementById('packageSpeakingSlots').value = pkg.speakingSlots || 0;
                document.getElementById('packageExhibitRights').checked = pkg.exhibitRights;
                document.getElementById('packageExhibitSlots').value = pkg.exhibitSlots || 0;
                document.getElementById('packageBenefits').value = pkg.benefits;
                document.getElementById('packageDescription').value = pkg.description;
                
                // Update availability display
                updatePackageAvailability();
                
                // Toggle feature details
                toggleFeatureDetails('packageSpeakRights', 'packageSpeakDetails');
                toggleFeatureDetails('packageExhibitRights', 'packageExhibitDetails');
            }
        } else {
            // Create mode
            title.textContent = 'Create Package';
            document.getElementById('packageForm').reset();
            document.getElementById('packageId').value = '';
            document.getElementById('packageStatus').value = 'active';
            document.getElementById('packageWhenFull').value = 'disable';
            document.getElementById('packageMaxAvailable').value = 10;
            document.getElementById('packageCurrentUsed').value = 0;
            document.getElementById('packageSpeakRights').checked = false;
            document.getElementById('packageExhibitRights').checked = false;
            document.getElementById('packageSpeakDetails').style.display = 'none';
            document.getElementById('packageExhibitDetails').style.display = 'none';
            
            // Update availability display
            updatePackageAvailability();
        }
        
        modal.style.display = 'block';
    }

    function closePackageModal() {
        document.getElementById('packageModal').style.display = 'none';
    }

    // Feature toggle function
    window.toggleFeatureDetails = function(checkboxId, detailsId) {
        const checkbox = document.getElementById(checkboxId);
        const details = document.getElementById(detailsId);
        
        if (checkbox.checked) {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
        }
    };

    // Update package availability display
    window.updatePackageAvailability = function() {
        const maxAvailable = parseInt(document.getElementById('packageMaxAvailable').value) || 0;
        const currentUsed = parseInt(document.getElementById('packageCurrentUsed').value) || 0;
        const available = maxAvailable - currentUsed;
        
        // Update display values
        document.getElementById('totalSlotsDisplay').textContent = maxAvailable;
        document.getElementById('usedSlotsDisplay').textContent = currentUsed;
        document.getElementById('availableSlotsDisplay').textContent = Math.max(0, available);
        
        // Calculate and update utilization
        const utilization = maxAvailable > 0 ? (currentUsed / maxAvailable) * 100 : 0;
        document.getElementById('utilizationDisplay').textContent = utilization.toFixed(1) + '%';
        
        // Update progress bar
        const progressBar = document.getElementById('utilizationProgress');
        progressBar.style.width = Math.min(100, utilization) + '%';
        
        // Update status and colors
        let status = 'Good Availability';
        let statusColor = '#28a745';
        let progressColor = '#28a745';
        let progressText = `${utilization.toFixed(1)}% used`;
        
        if (available <= 0) {
            status = 'No Slots Available';
            statusColor = '#dc3545';
            progressColor = '#dc3545';
            progressText = '100% used - FULL';
        } else if (available <= 2) {
            status = 'Limited Availability';
            statusColor = '#ffc107';
            progressColor = '#ffc107';
            progressText = `${utilization.toFixed(1)}% used - LOW`;
        } else if (utilization >= 90) {
            status = 'Critical Availability';
            statusColor = '#dc3545';
            progressColor = '#dc3545';
            progressText = `${utilization.toFixed(1)}% used - CRITICAL`;
        } else if (utilization >= 70) {
            status = 'High Utilization';
            statusColor = '#fd7e14';
            progressColor = '#fd7e14';
            progressText = `${utilization.toFixed(1)}% used - HIGH`;
        }
        
        // Apply styles
        document.getElementById('availabilityStatus').textContent = status;
        document.getElementById('availabilityStatus').style.backgroundColor = statusColor;
        progressBar.style.backgroundColor = progressColor;
        document.getElementById('progressText').textContent = progressText;
        document.getElementById('progressText').style.color = statusColor;
        
        // Update slots left display color
        const availableDisplay = document.getElementById('availableSlotsDisplay');
        availableDisplay.style.color = statusColor;
        
        // Show/hide alerts
        const alertsContainer = document.getElementById('availabilityAlerts');
        if (available <= 0) {
            alertsContainer.innerHTML = `
                <div class="alert alert-danger" style="margin-top: 15px; padding: 10px; border-radius: 5px;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <strong>Package is full!</strong> All ${maxAvailable} slots are occupied.
                </div>`;
            alertsContainer.style.display = 'block';
        } else if (available <= 2) {
            alertsContainer.innerHTML = `
                <div class="alert alert-warning" style="margin-top: 15px; padding: 10px; border-radius: 5px;">
                    <i class="fas fa-exclamation-circle"></i> 
                    <strong>Limited availability!</strong> Only ${available} slot${available === 1 ? '' : 's'} left.
                </div>`;
            alertsContainer.style.display = 'block';
        } else {
            alertsContainer.style.display = 'none';
        }
    };

    // Save package
    function savePackage(e) {
        e.preventDefault();
        
        const packageId = document.getElementById('packageId').value;
        const packageData = {
            id: packageId ? parseInt(packageId) : packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1,
            name: document.getElementById('packageName').value,
            type: document.getElementById('packageType').value,
            price: parseInt(document.getElementById('packagePrice').value),
            status: document.getElementById('packageStatus').value,
            maxAvailable: parseInt(document.getElementById('packageMaxAvailable').value),
            currentUsed: parseInt(document.getElementById('packageCurrentUsed').value) || 0,
            whenFull: document.getElementById('packageWhenFull').value,
            fullMessage: document.getElementById('packageFullMessage').value,
            speakRights: document.getElementById('packageSpeakRights').checked,
            speakingSlots: parseInt(document.getElementById('packageSpeakingSlots').value) || 0,
            exhibitRights: document.getElementById('packageExhibitRights').checked,
            exhibitSlots: parseInt(document.getElementById('packageExhibitSlots').value) || 0,
            benefits: document.getElementById('packageBenefits').value,
            description: document.getElementById('packageDescription').value,
            createdDate: new Date().toISOString()
        };
        
        if (packageId) {
            // Update existing
            const index = packages.findIndex(p => p.id == packageId);
            if (index !== -1) {
                packages[index] = packageData;
            }
        } else {
            // Add new
            packages.push(packageData);
        }
        
        // Update filtered packages
        filteredPackages = [...packages];
        
        // Update UI
        renderTable();
        updateStats();
        closePackageModal();
        
        // Show success message
        showSuccessMessage(packageId ? 'Package updated successfully!' : 'Package created successfully!');
    }

    // Delete package
    function deletePackage(packageId) {
        const pkg = packages.find(p => p.id == packageId);
        if (!pkg) return;
        
        // Show confirmation modal
        document.getElementById('deletePackageName').textContent = pkg.name;
        document.getElementById('deletePackageModal').setAttribute('data-package-id', packageId);
        document.getElementById('deletePackageModal').style.display = 'block';
        
        // Setup confirmation button
        document.getElementById('confirmDeletePackageBtn').onclick = function() {
            packages = packages.filter(p => p.id != packageId);
            filteredPackages = packages.filter(p => p.id != packageId);
            
            renderTable();
            updateStats();
            
            document.getElementById('deletePackageModal').style.display = 'none';
            showSuccessMessage('Package deleted successfully!');
        };
        
        // Setup cancel button
        document.getElementById('cancelDeletePackageBtn').onclick = function() {
            document.getElementById('deletePackageModal').style.display = 'none';
        };
    }

    // View package
    function viewPackage(packageId) {
        const pkg = packages.find(p => p.id == packageId);
        if (!pkg) return;
        
        alert(`Package Details:\n\n` +
              `Name: ${pkg.name}\n` +
              `Type: ${pkg.type}\n` +
              `Price: ₦${pkg.price.toLocaleString()}\n` +
              `Status: ${pkg.status}\n` +
              `Slots: ${pkg.currentUsed}/${pkg.maxAvailable} (${pkg.maxAvailable - pkg.currentUsed} available)\n` +
              `Speaking Slots: ${pkg.speakRights ? pkg.speakingSlots : 'None'}\n` +
              `Exhibition Slots: ${pkg.exhibitRights ? pkg.exhibitSlots : 'None'}\n\n` +
              `Description: ${pkg.description}\n\n` +
              `Benefits:\n${pkg.benefits}`);
    }

    // Attach event listeners to row buttons
    function attachRowEventListeners() {
        document.querySelectorAll('.view-package-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const packageId = this.closest('tr').getAttribute('data-id');
                viewPackage(packageId);
            });
        });
        
        document.querySelectorAll('.edit-package-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const packageId = this.closest('tr').getAttribute('data-id');
                openPackageModal(packageId);
            });
        });
        
        document.querySelectorAll('.delete-package-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const packageId = this.closest('tr').getAttribute('data-id');
                deletePackage(packageId);
            });
        });
    }

    // Refresh packages
    function refreshPackages() {
        renderTable();
        showSuccessMessage('Packages refreshed!');
    }

    // Show success message
    function showSuccessMessage(message) {
        // You can implement a toast notification here
        console.log('Success:', message);
        alert(message);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


// Package Management JavaScript
(function () {
    const packagesBody = document.getElementById('packagesTableBody');
    const refreshBtn = document.getElementById('refreshPackagesBtn');
    const addPackageBtn = document.getElementById('addPackageBtn');
    const packageModal = document.getElementById('packageModal');
    const packageForm = document.getElementById('packageForm');
    const packageModalTitle = document.getElementById('packageModalTitle');
    const deletePackageModal = document.getElementById('deletePackageModal');
    
    // Sample data for demonstration
    let packages = [
        {
            id: 1,
            name: "Premium Partnership",
            type: "diamond",
            price: 5000000,
            benefits: "• Prime booth location (6x9m)\n• 10 conference passes\n• Keynote speaking slot\n• Company logo on all promotional materials",
            maxAvailable: 10,
            currentUsed: 0,
            speakRights: true,
            speakingSlots: 1,
            exhibitRights: true,
            exhibitSlots: 2,
            status: "active",
            whenFull: "show_message",
            fullMessage: "Diamond partnership slots are currently full"
        },
        {
            id: 2,
            name: "Gold Knowledge Partner",
            type: "gold",
            price: 3000000,
            benefits: "• Standard booth location (6x6m)\n• 6 conference passes\n• Panel discussion participation",
            maxAvailable: 20,
            currentUsed: 0,
            speakRights: true,
            speakingSlots: 1,
            exhibitRights: true,
            exhibitSlots: 1,
            status: "active",
            whenFull: "waitlist"
        }
    ];

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    }

    function renderPackages() {
        if (!packagesBody) return;
        
        packagesBody.innerHTML = '';
        
        if (!Array.isArray(packages) || packages.length === 0) {
            packagesBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        No packages found. <a href="#" id="addFirstPackage" style="color: var(--primary);">Create your first package</a>
                    </td>
                </tr>`;
            
            document.getElementById('addFirstPackage')?.addEventListener('click', (e) => {
                e.preventDefault();
                openPackageModal();
            });
            return;
        }
        
        packages.forEach(pkg => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', pkg.id);
            
            // Status badge
            const statusClass = pkg.status === 'active' ? 'status-approved' : 
                               pkg.status === 'full' ? 'status-rejected' : 'status-pending';
            const statusText = pkg.status === 'active' ? 'Active' : 
                               pkg.status === 'full' ? 'Full' : 'Inactive';
            
            // Type badge
            const typeClass = pkg.type === 'diamond' ? 'badge-diamond' :
                              pkg.type === 'gold' ? 'badge-gold' :
                              pkg.type === 'silver' ? 'badge-silver' : 'badge-bronze';
            const typeText = pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1);
            
            // Preview first 2 benefits
            const benefitsPreview = pkg.benefits.split('\n').slice(0, 2).join('<br>') + 
                                   (pkg.benefits.split('\n').length > 2 ? '...' : '');
            
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${pkg.name}</div>
                    <small style="color: var(--text-medium);">${formatCurrency(pkg.price)}</small>
                </td>
                <td><span class="status-badge ${typeClass}">${typeText}</span></td>
                <td style="max-width: 250px;">${benefitsPreview}</td>
                <td>${formatCurrency(pkg.price)}</td>
                <td>${pkg.currentUsed}/${pkg.maxAvailable}</td>
                <td>${pkg.speakRights ? pkg.speakingSlots : 'None'}</td>
                <td>${pkg.exhibitRights ? pkg.exhibitSlots : 'None'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-package-btn" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm edit-package-btn" title="Edit Package">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-package-btn" title="Delete Package">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            packagesBody.appendChild(tr);
        });
        
        updatePackageStats();
        attachPackageEventListeners();
    }

    function updatePackageStats() {
        document.getElementById('totalPackages').textContent = packages.length;
        document.getElementById('diamondCount').textContent = packages.filter(p => p.type === 'diamond').length;
        document.getElementById('goldCount').textContent = packages.filter(p => p.type === 'gold').length;
        document.getElementById('silverCount').textContent = packages.filter(p => p.type === 'silver').length;
        document.getElementById('bronzeCount').textContent = packages.filter(p => p.type === 'bronze').length;
    }

    function openPackageModal(packageId = null) {
        const modal = document.getElementById('packageModal');
        const form = document.getElementById('packageForm');
        const title = document.getElementById('packageModalTitle');
        
        if (packageId) {
            // Edit mode
            const pkg = packages.find(p => p.id == packageId);
            if (pkg) {
                title.textContent = 'Edit Package';
                document.getElementById('packageId').value = pkg.id;
                document.getElementById('packageType').value = pkg.type;
                document.getElementById('packageName').value = pkg.name;
                document.getElementById('packagePrice').value = pkg.price;
                document.getElementById('packageStatus').value = pkg.status;
                document.getElementById('packageMaxAvailable').value = pkg.maxAvailable;
                document.getElementById('packageWhenFull').value = pkg.whenFull;
                document.getElementById('packageFullMessage').value = pkg.fullMessage || '';
                document.getElementById('packageSpeakRights').checked = pkg.speakRights;
                document.getElementById('packageSpeakingSlots').value = pkg.speakingSlots || 0;
                document.getElementById('packageExhibitRights').checked = pkg.exhibitRights;
                document.getElementById('packageExhibitSlots').value = pkg.exhibitSlots || 0;
                document.getElementById('packageBenefits').value = pkg.benefits;
                document.getElementById('packageDescription').value = pkg.description || '';
                document.getElementById('packageGracePeriod').value = pkg.gracePeriod || 48;
                document.getElementById('packageAutoReopen').value = pkg.autoReopen || 'yes';
                document.getElementById('packageNotes').value = pkg.notes || '';
                
                // Toggle feature details visibility
                toggleFeatureDetails('packageSpeakRights', 'packageSpeakDetails');
                toggleFeatureDetails('packageExhibitRights', 'packageExhibitDetails');
            }
        } else {
            // Create mode
            title.textContent = 'Create Package';
            form.reset();
            document.getElementById('packageId').value = '';
            document.getElementById('packageStatus').value = 'active';
            document.getElementById('packageWhenFull').value = 'show_message';
            document.getElementById('packageSpeakRights').checked = false;
            document.getElementById('packageExhibitRights').checked = false;
            document.getElementById('packageSpeakDetails').style.display = 'none';
            document.getElementById('packageExhibitDetails').style.display = 'none';
        }
        
        modal.style.display = 'block';
    }

    function toggleFeatureDetails(checkboxId, detailsId) {
        const checkbox = document.getElementById(checkboxId);
        const details = document.getElementById(detailsId);
        
        if (checkbox.checked) {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
        }
    }

    function attachPackageEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-package-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const packageId = btn.closest('tr').getAttribute('data-id');
                openPackageModal(packageId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-package-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const packageId = btn.closest('tr').getAttribute('data-id');
                const packageName = btn.closest('tr').querySelector('td:first-child div').textContent;
                openDeletePackageModal(packageId, packageName);
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-package-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const packageId = btn.closest('tr').getAttribute('data-id');
                viewPackageDetails(packageId);
            });
        });
    }

    function openDeletePackageModal(packageId, packageName) {
        document.getElementById('deletePackageName').textContent = packageName;
        document.getElementById('deletePackageModal').setAttribute('data-package-id', packageId);
        document.getElementById('deletePackageModal').style.display = 'block';
    }

    function viewPackageDetails(packageId) {
        const pkg = packages.find(p => p.id == packageId);
        if (!pkg) return;
        
        alert(`Package Details:\n\n` +
              `Name: ${pkg.name}\n` +
              `Type: ${pkg.type}\n` +
              `Price: ${formatCurrency(pkg.price)}\n` +
              `Status: ${pkg.status}\n` +
              `Benefits:\n${pkg.benefits}\n` +
              `Slots: ${pkg.currentUsed}/${pkg.maxAvailable}\n` +
              `Speaking Slots: ${pkg.speakRights ? pkg.speakingSlots : 'None'}\n` +
              `Exhibition Slots: ${pkg.exhibitRights ? pkg.exhibitSlots : 'None'}`);
    }

    // Feature toggle event listeners
    document.getElementById('packageSpeakRights')?.addEventListener('change', function() {
        toggleFeatureDetails('packageSpeakRights', 'packageSpeakDetails');
    });
    
    document.getElementById('packageExhibitRights')?.addEventListener('change', function() {
        toggleFeatureDetails('packageExhibitRights', 'packageExhibitDetails');
    });

    // Form submission
    packageForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const packageId = document.getElementById('packageId').value;
        const packageData = {
            name: document.getElementById('packageName').value,
            type: document.getElementById('packageType').value,
            price: parseInt(document.getElementById('packagePrice').value),
            status: document.getElementById('packageStatus').value,
            maxAvailable: parseInt(document.getElementById('packageMaxAvailable').value),
            whenFull: document.getElementById('packageWhenFull').value,
            fullMessage: document.getElementById('packageFullMessage').value,
            speakRights: document.getElementById('packageSpeakRights').checked,
            speakingSlots: parseInt(document.getElementById('packageSpeakingSlots').value) || 0,
            exhibitRights: document.getElementById('packageExhibitRights').checked,
            exhibitSlots: parseInt(document.getElementById('packageExhibitSlots').value) || 0,
            benefits: document.getElementById('packageBenefits').value,
            description: document.getElementById('packageDescription').value,
            gracePeriod: parseInt(document.getElementById('packageGracePeriod').value),
            autoReopen: document.getElementById('packageAutoReopen').value,
            notes: document.getElementById('packageNotes').value,
            currentUsed: 0
        };
        
        if (packageId) {
            // Update existing package
            const index = packages.findIndex(p => p.id == packageId);
            if (index !== -1) {
                packageData.id = parseInt(packageId);
                packages[index] = packageData;
            }
        } else {
            // Create new package
            packageData.id = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
            packages.push(packageData);
        }
        
        renderPackages();
        document.getElementById('packageModal').style.display = 'none';
        
        // Show success message
        showSuccessMessage(packageId ? 'Package updated successfully!' : 'Package created successfully!');
    });

    // Delete package
    document.getElementById('confirmDeletePackageBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('deletePackageModal');
        const packageId = modal.getAttribute('data-package-id');
        
        if (packageId) {
            packages = packages.filter(p => p.id != packageId);
            renderPackages();
            modal.style.display = 'none';
            showSuccessMessage('Package deleted successfully!');
        }
    });

    // Cancel delete
    document.getElementById('cancelDeletePackageBtn')?.addEventListener('click', function() {
        document.getElementById('deletePackageModal').style.display = 'none';
    });

    // Cancel package form
    document.getElementById('cancelPackageBtn')?.addEventListener('click', function() {
        document.getElementById('packageModal').style.display = 'none';
    });

    // Add package button
    addPackageBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        openPackageModal();
    });

    // Refresh button
    refreshBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        renderPackages();
        showSuccessMessage('Packages refreshed!');
    });

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    function showSuccessMessage(message) {
        // You can implement a toast notification here
        console.log('Success:', message);
        // For now, let's use alert
        alert(message);
    }

    // Initial render
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPackages);
    } else {
        renderPackages();
    }

})();


// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initializePackageManagement();

    function getToken(){
        try{
            const raw = localStorage.getItem('userData');
            if (raw){ const a = JSON.parse(raw); if (a && a.token) return a.token; }
        } catch(e){}
        return localStorage.getItem('accessToken') || null;
    }

    const partnerPackageSelect = document.getElementById('partnerPackage');
    if (partnerPackageSelect) {
        fetch(`${API_BASE_URL}/packages/event-partner-packages`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(result => {
                const data = result.data;
                data.forEach(pkg => {
                    const option = document.createElement('option');
                    option.value = pkg.id;
                    option.textContent = pkg.title;
                    partnerPackageSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading partner packages:', error);
            });
    }

    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        const countries = [
            'Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
            'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal', 'Greece',
            'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia', 'Croatia', 'Romania', 'Bulgaria', 'Serbia', 'Bosnia and Herzegovina',
            'Montenegro', 'Kosovo', 'Albania', 'North Macedonia', 'Turkey', 'Russia', 'Ukraine', 'Belarus', 'Moldova', 'Georgia',
            'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan', 'Afghanistan', 'Pakistan',
            'India', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'China', 'Japan', 'South Korea', 'North Korea',
            'Mongolia', 'Vietnam', 'Laos', 'Cambodia', 'Thailand', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines',
            'Brunei', 'East Timor', 'Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa',
            'Tonga', 'Tuvalu', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Palau', 'Nauru', 'Egypt', 'Libya', 'Tunisia',
            'Algeria', 'Morocco', 'Western Sahara', 'Mauritania', 'Mali', 'Niger', 'Chad', 'Sudan', 'South Sudan', 'Eritrea',
            'Djibouti', 'Somalia', 'Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Democratic Republic of the Congo',
            'Republic of the Congo', 'Gabon', 'Equatorial Guinea', 'Cameroon', 'Central African Republic', 'Angola', 'Zambia',
            'Zimbabwe', 'Malawi', 'Mozambique', 'Botswana', 'Namibia', 'South Africa', 'Lesotho', 'Swaziland', 'Ghana', 'Togo',
            'Benin', 'Burkina Faso', 'Côte d\'Ivoire', 'Liberia', 'Sierra Leone', 'Guinea', 'Guinea-Bissau', 'Senegal', 'Gambia',
            'Cape Verde', 'São Tomé and Príncipe', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador',
            'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname', 'French Guiana', 'Mexico', 'Guatemala', 'Belize', 'El Salvador',
            'Honduras', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Haiti', 'Dominican Republic', 'Jamaica', 'Trinidad and Tobago',
            'Barbados', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Grenada', 'Antigua and Barbuda', 'Saint Kitts and Nevis',
            'Bahamas', 'Puerto Rico', 'U.S. Virgin Islands', 'British Virgin Islands', 'Anguilla', 'Montserrat', 'Guadeloupe',
            'Martinique', 'Saint Martin', 'Saint Barthélemy', 'Aruba', 'Curaçao', 'Bonaire', 'Saba', 'Sint Eustatius', 'Sint Maarten'
        ];
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }

    const addPartnerForm = document.getElementById('addPartnerForm');

    if (addPartnerForm) {
        addPartnerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = addPartnerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Add Partner';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating...';
            }

            // Collect form data
            const formData = {
                contactEmail: document.getElementById('email').value.trim(),
                prefix: document.getElementById('prefix').value,
                contactFirstName: document.getElementById('firstName').value.trim(),
                contactLastName: document.getElementById('lastName').value.trim(),
                country: document.getElementById('country').value,
                jobTitle: document.getElementById('jobTitle').value.trim(),
                companyName: document.getElementById('organisation').value.trim(),
                contactPhone: document.getElementById('workPhone').value.trim(),
                package_id: document.getElementById('partnerPackage').value,
                package_status: document.getElementById('partnerStatus').value,
                status: document.getElementById('partnerPaymentStatus').value
            };

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/admin/create-partner`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    showSuccessMessage('Partner created successfully!');
                    addPartnerForm.reset();
                    document.getElementById('addPartnerModal').style.display = 'none';
                    // TODO: Refresh partners table if exists
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    alert('Error: ' + (errorData.message || 'Failed to create partner'));
                }
            } catch (error) {
                console.error('Error creating partner:', error);
                alert('Error creating partner. Please try again.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }
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
    console.warn("Using fallback partner counts");
    return { diamond: 0, gold: 0, silver: 0, bronze: 0 };
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

        this.setupEventListeners();
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

         document.addEventListener('attendanceRecorded', (e) => {
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
        this.showToast('Participants data refreshed', 'success');
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

// Initialize Package Feature Rights
document.addEventListener('DOMContentLoaded', function() {
    // Load saved package configurations
    loadPackageConfigurations();
    
    // Initialize toggle functionality
    initializeFeatureToggles();
    
    // Initialize benefits tabs
    initializeBenefitsTabs();
    
    // Handle form submission
    const packageConfigForm = document.getElementById('packageConfigForm');
    if (packageConfigForm) {
        packageConfigForm.addEventListener('submit', savePackageConfigurations);
    }
    
    // Handle refresh stats button
    const refreshPackageStatsBtn = document.getElementById('refreshPackageStatsBtn');
    if (refreshPackageStatsBtn) {
        refreshPackageStatsBtn.addEventListener('click', refreshPackageStats);
    }
    
    // Handle reset defaults button
    const resetPackageDefaultsBtn = document.getElementById('resetPackageDefaultsBtn');
    if (resetPackageDefaultsBtn) {
        resetPackageDefaultsBtn.addEventListener('click', resetPackageDefaults);
    }
});

function initializeFeatureToggles() {
    // Get all feature checkboxes
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox');
    
    featureCheckboxes.forEach(checkbox => {
        // Set initial state
        const packageType = checkbox.id.replace('ExhibitRights', '').replace('SpeakRights', '');
        const featureType = checkbox.id.includes('Exhibit') ? 'Exhibit' : 'Speak';
        const detailsDiv = document.getElementById(`${packageType.toLowerCase()}${featureType}Details`);
        
        if (detailsDiv) {
            detailsDiv.style.display = checkbox.checked ? 'block' : 'none';
        }
        
        // Add change event listener
        checkbox.addEventListener('change', function() {
            if (detailsDiv) {
                detailsDiv.style.display = this.checked ? 'block' : 'none';
                
                // If turning off, reset values
                if (!this.checked) {
                    resetFeatureDetails(packageType.toLowerCase(), featureType);
                }
            }
        });
    });
}

function resetFeatureDetails(packageType, featureType) {
    const detailsDiv = document.getElementById(`${packageType}${featureType}Details`);
    if (detailsDiv) {
        const inputs = detailsDiv.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = 0;
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
        });
    }
}

function initializeBenefitsTabs() {
    const tabButtons = document.querySelectorAll('.benefits-tab-btn');
    const tabPanes = document.querySelectorAll('.benefits-tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageType = this.getAttribute('data-package');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding pane
            tabPanes.forEach(pane => pane.style.display = 'none');
            document.getElementById(`${packageType}Benefits`).style.display = 'block';
        });
    });
}

async function loadPackageConfigurations() {
    try {
        // BACKEND INTEGRATION: Fetch saved configurations
        // const response = await fetch('/api/package-configurations');
        // const data = await response.json();
        
        // Sample data for demo
        const savedConfig = {
            diamond: {
                maxRegistrants: 10,
                currentCount: 3,
                exhibitRights: true,
                speakRights: true,
                boothSlots: 2,
                boothSize: '6x9m',
                speakingSlots: 1,
                sessionType: 'keynote',
                investment: 5000000
            },
            gold: {
                maxRegistrants: 20,
                currentCount: 8,
                exhibitRights: true,
                speakRights: true,
                boothSlots: 1,
                boothSize: '6x6m',
                speakingSlots: 1,
                sessionType: 'panel',
                investment: 3000000
            },
            silver: {
                maxRegistrants: 30,
                currentCount: 15,
                exhibitRights: true,
                speakRights: false,
                boothSlots: 1,
                boothSize: '3x6m',
                speakingSlots: 0,
                sessionType: 'roundtable',
                investment: 1500000
            },
            bronze: {
                maxRegistrants: 50,
                currentCount: 25,
                exhibitRights: false,
                speakRights: false,
                boothSlots: 0,
                boothSize: '3x3m',
                speakingSlots: 0,
                sessionType: 'workshop',
                investment: 500000
            }
        };
        
        // Apply configurations to form
        Object.keys(savedConfig).forEach(packageType => {
            const config = savedConfig[packageType];
            
            // Set capacity
            document.getElementById(`${packageType}MaxRegistrants`).value = config.maxRegistrants;
            document.getElementById(`${packageType}CurrentCount`).value = config.currentCount;
            
            // Set feature rights
            document.getElementById(`${packageType}ExhibitRights`).checked = config.exhibitRights;
            document.getElementById(`${packageType}SpeakRights`).checked = config.speakRights;
            
            // Set exhibit details
            if (config.exhibitRights) {
                document.getElementById(`${packageType}BoothSlots`).value = config.boothSlots;
                document.getElementById(`${packageType}BoothSize`).value = config.boothSize;
            }
            
            // Set speak details
            if (config.speakRights) {
                document.getElementById(`${packageType}SpeakingSlots`).value = config.speakingSlots;
                document.getElementById(`${packageType}SessionType`).value = config.sessionType;
            }
            
            // Set investment
            document.getElementById(`${packageType}Investment`).value = config.investment;
            
            // Update status display
            updatePackageStatus(packageType, config.currentCount, config.maxRegistrants);
        });
        
        // Update utilization stats
        updateUtilizationStats(savedConfig);
        
    } catch (error) {
        console.error('Error loading package configurations:', error);
        showNotification('Failed to load package configurations', 'error');
    }
}

function updatePackageStatus(packageType, currentCount, maxRegistrants) {
    const statusElement = document.getElementById(`${packageType}Status`);
    
    if (!statusElement) return;
    
    if (maxRegistrants === 0) {
        statusElement.textContent = 'Unlimited';
        statusElement.className = 'package-status status-available';
    } else if (currentCount >= maxRegistrants) {
        statusElement.textContent = 'Full';
        statusElement.className = 'package-status status-full';
    } else {
        statusElement.textContent = 'Available';
        statusElement.className = 'package-status status-available';
    }
}

function updateUtilizationStats(config) {
    Object.keys(config).forEach(packageType => {
        const configData = config[packageType];
        const current = configData.currentCount;
        const max = configData.maxRegistrants;
        
        // Update utilization display
        document.getElementById(`${packageType}Utilization`).textContent = `${current}/${max}`;
        
        // Calculate percentage
        const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
        document.getElementById(`${packageType}Percentage`).textContent = `${percentage}%`;
    });
}

async function savePackageConfigurations(e) {
    e.preventDefault();
    
    try {
        const config = {
            diamond: getPackageConfig('diamond'),
            gold: getPackageConfig('gold'),
            silver: getPackageConfig('silver'),
            bronze: getPackageConfig('bronze'),
            paymentGracePeriod: document.getElementById('paymentGracePeriod').value,
            autoReopenEnabled: document.getElementById('autoReopenEnabled').value,
            paymentReminderTemplate: document.getElementById('paymentReminderTemplate').value
        };
        
        // BACKEND INTEGRATION: Save configurations
        // const response = await fetch('/api/package-configurations/save', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(config)
        // });
        
        // if (response.ok) {
            showNotification('Package configurations saved successfully!');
            
            // Update partner dashboards in real-time
            notifyPartnerDashboards(config);
            
            // Update status displays
            updatePackageStatus('diamond', config.diamond.currentCount, config.diamond.maxRegistrants);
            updatePackageStatus('gold', config.gold.currentCount, config.gold.maxRegistrants);
            updatePackageStatus('silver', config.silver.currentCount, config.silver.maxRegistrants);
            updatePackageStatus('bronze', config.bronze.currentCount, config.bronze.maxRegistrants);
            
            updateUtilizationStats(config);
        // } else {
        //     throw new Error('Failed to save configurations');
        // }
        
    } catch (error) {
        console.error('Error saving package configurations:', error);
        showNotification('Failed to save package configurations', 'error');
    }
}

function getPackageConfig(packageType) {
    return {
        maxRegistrants: parseInt(document.getElementById(`${packageType}MaxRegistrants`).value) || 0,
        currentCount: parseInt(document.getElementById(`${packageType}CurrentCount`).value) || 0,
        exhibitRights: document.getElementById(`${packageType}ExhibitRights`).checked,
        speakRights: document.getElementById(`${packageType}SpeakRights`).checked,
        boothSlots: document.getElementById(`${packageType}ExhibitRights`).checked ? 
            parseInt(document.getElementById(`${packageType}BoothSlots`).value) || 0 : 0,
        boothSize: document.getElementById(`${packageType}ExhibitRights`).checked ? 
            document.getElementById(`${packageType}BoothSize`).value : '',
        speakingSlots: document.getElementById(`${packageType}SpeakRights`).checked ? 
            parseInt(document.getElementById(`${packageType}SpeakingSlots`).value) || 0 : 0,
        sessionType: document.getElementById(`${packageType}SpeakRights`).checked ? 
            document.getElementById(`${packageType}SessionType`).value : '',
        sessionDuration: document.getElementById(`${packageType}SpeakRights`).checked ? 
            parseInt(document.getElementById(`${packageType}SessionDuration`).value) || 0 : 0,
        speakerPriority: document.getElementById(`${packageType}SpeakRights`).checked ? 
            document.getElementById(`${packageType}SpeakerPriority`).value : '3',
        investment: parseInt(document.getElementById(`${packageType}Investment`).value) || 0,
        features: document.getElementById(`${packageType}Features`).value,
        description: document.getElementById(`${packageType}Description`).value,
        boothLocation: document.getElementById(`${packageType}ExhibitRights`).checked ? 
            document.getElementById(`${packageType}BoothLocation`).value : '',
        setupTime: document.getElementById(`${packageType}ExhibitRights`).checked ? 
            parseInt(document.getElementById(`${packageType}SetupTime`).value) || 0 : 0
    };
}

function notifyPartnerDashboards(config) {
    // This function would send WebSocket or push notifications to partner dashboards
    // For now, we'll simulate with a console log
    console.log('Notifying partner dashboards with updated configurations:', config);
    
    // In a real implementation:
    // socket.emit('packageConfigUpdated', config);
    // or
    // fetch('/api/notify-partners', { method: 'POST', body: JSON.stringify(config) });
}

async function refreshPackageStats() {
    try {
        showNotification('Refreshing package statistics...', 'info');
        
        // BACKEND INTEGRATION: Fetch latest stats
        // const response = await fetch('/api/package-stats');
        // const stats = await response.json();
        
        // Sample data for demo
        const stats = {
            diamond: { current: 3, max: 10 },
            gold: { current: 8, max: 20 },
            silver: { current: 15, max: 30 },
            bronze: { current: 25, max: 50 }
        };
        
        // Update current counts
        Object.keys(stats).forEach(packageType => {
            const stat = stats[packageType];
            document.getElementById(`${packageType}CurrentCount`).value = stat.current;
            document.getElementById(`${packageType}Utilization`).textContent = `${stat.current}/${stat.max}`;
            
            const percentage = stat.max > 0 ? Math.round((stat.current / stat.max) * 100) : 0;
            document.getElementById(`${packageType}Percentage`).textContent = `${percentage}%`;
            
            updatePackageStatus(packageType, stat.current, stat.max);
        });
        
        showNotification('Package statistics refreshed successfully!');
        
    } catch (error) {
        console.error('Error refreshing package stats:', error);
        showNotification('Failed to refresh package statistics', 'error');
    }
}

function resetPackageDefaults() {
    if (!confirm('Are you sure you want to reset all package configurations to defaults?')) {
        return;
    }
    
    // Reset Diamond
    document.getElementById('diamondMaxRegistrants').value = 10;
    document.getElementById('diamondExhibitRights').checked = true;
    document.getElementById('diamondSpeakRights').checked = true;
    document.getElementById('diamondBoothSlots').value = 2;
    document.getElementById('diamondBoothSize').value = '6x9m';
    document.getElementById('diamondSpeakingSlots').value = 1;
    document.getElementById('diamondSessionType').value = 'keynote';
    document.getElementById('diamondInvestment').value = 5000000;
    
    // Reset Gold
    document.getElementById('goldMaxRegistrants').value = 20;
    document.getElementById('goldExhibitRights').checked = true;
    document.getElementById('goldSpeakRights').checked = true;
    document.getElementById('goldBoothSlots').value = 1;
    document.getElementById('goldBoothSize').value = '6x6m';
    document.getElementById('goldSpeakingSlots').value = 1;
    document.getElementById('goldSessionType').value = 'panel';
    document.getElementById('goldInvestment').value = 3000000;
    
    // Reset Silver
    document.getElementById('silverMaxRegistrants').value = 30;
    document.getElementById('silverExhibitRights').checked = true;
    document.getElementById('silverSpeakRights').checked = false;
    document.getElementById('silverBoothSlots').value = 1;
    document.getElementById('silverBoothSize').value = '3x6m';
    document.getElementById('silverSpeakingSlots').value = 0;
    document.getElementById('silverSessionType').value = 'roundtable';
    document.getElementById('silverInvestment').value = 1500000;
    
    // Reset Bronze
    document.getElementById('bronzeMaxRegistrants').value = 50;
    document.getElementById('bronzeExhibitRights').checked = false;
    document.getElementById('bronzeSpeakRights').checked = false;
    document.getElementById('bronzeBoothSlots').value = 0;
    document.getElementById('bronzeBoothSize').value = '3x3m';
    document.getElementById('bronzeSpeakingSlots').value = 0;
    document.getElementById('bronzeSessionType').value = 'workshop';
    document.getElementById('bronzeInvestment').value = 500000;
    
    // Reset payment settings
    document.getElementById('paymentGracePeriod').value = 48;
    document.getElementById('autoReopenEnabled').value = 'yes';
    
    // Update UI
    document.querySelectorAll('.feature-details').forEach(details => {
        const checkbox = details.previousElementSibling.querySelector('.feature-checkbox');
        details.style.display = checkbox.checked ? 'block' : 'none';
    });
    
    showNotification('Package configurations reset to defaults');
}

function forcePackageStatus(packageType, action) {
    const maxInput = document.getElementById(`${packageType}MaxRegistrants`);
    const currentInput = document.getElementById(`${packageType}CurrentCount`);
    
    if (action === 'open') {
        // Force open by increasing max registrants
        const currentMax = parseInt(maxInput.value) || 0;
        maxInput.value = currentMax + 1;
        
        // Update status
        updatePackageStatus(packageType, parseInt(currentInput.value) || 0, maxInput.value);
        showNotification(`${packageType.charAt(0).toUpperCase() + packageType.slice(1)} package forced open`);
        
    } else if (action === 'close') {
        // Force close by setting current = max
        const currentCount = parseInt(currentInput.value) || 0;
        maxInput.value = currentCount;
        
        // Update status
        updatePackageStatus(packageType, currentCount, maxInput.value);
        showNotification(`${packageType.charAt(0).toUpperCase() + packageType.slice(1)} package forced closed`);
    }
}

function adjustCapacity(packageType, change) {
    const input = document.getElementById(`${packageType}MaxRegistrants`);
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, currentValue + change);
    input.value = newValue;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the page to show content
document.body.style.display = 'block';

// Booth Management Functionality
(function () {
    const boothsBody = document.getElementById('boothsTableBody');
    const totalEl = document.getElementById('totalBooths');
    const availableEl = document.getElementById('availableBooths');
    const soldOutEl = document.getElementById('soldOutBooths');
    const refreshBtn = document.getElementById('refreshBoothsBtn');

    function safeText(v) {
        return (v === null || v === undefined || v === '') ? '-' : String(v);
    }

    function formatPrice(v) {
        if (v === null || v === undefined || v === '') return '-';
        const n = Number(String(v).replace(/[^0-9.-]+/g, ''));
        if (Number.isFinite(n)) return n.toLocaleString();
        return String(v);
    }

    function statusClassFrom(status) {
        if (!status) return 'status-pending';
        const s = String(status).toLowerCase();
        if (s === 'available' || s === 'approved' || s === 'active') return 'status-approved';
        if (s === 'sold' || s === 'sold out' || s === 'reserved') return 'status-pending';
        return 'status-rejected';
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

    function renderBooths(list) {
        if (!boothsBody) return;
        boothsBody.innerHTML = '';
        if (!Array.isArray(list) || list.length === 0) {
            boothsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No booths found.</td></tr>';
            return;
        }
        list.forEach(booth => {
            const tr = document.createElement('tr');
            if (booth.id !== undefined) tr.setAttribute('data-id', booth.id);
            const boothId = safeText(booth.booth_number || booth.booth_id || booth.id || '-');
            const location = safeText(booth.location || '-');
            const price = formatPrice(booth.price || booth.cost || '-');
            const size = safeText(booth.booth_size || booth.size || '-');
            const status = safeText(booth.status || '-');
            const exhibitor = safeText(booth.exhibitor_name || booth.exhibitor || '-');
            const company = safeText(booth.company_name || booth.company || '-');

            const statusClass = statusClassFrom(status);

            tr.innerHTML = `
                <td>${boothId}</td>
                <td>${location}</td>
                <td>${price}</td>
                <td>${size}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${exhibitor}</td>
                <td>${company}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm view-booth-btn">View</button>
                        <button class="btn btn-warning btn-sm edit-booth-btn">Edit</button>
                        <button class="btn btn-danger btn-sm delete-booth-btn">Delete</button>
                    </div>
                </td>
            `;
            tr.dataset.features = JSON.stringify(booth.features || []);
            boothsBody.appendChild(tr);
        });
    }

    function updateStats(list) {
        const arr = Array.isArray(list) ? list : [];
        if (totalEl) totalEl.textContent = arr.length;
        if (availableEl) availableEl.textContent = arr.filter(b => (b.status || '').toString().toLowerCase() === 'available').length;
        if (soldOutEl) soldOutEl.textContent = arr.filter(b => (b.status || '').toString().toLowerCase() === 'sold' || (b.status || '').toString().toLowerCase() === 'sold out').length;
    }

    async function fetchBooths() {
        try {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            
            const res = await axios.get(`${API_BASE_URL}/admin/get-booths`, { headers });
            const list = (res && res.data && res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            renderBooths(list);
            updateStats(list);
        } catch (err) {
            console.error('Error fetching booths:', err);
            if (boothsBody) boothsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c00;">Failed to load booths.</td></tr>';
        }
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fetchBooths();
        });
    }

    // Fetch once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchBooths);
    } else {
        fetchBooths();
    }
})();

// Download attendees template button handler
(function() {
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    if (!downloadTemplateBtn) return;

    function getAuthToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (e) { /* ignore */ }
        return localStorage.getItem('accessToken') || null;
    }

    downloadTemplateBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            const token = getAuthToken();
            const headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const res = await axios.get(`${API_BASE_URL}/admin/attendees/template`, {
                headers,
                responseType: 'blob'
            });

            // Try to infer filename from Content-Disposition
            const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition']) || '';
            let filename = 'attendees_template.csv';
            const match = /filename\*?=([^;]+)/i.exec(disposition);
            if (match) {
                filename = match[1].replace(/UTF-8''/, '').replace(/"/g, '').trim();
            }

            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            if (typeof showNotification === 'function') showNotification('Template download started', 'success');
        } catch (err) {
            console.error('Error downloading template:', err);
            if (typeof showNotification === 'function') showNotification(err.response?.data?.message || 'Failed to download template', 'error');
        }
    });
})();

// ==================== AGENDA MANAGEMENT ====================
(function() {
    let agendaData = { wednesday: [], thursday: [] };
    let agendaList = []; // flat list for search/filter
    const agendaTimeline = document.querySelector('.agenda-timeline');
    const agendaTableBody = document.getElementById('agendaTableBody');
    const refreshAgendaBtn = document.getElementById('refreshAgendaBtn');
    const addAgendaBtn = document.getElementById('addAgendaBtn');
    const searchAgenda = document.getElementById('searchAgenda');
    const filterAgendaTrack = document.getElementById('filterAgendaTrack');
    const filterAgendaVenue = document.getElementById('filterAgendaVenue');
    const clearAgendaFiltersBtn = document.getElementById('clearAgendaFiltersBtn');
    const toggleAgendaViewBtn = document.getElementById('toggleAgendaViewBtn');
    const agendaTableView = document.getElementById('agendaTableView');
    const dayBtns = document.querySelectorAll('.day-btn');

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

    // Helpers to convert date/time formats to backend expectations
    function formatDayToISO(dayValue) {
        if (!dayValue) return '';
        // Try to parse ISO-like strings first
        try {
            // If already YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(dayValue)) return dayValue;
            // Try Date parsing
            const d = new Date(dayValue);
            if (!isNaN(d.getTime())) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            }
        } catch (e) { /* ignore */ }
        // Known mapping fallback for the two event days
        const map = {
            'Wednesday, June 25, 2026': '2026-06-25',
            'Thursday, June 26, 2026': '2026-06-26'
        };
        return map[dayValue] || '';
    }

    function time24ToAmPm(t) {
        if (!t) return '';
        // t expected like "HH:MM" or already like "hh:mmAM/PM"
        if (/[AP]M$/i.test(t)) return t.toUpperCase();
        const parts = String(t).split(':');
        if (parts.length < 2) return t;
        let hh = parseInt(parts[0], 10);
        const mm = parts[1].slice(0,2);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12;
        if (hh === 0) hh = 12;
        return `${String(hh).padStart(2,'0')}:${mm}${ampm}`;
    }

    function ampmTo24(t) {
        if (!t) return '';
        // Accept formats like "08:00AM", "8:00 AM", "08:00AM"
        const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
        if (!m) return t;
        let hh = parseInt(m[1], 10);
        const mm = m[2];
        const suffix = (m[3] || '').toUpperCase();
        if (suffix === 'AM') {
            if (hh === 12) hh = 0;
        } else if (suffix === 'PM') {
            if (hh !== 12) hh += 12;
        }
        return `${String(hh).padStart(2,'0')}:${mm}`;
    }

    // Fetch all agenda items
    async function fetchAgendaItems() {
        try {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const res = await axios.get(`${API_BASE_URL}/admin/agenda/event-agendas`, { headers });
            const data = res.data.data || {};
            
            // Transform and group items by day
            agendaData = { wednesday: [], thursday: [] };
            agendaList = [];
            
            function transformItem(item) {
                const rawDate = item.event_date || item.day || item.date || '';
                const iso = formatDayToISO(rawDate);
                const displayDay = iso ? new Date(iso).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : rawDate;

                // Handle time format like "08:30-09:00"
                const timeParts = (item.time || '').split('-');
                const rawStart = timeParts[0] || '';
                const rawEnd = timeParts[1] || '';
                const displayStart = /[AP]M$/i.test(rawStart) ? rawStart : time24ToAmPm(rawStart);
                const displayEnd = /[AP]M$/i.test(rawEnd) ? rawEnd : time24ToAmPm(rawEnd);
                const inputStart = /[AP]M$/i.test(rawStart) ? ampmTo24(rawStart) : rawStart;
                const inputEnd = /[AP]M$/i.test(rawEnd) ? ampmTo24(rawEnd) : rawEnd;

                return {
                    id: item.id || item._id || item.agendaId,
                    title: item.title || item.session_title || '',
                    description: item.description || '',
                    track: item.track || item.category || '',
                    venue: item.location || item.venue || '',
                    speakers: item.speakers || item.speaker || '',
                    day: displayDay,
                    event_date: iso || rawDate,
                    startTime: displayStart,
                    endTime: displayEnd,
                    startInput: inputStart,
                    endInput: inputEnd,
                    status: item.status || 'Pending'
                };
            }
            
            if (data.wednesday && Array.isArray(data.wednesday)) {
                agendaData.wednesday = data.wednesday.map(transformItem);
            }
            if (data.thursday && Array.isArray(data.thursday)) {
                agendaData.thursday = data.thursday.map(transformItem);
            }
            
            // Create flat list for search/filter
            agendaList = [...agendaData.wednesday, ...agendaData.thursday];

            renderAgendaTimeline(agendaData);
            updateAgendaStats(agendaData);
            console.log(`Fetched ${agendaList.length} agenda items`);
        } catch (err) {
            console.error('Error fetching agenda items:', err);
            showNotification('Failed to load agenda items', 'error');
        }
    }

    // Render agenda timeline view
    function renderAgendaTimeline(data) {
        if (!agendaTimeline) return;

        const wednesdayDiv = document.getElementById('day-wednesday');
        const thursdayDiv = document.getElementById('day-thursday');
        
        if (wednesdayDiv) {
            // Remove existing sessions and loading containers
            const sessions = wednesdayDiv.querySelectorAll('.timeline-session');
            sessions.forEach(s => s.remove());
            const loadingContainers = wednesdayDiv.querySelectorAll('.loading-container');
            loadingContainers.forEach(c => c.remove());
            
            const wednesdayItems = data.wednesday || [];
            wednesdayItems.forEach(item => {
                const sessionDiv = createSessionElement(item);
                wednesdayDiv.appendChild(sessionDiv);
            });
        }

        if (thursdayDiv) {
            // Remove existing sessions and loading containers
            const sessions = thursdayDiv.querySelectorAll('.timeline-session');
            sessions.forEach(s => s.remove());
            const loadingContainers = thursdayDiv.querySelectorAll('.loading-container');
            loadingContainers.forEach(c => c.remove());
            
            const thursdayItems = data.thursday || [];
            thursdayItems.forEach(item => {
                const sessionDiv = createSessionElement(item);
                thursdayDiv.appendChild(sessionDiv);
            });
        }
    }

    // Create session element
    function createSessionElement(item) {
        const div = document.createElement('div');
        div.className = 'timeline-session';
        div.setAttribute('data-id', item.id);

        const timeStr = item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : 'TBA';
        
        div.innerHTML = `
            <div class="session-time">
                <span class="time">${timeStr}</span>
            </div>
            <div class="session-details">
                <h4 class="session-title">${item.title || 'Untitled Session'}</h4>
                <p class="session-track">${item.track || 'N/A'}</p>
                <p class="session-venue">${item.venue || 'N/A'}</p>
                <p class="session-speakers">${item.speakers || 'N/A'}</p>
                ${item.description ? `<p class="session-description">${item.description}</p>` : ''}
            </div>
            <div class="session-actions">
                <button class="btn btn-info btn-sm view-agenda-btn">View</button>
                <button class="btn btn-warning btn-sm edit-agenda-btn">Edit</button>
                <button class="btn btn-danger btn-sm delete-agenda-btn">Delete</button>
            </div>
        `;

        // Attach event listeners
        div.querySelector('.view-agenda-btn').addEventListener('click', () => viewAgendaItem(item));
        div.querySelector('.edit-agenda-btn').addEventListener('click', () => editAgendaItem(item));
        div.querySelector('.delete-agenda-btn').addEventListener('click', () => deleteAgendaItem(item.id));

        return div;
    }

    // Render agenda table view
    function renderAgendaTable(items) {
        if (!agendaTableBody) return;

        agendaTableBody.innerHTML = '';
        
        if (!Array.isArray(items) || items.length === 0) {
            agendaTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No agenda items found.</td></tr>';
            return;
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            const timeStr = item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : 'TBA';
            
            tr.innerHTML = `
                <td>${item.title || 'N/A'}</td>
                <td>${item.day || 'N/A'}</td>
                <td>${timeStr}</td>
                <td>${item.track || 'N/A'}</td>
                <td>${item.venue || 'N/A'}</td>
                <td>${item.speakers || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-table-agenda-btn">View</button>
                        <button class="btn btn-warning btn-sm edit-table-agenda-btn">Edit</button>
                        <button class="btn btn-danger btn-sm delete-table-agenda-btn">Delete</button>
                    </div>
                </td>
            `;

            tr.querySelector('.view-table-agenda-btn').addEventListener('click', () => viewAgendaItem(item));
            tr.querySelector('.edit-table-agenda-btn').addEventListener('click', () => editAgendaItem(item));
            tr.querySelector('.delete-table-agenda-btn').addEventListener('click', () => deleteAgendaItem(item.id));

            agendaTableBody.appendChild(tr);
        });
    }

    // View agenda item
    function viewAgendaItem(item) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>View Agenda Item</h2>
                    <button type="button" class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Title</label>
                            <p>${item.title || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Day</label>
                            <p>${item.day || 'N/A'}</p>
                        </div>
                        <div class="form-group">
                            <label>Track</label>
                            <p>${item.track || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Time</label>
                            <p>${item.startTime || 'N/A'}</p>
                        </div>
                        <div class="form-group">
                            <label>End Time</label>
                            <p>${item.endTime || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Venue</label>
                            <p>${item.venue || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Speakers</label>
                            <p>${item.speakers || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Description</label>
                            <p>${item.description || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Edit agenda item
    function editAgendaItem(item) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h2>Edit Agenda Item</h2>
                    <button type="button" class="close-modal">&times;</button>
                </div>
                <form id="editAgendaForm">
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAgendaTitle">Title</label>
                                <input type="text" id="editAgendaTitle" class="form-control" value="${item.title || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAgendaDay">Day</label>
                                <select id="editAgendaDay" class="form-control" required>
                                    <option value="">Select Day</option>
                                    <option value="Wednesday, June 25, 2026" ${item.event_date?.includes('2026-06-25') || item.day?.includes('Wednesday') ? 'selected' : ''}>Wednesday, June 25, 2026</option>
                                    <option value="Thursday, June 26, 2026" ${item.event_date?.includes('2026-06-26') || item.day?.includes('Thursday') ? 'selected' : ''}>Thursday, June 26, 2026</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editAgendaTrack">Track</label>
                                <select id="editAgendaTrack" class="form-control" required>
                                    <option value="">Select Track</option>
                                    <option value="Keynote" ${item.track === 'Keynote' ? 'selected' : ''}>Keynote</option>
                                    <option value="Panel Discussion" ${item.track === 'Panel Discussion' ? 'selected' : ''}>Panel Discussion</option>
                                    <option value="Workshop" ${item.track === 'Workshop' ? 'selected' : ''}>Workshop</option>
                                    <option value="Networking" ${item.track === 'Networking' ? 'selected' : ''}>Networking</option>
                                    <option value="Breakout Session" ${item.track === 'Breakout Session' ? 'selected' : ''}>Breakout Session</option>
                                    <option value="Registration" ${item.track === 'Registration' ? 'selected' : ''}>Registration</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAgendaStartTime">Start Time</label>
                                <input type="time" id="editAgendaStartTime" class="form-control" value="${item.startInput || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editAgendaEndTime">End Time</label>
                                <input type="time" id="editAgendaEndTime" class="form-control" value="${item.endInput || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAgendaVenue">Venue</label>
                                <select id="editAgendaVenue" class="form-control" required>
                                    <option value="">Select Venue</option>
                                    <option value="Main Hall" ${item.venue === 'Main Hall' ? 'selected' : ''}>Main Hall</option>
                                    <option value="Conference Room A" ${item.venue === 'Conference Room A' ? 'selected' : ''}>Conference Room A</option>
                                    <option value="Conference Room B" ${item.venue === 'Conference Room B' ? 'selected' : ''}>Conference Room B</option>
                                    <option value="Exhibition Hall" ${item.venue === 'Exhibition Hall' ? 'selected' : ''}>Exhibition Hall</option>
                                    <option value="Networking Zone" ${item.venue === 'Networking Zone' ? 'selected' : ''}>Networking Zone</option>
                                    <option value="Main Lobby" ${item.venue === 'Main Lobby' ? 'selected' : ''}>Main Lobby</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAgendaSpeakers">Speakers</label>
                                <input type="text" id="editAgendaSpeakers" class="form-control" value="${item.speakers || ''}" placeholder="Comma-separated speaker names">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAgendaDescription">Description</label>
                                <textarea id="editAgendaDescription" class="form-control" rows="4">${item.description || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                        <button type="submit" class="btn">Update Agenda</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const form = modal.querySelector('#editAgendaForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const rawDay = document.getElementById('editAgendaDay').value;
            const rawStart = document.getElementById('editAgendaStartTime').value;
            const rawEnd = document.getElementById('editAgendaEndTime').value;
            const payload = {
                title: document.getElementById('editAgendaTitle').value,
                event_date: formatDayToISO(rawDay),
                track: document.getElementById('editAgendaTrack').value,
                start_time: time24ToAmPm(rawStart),
                end_time: time24ToAmPm(rawEnd),
                location: document.getElementById('editAgendaVenue').value,
                speakers: document.getElementById('editAgendaSpeakers').value,
                description: document.getElementById('editAgendaDescription').value
            };

            try {
                const token = getToken();
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = 'Bearer ' + token;

                const res = await axios.put(`${API_BASE_URL}/admin/agendas/${item.id}`, payload, { headers });
                
                if (res.status === 200 || res.status === 201) {
                    showNotification('Agenda item updated successfully', 'success');
                    modal.remove();
                    fetchAgendaItems();
                } else {
                    showNotification('Failed to update agenda item', 'error');
                }
            } catch (err) {
                console.error('Error updating agenda:', err);
                showNotification(err.response?.data?.message || 'Error updating agenda item', 'error');
            }
        });

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Delete agenda item
    async function deleteAgendaItem(agendaId) {
        if (!confirm('Are you sure you want to delete this agenda item?')) return;

        try {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const res = await axios.delete(`${API_BASE_URL}/admin/agendas/${agendaId}`, { headers });
            
            if (res.status === 200 || res.status === 204) {
                showNotification('Agenda item deleted successfully', 'success');
                fetchAgendaItems();
            } else {
                showNotification('Failed to delete agenda item', 'error');
            }
        } catch (err) {
            console.error('Error deleting agenda:', err);
            showNotification(err.response?.data?.message || 'Error deleting agenda item', 'error');
        }
    }

    // Update agenda statistics
    function updateAgendaStats(data) {
        const totalEl = document.getElementById('totalAgendaItems');
        const day1El = document.getElementById('day1Sessions');
        const day2El = document.getElementById('day2Sessions');

        const total = (data.wednesday?.length || 0) + (data.thursday?.length || 0);
        const day1 = data.wednesday?.length || 0;
        const day2 = data.thursday?.length || 0;

        if (totalEl) totalEl.textContent = total;
        if (day1El) day1El.textContent = day1;
        if (day2El) day2El.textContent = day2;
    }

    // Search and filter agenda
    function filterAndRenderAgenda() {
        let filtered = [...agendaList];

        if (searchAgenda && searchAgenda.value) {
            const query = searchAgenda.value.toLowerCase();
            filtered = filtered.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.speakers?.toLowerCase().includes(query) ||
                item.track?.toLowerCase().includes(query)
            );
        }

        if (filterAgendaTrack && filterAgendaTrack.value) {
            filtered = filtered.filter(item => item.track === filterAgendaTrack.value);
        }

        if (filterAgendaVenue && filterAgendaVenue.value) {
            filtered = filtered.filter(item => item.venue === filterAgendaVenue.value);
        }

        // Group filtered items back by day for timeline
        const filteredData = { wednesday: [], thursday: [] };
        filtered.forEach(item => {
            if (item.day?.toLowerCase().includes('wednesday')) {
                filteredData.wednesday.push(item);
            } else if (item.day?.toLowerCase().includes('thursday')) {
                filteredData.thursday.push(item);
            }
        });

        renderAgendaTimeline(filteredData);
        renderAgendaTable(filtered);
    }

    // Event listeners
    if (addAgendaBtn) {
        addAgendaBtn.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>Add New Agenda Item</h2>
                        <button type="button" class="close-modal">&times;</button>
                    </div>
                    <form id="newAgendaForm">
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newAgendaTitle">Title <span style="color:red;">*</span></label>
                                    <input type="text" id="newAgendaTitle" name="title" class="form-control" placeholder="Session title" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newAgendaDay">Day <span style="color:red;">*</span></label>
                                    <input type="date" id="newAgendaDay" name="event_day" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="newAgendaTrack">Track <span style="color:red;">*</span></label>
                                    <select id="newAgendaTrack" name="track" class="form-control" required>
                                        <option value="">Select Track</option>
                                        <option value="Keynote">Keynote</option>
                                        <option value="Panel Discussion">Panel Discussion</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Networking">Networking</option>
                                        <option value="Breakout Session">Breakout Session</option>
                                        <option value="Registration">Registration</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newAgendaStartTime">Start Time <span style="color:red;">*</span></label>
                                    <input type="time" id="newAgendaStartTime" name="start_time" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="newAgendaEndTime">End Time <span style="color:red;">*</span></label>
                                    <input type="time" id="newAgendaEndTime" name="end_time" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newAgendaVenue">Venue <span style="color:red;">*</span></label>
                                    <select id="newAgendaVenue" name="location" class="form-control" required>
                                        <option value="">Select Venue</option>
                                        <option value="Main Hall">Main Hall</option>
                                        <option value="Conference Room A">Conference Room A</option>
                                        <option value="Conference Room B">Conference Room B</option>
                                        <option value="Exhibition Hall">Exhibition Hall</option>
                                        <option value="Networking Zone">Networking Zone</option>
                                        <option value="Main Lobby">Main Lobby</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newAgendaSpeakers">Speakers</label>
                                    <input type="text" id="newAgendaSpeakers" name="speakers" class="form-control" placeholder="Comma-separated speaker names">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newAgendaDescription">Description</label>
                                    <textarea id="newAgendaDescription" name="description" class="form-control" rows="4" placeholder="Session description"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn">Create Agenda Item</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const form = modal.querySelector('#newAgendaForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const newRawDay = document.getElementById('newAgendaDay').value;
                const newRawStart = document.getElementById('newAgendaStartTime').value;
                const newRawEnd = document.getElementById('newAgendaEndTime').value;
                const payload = {
                    title: document.getElementById('newAgendaTitle').value,
                    event_date: formatDayToISO(newRawDay),
                    track: document.getElementById('newAgendaTrack').value,
                    start_time: time24ToAmPm(newRawStart),
                    end_time: time24ToAmPm(newRawEnd),
                    location: document.getElementById('newAgendaVenue').value,
                    speakers: document.getElementById('newAgendaSpeakers').value,
                    description: document.getElementById('newAgendaDescription').value
                };

                try {
                    const token = getToken();
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = 'Bearer ' + token;

                    const res = await axios.post(`${API_BASE_URL}/admin/agenda/create-event-agenda`, payload, { headers });
                    
                    if (res.status === 200 || res.status === 201) {
                        showNotification('Agenda item created successfully', 'success');
                        modal.remove();
                        fetchAgendaItems();
                    } else {
                        showNotification('Failed to create agenda item', 'error');
                    }
                } catch (err) {
                    console.error('Error creating agenda:', err);
                    showNotification(err.response?.data?.message || 'Error creating agenda item', 'error');
                }
            });

            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        });
    }

    if (refreshAgendaBtn) {
        refreshAgendaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fetchAgendaItems();
        });
    }

    if (searchAgenda) {
        searchAgenda.addEventListener('input', filterAndRenderAgenda);
    }

    if (filterAgendaTrack) {
        filterAgendaTrack.addEventListener('change', filterAndRenderAgenda);
    }

    if (filterAgendaVenue) {
        filterAgendaVenue.addEventListener('change', filterAndRenderAgenda);
    }

    if (clearAgendaFiltersBtn) {
        clearAgendaFiltersBtn.addEventListener('click', () => {
            if (searchAgenda) searchAgenda.value = '';
            if (filterAgendaTrack) filterAgendaTrack.value = '';
            if (filterAgendaVenue) filterAgendaVenue.value = '';
            renderAgendaTimeline(agendaData);
            renderAgendaTable(agendaList);
        });
    }

    if (toggleAgendaViewBtn) {
        toggleAgendaViewBtn.addEventListener('click', () => {
            const timelineVisible = agendaTimeline?.style.display !== 'none';
            
            if (timelineVisible) {
                if (agendaTimeline) agendaTimeline.style.display = 'none';
                if (agendaTableView) agendaTableView.style.display = 'block';
                toggleAgendaViewBtn.innerHTML = '<i class="fas fa-map"></i> Switch to Timeline View';
                renderAgendaTable(agendaList);
            } else {
                if (agendaTimeline) agendaTimeline.style.display = 'block';
                if (agendaTableView) agendaTableView.style.display = 'none';
                toggleAgendaViewBtn.innerHTML = '<i class="fas fa-list"></i> Switch to Table View';
                renderAgendaTimeline(agendaData);
            }
        });
    }

    // Day filter toggle
    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dayBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const day = btn.getAttribute('data-day');
            const wednesdayDiv = document.getElementById('day-wednesday');
            const thursdayDiv = document.getElementById('day-thursday');

            if (day === 'all') {
                if (wednesdayDiv) wednesdayDiv.style.display = 'block';
                if (thursdayDiv) thursdayDiv.style.display = 'block';
            } else if (day === 'wednesday') {
                if (wednesdayDiv) wednesdayDiv.style.display = 'block';
                if (thursdayDiv) thursdayDiv.style.display = 'none';
            } else if (day === 'thursday') {
                if (wednesdayDiv) wednesdayDiv.style.display = 'none';
                if (thursdayDiv) thursdayDiv.style.display = 'block';
            }
        });
    });

    // Helper function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-weight: 500;
            max-width: 400px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchAgendaItems);
    } else {
        fetchAgendaItems();
    }
})();

(function () {

    function safeText(v) {
        return (v === null || v === undefined || v === '') ? '-' : String(v);
    }

    function formatBudget(v) {
        if (v === null || v === undefined || v === '') return '-';
        // Try to coerce to number, otherwise return as-is
        const n = Number(String(v).replace(/[^0-9.-]+/g, ''));
        if (Number.isFinite(n)) return n.toLocaleString();
        return String(v);
    }

    function statusClassFrom(status) {
        if (!status) return 'status-pending';
        const s = String(status).toLowerCase();
        if (s === 'confirmed' || s === 'approved' || s === 'paid') return 'status-approved';
        if (s === 'pending' || s === 'reserved') return 'status-pending';
        return 'status-rejected';
    }

    function renderExhibitors(list) {
        const exhibitorsBody = document.getElementById('exhibitors-table-body');
        if (!exhibitorsBody) return;
        exhibitorsBody.innerHTML = '';
        if (!Array.isArray(list) || list.length === 0) {
            exhibitorsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No exhibitors found.</td></tr>';
            return;
        }
        list.forEach(ex => {
            const tr = document.createElement('tr');
            if (ex.id !== undefined) tr.setAttribute('data-id', ex.id);
            const name = safeText(ex.contact_person || '-');
            const company = safeText(ex.company_name || '-');
            const email = safeText(ex.contact_email || '-');
            const phone = safeText(ex.contact_phone || '-');
            const status = safeText(ex.status || '-');
            const registeredAt = ex.registeredAt ? new Date(ex.registeredAt).toLocaleDateString() : '-';

            const statusClass = statusClassFrom(status);

            tr.innerHTML = `
                <td>${name}</td>
                <td>${company}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${registeredAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-exhibitor-btn">View</button>
                        <button class="btn btn-warning btn-sm edit-exhibitor-btn">Edit</button>
                    </div>
                </td>
            `;
            exhibitorsBody.appendChild(tr);
        });
    }

    function updateStats(list) {
        const totalEl = document.getElementById('total-exhibitors');
        const confirmedEl = document.getElementById('confirmed-exhibitors');
        const pendingEl = document.getElementById('pending-exhibitors');
        const arr = Array.isArray(list) ? list : [];
        if (totalEl) totalEl.textContent = arr.length;
        if (confirmedEl) confirmedEl.textContent = arr.filter(e => (e.status || '').toString().toLowerCase() === 'confirmed').length;
        if (pendingEl) pendingEl.textContent = arr.filter(e => (e.status || '').toString().toLowerCase() === 'pending').length;
    }

    function getToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (e) { }
        return localStorage.getItem('accessToken') || null;
    }

    async function fetchExhibitors() {
        try {
            console.log('Fetching exhibitors...');
            const endpoint = `${window.API_BASE_URL || 'http://localhost:9100/api/v1'}/admin/exhibitors`;
            const token = getToken();
            const headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;
            
            const res = await axios.get(endpoint, { headers });
            const list = (res && res.data && res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            console.log('Fetched data:', list);
            renderExhibitors(list);
            updateStats(list);
        } catch (err) {
            console.error('Error fetching exhibitors:', err);
            const exhibitorsBody = document.getElementById('exhibitors-table-body');
            if (exhibitorsBody) exhibitorsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c00;">Failed to load exhibitors.</td></tr>';
        }
    }

    function openAddExhibitorModal() {
        const modal = document.getElementById('addExhibitorModal');
        if (modal) modal.classList.add('active');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    async function addExhibitor(data) {
        try {
            const endpoint = `${window.API_BASE_URL || 'http://localhost:9100/api/v1'}/admin/create-exhibitor`;
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            
            const res = await axios.post(endpoint, data, { headers });
            console.log('Added exhibitor:', res.data);
            fetchExhibitors(); // Refresh the list
            closeModal('addExhibitorModal');
            // Reset form
            document.getElementById('addExhibitorForm').reset();
        } catch (err) {
            console.error('Error adding exhibitor:', err);
            alert('Failed to add exhibitor. Please try again.');
        }
    }

   document.addEventListener('DOMContentLoaded', () => {
    fetchExhibitors();
    const refreshBtn = document.getElementById('refresh-exhibitors-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fetchExhibitors();
        });
    }
    const addBtn = document.getElementById('add-exhibitor-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openAddExhibitorModal();
        });
    }
    const form = document.getElementById('addExhibitorForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            addExhibitor(data);
        });
    }
    // Close modal on close button
    const closeBtn = document.querySelector('#addExhibitorModal .close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal('addExhibitorModal'));
    }
    });

    // Expose fetchExhibitors globally for use by other scripts
    window.fetchExhibitors = fetchExhibitors;
})();

// Partners Management
(function () {
    function getToken() {
        try {
            const raw = localStorage.getItem('authUser');
            if (raw) {
                const a = JSON.parse(raw);
                if (a && a.token) return a.token;
            }
        } catch (e) { }
        return localStorage.getItem('accessToken') || null;
    }

    function safeText(v) {
        return (v === null || v === undefined || v === '') ? '-' : String(v);
    }

    function renderPartners(list) {
        const tbody = document.querySelector('#partnersTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!Array.isArray(list) || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No partners found.</td></tr>';
            return;
        }
        list.forEach(partner => {
            const tr = document.createElement('tr');
            if (partner.id !== undefined) tr.setAttribute('data-id', partner.id);
            const contact = safeText(`${partner.firstname || ''} ${partner.lastname || ''}`.trim() || '-');
            const email = safeText(partner.email || '-');
            const package = safeText(partner.EventPartnerPackages && partner.EventPartnerPackages[0] ? partner.EventPartnerPackages[0].event_package?.title || '-' : '-');
            const status = safeText(partner.EventPartnerPackages && partner.EventPartnerPackages[0] ? partner.EventPartnerPackages[0].payment_status || '-' : '-');
            // Placeholder actions
            const actions = `<button class="btn btn-sm btn-primary">Edit</button> <button class="btn btn-sm btn-danger">Delete</button>`;
            tr.innerHTML = `
                <td>${contact}</td>
                <td>${email}</td>
                <td>${package}</td>
                <td>${status}</td>
                <td>${actions}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function updatePartnerStats(list) {
        const arr = Array.isArray(list) ? list : [];
        const totalEl = document.getElementById('totalPartners');
        const platinumEl = document.getElementById('platinumPartners');
        const goldEl = document.getElementById('goldPartners');
        const silverEl = document.getElementById('silverPartners');
        const bronzeEl = document.getElementById('bronzePartners');
        if (totalEl) totalEl.textContent = arr.length;
        if (platinumEl) platinumEl.textContent = arr.filter(p => p.EventPartnerPackages && p.EventPartnerPackages[0] && (p.EventPartnerPackages[0].event_package?.title || '').toLowerCase().includes('platinum')).length;
        if (goldEl) goldEl.textContent = arr.filter(p => p.EventPartnerPackages && p.EventPartnerPackages[0] && (p.EventPartnerPackages[0].event_package?.title || '').toLowerCase().includes('gold')).length;
        if (silverEl) silverEl.textContent = arr.filter(p => p.EventPartnerPackages && p.EventPartnerPackages[0] && (p.EventPartnerPackages[0].event_package?.title || '').toLowerCase().includes('silver')).length;
        if (bronzeEl) bronzeEl.textContent = arr.filter(p => p.EventPartnerPackages && p.EventPartnerPackages[0] && (p.EventPartnerPackages[0].event_package?.title || '').toLowerCase().includes('bronze')).length;
    }

    async function fetchPartners() {
        try {
            console.log('Fetching partners...');
            const endpoint = `${window.API_BASE_URL || 'http://localhost:9100/api/v1'}/admin/partners`;
            const token = getToken();
            const headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;
            
            const res = await axios.get(endpoint, { headers });
            const list = (res && res.data && res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            console.log('Fetched partners:', list);
            renderPartners(list);
            updatePartnerStats(list);
        } catch (err) {
            console.error('Error fetching partners:', err);
            const tbody = document.querySelector('#partnersTable tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#c00;">Failed to load partners.</td></tr>';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const refreshBtn = document.getElementById('refreshPartnersBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function (e) {
                e.preventDefault();
                fetchPartners();
            });
        }
    });

    // Expose fetchPartners globally for use by other scripts
    window.fetchPartners = fetchPartners;
})();