// Fungsi untuk memuat semua postingan
function loadPosts() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    // Ambil data dari LocalStorage (Database lokal browser)
    const savedPosts = JSON.parse(localStorage.getItem('my_blog_posts')) || [];

    // Jika kosong, tampilkan pesan
    if (savedPosts.length === 0) {
        container.innerHTML = "<p class='text-gray-500 italic'>Belum ada artikel. Silakan buat di menu Admin.</p>";
        return;
    }

    // Urutkan dari yang terbaru (paling atas)
    savedPosts.reverse().forEach((post, index) => {
        const summary = post.content.substring(0, 150) + "...";
        
        const articleHTML = `
            <article class="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-600">
                <h3 class="text-2xl font-bold text-gray-800">${post.title}</h3>
                <p class="text-sm text-blue-500 mb-3">${post.date}</p>
                <div class="text-gray-700 leading-relaxed">${summary}</div>
                <button onclick="viewFullPost(${index})" class="mt-4 text-blue-600 font-bold hover:text-blue-800">
                    Baca Selengkapnya →
                </button>
            </article>
        `;
        container.innerHTML += articleHTML;
    });
}

// Fungsi sederhana untuk simulasi "Read More"
function viewFullPost(id) {
    const savedPosts = JSON.parse(localStorage.getItem('my_blog_posts')) || [];
    const post = savedPosts.reverse()[id];
    alert("JUDUL: " + post.title + "\n\nKONTEN:\n" + post.content);
}

window.onload = loadPosts;