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

    // Lazy load cart sidebar product images
    const lazyLoadCartSidebarProductImg = () => {
        const images = document.querySelectorAll(".cart__sidebarProductImg");

        images.forEach(img => {
            ImgObserver.observe(img);
        })
    }

    lazyLoadCartSidebarProductImg();
})

const cartSidebarProductRemove = (e) => {
  let productId = e.id;

  if (productId) {
    productId = productId.split("cart-sidebar-product-remove-")[1];

    deleteProductFromCartSidebar(productId);
  }
};

async function deleteProductFromCartSidebar(uid) {
  const CSRFTOKEN = getCookie("csrftoken");

  let formData = new FormData();
  formData.append("uid", uid);

  await fetch(`/remove-product/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": CSRFTOKEN,
    },
    body: formData,
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        alert("Something is wrong!");
      }
    })
    .then((data) => {
      if (data.error && data.user_not_login) {
        window.location.href = "/authentication/login/";
      } else if (data.error) {
        $.Toast("Something is wrong!", "Failed to remove product...", "error");
      } else if (!data.error && data.product_remove_success) {
        $(`#cart-sidebar-product-${uid}`).remove();

        // If cart gets empty
        if (data.cart_counter === 0) {
          const div = document.createElement("div");
          div.setAttribute("id", "cart__sidebarEmptyProduct");
          div.setAttribute("class", "mt-10");
          div.innerHTML = `
            <h5 class="font-semibold text-rose-500 text-center">Your cart is empty!</h5>
          `;

          $("#cart__sidebarProductMainDiv").append(div);
          $("#mobile__cartCounter").addClass("hidden");
          $("#mobile__cartCounter").text("");
          $("#cart__counter").addClass("hidden");
          $("#cart__counter").text("");

            $("#cart__sidebarTotalPrice").text("$0.00");
        } else {
          $("#mobile__cartCounter").text(data.cart_counter);
          $("#cart__counter").text(data.cart_counter);
            $("#cart__sidebarTotalPrice").text(`\$${data.total_price}`);
        }
      }
    })
    .catch((err) => console.error(err));
}
