// ==========================================
// CUSTOMER CONTROLLER
// ==========================================

function eksekusiPembayaran() {
    let daftarPesananGlobal = JSON.parse(localStorage.getItem('database_pesanan')) || [];

    let pesananBaru = {
        id_pesanan: "#ORD-2026-" + Math.floor(1000 + Math.random() * 9000),
        pelanggan: "Ahmad Wijaya",
        layanan: "Catering 500 Pax - Premium",
        tanggal_acara: "12 Des 2026",
        status: "Menunggu Konfirmasi",
        harga: "Rp 15.450.000"
    };

    daftarPesananGlobal.push(pesananBaru);
    localStorage.setItem('database_pesanan', JSON.stringify(daftarPesananGlobal));

    window.location.href = 'booking-berhasil.html';
}
