// ==========================================
// LOGIN CONTROLLER
// ==========================================

const loginForm = document.querySelector('form');

if (loginForm && window.location.href.includes('login.html')) {

    // Buat elemen error banner dan sisipkan sebelum form
    const errorBanner = document.createElement('div');
    errorBanner.id = 'login-error-banner';
    errorBanner.style.cssText = [
        'display:none',
        'background:#fef2f2',
        'border:1px solid #fecaca',
        'color:#dc2626',
        'border-radius:12px',
        'padding:10px 14px',
        'font-size:12px',
        'font-weight:600',
        'margin-bottom:12px',
        'align-items:center',
        'gap:8px'
    ].join(';');
    errorBanner.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span id="login-error-text">Email atau kata sandi salah.</span>';
    loginForm.insertAdjacentElement('beforebegin', errorBanner);

    function showLoginError(msg) {
        document.getElementById('login-error-text').textContent = msg;
        errorBanner.style.display = 'flex';
    }

    function hideLoginError() {
        errorBanner.style.display = 'none';
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideLoginError();

        const emailInput = loginForm.querySelector('input[type="email"]').value;
        const passwordInput = loginForm.querySelector('input[type="password"]').value;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';
        }

        try {
            const data = await AuthModel.login({ email: emailInput, password: passwordInput });

            localStorage.setItem('session', JSON.stringify({
                token: data.token,
                role: data.user.role,
                nama: data.user.nama,
                id: data.user.id_user,
                isLoggedIn: true
            }));

            // Redirect langsung tanpa alert
            if (data.user.role === 'admin') {
                window.location.href = '../admin/dashboard-admin.html';
            } else if (data.user.role === 'vendor') {
                window.location.href = '../vendor/vendor-dashboard.html';
            } else {
                window.location.href = '../customer/pencarian-vendor.html';
            }
        } catch (error) {
            showLoginError(error.message || 'Email atau kata sandi salah. Silakan coba lagi.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Masuk';
            }
        }
    });

    // Hilangkan error saat user mulai mengetik ulang
    loginForm.querySelectorAll('input').forEach(function(input) {
        input.addEventListener('input', hideLoginError);
    });
}
