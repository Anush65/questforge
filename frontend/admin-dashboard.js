// Admin Dashboard Specific Logic

function handleLogout() {
    if (confirm('TERMINATE_SESSION_CONFIRM')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'main.html';
    }
}

async function initializeAdminDashboard() {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'main.html';
        return;
    }

    const user = JSON.parse(userStr);
    state.currentUser = user;

    if (user.role !== 'admin') {
        alert('ERROR: INVALID_ROLE_ACCESS');
        window.location.href = 'main.html';
        return;
    }

    // Update welcome message
    document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${user.name} [${user.username}]`;

    // Initialize dashboard
    const container = document.getElementById('dashboardContent');
    await renderAdminDashboard(container);
    
    // Check system status
    checkSystemStatus();
}

function openCreateEventModal() {
    document.getElementById('createEventModal').classList.remove('hidden');
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').classList.add('hidden');
}

function openEditHackathonModal() {
    document.getElementById('editHackathonModal').classList.remove('hidden');
}

function closeEditHackathonModal() {
    document.getElementById('editHackathonModal').classList.add('hidden');
}

function openConfirmModal(title, message, actionCallback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmActionBtn').onclick = actionCallback;
    document.getElementById('confirmModal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
}

async function confirmCreateHackathon() {
    const name = document.getElementById('newEventName').value;
    const code = document.getElementById('newEventCode').value;

    if (!name || !code) {
        showToast('ERROR: ALL_FIELDS_REQUIRED', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/hackathons/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                invite_code: code
            })
        });

        if (res.ok) {
            showToast('SUCCESS: HACKATHON_CREATED', 'success');
            closeCreateEventModal();
            document.getElementById('newEventName').value = '';
            document.getElementById('newEventCode').value = '';

            // Refresh admin dashboard
            const container = document.getElementById('dashboardContent');
            await renderAdminDashboard(container);
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'CREATION_FAILED'}`, 'error');
        }
    } catch (e) {
        console.error('Creation error:', e);
        showToast('ERROR: CREATION_FAILED', 'error');
    }
}

async function confirmEditHackathon() {
    const name = document.getElementById('editEventName').value;
    const code = document.getElementById('editEventCode').value;
    const frozen = document.getElementById('editEventFrozen').checked;

    if (!name || !code) {
        showToast('ERROR: ALL_FIELDS_REQUIRED', 'error');
        return;
    }

    showToast('SUCCESS: CHANGES_SAVED', 'success');
    closeEditHackathonModal();
    
    // Refresh admin dashboard
    const container = document.getElementById('dashboardContent');
    await renderAdminDashboard(container);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
