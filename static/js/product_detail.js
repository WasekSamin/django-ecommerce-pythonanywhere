window.addEventListener("DOMContentLoaded", () => {
  $("#product__mainImg").xzoom();

  $("#product__detailGallery").slick({
    slidesToShow: 5,
    slidesToScroll: 5,
    infinite: false,
    dots: false,
    arrows: true,
    prevArrow:
      '<button class="text-indigo-500 product__detailGallaerySlideBtn product__detailGalleryPrevBtn"><span class="iconify text-2xl" data-icon="akar-icons:circle-chevron-left-fill"></span></button>',
    nextArrow:
      '<button class="text-indigo-500 product__detailGallaerySlideBtn product__detailGalleryNextBtn"><span class="iconify text-2xl" data-icon="akar-icons:circle-chevron-right-fill"></span></button>',
    responsive: [
        {
            breakpoint: 850,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
            }
        },
        {
            breakpoint: 699,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 5,
            }
        },
        {
            breakpoint: 359,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
            }
        },
    ]
  });

    const productDetailDescBtn = document.getElementById("product__detailDescriptionBtn");
    const productDetailAdditionalInfoBtn = document.getElementById("product__detailAdditionalInfoBtn");
    const productDetailReviewBtn = document.getElementById("product__detailReviewBtn");

    const productDetailDescContent = document.getElementById("product__detailDescription");
    const productDetailAdditionalInfoContent = document.getElementById("product__detailAdditionalInfo");
    const productDetailReviewContent = document.getElementById("product__detailReview");

    const productDetailSpinner = document.getElementById("product__detailSpinner");

    const showProductExtraSection = (btnId) => {
        if (btnId === 1) {
            productDetailDescBtn.classList.add("border-y-2", "border-indigo-500", "active__productDetailBtn");
            productDetailAdditionalInfoBtn.classList.remove("border-y-2", "border-indigo-500", "active__productDetailBtn");
            productDetailReviewBtn.classList.remove("border-y-2", "border-indigo-500", "active__productDetailBtn");

            productDetailAdditionalInfoContent.classList.add("hidden");
            productDetailReviewContent.classList.add("hidden");

            setTimeout(() => {
                productDetailSpinner.classList.add("hidden");
                productDetailDescContent.classList.remove("hidden");
            }, 200);
        } else if (btnId === 2) {
            productDetailDescBtn.classList.remove("border-y-2", "border-indigo-500", "active__productDetailBtn");
            productDetailAdditionalInfoBtn.classList.add("border-y-2", "border-indigo-500", "active__productDetailBtn");
            productDetailReviewBtn.classList.remove("border-y-2", "border-indigo-500", "active__productDetailBtn");

            productDetailDescContent.classList.add("hidden");
            productDetailReviewContent.classList.add("hidden");

            setTimeout(() => {
                productDetailSpinner.classList.add("hidden");
                productDetailAdditionalInfoContent.classList.remove("hidden");
            }, 200);
        } else if (btnId === 3) {
            productDetailDescBtn.classList.remove("border-y-2", "border-indigo-500", "active__productDetailBtn");
            productDetailAdditionalInfoBtn.classList.remove("border-y-2", "border-indigo-500", "active__productDetailBtn");
            productDetailReviewBtn.classList.add("border-y-2", "border-indigo-500", "active__productDetailBtn");

            productDetailDescContent.classList.add("hidden");
            productDetailAdditionalInfoContent.classList.add("hidden");

            setTimeout(() => {
                productDetailSpinner.classList.add("hidden");
                productDetailReviewContent.classList.remove("hidden");
            }, 200);
        }
    }

    showProductExtraSection(1);
    productDetailSpinner.classList.remove("hidden");

    productDetailDescBtn.addEventListener("click", () => {
        if (!productDetailDescBtn.classList.contains("active__productDetailBtn")) {
            productDetailSpinner.classList.remove("hidden");
            showProductExtraSection(1);
        }
    })

    productDetailAdditionalInfoBtn.addEventListener("click", () => {
        if (!productDetailAdditionalInfoBtn.classList.contains("active__productDetailBtn")) {
            productDetailSpinner.classList.remove("hidden");
            showProductExtraSection(2);
        }
    })

    productDetailReviewBtn.addEventListener("click", () => {
        if (!productDetailReviewBtn.classList.contains("active__productDetailBtn")) {
            productDetailSpinner.classList.remove("hidden");
            showProductExtraSection(3);
        }
    })

    // Product detail share
    $("#product__detailShare").jsSocials({
        showLabel: false,
        showCount: false,
        shareIn: "popup",
        shares: ["twitter", "facebook", "pinterest"]
    });

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

    const lazyLoadProductDetailThumbnailImg = () => {
        const images = document.querySelectorAll(".product__detailThumbnailImg");

        images.forEach(img => {
            imgObserver.observe(img);
        })
    }

    lazyLoadProductDetailThumbnailImg();
});

