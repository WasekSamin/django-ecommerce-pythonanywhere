window.addEventListener("DOMContentLoaded", () => {
    const blogCommentForm = document.getElementById("blog__detailCommentForm");
    const blogCommentField = document.getElementById("blog__commentField");
    const blogCommentErrorMsg = document.getElementById("blog__commentErrorMsg");
    const blogCommentBtn = document.getElementById("blog__commentSubmitBtn");
    const blogReviewMainDiv = document.getElementById("blog__reviewMainDiv");
    
    // Blog detail share
    $("#blog__detailShare").jsSocials({
        showLabel: false,
        showCount: false,
        shareIn: "popup",
        shares: ["twitter", "facebook", "pinterest"]
    });

    blogCommentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        blogCommentErrorMsg.classList.add("hidden");

        if (!blogCommentField || blogCommentField.value.trim() == "") {
            blogCommentErrorMsg.classList.remove("hidden");
        } else {
            submitComment(blogCommentField.value.trim());
        }
    })

    async function submitComment(comment) {
        const CSRFTOKEN = getCookie("csrftoken");

        let currentBlog = window.location.href.split("/");
        currentBlog = currentBlog[currentBlog.length - 2]

        let formData = new FormData();
        formData.append("comment", comment);
        formData.append("blog", currentBlog);

        await fetch("/submit-blog-comment/", {
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
                $.Toast("Something is wrong!", "Failed to submit your comment...", "error");
            } else if (!data.error && data.comment_created) {
                const div = document.createElement("div");
                div.setAttribute("class", "flex items-start gap-x-1.5");

                const userProfilePic = document.createElement("img");
                userProfilePic.setAttribute("class", "min-w-[30px] w-[30px] max-w-[30px] h-[30px] bg-slate-200 rounded-full object-cover product__detailUserImg");
                userProfilePic.setAttribute("alt", "");

                if (data.profile_pic !== null) {
                    userProfilePic.setAttribute("src", data.profile_pic);
                } else {
                    userProfilePic.setAttribute("src", "/static/static_images/default_profile.png")
                }

                const commentContent = document.createElement("div");
                commentContent.setAttribute("class", "flex flex-col gap-y-1");

                commentContent.innerHTML = `
                    <p class="font-semibold">${data.username}</p>
                    <p class="text-slate-600">${comment}</p>
                    <p class="text-slate-600 text-xs">${data.created_at}</p>
                `

                div.appendChild(userProfilePic);
                div.appendChild(commentContent);

                // If first comment
                if (blogReviewMainDiv.querySelector(".blog__reviewDiv") === null) {
                    blogReviewMainDiv.appendChild(div);
                    $("#blog__detailNoReviewDiv").remove();
                } else {
                    blogReviewMainDiv.insertBefore(div, blogReviewMainDiv.querySelector(".blog__reviewDiv"));
                }

                // Review counter
                $("#blog__detailTotalCommentHeader > span").text(data.number_of_reviews);
                $("#blog__detailTotalComments").text(data.number_of_reviews);

                $.Toast("Comment Submitted!", "Comment added successfully...", "success");

                // Reset form
                blogCommentForm.reset();
            }
        }).catch(err => console.error(err));
    }
})