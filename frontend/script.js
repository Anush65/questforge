// QuestForge - Matrix System Logic

// --- Matrix Rain Animation ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

const chars = '0123456789ABCDEFQUESTFORGE';
const fontSize = 14;
const columns = width / fontSize;
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        if (Math.random() > 0.98) ctx.fillStyle = '#00f3ff';
        else ctx.fillStyle = '#00ff41';

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

const API_BASE = 'http://127.0.0.1:8000'; // Moved to top for global access


// --- APP DATA (MOCK DB) ---
const DB = {
    users: [
        { id: 'u1', username: 'judge123', password: 'password', role: 'judge', name: 'Thaddeus Ross' },
        { id: 'u2', username: 'participant1', password: 'password', role: 'participant', name: 'Neo Anderson' },
        { id: 'u3', username: 'admin', password: 'password', role: 'admin', name: 'The Architect' }
    ],
    hackathons: [
        { id: 'h1', code: 'HACK-AI', name: 'GLOBAL_AI_SUMMIT', participants: 142, status: 'active', time: '12H_LEFT' },
        { id: 'h2', code: 'WEB3-NET', name: 'WEB3_LAUNCH', participants: 89, status: 'active', time: '4H_LEFT' },
        { id: 'h3', code: 'CYBER-SEC', name: 'DEFCON_QUALIFIERS', participants: 312, status: 'completed', time: 'ENDED' }
    ],
    submissions: [
        { id: 's1', userId: 'u2', hackathonId: 'h1', title: 'NeuralNet_V2', status: 'submitted', score: null },
        { id: 's2', userId: 'u2', hackathonId: 'h2', title: 'Decentralized_ID', status: 'draft', score: null }
    ]
};

let state = {
    currentUser: null, // User Object
    connectedHackathon: null,
    loginTargetRole: null,
    currentTeamId: null // Store team ID for filtering submissions
};

// --- NAVIGATION ---
const views = {
    landing: document.getElementById('landingView'),
    login: document.getElementById('loginView'),
    dashboard: document.getElementById('dashboardView'),
    register: document.getElementById('registerView') // [NEW]
};

function showLanding() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:83',message:'showLanding called',data:{stack:new Error().stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    state = { currentUser: null, connectedHackathon: null, loginTargetRole: null, currentTeamId: null };
    switchView('landing');
}

function showRegister() {
    switchView('register');
}

async function handleRegister() {
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    if (!name || !username || !password) {
        showToast('ERROR: ALL_FIELDS_REQUIRED', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                username: username,
                password: password,
                role: role
            })
        });

        if (res.ok) {
            showToast('IDENTITY_ESTABLISHED: PLEASE_LOGIN', 'success');
            showLogin(role);
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'REGISTRATION_FAILED'}`, 'error');
        }
    } catch (e) {
        showToast('ERROR: SERVER_UNREACHABLE', 'error');
    }
}

function showLogin(role) {
    // Current role target for login
    state.loginTargetRole = role;

    const titleMap = {
        judge: 'JUDGE_PORTAL',
        participant: 'DEV_ACCESS',
        admin: 'ROOT_CONSOLE'
    };
    document.getElementById('loginTitle').textContent = titleMap[role] || 'SYSTEM AUTH';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    switchView('login');
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.background = 'rgba(0, 0, 0, 0.9)';
    toast.style.border = type === 'error' ? '1px solid #ff4444' : '1px solid var(--matrix-green)';
    toast.style.color = type === 'error' ? '#ff4444' : 'var(--matrix-green)';
    toast.style.padding = '1rem';
    toast.style.marginTop = '0.5rem';
    toast.style.fontFamily = 'var(--font-code)';
    toast.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    toast.innerText = `> ${msg}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    const target = views[viewName];
    if (target) {
        target.classList.remove('hidden');
        // If switching to login/landing/register, ensure it's flex centered
        if (viewName === 'login' || viewName === 'landing' || viewName === 'register') {
            target.style.display = 'flex';
        } else {
            target.style.display = 'block';
        }
    }
}

// --- SERVER STATUS CHECK ---
async function checkSystemStatus() {
    const statusEl = document.getElementById('systemStatus');
    if (!statusEl) return;

    try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
            statusEl.innerHTML = 'SYSTEM: <span style="color: var(--matrix-green);">ONLINE</span>';
            statusEl.style.textShadow = '0 0 10px var(--matrix-green)';
        } else {
            throw new Error('Health check failed');
        }
    } catch (e) {
        statusEl.innerHTML = 'SYSTEM: <span style="color: #ff4444;">OFFLINE</span>';
        statusEl.style.textShadow = 'none';
    }
}

// Check on load and every 30 seconds
checkSystemStatus();
setInterval(checkSystemStatus, 30000);

// --- AUTHENTICATION ---
async function handleLogin() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const targetRole = state.loginTargetRole;

    if (!usernameInput || !passwordInput) {
        showToast('ERROR: CREDENTIALS_REQUIRED', 'error');
        return;
    }

    try {
        const formData = new URLSearchParams();
        formData.append('username', usernameInput);
        formData.append('password', passwordInput);
        // Add fields for registration if we are implementing registration
        // But for login we use a strict endpoint. 
        // Note: My backend login expects UserCreateRequest Schema JSON, not Form Data, 
        // wait, I defined it as JSON body in auth.py: def login(user: UserCreateRequest...

        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                role: targetRole, // backend checks this? No, backend checks DB role.
                name: "Unknown" // Placeholder required by schema
            }),
            redirect: 'manual' // Don't follow redirects automatically
        });

        if (res.ok) {
            const data = await res.json();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:232',message:'Login response received',data:{role:data.role,judge_id:data.judge_id,has_judge_id:data.judge_id!=null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            // Verify Role
            if (data.role !== targetRole && targetRole !== 'admin') {
                // Admin might login as others? No, strict role check.
                showToast(`ERROR: ROLE_MISMATCH (Account is ${data.role})`, 'error');
                return;
            }

            state.currentUser = {
                username: data.username,
                role: data.role,
                name: data.name,
                token: data.access_token,
                id: data.id,
                judge_id: data.judge_id || null
            };
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:246',message:'State.currentUser set after login',data:{role:state.currentUser.role,judge_id:state.currentUser.judge_id,has_judge_id:state.currentUser.judge_id!=null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            // Debug: Log judge_id to help troubleshoot
            if (data.role === 'judge') {
                console.log('Judge logged in - judge_id:', data.judge_id);
                if (!data.judge_id) {
                    console.warn('WARNING: Judge logged in but judge_id is null/undefined');
                    showToast('WARNING: JUDGE_ID_NOT_SET_PLEASE_CONTACT_ADMIN', 'error');
                }
            }

            showDashboard();
            showToast(`AUTHENTICATED: ${data.username.toUpperCase()}`, 'success');
        } else {
            showToast('ACCESS_DENIED // INVALID_CREDENTIALS', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('ERROR: AUTH_SERVER_UNREACHABLE', 'error');
    }
}