// Change product main image on a thumbnail image click
const changeProductDetailMainImg = (e) => {
  if (e) {
    const getImage = e.querySelector("img");
    $("#product__mainImg").attr("src", getImage.src);
    $("#product__mainImg").attr("xoriginal", getImage.src);
  }
};

let productDetailSelectedColor = null, productDetailSelectedSize = null;
const productDetailClearBtn = document.getElementById("product__detailClearVariation");
const productQtyIncreaseBtn = document.getElementById("product__detailQtyIncreaseBtn");
const productQtyDecreaseBtn = document.getElementById("product__detailQtyDecreaseBtn");
const productQtyInputField = document.getElementById("product__detailQtyField");
const productDetailAddToCartBtn = document.getElementById("product__detailAddToCart");
const productDetailWishlistBtn = document.getElementById("product__detailWishlistBtn");
const productDetailColorErrorMsg = document.getElementById("product__detailColorErrorMsg");
const productDetailSizeErrorMsg = document.getElementById("product__detailSizeErrorMsg");

// If a color variation is clicked
function productDetailColorSelect(e) {
    let colorId = e.id;
    productDetailColorErrorMsg.classList.add("hidden");
    
    if (colorId) {
        colorId = colorId.split("product-detail-color-")[1];
        
        if (productDetailSelectedColor !== null) {
            document.getElementById(`product-detail-color-${productDetailSelectedColor}`).classList.remove("ring-2", "ring-indigo-600");
        }
        
        if (productDetailSelectedColor !== colorId) {
            productDetailSelectedColor = colorId;
            fetchSelectedVariationPriceOfProductDetail(productDetailSelectedColor);
        }
        e.classList.add("ring-2", "ring-indigo-600");
    }
}

// If a size variation is clicked
function productDetailSizeSelect(e) {
    let sizeId = e.id;
    productDetailSizeErrorMsg.classList.add("hidden");

    if (sizeId) {
        sizeId = sizeId.split("product-detail-size-")[1];

        if (productDetailSelectedSize !== null) {
            document.getElementById(`product-detail-size-${productDetailSelectedSize}`).classList.remove("ring-2", "ring-indigo-600");
        }

        if (productDetailSelectedSize !== sizeId) {
            productDetailSelectedSize = sizeId;
            fetchSelectedVariationPriceOfProductDetail(productDetailSelectedSize);
        }
        e.classList.add("ring-2", "ring-indigo-600");
    }
}

// Show price according to selected variation option
async function fetchSelectedVariationPriceOfProductDetail(uid) {    
    try {
        const productDetailId = JSON.parse(document.getElementById("product__uid").innerText);

        if (productDetailSelectedColor !== null && productDetailSelectedSize !== null) {
            await fetch(`/product-price-on-variation/${productDetailSelectedColor}/${productDetailSelectedSize}/${productDetailId}/`, {
                method: "GET"
            }).then(res => {
                if (res.ok) {
                    return res.json();
                }
            }).then(data => {
                if (data.error) {
                    alert("Something is wrong! Please try again...");
                } else if (!data.error && data.get_product_data) {
                    const {price, discount_percentage} = data;
    
                    let priceWithDiscount = Number(price);
    
                    // If product has discount
                    if (discount_percentage > 0) {
                        priceWithDiscount = Number(price) - (Number(price) * discount_percentage / 100).toFixed(2);
                    }
    
                    $("#product__detailVariationPrice").text(`\$${priceWithDiscount.toFixed(2)}`);
                    $("#product__detailVariationPrice").removeClass("hidden");
                }
            }).catch(err => console.error(err));
        } else {
            await fetch(`/product-price-on-variation/${uid}/${productDetailId}/`, {
                method: "GET"
            }).then(res => {
                if (res.ok) {
                    return res.json();
                }
            }).then(data => {
                if (data.error) {
                    alert("Something is wrong! Please try again...");
                } else if (!data.error && data.get_product_data) {
                    const {price, discount_percentage} = data;
                    let priceWithDiscount = Number(price);
    
                    // If product has discount
                    if (discount_percentage > 0) {
                        priceWithDiscount = Number(price) - (Number(price) * discount_percentage / 100).toFixed(2);
                    }
    
                    $("#product__detailVariationPrice").text(`\$${priceWithDiscount.toFixed(2)}`);
                    $("#product__detailVariationPrice").removeClass("hidden");
                }
            }).catch(err => console.error(err));
        }
        productDetailClearBtn.classList.remove("hidden");
        productDetailClearBtn.classList.add("flex");
    } catch(err) {
        window.location.reload();
    }  
}

