// Judge Dashboard Specific Logic

function handleLogout() {
    if (confirm('TERMINATE_SESSION_CONFIRM')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'main.html';
    }
}

async function initializeJudgeDashboard() {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'main.html';
        return;
    }

    const user = JSON.parse(userStr);
    state.currentUser = user;

    if (user.role !== 'judge') {
        alert('ERROR: INVALID_ROLE_ACCESS');
        window.location.href = 'main.html';
        return;
    }

    // Update welcome message
    document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${user.name} [${user.username}]`;

    // Initialize dashboard
    const container = document.getElementById('dashboardContent');
    await renderJudgeDashboard(container);
}

function openEvaluationModal() {
    document.getElementById('evaluationModal').classList.remove('hidden');
}

function closeEvaluationModal() {
    document.getElementById('evaluationModal').classList.add('hidden');
}

async function submitEvaluation() {
    const innovation = parseFloat(document.getElementById('evalInnovation').value);
    const implementation = parseFloat(document.getElementById('evalImplementation').value);
    const presentation = parseFloat(document.getElementById('evalPresentation').value);
    const comments = document.getElementById('evalComments').value;

    if (isNaN(innovation) || isNaN(implementation) || isNaN(presentation)) {
        showToast('ERROR: ALL_SCORES_REQUIRED', 'error');
        return;
    }

    showToast('EVALUATION_SUBMITTED', 'success');
    closeEvaluationModal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeJudgeDashboard);
