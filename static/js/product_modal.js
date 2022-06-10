$("#product__modalImgDiv").slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: false,
  dots: false,
  arrows: true,
  prevArrow: '<button class="text-indigo-400 product__modalSlideBtn product__modalPrevBtn"><span class="iconify text-3xl" data-icon="akar-icons:circle-chevron-left-fill"></span></button>',
  nextArrow: '<button class="text-indigo-400 product__modalSlideBtn product__modalNextBtn"><span class="iconify text-3xl" data-icon="akar-icons:circle-chevron-right-fill"></span></button>'
});

let productModalSelectedColor = null, productModalSelectedSize = null, productModalId = null, maxPrice = 0, colorRequired = false, sizeRequired = false;
const productModalClearOptionBtn = document.getElementById("clear__productModalOptionBtn");
const increaseProductModalQtyBtn = document.getElementById("product__modalIncreaseQtyBtn");
const decreaseProductModalQtyBtn = document.getElementById("product__modalDecreaseQtyBtn");
const productModalQty = document.getElementById("product__modalQtyField");
const productModalAddToCartBtn = document.getElementById("product__modalAddToCartBtn");
const productModalColorErrorMsg = document.getElementById("product__modalColorErrorMsg");
const productModalSizeErrorMsg = document.getElementById("product__modalSizeErrorMsg");
const cartCounter = document.getElementById("cart__counter");
const mobileCartCounter = document.getElementById("mobile__cartCounter");
const cartSidebarProductMainDiv = document.getElementById("cart__sidebarProductMainDiv");
const cartSidebarEmptyProductDiv = document.getElementById("cart__sidebarEmptyProduct");

