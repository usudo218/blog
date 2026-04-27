const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";

let allData = [];
let filteredData = [];
let currentPage = 1;

// Logika dinamis: 8 post untuk layar kecil (2 kolom), 9 post untuk layar besar (3 kolom)
function getPostsPerPage() {
    return window.innerWidth < 1024 ? 8 : 9;
}

let postsPerPage = getPostsPerPage();

// Update jumlah post jika layar di-resize (misal: rotasi HP)
window.addEventListener('resize', () => {
    const newLimit = getPostsPerPage();
    if (newLimit !== postsPerPage) {
        postsPerPage = newLimit;
        renderPosts();
    }
});

// Fitur Atribusi Copy-Paste
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const urlLengkap = document.location.href;
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
        container.appendChild(selection.getRangeAt(i).cloneContents());
    }

    const attributionHTML = `
        <div style="line-height: 1.2; margin-top: 20px;">
            ========================================<br>
            Tulisan ini telah tayang di : <a href="https://${ORIGINAL_DOMAIN}">${ORIGINAL_DOMAIN}</a><br>
            Baca artikel selengkapnya di : <a href="${urlLengkap}">${urlLengkap}</a><br>
            <b>${AUTHOR_NAME}</b><br>
            ========================================
        </div>
    `;

    const finalHTML = container.innerHTML + attributionHTML;
    const finalPlain = selection.toString() + `\n\n========================================\nTulisan ini telah tayang di : ${ORIGINAL_DOMAIN}\nBaca artikel selengkapnya di : ${urlLengkap}\n${AUTHOR_NAME}\n========================================`;

    if (e.clipboardData) {
        e.clipboardData.setData('text/html', finalHTML);
        e.clipboardData.setData('text/plain', finalPlain);
        e.preventDefault();
    }
});

// Fetch Data
async function fetchData() {
    const container = document.getElementById('blog-container');
    const cacheKey = 'blog_data_cache';
    const cacheTimeKey = 'blog_data_time';
    const currentTime = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000; 

    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedData && cachedTime && (currentTime - cachedTime < fiveMinutes)) {
        prosesData(JSON.parse(cachedData));
    } else {
        try {
            const response = await fetch(`${API_URL}?t=${currentTime}`);
            const rawData = await response.json();
            localStorage.setItem(cacheKey, JSON.stringify(rawData));
            localStorage.setItem(cacheTimeKey, currentTime.toString());
            prosesData(rawData);
        } catch (e) {
            container.innerHTML = '<p class="col-span-full text-center py-10 font-bold text-red-500">Gagal memuat catatan.</p>';
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

// Render Post dengan Tampilan Grid Instagram
function renderPosts() {
    const container = document.getElementById('blog-container');
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filteredData.slice(startIndex, startIndex + postsPerPage);

    if (paginatedPosts.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-10 italic text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada rasan-rasan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        const thumbUrl = post.gambar || `https://via.placeholder.com/500x500/f1f5f9/64748b?text=${encodeURIComponent(post.judul)}`;
        
        container.innerHTML += `
            <div class="group relative aspect-square overflow-hidden bg-slate-200 rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100" 
                 onclick="location.href='?id=${post.originalIndex}'">
                
                <img src="${thumbUrl}" alt="${post.judul}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out">
                
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                    <span class="text-[9px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">${post.kategori || 'Catatan'}</span>
                    <h3 class="text-white text-xs md:text-sm font-black leading-tight uppercase tracking-tight line-clamp-2">
                        ${post.judul}
                    </h3>
                    <div class="mt-3 w-8 h-0.5 bg-white/50"></div>
                </div>
            </div>
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
        fullContent += `
            <figure class="mb-8 flex flex-col items-center">
                <img src="${post.gambar}" loading="lazy" class="w-full md:w-3/4 h-auto rounded-[1.5rem] shadow-md border border-slate-200 mb-2 object-cover">
                <figcaption class="text-center text-[10px] italic text-slate-400 font-medium tracking-tight">— ${post.judul}</figcaption>
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
    if (totalPages <= 1) {
        const oldPagination = document.getElementById('pagination-nav');
        if (oldPagination) oldPagination.remove();
        return;
    }
    
    const viewList = document.getElementById('view-list');
    const oldPagination = document.getElementById('pagination-nav');
    if (oldPagination) oldPagination.remove();

    const nav = document.createElement('div');
    nav.id = 'pagination-nav';
    nav.className = 'flex justify-center items-center space-x-6 mt-12 mb-10';
    nav.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest disabled:opacity-20 transition hover:bg-slate-800">Prev</button>
        <span class="text-[11px] font-black uppercase text-black">Halaman ${currentPage}/${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest disabled:opacity-20 transition hover:bg-slate-800">Next</button>
    `;
    viewList.appendChild(nav);
}

function changePage(page) { currentPage = page; renderPosts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function filterKategori(kat) { 
    currentPage = 1; 
    filteredData = kat === 'Semua' ? [...allData].reverse() : allData.filter(p => (p.kategori || "").toLowerCase() === kat.toLowerCase()).reverse();
    renderPosts(); 
}

function kembaliKeDaftar() { window.location.href = 'index.html'; }

document.addEventListener('DOMContentLoaded', fetchData);
