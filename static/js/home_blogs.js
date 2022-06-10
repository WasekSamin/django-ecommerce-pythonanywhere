window.addEventListener("DOMContentLoaded", () => {
  $("#home__blogs").slick({
    infinite: true,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 5,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1469,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 599,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  const preLoadImage = (img) => {
    const src = img.getAttribute("data-src");

    if (!src) return;
    img.src = src;
  };

  const blogImageObserver = new IntersectionObserver(
    (entries, blogImageObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        preLoadImage(entry.target);
        blogImageObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
    }
  );

  // Home blogs lazy load images
  const lazyLoadHomeBlogImages = () => {
    const images = document.querySelectorAll(
      ".home__blogImgDiv > a > img"
    );

    images.forEach((img) => {
        blogImageObserver.observe(img);
    });
  };

  lazyLoadHomeBlogImages();
});
