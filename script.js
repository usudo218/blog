// Ganti dengan URL dari Deployment Google Apps Script Anda (WAJIB)
const API_URL = "https://script.google.com/macros/s/AKfycbxmTs1IwzKO5yirj2zN3IIGSMl1UzuBaNnsSHaJ__yhqzlMPAgCuslCL92G1Zuw5AjBrw/exec"; 

let listArtikelRaw = []; // Penyimpanan sementara data mentah
let viewMode = 'list'; // Status tampilan saat ini: 'list' atau 'detail'

// Elemen-elemen HTML yang sering digunakan
const viewList = document.getElementById('view-list');
const viewDetail = document.getElementById('view-detail');
const containerList = document.getElementById('blog-container');

// Fungsi Utama: Mengambil data dari Sheets dan menampilkannya sebagai daftar
async function initBlog() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal terhubung ke data.");
        
        // Simpan data mentah, urutkan dari yang terbaru (bawah ke atas di Sheets)
        listArtikelRaw = await response.json();
        listArtikelRaw.reverse(); 

        renderDaftarArtikel(); // Tampilkan daftar pertama kali

    } catch (error) {
        console.error(error);
        containerList.innerHTML = `
            <div class="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-200 text-center">
                <h4 class="font-bold text-lg mb-2">Gagal Memuat Blog</h4>
                <p>Pastikan URL Apps Script di script.js sudah benar, dan izin akses Web App sudah diset ke 'Anyone'.</p>
                <p class="text-xs mt-3 text-red-500">Error: ${error.message}</p>
            </div>`;
    }
}

// Menampilkan semua artikel dalam bentuk kartu ringkas (Card)
function renderDaftarArtikel() {
    containerList.innerHTML = ''; // Kosongkan loading/isi lama

    listArtikelRaw.forEach((post, index) => {
        // Tampilkan 180 karakter pertama untuk ringkasan
        const ringkasan = post.konten.length > 180 
            ? post.konten.substring(0, 180) + "..." 
            : post.konten;

        const htmlCard = `
            <article class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition duration-300 transform hover:-translate-y-1">
                <span class="text-blue-600 text-xs font-bold uppercase tracking-widest">${post.tanggal || 'Terbaru'}</span>
                <h3 onclick="bacaLengkap(${index})" class="text-2xl font-bold text-slate-900 mt-2 mb-3 leading-tight hover:text-blue-700 cursor-pointer transition">
                    ${post.judul}
                </h3>
                <p class="text-slate-600 leading-relaxed text-base">${ringkasan}</p>
                <button onclick="bacaLengkap(${index})" class="mt-6 inline-flex items-center text-blue-600 font-bold hover:text-blue-800 group">
                    Baca Selanjutnya 
                    <svg class="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </article>
        `;
        containerList.innerHTML += htmlCard;
    });
}

// === FUNGSI PERALIHAN TAMPILAN === //

// 1. Menampilkan Halaman Detail Artikel
function bacaLengkap(index) {
    const post = listArtikelRaw[index];
    
    // Isi konten detail
    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = post.tanggal;
    
    // Format penting: Mengubah enter (\n) dari Word/Sheets menjadi <br>
    // agar paragraf tidak menyatu jadi satu teks panjang
    const kontenFormatHTML = post.konten.replace(/\n/g, "<br>");
    document.getElementById('content-body').innerHTML = kontenFormatHTML;

    // Sembunyikan daftar, tampilkan detail
    viewList.classList.add('hidden');
    viewDetail.classList.remove('hidden');
    
    // Scroll otomatis ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Menutup Detail dan kembali ke Daftar
function kembaliKeDaftar() {
    viewDetail.classList.add('hidden');
    viewList.classList.remove('hidden');
}

// Jalankan initBlog saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', initBlog);