// Show product quick view modal
const quickView = async(e) => {
    productModalId = null;
    productModalSelectedColor = null;
    productModalSelectedSize = null;
    maxPrice = 0;
    colorRequired = false;
    sizeRequired = false;

    productModalColorErrorMsg.classList.add("hidden");
    productModalSizeErrorMsg.classList.add("hidden");
    $("#product__modalVariationPrice").text("");
    $("#product__modalVariationPrice").addClass("hidden");
    productModalQty.value = 1;

    const productLoadingScreenModal = document.getElementById("product__loadingScreenModal");
    let productId = e.id;
    const homeProductModal = document.getElementById("home__productModal");

    productLoadingScreenModal.classList.remove("hidden");

    if (productId) {
        productId = productId.split("product-")[1];
        productModalId = productId;
        productModalClearOptionBtn.classList.remove("flex");
        productModalClearOptionBtn.classList.add("hidden");

        await fetch(`/product-quick-view/${productId}/`, {
            method: "GET",
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
        }).then(data => {
            if (data.error) {
                alert("Something is wrong! Please try again...");
            } else {
                const {title, price, category, image,
                    discount_percentage, short_description, 
                    sku, slug, uid, variation, product_in_wishlist
                } = data;

                const productModalScrollView = document.getElementById("product__modalScrollView");
                productModalScrollView.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth"
                });

                productLoadingScreenModal.classList.add("hidden");
                
                homeProductModal.classList.add("show__homeProductModal");
                homeProductModal.querySelector("div").classList.add("show__homeProductModalDiv");
                const productModalImgDiv = document.getElementById("product__modalImgDiv");
                const productModalWishlistBtn = document.getElementById("product__modalWishlistBtn");
                
                const productTitle = document.getElementById("product__modalTitle");
                const productPrice = document.getElementById("product__modalPrice");
                const productShortDesc = document.getElementById("product__modalShortDesc");
                const productPrevPrice = document.getElementById("product__prevPrice");
                const productCategory = document.getElementById("product__modalCategory");
                const productSku = document.getElementById("product__modalSku");

                // Add to cart button content
                if (!data.product_in_wishlist) {
                  productModalWishlistBtn.setAttribute("onclick", "productModalAddToWishlist()");
                  productModalWishlistBtn.innerHTML = `
                    <span class="iconify text-lg" data-icon="ant-design:heart-outlined"></span>
                    Add To Wishlist
                  `
                } else {
                  productModalWishlistBtn.setAttribute("onclick", "productModalRemoveFromWishlist()");
                  productModalWishlistBtn.innerHTML = `
                    <span class="iconify text-lg" data-icon="ant-design:heart-filled"></span>
                    Remove
                  `
                }

                productTitle.innerText = title;

                // Price
                let priceWithDiscount = Number(price);

                if (discount_percentage > 0) {
                  priceWithDiscount = Number(price) - (Number(price) * discount_percentage / 100).toFixed(2);
                  productPrice.innerText = `\$${priceWithDiscount.toFixed(2)}`;
                  productPrevPrice.innerText = `\$${Number(price).toFixed(2)}`;
                } else {
                  productPrice.innerText = `\$${priceWithDiscount.toFixed(2)}`;
                }

                productShortDesc.innerHTML = short_description;

                // Variation
                let extra_images = [], colorArr = [], sizeArr = [];
                
                // Adding main image with extra images
                extra_images.push(image);
                
                // ##### Extra images slider ######
                variation.map(item => {
                    if (item.image) {
                      extra_images.push(item.image);
                    }
                    if (item.color) {
                        colorArr.push({
                            uid: item.uid,
                            price: item.price,
                            color: item.color
                        });
                    }
                    if (item.size) {
                        sizeArr.push({
                            uid: item.uid,
                            price: item.price,
                            size: item.size
                        });
                    }
                })

                productModalImgDiv.querySelector(".slick-track").innerHTML = "";

                extra_images.map(img => {
                    let div = document.createElement("div");
                    div.setAttribute("style", `background-image: url(${img}); background-size: cover; background-repeat: no-repeat; background-position: center;`);
                    div.setAttribute("class", "w-full h-full rounded-tl-lg");
                    $("#product__modalImgDiv").slick("slickAdd", div);
                });

                // ##### Color & size ######
                if (colorArr.length > 0) {
                  $("#product__modalColorVariation").removeClass("hidden");
                  colorRequired = true;
                  const colorVariation = document.getElementById("product__modalColorVariation").querySelector("div");

                  colorVariation.innerHTML = "";

                  colorArr.map(color => {
                      const button = document.createElement("button");
                      button.setAttribute("id", `product-modal-color-${color.uid}`);
                      button.setAttribute("onclick", "productModalColorClick(this)");
                      button.setAttribute("class", "w-[1.2rem] h-[1.2rem] border border-gray-300 hover:shadow cursor-pointer");
                      button.setAttribute("style", `background-color: ${color.color}`);

                      colorVariation.appendChild(button);
                  });
                } else {
                  $("#product__modalColorVariation").addClass("hidden");
                }

                if (sizeArr.length > 0) {
                  $("#product__modalSizeVariation").removeClass("hidden");
                  sizeRequired = true;
                  const sizeVariation = document.getElementById("product__modalSizeVariation").querySelector("div");

                  sizeVariation.innerHTML = "";

                  sizeArr.map(size => {
                      const button = document.createElement("button");
                      button.setAttribute("id", `product-modal-size-${size.uid}`);
                      button.setAttribute("onclick", "productModalSizeClick(this)");
                      button.setAttribute("class", "py-1.5 px-2 border border-gray-300 hover:shadow rounded cursor-pointer");
                      button.innerText = size.size;

                      sizeVariation.appendChild(button);
                  });
                } else {
                  $("#product__modalSizeVariation").addClass("hidden");
                }

                productCategory.innerText = category.title;
                productCategory.setAttribute("href", `/product/category/${category.slug}/`);

                productSku.innerText = sku;
            }
        }).catch(err => console.error(err));
    }
}

// If a color variation is clicked
function productModalColorClick(e) {
    let colorId = e.id;
    productModalColorErrorMsg.classList.add("hidden");
    
    if (colorId) {
        colorId = colorId.split("product-modal-color-")[1];
        
        if (productModalSelectedColor !== null) {
            document.getElementById(`product-modal-color-${productModalSelectedColor}`).classList.remove("ring-2", "ring-indigo-600");
        }
        
        if (productModalSelectedColor !== colorId) {
            productModalSelectedColor = colorId;
            fetchSelectedVariationPriceOfProductModal(productModalSelectedColor);
        }
        e.classList.add("ring-2", "ring-indigo-600");
    }
}

