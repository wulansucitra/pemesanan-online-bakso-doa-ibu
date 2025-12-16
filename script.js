/* =========================================================
    GLOBAL INITIALIZATION & DEFAULT DATA
    ========================================================= */

/**
 * Inisialisasi data user default
 * - Digunakan untuk memastikan admin selalu tersedia
 * - Dieksekusi satu kali saat aplikasi pertama dijalankan
 */
(function initDefaultUsers(){
    if (!localStorage.getItem("users")) {
        const users = [
            {
                username: "admin",
                password: "admin123",
                role: "admin",
                created: new Date().toLocaleString("id-ID")
            }
        ];
        localStorage.setItem("users", JSON.stringify(users));
    }
})();

/* =========================================================
    AUTHENTICATION & LOGIN SYSTEM
    ========================================================= */

/**
 * Fungsi utama login
 * - Mendukung role admin & customer
 * - Customer akan auto-register jika belum terdaftar
 */
function login(){

    const role     = document.getElementById("role").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    /* ---------- VALIDATION ---------- */
    if (!username || !password) {
        alert("Username dan password wajib diisi");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user  = users.find(u => u.username === username);

    /* ---------- ADMIN LOGIN ---------- */
    if (role === "admin") {

        if (user && user.password === password && user.role === "admin") {
            setSession(user);
            location.href = "penjualan.html";
        } else {
            alert("Login admin gagal");
        }

        return;
    }

    /* ---------- CUSTOMER LOGIN / AUTO REGISTER ---------- */
    if (!user) {

        user = {
            username: username,
            password: password,
            role: "customer",
            created: new Date().toLocaleString("id-ID")
        };

        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));

    } else {

        if (user.password !== password || user.role !== "customer") {
            alert("Username atau password salah");
            return;
        }
    }

    setSession(user);
    location.href = "menu.html";
}

/* =========================================================
    SESSION MANAGEMENT
    ========================================================= */

/**
 * Menyimpan sesi login ke localStorage
 */
function setSession(user){
    localStorage.setItem("loginUser", JSON.stringify({
        username: user.username,
        role: user.role,
        loginTime: new Date().toLocaleString("id-ID")
    }));
}

/**
 * Proteksi halaman admin
 */
function cekAdmin(){
    const session = JSON.parse(localStorage.getItem("loginUser"));

    if (!session || session.role !== "admin") {
        alert("Akses ditolak");
        location.href = "index.html";
    }
}

/**
 * Proteksi halaman customer
 */
function cekCustomer(){
    const session = JSON.parse(localStorage.getItem("loginUser"));

    if (!session || session.role !== "customer") {
        alert("Silakan login sebagai customer");
        location.href = "index.html";
    }
}

/**
 * Logout user
 */
function logout(){
    localStorage.removeItem("loginUser");
    location.href = "index.html";
}

/* =========================================================
    HELPER: NOTIFICATION (FUNGSI BARU)
    ========================================================= */

/**
 * Menampilkan notifikasi toast di layar
 */
