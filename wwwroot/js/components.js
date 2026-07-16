// Aktif sayfayı otomatik algıla
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const navLinks = [
    { href: 'hizmetler.html', label: 'Hizmetler' },
    { href: 'referanslar.html', label: 'Referanslar' },
    { href: 'basari-hikayeleri.html', label: 'Başarı Hikayeleri' },
    { href: 'hakkimizda.html', label: 'Hakkımızda' },
];

function renderNavbar() {
    const linksHtml = navLinks.map(link => {
        const isActive = currentPage === link.href;
        return `<a class="text-secondary hover:text-primary-container transition-colors ${isActive ? 'font-bold text-primary border-b-2 border-primary' : ''}" href="${link.href}">${link.label}</a>`;
    }).join('');

    const mobileLinksHtml = navLinks.map(link => {
        const isActive = currentPage === link.href;
        return `<a class="block px-4 py-3 text-on-surface hover:bg-surface-container transition-colors border-b border-border-gray ${isActive ? 'font-bold text-primary' : ''}" href="${link.href}">${link.label}</a>`;
    }).join('');

    return `
    <nav class="bg-surface-container-lowest font-body-md text-body-md w-full sticky top-0 z-50 border-b border-border-gray">
        <div class="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto w-full">
            <a href="index.html" class="flex items-center gap-3 no-underline">
                <img src="wwwroot/assets/logo.jpeg" alt="Kar-Han Tedarik Logosu" class="h-10 w-auto rounded object-cover" />
                <div class="font-headline-md text-headline-md font-bold text-deep-navy">Karhan Tedarik</div>
            </a>
            <div class="hidden md:flex gap-8">${linksHtml}</div>
            <div class="hidden md:flex items-center gap-4">
                <a href="iletisim.html" class="btn-primary">Teklif Al</a>
            </div>
            <button id="mobile-menu-btn" class="md:hidden text-primary" aria-label="Menü">
                <span class="material-symbols-outlined">menu</span>
            </button>
        </div>
        <!-- Mobil Menü -->
        <div id="mobile-menu" class="hidden md:hidden bg-surface-container-lowest border-t border-border-gray shadow-lg">
            ${mobileLinksHtml}
            <div class="px-4 py-4">
                <a href="iletisim.html" class="btn-primary w-full block text-center">Teklif Al</a>
            </div>
        </div>
    </nav>`;
}

function renderFooter() {
    const footerLinks = navLinks.map(link =>
        `<a class="text-secondary-fixed hover:text-tertiary-fixed transition-colors" href="${link.href}">${link.label}</a>`
    ).join('');

    return `
    <footer class="bg-slate-gray text-surface-container-lowest font-body-sm text-body-sm border-t border-outline">
        <div class="w-full py-12 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <img src="wwwroot/assets/logo.jpeg" alt="Kar-Han Tedarik Logosu" class="h-8 w-auto rounded object-cover" />
                        <div class="font-bold text-surface-container-lowest text-lg">Karhan Tedarik</div>
                    </div>
                    <p class="opacity-70 text-sm leading-relaxed">Tedarik zinciri ve lojistik çözümlerinde güvenilir iş ortağınız.</p>
                </div>
                <div>
                    <h4 class="font-bold text-surface-container-lowest mb-4">Sayfalar</h4>
                    <div class="flex flex-col gap-3">${footerLinks}</div>
                </div>
                <div>
                    <h4 class="font-bold text-surface-container-lowest mb-4">İletişim</h4>
                    <div class="flex flex-col gap-3">
                        <a class="text-secondary-fixed hover:text-tertiary-fixed transition-colors" href="iletisim.html">İletişim Formu</a>
                        <a class="text-secondary-fixed hover:text-tertiary-fixed transition-colors" href="gizlilik-politikasi.html">Gizlilik Politikası</a>
                        <a class="text-secondary-fixed hover:text-tertiary-fixed transition-colors" href="kvkk.html">KVKK</a>
                    </div>
                </div>
            </div>
            <div class="border-t border-outline pt-6 text-center opacity-60 text-sm">
                © 2025 Karhan Tedarik. Tüm hakları saklıdır.
            </div>
        </div>
    </footer>`;
}

function initComponents() {
    // Navbar'ı yerleştir
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) navPlaceholder.innerHTML = renderNavbar();

    // Footer'ı yerleştir
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) footerPlaceholder.innerHTML = renderFooter();

    // Mobil menü toggle
    document.addEventListener('click', function (e) {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (btn && menu) {
            if (btn.contains(e.target)) {
                menu.classList.toggle('hidden');
            } else if (!menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initComponents);

