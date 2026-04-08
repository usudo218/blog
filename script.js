const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";

// MASUKKAN URL WEB APP KOMENTAR TERBARU BAPAK
const KOMENTAR_URL = "https://script.google.com/macros/s/AKfycbxAJM--cz6jTStMy_5z7i3Wa8ibZV4QayaPxAi3QaMsRQaHoZg6_7edptBYQwFNVoYr/exec"; 

let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3; 

// Fitur Atribusi
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const urlLengkap = document.location.href;
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
        container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    const attributionHTML = `<div style="line-height: 1.2; margin-top: 20px;">========================================<br>Tulisan ini telah tayang di : <a href="https://www.asalnulis.web.id">www.asalnulis.web.id</a><br>Baca artikel selengkapnya di : <a href="${urlLengkap}">${urlLengkap}</a><br><b>${AUTHOR_NAME}</b><br>========================================</div>`;
    const finalHTML = container.innerHTML + attributionHTML;
    const finalPlain = selection.toString() + `\n\n========================================\nTulisan ini telah tayang di : www.asalnulis.web.id\nBaca artikel selengkapnya di : ${urlLengkap}\n${AUTHOR_NAME}\n========================================`;
    if (e.clipboardData) { e.clipboardData.setData('text/html', finalHTML); e.clipboardData.setData('text/plain', finalPlain); e.preventDefault(); }
});

async function fetchData() {
    const container = document.getElementById('blog-container');
    const currentTime = new Date().getTime();
    try {
        const response = await fetch(`${API_URL}?t=${currentTime}`);
        const rawData = await response.json();
        allData = rawData.map((post, index) => ({ ...post, originalIndex: index }));
        
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        if (postId !== null) {
            tampilkanDetail(postId);
        } else {
            filteredData = [...allData].reverse();
            renderPosts();
        }
    } catch (e) {
        container.innerHTML = '<p class="text-center py-10 font-bold text-red-500">Gagal memuat catatan.</p>';
    }
}

async function renderPosts() {
    const container = document.getElementById('blog-container');
    container.innerHTML = '';
    
    let commentCounts = {};
    try {
        // Ambil data dengan timestamp agar tidak kena cache browser
        const res = await fetch(`${KOMENTAR_URL}?countAll=true&t=${new Date().getTime()}`);
        commentCounts = await res.json();
    } catch (e) { console.log("Gagal muat jumlah komentar"); }

    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filteredData.slice(startIndex, startIndex + postsPerPage);

    paginatedPosts.forEach((post) => {
        let tgl = formatTanggal(post.tanggal);
        // ID Kunci harus string bersih agar cocok dengan data dari Apps Script
        const idKunci = String(post.originalIndex).trim();
        const jmlKomen = commentCounts[idKunci] || 0;

        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori || 'Umum'}</span>
                    <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Komentar: ${jmlKomen}</span>
                </div>
                <h3 class="text-xl md:text-2xl font-black leading-tight uppercase tracking-tighter">
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
    const headerElement = document.querySelector('#view-detail header');
    headerElement.innerHTML = `<h1 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter">${post.judul}</h1><p class="text-black text-xs font-bold mt-4 uppercase tracking-[0.2em]">${formatTanggal(post.tanggal)}</p>`;
    document.getElementById('content-body').innerHTML = post.konten;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    muatKomentar(id);
}

async function muatKomentar(postId) {
    const listContainer = document.getElementById('list-komentar');
    listContainer.innerHTML = '<p class="text-xs italic text-slate-400">Memuat rasan-rasan...</p>';
    try {
        const response = await fetch(`${KOMENTAR_URL}?id=${String(postId).trim()}&t=${new Date().getTime()}`);
        const komentar = await response.json();
        listContainer.innerHTML = komentar.length === 0 ? '<p class="text-xs italic text-slate-400">Belum ada rasan-rasan.</p>' : komentar.map(k => `<div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 fade-in"><div class="flex justify-between items-center mb-2"><span class="font-black text-[11px] uppercase tracking-wider">${k.nama}</span><span class="text-[9px] font-bold text-slate-400 uppercase">${k.tanggal}</span></div><p class="text-sm text-slate-700 leading-relaxed">${k.komentar}</p></div>`).join('');
    } catch (e) { listContainer.innerHTML = '<p class="text-xs text-red-400">Gagal ambil rasan-rasan.</p>'; }
}

async function kirimKomentar() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const nama = document.getElementById('nama-komen').value;
    const email = document.getElementById('email-komen').value;
    const komentar = document.getElementById('isi-komen').value;
    const btn = document.getElementById('btn-kirim-komen');
    if (!nama.trim() || !komentar.trim()) return alert("Nama dan isi rasan-rasan harus diisi.");
    btn.disabled = true; btn.innerText = "MENGIRIM...";
    try {
        await fetch(KOMENTAR_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: String(id).trim(), nama, email, komentar }) });
        document.getElementById('nama-komen').value = ''; document.getElementById('email-komen').value = ''; document.getElementById('isi-komen').value = '';
        setTimeout(() => { muatKomentar(id); btn.innerText = "KIRIM PESAN"; btn.disabled = false; renderPosts(); }, 2000);
    } catch (e) { alert("Gagal kirim."); btn.disabled = false; }
}

function formatTanggal(tglRaw) { if (!tglRaw) return ""; return new Date(tglRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
function renderPagination() { 
    const totalPages = Math.ceil(filteredData.length / postsPerPage);
    if (totalPages <= 1) return;
    const container = document.getElementById('blog-container');
    const div = document.createElement('div');
    div.className = 'flex justify-center items-center space-x-6 mt-12 mb-10';
    div.innerHTML = `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase">Prev</button><span class="text-[10px] font-black uppercase text-black">Hal ${currentPage}/${totalPages}</span><button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase">Next</button>`;
    container.appendChild(div);
}
function changePage(page) { currentPage = page; renderPosts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function filterKategori(kat) { currentPage = 1; filteredData = kat === 'Semua' ? [...allData].reverse() : allData.filter(p => (p.kategori || "").toLowerCase() === kat.toLowerCase()).reverse(); renderPosts(); }
function kembaliKeDaftar() { window.location.href = 'index.html'; }
document.addEventListener('DOMContentLoaded', fetchData);
