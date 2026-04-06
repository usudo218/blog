// ==========================================
// KONFIGURASI UTAMA
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";
const ORIGINAL_DOMAIN = "www.asalnulis.web.id";
const AUTHOR_NAME = "Agus Tjakra";

// Variabel Global
let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3;

// ==========================================
// 1. FITUR ATRIBUSI COPY-PASTE
// ==========================================
document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const plainText = selection.toString();
    const attribution = `\n\n========================================\nTulisan ini telah tayang di : ${ORIGINAL_DOMAIN}\nBaca artikel selengkapnya di : ${document.location.href}\n${AUTHOR_NAME}\n========================================`;
    
    const htmlContent = `<div>${plainText.replace(/\n/g, '<br>')}</div><br>` +
                        `========================================<br>` +
                        `Tulisan ini telah tayang di : <a href="https://${ORIGINAL_DOMAIN}">${ORIGINAL_DOMAIN}</a><br>` +
                        `Baca artikel selengkapnya di : <a href="${document.location.href}">${document.location.href}</a><br>` +
                        `${AUTHOR_NAME}<br>` +
                        `========================================`;

    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', plainText + attribution);
        e.clipboardData.setData('text/html', htmlContent);
        e.preventDefault();
    }
});

// ==========================================
// 2. PROTEKSI ATRIBUSI FOOTER (OPTIONAL)
// ==========================================
function protectAtribution() {
    const footerText = document.querySelector('.footer-text');
    const expected = `© 2026 Penulis Pemula - Merawat Ingatan`;
    if (footerText) {
        const restore = () => {
            if (footerText.innerText.trim() !== expected) {
                footerText.innerHTML = `&copy; 2026 Penulis Pemula - Merawat Ingatan`;
            }
        };
        const observer = new MutationObserver(restore);
        observer.observe(footerText, { childList: true, characterData: true, subtree: true });
        restore();
    }
}

// ==========================================
// 3. LOGIKA BLOG (FETCH & RENDER)
// ==========================================
async function muatDataBlog() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        
        // Simpan ke variabel global dengan index asli
        allData = json.map((item, i) => ({ ...item, originalIndex: i }));
        
        // Cek mode tampilan (Detail atau List)
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('id');

        if (postId !== null && allData[postId]) {
            tampilkanDetail(postId);
        } else {
            filteredData = [...allData].reverse();
            renderHalamanUtama();
        }
        
        protectAtribution();
    } catch (error) {
        console.error("Gagal Fetch:", error);
        container.innerHTML = `<p class="text-center py-10 text-red-500 font-bold">Gagal memuat rasan-rasan. Cek koneksi Internet.</p>`;
    }
}

function renderHalamanUtama() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    container.innerHTML = '';
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const list = filteredData.slice(start, end);

    if (list.length === 0) {
        container.innerHTML = '<p class="text-center py-10 italic">Belum ada catatan di laci ini.</p>';
        return;
    }

    list.forEach(post => {
        let tgl = post.tanggal || "";
        if (tgl.includes("-") || tgl.includes("T")) {
            tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                <span class="text-[10px] font-black uppercase tracking-widest text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori || 'Umum'}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4"><a href="?id=${post.originalIndex}" class="hover:text-blue-700 transition">${post.judul}</a></h3>
                <p class="text-xs font-bold mt-2 uppercase text-slate-400">${tgl}</p>
                <div class="mt-4 text-slate-600 line-clamp-3 text-sm leading-relaxed">${(post.konten || '').replace(/<[^>]*>/g, '').substring(0, 200)}...</div>
                <a href="?id=${post.originalIndex}" class="inline-block mt-6 text-xs font-black uppercase border-b-2 border-black pb-1 hover:text-blue-700 hover:border-blue-700 transition">Baca Selengkapnya →</a>
            </article>`;
    });

    renderNavigasi();
}

function renderNavigasi() {
    const total = Math.ceil(filteredData.length / postsPerPage);
    const container = document.getElementById('blog-container');
    if (total <= 1 || !container) return;

    const nav = document.createElement('div');
    nav.className = 'flex justify-center items-center space-x-4 mt-8 mb-10';
    nav.innerHTML = `
        <button onclick="pindahHalaman(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-5 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-20">Prev</button>
        <span class="text-[10px] font-black uppercase tracking-widest">Hal ${currentPage} / ${total}</span>
        <button onclick="pindahHalaman(${currentPage + 1})" ${currentPage === total ? 'disabled' : ''} class="px-5 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-20">Next</button>`;
    container.appendChild(nav);
}

window.pindahHalaman = (p) => { currentPage = p; renderHalamanUtama(); window.scrollTo({top: 0, behavior: 'smooth'}); };

function tampilkanDetail(id) {
    const post = allData[id];
    const vList = document.getElementById('view-list');
    const vDetail = document.getElementById('view-detail');
    const cBody = document.getElementById('content-body');
    const head = document.querySelector('#view-detail header');

    if (vList) vList.classList.add('hidden');
    if (vDetail) vDetail.classList.remove('hidden');

    let tgl = post.tanggal || "";
    if (tgl.includes("-")) tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (head) {
        head.innerHTML = `
            <div class="text-[10px] font-black uppercase text-slate-500 mb-2">TOPIK : ${post.kategori || 'Umum'}</div>
            <h1 class="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tighter">${post.judul}</h1>
            <p class="text-xs font-bold mt-2 uppercase tracking-widest">${tgl}</p>`;
    }

    let isi = post.gambar ? `<figure class="mb-8"><img src="${post.gambar}" class="w-full rounded-[2rem] shadow-lg"><figcaption class="text-center text-[10px] italic mt-2 text-slate-400">— ${post.judul} | Penulis Pemula</figcaption></figure>` : "";
    isi += `<div class="prose max-w-none text-justify text-slate-800">${post.konten}</div>`;
    
    if (post.youtube) {
        isi += `<div class="mt-10 aspect-video rounded-[2rem] overflow-hidden shadow-xl border-4 border-white"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${post.youtube}" frameborder="0" allowfullscreen></iframe></div>`;
    }

    if (cBody) cBody.innerHTML = isi;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

window.filterKategori = (k) => {
    currentPage = 1;
    if (k === 'Semua') {
        filteredData = [...allData].reverse();
    } else {
        filteredData = allData.filter(p => (p.kategori || "").toLowerCase() === k.toLowerCase()).reverse();
    }
    const vList = document.getElementById('view-list');
    const vDetail = document.getElementById('view-detail');
    if (vList) vList.classList.remove('hidden');
    if (vDetail) vDetail.classList.add('hidden');
    renderHalamanUtama();
};

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', muatDataBlog);
