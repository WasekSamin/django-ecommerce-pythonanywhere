window.addEventListener("DOMContentLoaded", () => {
    const shopPriceFilterBtn = document.getElementById("shop__priceFilter");
    const shopProductSelectSortWay = document.getElementById("shop__productSort");
    const shopProductSearchInputField = document.querySelector(".shop__rightProductSearch > input");
    const shopMobileProductSearchField = document.querySelector(".shop__leftProductSearch > input");
    const productSearchModal = document.getElementById("product__searchMainDiv");

    const showProductSearchModal = () => {
        productSearchModal.classList.add("show__productSearchMainDiv");
        productSearchModal.querySelector("div").classList.add("show__productSearchModal");
        $("#search__productInput").focus();
    }

    // Product search modal for mid/big screen
    shopProductSearchInputField.addEventListener("focus", () => {
        showProductSearchModal();
    })

    // Product search modal for small screen
    shopMobileProductSearchField.addEventListener("focus", () => {
        $(".product__leftContent > div").css("left", "-100%");
        $(".product__leftContent").removeClass("show__productLeftContent");
        showProductSearchModal();
    })

    const filterMinPrice = document.getElementById("filter__minPrice");
    const filterMaxPrice = document.getElementById("filter__maxPrice");

    if (filterMinPrice && filterMaxPrice) {
        const minPrice = JSON.parse(filterMinPrice.innerText.trim());
        const maxPrice = JSON.parse(filterMaxPrice.innerText.trim());

        if (typeof(minPrice) === "number" && typeof(maxPrice) === "number") {
            $(".product__priceRangeMin").val(minPrice.toFixed(2));
            $(".product__priceRangeMax").val(maxPrice.toFixed(2));
        }
    }

    // Filter by price
    shopPriceFilterBtn.addEventListener("click", () => {
        const minPrice = $(".product__priceRangeMin").val();
        const maxPrice = $(".product__priceRangeMax").val();

        const currentLoc = window.location.href;
        let color = currentLoc.split("color=");
        let size = currentLoc.split("size=");
        let sortWay = currentLoc.split("sort=");
        // Getting category title
        let categoryTitle = currentLoc.split("product/category/");
        categoryTitle = categoryTitle[1].split("/")[0]; // Returns category title

        // For color
        if (color.length > 1) {
            color = color[1].split("/")[0];
        } else {
            color = null;
        }

        // For size
        if (size.length > 1) {
            size = size[1].split("/")[0];
        } else {
            size = null;
        }

        // For sorting way
        if (sortWay.length > 1) {
            sortWay = sortWay[1].split("/")[0];
        } else {
            sortWay = null;
        }

        // Navigate to category products filter page
        window.location.href = `/product/category/${categoryTitle}/price=${minPrice},${maxPrice}/color=${color !== null ? color : "none"}/size=${size !== null ? size : "none"}/sort=${sortWay !== null ? sortWay : "default"}/`;
    })

    // Filter by sorting
    shopProductSelectSortWay.addEventListener("change", (e) => {
        const sortWay = e.target.value;

        const currentLoc = window.location.href;
        const minPrice = $(".product__priceRangeMin").val();
        const maxPrice = $(".product__priceRangeMax").val();
        let color = currentLoc.split("color=");
        let size = currentLoc.split("size=");
        // Getting category title
        let categoryTitle = currentLoc.split("product/category/");
        categoryTitle = categoryTitle[1].split("/")[0]; // Returns category title

        if (color.length > 1) {
            color = color[1].split("/")[0];
        } else {
            color = null;
        }

        if (size.length > 1) {
            size = size[1].split("/")[0];
        } else {
            size = null;
        }

        // Navigate to category products filter page
        window.location.href = `/product/category/${categoryTitle}/price=${minPrice},${maxPrice}/color=${color !== null ? color : "none"}/size=${size !== null ? size : "none"}/sort=${sortWay}/`;
    })
})

// Filter by color
const shopProductColorSelect = (e) => {
    let colorTitle = e.id;

    if (colorTitle) {
        colorTitle = colorTitle.split("shop-product-")[1];
        if (colorTitle[0] === "#") {
            colorTitle = colorTitle.slice(1, );
        }

        const currentLoc = window.location.href;
        const minPrice = $(".product__priceRangeMin").val();
        const maxPrice = $(".product__priceRangeMax").val();
        let size = currentLoc.split("size=");
        let sortWay = currentLoc.split("sort=");
        // Getting category title
        let categoryTitle = currentLoc.split("product/category/");
        categoryTitle = categoryTitle[1].split("/")[0]; // Returns category title

        // For size
        if (size.length > 1) {
            size = size[1].split("/")[0];
        } else {
            size = null;
        }

        // For sorting way
        if (sortWay.length > 1) {
            sortWay = sortWay[1].split("/")[0];
        } else {
            sortWay = null;
        }

        // Navigate to category products filter page
        window.location.href = `/product/category/${categoryTitle}/price=${minPrice},${maxPrice}/color=${colorTitle}/size=${size !== null ? size : "none"}/sort=${sortWay !== null ? sortWay : "default"}/`;
    }
}

// Filter by size
const shopProductSizeSelect = (e) => {
    let sizeTitle = e.id;

    if (sizeTitle) {
        sizeTitle = sizeTitle.split("shop-product-")[1];

        const currentLoc = window.location.href;
        const minPrice = $(".product__priceRangeMin").val();
        const maxPrice = $(".product__priceRangeMax").val();
        let color = currentLoc.split("color=");
        let sortWay = currentLoc.split("sort=");
        // Getting category title
        let categoryTitle = currentLoc.split("product/category/");
        categoryTitle = categoryTitle[1].split("/")[0]; // Returns category title

        if (color.length > 1) {
            color = color[1].split("/")[0];
        } else {
            color = null;
        }

        if (sortWay.length > 1) {
            sortWay = sortWay[1].split("/")[0];
        } else {
            sortWay = null;
        }

        // Navigate to category products filter page
        window.location.href = `/product/category/${categoryTitle}/price=${minPrice},${maxPrice}/color=${color !== null ? color : "none"}/size=${sizeTitle}/sort=${sortWay !== null ? sortWay : "default"}/`;
    }
}