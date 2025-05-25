
    function isCentered(el, tolerance = 200) {
        const rect = el.getBoundingClientRect();
        const center = window.innerHeight / 2;
        return (
            rect.top < center + tolerance && rect.bottom > center - tolerance
        );
    }

    const elements = document.querySelectorAll("pre, img, video");

    window.addEventListener("scroll", () => {
        let activeFound = false;

        elements.forEach((el) => {
            if (!activeFound && isCentered(el)) {
                el.classList.add("active");
                activeFound = true;
            } else {
                el.classList.remove("active");
            }
        });
    });

    // Llamada inicial por si ya hay uno centrado al cargar
    window.dispatchEvent(new Event("scroll"));

    const targets = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, ul, ol, a, time, pre, img, video, nav",
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                } else {
                    entry.target.classList.remove("visible");
                }
            });
        },
        {
            root: null,
            threshold: 0, // solo necesita un poquito visible
        },
    );

    targets.forEach((el) => observer.observe(el));