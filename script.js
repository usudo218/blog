async function loadBlog() {
    const container = document.getElementById('blog-container');
    
    try {
        // Mengambil data dari file JSON
        const response = await fetch('data.json');
        const posts = await response.json();

        container.innerHTML = ''; // Bersihkan loading

        // Tampilkan dari yang terbaru
        posts.reverse().forEach((post) => {
            // Read More: potong 150 karakter
            const summary = post.content.substring(0, 150) + "...";

            const card = `
                <div class="bg-white p-6 rounded-lg shadow mb-6 border-l-4 border-blue-500">
                    <h3 class="text-2xl font-bold">${post.title}</h3>
                    <p class="text-gray-400 text-sm mb-4">${post.date}</p>
                    <p class="text-gray-700">${summary}</p>
                    <button class="mt-4 text-blue-600 font-semibold hover:underline">
                        Baca Selengkapnya
                    </button>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        container.innerHTML = "<p>Gagal memuat artikel. Pastikan data.json sudah ada.</p>";
    }
}

window.onload = loadBlog;
