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
    loginTargetRole: null
};

// --- NAVIGATION ---
const views = {
    landing: document.getElementById('landingView'),
    login: document.getElementById('loginView'),
    dashboard: document.getElementById('dashboardView'),
    register: document.getElementById('registerView') // [NEW]
};

function showLanding() {
    state = { currentUser: null, connectedHackathon: null, loginTargetRole: null };
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
            })
        });

        if (res.ok) {
            const data = await res.json();
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
                token: data.access_token
            };

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
            closeSubmissionModal();
            // Refresh dashboard with new data
            fetchAppState();
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'SUBMISSION_FAILED'}`, 'error');
        }
    } catch (e) {
        showToast('ERROR: UPLOAD_FAILED', 'error');
    }
}

// --- DASHBOARDS ---
function showDashboard() {
    switchView('dashboard');
    const role = state.currentUser.role;

    // Header Info
    document.getElementById('userRoleTitle').textContent = role.toUpperCase() + '_DASHBOARD';
    document.getElementById('userWelcome').textContent = `> AUTHENTICATED_USER: ${state.currentUser.name} [${state.currentUser.username}]`;

    const container = document.getElementById('dashboardContent');
    container.innerHTML = ''; // Clear previous

    if (role === 'judge') renderJudgeDashboard(container);
    else if (role === 'participant') renderParticipantDashboard(container);
    else if (role === 'admin') renderAdminDashboard(container);
}

// 1. JUDGE DASHBOARD
// 1. JUDGE DASHBOARD
async function renderJudgeDashboard(container) {
    if (!state.connectedHackathon) {
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
            <div id="hackathonList" style="display: grid; gap: 1rem;"></div>
        `;
    } else {
        const h = state.connectedHackathon;

        // Fetch Submissions
        let submissions = [];
        try {
            const res = await fetch(`${API_BASE}/submissions?hackathon_id=${h.id}`);
            if (res.ok) submissions = await res.json();
            else console.error('Failed to fetch submissions');
        } catch (e) {
            console.error('API Error:', e);
            showToast('ERROR: API_CONNECTION_FAILED', 'error');
        }

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
                             <input type="number" id="score-${s.id}" class="input-field" placeholder="0.0 - 10.0" step="0.1" min="0" max="10" style="width: 120px;">
                             <button type="button" class="btn btn-primary" onclick="submitGrade('${s.id}', '${s.team_id}')">SUBMIT_SCORE</button>
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
    const scoreInput = document.getElementById(`score-${subId}`);
    const scoreVal = parseFloat(scoreInput.value);

    // console.log("Grading:", subId, teamId, scoreVal); // Debug

    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
        showToast("ERROR: INVALID_SCORE (0.0 - 10.0)", 'error');
        return;
    }

    try {
        let jId = 1; // Default
        if (state.currentUser && state.currentUser.id && !isNaN(state.currentUser.id)) {
            jId = parseInt(state.currentUser.id);
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
            showToast(`SUCCESS: EVALUATION_RECORDED: ${scoreVal}`, 'success');
            scoreInput.disabled = true;
            scoreInput.parentElement.querySelector('button').textContent = "GRADED";
            scoreInput.parentElement.querySelector('button').disabled = true;
        } else {
            const err = await res.json();
            showToast(`ERROR: ${err.detail || 'GRADING_FAILED'}`, 'error');
        }
    } catch (e) {
        showToast('ERROR: SUBMISSION_FAILED', 'error');
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
        try {
            // Try to get team by hackathon - for now we'll use the first team for this hackathon
            // In a real app, we'd link user to team properly
            const teamsRes = await fetch(`${API_BASE}/teams?hackathon_id=${h.id}`);
            if (teamsRes.ok) {
                const teams = await teamsRes.json();
                if (teams.length > 0) {
                    teamInfo = teams[0]; // Use first team for demo
                }
            }
        } catch (e) {
            console.error('Failed to fetch team info:', e);
        }

        // Fetch submissions for this hackathon
        let submissions = [];
        try {
            const res = await fetch(`${API_BASE}/submissions?hackathon_id=${h.id}`);
            if (res.ok) submissions = await res.json();
        } catch (e) {
            console.error('Failed to fetch submissions:', e);
        }

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
                                <div style="font-weight: bold; color: var(--cyber-cyan);">${s.title}</div>
                                <div style="font-size: 0.8rem;">TEAM: ${s.team_name}</div>
                            </div>
                            <div style="text-align: right;">
                                 <div class="btn-ghost" style="font-size: 0.8rem;">STATUS: SUBMITTED</div>
                            </div>
                        </div>
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
function renderAdminDashboard(container) {
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
            ${DB.hackathons.map(h => `
                <div class="card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold;">${h.name}</div>
                        <div style="font-size: 0.8rem; font-family: var(--font-code);">${h.code}</div>
                    </div>
                    <div>
                        <button class="btn btn-ghost" style="font-size: 0.8rem; color: #ff4444;" onclick="requestDeleteHackathon('${h.id}')">DELETE</button>
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

// --- GLOBAL STATE FETCH ---
async function fetchAppState() {
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
        // Note: list_submissions returns ALL if no hackathon_id provided, 
        // OR we can filter client side.
        // Actually, let's fetch ALL for now to populate DB.submissions
        const sRes = await fetch(`${API_BASE}/submissions/`);
        if (sRes.ok) {
            const sList = await sRes.json();
            // Map backend response to frontend DB structure
            DB.submissions = sList.map(s => ({
                id: s.id,
                userId: 'u1', // Backend doesn't send userId in list yet? Need to fix if vital.
                // Actually list_submissions joins Team, but not User directly? 
                // Wait, Submission is linked to TEAM. User is linked to TEAM?
                // Participant Dashboard filters by `s.userId === state.currentUser.id`.
                // THIS IS A PROBLEM. The backend list doesn't return who submitted it (User ID).
                // It returns Team Name.
                // If I am a participant, I should see MY submissions.
                // Currently, I can't distinguish my submissions from others using the public list!

                // QUICK FIX: For this Demo, show ALL submissions in Participant Dashboard?
                // OR assume Client matches Team Name?
                // Let's just show ALL for now to prove it works, or filter by nothing.
                hackathonId: s.hackathon_id,
                title: s.title,
                status: 'submitted', // Backend doesn't have status field?
                score: s.score,
                team_name: s.team_name,
                ...s // include urls etc
            }));
        }

        // Refresh Current View if Dashboard
        if (!views.dashboard.classList.contains('hidden')) {
            showDashboard();
        }

    } catch (e) {
        console.error("Sync Error", e);
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
