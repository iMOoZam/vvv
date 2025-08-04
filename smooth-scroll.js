function smoothScrollToProductDetail(productId) {
  if (typeof showLoading === "function") {
    showLoading();
  }

  const currentPosition = window.pageYOffset;
  const targetPosition = currentPosition + 300;

  const scrollAnimation = () => {
    const currentScroll = window.pageYOffset;
    const scrollStep = (targetPosition - currentScroll) * 0.1;

    if (Math.abs(targetPosition - currentScroll) > 1) {
      window.scrollTo(0, currentScroll + scrollStep);
      requestAnimationFrame(scrollAnimation);
    } else {
      setTimeout(() => {
        if (typeof hideLoading === "function") {
          hideLoading();
        }
        window.location.href = `product-detail.html?id=${productId}`;
      }, 500);
    }
  };

  scrollAnimation();
}

function goToProductDetail(productId) {
  smoothScrollToProductDetail(productId);
}

function smoothScrollToElement(element, offset = 0) {
  if (!element) return;

  const elementPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = elementPosition - startPosition;
  const duration = 1000; // 1 second
  let start = null;

  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.goToProductDetail === "function") {
    const originalFunction = window.goToProductDetail;
    window.goToProductDetail = function (productId) {
      smoothScrollToProductDetail(productId);
    };
  }
});
