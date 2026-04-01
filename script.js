// 1. GANTI DENGAN URL WEB APP ANDA (Link dari Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbxtNsPf6THGZWi3VBJS06c9zgAu2otLLjafqXPQ2z8hZWol5T5hUTcFtXAOC6CEq0PtWA/exec"; 
let dataBlog = []; 

async function ambilData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        dataBlog = data.reverse(); 
        renderDaftar(dataBlog);
    } catch (e) { console.error("Gagal ambil data"); }
}

function renderDaftar(data) {
    const container = document.getElementById('blog-container');
    container.innerHTML = ''; 
    
    data.forEach((post, index) => {
        const realIndex = dataBlog.indexOf(post);
        // Tampilkan Tags sebagai label kecil
        const tagHtml = post.tags ? post.tags.split(',').map(t => `<span class="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded mr-1">#${t.trim()}</span>`).join('') : '';

        container.innerHTML += `
            <article class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-blue-600 text-xs font-bold uppercase">${post.kategori || 'Umum'}</span>
                    <span class="text-slate-400 text-xs">${post.tanggal}</span>
                </div>
                <h3 onclick="bacaLengkap(${realIndex})" class="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-blue-700">${post.judul}</h3>
                <div class="mb-4">${tagHtml}</div>
                <button onclick="bacaLengkap(${realIndex})" class="text-blue-600 font-bold text-sm">Baca Selengkapnya →</button>
            </article>`;
    });
}

function filterKategori(kat) {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    const hasil = kat === 'Semua' ? dataBlog : dataBlog.filter(p => p.kategori === kat);
    renderDaftar(hasil);
    window.scrollTo(0,0);
}

function bacaLengkap(index) {
    const post = dataBlog[index];
    document.getElementById('content-title').innerText = post.judul;
    document.getElementById('content-date').innerText = `${post.kategori} | ${post.tanggal}`;
    
    // Tampilkan Gambar jika ada
    let img = post.gambar ? `<img src="${post.gambar}" class="w-full rounded-2xl mb-6 shadow-md">` : '';
    
    // Tampilkan Video Youtube jika ada (Gunakan ID Video saja)
    let yt = post.youtube ? `
        <div class="relative w-full pb-[56.25%] h-0 rounded-2xl overflow-hidden mb-6 shadow-md">
            <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${post.youtube.trim()}" frameborder="0" allowfullscreen></iframe>
        </div>` : '';

    const konten = post.konten ? post.konten.replace(/\n/g, "<br>") : "";
    
    document.getElementById('content-body').innerHTML = img + yt + konten;
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');
    window.scrollTo(0,0);
}

function kembaliKeDaftar() {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
}

window.onload = ambilData;
