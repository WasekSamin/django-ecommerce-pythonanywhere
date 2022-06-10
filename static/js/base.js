const getCookie = (name) => {
  var cookieValue = null;
  if (document.cookie && document.cookie != "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) == name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Add to wishlist
const addToWishlist = (e) => {
  let productId = e.id;

  if (productId) {
    productId = productId.split("product-wishlist-")[1];
    addProductToWishlist(productId);
  }
}

// Remove from wishlist
const removeFromWishlist = (e) => {
  let productId = e.id;

  if (productId) {
    productId = productId.split("product-wishlist-")[1];
    removeProductFromWishlist(productId);
  }
}

async function addProductToWishlist(uid) {
  const CSRFTOKEN = getCookie("csrftoken");

  if (CSRFTOKEN === null) {
    window.location.href = "/authentication/login/";
    return;
  }

  let formData = new FormData();

  formData.append("uid", uid);

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
      // For newest products
      const productWishlistBtn = document.getElementById(`product-wishlist-${uid}`);

      productWishlistBtn.setAttribute("onclick", "removeFromWishlist(this)");
      productWishlistBtn.innerHTML = `
        <span class="iconify text-sm" data-icon="ant-design:heart-filled"></span>
        <p>Remove</p>
      `

      // For top deal products
      const topDealProductWishlistBtn = document.querySelector(`.product-top-deal-wishlist-${uid}`);

      if (topDealProductWishlistBtn !== null) {
        topDealProductWishlistBtn.setAttribute("onclick", "removeFromWishlist(this)");
        topDealProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-filled"></span>
          <p>Remove</p>
        `
      }

      // For cheapest products
      const cheapProductWishlistBtn = document.querySelector(`.product-cheapest-wishlist-${uid}`);

      if (cheapProductWishlistBtn !== null) {
        cheapProductWishlistBtn.setAttribute("onclick", "removeFromWishlist(this)");
        cheapProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-filled"></span>
          <p>Remove</p>
        `
      }

      $("#navbar__wishlistCounter").text(data.wishlist_counter)
      $("#navbar__wishlistCounter").removeClass("hidden");

      $.Toast("Add Successful!", "Added into your wishlist...", "success");
    }
  })
}

async function removeProductFromWishlist(uid) {
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
      if (data.wishlist_counter === 0) {
        $("#navbar__wishlistCounter").addClass("hidden");
        $("#navbar__wishlistCounter").text("");
      } else {
        $("#navbar__wishlistCounter").text(data.wishlist_counter)
      }

      // For newest products
      const productWishlistBtn = document.getElementById(`product-wishlist-${uid}`);

      productWishlistBtn.setAttribute("onclick", "addToWishlist(this)");
      productWishlistBtn.innerHTML = `
        <span class="iconify text-sm" data-icon="ant-design:heart-outlined"></span>
        <p>Add to wishlist</p>
      `

      // For top deal products
      const topDealProductWishlistBtn = document.querySelector(`.product-top-deal-wishlist-${uid}`);

      if (topDealProductWishlistBtn !== null) {
        topDealProductWishlistBtn.setAttribute("onclick", "addToWishlist(this)");
        topDealProductWishlistBtn.innerHTML = `
          <span class="iconify text-sm" data-icon="ant-design:heart-outlined"></span>
          <p>Add to wishlist</p>
        `
      }

      // For cheapest products
      const cheapProductWishlistBtn = document.querySelector(`.product-cheapest-wishlist-${uid}`);

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