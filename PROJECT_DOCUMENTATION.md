# Dokumentasi Proyek: StorySight V1
**Platform Pembelajaran Bahasa Inggris Berbasis Cerita Bergambar & Video**

StorySight V1 adalah platform website edukasi interaktif yang dirancang dengan konsep **"Learn English Through Stories"** (Belajar Bahasa Inggris Melalui Cerita). Platform ini membantu siswa meningkatkan kompetensi berbahasa Inggris, meliputi aspek membaca (*reading*), menyimak (*listening*), dan melatih pelafalan (*speaking/speech*) dengan cara yang menyenangkan melalui cerita bergambar, animasi video, kuis pemahaman, dan pelacakan perkembangan belajar yang dipersonalisasi.

---

## 1. Arsitektur & Teknologi Stack (Tech Stack)

Aplikasi StorySight dibangun menggunakan kombinasi teknologi modern berskala industri dengan performa tinggi:

| Komponen | Teknologi yang Digunakan | Penjelasan Fungsional |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 16 (App Router) & React 19 | Mengelola routing, rendering hibrida (Server-side & Client-side Rendering), serta pembuatan endpoint API terpadu (*full-stack*). |
| **Bahasa Pemrograman** | JavaScript (ES6+) | Digunakan pada frontend (React) maupun backend (Next.js API Routes). |
| **Database Engine** | SQLite (local) / PostgreSQL (production) | Database relasional untuk menyimpan data pengguna, riwayat progres kuis, katalog cerita, dan konfigurasi banner. |
| **Object-Relational Mapper** | Prisma ORM | Penghubung database (*schema migration*, *type-safe queries*, dan sinkronisasi data relasional). |
| **Autentikasi Sesi** | JSON Web Token (JWT) via `jose` | Menyimpan sesi otentikasi di dalam cookie aman berjenis *httpOnly* dan *sameSite: lax* untuk menjaga keamanan akun. |
| **Pengamanan Sandi** | `bcryptjs` | Algoritma hashing satu arah berkekuatan tinggi untuk mengamankan password user di database. |
| **Desain & Styling** | Tailwind CSS v4 & Vanilla CSS | Menghasilkan antarmuka pengguna bertema *glassmorphism* modern, dinamis, serta sepenuhnya responsif pada perangkat mobile dan desktop. |
| **Ikonografi** | Lucide React | Pustaka ikon grafis SVG berkualitas tinggi yang ringan dan dapat diatur skalanya. |
| **Penyimpanan Aset** | Cloudflare R2 (Hybrid Mode) | Penyimpanan cloud kompatibel dengan S3 untuk menampung file PDF cerita, video, dan thumbnail secara aman (dengan fallback ke penyimpanan lokal). |
| **Environment Server** | Linux VPS (aaPanel) & PM2 | Mengelola proses server aplikasi Node.js agar tetap menyala 24/7 dan mendeteksi crash secara otomatis. |

---

## 2. Tema Desain UI & Estetika Visual

StorySight V1 menerapkan prinsip desain modern yang sangat premium:
* **Glassmorphic Design:** Penggunaan background transparan berpola blur (`backdrop-blur-xl`), sudut melengkung besar (`rounded-3xl`), dan garis tepi tipis semi-transparan (`border-white/10`) memberikan kesan antarmuka yang bersih, futuristik, dan estetik.
* **Mesh Gradient Background:** Latar belakang dinamis menggunakan gradasi warna pastel ungu lembut, biru malam, dan aksen cahaya redup yang memanjakan mata dan mengurangi kelelahan visual siswa.
* **Responsive Layout:** Penggunaan grid fleksibel (seperti 2 kolom di mobile dan 3 kolom di desktop: `grid-cols-2 lg:grid-cols-3`) memastikan performa visual tetap seimbang dan rapi pada semua ukuran layar.
* **Micro-Animations & Hover Effects:** Efek interaktif tombol yang membesar halus saat disorot (`hover:scale-105`), perubahan warna gradasi yang mulus, serta feedback ketukan di mobile (`active:scale-95`).

---

## 3. Peran Pengguna & Hak Akses (User Roles)

Sistem membedakan akses pengguna berdasarkan 3 peran utama demi menjaga keamanan konten berbayar/privat:

