const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";

// PENTING: Ganti dengan URL Web App Apps Script Komentar Bapak yang baru
const KOMENTAR_URL = "https://script.google.com/macros/s/AKfycbxAJM--cz6jTStMy_5z7i3Wa8ibZV4QayaPxAi3QaMsRQaHoZg6_7edptBYQwFNVoYr/exec"; 

let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3; 

// Fitur Atribusi Copy-Paste agar otomatis jadi link biru di Word
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const urlLengkap = document.location.href;
    const namaPenulis = "Agus Tjakra";
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
        container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    const attributionHTML = `
        <div style="line-height: 1.2; margin-top: 20px;">
            ========================================<br>
            Tulisan ini telah tayang di : <a href="https://www.asalnulis.web.id">www.asalnulis.web.id</a><br>
            Baca artikel selengkapnya di : <a href="${urlLengkap}">${urlLengkap}</a><br>
            <b>${namaPenulis}</b><br>
            ========================================
        </div>
    `;
    const finalHTML = container.innerHTML + attributionHTML;
    const finalPlain = selection.toString() + `\n\n========================================\nTulisan ini telah tayang di : www.asalnulis.web.id\nBaca artikel selengkapnya di : ${urlLengkap}\n${namaPenulis}\n========================================`;
    if (e.clipboardData) {
        e.clipboardData.setData('text/html', finalHTML);
        e.clipboardData.setData('text/plain', finalPlain);
        e.preventDefault();
    }
});

// FUNGSI UTAMA: Ambil Data dengan Caching 5 Menit
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
        container.innerHTML = '<p class="text-center py-10 italic text-xs font-bold">Belum ada rasan-rasan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        let tgl = formatTanggal(post.tanggal);
        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori || 'Umum'}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4 leading-tight uppercase tracking-tighter">
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
        fullContent += `
            <figure class="mb-8 flex flex-col items-center">
                <img src="${post.gambar}" 
                     loading="lazy" 
                     class="w-5/8 md:w-5/8 max-w-[350px] h-auto rounded-[1.5rem] shadow-md border border-slate-200 mb-2 object-cover">
                <figcaption class="text-center text-[10px] italic text-slate-400 font-medium tracking-tight">
                    — ${post.judul}
                </figcaption>
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

    // Panggil fungsi muat komentar khusus artikel ini
    muatKomentar(id);
}

// FUNGSI KOMENTAR SPREADSHEET
async function muatKomentar(postId) {
    const listContainer = document.getElementById('list-komentar');
    listContainer.innerHTML = '<p class="text-xs italic text-slate-400">Memuat rasan-rasan...</p>';
    
    try {
        const response = await fetch(`${KOMENTAR_URL}?id=${postId}`);
        const komentar = await response.json();
        
        if (komentar.length === 0) {
            listContainer.innerHTML = '<p class="text-xs italic text-slate-400">Belum ada rasan-rasan di sini. Jadilah yang pertama!</p>';
            return;
        }

        listContainer.innerHTML = komentar.map(k => `
            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 fade-in">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-black text-[11px] uppercase tracking-wider">${k.nama}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase">${k.tanggal}</span>
                </div>
                <p class="text-sm text-slate-700 leading-relaxed">${k.komentar}</p>
            </div>
        `).join('');
    } catch (e) {
        listContainer.innerHTML = '<p class="text-xs text-red-400">Gagal mengambil data rasan-rasan.</p>';
    }
}

async function kirimKomentar() {
    const id = new URLSearchParams(window.location.search).get('id');
    const nama = document.getElementById('nama-komen').value;
    const email = document.getElementById('email-komen').value;
    const komentar = document.getElementById('isi-komen').value;
    const btn = document.getElementById('btn-kirim-komen');

    if (!nama.trim() || !komentar.trim()) return alert("Nama dan rasan-rasan harus diisi nggih.");

    btn.disabled = true;
    btn.innerText = "MENGIRIM...";

    try {
        await fetch(KOMENTAR_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nama, email, komentar })
        });
        
        document.getElementById('nama-komen').value = '';
        document.getElementById('email-komen').value = '';
        document.getElementById('isi-komen').value = '';
        
        setTimeout(() => {
            muatKomentar(id);
            btn.innerText = "KIRIM PESAN";
            btn.disabled = false;
        }, 2000);
    } catch (e) {
        alert("Waduh, gagal mengirim. Coba lagi nggih.");
        btn.disabled = false;
    }
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
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest">Prev</button>
        <span class="text-[11px] font-black uppercase text-black">Halaman ${currentPage}/${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest">Next</button>
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
