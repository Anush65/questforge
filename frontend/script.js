// Test credentials
const credentials = {
    judge: { username: 'judge123', password: 'password' },
    participant: { username: 'participant1', password: 'password' },
    admin: { username: 'admin', password: 'password' }
};

let currentRole = '';
let currentHackathon = null;
let participantHackathon = null;
let participantJoinedHackathons = [];
let judgeJoinedHackathons = [];
// Admin-managed running hackathons
let runningHackathons = [];

function initAdminDashboard() {
    // Ensure admin list is populated
    populateAdminHackathonList();
}

function generateCode(prefix = '', len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return `${prefix}-${out}`;
}

function startHosting() {
    const nameInput = document.getElementById('adminHackathonName');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert('Please provide a hackathon name');
        return;
    }

    // generate codes
    const participantCode = generateCode('PART');
    const judgeCode = generateCode('JUDGE');

    const newHack = { name, participantCode, judgeCode, participants: 0 };
    runningHackathons.push(newHack);

    // Add to accepted arrays so joins only accept these codes
    participantHackathons.push({ code: participantCode, name, participants: 0 });
    judgeHackathons.push({ code: judgeCode, name, participants: 0 });

    // show a small dialog to admin with the codes
    alert(`Started hosting: ${name}\nParticipant code: ${participantCode}\nJudge code: ${judgeCode}`);

    // clear input and refresh lists
    if (nameInput) nameInput.value = '';
    populateAdminHackathonList();
}

