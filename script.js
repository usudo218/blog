// Ganti dengan URL Apps Script Bapak
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec"; 
let dataBlog = []; 

async function ambilData() {
    const container = document.getElementById('blog-container');
    
    if (dataBlog.length > 0) {
        renderDaftar(dataBlog);
        return;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(API_URL, { signal: controller.signal });
        const data = await response.json();
        
        clearTimeout(timeoutId);
        
        // PENTING: Kita simpan urutan asli Spreadsheet ke dalam property 'idAsli' 
        // sebelum data dibalik (reverse) untuk tampilan.
        dataBlog = data.map((item, index) => {
            return { ...item, idAsli: index };
        });

        // Urutan tampilan tetap yang terbaru di atas
        const dataTampilan = [...dataBlog].reverse();
        
        renderDaftar(dataTampilan);
        cekLinkDaftarIsi();
    } catch (e) { 
        console.error("Gagal ambil data:", e);
        container.innerHTML = "<p class='text-center py-10 italic text-slate-400'>Koneksi lambat. Silakan muat ulang halaman.</p>";
    }
}

function renderDaftar(data) {
    const container = document.getElementById('blog-container');
    container.innerHTML = ''; 
    
    data.forEach((post) => {
        // ID yang digunakan untuk link sekarang menggunakan idAsli (indeks baris Spreadsheet)
        const idShare = post.idAsli; 
        
        const katTampil = (post.kategori || post.Kategori || "UMUM").toString().toUpperCase();
        let teksBersih = (post.konten || "").replace(/<[^>]*>?/gm, ''); 
        let ringkasan = teksBersih.substring(0, 250) + (teksBersih.length > 250 ? "..." : "");

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
                    <span class="text-xs font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md border border-slate-200">${katTampil}</span>
                    <span class="text-slate-400 text-[10px] font-medium">${tgl}</span>
                </div>
                <h3 onclick="bacaLengkap(${idShare})" class="text-xl md:text-2xl font-black text-slate-900 mb-3 cursor-pointer hover:underline leading-tight">
                    ${post.judul}
                </h3>
                <p class="text-slate-600 text-sm leading-relaxed mb-5">${ringkasan}</p>
                <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div class="flex flex-wrap gap-1">${tagHtml}</div>
                    <button onclick="bacaLengkap(${idShare})" class="text-black font-black text-sm hover:underline">BACA →</button>
                </div>
            </article>`;
    });
}

function bacaLengkap(idAsli) {
    // Cari data yang idAsli-nya cocok (pasti tepat sasaran ke baris Spreadsheet yang benar)
    const post = dataBlog.find(p => p.idAsli === idAsli);
    if(!post) return;

    const kat = (post.kategori || post.Kategori || "UMUM").toUpperCase();
    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = kat + " | " + post.tanggal;
    
    let img = post.gambar ? `<div class="mb-6"><img src="${post.gambar}" loading="lazy" class="w-full rounded-2xl shadow-lg border border-slate-100 mx-auto"></div>` : '';
    let yt = post.youtube ? `<div class="relative w-full pb-[56.25%] h-0 rounded-2xl overflow-hidden mb-8 shadow-xl"><iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${post.youtube.trim()}" frameborder="0" allowfullscreen></iframe></div>` : '';
    
    const kontenFormat = post.konten ? post.konten.replace(/\n/g, "<br>") : "";
    document.getElementById('content-body').innerHTML = img + yt + kontenFormat;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    
    // Update URL di browser tanpa reload, agar link bisa dicopy langsung dari address bar
    window.history.pushState({}, '', `?id=${idAsli}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterKategori(kat) {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    
    let hasil;
    if (kat === 'Semua') {
        hasil = [...dataBlog].reverse();
    } else {
        hasil = dataBlog.filter(p => {
            const katPost = (p.kategori || p.Kategori || "UMUM").toString().trim().toLowerCase();
            return katPost === kat.toLowerCase();
        }).reverse();
    }
    renderDaftar(hasil);
}

function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    window.history.pushState({}, '', window.location.pathname); // Bersihkan ID di URL
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cekLinkDaftarIsi() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id !== null && dataBlog.length > 0) {
        // Langsung buka berdasarkan ID asli baris spreadsheet
        bacaLengkap(parseInt(id));
    }
}

window.onload = ambilData;
