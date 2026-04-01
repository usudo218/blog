// 1. GANTI DENGAN URL WEB APP ANDA (Link dari Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec"; 
let dataBlog = []; 

// Fungsi Ambil Data
async function ambilData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        dataBlog = data.reverse(); 
        renderDaftar(dataBlog);
        cekLinkDaftarIsi(); // Untuk fungsi buka otomatis dari Daftar Isi
    } catch (e) { 
        console.error("Gagal ambil data:", e); 
        document.getElementById('blog-container').innerHTML = "<p class='text-center py-10'>Gagal memuat data. Periksa koneksi atau URL API.</p>";
    }
}

// Fungsi Render Daftar Artikel (Halaman Depan)
function renderDaftar(data) {
    const container = document.getElementById('blog-container');
    container.innerHTML = ''; 
    
    if (data.length === 0) {
        container.innerHTML = "<p class='text-center py-10 text-slate-500'>Tidak ada artikel ditemukan.</p>";
        return;
    }

    data.forEach((post) => {
        const realIndex = dataBlog.indexOf(post);
        
        // Perbaikan Cuplikan Teks
        let isiKonten = post.konten || "";
        let teksBersih = isiKonten.replace(/<[^>]*>?/gm, ''); // Hapus tag HTML
        let ringkasan = teksBersih.substring(0, 130) + "...";

        // Perbaikan Format Tanggal
        let tgl = post.tanggal || "";
        if (tgl.includes("T")) {
            tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        const tagHtml = post.tags ? post.tags.split(',').map(t => 
            `<span class="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded mr-1">#${t.trim()}</span>`
        ).join('') : '';

        container.innerHTML += `
            <article class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 fade-in">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-blue-600 text-[10px] font-bold uppercase tracking-widest">${post.kategori || 'UMUM'}</span>
                    <span class="text-slate-400 text-[10px]">${tgl}</span>
                </div>
                <h3 onclick="bacaLengkap(${realIndex})" class="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-blue-700 transition">${post.judul}</h3>
                <p class="text-slate-600 text-sm leading-relaxed mb-4">${ringkasan}</p>
                <div class="flex justify-between items-center">
                    <div class="flex-1">${tagHtml}</div>
                    <button onclick="bacaLengkap(${realIndex})" class="text-blue-600 font-bold text-sm hover:underline">Baca →</button>
                </div>
            </article>`;
    });
}

// Fungsi Filter Kategori
function filterKategori(kat) {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    const hasil = kat === 'Semua' ? dataBlog : dataBlog.filter(p => p.kategori === kat);
    renderDaftar(hasil);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fungsi Baca Artikel Lengkap
function bacaLengkap(index) {
    const post = dataBlog[index];
    if(!post) return;

    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = `${post.kategori || 'Umum'} | ${post.tanggal}`;
    
    let img = post.gambar ? `<img src="${post.gambar}" class="w-full rounded-2xl mb-6 shadow-md border">` : '';
    let yt = post.youtube ? `<div class="relative w-full pb-[56.25%] h-0 rounded-2xl overflow-hidden mb-6 shadow-md"><iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${post.youtube.trim()}" frameborder="0" allowfullscreen></iframe></div>` : '';
    
    // Gunakan innerHTML agar tag <img> atau <iframe> di tengah konten bisa jalan
    const kontenFormat = post.konten ? post.konten.replace(/\n/g, "<br>") : "";
    document.getElementById('content-body').innerHTML = img + yt + kontenFormat;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
}

// Fungsi deteksi link dari Daftar Isi (?id=x)
function cekLinkDaftarIsi() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id !== null && dataBlog.length > 0) {
        const targetIndex = dataBlog.length - 1 - parseInt(id);
        if(dataBlog[targetIndex]) setTimeout(() => bacaLengkap(targetIndex), 500);
    }
}

window.onload = ambilData;
