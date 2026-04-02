const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec"; 
let dataBlog = []; 

async function ambilData() {
    const container = document.getElementById('blog-container');
    
    // Jika data sudah ada di memori, langsung tampilkan (sangat cepat untuk navigasi balik)
    if (dataBlog.length > 0) {
        renderDaftar(dataBlog);
        return;
    }

    try {
        // Set batas waktu (timeout) 10 detik agar tidak loading selamanya
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(API_URL, { signal: controller.signal });
        const data = await response.json();
        
        clearTimeout(timeoutId);
        dataBlog = data.reverse(); 
        
        renderDaftar(dataBlog);
        cekLinkDaftarIsi();
    } catch (e) { 
        console.error("Gagal ambil data:", e);
        container.innerHTML = "<p class='text-center py-10 italic text-slate-400'>Koneksi database lambat. Silakan refresh halaman.</p>";
    }
}

function renderDaftar(data) {
    const container = document.getElementById('blog-container');
    container.innerHTML = ''; 
    
    if (data.length === 0) {
        container.innerHTML = "<p class='text-center py-10 italic text-slate-400'>Tidak ada catatan yang ditemukan.</p>";
        return;
    }

    data.forEach((post) => {
        const realIndex = dataBlog.findIndex(p => p.judul === post.judul);
        const katTampil = (post.kategori || post.Kategori || "UMUM").toString().toUpperCase();

        // Cuplikan teks diproses lebih ringan
        let isiKonten = post.konten || "";
        let teksBersih = isiKonten.replace(/<[^>]*>?/gm, ''); 
        let ringkasan = teksBersih.substring(0, 250);
        if (teksBersih.length > 250) ringkasan += "...";

        // Format Tanggal
        let tgl = post.tanggal || "";
        if (tgl.toString().includes("-")) {
            tgl = new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        const tagHtml = post.tags ? post.tags.split(',').map(t => 
            `<span class="bg-slate-50 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-100 mr-1 uppercase font-bold">#${t.trim()}</span>`
        ).join('') : '';

        container.innerHTML += `
            <article class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 fade-in hover:shadow-md transition duration-300">
                <div class="flex justify-between items-start mb-3">
                    <span class="text-xs font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        ${katTampil}
                    </span>
                    <span class="text-slate-400 text-[10px] font-medium">${tgl}</span>
                </div>
                
                <h3 onclick="bacaLengkap(${realIndex})" class="text-xl md:text-2xl font-black text-slate-900 mb-3 cursor-pointer hover:underline leading-tight">
                    ${post.judul}
                </h3>
                
                <p class="text-slate-600 text-sm leading-relaxed mb-5">${ringkasan}</p>

                <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div class="flex flex-wrap gap-1">${tagHtml}</div>
                    <button onclick="bacaLengkap(${realIndex})" class="text-black font-black text-sm hover:underline">
                        BACA →
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
            const katPost = (p.kategori || p.Kategori || "UMUM").toString().trim().toLowerCase();
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

    const kat = (post.kategori || post.Kategori || "UMUM").toUpperCase();
    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = kat + " | " + post.tanggal;
    
    // Lazy loading gambar agar tidak membebani loading awal
    let img = post.gambar ? `<div class="mb-6"><img src="${post.gambar}" loading="lazy" class="w-full rounded-2xl shadow-lg border border-slate-100 mx-auto"></div>` : '';
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
