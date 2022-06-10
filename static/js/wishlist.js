window.addEventListener("DOMContentLoaded", () => {
    const preLoadImage = (img) => {
        const src = img.getAttribute("data-src");

        if (!src) return;
        img.src = src;
    }

    const ImgObserver = new IntersectionObserver((entries, newestProductImgObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            preLoadImage(entry.target);
            ImgObserver.unobserve(entry.target);
        })
    }, {
        threshold: 0.2
    })

    // Lazy load wishlist product images
    const lazyLoadWishlistProductImg = () => {
        const images = document.querySelectorAll(".wishlist__productImg");

        images.forEach(img => {
            ImgObserver.observe(img);
        })
    }

    lazyLoadWishlistProductImg();
})

const wishlistMainDiv = document.getElementById("wishlist__mainDiv");

const wishlistRemove = async(e) => {
    let productId = e.id;

    if (productId) {
        productId = productId.split("wishlist-product-remove-")[1];

        const CSRFTOKEN = getCookie("csrftoken");

        if (CSRFTOKEN === null) {
            window.location.href = "/authentication/login/";
            return;
        }

        let formData = new FormData();
        formData.append("uid", productId);
        
        await fetch("/remove-from-wishlist/", {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRFTOKEN
            },
            body: formData
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                alert("Failed to remove product!");
            }
        }).then(data => {
            if (data.error && data.user_not_login) {
                window.location.href = "/authentication/login/";
            } else if (data.error && data.wishlist_not_exist) {
                $.Toast("Something is wrong!", "Failed to remove...", "error");
            } else if (!data.error && data.wishlist_product_remove_success) {
                // Remove product from wishlist
                $(`#wishlist-product-${productId}`).remove();

                // Wishlist counter on navbar
                if (data.wishlist_counter === 0) {
                    $("#navbar__wishlistCounter").addClass("hidden");
                    $("#navbar__wishlistCounter").text("");

                    $("#wishlist__productTableDiv").remove();
                    const emptyWishlistText = document.createElement("p");
                    emptyWishlistText.setAttribute("class", "mt-5 mb-28 text-center text-rose-500 font-semibold");
                    emptyWishlistText.innerText = "Your wishlist is empty!";

                    wishlistMainDiv.appendChild(emptyWishlistText);
                } else {
                    $("#navbar__wishlistCounter").text(data.wishlist_counter)
                }

                $.Toast("Remove Successful!", "Remove from your wishlist...", "success");
            }
        })
    }
}