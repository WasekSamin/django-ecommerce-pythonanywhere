window.addEventListener("DOMContentLoaded", () => {
    const scrollTopBtn = document.getElementById("scroll__toTop");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            $("#scroll__toTop").css("z-index", 2);
            $("#scroll__toTop").css("opacity", 1);
        } else {
            $("#scroll__toTop").css("z-index", -1);
            $("#scroll__toTop").css("opacity", 0);
        }
    });

    // Scroll to top
    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });
})