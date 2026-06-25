// ==========================================
// REGISTER CONTROLLER
// ==========================================

const registerForm = document.querySelector('form');

if (registerForm && window.location.href.includes('register.html')) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        const inputs = document.querySelectorAll('form input');

        const fullName = inputs[2].value;
        const email = inputs[3].value;
        const phone = inputs[4].value;
        const password = inputs[5].value;
        const confirmPassword = inputs[6].value;

        if (!fullName || !email || !password) return;
        if (password !== confirmPassword) return;

        try {
            await AuthModel.register({ nama: fullName, email, password, role: selectedRole });
        } catch (error) {
            // Fallback ke localStorage jika API gagal
            const userAccount = { fullName, email, phone, role: selectedRole };
            localStorage.setItem('currentUser', JSON.stringify(userAccount));
        }

        window.location.href = '../public/login.html';
    });
}
