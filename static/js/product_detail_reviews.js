window.addEventListener("DOMContentLoaded", () => {
    const preLoadImage = (img) => {
        const src = img.getAttribute("data-src");
        
        if (!src) return;
        img.src = src;
    }

    const imgObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            preLoadImage(entry.target);
            imgObserver.unobserve(entry.target);
        })
    }, {
        threshold: 0.2
    })

    const lazyLoadUserImages = () => {
        const images = document.querySelectorAll(".product__detailUserImg");

        images.forEach(img => {
            imgObserver.observe(img);
        })
    }

    lazyLoadUserImages();

    // Product review form
    const productReviewForm = document.getElementById("product__ReviewForm");
    const productDetailReviewsMainDiv = document.getElementById("product__detailReviewsMainDiv");
    const productStar1 = document.getElementById("product__star1");
    const productStar2 = document.getElementById("product__star2");
    const productStar3 = document.getElementById("product__star3");
    const productStar4 = document.getElementById("product__star4");
    const productStar5 = document.getElementById("product__star5");

    let countStar = 0;
    const productDetailReviewTextArea = document.getElementById("product__review");
    const productDetailRatingErrorMsg = document.getElementById("product__detailRatingErrorMsg");
    const productDetailReviewErrorMsg = document.getElementById("product__detailReviewErrorMsg");
    const productDetailReviewSubmitBtn = document.getElementById("product__detailReviewSubmitBtn");

    const resetRating = () => {
        $("#product__star1 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star2 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star3 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
        countStar = 0;
    }

    const setReviewStar = () => {
        switch(countStar) {
            case 0:
                resetRating();
                break;
            case 1:
                $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star2 > svg").attr("data-icon", "ant-design:star-outlined");
                $("#product__star3 > svg").attr("data-icon", "ant-design:star-outlined");
                $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
                $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
                break;
            case 2:
                $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star3 > svg").attr("data-icon", "ant-design:star-outlined");
                $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
                $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
                break;
            case 3:
                $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star3 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
                $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
                break;
            case 4:
                $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star3 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star4 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
                break;
            case 5:
                $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star3 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star4 > svg").attr("data-icon", "ant-design:star-filled");
                $("#product__star5 > svg").attr("data-icon", "ant-design:star-filled");
                break;
        }
    }

    productStar1.addEventListener("mouseover", () => {
        $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star2 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star3 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
    })

    productStar1.addEventListener("mouseleave", () => {
        setReviewStar();
    })

    productStar1.addEventListener("click", () => {
        countStar = 1;
        productDetailRatingErrorMsg.classList.add("hidden");
    })

    productStar2.addEventListener("mouseover", () => {
        $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star3 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
    })

    productStar2.addEventListener("mouseleave", () => {
        setReviewStar();
    })

    productStar2.addEventListener("click", () => {
        countStar = 2;
        productDetailRatingErrorMsg.classList.add("hidden");
    })

    productStar3.addEventListener("mouseover", () => {
        $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star3 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star4 > svg").attr("data-icon", "ant-design:star-outlined");
        $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
    })

    productStar3.addEventListener("mouseleave", () => {
        setReviewStar();
    })

    productStar3.addEventListener("click", () => {
        countStar = 3;
        productDetailRatingErrorMsg.classList.add("hidden");
    })

    productStar4.addEventListener("mouseover", () => {
        $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star3 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star4 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star5 > svg").attr("data-icon", "ant-design:star-outlined");
    })

    productStar4.addEventListener("mouseleave", () => {
        setReviewStar();
    })

    productStar4.addEventListener("click", () => {
        countStar = 4;
        productDetailRatingErrorMsg.classList.add("hidden");
    })

    productStar5.addEventListener("mouseover", () => {
        $("#product__star1 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star2 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star3 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star4 > svg").attr("data-icon", "ant-design:star-filled");
        $("#product__star5 > svg").attr("data-icon", "ant-design:star-filled");
    })

    productStar5.addEventListener("mouseleave", () => {
        setReviewStar();
    })

    productStar5.addEventListener("click", () => {
        countStar = 5;
        productDetailRatingErrorMsg.classList.add("hidden");
    })

    // Product review submit form
    productReviewForm.addEventListener("submit", e => {
        e.preventDefault();

        productDetailRatingErrorMsg.classList.add("hidden");
        productDetailReviewErrorMsg.classList.add("hidden");

        if (countStar === 0) {
            productDetailRatingErrorMsg.classList.remove("hidden");
        } else if (productDetailReviewTextArea.value.trim() === "") {
            productDetailReviewErrorMsg.classList.remove("hidden");
        } else {
            productDetailSubmitReview(countStar, productDetailReviewTextArea.value.trim());
        }
    })

    async function productDetailSubmitReview(countStar, message) {
        try {
            const productDetailId = JSON.parse(document.getElementById("product__uid").innerText);
    
            if (productDetailId) {
                productDetailReviewSubmitBtn.disabled = true;
    
                const CSRFTOKEN = getCookie("csrftoken");
    
                let formData = new FormData();
                formData.append("productId", productDetailId);
                formData.append("rating", countStar);
                formData.append("message", message);
    
                await fetch("/product-review-submit/", {
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
                        $.Toast("Submission Error!", "Review submit failed...", "error");
                    } else if (!data.error && data.review_submitted) {
                        const reviewMainDiv = document.createElement("div");
                        reviewMainDiv.setAttribute("class", "flex items-start gap-x-1.5 product__reviewDiv");
    
                        const img = document.createElement("img");
                        if (data.user.profile_pic !== null) {
                            img.setAttribute("src", data.user.profile_pic);
                        } else {
                            img.setAttribute("src", "/static/static_images/default_profile.png");
                        }
                        img.setAttribute("class", "min-w-[30px] w-[30px] max-w-[30px] h-[30px] bg-slate-200 rounded-full object-cover product__detailUserImg");
                        img.setAttribute("alt", "");
    
                        const reviewDiv = document.createElement("div");
                        reviewDiv.setAttribute("class", "flex flex-col gap-y-1");

                        const usernamePara = document.createElement("p");
                        usernamePara.setAttribute("class", "font-semibold");
                        usernamePara.innerText = data.user.username;
    
                        reviewDiv.innerHTML = `
                            <div class="flex items-center gap-x-1">
                                <div>
                                    <span class="iconify" data-icon="ant-design:star-${countStar >= 1 ? 'filled' : 'outlined'}"></span>
                                </div>
                                <div>
                                    <span class="iconify" data-icon="ant-design:star-${countStar >= 2 ? 'filled' : 'outlined'}"></span>
                                </div>
                                <div>
                                    <span class="iconify" data-icon="ant-design:star-${countStar >= 3 ? 'filled' : 'outlined'}"></span>
                                </div>
                                <div>
                                    <span class="iconify" data-icon="ant-design:star-${countStar >= 4 ? 'filled' : 'outlined'}"></span>
                                </div>
                                <div>
                                    <span class="iconify" data-icon="ant-design:star-${countStar === 5 ? 'filled' : 'outlined'}"></span>
                                </div>
                            </div>
                        `;
    
                        const commentPara = document.createElement("p");
                        commentPara.setAttribute("class", "text-slate-600");
                        commentPara.innerText = message;
    
                        const createdDateTimePara = document.createElement("p");
                        createdDateTimePara.setAttribute("class", "text-slate-600 text-xs");
                        createdDateTimePara.innerText = data.created_at;
                        
                        reviewDiv.appendChild(usernamePara);
                        reviewDiv.appendChild(commentPara);
                        reviewDiv.appendChild(createdDateTimePara);
    
                        reviewMainDiv.appendChild(img);
                        reviewMainDiv.appendChild(reviewDiv);
    
                        // If first comment
                        if (productDetailReviewsMainDiv.querySelector(".product__reviewDiv") === null){
                            productDetailReviewsMainDiv.appendChild(reviewMainDiv);
                            $("#product__detailNoReviewDiv").remove();
                        } else {
                            productDetailReviewsMainDiv.insertBefore(reviewMainDiv, productDetailReviewsMainDiv.querySelector(".product__reviewDiv"));
                        }
    
                        // Review counter
                        $("#product__detailAllReviewHeader > span").text(data.number_of_reviews);
                        $("#product__detailReviewBtn > span").text(data.number_of_reviews);

                        $.Toast("Review Submitted!", "Review submitted successfully...", "success");

                        // Reset form
                        resetRating();
                        productReviewForm.reset();
                    }
                }).catch(err => console.error(err));
            } else {
                alert("Something is wrong!");
            }
            productDetailReviewSubmitBtn.disabled = false;
        } catch(err) {
            window.location.reload();
        }
    }
})

