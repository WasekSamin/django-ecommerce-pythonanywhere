window.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login__form");
    const errorMsg = document.getElementById("error__msg");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const authSubmitBtn = document.getElementById("auth__submitBtn");
    const authSpinner = document.getElementById("auth__spinner");
    const accountActiveText = document.getElementById("account__activeText");
    const newAccountCreated = localStorage.getItem("new_account_created");

    if (newAccountCreated) {
        accountActiveText.classList.remove("hidden");
        accountActiveText.classList.add("flex");
    }

    // Showing form error message
    const showErrorMsg = (msg) => {
        errorMsg.classList.remove("hidden");
        errorMsg.innerText = msg;

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });

        // Button style
        authSpinner.classList.add("hidden");
        authSubmitBtn.disabled = false;
        authSubmitBtn.classList.add("bg-indigo-500");
        authSubmitBtn.classList.add("hover:bg-indigo-700");
        authSubmitBtn.classList.remove("bg-slate-600");
    }

    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        errorMsg.classList.add("hidden");

        // Button style
        authSubmitBtn.disabled = true;
        authSpinner.classList.remove("hidden");
        authSubmitBtn.classList.remove("bg-indigo-500");
        authSubmitBtn.classList.remove("hover:bg-indigo-700");
        authSubmitBtn.classList.add("bg-slate-600");

        if (!email || email.value.trim() === "") {
            showErrorMsg("Email field is required!");
        } else if (!password || password.value.trim() === "") {
            showErrorMsg("Password field is required!");
        } else {
            loginAccount({
                email: email.value.trim().normalize(),
                password: password.value.trim()
            });
        }
    })

    async function loginAccount(info) {
        const CSRFTOKEN = getCookie("csrftoken");

        let formData = new FormData();
        formData.append("email", info.email);
        formData.append("password", info.password);

        await fetch("/authentication/make-login/", {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRFTOKEN
            },
            body: formData
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                showErrorMsg("Something is wrong!");
            }
        }).then(data => {
            if (data.error && data.login_failed) {
                showErrorMsg("Invalid user credential!");
            } else if (data.error && !data.account_active) {
                showErrorMsg("You have not activated your account yet!");
            } else if (data.error) {
                showErrorMsg("Something is wrong!");
            } else if (!data.error && data.login_success) {
                localStorage.removeItem("new_account_created");
                window.location.href = "/";
            }
        }).catch(err => console.error(err));
    }
})