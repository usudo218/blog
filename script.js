const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";

let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3; 

// Fitur Atribusi Copy-Paste
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const plainText = selection.toString();
    const attribution = `\n\n========================================\nTulisan ini telah tayang di : ${ORIGINAL_DOMAIN}\nBaca artikel selengkapnya di : ${document.location.href}\n${AUTHOR_NAME}\n========================================`;
    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', plainText + attribution);
        e.preventDefault();
    }
});

// FUNGSI UTAMA: Ambil Data dengan Caching 10 Menit
async function fetchData() {
    const container = document.getElementById('blog-container');
    const cacheKey = 'blog_data_cache';
    const cacheTimeKey = 'blog_data_time';
    const currentTime = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;

    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    // Jika ada cache dan belum basi (kurang dari 10 menit)
    if (cachedData && cachedTime && (currentTime - cachedTime < tenMinutes)) {
        console.log("Memuat dari Cache...");
        prosesData(JSON.parse(cachedData));
    } else {
        try {
            console.log("Mengambil data baru dari server...");
            const response = await fetch(API_URL);
            const rawData = await response.json();
            
            // Simpan ke Cache
            localStorage.setItem(cacheKey, JSON.stringify(rawData));
            localStorage.setItem(cacheTimeKey, currentTime.toString());
            
            prosesData(rawData);
        } catch (e) {
            container.innerHTML = '<p class="text-center py-10 font-bold text-red-500">Gagal memuat catatan.</p>';
        }
    }
}

function prosesData(rawData) {
    allData = rawData.map((post, index) => ({ ...post, originalIndex: index }));
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId !== null) {
        tampilkanDetail(postId);
    } else {
        filteredData = [...allData].reverse();
        renderPosts();
    }
}

function renderPosts() {
    const container = document.getElementById('blog-container');
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filteredData.slice(startIndex, startIndex + postsPerPage);

    if (paginatedPosts.length === 0) {
        container.innerHTML = '<p class="text-center py-10 italic text-xs font-bold">Tidak ada catatan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        let tgl = formatTanggal(post.tanggal);
        const kategoriTampil = post.kategori || 'Umum';

        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 py-1 rounded-full">${kategoriTampil}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4 leading-tight">
                    <a href="?id=${post.originalIndex}" class="hover:text-blue-700 transition">${post.judul}</a>
                </h3>
                <p class="text-black text-xs font-bold mt-2 uppercase tracking-widest">${tgl}</p>
                <div class="mt-4 text-slate-600 line-clamp-3 text-sm leading-relaxed text-justify">
                    ${(post.konten || '').replace(/<[^>]*>/g, '').substring(0, 150)}...
                </div>
                <a href="?id=${post.originalIndex}" class="inline-block mt-6 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-blue-700 transition">Baca Selengkapnya →</a>
            </article>
        `;
    });
    renderPagination();
}

function tampilkanDetail(id) {
    const post = allData[id];
    if (!post) return;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');

    let tgl = formatTanggal(post.tanggal);
    const metaKategori = post.kategori || 'Umum';
    const metaTags = post.tags ? post.tags.split(',').map(t => `#${t.trim()}`).join(' ') : '-';
    
    const headerElement = document.querySelector('#view-detail header');
    headerElement.innerHTML = `
        <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            TOPIK : <span class="text-black">${metaKategori}</span> | TAGS : <span class="text-black">${metaTags}</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter uppercase">${post.judul}</h1>
        <p class="text-black text-xs font-bold mt-3 uppercase tracking-[0.2em]">${tgl}</p>
    `;

    let fullContent = "";
    if (post.gambar) {
        // Optimasi: Menambahkan loading="lazy" agar gambar tidak menghambat teks
        fullContent += `
            <figure class="mb-8">
                <img src="${post.gambar}" loading="lazy" class="w-full h-auto rounded-[2rem] shadow-lg mb-2">
                <figcaption class="text-center text-[11px] italic text-slate-500 font-medium">— ${post.judul} | Karikatur : Penulis Pemula</figcaption>
            </figure>
        `;
    }

    fullContent += `<div class="prose prose-slate max-w-none text-justify text-black">${post.konten}</div>`;

    if (post.youtube) {
        let videoSrc = post.youtube.length > 15 ? `https://drive.google.com/file/d/${post.youtube}/preview` : `https://www.youtube.com/embed/${post.youtube}`;
        fullContent += `<div class="mt-10 aspect-video rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
            <iframe loading="lazy" class="w-full h-full" src="${videoSrc}" frameborder="0" allowfullscreen></iframe>
        </div>`;
    }

    document.getElementById('content-body').innerHTML = fullContent;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatTanggal(tglRaw) {
    if (!tglRaw) return "";
    return new Date(tglRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / postsPerPage);
    if (totalPages <= 1) return;
    const container = document.getElementById('blog-container');
    const div = document.createElement('div');
    div.className = 'flex justify-center items-center space-x-6 mt-12 mb-10';
    div.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Prev</button>
        <span class="text-[11px] font-black uppercase text-black">Page ${currentPage}/${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Next</button>
    `;
    container.appendChild(div);
}

function changePage(page) { currentPage = page; renderPosts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function filterKategori(kat) { 
    currentPage = 1; 
    filteredData = kat === 'Semua' ? [...allData].reverse() : allData.filter(p => (p.kategori || "").toLowerCase() === kat.toLowerCase()).reverse();
    renderPosts(); 
}
function kembaliKeDaftar() { window.location.href = 'index.html'; }
document.addEventListener('DOMContentLoaded', fetchData);
