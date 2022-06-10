window.addEventListener("DOMContentLoaded", () => {
    const homeNewestProductBtn = document.getElementById("home__newestProductBtn");
    const homeBestSellersProductBtn = document.getElementById("home__bestSellersProductBtn");
    const homeCheapestProductBtn = document.getElementById("home__cheapestProductBtn");

    const homeNewestProducts = document.getElementById("home__newestProducts");
    const homeBestSellerProducts = document.getElementById("home__bestSellerProducts");
    const homeCheapestProducts = document.getElementById("home__cheapestProducts");

    const homeProductSpinner = document.getElementById("home__productSpinner");

    // Show home featured products
    const showHomeFeaturedProducts = (btnId) => {
        if (btnId === 1) {  // For newest products
            homeNewestProductBtn.classList.add("home__productActiveBtn");
            homeBestSellersProductBtn.classList.remove("home__productActiveBtn");
            homeCheapestProductBtn.classList.remove("home__productActiveBtn");

            homeBestSellerProducts.classList.add("hidden");
            homeCheapestProducts.classList.add("hidden");
            
            setTimeout(() => {
                homeProductSpinner.classList.add("hidden");
                homeNewestProducts.classList.remove("hidden");
            }, 200)
        } else if (btnId == 2) {    // For best selling products
            homeNewestProductBtn.classList.remove("home__productActiveBtn");
            homeBestSellersProductBtn.classList.add("home__productActiveBtn");
            homeCheapestProductBtn.classList.remove("home__productActiveBtn");

            homeNewestProducts.classList.add("hidden");
            homeCheapestProducts.classList.add("hidden");
            
            setTimeout(() => {
                homeProductSpinner.classList.add("hidden");
                homeBestSellerProducts.classList.remove("hidden");
            }, 200)
        } else {    // For cheapest products
            homeNewestProductBtn.classList.remove("home__productActiveBtn");
            homeBestSellersProductBtn.classList.remove("home__productActiveBtn");
            homeCheapestProductBtn.classList.add("home__productActiveBtn");

            homeNewestProducts.classList.add("hidden");
            homeBestSellerProducts.classList.add("hidden");

            setTimeout(() => {
                homeProductSpinner.classList.add("hidden");
                homeCheapestProducts.classList.remove("hidden");
            }, 200)
        }
    }

    showHomeFeaturedProducts(1);
    homeProductSpinner.classList.remove("hidden");

    // Show newest products
    homeNewestProductBtn.addEventListener("click", () => {
        if (!homeNewestProductBtn.classList.contains("home__productActiveBtn")) {
            homeProductSpinner.classList.remove("hidden");
            showHomeFeaturedProducts(1);
        }
    });

    // Show best selling products
    homeBestSellersProductBtn.addEventListener("click", () => {
        if (!homeBestSellersProductBtn.classList.contains("home__productActiveBtn")) {
            homeProductSpinner.classList.remove("hidden");
            showHomeFeaturedProducts(2);
        }
    });

    // Show cheapest products
    homeCheapestProductBtn.addEventListener("click", () => {
        if (!homeCheapestProductBtn.classList.contains("home__productActiveBtn")) {
            homeProductSpinner.classList.remove("hidden");
            showHomeFeaturedProducts(3);
        }
    })

    const preLoadImage = (img) => {
        const src = img.getAttribute("data-src");

        if (!src) return;
        img.src = src;
    }

    const productImageObserver = new IntersectionObserver((entries, newestProductImgObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            preLoadImage(entry.target);
            productImageObserver.unobserve(entry.target);
        })
    }, {
        threshold: 0.2
    })

    // Home features products lazy load images
    const lazyLoadHomeFeaturedProductImages = () => {
        const images = document.querySelectorAll(".home__productImageContent > a > img");

        images.forEach(img => {
            productImageObserver.observe(img);
        })
    }

    lazyLoadHomeFeaturedProductImages();
})

