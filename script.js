// 1. GANTI DENGAN URL WEB APP ANDA (Link dari Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec"; 

let dataBlog = []; // Variabel global untuk menyimpan data sementara

/**
 * FUNGSI: Mengambil data dari Spreadsheet (API)
 */
async function ambilData() {
    const container = document.getElementById('blog-container');
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Simpan data ke variabel global dan urutkan dari yang terbaru (paling bawah di Sheets jadi paling atas)
        dataBlog = data.reverse(); 

        renderDaftar(); // Jalankan fungsi untuk menampilkan daftar artikel
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `
            <div class="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-200 text-center">
                <h4 class="font-bold text-lg mb-2">Gagal Memuat Blog</h4>
                <p>Pastikan URL Apps Script benar dan akses sudah diset ke 'Anyone'.</p>
            </div>`;
    }
}

/**
 * FUNGSI: Menampilkan daftar artikel (Halaman Utama)
 */
function renderDaftar() {
    const container = document.getElementById('blog-container');
    const viewList = document.getElementById('view-list');
    const viewDetail = document.getElementById('view-detail');

    container.innerHTML = ''; // Bersihkan loading
    
    // Pastikan halaman awal adalah daftar
    viewList.classList.remove('hidden');
    viewDetail.classList.add('hidden');

    dataBlog.forEach((post, index) => {
        // Ambil 150 karakter pertama untuk ringkasan (Read More)
        const ringkasan = post.konten ? post.konten.substring(0, 150) + "..." : "";
        
        const card = `
            <article class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition duration-300">
                <span class="text-blue-600 text-xs font-bold uppercase tracking-widest">${post.tanggal || 'Baru'}</span>
                
                <h3 onclick="bacaLengkap(${index})" class="text-2xl font-bold text-slate-900 mt-2 mb-3 leading-tight hover:text-blue-700 cursor-pointer transition">
                    ${post.judul}
                </h3>
                
                <p class="text-slate-600 leading-relaxed">${ringkasan}</p>
                
                <button onclick="bacaLengkap(${index})" class="mt-6 inline-flex items-center text-blue-600 font-bold hover:text-blue-800 group">
                    Baca Selanjutnya 
                    <svg class="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                </button>
            </article>
        `;
        container.innerHTML += card;
    });
}

/**
 * FUNGSI: Menampilkan isi artikel secara utuh (Halaman Detail)
 */
function bacaLengkap(index) {
    const post = dataBlog[index]; // Mengambil data artikel
    const viewList = document.getElementById('view-list');
    const viewDetail = document.getElementById('view-detail');
    
    // 1. Masukkan Judul dan Tanggal
    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = post.tanggal;
    
    // 2. LOGIKA GAMBAR (Pastikan header di Sheets tulisannya 'gambar')
    let linkFoto = post.gambar ? post.gambar.trim() : "";
    let htmlGambar = "";

    if (linkFoto !== "") {
        htmlGambar = `
            <div class="mb-8 flex justify-center">
                <img src="${linkFoto}" 
                     class="w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200"
                     onerror="this.parentElement.innerHTML='<p class=\'text-xs text-red-400 italic text-center\'>Gambar tidak dapat dimuat. Pastikan izin share Google Drive sudah Anyone with the link.</p>'">
            </div>`;
    }

    // 3. Format Konten (Enter jadi Baris Baru)
    const kontenFormat = post.konten ? post.konten.replace(/\n/g, "<br>") : "";
    
    // 4. GABUNGKAN GAMBAR + KONTEN ke dalam elemen id="content-body"
    document.getElementById('content-body').innerHTML = htmlGambar + kontenFormat;

    // 5. Tukar Tampilan
    viewList.classList.add('hidden');
    viewDetail.classList.remove('hidden');
    
    // Scroll ke atas otomatis agar nyaman dibaca
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * FUNGSI: Kembali ke daftar artikel
 */
function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// JALANKAN: Ambil data dari Sheets saat web pertama kali dibuka
window.onload = ambilData;
