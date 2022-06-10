window.addEventListener("DOMContentLoaded", () => {
    const preLoadImage = (img) => {
        const src = img.getAttribute("data-src");
        
        if (!src) return;
        img.src = src;
    }

    const imgObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            preLoadImage(entry.target);
            imgObserver.unobserve(entry.target);
        })
    }, {
        threshold: 0.2
    })

    const lazyLoadUserImages = () => {
        const images = document.querySelectorAll(".product__detailUserImg");

        images.forEach(img => {
            imgObserver.observe(img);
        })
    }

    lazyLoadUserImages();
})