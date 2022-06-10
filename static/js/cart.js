window.addEventListener("DOMContentLoaded", () => {
    const cartPromocodeForm = document.getElementById("cart__promocodeForm");
    const promocodeInput = document.getElementById("cart__promocode");
    const promoErrorMsg = document.getElementById("promo__errorMsg");
    
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

    // Lazy load cart product images
    const lazyLoadCartProductImg = () => {
        const images = document.querySelectorAll(".cart__productImg");

        images.forEach(img => {
            ImgObserver.observe(img);
        })
    }

    lazyLoadCartProductImg();

    // Promocde submit form
    if (cartPromocodeForm !== null) {
        cartPromocodeForm.addEventListener("submit", (e) => {
            e.preventDefault();
    
            promoErrorMsg.classList.add("hidden");
    
            if (!promocodeInput || promocodeInput.value.trim() === "") {
                return
            } else {
                submitPromocode(promocodeInput.value.trim());
            }
        })
    }

    const showPromoErrorMsg = (msg) => {
        $("#promo__errorMsg").text(msg);
        $("#promo__errorMsg").removeClass("hidden");
    }

    async function submitPromocode(promocode) {
        const CSRFTOKEN = getCookie("csrftoken");

        let formData = new FormData();
        formData.append("promocode", promocode);

        await fetch("/apply-promocode/", {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRFTOKEN
            },
            body: formData
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                alert("Failed to apply promocode!");
            }
        }).then(data => {
            if (data.error && data.user_not_login) {
                window.location.href = "/authentication/login/";
            } else if (data.error && data.promo_expired) {
                showPromoErrorMsg("Promo code is expired!");
            } else if (data.error && data.code_already_applied) {
                showPromoErrorMsg("You have already used this promo code!");
            } else if (data.error && data.invalid_code) {
                showPromoErrorMsg("Sorry! Invalid promo code.");
            } else if (data.error) {
                $.Toast("Failed!", "Failed to apply promo code...", "error");
            } else if (!data.error && data.applied_promocode) {
                $("#cart__subtotalPrice").html(`\$${data.total_price} <span id="promo__discount" class="text-slate-500 font-medium">(${data.discount_percentage}% OFF)</span>`);
                $("#cart__totalPrice").text(`\$${(Number(data.total_price) + Number(data.shipping_charge))}`);

                document.getElementById("cart__subtotalPrice").scrollIntoView({behavior: "smooth"});
                
                $.Toast("Success!", "Promo code applied successfully...", "success");
            }
        }).catch(err => console.error(err));
    }
})

// Cart product quantity increase
const cartProductQtyIncrease = (e) => {
    let cartItemId = e.id;

    if (cartItemId) {
        cartItemId = cartItemId.split("cart-item-qty-increase-")[1];
        const productQty = Number(document.getElementById(`cart-item-qty-${cartItemId}`).value) + 1;

        $(`#cart-item-qty-${cartItemId}`).val(productQty);

        updateCart(cartItemId, productQty, "update");
    }
}

// Cart product quantity decrease
const cartProductQtyDecrease = (e) => {
    let cartItemId = e.id;

    if (cartItemId) {
        cartItemId = cartItemId.split("cart-item-qty-decrease-")[1];
        const productQty = Number(document.getElementById(`cart-item-qty-${cartItemId}`).value) - 1;

        $(`#cart-item-qty-${cartItemId}`).val(productQty);

        if (productQty < 1) {
            $(`#cart-item-${cartItemId}`).remove();
            updateCart(cartItemId, productQty, "remove");
        } else {
            updateCart(cartItemId, productQty, "update");
        }
    }
}

// Cart product remove
const cartItemRemove = (e) => {
    let cartItemId = e.id;

    if (cartItemId) {
        cartItemId = cartItemId.split("cart-item-remove-")[1];
        $(`#cart-item-${cartItemId}`).remove();
        updateCart(cartItemId, 0, "remove");
    }
}

// Cart update quantity
function updateCart(cartItemId, productQty, action) {
    if (action === "update") {
        updateCartItem(cartItemId, productQty);
    } else if (action === "remove") {
        removeCartItem(cartItemId);
    }
}

// Upade cart and cartitem
async function updateCartItem(cartItemId, productQty) {
    const CSRFTOKEN = getCookie("csrftoken");

    let formData = new FormData();
    formData.append("cartItemId", cartItemId);
    formData.append("qty", productQty);

    await fetch("/update-cartitem/", {
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
        } else if (data.error && data.invalid_format) {
            alert("Invaild format!");
        } else if (data.error) {
            alert("Something is wrong!");
        } else if (!data.error && data.cart_updated) {
            $(`#cart-item-subtotal-${cartItemId}`).text(`\$${data.product_update_price}`);
            if (data.promo_discount !== null) {
                $("#cart__subtotalPrice").html(`\$${data.total_price} <span id="promo__discount" class="text-slate-500 font-medium">(${data.promo_discount}% OFF)</span>`);
            } else {
                $("#cart__subtotalPrice").text(`\$${data.total_price}`);
            }
            $("#cart__shippingCharge").text(`\$${data.shipping_charge}`);
            $("#cart__totalPrice").text(`\$${(Number(data.total_price) + Number(data.shipping_charge)).toFixed(2)}`);
        }
    }).catch(err => console.error(err));
}

// Remove product from the cart
async function removeCartItem(cartItemId) {
    const CSRFTOKEN = getCookie("csrftoken");

    let formData = new FormData();
    formData.append("uid", cartItemId);

    await fetch("/remove-product/", {
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
        } else if (data.error) {
            alert("Something is wrong!");
        } else if (!data.error && data.product_remove_success) {
            $("#cart__subtotalPrice").text(`\$${data.total_price}`);
            $("#cart__shippingCharge").text(`\$${data.shipping_charge}`);
            $("#cart__totalPrice").text(`\$${(Number(data.total_price) + Number(data.shipping_charge))}`);

            // Update navbar cart counter
            if (data.cart_counter === 0) {
                $("#mobile__cartCounter").addClass("hidden");
                $("#mobile__cartCounter").text("");
                $("#cart__counter").addClass("hidden");
                $("#cart__counter").text("");

                $("#cart__tableDiv").remove();

                // Remove table and show no product in cart text
                const noProduct = document.createElement("p");
                noProduct.setAttribute("class", "mt-5 mb-28 text-center text-rose-500 font-semibold")
                noProduct.innerText = "Your cart is empty!";

                document.getElementById("cart__mainDiv").appendChild(noProduct);

                $("#cart__subtotalPrice").text("$0.00");
                $("#cart__shippingCharge").text("$0.00");
                $("#cart__totalPrice").text("$0.00");
            } else {
                $("#cart__counter").text(data.cart_counter);
                $("#mobile__cartCounter").text(data.cart_counter);

                if (data.promo_discount !== null) {
                    $("#cart__subtotalPrice").html(`\$${data.total_price} <span id="promo__discount" class="text-slate-500 font-medium">(${data.promo_discount}% OFF)</span>`);
                } else {
                    $("#cart__subtotalPrice").text(`\$${data.total_price}`);
                }
            }
        }
    }).catch(err => console.error(err));
}