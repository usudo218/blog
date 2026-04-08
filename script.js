const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";
let allPosts = [];

async function fetchData() {
    const container = document.getElementById('blog-container');
    try {
        const response = await fetch(API_URL);
        allPosts = await response.json();
        // Urutkan dari yang terbaru (asumsi baris terakhir di spreadsheet adalah terbaru)
        displayPosts(allPosts.reverse());
        
        // Cek jika ada ID di URL untuk langsung buka detail
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        if (postId !== null) tampilkanDetail(parseInt(postId));
        
    } catch (error) {
        container.innerHTML = '<p class="text-center py-20 font-bold text-red-500">Gagal memuat catatan. Silakan refresh kembali.</p>';
    }
}

function displayPosts(posts) {
    const container = document.getElementById('blog-container');
    container.innerHTML = '';

    posts.forEach((post, index) => {
        // Gunakan index asli dari data (karena sudah di-reverse, kita cari index aslinya)
        const originalIndex = allPosts.length - 1 - index;
        
        const card = `
            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group cursor-pointer" onclick="tampilkanDetail(${originalIndex})">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-black transition">${post.kategori || 'Catatan'}</span>
                <h3 class="text-2xl font-black mt-2 mb-4 group-hover:translate-x-2 transition-transform duration-300">${post.judul}</h3>
                <p class="text-slate-500 text-sm mb-6 line-clamp-3">${post.konten.replace(/<[^>]*>/g, '')}</p>
                <div class="flex justify-between items-center border-t border-slate-50 pt-6">
                    <span class="text-xs font-bold text-slate-400 italic">${post.tanggal}</span>
                    <span class="text-xs font-black uppercase tracking-widest group-hover:underline">Baca Selengkapnya →</span>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

function tampilkanDetail(id) {
    const post = allPosts[id];
    if (!post) return;

    document.getElementById('view-list').classList.add('hidden');
    const detailView = document.getElementById('view-detail');
    detailView.classList.remove('hidden');

    // Update Header & Konten
    const header = detailView.querySelector('header');
    header.innerHTML = `
        <span class="text-xs font-black uppercase tracking-[0.3em] text-slate-400">${post.kategori}</span>
        <h2 class="text-4xl font-black mt-4 mb-4 tracking-tighter leading-tight">${post.judul}</h2>
        <p class="text-sm font-bold italic text-slate-400">Diterbitkan pada ${post.tanggal}</p>
    `;

    document.getElementById('content-body').innerHTML = post.konten;
    
    // Scroll ke atas
    window.scrollTo(0, 0);

    // LOGIKA UNTUK CUSDIS AGAR UNIK PER POSTINGAN
    const thread = document.getElementById('cusdis_thread');
    if (thread) {
        thread.setAttribute('data-page-id', id); // Gunakan ID unik dari index spreadsheet
        thread.setAttribute('data-page-url', window.location.origin + window.location.pathname + "?id=" + id);
        thread.setAttribute('data-page-title', post.judul);
        
        // Memuat ulang kolom komentar Cusdis untuk artikel ini
        if (window.CUSDIS) {
            window.CUSDIS.initial();
        }
    }
    
    // Update URL tanpa reload
    const newUrl = window.location.pathname + '?id=' + id;
    window.history.pushState({id: id}, '', newUrl);
}

function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    window.history.pushState({}, '', window.location.pathname);
}

function filterKategori(kat) {
    const filtered = kat === 'Semua' ? allPosts : allPosts.filter(p => p.kategori === kat);
    displayPosts(filtered);
    document.getElementById('section-title').innerText = kat;
    kembaliKeDaftar();
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', fetchData);
