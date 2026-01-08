// Test credentials
const credentials = {
    judge: { username: 'judge123', password: 'password' },
    participant: { username: 'participant1', password: 'password' },
    admin: { username: 'admin', password: 'password' }
};

let currentRole = '';
let currentHackathon = null;
const sampleHackathons = [
    { code: 'HACK2026-JUDGE-XYZ123', name: 'AI/ML Innovation Challenge', participants: 12 },
    { code: 'H4CK4TH0N-V3R5ION-ABC789', name: 'Web3 Hackathon 2026', participants: 15 },
    { code: 'M0B1L3-4PPSPR1NT-DEF456', name: 'Mobile App Sprint', participants: 8 }
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
        populateHackathonList();
    }
}

function joinHackathon() {
    const codeInput = document.getElementById('hackathonCodeInput').value.trim();
    const btn = document.getElementById('joinBtn');
    
    if (!codeInput) {
        alert('Please paste a hackathon code!');
        return;
    }

    // Find matching hackathon
    const hackathon = sampleHackathons.find(h => 
        h.code.toLowerCase() === codeInput.toLowerCase()
    );

    if (hackathon) {
        currentHackathon = hackathon;
        btn.textContent = '✅ Connected!';
        btn.classList.add('connected');
        document.getElementById('connectionStatus').innerHTML = '🟢 Connected';
        
        // Show current hackathon info
        document.getElementById('currentHackathonName').textContent = hackathon.name;
        document.getElementById('currentHackathonInfo').style.display = 'block';
        
        // Update list
        populateHackathonList();
        
        // Copy code to display
        document.getElementById('hackathonCodeInput').style.height = '120px';
    } else {
        alert('Invalid hackathon code! Try:\nHACK2026-JUDGE-XYZ123\nH4CK4TH0N-V3R5ION-ABC789\nM0B1L3-4PPSPR1NT-DEF456');
    }
}

function populateHackathonList() {
    const listContainer = document.getElementById('hackathonList');
    listContainer.innerHTML = '';

    sampleHackathons.forEach(hackathon => {
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

// Allow Enter key for login and join
document.addEventListener('keypress', function(e) {
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