```
[Pengunjung Umum (Guest)] ──► Akses Terbatas (Landing Page, Preview Cerita, Leaderboard Top 3)
         │
         ▼ (Proses Login oleh Admin/Guru)
[Siswa (STUDENT)]         ──► Akses Belajar Penuh (Buku PDF, Video, Kuis, Dashboard, Speech, Leaderboard Top 10)
         │
         ▼
[Guru & Administrator]    ──► Akses Manajemen (CMS Cerita, Kuis, Manajemen Siswa, Statistik & Progres)
```

1. **Guest (Tamu / Umum):**
   * **Bisa:** Membuka Landing Page utama, melihat banner, melihat daftar judul cerita di katalog (level/genre), melihat preview thumbnail gambar cerita, dan masuk (*login*).
   * **Tidak Bisa:** Membuka detail cerita, membaca PDF, memutar video, mengerjakan kuis, membuka dashboard pribadi, dan menggunakan latihan pelafalan (*speech*).
2. **Student (Siswa / Pengguna Utama):**
   * Memiliki semua akses belajar: Membaca PDF, Menonton Video Animasi Cerita, Mengerjakan Kuis Interaktif, Melacak skor & evaluasi jawaban, mengakses Dashboard Siswa, mempraktikkan pengucapan kata di halaman *Speech Practice*, serta melihat Papan Peringkat lengkap.
3. **Superadmin / Teacher (Admin & Guru):**
   * Memiliki akses penuh ke panel manajemen belakang (*Admin Panel*).
   * **Guru (TEACHER):** Hanya dapat mengelola dan memantau siswa yang berasal dari sekolah/kelas yang sama dengan guru tersebut.
   * **Administrator (SUPERADMIN):** Memiliki hak kontrol global atas seluruh pengguna (termasuk guru), spanduk homepage, dan penerbitan cerita baru.

*Catatan: Fitur pendaftaran mandiri (Self-Registration) sengaja dinonaktifkan di V1. Semua akun baru dibuat secara eksklusif oleh Admin/Guru melalui panel admin untuk memastikan data siswa terintegrasi dengan kelas masing-masing.*

---

## 4. Fitur-Fitur Utama Aplikasi (Detailed Features)

### A. Fitur Siswa & Pembelajaran

* **Homepage & Katalog Pintar:**
  * **Spanduk Hero Slider:** Spanduk slide interaktif yang mempromosikan cerita pilihan terbaru atau cerita populer.
  * **Penyaringan Cerita (Filter & Search):** Memudahkan siswa menyortir cerita berdasarkan Tingkat Kesulitan (Level 1 hingga Level 6) serta Genre Cerita (Daily Life, School, Fantasy, Horror, Mystery, dll.).
  * **Kartu Cerita Pintar (Dynamic Story Card):** Kartu cerita dilengkapi status bar progres belajar siswa ("Mulai", "Lanjutkan", atau "Review/Selesai") beserta garis indikator persentase, durasi membaca, level, dan genre cerita.
  * **Papan Peringkat (Leaderboard) Dinamis:** Menampilkan peringkat 10 siswa terbaik berdasarkan perolehan nilai kuis pemahaman dan keaktifan menyelesaikan cerita, dibungkus dalam daftar gulir (*scrollable container*) agar tampilan tetap rapi.
* **Pembaca Buku PDF Cerita (PDF Reader):**
  * Halaman khusus untuk membaca naskah cerita bergambar PDF secara interaktif dengan kontrol navigasi (Halaman Selanjutnya/Sebelumnya, Zoom In, Zoom Out, Mode Layar Penuh/Fullscreen).
  * Sistem mendeteksi aktivitas membaca dan secara otomatis mengirimkan sinyal progres `isPdfRead = true` ke database saat tombol selesai diklik.
* **Pemutar Video Animasi Cerita (Video Player):**
  * Siswa dapat menyimak video animasi atau pembacaan cerita bersuara (*listening mode*).
  * Sistem mendeteksi pemutaran video hingga akhir untuk mengirimkan tanda progres `isVideoWatched = true` ke database.
