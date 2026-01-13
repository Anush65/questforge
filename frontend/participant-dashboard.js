// Participant Dashboard Specific Logic

function terminateSession() {
    localStorage.removeItem('currentUser');
    window.location.href = 'main.html';
}

async function initializeParticipantDashboard() {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'main.html';
        return;
    }

    const user = JSON.parse(userStr);
    state.currentUser = user;

    if (user.role !== 'participant') {
        alert('ERROR: INVALID_ROLE_ACCESS');
        window.location.href = 'main.html';
        return;
    }

    // Update welcome message
    document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${user.name} [${user.username}]`;

    // Initialize dashboard
    const container = document.getElementById('dashboardContent');
    await renderParticipantDashboard(container);
    
    // Check system status
    checkSystemStatus();
}

function openSubmissionModal() {
    document.getElementById('submissionModal').classList.remove('hidden');
}

function closeSubmissionModal() {
    document.getElementById('submissionModal').classList.add('hidden');
}

async function submitProject() {
    const token = document.getElementById('subTeamToken').value.trim();
    const github = document.getElementById('subGithub').value;
    const prototype = document.getElementById('subPrototype').value;
    const video = document.getElementById('subVideo').value;
    const presentation = document.getElementById('subPresentation').value;
    const usp = document.getElementById('subUSP').value;
    const report = document.getElementById('subReport').value;

    if (!token || !github) {
        showToast('ERROR: TOKEN_AND_GITHUB_REQUIRED', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/submissions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team_token: token,
                github_url: github,
                prototype_url: prototype || null,
                video_url: video || null,
                presentation_url: presentation || null,
                usp: usp || null,
                report_text: report || null
            })
        });

        if (res.ok) {
            showToast('SUCCESS: PROJECT_UPLOADED_TO_CORE', 'success');
            
            // Clear form
            document.getElementById('subTeamToken').value = '';
            document.getElementById('subGithub').value = '';
            document.getElementById('subPrototype').value = '';
            document.getElementById('subVideo').value = '';
            document.getElementById('subPresentation').value = '';
            document.getElementById('subUSP').value = '';
            document.getElementById('subReport').value = '';
            
            closeSubmissionModal();

            // Refresh dashboard
            const container = document.getElementById('dashboardContent');
            await renderParticipantDashboard(container);
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'SUBMISSION_FAILED'}`, 'error');
        }
    } catch (e) {
        console.error('Submission error:', e);
        showToast('ERROR: UPLOAD_FAILED', 'error');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeParticipantDashboard);
