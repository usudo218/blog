// Ganti dengan URL dari Deployment Google Apps Script Anda
const API_URL = "https://script.google.com/macros/s/AKfycbxmTs1IwzKO5yirj2zN3IIGSMl1UzuBaNnsSHaJ__yhqzlMPAgCuslCL92G1Zuw5AjBrw/exec"; 

let listArtikel = []; // Tempat menyimpan data agar tidak fetch ulang

async function loadBlog() {
    const container = document.getElementById('blog-container');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal fetch data");
        
        const data = await response.json();
        
        // Simpan ke variabel global dan balik urutan (terbaru di atas)
        listArtikel = data.reverse(); 

        container.innerHTML = ''; // Kosongkan loading

        listArtikel.forEach((post, index) => {
            // Ringkasan: ambil 160 karakter pertama
            const ringkasan = post.konten.length > 160 
                ? post.konten.substring(0, 160) + "..." 
                : post.konten;

            const card = `
                <article class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                    <span class="text-blue-600 text-xs font-bold uppercase tracking-widest">${post.tanggal || 'Baru'}</span>
                    <h3 class="text-2xl font-bold text-gray-800 mt-2 mb-3 leading-tight">${post.judul}</h3>
                    <p class="text-gray-600 leading-relaxed">${ringkasan}</p>
                    <button onclick="bacaLengkap(${index})" class="mt-6 inline-flex items-center text-blue-600 font-bold hover:text-blue-800 group">
                        Baca Selengkapnya 
                        <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 5l7 7-7 7"></path></svg>
                    </button>
                </article>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-center">
                Gagal memuat artikel. Pastikan URL Apps Script benar dan akses sudah disetel ke 'Anyone'.
            </div>`;
    }
}

// Fungsi membuka Modal
function bacaLengkap(index) {
    const post = listArtikel[index];
    const modal = document.getElementById('article-modal');
    
    document.getElementById('modal-title').innerText = post.judul;
    document.getElementById('modal-date').innerText = post.tanggal;
    
    // Mengubah enter (\n) menjadi <br> agar paragraf dari Word tetap terjaga
    const kontenTerformat = post.konten.replace(/\n/g, "<br>");
    document.getElementById('modal-body').innerHTML = kontenTerformat;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Kunci scroll layar utama
}

// Fungsi menutup Modal
function tutupArtikel() {
    const modal = document.getElementById('article-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Aktifkan kembali scroll
}

// Jalankan fungsi saat halaman siap
document.addEventListener('DOMContentLoaded', loadBlog);