// If a size variation is clicked
function productModalSizeClick(e) {
    let sizeId = e.id;
    productModalSizeErrorMsg.classList.add("hidden");

    if (sizeId) {
        sizeId = sizeId.split("product-modal-size-")[1];

        if (productModalSelectedSize !== null) {
            document.getElementById(`product-modal-size-${productModalSelectedSize}`).classList.remove("ring-2", "ring-indigo-600");
        }

        if (productModalSelectedSize !== sizeId) {
            productModalSelectedSize = sizeId;
            fetchSelectedVariationPriceOfProductModal(productModalSelectedSize);
        }
        e.classList.add("ring-2", "ring-indigo-600");        
    }
}

// Show price according to selected variation option
async function fetchSelectedVariationPriceOfProductModal(uid) {
  if (productModalSelectedColor !== null && productModalSelectedSize !== null) {
    await fetch(`/product-price-on-variation/${productModalSelectedColor}/${productModalSelectedSize}/${productModalId}/`, {
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

            $("#product__modalVariationPrice").text(`\$${priceWithDiscount.toFixed(2)}`);
            $("#product__modalVariationPrice").removeClass("hidden");
        }
    }).catch(err => console.error(err));
  } else {
    await fetch(`/product-price-on-variation/${uid}/${productModalId}/`, {
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

            $("#product__modalVariationPrice").text(`\$${priceWithDiscount.toFixed(2)}`);
            $("#product__modalVariationPrice").removeClass("hidden");
        }
    }).catch(err => console.error(err));
  }
  productModalClearOptionBtn.classList.remove("hidden");
  productModalClearOptionBtn.classList.add("flex");
}

const clearProductModalVariationFields = () => {
  if (productModalSelectedColor) {
    document.getElementById(`product-modal-color-${productModalSelectedColor}`).classList.remove("ring-2", "ring-indigo-600");
    productModalSelectedColor = null;
  }
  if (productModalSelectedSize) {
    document.getElementById(`product-modal-size-${productModalSelectedSize}`).classList.remove("ring-2", "ring-indigo-600");
    productModalSelectedSize = null;
  }

  $("#product__modalVariationPrice").innerText = "";
  $("#product__modalVariationPrice").addClass("hidden");

  productModalClearOptionBtn.classList.remove("flex");
  productModalClearOptionBtn.classList.add("hidden");
}

// Clear selected variation options
productModalClearOptionBtn.addEventListener("click", () => {
  clearProductModalVariationFields();
})

// Increase product quantity
increaseProductModalQtyBtn.addEventListener("click", () => {
  if (productModalQty.value) {
    let productQty = Number(productModalQty.value);
    
    productQty += 1;
    $("#product__modalQtyField").val(productQty);
  }
})

// Decrease product quantity
decreaseProductModalQtyBtn.addEventListener("click", () => {
  if (productModalQty.value) {
    let productQty = Number(productModalQty.value);
    
    if (productQty > 1) {
      productQty -= 1;
      $("#product__modalQtyField").val(productQty);
    }
  }
})

// Add to cart
productModalAddToCartBtn.addEventListener("click", async() => {
  productModalAddToCartBtn.disabled = true;

  let formData = new FormData();

  formData.append("colorRequired", colorRequired);
  formData.append("sizeRequired", sizeRequired);
  if (productModalSelectedColor !== null) {
    formData.append("colorId", productModalSelectedColor);
  }
  if (productModalSelectedSize !== null) {
    formData.append("sizeId", productModalSelectedSize);
  }
  formData.append("productId", productModalId);

  if (productModalQty.value) {
    formData.append("productQty", Number(productModalQty.value));
  }

  const CSRFTOKEN = getCookie("csrftoken");

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
      productModalColorErrorMsg.classList.remove("hidden");
    } else if (data.error && data.size_field_required) {
      productModalSizeErrorMsg.classList.remove("hidden");
    } else if (data.error && data.invalid_qty_format) {
      $.Toast("Something is wrong!", "Invalid format in input field...", "error");
    } else if (data.error) {
      $.Toast("Something is wrong!", "Failed to add into the cart...", "error");
    } else if (!data.error && data.product_add_success) {
      clearProductModalVariationFields();
      $("#product__modalQtyField").val(1);

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

  productModalAddToCartBtn.disabled = false;
})

