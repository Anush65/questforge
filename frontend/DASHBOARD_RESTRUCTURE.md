# QuestForge Frontend Restructure - Separate Role Dashboards

## Overview
The frontend has been restructured to provide separate, dedicated webpages for each role (Judge, Participant, Admin) instead of showing all content in a single unified dashboard.

## New Architecture

### File Structure
```
frontend/
├── main.html                 # Landing page with role selection
├── judge-dashboard.html      # Judge-specific dashboard page
├── participant-dashboard.html # Participant-specific dashboard page
├── admin-dashboard.html      # Admin-specific dashboard page
├── script.js                 # Shared utilities & core functions
├── judge-dashboard.js        # Judge-specific logic
├── participant-dashboard.js  # Participant-specific logic
├── admin-dashboard.js        # Admin-specific logic
├── style.css                 # Shared styling
└── [other assets]
```

## User Flow

### Before (Old Flow)
1. Landing page → 3 role cards
2. Click role → Login page (shared)
3. Enter credentials → Single unified dashboard (switched content based on role)

### After (New Flow)
1. Landing page → 3 role cards
2. Click role → Login page (shared, shows role-specific title)
3. Enter credentials → **Redirect to role-specific dashboard page**
   - Judge → `judge-dashboard.html`
   - Participant → `participant-dashboard.html`
   - Admin → `admin-dashboard.html`

## Key Changes

### 1. Login Redirect (script.js - handleLogin)
After successful authentication, the system now:
- Stores user data in `localStorage` under key `currentUser`
- Redirects to the appropriate dashboard page based on user role
- Delayed redirect (500ms) to allow toast notification to display

```javascript
// Redirect to appropriate dashboard based on role
const dashboardMap = {
    'judge': 'judge-dashboard.html',
    'participant': 'participant-dashboard.html',
    'admin': 'admin-dashboard.html'
};

const targetPage = dashboardMap[data.role];
window.location.href = targetPage;
```

### 2. Each Dashboard Page
Each role-specific HTML file includes:
- Role-specific header title
- Dedicated dashboard content container
- Role-specific modals (e.g., Evaluation Modal for Judges)
- Logout button that clears localStorage and returns to main.html

### 3. Role-Specific JavaScript Files
Each role has its own JS file that:
- Initializes on page load via `DOMContentLoaded` event
- Checks localStorage for logged-in user
- Verifies user has correct role (prevents URL hacking)
- Redirects to main.html if not authenticated or wrong role
- Initializes the appropriate dashboard rendering function

#### judge-dashboard.js
```javascript
async function initializeJudgeDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'judge') redirect to main.html
    await renderJudgeDashboard(container);
}
```

#### participant-dashboard.js
```javascript
async function initializeParticipantDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'participant') redirect to main.html
    await renderParticipantDashboard(container);
}
```

#### admin-dashboard.js
```javascript
async function initializeAdminDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') redirect to main.html
    await renderAdminDashboard(container);
}
```

### 4. Shared Rendering Functions (script.js)
The following functions remain in script.js and are available to all dashboard pages:
- `renderJudgeDashboard(container)` - Judge-specific UI
- `renderParticipantDashboard(container)` - Participant-specific UI
- `renderAdminDashboard(container)` - Admin-specific UI
- Helper functions: `joinHackathon()`, `submitGrade()`, etc.

### 5. Logout Functionality
Each role-specific JS file includes a `handleLogout()` function that:
```javascript
function handleLogout() {
    if (confirm('TERMINATE_SESSION_CONFIRM')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'main.html';
    }
}
```

## Security Considerations

✅ **URL Protection**: Direct navigation to `judge-dashboard.html` without proper login redirects to main.html
✅ **Role Verification**: Each dashboard page verifies the user has the correct role
✅ **Session Storage**: User data stored in localStorage for page persistence
✅ **Session Termination**: Logout clears localStorage completely

## How to Test

1. **Start the app**: Open `main.html` in browser
2. **Select a role**: Click on Judge, Participant, or Admin card
3. **Login**: Enter credentials
4. **Verify redirect**: Should land on appropriate dashboard page
5. **Test URL hack**: Try navigating directly to `judge-dashboard.html` → should redirect to main.html
6. **Logout**: Click TERMINATE_SESSION → returns to main.html

## Example Credentials
```
Judge:       username: judge123     password: password
Participant: username: participant1  password: password
Admin:       username: admin        password: password
```

## API Endpoints Used
All dashboard pages use these endpoints from the backend:
- `/auth/login` - Authentication
- `/hackathons/` - Hackathon management
- `/hackathons/code/{code}` - Join hackathon
- `/submissions/` - Submission handling
- `/evaluations/` - Judge evaluations
- `/teams/` - Team information
- `/teams/register` - Team registration

## Browser Compatibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses localStorage for session persistence
- Uses ES6+ JavaScript features

## Future Enhancements
- Add session timeout/auto-logout after inactivity
- Add persistent token authentication (vs localStorage)
- Add role-based permission middleware
- Add "back" navigation without losing data
- Add breadcrumbs/navigation history

---

**Last Updated**: January 12, 2026
