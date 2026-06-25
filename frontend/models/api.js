// ==========================================
// API HELPER - Semua fetch ke protected endpoints
// menggunakan fungsi ini agar token JWT otomatis disertakan
// ==========================================

const API_BASE = window.location.origin;

/**
 * Fetch dengan token JWT otomatis dari localStorage session
 * Drop-in replacement untuk fetch() biasa
 */
async function authFetch(path, options = {}) {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const token   = session.token || '';

    const headers = Object.assign({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }, options.headers || {});

    const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));

    if (res.status === 401) {
        // Token expired atau tidak valid — redirect ke login
        localStorage.removeItem('session');
        window.location.href = getLoginPath();
        throw new Error('Sesi berakhir. Silakan login kembali.');
    }

    return res;
}

/**
 * Hitung path ke login.html relatif dari lokasi file saat ini
 */
function getLoginPath() {
    const path = window.location.pathname;
    if (path.includes('/views/admin/') || path.includes('/views/vendor/') || path.includes('/views/customer/')) {
        return '../public/login.html';
    }
    if (path.includes('/admin/') || path.includes('/vendor/') || path.includes('/customer/')) {
        return '../login.html';
    }
    return '/views/public/login.html';
}

/**
 * GET helper
 */
async function apiGet(path) {
    const res = await authFetch(path);
    if (!res.ok) throw new Error(`GET ${path} gagal (${res.status})`);
    return res.json();
}

/**
 * POST helper
 */
async function apiPost(path, body) {
    const res = await authFetch(path, {
        method: 'POST',
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `POST ${path} gagal`);
    }
    return res.json();
}

/**
 * PATCH helper
 */
async function apiPatch(path, body = {}) {
    const res = await authFetch(path, {
        method: 'PATCH',
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `PATCH ${path} gagal`);
    }
    return res.json();
}
