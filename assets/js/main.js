const revealElements = document.querySelectorAll(".reveal");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const nav = document.querySelector("nav");
const navItems = navLinks ? navLinks.querySelectorAll("a") : [];
const projectSliders = document.querySelectorAll(".project-slider");

revealElements.forEach(element => {
    element.classList.add("opacity-0", "translate-y-8", "transition-all", "duration-700");
});

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.remove("opacity-0", "translate-y-8");
            entry.target.classList.add("opacity-100", "translate-y-0");
            revealObserver.unobserve(entry.target);
        });
    },
    { threshold: 0.2 }
);

revealElements.forEach(element => revealObserver.observe(element));

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
