function initScrollIndicator() {
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (!scrollIndicator) return;

  scrollIndicator.addEventListener("click", function () {
    const categoriesSection = document.querySelector(".categories");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });

  let lastScrollTop = 0;
  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
      scrollIndicator.style.opacity = "0";
      scrollIndicator.style.transform = "translateX(-50%) translateY(20px)";
    } else {
      scrollIndicator.style.opacity = "0.8";
      scrollIndicator.style.transform = "translateX(-50%) translateY(0)";
    }

    lastScrollTop = scrollTop;
  });

  scrollIndicator.addEventListener("mouseenter", function () {
    this.style.transform = "translateX(-50%) scale(1.1)";
    this.style.opacity = "1";
  });

  scrollIndicator.addEventListener("mouseleave", function () {
    this.style.transform = "translateX(-50%) scale(1)";
    this.style.opacity = "0.8";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initScrollIndicator();
});
