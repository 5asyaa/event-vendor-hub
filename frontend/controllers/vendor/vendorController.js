// ==========================================
// VENDOR PESANAN MASUK CONTROLLER
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    const tabelBody = document.querySelector('table tbody');
    let daftarPesananGlobal = JSON.parse(localStorage.getItem('database_pesanan')) || [];

    if (daftarPesananGlobal.length > 0 && tabelBody) {
        tabelBody.innerHTML = "";

        daftarPesananGlobal.forEach(order => {
            tabelBody.innerHTML += `
                <tr class="hover:bg-gray-50/50">
                    <td class="py-4 px-5 text-slate-900 font-bold">${order.id_pesanan}</td>
                    <td class="py-4 px-5">${order.pelanggan}</td>
                    <td class="py-4 px-5">${order.layanan}</td>
                    <td class="py-4 px-5 text-gray-500">${order.tanggal_acara}</td>
                    <td class="py-4 px-5">
                        <span class="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full">
                            ${order.status}
                        </span>
                    </td>
                    <td class="py-4 px-5 text-right">
                        <button class="bg-[#0a1120] text-white text-[11px] font-semibold px-4 py-2 rounded-lg">Review</button>
                    </td>
                </tr>
            `;
        });
    }
});