const clearProductDetailVariationFields = () => {
    if (productDetailSelectedColor) {
        document.getElementById(`product-detail-color-${productDetailSelectedColor}`).classList.remove("ring-2", "ring-indigo-600");
        productDetailSelectedColor = null;
    }
    if (productDetailSelectedSize) {
        document.getElementById(`product-detail-size-${productDetailSelectedSize}`).classList.remove("ring-2", "ring-indigo-600");
        productDetailSelectedSize = null;
    }

    $("#product__detailVariationPrice").innerText = "";
    $("#product__detailVariationPrice").addClass("hidden");

    productDetailClearBtn.classList.remove("flex");
    productDetailClearBtn.classList.add("hidden");
}

// Clear selected variation options
productDetailClearBtn.addEventListener("click", () => {
    clearProductDetailVariationFields();
})

// Inecrease product quantity
productQtyIncreaseBtn.addEventListener("click", () => {
    if (productQtyInputField.value) {
        let productQty = Number(productQtyInputField.value);
        
        productQty += 1;
        $("#product__detailQtyField").val(productQty);
    }
})

// Decrease product quantity
productQtyDecreaseBtn.addEventListener("click", () => {
    if (productQtyInputField.value) {
      let productQty = Number(productQtyInputField.value);
      
      if (productQty > 1) {
        productQty -= 1;
        $("#product__detailQtyField").val(productQty);
      }
    }
})

// Add to cart
productDetailAddToCartBtn.addEventListener("click", async() => {
    try {
        const productDetailId = JSON.parse(document.getElementById("product__uid").innerText);
        const colorRequired = JSON.parse(document.getElementById("color__required").innerText);
        const sizeRequired = JSON.parse(document.getElementById("size__required").innerText);

        productDetailAddToCartBtn.disabled = true;

        let formData = new FormData();
        formData.append("productId", productDetailId)

        formData.append("colorRequired", colorRequired);
        formData.append("sizeRequired", sizeRequired);

        if (productQtyInputField.value) {
            formData.append("productQty", Number(productQtyInputField.value));
        }

        const CSRFTOKEN = getCookie("csrftoken");

        if (CSRFTOKEN === null) {
            window.location.href = "/authentication/login/";
            return;
        }
        
        if (productDetailSelectedColor !== null) {
            formData.append("colorId", productDetailSelectedColor);
        }
        if (productDetailSelectedSize !== null) {
            formData.append("sizeId", productDetailSelectedSize);
        }

        await fetch("/add-to-cart/", {
            method: "POST",
            headers: {
              "X-CSRFToken": CSRFTOKEN
            },
            body: formData
          }).then(res => {
            if (res.ok) {
              return res.json();
            } else {
              alert("Failed to add into the cart!");
            }
          }).then(data => {
            if (data.error && data.user_not_login) {
                window.location.href = "/authentication/login/";
              } else if (data.error && data.color_field_required) {
                productDetailColorErrorMsg.classList.remove("hidden");
              } else if (data.error && data.size_field_required) {
                productDetailSizeErrorMsg.classList.remove("hidden");
              } else if (data.error && data.invalid_qty_format) {
                $.Toast("Something is wrong!", "Invalid format in input field...", "error");
              } else if (data.error) {
                $.Toast("Something is wrong!", "Failed to add into the cart...", "error");
              } else if (!data.error && data.product_add_success) {
                clearProductDetailVariationFields();
                $("#product__detailQtyField").val(1);

                // Updating cart counter
                cartCounter.innerText = data.cart_counter;
                mobileCartCounter.innerText = data.cart_counter;
                cartCounter.classList.remove("hidden");
                mobileCartCounter.classList.remove("hidden");

                $.Toast("Add Successful!", "Added into your cart...", "success");

                // cartSidebarProductMainDiv
                const div1 = document.createElement("div");
                div1.setAttribute("id", `cart-sidebar-product-${data.cart_item_uid}`);
                div1.setAttribute("class", "flex items-center justify-between pb-3 border-b border-gray-300 last:border-0");

                const div2 = document.createElement("div");
                div2.setAttribute("class", "flex flex-1 items-center gap-x-5");

                const a1 = document.createElement("a");
                a1.setAttribute("href", `/product/${data.slug}/`);
                a1.innerHTML = `
                    <img src="${data.image}" class="w-[50px] h-[80px] object-cover" alt="">
                `

                const div3 = document.createElement("div");
                div3.setAttribute("class", "flex flex-col gap-y-3");

                const div4 = document.createElement("div");
                div4.setAttribute("class", "flex flex-col gap-y-1");

                const a2 = document.createElement("a");
                a2.setAttribute("href", `/product/${data.slug}/`);
                a2.setAttribute("class", "hover:text-indigo-500 transition-colors duration-300 ease-in-out");
                a2.innerHTML = `
                    <p class="font-medium">${data.title}</p>
                `

                let colorPara = null, sizePara = null;

                if (data.color !== null) {
                    colorPara = document.createElement("p");
                    colorPara.setAttribute("class", "w-[1rem] h-[1rem] border border-gray-300");
                    colorPara.setAttribute("style", `background-color: ${data.color}`)
                }

                if (data.size !== null) {
                    sizePara = document.createElement("p");
                    sizePara.setAttribute("class", "text-slate-600");
                    sizePara.innerText = data.size;
                }

                div4.appendChild(a2);

                if (colorPara !== null) {
                    div4.appendChild(colorPara);
                }
                if (sizePara !== null) {
                    div4.appendChild(sizePara);
                }

                const p1 = document.createElement("p1");
                p1.setAttribute("class", "flex items-center flex-wrap gap-x-1");
                p1.innerHTML = `
                    ${data.quantity} x <span class="text-lg text-indigo-400">$${data.price}</span>
                `

                div3.appendChild(div4);
                div3.appendChild(p1);

                div2.appendChild(a1);
                div2.appendChild(div3);

                const div5 = document.createElement("div");
                div5.innerHTML = `
                    <button onclick="cartSidebarProductRemove(this)" id="cart-sidebar-product-remove-${data.cart_item_uid}" class="hover:text-rose-500 transition-colors duration-300 ease-in-out cursor-pointer">
                        <span class="iconify text-lg" data-icon="bi:trash"></span>
                    </button>
                `

                div1.appendChild(div2);
                div1.appendChild(div5);

                cartSidebarProductMainDiv.appendChild(div1);

                $("#cart__sidebarTotalPrice").text(`\$${data.total_price}`);

                if (cartSidebarEmptyProductDiv !== null) {
                    $("#cart__sidebarEmptyProduct").remove();
                }
            }
          }).catch(err => console.error(err));

          productDetailAddToCartBtn.disabled = false;
    } catch(err) {
        window.location.reload();
    }
})

