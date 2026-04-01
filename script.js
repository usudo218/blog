// 1. GANTI DENGAN URL WEB APP ANDA (Link dari Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec"; 
let dataBlog = []; 

async function ambilData() {
    const container = document.getElementById('blog-container');
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        dataBlog = data.reverse(); 
        renderDaftar(dataBlog);
        cekLinkDaftarIsi();
    } catch (e) { 
        container.innerHTML = "<p class='text-center py-10'>Gagal memuat data dari Spreadsheet.</p>";
    }
}

function renderDaftar(data) {
    const container = document.getElementById('blog-container');
    container.innerHTML = ''; 
    
    data.forEach((post) => {
        const realIndex = dataBlog.findIndex(p => p.judul === post.judul);
        
        // --- CUPLIKAN TEKS 250 KARAKTER ---
        let isiKonten = post.konten || "";
        let teksBersih = isiKonten.replace(/<[^>]*>?/gm, ''); 
        let ringkasan = teksBersih.substring(0, 250);
        if (teksBersih.length > 250) ringkasan += "...";

        // LOGIKA KATEGORI (Agar tidak muncul UMUM jika ada isinya)
        const katTampil = post.kategori ? post.kategori.toString().toUpperCase() : "UMUM";

        // Format Tanggal
        let tgl = post.tanggal || "";
        if (tgl.toString().includes("T") || tgl.toString().includes("-")) {
            const d = new Date(tgl);
            tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        const tagHtml = post.tags ? post.tags.split(',').map(t => 
            `<span class="bg-blue-50 text-blue-500 text-[10px] px-2 py-0.5 rounded border border-blue-100 mr-1 uppercase font-bold">#${t.trim()}</span>`
        ).join('') : '';

        container.innerHTML += `
            <article class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 fade-in hover:shadow-md transition duration-300">
                <div class="flex justify-between items-start mb-3">
                    <span class="text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                        ${katTampil}
                    </span>
                    <span class="text-slate-400 text-[10px] font-medium">${tgl}</span>
                </div>
                
                <h3 onclick="bacaLengkap(${realIndex})" class="text-xl md:text-2xl font-black text-slate-900 mb-3 cursor-pointer hover:text-blue-700 leading-tight">
                    ${post.judul}
                </h3>
                
                <p class="text-slate-600 text-sm leading-relaxed mb-5">${ringkasan}</p>

                <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div class="flex flex-wrap gap-1">${tagHtml}</div>
                    <button onclick="bacaLengkap(${realIndex})" class="text-blue-600 font-black text-sm hover:underline">
                        Baca Selengkapnya →
                    </button>
                </div>
            </article>`;
    });
}

function filterKategori(kat) {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    
    let hasil;
    if (kat === 'Semua') {
        hasil = dataBlog;
        document.getElementById('section-title').innerText = "Catatan Terbaru";
    } else {
        hasil = dataBlog.filter(p => {
            const katPost = p.kategori ? p.kategori.toString().trim().toLowerCase() : "";
            return katPost === kat.toLowerCase();
        });
        document.getElementById('section-title').innerText = "Topik: " + kat;
    }
    
    renderDaftar(hasil);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bacaLengkap(index) {
    const post = dataBlog[index];
    if(!post) return;

    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = (post.kategori || 'UMUM').toUpperCase() + " | " + post.tanggal;
    
    let img = post.gambar ? `<div class="mb-6"><img src="${post.gambar}" class="w-full rounded-2xl shadow-lg border border-slate-100 mx-auto"></div>` : '';
    let yt = post.youtube ? `
        <div class="relative w-full pb-[56.25%] h-0 rounded-2xl overflow-hidden mb-8 shadow-xl">
            <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${post.youtube.trim()}" frameborder="0" allowfullscreen></iframe>
        </div>` : '';
    
    const kontenFormat = post.konten ? post.konten.replace(/\n/g, "<br>") : "";
    document.getElementById('content-body').innerHTML = img + yt + kontenFormat;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cekLinkDaftarIsi() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id !== null && dataBlog.length > 0) {
        const targetIndex = dataBlog.length - 1 - parseInt(id);
        if(dataBlog[targetIndex]) setTimeout(() => bacaLengkap(targetIndex), 500);
    }
}

window.onload = ambilData;
