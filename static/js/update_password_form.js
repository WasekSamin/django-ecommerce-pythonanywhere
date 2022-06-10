window.addEventListener("DOMContentLoaded", () => {
    const updatePasswordForm = document.getElementById("update__passwordForm");
    const newPasswordField = document.getElementById("new_password");
    const confNewPasswordField = document.getElementById("conf_new_password");
    const updatePasswordBtn = document.getElementById("update__passwordBtn");
    const updatePasswordIcon = document.getElementById("update__passwordIcon");

    const updatePasswordButtonAnimation = (action) => {
        if (action) {
            updatePasswordBtn.disabled = true;
            updatePasswordBtn.classList.remove("bg-indigo-500");
            updatePasswordBtn.classList.remove("hover:bg-indigo-700");
            updatePasswordBtn.classList.add("bg-slate-500");
            updatePasswordIcon.classList.add("rotate__updatePasswordIcon");
        } else {
            updatePasswordBtn.disabled = false;
            updatePasswordBtn.classList.add("bg-indigo-500");
            updatePasswordBtn.classList.add("hover:bg-indigo-700");
            updatePasswordBtn.classList.remove("bg-slate-500");
            updatePasswordIcon.classList.remove("rotate__updatePasswordIcon");
        }
    }

    updatePasswordForm.addEventListener("submit", e => {
        e.preventDefault();

        updatePasswordButtonAnimation(true);

        $("#new__passwordErrorMsg").addClass("hidden");
        $("#conf__newPasswordErrorMsg").addClass("hidden");

        if (!newPasswordField || newPasswordField.value.trim() === "") {
            $("#new__passwordErrorMsg").text("New password field is required!");
            $("#new__passwordErrorMsg").removeClass("hidden");
            $("#new__passwordErrorMsg").focus();
            updatePasswordButtonAnimation(false);
        } else if (!confNewPasswordField || confNewPasswordField.value.trim() === "") {
            $("#conf__newPasswordErrorMsg").text("Confirm new password field is required!");
            $("#conf__newPasswordErrorMsg").removeClass("hidden");
            $("#conf__newPasswordErrorMsg").focus();
            updatePasswordButtonAnimation(false);
        } else {
            if (newPasswordField.value.trim() === confNewPasswordField.value.trim()) {
                if (newPasswordField.value.trim().length > 6) {
                    updatePassword(newPasswordField.value.trim().normalize());
                } else {
                    $("#new__passwordErrorMsg").text("Password is too short!");
                    $("#new__passwordErrorMsg").removeClass("hidden");
                    $("#conf__newPasswordErrorMsg").text("Password is too short!");
                    $("#conf__newPasswordErrorMsg").removeClass("hidden");
                    $("#conf__newPasswordErrorMsg").focus();
                    updatePasswordButtonAnimation(false);
                }
            } else {
                $("#new__passwordErrorMsg").text("Too password field did not match!");
                $("#new__passwordErrorMsg").removeClass("hidden");
                $("#conf__newPasswordErrorMsg").text("Too password field did not match!");
                $("#conf__newPasswordErrorMsg").removeClass("hidden");
                $("#conf__newPasswordErrorMsg").focus();
                updatePasswordButtonAnimation(false);
            }
       }
    })

    async function updatePassword(newPassword) {
        const CSRFTOKEN = getCookie("csrftoken");
        let currentPath = window.location.pathname.split("/");
        currentPath = currentPath[currentPath.length - 2];
        
        let formData = new FormData();
        formData.append("newPassword", newPassword);

        await fetch(`/authentication/edit-password/${currentPath}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRFTOKEN
            },
            body: formData
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                alert("Failed to update your password!");
            }
        }).then(data => {
            if (data.error && data.invalid_token) {
                $.Toast("Failed!", "Invalid token! Failed yo update your password!", "error");
            } else if (data.error && data.account_not_found) {
                $.Toast("Failed!", "Invalid account! Failed yo update your password!", "error");
            } else if (data.error) {
                alert("Something went wrong! Please try again...");
            } else if (!data.error && data.password_updated) {
                window.location.href = "/authentication/login/";
            }
        }).catch(err => console.error(err));

        updatePasswordButtonAnimation(false);
    }
})