// --- SUBMISSION MODAL ---
function openSubmissionModal() {
    document.getElementById('submissionModal').classList.remove('hidden');
}

function closeSubmissionModal() {
    document.getElementById('submissionModal').classList.add('hidden');
}

async function submitProject() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:278',message:'submitProject called',data:{has_currentUser:state.currentUser!=null,role:state.currentUser?.role,has_connectedHackathon:state.connectedHackathon!=null,dashboard_hidden:views.dashboard.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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
            const result = await res.json();
            // Store team_id from response for filtering submissions
            if (result.team_id) {
                state.currentTeamId = result.team_id;
            }
            
            showToast('SUCCESS: PROJECT_UPLOADED_TO_CORE', 'success');
            
            // Clear form fields first
            document.getElementById('subTeamToken').value = '';
            document.getElementById('subGithub').value = '';
            document.getElementById('subPrototype').value = '';
            document.getElementById('subVideo').value = '';
            document.getElementById('subPresentation').value = '';
            document.getElementById('subUSP').value = '';
            document.getElementById('subReport').value = '';
            
            // Close modal
            closeSubmissionModal();
            
            // IMPORTANT: Ensure we stay on dashboard and don't redirect
            // Make sure dashboard view is visible and user is still logged in
            if (!state.currentUser || state.currentUser.role !== 'participant') {
                showToast('ERROR: SESSION_EXPIRED', 'error');
                return;
            }
            
            // Ensure dashboard view is visible
            if (views.dashboard.classList.contains('hidden')) {
                switchView('dashboard');
            }
            
            // Ensure dashboard header is set correctly
            document.getElementById('userRoleTitle').textContent = 'PARTICIPANT_DASHBOARD';
            document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${state.currentUser.name} [${state.currentUser.username}]`;
            
            // Refresh only the participant dashboard without redirecting
            // Preserve the connected hackathon state
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:346',message:'Before renderParticipantDashboard',data:{has_currentUser:state.currentUser!=null,has_connectedHackathon:state.connectedHackathon!=null,dashboard_hidden:views.dashboard.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            try {
                const container = document.getElementById('dashboardContent');
                await renderParticipantDashboard(container);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:349',message:'After renderParticipantDashboard success',data:{dashboard_hidden:views.dashboard.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
            } catch (renderError) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:352',message:'renderParticipantDashboard error',data:{error:renderError.message,stack:renderError.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                console.error('Error rendering participant dashboard:', renderError);
                // Don't redirect on render error, just show error toast
                showToast('ERROR: DASHBOARD_REFRESH_FAILED', 'error');
            }
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'SUBMISSION_FAILED'}`, 'error');
        }
    } catch (e) {
        console.error('Submission error:', e);
        showToast('ERROR: UPLOAD_FAILED', 'error');
        // Don't redirect on error - stay on dashboard
        if (state.currentUser && views.dashboard.classList.contains('hidden')) {
            switchView('dashboard');
        }
    }
}

