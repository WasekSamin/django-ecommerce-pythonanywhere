window.addEventListener("DOMContentLoaded", () => {
    const dashboardMenuBtn = document.getElementById("dashboard__leftMenu");
    const dashboardHideMenuBtn = document.getElementById("dashboard__mobileMenuOption");
    const dashboardLeft = document.getElementById("dashboard__left");

    dashboardMenuBtn.addEventListener("click", () => {
        dashboardLeft.classList.add("show__dashboardLeft");
        dashboardLeft.querySelector("div").style.left = 0;
    })

    const hideDashboardMenu = () => {
        dashboardLeft.classList.remove("show__dashboardLeft");
        dashboardLeft.querySelector("div").style.left = "-100%";
    }

    dashboardHideMenuBtn.addEventListener("click", () => {
        hideDashboardMenu();
    })

    document.addEventListener("click", e => {
        if (e.target.closest("#dashboard__leftMenu")
        || e.target.closest("#dashboard__left > div")) return;
        hideDashboardMenu();
    })
})