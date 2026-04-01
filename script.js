// Ganti dengan URL Web App yang Anda salin dari Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbxmTs1IwzKO5yirj2zN3IIGSMl1UzuBaNnsSHaJ__yhqzlMPAgCuslCL92G1Zuw5AjBrw/exec";

async function loadBlog() {
    const container = document.getElementById('blog-container');
    
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();

        container.innerHTML = ''; 

        // Tampilkan dari bawah ke atas (Terbaru)
        posts.reverse().forEach((post) => {
            // Ambil 150 karakter pertama untuk Read More
            const summary = post.konten.substring(0, 150) + "...";

            const card = `
                <article class="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-green-500">
                    <h3 class="text-2xl font-bold text-gray-800">${post.judul}</h3>
                    <p class="text-gray-400 text-xs mb-3">${post.tanggal}</p>
                    <div class="text-gray-700 leading-relaxed">${summary}</div>
                    <button onclick="alert('Buka artikel: ${post.judul}')" class="mt-4 text-green-600 font-bold hover:underline">
                        Baca Selengkapnya →
                    </button>
                </article>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        container.innerHTML = "<p class='text-red-500'>Gagal mengambil data dari Google Sheets. Cek URL API Anda.</p>";
    }
}

window.onload = loadBlog;
