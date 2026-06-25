// ==========================================
// VENDOR MODEL - Komunikasi ke vendor-service & service data
// ==========================================

const VENDOR_BASE_URL = window.location.origin;

const VendorModel = {

    async getAll() {
        const response = await fetch(`${VENDOR_BASE_URL}/vendors`);
        if (!response.ok) throw new Error('Gagal mengambil data vendor');
        return response.json();
    },

    async getById(id) {
        const response = await fetch(`${VENDOR_BASE_URL}/vendors/${id}`);
        if (!response.ok) throw new Error('Vendor tidak ditemukan');
        return response.json();
    },

    async search(keyword) {
        const response = await fetch(`${VENDOR_BASE_URL}/vendors?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error('Gagal mencari vendor');
        return response.json();
    },

    async getAllServices() {
        const response = await fetch(`${VENDOR_BASE_URL}/services`);
        if (!response.ok) throw new Error('Gagal mengambil data layanan');
        return response.json();
    },

    async getServicesByVendor(id_vendor) {
        const services = await this.getAllServices();
        return services.filter(s => s.id_vendor == id_vendor);
    }

};