// --- DASHBOARDS ---
function showDashboard() {
    // Safety check: don't show dashboard if user is not logged in
    if (!state.currentUser) {
        console.warn('showDashboard called but no user logged in');
        return;
    }
    
    switchView('dashboard');
    const role = state.currentUser.role;

    // Header Info
    document.getElementById('userRoleTitle').textContent = role.toUpperCase() + '_DASHBOARD';
    document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${state.currentUser.name} [${state.currentUser.username}]`;

    const container = document.getElementById('dashboardContent');
    container.innerHTML = ''; // Clear previous

    if (role === 'judge') renderJudgeDashboard(container);
    else if (role === 'participant') renderParticipantDashboard(container);
    else if (role === 'admin') {
        // Admin dashboard is async
        renderAdminDashboard(container);
    }
}

// 1. JUDGE DASHBOARD
// 1. JUDGE DASHBOARD
async function renderJudgeDashboard(container) {
    if (!state.connectedHackathon) {
        // Fetch judge's session history
        let sessionHistory = [];
        try {
            if (state.currentUser && state.currentUser.judge_id) {
                const res = await fetch(`${API_BASE}/hackathons/judge/${state.currentUser.judge_id}`);
                if (res.ok) sessionHistory = await res.json();
                else console.error('Failed to fetch session history');
            }
        } catch (e) {
            console.error('API Error:', e);
        }

        container.innerHTML = `
            <div class="card" style="margin-bottom: 2rem;">
                <h3>ACTIVE_SESSIONS</h3>
                <p style="font-family: var(--font-code); color: var(--text-secondary); margin-bottom: 1rem;">
                    > INPUT_SESSION_CODE_TO_JOIN
                </p>
                <div class="input-group">
                    <textarea id="hackathonCode" class="input-field" style="min-height: 80px; resize: vertical;" 
                    placeholder="// PASTE_CODE_HERE (e.g. HACK-AI)"></textarea>
                </div>
                <button onclick="joinHackathon()" class="btn btn-primary" id="joinBtn">CONNECT</button>
            </div>
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">SESSION_HISTORY</h4>
            <div id="hackathonList" style="display: grid; gap: 1rem;">
                ${sessionHistory.length === 0 ? '<div class="card">NO_PREVIOUS_SESSIONS</div>' : ''}
                ${sessionHistory.map(h => `
                    <div class="card" style="padding: 1rem; border-left: 3px solid var(--matrix-green); cursor: pointer;" onclick="reconnectToHackathon('${h.invite_code}')">
                        <div style="display: flex; justify-content: space-between;">
                            <div>
                                <div style="font-weight: bold; color: var(--text-primary);">${h.name}</div>
                                <div style="font-family: var(--font-code); font-size: 0.8rem; color: var(--text-secondary);">CODE: ${h.invite_code}</div>
                            </div>
                            <div style="color: var(--matrix-green); font-family: var(--font-code);">
                                > RECONNECT
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        const h = state.connectedHackathon;

        // Fetch Submissions for assigned teams
        let submissions = [];
        let evaluations = [];
        try {
            // For demo purposes, show all submissions for the hackathon
            const res = await fetch(`${API_BASE}/submissions/?hackathon_id=${h.id}`);
            if (res.ok) submissions = await res.json();
            else console.error('Failed to fetch submissions');
            
            // Fetch existing evaluations for this judge
            if (state.currentUser && state.currentUser.judge_id) {
                const evalRes = await fetch(`${API_BASE}/evaluations/?judge_id=${state.currentUser.judge_id}`);
                if (evalRes.ok) evaluations = await evalRes.json();
                else console.error('Failed to fetch evaluations');
            }
        } catch (e) {
            console.error('API Error:', e);
            showToast('ERROR: API_CONNECTION_FAILED', 'error');
        }

        // Create a map of team_id to evaluation for quick lookup
        const evaluationMap = {};
        evaluations.forEach(evaluation => {
            evaluationMap[evaluation.team_id] = evaluation;
        });

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <button class="btn btn-ghost" onclick="state.connectedHackathon=null; showDashboard()" style="padding-left:0;">
                         < BACK_TO_CONNECT
                    </button>
                    <h2 class="text-gradient">${h.name}</h2>
                    <p style="font-family: var(--font-code); font-size: 0.9rem; color: var(--matrix-green);">
                        > SESSION_ACTIVE // ID: ${h.invite_code || h.code}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: var(--font-code); color: var(--text-secondary);">PENDING_REVIEW</div>
                    <div style="font-size: 1.5rem; color: var(--text-highlight);">${submissions.length} / ${submissions.length}</div>
                </div>
            </div>

            <div style="display: grid; gap: 1rem;">
                ${submissions.length === 0 ? '<div class="card">NO_SUBMISSIONS_FOUND</div>' : ''}
                ${submissions.map(s => `
                    <div class="card" style="padding: 1.5rem; transition: all 0.2s;">
                        <h3 style="font-size: 1.4rem; margin-bottom: 0.2rem;">${s.title}</h3>
                        <p style="font-family: var(--font-code); color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                            BY: ${s.team_name || 'UNKNOWN_TEAM'}
                        </p>

                        ${s.usp ? `<div style="margin-bottom: 1rem; padding: 0.5rem; border-left: 2px solid var(--matrix-green); background: rgba(0,255,65,0.05);">
                            <strong>USP:</strong> ${s.usp}
                        </div>` : ''}

                         <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                            <button class="btn btn-ghost" style="border: 1px solid var(--border-subtle);" 
                                onclick="window.open('${s.github_url}', '_blank')">GITHUB_REPO</button>
                            ${s.video_url ? `<button class="btn btn-ghost" style="border: 1px solid var(--border-subtle);" 
                                onclick="window.open('${s.video_url}', '_blank')">WATCH_VIDEO</button>` : ''}
                            ${s.presentation_url ? `<button class="btn btn-ghost" style="border: 1px solid var(--border-subtle);" 
                                onclick="window.open('${s.presentation_url}', '_blank')">VIEW_PPT (PDF)</button>` : ''}
                            ${s.prototype_url ? `<button class="btn btn-ghost" style="border: 1px solid var(--border-subtle);" 
                                onclick="window.open('${s.prototype_url}', '_blank')">LIVE_DEMO</button>` : ''}
                            
                            <!-- AI ASSISTANT START -->
                            <button class="btn btn-ghost" style="border: 1px solid var(--cyber-cyan); color: var(--cyber-cyan);" 
                                onclick="analyzeProject('${s.id}')">🤖 AI_INSIGHTS</button>
                            <!-- AI ASSISTANT END -->
                        </div>

                        <!-- AI OUTPUT CONTAINER -->
                        <div id="ai-output-${s.id}" style="display:none; margin-bottom:1rem; padding:1rem; border:1px dashed var(--cyber-cyan); background:rgba(0,243,255,0.05);">
                            <h4 style="color:var(--cyber-cyan); margin-bottom:0.5rem;">> AI_ANALYSIS_PROTOCOL_V2</h4>
                            <div id="ai-content-${s.id}" style="font-family:var(--font-code); font-size:0.85rem; white-space: pre-wrap;"></div>
                            <button class="btn btn-ghost" style="margin-top:0.5rem; font-size:0.7rem; padding: 2px 8px;" onclick="document.getElementById('ai-output-${s.id}').style.display='none'">CLOSE_ANALYSIS</button>
                        </div>

                        <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem; display: flex; justify-content: flex-end; items-align: center; gap: 1rem;">
                             ${(() => {
                                 const existingEval = evaluationMap[s.team_id];
                                 const scoreValue = existingEval ? existingEval.score : '';
                                 const buttonText = existingEval ? 'UPDATE_SCORE' : 'SUBMIT_SCORE';
                                 return `<input type="number" id="score-${s.id}" class="input-field" placeholder="0.0 - 10.0" step="0.1" min="0" max="10" style="width: 120px;" value="${scoreValue}">
                                        <button type="button" class="btn btn-primary" onclick="submitGrade('${s.id}', '${s.team_id}'); return false;">${buttonText}</button>`;
                             })()}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// MOCK AI ANALYSIS
async function analyzeProject(subId) {
    const outputDiv = document.getElementById(`ai-output-${subId}`);
    const contentDiv = document.getElementById(`ai-content-${subId}`);

    // Reset
    outputDiv.style.display = 'block';
    contentDiv.innerHTML = '<span class="flicker-text">CONNECTING_TO_NEURAL_ENGINE...</span>';

    // Simulate Network Delay
    await new Promise(r => setTimeout(r, 1200));

    // Mock Insights (Randomized)
    const scalabilities = ["HIGH_VERTICAL_SCALABILITY", "MODERATE_HORIZONTAL_SCALING", "CLOUD_NATIVE_ARCHITECTURE", "REQUIRES_OPTIMIZATION"];
    const stacks = ["PYTHON/FASTAPI STACK DETECTED", "NODEJS/REACT DETECTED", "RUST_CORE DETECTED", "LEGACY_COMPONENTS_FOUND"];
    const usps = ["NOVEL_ALGORITHM_IDENTIFIED", "STANDARD_IMPLEMENTATION", "DISRUPTIVE_MARKET_POTENTIAL", "HIGH_USER_RETENTION_LIKELY"];

    const analysis = `> USP_ANALYSIS: ${usps[Math.floor(Math.random() * usps.length)]}
> TECH_STACK_AUDIT: ${stacks[Math.floor(Math.random() * stacks.length)]}
> SCALABILITY_FACTOR: ${scalabilities[Math.floor(Math.random() * scalabilities.length)]}

> SUMMARY:
  The project demonstrates solid architectural patterns. 
  Codebase analysis suggests high maintainability. 
  No critical security vulnerabilities detected in initial scan.

> VERDICT: READY_FOR_HUMAN_EVALUATION
> RATING: [REDACTED - JUDGE_DISCRETION_REQUIRED]`;

    // Typewriter Effect
    contentDiv.textContent = "";
    let i = 0;
    const typeWriter = () => {
        if (i < analysis.length) {
            contentDiv.textContent += analysis.charAt(i);
            i++;
            setTimeout(typeWriter, 15); // Typing speed
        }
    };
    typeWriter();
}

// UPDATED SUBMIT GRADE
async function submitGrade(subId, teamId) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:534',message:'submitGrade called',data:{has_currentUser:state.currentUser!=null,role:state.currentUser?.role,judge_id:state.currentUser?.judge_id,has_judge_id:state.currentUser?.judge_id!=null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const scoreInput = document.getElementById(`score-${subId}`);
    const scoreVal = parseFloat(scoreInput.value);

    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
        showToast("ERROR: INVALID_SCORE (0.0 - 10.0)", 'error');
        return;
    }

    // Check if user is logged in and is a judge
    if (!state.currentUser) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:547',message:'submitGrade - no currentUser',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        showToast('ERROR: NOT_LOGGED_IN', 'error');
        return false;
    }

    if (state.currentUser.role !== 'judge') {
        showToast('ERROR: NOT_AUTHORIZED_TO_EVALUATE', 'error');
        return false;
    }

    try {
        // Get judge_id from currentUser (set during login)
        let jId = null;
        if (state.currentUser.judge_id) {
            jId = parseInt(state.currentUser.judge_id);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:561',message:'submitGrade - judge_id found',data:{judge_id:jId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
        } else {
            // This should not happen if login worked correctly
            // But if it does, we'll show a helpful error
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:565',message:'submitGrade - judge_id NOT found',data:{currentUser:state.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            showToast('ERROR: JUDGE_ID_NOT_FOUND_PLEASE_RELOGIN', 'error');
            console.error('Judge ID not found in state.currentUser:', state.currentUser);
            return false;
        }

        const payload = {
            judge_id: jId,
            team_id: parseInt(teamId), // Now using the Real Team ID from backend
            score: scoreVal
        };

        const res = await fetch(`${API_BASE}/evaluations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const result = await res.json();
            const message = result.message || 'Evaluation recorded';
            showToast(`SUCCESS: ${message.toUpperCase()}: ${scoreVal}`, 'success');
            // Don't disable input/button - allow judges to update evaluations
            scoreInput.parentElement.querySelector('button').textContent = "SCORE_UPDATED";
            setTimeout(() => {
                scoreInput.parentElement.querySelector('button').textContent = "UPDATE_SCORE";
            }, 2000);
            
            // Refresh judge dashboard without redirecting
            // Preserve the connected hackathon state
            if (!state.currentUser || state.currentUser.role !== 'judge') {
                showToast('ERROR: SESSION_EXPIRED', 'error');
                return;
            }
            
            // Ensure dashboard view is visible
            if (views.dashboard.classList.contains('hidden')) {
                switchView('dashboard');
            }
            
            // Ensure dashboard header is set correctly
            document.getElementById('userRoleTitle').textContent = 'JUDGE_DASHBOARD';
            document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${state.currentUser.name} [${state.currentUser.username}]`;
            
            // Refresh only the judge dashboard content
            try {
                const container = document.getElementById('dashboardContent');
                await renderJudgeDashboard(container);
            } catch (renderError) {
                console.error('Error rendering judge dashboard:', renderError);
                showToast('ERROR: DASHBOARD_REFRESH_FAILED', 'error');
            }
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'GRADING_FAILED'}`, 'error');
            // Don't redirect on error - stay on dashboard
            if (state.currentUser && views.dashboard.classList.contains('hidden')) {
                switchView('dashboard');
            }
        }
    } catch (e) {
        console.error('Evaluation error:', e);
        showToast('ERROR: SUBMISSION_FAILED', 'error');
        // Don't redirect on error - stay on dashboard
        if (state.currentUser && views.dashboard.classList.contains('hidden')) {
            switchView('dashboard');
        }
    }
}

async function joinHackathon() {
    const codeInput = document.getElementById('hackathonCode');
    const code = codeInput.value.trim();
    const btn = document.getElementById('joinBtn');

    if (!code) return;

    btn.textContent = 'CONNECTING...';

    try {
        const res = await fetch(`${API_BASE}/hackathons/code/${code}`);
        if (res.ok) {
            const hack = await res.json();
            state.connectedHackathon = hack;
            showDashboard();
            showToast(`SESSION_ESTABLISHED: ${hack.name}`, 'success');
        } else {
            showToast('ERROR: 404_SESSION_NOT_FOUND', 'error');
            btn.textContent = 'CONNECT';
        }
    } catch (e) {
        console.error(e);
        showToast('ERROR: BACKEND_UNREACHABLE', 'error');
        btn.textContent = 'CONNECT';
    }
}

async function reconnectToHackathon(inviteCode) {
    try {
        const res = await fetch(`${API_BASE}/hackathons/code/${inviteCode}`);
        if (res.ok) {
            const hack = await res.json();
            state.connectedHackathon = hack;
            showDashboard();
            showToast(`RECONNECTED: ${hack.name}`, 'success');
        } else {
            showToast('ERROR: SESSION_NOT_FOUND', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('ERROR: BACKEND_UNREACHABLE', 'error');
    }
}

function gradeSubmission(subId) {
    const sub = DB.submissions.find(s => s.id === subId);
    if (!sub) return;

    // Simple Prompt for Grade
    const newScore = prompt(`EVALUATING: ${sub.title}\nENTER_SCORE (0-100):`, sub.score || '');

    if (newScore !== null && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
        sub.score = parseInt(newScore);
        sub.status = 'graded';
        alert(`> SUCCESS: SCORE_UPDATED [${sub.score}/100]`);
        showDashboard(); // Refresh UI
    } else if (newScore !== null) {
        alert('ERROR: INVALID_INPUT');
    }
}

function renderHackathonList() {
    const list = document.getElementById('hackathonList');
    if (!list) return;

    list.innerHTML = DB.hackathons.map(h => `
        <div class="card" style="padding: 1rem; border-left: 3px solid transparent; opacity: 0.7;">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div style="font-weight: bold; color: var(--text-secondary);">${h.name}</div>
                    <div style="font-family: var(--font-code); font-size: 0.8rem; color: var(--text-secondary);">ID: ${h.code}</div>
                </div>
            </div>
        </div>
    `).join('');
}


// 2. PARTICIPANT DASHBOARD
async function renderParticipantDashboard(container) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:724',message:'renderParticipantDashboard entry',data:{has_connectedHackathon:state.connectedHackathon!=null,has_currentUser:state.currentUser!=null,role:state.currentUser?.role,dashboard_hidden:views.dashboard.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (!state.connectedHackathon) {
        // Show hackathon join interface (similar to judge)
        container.innerHTML = `
            <div class="card" style="margin-bottom: 2rem;">
                <h3>JOIN_HACKATHON</h3>
                <p style="font-family: var(--font-code); color: var(--text-secondary); margin-bottom: 1rem;">
                    > INPUT_HACKATHON_CODE_TO_JOIN
                </p>
                <div class="input-group">
                    <textarea id="participantHackathonCode" class="input-field" style="min-height: 80px; resize: vertical;" 
                    placeholder="// PASTE_CODE_HERE (e.g. HACK-AI)"></textarea>
                </div>
                <button onclick="joinHackathonAsParticipant()" class="btn btn-primary" id="joinParticipantBtn">CONNECT</button>
            </div>
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">AVAILABLE_HACKATHONS</h4>
            <div id="hackathonListParticipant" style="display: grid; gap: 1rem;"></div>
        `;

        // Render available hackathons
        const list = document.getElementById('hackathonListParticipant');
        if (list) {
            list.innerHTML = DB.hackathons.map(h => `
                <div class="card" style="padding: 1rem; border-left: 3px solid transparent; opacity: 0.7;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <div style="font-weight: bold; color: var(--text-secondary);">${h.name}</div>
                            <div style="font-family: var(--font-code); font-size: 0.8rem; color: var(--text-secondary);">CODE: ${h.code}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } else {
        // Connected to hackathon - show team info and submission interface
        const h = state.connectedHackathon;

        // Fetch team info for this hackathon
        let teamInfo = null;
        let myTeamId = null;
        try {
            // Try to get team by hackathon - use stored team_id if available, otherwise use first team
            const teamsRes = await fetch(`${API_BASE}/teams?hackathon_id=${h.id}`);
            if (teamsRes.ok) {
                const teams = await teamsRes.json();
                if (teams.length > 0) {
                    // Use stored team_id if available, otherwise use first team
                    if (state.currentTeamId) {
                        teamInfo = teams.find(t => t.id === state.currentTeamId) || teams[0];
                        myTeamId = state.currentTeamId;
                    } else {
                        teamInfo = teams[0]; // Use first team for demo
                        myTeamId = teams[0].id;
                        // Store it for future use
                        state.currentTeamId = teams[0].id;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch team info:', e);
        }

        // Fetch submissions for this hackathon
        let allSubmissions = [];
        try {
            const res = await fetch(`${API_BASE}/submissions/?hackathon_id=${h.id}`);
            if (res.ok) allSubmissions = await res.json();
        } catch (e) {
            console.error('Failed to fetch submissions:', e);
        }

        // Filter submissions to show only this participant's team submissions
        // Use stored team_id if available, otherwise show all (fallback)
        const submissions = myTeamId 
            ? allSubmissions.filter(s => s.team_id === myTeamId)
            : allSubmissions;

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <button class="btn btn-ghost" onclick="state.connectedHackathon=null; showDashboard()" style="padding-left:0;">
                         < BACK_TO_JOIN
                    </button>
                    <h2 class="text-gradient">${h.name}</h2>
                    <p style="font-family: var(--font-code); font-size: 0.9rem; color: var(--matrix-green);">
                        > SESSION_ACTIVE // CODE: ${h.invite_code || h.code}
                    </p>
                </div>
            </div>

            ${teamInfo ? `
                <div class="card" style="margin-bottom: 2rem; border-color: var(--cyber-cyan);">
                    <h3 style="color: var(--cyber-cyan);">YOUR_TEAM_INFO</h3>
                    <div style="font-family: var(--font-code); margin-top: 1rem;">
                        <div>> TEAM_NAME: <span style="color: white;">${teamInfo.team_name}</span></div>
                        <div>> PROJECT_TITLE: <span style="color: white;">${teamInfo.project_title}</span></div>
                        <div>> TEAM_TOKEN: <span style="color: var(--electric-blue); font-weight: bold;">${teamInfo.team_token}</span></div>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
                            ⚠️ USE_THIS_TOKEN_FOR_SUBMISSION
                        </p>
                    </div>
                </div>
            ` : `
                <div class="card" style="margin-bottom: 2rem; border-color: #ff4444;">
                    <h3 style="color: #ff4444;">NO_TEAM_ASSIGNED</h3>
                    <p style="font-family: var(--font-code); color: var(--text-secondary);">
                        > CONTACT_ADMIN_TO_GET_TEAM_TOKEN
                    </p>
                </div>
            `}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                 <div class="card">
                    <h3>CREATE_SUBMISSION</h3>
                    <div class="input-group">
                        <button class="btn btn-primary" style="width:100%" onclick="openSubmissionModal()">INITIATE_NEW_SUBMISSION</button>
                        <p style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-top: 0.5rem;">
                            REQ: TEAM_TOKEN + GITHUB_LINK
                        </p>
                    </div>
                 </div>
                 
                 <div class="card">
                    <h3>STATS</h3>
                    <div style="margin-top: 1rem; font-family: var(--font-code);">
                        <div>> TOTAL_SUBMISSIONS: <span style="color:white">${submissions.length}</span></div>
                        <div>> AVG_SCORE: <span style="color:white">--</span></div>
                        <div>> RANK: <span style="color:white">#--</span></div>
                    </div>
                 </div>
            </div>

            <h4 style="margin-bottom: 1rem;">MY_PROJECTS</h4>
            <div style="display: grid; gap: 1rem;">
                ${submissions.length === 0 ? '<div class="card">NO_SUBMISSIONS_YET</div>' : ''}
                ${submissions.map(s => `
                    <div class="card" style="padding: 1rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <div>
                                <div style="font-weight: bold; color: var(--cyber-cyan);">${s.title || 'Untitled Project'}</div>
                                <div style="font-size: 0.8rem; margin-top: 0.5rem;">TEAM: ${s.team_name}</div>
                                ${s.usp ? `<div style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-secondary); font-style: italic;">${s.usp}</div>` : ''}
                            </div>
                            <div style="text-align: right;">
                                 <div class="btn-ghost" style="font-size: 0.8rem;">STATUS: SUBMITTED</div>
                            </div>
                        </div>
                        ${s.github_url ? `
                            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <button class="btn btn-ghost" style="border: 1px solid var(--border-subtle); font-size: 0.8rem; padding: 0.3rem 0.8rem;" 
                                    onclick="window.open('${s.github_url}', '_blank')">GITHUB_REPO</button>
                                ${s.video_url ? `<button class="btn btn-ghost" style="border: 1px solid var(--border-subtle); font-size: 0.8rem; padding: 0.3rem 0.8rem;" 
                                    onclick="window.open('${s.video_url}', '_blank')">VIDEO</button>` : ''}
                                ${s.prototype_url ? `<button class="btn btn-ghost" style="border: 1px solid var(--border-subtle); font-size: 0.8rem; padding: 0.3rem 0.8rem;" 
                                    onclick="window.open('${s.prototype_url}', '_blank')">DEMO</button>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

async function joinHackathonAsParticipant() {
    const codeInput = document.getElementById('participantHackathonCode');
    const code = codeInput.value.trim();
    const btn = document.getElementById('joinParticipantBtn');

    if (!code) return;

    btn.textContent = 'CONNECTING...';

    try {
        const res = await fetch(`${API_BASE}/hackathons/code/${code}`);
        if (res.ok) {
            const hack = await res.json();
            state.connectedHackathon = hack;
            
            // Check if user already has a team for this hackathon
            let hasTeam = false;
            try {
                const teamsRes = await fetch(`${API_BASE}/teams?hackathon_id=${hack.id}`);
                if (teamsRes.ok) {
                    const teams = await teamsRes.json();
                    hasTeam = teams.length > 0;
                }
            } catch (e) {
                console.error('Error checking teams:', e);
            }
            
            // If no team exists, automatically create one
            if (!hasTeam && state.currentUser) {
                try {
                    const teamRes = await fetch(`${API_BASE}/teams/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            team_name: `${state.currentUser.name}'s Team`,
                            project_title: `Project by ${state.currentUser.name}`,
                            hackathon_code: code
                        })
                    });
                    
                    if (teamRes.ok) {
                        const teamData = await teamRes.json();
                        state.currentTeamId = teamData.team_id;
                        showToast('TEAM_AUTO_ASSIGNED', 'success');
                    } else {
                        console.error('Failed to auto-create team');
                    }
                } catch (e) {
                    console.error('Error auto-creating team:', e);
                }
            }
            
            showDashboard();
            showToast(`SESSION_ESTABLISHED: ${hack.name}`, 'success');
        } else {
            showToast('ERROR: 404_HACKATHON_NOT_FOUND', 'error');
            btn.textContent = 'CONNECT';
        }
    } catch (e) {
        console.error(e);
        showToast('ERROR: BACKEND_UNREACHABLE', 'error');
        btn.textContent = 'CONNECT';
    }
}


// --- CONFIRMATION MODAL LOGIC ---
let pendingConfirmAction = null;

function openConfirmModal(title, msg, action) {
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = msg;
    pendingConfirmAction = action;
    document.getElementById('confirmModal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    pendingConfirmAction = null;
}

document.getElementById('confirmActionBtn').addEventListener('click', () => {
    if (pendingConfirmAction) pendingConfirmAction();
    closeConfirmModal();
});


// 3. ADMIN DASHBOARD - UPDATED
async function renderAdminDashboard(container) {
    // Fetch hackathons with team counts
    let hackathonsWithStats = [];
    for (const h of DB.hackathons) {
        try {
            const teamsRes = await fetch(`${API_BASE}/teams?hackathon_id=${h.id}`);
            const teams = teamsRes.ok ? await teamsRes.json() : [];
            hackathonsWithStats.push({
                ...h,
                team_count: teams.length,
                is_frozen: h.status === 'frozen'
            });
        } catch (e) {
            hackathonsWithStats.push({
                ...h,
                team_count: 0,
                is_frozen: h.status === 'frozen'
            });
        }
    }

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem; border-color: var(--electric-blue);">
            <h3 style="color: var(--electric-blue);">GLOBAL_CONTROLS</h3>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button class="btn btn-primary" onclick="createHackathon()">+ CREATE_NEW_EVENT</button>
                <button class="btn btn-ghost" onclick="exportUserData()">EXPORT_USER_DATA</button>
            </div>
        </div>

        <h4 style="margin-bottom: 1rem;">SYSTEM_EVENTS</h4>
        <div style="display: grid; gap: 1rem;">
            ${hackathonsWithStats.map(h => `
                <div class="card" style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem;">${h.name}</div>
                            <div style="font-size: 0.8rem; font-family: var(--font-code); margin-top: 0.3rem;">CODE: ${h.code}</div>
                            <div style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-secondary);">
                                > TEAMS_REGISTERED: <span style="color: var(--matrix-green);">${h.team_count}</span>
                            </div>
                            ${h.is_frozen ? '<div style="font-size: 0.85rem; margin-top: 0.3rem; color: #ff4444;">⚠️ SUBMISSIONS_FROZEN</div>' : '<div style="font-size: 0.85rem; margin-top: 0.3rem; color: var(--matrix-green);">✓ SUBMISSIONS_OPEN</div>'}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-ghost" style="font-size: 0.8rem; border: 1px solid var(--cyber-cyan); color: var(--cyber-cyan);" onclick="editHackathon(${h.id})">EDIT</button>
                            <button class="btn btn-ghost" style="font-size: 0.8rem; color: #ff4444;" onclick="requestDeleteHackathon(${h.id})">DELETE</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// --- ADMIN MODAL LOGIC ---

function createHackathon() {
    // Open Modal instead of prompt
    document.getElementById('createEventModal').classList.remove('hidden');
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').classList.add('hidden');
}

async function confirmCreateHackathon() {
    const name = document.getElementById('newEventName').value;
    const code = document.getElementById('newEventCode').value;

    if (!name || !code) {
        showToast("ERROR: NAME_AND_CODE_REQUIRED", 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/hackathons/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, invite_code: code, is_frozen: false })
        });

        if (res.ok) {
            showToast("SUCCESS: EVENT_CREATED", 'success');
            closeCreateEventModal();
            fetchAppState();
        } else {
            showToast("ERROR: CREATION_FAILED", 'error');
        }
    } catch (e) {
        showToast("ERROR: BACKEND_ISSUE", 'error');
    }
}

// REQUEST DELETE
function requestDeleteHackathon(id) {
    openConfirmModal(
        "WARNING: DELETE_EVENT?",
        "> THIS ACTION IS IRREVERSIBLE. PURGE DATA?",
        () => deleteHackathon(id)
    );
}

async function deleteHackathon(id) {
    try {
        const res = await fetch(`${API_BASE}/hackathons/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast("SUCCESS: EVENT_DELETED", 'success');
            fetchAppState(); // REFRESH DATA
        } else {
            showToast("ERROR: DELETION_FAILED", 'error');
        }
    } catch (e) {
        showToast("ERROR: NETWORK_ERROR", 'error');
    }
}

function exportUserData() {
    // Mock export
    showToast("INITIATING_DUMP...", 'info');
    setTimeout(() => {
        const data = "username,role\nneo,participant\nsmith,judge";
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "users_dump.csv";
        a.click();
        showToast("SUCCESS: DATA_EXPORTED", 'success');
    }, 1000);
}

// --- EDIT HACKATHON MODAL LOGIC ---
let editingHackathonId = null;

async function editHackathon(hackathonId) {
    editingHackathonId = hackathonId;
    
    // Find hackathon in DB
    const hackathon = DB.hackathons.find(h => h.id === hackathonId);
    if (!hackathon) {
        showToast('ERROR: HACKATHON_NOT_FOUND', 'error');
        return;
    }

    // Populate form
    document.getElementById('editEventName').value = hackathon.name;
    document.getElementById('editEventCode').value = hackathon.code;
    
    // Fetch current hackathon details from backend
    try {
        const res = await fetch(`${API_BASE}/hackathons/`);
        if (res.ok) {
            const hackathons = await res.json();
            const fullHackathon = hackathons.find(h => h.id === hackathonId);
            if (fullHackathon) {
                document.getElementById('editEventFrozen').checked = fullHackathon.is_frozen || false;
            }
        }
    } catch (e) {
        console.error('Failed to fetch hackathon details:', e);
    }

    // Load teams
    await loadHackathonTeams(hackathonId);
    
    // Load judge assignments
    await loadJudgeAssignments(hackathonId);
    
    // Load submissions
    await loadHackathonSubmissions(hackathonId);
    
    // Load leaderboard
    await loadHackathonLeaderboard(hackathonId);

    // Show modal
    document.getElementById('editHackathonModal').classList.remove('hidden');
}

function closeEditHackathonModal() {
    document.getElementById('editHackathonModal').classList.add('hidden');
    editingHackathonId = null;
}

async function loadHackathonTeams(hackathonId) {
    const container = document.getElementById('editHackathonTeams');
    try {
        const res = await fetch(`${API_BASE}/teams?hackathon_id=${hackathonId}`);
        if (res.ok) {
            const teams = await res.json();
            container.innerHTML = `
                <h4 style="margin-bottom: 0.5rem;">REGISTERED_TEAMS (${teams.length})</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-subtle); padding: 0.5rem; border-radius: 4px;">
                    ${teams.length === 0 ? '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_TEAMS_REGISTERED</div>' : ''}
                    ${teams.map(t => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-subtle); font-size: 0.9rem;">
                            <div style="font-weight: bold;">${t.team_name}</div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Project: ${t.project_title}</div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem; font-family: var(--font-code);">Token: ${t.team_token}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (e) {
        container.innerHTML = '<div style="color: #ff4444;">ERROR_LOADING_TEAMS</div>';
    }
}

async function loadJudgeAssignments(hackathonId) {
    const container = document.getElementById('editHackathonAssignments');
    try {
        const res = await fetch(`${API_BASE}/assignments/hackathon/${hackathonId}`);
        if (res.ok) {
            const assignments = await res.json();
            
            // Group by judge
            const byJudge = {};
            assignments.forEach(a => {
                if (!byJudge[a.judge_name]) {
                    byJudge[a.judge_name] = [];
                }
                byJudge[a.judge_name].push(a);
            });

            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0;">JUDGE_ASSIGNMENTS</h4>
                    <button class="btn btn-ghost" style="font-size: 0.8rem; border: 1px solid var(--cyber-cyan); color: var(--cyber-cyan);" onclick="runAssignments(${hackathonId})">RUN_ASSIGNMENTS</button>
                </div>
                <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-subtle); padding: 0.5rem; border-radius: 4px;">
                    ${Object.keys(byJudge).length === 0 ? '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_ASSIGNMENTS_YET</div>' : ''}
                    ${Object.entries(byJudge).map(([judgeName, teams]) => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
                            <div style="font-weight: bold; color: var(--cyber-cyan);">${judgeName}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">
                                ${teams.map(t => t.team_name).join(', ')}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">(${teams.length} team${teams.length !== 1 ? 's' : ''})</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_ASSIGNMENTS_YET</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_ASSIGNMENTS_YET</div>';
    }
}

async function loadHackathonSubmissions(hackathonId) {
    const container = document.getElementById('editHackathonSubmissions');
    try {
        const res = await fetch(`${API_BASE}/submissions?hackathon_id=${hackathonId}`);
        if (res.ok) {
            const submissions = await res.json();
            container.innerHTML = `
                <h4 style="margin-bottom: 0.5rem;">SUBMISSIONS (${submissions.length})</h4>
                <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-subtle); padding: 0.5rem; border-radius: 4px;">
                    ${submissions.length === 0 ? '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_SUBMISSIONS_YET</div>' : ''}
                    ${submissions.map(s => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-subtle); font-size: 0.9rem;">
                            <div style="font-weight: bold;">${s.title}</div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">By: ${s.team_name}</div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem; font-family: var(--font-code);">GitHub: ${s.github_url ? '✓' : '✗'}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_SUBMISSIONS_YET</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_SUBMISSIONS_YET</div>';
    }
}

async function runAssignments(hackathonId) {
    try {
        const res = await fetch(`${API_BASE}/assignments/run`, {
            method: 'POST'
        });
        if (res.ok) {
            showToast('SUCCESS: ASSIGNMENTS_RUN', 'success');
            // Reload assignments
            await loadJudgeAssignments(hackathonId);
        } else {
            showToast('ERROR: FAILED_TO_RUN_ASSIGNMENTS', 'error');
        }
    } catch (e) {
        console.error('Error running assignments:', e);
        showToast('ERROR: API_CONNECTION_FAILED', 'error');
    }
}

async function loadHackathonLeaderboard(hackathonId) {
    const container = document.getElementById('editHackathonLeaderboard');
    try {
        const res = await fetch(`${API_BASE}/leaderboard?hackathon_id=${hackathonId}`);
        if (res.ok) {
            const leaderboard = await res.json();
            container.innerHTML = `
                <h4 style="margin-bottom: 0.5rem;">LEADERBOARD</h4>
                <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-subtle); padding: 0.5rem; border-radius: 4px;">
                    ${leaderboard.length === 0 ? '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_EVALUATIONS_YET</div>' : ''}
                    ${leaderboard.map((entry, index) => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-weight: bold; color: var(--matrix-green);">#${index + 1}</span>
                                <span style="margin-left: 0.5rem;">${entry.team_name}</span>
                            </div>
                            <div style="font-weight: bold; color: var(--cyber-cyan);">${entry.score.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_EVALUATIONS_YET</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">NO_EVALUATIONS_YET</div>';
    }
}

async function confirmEditHackathon() {
    if (!editingHackathonId) return;

    const name = document.getElementById('editEventName').value;
    const code = document.getElementById('editEventCode').value;
    const isFrozen = document.getElementById('editEventFrozen').checked;

    if (!name || !code) {
        showToast("ERROR: NAME_AND_CODE_REQUIRED", 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/hackathons/${editingHackathonId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                invite_code: code,
                is_frozen: isFrozen
            })
        });

        if (res.ok) {
            showToast("SUCCESS: HACKATHON_UPDATED", 'success');
            closeEditHackathonModal();
            fetchAppState();
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'UPDATE_FAILED'}`, 'error');
        }
    } catch (e) {
        showToast("ERROR: BACKEND_ISSUE", 'error');
    }
}

// --- GLOBAL STATE FETCH ---
let isRefreshing = false; // Flag to prevent multiple simultaneous refreshes

async function fetchAppState() {
    // Prevent multiple simultaneous calls
    if (isRefreshing) return;
    isRefreshing = true;
    
    try {
        // 1. Fetch Hackathons
        const hRes = await fetch(`${API_BASE}/hackathons/`);
        if (hRes.ok) {
            const hList = await hRes.json();
            DB.hackathons = hList.map(h => ({
                id: h.id,
                name: h.name,
                code: h.invite_code,
                status: h.is_frozen ? 'frozen' : 'active'
            }));
        }

        // 2. Fetch All Submissions (For Participant Dashboard mainly)
        const sRes = await fetch(`${API_BASE}/submissions/`);
        if (sRes.ok) {
            const sList = await sRes.json();
            DB.submissions = sList.map(s => ({
                id: s.id,
                userId: 'u1',
                hackathonId: s.hackathon_id,
                title: s.title,
                status: 'submitted',
                score: s.score,
                team_name: s.team_name,
                ...s // include urls etc
            }));
        }

        // Refresh Current View if Dashboard
        // Only refresh if we're not in the middle of a submission/evaluation flow
        // Preserve connectedHackathon state for participants and judges
        if (!views.dashboard.classList.contains('hidden') && state.currentUser) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/46dd9ff4-3e62-44b0-88b2-5033c2ae75ad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1287',message:'fetchAppState - refreshing dashboard',data:{has_currentUser:state.currentUser!=null,role:state.currentUser?.role,has_connectedHackathon:state.connectedHackathon!=null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            // Preserve connected hackathon state
            const wasConnected = state.connectedHackathon;
            const userRole = state.currentUser.role;
            
            // Only refresh if we have a valid user
            if (userRole === 'participant' || userRole === 'judge' || userRole === 'admin') {
                // Restore connected hackathon after refresh
                showDashboard();
                
                // Restore connected hackathon if it was set (for participants and judges)
                if (wasConnected && (userRole === 'participant' || userRole === 'judge')) {
                    state.connectedHackathon = wasConnected;
                    // Re-render to show the connected view
                    const container = document.getElementById('dashboardContent');
                    if (userRole === 'participant') {
                        renderParticipantDashboard(container);
                    } else if (userRole === 'judge') {
                        renderJudgeDashboard(container);
                    }
                }
            }
        }

    } catch (e) {
        console.error("Sync Error", e);
    } finally {
        isRefreshing = false;
    }
}
// Init fetch
fetchAppState();

// Keypress
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!views.login.classList.contains('hidden')) {
            handleLogin();
        }
    }
});