// Add to wishlist
async function productDetailAddToWishlist() {
    try {
        const productDetailId = JSON.parse(document.getElementById("product__uid").innerText);

        if (productDetailId) {
            const CSRFTOKEN = getCookie("csrftoken");

            if (CSRFTOKEN === null) {
                window.location.href = "/authentication/login/";
                return;
            }

            let formData = new FormData();
            formData.append("uid", productDetailId);

            await fetch("/add-to-wishlist/", {
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
                  $.Toast("Something is wrong!", "Failed to add...", "error");
                } else if (!data.error && data.wishlist_product_add_success) {
                    productDetailWishlistBtn.setAttribute("onclick", "productDetailRemoveFromWishlist()");
                    productDetailWishlistBtn.innerHTML = `
                        <span class="iconify text-lg" data-icon="ant-design:heart-filled"></span>
                        Remove
                    `

                    // Wishlist counter on navbar
                    $("#navbar__wishlistCounter").text(data.wishlist_counter)
                    $("#navbar__wishlistCounter").removeClass("hidden");

                    $.Toast("Add Successful!", "Added into your wishlist...", "success");
                }
            }).catch(err => console.error(err))
        } else {
            alert("Something is wrong!");
        }
    } catch(err) {
        window.location.reload();
    }
}

async function productDetailRemoveFromWishlist() {
    try {
        const productDetailId = JSON.parse(document.getElementById("product__uid").innerText);

        if (productDetailId) {
            const CSRFTOKEN = getCookie("csrftoken");

            if (CSRFTOKEN === null) {
                window.location.href = "/authentication/login/";
                return;
            }

            let formData = new FormData();
            formData.append("uid", productDetailId);

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
                    productDetailWishlistBtn.setAttribute("onclick", "productDetailAddToWishlist()");
                    productDetailWishlistBtn.innerHTML = `
                        <span class="iconify text-lg" data-icon="ant-design:heart-outlined"></span>
                        Add To Wishlist
                    `

                    // Wishlist counter on navbar
                    if (data.wishlist_counter === 0) {
                        $("#navbar__wishlistCounter").addClass("hidden");
                        $("#navbar__wishlistCounter").text("");
                    } else {
                        $("#navbar__wishlistCounter").text(data.wishlist_counter)
                    }

                    $.Toast("Remove Successful!", "Remove from your wishlist...", "success");
                }
            }).catch(err => console.error(err));
        } else {
            alert("Something is wrong!");
        }
    } catch(err) {
        window.location.reload();
    }
}