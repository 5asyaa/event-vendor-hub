// ==========================================
// ADMIN - VERIFIKASI VENDOR CONTROLLER
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    const btnVerifikasi = document.querySelectorAll('button');

    btnVerifikasi.forEach(button => {
        if (button.innerText.includes('Memeriksa')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const cardApplicant = button.closest('.grid');
                const vendorName = cardApplicant.querySelector('h3').innerText;

                const konfirmasi = confirm(`Apakah Anda yakin ingin MENYETUJUI verifikasi pendaftaran berkas untuk "${vendorName}"?`);
                if (konfirmasi) {
                    alert(`Vendor "${vendorName}" telah BERHASIL disetujui untuk tayang di platform EventVendorHub!`);
                    cardApplicant.remove();
                }
            });
        }

        if (button.innerText.includes('Menolak')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const cardApplicant = button.closest('.grid');
                const vendorName = cardApplicant.querySelector('h3').innerText;

                const alasan = prompt(`Masukkan alasan penolakan berkas untuk "${vendorName}":`);
                if (alasan !== null) {
                    alert(`Pendaftaran "${vendorName}" telah DITOLAK. Alasan: ${alasan || 'Berkas tidak valid'}`);
                    cardApplicant.remove();
                }
            });
        }
    });
});
