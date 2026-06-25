// ==========================================
// AUTH MODEL - Komunikasi ke auth-service
// ==========================================

const AUTH_BASE_URL = 'http://localhost:3000/auth';

const AuthModel = {

    async register({ nama, email, password, role }) {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, password, role })
        });
        if (!response.ok) throw new Error('Registrasi gagal');
        return response.json();
    },

    async login({ email, password }) {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Login gagal, silakan periksa email dan kata sandi Anda.');
        }
        return response.json();
    },

    async getUserById(id) {
        const response = await fetch(`${AUTH_BASE_URL}/users/${id}`);
        if (!response.ok) throw new Error('User tidak ditemukan');
        return response.json();
    }

};
