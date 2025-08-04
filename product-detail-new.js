const API_BASE_URL = "http://localhost:3000/api";
let products = [];
let currentProduct = null;

// Load products from API
async function loadProductsFromAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (response.ok) {
      const apiProducts = await response.json();

      // Convert API products to match the expected format
      products = apiProducts.map((product) => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description || "",
        image:
          product.image || "https://via.placeholder.com/300x200?text=No+Image",
        stock: product.stock || 0,
      }));

      loadProductDetail();
    } else {
      console.error("Failed to load products");
      showError("خطا در بارگذاری محصولات");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showError("خطا در اتصال به سرور");
  }
}

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function loadProductDetail() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    showError("محصول یافت نشد");
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    showError("محصول یافت نشد");
    return;
  }

  currentProduct = product;
  displayProductDetail(product);
  loadRelatedProducts(product.category, productId);
}

function displayProductDetail(product) {
  const detailContent = document.getElementById("productDetailContent");

  detailContent.innerHTML = `
        <div class="product-detail-grid">
            <div class="product-detail-image">
                <img src="${
                  product.image ||
                  "https://via.placeholder.com/400x300?text=No+Image"
                }" alt="${
    product.name
  }" loading="lazy" onclick="openImageZoom('${
    product.image || "https://via.placeholder.com/400x300?text=No+Image"
  }', '${product.name}')" style="cursor: zoom-in;">
                <div class="zoom-overlay" onclick="openImageZoom('${
                  product.image ||
                  "https://via.placeholder.com/400x300?text=No+Image"
                }', '${product.name}')">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
            <div class="product-detail-info">
                <div class="breadcrumb">
                    <a href="index.html">خانه</a> / 
                    <a href="index.html#products">محصولات</a> / 
                    <span>${product.name}</span>
                </div>
                <h1 class="product-detail-title">${product.name}</h1>
                <div class="product-detail-price">${formatPrice(
                  product.price
                )} تومان</div>
                <div class="product-detail-description">
                    <h3>توضیحات محصول:</h3>
                    <p>${product.description || "توضیحات موجود نیست"}</p>
                </div>
                <div class="product-detail-specs">
                    <h3>مشخصات فنی:</h3>
                    <ul>
                        <li><strong>دسته‌بندی:</strong> ${getCategoryName(
                          product.category
                        )}</li>
                        <li><strong>کد محصول:</strong> ${product.id}</li>
                        <li><strong>وضعیت:</strong> <span class="in-stock">موجود در انبار</span></li>
                        <li><strong>گارانتی:</strong> ۱۸ ماه</li>
                        <li><strong>ارسال:</strong> رایگان</li>
                    </ul>
                </div>
                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <label>تعداد:</label>
                        <div class="quantity-controls">
                            <button onclick="changeQuantity(-1)" class="quantity-btn">-</button>
                            <input type="number" id="productQuantity" value="1" min="1" max="10">
                            <button onclick="changeQuantity(1)" class="quantity-btn">+</button>
                        </div>
                    </div>
                    <button class="add-to-cart-detail-btn" onclick="addToCartFromDetail('${
                      product.id
                    }')">
                        <i class="fas fa-shopping-cart"></i>
                        افزودن به سبد خرید
                    </button>
                    <button class="buy-now-btn" onclick="buyNow('${
                      product.id
                    }')">
                        <i class="fas fa-credit-card"></i>
                        خرید فوری
                    </button>
                </div>
                <div class="product-detail-features">
                    <h3>ویژگی‌های کلیدی:</h3>
                    <div class="features-grid">
                        <div class="feature-item">
                            <i class="fas fa-shipping-fast"></i>
                            <span>ارسال سریع</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>گارانتی معتبر</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-undo"></i>
                            <span>بازگشت ۷ روزه</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-headset"></i>
                            <span>پشتیبانی ۲۴/۷</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCategoryName(category) {
  const categories = {
    cpu: "پردازنده",
    gpu: "کارت گرافیک",
    ram: "رم",
    storage: "هارد دیسک",
    motherboard: "مادربورد",
    power: "پاور",
  };
  return categories[category] || category;
}

function loadRelatedProducts(category, currentProductId) {
  const relatedProducts = products
    .filter((p) => p.category === category && p.id !== currentProductId)
    .slice(0, 4);

  const relatedSection = document.getElementById("relatedProducts");
  if (!relatedSection) return;

  if (relatedProducts.length === 0) {
    relatedSection.style.display = "none";
    return;
  }

  relatedSection.style.display = "block";
  const relatedGrid = relatedSection.querySelector(".related-products-grid");

  relatedGrid.innerHTML = relatedProducts
    .map(
      (product) => `
        <div class="related-product-card" onclick="goToProduct('${
          product.id
        }')">
            <img src="${
              product.image ||
              "https://via.placeholder.com/200x150?text=No+Image"
            }" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>${formatPrice(product.price)} تومان</p>
        </div>
    `
    )
    .join("");
}

function changeQuantity(change) {
  const quantityInput = document.getElementById("productQuantity");
  let newQuantity = parseInt(quantityInput.value) + change;
  newQuantity = Math.max(1, Math.min(10, newQuantity));
  quantityInput.value = newQuantity;
}

function addToCartFromDetail(productId) {
  const quantity = parseInt(document.getElementById("productQuantity").value);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    showNotification("محصول یافت نشد", "error");
    return;
  }

  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showNotification("محصول به سبد خرید اضافه شد");
}

function buyNow(productId) {
  const quantity = parseInt(document.getElementById("productQuantity").value);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    showNotification("محصول یافت نشد", "error");
    return;
  }

  // Create a cart with just this item
  const cart = [
    {
      ...product,
      quantity: quantity,
    },
  ];

  localStorage.setItem("cart", JSON.stringify(cart));
  showNotification("در حال انتقال به صفحه پرداخت...");

  // Redirect to checkout page (you can implement this)
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

function goToProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

function showError(message) {
  const detailContent = document.getElementById("productDetailContent");
  detailContent.innerHTML = `
    <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>خطا</h2>
        <p>${message}</p>
        <a href="index.html" class="btn">بازگشت به صفحه اصلی</a>
    </div>
  `;
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function openImageZoom(imageSrc, imageAlt) {
  const zoomModal = document.getElementById("imageZoomModal");
  const zoomImage = document.getElementById("zoomImage");
  const zoomCaption = document.getElementById("zoomCaption");

  zoomImage.src = imageSrc;
  zoomImage.alt = imageAlt;
  zoomCaption.textContent = imageAlt;
  zoomModal.style.display = "flex";

  // Reset zoom
  zoomImage.style.transform = "scale(1)";
  currentZoom = 1;
}

function closeImageZoom() {
  const zoomModal = document.getElementById("imageZoomModal");
  zoomModal.style.display = "none";
}

let currentZoom = 1;

function zoomIn() {
  currentZoom = Math.min(currentZoom * 1.2, 3);
  updateZoom();
}

function zoomOut() {
  currentZoom = Math.max(currentZoom / 1.2, 0.5);
  updateZoom();
}

function resetZoom() {
  currentZoom = 1;
  updateZoom();
}

function updateZoom() {
  const zoomImage = document.getElementById("zoomImage");
  zoomImage.style.transform = `scale(${currentZoom})`;
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadProductsFromAPI();
});

// Format price with commas
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
