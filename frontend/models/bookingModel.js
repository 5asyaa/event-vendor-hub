// ==========================================
// BOOKING MODEL - Komunikasi ke booking-service
// ==========================================

const BOOKING_BASE_URL = 'http://localhost:3000';

const BookingModel = {

    async getAll() {
        const response = await fetch(`${BOOKING_BASE_URL}/bookings`);
        if (!response.ok) throw new Error('Gagal mengambil data booking');
        return response.json();
    },

    async getById(id) {
        const response = await fetch(`${BOOKING_BASE_URL}/bookings/${id}`);
        if (!response.ok) throw new Error('Booking tidak ditemukan');
        return response.json();
    },

    async create(data) {
        const response = await fetch(`${BOOKING_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal membuat booking');
        return response.json();
    },

    async confirm(id) {
        const response = await fetch(`${BOOKING_BASE_URL}/bookings/${id}/confirm`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Gagal mengkonfirmasi booking');
        return response.json();
    },

    async reject(id) {
        const response = await fetch(`${BOOKING_BASE_URL}/bookings/${id}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Gagal menolak booking');
        return response.json();
    },

    async updatePaymentStatus(id, status_pembayaran) {
        const response = await fetch(`${BOOKING_BASE_URL}/bookings/${id}/payment-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_pembayaran })
        });
        if (!response.ok) throw new Error('Gagal memperbarui status pembayaran');
        return response.json();
    },

    filterByServiceIds(bookings, serviceIds) {
        return bookings.filter(b => serviceIds.includes(b.id_service));
    }

};
