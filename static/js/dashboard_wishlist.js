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

    const lazyLoadDashboardWishlistImages = () => {
        const images = document.querySelectorAll(".home__productImageContent > a > img");

        images.forEach(img => {
            imgObserver.observe(img)
        })
    }

    lazyLoadDashboardWishlistImages();
})

const removeFromDashboardWishlist = (e) => {
    let productId = e.id;

    if (productId) {
        productId = productId.split("dashboard-product-wishlist-")[1];
        removeProductFromDashboardWishlist(productId);
    }
}

async function removeProductFromDashboardWishlist(uid) {
    const CSRFTOKEN = getCookie("csrftoken");

    if (CSRFTOKEN === null) {
      window.location.href = "/authentication/login/";
      return;
    }

  let formData = new FormData();

  formData.append("uid", uid);

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
      alert("Something is wrong!");
    }
  }).then(data => {
    if (data.error && data.user_not_login) {
      window.location.href = "/authentication/login/";
    } else if (data.error && data.wishlist_not_exist) {
      $.Toast("Something is wrong!", "Failed to remove...", "error");
    } else if (!data.error && data.wishlist_product_remove_success) {
        $(`#dashboard-wishlist-product-div-${uid}`).remove();
        if (data.wishlist_counter === 0) {
            $("#navbar__wishlistCounter").addClass("hidden");
            $("#navbar__wishlistCounter").text("");

            const wishlistEmptyDiv = document.createElement("div");
            wishlistEmptyDiv.setAttribute("class", "mt-5 mb-60");
            wishlistEmptyDiv.innerHTML = `
                <p class="text-rose-500 font-semibold text-center">You have no product in your wishlist!</p>
            `
            
            document.getElementById("dashboard__wishlistMainDiv").appendChild(wishlistEmptyDiv);
        } else {
            $("#navbar__wishlistCounter").text(data.wishlist_counter)
        }
    }
  }).catch(err => console.error(err));
}