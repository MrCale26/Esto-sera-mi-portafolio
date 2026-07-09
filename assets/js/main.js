const revealElements = document.querySelectorAll(".reveal");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const nav = document.querySelector("nav");
const navItems = navLinks ? navLinks.querySelectorAll("a") : [];
const projectSliders = document.querySelectorAll(".project-slider");
const autoGalleries = document.querySelectorAll("[data-gallery-folder]");

revealElements.forEach(element => {
    element.classList.add("opacity-0", "translate-y-8", "transition-all", "duration-700");
});

const showRevealElement = element => {
    element.classList.remove("opacity-0", "translate-y-8");
    element.classList.add("opacity-100", "translate-y-0");
};

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            showRevealElement(entry.target);
            revealObserver.unobserve(entry.target);
        });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
);

revealElements.forEach(element => revealObserver.observe(element));

window.setTimeout(() => {
    revealElements.forEach(element => {
        if (element.classList.contains("opacity-0")) {
            showRevealElement(element);
        }
    });
}, 500);

projectSliders.forEach(slider => {
    const image = slider.querySelector(".project-slider-image");
    const caption = slider.querySelector(".project-slider-caption");
    const dots = Array.from(slider.querySelectorAll(".project-slider-dot"));
    const prevButton = slider.querySelector(".project-slider-prev");
    const nextButton = slider.querySelector(".project-slider-next");

    if (!image || !caption || !dots.length) return;

    let currentIndex = dots.findIndex(dot => dot.getAttribute("aria-pressed") === "true");
    if (currentIndex < 0) currentIndex = 0;
    let autoplayId = null;
    let resumeTimeoutId = null;

    const setSlide = index => {
        const dot = dots[index];
        if (!dot) return;

        image.src = dot.dataset.image;
        image.alt = dot.dataset.alt;
        caption.textContent = dot.dataset.caption;

        dots.forEach((item, itemIndex) => {
            const isActive = itemIndex === index;
            item.setAttribute("aria-pressed", String(isActive));
            item.classList.toggle("w-8", isActive);
            item.classList.toggle("bg-emerald-400", isActive);
            item.classList.toggle("w-2.5", !isActive);
            item.classList.toggle("bg-white/25", !isActive);
        });

        currentIndex = index;
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            pauseAutoplayTemporarily();
            setSlide(index);
        });
    });

    const goToPrevious = () => {
        pauseAutoplayTemporarily();
        const previousIndex = (currentIndex - 1 + dots.length) % dots.length;
        setSlide(previousIndex);
    };

    const goToNext = () => {
        pauseAutoplayTemporarily();
        const nextIndex = (currentIndex + 1) % dots.length;
        setSlide(nextIndex);
    };

    if (prevButton) {
        prevButton.addEventListener("click", goToPrevious);
    }

    if (nextButton) {
        nextButton.addEventListener("click", goToNext);
    }

    const startAutoplay = () => {
        if (slider.dataset.autoplay !== "true" || dots.length <= 1 || autoplayId) return;

        autoplayId = window.setInterval(() => {
            const nextIndex = (currentIndex + 1) % dots.length;
            setSlide(nextIndex);
        }, 3200);
    };

    const stopAutoplay = () => {
        if (autoplayId) {
            window.clearInterval(autoplayId);
            autoplayId = null;
        }
    };

    const pauseAutoplayTemporarily = () => {
        stopAutoplay();

        if (resumeTimeoutId) {
            window.clearTimeout(resumeTimeoutId);
        }

        resumeTimeoutId = window.setTimeout(() => {
            startAutoplay();
        }, 5000);
    };

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("touchstart", pauseAutoplayTemporarily, { passive: true });

    startAutoplay();
});

const imageExists = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
});