* **Sistem Kuis Pemahaman Komprehensif (Quiz System):**
  * Lembar ujian interaktif setelah siswa menyelesaikan aktivitas baca & tonton. Mendukung 4 jenis tipe soal:
    1. **Multiple Choice (Pilihan Ganda):** Memilih satu dari beberapa jawaban benar (bisa disertai gambar visual pendukung).
    2. **Fill in the Blank (Isian Rumpang):** Melengkapi kata bahasa Inggris yang kosong dalam kalimat.
    3. **Matching (Mencocokkan):** Menghubungkan kata dalam bahasa Inggris dengan artinya dalam bahasa Indonesia menggunakan pencocokan tombol ketuk yang responsif.
    4. **Flashcard (Kartu Balik):** Kartu interaktif dua sisi untuk menguji ingatan kosakata baru siswa.
  * **Halaman Evaluasi Hasil (Result & Review):** Menghitung nilai akhir secara instan, menampilkan status kelulusan (lulus jika mencapai target skor kelulusan kuis), serta memberikan lembar ulasan jawaban lengkap (menunjukkan jawaban siswa vs jawaban yang benar untuk setiap soal kuis).
* **Dashboard Progres Belajar Siswa (Student Dashboard):**
  * Halaman beranda pribadi siswa untuk melacak:
    * Persentase cerita yang berhasil diselesaikan (*Target Completion*).
    * Nilai rata-rata kuis yang sudah dikerjakan (*Quiz Performance*).
    * Daftar cerita yang sedang aktif dibaca untuk dapat langsung dilanjutkan (*Continue Learning*).
    * Rekomendasi cerita pilihan berdasarkan riwayat belajar siswa.
* **Latihan Pelafalan & Bicara (Speech Practice):**
  * Halaman interaktif di rute `/practice` yang memanfaatkan Web Speech API (pengenal suara browser) untuk mendeteksi kecocokan pengucapan kalimat bahasa Inggris siswa secara langsung menggunakan mikrofon.

---

### B. Fitur Manajemen (Admin & Guru Panel)

* **Dashboard Analitik:**
  * Menampilkan statistik ringkas jumlah total cerita yang diterbitkan, total pengguna terdaftar, serta jumlah pengerjaan kuis yang telah selesai dilakukan oleh siswa.
* **Manajemen Pengguna (User Management):**
  * **Tambah Siswa:** Membuat akun siswa baru dengan mengatur nama, email, password, nama sekolah, kelas, serta masa kedaluwarsa akun (Expires At).
  * **Pemantau Progres Siswa:** Meninjau histori pengerjaan kuis siswa secara rinci (skor kuis, tanggal pengerjaan, jawaban benar/salah).
  * **Edit & Hapus Pengguna:** Mengelola pembaruan profil atau menghapus akun pengguna dari sistem database.
* **Manajemen Cerita (Story CMS):**
  * Membuat cerita baru (*Draft*) atau memperbaruinya (*Published*).
  * Mengunggah aset media (Thumbnail, PDF Buku Cerita, Video Animasi) ke server penyimpanan Cloudflare R2 secara langsung.
  * Mengisi deskripsi cerita, level kesukaran, kategori genre, dan estimasi waktu penyelesaian.
* **Penyusun Kuis (Quiz Builder):**
  * Menyusun butir-butir pertanyaan kuis pemahaman yang terhubung ke cerita tertentu.
  * Mendukung pengaturan jenis soal, skor bobot nilai per butir pertanyaan, pengunggahan gambar visual soal, penentuan opsi jawaban, dan kunci jawaban kuis.
* **Pengelola Spanduk Utama (Carousel Banner Manager):**
  * Menambah, menghapus, atau mengatur urutan slide gambar spanduk iklan/cerita terpopuler yang tampil di halaman depan website.

---

## 5. Rancangan Basis Data (Prisma Schema Relational)

Berikut adalah struktur tabel relasional yang digunakan oleh StorySight dalam Prisma ORM:

```
┌──────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     User     │──────►│UserStoryProgress│◄──────│      Story      │
└──────────────┘       └─────────────────┘       └─────────────────┘
       │                                                  │
       │                                                  ├────────────────┐
       ▼                                                  ▼                ▼
┌──────────────┐                                   ┌──────────────┐ ┌──────────────┐
│ QuizAttempt  │◄──────────────────────────────────│     Quiz     │ │CarouselBanner│
└──────────────┘                                   └──────────────┘ └──────────────┘
       │                                                  │
       ▼                                                  ▼
┌──────────────────┐                               ┌──────────────┐
│QuizAttemptAnswer │                               │ QuizQuestion │
└──────────────────┘                               └──────────────┘
                                                          │
                                            ┌─────────────┴─────────────┐
                                            ▼                           ▼
                                     ┌──────────────┐            ┌──────────────┐
                                     │  QuizOption  │            │  QuizAnswer  │
                                     └──────────────┘            └──────────────┘
```

