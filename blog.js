let cart = [];
let isCartOpen = false;
let currentPage = 1;
let currentFilter = "all";

function toggleCart() {
  const cartSidebar = document.getElementById("cart");
  isCartOpen = !isCartOpen;

  if (isCartOpen) {
    cartSidebar.classList.add("open");
  } else {
    cartSidebar.classList.remove("open");
  }
}

function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  updateCartCount();
  updateCartDisplay();
  saveCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartCount();
  updateCartDisplay();
  saveCart();
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      updateCartCount();
      updateCartDisplay();
      saveCart();
    }
  }
}

function updateCartDisplay() {
  const cartItems = document.querySelector(".cart-items");
  const totalAmount = document.querySelector(".total-amount");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">سبد خرید خالی است</p>';
    totalAmount.textContent = "۰ تومان";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    itemElement.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price.toLocaleString()} تومان</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQuantity('${item.id}', ${
      item.quantity - 1
    })">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity('${item.id}', ${
      item.quantity + 1
    })">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    cartItems.appendChild(itemElement);
  });

  totalAmount.textContent = `${total.toLocaleString()} تومان`;
}

function checkout() {
  if (cart.length === 0) {
    alert("سبد خرید خالی است");
    return;
  }

  alert("در حال انتقال به صفحه پرداخت...");
  cart = [];
  updateCartCount();
  updateCartDisplay();
  saveCart();
  toggleCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
    updateCartDisplay();
  }
}

function filterBlog(category) {
  currentFilter = category;
  currentPage = 1;

  const filterButtons = document.querySelectorAll(".blog-filters .filter-btn");
  filterButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  const blogCards = document.querySelectorAll(".blog-card");

  blogCards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");

    if (category === "all" || cardCategory === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  updatePagination();
}

function changePage(direction) {
  const totalPages = 3;

  if (direction === "prev" && currentPage > 1) {
    currentPage--;
  } else if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  }

  updatePagination();
  loadBlogContent();
}

function updatePagination() {
  const pageNumber = document.querySelector(".page-number");
  pageNumber.textContent = `صفحه ${currentPage} از ۳`;
}

function loadBlogContent() {
  const blogGrid = document.querySelector(".blog-grid");

  if (currentPage === 1) {
    blogGrid.style.display = "grid";
  } else {
    blogGrid.innerHTML = '<p class="loading">در حال بارگذاری مقالات...</p>';
    setTimeout(() => {
      blogGrid.innerHTML =
        '<p class="no-content">مقالات بیشتری به زودی اضافه خواهد شد.</p>';
    }, 1000);
  }
}

function readMore(articleId) {
  const articles = {
    "cpu-guide": "راهنمای کامل انتخاب پردازنده مناسب",
    "gpu-2024": "بهترین کارت‌های گرافیک ۲۰۲۴",
    "pc-build": "آموزش مونتاژ کامپیوتر",
    "antivirus-2024": "بهترین آنتی‌ویروس‌های ۲۰۲۴",
    "ram-guide": "راهنمای انتخاب رم",
    "gaming-settings": "تنظیمات گیمینگ",
  };

  const articleTitle = articles[articleId] || "مقاله";
  alert(`در حال بارگذاری مقاله: ${articleTitle}`);
}

function subscribeNewsletter() {
  const email = document.getElementById("newsletter-email").value;

  if (!email || !email.includes("@")) {
    alert("لطفاً ایمیل معتبر وارد کنید");
    return;
  }

  alert("عضویت شما در خبرنامه با موفقیت انجام شد!");
  document.getElementById("newsletter-email").value = "";
}

function handleBlogCardClick(event) {
  const card = event.currentTarget;
  const title = card.querySelector("h3").textContent;

  if (!event.target.classList.contains("read-more-btn")) {
    alert(`در حال بارگذاری مقاله: ${title}`);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  updateCartDisplay();

  const blogCards = document.querySelectorAll(".blog-card");
  blogCards.forEach((card) => {
    card.addEventListener("click", handleBlogCardClick);
  });

  updatePagination();
});

document.addEventListener("click", function (event) {
  if (
    event.target.classList.contains("cart-sidebar") ||
    event.target.classList.contains("close-cart")
  ) {
    toggleCart();
  }
});
