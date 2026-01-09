// Test credentials
const credentials = {
    judge: { username: 'judge123', password: 'password' },
    participant: { username: 'participant1', password: 'password' },
    admin: { username: 'admin', password: 'password' }
};

let currentRole = '';
let currentHackathon = null;
let participantHackathon = null;

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
    }
}

// ======================================
// JUDGE FUNCTIONS (Your existing ones)
function joinHackathon() {
    const codeInput = document.getElementById('hackathonCodeInput').value.trim();
    const btn = document.getElementById('joinBtn');

    if (!codeInput) {
        alert('Please paste a hackathon code!');
        return;
    }

    const hackathon = judgeHackathons.find(h =>
        h.code.toLowerCase() === codeInput.toLowerCase()
    );

    if (hackathon) {
        currentHackathon = hackathon;
        btn.textContent = '✅ Connected!';
        btn.classList.add('connected');
        document.getElementById('connectionStatus').innerHTML = '🟢 Connected';

        document.getElementById('currentHackathonName').textContent = hackathon.name;
        document.getElementById('currentHackathonInfo').style.display = 'block';

        populateJudgeHackathonList();

        document.getElementById('hackathonCodeInput').style.height = '120px';
    } else {
        alert('Invalid hackathon code! Try:\nHACK2026-JUDGE-XYZ123\nH4CK4TH0N-V3R5ION-ABC789\nM0B1L3-4PPSPR1NT-DEF456');
    }
}

function populateJudgeHackathonList() {
    const listContainer = document.getElementById('hackathonList');
    listContainer.innerHTML = '';

    judgeHackathons.forEach(hackathon => {
        const isCurrent = currentHackathon && currentHackathon.code === hackathon.code;
        const isConnected = currentHackathon === hackathon;

        const card = document.createElement('div');
        card.className = `hackathon-card ${isCurrent ? 'current' : ''}`;
        card.innerHTML = `
            <div class="hackathon-title">${hackathon.name}</div>
            <div class="hackathon-status ${isConnected ? 'status-connected' : 'status-disconnected'}">
                ${isConnected ? '✅ Active Session' : '🔌 Join to Connect'}
            </div>
            <div class="hackathon-status status-participants">
                👥 ${hackathon.participants} participants
            </div>
            <div class="code-display">
                📋 Code: ${hackathon.code}
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// ======================================
// PARTICIPANT FUNCTIONS (NEW!)
function initParticipantDashboard() {
    // Create participant content dynamically
    const participantDash = document.getElementById('participantDashboard');
    participantDash.innerHTML = `
        <div class="dashboard-header">
            <h1>👨‍💻 Participant Dashboard</h1>
            <p>Join hackathon & register team</p>
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
                    <button type="button" class="login-btn back-btn" onclick="participantGoBack()" style="width: auto;">← Back</button>
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
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.login-form.active');
        if (activeForm) {
            const role = activeForm.id.replace('Login', '');
            login(role);
        } else if (document.getElementById('judgeDashboard').classList.contains('active')) {
            joinHackathon();
        }
    }
});
