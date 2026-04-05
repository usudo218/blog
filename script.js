// Konfigurasi Utama
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";
const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra"; // Nama asli dari data sistem Pak Agus

// --- 1. PROTEKSI DOMAIN (ANTI-CLONE) ---
// Memastikan blog hanya berjalan di domain resmi Bapak
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

// --- 2. FUNGSI PROTEKSI ATRIBUSI (FOOTER GUARD) ---
// Mencegah perubahan teks footer melalui Inspect Element
function protectAtribution() {
    const footerText = document.querySelector('.footer-text');
    const expected = `© 2026 Penulis Pemula - Merawat Ingatan`;

    const restore = () => {
        if (footerText && footerText.innerText.trim() !== expected) {
            footerText.innerHTML = `&copy; 2026 Penulis Pemula - Merawat Ingatan`;
        }
    };

    const observer = new MutationObserver(restore);
    if (footerText) {
        observer.observe(footerText, { childList: true, characterData: true, subtree: true });
        restore();
    }
}

// --- 3. FITUR AUTO-ATTRIBUTION COPY-PASTE ---
// Menambahkan jejak link sumber saat tulisan Bapak disalin (Copas)
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    const pagelink = `\n\n========================================\nTulisan ini telah tayang di : ${ORIGINAL_DOMAIN}\nBaca artikel selengkapnya di : ${document.location.href}\n${AUTHOR_NAME}\n========================================`;
    
    const copytext = selection + pagelink;
    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', copytext);
        e.preventDefault();
    }
});

// --- 4. LOGIKA UTAMA BLOG (FETCH & RENDER) ---
async function fetchData() {
    const container = document.getElementById('blog-container');
    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();
        
        allData = rawData.map((post, index) => ({
            ...post,
            originalIndex: index
        }));
        
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (postId !== null) {
            tampilkanDetail(postId);
        } else {
            filteredData = [...allData].reverse();
            renderPosts();
        }
        
        // Aktifkan penjaga footer setelah data dimuat
        protectAtribution();
    } catch (e) {
        if(container) container.innerHTML = '<p class="text-center py-10 font-bold uppercase tracking-widest text-red-500">Gagal memuat catatan.</p>';
    }
}

function renderPosts() {
    const container = document.getElementById('blog-container');
    if(!container) return;
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filteredData.slice(startIndex, endIndex);

    if (paginatedPosts.length === 0) {
        container.innerHTML = '<p class="text-center py-10 italic text-black uppercase tracking-widest text-xs font-bold">Tidak ada catatan ditemukan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        let tgl = post.tanggal || "";
        if (tgl.toString().includes("T") || tgl.toString().includes("-")) {
            tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition mb-6">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori || 'Umum'}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4 leading-tight">
                    <a href="?id=${post.originalIndex}" class="hover:text-blue-700 transition">${post.judul}</a>
                </h3>
                <p class="text-black text-xs font-bold mt-2 uppercase tracking-widest">${tgl}</p>
                <div class="mt-4 text-slate-600 line-clamp-3 text-sm leading-relaxed text-justify">
                    ${(post.konten || '').replace(/<[^>]*>/g, '').substring(0, 200)}...
                </div>
                <a href="?id=${post.originalIndex}" class="inline-block mt-6 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-blue-700 hover:border-blue-700 transition">Baca Selengkapnya →</a>
            </article>
        `;
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / postsPerPage);
    if (totalPages <= 1) return;

    const container = document.getElementById('blog-container');
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'flex justify-center items-center space-x-6 mt-12 mb-10';

    let paginationHtml = '';
    if (currentPage > 1) {
        paginationHtml += `<button onclick="changePage(${currentPage - 1})" class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg hover:scale-105 transition">Prev</button>`;
    } else {
        paginationHtml += `<button disabled class="px-5 py-2 bg-slate-100 text-slate-300 text-[10px] font-black rounded-full uppercase tracking-widest cursor-not-allowed">Prev</button>`;
    }
    paginationHtml += `<span class="text-[11px] font-black uppercase tracking-[0.2em] text-black">Page ${currentPage}/${totalPages}</span>`;
    if (currentPage < totalPages) {
        paginationHtml += `<button onclick="changePage(${currentPage + 1})" class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg hover:scale-105 transition">Next</button>`;
    } else {
        paginationHtml += `<button disabled class="px-5 py-2 bg-slate-100 text-slate-300 text-[10px] font-black rounded-full uppercase tracking-widest cursor-not-allowed">Next</button>`;
    }
    paginationDiv.innerHTML = paginationHtml;
    container.appendChild(paginationDiv);
}

function changePage(page) {
    currentPage = page;
    renderPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterKategori(kat) {
    currentPage = 1;
    if (kat === 'Semua') {
        filteredData = [...allData].reverse();
    } else {
        filteredData = allData.filter(p => (p.kategori || "").toLowerCase() === kat.toLowerCase()).reverse();
    }
    renderPosts();
    const target = document.getElementById('section-title');
    if(target) target.scrollIntoView({ behavior: 'smooth' });
}

function tampilkanDetail(id) {
    const post = allData[id];
    if (!post) return;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');

    let tgl = post.tanggal || "";
    if (tgl.toString().includes("T") || tgl.toString().includes("-")) {
        tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const metaKategori = post.kategori || 'Umum';
    const rawTags = post.tags || '';
    const metaTags = rawTags ? rawTags.split(',').map(t => `#${t.trim()}`).join(' ') : '-';
    
    const headerMeta = `
        <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            TOPIK : <span class="text-black">${metaKategori}</span> | TAGS : <span class="text-black">${metaTags}</span>
        </div>
    `;

    const headerElement = document.querySelector('#view-detail header');
    headerElement.innerHTML = `
        ${headerMeta}
        <h1 id="content-title" class="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter uppercase">${post.judul}</h1>
        <p id="content-date" class="text-black text-xs font-bold mt-3 uppercase tracking-[0.2em]">${tgl}</p>
    `;

    let fullContent = "";

    if (post.gambar && post.gambar.trim() !== "") {
        fullContent += `
            <figure class="mb-8">
                <img src="${post.gambar}" onerror="this.parentElement.style.display='none'" class="w-full h-auto rounded-[2rem] shadow-lg mb-2">
                <figcaption class="text-center text-[11px] italic text-slate-500 font-medium tracking-wide">
                    — ${post.judul} | Karikatur : Penulis Pemula
                </figcaption>
            </figure>
        `;
    }

    fullContent += `<div class="prose prose-slate max-w-none text-justify text-black">${post.konten}</div>`;

    if (post.youtube && post.youtube.trim() !== "") {
        fullContent += `<div class="mt-10 aspect-video rounded-[2rem] overflow-hidden shadow-xl border-4 border-white"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${post.youtube}" frameborder="0" allowfullscreen></iframe></div>`;
    }

    document.getElementById('content-body').innerHTML = fullContent;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function kembaliKeDaftar() { window.location.href = 'index.html'; }

// Jalankan FetchData saat halaman dimuat
window.onload = fetchData;
