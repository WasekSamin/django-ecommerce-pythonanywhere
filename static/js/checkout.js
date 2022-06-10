window.addEventListener("DOMContentLoaded", () => {
    const shippingAddrBtn = document.getElementById("shipping__addressBtn");
    const shippingAddrForm = document.getElementById("shipping__addressForm");

    const firstName = document.getElementById("first__name");
    const lastName = document.getElementById("last__name");
    const phoneNo = document.getElementById("phone__no");
    const address = document.getElementById("street__address");
    const apartment = document.getElementById("apartment");
    const city = document.getElementById("city");
    const country = document.getElementById("country");
    const zipCode = document.getElementById("zip");
    const shippingAddr = document.getElementById("shipping__address");
    const checkoutErrorMsg = document.getElementById("checkout__errorMsg");
    const cashOnDeliveryBtn = document.getElementById("cash__onDelivery");
    const stripeBtn = document.getElementById("stripe");
    const checkoutConfirmOrderBtn = document.getElementById("checkout__confirmOrderBtn");
    const cashOnDelivery = document.getElementById("cash__onDelivery");
    const stripePayment = document.getElementById("stripe__payment");
    let countryVal = "";
        
    if (shippingAddrBtn !== null) {
        shippingAddrBtn.addEventListener("click", () => {
            if (shippingAddrForm.classList.contains("hidden")) {
                $("#shipping__addressIcon").attr("data-icon", "akar-icons:chevron-up");
            } else {
                $("#shipping__addressIcon").attr("data-icon", "akar-icons:chevron-down");
            }
            shippingAddrForm.classList.toggle("hidden");
        })}


    // Checkout error message
    const showErrorMsg = (msg) => {
        $("#checkout__errorMsg").text(msg);
        $("#checkout__errorMsg").removeClass("hidden");
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }

    if (country !== null) {
        country.addEventListener("change", e => {
            countryVal = e.target.value;
        })
    }

    // Checkout form submission
    if (checkoutConfirmOrderBtn !== null) {
        checkoutConfirmOrderBtn.addEventListener("click", () => {
            checkoutErrorMsg.classList.add("hidden");
            
            if (!firstName || firstName.value.trim() === "") {
                showErrorMsg("First name field is required!");
            } else if (!lastName || lastName.value.trim() === "") {
                showErrorMsg("Last name field is required!");
            } else if (!phoneNo || phoneNo.value.trim() === "") {
                showErrorMsg("Phone number field is required!");
            } else if (!address || address.value.trim() === "") {
                showErrorMsg("Street address field is required!");
            } else if (!city || city.value.trim() === "") {
                showErrorMsg("Town/City field is required!");
            } else if (!countryVal || countryVal.trim() === "") {
                showErrorMsg("Country field is required!");
            } else if (!zipCode || zipCode.value.trim() === "") {
                showErrorMsg("Postcode/Zip field is required!");
            } else {
                submitCheckoutForm(firstName.value.trim(), lastName.value.trim(), phoneNo.value.trim(), address.value.trim(), city.value.trim(), apartment.value.trim(), countryVal.trim(), zipCode.value.trim(), shippingAddr.value.trim());
            }
        })
    }

    async function submitCheckoutForm(firstName, lastName, phoneNo, address, city, apartment, country, zipCode, shippingAddr) {
        const CSRFTOKEN = getCookie("csrftoken");

        let formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("phoneNo", phoneNo);
        formData.append("streetAddr", address);
        formData.append("apartment", apartment);
        formData.append("city", city);
        formData.append("country", country);
        formData.append("zipCode", zipCode);
        formData.append("shippingAddr", shippingAddr);
        if (cashOnDelivery.checked) {
            formData.append("paymentMethod", "Cash On Delivery");
        } else if (stripePayment.checked) {
            formData.append("paymentMethod", "Stripe");
        }

        await fetch("/submit-checkout-form/", {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRFTOKEN
            },
            body: formData
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                alert("Failed to placed order!");
            }
        }).then(data => {
            if (data.error && data.user_not_login) {
                window.location.href = "/authentication/login/";
            } else if (data.error && data.invalid_payment_method) {
                $.Toast("Wrong!", "Invalid payment method!", "error");
            } else if (data.error && data.cart_not_found) {
                $.Toast("Wrong!", "We cannot find your cart!", "error");
            } else if (data.error && data.invalid_country) {
                $.Toast("Wrong!", "Invalid country!", "error");
            } else if (data.error) {
                alert("Something is wrong!");
            } else if (!data.error && data.order_created) {
                $.Toast("Order Confirmed!", "Order placed successfully...", "Success");
                window.location.href = `/order-received/${data.order_id}/`;
            }
        }).catch(err => console.error(err));
    }
})