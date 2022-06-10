window.addEventListener("DOMContentLoaded", () => {
    const blogSearchInput = document.getElementById("blog__searchInput");
    const blogSearchModal = document.getElementById("blog__searchMainDiv");
    const closeBlogSearchModal = document.getElementById("close__blogSearchModal");
    const blogSearchForm = document.getElementById("blog__searchForm");
    const seeAllBlogResultsBtn = document.getElementById("blog__seeAllResults");
    const blogSearchField = document.getElementById("search__blogInput");
    const blogSearchChildDiv = document.getElementById("blog__searchChildDiv");

    blogSearchInput.classList.remove("invisible");

    // Open blog search modal
    blogSearchInput.addEventListener("focus", () => {
        blogSearchModal.classList.add("show__blogSearchMainDiv");
        blogSearchModal.querySelector("div").classList.add("show__blogSearchModal");

        $("#search__blogInput").focus();
    })

    // Close blog search modal
    closeBlogSearchModal.addEventListener("click", () => {
        blogSearchModal.classList.remove("show__blogSearchMainDiv");
        blogSearchModal.querySelector("div").classList.remove("show__blogSearchModal");
    })

    blogSearchForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        seeAllBlogResultsBtn.classList.add("hidden");
        console.log(blogSearchField.value.trim());

        if (!blogSearchField || blogSearchField.value.trim() === "") {
            seeAllBlogResultsBtn.classList.add("hidden");
        } else {
            await fetch(`/blog/search/q=${blogSearchField.value.trim()}/`, {
                method: "GET"
            }).then(res => {
                if (res.ok) {
                    window.location.href = `/blog/search/q=${blogSearchField.value.trim()}/`;
                }
            })
        }
    })

    // Blog auto search
    blogSearchField.addEventListener("keyup", e => {
        const searchText = e.target.value.trim();

        if (searchText !== "") {
            blogAutoSearchSubmitForm(searchText);
        } else {
            blogSearchChildDiv.innerHTML = "";
            seeAllBlogResultsBtn.classList.add("hidden");
        }
    })

    // If no blogs found after searching...
    const noSearchBlogFound = () => {
        seeAllBlogResultsBtn.classList.add("hidden");

        const div = document.createElement("div");
            div.setAttribute("class", "flex justify-center");
            div.innerHTML = `
                <p class="text-rose-500 font-medium">No blog found!</p>
            `

        blogSearchChildDiv.appendChild(div);
    }

    async function blogAutoSearchSubmitForm(searchText) {
        const CSRFTOKEN = getCookie("csrftoken");

        if (CSRFTOKEN === null) {
            window.location.href = "/authentication/login/";
            return;
        }

        let formData = new FormData();
        formData.append("searchText", searchText);

        await fetch("/blog-auto-search/", {
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
            console.log(data);
            if (data.error) {
                noSearchBlogFound();
            } else if (!data.error && data.search_success) {
                blogSearchChildDiv.innerHTML = "";

                if (data.blogs.length > 0) {
                    data.blogs.map(blog => {
                        const blogLink = document.createElement("a");
                        blogLink.setAttribute("class", "flex items-center gap-x-3 border-b border-gray-300 py-3 last:border-0 hover:bg-slate-100 transition-colors duration-300 ease-in-out");
                        blogLink.setAttribute("href", `/blog/${blog.slug}/`);
                        blogLink.innerHTML = `
                            <img src="${blog.image && blog.image}" class="w-[70px] h-[70px] object-cover bg-slate-600" alt="">
                            <div class="flex flex-col gap-y-1">
                                <p class="font-medium search__resultTitle">${blog.title}</p>
                                <p class="font-semibold text-indigo-500">${blog.category}</p>
                            </div>
                        `

                        blogSearchChildDiv.appendChild(blogLink);
                    })
                    seeAllBlogResultsBtn.classList.remove("hidden");
                } else {
                    noSearchBlogFound();
                }
            }
        }).catch(err => console.error(err));
    }

    seeAllBlogResultsBtn.addEventListener("click", () => {
        if (!blogSearchField || blogSearchField.value.trim() === "") return;
        window.location.href = `/blog/search/q=${blogSearchField.value.trim()}/`;
    })
})