function showToast(message) {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;

    // 1. Set pesan dan tampilkan
    toast.textContent = message;
    toast.classList.add("show");

    // 2. Hilangkan setelah 3 detik
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================================================
    CART SYSTEM (CLIENT SIDE)
    ========================================================= */

let cart = [];

/**
 * Menambahkan item ke keranjang (TERDAPAT PERUBAHAN)
 */
function addCart(nama, harga){
    cart.push({ nama, harga });
    renderCart();
    
    // Panggil notifikasi
    showToast(`${nama} berhasil ditambahkan ke keranjang!`);
}

/**
 * Render isi keranjang ke UI
 */
function renderCart(){

    const el = document.getElementById("cart");
    if (!el) return;

    el.innerHTML = "";

    cart.forEach((item, index) => {
        el.innerHTML += `
            <li>
                ${index + 1}. ${item.nama} - Rp ${item.harga}
            </li>
        `;
    });
}

/* =========================================================
    CHECKOUT & RESI SYSTEM
    ========================================================= */

/**
 * Proses checkout (TERDAPAT PERBAIKAN KRITIS)
 * - Menyimpan data penjualan
 * - Membuat resi transaksi
 */
function checkout(){

    if (cart.length === 0) {
        alert("Keranjang kosong");
        return;
    }

    // PERBAIKAN: Mengambil nilai dari elemen <select id="metode">
    const metode = document.getElementById("metode").value;
    
    const session   = JSON.parse(localStorage.getItem("loginUser"));
    const penjualan = JSON.parse(localStorage.getItem("penjualan")) || [];

    const resi    = "RPL-" + Date.now();
    const tanggal = new Date().toLocaleString("id-ID");

    let total = 0;
    cart.forEach(item => total += item.harga);

    cart.forEach(item => {
        penjualan.push({
            resi,
            produk: item.nama,
            harga: item.harga,
            customer: session.username,
            metode,
            tanggal,
            status: "Diproses"
        });
    });

    localStorage.setItem("penjualan", JSON.stringify(penjualan));

    localStorage.setItem("resi", JSON.stringify({
        resi,
        customer: session.username,
        metode,
        tanggal,
        item: cart,
        total
    }));

    cart = [];
    renderCart();
    tampilkanResi();

    alert("Pesanan berhasil dibuat");
}

/**
 * Menampilkan detail resi ke halaman
 */
function tampilkanResi(){

    const resiData = JSON.parse(localStorage.getItem("resi"));
    const el = document.getElementById("resi");

    if (!resiData || !el) return;

    let html = `
        <p><b>No Resi:</b> ${resiData.resi}</p>
        <p><b>Customer:</b> ${resiData.customer}</p>
        <p><b>Tanggal:</b> ${resiData.tanggal}</p>
        <p><b>Pembayaran:</b> ${resiData.metode}</p>
        <hr>
        <ul>
    `;

    resiData.item.forEach(item => {
        html += `<li>${item.nama} - Rp ${item.harga}</li>`;
    });

    html += `
        </ul>
        <hr>
        <h3>Total: Rp ${resiData.total}</h3>
    `;

    el.innerHTML = html;
}

/* =========================================================
    MENU MANAGEMENT (ADMIN - LOCAL STORAGE)
    ========================================================= */

function getMenu(){
    return JSON.parse(localStorage.getItem("menu")) || [];
}

function saveMenu(data){
    localStorage.setItem("menu", JSON.stringify(data));
}

function tambahMenu(){

    const nama      = namaMenu.value.trim();
    const harga     = parseInt(hargaMenu.value); 
    const kategori  = kategoriMenu.value;
    const gambar    = gambarMenu.value.trim();
    const deskripsi = deskripsiMenu.value.trim();

    // Validasi Kelengkapan Data
    if (!nama || !gambar) {
        alert("Nama dan URL Gambar wajib diisi");
        return;
    }

    // PENINGKATAN: Validasi Harga
    if (isNaN(harga) || harga <= 0) {
        alert("Harga harus berupa angka positif yang valid.");
        return;
    }

    const menu = getMenu();
    menu.push({
        id: Date.now(),
        nama,
        harga,
        kategori,
        gambar,
        deskripsi
    });

    saveMenu(menu);
    loadMenuAdmin();
    clearForm();

    alert("Menu berhasil ditambahkan");
}

function loadMenuAdmin(){

    const table = document.getElementById("menuTable");
    if (!table) return;

    const menu = getMenu();
    table.innerHTML = "";

    menu.forEach((m, i) => {
        table.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td><img src="${m.gambar}" class="menu-thumb"></td>
                <td>${m.nama}</td>
                <td>${m.kategori}</td>
                <td>Rp ${m.harga}</td>
                <td>
                    <button class="btn-danger"
                        onclick="hapusMenu(${m.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `;
    });
}

function hapusMenu(id){
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    const menu = getMenu().filter(m => m.id !== id);
    saveMenu(menu);
    loadMenuAdmin();
}

function clearForm(){
    namaMenu.value = "";
    hargaMenu.value = "";
    gambarMenu.value = "";
    deskripsiMenu.value = "";
}

/* =========================================================
    EXTENSION: ADMIN MENU (VERSI LANJUTAN)
    ========================================================= */

function adminGetMenu(){
    return JSON.parse(localStorage.getItem("MENU_ADMIN")) || [];
}

function adminSaveMenu(data){
    localStorage.setItem("MENU_ADMIN", JSON.stringify(data));
}

function adminTambahMenu(){

    const nama      = document.getElementById("am_nama").value.trim();
    const harga     = document.getElementById("am_harga").value.trim();
    const gambar    = document.getElementById("am_gambar").value.trim();
    const deskripsi = document.getElementById("am_deskripsi").value.trim();

    if (!nama || !harga) {
        alert("Nama dan harga wajib diisi");
        return;
    }

    const data = adminGetMenu();
    data.push({
        id: Date.now(),
        nama,
        harga,
        gambar,
        deskripsi
    });

    adminSaveMenu(data);
    adminLoadMenu();

    alert("Menu berhasil ditambahkan");

    document.getElementById("am_nama").value = "";
    document.getElementById("am_harga").value = "";
    document.getElementById("am_gambar").value = "";
    document.getElementById("am_deskripsi").value = "";
}

function adminLoadMenu(){

    const el = document.getElementById("adminMenuList");
    if (!el) return;

    const data = adminGetMenu();
    el.innerHTML = "";

    data.forEach((m, i) => {
        el.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${m.nama}</td>
                <td>Rp ${m.harga}</td>
                <td>
                    <button onclick="adminHapusMenu(${m.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `;
    });
}

function adminHapusMenu(id){
    const data = adminGetMenu().filter(m => m.id !== id);
    adminSaveMenu(data);
    adminLoadMenu();
}

function hapusPemasukan(){

    if (!confirm("Semua data pemasukan akan dihapus!\nYakin?")) {
        return;
    }

    // Hapus data penjualan
    localStorage.removeItem("penjualan");

    // Reset tampilan
    document.getElementById("total").innerText = "Rp 0";

    alert("Data pemasukan berhasil dihapus");
}