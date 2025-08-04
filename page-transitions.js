class PageTransition {
  constructor() {
    this.transitionElement = document.getElementById("pageTransition");
    this.isTransitioning = false;
    this.init();
  }

  init() {
    this.showTransition();

    window.addEventListener("load", () => {
      setTimeout(() => {
        this.hideTransition();
      }, 500);
    });

    this.handleNavigationLinks();
  }

  showTransition() {
    if (this.transitionElement) {
      this.transitionElement.classList.add("active");
      this.isTransitioning = true;
    }
  }

  hideTransition() {
    if (this.transitionElement) {
      this.transitionElement.classList.remove("active");
      this.isTransitioning = false;
    }
  }

  handleNavigationLinks() {
    const navLinks = document.querySelectorAll("a[href]");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        if (
          href.startsWith("#") ||
          href.startsWith("http") ||
          href.startsWith("mailto:")
        ) {
          return;
        }

        if (
          href === window.location.pathname ||
          href === window.location.href
        ) {
          return;
        }

        e.preventDefault();
        this.navigateToPage(href);
      });
    });
  }

  navigateToPage(url) {
    if (this.isTransitioning) return;

    this.showTransition();

    this.updateTransitionContent(url);

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  updateTransitionContent(url) {
    const content = this.transitionElement.querySelector(
      ".page-transition-content"
    );
    const icon = content.querySelector("i");
    const title = content.querySelector("h3");
    const description = content.querySelector("p");

    const existingIcon = content.querySelector("i");
    if (existingIcon) {
      existingIcon.remove();
    }

    const newIcon = document.createElement("i");

    if (url.includes("services")) {
      newIcon.className = "fas fa-tools";
      title.textContent = "در حال بارگذاری خدمات...";
      description.textContent = "لطفاً صبر کنید";
    } else if (url.includes("blog")) {
      newIcon.className = "fas fa-blog";
      title.textContent = "در حال بارگذاری وبلاگ...";
      description.textContent = "لطفاً صبر کنید";
    } else if (url.includes("login")) {
      newIcon.className = "fas fa-sign-in-alt";
      title.textContent = "در حال بارگذاری صفحه ورود...";
      description.textContent = "لطفاً صبر کنید";
    } else if (url.includes("register")) {
      newIcon.className = "fas fa-user-plus";
      title.textContent = "در حال بارگذاری صفحه ثبت نام...";
      description.textContent = "لطفاً صبر کنید";
    } else {
      newIcon.className = "fas fa-home";
      title.textContent = "در حال بارگذاری...";
      description.textContent = "لطفاً صبر کنید";
    }

    content.insertBefore(newIcon, content.firstChild);
  }
}

function smoothScrollTo(target) {
  const element = document.querySelector(target);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new PageTransition();

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href");
      smoothScrollTo(target);
    });
  });
});

function addButtonLoading(button) {
  const originalText = button.textContent;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
  button.disabled = true;

  return () => {
    button.textContent = originalText;
    button.disabled = false;
  };
}

function addCardHoverEffects() {
  const cards = document.querySelectorAll(
    ".product-card, .service-card, .blog-card, .category-card"
  );

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  addCardHoverEffects();
});
