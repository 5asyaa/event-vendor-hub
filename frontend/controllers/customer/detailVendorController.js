// ==========================================
// DETAIL VENDOR CONTROLLER
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Auth UI ---
    const authContainer = document.getElementById('auth-container');
    let session = null;
    try { session = JSON.parse(localStorage.getItem('session')); } catch(e) {}

    if (session && session.nama) {
        authContainer.innerHTML = `
            <a href="profil.html" class="text-sm font-semibold text-slate-700 hover:text-brand-orange transition flex items-center gap-2">
                <i class="fa-regular fa-circle-user text-xl"></i>
                <span>Hai, ${session.nama.split(' ')[0]}</span>
            </a>
            <button onclick="logout()" class="text-sm font-semibold text-red-500 hover:text-red-700 transition flex items-center gap-1">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </button>
        `;
    }

    // --- Data Vendor & Layanan ---
    const packageSelect = document.getElementById('package-select');
    const priceDisplay = document.getElementById('price-display');
    const packageList = document.getElementById('package-list');
    const vendorId = new URLSearchParams(window.location.search).get("id");

    // Ambil data vendor
    VendorModel.getAll()
        .then(vendors => {
            const vendor = vendors.find(v => v.id_vendor == vendorId);
            if (!vendor) return;

            document.getElementById("vendor-name").textContent = vendor.nama_usaha;
            document.getElementById("vendor-meta").innerHTML =
                `<i class="fa-solid fa-star text-amber-400"></i> ${vendor.rating_avg} • ${vendor.alamat}`;
            document.getElementById("vendor-description").textContent = vendor.deskripsi;
        });

    // Ambil data layanan/paket
    VendorModel.getServicesByVendor(vendorId)
        .then(services => {
            packageList.innerHTML = "";
            packageSelect.innerHTML = "";

            services.forEach(service => {
                packageSelect.innerHTML += `
                    <option value="${service.harga}" data-id="${service.id_service}">
                        ${service.nama_paket}
                    </option>
                `;

                const fiturList = service.fitur ? service.fitur.split(',') : [];
                const fiturHtml = fiturList.map(f => `<div>✓ ${f.trim()}</div>`).join('');

                packageList.innerHTML += `
                    <div class="bg-white p-5 rounded-2xl border border-gray-200">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">${service.level_paket}</span>
                                <h4 class="font-bold text-lg text-slate-900 mt-3">${service.nama_paket}</h4>
                                <p class="text-gray-500 text-sm mt-2">${service.deskripsi_layanan}</p>
                            </div>
                            <span class="text-xl font-extrabold text-slate-900">
                                Rp ${Number(service.harga).toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div class="mt-4 space-y-2 text-sm text-gray-600">${fiturHtml}</div>
                    </div>
                `;
            });

            if (services.length > 0) {
                priceDisplay.textContent = new Intl.NumberFormat("id-ID", {
                    style: "currency", currency: "IDR", minimumFractionDigits: 0
                }).format(services[0].harga);
            }
        });

    // Update harga saat paket berubah
    packageSelect.addEventListener('change', function() {
        priceDisplay.textContent = new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(Number(this.value));
    });
});

function logout() {
    localStorage.removeItem('session');
    window.location.reload();
}

function handleBooking() {
    const packageSelect = document.getElementById("package-select");
    const vendorId = new URLSearchParams(window.location.search).get("id");

    let session = null;
    try { session = JSON.parse(localStorage.getItem('session')); } catch(e) {}

    if (!session || (!session.token && !session.isLoggedIn)) {
        window.location.href = '../../views/public/login.html';
        return;
    }

    const selectedOption = packageSelect.options[packageSelect.selectedIndex];

    const checkoutData = {
        id_vendor: vendorId,
        id_service: selectedOption.dataset.id,
        nama_vendor: document.getElementById("vendor-name").textContent,
        nama_paket: selectedOption.text,
        harga: Number(selectedOption.value)
    };

    localStorage.setItem("activeCheckout", JSON.stringify(checkoutData));
    window.location.href = "alur-pemesanan.html";
}
