/* Kar-Han Tedarik - Galeri / Katalog (defer ile yüklenir)
   Swiper: .kh-showcase (vitrin), .kh-reels (video şeridi), .kh-strip (mini şerit)
   GLightbox: .kh-lb bağlantıları, data-gallery ile gruplanır; videolar Plyr ile oynar */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PLYR = 'https://cdnjs.cloudflare.com/ajax/libs/plyr/3.7.8/';
    var lightbox = null;

    function initLightbox() {
        if (typeof window.GLightbox === 'undefined') return;
        lightbox = window.GLightbox({
            selector: '.kh-lb:not(.is-hidden)',
            loop: true,
            touchNavigation: true,
            keyboardNavigation: true,
            autoplayVideos: true,
            // komşu slaytları önceden yükleme: video oranı ayarı yarışmasın, gereksiz video indirilmesin
            preload: false,
            openEffect: reduceMotion ? 'none' : 'zoom',
            closeEffect: reduceMotion ? 'none' : 'fade',
            slideEffect: reduceMotion ? 'none' : 'slide',
            moreLength: 0,
            plyr: {
                css: PLYR + 'plyr.css',
                js: PLYR + 'plyr.min.js',
                config: {
                    ratio: '16:9',
                    muted: false,
                    hideControls: true,
                    fullscreen: { enabled: true, iosNative: true }
                }
            }
        });

        // GLightbox video oranını tek bir genel ayardan okur; dikey (9:16) ve yatay
        // videolar karışık olduğu için ayarı her slayt için tetikleyicideki data-ratio'ya göre değiştir
        function applyVideoCfg(trigger) {
            if (!trigger || !trigger.getAttribute) return;
            var ratio = trigger.getAttribute('data-ratio');
            if (!ratio) return;
            lightbox.settings.plyr.config.ratio = ratio;
            lightbox.settings.videosWidth = trigger.getAttribute('data-width') || '960px';
        }
        // ilk açılışta GLightbox slaytı olaydan önce kurar: ayarı tıklama anında uygula
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('.kh-lb[data-ratio]');
            if (a) applyVideoCfg(a);
        }, true);
        lightbox.on('slide_before_load', function (d) { applyVideoCfg(d && d.trigger); });
        lightbox.on('slide_changed', function (d) {
            if (!d || !d.current) return;
            applyVideoCfg(d.current.trigger);
            if (typeof lightbox.resize === 'function') lightbox.resize();
        });
    }

    // Swiper yüklenmezse CSS yedeği yatay kaydırma sağlar
    function initSwipers() {
        if (typeof window.Swiper === 'undefined') return;
        var Swiper = window.Swiper;

        document.querySelectorAll('.kh-showcase').forEach(function (el) {
            var scope = el.closest('[data-swiper-scope]') || el.parentNode;
            new Swiper(el, {
                effect: reduceMotion ? 'slide' : 'coverflow',
                centeredSlides: true,
                slidesPerView: 'auto',
                spaceBetween: reduceMotion ? 16 : 0,
                loop: true,
                grabCursor: true,
                speed: 700,
                coverflowEffect: { rotate: 0, stretch: -20, depth: 180, modifier: 1, scale: 0.92, slideShadows: false },
                autoplay: reduceMotion ? false : { delay: 3200, pauseOnMouseEnter: true, disableOnInteraction: false },
                pagination: { el: scope.querySelector('.swiper-pagination'), clickable: true, dynamicBullets: true },
                navigation: { prevEl: scope.querySelector('[data-prev]'), nextEl: scope.querySelector('[data-next]') },
                keyboard: { enabled: true, onlyInViewport: true },
                a11y: { prevSlideMessage: 'Önceki', nextSlideMessage: 'Sonraki', paginationBulletMessage: '{{index}}. görsele git' }
            });
        });

        document.querySelectorAll('.kh-reels, .kh-strip').forEach(function (el) {
            var scope = el.closest('[data-swiper-scope]') || el.parentNode;
            new Swiper(el, {
                slidesPerView: 'auto',
                spaceBetween: el.classList.contains('kh-reels') ? 16 : 12,
                freeMode: { enabled: true, momentum: !reduceMotion },
                grabCursor: true,
                mousewheel: { forceToAxis: true },
                navigation: { prevEl: scope.querySelector('[data-prev]'), nextEl: scope.querySelector('[data-next]') },
                keyboard: { enabled: true, onlyInViewport: true },
                a11y: { prevSlideMessage: 'Önceki', nextSlideMessage: 'Sonraki' }
            });
        });
    }

    // Filtre çipleri: data-filter="tag" ; hedef: aynı [data-filter-scope] içindeki [data-tag] öğeleri
    function initFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var chips = scope.querySelectorAll('.kh-chip[data-filter]');
            var items = scope.querySelectorAll('[data-tag]');
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    var f = chip.getAttribute('data-filter');
                    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                    items.forEach(function (it) {
                        var show = f === 'all' || it.getAttribute('data-tag') === f;
                        it.classList.toggle('is-hidden', !show);
                    });
                    if (lightbox) lightbox.reload();
                });
            });
        });
    }

    // Katalog menüsü: görünür bölümü vurgula
    function initCatNav() {
        var nav = document.querySelector('.kh-catnav');
        if (!nav || !('IntersectionObserver' in window)) return;
        var links = {};
        nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
        var current = null;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var a = links[e.target.id];
                if (!a || a === current) return;
                if (current) current.classList.remove('is-active');
                a.classList.add('is-active');
                current = a;
                var list = a.closest('.kh-catnav__list');
                if (list) list.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(links).forEach(function (id) {
            var sec = document.getElementById(id);
            if (sec) io.observe(sec);
        });
    }

    function init() {
        initLightbox();
        initSwipers();
        initFilters();
        initCatNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