### Penjelasan Tabel:
1. **`User`**: Menyimpan data identitas profil pengguna, password hash, peran (*role*), sekolah, kelas, dan masa kedaluwarsa akun.
2. **`Story`**: Menyimpan metadata cerita (judul, deskripsi, level, genre, durasi) serta alamat URL file aset (thumbnail, PDF, video) di R2 Storage.
3. **`UserStoryProgress`**: Melacak status keterbacaan PDF (`isPdfRead`), tontonan video (`isVideoWatched`), dan penyelesaian kuis (`isQuizCompleted`) per siswa per cerita.
4. **`Quiz`**: Menampung lembar kuis yang terkait dengan suatu cerita, termasuk nilai batas kelulusan (*passingScore*).
5. **`QuizQuestion`**: Menyimpan data pertanyaan kuis, bobot poin, gambar pertanyaan, serta jenis soal (Pilihan Ganda, Isian, dsb).
6. **`QuizOption` & `QuizAnswer`**: Menyimpan pilihan jawaban alternatif dan jawaban yang benar untuk setiap butir pertanyaan kuis.
7. **`QuizAttempt` & `QuizAttemptAnswer`**: Menyimpan riwayat percobaan kuis siswa, skor nilai total yang didapatkan, status kelulusan, dan rekaman jawaban yang dipilih siswa saat kuis berlangsung.
8. **`CarouselBanner`**: Mengatur urutan penayangan gambar spanduk cerita unggulan di halaman utama.

---

## 6. Alur Keamanan & Perlindungan Rute (Middleware)

Aplikasi memiliki sistem pengaman rute otomatis di file [src/middleware.js](file:///c:/laragon/www/storysight/src/middleware.js) yang memvalidasi otentikasi token JWT cookie pengguna saat berpindah halaman:

* **Rute Publik Tanpa Otentikasi:**
  * Halaman Utama `/` (Landing Page)
  * `/login` (Halaman Masuk)
  * Aset statis (`/_next`, `/favicon.ico`)
  * **Bypass Khusus `/api/files/uploads/thumbnails/`**: Membuka blokir akses cookie untuk file gambar thumbnail cerita di R2 proxy agar pengunjung umum (belum login) tetap dapat melihat gambar katalog cerita di halaman utama tanpa mengalami error *broken link*.
* **Rute Proteksi Siswa (`/dashboard`, `/stories/[slug]`, `/practice`):**
  * Pengguna wajib terautentikasi (mempunyai token session aktif). Jika tidak login, middleware akan otomatis mengarahkan paksa pengguna ke halaman `/login`.
  * Berkas privat R2 `/api/files/uploads/pdfs/` dan `/api/files/uploads/videos/` **wajib** memiliki token login aktif demi mencegah kebocoran materi berbayar/cerita penuh kepada publik.
* **Rute Proteksi Admin/Guru (`/admin/:path*`):**
  * Akses halaman dibatasi ketat. Hanya pengguna dengan peran `SUPERADMIN` atau `TEACHER` yang diperbolehkan masuk. Jika pengguna adalah siswa (`STUDENT`) atau belum login, akses langsung ditolak dan dialihkan ke `/login`.

---

## 7. Panduan Penyebaran Aplikasi (Deployment di VPS aaPanel)

Untuk menerapkan pembaruan terbaru di server VPS linux yang menggunakan kontrol panel aaPanel:

1. **Masuk ke server** menggunakan SSH terminal.
2. Pindah ke direktori root aplikasi di server:
   ```bash
   cd /www/wwwroot/storysight.my.id
   ```
3. Tarik kode pembaruan dari Git:
   ```bash
   git pull origin master
   ```
4. Jalankan penginstalan dependensi (jika ada library tambahan):
   ```bash
   npm install
   ```
5. Bangun ulang file Next.js agar terkompilasi ke dalam mode production:
   ```bash
   npm run build
   ```
6. Jalankan ulang (*Restart*) servis Node.js:
   * **Melalui aaPanel:** Buka menu **Website** -> **Node.js Projects** -> Temukan domain proyek -> Klik **Restart** (atau Stop lalu Start kembali).
   * **Melalui Terminal (PM2):** Jalankan perintah `pm2 restart all` atau `pm2 reload all`.
