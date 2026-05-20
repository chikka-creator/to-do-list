# 🚀 Panduan Deployment Taskly (Laravel + Next.js)

Project ini terdiri dari dua bagian: Backend (Laravel) dan Frontend (Next.js). Keduanya akan dideploy ke Vercel.

## 🛠 1. Persiapan Database
Project ini menggunakan PostgreSQL (Supabase). Pastikan database Anda sudah siap dan migrasi sudah dijalankan.

## 🌐 2. Deploy Backend (Laravel) ke Vercel

1. **Buat Project Baru di Vercel**:
   - Import repository GitHub Anda.
   - Set **Root Directory** ke `.` (akar project).
   - Framework Preset: `Other`.
2. **Konfigurasi Environment Variables**:
   - Masukkan semua variabel dari `.env.example` ke dashboard Vercel.
   - **PENTING**: 
     - `APP_ENV=production`
     - `APP_DEBUG=false`
     - `LOG_CHANNEL=stderr` (Agar log muncul di console Vercel)
     - `SESSION_DRIVER=database` & `CACHE_STORE=database` (Vercel read-only)
3. **Deploy**: Klik Deploy. Setelah selesai, Anda akan mendapatkan URL (contoh: `https://taskly-api.vercel.app`).

## 🎨 3. Deploy Frontend (Next.js) ke Vercel

1. **Buat Project Baru di Vercel**:
   - Import repository GitHub yang sama.
   - Set **Root Directory** ke `frontend`.
   - Framework Preset: `Next.js`.
2. **Konfigurasi Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Masukkan URL Backend yang didapat dari langkah sebelumnya (contoh: `https://taskly-api.vercel.app/api`).
3. **Deploy**: Klik Deploy.

## ⚠️ Catatan Penting untuk Serverless (Vercel)
- **Read-Only Filesystem**: Laravel tidak bisa menulis file ke `storage/`. Oleh karena itu, session, cache, dan logs harus diarahkan ke database atau stderr.
- **Cold Starts**: Request pertama setelah beberapa waktu tidak aktif mungkin terasa lambat.
- **Database Connection**: Pastikan Supabase mengizinkan koneksi dari IP Vercel (biasanya sudah otomatis jika menggunakan connection string yang tepat).

## ✅ Checklist Akhir
- [ ] Backend berhasil dideploy & URL didapat.
- [ ] Environment Variables Backend sudah benar.
- [ ] Frontend berhasil dideploy dengan `NEXT_PUBLIC_API_URL` yang benar.
- [ ] Coba register & login di production.
