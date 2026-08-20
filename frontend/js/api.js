const API_BASE = '/api';
function getToken() { return localStorage.getItem('token'); }
function getRole() { return localStorage.getItem('role'); }
function getDisplayName() { return localStorage.getItem('displayName'); }
function setSession(token, role, displayName) {
    localStorage.setItem('token', token); localStorage.setItem('role', role); localStorage.setItem('displayName', displayName);
}
function clearSession() { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('displayName'); }

async function apiFetch(path, options = {}) {
    const headers = options.headers || {};
    if (options.body) headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_BASE + path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
}

function renderNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const role = getRole();
    let links = `<a href="/index.html" class="brand" style="font-weight:700;background:var(--gradient);-webkit-background-clip:text;background-clip:text;color:transparent;padding-left:0">▶ VideoShare</a>`;
    links += `<a href="/index.html">Dashboard</a> <a href="/browse.html">Browse</a>`;
    if (role === 'creator') links += ` <a href="/upload.html">Upload</a>`;
    if (role) {
        links += ` <span>Hi, ${getDisplayName()} (${role})</span> <a href="#" id="logoutLink">Log out</a>`;
    } else {
        links += ` <a href="/login.html">Log in</a> <a href="/signup.html">Sign up</a>`;
    }
    nav.innerHTML = links;
    const logout = document.getElementById('logoutLink');
    if (logout) logout.onclick = (e) => { e.preventDefault(); clearSession(); location.href = '/index.html'; };
}

function skeletonGrid(count = 6) {
    return `<div class="grid">${Array.from({ length: count }, () => `
        <div class="card skeleton-card">
            <div class="thumb skeleton-shimmer"></div>
            <div class="body">
                <div class="skeleton-line skeleton-shimmer"></div>
                <div class="skeleton-line short skeleton-shimmer"></div>
            </div>
        </div>`).join('')}</div>`;
}