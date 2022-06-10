window.addEventListener("DOMContentLoaded", () => {
    const productMinPriceRange = document.querySelector(".product__priceRangeMin");
    const productMaxPriceRange = document.querySelector(".product__priceRangeMax");
    const productRangeMinVal = document.querySelector(".product__rangeMinVal");
    const productRangeMaxVal = document.querySelector(".product__rangeMaxVal");
    const showfilterProductBtn = document.querySelector(".show__filterProduct").querySelector("div");
    const hideProductFilterBtn = document.querySelector(".product__hideFilter").querySelector("div");
    const productLeftContent = document.querySelector(".product__leftContent");

    productMinPriceRange.addEventListener("input", (e) => {
        productRangeMinVal.innerText = `\$${e.target.value}`;
    })

    productMaxPriceRange.addEventListener("input", (e) => {
        productRangeMaxVal.innerText = `\$${e.target.value}`;
    })

    showfilterProductBtn.addEventListener("click", () => {
        productLeftContent.classList.add("show__productLeftContent");
        productLeftContent.querySelector("div").style.left = "0";
    })

    const closeProductFilterSidebar = () => {
        productLeftContent.classList.remove("show__productLeftContent");
        productLeftContent.querySelector("div").style.left = "-100%";
    }

    hideProductFilterBtn.addEventListener("click", () => {
        closeProductFilterSidebar();
    })

    document.addEventListener("click", (e) => {
        if (e.target.closest(".show__filterProduct > div") || (e.target.closest(".product__leftContent > div"))) return;
        closeProductFilterSidebar();
    })
})