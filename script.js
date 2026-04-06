// Konfigurasi Utama
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";
const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra";

// --- 1. PROTEKSI DOMAIN ---
if (window.location.hostname !== ORIGINAL_DOMAIN && 
    window.location.hostname !== "asalnulis.web.id" && 
    window.location.hostname !== "localhost" && 
    window.location.hostname !== "127.0.0.1") {
    alert("Konten ini milik Penulis Pemula. Anda akan dialihkan ke situs resmi.");
    window.location.href = "https://" + ORIGINAL_DOMAIN;
}

let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3; 

// --- 2. PROTEKSI ATRIBUSI FOOTER ---
function protectAtribution() {
    const footerText = document.querySelector('.footer-text');
    const expected = `© 2026 Penulis Pemula - Merawat Ingatan`;
    if (!footerText) return;

    const restore = () => {
        if (footerText.innerText.trim() !== expected) {
            footerText.innerHTML = `&copy; 2026 Penulis Pemula - Merawat Ingatan`;
        }
    };
    const observer = new MutationObserver(restore);
    observer.observe(footerText, { childList: true, characterData: true, subtree: true });
    restore();
}

// --- 3. FITUR AUTO-ATTRIBUTION COPAS ---
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const plainText = selection.toString();
    const attributionText = `\n\n========================================\nTulisan ini telah tayang di : ${ORIGINAL_DOMAIN}\nBaca artikel selengkapnya di : ${document.location.href}\n${AUTHOR_NAME}\n========================================`;
    
    const htmlContent = `<div>${plainText.replace(/\n/g, '<br>')}</div><br>` +
                        `========================================<br>` +
                        `Tulisan ini telah tayang di : <a href="https://${ORIGINAL_DOMAIN}">${ORIGINAL_DOMAIN}</a><br>` +
                        `Baca artikel selengkapnya di : <a href="${document.location.href}">${document.location.href}</a><br>` +
                        `${AUTHOR_NAME}<br>` +
                        `========================================`;

    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', plainText + attributionText);
        e.clipboardData.setData('text/html', htmlContent);
        e.preventDefault();
    }
});

// --- 4. LOGIKA UTAMA ---
async function fetchData() {
    const container = document.getElementById('blog-container');
    try {
        const response = await fetch(API_URL);
        allData = await response.json();
        
        // Map index asli untuk keperluan navigasi detail
        allData = allData.map((post, index) => ({ ...post, originalIndex: index }));
        
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (postId !== null && allData[postId]) {
            tampilkanDetail(postId);
        } else {
            filteredData = [...allData].reverse();
            renderPosts();
        }
        protectAtribution();
    } catch (e) {
        console.error("Fetch Error:", e);
        if (container) container.innerHTML = '<p class="text-center py-10 text-red-500">Gagal memuat data.</p>';
    }
}

function renderPosts() {
    const container = document.getElementById('blog-container');
    if (!container) return;
    
    container.innerHTML = '';
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filteredData.slice(startIndex, endIndex);

    if (paginatedPosts.length === 0) {
        container.innerHTML = '<p class="text-center py-10">Tidak ada catatan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        let tgl = post.tanggal || "";
        if (tgl.toString().includes("-") || tgl.toString().includes("T")) {
            tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                <span class="text-[10px] font-black uppercase tracking-widest text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori || 'Umum'}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4"><a href="?id=${post.originalIndex}">${post.judul}</a></h3>
                <p class="text-xs font-bold mt-2 uppercase">${tgl}</p>
                <div class="mt-4 text-slate-600 line-clamp-3 text-sm">${(post.konten || '').replace(/<[^>]*>/g, '').substring(0, 200)}...</div>
                <a href="?id=${post.originalIndex}" class="inline-block mt-6 text-xs font-black uppercase border-b-2 border-black">Baca Selengkapnya →</a>
            </article>`;
    });
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / postsPerPage);
    const container = document.getElementById('blog-container');
    if (totalPages <= 1 || !container) return;

    const div = document.createElement('div');
    div.className = 'flex justify-center items-center space-x-6 mt-10';
    div.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-4 py-2 bg-black text-white rounded-full text-[10px]">Prev</button>
        <span class="text-[11px] font-bold">Page ${currentPage}/${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-4 py-2 bg-black text-white rounded-full text-[10px]">Next</button>`;
    container.appendChild(div);
}

function changePage(p) { currentPage = p; renderPosts(); window.scrollTo(0,0); }

function tampilkanDetail(id) {
    const post = allData[id];
    const viewList = document.getElementById('view-list');
    const viewDetail = document.getElementById('view-detail');
    const contentBody = document.getElementById('content-body');
    const header = document.querySelector('#view-detail header');

    if (viewList) viewList.classList.add('hidden');
    if (viewDetail) viewDetail.classList.remove('hidden');

    let tgl = post.tanggal || "";
    if (tgl.toString().includes("-")) tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (header) {
        header.innerHTML = `
            <div class="text-[10px] font-black uppercase text-slate-500 mb-2">TOPIK : ${post.kategori || 'Umum'}</div>
            <h1 class="text-3xl font-black uppercase">${post.judul}</h1>
            <p class="text-xs font-bold mt-2">${tgl}</p>`;
    }

    let html = post.gambar ? `<figure class="mb-8"><img src="${post.gambar}" class="w-full rounded-[2rem] shadow-lg"><figcaption class="text-center text-[10px] italic mt-2">— ${post.judul}</figcaption></figure>` : "";
    html += `<div class="prose max-w-none text-justify">${post.konten}</div>`;
    if (post.youtube) html += `<div class="mt-10 aspect-video rounded-[2rem] overflow-hidden"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${post.youtube}" frameborder="0" allowfullscreen></iframe></div>`;

    if (contentBody) contentBody.innerHTML = html;
    window.scrollTo(0,0);
}

function filterKategori(k) {
    currentPage = 1;
    filteredData = k === 'Semua' ? [...allData].reverse() : allData.filter(p => (p.kategori || "").toLowerCase() === k.toLowerCase()).reverse();
    renderPosts();
}

// Inisialisasi Akhir
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});
