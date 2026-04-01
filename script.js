// 1. GANTI DENGAN URL WEB APP ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbxmTs1IwzKO5yirj2zN3IIGSMl1UzuBaNnsSHaJ__yhqzlMPAgCuslCL92G1Zuw5AjBrw/exec"; 

let dataBlog = []; // Variabel global untuk menyimpan data

// Fungsi mengambil data dari Google Sheets
async function ambilData() {
    const container = document.getElementById('blog-container');
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Simpan data ke variabel global dan balik urutan (terbaru di atas)
        dataBlog = data.reverse(); 

        renderDaftar(); // Tampilkan daftar artikel
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<p class='text-red-500 text-center'>Gagal memuat data. Periksa URL API Anda.</p>";
    }
}

// Fungsi menampilkan daftar artikel di halaman utama
function renderDaftar() {
    const container = document.getElementById('blog-container');
    const viewList = document.getElementById('view-list');
    const viewDetail = document.getElementById('view-detail');

    container.innerHTML = ''; // Bersihkan tulisan "loading"
    
    // Pastikan kita berada di tampilan daftar
    viewList.classList.remove('hidden');
    viewDetail.classList.add('hidden');

    dataBlog.forEach((post, index) => {
        const ringkasan = post.konten.substring(0, 150) + "...";
        
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

// Fungsi menampilkan isi artikel secara utuh
function bacaLengkap(index) {
    const post = dataBlog[index];
    
    const viewList = document.getElementById('view-list');
    const viewDetail = document.getElementById('view-detail');
    
    // Isi konten ke halaman detail
    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = post.tanggal;
    
    // Ubah enter (\n) menjadi baris baru (<br>)
    const kontenFormat = post.konten.replace(/\n/g, "<br>");
    document.getElementById('content-body').innerHTML = kontenFormat;

    // Tukar tampilan
    viewList.classList.add('hidden');
    viewDetail.classList.remove('hidden');

    // Scroll ke atas otomatis
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fungsi tombol kembali
function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Jalankan fungsi saat web dibuka
window.onload = ambilData;