function populateAdminHackathonList() {
    const list = document.getElementById('adminHackathonList');
    if (!list) return;
    list.innerHTML = '';

    if (runningHackathons.length === 0) {
        list.innerHTML = '<div style="color:#666;padding:0.5rem;">No hackathons are currently running.</div>';
        return;
    }

    runningHackathons.forEach(h => {
        const card = document.createElement('div');
        card.className = 'hackathon-card current';
        card.style.marginBottom = '0.75rem';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="hackathon-title" style="font-weight:600">${h.name}</div>
                    <div style="font-size:0.9rem;color:#333;margin-top:0.25rem">Participants: ${h.participants}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:0.85rem;color:#444">Participant code: <strong>${h.participantCode}</strong></div>
                    <div style="font-size:0.85rem;color:#444">Judge code: <strong>${h.judgeCode}</strong></div>
                </div>
            </div>
        `;

        list.appendChild(card);
    });
}

function adminLogout() {
    logoutToRole();
}

function logoutToRole() {
    currentRole = '';
    currentHackathon = null;
    participantHackathon = null;
    // keep joined lists intact, but reset UI
    showMainLogin();
}

// JUDGE HACKATHONS
const judgeHackathons = [
    { code: 'HACK2026-JUDGE-XYZ123', name: 'AI/ML Innovation Challenge', participants: 12 },
    { code: 'H4CK4TH0N-V3R5ION-ABC789', name: 'Web3 Hackathon 2026', participants: 15 },
    { code: 'M0B1L3-4PPSPR1NT-DEF456', name: 'Mobile App Sprint', participants: 8 }
];

// PARTICIPANT HACKATHONS (Different codes!)
const participantHackathons = [
    { code: 'HACK2026-STUDENT-ABC123', name: 'AI/ML Innovation Challenge', participants: 12 },
    { code: 'H4CK4TH0N-TEAM-XYZ789', name: 'Web3 Hackathon 2026', participants: 15 },
    { code: 'M0B1L3SPR1NT-GR0UP-DEF456', name: 'Mobile App Sprint', participants: 8 }
];

function showLogin(role) {
    document.getElementById('mainLogin').style.display = 'none';
    document.getElementById('loginForms').style.display = 'block';

    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });

    document.getElementById(role + 'Login').classList.add('active');
    currentRole = role;
}

function showMainLogin() {
    document.getElementById('loginForms').style.display = 'none';
    document.getElementById('mainLogin').style.display = 'block';
    document.querySelectorAll('.dashboard').forEach(dash => {
        dash.classList.remove('active');
    });
}

function login(role) {
    const username = document.getElementById(role + 'Username').value;
    const password = document.getElementById(role + 'Password').value;

    if (username === credentials[role].username && password === credentials[role].password) {
        showDashboard(role);
    } else {
        alert('Invalid credentials!');
    }
}

function showDashboard(role) {
    document.querySelectorAll('.dashboard').forEach(dash => dash.classList.remove('active'));
    document.getElementById('loginForms').style.display = 'none';
    document.getElementById('mainLogin').style.display = 'none';

    document.getElementById(role + 'Dashboard').classList.add('active');

    if (role === 'judge') {
        populateJudgeHackathonList();
    } else if (role === 'participant') {
        initParticipantDashboard();
    } else if (role === 'admin') {
        initAdminDashboard();
    }
}

// ======================================
// JUDGE FUNCTIONS (Your existing ones)
function joinHackathon() {
    const codeInput = document.getElementById('hackathonCodeInput').value.trim();
    const normCode = codeInput.toUpperCase();
    const btn = document.getElementById('joinBtn');

    if (!codeInput) {
        alert('Please paste a hackathon code!');
        return;
    }

    // find by normalized code (case-insensitive, whitespace trimmed)
    const hackathon = judgeHackathons.find(h => h.code.toUpperCase() === normCode);

    if (hackathon) {
        currentHackathon = hackathon;
        btn.textContent = '✅ Connected!';
        btn.classList.add('connected');
        document.getElementById('connectionStatus').innerHTML = '🟢 Connected';

        document.getElementById('currentHackathonName').textContent = hackathon.name;
        document.getElementById('currentHackathonInfo').style.display = 'block';

        // add to joined list if not already present
        if (!judgeJoinedHackathons.find(h => h.code === hackathon.code)) {
            judgeJoinedHackathons.push(hackathon);
        }

        populateJudgeHackathonList();

        document.getElementById('hackathonCodeInput').style.height = '120px';
    } else {
        alert('Invalid hackathon code! Try:\nHACK2026-JUDGE-XYZ123\nH4CK4TH0N-V3R5ION-ABC789\nM0B1L3-4PPSPR1NT-DEF456');
    }
}

function populateJudgeHackathonList() {
    const listContainer = document.getElementById('hackathonList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // show only hackathons the judge has joined
    if (judgeJoinedHackathons.length === 0) {
        listContainer.innerHTML = '<div style="color:#666;padding:0.5rem;">You have not connected to any hackathons yet.</div>';
        return;
    }

    judgeJoinedHackathons.forEach(hackathon => {
        const isCurrent = currentHackathon && currentHackathon.code === hackathon.code;
        const card = document.createElement('div');
        card.className = `hackathon-card ${isCurrent ? 'current' : ''}`;
        card.style.marginBottom = '0.75rem';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="hackathon-title">${hackathon.name}</div>
                    <div class="hackathon-status status-participants">👥 ${hackathon.participants} participants</div>
                </div>
                <div style="text-align:right">
                    <div class="hackathon-status ${isCurrent ? 'status-connected' : 'status-disconnected'}">${isCurrent ? '✅ Active Session' : '🔌 Connected'}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', function() {
            // clicking opens/connects this hackathon
            currentHackathon = hackathon;
            document.getElementById('connectionStatus').innerHTML = '🟢 Connected';
            document.getElementById('currentHackathonName').textContent = hackathon.name;
            document.getElementById('currentHackathonInfo').style.display = 'block';
            const btn = document.getElementById('joinBtn');
            if (btn) {
                btn.textContent = '✅ Connected!';
                btn.classList.add('connected');
            }
            populateJudgeHackathonList();
        });

        listContainer.appendChild(card);
    });
}

// ======================================
// PARTICIPANT FUNCTIONS (NEW!)
function initParticipantDashboard() {
    // Create participant content dynamically
    const participantDash = document.getElementById('participantDashboard');
    participantDash.innerHTML = `
        <button class="small-logout" onclick="logoutToRole()">🚪 Logout</button>
        <div class="dashboard-header">
            <h1>👨‍💻 Participant Dashboard</h1>
            <p>Join hackathon & register team</p>
        </div>
            <div class="your-hackathons" style="margin-top:1.25rem;">
                <h4 style="margin: .25rem 0 .5rem 0;">Your Hackathons</h4>
                <div id="p-hackathonList" class="hackathon-list"></div>
            </div>

        <!-- Step Progress -->
        <div class="steps">
            <div class="step active" data-step="1">
                <div class="step-circle">1</div>
                <div class="step-label">Join Code</div>
            </div>
            <div class="step" data-step="2">
                <div class="step-circle">2</div>
                <div class="step-label">Team Details</div>
            </div>
            <div class="step" data-step="3">
                <div class="step-circle">3</div>
                <div class="step-label">Joined!</div>
            </div>
        </div>

        <!-- Panel 1: Join -->
        <div class="panel active" id="p-panel1">
            <div class="join-box">
                <div class="join-title">
                    <span>🎮 Enter Hackathon Code</span>
                    <span class="status status-idle" id="p-joinStatus">Ready to join</span>
                </div>
                <div class="hint">Paste student party code (different from judge codes!)</div>
                <textarea class="hackathon-code-input" id="p-hackathonCode" 
                          placeholder="HACK2026-STUDENT-ABC123
H4CK4TH0N-TEAM-XYZ789
M0B1L3SPR1NT-GR0UP-DEF456"></textarea>
                <div class="btn-row">
                    <button class="join-btn" onclick="participantJoinHackathon()">Join Hackathon</button>
                </div>
            </div>
        </div>

        <!-- Panel 2: Team Form -->
        <div class="panel" id="p-panel2" style="display: none;">
            <h3 style="margin-bottom: 1.5rem; color: #333; text-align: center;">
                📝 Register for <span id="p-hackathonName"></span>
            </h3>
            <form id="p-teamForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Team Name <span class="required">*</span></label>
                        <input type="text" id="p-teamName" required>
                        <div class="error-msg">Required</div>
                    </div>
                    <div class="form-group">
                        <label>Captain Name <span class="required">*</span></label>
                        <input type="text" id="p-captainName" required>
                        <div class="error-msg">Required</div>
                    </div>
                    <div class="form-group">
                        <label>Captain Email <span class="required">*</span></label>
                        <input type="email" id="p-captainEmail" required>
                        <div class="error-msg">Valid email required</div>
                    </div>
                    <div class="form-group">
                        <label>Captain Phone <span class="required">*</span></label>
                        <input type="tel" id="p-captainPhone" required>
                        <div class="error-msg">Phone required</div>
                    </div>
                    <div class="form-group full-width">
                        <label>Project Idea</label>
                        <textarea id="p-projectIdea"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Member 2 (optional)</label>
                        <input type="text" id="p-member2">
                    </div>
                    <div class="form-group">
                        <label>Member 3 (optional)</label>
                        <input type="text" id="p-member3">
                    </div>
                </div>
                <div class="btn-row">
                    <button type="submit" class="join-btn">✅ Register Team</button>
                </div>
            </form>
        </div>

        <!-- Panel 3: Success -->
        <div class="panel" id="p-panel3" style="display: none; text-align: center; padding: 3rem;">
            <div style="font-size: 4rem; color: #51cf66; margin-bottom: 1rem;">✅</div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Team Registered!</h2>
            <div id="p-successMsg" style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
                Loading...
            </div>
            <button class="join-btn" onclick="participantReset()">Join Another Hackathon</button>
        </div>
    `;

    // Add event listener for team form
    document.getElementById('p-teamForm').addEventListener('submit', participantSubmitTeam);
    // Submit participant hackathon code on Enter (prevent default newline)
    const pCodeEl = document.getElementById('p-hackathonCode');
    if (pCodeEl) {
        pCodeEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                participantJoinHackathon();
            }
        });
    }
    // Populate the participant's hackathon list
    populateParticipantHackathonList();
}

function participantJoinHackathon() {
    const code = document.getElementById('p-hackathonCode').value.trim().toUpperCase();
    const statusEl = document.getElementById('p-joinStatus');

    if (!code) {
        statusEl.textContent = 'Enter code first!';
        statusEl.className = 'status status-error';
        return;
    }

    const hackathon = participantHackathons.find(h => h.code === code);

    if (hackathon) {
        participantHackathon = hackathon;
        // add to joined list if not already present
        if (!participantJoinedHackathons.find(h => h.code === hackathon.code)) {
            participantJoinedHackathons.push(hackathon);
        }
        statusEl.textContent = `✅ Joined ${hackathon.name}!`;
        statusEl.className = 'status status-ok';

        setTimeout(() => {
            document.getElementById('p-panel1').style.display = 'none';
            document.getElementById('p-hackathonName').textContent = hackathon.name;
            document.getElementById('p-panel2').style.display = 'block';
        }, 1000);
    } else {
        statusEl.textContent = '❌ Wrong code! Try student codes above.';
        statusEl.className = 'status status-error';
    }
    // refresh list to reflect joined state
    populateParticipantHackathonList();
}

// Populate participant hackathon cards and wire join/open buttons
function populateParticipantHackathonList() {
    const container = document.getElementById('p-hackathonList');
    if (!container) return;
    container.innerHTML = '';

    // Show only hackathons the participant has joined
    if (participantJoinedHackathons.length === 0) {
        container.innerHTML = '<div style="color:#666;padding:0.5rem;">You have not joined any hackathons yet.</div>';
        return;
    }

    participantJoinedHackathons.forEach(h => {
        const card = document.createElement('div');
        card.className = 'hackathon-card current';
        card.style.marginBottom = '0.75rem';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="hackathon-title" style="font-weight:600">${h.name}</div>
                </div>
                <div style="text-align:right;">
                    <div class="hackathon-status" style="margin-bottom:0.25rem">👥 ${h.participants} participants</div>
                    <div style="font-size:0.85rem;color:#2b8a3e">Joined</div>
                </div>
            </div>
        `;

        // Clicking a joined card opens registration panel
        card.addEventListener('click', function() {
            document.getElementById('p-panel1').style.display = 'none';
            document.getElementById('p-hackathonName').textContent = h.name;
            document.getElementById('p-panel2').style.display = 'block';
        });

        container.appendChild(card);
    });
}

