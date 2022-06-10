window.addEventListener("DOMContentLoaded", () => {
    const closeProductSearchModal = document.getElementById("close__productSearchModal");
    const productSearchModal = document.getElementById("product__searchMainDiv");
    const productSearchForm = document.getElementById("product__searchForm");
    const productSearchField = document.getElementById("search__productInput");
    const productSearchResultChildDiv = document.getElementById("product__searchResultChildDiv");
    const seeAllProductResultsBtn = document.getElementById("product__seeAllResults");

    // Close product search modal
    closeProductSearchModal.addEventListener("click", () => {
        productSearchModal.classList.remove("show__productSearchMainDiv");
        productSearchModal.querySelector("div").classList.remove("show__productSearchModal");
    })

    // Product search submit form
    productSearchForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        seeAllProductResultsBtn.classList.add("hidden");

        if (!productSearchField || productSearchField.value.trim() === "") {
            seeAllProductResultsBtn.classList.add("hidden");
        } else {
            await fetch(`/product/search/q=${productSearchField.value.trim()}/`, {
                method: "GET"
            }).then(res => {
                if (res.ok) {
                    window.location.href = `/product/search/q=${productSearchField.value.trim()}/`;
                }
            })
        }
    })

    productSearchField.addEventListener("keyup", e => {
        const searchText = e.target.value.trim();

        if (searchText !== "") {
            productAutoSearchSubmitForm(searchText.normalize());
        } else {
            productSearchResultChildDiv.innerHTML = "";
            seeAllProductResultsBtn.classList.add("hidden");
        }
    })

    // If no products found after searching...
    const noSearchProductFound = () => {
        seeAllProductResultsBtn.classList.add("hidden");

        const div = document.createElement("div");
            div.setAttribute("class", "flex justify-center");
            div.innerHTML = `
                <p class="text-rose-500 font-medium">No product found!</p>
            `

        productSearchResultChildDiv.appendChild(div);
    }

    async function productAutoSearchSubmitForm(searchText) {
        const CSRFTOKEN = getCookie("csrftoken");

        if (CSRFTOKEN === null) {
            window.location.href = "/authentication/login/";
            return;
        }

        let formData = new FormData();
        formData.append("searchText", searchText);

        await fetch("/product-auto-search/", {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRFTOKEN
            },
            body: formData
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
        }).then(data => {
            if (data.error) {
                noSearchProductFound();
            } else if (!data.error && data.search_success) {
                productSearchResultChildDiv.innerHTML = "";

                if (data.products.length > 0) {
                    data.products.map(product => {
                        const productLink = document.createElement("a");
                        productLink.setAttribute("class", "flex items-center gap-x-3 border-b border-gray-300 py-3 last:border-0 hover:bg-slate-100 transition-colors duration-300 ease-in-out");
                        productLink.setAttribute("href", `/product/${product.slug}/`);
                        productLink.innerHTML = `
                            <img src=${product.image && product.image} class="w-[70px] h-[70px] object-cover bg-slate-600" alt="">
                            <div class="flex flex-col gap-y-1">
                                <p class="font-medium search__resultTitle">${product.title}</p>
                                <p class="font-semibold text-base text-indigo-500">\$${product.price}</p>
                            </div>
                        `

                        productSearchResultChildDiv.appendChild(productLink);
                    })
                    seeAllProductResultsBtn.classList.remove("hidden");
                } else {
                    noSearchProductFound();
                }
            }
        }).catch(err => console.error(err));
    }

    seeAllProductResultsBtn.addEventListener("click", () => {
        if (!productSearchField || productSearchField.value.trim() === "") return;
        window.location.href = `/product/search/q=${productSearchField.value.trim()}/`;
    })
})