# 🌲 99 Nights in the Forest - Calculator

[![GitHub stars](https://img.shields.io/github/stars/ESTAS-crypto/Calcu-99-Nights-in-the-Forest?style=for-the-badge)](https://github.com/ESTAS-crypto/Calcu-99-Nights-in-the-Forest/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ESTAS-crypto/Calcu-99-Nights-in-the-Forest?style=for-the-badge)](https://github.com/ESTAS-crypto/Calcu-99-Nights-in-the-Forest/network/members)
[![GitHub issues](https://img.shields.io/github/issues/ESTAS-crypto/Calcu-99-Nights-in-the-Forest?style=for-the-badge)](https://github.com/ESTAS-crypto/Calcu-99-Nights-in-the-Forest/issues)
[![GitHub license](https://img.shields.io/github/license/ESTAS-crypto/Calcu-99-Nights-in-the-Forest?style=for-the-badge)](./LICENSE)

Kalkulator interaktif untuk menghitung langkah, pola angka cantik, dan optimasi konfigurasi dalam permainan **99 Nights in the Forest**.  
Web ini dibuat menggunakan **HTML, CSS, dan JavaScript murni** tanpa framework tambahan.

---

## ✨ Fitur Utama

- ⚙️ **Konfigurasi Dinamis**
  - Input jumlah `children` (0–4)
  - Input jumlah `beds` (0–4)
  - Input `current day` dan `target day`
  - Batas pencarian (`max steps`) fleksibel

- 🧮 **Perhitungan Reachability**
  - Mengecek apakah `target day (T)` bisa dicapai dari `current day (D)`
  - Menampilkan langkah (`n`), formula, dan estimasi waktu (`jam/menit/detik`)
  - Menampilkan *nearest above* / *nearest below* bila target tidak persis tercapai

- 🔍 **Pencarian Angka Cantik**
  - Pola bawaan:
    - Digit Sama (1111, 2222)
    - Urut Naik / Turun (1234, 4321)
    - Palindrom (1221, 1331)
    - Alternating (1212, 2121)
    - Double-Double (1122, 3344)
    - Triple Pattern (111222)
    - Step Pattern (1357, 2468)
    - Mirror Pairs (1221, 2112)
    - Repeating Pairs (1313, 2424)
    - Fibonacci-like (1123, 2358)
    - Round Numbers (1000, 5000)
    - Century Numbers (1900, 2000)
    - Lucky Numbers (777, 888)
  - Dukungan **Custom Regex Pattern**

- ⚡ **Optimasi Konfigurasi**
  - Cari kombinasi `children` dan `beds` terbaik
  - Menampilkan top-10 konfigurasi optimal untuk mencapai target atau menemukan angka cantik terdekat

- 🎨 **UI/UX**
  - Tema hutan malam dengan efek animasi
  - Responsif (mobile-friendly)
  - Highlight interaktif saat input berubah
  - Modal untuk menampilkan detail pola & sequence

- ⌨️ **Keyboard Shortcuts**
  - `Ctrl + Enter` → Hitung Reachability
  - `Ctrl + F` → Cari Angka Cantik
  - `Ctrl + O` → Optimasi Konfigurasi

---

## 🚀 Cara Menjalankan

1. Clone repository:
   ```bash
   git clone https://github.com/ESTAS-crypto/Calcu-99-Nights-in-the-Forest.git
Buka folder project:

bash
Salin kode
cd Calcu-99-Nights-in-the-Forest
Jalankan langsung dengan membuka index.html di browser.

Tidak perlu server khusus, karena semua logic berjalan di sisi client (JavaScript murni).

📂 Struktur Project
bash
Salin kode
Calcu-99-Nights-in-the-Forest/

│── index.html   # Halaman utama

│── style.css    # Styling (tema hutan malam)

│── script.js    # Logic kalkulasi & pola angka

└── README.md    # Dokumentasi

<img width="787" height="902" alt="image" src="https://github.com/user-attachments/assets/1f754ee3-e377-4ca0-ae0e-50b7199ca662" />

Tampilan
Header: Judul dengan tema hutan 🌲

Input Section: Form konfigurasi dan tombol aksi

Status Section: Menampilkan effective step & formula

Results Section: Hasil perhitungan

Pattern Section: Angka cantik yang ditemukan

Optimization Section: Saran konfigurasi optimal

Examples Section: Contoh preset & pola angka cantik


🌲 Temukan angka cantik dalam perjalanan 99 Nights in the Forest! 🌲
