# 🌲 Calcu-99-Nights-in-the-Forest

Kalkulator berbasis web untuk game **99 Nights in the Forest** yang membantu pemain menghitung potensi hari (day) dan angka-angka “cantik” yang bisa dicapai berdasarkan sistem multiplier kasur.

---

## 🧮 Fitur Utama

- Input **day sekarang**  
- Pilihan **base step** (default 9)  
- Pilihan **multiplier** (jumlah kasur aktif: 1–9)  
- Simulasi **cabut kasur** (mengurangi multiplier)  
- Perhitungan apakah **target day** bisa dicapai persis  
- Pencarian **angka cantik** yang bisa dicapai:  
  - Digit berulang (111, 2222, …)  
  - Palindrom (121, 1331, …)  
  - Round (1000, 2000, …)  
  - Pola custom via regex  
- Menyalin hasil ke **clipboard**  
- Export hasil ke **CSV**  
- Preset contoh untuk percobaan cepat  

---

## 🖥 Cara Menjalankan

1. **Clone** repositori ini  
   ```bash
   git clone https://github.com/ESTAS-crypto/Calcu-99-Nights-in-the-Forest.git
Buka file index.html di browser

Masukkan nilai day sekarang, pilih base step, atur jumlah kasur (multiplier)

Klik tombol Hitung → hasil akan tampil otomatis

🔍 Contoh Perhitungan
Sekarang	Base Step	Multiplier	Step Efektif	Contoh Angka Cantik Terdekat
99	9	2	18	117, 333, 999
190	9	1	9	999, 1111, …
1141	9	1	9	(angka cantik di atas 1141 yang (a - 1141) % 9 == 0)

📸 Screenshot
<img width="1226" height="927" alt="image" src="https://github.com/user-attachments/assets/e5be3e6d-ffc3-4683-b863-7137b066d415" />


🗂 Struktur Project
bash
Salin kode
.

├── index.html        # File utama, sudah menyertakan HTML, CSS & JS

├── style.css         # (opsional, jika kamu pisah CSS)

└── script.js         # (opsional, jika kamu pisah JS)
📝 Catatan & Tips
Pencarian angka cantik dibatasi maxSearch untuk menjaga performa

Jika target day tidak bisa dicapai persis, aplikasi akan menunjukkan langkah minimum (k_min) dan overshoot

Saat multiplier tinggi (step_eff besar), gap antara angka cantik mungkin besar — coba turunkan multiplier agar lebih fleksibel

🛡 Lisensi
Lisensi: MIT License

🤝 Kontribusi
Jika kamu menemukan bug atau ide fitur baru, silakan:

Fork repo ini

Buat branch fitur baru (git checkout -b fitur-baru)

Commit perubahan (git commit -m "Menambahkan fitur …")

Push ke branch kamu (git push origin fitur-baru)

Buka Pull Request

📬 Kontak
Repo ini dikelola oleh ESTAS-crypto.
Jika ada pertanyaan atau saran, silakan buka issue di GitHub atau kontak lewat profil.

yaml
Salin kode

---

Kalau kamu mau, saya bisa bantu sisipkan juga badge (misalnya build status, license, stars) dan screenshot di README agar makin menarik. Mau saya kirim versi README dengan badge & screenshot template juga?
::contentReference[oaicite:0]{index=0}
