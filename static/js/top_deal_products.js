window.addEventListener("DOMContentLoaded", () => {
    let topDealEnds = document.getElementById("top__dealEnding");

    const topDealTimeLeft = () => {
        setInterval(() => {
            const startTime = new Date().getTime();
            const endTime = new Date(topDealEnds).getTime();

            const timeLeft = endTime - startTime;

            if (timeLeft >= 0) {
                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                $("#top__dealTimeRemainDiv").text(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
            } else {
                clearInterval();
                $("#top__dealTimeRemainDivHeader").remove();
                $("#top__dealTimeRemainDiv").remove();
                $("#top__dealProductMainDiv").html("Deal of today is ended!");
                $("#top__dealProductMainDiv").attr("class", "font-medium text-base sm:text-xl text-rose-500 text-center mt-2");
            }
        }, 1000);
    }

    if (topDealEnds) {
        topDealEnds = JSON.parse(topDealEnds.innerText);

        topDealTimeLeft();
    }
})