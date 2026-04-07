const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";

let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3; 

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

async function fetchData() {
    const container = document.getElementById('blog-container');
    const cacheKey = 'blog_data_cache';
    const cacheTimeKey = 'blog_data_time';
    const currentTime = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;

    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedData && cachedTime && (currentTime - cachedTime < tenMinutes)) {
        prosesData(JSON.parse(cachedData));
    } else {
        try {
            const response = await fetch(API_URL);
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
        container.innerHTML = '<p class="text-center py-10 italic text-xs font-bold">Tidak ada catatan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        let tgl = formatTanggal(post.tanggal);
        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6 text-justify">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori || 'Umum'}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4 leading-tight">
                    <a href="?id=${post.originalIndex}" class="hover:text-blue-700 transition">${post.judul}</a>
                </h3>
                <p class="text-black text-xs font-bold mt-2 uppercase tracking-widest">${tgl}</p>
                <div class="mt-4 text-slate-600 line-clamp-3 text-sm leading-relaxed">
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
    const headerElement = document.querySelector('#view-detail header');
    headerElement.innerHTML = `
        <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            TOPIK : <span class="text-black">${post.kategori || 'Umum'}</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter uppercase">${post.judul}</h1>
        <p class="text-black text-xs font-bold mt-3 uppercase tracking-[0.2em]">${tgl}</p>
    `;

    let fullContent = post.gambar ? `<figure class="mb-8"><img src="${post.gambar}" class="w-full h-auto rounded-[2rem] shadow-lg mb-2"><figcaption class="text-center text-[11px] italic text-slate-500 font-medium">— ${post.judul}</figcaption></figure>` : "";
    fullContent += `<div class="prose prose-slate max-w-none text-justify text-black">${post.konten}</div>`;

    document.getElementById('content-body').innerHTML = fullContent;
    muatKomentar(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function muatKomentar(postId) {
    const container = document.getElementById('list-komentar');
    container.innerHTML = '<p class="text-[10px] italic text-slate-400">Memuat rasan-rasan...</p>';
    
    try {
        const response = await fetch(`${API_URL}?type=comments&postId=${postId}`);
        const comments = await response.json();
        
        container.innerHTML = '';
        if (!Array.isArray(comments) || comments.length === 0) {
            container.innerHTML = '<p class="text-[10px] italic text-slate-400">Belum ada rasan-rasan.</p>';
            return;
        }

        let htmlContent = "";
        comments.forEach(c => {
            if (c.nama && c.komentar && c.nama !== "undefined") {
                htmlContent += `
                    <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                        <p class="text-[11px] font-black uppercase mb-1">${c.nama}</p>
                        <p class="text-sm text-slate-700 leading-relaxed">${c.komentar}</p>
                        <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold">${formatTanggal(c.tanggal)}</p>
                    </div>
                `;
            }
        });
        container.innerHTML = htmlContent || '<p class="text-[10px] italic text-slate-400">Belum ada rasan-rasan.</p>';
    } catch (e) {
        container.innerHTML = '<p class="text-[10px] italic text-slate-400">Belum ada rasan-rasan.</p>';
    }
}

async function kirimKomentar() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const nama = document.getElementById('nama-komentar').value;
    const komentar = document.getElementById('isi-komentar').value;
    const btn = document.getElementById('btn-komentar');

    if (!nama || !komentar) return alert("Lengkapi nama dan komentar dulu, Pak!");

    const originalText = btn.innerText;
    btn.innerText = "MENGIRIM...";
    btn.disabled = true;

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ type: 'addComment', postId, nama, komentar })
        });
        alert("Rasan-rasan terkirim!");
        document.getElementById('nama-komentar').value = '';
        document.getElementById('isi-komentar').value = '';
        muatKomentar(postId);
    } catch (err) {
        alert("Gagal mengirim rasan-rasan.");
    } finally {
        btn.innerText = originalText;
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