async function productModalAddToWishlist() {
  if (productModalId !== null) {
    const CSRFTOKEN = getCookie("csrftoken");

    let formData = new FormData();
    formData.append("uid", productModalId);

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
        const productModalWishlistBtn = document.getElementById("product__modalWishlistBtn");

        productModalWishlistBtn.setAttribute("onclick", "productModalRemoveFromWishlist()");
        productModalWishlistBtn.innerHTML = `
          <span class="iconify text-lg" data-icon="ant-design:heart-filled"></span>
          Remove
        `

        // This is for the product hover effect add/remove to/from cart button
        const productWishlistBtn = document.getElementById(`product-wishlist-${productModalId}`);

        productWishlistBtn.setAttribute("onclick", "removeFromWishlist(this)");
        productWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-filled"></span>
          <p>Remove</p>
        `

      // For top deal products
      const topDealProductWishlistBtn = document.querySelector(`.product-top-deal-wishlist-${productModalId}`);

      if (topDealProductWishlistBtn !== null) {
        topDealProductWishlistBtn.setAttribute("onclick", "removeFromWishlist(this)");
        topDealProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-filled"></span>
          <p>Remove</p>
        `
      }

      // For cheapest products
      const cheapProductWishlistBtn = document.querySelector(`.product-cheapest-wishlist-${productModalId}`);

      if (cheapProductWishlistBtn !== null) {
        cheapProductWishlistBtn.setAttribute("onclick", "removeFromWishlist(this)");
        cheapProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-filled"></span>
          <p>Remove</p>
        `
      }

          // Wishlist counter on navbar
        $("#navbar__wishlistCounter").text(data.wishlist_counter)
        $("#navbar__wishlistCounter").removeClass("hidden");

        $.Toast("Add Successful!", "Added into your wishlist...", "success");
      }
    })
  }
}

// Remove product from wishlist
async function productModalRemoveFromWishlist() {
  if (productModalId) {
    const CSRFTOKEN = getCookie("csrftoken");

    let formData = new FormData();
    formData.append("uid", productModalId);

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
        const productModalWishlistBtn = document.getElementById("product__modalWishlistBtn");

        productModalWishlistBtn.setAttribute("onclick", "productModalAddToWishlist()");
        productModalWishlistBtn.innerHTML = `
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

        // This is for the product hover effect add/remove to/from cart button
        const productWishlistBtn = document.getElementById(`product-wishlist-${productModalId}`);

        productWishlistBtn.setAttribute("onclick", "addToWishlist(this)");
        productWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-outlined"></span>
          <p>Add to wishlist</p>
        `

      // For top deal products
      const topDealProductWishlistBtn = document.querySelector(`.product-top-deal-wishlist-${productModalId}`);

      if (topDealProductWishlistBtn !== null) {
        topDealProductWishlistBtn.setAttribute("onclick", "addToWishlist(this)");
        topDealProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-outlined"></span>
          <p>Add to wishlist</p>
        `
      }

      // For cheapest products
      const cheapProductWishlistBtn = document.querySelector(`.product-cheapest-wishlist-${productModalId}`);

      if (cheapProductWishlistBtn !== null) {
        cheapProductWishlistBtn.setAttribute("onclick", "addToWishlist(this)");
        cheapProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-outlined"></span>
          <p>Add to wishlist</p>
        `
      }

        $.Toast("Remove Successful!", "Remove from your wishlist...", "success");
      }
    })
  }
}


document.addEventListener("click", (e) => {
    if (e.target.closest("#home__productModal > div")) return;
    $("#home__productModal").removeClass("show__homeProductModal");
    $("#home__productModal > div").removeClass("show__homeProductModalDiv");
})