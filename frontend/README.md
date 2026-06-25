# Frontend EventVendorHub — Struktur MVC

## Struktur Folder

```
frontend/
├── views/                  ← [VIEW] Semua file HTML
│   ├── public/             ← Halaman publik (tidak perlu login)
│   │   ├── index.html
│   │   ├── login.html
│   │   └── register.html
│   ├── admin/              ← Halaman admin portal
│   │   ├── dashboard-admin.html
│   │   ├── verifikasi-vendor.html
│   │   ├── kelola-user.html
│   │   ├── laporan-platform.html
│   │   └── pesanan-masuk.html
│   ├── customer/           ← Halaman customer
│   │   ├── pencarian-vendor.html
│   │   ├── detail-vendor.html
│   │   ├── alur-pemesanan.html
│   │   ├── pembayaran.html
│   │   ├── booking-berhasil.html
│   │   └── pesanan-saya.html
│   └── vendor/             ← Halaman vendor portal
│       ├── vendor-dashboard.html
│       ├── pesanan-masuk.html
│       ├── manajemen-layanan.html
│       ├── analitik-vendor.html
│       └── tambah-paket-baru.html
│
├── models/                 ← [MODEL] Fungsi fetch ke API
│   ├── authModel.js        ← Komunikasi ke auth-service
│   ├── vendorModel.js      ← Komunikasi ke vendor-service & services
│   └── bookingModel.js     ← Komunikasi ke booking-service
│
├── controllers/            ← [CONTROLLER] Logika per halaman
│   ├── auth/
│   │   ├── loginController.js
│   │   └── registerController.js
│   ├── customer/
│   │   ├── detailVendorController.js
│   │   └── customerController.js
│   ├── vendor/
│   │   ├── dashboardController.js
│   │   └── vendorController.js
│   └── admin/
│       └── verifikasiController.js
│
└── assets/                 ← CSS, gambar, font lokal (opsional)
```

## Cara Kerja MVC Frontend

| Layer      | Tanggung Jawab                                         |
|------------|--------------------------------------------------------|
| Model      | Semua komunikasi fetch ke API backend                  |
| View       | HTML murni, tidak ada logika bisnis                    |
| Controller | Handle event DOM, koordinasi Model → update View       |

## Cara Pakai Controller di HTML

```html
<!-- Di bagian akhir <body> -->
<script src="../../models/authModel.js"></script>
<script src="../../controllers/auth/loginController.js"></script>
```

## Entry Point
Buka `views/public/index.html` untuk memulai, atau langsung ke:
- Customer: `views/customer/pencarian-vendor.html`
- Vendor: `views/vendor/vendor-dashboard.html`
- Admin: `views/admin/dashboard-admin.html`
