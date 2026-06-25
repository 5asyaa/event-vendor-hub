// ==========================================
// VENDOR DASHBOARD CONTROLLER
// ==========================================

document.addEventListener("DOMContentLoaded", async function() {

    const session = JSON.parse(localStorage.getItem('session') || '{}');
    if (!session.isLoggedIn || session.role !== 'vendor') {
        alert("Silakan login sebagai vendor terlebih dahulu!");
        window.location.href = '../../views/public/login.html';
        return;
    }

    try {
        // Cari vendor yang sesuai dengan user yang login
        const vendors = await VendorModel.getAll();
        const currentVendor = vendors.find(v => v.id_user == session.id);

        if (!currentVendor) {
            document.getElementById('welcome-title').innerText = "Selamat datang, Vendor!";
            document.getElementById('welcome-desc').innerText = "Profil vendor Anda belum terdaftar di database.";
            document.getElementById('booking-table-body').innerHTML =
                `<tr><td colspan="4" class="py-4 px-5 text-center text-gray-400">Profil vendor belum ditemukan.</td></tr>`;
            return;
        }

        // Tampilkan info vendor
        document.getElementById('welcome-title').innerText = `Selamat datang kembali, ${currentVendor.nama_usaha}!`;
        document.getElementById('welcome-desc').innerText = `Ini adalah ringkasan performa ${currentVendor.nama_usaha} hari ini.`;
        document.getElementById('stat-rating').innerHTML =
            `${currentVendor.rating_avg || '0.0'}<span class="text-sm font-normal text-gray-400">/5.0</span>`;

        // Ambil layanan milik vendor ini
        const vendorServices = await VendorModel.getServicesByVendor(currentVendor.id_vendor);
        const serviceIds = vendorServices.map(s => s.id_service);

        // Ambil semua booking lalu filter milik vendor ini
        const allBookings = await BookingModel.getAll();
        const vendorBookings = BookingModel.filterByServiceIds(allBookings, serviceIds);

        // Statistik
        document.getElementById('stat-total').innerText = vendorBookings.length.toLocaleString('id-ID');
        document.getElementById('stat-confirmed').innerText =
            vendorBookings.filter(b => b.status === 'confirmed').length.toLocaleString('id-ID');
        document.getElementById('stat-completed').innerText =
            vendorBookings.filter(b => b.status === 'completed').length.toLocaleString('id-ID');

        // Render 5 pesanan terbaru
        const latestBookings = vendorBookings.slice(0, 5);
        const tableBody = document.getElementById('booking-table-body');
        tableBody.innerHTML = "";

        if (latestBookings.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-5 text-center text-gray-400">Belum ada pesanan masuk terbaru.</td></tr>`;
            return;
        }

        for (const booking of latestBookings) {
            const service = vendorServices.find(s => s.id_service == booking.id_service);
            const serviceName = service ? service.nama_paket : `Layanan #${booking.id_service}`;

            let customerName = `Pelanggan #${booking.id_user}`;
            try {
                const userData = await AuthModel.getUserById(booking.id_user);
                customerName = userData.nama || userData.email || customerName;
            } catch(e) {
                console.error("Gagal load detail user:", e);
            }

            const statusMap = {
                confirmed: { cls: "bg-emerald-50 text-emerald-600 border border-emerald-100", label: "Diterima" },
                rejected:  { cls: "bg-red-50 text-red-600 border border-red-100",             label: "Ditolak" },
                completed: { cls: "bg-blue-50 text-blue-600 border border-blue-100",           label: "Selesai" },
                pending:   { cls: "bg-yellow-50 text-yellow-600 border border-yellow-100",     label: "Menunggu Konfirmasi" }
            };
            const { cls, label } = statusMap[booking.status] || {
                cls: "bg-orange-50 text-orange-600 border border-orange-100",
                label: booking.status
            };

            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50/50">
                    <td class="py-4 px-5 font-bold text-slate-900">#ORD-${booking.id_booking}</td>
                    <td class="py-4 px-5">${customerName}</td>
                    <td class="py-4 px-5">${serviceName}</td>
                    <td class="py-4 px-5"><span class="${cls} text-[10px] font-bold px-3 py-1 rounded-full">${label}</span></td>
                </tr>
            `;
        }

    } catch (error) {
        console.error("Gagal memuat data dasbor vendor:", error);
        document.getElementById('welcome-desc').innerText = "Gagal memuat data dari database.";
    }
});
