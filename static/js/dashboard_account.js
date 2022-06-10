window.addEventListener("DOMContentLoaded", () => {
    const userProfileDragField = document.getElementById("user__profileDragField");
    const previewProfileImage = document.getElementById("preview__profileImg");
    const deleteProfileImage = document.getElementById("delete__profileImg");
    const profilePicInput = document.getElementById("profile__Pic");
    let file = null;
    const dashboardAccountForm = document.getElementById("dashboard__accountForm");
    const username = document.getElementById("username");
    const phoneNo = document.getElementById("phone_no");
    const address = document.getElementById("address");
    const userCurrentProfilePic = document.getElementById("dashboard__userProfilePic");

    //If user Drag File Over DropArea
    userProfileDragField.addEventListener("dragover", (event)=>{
        event.preventDefault(); //preventing from default behaviour
        userProfileDragField.innerText = "Release to upload file";
    });

    //If user leave dragged File from DropArea
    userProfileDragField.addEventListener("dragleave", ()=>{
        userProfileDragField.innerText = "Drag & Drop";
    });

    //If user drop File on DropArea
    userProfileDragField.addEventListener("drop", (e)=>{
        e.preventDefault(); //preventing from default behaviour
        //getting user select file and [0] this means if user select multiple files then we'll select only the first one
        file = e.dataTransfer.files[0];
        uploadFile(file); //calling function
    });

    // If click on drag and drop button
    profilePicInput.addEventListener("change", (e) => {
        //getting user select file and [0] this means if user select multiple files then we'll select only the first one
        file = e.target.files[0];
        uploadFile(file); //calling function
    })

    // Clear uploaded image
    const clearUploadImg = () => {
        previewProfileImage.classList.add("hidden");
        previewProfileImage.querySelector("img").src = "";
        userProfileDragField.innerText = "Drag & Drop";
        file = null;
    }

    // Delete uploaded image
    deleteProfileImage.addEventListener("click", () => {
        clearUploadImg();
    })

    function uploadFile(file) {
        const fileType = file.type;
        const acceptedExtensions = ["image/jpeg", "image/jpg", "image/png"]

        if (acceptedExtensions.includes(fileType)) {
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const fileURL = fileReader.result;

                // Preview image
                previewProfileImage.classList.remove("hidden");
                previewProfileImage.querySelector("img").src = fileURL;
                userProfileDragField.innerText = "Done uploading";
            }
            fileReader.readAsDataURL(file);
        } else {
            alert("File format not supported! Please provide image only.");
            userProfileDragField.innerText = "Drag & Drop";
            file = null;
        }
    }

    const showDashboardErrorMsg = (msg) => {
        $("#dashboard__accountErrorMsg").text(msg);
        $("#dashboard__accountErrorMsg").removeClass("hidden");
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }

    dashboardAccountForm.addEventListener("submit", e => {
        e.preventDefault();

        $("#dashboard__accountErrorMsg").addClass("hidden");

        if (!username || username.value.trim() === "") {
            showDashboardErrorMsg("Username field is required!");
        } else {
            updateAccountInfo(username.value.trim(), phoneNo.value.trim().normalize(), address.value.trim().normalize(), file);
        }
    })

    async function updateAccountInfo(username, phoneNo, address, file) {
        const CSRFTOKEN = getCookie("csrftoken");

        if (CSRFTOKEN === null) {
            window.location.href = "/authentication/login/";
            return;
        }

        let formData = new FormData();
        formData.append("username", username);
        formData.append("phoneNo", phoneNo);
        formData.append("address", address);
        if (file !== null) {
            formData.append("profilePic", file);
        }

        await fetch("/update-account-info/", {
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
                $.Toast("Failed!", "Failed to update your account!", "error");
            } else if (!data.error && data.account_updated) {
                $(".dashboard__accountUsernameHeader").text(data.username);
                $("#dashboard__leftUsername").text(data.username);
                if (data.profile_pic) {
                    userCurrentProfilePic.src = data.profile_pic;
                }
                clearUploadImg();
                $.Toast("Success!", "Account updated successfully...", "success");
            }
        }).catch(err => console.error(err));
    }
})