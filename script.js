const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec";

let allData = [];
let filteredData = [];
let currentPage = 1;
const postsPerPage = 3; // Batasan 4 postingan per halaman

async function fetchData() {
    const container = document.getElementById('blog-container');
    try {
        const response = await fetch(API_URL);
        allData = await response.json();
        
        // Cek jika ada ID di URL untuk mode detail
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (postId !== null) {
            tampilkanDetail(postId);
        } else {
            filteredData = [...allData].reverse(); // Terbaru di atas
            renderPosts();
        }
    } catch (e) {
        container.innerHTML = '<p class="text-center py-10 font-bold uppercase tracking-widest text-red-500">Gagal memuat catatan.</p>';
    }
}

function renderPosts() {
    const container = document.getElementById('blog-container');
    container.innerHTML = '';

    // Hitung index data yang akan ditampilkan
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filteredData.slice(startIndex, endIndex);

    if (paginatedPosts.length === 0) {
        container.innerHTML = '<p class="text-center py-10 italic">Tidak ada catatan ditemukan.</p>';
        return;
    }

    paginatedPosts.forEach((post) => {
        // Cari index asli untuk link detail
        const originalIndex = allData.findIndex(p => p.judul === post.judul);
        
        let tgl = post.tanggal || "";
        if (tgl.includes("T") || tgl.includes("-")) {
            tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        container.innerHTML += `
            <article class="fade-in bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 py-1 rounded-full">${post.kategori}</span>
                <h3 class="text-xl md:text-2xl font-black mt-4 leading-tight">
                    <a href="?id=${originalIndex}" class="hover:text-blue-700 transition">${post.judul}</a>
                </h3>
                <p class="text-black text-xs font-bold mt-2 uppercase tracking-widest">${tgl}</p>
                <div class="mt-4 text-slate-600 line-clamp-3 text-sm leading-relaxed text-justify">
                    ${post.konten.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </div>
                <a href="?id=${originalIndex}" class="inline-block mt-6 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-blue-700 hover:border-blue-700 transition">Baca Selengkapnya →</a>
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

    // Tombol Previous
    if (currentPage > 1) {
        paginationHtml += `<button onclick="changePage(${currentPage - 1})" class="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg hover:scale-105 transition">Prev</button>`;
    } else {
        paginationHtml += `<button disabled class="px-5 py-2 bg-slate-100 text-slate-300 text-[10px] font-black rounded-full uppercase tracking-widest cursor-not-allowed">Prev</button>`;
    }

    // Info Halaman Format: Page 1/2
    paginationHtml += `<span class="text-[11px] font-black uppercase tracking-[0.2em] text-black">Page ${currentPage}/${totalPages}</span>`;

    // Tombol Next
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
    currentPage = 1; // Reset ke halaman 1 setiap kali filter
    if (kat === 'Semua') {
        filteredData = [...allData].reverse();
    } else {
        filteredData = allData.filter(p => p.kategori === kat).reverse();
    }
    renderPosts();
}

function tampilkanDetail(id) {
    const post = allData[id];
    if (!post) return;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');

    document.getElementById('content-title').innerText = post.judul;
    
    let tgl = post.tanggal || "";
    if (tgl.includes("T") || tgl.includes("-")) {
        tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    document.getElementById('content-date').innerText = tgl;
    document.getElementById('content-body').innerHTML = post.konten;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function kembaliKeDaftar() {
    window.history.pushState({}, '', 'index.html');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    renderPosts();
}

window.onload = fetchData;
