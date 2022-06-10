window.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register__form");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confPassword = document.getElementById("conf__password");
    const errorMsg = document.getElementById("error__msg");
    const authSpinner = document.getElementById("auth__spinner");
    const authSubmitBtn = document.getElementById("auth__submitBtn");

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

    // Email validation
    const validateEmail = (email) => {
        var re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    registerForm.addEventListener("submit", e => {
        e.preventDefault();

        errorMsg.classList.add("hidden");

        // Button style
        authSubmitBtn.disabled = true;
        authSpinner.classList.remove("hidden");
        authSubmitBtn.classList.remove("bg-indigo-500");
        authSubmitBtn.classList.remove("hover:bg-indigo-700");
        authSubmitBtn.classList.add("bg-slate-600");

        if (!username || username.value.trim() === "") {
            showErrorMsg("Username field is required!");
        } else if (!email || email.value.trim() === "") {
            showErrorMsg("Email field is required!");
        } else if (!password || password.value.trim() === "") {
            showErrorMsg("Password field is required!");
        } else if (!confPassword || confPassword.value.trim() === "") {
            showErrorMsg("Confirm password field is required!");
        } else {
            const emailValidation = validateEmail(email.value.trim().normalize());

            if (emailValidation) {
                if (password.value.trim().length > 6) {
                    if (password.value.trim() === confPassword.value.trim()) {
                        createAccount({
                            username: username.value.trim(),
                            email: email.value.trim().normalize(),
                            password: password.value.trim()
                        })
                    } else {
                        showErrorMsg("Two password fields did not match!");
                    }
                } else {
                    showErrorMsg("Password length should be greater than 6!");
                }
            } else {
                showErrorMsg("Please enter a valid email address!");
            }
        }
    })

    async function createAccount(info) {
        const CSRFTOKEN = getCookie("csrftoken");

        if (CSRFTOKEN === null) {
            window.location.href = "/authentication/login/";
            return;
        }

        let formData = new FormData();
        formData.append("username", info.username);
        formData.append("email", info.email);
        formData.append("password", info.password);

        await fetch("/authentication/create-account/", {
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
            if (data.error && data.account_exist) {
                showErrorMsg("Email is already in use!");
            } else if (data.error) {
                showErrorMsg("Something is wrong!");
            } else if (!data.error && data.account_created) {
                localStorage.setItem("new_account_created", true);

                window.location.href = "/authentication/login/";
            }
        }).catch(err => console.error(err));
    }
})