autoGalleries.forEach(async gallery => {
    const folder = gallery.dataset.galleryFolder;
    const count = Number(gallery.dataset.galleryCount || 4);
    const title = gallery.dataset.galleryTitle || "Imagen del proyecto";
    const fallbackImages = (gallery.dataset.galleryFallback || "")
        .split("|")
        .map(item => item.trim())
        .filter(Boolean);

    if (!folder || !count) return;

    const extensions = (gallery.dataset.galleryExtensions || "png,jpg,jpeg,webp")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    const candidates = [];

    for (let index = 1; index <= count; index += 1) {
        extensions.forEach(extension => {
            candidates.push(`${folder}/imagen-${index}.${extension}`);
        });
    }

    const checkedImages = await Promise.all(candidates.map(imageExists));
    let images = checkedImages.filter(Boolean);

    if (!images.length && fallbackImages.length) {
        const checkedFallbacks = await Promise.all(fallbackImages.map(imageExists));
        images = checkedFallbacks.filter(Boolean);
    }

    if (!images.length) return;

    let currentIndex = 0;

    gallery.innerHTML = `
        <div class="relative">
            <figure class="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                <img src="${images[0]}" alt="${title}" class="auto-gallery-image h-[22rem] w-full object-contain object-center p-2 transition duration-700 sm:h-[28rem] lg:h-[34rem]">
            </figure>
            <div class="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
                <button type="button" class="auto-gallery-prev pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-white shadow-lg shadow-black/30 backdrop-blur transition hover:border-emerald-400/30 hover:text-emerald-300" aria-label="Imagen anterior">
                    <span aria-hidden="true">&lt;</span>
                </button>
                <button type="button" class="auto-gallery-next pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-white shadow-lg shadow-black/30 backdrop-blur transition hover:border-emerald-400/30 hover:text-emerald-300" aria-label="Imagen siguiente">
                    <span aria-hidden="true">&gt;</span>
                </button>
            </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="auto-gallery-caption font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">${title}</p>
            <div class="auto-gallery-dots flex items-center gap-2"></div>
        </div>
    `;

    const image = gallery.querySelector(".auto-gallery-image");
    const caption = gallery.querySelector(".auto-gallery-caption");
    const dotsContainer = gallery.querySelector(".auto-gallery-dots");
    const prevButton = gallery.querySelector(".auto-gallery-prev");
    const nextButton = gallery.querySelector(".auto-gallery-next");

    const setImage = index => {
        currentIndex = (index + images.length) % images.length;
        image.src = images[currentIndex];
        image.alt = `${title} ${currentIndex + 1}`;
        caption.textContent = `${title} ${currentIndex + 1}`;

        dotsContainer.querySelectorAll("button").forEach((dot, dotIndex) => {
            const isActive = dotIndex === currentIndex;
            dot.classList.toggle("w-8", isActive);
            dot.classList.toggle("bg-emerald-400", isActive);
            dot.classList.toggle("w-2.5", !isActive);
            dot.classList.toggle("bg-white/25", !isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });
    };

    images.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === 0
            ? "h-2.5 w-8 rounded-full bg-emerald-400 transition"
            : "h-2.5 w-2.5 rounded-full bg-white/25 transition";
        dot.setAttribute("aria-label", `Mostrar imagen ${index + 1}`);
        dot.setAttribute("aria-pressed", String(index === 0));
        dot.addEventListener("click", () => setImage(index));
        dotsContainer.appendChild(dot);
    });

    prevButton.addEventListener("click", () => setImage(currentIndex - 1));
    nextButton.addEventListener("click", () => setImage(currentIndex + 1));
});

const themeToggle = document.getElementById("theme-toggle");

const applyTheme = mode => {
    const isLight = mode === "light";
    document.body.classList.toggle("light-mode", isLight);
    document.body.classList.toggle("dark-mode", !isLight);
    if (themeToggle) {
        themeToggle.setAttribute("aria-label", isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
        themeToggle.innerHTML = isLight ?
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2"></path><path d="M12 21v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M1 12h2"></path><path d="M21 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path></svg>` :
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
};

const currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const newTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

if (menuToggle && navLinks) {
    const isDesktop = () => window.innerWidth >= 768;

    const closeMenu = () => {
        menuToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
    };

    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        navLinks.classList.toggle("hidden");
        document.body.classList.toggle("overflow-hidden");
    });

    navItems.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", event => {
        if (isDesktop()) return;
        if (menuToggle.getAttribute("aria-expanded") !== "true") return;
        if (nav && nav.contains(event.target)) return;

        closeMenu();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (isDesktop()) {
            navLinks.classList.remove("hidden");
            document.body.classList.remove("overflow-hidden");
            menuToggle.setAttribute("aria-expanded", "false");
            return;
        }

        if (menuToggle.getAttribute("aria-expanded") !== "true") {
            navLinks.classList.add("hidden");
        }
    });
}
