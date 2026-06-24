# Panduan Deployment ke Railway

## Yang Anda butuhkan
- Akun GitHub (gratis) → https://github.com
- Akun Railway (gratis) → https://railway.app (login pakai GitHub)

---

## LANGKAH 1 — Export Database Lokal (Laragon)

Anda perlu export semua database MySQL lokal ke file .sql

### Cara 1 — Via phpMyAdmin (paling mudah):
1. Buka Laragon → klik tombol **Database** (atau buka http://localhost/phpmyadmin)
2. Pilih database `auth_db` di panel kiri
3. Klik tab **Export** di atas → format **SQL** → klik **Go**
4. Simpan file, misal `auth_db.sql`
5. **Ulangi untuk semua database:**
   - `vendor_db`
   - `booking_db`
   - `payment_db`
   - `review_db`

### Cara 2 — Via Terminal Laragon (lebih cepat, export semua sekaligus):
1. Buka Laragon → klik **Terminal**
2. Jalankan perintah ini satu per satu:

```bash
mysqldump -u root auth_db > auth_db.sql
mysqldump -u root vendor_db > vendor_db.sql
mysqldump -u root booking_db > booking_db.sql
mysqldump -u root payment_db > payment_db.sql
mysqldump -u root review_db > review_db.sql
```

3. File .sql tersimpan di folder aktif terminal

> **Catatan:** Kalau MySQL Laragon pakai password, tambahkan `-p` setelah `-u root`
> Contoh: `mysqldump -u root -p auth_db > auth_db.sql`

---

## LANGKAH 2 — Push ke GitHub

Buka terminal di folder `E bisnis`, jalankan:

```bash
git init
git add .
git commit -m "initial commit"
```

Kemudian buat repository baru di GitHub (https://github.com/new), lalu:

```bash
git remote add origin https://github.com/USERNAME/NAMA_REPO.git
git push -u origin main
```

---

## LANGKAH 3 — Setup Railway

1. Login ke https://railway.app dengan akun GitHub
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo yang baru Anda push

### Buat MySQL Database di Railway:
1. Di dashboard project, klik **+ New** → **Database** → **MySQL**
2. Tunggu sampai selesai dibuat
3. Klik database tersebut → tab **Connect** → copy **MySQL Public URL**
   Format: `mysql://root:PASSWORD@HOST:PORT/railway`
4. Catat: HOST, PORT, PASSWORD dari URL tersebut

### Import database ke Railway MySQL:
Anda bisa pakai MySQL Workbench atau TablePlus untuk connect ke Railway MySQL:
- Host: (dari URL Railway)
- Port: (dari URL Railway)
- User: root
- Password: (dari URL Railway)

Kemudian import file .sql yang sudah di-export di Langkah 1.
Buat database terpisah: `auth_db`, `vendor_db`, `booking_db`, `payment_db`, `review_db`

---

## LANGKAH 4 — Deploy Tiap Service

Di Railway, untuk tiap service (buat 6 service terpisah):

1. Klik **+ New** → **GitHub Repo** → pilih repo Anda
2. Set **Root Directory** ke folder service, misal: `microservices/auth-service`
3. Di tab **Variables**, tambahkan environment variables (lihat `.env.example` di tiap folder)
4. Isi nilai DB_HOST, DB_PASSWORD, dll dari koneksi MySQL Railway di Langkah 3

### Urutan deploy yang benar:
1. `auth-service` (port 3001)
2. `vendor-service` (port 3002)
3. `booking-service` (port 3003)
4. `payment-service` (port 3004)
5. `review-service` (port 3005)
6. `api-gateway` (port 3000) ← deploy TERAKHIR

---

## LANGKAH 5 — Update API Gateway

Setelah semua service di-deploy, Railway akan memberi URL untuk tiap service.
Contoh: `https://auth-service-xxxx.railway.app`

Update environment variables di **api-gateway** service:

```
AUTH_URL=https://auth-service-xxxx.railway.app
VENDOR_URL=https://vendor-service-xxxx.railway.app
BOOKING_URL=https://booking-service-xxxx.railway.app
PAYMENT_URL=https://payment-service-xxxx.railway.app
REVIEW_URL=https://review-service-xxxx.railway.app
```

Dan update `api-gateway/server.js` untuk pakai env variable (lihat catatan di bawah).

---

## LANGKAH 6 — Update api-gateway/server.js

Ganti semua `http://localhost:PORT` di server.js dengan environment variable:

```javascript
// Ganti ini:
target: "http://localhost:3001"

// Menjadi ini:
target: process.env.AUTH_URL || "http://localhost:3001"
```

Lakukan untuk semua service (3001-3005).

---

## LANGKAH 7 — Selesai

URL aplikasi Anda adalah URL dari **api-gateway** service di Railway.
Contoh: `https://api-gateway-xxxx.railway.app`

---

## Catatan Penting

- File `.env` TIDAK ikut ke GitHub (sudah di .gitignore) — aman
- Xendit key untuk production perlu diganti ke key production (bukan development)
- Free tier Railway: 500 jam/bulan, cukup untuk demo/testing