function participantGoBack() {
    document.getElementById('p-panel2').style.display = 'none';
    document.getElementById('p-panel1').style.display = 'block';
    document.getElementById('p-joinStatus').className = 'status status-idle';
}

function participantSubmitTeam(e) {
    e.preventDefault();

    // Simple validation
    const teamName = document.getElementById('p-teamName').value.trim();
    const captainName = document.getElementById('p-captainName').value.trim();

    if (!teamName || !captainName) {
        alert('Team name & captain name required!');
        return;
    }

    // Success!
    document.getElementById('p-panel2').style.display = 'none';
    document.getElementById('p-panel3').style.display = 'block';

    const successMsg = document.getElementById('p-successMsg');
    successMsg.innerHTML = `
        <strong>Hackathon:</strong> ${participantHackathon.name}<br>
        <strong>Team:</strong> ${teamName}<br>
        <strong>Captain:</strong> ${captainName}<br><br>
        <em>✅ Successfully registered!</em>
    `;
}

function participantReset() {
    initParticipantDashboard();
}

// Enter key support
// Targeted Enter-key support (avoid global reset behavior)
// Login inputs: pressing Enter triggers corresponding login
const loginFormsContainer = document.getElementById('loginForms');
if (loginFormsContainer) {
    loginFormsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = input.closest('.login-form');
                if (form) {
                    const role = form.id.replace('Login', '');
                    login(role);
                }
            }
        });
    });
}

// Judge code textarea: Enter submits (without Shift)
const judgeCodeTextarea = document.getElementById('hackathonCodeInput');
if (judgeCodeTextarea) {
    judgeCodeTextarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            joinHackathon();
        }
    });
}
