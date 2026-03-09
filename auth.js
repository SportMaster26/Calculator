// ── SportMaster Authentication System ──
// Roles: operator (full edit access), viewer (read-only)

const AUTH_USERS = [
  // Operator — full edit access
  { username: 'tmahl',    name: 'TJ Mahl',        role: 'operator', password: 'SportMaster2024!' },
  { username: 'kherrin',  name: 'Kevin Herrin',    role: 'operator', password: 'SportMaster2024!' },
  { username: 'floor',    name: 'Floor',           role: 'operator', password: 'Floor2024!' },
  { username: 'platform', name: 'Platform',        role: 'operator', password: 'Platform2024!' },

  // Viewer — read-only access
  { username: 'ajolly',   name: 'AJ Jolly',        role: 'viewer',   password: 'View2024!' },
  { username: 'jeff',     name: 'Jeff Gearheart',   role: 'viewer',   password: 'View2024!' },
  { username: 'dpanyard', name: 'Dave Panyard',     role: 'viewer',   password: 'View2024!' },
  { username: 'hhudak',   name: 'Haley Hudak',      role: 'viewer',   password: 'View2024!' },
  { username: 'lab',      name: 'Lab',              role: 'viewer',   password: 'View2024!' }
];

const AUTH_SESSION_KEY = 'sportmaster_session';

function authGetSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function authSetSession(user) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    username: user.username,
    name: user.name,
    role: user.role,
    loginTime: Date.now()
  }));
}

function authClearSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

function authLogin(username, password) {
  const user = AUTH_USERS.find(u =>
    u.username.toLowerCase() === username.toLowerCase().trim() &&
    u.password === password
  );
  if (!user) return null;
  authSetSession(user);
  return user;
}

function authLogout() {
  authClearSession();
  window.location.href = 'login.html';
}

function authRequire() {
  const session = authGetSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

function authIsOperator(session) { return session && session.role === 'operator'; }
function authIsViewer(session)   { return session && session.role === 'viewer'; }

// Apply role-based restrictions to the calculator page
function authApplyRole(session) {
  if (!session) return;

  // Add user bar
  const bar = document.createElement('div');
  bar.id = 'authBar';
  bar.innerHTML =
    '<span class="auth-user"><strong>' + session.name + '</strong> <span class="auth-role-badge auth-role-' + session.role + '">' + session.role.toUpperCase() + '</span></span>' +
    '<button id="logoutBtn" class="btn-logout">Log Out</button>';
  document.body.insertBefore(bar, document.body.firstChild);
  document.getElementById('logoutBtn').addEventListener('click', authLogout);

  // Viewer restrictions: disable all inputs, selects, buttons (except print & logout)
  if (authIsViewer(session)) {
    document.querySelectorAll('input, select').forEach(function(el) {
      el.disabled = true;
    });
    document.querySelectorAll('button').forEach(function(btn) {
      if (btn.id === 'printMaterialsBtn' || btn.id === 'logoutBtn') return;
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
    // Add viewer notice
    var notice = document.createElement('div');
    notice.className = 'viewer-notice';
    notice.textContent = 'You are logged in as a viewer. The calculator is in read-only mode.';
    var container = document.querySelector('.container');
    if (container) container.insertBefore(notice, container.firstChild.nextSibling);
  }
}
