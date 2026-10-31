/* Kar-Han Tedarik - Animasyon katmanı (defer ile yüklenir) */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function stripAos() {
        document.querySelectorAll('[data-aos]').forEach(function (el) {
            el.removeAttribute('data-aos');
            el.removeAttribute('data-aos-delay');
        });
    }

    // AOS bittikten sonra öğeyi serbest bırak: Tailwind hover:-translate-y
    // gibi sınıfların AOS'un transform'u tarafından ezilmemesi için.
    function releaseFinishedAos() {
        document.addEventListener('transitionend', function (e) {
            var el = e.target;
            if (!el.hasAttribute || !el.hasAttribute('data-aos')) return;
            if (!el.classList.contains('aos-animate')) return;
            if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;
            setTimeout(function () {
                el.removeAttribute('data-aos');
                el.removeAttribute('data-aos-delay');
            }, 60);
        });
    }

    function initAos() {
        // Kütüphane yüklenemediyse ya da hareket azaltılmışsa içerik görünür kalsın
        if (typeof window.AOS === 'undefined' || reduceMotion) {
            stripAos();
            return;
        }
        window.AOS.init({
            once: true,
            duration: 700,
            offset: 80,
            easing: 'ease-out-cubic'
        });
        releaseFinishedAos();
    }

    // Aşama 3: dokunmatik cihazlarda hover yok; ikon görünür olunca bir kez oynat
    function initCardIcons() {
        var icons = document.querySelectorAll('.kh-icon');
        if (!icons.length || reduceMotion) return;
        if (!window.matchMedia('(hover: none)').matches) return;
        if (!('IntersectionObserver' in window)) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-active');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.8 });
        icons.forEach(function (el) { io.observe(el); });
    }

    // Aşama 4: Lottie (.lottie) - dotlottie-web, sürüm sabit, lit bağımlılığı yok
    var DOTLOTTIE_VERSION = '0.64.0';
    var DOTLOTTIE_BASE = 'https://unpkg.com/@lottiefiles/dotlottie-web@' + DOTLOTTIE_VERSION + '/dist/';
    var libPromise = null;

    function loadDotLottie() {
        if (!libPromise) {
            libPromise = import(DOTLOTTIE_BASE + 'index.js').then(function (m) {
                m.DotLottie.setWasmUrl(DOTLOTTIE_BASE + 'dotlottie-player.wasm');
                return m.DotLottie;
            });
        }
        return libPromise;
    }

    function setupLottie(box) {
        var src = box.getAttribute('data-lottie-src');
        var player = null;
        var visible = false;
        var failed = false;

        function fail() {
            failed = true;
            try { if (player) player.destroy(); } catch (e) { /* yoksay */ }
            var c = box.querySelector('canvas');
            if (c) c.remove();
        }

        function sync() {
            if (!player || !player.isLoaded) return;
            try { visible ? player.play() : player.pause(); } catch (e) { /* yoksay */ }
        }

        // Ekrana yaklaşınca kütüphaneyi ve dosyayı yükle (lazy)
        var loadObserver = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            loadObserver.disconnect();
            loadDotLottie().then(function (DotLottie) {
                if (failed) return;
                var canvas = document.createElement('canvas');
                canvas.className = 'kh-lottie__canvas';
                box.appendChild(canvas);
                player = new DotLottie({
                    canvas: canvas,
                    src: src,
                    loop: true,
                    autoplay: false,
                    renderConfig: { autoResize: true }
                });
                player.addEventListener('load', function () {
                    box.classList.add('is-ready');
                    sync();
                });
                player.addEventListener('loadError', fail);
            }).catch(fail);
        }, { rootMargin: '200px 0px' });
        loadObserver.observe(box);

        // Yalnızca görünürken oynat
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            sync();
        }, { threshold: 0.15 }).observe(box);
    }

    function initLottie() {
        var boxes = document.querySelectorAll('.kh-lottie[data-lottie-src]');
        if (!boxes.length || reduceMotion || !('IntersectionObserver' in window)) return;
        boxes.forEach(setupLottie);
    }

    // Aşama 5: süreç akışı - kaydırdıkça dolan çizgi + ilerleyen kamyon
    function initProcess() {
        var root = document.querySelector('.kh-process');
        if (!root || reduceMotion) return;
        if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;

        var gsap = window.gsap;
        gsap.registerPlugin(window.ScrollTrigger);

        var steps = Array.prototype.slice.call(root.querySelectorAll('.kh-step'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.kh-process__dot'));
        var fill = root.querySelector('.kh-process__fill');
        var truck = root.querySelector('.kh-process__truck');
        var rail = root.querySelector('.kh-process__rail');
        var mobileMq = window.matchMedia('(max-width: 767px)');
        var positions = steps.map(function (_, i) { return i / (steps.length - 1); });
        var state = { p: 0 };

        root.classList.add('kh-process--js');

        // Konumları ölç: masaüstünde eşit aralık, mobilde ikonların gerçek yüksekliği
        function layout() {
            if (mobileMq.matches) {
                var rootTop = root.getBoundingClientRect().top;
                var centers = steps.map(function (s) {
                    var r = s.querySelector('.kh-step__icon').getBoundingClientRect();
                    return r.top + r.height / 2 - rootTop;
                });
                var h = centers[centers.length - 1] - centers[0];
                rail.style.setProperty('--rail-top', centers[0] + 'px');
                rail.style.setProperty('--rail-h', h + 'px');
                positions = centers.map(function (c) { return h > 0 ? (c - centers[0]) / h : 0; });
            } else {
                rail.style.removeProperty('--rail-top');
                rail.style.removeProperty('--rail-h');
                positions = steps.map(function (_, i) { return i / (steps.length - 1); });
            }
            dots.forEach(function (d, i) { d.style.setProperty('--pos', positions[i]); });
            render();
        }

        function render() {
            var p = state.p;
            var vertical = mobileMq.matches;
            gsap.set(fill, vertical ? { scaleY: p, scaleX: 1 } : { scaleX: p, scaleY: 1 });
            if (vertical) {
                truck.style.left = '';
                truck.style.top = (p * 100) + '%';
            } else {
                truck.style.top = '';
                truck.style.left = (p * 100) + '%';
            }
            steps.forEach(function (step, i) {
                var reached = p >= positions[i] - 0.001;
                var was = step.classList.contains('is-reached');
                if (reached === was) return;
                step.classList.toggle('is-reached', reached);
                if (dots[i]) dots[i].classList.toggle('is-reached', reached);
                if (reached) {
                    gsap.fromTo(step.querySelector('.kh-step__icon'),
                        { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)' });
                }
            });
        }

        function setTarget(progress) {
            gsap.to(state, { p: progress, duration: 0.35, ease: 'power2.out', overwrite: true, onUpdate: render });
        }

        window.ScrollTrigger.create({
            trigger: root,
            start: 'top 75%',
            end: 'bottom 45%',
            onUpdate: function (self) { setTarget(self.progress); },
            onRefresh: function (self) { state.p = self.progress; render(); }
        });
        window.ScrollTrigger.addEventListener('refreshInit', layout);
        layout();
    }

    // Aşama 6: sayaçlar - [data-count] içindeki "%30", "10+", "₺5M" gibi metni görünür olunca sayar
    function initCounters() {
        var CountUp = window.countUp && window.countUp.CountUp;
        var els = document.querySelectorAll('[data-count]');
        if (!els.length || !CountUp || reduceMotion || !('IntersectionObserver' in window)) return;

        var items = [];
        els.forEach(function (el) {
            var m = el.textContent.trim().match(/^(\D*?)(\d+)(\D*)$/);
            if (!m) return;                    // "24/7" gibi: olduğu gibi kalsın
            var end = parseInt(m[2], 10);
            if (end === 0) return;             // 0'dan 0'a sayılmaz
            var counter = new CountUp(el, end, {
                prefix: m[1], suffix: m[3], duration: 2.2, separator: '.', startVal: 0
            });
            if (counter.error) return;
            el.textContent = m[1] + '0' + m[3];
            items.push({ el: el, counter: counter });
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                items.forEach(function (it) {
                    if (it.el === entry.target) it.counter.start();
                });
            });
        }, { threshold: 0.6 });
        items.forEach(function (it) { io.observe(it.el); });
    }

    // Aşama 8: sayfa başına dön butonu
    function initToTop() {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kh-to-top';
        btn.setAttribute('aria-label', 'Sayfa başına dön');
        btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span>';
        document.body.appendChild(btn);

        var ticking = false;
        function update() {
            btn.classList.toggle('is-visible', window.scrollY > 500);
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        }, { passive: true });
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
        update();
    }

    function init() {
        initAos();
        initCardIcons();
        initLottie();
        initProcess();
        initCounters();
        initToTop();
    }

    // Navbar/footer sonradan enjekte edilir ve font yüklenir: konumları tazele
    window.addEventListener('load', function () {
        if (window.AOS && !reduceMotion) window.AOS.refresh();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
