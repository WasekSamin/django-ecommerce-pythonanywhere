window.addEventListener("DOMContentLoaded", () => {
  $("#nav__catContent").slick({
    infinite: true,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 6,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1366,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
        },
      },
      {
        breakpoint: 1170,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 360,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  const preLoadCatImage = (img) => {
    const src = img.getAttribute("data-src");

    if (!src) return;
    img.src = src;
  }
  
  const catImgObserver = new IntersectionObserver((entries, catImgObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      preLoadCatImage(entry.target);
      catImgObserver.unobserve(entry.target);
    })
  }, {
    threshold: 0.2
  })

  const lazyLoadCatImages = () => {
    const images = document.querySelectorAll(".nav__catDetails > img");

    images.forEach(img => {
      catImgObserver.observe(img);
    })
  }

  lazyLoadCatImages();
})