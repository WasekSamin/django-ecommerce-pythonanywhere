window.addEventListener("DOMContentLoaded", () => {
    const navHamburger = document.getElementById("nav__hamburger");
    const navSidebar = document.getElementById("nav__sidebar");
    const navOverlay = document.getElementById("navbar__overlay");
    const navShop = document.getElementById("nav__shop");
    const navCategories = document.getElementById("navbar__categories");
    const navCategoryDiv = document.getElementById("nav__catDiv");
    const navbarSearchIconDiv = document.getElementById("navbar__searchIconDiv");
    const navbarMobileSearchIconDiv = document.getElementById("navbar__mobileSearchIconDiv");
    const productSearchModal = document.getElementById("product__searchMainDiv");

    const navCart = document.getElementById("nav__cart");
    const cartSidebar = document.getElementById("cart__sidebar");
    const closeCartSidebar = document.getElementById("close__cartSidebar");

    const showNavbarCategories = () => {
        navCategories.classList.add("show__navCategories");
        navCategoryDiv.style.height = "50vh";
    }

    const hideNavbarCategories = () => {
        navCategories.classList.remove("show__navCategories");
        navCategoryDiv.style.height = "0";
    }

    // Show navbar categories
    navShop.addEventListener("mouseover", () => {
        showNavbarCategories();
    })

    navCategories.addEventListener("mouseover", () => {
        showNavbarCategories();
    })

    // Hide navbar categories
    navShop.addEventListener("mouseleave", () => {
        hideNavbarCategories();
    })

    navCategories.addEventListener("mouseleave", () => {
        hideNavbarCategories();
    })

    navHamburger.addEventListener("click", () => {
        navSidebar.style.left = "0";
        navOverlay.classList.add("show__navbarOverlay");
    });

    const closeNavSidebar = () => {
        navSidebar.style.left = "-100%";
        navOverlay.classList.remove("show__navbarOverlay");
    }

    const closeCart = () => {
        cartSidebar.classList.remove("show__cartSidebar");
        cartSidebar.querySelector("div").style.right = "-100%";
    }

    navCart.addEventListener("click", () => {
        const currentPath = window.location.pathname;

        if (currentPath !== "/cart/" && currentPath !== "/checkout/") {
            cartSidebar.classList.add("show__cartSidebar");
            cartSidebar.querySelector("div").style.right = 0;
        } else {
            if (currentPath === "/checkout/") {
                window.location.href = "/cart/";
            } else {
                window.location.reload();
            }
        }
    })

    closeCartSidebar.addEventListener("click", () => {
        closeCart();
    })

    document.addEventListener("click", (e) => {
        if (e.target.closest("#nav__hamburger") 
            || e.target.closest("#nav__sidebar") 
            || e.target.closest("#nav__cart") 
            || e.target.closest("#cart__sidebar > div")) return;
        closeNavSidebar();
        closeCart();
    });

    const showProductSearchModal = () => {
        productSearchModal.classList.add("show__productSearchMainDiv");
        productSearchModal.querySelector("div").classList.add("show__productSearchModal");
        $("#search__productInput").focus();
    }

    // Show navbar search product modal
    navbarSearchIconDiv.addEventListener("click", () => {
        showProductSearchModal();
    })

    navbarMobileSearchIconDiv.addEventListener("click", () => {
        showProductSearchModal();
    })
})