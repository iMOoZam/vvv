const API_BASE_URL = "http://localhost:3000/api";
let products = [];
let cart = [];
let currentFilter = "all";

// Load products from API
async function loadProductsFromAPI() {
  try {
    console.log("Loading products from API...");
    showLoading();
    const response = await fetch(`${API_BASE_URL}/products`);
    console.log("API Response:", response);
    if (response.ok) {
      products = await response.json();
      console.log("Products loaded:", products);
      loadProducts(currentFilter);
    } else {
      console.error("Failed to load products");
      showNotification("خطا در بارگذاری محصولات", "error");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showNotification("خطا در اتصال به سرور", "error");
  } finally {
    hideLoading();
  }
}

// Load products to the page
function loadProducts(filter = "all") {
  console.log("Loading products with filter:", filter);
  console.log("Total products:", products.length);

  const productsGrid = document.getElementById("productsGrid");
  console.log("Products grid element:", productsGrid);

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((product) => product.category === filter);

  console.log("Filtered products:", filteredProducts);

  productsGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML =
      '<div class="no-products">هیچ محصولی یافت نشد</div>';
    return;
  }

  filteredProducts.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
        <div class="product-image" onclick="goToProductDetail('${
          product._id
        }')" style="cursor: pointer;">
            <img src="${
              product.image ||
              "https://via.placeholder.com/300x200?text=No+Image"
            }" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-title" onclick="goToProductDetail('${
              product._id
            }')" style="cursor: pointer;">${product.name}</h3>
            <p class="product-description">${product.description || ""}</p>
            <div class="product-price">${formatPrice(product.price)} تومان</div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${
              product._id
            }')">
                افزودن به سبد خرید
            </button>
        </div>
    `;
  return card;
}

// Go to product detail page
function goToProductDetail(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// Filter products by category
function filterProducts(category) {
  currentFilter = category;
  loadProducts(category);

  // Update filter button states
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

// Add product to cart
function addToCart(productId) {
  const product = products.find((p) => p._id === productId);
  const existingItem = cart.find((item) => item._id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  updateCartCount();
  updateCartDisplay();
  showNotification("محصول به سبد خرید اضافه شد");
}

// Remove product from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item._id !== productId);
  updateCartCount();
  updateCartDisplay();
  showNotification("محصول از سبد خرید حذف شد");
}

// Update product quantity in cart
function updateQuantity(productId, change) {
  const item = cart.find((item) => item._id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartCount();
      updateCartDisplay();
    }
  }
}

// Update cart count
function updateCartCount() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
    cartCountElement.style.display = cartCount > 0 ? "block" : "none";
  }
}

// Update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">سبد خرید خالی است</p>';
    cartTotal.textContent = "0 تومان";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)} تومان</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQuantity('${item._id}', -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity('${item._id}', 1)">+</button>
        <button onclick="removeFromCart('${
          item._id
        }')" class="remove-btn">حذف</button>
      </div>
    `;
    cartItems.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `${formatPrice(total)} تومان`;
}

// Toggle cart visibility
function toggleCart() {
  const cart = document.getElementById("cartSidebar");
  cart.classList.toggle("open");
}

// Checkout function
function checkout() {
  if (cart.length === 0) {
    showNotification("سبد خرید خالی است", "error");
    return;
  }

  // Here you would implement the checkout logic
  showNotification("در حال پردازش سفارش...", "success");
  // For now, just clear the cart
  cart = [];
  updateCartCount();
  updateCartDisplay();
  toggleCart();
}

// Scroll to products section
function scrollToProducts() {
  const productsSection = document.getElementById("products");
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Format price with commas
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Show loading
function showLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.display = "flex";
  }
}

// Hide loading
function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.display = "none";
  }
}

// Search products
function searchProducts(query) {
  if (!query.trim()) {
    loadProducts(currentFilter);
    return;
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
  );

  const productsGrid = document.getElementById("productsGrid");
  productsGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML =
      '<div class="no-products">هیچ محصولی یافت نشد</div>';
    return;
  }

  filteredProducts.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Add to compare
function addToCompare(productId) {
  // Implement compare functionality
  showNotification("محصول به لیست مقایسه اضافه شد");
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

// Update cart
function updateCart() {
  saveCart();
  updateCartCount();
  updateCartDisplay();
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadProductsFromAPI();
  loadCart();
  updateCartCount();
  updateCartDisplay();
});
