window.addEventListener("DOMContentLoaded", () => {
    const preLoadImg = (img) => {
        const src = img.getAttribute("data-src");

        if (!src) return;
        img.src = src;
    }

    const imgObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            preLoadImg(entry.target);
            imgObserver.unobserve(entry.target);
        })
    }, {
        threshold: 0.2
    })

    const lazyLoadBlogImg = () => {
        const images = document.querySelectorAll(".blog__recentPostImg");

        images.forEach(img => {
            imgObserver.observe(img);
        })
    }

    lazyLoadBlogImg();
})