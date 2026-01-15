document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ZÍSKÁNÍ NÁZVU STRÁNKY (PRO CHYTROU NAVIGACI) ---
    function getPageName(url) {
        let cleanPath = url.split(/[?#]/)[0];
        let pageName = cleanPath.split('/').pop();
        if (pageName === '' || pageName === '/') {
            return 'index.html';
        }
        return pageName;
    }

    // --- 2. INTERAKTIVNÍ MENU (Plovoucí kapsle) ---
    const navItems = document.querySelectorAll('.nav-item');
    const indicator = document.querySelector('.nav-indicator');
    
    const currentPageName = getPageName(window.location.href);

    function moveIndicator(el) {
        if (!indicator || !el) return;
        const width = el.offsetWidth;
        const left = el.offsetLeft;
        indicator.style.width = `${width}px`;
        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.opacity = '1';
    }

    let activeItem;
    navItems.forEach(item => {
        const linkPageName = getPageName(item.href);
        
        if (linkPageName === currentPageName) {
            item.classList.add('active-page');
            activeItem = item;
            setTimeout(() => moveIndicator(item), 100);
        }
        item.addEventListener('mouseenter', (e) => moveIndicator(e.target));
    });

    const navContainer = document.querySelector('.nav-links');
    if (navContainer) {
        navContainer.addEventListener('mouseleave', () => {
            if (activeItem) moveIndicator(activeItem);
            else if (indicator) indicator.style.opacity = '0';
        });
    }

    // --- 3. CHYTRÁ NAVIGACE (ZÁKAZ RELOADU) ---
    const allLinks = document.querySelectorAll('.nav-item, .logo-icon, .mobile-links a');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const current = getPageName(window.location.href);
            const target = getPageName(link.href);

            if (current === target) {
                e.preventDefault(); 
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                const hamburger = document.querySelector('.hamburger');
                const mobileMenu = document.querySelector('.mobile-menu-overlay');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // --- 4. MOBILNÍ MENU ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // --- 5. SCROLL REVEAL ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { 
                entry.target.classList.add('active'); 
                observer.unobserve(entry.target); 
            }
        });
    }, { rootMargin: '0px', threshold: 0.15 });
    revealElements.forEach(el => revealObserver.observe(el));

    // --- 6. 3D TILT (Postavička & Hologram) ---
    const tiltElement = document.querySelector('.hero-3d-char, .tilt-effect');
    const heroSection = document.querySelector('.hero, .hero-contact');
    
    if (tiltElement && heroSection && window.innerWidth > 991) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = tiltElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const sensitivity = tiltElement.classList.contains('tilt-effect') ? 20 : 30;
            const rotateX = (e.clientY - centerY) / -sensitivity; 
            const rotateY = (e.clientX - centerX) / sensitivity;
            
            let transformString = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            if (tiltElement.classList.contains('tilt-effect')) {
                 transformString += ` translateZ(20px)`;
            } else {
                 transformString += ` scale3d(1.05, 1.05, 1.05)`;
            }
            tiltElement.style.transform = transformString;
        });

        heroSection.addEventListener('mouseleave', () => {
            tiltElement.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)`;
        });
    }

    // --- 7. PARTICLES (Čáry na hlavní stránce) ---
    const anyHero = document.querySelector('.hero');
    if (window.innerWidth > 991 && anyHero) {
        const canvas = document.createElement('canvas'); 
        canvas.id = 'hero-canvas'; 
        anyHero.prepend(canvas);
        initParticles(canvas, anyHero);
    }

    // --- 8. ANIMACE VLN (Na stránce kontakt) ---
    const waveCanvas = document.getElementById('waves-canvas');
    if (waveCanvas) {
        initWaves(waveCanvas);
    }

    // --- 9. INTERAKTIVNÍ BLOB (Na stránce projekty) ---
    const blob = document.querySelector('.interactive-blob');
    if (blob && window.innerWidth > 991) {
        document.addEventListener('mousemove', (e) => {
            blob.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 3000, fill: "forwards" });
        });
    }

    // --- 10. SLIDESHOW ---
    const slides = document.querySelectorAll('.slide-img');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }

    // --- 11. KURZOR ---
    if (window.innerWidth > 991) {
        const cursorDot = document.createElement('div'); cursorDot.classList.add('cursor-dot'); document.body.appendChild(cursorDot);
        const cursorOutline = document.createElement('div'); cursorOutline.classList.add('cursor-outline'); document.body.appendChild(cursorOutline);
        initCursor(cursorDot, cursorOutline);
    }

    // --- 12. INIT MODAL ---
    initModal();

}); // KONEC DOMContentLoaded


// --- POMOCNÉ FUNKCE (DEFINICE) ---

// 1. Čáry (Particles)
function initParticles(canvas, container) {
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = container.offsetWidth; height = container.offsetHeight; canvas.width = width; canvas.height = height; }
    resize(); window.addEventListener('resize', resize);

    let particlesArray = [];
    const mouse = { x: null, y: null };
    container.addEventListener('mousemove', (e) => { const rect = container.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; });
    container.addEventListener('mouseleave', () => { mouse.x = undefined; mouse.y = undefined; });

    class Particle {
        constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.dX = (Math.random() - 0.5) * 0.4; this.dY = (Math.random() - 0.5) * 0.4; this.size = Math.random() * 2 + 1; }
        update() {
            if (this.x > width || this.x < 0) this.dX = -this.dX; if (this.y > height || this.y < 0) this.dY = -this.dY; this.x += this.dX; this.y += this.dY;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'; ctx.fill();
        }
    }
    function init() { particlesArray = []; const count = (width * height) / 9000; for (let i = 0; i < count; i++) particlesArray.push(new Particle()); }
    init();
    function animate() { ctx.clearRect(0, 0, width, height); particlesArray.forEach(p => p.update()); connect(); requestAnimationFrame(animate); }
    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const dx = particlesArray[a].x - particlesArray[b].x; const dy = particlesArray[a].y - particlesArray[b].y; const dist = dx * dx + dy * dy;
                if (dist < (width/7) * (height/7)) {
                    let opacity = (1 - dist/20000) * 0.1;
                    if (opacity > 0) { ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke(); }
                }
            }
            if (mouse.x !== undefined) {
                const dx = particlesArray[a].x - mouse.x; const dy = particlesArray[a].y - mouse.y; const dist = dx * dx + dy * dy;
                if (dist < 25000) { ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
            }
        }
    }
    animate();
}

// 2. Vlny (Waves)
function initWaves(canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    let lines = [];
    const config = { lineCount: 5, amplitude: 50, frequency: 0.01, speed: 0.02, color: '6, 182, 212' };

    for(let i = 0; i < config.lineCount; i++) {
        lines.push({ phase: Math.random() * Math.PI * 2, opacity: (i + 1) / config.lineCount * 0.5 });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        lines.forEach((line, index) => {
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            for (let x = 0; x < width; x += 10) {
                const y = (height / 2) + Math.sin(x * config.frequency + line.phase) * (config.amplitude * (1 - index * 0.1));
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(${config.color}, ${line.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            line.phase += config.speed + (index * 0.005);
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// 3. Kurzor
// ZRYCHLENÝ KURZOR (Hodnota 0.8 = skoro okamžitá reakce)
function initCursor(dot, outline) {
    let mouseX = 0; let mouseY = 0; let outlineX = 0; let outlineY = 0;
    
    document.addEventListener('mousemove', (e) => { 
        mouseX = e.clientX; 
        mouseY = e.clientY; 
        
        // Tečka (dot) se hýbe okamžitě vždy
        dot.style.left = mouseX + 'px'; 
        dot.style.top = mouseY + 'px'; 
    });

    function animate() { 
        // ZRYCHLENÍ: Změnil jsem to na 0.8 (velmi rychlé)
        // Můžeš zkusit i 0.9, pokud to chceš ještě rychlejší
        outlineX += (mouseX - outlineX) * 0.8; 
        outlineY += (mouseY - outlineY) * 0.8; 
        
        outline.style.left = outlineX + 'px'; 
        outline.style.top = outlineY + 'px'; 
        
        requestAnimationFrame(animate); 
    }
    
    animate();

    // Hover efekty na odkazy
    document.querySelectorAll('a, button, .btn, input, textarea, select, .project-card, .project-hero-visual, .nav-item, .logo-icon, .featured-card').forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// 4. Modal
function initModal() {
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTag = document.getElementById('modal-tag');
    const modalGallery = document.getElementById('modal-gallery'); // Track carouselu
    const modalImg = document.getElementById('modal-img'); // Pro projekty.html
    const closeModal = document.querySelector('.close-modal');
    
    // Ovládací prvky carouselu
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const counter = document.getElementById('carousel-counter');

    // Proměnné pro stav carouselu
    let currentImages = [];
    let currentIndex = 0;

    if (modal) {
        // Funkce pro zobrazení slidu
        const showSlide = (index) => {
            if (!modalGallery) return;
            const slides = modalGallery.querySelectorAll('img');
            
            // Ošetření indexu (cyklení)
            if (index >= slides.length) currentIndex = 0;
            else if (index < 0) currentIndex = slides.length - 1;
            else currentIndex = index;

            // Skrýt všechny, zobrazit aktuální
            slides.forEach(slide => slide.classList.remove('active'));
            slides[currentIndex].classList.add('active');

            // Aktualizace počítadla
            if (counter) counter.textContent = `${currentIndex + 1} / ${slides.length}`;
        };

        // Event Listenery pro tlačítka (jen jednou)
        if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

        // Spuštění modalu
        const triggers = document.querySelectorAll('.featured-card, .project-card, .project-hero-visual');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                if(trigger.tagName === 'A') e.preventDefault();
                if (trigger.classList.contains('no-modal')) return;
                const title = trigger.getAttribute('data-title');
                const desc = trigger.getAttribute('data-desc');
                const tag = trigger.getAttribute('data-tag');
                
                if(modalTitle) modalTitle.textContent = title;
                if(modalDesc) modalDesc.innerHTML = desc; // Zde funguje <br>
                if(modalTag) modalTag.textContent = tag;

                // --- LOGIKA CAROUSELU (Index) ---
                if (modalGallery) {
                    modalGallery.innerHTML = ''; 
                    const imagesString = trigger.getAttribute('data-images');
                    
                    if (imagesString) {
                        currentImages = imagesString.split(',');
                        currentImages.forEach((imgSrc, index) => {
                            const img = document.createElement('img');
                            img.src = imgSrc.trim();
                            img.alt = `${title} - obrázek ${index + 1}`;
                            if (index === 0) img.classList.add('active'); // První je aktivní
                            modalGallery.appendChild(img);
                        });
                        
                        // Reset na první slide
                        currentIndex = 0;
                        showSlide(0);
                        
                        // Zobrazit tlačítka jen pokud je víc fotek
                        if (currentImages.length > 1) {
                            prevBtn.style.display = 'flex';
                            nextBtn.style.display = 'flex';
                            counter.style.display = 'block';
                        } else {
                            prevBtn.style.display = 'none';
                            nextBtn.style.display = 'none';
                            counter.style.display = 'none';
                        }
                    } else {
                         // Fallback pro jednu fotku
                         const singleImg = trigger.getAttribute('data-image');
                         if(singleImg) {
                             modalGallery.innerHTML = `<img src="${singleImg}" class="active">`;
                             prevBtn.style.display = 'none';
                             nextBtn.style.display = 'none';
                             counter.style.display = 'none';
                         }
                    }
                }
                
                // --- LOGIKA PRO JEDEN OBRÁZEK (Projekty - starý modal) ---
                if (modalImg && !modalGallery) {
                     let image;
                     if(trigger.classList.contains('project-hero-visual')) {
                        const activeSlide = trigger.querySelector('.slide-img.active');
                        image = activeSlide ? activeSlide.src : trigger.getAttribute('data-image');
                     } else {
                        image = trigger.getAttribute('data-image');
                     }
                     modalImg.src = image;
                }

                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                setTimeout(() => { modal.classList.add('show'); }, 10);
            });
        });

        const closeMyModal = () => {
            modal.classList.remove('show'); 
            document.body.style.overflow = ''; 
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        };

        closeModal.addEventListener('click', closeMyModal);
        window.addEventListener('click', (e) => { if (e.target === modal) closeMyModal(); });
    }
}

// --- 13. BACK TO TOP BUTTON (Přidej toto na konec main.js) ---
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        // A) Sledování scrollování
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // B) Kliknutí = cesta nahoru
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    /* =========================================
   INTERAKTIVNÍ POZADÍ - PROPOJENÉ ČÁSTICE (NODES)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    
    // Nastavení myši (mimo obrazovku na začátku)
    let mouse = { x: -1000, y: -1000, radius: 150 };

    // --- KONFIGURACE ---
    const config = {
        particleCount: 80,    // Počet částic (méně je čistší)
        particleSize: 2,      // Velikost tečky
        speed: 0.5,           // Rychlost pohybu
        linkDistance: 120,    // Vzdálenost pro spojení čarou
        colorDot: '#cbd5e1',  // Barva běžné tečky (světle šedá)
        colorLine: 'rgba(203, 213, 225, 0.4)', // Barva čáry (průhledná šedá)
        colorAccent: '#06b6d4' // Tvoje tyrkysová (pro interakci s myší)
    };

    let particles = [];

    // Třída pro jednu částici
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Náhodný směr pohybu
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.radius = config.particleSize;
        }

        update() {
            // Pohyb
            this.x += this.vx;
            this.y += this.vy;

            // Odraz od stěn
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Interakce s myší
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                // Pokud je myš blízko, tečka se jemně odsune a přebarví
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * force * 2;
                this.y -= Math.sin(angle) * force * 2;
                this.isHovered = true;
            } else {
                this.isHovered = false;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Přebarvení, pokud je blízko myši
            ctx.fillStyle = this.isHovered ? config.colorAccent : config.colorDot;
            ctx.fill();
        }
    }

    // Inicializace
    function init() {
        resize();
        particles = [];
        // Na mobilu dáme méně částic kvůli výkonu
        const count = window.innerWidth < 768 ? config.particleCount / 2 : config.particleCount;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Změna velikosti okna
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // Hlavní animančí smyčka
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // 1. Aktualizace a vykreslení částic
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // 2. Vykreslení spojovacích čar
        connectParticles();

        requestAnimationFrame(animate);
    }

    // Funkce pro spojování blízkých částic
    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.linkDistance) {
                    // Čím blíže, tím méně průhledná čára
                    const opacity = 1 - (distance / config.linkDistance);
                    ctx.strokeStyle = `rgba(203, 213, 225, ${opacity * 0.5})`; // Používáme RGB hodnoty šedé
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Event listenery
    window.addEventListener('resize', () => {
        resize();
        // Při velké změně raději reinicializujeme
        if (Math.abs(width - window.innerWidth) > 100) init();
    });
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Spuštění
    init();
    animate();
});